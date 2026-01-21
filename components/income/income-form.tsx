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
import { DatePicker } from "@/components/ui/date-picker";
import { CURRENCIES } from "@/constants/paymentMethods";
import { INCOME_GROUPS } from "@/constants/income";
import type { IncomeFormData } from "@/types/income";

interface IncomeFormProps {
  formData: IncomeFormData;
  editingId: string | null;
  submitting: boolean;
  onChange: (data: Partial<IncomeFormData>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export function IncomeForm({
  formData,
  editingId,
  submitting,
  onChange,
  onSubmit,
  onCancel,
}: IncomeFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{editingId ? "Edit" : "Add"} Income</CardTitle>
        <CardDescription>
          {editingId ? "Update" : "Create"} an income entry
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <DatePicker
                value={formData.date}
                onChange={(value) => onChange({ date: value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="source">Source</Label>
              <Select
                id="source"
                value={formData.source}
                onChange={(e) => onChange({ source: e.target.value })}
                required
              >
                {Object.entries(INCOME_GROUPS).map(([group, sources]) => (
                  <optgroup key={group} label={group}>
                    {sources.map((source) => (
                      <option key={source} value={source}>
                        {source}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => onChange({ amount: e.target.value })}
                placeholder="0.00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select
                id="currency"
                value={formData.currency}
                onChange={(e) => onChange({ currency: e.target.value })}
              >
                {CURRENCIES.map((curr) => (
                  <option key={curr} value={curr}>
                    {curr}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">Note (Optional)</Label>
            <Input
              id="note"
              value={formData.note}
              onChange={(e) => onChange({ note: e.target.value })}
              placeholder="Add a note..."
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" loading={submitting}>
              {editingId ? "Update" : "Add"} Income
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

