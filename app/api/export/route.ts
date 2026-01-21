import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const month = searchParams.get("month");
    const type = searchParams.get("type") || "expenses"; // expenses, income, recurring, savings, budgets, all

    let csvData = "";

    if (type === "expenses" || type === "all") {
      // Build where clause
      const where: Prisma.ExpenseWhereInput = {
        userId: authUser.id,
        deletedAt: null,
      };

      if (month) {
        const [year, monthNum] = month.split("-");
        const startDate = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
        const endDate = new Date(parseInt(year), parseInt(monthNum), 0, 23, 59, 59, 999);

        where.date = {
          gte: startDate,
          lte: endDate,
        };
      }

      const expenses = await prisma.expense.findMany({
        where,
        include: {
          category: true,
          paymentMethod: true,
          recurringExpense: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          date: "desc",
        },
      });

      // Generate CSV for expenses
      csvData += "Expenses\n";
      csvData += "Date,Merchant,Category,Amount,Currency,Amount in BDT,Payment Method,Note,Recurring\n";

      expenses.forEach((expense) => {
        const date = new Date(expense.date).toLocaleDateString();
        const merchant = `"${expense.merchant.replace(/"/g, '""')}"`;
        const category = `"${expense.category.name}"`;
        const amount = expense.amount.toString();
        const currency = expense.currency;
        const amountInBDT = expense.amountInBDT.toString();
        const paymentMethod = `"${expense.paymentMethod.name}"`;
        const note = expense.note ? `"${expense.note.replace(/"/g, '""')}"` : "";
        const recurring = expense.recurringExpenseId ? "Yes" : "No";

        csvData += `${date},${merchant},${category},${amount},${currency},${amountInBDT},${paymentMethod},${note},${recurring}\n`;
      });

      csvData += `\nTotal Expenses:,,,,,${expenses.reduce((sum, e) => sum + parseFloat(e.amountInBDT.toString()), 0).toFixed(2)}\n\n`;
    }

    if (type === "income" || type === "all") {
      const where: Prisma.IncomeWhereInput = {
        userId: authUser.id,
      };

      if (month) {
        const [year, monthNum] = month.split("-");
        const startDate = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
        const endDate = new Date(parseInt(year), parseInt(monthNum), 0, 23, 59, 59, 999);

        where.date = {
          gte: startDate,
          lte: endDate,
        };
      }

      const incomes = await prisma.income.findMany({
        where,
        orderBy: {
          date: "desc",
        },
      });

      // Generate CSV for income
      csvData += "Income\n";
      csvData += "Date,Source,Amount,Currency,Note\n";

      incomes.forEach((income) => {
        const date = new Date(income.date).toLocaleDateString();
        const source = `"${income.source}"`;
        const amount = income.amount.toString();
        const currency = income.currency;
        const note = income.note ? `"${income.note.replace(/"/g, '""')}"` : "";

        csvData += `${date},${source},${amount},${currency},${note}\n`;
      });

      csvData += `\nTotal Income:,,${incomes.reduce((sum, i) => sum + parseFloat(i.amount.toString()), 0).toFixed(2)}\n\n`;
    }

    if (type === "recurring") {
      const recurringExpenses = await prisma.recurringExpense.findMany({
        where: {
          userId: authUser.id,
        },
        include: {
          category: true,
        },
        orderBy: {
          startDate: "desc",
        },
      });

      // Generate CSV for recurring expenses
      csvData += "Recurring Expenses\n";
      csvData += "Name,Category,Amount,Currency,Frequency,Start Date,End Date,Auto Add\n";

      recurringExpenses.forEach((recurring) => {
        const name = `"${recurring.name.replace(/"/g, '""')}"`;
        const category = `"${recurring.category.name}"`;
        const amount = recurring.amount.toString();
        const currency = recurring.currency;
        const frequency = recurring.frequency;
        const startDate = new Date(recurring.startDate).toLocaleDateString();
        const endDate = recurring.endDate ? new Date(recurring.endDate).toLocaleDateString() : "Ongoing";
        const autoAdd = recurring.autoAdd ? "Yes" : "No";

        csvData += `${name},${category},${amount},${currency},${frequency},${startDate},${endDate},${autoAdd}\n`;
      });

      // Calculate monthly total (convert all to monthly equivalent)
      const monthlyTotal = recurringExpenses.reduce((sum, re) => {
        const amount = parseFloat(re.amount.toString());
        let monthly = amount;
        if (re.frequency === "YEARLY") {
          monthly = amount / 12;
        } else if (re.frequency === "WEEKLY") {
          monthly = amount * 52 / 12;
        }
        return sum + monthly;
      }, 0);

      csvData += `\nEstimated Monthly Total:,,${monthlyTotal.toFixed(2)}\n\n`;
    }

    if (type === "savings") {
      const savingsBuckets = await prisma.savingsBucket.findMany({
        where: {
          userId: authUser.id,
        },
        include: {
          distributions: {
            orderBy: {
              month: "desc",
            },
            take: 1,
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      // Generate CSV for savings buckets
      csvData += "Savings Buckets\n";
      csvData += "Name,Type,Current Balance,Target Amount,Target Date,Monthly Contribution,Auto Distribute %,Last Distribution Month\n";

      savingsBuckets.forEach((bucket) => {
        const name = `"${bucket.name.replace(/"/g, '""')}"`;
        const type = `"${bucket.type}"`;
        const currentBalance = bucket.currentBalance.toString();
        const targetAmount = bucket.targetAmount ? bucket.targetAmount.toString() : "";
        const targetDate = bucket.targetDate ? new Date(bucket.targetDate).toLocaleDateString() : "";
        const monthlyContribution = bucket.monthlyContribution ? bucket.monthlyContribution.toString() : "";
        const autoDistributePercent = bucket.autoDistributePercent ? bucket.autoDistributePercent.toString() : "";
        const lastDistributionMonth = bucket.distributions.length > 0 ? bucket.distributions[0].month : "";

        csvData += `${name},${type},${currentBalance},${targetAmount},${targetDate},${monthlyContribution},${autoDistributePercent},${lastDistributionMonth}\n`;
      });

      const totalSavings = savingsBuckets.reduce(
        (sum, bucket) => sum + parseFloat(bucket.currentBalance.toString()),
        0
      );

      csvData += `\nTotal Savings:,,${totalSavings.toFixed(2)}\n\n`;
    }

    if (type === "budgets") {
      if (!month) {
        return NextResponse.json(
          { error: "Month parameter is required for budget export" },
          { status: 400 }
        );
      }

      const budgets = await prisma.budget.findMany({
        where: {
          userId: authUser.id,
          month,
        },
        include: {
          category: true,
        },
        orderBy: {
          category: {
            sortOrder: "asc",
          },
        },
      });

      // Get actual spending for the month
      const [year, monthNum] = month.split("-");
      const startDate = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
      const endDate = new Date(parseInt(year), parseInt(monthNum), 0, 23, 59, 59, 999);

      const expenses = await prisma.expense.findMany({
        where: {
          userId: authUser.id,
          date: {
            gte: startDate,
            lte: endDate,
          },
          deletedAt: null,
        },
        select: {
          categoryId: true,
          amountInBDT: true,
        },
      });

      // Calculate spending by category
      const spendingByCategory = expenses.reduce((acc, expense) => {
        const categoryId = expense.categoryId;
        if (!acc[categoryId]) {
          acc[categoryId] = 0;
        }
        acc[categoryId] += parseFloat(expense.amountInBDT.toString());
        return acc;
      }, {} as Record<string, number>);

      // Generate CSV for budgets
      csvData += "Budgets\n";
      csvData += "Category,Budget Amount,Spent,Remaining,Percentage\n";

      budgets.forEach((budget) => {
        const spent = spendingByCategory[budget.categoryId] || 0;
        const remaining = parseFloat(budget.amount.toString()) - spent;
        const percentage = parseFloat(budget.amount.toString()) > 0
          ? (spent / parseFloat(budget.amount.toString())) * 100
          : 0;

        const category = `"${budget.category.name}"`;
        const budgetAmount = budget.amount.toString();
        const spentAmount = spent.toFixed(2);
        const remainingAmount = remaining.toFixed(2);
        const percentageValue = percentage.toFixed(2);

        csvData += `${category},${budgetAmount},${spentAmount},${remainingAmount},${percentageValue}%\n`;
      });

      const totalBudget = budgets.reduce(
        (sum, b) => sum + parseFloat(b.amount.toString()),
        0
      );
      const totalSpent = Object.values(spendingByCategory).reduce(
        (sum, amount) => sum + amount,
        0
      );
      const totalRemaining = totalBudget - totalSpent;

      csvData += `\nTotal Budget,${totalBudget.toFixed(2)},${totalSpent.toFixed(2)},${totalRemaining.toFixed(2)}\n\n`;
    }

    // Add summary if both types
    if (type === "all") {
      const totalIncome = await prisma.income.aggregate({
        where: {
          userId: authUser.id,
          ...(month && {
            date: {
              gte: new Date(parseInt(month.split("-")[0]), parseInt(month.split("-")[1]) - 1, 1),
              lte: new Date(parseInt(month.split("-")[0]), parseInt(month.split("-")[1]), 0, 23, 59, 59, 999),
            },
          }),
        },
        _sum: {
          amount: true,
        },
      });

      const totalExpenses = await prisma.expense.aggregate({
        where: {
          userId: authUser.id,
          deletedAt: null,
          ...(month && {
            date: {
              gte: new Date(parseInt(month.split("-")[0]), parseInt(month.split("-")[1]) - 1, 1),
              lte: new Date(parseInt(month.split("-")[0]), parseInt(month.split("-")[1]), 0, 23, 59, 59, 999),
            },
          }),
        },
        _sum: {
          amountInBDT: true,
        },
      });

      const income = parseFloat(totalIncome._sum.amount?.toString() || "0");
      const expenses = parseFloat(totalExpenses._sum.amountInBDT?.toString() || "0");
      const netSavings = income - expenses;
      const savingsRate = income > 0 ? ((netSavings / income) * 100).toFixed(2) : "0";

      csvData += "Summary\n";
      csvData += "Total Income,Total Expenses,Net Savings,Savings Rate\n";
      csvData += `${income.toFixed(2)},${expenses.toFixed(2)},${netSavings.toFixed(2)},${savingsRate}%\n`;
    }

    const fileName = month
      ? `moneyq-${type}-${month}.csv`
      : `moneyq-${type}-all-time.csv`;

    return new Response(csvData, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error exporting data:", error.message, error);
    } else {
      console.error("Error exporting data:", error);
    }
    return NextResponse.json(
      { error: "Failed to export data" },
      { status: 500 }
    );
  }
}

