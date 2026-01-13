"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus, Loader2 } from "lucide-react";
import { formatMoney } from "@/lib/money";
import { getCurrentMonth } from "@/lib/utils";
import { MonthPicker } from "@/components/ui/month-picker";
import {
  useIncome,
  useCreateIncome,
  useUpdateIncome,
  useDeleteIncome,
  type Income,
} from "@/lib/hooks/use-income";
import { PageHeader } from "@/components/dashboard/page-header";
import { IncomeForm } from "@/components/income/income-form";
import { IncomeItem } from "@/components/income/income-item";
import type { IncomeFormData } from "@/types/income";

export default function IncomePage() {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  
  const [formData, setFormData] = useState<IncomeFormData>({
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

  const handleFormChange = (data: Partial<IncomeFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
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
      <PageHeader
        title="Income"
        description={`Total: ${formatMoney(totalIncome, "BDT")}`}
        actions={
          !showForm ? (
            <Button onClick={() => setShowForm(true)} className="flex-shrink-0">
              <Plus className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Add Income</span>
              <span className="sm:hidden">Add</span>
            </Button>
          ) : undefined
        }
      />

      {/* Month Filter */}
      <div className="flex gap-4">
        <MonthPicker
          value={selectedMonth}
          onChange={setSelectedMonth}
          className="w-full sm:w-48"
        />
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <IncomeForm
          formData={formData}
          editingId={editingId}
          submitting={submitting}
          onChange={handleFormChange}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
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
                <IncomeItem
                  key={income.id}
                  income={income}
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

