import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { QUERY_TIME } from "@/lib/constants/query";

export type ExchangeRate = {
  id: string;
  month: string;
  currency: string;
  rate: string;
  createdAt: string;
};

// Query key factory
export const exchangeRateKeys = {
  all: ["exchangeRates"] as const,
  lists: () => [...exchangeRateKeys.all, "list"] as const,
  list: (month: string) => [...exchangeRateKeys.lists(), month] as const,
};

// Fetch exchange rates
export function useExchangeRates(month: string) {
  return useQuery({
    queryKey: exchangeRateKeys.list(month),
    queryFn: async () => {
      const response = await fetch(`/api/exchange-rates?month=${month}`);
      if (!response.ok) {
        throw new Error("Failed to fetch exchange rates");
      }
      const { rates } = await response.json();
      return rates as ExchangeRate[];
    },
    staleTime: QUERY_TIME.MEDIUM,
  });
}

// Refresh exchange rates mutation
export function useRefreshExchangeRates() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (month: string) => {
      const response = await fetch("/api/exchange-rates/fetch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ month }),
      });

      if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error || "Failed to refresh exchange rates");
      }

      const { rates } = await response.json();
      return rates as ExchangeRate[];
    },
    onSuccess: (_, month) => {
      queryClient.invalidateQueries({ queryKey: exchangeRateKeys.list(month) });
      toast.success("Exchange rates refreshed successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to refresh exchange rates");
    },
  });
}

