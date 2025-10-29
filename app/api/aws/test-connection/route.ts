import { NextRequest, NextResponse } from "next/server";
import { awsClient } from "@/lib/mcp";

/**
 * POST /api/aws/test-connection
 * Body: { profile?: string }   // optional, defaults to "default"
 * Returns: { ok: boolean, via: "mcp", profile, accountId?, error? }
 */
export async function POST(request: NextRequest) {
  try {
    const { profile = "default" } = await request.json();

    // Hit MCP health first (fast fail)
    const health = await awsClient.healthCheck();
    if (!health.healthy) {
      return NextResponse.json(
        { ok: false, via: "mcp", profile, error: "MCP server not reachable/healthy" },
        { status: 502 }
      );
    }

    // Ask MCP for 1-day cost (cheap) just to validate creds & profile
    const data = await awsClient.callTool("get_cost", {
      profiles: [profile],
      all_profiles: false,
      time_range_days: 1
    });

    // Try to extract account id from MCP result (best effort)
    const key = `Profile Name: ${profile}`;
    const acctId =
      data?.accounts_cost_data?.[key]?.["AWS Account #"] ||
      data?.accounts_cost_data?.[profile]?.accountId ||
      undefined;

    return NextResponse.json({
      ok: true,
      via: "mcp",
      profile,
      accountId: acctId,
      mcpSample: data
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, via: "mcp", error: e?.message || "Unknown error" },
      { status: 500 }
    );
  }
}
