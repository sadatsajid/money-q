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
import { Plus, Trash2, Edit2, Loader2, RefreshCw } from "lucide-react";
import { PAYMENT_METHOD_TYPES, DIGITAL_WALLET_PROVIDERS } from "@/constants/paymentMethods";
import { getCurrentMonth } from "@/lib/utils";
import { toast } from "sonner";

type PaymentMethod = {
  id: string;
  name: string;
  type: string;
  provider?: string | null;
  lastFour?: string | null;
};

export default function SettingsPage() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    type: "Cash",
    provider: "",
    lastFour: "",
  });
  const [exchangeRates, setExchangeRates] = useState<any[]>([]);
  const [refreshingRates, setRefreshingRates] = useState(false);
  const [currentMonth] = useState(getCurrentMonth());

  useEffect(() => {
    fetchPaymentMethods();
    fetchExchangeRates();
  }, []);

  const fetchPaymentMethods = async () => {
    try {
      const response = await fetch("/api/payment-methods");
      if (response.ok) {
        const { paymentMethods } = await response.json();
        setPaymentMethods(paymentMethods);
      }
    } catch (error) {
      console.error("Error fetching payment methods:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchExchangeRates = async () => {
    try {
      const response = await fetch(`/api/exchange-rates?month=${currentMonth}`);
      if (response.ok) {
        const { rates } = await response.json();
        setExchangeRates(rates || []);
      }
    } catch (error) {
      console.error("Error fetching exchange rates:", error);
    }
  };

  const refreshExchangeRates = async () => {
    setRefreshingRates(true);
    try {
      const response = await fetch("/api/exchange-rates", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ month: currentMonth }),
      });

      if (response.ok) {
        await fetchExchangeRates();
        toast.success("Exchange rates updated successfully!");
      } else {
        throw new Error("Failed to fetch exchange rates");
      }
    } catch (error) {
      console.error("Error refreshing exchange rates:", error);
      toast.error("Failed to refresh exchange rates");
    } finally {
      setRefreshingRates(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingId
        ? `/api/payment-methods/${editingId}`
        : "/api/payment-methods";
      const method = editingId ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          provider: formData.provider || null,
          lastFour: formData.lastFour || null,
        }),
      });

      if (response.ok) {
        await fetchPaymentMethods();
        setShowForm(false);
        setEditingId(null);
        setFormData({ name: "", type: "Cash", provider: "", lastFour: "" });
      }
    } catch (error) {
      console.error("Error saving payment method:", error);
    }
  };

  const handleEdit = (method: PaymentMethod) => {
    setFormData({
      name: method.name,
      type: method.type,
      provider: method.provider || "",
      lastFour: method.lastFour || "",
    });
    setEditingId(method.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this payment method?")) {
      return;
    }

    try {
      const response = await fetch(`/api/payment-methods/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchPaymentMethods();
      } else {
        const { error } = await response.json();
        toast.error(error || "Failed to delete payment method");
      }
    } catch (error) {
      console.error("Error deleting payment method:", error);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ name: "", type: "Cash", provider: "", lastFour: "" });
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Settings</h1>
      </div>

      {/* Payment Methods */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <CardTitle>Payment Methods</CardTitle>
            <CardDescription>
              Manage your payment methods and cards
            </CardDescription>
          </div>
          {!showForm && (
            <Button onClick={() => setShowForm(true)} className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Add Payment Method</span>
              <span className="sm:hidden">Add</span>
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {showForm && (
            <form onSubmit={handleSubmit} className="mb-6 space-y-4 rounded-lg border p-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., Personal Card"
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
                  {PAYMENT_METHOD_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </Select>
              </div>

              {formData.type === "Digital Wallet" && (
                <div className="space-y-2">
                  <Label htmlFor="provider">Provider</Label>
                  <Select
                    id="provider"
                    value={formData.provider}
                    onChange={(e) =>
                      setFormData({ ...formData, provider: e.target.value })
                    }
                  >
                    <option value="">Select provider</option>
                    {DIGITAL_WALLET_PROVIDERS.map((provider) => (
                      <option key={provider} value={provider}>
                        {provider}
                      </option>
                    ))}
                  </Select>
                </div>
              )}

              {(formData.type === "Credit Card" || formData.type === "Debit Card") && (
                <div className="space-y-2">
                  <Label htmlFor="lastFour">Last 4 Digits</Label>
                  <Input
                    id="lastFour"
                    value={formData.lastFour}
                    onChange={(e) =>
                      setFormData({ ...formData, lastFour: e.target.value })
                    }
                    placeholder="1234"
                    maxLength={4}
                  />
                </div>
              )}

              <div className="flex gap-2">
                <Button type="submit">
                  {editingId ? "Update" : "Add"} Payment Method
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
              </div>
            </form>
          )}

          <div className="space-y-2">
            {paymentMethods.length === 0 ? (
              <p className="text-sm text-gray-500">
                No payment methods added yet
              </p>
            ) : (
              paymentMethods.map((method) => (
                <div
                  key={method.id}
                  className="flex items-center justify-between rounded-lg border p-3 sm:p-4 gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm sm:text-base truncate">{method.name}</p>
                    <p className="text-xs sm:text-sm text-gray-500 truncate">
                      {method.type}
                      {method.provider && ` - ${method.provider}`}
                      {method.lastFour && ` •••• ${method.lastFour}`}
                    </p>
                  </div>
                  <div className="flex gap-1 sm:gap-2 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(method)}
                      className="h-8 w-8 sm:h-10 sm:w-10"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(method.id)}
                      className="h-8 w-8 sm:h-10 sm:w-10"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Exchange Rates */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <CardTitle>Exchange Rates</CardTitle>
            <CardDescription>
              Current exchange rates for {currentMonth} (1 USD = X Currency)
            </CardDescription>
          </div>
          <Button
            variant="outline"
            onClick={refreshExchangeRates}
            disabled={refreshingRates}
            className="w-full sm:w-auto"
          >
            {refreshingRates ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            <span className="hidden sm:inline">Refresh Rates</span>
            <span className="sm:hidden">Refresh</span>
          </Button>
        </CardHeader>
        <CardContent>
          {exchangeRates.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No exchange rates available.</p>
              <p className="text-sm mt-2">Click "Refresh Rates" to fetch the latest rates.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {exchangeRates
                .sort((a: any, b: any) => {
                  // Sort: USD first, then alphabetically
                  if (a.currency === "USD") return -1;
                  if (b.currency === "USD") return 1;
                  return a.currency.localeCompare(b.currency);
                })
                .map((rate: any) => {
                  const rateValue = parseFloat(rate.rate);
                  const isValid = !isNaN(rateValue) && rateValue > 0;

                  return (
                    <div 
                      key={rate.currency} 
                      className={`rounded-lg border p-4 ${rate.currency === "USD" ? "bg-primary-50/50" : ""}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-muted-foreground">
                            1 {rate.currency} =
                          </p>
                          <p className="text-2xl font-bold text-primary-900">
                            {isValid ? rateValue.toFixed(2) : "N/A"}{" "}
                            <span className="text-lg text-gray-600">BDT</span>
                          </p>
                        </div>
                        {rate.source === "user" && (
                          <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded ml-2 flex-shrink-0">
                            Custom
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
          <p className="mt-4 text-xs text-muted-foreground">
            Rates are fetched from exchangerate-api.com
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

