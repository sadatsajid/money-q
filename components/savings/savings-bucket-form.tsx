import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SAVINGS_BUCKET_TYPES } from "@/constants/paymentMethods";
import type { SavingsFormData } from "@/types/savings";

interface SavingsBucketFormProps {
  formData: SavingsFormData;
  editingId: string | null;
  submitting: boolean;
  onChange: (data: Partial<SavingsFormData>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export function SavingsBucketForm({
  formData,
  editingId,
  submitting,
  onChange,
  onSubmit,
  onCancel,
}: SavingsBucketFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{editingId ? "Edit" : "Add"} Savings Bucket</CardTitle>
        <CardDescription>
          {editingId ? "Update" : "Create"} a savings goal
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => onChange({ name: e.target.value })}
                placeholder="e.g., Vacation Fund"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select
                id="type"
                value={formData.type}
                onChange={(e) => onChange({ type: e.target.value })}
                required
              >
                {SAVINGS_BUCKET_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetAmount">Target Amount (Optional)</Label>
              <Input
                id="targetAmount"
                type="number"
                step="0.01"
                min="0"
                value={formData.targetAmount}
                onChange={(e) => onChange({ targetAmount: e.target.value })}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetDate">Target Date (Optional)</Label>
              <Input
                id="targetDate"
                type="date"
                value={formData.targetDate}
                onChange={(e) => onChange({ targetDate: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="monthlyContribution">
                Monthly Contribution (Optional)
              </Label>
              <Input
                id="monthlyContribution"
                type="number"
                step="0.01"
                min="0"
                value={formData.monthlyContribution}
                onChange={(e) =>
                  onChange({ monthlyContribution: e.target.value })
                }
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="autoDistributePercent">
                Auto-Distribute % (Optional)
              </Label>
              <Input
                id="autoDistributePercent"
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={formData.autoDistributePercent}
                onChange={(e) =>
                  onChange({ autoDistributePercent: e.target.value })
                }
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="submit" loading={submitting}>
              {editingId ? "Update" : "Add"} Bucket
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={submitting}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

