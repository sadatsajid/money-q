"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Loader2 } from "lucide-react";
import { formatMoney } from "@/lib/money";
import {
  useRecurringExpenses,
  useCreateRecurringExpense,
  useUpdateRecurringExpense,
  useDeleteRecurringExpense,
  type RecurringExpense,
} from "@/lib/hooks/use-recurring";
import { useCategories } from "@/lib/hooks/use-categories";
import { PageHeader } from "@/components/dashboard/page-header";
import { RecurringExpenseForm } from "@/components/recurring/recurring-expense-form";
import { RecurringExpenseCard } from "@/components/recurring/recurring-expense-card";
import type { RecurringFormData } from "@/types/recurring";

export default function RecurringPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<RecurringFormData>({
    name: "",
    categoryId: "",
    amount: "",
    currency: "BDT",
    frequency: "YEARLY",
    startDate: "",
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
      startDate: "",
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

  const handleFormChange = (data: Partial<RecurringFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
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
      <PageHeader
        title="Recurring Expenses"
        description={`Monthly Total: ${formatMoney(totalMonthly, "BDT")}`}
        actions={
          !showForm ? (
            <Button onClick={() => setShowForm(true)} className="flex-shrink-0">
              <Plus className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Add Recurring Expense</span>
              <span className="sm:hidden">Add</span>
            </Button>
          ) : undefined
        }
      />

      {/* Add/Edit Form */}
      {showForm && (
        <RecurringExpenseForm
          formData={formData}
          editingId={editingId}
          categories={categories}
          submitting={submitting}
          onChange={handleFormChange}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
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
            <RecurringExpenseCard
              key={recurring.id}
              recurring={recurring}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>
    </div>
  );
}

