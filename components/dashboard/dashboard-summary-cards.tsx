import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Wallet, Repeat, ShoppingCart } from "lucide-react";
import { formatMoney } from "@/lib/money";
import type { Summary } from "@/lib/hooks/use-summary";

interface DashboardSummaryCardsProps {
  summary: Summary | undefined;
}

export function DashboardSummaryCards({ summary }: DashboardSummaryCardsProps) {
  const income = parseFloat(summary?.totalIncome || "0");
  const monthlyRecurring = parseFloat(summary?.monthlyRecurringExpenses || "0");
  const variableExpenses = parseFloat(summary?.variableExpensesTotal || "0");
  const totalExpensesWithRecurring = parseFloat(summary?.totalExpensesWithRecurring || "0");
  const netSavings = parseFloat(summary?.netSavingsWithRecurring || "0");
  const savingsRate = parseFloat(summary?.savingsRateWithRecurring || "0");

  return (
    <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium">Total Income</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-600 flex-shrink-0" />
        </CardHeader>
        <CardContent>
          <div className="text-xl sm:text-2xl font-bold text-green-600">
            {formatMoney(income, "BDT")}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {summary?.incomeCount || 0} entries
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium">Total Expenses</CardTitle>
          <TrendingDown className="h-4 w-4 text-red-600 flex-shrink-0" />
        </CardHeader>
        <CardContent>
          <div className="text-xl sm:text-2xl font-bold text-red-600">
            {formatMoney(totalExpensesWithRecurring, "BDT")}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {summary?.expenseCount || 0} transactions
            {monthlyRecurring > 0 && (
              <span className="block mt-1">
                + {formatMoney(monthlyRecurring, "BDT")} recurring
              </span>
            )}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium">Variable Expenses</CardTitle>
          <ShoppingCart className="h-4 w-4 text-blue-600 flex-shrink-0" />
        </CardHeader>
        <CardContent>
          <div className="text-xl sm:text-2xl font-bold text-blue-600">
            {formatMoney(variableExpenses, "BDT")}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Excludes recurring
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium">Monthly Recurring</CardTitle>
          <Repeat className="h-4 w-4 text-orange-600 flex-shrink-0" />
        </CardHeader>
        <CardContent>
          <div className="text-xl sm:text-2xl font-bold text-orange-600">
            {formatMoney(monthlyRecurring, "BDT")}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Scheduled expenses
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium">Net Savings</CardTitle>
          <Wallet className="h-4 w-4 text-primary-600 flex-shrink-0" />
        </CardHeader>
        <CardContent>
          <div className={`text-xl sm:text-2xl font-bold ${netSavings >= 0 ? "text-primary-600" : "text-red-600"}`}>
            {formatMoney(netSavings, "BDT")}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {savingsRate.toFixed(1)}% savings rate
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

