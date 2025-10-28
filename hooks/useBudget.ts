import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface Budget {
  provider: "aws" | "azure" | "gcp" | "total";
  amount: number;
  period: "monthly" | "quarterly" | "yearly";
  currency: string;
  updatedAt: string;
}

/**
 * Fetch all budgets
 */
export function useBudget() {
  return useQuery({
    queryKey: ["budgets"],
    queryFn: async () => {
      const response = await fetch("/api/budget");
      if (!response.ok) {
        throw new Error("Failed to fetch budgets");
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Create or update a budget
 */
export function useSetBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (budget: Omit<Budget, "updatedAt">) => {
      const response = await fetch("/api/budget", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(budget),
      });

      if (!response.ok) {
        throw new Error("Failed to set budget");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
    },
  });
}

/**
 * Delete a budget
 */
export function useDeleteBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (provider: string) => {
      const response = await fetch(`/api/budget?provider=${provider}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete budget");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
    },
  });
}
