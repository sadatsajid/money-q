import type { InvestmentTransaction } from "@/lib/hooks/use-investments";

/**
 * Filter investments by month
 * @param investments - Array of investment transactions
 * @param month - Month in format YYYY-MM
 * @returns Filtered array of investments
 */
export function filterInvestmentsByMonth(
  investments: InvestmentTransaction[],
  month: string
): InvestmentTransaction[] {
  if (!month) return investments;

  const [year, monthNum] = month.split("-");
  const startDate = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
  const endDate = new Date(parseInt(year), parseInt(monthNum), 0, 23, 59, 59, 999);

  return investments.filter((investment) => {
    const transactionDate = new Date(investment.transactionDate);
    return transactionDate >= startDate && transactionDate <= endDate;
  });
}

/**
 * Filter investments by multiple criteria
 * @param investments - Array of investment transactions
 * @param filters - Filter criteria
 * @returns Filtered array of investments
 */
export function filterInvestments(
  investments: InvestmentTransaction[],
  filters: {
    month?: string;
    type?: string;
    status?: string;
    transactionType?: string;
  }
): InvestmentTransaction[] {
  let filtered = investments;

  if (filters.month) {
    filtered = filterInvestmentsByMonth(filtered, filters.month);
  }

  if (filters.type) {
    filtered = filtered.filter((inv) => inv.type === filters.type);
  }

  if (filters.status) {
    filtered = filtered.filter((inv) => inv.status === filters.status);
  }

  if (filters.transactionType) {
    filtered = filtered.filter((inv) => inv.transactionType === filters.transactionType);
  }

  return filtered;
}

