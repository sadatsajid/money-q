import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import type { Budget } from "@/lib/hooks/use-budgets";

interface BudgetAlertsCardProps {
  budgets: Budget[];
}

export function BudgetAlertsCard({ budgets }: BudgetAlertsCardProps) {
  const alertBudgets = budgets
    .filter((b) => b.percentage >= 75)
    .sort((a, b) => b.percentage - a.percentage);

  if (alertBudgets.length === 0) {
    return null;
  }

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-900">
          <AlertCircle className="h-5 w-5" />
          Budget Alerts
        </CardTitle>
        <CardDescription>Categories approaching or exceeding budget limits</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {alertBudgets.map((budget) => (
            <div
              key={budget.id}
              className={`flex items-center justify-between rounded-lg p-3 ${
                budget.percentage >= 100 ? "bg-red-100" : "bg-orange-100"
              }`}
            >
              <div className="flex items-center gap-2">
                <AlertCircle
                  className={`h-5 w-5 ${
                    budget.percentage >= 100 ? "text-red-600" : "text-orange-600"
                  }`}
                />
                <div>
                  <p className="font-semibold text-gray-900">{budget.category.name}</p>
                  <p className="text-sm text-gray-600">
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
        </div>
      </CardContent>
    </Card>
  );
}

