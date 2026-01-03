"use client";

import { useState, useEffect } from "react";
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

  // Initialize budget inputs when budgets or categories change
  useEffect(() => {
    if (categories.length > 0) {
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
    }
  }, [budgets, categories]);

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
          <>
            <MonthPicker
              value={currentMonth}
              onChange={setCurrentMonth}
              className="w-32 sm:w-40 flex-shrink-0"
            />
            <Button
              variant="outline"
              onClick={copyFromPreviousMonth}
              loading={copying}
              disabled={saving}
              className="flex-shrink-0"
            >
              <Copy className="h-4 w-4" />
              <span className="ml-2 hidden sm:inline">Copy from Last Month</span>
              <span className="ml-2 sm:hidden">Copy</span>
            </Button>
          </>
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

