import { useQuery } from "@tanstack/react-query";
import { QUERY_TIME } from "@/lib/constants/query";

export type PaymentMethod = {
  id: string;
  name: string;
  type: string;
};

// Query key factory
export const paymentMethodKeys = {
  all: ["paymentMethods"] as const,
  lists: () => [...paymentMethodKeys.all, "list"] as const,
};

// Fetch payment methods
export function usePaymentMethods() {
  return useQuery({
    queryKey: paymentMethodKeys.lists(),
    queryFn: async () => {
      const response = await fetch("/api/payment-methods");
      if (!response.ok) {
        throw new Error("Failed to fetch payment methods");
      }
      const { paymentMethods } = await response.json();
      return paymentMethods as PaymentMethod[];
    },
    staleTime: QUERY_TIME.MEDIUM,
  });
}

