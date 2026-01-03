import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Edit2, Trash2, RefreshCw } from "lucide-react";
import { formatMoney } from "@/lib/money";
import { formatDate } from "@/lib/utils";
import type { RecurringExpense } from "@/lib/hooks/use-recurring";

interface RecurringExpenseCardProps {
  recurring: RecurringExpense;
  onEdit: (recurring: RecurringExpense) => void;
  onDelete: (id: string) => void;
}

export function RecurringExpenseCard({
  recurring,
  onEdit,
  onDelete,
}: RecurringExpenseCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className="h-10 w-10 rounded-lg"
              style={{ backgroundColor: recurring.category.color || "#gray" }}
            />
            <div>
              <CardTitle className="text-lg">{recurring.name}</CardTitle>
              <CardDescription>
                {recurring.category.name} · {recurring.frequency}
              </CardDescription>
            </div>
          </div>
          {recurring.autoAdd && (
            <RefreshCw className="h-4 w-4 text-primary-600" />
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Amount</span>
            <span className="font-semibold">
              {formatMoney(recurring.amount, recurring.currency)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Start Date</span>
            <span className="text-sm">{formatDate(recurring.startDate)}</span>
          </div>
          {recurring.endDate && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">End Date</span>
              <span className="text-sm">{formatDate(recurring.endDate)}</span>
            </div>
          )}
          {recurring.lastProcessedMonth && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Last Processed</span>
              <span className="text-sm">{recurring.lastProcessedMonth}</span>
            </div>
          )}
          {recurring.expenses.length > 0 && (
            <div className="border-t pt-3">
              <p className="mb-2 text-xs font-medium text-gray-500">
                Recent Transactions ({recurring.expenses.length})
              </p>
              <div className="space-y-1">
                {recurring.expenses.slice(0, 3).map((exp) => (
                  <div key={exp.id} className="flex justify-between text-xs">
                    <span>{formatDate(exp.date)}</span>
                    <span>{formatMoney(exp.amount, recurring.currency)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(recurring)}
              className="flex-1"
            >
              <Edit2 className="mr-2 h-3 w-3" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(recurring.id)}
              className="flex-1"
            >
              <Trash2 className="mr-2 h-3 w-3 text-red-500" />
              Delete
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

