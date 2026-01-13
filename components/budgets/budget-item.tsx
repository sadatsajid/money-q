import { Input } from "@/components/ui/input";
import { AlertCircle } from "lucide-react";
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
    <div className="space-y-2">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-primary-900 text-sm sm:text-base truncate">{category.name}</h3>
            {percentage >= 90 && (
              <AlertCircle
                className={`h-4 w-4 flex-shrink-0 ${
                  percentage >= 100 ? "text-red-500" : "text-orange-500"
                }`}
              />
            )}
          </div>
          {budgetAmount > 0 && (
            <p className="text-xs sm:text-sm text-muted-foreground">
              Spent: ৳{spent.toLocaleString()} / ৳{budgetAmount.toLocaleString()}
              <span
                className={`ml-2 font-semibold ${
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
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm text-muted-foreground">৳</span>
            <Input
              type="text"
              value={budgetInput}
              onChange={(e) => onInputChange(category.id, e.target.value)}
              placeholder="0.00"
              className="w-24 sm:w-32 text-right text-sm sm:text-base"
            />
          </div>
        </div>
      </div>

      {/* Progress bar - Show when budget amount is set */}
      {budgetAmount > 0 && (
        <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-gray-200">
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
      )}
    </div>
  );
}

