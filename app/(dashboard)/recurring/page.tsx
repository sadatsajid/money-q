"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus, Loader2, Info, Download } from "lucide-react";
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

  const handleExport = () => {
    const url = `/api/export?type=recurring`;
    window.open(url, "_blank");
  };

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
        description="Manage your recurring payments and subscriptions"
        actions={
          !showForm ? (
            <>
              <Button variant="outline" onClick={handleExport} className="flex-shrink-0">
                <Download className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Export CSV</span>
              </Button>
              <Button onClick={() => setShowForm(true)} className="flex-shrink-0">
                <Plus className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Add Recurring Expense</span>
                <span className="sm:hidden">Add</span>
              </Button>
            </>
          ) : undefined
        }
      />

      {/* Total Summary Card */}
      <Card className="border-primary-200 bg-gradient-to-br from-primary-50 to-emerald-50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Monthly Total</p>
              <p className="text-3xl font-bold text-primary-700">
                {formatMoney(totalMonthly, "BDT")}
              </p>
            </div>
            <div className="rounded-full bg-primary-100 p-3">
              <svg
                className="h-8 w-8 text-primary-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs text-gray-600">
            <span>
              {recurringExpenses.length} recurring {recurringExpenses.length === 1 ? "expense" : "expenses"}
            </span>
            {hasNonBDTExpenses && (
              <div className="group relative inline-flex">
                <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help hover:text-primary-600 transition-colors" />
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none">
                  <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 whitespace-nowrap shadow-lg">
                    Includes USD and other currencies converted to BDT
                    <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

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
      <Card>
        <CardHeader>
          <CardTitle>Recurring Expenses</CardTitle>
          <CardDescription>
            All your recurring payments and subscriptions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recurringExpenses.length === 0 ? (
              <div className="py-12 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                  <svg
                    className="h-6 w-6 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                </div>
                <p className="text-sm font-medium text-gray-900 mb-1">
                  No recurring expenses found
                </p>
                <p className="text-sm text-gray-500">
                  Start by adding your first recurring expense
                </p>
              </div>
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
        </CardContent>
      </Card>
    </div>
  );
}

