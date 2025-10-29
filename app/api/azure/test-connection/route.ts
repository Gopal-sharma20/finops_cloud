// app/api/azure/test-connection/route.ts
import { NextRequest, NextResponse } from "next/server";
import { azureClient } from "@/lib/mcp";

/**
 * POST /api/azure/test-connection
 * Body: { profile?: string }   // optional, defaults to "default"
 * Returns: { ok: boolean, via: "mcp", profile, subscriptionId?, error? }
 */
export async function POST(request: NextRequest) {
  try {
    const {
      profile = "default",
      tenantId,
      clientId,
      clientSecret,
      subscriptionId
    } = await request.json();

    // Hit Azure REST API health endpoint first (fast check)
    const health = await azureClient.healthCheck();
    if (!health.healthy) {
      return NextResponse.json(
        { ok: false, via: "rest-api", profile, error: "Azure REST API server not reachable" },
        { status: 502 }
      );
    }

    // Prepare MCP arguments
    const mcpArgs: Record<string, any> = {
      time_range_days: 1
    };

    // Add credentials if provided
    if (tenantId) mcpArgs.tenant_id = tenantId;
    if (clientId) mcpArgs.client_id = clientId;
    if (clientSecret) mcpArgs.client_secret = clientSecret;
    if (subscriptionId) mcpArgs.subscription_id = subscriptionId;

    // If no subscription_id provided, use profile
    if (!subscriptionId) {
      mcpArgs.profiles = [profile];
      mcpArgs.all_profiles = false;
    }

    // Call REST API to validate credentials
    const data = await azureClient.callAPI("/api/cost", mcpArgs);

    // Check if the response contains an error (authentication or permission issue)
    if (data.error) {
      return NextResponse.json({
        ok: false,
        via: "rest-api",
        profile,
        error: data.error,
        details: "Azure authentication or permission error"
      }, { status: 401 });
    }

    // Try to extract subscription id from MCP result (best effort)
    const key = `Subscription: ${subscriptionId || profile}`;
    const extractedSubscriptionId =
      data?.accounts_cost_data?.[key]?.["Subscription ID"] ||
      data?.accounts_cost_data?.[profile]?.subscriptionId ||
      subscriptionId ||
      undefined;

    return NextResponse.json({
      ok: true,
      via: "rest-api",
      profile,
      subscriptionId: extractedSubscriptionId,
      message: "Successfully connected to Azure",
      costDataSample: data
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, via: "rest-api", error: e?.message || "Unknown error" },
      { status: 500 }
    );
  }
}
