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
import { Plus, Trash2, Edit2, Loader2, TrendingUp, Target } from "lucide-react";
import { formatMoney, Money } from "@/lib/money";
import { formatDate, getCurrentMonth } from "@/lib/utils";
import { SAVINGS_BUCKET_TYPES } from "@/constants/paymentMethods";
import { DatePicker } from "@/components/ui/date-picker";
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

export default function SavingsPage() {
  const [showForm, setShowForm] = useState(false);
  const [showDistributeForm, setShowDistributeForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    type: "Custom",
    targetAmount: "",
    targetDate: "",
    monthlyContribution: "",
    autoDistributePercent: "",
  });

  const [distributeData, setDistributeData] = useState<{
    [bucketId: string]: string;
  }>({});

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

  const calculateProgress = (bucket: SavingsBucket) => {
    if (!bucket.targetAmount) return 0;
    const current = parseFloat(bucket.currentBalance);
    const target = parseFloat(bucket.targetAmount);
    return Math.min((current / target) * 100, 100);
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
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? "Edit" : "Add"} Savings Bucket</CardTitle>
            <CardDescription>
              {editingId ? "Update" : "Create"} a savings goal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g., Vacation Fund"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select
                    id="type"
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value })
                    }
                    required
                  >
                    {SAVINGS_BUCKET_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="targetAmount">Target Amount (Optional)</Label>
                  <Input
                    id="targetAmount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.targetAmount}
                    onChange={(e) =>
                      setFormData({ ...formData, targetAmount: e.target.value })
                    }
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="targetDate">Target Date (Optional)</Label>
                  <Input
                    id="targetDate"
                    type="date"
                    value={formData.targetDate}
                    onChange={(e) =>
                      setFormData({ ...formData, targetDate: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="monthlyContribution">
                    Monthly Contribution (Optional)
                  </Label>
                  <Input
                    id="monthlyContribution"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.monthlyContribution}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        monthlyContribution: e.target.value,
                      })
                    }
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="autoDistributePercent">
                    Auto-Distribute % (Optional)
                  </Label>
                  <Input
                    id="autoDistributePercent"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={formData.autoDistributePercent}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        autoDistributePercent: e.target.value,
                      })
                    }
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" loading={submitting}>
                  {editingId ? "Update" : "Add"} Bucket
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    resetForm();
                  }}
                  disabled={submitting}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Distribute Savings Form */}
      {showDistributeForm && (
        <Card>
          <CardHeader>
            <CardTitle>Distribute Savings</CardTitle>
            <CardDescription>
              Allocate savings to your buckets for {getCurrentMonth()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleDistribute} className="space-y-4">
              {buckets.map((bucket) => (
                <div key={bucket.id} className="flex items-center gap-4">
                  <div className="flex-1">
                    <Label htmlFor={`dist-${bucket.id}`}>{bucket.name}</Label>
                    <p className="text-xs text-gray-500">
                      Current: {formatMoney(bucket.currentBalance, "BDT")}
                    </p>
                  </div>
                  <Input
                    id={`dist-${bucket.id}`}
                    type="number"
                    step="0.01"
                    min="0"
                    value={distributeData[bucket.id] || ""}
                    onChange={(e) =>
                      setDistributeData({
                        ...distributeData,
                        [bucket.id]: e.target.value,
                      })
                    }
                    placeholder="0.00"
                    className="w-40"
                  />
                </div>
              ))}

              <div className="flex gap-2">
                <Button type="submit" loading={distributing}>
                  Distribute
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowDistributeForm(false)}
                  disabled={distributing}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
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
            <Card key={bucket.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{bucket.name}</CardTitle>
                    <CardDescription>{bucket.type}</CardDescription>
                  </div>
                  {bucket.targetAmount && (
                    <Target className="h-5 w-5 text-primary-600" />
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-2xl font-bold text-primary-700">
                      {formatMoney(bucket.currentBalance, "BDT")}
                    </p>
                    {bucket.targetAmount && (
                      <p className="text-sm text-gray-500">
                        Goal: {formatMoney(bucket.targetAmount, "BDT")}
                      </p>
                    )}
                  </div>

                  {bucket.targetAmount && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{calculateProgress(bucket).toFixed(1)}%</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                        <div
                          className="h-full rounded-full bg-primary-600"
                          style={{ width: `${calculateProgress(bucket)}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {bucket.targetDate && (
                    <p className="text-xs text-gray-500">
                      Target: {formatDate(bucket.targetDate)}
                    </p>
                  )}

                  {bucket.autoDistributePercent && (
                    <div className="rounded-lg bg-primary-50 p-2">
                      <p className="text-xs text-primary-700">
                        Auto: {bucket.autoDistributePercent}% of savings
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(bucket)}
                      className="flex-1"
                    >
                      <Edit2 className="mr-2 h-3 w-3" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(bucket.id)}
                      className="flex-1"
                    >
                      <Trash2 className="mr-2 h-3 w-3 text-red-500" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

