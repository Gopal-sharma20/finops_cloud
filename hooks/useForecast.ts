import { useQuery } from "@tanstack/react-query";

/**
 * Fetch cost forecast
 */
export function useForecast(days: number = 30, enabled: boolean = true) {
  return useQuery({
    queryKey: ["forecast", days],
    queryFn: async () => {
      console.log(`Fetching forecast for ${days} days`);

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

      const response = await fetch(`/api/forecast`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          days,
          gcpCredentials,
          connectedProviders,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch cost forecast");
      }

      const result = await response.json();
      console.log(`Forecast fetched:`, result);
      return result;
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}
