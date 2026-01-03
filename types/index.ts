import { Prisma } from "@prisma/client";

// Expense types
export type ExpenseWithRelations = Prisma.ExpenseGetPayload<{
  include: {
    category: true;
    paymentMethod: true;
    recurringExpense: true;
  };
}>;

export type ExpenseCreateInput = {
  date: Date;
  merchant: string;
  categoryId: string;
  amount: string;
  currency?: string;
  paymentMethodId: string;
  note?: string;
};

// Income types
export type IncomeWithRelations = Prisma.IncomeGetPayload<{
  include: {
    user: true;
  };
}>;

export type IncomeCreateInput = {
  date: Date;
  source: string;
  amount: string;
  currency?: string;
  note?: string;
};

// Recurring Expense types
export type RecurringExpenseWithRelations = Prisma.RecurringExpenseGetPayload<{
  include: {
    category: true;
    expenses: true;
  };
}>;

export type RecurringExpenseCreateInput = {
  name: string;
  categoryId: string;
  amount: string;
  currency?: string;
  frequency?: string;
  startDate: Date;
  endDate?: Date;
  autoAdd?: boolean;
};

// Savings types
export type SavingsBucketWithRelations = Prisma.SavingsBucketGetPayload<{
  include: {
    distributions: true;
  };
}>;

export type SavingsBucketCreateInput = {
  name: string;
  type: string;
  targetAmount?: string;
  targetDate?: Date;
  monthlyContribution?: string;
  autoDistributePercent?: string;
};

export type SavingsDistributionCreateInput = {
  bucketId: string;
  month: string;
  amount: string;
  note?: string;
};

// Payment Method types
export type PaymentMethodWithRelations = Prisma.PaymentMethodGetPayload<{
  include: {
    expenses: true;
  };
}>;

export type PaymentMethodCreateInput = {
  name: string;
  type: string;
  provider?: string;
  lastFour?: string;
};

// Budget types
export type BudgetWithRelations = Prisma.BudgetGetPayload<{
  include: {
    category: true;
  };
}>;

export type BudgetCreateInput = {
  categoryId: string;
  month: string;
  amount: string;
};

// Monthly Summary types
export type MonthlySummary = {
  month: string;
  totalIncome: string;
  totalExpenses: string;
  netSavings: string;
  savingsRate: number;
  expensesByCategory: Array<{
    categoryId: string;
    categoryName: string;
    total: string;
    percentage: number;
  }>;
  recurringExpensesTotal: string;
  variableExpensesTotal: string;
};

// API Response types
export type ApiResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};

// Serialized types (for API responses - Decimal as string)
export type SerializedExpense = Omit<
  ExpenseWithRelations,
  "amount" | "amountInBDT"
> & {
  amount: string;
  amountInBDT: string;
};

export type SerializedIncome = Omit<IncomeWithRelations, "amount"> & {
  amount: string;
};

export type SerializedRecurringExpense = Omit<
  RecurringExpenseWithRelations,
  "amount"
> & {
  amount: string;
};

export type SerializedSavingsBucket = Omit<
  SavingsBucketWithRelations,
  "currentBalance" | "targetAmount" | "monthlyContribution" | "autoDistributePercent"
> & {
  currentBalance: string;
  targetAmount?: string;
  monthlyContribution?: string;
  autoDistributePercent?: string;
};

