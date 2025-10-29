import { useQuery } from "@tanstack/react-query";

/**
 * Fetch cost savings recommendations
 */
export function useSavings() {
  return useQuery({
    queryKey: ["savings"],
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

      const response = await fetch("/api/savings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          connectedProviders,
          gcpCredentials,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch savings recommendations");
      }
      return response.json();
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });
}
