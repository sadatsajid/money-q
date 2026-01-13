import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { Money, sumMoney, convertToBDT } from "@/lib/money";
import { getCurrentMonth } from "@/lib/utils";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const month = searchParams.get("month") || getCurrentMonth();

    const [year, monthNum] = month.split("-");
    const startDate = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(monthNum), 0, 23, 59, 59, 999);

    // Fetch income for the month
    const incomes = await prisma.income.findMany({
      where: {
        userId: session.user.id,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    // Fetch expenses for the month
    const expenses = await prisma.expense.findMany({
      where: {
        userId: session.user.id,
        deletedAt: null,
        date: {
          gte: startDate,
          lte: endDate,
        },
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

    // Calculate savings rate
    const savingsRate = totalIncome.isZero()
      ? 0
      : (netSavings.toNumber() / totalIncome.toNumber()) * 100;

    // Group expenses by category
    const expensesByCategory: { [key: string]: { name: string; total: Money } } = {};

    expenses.forEach((expense) => {
      const categoryId = expense.categoryId;
      if (!expensesByCategory[categoryId]) {
        expensesByCategory[categoryId] = {
          name: expense.category.name,
          total: new Money(0),
        };
      }
      expensesByCategory[categoryId].total = expensesByCategory[categoryId].total.add(
        new Money(expense.amountInBDT.toString())
      );
    });

    const categoryBreakdown = Object.entries(expensesByCategory).map(
      ([categoryId, data]) => ({
        categoryId,
        categoryName: data.name,
        total: data.total.toString(),
        percentage: totalExpenses.isZero()
          ? 0
          : (data.total.toNumber() / totalExpenses.toNumber()) * 100,
      })
    );

    // Fetch recurring expenses (scheduled expenses)
    const recurringExpenses = await prisma.recurringExpense.findMany({
      where: {
        userId: session.user.id,
        deletedAt: null,
        // Check if recurring expense is active for this month
        OR: [
          { endDate: null }, // No end date
          { endDate: { gte: endDate } }, // End date is after or equal to end of month
        ],
        // Check if start date is before or equal to end of month
        startDate: { lte: endDate },
      },
    });

    // Fetch exchange rates for the month
    const globalRates = await prisma.globalExchangeRate.findMany({
      where: { month },
    });
    const userRates = await prisma.exchangeRate.findMany({
      where: {
        userId: session.user.id,
        month,
      },
    });

    // Create rate map (user rates override global rates)
    const rateMap = new Map<string, string>();
    globalRates.forEach((rate) => {
      rateMap.set(rate.currency, rate.rate.toString());
    });
    userRates.forEach((rate) => {
      rateMap.set(rate.currency, rate.rate.toString());
    });

    // Calculate monthly total for recurring expenses
    const monthlyRecurringExpenses = sumMoney(
      recurringExpenses.map((re) => {
        const amountMoney = new Money(re.amount);
        
        // Convert to BDT if needed
        let amountInBDT = amountMoney;
        if (re.currency !== "BDT") {
          const exchangeRate = rateMap.get(re.currency);
          if (exchangeRate) {
            amountInBDT = convertToBDT(amountMoney, re.currency, parseFloat(exchangeRate));
          } else {
            // Fallback rates if no exchange rate found
            const defaultRates: Record<string, number> = {
              USD: 110,
              EUR: 120,
              GBP: 140,
            };
            const fallbackRate = defaultRates[re.currency] || 100;
            amountInBDT = convertToBDT(amountMoney, re.currency, fallbackRate);
          }
        }
        
        // Convert to monthly equivalent based on frequency
        let monthlyAmount = amountInBDT;
        if (re.frequency === "YEARLY") {
          monthlyAmount = amountInBDT.divide(12);
        } else if (re.frequency === "WEEKLY") {
          monthlyAmount = amountInBDT.multiply(52).divide(12); // 52 weeks / 12 months
        }
        // MONTHLY stays as-is
        
        return monthlyAmount;
      })
    );

    // Separate recurring vs variable expenses (from actual transactions)
    const recurringExpensesTotal = sumMoney(
      expenses
        .filter((exp) => exp.isRecurring)
        .map((exp) => new Money(exp.amountInBDT.toString()))
    );

    const variableExpensesTotal = totalExpenses.subtract(recurringExpensesTotal);

    // Total expenses including monthly recurring expenses
    const totalExpensesWithRecurring = totalExpenses.add(monthlyRecurringExpenses);

    // Recalculate net savings with recurring expenses
    const netSavingsWithRecurring = totalIncome.subtract(totalExpensesWithRecurring);

    // Recalculate savings rate
    const savingsRateWithRecurring = totalIncome.isZero()
      ? 0
      : (netSavingsWithRecurring.toNumber() / totalIncome.toNumber()) * 100;

    return NextResponse.json({
      summary: {
        month,
        totalIncome: totalIncome.toString(),
        totalExpenses: totalExpenses.toString(),
        netSavings: netSavings.toString(),
        savingsRate: savingsRate.toFixed(2),
        expensesByCategory: categoryBreakdown,
        recurringExpensesTotal: recurringExpensesTotal.toString(),
        variableExpensesTotal: variableExpensesTotal.toString(),
        monthlyRecurringExpenses: monthlyRecurringExpenses.toString(),
        totalExpensesWithRecurring: totalExpensesWithRecurring.toString(),
        netSavingsWithRecurring: netSavingsWithRecurring.toString(),
        savingsRateWithRecurring: savingsRateWithRecurring.toFixed(2),
        incomeCount: incomes.length,
        expenseCount: expenses.length,
      },
    });
  } catch (error) {
    console.error("Error fetching summary:", error);
    return NextResponse.json(
      { error: "Failed to fetch summary" },
      { status: 500 }
    );
  }
}

