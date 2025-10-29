# MCP Client Architecture

## Overview

The FinOps Cloud application uses a **pure MCP (Model Context Protocol) client architecture** with **zero direct cloud SDK usage**. All cloud provider interactions go through dedicated MCP servers.

## Architecture Diagram

```
┌────────────────────────────────────────────────────────┐
│  FinOps UI Application (Next.js)                       │
│  Port: 3000                                            │
│                                                         │
│  ├── Frontend (React/Next.js)                         │
│  │   ├── Pages (/clouds/aws, /clouds/azure, etc.)    │
│  │   ├── Components (CloudConnector, Charts, etc.)   │
│  │   └── Hooks (useAWSCost, useCostTrends, etc.)     │
│  │                                                     │
│  └── Backend API Routes (/app/api/**)                 │
│      └── Uses: lib/mcp/client.ts (Centralized)       │
└──────────────────┬──────────────────────┬──────────────┘
                   │                      │
         ┌─────────┴─────────┐   ┌───────┴──────────┐
         │                   │   │                   │
    ┌────▼────┐         ┌───▼────┐  ┌──▼────┐
    │ AWS MCP │         │ Azure  │  │  GCP  │
    │ Server  │         │  MCP   │  │  MCP  │
    │ :3001   │         │ Server │  │ Server│
    │         │         │ :8000  │  │ :3002 │
    └────┬────┘         └───┬────┘  └──┬────┘
         │                  │           │
         │ AWS SDK          │ Azure SDK │ GCP SDK
         ▼                  ▼           ▼
    ┌────────┐         ┌────────┐  ┌────────┐
    │  AWS   │         │ Azure  │  │  GCP   │
    │  APIs  │         │  APIs  │  │  APIs  │
    └────────┘         └────────┘  └────────┘
```

## Directory Structure

```
finops_cloud/
├── lib/
│   ├── mcp/
│   │   ├── client.ts          # Centralized MCP client library
│   │   └── index.ts           # Exports
│   └── aws/
│       ├── types.ts           # Type definitions (no SDK imports)
│       └── transform.ts       # Data transformation utilities
├── app/
│   └── api/
│       ├── aws/               # AWS API routes (uses awsClient)
│       ├── azure/             # Azure API routes (uses azureClient)
│       ├── gcp/               # GCP API routes (uses gcpClient)
│       └── mcp/               # MCP management routes
└── hooks/                     # React hooks for data fetching
```

## MCP Client Library

### Location
`lib/mcp/client.ts`

### Exported Classes

#### 1. **AWSMCPClient**
- Protocol: MCP Tool Calling
- Server URL: `http://localhost:3001`
- Methods:
  - `callTool(tool: string, args: Record<string, any>)` - Call MCP tools
  - `healthCheck()` - Check server health
  - `listTools()` - List available tools

#### 2. **AzureMCPClient**
- Protocol: REST API
- Server URL: `http://localhost:8000`
- Methods:
  - `callAPI(endpoint: string, args: Record<string, any>)` - Call REST endpoints
  - `healthCheck()` - Check server health

#### 3. **GCPMCPClient**
- Protocol: REST API
- Server URL: `http://localhost:3002`
- Methods:
  - `callAPI(endpoint: string, args: Record<string, any>)` - Call REST endpoints
  - `healthCheck()` - Check server health

#### 4. **UnifiedMCPClient**
- Unified interface for all providers
- Methods:
  - `getClient(provider: CloudProvider)` - Get specific client
  - `healthCheckAll()` - Check all servers

### Singleton Instances

```typescript
import { awsClient, azureClient, gcpClient, mcpClient } from "@/lib/mcp";

// AWS MCP calls
const costData = await awsClient.callTool("get_cost", {
  profiles: ["default"],
  time_range_days: 30
});

// Azure REST calls
const azureCost = await azureClient.callAPI("/api/cost", {
  subscription_id: "xxx"
});

// GCP REST calls
const gcpCost = await gcpClient.callAPI("/api/cost", {
  projectId: "my-project"
});

// Unified health check
const health = await mcpClient.healthCheckAll();
```

## API Route Patterns

### AWS Routes (MCP Tool Protocol)

**Example: `/app/api/aws/cost/route.ts`**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { awsClient } from "@/lib/mcp";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { profiles, timeRangeDays } = body;

    const data = await awsClient.callTool("get_cost", {
      profiles,
      time_range_days: timeRangeDays
    });

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
```

### Azure Routes (REST API)

**Example: `/app/api/azure/cost/route.ts`**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { azureClient } from "@/lib/mcp";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = await azureClient.callAPI("/api/cost", body);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
```

### GCP Routes (REST API)

**Example: `/app/api/gcp/cost/route.ts`**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { gcpClient } from "@/lib/mcp";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = await gcpClient.callAPI("/api/cost", body);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
```

## Environment Configuration

### `.env.local` or `.env`

```bash
# MCP Server URLs
MCP_SERVER_URL=http://localhost:3001          # AWS MCP Server
AZURE_MCP_SERVER_URL=http://localhost:8000    # Azure MCP Server
GCP_MCP_SERVER_URL=http://localhost:3002      # GCP MCP Server
```

## Error Handling

All MCP clients include comprehensive error handling:

```typescript
export interface MCPError extends Error {
  status?: number;           // HTTP status code
  statusText?: string;       // HTTP status text
  provider: CloudProvider;   // Which provider failed
}
```

### Example Error Handling

```typescript
try {
  const data = await awsClient.callTool("get_cost", args);
} catch (error) {
  if (error instanceof Error && "provider" in error) {
    const mcpError = error as MCPError;
    console.error(`${mcpError.provider} MCP error:`, mcpError.message);
    console.error(`Status: ${mcpError.status} ${mcpError.statusText}`);
  }
}
```

## Health Checks

### Individual Health Check

```typescript
const health = await awsClient.healthCheck();
// Returns: { status: "ok" | "unhealthy" | "unreachable", healthy: boolean }
```

### Unified Health Check

```typescript
const health = await mcpClient.healthCheckAll();
// Returns:
// {
//   aws: { status: "ok", healthy: true },
//   azure: { status: "ok", healthy: true },
//   gcp: { status: "ok", healthy: true }
// }
```

## Benefits of This Architecture

### ✅ Zero Direct SDK Dependencies
- No `@aws-sdk/*` packages in `package.json`
- No `@azure/*` packages in `package.json`
- No `@google-cloud/*` packages in `package.json`
- Smaller bundle size
- Faster build times

### ✅ Centralized Error Handling
- Consistent error format across all providers
- Provider-specific error tracking
- Easy to add retry logic or circuit breakers

### ✅ Easy to Test
- Mock MCP clients for unit tests
- No need to mock SDK clients
- Consistent interface for all providers

### ✅ Security
- Credentials managed by MCP servers
- UI never handles cloud credentials directly
- Clear separation of concerns

### ✅ Scalability
- Easy to add new cloud providers
- MCP servers can be scaled independently
- Load balancing at MCP layer

### ✅ Maintainability
- Single source of truth for MCP communication
- DRY principle - no duplicated fetch logic
- TypeScript type safety

## Migration Guide

If you need to add a new MCP call:

### Step 1: Add method to client (if needed)

The existing clients support most use cases. If you need custom functionality:

```typescript
// lib/mcp/client.ts
export class AWSMCPClient {
  async callCustomTool(args: CustomArgs) {
    return this.callTool("custom_tool", args);
  }
}
```

### Step 2: Create API route

```typescript
// app/api/custom/route.ts
import { awsClient } from "@/lib/mcp";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const data = await awsClient.callTool("tool_name", body);
  return NextResponse.json(data);
}
```

### Step 3: Create React hook (optional)

```typescript
// hooks/useCustomData.ts
export function useCustomData() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("/api/custom", { method: "POST", body: JSON.stringify({...}) })
      .then(res => res.json())
      .then(setData);
  }, []);

  return data;
}
```

## Troubleshooting

### MCP Server Not Reachable

**Error:** `MCP server not reachable/healthy`

**Solution:**
1. Check if MCP servers are running:
   ```bash
   curl http://localhost:3001/health  # AWS
   curl http://localhost:8000/health  # Azure
   curl http://localhost:3002/health  # GCP
   ```

2. Start MCP servers:
   ```bash
   cd ../aws-finops-mcp-server && npm start
   cd ../azure-finops-mcp-server && python app.py
   cd ../gcloud-mcp && npm start
   ```

3. Verify environment variables in `.env.local`

### CORS Errors

If you see CORS errors, ensure MCP servers allow requests from `http://localhost:3000`:

```javascript
// MCP server CORS config
app.use(cors({
  origin: ['http://localhost:3000'],
  credentials: true
}));
```

### Type Errors

If you see TypeScript errors about MCP responses:

1. Check `lib/aws/types.ts` for type definitions
2. Ensure MCP server response matches expected types
3. Add new types if MCP response format changed

## Related Documentation

- [MCP Integration Plan](./MCP_INTEGRATION_PLAN.md)
- [MCP Integration Explained](./MCP_INTEGRATION_EXPLAINED.md)
- [MCP Integration Complete](./MCP_INTEGRATION_COMPLETE.md)
- [FinOps MCP Servers](./finops_mcp_servers.md)

## Version History

- **v2.0** (2025-10-28) - Complete refactor to centralized MCP client
- **v1.0** (2024) - Initial MCP integration with individual fetch calls
