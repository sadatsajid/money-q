"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MonthPicker } from "@/components/ui/month-picker";
import { Loader2, Save, Copy, AlertCircle } from "lucide-react";
import { getCurrentMonth } from "@/lib/utils";
import { useBudgets, useSaveBudgets, useCopyBudgets } from "@/lib/hooks/use-budgets";
import { useCategories } from "@/lib/hooks/use-categories";

interface Category {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
}

interface Budget {
  id: string;
  categoryId: string;
  category: Category;
  amount: string;
  spent: string;
  remaining: string;
  percentage: number;
}

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

  const getAlertLevel = (percentage: number): "safe" | "warning" | "danger" | "critical" => {
    if (percentage < 50) return "safe";
    if (percentage < 75) return "warning";
    if (percentage < 100) return "danger";
    return "critical";
  };

  const getProgressColor = (level: string): string => {
    switch (level) {
      case "safe":
        return "bg-green-500";
      case "warning":
        return "bg-yellow-500";
      case "danger":
        return "bg-orange-500";
      case "critical":
        return "bg-red-500";
      default:
        return "bg-gray-300";
    }
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary-900">Budgets</h1>
          <p className="text-muted-foreground">Set and track your monthly spending limits</p>
        </div>
        
        <div className="flex gap-2">
          <MonthPicker
            value={currentMonth}
            onChange={setCurrentMonth}
            className="w-40"
          />
          <Button
            variant="outline"
            onClick={copyFromPreviousMonth}
            loading={copying}
            disabled={saving}
          >
            <Copy className="h-4 w-4" />
            <span className="ml-2">Copy from Last Month</span>
          </Button>
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
          <div className="space-y-6">
            {categories.map((category) => {
              const budget = budgets.find((b) => b.categoryId === category.id);
              const spent = parseFloat(budget?.spent || "0");
              const budgetAmount = parseFloat(budgetInputs[category.id] || "0");
              const percentage = budgetAmount > 0 ? (spent / budgetAmount) * 100 : 0;
              const alertLevel = getAlertLevel(percentage);

              return (
                <div key={category.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-primary-900">{category.name}</h3>
                        {percentage >= 90 && (
                          <AlertCircle className={`h-4 w-4 ${percentage >= 100 ? "text-red-500" : "text-orange-500"}`} />
                        )}
                      </div>
                      {budget && (
                        <p className="text-sm text-muted-foreground">
                          Spent: ৳{spent.toLocaleString()} / ৳{budgetAmount.toLocaleString()} 
                          <span className={`ml-2 font-semibold ${
                            alertLevel === "critical" ? "text-red-600" : 
                            alertLevel === "danger" ? "text-orange-600" :
                            alertLevel === "warning" ? "text-yellow-600" :
                            "text-green-600"
                          }`}>
                            ({Math.round(percentage)}%)
                          </span>
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">৳</span>
                        <Input
                          type="text"
                          value={budgetInputs[category.id] || ""}
                          onChange={(e) => handleInputChange(category.id, e.target.value)}
                          placeholder="0.00"
                          className="w-32 text-right"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Progress bar */}
                  {budget && budgetAmount > 0 && (
                    <div className="relative h-2 w-full overflow-hidden rounded-full bg-gray-200">
                      <div
                        className={`h-full transition-all duration-300 ${getProgressColor(alertLevel)}`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                  )}
                </div>
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
      {budgets.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Budget Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {budgets
                .filter((b) => b.percentage >= 75)
                .sort((a, b) => b.percentage - a.percentage)
                .map((budget) => (
                  <div
                    key={budget.id}
                    className={`flex items-center justify-between rounded-lg p-3 ${
                      budget.percentage >= 100 ? "bg-red-50" : "bg-orange-50"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <AlertCircle className={`h-5 w-5 ${budget.percentage >= 100 ? "text-red-500" : "text-orange-500"}`} />
                      <div>
                        <p className="font-semibold text-primary-900">{budget.category.name}</p>
                        <p className="text-sm text-muted-foreground">
                          ৳{parseFloat(budget.spent).toLocaleString()} of ৳{parseFloat(budget.amount).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className={`text-lg font-bold ${budget.percentage >= 100 ? "text-red-600" : "text-orange-600"}`}>
                      {Math.round(budget.percentage)}%
                    </div>
                  </div>
                ))}
              
              {budgets.filter((b) => b.percentage >= 75).length === 0 && (
                <p className="text-center text-muted-foreground">No budget alerts. Great job! 🎉</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

