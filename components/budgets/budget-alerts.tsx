import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { formatMoney } from "@/lib/money";
import type { Budget } from "@/types/budgets";

interface BudgetAlertsProps {
  budgets: Budget[];
}

export function BudgetAlerts({ budgets }: BudgetAlertsProps) {
  const alertBudgets = budgets
    .filter((b) => b.percentage >= 75)
    .sort((a, b) => b.percentage - a.percentage);

  if (alertBudgets.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget Alerts</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {alertBudgets.map((budget) => (
            <div
              key={budget.id}
              className={`flex items-center justify-between rounded-lg p-3 ${
                budget.percentage >= 100 ? "bg-red-50" : "bg-orange-50"
              }`}
            >
              <div className="flex items-center gap-2">
                <AlertCircle
                  className={`h-5 w-5 ${
                    budget.percentage >= 100 ? "text-red-500" : "text-orange-500"
                  }`}
                />
                <div>
                  <p className="font-semibold text-primary-900">
                    {budget.category.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    ৳{parseFloat(budget.spent).toLocaleString()} of ৳
                    {parseFloat(budget.amount).toLocaleString()}
                  </p>
                </div>
              </div>
              <div
                className={`text-lg font-bold ${
                  budget.percentage >= 100 ? "text-red-600" : "text-orange-600"
                }`}
              >
                {Math.round(budget.percentage)}%
              </div>
            </div>
          ))}

          {alertBudgets.length === 0 && (
            <p className="text-center text-muted-foreground">
              No budget alerts. Great job! 🎉
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

