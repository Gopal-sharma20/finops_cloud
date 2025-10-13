export async function GET() {
  const url = process.env.MCP_SERVER_URL || "http://localhost:3001";
  const r = await fetch(`${url}/mcp/tools/list`, { cache: "no-store" });
  const data = await r.json();
  return new Response(JSON.stringify(data), {
    status: r.ok ? 200 : r.status,
    headers: { "content-type": "application/json" },
  });
}
