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
    const returnType = searchParams.get("returnType");
    const transactionId = searchParams.get("transactionId");

    const where: Prisma.InvestmentReturnWhereInput = {
      userId: session.user.id,
      deletedAt: null,
    };

    // Filter by month if provided
    if (month) {
      const [year, monthNum] = month.split("-");
      const startDate = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
      const endDate = new Date(parseInt(year), parseInt(monthNum), 0, 23, 59, 59, 999);
      
      where.returnDate = {
        gte: startDate,
        lte: endDate,
      };
    }

    // Filter by return type if provided
    if (returnType) {
      where.returnType = returnType;
    }

    // Filter by transaction if provided
    if (transactionId) {
      where.transactionId = transactionId;
    }

    const returns = await prisma.investmentReturn.findMany({
      where,
      include: {
        transaction: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
      orderBy: {
        returnDate: "desc",
      },
    });

    // Serialize Decimal fields
    const serialized = returns.map((ret) => ({
      ...ret,
      amount: ret.amount.toString(),
      amountInBDT: ret.amountInBDT.toString(),
    }));

    return NextResponse.json({ returns: serialized });
  } catch (error) {
    console.error("Error fetching investment returns:", error);
    return NextResponse.json(
      { error: "Failed to fetch investment returns" },
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
      returnType,
      returnDate,
      amount,
      currency = "BDT",
      transactionId,
      investmentName,
      investmentType,
      note,
    } = body;

    // Validate required fields
    if (!returnType || !returnDate || !amount) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify transaction belongs to user (if provided)
    if (transactionId) {
      const transaction = await prisma.investmentTransaction.findFirst({
        where: {
          id: transactionId,
          userId: session.user.id,
          deletedAt: null,
        },
      });

      if (!transaction) {
        return NextResponse.json(
          { error: "Invalid investment transaction" },
          { status: 400 }
        );
      }

      // Auto-fill investment name and type from transaction if not provided
      if (!investmentName) {
        body.investmentName = transaction.name;
      }
      if (!investmentType) {
        body.investmentType = transaction.type;
      }
    }

    // Calculate BDT amount
    const amountMoney = new Money(amount);
    let amountInBDT = amountMoney;

    if (currency !== "BDT") {
      const returnDateObj = new Date(returnDate);
      const month = `${returnDateObj.getFullYear()}-${String(returnDateObj.getMonth() + 1).padStart(2, "0")}`;
      
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

    const investmentReturn = await prisma.investmentReturn.create({
      data: {
        userId: session.user.id,
        transactionId: transactionId || null,
        returnType,
        returnDate: new Date(returnDate),
        amount: amountMoney.toPrismaDecimal(),
        currency,
        amountInBDT: amountInBDT.toPrismaDecimal(),
        investmentName: investmentName || null,
        investmentType: investmentType || null,
        note: note || null,
      },
      include: {
        transaction: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
    });

    // Serialize
    const serialized = {
      ...investmentReturn,
      amount: investmentReturn.amount.toString(),
      amountInBDT: investmentReturn.amountInBDT.toString(),
    };

    return NextResponse.json({ return: serialized }, { status: 201 });
  } catch (error) {
    console.error("Error creating investment return:", error);
    return NextResponse.json(
      { error: "Failed to create investment return" },
      { status: 500 }
    );
  }
}

