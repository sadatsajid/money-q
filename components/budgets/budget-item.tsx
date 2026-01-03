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
  const percentage = budgetAmount > 0 ? (spent / budgetAmount) * 100 : 0;
  const alertLevel = getAlertLevel(percentage);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-primary-900">{category.name}</h3>
            {percentage >= 90 && (
              <AlertCircle
                className={`h-4 w-4 ${
                  percentage >= 100 ? "text-red-500" : "text-orange-500"
                }`}
              />
            )}
          </div>
          {budget && (
            <p className="text-sm text-muted-foreground">
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
              value={budgetInput}
              onChange={(e) => onInputChange(category.id, e.target.value)}
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
}

