// app/api/aws/audit/route.ts
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
      `MCP call failed (${res.status} ${res.statusText})${
        text ? ` - ${text}` : ""
      }`
    );
  }
  return res.json();
}

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

    // Map UI body → MCP args
    const mcpArgs: Record<string, any> = { regions };
    if (allProfiles) mcpArgs.all_profiles = true;
    else mcpArgs.profiles = [profile];

    const mcpData = await callMCP("run_finops_audit", mcpArgs);

    // Preserve your existing response shape and also return MCP raw payload.
    return NextResponse.json({
      success: true,
      report: mcpData,   // what your UI previously called "auditReport"
      mcp: mcpData,      // optional: raw MCP fields like "Audit Report", etc.
    });
  } catch (error) {
    console.error("Error running FinOps audit (MCP proxy):", error);
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

