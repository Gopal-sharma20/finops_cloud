import { useQuery } from "@tanstack/react-query";

export interface GcpRecommendationsParams {
  projectId?: string;
  recommenderType?: string;
  location?: string;
}

export interface GcpRecommendation {
  name: string;
  description: string;
  recommenderSubtype: string;
  lastRefreshTime: string;
  priority: string;
  content?: {
    operationGroups?: Array<{
      operations?: Array<{
        resource?: string;
        action?: string;
        value?: any;
      }>;
    }>;
  };
  stateInfo?: {
    state?: string;
  };
  primaryImpact?: {
    category?: string;
    costProjection?: {
      cost?: {
        currencyCode?: string;
        units?: string;
        nanos?: number;
      };
      duration?: string;
    };
  };
}

export interface GcpRecommendationsResponse {
  success: boolean;
  data?: {
    content: Array<{
      type: string;
      text: string;
    }>;
  };
  error?: string;
}

/**
 * Fetch GCP recommendations data
 */
async function fetchGcpRecommendations(
  params: GcpRecommendationsParams
): Promise<GcpRecommendationsResponse> {
  console.log("🎯 Fetching GCP recommendations with params:", params);

  // Get credentials from localStorage if not provided
  let finalParams = { ...params };

  if (!finalParams.projectId) {
    const onboardingData = localStorage.getItem("cloudoptima-onboarding");
    if (onboardingData) {
      const data = JSON.parse(onboardingData);
      const gcpCreds = data.credentials?.gcp;

      if (gcpCreds) {
        finalParams = {
          projectId: gcpCreds.projectId,
          ...params,
        };
      }
    }
  }

  const response = await fetch("/api/gcp/recommender", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(finalParams),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch GCP recommendations: ${response.statusText}`);
  }

  const data = await response.json();
  console.log("✅ GCP recommendations fetched:", data);
  return data;
}

/**
 * Hook to fetch GCP recommendations
 */
export function useGcpRecommendations(
  params: GcpRecommendationsParams = {},
  enabled: boolean = true
) {
  return useQuery({
    queryKey: ["gcp-recommendations", params],
    queryFn: () => fetchGcpRecommendations(params),
    enabled,
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });
}
