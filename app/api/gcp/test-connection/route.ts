// app/api/gcp/test-connection/route.ts
import { NextRequest, NextResponse } from "next/server";
import { gcpClient } from "@/lib/mcp";

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
      billingAccountId,
    } = await request.json();

    if (!projectId) {
      return NextResponse.json(
        { ok: false, error: "projectId is required" },
        { status: 400 }
      );
    }

    // Hit GCP MCP health first (fast check)
    const health = await gcpClient.healthCheck();
    if (!health.healthy) {
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

    if (billingAccountId) {
      mcpArgs.billingAccountId = billingAccountId;
    }

    // Step 1: Test credentials via audit endpoint
    const auditData = await gcpClient.callAPI("/api/audit", mcpArgs);

    // Check if the response contains an error
    if (!auditData.success) {
      return NextResponse.json({
        ok: false,
        via: "rest-api",
        projectId,
        error: auditData.error || "Authentication or permission error",
      }, { status: 401 });
    }

    // Step 2: If billing account ID provided, validate it
    if (billingAccountId) {
      // Validate billing account ID format (should be like: XXXXXX-XXXXXX-XXXXXX)
      const billingIdPattern = /^[0-9A-F]{6}-[0-9A-F]{6}-[0-9A-F]{6}$/i;
      if (!billingIdPattern.test(billingAccountId)) {
        return NextResponse.json({
          ok: false,
          via: "rest-api",
          projectId,
          billingAccountId,
          error: `Invalid billing account ID format. Expected format: XXXXXX-XXXXXX-XXXXXX`,
        }, { status: 400 });
      }

      // Try to validate by fetching billing/cost data
      try {
        console.log(`Testing billing account: ${billingAccountId}`);
        const billingData = await gcpClient.callAPI("/api/cost", mcpArgs);

        // Check if billing data fetch was successful and contains actual data
        if (!billingData.success) {
          return NextResponse.json({
            ok: false,
            via: "rest-api",
            projectId,
            billingAccountId,
            error: billingData.error || "Billing account ID appears to be invalid or inaccessible. Please verify the ID and your permissions.",
          }, { status: 400 });
        }

        // Additional check: verify that we got actual billing data
        if (billingData.data) {
          console.log("Billing account validated successfully with data");
        } else {
          console.warn("Billing account validated but no data returned - may indicate invalid ID");
        }

      } catch (billingErr: any) {
        // If it's a timeout, fail with clear message
        if (billingErr.name === 'AbortError' || billingErr.name === 'TimeoutError') {
          return NextResponse.json({
            ok: false,
            via: "rest-api",
            projectId,
            billingAccountId,
            error: "Billing account validation timed out. This may indicate an incorrect billing account ID or network issues.",
          }, { status: 408 });
        } else {
          return NextResponse.json({
            ok: false,
            via: "rest-api",
            projectId,
            billingAccountId,
            error: `Could not validate billing account: ${billingErr.message || 'Unknown error'}`,
          }, { status: 400 });
        }
      }
    }

    return NextResponse.json({
      ok: true,
      via: "rest-api",
      projectId,
      billingAccountId,
      message: "Successfully connected to GCP and validated credentials",
      details: auditData,
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
    const data = await gcpClient.healthCheck();

    if (!data.healthy) {
      throw new Error(`Health check failed: ${data.status}`);
    }

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
