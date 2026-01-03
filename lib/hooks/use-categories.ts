import { useQuery } from "@tanstack/react-query";
import { QUERY_TIME } from "@/lib/constants/query";

export type Category = {
  id: string;
  name: string;
  icon?: string | null;
  color?: string | null;
};

// Query key factory
export const categoryKeys = {
  all: ["categories"] as const,
  lists: () => [...categoryKeys.all, "list"] as const,
};

// Fetch categories
export function useCategories() {
  return useQuery({
    queryKey: categoryKeys.lists(),
    queryFn: async () => {
      const response = await fetch("/api/categories");
      if (!response.ok) {
        throw new Error("Failed to fetch categories");
      }
      const { categories } = await response.json();
      return categories as Category[];
    },
    staleTime: QUERY_TIME.MEDIUM,
  });
}

