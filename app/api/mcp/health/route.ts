export async function GET() {
  const url = process.env.MCP_SERVER_URL || "http://localhost:3001";
  try {
    const r = await fetch(`${url}/health`, { cache: "no-store" });
    const data = await r.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Failed to reach MCP server", details: String(err) }),
      { status: 500, headers: { "content-type": "application/json" } }
    );
  }
}
