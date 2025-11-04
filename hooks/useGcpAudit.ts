import { useQuery } from "@tanstack/react-query";

export interface GcpAuditParams {
  projectId?: string;
  serviceAccountJson?: string;
  serviceAccountKeyPath?: string;
}

export interface GcpAuditResponse {
  success: boolean;
  data?: {
    timestamp: string;
    projectId: string;
    findings: Array<{
      category: string;
      result: {
        content: Array<{
          type: string;
          text: string;
        }>;
      };
    }>;
  };
  error?: string;
}

/**
 * Fetch GCP audit data (unattached disks, idle IPs, recommendations)
 */
async function fetchGcpAudit(params: GcpAuditParams): Promise<GcpAuditResponse> {
  console.log("🔍 Fetching GCP audit data with params:", params);

  // Get credentials from localStorage if not provided
  let finalParams = { ...params };

  if (!finalParams.projectId || !finalParams.serviceAccountJson) {
    const onboardingData = localStorage.getItem("cloudoptima-onboarding");
    if (onboardingData) {
      const data = JSON.parse(onboardingData);
      const gcpCreds = data.credentials?.gcp;

      if (gcpCreds) {
        finalParams = {
          projectId: gcpCreds.projectId,
          serviceAccountJson: gcpCreds.serviceAccountJson,
          ...params,
        };
      }
    }
  }

  const response = await fetch("/api/gcp/audit", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(finalParams),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch GCP audit data: ${response.statusText}`);
  }

  const data = await response.json();
  console.log("✅ GCP audit data fetched:", data);
  return data;
}

/**
 * Hook to fetch GCP audit data
 */
export function useGcpAudit(params: GcpAuditParams = {}, enabled: boolean = true) {
  return useQuery({
    queryKey: ["gcp-audit", params],
    queryFn: () => fetchGcpAudit(params),
    enabled,
    staleTime: 15 * 60 * 1000, // 15 minutes
    refetchOnWindowFocus: false,
  });
}
