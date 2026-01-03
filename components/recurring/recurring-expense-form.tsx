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
import { CURRENCIES, RECURRING_FREQUENCIES } from "@/constants/paymentMethods";
import type { RecurringFormData } from "@/types/recurring";
import type { Category } from "@/types/budgets";

interface RecurringExpenseFormProps {
  formData: RecurringFormData;
  editingId: string | null;
  categories: Category[];
  submitting: boolean;
  onChange: (data: Partial<RecurringFormData>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export function RecurringExpenseForm({
  formData,
  editingId,
  categories,
  submitting,
  onChange,
  onSubmit,
  onCancel,
}: RecurringExpenseFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{editingId ? "Edit" : "Add"} Recurring Expense</CardTitle>
        <CardDescription>
          {editingId ? "Update" : "Create"} a recurring expense template
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
                placeholder="e.g., Netflix Subscription"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="categoryId">Category</Label>
              <Select
                id="categoryId"
                value={formData.categoryId}
                onChange={(e) => onChange({ categoryId: e.target.value })}
                required
                disabled={categories.length === 0}
              >
                {categories.length === 0 ? (
                  <option value="">No categories available</option>
                ) : (
                  <>
                    {!formData.categoryId && (
                      <option value="">Select a category</option>
                    )}
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </>
                )}
              </Select>
              {categories.length === 0 && (
                <p className="text-xs text-red-500">
                  Categories not loaded. Please refresh the page or check if
                  categories are seeded.
                </p>
              )}
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

            <div className="space-y-2">
              <Label htmlFor="frequency">Frequency</Label>
              <Select
                id="frequency"
                value={formData.frequency}
                onChange={(e) => onChange({ frequency: e.target.value })}
              >
                {RECURRING_FREQUENCIES.map((freq) => (
                  <option key={freq} value={freq}>
                    {freq}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <DatePicker
                value={formData.startDate || undefined}
                onChange={(value) => onChange({ startDate: value })}
                placeholder="Select start date"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date (Optional)</Label>
              <DatePicker
                value={formData.endDate || undefined}
                onChange={(value) => onChange({ endDate: value })}
                placeholder="Select end date"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="autoAdd"
                checked={formData.autoAdd}
                onChange={(e) => onChange({ autoAdd: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="autoAdd" className="font-normal">
                Auto-add to expenses
              </Label>
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="submit" loading={submitting}>
              {editingId ? "Update" : "Add"} Recurring Expense
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

