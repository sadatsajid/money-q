"use client";

import { useState } from "react";
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
import { Plus, Trash2, Edit2, Loader2, Download } from "lucide-react";
import { formatMoney } from "@/lib/money";
import { formatDate, getCurrentMonth } from "@/lib/utils";
import { INCOME_SOURCES, CURRENCIES } from "@/constants/paymentMethods";
import { DatePicker } from "@/components/ui/date-picker";
import { MonthPicker } from "@/components/ui/month-picker";
import {
  useIncome,
  useCreateIncome,
  useUpdateIncome,
  useDeleteIncome,
  type Income,
} from "@/lib/hooks/use-income";

export default function IncomePage() {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    source: "Salary",
    amount: "",
    currency: "BDT",
    note: "",
  });

  // TanStack Query hooks
  const { data: incomes = [], isLoading } = useIncome(selectedMonth);
  const createIncome = useCreateIncome();
  const updateIncome = useUpdateIncome();
  const deleteIncome = useDeleteIncome();

  const submitting = createIncome.isPending || updateIncome.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingId) {
      updateIncome.mutate(
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
      createIncome.mutate(formData, {
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
      source: "Salary",
      amount: "",
      currency: "BDT",
      note: "",
    });
  };

  const handleEdit = (income: Income) => {
    setFormData({
      date: new Date(income.date).toISOString().split("T")[0],
      source: income.source,
      amount: income.amount,
      currency: income.currency,
      note: income.note || "",
    });
    setEditingId(income.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to delete this income entry?")) {
      return;
    }

    deleteIncome.mutate(id);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    resetForm();
  };

  const totalIncome = incomes.reduce(
    (sum, inc) => sum + parseFloat(inc.amount),
    0
  );

  if (isLoading && incomes.length === 0) {
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
          <h1 className="text-3xl font-bold text-gray-900">Income</h1>
          <p className="mt-1 text-sm text-gray-500">
            Total: {formatMoney(totalIncome, "BDT")}
          </p>
        </div>
        {!showForm && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                const url = `/api/export?type=income&month=${selectedMonth}`;
                window.open(url, "_blank");
              }}
            >
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Income
            </Button>
          </div>
        )}
      </div>

      {/* Month Filter */}
      <div className="flex gap-4">
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
            <CardTitle>{editingId ? "Edit" : "Add"} Income</CardTitle>
            <CardDescription>
              {editingId ? "Update" : "Create"} an income entry
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
                  <Label htmlFor="source">Source</Label>
                  <select
                    id="source"
                    value={formData.source}
                    onChange={(e) =>
                      setFormData({ ...formData, source: e.target.value })
                    }
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    required
                  >
                    {INCOME_SOURCES.map((source) => (
                      <option key={source} value={source}>
                        {source}
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
                  {editingId ? "Update" : "Add"} Income
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel} disabled={submitting}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Income List */}
      <Card>
        <CardHeader>
          <CardTitle>Income History</CardTitle>
          <CardDescription>
            {incomes.length} income entry(ies) in {selectedMonth}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {incomes.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-500">
                No income entries found
              </p>
            ) : (
              incomes.map((income) => (
                <div
                  key={income.id}
                  className="flex items-center justify-between rounded-lg border border-primary-100 bg-primary-50/30 p-4"
                >
                  <div className="flex-1">
                    <p className="font-medium text-primary-900">
                      {income.source}
                    </p>
                    <p className="text-sm text-gray-600">
                      {formatDate(income.date)}
                    </p>
                    {income.note && (
                      <p className="text-xs text-gray-500">{income.note}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-lg font-bold text-primary-700">
                        +{formatMoney(income.amount, income.currency)}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(income)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(income.id)}
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

