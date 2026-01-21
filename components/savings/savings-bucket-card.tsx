import { Button } from "@/components/ui/button";
import { Edit2, Trash2, Target, Calendar } from "lucide-react";
import { formatMoney } from "@/lib/money";
import { formatDate } from "@/lib/utils";
import { calculateProgress } from "@/lib/utils/savings";
import type { SavingsBucket } from "@/lib/hooks/use-savings";

interface SavingsBucketCardProps {
  bucket: SavingsBucket;
  onEdit: (bucket: SavingsBucket) => void;
  onDelete: (id: string) => void;
}

export function SavingsBucketCard({
  bucket,
  onEdit,
  onDelete,
}: SavingsBucketCardProps) {
  const progress = bucket.targetAmount ? calculateProgress(bucket) : null;
  
  return (
    <div className="group flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 transition-all hover:border-primary-200 hover:shadow-sm gap-3">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="flex-shrink-0 rounded-lg bg-primary-100 p-2.5">
          <Target className="h-5 w-5 text-primary-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-semibold text-gray-900 truncate">{bucket.name}</p>
            {bucket.autoDistributePercent && (
              <span className="flex-shrink-0 text-xs bg-primary-50 text-primary-700 px-2 py-0.5 rounded">
                Auto {bucket.autoDistributePercent}%
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-500 mb-1">
            <span className="truncate">{bucket.type}</span>
            {bucket.targetDate && (
              <>
                <span>·</span>
                <span className="flex items-center gap-1 flex-shrink-0">
                  <Calendar className="h-3 w-3" />
                  {formatDate(bucket.targetDate)}
                </span>
              </>
            )}
          </div>
          {bucket.targetAmount && progress !== null && (
            <div className="mt-1.5">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-gray-500">Progress</span>
                <span className="font-medium text-primary-600">{progress.toFixed(1)}%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full rounded-full bg-primary-600 transition-all"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="text-right">
          <p className="text-lg font-bold text-primary-700">
            {formatMoney(bucket.currentBalance, "BDT")}
          </p>
          {bucket.targetAmount && (
            <p className="text-xs text-gray-500">
              Goal: {formatMoney(bucket.targetAmount, "BDT")}
            </p>
          )}
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(bucket)}
            className="h-8 w-8 hover:bg-gray-100"
          >
            <Edit2 className="h-4 w-4 text-gray-600" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(bucket.id)}
            className="h-8 w-8 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      </div>
    </div>
  );
}

