import { useQuery } from "@tanstack/react-query";

export interface GcpCostParams {
  projectId?: string;
  billingAccountId?: string;
  serviceAccountJson?: string;
  timeRangeDays?: number;
  startDateIso?: string;
  endDateIso?: string;
}

export interface GcpCostResponse {
  success: boolean;
  data?: {
    compute: any;
    storage: any;
    sql: any;
    projectId: string;
    billingAccountId?: string;
  };
  error?: string;
}

/**
 * Fetch GCP cost data
 */
async function fetchGcpCostData(params: GcpCostParams): Promise<GcpCostResponse> {
  // Get credentials from localStorage if not provided
  let finalParams = { ...params };

  if (!finalParams.projectId || !finalParams.serviceAccountJson) {
    const onboardingData = localStorage.getItem('cloudoptima-onboarding');
    if (onboardingData) {
      const data = JSON.parse(onboardingData);
      const gcpCreds = data.credentials?.gcp;

      if (gcpCreds) {
        finalParams = {
          projectId: gcpCreds.projectId,
          billingAccountId: gcpCreds.billingAccountId,
          serviceAccountJson: gcpCreds.serviceAccountJson,
          ...params,
        };
      }
    }
  }

  const response = await fetch("/api/gcp/cost", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(finalParams),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch GCP cost data: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Hook to fetch GCP cost data
 */
export function useGcpCost(params: GcpCostParams = {}, enabled: boolean = true) {
  return useQuery({
    queryKey: ["gcp-cost", params],
    queryFn: () => fetchGcpCostData(params),
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}
