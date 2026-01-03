import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { Money, convertToBDT } from "@/lib/money";
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
    const month = searchParams.get("month"); // Format: YYYY-MM
    const categoryId = searchParams.get("categoryId");

    const where: Prisma.ExpenseWhereInput = {
      userId: session.user.id,
      deletedAt: null,
    };

    // Filter by month if provided
    if (month) {
      const [year, monthNum] = month.split("-");
      const startDate = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
      const endDate = new Date(parseInt(year), parseInt(monthNum), 0, 23, 59, 59, 999);
      
      where.date = {
        gte: startDate,
        lte: endDate,
      };
    }

    // Filter by category if provided
    if (categoryId) {
      where.categoryId = categoryId;
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

    // Serialize Decimal fields
    const serialized = expenses.map((expense) => ({
      ...expense,
      amount: expense.amount.toString(),
      amountInBDT: expense.amountInBDT.toString(),
    }));

    return NextResponse.json({ expenses: serialized });
  } catch (error) {
    console.error("Error fetching expenses:", error);
    return NextResponse.json(
      { error: "Failed to fetch expenses" },
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
      date,
      merchant,
      categoryId,
      amount,
      currency = "BDT",
      paymentMethodId,
      note,
    } = body;

    // Validate required fields
    if (!date || !merchant || !categoryId || !amount || !paymentMethodId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Calculate BDT amount
    const amountMoney = new Money(amount);
    let amountInBDT = amountMoney;

    if (currency !== "BDT") {
      // Get exchange rate for this month
      const expenseDate = new Date(date);
      const month = `${expenseDate.getFullYear()}-${String(expenseDate.getMonth() + 1).padStart(2, "0")}`;
      
      const exchangeRate = await prisma.exchangeRate.findUnique({
        where: {
          userId_month_currency: {
            userId: session.user.id,
            month,
            currency,
          },
        },
      });

      if (!exchangeRate) {
        return NextResponse.json(
          { error: `Exchange rate for ${currency} not set for ${month}` },
          { status: 400 }
        );
      }

      amountInBDT = convertToBDT(amountMoney, currency, exchangeRate.rate.toNumber());
    }

    const expense = await prisma.expense.create({
      data: {
        userId: session.user.id,
        date: new Date(date),
        merchant,
        categoryId,
        amount: amountMoney.toPrismaDecimal(),
        currency,
        amountInBDT: amountInBDT.toPrismaDecimal(),
        paymentMethodId,
        note,
      },
      include: {
        category: true,
        paymentMethod: true,
      },
    });

    // Serialize
    const serialized = {
      ...expense,
      amount: expense.amount.toString(),
      amountInBDT: expense.amountInBDT.toString(),
    };

    return NextResponse.json({ expense: serialized }, { status: 201 });
  } catch (error) {
    console.error("Error creating expense:", error);
    return NextResponse.json(
      { error: "Failed to create expense" },
      { status: 500 }
    );
  }
}

