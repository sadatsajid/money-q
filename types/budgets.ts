export interface Category {
  id: string;
  name: string;
  icon?: string | null;
  color?: string | null;
}

export interface Budget {
  id: string;
  categoryId: string;
  category: Category;
  amount: string;
  spent: string;
  remaining: string;
  percentage: number;
}

export type AlertLevel = "safe" | "warning" | "danger" | "critical";

