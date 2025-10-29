# MCP Client Library

A centralized, type-safe client library for communicating with MCP (Model Context Protocol) servers across AWS, Azure, and GCP.

## Installation

```typescript
import { awsClient, azureClient, gcpClient, mcpClient } from "@/lib/mcp";
```

## Quick Start

### AWS (MCP Tool Protocol)

```typescript
// Get cost data
const costData = await awsClient.callTool("get_cost", {
  profiles: ["default"],
  time_range_days: 30,
  group_by: "SERVICE"
});

// Run audit
const auditData = await awsClient.callTool("run_finops_audit", {
  profiles: ["default"],
  regions: ["us-east-1", "us-west-2"]
});

// Health check
const health = await awsClient.healthCheck();
console.log(health.healthy); // true or false

// List available tools
const tools = await awsClient.listTools();
```

### Azure (REST API)

```typescript
// Get cost data
const costData = await azureClient.callAPI("/api/cost", {
  subscription_id: "xxx",
  time_range_days: 30
});

// Run audit
const auditData = await azureClient.callAPI("/api/audit", {
  subscription_id: "xxx"
});

// Health check
const health = await azureClient.healthCheck();
```

### GCP (REST API)

```typescript
// Get cost data
const costData = await gcpClient.callAPI("/api/cost", {
  projectId: "my-project",
  datasetId: "billing_export",
  timeRangeDays: 30
});

// Run audit
const auditData = await gcpClient.callAPI("/api/audit", {
  projectId: "my-project"
});

// Health check
const health = await gcpClient.healthCheck();
```

### Unified Client

```typescript
// Check health of all servers
const healthStatus = await mcpClient.healthCheckAll();
console.log(healthStatus);
// {
//   aws: { status: "ok", healthy: true },
//   azure: { status: "ok", healthy: true },
//   gcp: { status: "ok", healthy: true }
// }

// Get specific client
const aws = mcpClient.getClient(CloudProvider.AWS);
await aws.callTool("get_cost", {...});
```

## API Reference

### AWSMCPClient

#### Constructor
```typescript
new AWSMCPClient(serverUrl?: string)
```

#### Methods

##### `callTool(tool: string, args: Record<string, any>): Promise<any>`
Call an MCP tool on the AWS server.

**Parameters:**
- `tool` - Tool name (e.g., "get_cost", "run_finops_audit")
- `args` - Tool arguments

**Example:**
```typescript
const data = await awsClient.callTool("get_cost", {
  profiles: ["default"],
  time_range_days: 30
});
```

##### `healthCheck(): Promise<{ status: string, healthy: boolean }>`
Check AWS MCP server health.

**Returns:**
- `status` - "ok", "unhealthy", or "unreachable"
- `healthy` - Boolean health status

##### `listTools(): Promise<any>`
List all available MCP tools.

---

### AzureMCPClient

#### Constructor
```typescript
new AzureMCPClient(serverUrl?: string)
```

#### Methods

##### `callAPI(endpoint: string, args: Record<string, any>): Promise<any>`
Call an Azure REST API endpoint.

**Parameters:**
- `endpoint` - API endpoint (e.g., "/api/cost", "/api/audit")
- `args` - Request body

**Example:**
```typescript
const data = await azureClient.callAPI("/api/cost", {
  subscription_id: "xxx",
  time_range_days: 30
});
```

##### `healthCheck(): Promise<{ status: string, healthy: boolean }>`
Check Azure MCP server health.

---

### GCPMCPClient

#### Constructor
```typescript
new GCPMCPClient(serverUrl?: string)
```

#### Methods

##### `callAPI(endpoint: string, args: Record<string, any>): Promise<any>`
Call a GCP REST API endpoint.

**Parameters:**
- `endpoint` - API endpoint (e.g., "/api/cost", "/api/audit")
- `args` - Request body

**Example:**
```typescript
const data = await gcpClient.callAPI("/api/cost", {
  projectId: "my-project",
  timeRangeDays: 30
});
```

##### `healthCheck(): Promise<{ status: string, healthy: boolean }>`
Check GCP MCP server health.

---

### UnifiedMCPClient

#### Constructor
```typescript
new UnifiedMCPClient(awsUrl?: string, azureUrl?: string, gcpUrl?: string)
```

#### Methods

##### `getClient(provider: CloudProvider): AWSMCPClient | AzureMCPClient | GCPMCPClient`
Get a specific cloud provider client.

**Parameters:**
- `provider` - CloudProvider enum (AWS, AZURE, or GCP)

**Example:**
```typescript
import { CloudProvider } from "@/lib/mcp";

const aws = mcpClient.getClient(CloudProvider.AWS);
const data = await aws.callTool("get_cost", {...});
```

##### `healthCheckAll(): Promise<Record<CloudProvider, { status: string, healthy: boolean }>>`
Check health of all MCP servers in parallel.

**Returns:**
Object with health status for each provider.

---

## Error Handling

### MCPError Interface

```typescript
interface MCPError extends Error {
  status?: number;           // HTTP status code
  statusText?: string;       // HTTP status text
  provider: CloudProvider;   // Which provider failed
}
```

### Example

```typescript
try {
  const data = await awsClient.callTool("get_cost", args);
} catch (error) {
  if (error instanceof Error && "provider" in error) {
    const mcpError = error as MCPError;
    console.error(`Provider: ${mcpError.provider}`);
    console.error(`Status: ${mcpError.status} ${mcpError.statusText}`);
    console.error(`Message: ${mcpError.message}`);
  }
}
```

## Environment Variables

Configure MCP server URLs via environment variables:

```bash
# .env.local
MCP_SERVER_URL=http://localhost:3001          # AWS
AZURE_MCP_SERVER_URL=http://localhost:8000    # Azure
GCP_MCP_SERVER_URL=http://localhost:3002      # GCP
```

## TypeScript Types

### CloudProvider Enum

```typescript
enum CloudProvider {
  AWS = "aws",
  AZURE = "azure",
  GCP = "gcp"
}
```

### MCPClientConfig

```typescript
interface MCPClientConfig {
  provider: CloudProvider;
  serverUrl?: string;
}
```

## Factory Pattern

Create clients dynamically using the factory function:

```typescript
import { createMCPClient, CloudProvider } from "@/lib/mcp";

const awsClient = createMCPClient({
  provider: CloudProvider.AWS,
  serverUrl: "http://localhost:3001"
});

const data = await awsClient.callTool("get_cost", {...});
```

## Singleton Instances

The library exports singleton instances for convenience:

```typescript
// Pre-configured singleton instances
export const awsClient = new AWSMCPClient();
export const azureClient = new AzureMCPClient();
export const gcpClient = new GCPMCPClient();
export const mcpClient = new UnifiedMCPClient();
```

Use these in your API routes and components:

```typescript
import { awsClient } from "@/lib/mcp";

// No need to instantiate - just use it
const data = await awsClient.callTool("get_cost", {...});
```

## Best Practices

### 1. Use Singleton Instances

✅ **Good:**
```typescript
import { awsClient } from "@/lib/mcp";
await awsClient.callTool(...);
```

❌ **Avoid:**
```typescript
import { AWSMCPClient } from "@/lib/mcp";
const client = new AWSMCPClient(); // Creates new instance
```

### 2. Handle Errors Gracefully

✅ **Good:**
```typescript
try {
  const data = await awsClient.callTool("get_cost", args);
  return NextResponse.json(data);
} catch (error) {
  console.error("Cost fetch error:", error);
  return NextResponse.json(
    { error: error instanceof Error ? error.message : "Unknown error" },
    { status: 500 }
  );
}
```

### 3. Health Check Before Operations

✅ **Good:**
```typescript
const health = await awsClient.healthCheck();
if (!health.healthy) {
  return NextResponse.json(
    { error: "MCP server unreachable" },
    { status: 502 }
  );
}
```

### 4. Type Your Responses

✅ **Good:**
```typescript
import { CostData } from "@/lib/aws/types";

const data: CostData = await awsClient.callTool("get_cost", args);
```

## Testing

### Mock MCP Clients

```typescript
import { vi } from 'vitest';
import * as mcpModule from '@/lib/mcp';

// Mock awsClient
vi.spyOn(mcpModule, 'awsClient').mockReturnValue({
  callTool: vi.fn().mockResolvedValue({
    accounts_cost_data: {...}
  }),
  healthCheck: vi.fn().mockResolvedValue({
    status: 'ok',
    healthy: true
  })
});

// Test your API route
const response = await POST(mockRequest);
expect(response.status).toBe(200);
```

## Troubleshooting

### Connection Refused

**Error:** `fetch failed` or `ECONNREFUSED`

**Solution:**
1. Verify MCP servers are running
2. Check URLs in `.env.local`
3. Test with curl:
   ```bash
   curl http://localhost:3001/health
   ```

### Type Errors

**Error:** `Property 'x' does not exist on type 'any'`

**Solution:**
1. Import types from `@/lib/aws/types`
2. Add type annotations to responses
3. Update type definitions if MCP response changed

### Timeout

**Error:** Request takes too long

**Solution:**
1. Check MCP server logs
2. Verify AWS/Azure/GCP credentials on MCP server
3. Reduce time range or add pagination

## Contributing

When adding new MCP functionality:

1. Add method to appropriate client class in `client.ts`
2. Export from `index.ts`
3. Update this README
4. Add TypeScript types to `lib/aws/types.ts` (or create `lib/azure/types.ts`, etc.)
5. Write tests

## License

Same as parent project.
