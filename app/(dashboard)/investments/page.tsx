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
import { Plus, Trash2, Edit2, Loader2, TrendingUp, DollarSign, Calendar } from "lucide-react";
import { formatMoney } from "@/lib/money";
import { formatDate, getCurrentMonth } from "@/lib/utils";
import { CURRENCIES } from "@/constants/paymentMethods";
import {
  INVESTMENT_TYPES,
  INVESTMENT_STATUS,
  INVESTMENT_SOURCE_TYPES,
  RETURN_TYPES,
} from "@/constants/investments";
import { DatePicker } from "@/components/ui/date-picker";
import { MonthPicker } from "@/components/ui/month-picker";
import {
  useInvestments,
  useCreateInvestment,
  useUpdateInvestment,
  useDeleteInvestment,
  useSellInvestment,
  usePortfolio,
  type InvestmentTransaction,
} from "@/lib/hooks/use-investments";
import {
  useInvestmentReturns,
  useCreateInvestmentReturn,
} from "@/lib/hooks/use-investment-returns";
import { useSavingsBuckets } from "@/lib/hooks/use-savings";
import { useIncome } from "@/lib/hooks/use-income";
import { PageHeader } from "@/components/dashboard/page-header";

export default function InvestmentsPage() {
  const [showForm, setShowForm] = useState(false);
  const [showSellForm, setShowSellForm] = useState(false);
  const [showReturnForm, setShowReturnForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [sellingId, setSellingId] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [filterType, setFilterType] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");

  const [formData, setFormData] = useState({
    transactionDate: new Date().toISOString().split("T")[0],
    name: "",
    type: "Stock",
    quantity: "1",
    pricePerUnit: "",
    totalAmount: "",
    currency: "BDT",
    currentValue: "",
    sourceType: "PAST_SAVINGS",
    savingsBucketId: "",
    incomeId: "",
    sourceNote: "",
    ticker: "",
    maturityDate: "",
    accountName: "",
    note: "",
  });

  const [sellFormData, setSellFormData] = useState({
    saleDate: new Date().toISOString().split("T")[0],
    saleProceeds: "",
    currency: "BDT",
    note: "",
  });

  const [returnFormData, setReturnFormData] = useState({
    returnType: "DIVIDEND",
    returnDate: new Date().toISOString().split("T")[0],
    amount: "",
    currency: "BDT",
    transactionId: "",
    investmentName: "",
    investmentType: "",
    note: "",
  });

  // TanStack Query hooks - load all investments
  const { data: allInvestments = [], isLoading } = useInvestments({
    type: filterType || undefined,
    status: filterStatus || undefined,
  });
  const { data: portfolio } = usePortfolio();
  const { data: savingsBuckets = [] } = useSavingsBuckets();
  const { data: incomes = [] } = useIncome(selectedMonth);
  const { data: returns = [] } = useInvestmentReturns({ month: selectedMonth });

  // Filter investments client-side by month
  const investments = allInvestments.filter((investment) => {
    if (!selectedMonth) return true;
    const transactionDate = new Date(investment.transactionDate);
    const [year, monthNum] = selectedMonth.split("-");
    const startDate = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(monthNum), 0, 23, 59, 59, 999);
    return transactionDate >= startDate && transactionDate <= endDate;
  });

  const createInvestment = useCreateInvestment();
  const updateInvestment = useUpdateInvestment();
  const deleteInvestment = useDeleteInvestment();
  const sellInvestment = useSellInvestment();
  const createReturn = useCreateInvestmentReturn();

  const submitting =
    createInvestment.isPending ||
    updateInvestment.isPending ||
    sellInvestment.isPending ||
    createReturn.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const investmentData = {
      ...formData,
      transactionType: "BUY",
      quantity: parseFloat(formData.quantity) || 1,
      pricePerUnit: formData.pricePerUnit ? parseFloat(formData.pricePerUnit) : undefined,
      totalAmount: formData.totalAmount,
      currentValue: formData.currentValue || undefined,
      savingsBucketId: formData.sourceType === "SAVINGS_BUCKET" ? formData.savingsBucketId : undefined,
      incomeId: formData.sourceType === "INCOME" ? formData.incomeId : undefined,
      sourceNote: formData.sourceType === "PAST_SAVINGS" || formData.sourceType === "OTHER" ? formData.sourceNote : undefined,
      maturityDate: formData.maturityDate || undefined,
      note: formData.note || undefined,
    };

    if (editingId) {
      updateInvestment.mutate(
        {
          id: editingId,
          data: {
            currentValue: formData.currentValue || undefined,
            status: formData.maturityDate && new Date(formData.maturityDate) < new Date() ? "MATURED" : undefined,
            note: formData.note || undefined,
          },
        },
        {
          onSuccess: () => {
            setShowForm(false);
            setEditingId(null);
            resetForm();
          },
        }
      );
    } else {
      createInvestment.mutate(investmentData, {
        onSuccess: () => {
          setShowForm(false);
          resetForm();
        },
      });
    }
  };

  const handleSell = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sellingId) return;

    sellInvestment.mutate(
      {
        id: sellingId,
        data: sellFormData,
      },
      {
        onSuccess: () => {
          setShowSellForm(false);
          setSellingId(null);
          setSellFormData({
            saleDate: new Date().toISOString().split("T")[0],
            saleProceeds: "",
            currency: "BDT",
            note: "",
          });
        },
      }
    );
  };

  const handleReturnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    createReturn.mutate(returnFormData, {
      onSuccess: () => {
        setShowReturnForm(false);
        setReturnFormData({
          returnType: "DIVIDEND",
          returnDate: new Date().toISOString().split("T")[0],
          amount: "",
          currency: "BDT",
          transactionId: "",
          investmentName: "",
          investmentType: "",
          note: "",
        });
      },
    });
  };

  const resetForm = () => {
    setFormData({
      transactionDate: new Date().toISOString().split("T")[0],
      name: "",
      type: "Stock",
      quantity: "1",
      pricePerUnit: "",
      totalAmount: "",
      currency: "BDT",
      currentValue: "",
      sourceType: "PAST_SAVINGS",
      savingsBucketId: "",
      incomeId: "",
      sourceNote: "",
      ticker: "",
      maturityDate: "",
      accountName: "",
      note: "",
    });
  };

  const handleEdit = (investment: InvestmentTransaction) => {
    if (investment.transactionType !== "BUY") return;

    setFormData({
      transactionDate: investment.transactionDate.split("T")[0],
      name: investment.name,
      type: investment.type,
      quantity: investment.quantity,
      pricePerUnit: investment.pricePerUnit || "",
      totalAmount: investment.totalAmount,
      currency: investment.currency,
      currentValue: investment.currentValue || "",
      sourceType: investment.sourceType,
      savingsBucketId: investment.savingsBucketId || "",
      incomeId: investment.incomeId || "",
      sourceNote: investment.sourceNote || "",
      ticker: investment.ticker || "",
      maturityDate: investment.maturityDate ? investment.maturityDate.split("T")[0] : "",
      accountName: investment.accountName || "",
      note: investment.note || "",
    });
    setEditingId(investment.id);
    setShowForm(true);
  };

  const handleSellClick = (investment: InvestmentTransaction) => {
    if (investment.transactionType !== "BUY" || investment.status === "SOLD") return;
    setSellingId(investment.id);
    setSellFormData({
      saleDate: new Date().toISOString().split("T")[0],
      saleProceeds: "",
      currency: investment.currency,
      note: "",
    });
    setShowSellForm(true);
  };

  const activeInvestments = investments.filter(
    (inv) => inv.transactionType === "BUY" && inv.status !== "SOLD"
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Investments"
        description="Track your investments and portfolio performance"
        actions={
          <>
            <Button
              variant="outline"
              onClick={() => setShowReturnForm(true)}
              disabled={submitting}
              className="flex-shrink-0"
            >
              <DollarSign className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Add Return</span>
            </Button>
            <Button onClick={() => setShowForm(true)} disabled={submitting} className="flex-shrink-0">
              <Plus className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Add Investment</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </>
        }
      />

      {/* Portfolio Summary */}
      {portfolio && (
        <Card>
          <CardHeader>
            <CardTitle>Portfolio Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 grid-cols-2 md:grid-cols-2 lg:grid-cols-4">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Total Invested</p>
                <p className="text-lg sm:text-2xl font-bold">
                  {formatMoney(portfolio.totalInvested)}
                </p>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Current Value</p>
                <p className="text-lg sm:text-2xl font-bold">
                  {formatMoney(portfolio.totalCurrentValue)}
                </p>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Total Gain</p>
                <p
                  className={`text-lg sm:text-2xl font-bold ${
                    parseFloat(portfolio.totalGain) >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {formatMoney(portfolio.totalGain)}
                </p>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Total Returns</p>
                <p className="text-lg sm:text-2xl font-bold text-green-600">
                  {formatMoney(portfolio.totalReturns)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start">
        <div className="w-full sm:w-auto sm:min-w-[200px]">
          <Label className="text-sm mb-1.5 block">Month</Label>
          <MonthPicker
            value={selectedMonth}
            onChange={setSelectedMonth}
            className="w-full"
          />
        </div>
        <div className="w-full sm:w-auto sm:min-w-[180px]">
          <Label className="text-sm mb-1.5 block">Type</Label>
          <Select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full"
          >
            <option value="">All Types</option>
            {INVESTMENT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </Select>
        </div>
        <div className="w-full sm:w-auto sm:min-w-[180px]">
          <Label className="text-sm mb-1.5 block">Status</Label>
          <Select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full"
          >
            <option value="">All Status</option>
            {INVESTMENT_STATUS.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {/* Add/Edit Investment Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? "Edit" : "Add"} Investment</CardTitle>
            <CardDescription>
              {editingId
                ? "Update investment details"
                : "Record a new investment transaction"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="transactionDate">Investment Date</Label>
                  <DatePicker
                    value={formData.transactionDate}
                    onChange={(value) =>
                      setFormData({ ...formData, transactionDate: value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Investment Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g., Apple Stock, Bitcoin"
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
                    {INVESTMENT_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ticker">Ticker/Symbol (Optional)</Label>
                  <Input
                    id="ticker"
                    value={formData.ticker}
                    onChange={(e) =>
                      setFormData({ ...formData, ticker: e.target.value })
                    }
                    placeholder="e.g., AAPL, BTC"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    step="0.0001"
                    min="0"
                    value={formData.quantity}
                    onChange={(e) =>
                      setFormData({ ...formData, quantity: e.target.value })
                    }
                    placeholder="1"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pricePerUnit">Price Per Unit (Optional)</Label>
                  <Input
                    id="pricePerUnit"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.pricePerUnit}
                    onChange={(e) =>
                      setFormData({ ...formData, pricePerUnit: e.target.value })
                    }
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="totalAmount">Total Investment Amount</Label>
                  <Input
                    id="totalAmount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.totalAmount}
                    onChange={(e) =>
                      setFormData({ ...formData, totalAmount: e.target.value })
                    }
                    placeholder="0.00"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    id="currency"
                    value={formData.currency}
                    onChange={(e) =>
                      setFormData({ ...formData, currency: e.target.value })
                    }
                  >
                    {CURRENCIES.map((curr) => (
                      <option key={curr} value={curr}>
                        {curr}
                      </option>
                    ))}
                  </Select>
                </div>

                {!editingId && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="sourceType">Source of Funds</Label>
                      <Select
                        id="sourceType"
                        value={formData.sourceType}
                        onChange={(e) =>
                          setFormData({ ...formData, sourceType: e.target.value })
                        }
                        required
                      >
                        {INVESTMENT_SOURCE_TYPES.map((source) => (
                          <option key={source} value={source}>
                            {source.replace("_", " ")}
                          </option>
                        ))}
                      </Select>
                    </div>

                    {formData.sourceType === "SAVINGS_BUCKET" && (
                      <div className="space-y-2">
                        <Label htmlFor="savingsBucketId">Savings Bucket</Label>
                        <Select
                          id="savingsBucketId"
                          value={formData.savingsBucketId}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              savingsBucketId: e.target.value,
                            })
                          }
                          required
                        >
                          <option value="">Select bucket</option>
                          {savingsBuckets.map((bucket) => (
                            <option key={bucket.id} value={bucket.id}>
                              {bucket.name}
                            </option>
                          ))}
                        </Select>
                      </div>
                    )}

                    {formData.sourceType === "INCOME" && (
                      <div className="space-y-2">
                        <Label htmlFor="incomeId">Income Entry</Label>
                        <Select
                          id="incomeId"
                          value={formData.incomeId}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              incomeId: e.target.value,
                            })
                          }
                          required
                        >
                          <option value="">Select income</option>
                          {incomes.map((income) => (
                            <option key={income.id} value={income.id}>
                              {formatDate(income.date)} - {formatMoney(income.amount, income.currency)}
                            </option>
                          ))}
                        </Select>
                      </div>
                    )}

                    {(formData.sourceType === "PAST_SAVINGS" ||
                      formData.sourceType === "OTHER") && (
                      <div className="space-y-2">
                        <Label htmlFor="sourceNote">Source Note</Label>
                        <Input
                          id="sourceNote"
                          value={formData.sourceNote}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              sourceNote: e.target.value,
                            })
                          }
                          placeholder="Describe the source"
                          required
                        />
                      </div>
                    )}
                  </>
                )}

                <div className="space-y-2">
                  <Label htmlFor="currentValue">Current Value (Optional)</Label>
                  <Input
                    id="currentValue"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.currentValue}
                    onChange={(e) =>
                      setFormData({ ...formData, currentValue: e.target.value })
                    }
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maturityDate">Maturity Date (Optional)</Label>
                  <DatePicker
                    value={formData.maturityDate}
                    onChange={(value) =>
                      setFormData({ ...formData, maturityDate: value })
                    }
                    placeholder="Select maturity date"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accountName">Account/Platform (Optional)</Label>
                  <Input
                    id="accountName"
                    value={formData.accountName}
                    onChange={(e) =>
                      setFormData({ ...formData, accountName: e.target.value })
                    }
                    placeholder="e.g., Interactive Brokers, Binance"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="note">Note (Optional)</Label>
                  <Input
                    id="note"
                    value={formData.note}
                    onChange={(e) =>
                      setFormData({ ...formData, note: e.target.value })
                    }
                    placeholder="Additional notes"
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end">
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
                <Button type="submit" loading={submitting}>
                  {editingId ? "Update" : "Add"} Investment
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Sell Investment Form */}
      {showSellForm && sellingId && (
        <Card>
          <CardHeader>
            <CardTitle>Sell Investment</CardTitle>
            <CardDescription>Record the sale of an investment</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSell} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="saleDate">Sale Date</Label>
                  <DatePicker
                    value={sellFormData.saleDate}
                    onChange={(value) =>
                      setSellFormData({ ...sellFormData, saleDate: value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="saleProceeds">Sale Proceeds</Label>
                  <Input
                    id="saleProceeds"
                    type="number"
                    step="0.01"
                    min="0"
                    value={sellFormData.saleProceeds}
                    onChange={(e) =>
                      setSellFormData({
                        ...sellFormData,
                        saleProceeds: e.target.value,
                      })
                    }
                    placeholder="0.00"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sellCurrency">Currency</Label>
                  <Select
                    id="sellCurrency"
                    value={sellFormData.currency}
                    onChange={(e) =>
                      setSellFormData({
                        ...sellFormData,
                        currency: e.target.value,
                      })
                    }
                  >
                    {CURRENCIES.map((curr) => (
                      <option key={curr} value={curr}>
                        {curr}
                      </option>
                    ))}
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sellNote">Note (Optional)</Label>
                  <Input
                    id="sellNote"
                    value={sellFormData.note}
                    onChange={(e) =>
                      setSellFormData({ ...sellFormData, note: e.target.value })
                    }
                    placeholder="Additional notes"
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowSellForm(false);
                    setSellingId(null);
                  }}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button type="submit" loading={submitting}>
                  Record Sale
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Add Return Form */}
      {showReturnForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add Investment Return</CardTitle>
            <CardDescription>
              Record dividends, interest, rental income, or other returns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleReturnSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="returnType">Return Type</Label>
                  <Select
                    id="returnType"
                    value={returnFormData.returnType}
                    onChange={(e) =>
                      setReturnFormData({
                        ...returnFormData,
                        returnType: e.target.value,
                      })
                    }
                    required
                  >
                    {RETURN_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="returnDate">Return Date</Label>
                  <DatePicker
                    value={returnFormData.returnDate}
                    onChange={(value) =>
                      setReturnFormData({
                        ...returnFormData,
                        returnDate: value,
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="returnAmount">Amount</Label>
                  <Input
                    id="returnAmount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={returnFormData.amount}
                    onChange={(e) =>
                      setReturnFormData({
                        ...returnFormData,
                        amount: e.target.value,
                      })
                    }
                    placeholder="0.00"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="returnCurrency">Currency</Label>
                  <Select
                    id="returnCurrency"
                    value={returnFormData.currency}
                    onChange={(e) =>
                      setReturnFormData({
                        ...returnFormData,
                        currency: e.target.value,
                      })
                    }
                  >
                    {CURRENCIES.map((curr) => (
                      <option key={curr} value={curr}>
                        {curr}
                      </option>
                    ))}
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="returnInvestmentName">Investment Name (Optional)</Label>
                  <Input
                    id="returnInvestmentName"
                    value={returnFormData.investmentName}
                    onChange={(e) =>
                      setReturnFormData({
                        ...returnFormData,
                        investmentName: e.target.value,
                      })
                    }
                    placeholder="e.g., Apple Stock"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="returnInvestmentType">Investment Type (Optional)</Label>
                  <Select
                    id="returnInvestmentType"
                    value={returnFormData.investmentType}
                    onChange={(e) =>
                      setReturnFormData({
                        ...returnFormData,
                        investmentType: e.target.value,
                      })
                    }
                  >
                    <option value="">Select type</option>
                    {INVESTMENT_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </Select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="returnNote">Note (Optional)</Label>
                  <Input
                    id="returnNote"
                    value={returnFormData.note}
                    onChange={(e) =>
                      setReturnFormData({
                        ...returnFormData,
                        note: e.target.value,
                      })
                    }
                    placeholder="Additional notes"
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowReturnForm(false)}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button type="submit" loading={submitting}>
                  Add Return
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Investments List */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Active Investments</h2>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : activeInvestments.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No active investments found
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {activeInvestments.map((investment) => {
              const unrealizedGain = investment.currentValueInBDT
                ? parseFloat(investment.currentValueInBDT) -
                  parseFloat(investment.amountInBDT)
                : 0;

              return (
                <Card key={investment.id}>
                  <CardContent className="pt-4 sm:pt-6">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          <h3 className="text-base sm:text-lg font-semibold truncate">
                            {investment.name}
                          </h3>
                          {investment.ticker && (
                            <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
                              ({investment.ticker})
                            </span>
                          )}
                          <span className="px-2 py-0.5 sm:py-1 text-xs rounded-full bg-primary/10 text-primary whitespace-nowrap">
                            {investment.type}
                          </span>
                          <span
                            className={`px-2 py-0.5 sm:py-1 text-xs rounded-full whitespace-nowrap ${
                              investment.status === "ACTIVE"
                                ? "bg-green-100 text-green-800"
                                : investment.status === "MATURED"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {investment.status}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 text-xs sm:text-sm">
                          <div>
                            <p className="text-muted-foreground mb-1">Invested</p>
                            <p className="font-semibold text-sm sm:text-base">
                              {formatMoney(investment.amountInBDT)}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground mb-1">Current Value</p>
                            <p className="font-semibold text-sm sm:text-base">
                              {investment.currentValueInBDT
                                ? formatMoney(investment.currentValueInBDT)
                                : "Not set"}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground mb-1">Gain/Loss</p>
                            <p
                              className={`font-semibold text-sm sm:text-base ${
                                unrealizedGain >= 0
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {investment.currentValueInBDT
                                ? formatMoney(unrealizedGain.toString())
                                : "-"}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground mb-1">Date</p>
                            <p className="font-semibold text-sm sm:text-base">
                              {formatDate(investment.transactionDate)}
                            </p>
                          </div>
                        </div>
                        {investment.maturityDate && (
                          <div className="mt-2 text-xs sm:text-sm text-muted-foreground">
                            Maturity: {formatDate(investment.maturityDate)}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2 sm:flex-col sm:gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(investment)}
                          disabled={submitting}
                          className="flex-1 sm:flex-none"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSellClick(investment)}
                          disabled={submitting || investment.status === "SOLD"}
                          className="flex-1 sm:flex-none"
                        >
                          <DollarSign className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteInvestment.mutate(investment.id)}
                          disabled={submitting}
                          className="flex-1 sm:flex-none"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Returns List */}
      {returns.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Returns</h2>
          <div className="grid gap-4">
            {returns.map((ret) => (
              <Card key={ret.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">
                          {ret.investmentName || "Investment Return"}
                        </h3>
                        <span className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary">
                          {ret.returnType}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {formatDate(ret.returnDate)}
                      </p>
                    </div>
                    <p className="text-lg font-bold text-green-600">
                      {formatMoney(ret.amountInBDT)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

