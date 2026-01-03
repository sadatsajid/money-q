import type { SavingsBucket } from "@/lib/hooks/use-savings";

export function calculateProgress(bucket: SavingsBucket): number {
  if (!bucket.targetAmount) return 0;
  const current = parseFloat(bucket.currentBalance);
  const target = parseFloat(bucket.targetAmount);
  return Math.min((current / target) * 100, 100);
}

