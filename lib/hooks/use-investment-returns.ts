import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { QUERY_TIME } from "@/lib/constants/query";

export type InvestmentReturn = {
  id: string;
  transactionId?: string | null;
  returnType: string;
  returnDate: string;
  amount: string;
  currency: string;
  amountInBDT: string;
  investmentName?: string | null;
  investmentType?: string | null;
  note?: string | null;
  transaction?: {
    id: string;
    name: string;
    type: string;
  } | null;
};

type InvestmentReturnFormData = {
  returnType: string;
  returnDate: string;
  amount: string;
  currency?: string;
  transactionId?: string;
  investmentName?: string;
  investmentType?: string;
  note?: string;
};

// Query key factory
export const investmentReturnKeys = {
  all: ["investment-returns"] as const,
  lists: () => [...investmentReturnKeys.all, "list"] as const,
  list: (filters?: { month?: string; returnType?: string; transactionId?: string }) => 
    [...investmentReturnKeys.lists(), filters] as const,
};

// Fetch investment returns
export function useInvestmentReturns(filters?: { month?: string; returnType?: string; transactionId?: string }) {
  return useQuery({
    queryKey: investmentReturnKeys.list(filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.month) params.append("month", filters.month);
      if (filters?.returnType) params.append("returnType", filters.returnType);
      if (filters?.transactionId) params.append("transactionId", filters.transactionId);

      const response = await fetch(`/api/investments/returns?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch investment returns");
      }
      const { returns } = await response.json();
      return returns as InvestmentReturn[];
    },
    staleTime: QUERY_TIME.SHORT,
  });
}

// Create investment return mutation
export function useCreateInvestmentReturn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: InvestmentReturnFormData) => {
      const response = await fetch("/api/investments/returns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error || "Failed to create investment return");
      }

      const { return: returnData } = await response.json();
      return returnData as InvestmentReturn;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: investmentReturnKeys.lists() });
      toast.success("Return added successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to add return");
    },
  });
}

