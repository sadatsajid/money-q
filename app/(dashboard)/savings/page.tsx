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
import { Plus, Loader2, Target } from "lucide-react";
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
        description={`Total: ${formatMoney(totalSavings, "BDT")}`}
        actions={
          !showForm ? (
            <>
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

      {/* Buckets Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {buckets.length === 0 ? (
          <Card className="col-span-3">
            <CardContent className="py-8">
              <p className="text-center text-sm text-gray-500">
                No savings buckets yet. Create one to start saving!
              </p>
            </CardContent>
          </Card>
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
    </div>
  );
}

