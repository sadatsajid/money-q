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

    const where: Prisma.IncomeWhereInput = {
      userId: authUser.id,
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

    const incomes = await prisma.income.findMany({
      where,
      orderBy: {
        date: "desc",
      },
    });

    // Serialize Decimal fields
    const serialized = incomes.map((income) => ({
      ...income,
      amount: income.amount.toString(),
    }));

    return NextResponse.json({ incomes: serialized });
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error fetching income:", error.message, error);
    } else {
      console.error("Error fetching income:", error);
    }
    return NextResponse.json(
      { error: "Failed to fetch income" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Use getUser() instead of getSession() for better security
    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify user exists in database (user profile must be created first)
    const dbUser = await prisma.user.findUnique({
      where: { id: authUser.id },
    });

    if (!dbUser) {
      return NextResponse.json(
        { 
          error: "User profile not found. Please complete your account setup.",
          code: "USER_PROFILE_MISSING"
        },
        { status: 404 }
      );
    }

    const body = await request.json();
    const {
      date,
      source,
      amount,
      currency = "BDT",
      note,
    } = body;

    // Validate required fields
    if (!date || !source || !amount) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const amountMoney = new Money(amount);

    const income = await prisma.income.create({
      data: {
        userId: authUser.id,
        date: new Date(date),
        source,
        amount: amountMoney.toPrismaDecimal(),
        currency,
        note,
      },
    });

    // Serialize
    const serialized = {
      ...income,
      amount: income.amount.toString(),
    };

    return NextResponse.json({ income: serialized }, { status: 201 });
  } catch (error) {
    // Better error handling - check if error exists and handle Prisma errors
    if (error instanceof Error) {
      console.error("Error creating income:", error.message, error);
      
      // Handle foreign key constraint errors
      if (error.message.includes("Foreign key constraint")) {
        return NextResponse.json(
          { 
            error: "User profile not found. Please complete your account setup.",
            code: "USER_PROFILE_MISSING"
          },
          { status: 404 }
        );
      }
    } else {
      console.error("Error creating income:", error);
    }
    
    return NextResponse.json(
      { error: "Failed to create income" },
      { status: 500 }
    );
  }
}

