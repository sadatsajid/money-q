import { prisma } from "@/lib/prisma";
import { Money, sumMoney } from "@/lib/money";

export async function buildFinancialContext(userId: string, month?: string) {
  try {
    const [year, monthNum] = month
      ? month.split("-")
      : [new Date().getFullYear().toString(), (new Date().getMonth() + 1).toString()];

    // Get last 3 months of data for context
    const endDate = new Date(parseInt(year), parseInt(monthNum), 0, 23, 59, 59, 999);
    const startDate = new Date(parseInt(year), parseInt(monthNum) - 3, 1);

    // Fetch expenses
    const expenses = await prisma.expense.findMany({
      where: {
        userId,
        deletedAt: null,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        category: true,
      },
      orderBy: {
        date: "desc",
      },
    });

    // Fetch income
    const incomes = await prisma.income.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    // Fetch savings buckets
    const savingsBuckets = await prisma.savingsBucket.findMany({
      where: { userId },
      orderBy: {
        sortOrder: "asc",
      },
    });

    // Fetch budgets for current month
    const budgets = await prisma.budget.findMany({
      where: {
        userId,
        month: `${year}-${monthNum.padStart(2, "0")}`,
      },
      include: {
        category: true,
      },
    });

    // Calculate totals
    const totalIncome = sumMoney(
      incomes.map((inc) => new Money(inc.amount.toString()))
    );

    const totalExpenses = sumMoney(
      expenses.map((exp) => new Money(exp.amountInBDT.toString()))
    );

    const netSavings = totalIncome.subtract(totalExpenses);
    const savingsRate = totalIncome.isZero()
      ? 0
      : (netSavings.toNumber() / totalIncome.toNumber()) * 100;

    // Group expenses by category
    const expensesByCategory: { [key: string]: { name: string; total: Money } } = {};

    expenses.forEach((expense) => {
      const categoryId = expense.categoryId;
      const categoryName = expense.category.name;

      if (!expensesByCategory[categoryId]) {
        expensesByCategory[categoryId] = {
          name: categoryName,
          total: new Money(0),
        };
      }

      expensesByCategory[categoryId].total = expensesByCategory[categoryId].total.add(
        new Money(expense.amountInBDT.toString())
      );
    });

    // Top 5 categories
    const topCategories = Object.entries(expensesByCategory)
      .map(([id, data]) => ({
        id,
        name: data.name,
        amount: data.total.toNumber(),
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    // Budget analysis
    const budgetAnalysis = budgets.map((budget) => {
      const spent = expenses
        .filter((exp) => exp.categoryId === budget.categoryId)
        .reduce((sum, exp) => sum.add(new Money(exp.amountInBDT.toString())), new Money(0));

      const budgetAmount = new Money(budget.amount.toString());
      const percentage = budgetAmount.isZero()
        ? 0
        : (spent.toNumber() / budgetAmount.toNumber()) * 100;

      return {
        category: budget.category.name,
        budget: budgetAmount.toNumber(),
        spent: spent.toNumber(),
        percentage: Math.round(percentage),
      };
    });

    // Build context string
    const context = `
User Financial Summary (Last 3 months: ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}):

INCOME:
- Total Income: ৳${totalIncome.toNumber().toLocaleString()}
- Number of income entries: ${incomes.length}
- Average monthly income: ৳${(totalIncome.toNumber() / 3).toFixed(2)}

EXPENSES:
- Total Expenses: ৳${totalExpenses.toNumber().toLocaleString()}
- Number of transactions: ${expenses.length}
- Average monthly expenses: ৳${(totalExpenses.toNumber() / 3).toFixed(2)}

SAVINGS:
- Net Savings: ৳${netSavings.toNumber().toLocaleString()}
- Savings Rate: ${savingsRate.toFixed(1)}%

TOP SPENDING CATEGORIES:
${topCategories.map((cat, idx) => `${idx + 1}. ${cat.name}: ৳${cat.amount.toLocaleString()}`).join("\n")}

SAVINGS BUCKETS:
${savingsBuckets.map((bucket) => `- ${bucket.name}: ৳${parseFloat(bucket.currentBalance.toString()).toLocaleString()} ${bucket.targetAmount ? `(Target: ৳${parseFloat(bucket.targetAmount.toString()).toLocaleString()})` : ""}`).join("\n")}

${budgets.length > 0 ? `BUDGETS (Current Month):
${budgetAnalysis.map((b) => `- ${b.category}: ৳${b.spent.toLocaleString()} / ৳${b.budget.toLocaleString()} (${b.percentage}%)`).join("\n")}` : ""}

Currency: BDT (Bangladeshi Taka)
Location: Bangladesh
`;

    return context.trim();
  } catch (error) {
    console.error("Error building financial context:", error);
    return "Unable to load financial data.";
  }
}

