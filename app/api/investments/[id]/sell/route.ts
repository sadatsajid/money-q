import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { Money, convertToBDT } from "@/lib/money";
import {
  INVESTMENT_TRANSACTION_VALUES,
  INVESTMENT_STATUS_VALUES,
} from "@/constants/investments";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const {
      saleDate,
      saleProceeds,
      currency,
      note,
    } = body;

    // Validate required fields
    if (!saleDate || !saleProceeds) {
      return NextResponse.json(
        { error: "Sale date and proceeds are required" },
        { status: 400 }
      );
    }

    // Get the original BUY transaction
    const buyTransaction = await prisma.investmentTransaction.findFirst({
      where: {
        id,
        userId: session.user.id,
        transactionType: INVESTMENT_TRANSACTION_VALUES.BUY,
        deletedAt: null,
      },
    });

    if (!buyTransaction) {
      return NextResponse.json(
        { error: "Investment not found or already sold" },
        { status: 404 }
      );
    }

    if (buyTransaction.status === INVESTMENT_STATUS_VALUES.SOLD) {
      return NextResponse.json(
        { error: "Investment already sold" },
        { status: 400 }
      );
    }

    // Calculate sale proceeds in BDT
    const saleProceedsMoney = new Money(saleProceeds);
    const saleCurrency = currency || buyTransaction.currency;
    let saleProceedsInBDT = saleProceedsMoney;

    if (saleCurrency !== "BDT") {
      const saleDateObj = new Date(saleDate);
      const month = `${saleDateObj.getFullYear()}-${String(saleDateObj.getMonth() + 1).padStart(2, "0")}`;
      
      const exchangeRate = await prisma.exchangeRate.findUnique({
        where: {
          userId_month_currency: {
            userId: session.user.id,
            month,
            currency: saleCurrency,
          },
        },
      });

      if (!exchangeRate) {
        return NextResponse.json(
          { error: `Exchange rate for ${saleCurrency} not set for ${month}` },
          { status: 400 }
        );
      }

      saleProceedsInBDT = convertToBDT(saleProceedsMoney, saleCurrency, exchangeRate.rate.toNumber());
    }

    // Calculate realized gain
    const originalInvestment = new Money(buyTransaction.amountInBDT.toString());
    const realizedGain = saleProceedsInBDT.subtract(originalInvestment);
    const realizedGainInBDT = realizedGain;

    // Create SELL transaction
    const sellTransaction = await prisma.investmentTransaction.create({
      data: {
        userId: session.user.id,
        investmentId: buyTransaction.investmentId || buyTransaction.id, // Link to parent
        transactionType: INVESTMENT_TRANSACTION_VALUES.SELL,
        transactionDate: new Date(saleDate),
        name: buyTransaction.name,
        type: buyTransaction.type,
        quantity: buyTransaction.quantity,
        pricePerUnit: buyTransaction.pricePerUnit,
        totalAmount: buyTransaction.totalAmount, // Keep original investment amount
        currency: buyTransaction.currency,
        amountInBDT: buyTransaction.amountInBDT,
        saleProceeds: saleProceedsMoney.toPrismaDecimal(),
        saleProceedsInBDT: saleProceedsInBDT.toPrismaDecimal(),
        realizedGain: realizedGain.toPrismaDecimal(),
        realizedGainInBDT: realizedGainInBDT.toPrismaDecimal(),
        sourceType: buyTransaction.sourceType,
        savingsBucketId: buyTransaction.savingsBucketId,
        incomeId: buyTransaction.incomeId,
        sourceNote: buyTransaction.sourceNote,
        ticker: buyTransaction.ticker,
        accountName: buyTransaction.accountName,
        status: INVESTMENT_STATUS_VALUES.SOLD,
        note: note || null,
      },
    });

    // Update original BUY transaction status to SOLD
    await prisma.investmentTransaction.update({
      where: { id: buyTransaction.id },
      data: {
        status: INVESTMENT_STATUS_VALUES.SOLD,
      },
    });

    // Serialize
    const serialized = {
      ...sellTransaction,
      quantity: sellTransaction.quantity.toString(),
      pricePerUnit: sellTransaction.pricePerUnit?.toString() || null,
      totalAmount: sellTransaction.totalAmount.toString(),
      amountInBDT: sellTransaction.amountInBDT.toString(),
      saleProceeds: sellTransaction.saleProceeds?.toString() || null,
      saleProceedsInBDT: sellTransaction.saleProceedsInBDT?.toString() || null,
      realizedGain: sellTransaction.realizedGain?.toString() || null,
      realizedGainInBDT: sellTransaction.realizedGainInBDT?.toString() || null,
    };

    return NextResponse.json({ transaction: serialized }, { status: 201 });
  } catch (error) {
    console.error("Error selling investment:", error);
    return NextResponse.json(
      { error: "Failed to sell investment" },
      { status: 500 }
    );
  }
}

