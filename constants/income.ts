export const INCOME_GROUPS = {
  Employment: ["Salary", "Bonus", "Commission"],
  Business: ["Freelance", "Consulting", "Side Business"],
  "Passive Income": ["Investment Returns", "Dividends", "Interest", "Rental Income"],
  Personal: ["Bill Split", "Reimbursement", "Refund/Return", "Gift", "Other"],
} as const;

export type IncomeGroup = keyof typeof INCOME_GROUPS;

export const INCOME_SOURCE_METADATA: Record<string, {
  group: IncomeGroup;
  color: string;
  icon: string;
  description: string;
}> = {
  // Employment
  "Salary": {
    group: "Employment",
    color: "#10b981",
    icon: "Briefcase",
    description: "Regular employment salary",
  },
  "Bonus": {
    group: "Employment",
    color: "#059669",
    icon: "Gift",
    description: "Performance bonus or incentives",
  },
  "Commission": {
    group: "Employment",
    color: "#34d399",
    icon: "TrendingUp",
    description: "Sales commission or performance-based pay",
  },

  // Business
  "Freelance": {
    group: "Business",
    color: "#3b82f6",
    icon: "Laptop",
    description: "Freelance project income",
  },
  "Consulting": {
    group: "Business",
    color: "#2563eb",
    icon: "MessageSquare",
    description: "Consulting fees",
  },
  "Side Business": {
    group: "Business",
    color: "#60a5fa",
    icon: "Store",
    description: "Side business or entrepreneurial income",
  },

  // Passive Income
  "Investment Returns": {
    group: "Passive Income",
    color: "#8b5cf6",
    icon: "TrendingUp",
    description: "Returns from investments",
  },
  "Dividends": {
    group: "Passive Income",
    color: "#7c3aed",
    icon: "PieChart",
    description: "Stock or fund dividends",
  },
  "Interest": {
    group: "Passive Income",
    color: "#a78bfa",
    icon: "Percent",
    description: "Interest from savings or deposits",
  },
  "Rental Income": {
    group: "Passive Income",
    color: "#6d28d9",
    icon: "Home",
    description: "Rental property income",
  },

  // Personal
  "Bill Split": {
    group: "Personal",
    color: "#06b6d4",
    icon: "Users",
    description: "Money received from shared expenses",
  },
  "Reimbursement": {
    group: "Personal",
    color: "#0891b2",
    icon: "Receipt",
    description: "Expense reimbursements",
  },
  "Refund/Return": {
    group: "Personal",
    color: "#22d3ee",
    icon: "RotateCcw",
    description: "Refunds or returns from purchases",
  },
  "Gift": {
    group: "Personal",
    color: "#ec4899",
    icon: "Gift",
    description: "Monetary gifts received",
  },
  "Other": {
    group: "Personal",
    color: "#6b7280",
    icon: "MoreHorizontal",
    description: "Other income sources",
  },
};

// Helper function to get metadata for a source
export function getIncomeMetadata(source: string) {
  return INCOME_SOURCE_METADATA[source] || INCOME_SOURCE_METADATA["Other"];
}

// Helper function to get all sources in a group
export function getSourcesByGroup(group: IncomeGroup): readonly string[] {
  return INCOME_GROUPS[group];
}

// Helper function to get group for a source
export function getGroupForSource(source: string): IncomeGroup {
  const metadata = getIncomeMetadata(source);
  return metadata.group;
}
