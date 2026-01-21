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
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-1.5 text-sm font-semibold text-orange-900">
          <AlertCircle className="h-4 w-4" />
          Budget Alerts
        </CardTitle>
        <CardDescription className="text-xs">Categories approaching or exceeding budget limits</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 gap-2">
          {alertBudgets.map((budget) => (
            <div
              key={budget.id}
              className={`flex flex-col rounded-lg p-2 ${
                budget.percentage >= 100 ? "bg-red-100" : "bg-orange-100"
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <AlertCircle
                  className={`h-4 w-4 flex-shrink-0 ${
                    budget.percentage >= 100 ? "text-red-600" : "text-orange-600"
                  }`}
                />
                <p className="text-sm font-semibold text-gray-900 truncate">{budget.category.name}</p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-600">
                  ৳{parseFloat(budget.spent).toLocaleString()} of ৳
                  {parseFloat(budget.amount).toLocaleString()}
                </p>
                <div
                  className={`text-sm font-bold flex-shrink-0 ${
                    budget.percentage >= 100 ? "text-red-600" : "text-orange-600"
                  }`}
                >
                  {Math.round(budget.percentage)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

