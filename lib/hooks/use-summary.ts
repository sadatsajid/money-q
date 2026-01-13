import { useQuery } from "@tanstack/react-query";
import { QUERY_TIME } from "@/lib/constants/query";

export type Summary = {
  month: string;
  totalIncome: string;
  totalExpenses: string;
  netSavings: string;
  savingsRate: string;
  expensesByCategory: Array<{
    categoryId: string;
    categoryName: string;
    total: string;
    percentage: number;
  }>;
  recurringExpensesTotal: string;
  variableExpensesTotal: string;
  monthlyRecurringExpenses: string;
  totalExpensesWithRecurring: string;
  netSavingsWithRecurring: string;
  savingsRateWithRecurring: string;
  incomeCount: number;
  expenseCount: number;
};

// Query key factory
export const summaryKeys = {
  all: ["summary"] as const,
  lists: () => [...summaryKeys.all, "list"] as const,
  list: (month: string) => [...summaryKeys.lists(), month] as const,
};

// Fetch summary
export function useSummary(month: string) {
  return useQuery({
    queryKey: summaryKeys.list(month),
    queryFn: async () => {
      const response = await fetch(`/api/summary?month=${month}`);
      if (!response.ok) {
        throw new Error("Failed to fetch summary");
      }
      const { summary } = await response.json();
      return summary as Summary;
    },
    staleTime: QUERY_TIME.SHORT,
  });
}

