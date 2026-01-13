"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Edit2, Camera, Loader2 } from "lucide-react";
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
import { PageHeader } from "@/components/dashboard/page-header";
import { useSummary } from "@/lib/hooks/use-summary";
import { usePortfolio } from "@/lib/hooks/use-investments";
import { formatMoney } from "@/lib/money";
import { Money } from "@/lib/money";
import { getCurrentMonth } from "@/lib/utils";
import { toast } from "sonner";

type User = {
  id: string;
  email: string;
  name: string | null;
  job: string | null;
  defaultCurrency: string;
  createdAt: string;
  updatedAt: string;
};

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    job: "",
    defaultCurrency: "BDT",
  });

  const currentMonth = getCurrentMonth();
  const { data: summary, isLoading: summaryLoading } = useSummary(currentMonth);
  const { data: portfolio, isLoading: portfolioLoading } = usePortfolio();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/users");
        if (response.ok) {
          const { user: userData } = await response.json();
          setUser(userData);
          setFormData({
            name: userData.name || "",
            job: userData.job || "",
            defaultCurrency: userData.defaultCurrency || "BDT",
          });
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const { user: updatedUser } = await response.json();
        setUser(updatedUser);
        setIsEditing(false);
        toast.success("Profile updated successfully");
      } else {
        throw new Error("Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        name: user.name || "",
        job: user.job || "",
        defaultCurrency: user.defaultCurrency || "BDT",
      });
    }
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-gray-500">Failed to load profile</p>
      </div>
    );
  }

  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  // Calculate financial summary
  const totalIncome = summary
    ? new Money(summary.totalIncome)
    : new Money(0);
  const totalExpenses = summary
    ? new Money(summary.totalExpenses)
    : new Money(0);
  const netSavings = summary ? new Money(summary.netSavings) : new Money(0);
  const totalInvested = portfolio
    ? new Money(portfolio.totalInvested)
    : new Money(0);
  const totalCurrentValue = portfolio
    ? new Money(portfolio.totalCurrentValue)
    : new Money(0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Profile"
        description="Manage your personal information and view your financial summary"
      />

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
        {/* Profile Summary Card */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Summary</CardTitle>
            <CardDescription>Your account overview</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="relative flex-shrink-0">
                <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-primary-100 text-xl sm:text-2xl font-semibold text-primary-700">
                  {initials}
                </div>
                <button
                  className="absolute bottom-0 right-0 flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-primary-600 text-white hover:bg-primary-700"
                  title="Change profile picture"
                >
                  <Camera className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                </button>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                  {user.name || "User"}
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 truncate">{user.job || "No job title"}</p>
                <p className="mt-1 text-xs text-gray-400">
                  Member since {new Date(user.createdAt).toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Financial Summary Card */}
        <Card>
          <CardHeader>
            <CardTitle>Financial Summary</CardTitle>
            <CardDescription>Your financial overview for {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}</CardDescription>
          </CardHeader>
          <CardContent>
            {summaryLoading || portfolioLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Total Income</p>
                    <p className="text-base sm:text-lg font-semibold text-gray-900">
                      {formatMoney(totalIncome, user.defaultCurrency)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Total Expenses</p>
                    <p className="text-base sm:text-lg font-semibold text-gray-900">
                      {formatMoney(totalExpenses, user.defaultCurrency)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Net Savings</p>
                    <p
                      className={`text-base sm:text-lg font-semibold ${
                        netSavings.toNumber() >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {formatMoney(netSavings, user.defaultCurrency)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Investments</p>
                    <p className="text-base sm:text-lg font-semibold text-gray-900">
                      {formatMoney(totalInvested, user.defaultCurrency)}
                    </p>
                  </div>
                </div>
                {portfolio && new Money(portfolio.totalCurrentValue).toNumber() > 0 && (
                  <div className="rounded-lg bg-primary-50 p-3">
                    <p className="text-xs text-gray-600">Current Portfolio Value</p>
                    <p className="text-lg sm:text-xl font-bold text-primary-700">
                      {formatMoney(totalCurrentValue, user.defaultCurrency)}
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Personal Information Card */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>
              Update your personal details and preferences
            </CardDescription>
          </div>
          {!isEditing && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="w-full sm:w-auto"
            >
              <Edit2 className="mr-2 h-4 w-4" />
              Edit
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSave();
              }}
              className="space-y-4"
            >
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Enter your full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={user.email}
                    disabled
                    className="bg-gray-50"
                  />
                  <p className="text-xs text-gray-500">
                    Email cannot be changed
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="job">Job Title</Label>
                  <Input
                    id="job"
                    value={formData.job}
                    onChange={(e) =>
                      setFormData({ ...formData, job: e.target.value })
                    }
                    placeholder="Enter your job title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="defaultCurrency">Default Currency</Label>
                  <Select
                    id="defaultCurrency"
                    value={formData.defaultCurrency}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        defaultCurrency: e.target.value,
                      })
                    }
                  >
                    <option value="BDT">BDT (৳)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="MYR">MYR (RM)</option>
                    <option value="SGD">SGD (S$)</option>
                  </Select>
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={saving}
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-gray-500">Full Name</p>
                <p className="text-base text-gray-900">
                  {user.name || "Not set"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Email Address
                </p>
                <p className="text-base text-gray-900">{user.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Job Title</p>
                <p className="text-base text-gray-900">
                  {user.job || "Not set"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Default Currency
                </p>
                <p className="text-base text-gray-900">
                  {user.defaultCurrency}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

