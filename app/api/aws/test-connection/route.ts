import { NextRequest, NextResponse } from "next/server";

const MCP_URL = process.env.MCP_SERVER_URL || "http://localhost:3001";

/**
 * POST /api/aws/test-connection
 * Body: { profile?: string }   // optional, defaults to "default"
 * Returns: { ok: boolean, via: "mcp", profile, accountId?, error? }
 */
export async function POST(request: NextRequest) {
  try {
    const { profile = "default" } = await request.json();

    // Hit MCP health first (fast fail)
    const health = await fetch(`${MCP_URL}/health`).then(r => r.ok ? r.json() : null);
    if (!health || health.status !== "ok") {
      return NextResponse.json(
        { ok: false, via: "mcp", profile, error: "MCP server not reachable/healthy" },
        { status: 502 }
      );
    }

    // Ask MCP for 0-day cost (cheap) just to validate creds & profile
    const resp = await fetch(`${MCP_URL}/mcp/tools/call`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        tool: "get_cost",
        arguments: {
          profiles: [profile],
          all_profiles: false,
          time_range_days: 1
        }
      })
    });

    if (!resp.ok) {
      const text = await resp.text();
      return NextResponse.json(
        { ok: false, via: "mcp", profile, error: `MCP call failed: ${resp.status} ${text}` },
        { status: 502 }
      );
    }

    const data = await resp.json();

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
