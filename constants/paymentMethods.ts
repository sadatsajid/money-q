export const PAYMENT_METHOD_TYPES = [
  "Cash",
  "Credit Card",
  "Debit Card",
  "Digital Wallet",
  "Bank Transfer",
] as const;

export const DIGITAL_WALLET_PROVIDERS = [
  "bKash",
  "Nagad",
  "Rocket",
  "Upay",
  "Others",
] as const;

export const INCOME_SOURCES = [
  // Employment
  "Salary",
  "Bonus",
  "Commission",
  // Business
  "Freelance",
  "Consulting",
  "Side Business",
  // Passive Income
  "Investment Returns",
  "Dividends",
  "Interest",
  "Rental Income",
  // Personal
  "Bill Split",
  "Reimbursement",
  "Refund/Return",
  "Gift",
  "Other",
] as const;

export const CURRENCIES = ["BDT", "USD", "EUR", "GBP", "MYR", "SGD"] as const;

export const SAVINGS_BUCKET_TYPES = [
  "Trip Fund",
  "Emergency Fund",
  "Investment Pool",
  "Custom",
] as const;

export const RECURRING_FREQUENCIES = ["MONTHLY", "WEEKLY", "YEARLY"] as const;

