import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatMoney } from "@/lib/money";
import type { Summary } from "@/lib/hooks/use-summary";

interface ExpenseBreakdownProps {
  summary: Summary | undefined;
}

export function ExpenseBreakdown({ summary }: ExpenseBreakdownProps) {
  const monthlyRecurring = parseFloat(summary?.monthlyRecurringExpenses || "0");
  const recurringExpensesTotal = parseFloat(summary?.recurringExpensesTotal || "0");
  const variableExpensesTotal = parseFloat(summary?.variableExpensesTotal || "0");
  const totalExpensesWithRecurring = parseFloat(summary?.totalExpensesWithRecurring || "0");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Expense Breakdown</CardTitle>
        <CardDescription>Fixed vs Variable</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Scheduled Recurring</span>
            <span className="text-sm font-semibold text-orange-600">
              {formatMoney(monthlyRecurring, "BDT")}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Recurring / Fixed</span>
            <span className="text-sm font-semibold">
              {formatMoney(recurringExpensesTotal, "BDT")}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Variable</span>
            <span className="text-sm font-semibold">
              {formatMoney(variableExpensesTotal, "BDT")}
            </span>
          </div>
          <div className="pt-2 border-t">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">Total Expenses</span>
              <span className="text-sm font-bold text-red-600">
                {formatMoney(totalExpensesWithRecurring, "BDT")}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

