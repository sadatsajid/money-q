"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MonthPicker } from "@/components/ui/month-picker";
import { Loader2, Save, Copy, Download } from "lucide-react";
import { formatMoney } from "@/lib/money";
import { getCurrentMonth } from "@/lib/utils";
import { useBudgets, useSaveBudgets, useCopyBudgets } from "@/lib/hooks/use-budgets";
import { useCategories } from "@/lib/hooks/use-categories";
import { PageHeader } from "@/components/dashboard/page-header";
import { BudgetItem } from "@/components/budgets/budget-item";
import { BudgetAlerts } from "@/components/budgets/budget-alerts";
import type { Category, Budget } from "@/types/budgets";

export default function BudgetsPage() {
  const [currentMonth, setCurrentMonth] = useState(getCurrentMonth());
  const [budgetInputs, setBudgetInputs] = useState<{ [key: string]: string }>({});

  // TanStack Query hooks
  const { data: categories = [] } = useCategories();
  const { data: budgets = [], isLoading } = useBudgets(currentMonth);
  const saveBudgets = useSaveBudgets();
  const copyBudgets = useCopyBudgets();

  const saving = saveBudgets.isPending;
  const copying = copyBudgets.isPending;

  // Create a stable serialized key from budgets and categories to detect actual changes
  const budgetsKey = useMemo(
    () => JSON.stringify(budgets.map((b) => ({ categoryId: b.categoryId, amount: b.amount })).sort((a, b) => a.categoryId.localeCompare(b.categoryId))),
    [budgets]
  );
  const categoriesKey = useMemo(
    () => JSON.stringify(categories.map((c) => c.id).sort()),
    [categories]
  );
  const combinedKey = `${budgetsKey}|${categoriesKey}`;
  const prevKeyRef = useRef<string>("");

  // Initialize budget inputs when budgets or categories change
  useEffect(() => {
    // Only update if the actual data has changed (not just array reference)
    if (categories.length > 0 && prevKeyRef.current !== combinedKey) {
      const inputs: { [key: string]: string } = {};
      
      // Set existing budget amounts
      budgets.forEach((budget) => {
        inputs[budget.categoryId] = budget.amount;
      });
      
      // Add categories without budgets
      categories.forEach((cat) => {
        if (!inputs[cat.id]) {
          inputs[cat.id] = "0";
        }
      });
      
      setBudgetInputs(inputs);
      prevKeyRef.current = combinedKey;
    }
  }, [combinedKey, budgets, categories]);

  const handleInputChange = (categoryId: string, value: string) => {
    // Allow only numbers and decimals
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setBudgetInputs((prev) => ({ ...prev, [categoryId]: value }));
    }
  };

  const handleSaveBudgets = () => {
    const budgetsToSave = Object.entries(budgetInputs)
      .filter(([_, amount]) => parseFloat(amount) > 0)
      .map(([categoryId, amount]) => ({
        categoryId,
        amount: parseFloat(amount).toString(),
      }));

    saveBudgets.mutate({
      month: currentMonth,
      data: { budgets: budgetsToSave },
    });
  };

  const copyFromPreviousMonth = () => {
    const [year, month] = currentMonth.split("-");
    const prevDate = new Date(parseInt(year), parseInt(month) - 2, 1);
    const prevMonth = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, "0")}`;

    copyBudgets.mutate({
      fromMonth: prevMonth,
      toMonth: currentMonth,
    });
  };

  const handleExport = () => {
    const url = `/api/export?type=budgets&month=${currentMonth}`;
    window.open(url, "_blank");
  };

  // Calculate totals for summary
  const totalBudget = Object.values(budgetInputs).reduce(
    (sum, amount) => sum + parseFloat(amount || "0"),
    0
  );
  const totalSpent = budgets.reduce(
    (sum, budget) => sum + parseFloat(budget.spent || "0"),
    0
  );
  const remaining = totalBudget - totalSpent;
  const budgetPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Budgets"
        description="Set and track your monthly spending limits"
        actions={
          !saving ? (
            <>
              <Button variant="outline" onClick={handleExport} className="flex-shrink-0">
                <Download className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Export CSV</span>
              </Button>
              <Button
                variant="outline"
                onClick={copyFromPreviousMonth}
                loading={copying}
                disabled={saving}
                className="flex-shrink-0"
              >
                <Copy className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Copy from Last Month</span>
                <span className="sm:hidden">Copy</span>
              </Button>
            </>
          ) : undefined
        }
      />

      {/* Total Summary Card */}
      <Card className="border-primary-200 bg-gradient-to-br from-primary-50 to-emerald-50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm text-gray-600 mb-1">Total Budget</p>
              <p className="text-3xl font-bold text-primary-700">
                {formatMoney(totalBudget, "BDT")}
              </p>
              <div className="mt-3 flex items-center gap-4 text-xs text-gray-600">
                <div>
                  <span className="text-gray-500">Spent: </span>
                  <span className="font-medium">{formatMoney(totalSpent, "BDT")}</span>
                </div>
                <div>
                  <span className="text-gray-500">Remaining: </span>
                  <span className={`font-medium ${remaining < 0 ? "text-red-600" : "text-emerald-600"}`}>
                    {formatMoney(remaining, "BDT")}
                  </span>
                </div>
              </div>
            </div>
            <div className="rounded-full bg-primary-100 p-3">
              <svg
                className="h-8 w-8 text-primary-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
          </div>
          {totalBudget > 0 && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                <span>Budget Usage</span>
                <span className="font-medium">{Math.round(budgetPercentage)}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                <div
                  className={`h-full rounded-full transition-all ${
                    budgetPercentage >= 100
                      ? "bg-red-500"
                      : budgetPercentage >= 75
                      ? "bg-orange-500"
                      : "bg-primary-600"
                  }`}
                  style={{ width: `${Math.min(budgetPercentage, 100)}%` }}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Month Filter */}
      <div className="flex items-center gap-4">
        <div className="w-full sm:w-auto sm:min-w-[200px]">
          <label className="text-sm font-medium text-gray-700 mb-1.5 block">
            Select Month
          </label>
          <MonthPicker
            value={currentMonth}
            onChange={setCurrentMonth}
            className="w-full"
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Category Budgets</CardTitle>
          <CardDescription>
            Set budget limits for each category and track your spending
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {categories.map((category) => {
              const budget = budgets.find((b) => b.categoryId === category.id);
              return (
                <BudgetItem
                  key={category.id}
                  category={category}
                  budget={budget}
                  budgetInput={budgetInputs[category.id] || ""}
                  onInputChange={handleInputChange}
                />
              );
            })}
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <Button onClick={handleSaveBudgets} loading={saving}>
              <Save className="mr-2 h-4 w-4" />
              Save Budgets
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Alert Summary */}
      {budgets.length > 0 && <BudgetAlerts budgets={budgets} />}
    </div>
  );
}

