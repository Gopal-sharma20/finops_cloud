// app/api/gcp/cost/route.ts
import { NextRequest, NextResponse } from "next/server";
import { gcpClient } from "@/lib/mcp";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      projectId,
      datasetId = "billing_export",
      tablePrefix = "gcp_billing_export_v1",
      timeRangeDays = 30,
      startDateIso,
      endDateIso,
      groupBy = "service.description",
      // GCP credentials from UI (optional)
      serviceAccountJson,
      serviceAccountKeyPath,
    } = body ?? {};

    // Map UI body → GCP MCP args
    const mcpArgs: Record<string, any> = {
      projectId,
      datasetId,
      tablePrefix,
      timeRangeDays,
      groupBy,
    };

    if (startDateIso) mcpArgs.startDateIso = startDateIso;
    if (endDateIso) mcpArgs.endDateIso = endDateIso;

    // Add credentials if provided from UI
    if (serviceAccountJson) mcpArgs.serviceAccountJson = serviceAccountJson;
    if (serviceAccountKeyPath) mcpArgs.serviceAccountKeyPath = serviceAccountKeyPath;

    const data = await gcpClient.callAPI("/api/cost", mcpArgs);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in GCP cost API (MCP proxy):", error);
    return NextResponse.json(
      {
        error: "Internal server error (GCP MCP proxy)",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const projectId = searchParams.get("projectId") || process.env.GCP_PROJECT_ID;
  const timeRangeDaysParam = searchParams.get("timeRangeDays");
  const timeRangeDays =
    timeRangeDaysParam && !Number.isNaN(Number(timeRangeDaysParam))
      ? Number(timeRangeDaysParam)
      : 30;

  try {
    // Get service breakdown
    const baseArgs: Record<string, any> = {
      projectId,
      timeRangeDays,
      groupBy: "service.description",
    };

    const costResp = await gcpClient.callAPI("/api/cost", baseArgs);

    return NextResponse.json({
      projectId,
      status: "success",
      data: costResp,
    });
  } catch (error) {
    console.error("Error in GCP cost API (MCP proxy GET):", error);
    return NextResponse.json(
      {
        error: "Internal server error (GCP MCP proxy)",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
