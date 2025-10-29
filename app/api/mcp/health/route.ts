// app/api/mcp/health/route.ts
import { NextResponse } from "next/server";
import { awsClient } from "@/lib/mcp";

/**
 * GET /api/mcp/health
 * Check MCP server connectivity
 */
export async function GET() {
  try {
    console.log("🏥 [MCP Health] Checking MCP server health...");

    const health = await awsClient.healthCheck();
    console.log("✅ [MCP Health] Health check result:", health);

    if (!health.healthy) {
      return NextResponse.json(
        {
          success: false,
          message: "MCP server is not healthy",
          status: health.status,
          mcpServerUrl: process.env.MCP_SERVER_URL || "http://localhost:3001"
        },
        { status: 503 }
      );
    }

    // Try to list tools
    try {
      const tools = await awsClient.listTools();
      console.log("✅ [MCP Health] Available tools:", tools);

      return NextResponse.json({
        success: true,
        healthy: true,
        status: health.status,
        mcpServerUrl: process.env.MCP_SERVER_URL || "http://localhost:3001",
        tools: tools,
      });
    } catch (toolError) {
      console.error("⚠️ [MCP Health] Failed to list tools:", toolError);
      return NextResponse.json({
        success: true,
        healthy: true,
        status: health.status,
        mcpServerUrl: process.env.MCP_SERVER_URL || "http://localhost:3001",
        tools: null,
        toolsError: toolError instanceof Error ? toolError.message : "Unknown error",
      });
    }
  } catch (error) {
    console.error("❌ [MCP Health] Health check failed:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to connect to MCP server",
        error: error instanceof Error ? error.message : "Unknown error",
        mcpServerUrl: process.env.MCP_SERVER_URL || "http://localhost:3001"
      },
      { status: 500 }
    );
  }
}
