import { useQuery } from "@tanstack/react-query";

/**
 * Fetch resource efficiency metrics
 */
export function useEfficiency() {
  return useQuery({
    queryKey: ["efficiency"],
    queryFn: async () => {
      const response = await fetch("/api/efficiency");
      if (!response.ok) {
        throw new Error("Failed to fetch efficiency metrics");
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}
