/**
 * Type definitions for Azure cost and resource data
 * These types match the Azure MCP server response formats
 */

export interface AzureCostData {
  subscription?: string;
  subscriptionId?: string;
  periodStartDate?: string;
  periodEndDate?: string;
  totalCost: number;
  costByService?: Record<string, number>;
  costByRegion?: Record<string, number>;
  status?: "success" | "error";
  message?: string;
}

export interface AzureService {
  name: string;
  count: number;
  cost: number;
  utilization: number;
  color: string;
  icon: any;
}

export interface AzureRegion {
  id: string;
  name: string;
  timezone: string;
  resources: number;
  cost: number;
  location: string;
}

export interface AzureRecommendation {
  id: string | number;
  title: string;
  service: string;
  region: string;
  description: string;
  impact: "high" | "medium" | "low";
  effort: "high" | "medium" | "low";
  currentCost: number;
  projectedCost: number;
  savings: number;
  confidence: number;
  resources: string[];
  timeline: string;
  azureSpecific?: string;
}

export interface AzureProfile {
  subscription: string;
  subscriptionId?: string;
  name?: string;
}

export interface AzureAuditData {
  subscription: string;
  subscriptionId?: string;
  underutilizedVMs?: any[];
  unattachedDisks?: any[];
  unusedPublicIPs?: any[];
  recommendations?: AzureRecommendation[];
  errors?: Record<string, string>;
}
