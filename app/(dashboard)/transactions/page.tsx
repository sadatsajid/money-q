"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus, Loader2, Search, Download } from "lucide-react";
import { formatMoney } from "@/lib/money";
import { getCurrentMonth } from "@/lib/utils";
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
import { PageHeader } from "@/components/dashboard/page-header";
import { ExpenseForm } from "@/components/transactions/expense-form";
import { ExpenseItem } from "@/components/transactions/expense-item";
import { filterExpenses } from "@/lib/utils/transactions";
import type { ExpenseFormData } from "@/types/transactions";

export default function TransactionsPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  
  const [formData, setFormData] = useState<ExpenseFormData>({
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

  const handleFormChange = (data: Partial<ExpenseFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
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

  const filteredExpenses = filterExpenses(expenses, searchTerm);

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
      <PageHeader
        title="Transactions"
        description={`Total: ${formatMoney(totalExpenses, "BDT")}`}
        actions={
          !showForm ? (
            <>
              <Button variant="outline" onClick={handleExport} className="flex-shrink-0">
                <Download className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Export CSV</span>
              </Button>
              <Button onClick={() => setShowForm(true)} className="flex-shrink-0">
                <Plus className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Add Expense</span>
                <span className="sm:hidden">Add</span>
              </Button>
            </>
          ) : undefined
        }
      />

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
        <ExpenseForm
          formData={formData}
          editingId={editingId}
          categories={categories}
          paymentMethods={paymentMethods}
          submitting={submitting}
          onChange={handleFormChange}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
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
                <ExpenseItem
                  key={expense.id}
                  expense={expense}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

