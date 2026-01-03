"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, TrendingUp, TrendingDown, Wallet, AlertCircle } from "lucide-react";
import { MonthPicker } from "@/components/ui/month-picker";
import { formatMoney } from "@/lib/money";
import { getCurrentMonth, getMonthName } from "@/lib/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useSummary, type Summary } from "@/lib/hooks/use-summary";
import { useBudgets, type Budget } from "@/lib/hooks/use-budgets";

export default function DashboardPage() {
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());

  // TanStack Query hooks
  const { data: summary, isLoading: summaryLoading } = useSummary(selectedMonth);
  const { data: budgets = [] } = useBudgets(selectedMonth);

  const loading = summaryLoading;

  if (loading && !summary) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  const income = parseFloat(summary?.totalIncome || "0");
  const expenses = parseFloat(summary?.totalExpenses || "0");
  const netSavings = parseFloat(summary?.netSavings || "0");
  const savingsRate = parseFloat(summary?.savingsRate || "0");

  // Prepare chart data
  const topCategories = (summary?.expensesByCategory || [])
    .sort((a, b) => parseFloat(b.total) - parseFloat(a.total))
    .slice(0, 6);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500">
            {summary ? getMonthName(summary.month) : "Welcome back!"}
          </p>
        </div>
        <Input
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="w-48"
        />
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatMoney(income, "BDT")}
            </div>
            <p className="text-xs text-muted-foreground">
              {summary?.incomeCount || 0} entries
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatMoney(expenses, "BDT")}
            </div>
            <p className="text-xs text-muted-foreground">
              {summary?.expenseCount || 0} transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Savings</CardTitle>
            <Wallet className="h-4 w-4 text-primary-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netSavings >= 0 ? "text-primary-600" : "text-red-600"}`}>
              {formatMoney(netSavings, "BDT")}
            </div>
            <p className="text-xs text-muted-foreground">
              {savingsRate.toFixed(1)}% savings rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown Chart */}
      {topCategories.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Spending by Category</CardTitle>
            <CardDescription>Top expense categories this month</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topCategories}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="categoryName"
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <Tooltip
                  formatter={(value: number) => formatMoney(value, "BDT")}
                />
                <Bar dataKey="total" fill="#16a34a" name="Amount" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Expense Breakdown */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Expense Breakdown</CardTitle>
            <CardDescription>Fixed vs Variable</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Recurring / Fixed</span>
                <span className="text-sm font-semibold">
                  {formatMoney(
                    parseFloat(summary?.recurringExpensesTotal || "0"),
                    "BDT"
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Variable</span>
                <span className="text-sm font-semibold">
                  {formatMoney(
                    parseFloat(summary?.variableExpensesTotal || "0"),
                    "BDT"
                  )}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Category Breakdown</CardTitle>
            <CardDescription>Top 5 categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topCategories.slice(0, 5).map((category) => (
                <div key={category.categoryId} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span>{category.categoryName}</span>
                    <span className="font-medium">
                      {formatMoney(parseFloat(category.total), "BDT")}
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                    <div
                      className="h-full rounded-full bg-primary-600"
                      style={{ width: `${category.percentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    {category.percentage.toFixed(1)}% of total
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Budget Alerts */}
      {budgets.filter((b) => b.percentage >= 75).length > 0 && (
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
              {budgets
                .filter((b) => b.percentage >= 75)
                .sort((a, b) => b.percentage - a.percentage)
                .map((budget) => (
                  <div
                    key={budget.id}
                    className={`flex items-center justify-between rounded-lg p-3 ${budget.percentage >= 100 ? "bg-red-100" : "bg-orange-100"
                      }`}
                  >
                    <div className="flex items-center gap-2">
                      <AlertCircle
                        className={`h-5 w-5 ${budget.percentage >= 100 ? "text-red-600" : "text-orange-600"
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
                      className={`text-lg font-bold ${budget.percentage >= 100 ? "text-red-600" : "text-orange-600"
                        }`}
                    >
                      {Math.round(budget.percentage)}%
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {!summary?.expenseCount && !summary?.incomeCount && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-sm text-gray-500">
              No transactions for this month yet. Start adding income and expenses!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

