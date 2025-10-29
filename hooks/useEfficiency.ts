import { useQuery } from "@tanstack/react-query";

/**
 * Fetch resource efficiency metrics
 */
export function useEfficiency() {
  return useQuery({
    queryKey: ["efficiency"],
    queryFn: async () => {
      // Get GCP credentials and connected providers from localStorage
      let gcpCredentials = null;
      let connectedProviders: string[] = [];

      const onboardingData = localStorage.getItem('cloudoptima-onboarding');
      if (onboardingData) {
        const data = JSON.parse(onboardingData);
        connectedProviders = data.connectedProviders || [];
        const gcpCreds = data.credentials?.gcp;

        if (gcpCreds) {
          gcpCredentials = {
            projectId: gcpCreds.projectId,
            billingAccountId: gcpCreds.billingAccountId,
            serviceAccountJson: gcpCreds.serviceAccountKey,
          };
        }
      }

      const response = await fetch("/api/efficiency", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          connectedProviders,
          gcpCredentials,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch efficiency metrics");
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}
