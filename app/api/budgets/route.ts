import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { Money } from "@/lib/money";
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
    const month = searchParams.get("month"); // Format: YYYY-MM

    if (!month) {
      return NextResponse.json(
        { error: "Month parameter is required" },
        { status: 400 }
      );
    }

    // Get all budgets for the month
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
        acc[categoryId] = new Money(0);
      }
      acc[categoryId] = acc[categoryId].add(new Money(expense.amountInBDT.toString()));
      return acc;
    }, {} as Record<string, Money>);

    // Serialize and add spending data
    const serialized = budgets.map((budget) => {
      const spent = spendingByCategory[budget.categoryId] || new Money(0);
      const budgetAmount = new Money(budget.amount.toString());
      const percentage = budgetAmount.isZero()
        ? 0
        : spent.divide(budgetAmount.toNumber()).multiply(100).toNumber();

      return {
        ...budget,
        amount: budget.amount.toString(),
        spent: spent.toString(),
        percentage: Math.round(percentage),
        remaining: budgetAmount.subtract(spent).toString(),
      };
    });

    return NextResponse.json({ budgets: serialized });
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error fetching budgets:", error.message, error);
    } else {
      console.error("Error fetching budgets:", error);
    }
    return NextResponse.json(
      { error: "Failed to fetch budgets" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { budgets, month } = body;

    // Validate
    if (!budgets || !Array.isArray(budgets) || !month) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    // Upsert budgets (create or update)
    const operations = budgets.map((budget: { categoryId: string; amount: number }) => {
      const amountMoney = new Money(budget.amount);

      return prisma.budget.upsert({
        where: {
          userId_categoryId_month: {
            userId: authUser.id,
            categoryId: budget.categoryId,
            month,
          },
        },
        create: {
          userId: authUser.id,
          categoryId: budget.categoryId,
          month,
          amount: amountMoney.toPrismaDecimal(),
        },
        update: {
          amount: amountMoney.toPrismaDecimal(),
        },
      });
    });

    await Promise.all(operations);

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error saving budgets:", error.message, error);
    } else {
      console.error("Error saving budgets:", error);
    }
    return NextResponse.json(
      { error: "Failed to save budgets" },
      { status: 500 }
    );
  }
}

// Copy budgets from previous month
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { fromMonth, toMonth } = body;

    if (!fromMonth || !toMonth) {
      return NextResponse.json(
        { error: "fromMonth and toMonth are required" },
        { status: 400 }
      );
    }

    // Get budgets from previous month
    const previousBudgets = await prisma.budget.findMany({
      where: {
        userId: authUser.id,
        month: fromMonth,
      },
    });

    if (previousBudgets.length === 0) {
      return NextResponse.json(
        { error: "No budgets found for the specified month" },
        { status: 404 }
      );
    }

    // Copy to new month
    const operations = previousBudgets.map((budget) =>
      prisma.budget.upsert({
        where: {
          userId_categoryId_month: {
            userId: authUser.id,
            categoryId: budget.categoryId,
            month: toMonth,
          },
        },
        create: {
          userId: authUser.id,
          categoryId: budget.categoryId,
          month: toMonth,
          amount: budget.amount,
        },
        update: {
          amount: budget.amount,
        },
      })
    );

    await Promise.all(operations);

    return NextResponse.json({ success: true, count: previousBudgets.length });
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error copying budgets:", error.message, error);
    } else {
      console.error("Error copying budgets:", error);
    }
    return NextResponse.json(
      { error: "Failed to copy budgets" },
      { status: 500 }
    );
  }
}

