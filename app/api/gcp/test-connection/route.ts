// app/api/gcp/test-connection/route.ts
import { NextRequest, NextResponse } from "next/server";

const GCP_MCP_URL = process.env.GCP_MCP_SERVER_URL || "http://localhost:3002";

/**
 * POST /api/gcp/test-connection
 * Body: {
 *   projectId: string,
 *   serviceAccountJson?: string (entire JSON as string),
 *   serviceAccountKeyPath?: string (path to key file)
 * }
 * Returns: { ok: boolean, via: "rest-api", projectId, error? }
 */
export async function POST(request: NextRequest) {
  try {
    const {
      projectId,
      serviceAccountJson,
      serviceAccountKeyPath,
    } = await request.json();

    if (!projectId) {
      return NextResponse.json(
        { ok: false, error: "projectId is required" },
        { status: 400 }
      );
    }

    // Hit GCP MCP health first (fast check)
    const health = await fetch(`${GCP_MCP_URL}/health`)
      .then(r => r.ok)
      .catch(() => false);

    if (!health) {
      return NextResponse.json(
        { ok: false, via: "rest-api", projectId, error: "GCP MCP server not reachable" },
        { status: 502 }
      );
    }

    // Test credentials using audit endpoint (lightweight test)
    const mcpArgs: Record<string, any> = {
      projectId,
    };

    // Add credentials if provided
    if (serviceAccountJson) {
      mcpArgs.serviceAccountJson = serviceAccountJson;
    } else if (serviceAccountKeyPath) {
      mcpArgs.serviceAccountKeyPath = serviceAccountKeyPath;
    }

    // Call GCP MCP server to test credentials via audit endpoint
    const resp = await fetch(`${GCP_MCP_URL}/api/audit`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(mcpArgs)
    });

    if (!resp.ok) {
      const text = await resp.text();
      return NextResponse.json(
        { ok: false, via: "rest-api", projectId, error: `GCP MCP call failed: ${resp.status} ${text}` },
        { status: 502 }
      );
    }

    const data = await resp.json();

    // Check if the response contains an error
    if (!data.success) {
      return NextResponse.json({
        ok: false,
        via: "rest-api",
        projectId,
        error: data.error || "Authentication or permission error",
      }, { status: 401 });
    }

    return NextResponse.json({
      ok: true,
      via: "rest-api",
      projectId,
      message: "Successfully connected to GCP",
      details: data,
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, via: "rest-api", error: e?.message || "Unknown error" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/gcp/test-connection - Simple health check without credentials
 */
export async function GET(request: NextRequest) {
  try {
    const res = await fetch(`${GCP_MCP_URL}/health`);

    if (!res.ok) {
      throw new Error(`Health check failed: ${res.statusText}`);
    }

    const data = await res.json();

    return NextResponse.json({
      status: "ok",
      message: "GCP MCP server is healthy",
      details: data,
    });
  } catch (error) {
    console.error("Error testing GCP connection:", error);
    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
