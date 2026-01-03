export const INVESTMENT_TYPES = [
  "Stock",
  "Bond",
  "Mutual Fund",
  "ETF",
  "Real Estate",
  "Crypto",
  "Fixed Deposit",
  "Gold",
  "Shanchaypatra",
  "DPS", // Deposit Pension Scheme
  "Agro Firm", // like iFarmer
  "Other",
] as const;

export const INVESTMENT_STATUS = [
  "ACTIVE",      // Investment is ongoing
  "SOLD",        // Investment was sold/withdrawn
  "MATURED",     // Investment matured (FD, DPS, etc.)
  "RETURNED",    // Investment returned (Shanchaypatra, etc.)
] as const;

export const INVESTMENT_SOURCE_TYPES = [
  "SAVINGS_BUCKET",  // From a savings bucket
  "PAST_SAVINGS",    // From savings before joining app
  "INCOME",          // From current income entry
  "OTHER",           // Other source
] as const;

export const INVESTMENT_TRANSACTION_TYPES = [
  "BUY",    // Purchase/investment
  "SELL",   // Sale/withdrawal
] as const;

export const RETURN_TYPES = [
  "DIVIDEND",     // Stock dividends
  "INTEREST",     // Fixed deposit interest, bond interest
  "RENTAL",       // Real estate rental income
  "PROFIT",       // Agro firm profit, mutual fund returns
  "OTHER",        // Other returns
] as const;

// Grouped constants for easier use (object notation)
export const INVESTMENT_STATUS_VALUES = {
  ACTIVE: "ACTIVE",
  SOLD: "SOLD",
  MATURED: "MATURED",
  RETURNED: "RETURNED",
} as const;

export const INVESTMENT_SOURCE_VALUES = {
  SAVINGS_BUCKET: "SAVINGS_BUCKET",
  PAST_SAVINGS: "PAST_SAVINGS",
  INCOME: "INCOME",
  OTHER: "OTHER",
} as const;

export const INVESTMENT_TRANSACTION_VALUES = {
  BUY: "BUY",
  SELL: "SELL",
} as const;

