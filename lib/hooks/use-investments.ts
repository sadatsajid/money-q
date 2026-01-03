import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { QUERY_TIME } from "@/lib/constants/query";

export type InvestmentTransaction = {
  id: string;
  investmentId?: string | null;
  transactionType: string;
  transactionDate: string;
  name: string;
  type: string;
  quantity: string;
  pricePerUnit?: string | null;
  totalAmount: string;
  currency: string;
  amountInBDT: string;
  currentValue?: string | null;
  currentValueInBDT?: string | null;
  saleProceeds?: string | null;
  saleProceedsInBDT?: string | null;
  realizedGain?: string | null;
  realizedGainInBDT?: string | null;
  sourceType: string;
  savingsBucketId?: string | null;
  incomeId?: string | null;
  sourceNote?: string | null;
  ticker?: string | null;
  maturityDate?: string | null;
  accountName?: string | null;
  status: string;
  note?: string | null;
  savingsBucket?: {
    id: string;
    name: string;
  } | null;
  income?: {
    id: string;
    date: string;
    source: string;
    amount: string;
  } | null;
};

type InvestmentFormData = {
  transactionType?: string;
  transactionDate: string;
  name: string;
  type: string;
  quantity?: number;
  pricePerUnit?: number;
  totalAmount: string;
  currency?: string;
  currentValue?: string;
  sourceType: string;
  savingsBucketId?: string;
  incomeId?: string;
  sourceNote?: string;
  ticker?: string;
  maturityDate?: string;
  accountName?: string;
  investmentId?: string;
  note?: string;
};

type SellInvestmentData = {
  saleDate: string;
  saleProceeds: string;
  currency?: string;
  note?: string;
};

// Query key factory
export const investmentKeys = {
  all: ["investments"] as const,
  lists: () => [...investmentKeys.all, "list"] as const,
  list: (filters?: { type?: string; status?: string; transactionType?: string }) => 
    [...investmentKeys.lists(), filters] as const,
  details: () => [...investmentKeys.all, "detail"] as const,
  detail: (id: string) => [...investmentKeys.details(), id] as const,
  portfolio: () => [...investmentKeys.all, "portfolio"] as const,
};

// Fetch investments - loads all data, filtering is done client-side
export function useInvestments(filters?: { type?: string; status?: string; transactionType?: string }) {
  return useQuery({
    queryKey: investmentKeys.list(filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.type) params.append("type", filters.type);
      if (filters?.status) params.append("status", filters.status);
      if (filters?.transactionType) params.append("transactionType", filters.transactionType);

      const response = await fetch(`/api/investments?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch investments");
      }
      const { transactions } = await response.json();
      return transactions as InvestmentTransaction[];
    },
    staleTime: QUERY_TIME.SHORT,
  });
}

// Fetch single investment
export function useInvestment(id: string) {
  return useQuery({
    queryKey: investmentKeys.detail(id),
    queryFn: async () => {
      const response = await fetch(`/api/investments/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch investment");
      }
      const { transaction } = await response.json();
      return transaction as InvestmentTransaction;
    },
    enabled: !!id,
    staleTime: QUERY_TIME.SHORT,
  });
}

// Fetch portfolio summary
export function usePortfolio() {
  return useQuery({
    queryKey: investmentKeys.portfolio(),
    queryFn: async () => {
      const response = await fetch("/api/investments/portfolio");
      if (!response.ok) {
        throw new Error("Failed to fetch portfolio");
      }
      const { portfolio } = await response.json();
      return portfolio;
    },
    staleTime: QUERY_TIME.MEDIUM,
  });
}

// Create investment mutation
export function useCreateInvestment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: InvestmentFormData) => {
      const response = await fetch("/api/investments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error || "Failed to create investment");
      }

      const { transaction } = await response.json();
      return transaction as InvestmentTransaction;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: investmentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: investmentKeys.portfolio() });
      toast.success("Investment added successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to add investment");
    },
  });
}

// Update investment mutation
export function useUpdateInvestment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InvestmentFormData & { currentValue?: string; status?: string }> }) => {
      const response = await fetch(`/api/investments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error || "Failed to update investment");
      }

      const { transaction } = await response.json();
      return transaction as InvestmentTransaction;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: investmentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: investmentKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: investmentKeys.portfolio() });
      toast.success("Investment updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update investment");
    },
  });
}

// Sell investment mutation
export function useSellInvestment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: SellInvestmentData }) => {
      const response = await fetch(`/api/investments/${id}/sell`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error || "Failed to sell investment");
      }

      const { transaction } = await response.json();
      return transaction as InvestmentTransaction;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: investmentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: investmentKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: investmentKeys.portfolio() });
      toast.success("Investment sold successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to sell investment");
    },
  });
}

// Delete investment mutation
export function useDeleteInvestment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/investments/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete investment");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: investmentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: investmentKeys.portfolio() });
      toast.success("Investment deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete investment");
    },
  });
}

