// app/api/aws/audit/route.ts
import { NextRequest, NextResponse } from "next/server";
import { awsClient } from "@/lib/mcp";

/**
 * POST /api/aws/audit
 * Body: { profile?: string, regions?: string[] }
 * Proxies to MCP tool: run_finops_audit
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      profile = "default",
      regions = ["us-east-1"],
      // allow an explicit allProfiles override if you add it later
      allProfiles = false,
    } = body ?? {};

    console.log("🔍 [AWS Audit API] Request received:", { profile, regions, allProfiles });

    // Map UI body → MCP args
    const mcpArgs: Record<string, any> = { regions };
    if (allProfiles) mcpArgs.all_profiles = true;
    else mcpArgs.profiles = [profile];

    console.log("📡 [AWS Audit API] Calling MCP tool 'run_finops_audit' with args:", mcpArgs);

    const mcpData = await awsClient.callTool("run_finops_audit", mcpArgs);

    console.log("✅ [AWS Audit API] MCP response received:", JSON.stringify(mcpData, null, 2));

    // Preserve your existing response shape and also return MCP raw payload.
    const response = {
      success: true,
      report: mcpData,   // what your UI previously called "auditReport"
      mcp: mcpData,      // optional: raw MCP fields like "Audit Report", etc.
    };

    console.log("📤 [AWS Audit API] Sending response to client");
    return NextResponse.json(response);
  } catch (error) {
    console.error("❌ [AWS Audit API] Error running FinOps audit (MCP proxy):", error);
    return NextResponse.json(
      {
        error: "Failed to run FinOps audit (MCP proxy)",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/aws/audit?profile=default&regions=us-east-1,us-west-2
 * (For convenience; forwards to POST with the same arguments)
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const profile = searchParams.get("profile") || "default";
  const regionsParam = searchParams.get("regions");
  const regions = regionsParam ? regionsParam.split(",") : ["us-east-1"];

  return POST(
    new NextRequest(request.url, {
      method: "POST",
      body: JSON.stringify({ profile, regions }),
      headers: { "content-type": "application/json" },
    })
  );
}

