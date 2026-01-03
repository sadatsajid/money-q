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
import type { ExpenseFormData } from "@/types/transactions";
import type { Category } from "@/types/budgets";

interface ExpenseFormProps {
  formData: ExpenseFormData;
  editingId: string | null;
  categories: Category[];
  paymentMethods: Array<{ id: string; name: string; type: string }>;
  submitting: boolean;
  onChange: (data: Partial<ExpenseFormData>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export function ExpenseForm({
  formData,
  editingId,
  categories,
  paymentMethods,
  submitting,
  onChange,
  onSubmit,
  onCancel,
}: ExpenseFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{editingId ? "Edit" : "Add"} Expense</CardTitle>
        <CardDescription>
          {editingId ? "Update" : "Create"} a new expense entry
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
              <Label htmlFor="merchant">Merchant</Label>
              <Input
                id="merchant"
                value={formData.merchant}
                onChange={(e) => onChange({ merchant: e.target.value })}
                placeholder="e.g., Grocery Store"
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
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentMethodId">Payment Method</Label>
              <Select
                id="paymentMethodId"
                value={formData.paymentMethodId}
                onChange={(e) => onChange({ paymentMethodId: e.target.value })}
                required
              >
                {paymentMethods.map((pm) => (
                  <option key={pm.id} value={pm.id}>
                    {pm.name} ({pm.type})
                  </option>
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
              {editingId ? "Update" : "Add"} Expense
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

