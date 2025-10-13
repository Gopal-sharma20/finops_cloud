# 🔗 MCP Server Integration with Next.js UI - Implementation Plan

## 📋 Overview

Integrate the Python MCP server (`aws-finops-mcp-server`) with the Next.js UI application (`finops-phas1`) so the UI can call MCP tools instead of using AWS SDK directly.

## 🎯 Goals

1. ✅ Keep both integration methods working (MCP + Direct AWS SDK)
2. ✅ Allow users to switch between MCP and Direct AWS integration
3. ✅ Reuse existing MCP server logic
4. ✅ Maintain UI performance and features

## 🏗️ Architecture Options

### Option 1: MCP Server as HTTP/SSE Service (Recommended)

```
Browser → Next.js UI → HTTP/SSE → Python MCP Server → boto3 → AWS
```

**Implementation:**
1. Wrap MCP server with FastAPI/SSE transport
2. Create MCP client library in Next.js
3. Update API routes to call MCP via HTTP

**Pros:**
- ✅ Standard HTTP communication
- ✅ Easy to debug
- ✅ Works with existing FastMCP
- ✅ Can run on different port

**Cons:**
- Need to run separate Python server
- Slightly more latency

### Option 2: Subprocess Execution

```
Next.js API Route → spawn Python process → MCP server → boto3 → AWS
```

**Implementation:**
1. Run MCP server as subprocess from Node.js
2. Communicate via stdio

**Pros:**
- No separate server needed

**Cons:**
- ❌ Complex stdio communication
- ❌ Process management overhead
- ❌ Harder to debug

### Option 3: Keep Both (Hybrid Approach) ⭐ RECOMMENDED

```
Browser → Next.js UI
    ├→ MCP Client → MCP Server → boto3 → AWS
    └→ Direct AWS SDK → @aws-sdk → AWS
```

**Implementation:**
1. Add MCP integration as alternative
2. Keep existing Direct AWS SDK
3. Add environment variable to switch between them
4. Compare both approaches

**Pros:**
- ✅ Flexibility
- ✅ Can compare performance
- ✅ Gradual migration
- ✅ Fallback option

## 📝 Implementation Steps

### Step 1: Set Up MCP Server with HTTP/SSE Transport

**File:** `/root/git/aws-finops-mcp-server/http_server.py` (NEW)

```python
#!/usr/bin/env python3
"""
HTTP/SSE server wrapper for MCP server
Allows Next.js to communicate with MCP via HTTP instead of stdio
"""

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from mcp.server.fastmcp import FastMCP
import asyncio

app = FastAPI(title="AWS FinOps MCP HTTP Server")

# Enable CORS for Next.js
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import existing MCP server
from aws_finops_mcp_server.main import mcp

# Expose MCP tools via HTTP
@app.post("/mcp/tools/call")
async def call_tool(request: dict):
    """
    Call an MCP tool
    Body: {"tool": "get_cost", "arguments": {...}}
    """
    tool_name = request.get("tool")
    arguments = request.get("arguments", {})

    # Call the MCP tool
    if tool_name == "get_cost":
        from aws_finops_mcp_server.main import get_cost
        result = await get_cost(**arguments)
        return result
    elif tool_name == "run_finops_audit":
        from aws_finops_mcp_server.main import run_finops_audit
        result = await run_finops_audit(**arguments)
        return result
    else:
        return {"error": f"Unknown tool: {tool_name}"}

@app.get("/mcp/tools/list")
async def list_tools():
    """List available MCP tools"""
    return {
        "tools": [
            {
                "name": "get_cost",
                "description": "Get AWS cost data for specified profiles and time range"
            },
            {
                "name": "run_finops_audit",
                "description": "Run FinOps audit to find waste and savings opportunities"
            }
        ]
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "ok", "service": "AWS FinOps MCP Server"}

if __name__ == "__main__":
    print("🚀 Starting MCP HTTP Server on http://localhost:3001")
    uvicorn.run(app, host="0.0.0.0", port=3001)
```

### Step 2: Create MCP Client Library in Next.js

**File:** `/lib/mcp/client.ts` (NEW)

```typescript
/**
 * MCP Client for communicating with Python MCP server
 */

const MCP_SERVER_URL = process.env.MCP_SERVER_URL || "http://localhost:3001";

export interface MCPToolCall {
  tool: string;
  arguments: any;
}

export interface MCPResponse {
  [key: string]: any;
}

/**
 * Call an MCP tool via HTTP
 */
export async function callMCPTool(
  toolName: string,
  toolArguments: any
): Promise<MCPResponse> {
  try {
    const response = await fetch(`${MCP_SERVER_URL}/mcp/tools/call`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tool: toolName,
        arguments: toolArguments,
      }),
    });

    if (!response.ok) {
      throw new Error(`MCP server error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error calling MCP tool:", error);
    throw error;
  }
}

/**
 * Get AWS cost data via MCP
 */
export async function getMCPCostData(params: {
  profiles?: string[];
  allProfiles?: boolean;
  timeRangeDays?: number;
  startDateIso?: string;
  endDateIso?: string;
  tags?: string[];
  dimensions?: string[];
  groupBy?: string;
}) {
  return callMCPTool("get_cost", params);
}

/**
 * Run FinOps audit via MCP
 */
export async function runMCPAudit(params: {
  regions: string[];
  profiles?: string[];
  allProfiles?: boolean;
}) {
  return callMCPTool("run_finops_audit", params);
}

/**
 * List available MCP tools
 */
export async function listMCPTools() {
  const response = await fetch(`${MCP_SERVER_URL}/mcp/tools/list`);
  return response.json();
}

/**
 * Health check for MCP server
 */
export async function checkMCPHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${MCP_SERVER_URL}/health`);
    const data = await response.json();
    return data.status === "ok";
  } catch (error) {
    return false;
  }
}
```

### Step 3: Create MCP-based API Routes

**File:** `/app/api/aws/cost-mcp/route.ts` (NEW)

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getMCPCostData } from "@/lib/mcp/client";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const profile = searchParams.get("profile") || "default";
  const timeRangeDays = searchParams.get("timeRangeDays");

  try {
    const costData = await getMCPCostData({
      profiles: [profile],
      timeRangeDays: timeRangeDays ? parseInt(timeRangeDays) : 30,
    });

    return NextResponse.json(costData);
  } catch (error) {
    console.error("Error in MCP cost API:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch cost data from MCP",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const costData = await getMCPCostData(body);

    return NextResponse.json(costData);
  } catch (error) {
    console.error("Error in MCP cost API:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch cost data from MCP",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
```

**File:** `/app/api/aws/audit-mcp/route.ts` (NEW)

```typescript
import { NextRequest, NextResponse } from "next/server";
import { runMCPAudit } from "@/lib/mcp/client";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { profiles, regions, allProfiles } = body;

    const auditData = await runMCPAudit({
      regions: regions || ["us-east-1"],
      profiles,
      allProfiles,
    });

    return NextResponse.json(auditData);
  } catch (error) {
    console.error("Error in MCP audit API:", error);
    return NextResponse.json(
      {
        error: "Failed to run audit via MCP",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
```

### Step 4: Add Environment Variable to Switch Between MCP and Direct

**File:** `/.env.local` (ADD)

```bash
# Integration method: "mcp" or "direct"
AWS_INTEGRATION_METHOD=mcp

# MCP Server URL
MCP_SERVER_URL=http://localhost:3001
```

### Step 5: Create Unified Adapter

**File:** `/lib/aws/adapter.ts` (NEW)

```typescript
/**
 * Unified adapter that switches between MCP and Direct AWS SDK
 * Based on environment variable
 */

import { getCostData as getDirectCostData } from "./cost-explorer";
import { getMCPCostData } from "../mcp/client";

const USE_MCP = process.env.AWS_INTEGRATION_METHOD === "mcp";

export async function getCostData(params: any) {
  if (USE_MCP) {
    console.log("🔗 Using MCP integration");
    // Transform MCP response to match Direct SDK format
    const mcpResponse = await getMCPCostData(params);
    return transformMCPResponse(mcpResponse);
  } else {
    console.log("📡 Using Direct AWS SDK integration");
    return getDirectCostData(params);
  }
}

function transformMCPResponse(mcpResponse: any) {
  // Transform MCP server response to match Direct SDK format
  // MCP returns: {"accounts_cost_data": {...}, "errors_for_profiles": {...}}
  // Direct returns: {...costData...}

  const accountsData = mcpResponse.accounts_cost_data || {};
  const firstAccount = Object.values(accountsData)[0] as any;

  if (!firstAccount) {
    return {
      status: "error",
      message: "No cost data returned from MCP",
    };
  }

  return {
    profileName: "default",
    accountId: firstAccount["AWS Account #"] || "",
    periodStartDate: firstAccount["Period Start Date"] || "",
    periodEndDate: firstAccount["Period End Date"] || "",
    totalCost: firstAccount["Total Cost"] || 0,
    costByService: firstAccount["Cost By SERVICE"] || {},
    status: "success",
  };
}
```

## 🚀 Deployment Steps

### 1. Install Dependencies

```bash
# MCP Server (Python)
cd /root/git/aws-finops-mcp-server
pip install fastapi uvicorn

# Next.js UI (no new dependencies needed)
```

### 2. Start MCP HTTP Server

```bash
cd /root/git/aws-finops-mcp-server
python http_server.py

# Should see: 🚀 Starting MCP HTTP Server on http://localhost:3001
```

### 3. Update Next.js to Use MCP

```bash
cd /root/git/finops-phas1

# Create .env.local
echo "AWS_INTEGRATION_METHOD=mcp" > .env.local
echo "MCP_SERVER_URL=http://localhost:3001" >> .env.local

# Restart Next.js
npm run dev
```

### 4. Test Integration

```bash
# Test MCP server health
curl http://localhost:3001/health

# Test MCP tools
curl -X POST http://localhost:3001/mcp/tools/call \
  -H "Content-Type: application/json" \
  -d '{"tool": "get_cost", "arguments": {"profiles": ["default"], "timeRangeDays": 30}}'

# Test via Next.js API
curl http://localhost:3000/api/aws/cost-mcp?profile=default&timeRangeDays=30
```

## 📊 Comparison Mode

Add a comparison page to see both methods side-by-side:

**File:** `/app/comparison/page.tsx` (NEW)

```typescript
"use client";

import { useQuery } from "@tanstack/react-query";

export default function ComparisonPage() {
  // Fetch via Direct AWS SDK
  const { data: directData } = useQuery({
    queryKey: ["cost-direct"],
    queryFn: () => fetch("/api/aws/cost?profile=default&timeRangeDays=30").then(r => r.json())
  });

  // Fetch via MCP
  const { data: mcpData } = useQuery({
    queryKey: ["cost-mcp"],
    queryFn: () => fetch("/api/aws/cost-mcp?profile=default&timeRangeDays=30").then(r => r.json())
  });

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Integration Comparison</h1>

      <div className="grid grid-cols-2 gap-4">
        <div className="border p-4">
          <h2 className="font-bold">Direct AWS SDK</h2>
          <pre>{JSON.stringify(directData, null, 2)}</pre>
        </div>

        <div className="border p-4">
          <h2 className="font-bold">Via MCP Server</h2>
          <pre>{JSON.stringify(mcpData, null, 2)}</pre>
        </div>
      </div>
    </div>
  );
}
```

## ✅ Benefits of This Approach

1. **Flexibility**: Switch between MCP and Direct with env variable
2. **Reusability**: MCP server logic used by both UI and AI assistants
3. **Comparison**: Can test both and compare performance
4. **Gradual Migration**: Migrate one feature at a time
5. **Fallback**: If MCP server down, fall back to Direct SDK

## 📝 Next Steps

1. Create `http_server.py` wrapper
2. Install FastAPI/uvicorn in MCP server
3. Create MCP client library in Next.js
4. Create MCP-based API routes
5. Add adapter layer for switching
6. Test both methods
7. Compare performance and choose best approach

Would you like me to implement this integration now?
