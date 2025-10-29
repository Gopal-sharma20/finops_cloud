/**
 * Unified MCP Client Library
 * Provides a centralized interface for calling MCP servers across AWS, Azure, and GCP
 */

export enum CloudProvider {
  AWS = "aws",
  AZURE = "azure",
  GCP = "gcp",
}

export interface MCPClientConfig {
  provider: CloudProvider;
  serverUrl?: string;
}

export interface MCPError extends Error {
  status?: number;
  statusText?: string;
  provider: CloudProvider;
}

/**
 * MCP Client for AWS (MCP Protocol)
 * Uses the standard MCP tool calling interface
 */
export class AWSMCPClient {
  private serverUrl: string;

  constructor(serverUrl?: string) {
    this.serverUrl = serverUrl || process.env.MCP_SERVER_URL || "http://localhost:3001";
  }

  /**
   * Call an MCP tool on the AWS server
   * @param tool - The tool name (e.g., "get_cost", "audit")
   * @param args - Tool arguments
   */
  async callTool(tool: string, args: Record<string, any>): Promise<any> {
    try {
      const response = await fetch(`${this.serverUrl}/mcp/tools/call`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ tool, arguments: args }),
      });

      if (!response.ok) {
        const text = await response.text().catch(() => "");
        const error = new Error(
          `AWS MCP call failed (${response.status} ${response.statusText})${text ? ` - ${text}` : ""}`
        ) as MCPError;
        error.status = response.status;
        error.statusText = response.statusText;
        error.provider = CloudProvider.AWS;
        throw error;
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error && "provider" in error) {
        throw error;
      }
      const mcpError = new Error(
        `AWS MCP connection error: ${error instanceof Error ? error.message : "Unknown error"}`
      ) as MCPError;
      mcpError.provider = CloudProvider.AWS;
      throw mcpError;
    }
  }

  /**
   * Check MCP server health
   */
  async healthCheck(): Promise<{ status: string; healthy: boolean }> {
    try {
      const response = await fetch(`${this.serverUrl}/health`, {
        method: "GET",
        headers: { "content-type": "application/json" },
      });

      if (!response.ok) {
        return { status: "unhealthy", healthy: false };
      }

      const data = await response.json();
      return { status: data.status || "ok", healthy: true };
    } catch (error) {
      return { status: "unreachable", healthy: false };
    }
  }

  /**
   * List available MCP tools
   */
  async listTools(): Promise<any> {
    try {
      const response = await fetch(`${this.serverUrl}/mcp/tools/list`, {
        method: "GET",
        headers: { "content-type": "application/json" },
      });

      if (!response.ok) {
        throw new Error(`Failed to list tools: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(
        `Failed to list AWS MCP tools: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }
}

/**
 * MCP Client for Azure (REST API)
 * Uses REST endpoints for Azure Cost Management
 */
export class AzureMCPClient {
  private serverUrl: string;

  constructor(serverUrl?: string) {
    this.serverUrl = serverUrl || process.env.AZURE_MCP_SERVER_URL || "http://localhost:8000";
  }

  /**
   * Call an Azure REST API endpoint
   * @param endpoint - The API endpoint (e.g., "/api/cost", "/api/audit")
   * @param args - Request body
   */
  async callAPI(endpoint: string, args: Record<string, any>): Promise<any> {
    try {
      const response = await fetch(`${this.serverUrl}${endpoint}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(args),
      });

      if (!response.ok) {
        const text = await response.text().catch(() => "");
        const error = new Error(
          `Azure API call failed (${response.status} ${response.statusText})${text ? ` - ${text}` : ""}`
        ) as MCPError;
        error.status = response.status;
        error.statusText = response.statusText;
        error.provider = CloudProvider.AZURE;
        throw error;
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error && "provider" in error) {
        throw error;
      }
      const mcpError = new Error(
        `Azure API connection error: ${error instanceof Error ? error.message : "Unknown error"}`
      ) as MCPError;
      mcpError.provider = CloudProvider.AZURE;
      throw mcpError;
    }
  }

  /**
   * Check Azure server health
   */
  async healthCheck(): Promise<{ status: string; healthy: boolean }> {
    try {
      const response = await fetch(`${this.serverUrl}/health`, {
        method: "GET",
        headers: { "content-type": "application/json" },
      });

      if (!response.ok) {
        return { status: "unhealthy", healthy: false };
      }

      const data = await response.json();
      return { status: data.status || "ok", healthy: true };
    } catch (error) {
      return { status: "unreachable", healthy: false };
    }
  }
}

/**
 * MCP Client for GCP (REST API)
 * Uses REST endpoints for GCP BigQuery cost analysis
 */
export class GCPMCPClient {
  private serverUrl: string;

  constructor(serverUrl?: string) {
    this.serverUrl = serverUrl || process.env.GCP_MCP_SERVER_URL || "http://localhost:3002";
  }

  /**
   * Call a GCP REST API endpoint
   * @param endpoint - The API endpoint (e.g., "/api/cost", "/api/audit")
   * @param args - Request body
   */
  async callAPI(endpoint: string, args: Record<string, any>): Promise<any> {
    try {
      const response = await fetch(`${this.serverUrl}${endpoint}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(args),
      });

      if (!response.ok) {
        const text = await response.text().catch(() => "");
        const error = new Error(
          `GCP API call failed (${response.status} ${response.statusText})${text ? ` - ${text}` : ""}`
        ) as MCPError;
        error.status = response.status;
        error.statusText = response.statusText;
        error.provider = CloudProvider.GCP;
        throw error;
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error && "provider" in error) {
        throw error;
      }
      const mcpError = new Error(
        `GCP API connection error: ${error instanceof Error ? error.message : "Unknown error"}`
      ) as MCPError;
      mcpError.provider = CloudProvider.GCP;
      throw mcpError;
    }
  }

  /**
   * Check GCP server health
   */
  async healthCheck(): Promise<{ status: string; healthy: boolean }> {
    try {
      const response = await fetch(`${this.serverUrl}/health`, {
        method: "GET",
        headers: { "content-type": "application/json" },
      });

      if (!response.ok) {
        return { status: "unhealthy", healthy: false };
      }

      const data = await response.json();
      return { status: data.status || "ok", healthy: true };
    } catch (error) {
      return { status: "unreachable", healthy: false };
    }
  }
}

/**
 * Factory function to create MCP clients
 */
export function createMCPClient(config: MCPClientConfig) {
  switch (config.provider) {
    case CloudProvider.AWS:
      return new AWSMCPClient(config.serverUrl);
    case CloudProvider.AZURE:
      return new AzureMCPClient(config.serverUrl);
    case CloudProvider.GCP:
      return new GCPMCPClient(config.serverUrl);
    default:
      throw new Error(`Unsupported cloud provider: ${config.provider}`);
  }
}

/**
 * Unified MCP client that can handle all providers
 */
export class UnifiedMCPClient {
  private awsClient: AWSMCPClient;
  private azureClient: AzureMCPClient;
  private gcpClient: GCPMCPClient;

  constructor(
    awsUrl?: string,
    azureUrl?: string,
    gcpUrl?: string
  ) {
    this.awsClient = new AWSMCPClient(awsUrl);
    this.azureClient = new AzureMCPClient(azureUrl);
    this.gcpClient = new GCPMCPClient(gcpUrl);
  }

  /**
   * Get client for specific provider
   */
  getClient(provider: CloudProvider) {
    switch (provider) {
      case CloudProvider.AWS:
        return this.awsClient;
      case CloudProvider.AZURE:
        return this.azureClient;
      case CloudProvider.GCP:
        return this.gcpClient;
      default:
        throw new Error(`Unsupported cloud provider: ${provider}`);
    }
  }

  /**
   * Check health of all MCP servers
   */
  async healthCheckAll(): Promise<Record<CloudProvider, { status: string; healthy: boolean }>> {
    const [aws, azure, gcp] = await Promise.allSettled([
      this.awsClient.healthCheck(),
      this.azureClient.healthCheck(),
      this.gcpClient.healthCheck(),
    ]);

    return {
      [CloudProvider.AWS]: aws.status === "fulfilled" ? aws.value : { status: "error", healthy: false },
      [CloudProvider.AZURE]: azure.status === "fulfilled" ? azure.value : { status: "error", healthy: false },
      [CloudProvider.GCP]: gcp.status === "fulfilled" ? gcp.value : { status: "error", healthy: false },
    };
  }
}

// Export singleton instance for convenience
export const mcpClient = new UnifiedMCPClient();

// Export individual clients for direct use
export const awsClient = new AWSMCPClient();
export const azureClient = new AzureMCPClient();
export const gcpClient = new GCPMCPClient();
