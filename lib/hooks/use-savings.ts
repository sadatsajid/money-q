import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { QUERY_TIME } from "@/lib/constants/query";

export type SavingsBucket = {
  id: string;
  name: string;
  type: string;
  currentBalance: string;
  targetAmount?: string | null;
  targetDate?: string | null;
  monthlyContribution?: string | null;
  autoDistributePercent?: string | null;
  distributions: Array<{
    id: string;
    month: string;
    amount: string;
    note?: string | null;
  }>;
};

type SavingsFormData = {
  name: string;
  type: string;
  targetAmount?: string | null;
  targetDate?: string | null;
  monthlyContribution?: string | null;
  autoDistributePercent?: string | null;
};

type DistributionData = {
  month: string;
  distributions: Array<{
    bucketId: string;
    amount: string;
    note?: string;
  }>;
};

// Query key factory
export const savingsKeys = {
  all: ["savings"] as const,
  lists: () => [...savingsKeys.all, "list"] as const,
  details: () => [...savingsKeys.all, "detail"] as const,
  detail: (id: string) => [...savingsKeys.details(), id] as const,
};

// Fetch savings buckets
export function useSavingsBuckets() {
  return useQuery({
    queryKey: savingsKeys.lists(),
    queryFn: async () => {
      const response = await fetch("/api/savings");
      if (!response.ok) {
        throw new Error("Failed to fetch savings buckets");
      }
      const { savingsBuckets } = await response.json();
      return savingsBuckets as SavingsBucket[];
    },
    staleTime: QUERY_TIME.SHORT,
  });
}

// Create savings bucket mutation
export function useCreateSavingsBucket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: SavingsFormData) => {
      const response = await fetch("/api/savings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          targetAmount: data.targetAmount || null,
          targetDate: data.targetDate || null,
          monthlyContribution: data.monthlyContribution || null,
          autoDistributePercent: data.autoDistributePercent || null,
        }),
      });

      if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error || "Failed to create savings bucket");
      }

      const { savingsBucket } = await response.json();
      return savingsBucket as SavingsBucket;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: savingsKeys.lists() });
      toast.success("Savings bucket created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create savings bucket");
    },
  });
}

// Update savings bucket mutation
export function useUpdateSavingsBucket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: SavingsFormData }) => {
      const response = await fetch(`/api/savings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          targetAmount: data.targetAmount || null,
          targetDate: data.targetDate || null,
          monthlyContribution: data.monthlyContribution || null,
          autoDistributePercent: data.autoDistributePercent || null,
        }),
      });

      if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error || "Failed to update savings bucket");
      }

      const { savingsBucket } = await response.json();
      return savingsBucket as SavingsBucket;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: savingsKeys.lists() });
      toast.success("Savings bucket updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update savings bucket");
    },
  });
}

// Delete savings bucket mutation
export function useDeleteSavingsBucket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/savings/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error || "Failed to delete savings bucket");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: savingsKeys.lists() });
      toast.success("Savings bucket deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete savings bucket");
    },
  });
}

// Distribute savings mutation
export function useDistributeSavings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: DistributionData) => {
      const response = await fetch("/api/savings/distribute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error || "Failed to distribute savings");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: savingsKeys.lists() });
      toast.success("Savings distributed successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to distribute savings");
    },
  });
}

