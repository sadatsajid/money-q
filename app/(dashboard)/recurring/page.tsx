"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Loader2, Info } from "lucide-react";
import { formatMoney, Money, convertToBDT } from "@/lib/money";
import {
  useRecurringExpenses,
  useCreateRecurringExpense,
  useUpdateRecurringExpense,
  useDeleteRecurringExpense,
  type RecurringExpense,
} from "@/lib/hooks/use-recurring";
import { useCategories } from "@/lib/hooks/use-categories";
import { useExchangeRates } from "@/lib/hooks/use-exchange-rates";
import { PageHeader } from "@/components/dashboard/page-header";
import { RecurringExpenseForm } from "@/components/recurring/recurring-expense-form";
import { RecurringExpenseCard } from "@/components/recurring/recurring-expense-card";
import type { RecurringFormData } from "@/types/recurring";
import { getCurrentMonth } from "@/lib/utils";

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
  const currentMonth = getCurrentMonth();
  const { data: recurringExpenses = [], isLoading: recurringLoading } = useRecurringExpenses();
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();
  const { data: exchangeRates = [] } = useExchangeRates(currentMonth);
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

  // Calculate monthly total with proper currency conversion and frequency handling
  // Track if any non-BDT currencies are included
  let hasNonBDTExpenses = false;
  
  const totalMonthly = recurringExpenses.reduce((sum, re) => {
    try {
      // Convert amount to Money instance
      const amountMoney = new Money(re.amount);
      
      // Convert to BDT if needed
      let amountInBDT = amountMoney;
      if (re.currency !== "BDT") {
        hasNonBDTExpenses = true;
        
        // Try to find exchange rate for current month
        let exchangeRate = exchangeRates.find(
          (rate) => rate.currency === re.currency && rate.month === currentMonth
        );
        
        // If not found, try to find the most recent exchange rate for this currency
        if (!exchangeRate) {
          const availableRates = exchangeRates.filter(
            (rate) => rate.currency === re.currency
          );
          if (availableRates.length > 0) {
            // Sort by month descending and take the most recent
            exchangeRate = availableRates.sort((a, b) => 
              b.month.localeCompare(a.month)
            )[0];
            console.warn(
              `Using exchange rate from ${exchangeRate.month} for ${re.currency} in ${currentMonth}`
            );
          }
        }
        
        if (exchangeRate) {
          amountInBDT = convertToBDT(amountMoney, re.currency, parseFloat(exchangeRate.rate));
        } else {
          // Fallback: use a default rate (110 BDT per USD) if no rate is found
          // This ensures expenses are always included
          const defaultRates: Record<string, number> = {
            USD: 110,
            EUR: 120,
            GBP: 140,
          };
          const fallbackRate = defaultRates[re.currency] || 100;
          console.warn(
            `No exchange rate found for ${re.currency}, using fallback rate: ${fallbackRate}`
          );
          amountInBDT = convertToBDT(amountMoney, re.currency, fallbackRate);
        }
      }
      
      // Convert to monthly equivalent based on frequency
      let monthlyAmount = amountInBDT;
      if (re.frequency === "YEARLY") {
        monthlyAmount = amountInBDT.divide(12);
      } else if (re.frequency === "WEEKLY") {
        monthlyAmount = amountInBDT.multiply(52).divide(12); // 52 weeks / 12 months
      }
      // MONTHLY stays as-is
      
      return sum + monthlyAmount.toNumber();
    } catch (error) {
      console.error(`Error calculating monthly amount for ${re.name}:`, error);
      return sum;
    }
  }, 0);

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
        description={
          <div className="flex items-center gap-2">
            <span>Monthly Total: {formatMoney(totalMonthly, "BDT")}</span>
            {hasNonBDTExpenses && (
              <div className="group relative inline-flex">
                <Info className="h-4 w-4 text-muted-foreground cursor-help hover:text-primary-600 transition-colors" />
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none">
                  <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 whitespace-nowrap shadow-lg">
                    Includes USD and other currencies converted to BDT
                    <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        }
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

