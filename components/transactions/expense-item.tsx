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
    <div className="flex items-center justify-between rounded-lg border p-4 hover:bg-gray-50">
      <div className="flex-1">
        <div className="flex items-center gap-3">
          <div
            className="h-10 w-10 rounded-lg"
            style={{ backgroundColor: expense.category.color || "#gray" }}
          />
          <div>
            <p className="font-medium">{expense.merchant}</p>
            <p className="text-sm text-gray-500">
              {expense.category.name} · {formatDate(expense.date)} ·{" "}
              {expense.paymentMethod.name}
            </p>
            {expense.note && (
              <p className="text-xs text-gray-400">{expense.note}</p>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="font-semibold">
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
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(expense.id)}
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      </div>
    </div>
  );
}

