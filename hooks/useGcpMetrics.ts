import { useQuery } from "@tanstack/react-query";

export interface GcpMetricsParams {
  projectId?: string;
  metricType: string;
  hours?: number;
  instanceId?: string;
}

export interface GcpMetricsResponse {
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
 * Fetch GCP metrics data from Cloud Monitoring API
 */
async function fetchGcpMetrics(
  params: GcpMetricsParams
): Promise<GcpMetricsResponse> {
  console.log("📊 Fetching GCP metrics with params:", params);

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

  const response = await fetch("/api/gcp/metrics", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(finalParams),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch GCP metrics: ${response.statusText}`);
  }

  const data = await response.json();
  console.log("✅ GCP metrics fetched:", data);
  return data;
}

/**
 * Hook to fetch GCP metrics for a specific metric type
 */
export function useGcpMetrics(
  params: GcpMetricsParams,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: ["gcp-metrics", params],
    queryFn: () => fetchGcpMetrics(params),
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook to fetch multiple metrics in parallel
 */
export function useGcpMultipleMetrics(
  metricTypes: string[],
  hours: number = 24,
  enabled: boolean = true
) {
  const projectId = typeof window !== 'undefined'
    ? (() => {
        const onboardingData = localStorage.getItem("cloudoptima-onboarding");
        if (onboardingData) {
          const data = JSON.parse(onboardingData);
          return data.credentials?.gcp?.projectId;
        }
        return undefined;
      })()
    : undefined;

  const queries = metricTypes.map(metricType =>
    useQuery({
      queryKey: ["gcp-metrics", { projectId, metricType, hours }],
      queryFn: () => fetchGcpMetrics({ projectId, metricType, hours }),
      enabled: enabled && !!projectId,
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    })
  );

  return {
    queries,
    isLoading: queries.some(q => q.isLoading),
    isError: queries.some(q => q.isError),
    data: queries.map(q => q.data),
  };
}
