import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { Money, convertToBDT } from "@/lib/money";
import { Prisma } from "@prisma/client";
import {
  INVESTMENT_STATUS_VALUES,
  INVESTMENT_SOURCE_VALUES,
  INVESTMENT_TRANSACTION_VALUES,
} from "@/constants/investments";

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
    const type = searchParams.get("type");
    const status = searchParams.get("status");
    const transactionType = searchParams.get("transactionType"); // BUY or SELL

    const where: Prisma.InvestmentTransactionWhereInput = {
      userId: session.user.id,
      deletedAt: null,
    };

    // Filter by type if provided
    if (type) {
      where.type = type;
    }

    // Filter by status if provided
    if (status) {
      where.status = status;
    }

    // Filter by transaction type if provided
    if (transactionType) {
      where.transactionType = transactionType;
    }

    const transactions = await prisma.investmentTransaction.findMany({
      where,
      include: {
        savingsBucket: {
          select: {
            id: true,
            name: true,
          },
        },
        income: {
          select: {
            id: true,
            date: true,
            source: true,
            amount: true,
          },
        },
        parentInvestment: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
      orderBy: {
        transactionDate: "desc",
      },
    });

    // Serialize Decimal fields
    const serialized = transactions.map((transaction) => ({
      ...transaction,
      quantity: transaction.quantity.toString(),
      pricePerUnit: transaction.pricePerUnit?.toString() || null,
      totalAmount: transaction.totalAmount.toString(),
      amountInBDT: transaction.amountInBDT.toString(),
      currentValue: transaction.currentValue?.toString() || null,
      currentValueInBDT: transaction.currentValueInBDT?.toString() || null,
      saleProceeds: transaction.saleProceeds?.toString() || null,
      saleProceedsInBDT: transaction.saleProceedsInBDT?.toString() || null,
      realizedGain: transaction.realizedGain?.toString() || null,
      realizedGainInBDT: transaction.realizedGainInBDT?.toString() || null,
    }));

    return NextResponse.json({ transactions: serialized });
  } catch (error) {
    console.error("Error fetching investments:", error);
    return NextResponse.json(
      { error: "Failed to fetch investments" },
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
      transactionType = INVESTMENT_TRANSACTION_VALUES.BUY,
      transactionDate,
      name,
      type,
      quantity = 1,
      pricePerUnit,
      totalAmount,
      currency = "BDT",
      currentValue,
      sourceType,
      savingsBucketId,
      incomeId,
      sourceNote,
      ticker,
      maturityDate,
      accountName,
      investmentId, // For grouping related transactions
      note,
    } = body;

    // Validate required fields
    if (!transactionDate || !name || !type || !totalAmount || !sourceType) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate source type specific fields
    if (sourceType === INVESTMENT_SOURCE_VALUES.SAVINGS_BUCKET && !savingsBucketId) {
      return NextResponse.json(
        { error: "Savings bucket ID required when source is SAVINGS_BUCKET" },
        { status: 400 }
      );
    }

    if (sourceType === INVESTMENT_SOURCE_VALUES.INCOME && !incomeId) {
      return NextResponse.json(
        { error: "Income ID required when source is INCOME" },
        { status: 400 }
      );
    }

    // Verify savings bucket belongs to user (if provided)
    if (savingsBucketId) {
      const bucket = await prisma.savingsBucket.findFirst({
        where: {
          id: savingsBucketId,
          userId: session.user.id,
        },
      });

      if (!bucket) {
        return NextResponse.json(
          { error: "Invalid savings bucket" },
          { status: 400 }
        );
      }
    }

    // Verify income belongs to user (if provided)
    if (incomeId) {
      const income = await prisma.income.findFirst({
        where: {
          id: incomeId,
          userId: session.user.id,
        },
      });

      if (!income) {
        return NextResponse.json(
          { error: "Invalid income entry" },
          { status: 400 }
        );
      }
    }

    // Calculate BDT amount
    const totalAmountMoney = new Money(totalAmount);
    let amountInBDT = totalAmountMoney;

    if (currency !== "BDT") {
      const investmentDate = new Date(transactionDate);
      const month = `${investmentDate.getFullYear()}-${String(investmentDate.getMonth() + 1).padStart(2, "0")}`;
      
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

      amountInBDT = convertToBDT(totalAmountMoney, currency, exchangeRate.rate.toNumber());
    }

    // Calculate current value in BDT if provided
    let currentValueInBDT: Money | null = null;
    if (currentValue) {
      const currentValueMoney = new Money(currentValue);
      if (currency !== "BDT") {
        const investmentDate = new Date(transactionDate);
        const month = `${investmentDate.getFullYear()}-${String(investmentDate.getMonth() + 1).padStart(2, "0")}`;
        
        const exchangeRate = await prisma.exchangeRate.findUnique({
          where: {
            userId_month_currency: {
              userId: session.user.id,
              month,
              currency,
            },
          },
        });

        if (exchangeRate) {
          currentValueInBDT = convertToBDT(currentValueMoney, currency, exchangeRate.rate.toNumber());
        } else {
          currentValueInBDT = currentValueMoney; // Fallback to same value
        }
      } else {
        currentValueInBDT = currentValueMoney;
      }
    }

    // Determine status
    let status: string = INVESTMENT_STATUS_VALUES.ACTIVE;
    if (transactionType === INVESTMENT_TRANSACTION_VALUES.SELL) {
      status = INVESTMENT_STATUS_VALUES.SOLD;
    } else if (maturityDate) {
      const maturity = new Date(maturityDate);
      if (maturity < new Date()) {
        status = INVESTMENT_STATUS_VALUES.MATURED;
      }
    }

    const transaction = await prisma.investmentTransaction.create({
      data: {
        userId: session.user.id,
        investmentId: investmentId || null,
        transactionType,
        transactionDate: new Date(transactionDate),
        name,
        type,
        quantity: new Money(quantity).toPrismaDecimal(),
        pricePerUnit: pricePerUnit ? new Money(pricePerUnit).toPrismaDecimal() : null,
        totalAmount: totalAmountMoney.toPrismaDecimal(),
        currency,
        amountInBDT: amountInBDT.toPrismaDecimal(),
        currentValue: currentValueInBDT?.toPrismaDecimal() || null,
        currentValueInBDT: currentValueInBDT?.toPrismaDecimal() || null,
        sourceType,
        savingsBucketId: savingsBucketId || null,
        incomeId: incomeId || null,
        sourceNote: sourceNote || null,
        ticker: ticker || null,
        maturityDate: maturityDate ? new Date(maturityDate) : null,
        accountName: accountName || null,
        status,
        note: note || null,
      },
      include: {
        savingsBucket: {
          select: {
            id: true,
            name: true,
          },
        },
        income: {
          select: {
            id: true,
            date: true,
            source: true,
            amount: true,
          },
        },
      },
    });

    // Serialize
    const serialized = {
      ...transaction,
      quantity: transaction.quantity.toString(),
      pricePerUnit: transaction.pricePerUnit?.toString() || null,
      totalAmount: transaction.totalAmount.toString(),
      amountInBDT: transaction.amountInBDT.toString(),
      currentValue: transaction.currentValue?.toString() || null,
      currentValueInBDT: transaction.currentValueInBDT?.toString() || null,
    };

    return NextResponse.json({ transaction: serialized }, { status: 201 });
  } catch (error) {
    console.error("Error creating investment:", error);
    return NextResponse.json(
      { error: "Failed to create investment" },
      { status: 500 }
    );
  }
}

