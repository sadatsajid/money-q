import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { QUERY_TIME } from "@/lib/constants/query";

export type Budget = {
  id: string;
  categoryId: string;
  categoryName: string;
  category: {
    id: string;
    name: string;
    icon: string | null;
    color: string | null;
  };
  amount: string;
  spent: string;
  remaining: string;
  percentage: number;
};

type BudgetFormData = {
  budgets: Array<{
    categoryId: string;
    amount: string;
  }>;
};

// Query key factory
export const budgetKeys = {
  all: ["budgets"] as const,
  lists: () => [...budgetKeys.all, "list"] as const,
  list: (month: string) => [...budgetKeys.lists(), month] as const,
};

// Fetch budgets
export function useBudgets(month: string) {
  return useQuery({
    queryKey: budgetKeys.list(month),
    queryFn: async () => {
      const response = await fetch(`/api/budgets?month=${month}`);
      if (!response.ok) {
        throw new Error("Failed to fetch budgets");
      }
      const { budgets } = await response.json();
      return budgets as Budget[];
    },
    staleTime: QUERY_TIME.SHORT,
  });
}

// Save budgets mutation
export function useSaveBudgets() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ month, data }: { month: string; data: BudgetFormData }) => {
      const response = await fetch("/api/budgets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          month,
          ...data,
        }),
      });

      if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error || "Failed to save budgets");
      }

      const { budgets } = await response.json();
      return budgets as Budget[];
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: budgetKeys.list(variables.month) });
      toast.success("Budgets saved successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to save budgets");
    },
  });
}

// Copy budgets mutation
export function useCopyBudgets() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ fromMonth, toMonth }: { fromMonth: string; toMonth: string }) => {
      const response = await fetch("/api/budgets/copy", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fromMonth, toMonth }),
      });

      if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error || "Failed to copy budgets");
      }

      const { budgets } = await response.json();
      return budgets as Budget[];
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: budgetKeys.list(variables.toMonth) });
      toast.success("Budgets copied successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to copy budgets");
    },
  });
}

