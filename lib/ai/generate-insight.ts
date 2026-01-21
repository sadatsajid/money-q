// AI Insights generation temporarily disabled
import { prisma } from "@/lib/prisma";
import { Money, sumMoney } from "@/lib/money";
/* 
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
*/

/**
 * Generate monthly insights for a user
 * @param userId - User ID
 * @param month - Month in format "YYYY-MM"
 * @returns Generated insight or null if already exists
 */
export async function generateMonthlyInsight(
  userId: string,
  month: string
): Promise<{ success: boolean; insightId?: string; error?: string }> {
  try {
    // Check if insights already exist for this month
    const existingInsight = await prisma.monthlyInsight.findUnique({
      where: {
        userId_month: {
          userId,
          month,
        },
      },
    });

    if (existingInsight) {
      return { success: true, insightId: existingInsight.id };
    }

    const [year, monthNum] = month.split("-");
    const startDate = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(monthNum), 0, 23, 59, 59, 999);

    // Fetch data for the month
    const [incomes, expenses, savingsBuckets] = await Promise.all([
      prisma.income.findMany({
        where: {
          userId,
          date: { gte: startDate, lte: endDate },
        },
      }),
      prisma.expense.findMany({
        where: {
          userId,
          deletedAt: null,
          date: { gte: startDate, lte: endDate },
        },
        include: {
          category: true,
        },
      }),
      prisma.savingsBucket.findMany({
        where: { userId },
      }),
    ]);

    // Calculate totals
    const totalIncome = sumMoney(
      incomes.map((inc) => new Money(inc.amount.toString()))
    );
    const totalExpenses = sumMoney(
      expenses.map((exp) => new Money(exp.amountInBDT.toString()))
    );
    const netSavings = totalIncome.subtract(totalExpenses);

    // Category breakdown
    const categoryTotals: { [key: string]: { name: string; total: number } } = {};
    expenses.forEach((exp) => {
      const catName = exp.category.name;
      if (!categoryTotals[catName]) {
        categoryTotals[catName] = { name: catName, total: 0 };
      }
      categoryTotals[catName].total += parseFloat(exp.amountInBDT.toString());
    });

    const topCategories = Object.values(categoryTotals)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    // Get previous month for comparison
    const prevMonth = new Date(parseInt(year), parseInt(monthNum) - 2, 1);
    const prevMonthStr = `${prevMonth.getFullYear()}-${String(prevMonth.getMonth() + 1).padStart(2, "0")}`;
    
    const prevExpenses = await prisma.expense.findMany({
      where: {
        userId,
        deletedAt: null,
        date: {
          gte: new Date(prevMonth.getFullYear(), prevMonth.getMonth(), 1),
          lte: new Date(prevMonth.getFullYear(), prevMonth.getMonth() + 1, 0, 23, 59, 59),
        },
      },
    });

    const prevTotalExpenses = sumMoney(
      prevExpenses.map((exp) => new Money(exp.amountInBDT.toString()))
    );

    // Prepare context for AI
    const context = {
      month,
      currency: "BDT",
      income: totalIncome.toNumber(),
      expenses: totalExpenses.toNumber(),
      netSavings: netSavings.toNumber(),
      savingsRate: totalIncome.isZero() ? 0 : (netSavings.toNumber() / totalIncome.toNumber()) * 100,
      topCategories: topCategories.map((c) => ({
        name: c.name,
        amount: c.total,
        percentage: totalExpenses.isZero() ? 0 : (c.total / totalExpenses.toNumber()) * 100,
      })),
      previousMonthExpenses: prevTotalExpenses.toNumber(),
      expenseChange: prevTotalExpenses.isZero()
        ? 0
        : ((totalExpenses.toNumber() - prevTotalExpenses.toNumber()) / prevTotalExpenses.toNumber()) * 100,
      savingsBuckets: savingsBuckets.map((b) => ({
        name: b.name,
        balance: parseFloat(b.currentBalance.toString()),
        target: b.targetAmount ? parseFloat(b.targetAmount.toString()) : null,
      })),
    };

    // Generate insights with AI
    const prompt = `You are a financial advisor for a user in Bangladesh. Analyze this month's financial data and provide personalized insights in markdown format.

Financial Data for ${month}:
- Total Income: ৳${context.income.toLocaleString()}
- Total Expenses: ৳${context.expenses.toLocaleString()}
- Net Savings: ৳${context.netSavings.toLocaleString()}
- Savings Rate: ${context.savingsRate.toFixed(1)}%
- Previous Month Expenses: ৳${context.previousMonthExpenses.toLocaleString()}
- Month-over-Month Change: ${context.expenseChange > 0 ? "+" : ""}${context.expenseChange.toFixed(1)}%

Top Spending Categories:
${context.topCategories.map((c) => `- ${c.name}: ৳${c.amount.toLocaleString()} (${c.percentage.toFixed(1)}%)`).join("\n")}

Savings Goals:
${context.savingsBuckets.map((b) => `- ${b.name}: ৳${b.balance.toLocaleString()}${b.target ? ` / ৳${b.target.toLocaleString()}` : ""}`).join("\n")}

Provide insights on:
1. **Spending Patterns**: Notable trends or anomalies
2. **Savings Performance**: Progress toward goals
3. **Recommendations**: Actionable advice specific to Bangladesh (consider local costs, investment options like NSC/Sanchayapatra, etc.)
4. **Areas of Concern**: Any red flags

Keep it concise (3-4 paragraphs), encouraging, and actionable. Use markdown formatting.`;

    // AI generation temporarily disabled
    // const completion = await openai.chat.completions.create({
    //   model: process.env.OPENAI_MODEL || "gpt-5-mini",
    //   messages: [
    //     {
    //       role: "system",
    //       content: "You are a helpful financial advisor with expertise in personal finance in Bangladesh. Provide clear, actionable insights.",
    //     },
    //     {
    //       role: "user",
    //       content: prompt,
    //     },
    //   ],
    //   max_completion_tokens: 800,
    // });

    // const insightContent = completion.choices[0]?.message?.content || "No insights generated.";
    const insightContent = "AI Insights feature is temporarily disabled.";

    // Save insight to database
    const insight = await prisma.monthlyInsight.create({
      data: {
        userId,
        month,
        content: insightContent,
        metadata: context,
      },
    });

    return { success: true, insightId: insight.id };
  } catch (error: any) {
    console.error(`Error generating insight for user ${userId}, month ${month}:`, error);
    return {
      success: false,
      error: error.message || "Failed to generate insights",
    };
  }
}

