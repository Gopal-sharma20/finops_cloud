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
 * Get Azure credentials from localStorage (if available from onboarding)
 */
function getAzureCredentials(): { tenantId?: string; clientId?: string; clientSecret?: string; subscriptionId?: string } {
  if (typeof window === 'undefined') return {};

  try {
    const onboardingData = localStorage.getItem('cloudoptima-onboarding');
    if (onboardingData) {
      const data = JSON.parse(onboardingData);
      const azureCreds = data.credentials?.azure;
      if (azureCreds) {
        return {
          tenantId: azureCreds.tenantId,
          clientId: azureCreds.clientId,
          clientSecret: azureCreds.clientSecret,
          subscriptionId: azureCreds.subscriptionId,
        };
      }
    }
  } catch (e) {
    console.error('Failed to read Azure credentials from localStorage:', e);
  }

  return {};
}

/**
 * Fetch Azure cost data
 */
async function fetchCostData(params: AzureCostParams): Promise<AzureCostResponse> {
  console.log("📊 Fetching Azure cost data with params:", params)

  // Merge stored credentials with params (params take precedence)
  const storedCreds = getAzureCredentials();
  const requestBody = {
    ...storedCreds,
    ...params,
  };

  const response = await fetch("/api/azure/cost", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
    cache: 'no-store', // Force fresh data on manual refetch
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch cost data: ${response.statusText}`);
  }

  const data = await response.json();
  console.log("✅ Azure cost data fetched:", data)
  return data;
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
