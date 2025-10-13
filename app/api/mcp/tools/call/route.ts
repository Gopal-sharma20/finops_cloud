export async function POST(req: Request) {
  const url = process.env.MCP_SERVER_URL || "http://localhost:3001";
  const body = await req.json().catch(() => ({}));
  const r = await fetch(`${url}/mcp/tools/call`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await r.json().catch(() => ({}));
  return new Response(JSON.stringify(data), {
    status: r.ok ? 200 : r.status,
    headers: { "content-type": "application/json" },
  });
}

