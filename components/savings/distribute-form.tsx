import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatMoney } from "@/lib/money";
import { getCurrentMonth } from "@/lib/utils";
import type { SavingsBucket } from "@/lib/hooks/use-savings";
import type { DistributeFormData } from "@/types/savings";

interface DistributeFormProps {
  buckets: SavingsBucket[];
  distributeData: DistributeFormData;
  distributing: boolean;
  onChange: (data: DistributeFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export function DistributeForm({
  buckets,
  distributeData,
  distributing,
  onChange,
  onSubmit,
  onCancel,
}: DistributeFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribute Savings</CardTitle>
        <CardDescription>
          Allocate savings to your buckets for {getCurrentMonth()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          {buckets.map((bucket) => (
            <div key={bucket.id} className="flex items-center gap-4">
              <div className="flex-1">
                <Label htmlFor={`dist-${bucket.id}`}>{bucket.name}</Label>
                <p className="text-xs text-gray-500">
                  Current: {formatMoney(bucket.currentBalance, "BDT")}
                </p>
              </div>
              <Input
                id={`dist-${bucket.id}`}
                type="number"
                step="0.01"
                min="0"
                value={distributeData[bucket.id] || ""}
                onChange={(e) =>
                  onChange({
                    ...distributeData,
                    [bucket.id]: e.target.value,
                  })
                }
                placeholder="0.00"
                className="w-40"
              />
            </div>
          ))}

          <div className="flex gap-2">
            <Button type="submit" loading={distributing}>
              Distribute
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={distributing}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

