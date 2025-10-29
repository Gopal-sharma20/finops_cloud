// app/api/azure/cost/route.ts
import { NextRequest, NextResponse } from "next/server";
import { azureClient } from "@/lib/mcp";

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
      groupBy = "ServiceName",
      // Azure credentials from UI
      tenantId,
      clientId,
      clientSecret,
      subscriptionId,
    } = body ?? {};

    // Map UI body → Azure MCP args
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

    // Add credentials if provided
    if (tenantId) mcpArgs.tenant_id = tenantId;
    if (clientId) mcpArgs.client_id = clientId;
    if (clientSecret) mcpArgs.client_secret = clientSecret;
    if (subscriptionId) mcpArgs.subscription_id = subscriptionId;

    const data = await azureClient.callAPI("/api/cost", mcpArgs);

    // Azure REST API returns { accounts_cost_data, errors_for_profiles }
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in Azure cost API (MCP proxy):", error);
    return NextResponse.json(
      {
        error: "Internal server error (Azure MCP proxy)",
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
      group_by: "ServiceName",
    };
    if (typeof timeRangeDays === "number") baseArgs.time_range_days = timeRangeDays;

    const totalResp = await azureClient.callAPI("/api/cost", baseArgs);

    // Extract the per-profile block
    const key = `Subscription: ${profile}`;
    const profileBlock = totalResp?.accounts_cost_data?.[key];

    if (!profileBlock) {
      const errMsg =
        totalResp?.errors_for_profiles?.[profile] ||
        "No data returned for subscription";
      return NextResponse.json(
        { error: "Failed to fetch cost data", message: errMsg },
        { status: 500 }
      );
    }

    const subscriptionId = profileBlock["Subscription ID"];
    const periodStartDate = profileBlock["Period Start Date"];
    const periodEndDate = profileBlock["Period End Date"];
    const totalCost = profileBlock["Total Cost"];
    const costByService =
      profileBlock["Cost By ServiceName"] || {};

    // 2) Region breakdown (second API call with group_by=ResourceLocation)
    const regionArgs = { ...baseArgs, group_by: "ResourceLocation" };
    const regionResp = await azureClient.callAPI("/api/cost", regionArgs);
    const regionBlock = regionResp?.accounts_cost_data?.[key];
    const costByRegion = regionBlock?.["Cost By ResourceLocation"] || {};

    return NextResponse.json({
      subscriptionId,
      status: "success",
      periodStartDate,
      periodEndDate,
      totalCost,
      costByService,
      costByRegion,
    });
  } catch (error) {
    console.error("Error in Azure cost API (MCP proxy GET):", error);
    return NextResponse.json(
      {
        error: "Internal server error (Azure MCP proxy)",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
