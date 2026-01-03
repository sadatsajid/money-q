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
    <div className="flex items-center justify-between rounded-lg border border-primary-100 bg-primary-50/30 p-4">
      <div className="flex-1">
        <p className="font-medium text-primary-900">{income.source}</p>
        <p className="text-sm text-gray-600">{formatDate(income.date)}</p>
        {income.note && (
          <p className="text-xs text-gray-500">{income.note}</p>
        )}
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-lg font-bold text-primary-700">
            +{formatMoney(income.amount, income.currency)}
          </p>
        </div>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(income)}
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(income.id)}
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      </div>
    </div>
  );
}

