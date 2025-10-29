// app/api/gcp/recommender/route.ts
import { NextRequest, NextResponse } from "next/server";
import { gcpClient } from "@/lib/mcp";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      projectId,
      recommenderType = "google.compute.instance.MachineTypeRecommender",
      location = "global",
    } = body ?? {};

    const data = await gcpClient.callAPI("/api/recommender/list", {
      projectId,
      recommenderType,
      location,
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in GCP recommender API (MCP proxy):", error);
    return NextResponse.json(
      {
        error: "Internal server error (GCP MCP proxy)",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
