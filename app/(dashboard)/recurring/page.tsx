"use client";

import { useState, useEffect } from "react";
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
import { Plus, Trash2, Edit2, Loader2, RefreshCw } from "lucide-react";
import { formatMoney } from "@/lib/money";
import { formatDate } from "@/lib/utils";
import { CURRENCIES, RECURRING_FREQUENCIES } from "@/constants/paymentMethods";
import { DatePicker } from "@/components/ui/date-picker";
import {
  useRecurringExpenses,
  useCreateRecurringExpense,
  useUpdateRecurringExpense,
  useDeleteRecurringExpense,
  type RecurringExpense,
} from "@/lib/hooks/use-recurring";
import { useCategories } from "@/lib/hooks/use-categories";

export default function RecurringPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    categoryId: "",
    amount: "",
    currency: "BDT",
    frequency: "MONTHLY",
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
    autoAdd: true,
  });

  // TanStack Query hooks
  const { data: recurringExpenses = [], isLoading: recurringLoading } = useRecurringExpenses();
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();
  const createRecurring = useCreateRecurringExpense();
  const updateRecurring = useUpdateRecurringExpense();
  const deleteRecurring = useDeleteRecurringExpense();

  const loading = recurringLoading || categoriesLoading;
  const submitting = createRecurring.isPending || updateRecurring.isPending;

  // Set default category when categories load
  useEffect(() => {
    if (categories.length > 0 && !formData.categoryId) {
      setFormData(prev => ({ ...prev, categoryId: categories[0].id }));
    }
  }, [categories, formData.categoryId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingId) {
      updateRecurring.mutate(
        { id: editingId, data: formData },
        {
          onSuccess: () => {
            setShowForm(false);
            setEditingId(null);
            resetForm();
          },
        }
      );
    } else {
      createRecurring.mutate(formData, {
        onSuccess: () => {
          setShowForm(false);
          resetForm();
        },
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      categoryId: categories[0]?.id || "",
      amount: "",
      currency: "BDT",
      frequency: "MONTHLY",
      startDate: new Date().toISOString().split("T")[0],
      endDate: "",
      autoAdd: true,
    });
  };

  const handleEdit = (recurring: RecurringExpense) => {
    setFormData({
      name: recurring.name,
      categoryId: recurring.categoryId,
      amount: recurring.amount,
      currency: recurring.currency,
      frequency: recurring.frequency,
      startDate: new Date(recurring.startDate).toISOString().split("T")[0],
      endDate: recurring.endDate ? new Date(recurring.endDate).toISOString().split("T")[0] : "",
      autoAdd: recurring.autoAdd,
    });
    setEditingId(recurring.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to delete this recurring expense?")) {
      return;
    }

    deleteRecurring.mutate(id);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    resetForm();
  };

  const totalMonthly = recurringExpenses
    .filter((re) => re.frequency === "MONTHLY")
    .reduce((sum, re) => sum + parseFloat(re.amount), 0);

  if (loading && recurringExpenses.length === 0) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Recurring Expenses</h1>
          <p className="mt-1 text-sm text-gray-500">
            Monthly Total: {formatMoney(totalMonthly, "BDT")}
          </p>
        </div>
        {!showForm && (
          <Button onClick={() => setShowForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Recurring Expense
          </Button>
        )}
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? "Edit" : "Add"} Recurring Expense</CardTitle>
            <CardDescription>
              {editingId ? "Update" : "Create"} a recurring expense template
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g., Netflix Subscription"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="categoryId">Category</Label>
                  <select
                    id="categoryId"
                    value={formData.categoryId}
                    onChange={(e) =>
                      setFormData({ ...formData, categoryId: e.target.value })
                    }
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
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
                  </select>
                  {categories.length === 0 && (
                    <p className="text-xs text-red-500">
                      Categories not loaded. Please refresh the page or check if categories are seeded.
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
                    onChange={(e) =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
                    placeholder="0.00"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <select
                    id="currency"
                    value={formData.currency}
                    onChange={(e) =>
                      setFormData({ ...formData, currency: e.target.value })
                    }
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    {CURRENCIES.map((curr) => (
                      <option key={curr} value={curr}>
                        {curr}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="frequency">Frequency</Label>
                  <select
                    id="frequency"
                    value={formData.frequency}
                    onChange={(e) =>
                      setFormData({ ...formData, frequency: e.target.value })
                    }
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    {RECURRING_FREQUENCIES.map((freq) => (
                      <option key={freq} value={freq}>
                        {freq}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <DatePicker
                    value={formData.startDate || undefined}
                    onChange={(value) =>
                      setFormData({ ...formData, startDate: value })
                    }
                    placeholder="Select start date"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date (Optional)</Label>
                  <DatePicker
                    value={formData.endDate || undefined}
                    onChange={(value) =>
                      setFormData({ ...formData, endDate: value })
                    }
                    placeholder="Select end date"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="autoAdd"
                    checked={formData.autoAdd}
                    onChange={(e) =>
                      setFormData({ ...formData, autoAdd: e.target.checked })
                    }
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
                <Button type="button" variant="outline" onClick={handleCancel} disabled={submitting}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Recurring Expenses List */}
      <div className="grid gap-4 md:grid-cols-2">
        {recurringExpenses.length === 0 ? (
          <Card className="col-span-2">
            <CardContent className="py-8">
              <p className="text-center text-sm text-gray-500">
                No recurring expenses yet
              </p>
            </CardContent>
          </Card>
        ) : (
          recurringExpenses.map((recurring) => (
            <Card key={recurring.id}>
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
                    <span className="text-sm">
                      {formatDate(recurring.startDate)}
                    </span>
                  </div>
                  {recurring.endDate && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">End Date</span>
                      <span className="text-sm">
                        {formatDate(recurring.endDate)}
                      </span>
                    </div>
                  )}
                  {recurring.lastProcessedMonth && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        Last Processed
                      </span>
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
                          <div
                            key={exp.id}
                            className="flex justify-between text-xs"
                          >
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
                      onClick={() => handleEdit(recurring)}
                      className="flex-1"
                    >
                      <Edit2 className="mr-2 h-3 w-3" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(recurring.id)}
                      className="flex-1"
                    >
                      <Trash2 className="mr-2 h-3 w-3 text-red-500" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

