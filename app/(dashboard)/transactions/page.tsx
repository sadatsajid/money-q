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
import { Plus, Trash2, Edit2, Loader2, Search, Download } from "lucide-react";
import { formatMoney } from "@/lib/money";
import { formatDate, getCurrentMonth } from "@/lib/utils";
import { CURRENCIES } from "@/constants/paymentMethods";
import { DatePicker } from "@/components/ui/date-picker";
import { MonthPicker } from "@/components/ui/month-picker";
import {
  useExpenses,
  useCreateExpense,
  useUpdateExpense,
  useDeleteExpense,
  type Expense,
} from "@/lib/hooks/use-expenses";
import { useCategories } from "@/lib/hooks/use-categories";
import { usePaymentMethods } from "@/lib/hooks/use-payment-methods";

export default function TransactionsPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    merchant: "",
    categoryId: "",
    amount: "",
    currency: "BDT",
    paymentMethodId: "",
    note: "",
  });

  // TanStack Query hooks
  const { data: expenses = [], isLoading: expensesLoading } = useExpenses(selectedMonth);
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();
  const { data: paymentMethods = [], isLoading: paymentMethodsLoading } = usePaymentMethods();
  
  const createExpense = useCreateExpense();
  const updateExpense = useUpdateExpense();
  const deleteExpense = useDeleteExpense();

  const loading = expensesLoading || categoriesLoading || paymentMethodsLoading;
  const submitting = createExpense.isPending || updateExpense.isPending;

  // Set default category and payment method when they load
  useEffect(() => {
    if (categories.length > 0 && !formData.categoryId) {
      setFormData(prev => ({ ...prev, categoryId: categories[0].id }));
    }
  }, [categories, formData.categoryId]);

  useEffect(() => {
    if (paymentMethods.length > 0 && !formData.paymentMethodId) {
      setFormData(prev => ({ ...prev, paymentMethodId: paymentMethods[0].id }));
    }
  }, [paymentMethods, formData.paymentMethodId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingId) {
      updateExpense.mutate(
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
      createExpense.mutate(formData, {
        onSuccess: () => {
          setShowForm(false);
          resetForm();
        },
      });
    }
  };

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split("T")[0],
      merchant: "",
      categoryId: categories[0]?.id || "",
      amount: "",
      currency: "BDT",
      paymentMethodId: paymentMethods[0]?.id || "",
      note: "",
    });
  };

  const handleEdit = (expense: Expense) => {
    setFormData({
      date: new Date(expense.date).toISOString().split("T")[0],
      merchant: expense.merchant,
      categoryId: expense.categoryId,
      amount: expense.amount,
      currency: expense.currency,
      paymentMethodId: expense.paymentMethodId,
      note: expense.note || "",
    });
    setEditingId(expense.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to delete this expense?")) {
      return;
    }

    deleteExpense.mutate(id);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    resetForm();
  };

  const filteredExpenses = expenses.filter((expense) =>
    expense.merchant.toLowerCase().includes(searchTerm.toLowerCase()) ||
    expense.category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalExpenses = expenses.reduce(
    (sum, exp) => sum + parseFloat(exp.amountInBDT),
    0
  );

  if (loading && expenses.length === 0) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  const handleExport = () => {
    const url = `/api/export?type=expenses&month=${selectedMonth}`;
    window.open(url, "_blank");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
          <p className="mt-1 text-sm text-gray-500">
            Total: {formatMoney(totalExpenses, "BDT")}
          </p>
        </div>
        {!showForm && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Expense
            </Button>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <MonthPicker
          value={selectedMonth}
          onChange={setSelectedMonth}
          className="w-48"
        />
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? "Edit" : "Add"} Expense</CardTitle>
            <CardDescription>
              {editingId ? "Update" : "Create"} a new expense entry
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <DatePicker
                    value={formData.date}
                    onChange={(value) =>
                      setFormData({ ...formData, date: value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="merchant">Merchant</Label>
                  <Input
                    id="merchant"
                    value={formData.merchant}
                    onChange={(e) =>
                      setFormData({ ...formData, merchant: e.target.value })
                    }
                    placeholder="e.g., Grocery Store"
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
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="paymentMethodId">Payment Method</Label>
                  <select
                    id="paymentMethodId"
                    value={formData.paymentMethodId}
                    onChange={(e) =>
                      setFormData({ ...formData, paymentMethodId: e.target.value })
                    }
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    required
                  >
                    {paymentMethods.map((pm) => (
                      <option key={pm.id} value={pm.id}>
                        {pm.name} ({pm.type})
                      </option>
                    ))}
                  </select>
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="note">Note (Optional)</Label>
                <Input
                  id="note"
                  value={formData.note}
                  onChange={(e) =>
                    setFormData({ ...formData, note: e.target.value })
                  }
                  placeholder="Add a note..."
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" loading={submitting}>
                  {editingId ? "Update" : "Add"} Expense
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel} disabled={submitting}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Transactions List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>
            {filteredExpenses.length} transaction(s) in {selectedMonth}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {filteredExpenses.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-500">
                No transactions found
              </p>
            ) : (
              filteredExpenses.map((expense) => (
                <div
                  key={expense.id}
                  className="flex items-center justify-between rounded-lg border p-4 hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div
                        className="h-10 w-10 rounded-lg"
                        style={{ backgroundColor: expense.category.color || "#gray" }}
                      />
                      <div>
                        <p className="font-medium">{expense.merchant}</p>
                        <p className="text-sm text-gray-500">
                          {expense.category.name} · {formatDate(expense.date)} ·{" "}
                          {expense.paymentMethod.name}
                        </p>
                        {expense.note && (
                          <p className="text-xs text-gray-400">{expense.note}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-semibold">
                        {formatMoney(expense.amountInBDT, "BDT")}
                      </p>
                      {expense.currency !== "BDT" && (
                        <p className="text-xs text-gray-500">
                          {formatMoney(expense.amount, expense.currency)}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(expense)}
                        disabled={expense.isRecurring}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(expense.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

