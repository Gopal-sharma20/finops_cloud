import { useQuery } from "@tanstack/react-query";

/**
 * Fetch historical cost trends
 */
export function useCostTrends(days: number = 7, enabled: boolean = true) {
  return useQuery({
    queryKey: ["cost-trends", days],
    queryFn: async () => {
      console.log(`Fetching cost trends for ${days} days`);

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

      const response = await fetch(`/api/cost-trends`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          days,
          gcpCredentials,
          connectedProviders,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch cost trends");
      }

      const result = await response.json();
      console.log(`Cost trends fetched:`, result);
      return result;
    },
    enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: false,
  });
}
