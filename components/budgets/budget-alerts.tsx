import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
        <CardDescription>
          Categories that are approaching or exceeding their budget limits
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {alertBudgets.map((budget) => (
            <div
              key={budget.id}
              className={`flex items-center justify-between rounded-lg border p-4 transition-all ${
                budget.percentage >= 100
                  ? "border-red-200 bg-red-50"
                  : "border-orange-200 bg-orange-50"
              }`}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div
                  className="h-10 w-10 rounded-lg flex-shrink-0 flex items-center justify-center"
                  style={{ backgroundColor: budget.category.color || "#gray" }}
                >
                  <AlertCircle
                    className={`h-5 w-5 ${
                      budget.percentage >= 100 ? "text-red-600" : "text-orange-600"
                    }`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">
                    {budget.category.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    {formatMoney(parseFloat(budget.spent), "BDT")} of {formatMoney(parseFloat(budget.amount), "BDT")}
                  </p>
                </div>
              </div>
              <div
                className={`text-xl font-bold flex-shrink-0 ${
                  budget.percentage >= 100 ? "text-red-600" : "text-orange-600"
                }`}
              >
                {Math.round(budget.percentage)}%
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

