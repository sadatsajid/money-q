import { Button } from "@/components/ui/button";
import { Edit2, Trash2 } from "lucide-react";
import { formatMoney } from "@/lib/money";
import { formatDate } from "@/lib/utils";
import type { Income } from "@/lib/hooks/use-income";

interface IncomeItemProps {
  income: Income;
  onEdit: (income: Income) => void;
  onDelete: (id: string) => void;
}

export function IncomeItem({ income, onEdit, onDelete }: IncomeItemProps) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-primary-100 bg-primary-50/30 p-3 sm:p-4 gap-3">
      <div className="flex-1 min-w-0">
        <p className="font-medium text-primary-900 truncate">{income.source}</p>
        <p className="text-xs sm:text-sm text-gray-600">{formatDate(income.date)}</p>
        {income.note && (
          <p className="text-xs text-gray-500 truncate">{income.note}</p>
        )}
      </div>
      <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
        <div className="text-right">
          <p className="text-base sm:text-lg font-bold text-primary-700">
            +{formatMoney(income.amount, income.currency)}
          </p>
        </div>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(income)}
            className="h-8 w-8 sm:h-10 sm:w-10"
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(income.id)}
            className="h-8 w-8 sm:h-10 sm:w-10"
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      </div>
    </div>
  );
}

