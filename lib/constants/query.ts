/**
 * Query time constants for TanStack Query
 * All times are in milliseconds
 */
export const QUERY_TIME = {
  // Short-lived data (expenses, income, transactions)
  SHORT: 60 * 1000, // 1 minute

  // Medium-lived data (categories, payment methods, settings)
  MEDIUM: 5 * 60 * 1000, // 5 minutes

  // Long-lived data (static reference data)
  LONG: 30 * 60 * 1000, // 30 minutes

  // Very long-lived data (rarely changes)
  VERY_LONG: 60 * 60 * 1000, // 1 hour
} as const;

