import { useQuery } from "@tanstack/react-query";

export interface AuditParams {
  profiles?: string[];
  allProfiles?: boolean;
  regions: string[];
}

export interface AuditResponse {
  "Audit Report": Record<string, any>;
  "Error processing profiles": Record<string, string>;
}

/**
 * Fetch AWS audit data
 */
async function fetchAuditData(params: AuditParams): Promise<AuditResponse> {
  const response = await fetch("/api/aws/audit", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch audit data: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Hook to fetch AWS audit data
 */
export function useAWSAudit(params: AuditParams, enabled: boolean = true) {
  return useQuery({
    queryKey: ["aws-audit", params],
    queryFn: () => fetchAuditData(params),
    enabled,
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });
}

/**
 * Simplified hook for single profile audit
 */
export function useProfileAudit(
  profile: string = "default",
  regions: string[] = ["us-east-1"]
) {
  return useQuery({
    queryKey: ["aws-audit", profile, regions],
    queryFn: async () => {
      const response = await fetch(
        `/api/aws/audit?profile=${profile}&regions=${regions.join(",")}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch audit data: ${response.statusText}`);
      }

      return response.json();
    },
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
