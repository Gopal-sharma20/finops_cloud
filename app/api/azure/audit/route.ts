// app/api/azure/audit/route.ts
import { NextRequest, NextResponse } from "next/server";

const AZURE_REST_URL = process.env.AZURE_MCP_SERVER_URL || "http://localhost:8000";

async function callAzureAPI(endpoint: string, args: Record<string, any>) {
  const res = await fetch(`${AZURE_REST_URL}${endpoint}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(args),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `Azure API call failed (${res.status} ${res.statusText})${
        text ? ` - ${text}` : ""
      }`
    );
  }

  return res.json();
}

/**
 * POST /api/azure/audit
 * Body: { profile?: string, regions?: string[] }
 * Proxies to Azure MCP tool: run_finops_audit
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      profile = "default",
      regions = ["eastus"],
      // allow an explicit allProfiles override if you add it later
      allProfiles = false,
      // Azure credentials from UI
      tenantId,
      clientId,
      clientSecret,
      subscriptionId,
    } = body ?? {};

    // Map UI body → Azure MCP args
    const mcpArgs: Record<string, any> = { regions };
    if (allProfiles) mcpArgs.all_profiles = true;
    else mcpArgs.profiles = [profile];

    // Add credentials if provided
    if (tenantId) mcpArgs.tenant_id = tenantId;
    if (clientId) mcpArgs.client_id = clientId;
    if (clientSecret) mcpArgs.client_secret = clientSecret;
    if (subscriptionId) mcpArgs.subscription_id = subscriptionId;

    const apiData = await callAzureAPI("/api/audit", mcpArgs);

    // Preserve your existing response shape and also return API raw payload.
    return NextResponse.json({
      success: true,
      report: apiData,   // what your UI previously called "auditReport"
      mcp: apiData,      // optional: raw API fields like "Audit Report", etc.
    });
  } catch (error) {
    console.error("Error running Azure FinOps audit (MCP proxy):", error);
    return NextResponse.json(
      {
        error: "Failed to run Azure FinOps audit (MCP proxy)",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/azure/audit?profile=default&regions=eastus,westus
 * (For convenience; forwards to POST with the same arguments)
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const profile = searchParams.get("profile") || "default";
  const regionsParam = searchParams.get("regions");
  const regions = regionsParam ? regionsParam.split(",") : ["eastus"];

  return POST(
    new NextRequest(request.url, {
      method: "POST",
      body: JSON.stringify({ profile, regions }),
      headers: { "content-type": "application/json" },
    })
  );
}
