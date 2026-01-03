import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { QUERY_TIME } from "@/lib/constants/query";

export type RecurringExpense = {
  id: string;
  name: string;
  categoryId: string;
  amount: string;
  currency: string;
  frequency: string;
  startDate: string;
  endDate?: string | null;
  autoAdd: boolean;
  lastProcessedMonth?: string | null;
  category: {
    id: string;
    name: string;
    icon?: string | null;
    color?: string | null;
  };
  expenses: Array<{
    id: string;
    date: string;
    amount: string;
  }>;
};

type RecurringFormData = {
  name: string;
  categoryId: string;
  amount: string;
  currency: string;
  frequency: string;
  startDate: string;
  endDate?: string | null;
  autoAdd: boolean;
};

// Query key factory
export const recurringKeys = {
  all: ["recurring"] as const,
  lists: () => [...recurringKeys.all, "list"] as const,
  details: () => [...recurringKeys.all, "detail"] as const,
  detail: (id: string) => [...recurringKeys.details(), id] as const,
};

// Fetch recurring expenses
export function useRecurringExpenses() {
  return useQuery({
    queryKey: recurringKeys.lists(),
    queryFn: async () => {
      const response = await fetch("/api/recurring");
      if (!response.ok) {
        throw new Error("Failed to fetch recurring expenses");
      }
      const { recurringExpenses } = await response.json();
      return recurringExpenses as RecurringExpense[];
    },
    staleTime: QUERY_TIME.SHORT,
  });
}

// Create recurring expense mutation
export function useCreateRecurringExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: RecurringFormData) => {
      const response = await fetch("/api/recurring", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          endDate: data.endDate || null,
        }),
      });

      if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error || "Failed to create recurring expense");
      }

      const { recurringExpense } = await response.json();
      return recurringExpense as RecurringExpense;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recurringKeys.lists() });
      toast.success("Recurring expense added successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to add recurring expense");
    },
  });
}

// Update recurring expense mutation
export function useUpdateRecurringExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: RecurringFormData }) => {
      const response = await fetch(`/api/recurring/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          endDate: data.endDate || null,
        }),
      });

      if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error || "Failed to update recurring expense");
      }

      const { recurringExpense } = await response.json();
      return recurringExpense as RecurringExpense;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recurringKeys.lists() });
      toast.success("Recurring expense updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update recurring expense");
    },
  });
}

// Delete recurring expense mutation
export function useDeleteRecurringExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/recurring/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete recurring expense");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recurringKeys.lists() });
      toast.success("Recurring expense deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete recurring expense");
    },
  });
}

