// app/api/gcp/recommender/route.ts
import { NextRequest, NextResponse } from "next/server";

const GCP_REST_URL = process.env.GCP_MCP_SERVER_URL || "http://localhost:3002";

async function callGcpAPI(endpoint: string, args: Record<string, any>) {
  const res = await fetch(`${GCP_REST_URL}${endpoint}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(args),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `GCP API call failed (${res.status} ${res.statusText}) ${text ? `- ${text}` : ""}`
    );
  }

  return res.json();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      projectId,
      recommenderType = "google.compute.instance.MachineTypeRecommender",
      location = "global",
    } = body ?? {};

    const data = await callGcpAPI("/api/recommender/list", {
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
