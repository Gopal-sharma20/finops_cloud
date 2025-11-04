// app/api/gcp/metrics/route.ts
import { NextRequest, NextResponse } from "next/server";
import { gcpClient } from "@/lib/mcp";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      projectId,
      metricType,
      hours = 24,
      instanceId,
    } = body ?? {};

    if (!projectId) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing projectId",
          message: "projectId is required to fetch metrics",
        },
        { status: 400 }
      );
    }

    // Calculate time range
    const endTime = new Date().toISOString();
    const startTime = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

    // Build filter based on metric type
    let filter = `metric.type = "${metricType}"`;

    // Add resource filter if instance ID provided
    if (instanceId) {
      filter += ` AND resource.labels.instance_id = "${instanceId}"`;
    }

    const data = await gcpClient.callAPI("/api/metrics/timeseries", {
      name: `projects/${projectId}`,
      projectId,
      filter,
      interval: {
        startTime,
        endTime,
      },
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in GCP metrics API (MCP proxy):", error);
    return NextResponse.json(
      {
        error: "Internal server error (GCP MCP proxy)",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
