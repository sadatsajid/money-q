import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { Money } from "@/lib/money";
import { Prisma } from "@prisma/client";

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
    const includeDeleted = searchParams.get("includeDeleted") === "true";

    const where: Prisma.RecurringExpenseWhereInput = {
      userId: session.user.id,
    };

    if (!includeDeleted) {
      where.deletedAt = null;
    }

    const recurringExpenses = await prisma.recurringExpense.findMany({
      where,
      include: {
        category: true,
        expenses: {
          where: { deletedAt: null },
          orderBy: { date: "desc" },
          take: 5,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Serialize
    const serialized = recurringExpenses.map((re) => ({
      ...re,
      amount: re.amount.toString(),
      expenses: re.expenses.map((exp) => ({
        ...exp,
        amount: exp.amount.toString(),
        amountInBDT: exp.amountInBDT.toString(),
      })),
    }));

    return NextResponse.json({ recurringExpenses: serialized });
  } catch (error) {
    console.error("Error fetching recurring expenses:", error);
    return NextResponse.json(
      { error: "Failed to fetch recurring expenses" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      categoryId,
      amount,
      currency = "BDT",
      frequency = "MONTHLY",
      startDate,
      endDate,
      autoAdd = true,
    } = body;

    // Validate
    if (!name || !categoryId || !amount || !startDate) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const amountMoney = new Money(amount);

    const recurringExpense = await prisma.recurringExpense.create({
      data: {
        userId: session.user.id,
        name,
        categoryId,
        amount: amountMoney.toPrismaDecimal(),
        currency,
        frequency,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        autoAdd,
      },
      include: {
        category: true,
      },
    });

    // Serialize
    const serialized = {
      ...recurringExpense,
      amount: recurringExpense.amount.toString(),
    };

    return NextResponse.json({ recurringExpense: serialized }, { status: 201 });
  } catch (error) {
    console.error("Error creating recurring expense:", error);
    return NextResponse.json(
      { error: "Failed to create recurring expense" },
      { status: 500 }
    );
  }
}

