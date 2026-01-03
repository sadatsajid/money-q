import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Edit2, Trash2, Target } from "lucide-react";
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
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{bucket.name}</CardTitle>
            <CardDescription>{bucket.type}</CardDescription>
          </div>
          {bucket.targetAmount && (
            <Target className="h-5 w-5 text-primary-600" />
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-2xl font-bold text-primary-700">
              {formatMoney(bucket.currentBalance, "BDT")}
            </p>
            {bucket.targetAmount && (
              <p className="text-sm text-gray-500">
                Goal: {formatMoney(bucket.targetAmount, "BDT")}
              </p>
            )}
          </div>

          {bucket.targetAmount && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{calculateProgress(bucket).toFixed(1)}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full rounded-full bg-primary-600"
                  style={{ width: `${calculateProgress(bucket)}%` }}
                />
              </div>
            </div>
          )}

          {bucket.targetDate && (
            <p className="text-xs text-gray-500">
              Target: {formatDate(bucket.targetDate)}
            </p>
          )}

          {bucket.autoDistributePercent && (
            <div className="rounded-lg bg-primary-50 p-2">
              <p className="text-xs text-primary-700">
                Auto: {bucket.autoDistributePercent}% of savings
              </p>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(bucket)}
              className="flex-1"
            >
              <Edit2 className="mr-2 h-3 w-3" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(bucket.id)}
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

