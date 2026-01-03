import type { Expense } from "@/lib/hooks/use-expenses";

export function filterExpenses(
  expenses: Expense[],
  searchTerm: string
): Expense[] {
  return expenses.filter(
    (expense) =>
      expense.merchant.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
}

