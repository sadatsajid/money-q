import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { QUERY_TIME } from "@/lib/constants/query";

export type Insight = {
  id: string;
  month: string;
  content: string;
  createdAt: string;
};

// Query key factory
export const insightKeys = {
  all: ["insights"] as const,
  lists: () => [...insightKeys.all, "list"] as const,
  list: (month: string) => [...insightKeys.lists(), month] as const,
};

// Fetch insight
export function useInsight(month: string) {
  return useQuery({
    queryKey: insightKeys.list(month),
    queryFn: async () => {
      const response = await fetch(`/api/ai/insights?month=${month}`);
      if (!response.ok) {
        throw new Error("Failed to fetch insight");
      }
      const { insight } = await response.json();
      return insight as Insight | null;
    },
    staleTime: QUERY_TIME.MEDIUM,
  });
}

// Generate insight mutation
export function useGenerateInsight() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (month: string) => {
      const response = await fetch("/api/ai/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ month }),
      });

      if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error || "Failed to generate insights");
      }

      const { insight } = await response.json();
      return insight as Insight;
    },
    onSuccess: (_, month) => {
      queryClient.invalidateQueries({ queryKey: insightKeys.list(month) });
      toast.success("Insights generated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to generate insights");
    },
  });
}

