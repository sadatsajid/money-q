"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MonthPicker } from "@/components/ui/month-picker";
import { Loader2, Save, Copy } from "lucide-react";
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
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
            <MonthPicker
              value={currentMonth}
              onChange={setCurrentMonth}
              className="w-full sm:w-40 flex-shrink-0"
            />
            <Button
              variant="outline"
              onClick={copyFromPreviousMonth}
              loading={copying}
              disabled={saving}
              className="flex-shrink-0 w-full sm:w-auto"
            >
              <Copy className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Copy from Last Month</span>
              <span className="sm:hidden">Copy from Last Month</span>
            </Button>
          </div>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Category Budgets</CardTitle>
          <CardDescription>
            Set budget limits for each category and track your spending
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
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

