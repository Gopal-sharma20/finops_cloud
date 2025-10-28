import { useQuery } from "@tanstack/react-query";

/**
 * Fetch historical cost trends
 */
export function useCostTrends(days: number = 7) {
  return useQuery({
    queryKey: ["cost-trends", days],
    queryFn: async () => {
      // Get GCP credentials from localStorage if available
      let gcpCredentials = null;
      const onboardingData = localStorage.getItem('cloudoptima-onboarding');
      if (onboardingData) {
        const data = JSON.parse(onboardingData);
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
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch cost trends");
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}
