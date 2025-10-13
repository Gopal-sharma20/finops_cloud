import { useQuery } from "@tanstack/react-query";

export interface CostParams {
  profiles?: string[];
  allProfiles?: boolean;
  timeRangeDays?: number;
  startDateIso?: string;
  endDateIso?: string;
  tags?: string[];
  dimensions?: string[];
  groupBy?: string;
}

export interface CostResponse {
  accounts_cost_data: Record<string, any>;
  errors_for_profiles: Record<string, string>;
}

/**
 * Fetch AWS cost data
 */
async function fetchCostData(params: CostParams): Promise<CostResponse> {
  const response = await fetch("/api/aws/cost", {
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
 * Hook to fetch AWS cost data
 */
export function useAWSCost(params: CostParams, enabled: boolean = true) {
  return useQuery({
    queryKey: ["aws-cost", params],
    queryFn: () => fetchCostData(params),
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

/**
 * Simplified hook for single profile cost data
 */
export function useProfileCost(
  profile: string = "default",
  timeRangeDays: number = 30
) {
  return useQuery({
    queryKey: ["aws-cost", profile, timeRangeDays],
    queryFn: async () => {
      const response = await fetch(
        `/api/aws/cost?profile=${profile}&timeRangeDays=${timeRangeDays}`
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
