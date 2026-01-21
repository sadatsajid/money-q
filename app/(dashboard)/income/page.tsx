"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus, Loader2, Download } from "lucide-react";
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
import { INCOME_GROUPS, getGroupForSource, type IncomeGroup } from "@/constants/income";
import type { IncomeFormData } from "@/types/income";

export default function IncomePage() {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  
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

  // Filter incomes by selected group
  const filteredIncomes = useMemo(() => {
    if (!selectedGroup) return incomes;
    return incomes.filter((income) => {
      const group = getGroupForSource(income.source);
      return group === selectedGroup;
    });
  }, [incomes, selectedGroup]);

  const totalIncome = incomes.reduce(
    (sum, inc) => sum + parseFloat(inc.amount),
    0
  );

  const filteredTotalIncome = filteredIncomes.reduce(
    (sum, inc) => sum + parseFloat(inc.amount),
    0
  );

  // Calculate breakdown by group for analytics
  const groupBreakdown = useMemo(() => {
    const breakdown: Record<string, { count: number; total: number }> = {};
    incomes.forEach((income) => {
      const group = getGroupForSource(income.source);
      if (!breakdown[group]) {
        breakdown[group] = { count: 0, total: 0 };
      }
      breakdown[group].count++;
      breakdown[group].total += parseFloat(income.amount);
    });
    return breakdown;
  }, [incomes]);

  const handleExport = () => {
    const url = `/api/export?type=income&month=${selectedMonth}`;
    window.open(url, "_blank");
  };

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
        description="Track your income sources and monthly earnings"
        actions={
          !showForm ? (
            <>
              <Button variant="outline" onClick={handleExport} className="flex-shrink-0">
                <Download className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Export CSV</span>
              </Button>
              <Button onClick={() => setShowForm(true)} className="flex-shrink-0">
                <Plus className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Add Income</span>
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
              <p className="text-sm text-gray-600 mb-1">Total Income</p>
              <p className="text-3xl font-bold text-primary-700">
                {formatMoney(totalIncome, "BDT")}
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
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
          <div className="mt-3 text-xs text-gray-600">
            {incomes.length} income {incomes.length === 1 ? "entry" : "entries"} in {selectedMonth}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
        <div className="w-full sm:w-auto sm:min-w-[200px]">
          <label className="text-sm font-medium text-gray-700 mb-1.5 block">
            Filter by Month
          </label>
          <MonthPicker
            value={selectedMonth}
            onChange={setSelectedMonth}
            className="w-full"
          />
        </div>
        <div className="w-full sm:w-auto sm:min-w-[200px]">
          <label className="text-sm font-medium text-gray-700 mb-1.5 block">
            Filter by Type
          </label>
          <Select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="w-full"
          >
            <option value="">All Types</option>
            {Object.keys(INCOME_GROUPS).map((group) => (
              <option key={group} value={group}>
                {group}
              </option>
            ))}
          </Select>
        </div>
        {selectedGroup && (
          <div className="text-sm text-gray-600">
            Showing {filteredIncomes.length} of {incomes.length} entries • {formatMoney(filteredTotalIncome, "BDT")}
          </div>
        )}
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
            {selectedGroup 
              ? `${filteredIncomes.length} ${selectedGroup} ${filteredIncomes.length === 1 ? "entry" : "entries"}`
              : `${incomes.length} income ${incomes.length === 1 ? "entry" : "entries"} in ${selectedMonth}`
            }
            {Object.keys(groupBreakdown).length > 1 && !selectedGroup && (
              <span className="ml-2">
                • {Object.entries(groupBreakdown)
                  .sort((a, b) => b[1].total - a[1].total)
                  .slice(0, 2)
                  .map(([group, data]) => `${group}: ${formatMoney(data.total, "BDT")}`)
                  .join(", ")}
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredIncomes.length === 0 ? (
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
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <p className="text-sm font-medium text-gray-900 mb-1">
                  {selectedGroup ? `No ${selectedGroup} income found` : "No income entries found"}
                </p>
                <p className="text-sm text-gray-500">
                  {selectedGroup ? `Try a different filter or add your first ${selectedGroup} income` : "Start by adding your first income entry for this month"}
                </p>
              </div>
            ) : (
              filteredIncomes.map((income) => (
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

