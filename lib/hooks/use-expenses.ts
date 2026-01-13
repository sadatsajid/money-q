import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export type Category = {
  id: string;
  name: string;
  icon?: string | null;
  color?: string | null;
};

export type PaymentMethod = {
  id: string;
  name: string;
  type: string;
};

export type Expense = {
  id: string;
  date: string;
  merchant: string;
  categoryId: string;
  amount: string;
  currency: string;
  amountInBDT: string;
  paymentMethodId: string;
  note?: string | null;
  category: Category;
  paymentMethod: PaymentMethod;
  isRecurring: boolean;
};

type ExpenseFormData = {
  date: string;
  merchant: string;
  categoryId: string;
  amount: string;
  currency: string;
  paymentMethodId: string;
  note?: string;
};

// Query key factory
export const expenseKeys = {
  all: ["expenses"] as const,
  lists: () => [...expenseKeys.all, "list"] as const,
  list: (month: string, categoryId?: string) => 
    [...expenseKeys.lists(), month, categoryId || "all"] as const,
  details: () => [...expenseKeys.all, "detail"] as const,
  detail: (id: string) => [...expenseKeys.details(), id] as const,
};

// Fetch expenses
export function useExpenses(month: string, categoryId?: string) {
  return useQuery({
    queryKey: expenseKeys.list(month, categoryId),
    queryFn: async () => {
      const params = new URLSearchParams({ month });
      if (categoryId) {
        params.append("categoryId", categoryId);
      }
      const response = await fetch(`/api/expenses?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch expenses");
      }
      const { expenses } = await response.json();
      return expenses as Expense[];
    },
  });
}

// Create expense mutation
export function useCreateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ExpenseFormData) => {
      const response = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error || "Failed to create expense");
      }

      const { expense } = await response.json();
      return expense as Expense;
    },
    onSuccess: (_, variables) => {
      // Invalidate all expense lists to refetch
      queryClient.invalidateQueries({ queryKey: expenseKeys.lists() });
      toast.success("Expense added successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to add expense");
    },
  });
}

// Update expense mutation
export function useUpdateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ExpenseFormData }) => {
      const response = await fetch(`/api/expenses/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error || "Failed to update expense");
      }

      const { expense } = await response.json();
      return expense as Expense;
    },
    onSuccess: () => {
      // Invalidate all expense lists to refetch
      queryClient.invalidateQueries({ queryKey: expenseKeys.lists() });
      toast.success("Expense updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update expense");
    },
  });
}

// Delete expense mutation
export function useDeleteExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/expenses/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete expense");
      }
    },
    onSuccess: () => {
      // Invalidate all expense lists to refetch
      queryClient.invalidateQueries({ queryKey: expenseKeys.lists() });
      toast.success("Expense deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete expense");
    },
  });
}

