import { Button } from "@/components/ui/button";
import { Edit2, Trash2, RefreshCw, Calendar } from "lucide-react";
import { formatMoney } from "@/lib/money";
import { formatDate } from "@/lib/utils";
import type { RecurringExpense } from "@/lib/hooks/use-recurring";

interface RecurringExpenseCardProps {
  recurring: RecurringExpense;
  onEdit: (recurring: RecurringExpense) => void;
  onDelete: (id: string) => void;
}

const frequencyLabels = {
  WEEKLY: "Weekly",
  MONTHLY: "Monthly",
  YEARLY: "Yearly",
};

export function RecurringExpenseCard({
  recurring,
  onEdit,
  onDelete,
}: RecurringExpenseCardProps) {
  const frequencyLabel = frequencyLabels[recurring.frequency as keyof typeof frequencyLabels] || recurring.frequency;
  
  return (
    <div className="group flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 transition-all hover:border-primary-200 hover:shadow-sm gap-3">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div
          className="h-10 w-10 rounded-lg flex-shrink-0"
          style={{ backgroundColor: recurring.category.color || "#gray" }}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-semibold text-gray-900 truncate">{recurring.name}</p>
            {recurring.autoAdd && (
              <RefreshCw className="h-3.5 w-3.5 text-primary-600 flex-shrink-0" />
            )}
          </div>
          <div className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-500">
            <span className="truncate">{recurring.category.name}</span>
            <span>·</span>
            <span className="flex-shrink-0">{frequencyLabel}</span>
            <span>·</span>
            <span className="flex items-center gap-1 flex-shrink-0">
              <Calendar className="h-3 w-3" />
              {formatDate(recurring.startDate)}
            </span>
            {recurring.endDate && (
              <>
                <span>→</span>
                <span className="flex-shrink-0">{formatDate(recurring.endDate)}</span>
              </>
            )}
          </div>
          {recurring.lastProcessedMonth && (
            <p className="text-xs text-gray-400 mt-1">
              Last processed: {recurring.lastProcessedMonth}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="text-right">
          <p className="text-lg font-bold text-primary-700">
            {formatMoney(recurring.amount, recurring.currency)}
          </p>
          <p className="text-xs text-gray-500">{frequencyLabel}</p>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(recurring)}
            className="h-8 w-8 hover:bg-gray-100"
          >
            <Edit2 className="h-4 w-4 text-gray-600" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(recurring.id)}
            className="h-8 w-8 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      </div>
    </div>
  );
}

