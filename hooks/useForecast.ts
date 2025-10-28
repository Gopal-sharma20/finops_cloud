import { useQuery } from "@tanstack/react-query";

/**
 * Fetch cost forecast
 */
export function useForecast(days: number = 30) {
  return useQuery({
    queryKey: ["forecast", days],
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

      const response = await fetch(`/api/forecast`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          days,
          gcpCredentials,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch cost forecast");
      }
      return response.json();
    },
    staleTime: 15 * 60 * 1000, // 15 minutes
    refetchOnWindowFocus: false,
  });
}
