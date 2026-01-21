"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { getCurrentMonth, getMonthName } from "@/lib/utils";
import { useSummary } from "@/lib/hooks/use-summary";
import { useBudgets } from "@/lib/hooks/use-budgets";
import { MonthPicker } from "@/components/ui/month-picker";
import { PageHeader } from "@/components/dashboard/page-header";
import { DashboardSummaryCards } from "@/components/dashboard/dashboard-summary-cards";
import { SpendingByCategoryChart } from "@/components/dashboard/spending-by-category-chart";
import { ExpenseBreakdown } from "@/components/dashboard/expense-breakdown";
import { CategoryBreakdown } from "@/components/dashboard/category-breakdown";
import { BudgetAlertsCard } from "@/components/dashboard/budget-alerts-card";
import { ExpensePieChart } from "@/components/dashboard/expense-pie-chart";

export default function DashboardPage() {
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());

  // TanStack Query hooks
  const { data: summary, isLoading: summaryLoading } = useSummary(selectedMonth);
  const { data: budgets = [] } = useBudgets(selectedMonth);

  if (summaryLoading && !summary) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  // Prepare chart data
  const topCategories = (summary?.expensesByCategory || [])
    .sort((a, b) => parseFloat(b.total) - parseFloat(a.total))
    .slice(0, 6);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        actions={
          <MonthPicker
            value={selectedMonth}
            onChange={setSelectedMonth}
            className="w-full sm:w-auto flex-shrink-0"
          />
        }
      />

      <DashboardSummaryCards summary={summary} />

      <BudgetAlertsCard budgets={budgets} />

      <div className="grid gap-6 lg:grid-cols-2">
        <SpendingByCategoryChart categories={topCategories} />
        <ExpensePieChart
          categories={topCategories}
          totalExpenses={summary?.totalExpenses || "0"}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <ExpenseBreakdown summary={summary} />
        <CategoryBreakdown categories={topCategories} />
      </div>

      {!summary?.expenseCount && !summary?.incomeCount && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-sm text-gray-500">
              No transactions for this month yet. Start adding income and expenses!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

