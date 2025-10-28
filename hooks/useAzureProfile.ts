import { useQuery } from "@tanstack/react-query";

export interface AzureProfilesResponse {
  profiles: string[];
}

/**
 * Fetch available Azure profiles
 */
async function fetchProfiles(): Promise<AzureProfilesResponse> {
  const response = await fetch("/api/azure/profiles");

  if (!response.ok) {
    throw new Error(`Failed to fetch profiles: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Hook to fetch available Azure profiles
 */
export function useAzureProfiles() {
  return useQuery({
    queryKey: ["azure-profiles"],
    queryFn: fetchProfiles,
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });
}
