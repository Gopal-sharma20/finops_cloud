// app/api/gcp/audit/route.ts
import { NextRequest, NextResponse } from "next/server";
import { gcpClient } from "@/lib/mcp";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      projectId,
      // GCP credentials from UI (optional)
      serviceAccountJson,
      serviceAccountKeyPath,
    } = body ?? {};

    const mcpArgs: Record<string, any> = { projectId };

    // Add credentials if provided from UI
    if (serviceAccountJson) mcpArgs.serviceAccountJson = serviceAccountJson;
    if (serviceAccountKeyPath) mcpArgs.serviceAccountKeyPath = serviceAccountKeyPath;

    const data = await gcpClient.callAPI("/api/audit", mcpArgs);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in GCP audit API (MCP proxy):", error);
    return NextResponse.json(
      {
        error: "Internal server error (GCP MCP proxy)",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
