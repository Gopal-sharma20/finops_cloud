import { useQuery } from "@tanstack/react-query";

/**
 * Fetch cost savings recommendations
 */
export function useSavings() {
  return useQuery({
    queryKey: ["savings"],
    queryFn: async () => {
      const response = await fetch("/api/savings");
      if (!response.ok) {
        throw new Error("Failed to fetch savings recommendations");
      }
      return response.json();
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });
}
