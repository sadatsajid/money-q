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
    const type = searchParams.get("type") || "expenses"; // expenses, income, all

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

