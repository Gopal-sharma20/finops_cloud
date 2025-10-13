import { useQuery } from "@tanstack/react-query";

export interface AWSProfile {
  name: string;
  region: string;
  accountId: string;
  createdAt: string;
}

/**
 * Fetch AWS profile information
 */
async function fetchProfile(profileName: string): Promise<AWSProfile | null> {
  const response = await fetch(`/api/aws/profiles`);

  if (!response.ok) {
    throw new Error(`Failed to fetch profiles: ${response.statusText}`);
  }

  const data = await response.json();
  const profile = data.profiles?.find((p: AWSProfile) => p.name === profileName);

  return profile || null;
}

/**
 * Hook to fetch a specific AWS profile
 */
export function useAWSProfile(profileName: string = "default") {
  return useQuery({
    queryKey: ["aws-profile", profileName],
    queryFn: () => fetchProfile(profileName),
    staleTime: 10 * 60 * 1000, // 10 minutes - profiles don't change often
    refetchOnWindowFocus: false,
  });
}
