import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { QUERY_TIME } from "@/lib/constants/query";

export type Income = {
  id: string;
  date: string;
  source: string;
  amount: string;
  currency: string;
  note?: string | null;
};

type IncomeFormData = {
  date: string;
  source: string;
  amount: string;
  currency: string;
  note?: string;
};

// Query key factory
export const incomeKeys = {
  all: ["income"] as const,
  lists: () => [...incomeKeys.all, "list"] as const,
  list: (month: string) => [...incomeKeys.lists(), month] as const,
  details: () => [...incomeKeys.all, "detail"] as const,
  detail: (id: string) => [...incomeKeys.details(), id] as const,
};

// Fetch income
export function useIncome(month: string) {
  return useQuery({
    queryKey: incomeKeys.list(month),
    queryFn: async () => {
      const response = await fetch(`/api/income?month=${month}`);
      if (!response.ok) {
        throw new Error("Failed to fetch income");
      }
      const { incomes } = await response.json();
      return incomes as Income[];
    },
    staleTime: QUERY_TIME.SHORT,
  });
}

// Create income mutation
export function useCreateIncome() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: IncomeFormData) => {
      const response = await fetch("/api/income", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error || "Failed to create income");
      }

      const { income } = await response.json();
      return income as Income;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: incomeKeys.lists() });
      toast.success("Income added successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to add income");
    },
  });
}

// Update income mutation
export function useUpdateIncome() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: IncomeFormData }) => {
      const response = await fetch(`/api/income/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error || "Failed to update income");
      }

      const { income } = await response.json();
      return income as Income;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: incomeKeys.lists() });
      toast.success("Income updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update income");
    },
  });
}

// Delete income mutation
export function useDeleteIncome() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/income/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete income");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: incomeKeys.lists() });
      toast.success("Income deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete income");
    },
  });
}

