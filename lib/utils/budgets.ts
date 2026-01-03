import type { AlertLevel } from "@/types/budgets";

export function getAlertLevel(percentage: number): AlertLevel {
  if (percentage < 50) return "safe";
  if (percentage < 75) return "warning";
  if (percentage < 100) return "danger";
  return "critical";
}

export function getProgressColor(level: string): string {
  switch (level) {
    case "safe":
      return "bg-green-500";
    case "warning":
      return "bg-yellow-500";
    case "danger":
      return "bg-orange-500";
    case "critical":
      return "bg-red-500";
    default:
      return "bg-gray-300";
  }
}

