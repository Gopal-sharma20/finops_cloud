import { useQuery } from "@tanstack/react-query";

export interface AzureCostParams {
  profiles?: string[];
  allProfiles?: boolean;
  timeRangeDays?: number;
  startDateIso?: string;
  endDateIso?: string;
  tags?: Record<string, string>;
  dimensions?: string[];
  groupBy?: string;
  tenantId?: string;
  clientId?: string;
  clientSecret?: string;
  subscriptionId?: string;
}

export interface AzureCostResponse {
  accounts_cost_data: Record<string, any>;
  errors_for_profiles: Record<string, string>;
}

/**
 * Fetch Azure cost data
 */
async function fetchCostData(params: AzureCostParams): Promise<AzureCostResponse> {
  const response = await fetch("/api/azure/cost", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch cost data: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Hook to fetch Azure cost data
 */
export function useAzureCost(params: AzureCostParams, enabled: boolean = true) {
  return useQuery({
    queryKey: ["azure-cost", params],
    queryFn: () => fetchCostData(params),
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

/**
 * Simplified hook for single profile cost data
 */
export function useAzureProfileCost(
  profile: string = "default",
  timeRangeDays: number = 30
) {
  return useQuery({
    queryKey: ["azure-cost", profile, timeRangeDays],
    queryFn: async () => {
      const response = await fetch(
        `/api/azure/cost?profile=${profile}&timeRangeDays=${timeRangeDays}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch cost data: ${response.statusText}`);
      }

      return response.json();
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
