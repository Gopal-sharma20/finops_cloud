// app/api/aws/cost/route.ts
import { NextRequest, NextResponse } from "next/server";

const MCP_URL = process.env.MCP_SERVER_URL || "http://localhost:3001";

async function callMCP(tool: string, args: Record<string, any>) {
  const res = await fetch(`${MCP_URL}/mcp/tools/call`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ tool, arguments: args }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `MCP call failed (${res.status} ${res.statusText}) ${text ? `- ${text}` : ""}`
    );
  }
  return res.json();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      profiles = ["default"],
      allProfiles = false,
      timeRangeDays,
      startDateIso,
      endDateIso,
      tags,
      dimensions,
      groupBy = "SERVICE",
    } = body ?? {};

    // Map UI body → MCP args
    const mcpArgs: Record<string, any> = {
      group_by: groupBy,
    };
    if (allProfiles) mcpArgs.all_profiles = true;
    else mcpArgs.profiles = profiles;

    if (typeof timeRangeDays === "number") mcpArgs.time_range_days = timeRangeDays;
    if (startDateIso) mcpArgs.start_date_iso = startDateIso;
    if (endDateIso) mcpArgs.end_date_iso = endDateIso;
    if (tags) mcpArgs.tags = tags;
    if (dimensions) mcpArgs.dimensions = dimensions;

    const data = await callMCP("get_cost", mcpArgs);

    // MCP already returns { accounts_cost_data, errors_for_profiles }
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in cost API (MCP proxy):", error);
    return NextResponse.json(
      {
        error: "Internal server error (MCP proxy)",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const profile = searchParams.get("profile") || "default";
  const timeRangeDaysParam = searchParams.get("timeRangeDays");
  const timeRangeDays =
    timeRangeDaysParam && !Number.isNaN(Number(timeRangeDaysParam))
      ? Number(timeRangeDaysParam)
      : undefined;

  try {
    // 1) Total & service breakdown
    const baseArgs: Record<string, any> = {
      profiles: [profile],
      group_by: "SERVICE",
    };
    if (typeof timeRangeDays === "number") baseArgs.time_range_days = timeRangeDays;

    const totalResp = await callMCP("get_cost", baseArgs);

    // Extract the per-profile block
    const key = `Profile Name: ${profile}`;
    const profileBlock = totalResp?.accounts_cost_data?.[key];

    if (!profileBlock) {
      const errMsg =
        totalResp?.errors_for_profiles?.[profile] ||
        "No data returned for profile";
      return NextResponse.json(
        { error: "Failed to fetch cost data", message: errMsg },
        { status: 500 }
      );
    }

    const accountId = profileBlock["AWS Account #"];
    const periodStartDate = profileBlock["Period Start Date"];
    const periodEndDate = profileBlock["Period End Date"];
    const totalCost = profileBlock["Total Cost"];
    const costByService =
      profileBlock["Cost By SERVICE"] || profileBlock["Cost By Service"] || {};

    // 2) Region breakdown (second MCP call with group_by=REGION)
    const regionArgs = { ...baseArgs, group_by: "REGION" };
    const regionResp = await callMCP("get_cost", regionArgs);
    const regionBlock = regionResp?.accounts_cost_data?.[key];
    const costByRegion = regionBlock?.["Cost By REGION"] || {};

    return NextResponse.json({
      accountId,
      status: "success",
      periodStartDate,
      periodEndDate,
      totalCost,
      costByService,
      costByRegion,
    });
  } catch (error) {
    console.error("Error in cost API (MCP proxy GET):", error);
    return NextResponse.json(
      {
        error: "Internal server error (MCP proxy)",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
