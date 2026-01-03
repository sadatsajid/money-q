import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { Money, convertToBDT } from "@/lib/money";
import {
  INVESTMENT_STATUS_VALUES,
} from "@/constants/investments";

export async function GET(
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

    const transaction = await prisma.investmentTransaction.findFirst({
      where: {
        id,
        userId: session.user.id,
        deletedAt: null,
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
        parentInvestment: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
        relatedTransactions: {
          where: {
            deletedAt: null,
          },
          orderBy: {
            transactionDate: "asc",
          },
        },
        returns: {
          where: {
            deletedAt: null,
          },
          orderBy: {
            returnDate: "desc",
          },
        },
      },
    });

    if (!transaction) {
      return NextResponse.json({ error: "Investment not found" }, { status: 404 });
    }

    // Serialize
    const serialized = {
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
      relatedTransactions: transaction.relatedTransactions.map((t) => ({
        ...t,
        quantity: t.quantity.toString(),
        pricePerUnit: t.pricePerUnit?.toString() || null,
        totalAmount: t.totalAmount.toString(),
        amountInBDT: t.amountInBDT.toString(),
      })),
      returns: transaction.returns.map((r) => ({
        ...r,
        amount: r.amount.toString(),
        amountInBDT: r.amountInBDT.toString(),
      })),
    };

    return NextResponse.json({ transaction: serialized });
  } catch (error) {
    console.error("Error fetching investment:", error);
    return NextResponse.json(
      { error: "Failed to fetch investment" },
      { status: 500 }
    );
  }
}

export async function PATCH(
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

    // Verify transaction belongs to user
    const existing = await prisma.investmentTransaction.findFirst({
      where: {
        id,
        userId: session.user.id,
        deletedAt: null,
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Investment not found" }, { status: 404 });
    }

    const updateData: any = {};

    // Update current value
    if (body.currentValue !== undefined) {
      const currentValueMoney = new Money(body.currentValue);
      let currentValueInBDT = currentValueMoney;

      if (existing.currency !== "BDT") {
        const transactionDate = existing.transactionDate;
        const month = `${transactionDate.getFullYear()}-${String(transactionDate.getMonth() + 1).padStart(2, "0")}`;
        
        const exchangeRate = await prisma.exchangeRate.findUnique({
          where: {
            userId_month_currency: {
              userId: session.user.id,
              month,
              currency: existing.currency,
            },
          },
        });

        if (exchangeRate) {
          currentValueInBDT = convertToBDT(currentValueMoney, existing.currency, exchangeRate.rate.toNumber());
        }
      }

      updateData.currentValue = currentValueMoney.toPrismaDecimal();
      updateData.currentValueInBDT = currentValueInBDT.toPrismaDecimal();
    }

    // Update status
    if (body.status !== undefined) {
      updateData.status = body.status;
    }

    // Update note
    if (body.note !== undefined) {
      updateData.note = body.note;
    }

    // Auto-update status to MATURED if maturityDate has passed
    if (existing.maturityDate && !body.status) {
      const maturity = new Date(existing.maturityDate);
      if (maturity < new Date() && existing.status === INVESTMENT_STATUS_VALUES.ACTIVE) {
        updateData.status = INVESTMENT_STATUS_VALUES.MATURED;
      }
    }

    const transaction = await prisma.investmentTransaction.update({
      where: { id },
      data: updateData,
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
      saleProceeds: transaction.saleProceeds?.toString() || null,
      saleProceedsInBDT: transaction.saleProceedsInBDT?.toString() || null,
      realizedGain: transaction.realizedGain?.toString() || null,
      realizedGainInBDT: transaction.realizedGainInBDT?.toString() || null,
    };

    return NextResponse.json({ transaction: serialized });
  } catch (error) {
    console.error("Error updating investment:", error);
    return NextResponse.json(
      { error: "Failed to update investment" },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    // Verify transaction belongs to user
    const existing = await prisma.investmentTransaction.findFirst({
      where: {
        id,
        userId: session.user.id,
        deletedAt: null,
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Investment not found" }, { status: 404 });
    }

    // Soft delete
    await prisma.investmentTransaction.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting investment:", error);
    return NextResponse.json(
      { error: "Failed to delete investment" },
      { status: 500 }
    );
  }
}

