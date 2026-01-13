import { Button } from "@/components/ui/button";
import { Edit2, Trash2 } from "lucide-react";
import { formatMoney } from "@/lib/money";
import { formatDate } from "@/lib/utils";
import type { Expense } from "@/lib/hooks/use-expenses";

interface ExpenseItemProps {
  expense: Expense;
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
}

export function ExpenseItem({ expense, onEdit, onDelete }: ExpenseItemProps) {
  return (
    <div className="flex items-center justify-between rounded-lg border p-3 sm:p-4 hover:bg-gray-50 gap-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 sm:gap-3">
          <div
            className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg flex-shrink-0"
            style={{ backgroundColor: expense.category.color || "#gray" }}
          />
          <div className="min-w-0 flex-1">
            <p className="font-medium text-sm sm:text-base truncate">{expense.merchant}</p>
            <p className="text-xs sm:text-sm text-gray-500 truncate">
              {expense.category.name} · {formatDate(expense.date)} ·{" "}
              {expense.paymentMethod.name}
            </p>
            {expense.note && (
              <p className="text-xs text-gray-400 truncate">{expense.note}</p>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
        <div className="text-right">
          <p className="font-semibold text-sm sm:text-base">
            {formatMoney(expense.amountInBDT, "BDT")}
          </p>
          {expense.currency !== "BDT" && (
            <p className="text-xs text-gray-500">
              {formatMoney(expense.amount, expense.currency)}
            </p>
          )}
        </div>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(expense)}
            disabled={expense.isRecurring}
            className="h-8 w-8 sm:h-10 sm:w-10"
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(expense.id)}
            className="h-8 w-8 sm:h-10 sm:w-10"
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      </div>
    </div>
  );
}

