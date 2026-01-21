import { Input } from "@/components/ui/input";
import { AlertCircle } from "lucide-react";
import { formatMoney } from "@/lib/money";
import type { Category, Budget } from "@/types/budgets";
import { getAlertLevel, getProgressColor } from "@/lib/utils/budgets";

interface BudgetItemProps {
  category: Category;
  budget: Budget | undefined;
  budgetInput: string;
  onInputChange: (categoryId: string, value: string) => void;
}

export function BudgetItem({
  category,
  budget,
  budgetInput,
  onInputChange,
}: BudgetItemProps) {
  const spent = parseFloat(budget?.spent || "0");
  const budgetAmount = parseFloat(budgetInput || "0");
  
  // Calculate percentage: handle edge cases where budgetAmount is 0 or spent exceeds budget
  const percentage = budgetAmount > 0 
    ? Math.max(0, (spent / budgetAmount) * 100) 
    : 0;
  
  // Cap percentage at 100% for display, but track if it exceeds
  const displayPercentage = Math.min(percentage, 100);
  const exceedsBudget = percentage > 100;
  const alertLevel = getAlertLevel(percentage);

  return (
    <div className="group flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 transition-all hover:border-primary-200 hover:shadow-sm gap-3">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div
          className="h-10 w-10 rounded-lg flex-shrink-0"
          style={{ backgroundColor: category.color || "#gray" }}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{category.name}</h3>
            {percentage >= 90 && (
              <AlertCircle
                className={`h-4 w-4 flex-shrink-0 ${
                  percentage >= 100 ? "text-red-500" : "text-orange-500"
                }`}
              />
            )}
          </div>
          {budgetAmount > 0 ? (
            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500">
              <span>Spent: {formatMoney(spent, "BDT")}</span>
              <span>·</span>
              <span>Budget: {formatMoney(budgetAmount, "BDT")}</span>
              <span
                className={`ml-1 font-semibold ${
                  alertLevel === "critical"
                    ? "text-red-600"
                    : alertLevel === "danger"
                    ? "text-orange-600"
                    : alertLevel === "warning"
                    ? "text-yellow-600"
                    : "text-green-600"
                }`}
              >
                ({exceedsBudget ? "100+" : Math.round(percentage)}%)
              </span>
            </div>
          ) : (
            <p className="text-xs text-gray-400">No budget set</p>
          )}
          {/* Progress bar - Show when budget amount is set */}
          {budgetAmount > 0 && (
            <div className="mt-2">
              <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${getProgressColor(alertLevel)}`}
                  style={{ 
                    width: `${displayPercentage}%`,
                    minWidth: displayPercentage > 0 ? '2px' : '0px'
                  }}
                  role="progressbar"
                  aria-valuenow={percentage}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${category.name} budget: ${Math.round(percentage)}% spent`}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-sm text-muted-foreground">৳</span>
          <Input
            type="text"
            value={budgetInput}
            onChange={(e) => onInputChange(category.id, e.target.value)}
            placeholder="0.00"
            className="w-24 sm:w-28 text-right text-sm sm:text-base"
          />
        </div>
      </div>
    </div>
  );
}

