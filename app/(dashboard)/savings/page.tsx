"use client";

import { useState, useEffect } from "react";
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
import { Plus, Loader2, Target, Download } from "lucide-react";
import { formatMoney } from "@/lib/money";
import { getCurrentMonth } from "@/lib/utils";
import {
  useSavingsBuckets,
  useCreateSavingsBucket,
  useUpdateSavingsBucket,
  useDeleteSavingsBucket,
  useDistributeSavings,
  type SavingsBucket,
} from "@/lib/hooks/use-savings";
import { toast } from "sonner";
import { PageHeader } from "@/components/dashboard/page-header";
import { SavingsBucketForm } from "@/components/savings/savings-bucket-form";
import { DistributeForm } from "@/components/savings/distribute-form";
import { SavingsBucketCard } from "@/components/savings/savings-bucket-card";
import type { SavingsFormData, DistributeFormData } from "@/types/savings";

export default function SavingsPage() {
  const [showForm, setShowForm] = useState(false);
  const [showDistributeForm, setShowDistributeForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState<SavingsFormData>({
    name: "",
    type: "Custom",
    targetAmount: "",
    targetDate: "",
    monthlyContribution: "",
    autoDistributePercent: "",
  });

  const [distributeData, setDistributeData] = useState<DistributeFormData>({});

  // TanStack Query hooks
  const { data: buckets = [], isLoading } = useSavingsBuckets();
  const createBucket = useCreateSavingsBucket();
  const updateBucket = useUpdateSavingsBucket();
  const deleteBucket = useDeleteSavingsBucket();
  const distributeSavings = useDistributeSavings();

  const submitting = createBucket.isPending || updateBucket.isPending;
  const distributing = distributeSavings.isPending;

  // Initialize distribute data when buckets load
  useEffect(() => {
    if (buckets.length > 0) {
      const initialData: any = {};
      buckets.forEach((bucket) => {
        initialData[bucket.id] = "";
      });
      setDistributeData(initialData);
    }
  }, [buckets]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingId) {
      updateBucket.mutate(
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
      createBucket.mutate(formData, {
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
      type: "Custom",
      targetAmount: "",
      targetDate: "",
      monthlyContribution: "",
      autoDistributePercent: "",
    });
  };

  const handleDistribute = async (e: React.FormEvent) => {
    e.preventDefault();

    const distributions = Object.entries(distributeData)
      .filter(([_, amount]) => amount && parseFloat(amount) > 0)
      .map(([bucketId, amount]) => ({
        bucketId,
        amount,
        note: `Manual distribution - ${getCurrentMonth()}`,
      }));

    if (distributions.length === 0) {
      toast.error("Please enter at least one distribution amount");
      return;
    }

    distributeSavings.mutate(
      {
        month: getCurrentMonth(),
        distributions,
      },
      {
        onSuccess: () => {
          setShowDistributeForm(false);
          // Reset distribute data
          const resetData: any = {};
          buckets.forEach((bucket) => {
            resetData[bucket.id] = "";
          });
          setDistributeData(resetData);
        },
      }
    );
  };

  const handleEdit = (bucket: SavingsBucket) => {
    setFormData({
      name: bucket.name,
      type: bucket.type,
      targetAmount: bucket.targetAmount || "",
      targetDate: bucket.targetDate
        ? new Date(bucket.targetDate).toISOString().split("T")[0]
        : "",
      monthlyContribution: bucket.monthlyContribution || "",
      autoDistributePercent: bucket.autoDistributePercent || "",
    });
    setEditingId(bucket.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to delete this savings bucket?")) {
      return;
    }

    deleteBucket.mutate(id);
  };

  const totalSavings = buckets.reduce(
    (sum, bucket) => sum + parseFloat(bucket.currentBalance),
    0
  );

  const handleFormChange = (data: Partial<SavingsFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const handleDistributeChange = (data: DistributeFormData) => {
    setDistributeData(data);
  };

  const handleExport = () => {
    const url = `/api/export?type=savings`;
    window.open(url, "_blank");
  };

  if (isLoading && buckets.length === 0) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Savings"
        description="Track and manage your savings goals"
        actions={
          !showForm ? (
            <>
              <Button variant="outline" onClick={handleExport} className="flex-shrink-0">
                <Download className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Export CSV</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowDistributeForm(true)}
                disabled={submitting || buckets.length === 0}
                className="flex-shrink-0"
              >
                <Target className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Distribute</span>
              </Button>
              <Button onClick={() => setShowForm(true)} className="flex-shrink-0">
                <Plus className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Add Bucket</span>
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
              <p className="text-sm text-gray-600 mb-1">Total Savings</p>
              <p className="text-3xl font-bold text-primary-700">
                {formatMoney(totalSavings, "BDT")}
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
            {buckets.length} savings {buckets.length === 1 ? "bucket" : "buckets"}
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Bucket Form */}
      {showForm && (
        <SavingsBucketForm
          formData={formData}
          editingId={editingId}
          submitting={submitting}
          onChange={handleFormChange}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingId(null);
            resetForm();
          }}
        />
      )}

      {/* Distribute Savings Form */}
      {showDistributeForm && (
        <DistributeForm
          buckets={buckets}
          distributeData={distributeData}
          distributing={distributing}
          onChange={handleDistributeChange}
          onSubmit={handleDistribute}
          onCancel={() => setShowDistributeForm(false)}
        />
      )}

      {/* Savings Buckets List */}
      <Card>
        <CardHeader>
          <CardTitle>Savings Buckets</CardTitle>
          <CardDescription>
            All your savings goals and buckets
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {buckets.length === 0 ? (
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
                  No savings buckets found
                </p>
                <p className="text-sm text-gray-500">
                  Start by creating your first savings bucket
                </p>
              </div>
            ) : (
              buckets.map((bucket) => (
                <SavingsBucketCard
                  key={bucket.id}
                  bucket={bucket}
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

