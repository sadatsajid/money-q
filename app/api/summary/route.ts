import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { Money, sumMoney } from "@/lib/money";
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

    // Separate recurring vs variable expenses
    const recurringExpensesTotal = sumMoney(
      expenses
        .filter((exp) => exp.isRecurring)
        .map((exp) => new Money(exp.amountInBDT.toString()))
    );

    const variableExpensesTotal = totalExpenses.subtract(recurringExpensesTotal);

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

