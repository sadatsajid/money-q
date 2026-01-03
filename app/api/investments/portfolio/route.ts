import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { Money } from "@/lib/money";
import {
  INVESTMENT_TRANSACTION_VALUES,
  INVESTMENT_STATUS_VALUES,
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

    // Get all active investments (BUY transactions that are not SOLD)
    const activeInvestments = await prisma.investmentTransaction.findMany({
      where: {
        userId: session.user.id,
        transactionType: INVESTMENT_TRANSACTION_VALUES.BUY,
        status: {
          in: [INVESTMENT_STATUS_VALUES.ACTIVE, INVESTMENT_STATUS_VALUES.MATURED, INVESTMENT_STATUS_VALUES.RETURNED],
        },
        deletedAt: null,
      },
      orderBy: {
        transactionDate: "desc",
      },
    });

    // Get all sold investments
    const soldInvestments = await prisma.investmentTransaction.findMany({
      where: {
        userId: session.user.id,
        transactionType: INVESTMENT_TRANSACTION_VALUES.SELL,
        deletedAt: null,
      },
    });

    // Get all returns
    const returns = await prisma.investmentReturn.findMany({
      where: {
        userId: session.user.id,
        deletedAt: null,
      },
    });

    // Calculate totals
    const totalInvested = activeInvestments.reduce(
      (sum, inv) => sum.add(new Money(inv.amountInBDT.toString())),
      new Money(0)
    );

    const totalCurrentValue = activeInvestments.reduce(
      (sum, inv) => {
        if (inv.currentValueInBDT) {
          return sum.add(new Money(inv.currentValueInBDT.toString()));
        }
        // If no current value set, use original investment amount
        return sum.add(new Money(inv.amountInBDT.toString()));
      },
      new Money(0)
    );

    const totalRealizedGain = soldInvestments.reduce(
      (sum, inv) => {
        if (inv.realizedGainInBDT) {
          return sum.add(new Money(inv.realizedGainInBDT.toString()));
        }
        return sum;
      },
      new Money(0)
    );

    const totalReturns = returns.reduce(
      (sum, ret) => sum.add(new Money(ret.amountInBDT.toString())),
      new Money(0)
    );

    // Calculate unrealized gain
    const unrealizedGain = totalCurrentValue.subtract(totalInvested);

    // Calculate total gain (realized + unrealized)
    const totalGain = totalRealizedGain.add(unrealizedGain);

    // Group by investment type
    const byType: Record<string, {
      totalInvested: Money;
      totalCurrentValue: Money;
      count: number;
    }> = {};

    activeInvestments.forEach((inv) => {
      if (!byType[inv.type]) {
        byType[inv.type] = {
          totalInvested: new Money(0),
          totalCurrentValue: new Money(0),
          count: 0,
        };
      }

      byType[inv.type].totalInvested = byType[inv.type].totalInvested.add(
        new Money(inv.amountInBDT.toString())
      );

      const currentValue = inv.currentValueInBDT
        ? new Money(inv.currentValueInBDT.toString())
        : new Money(inv.amountInBDT.toString());

      byType[inv.type].totalCurrentValue = byType[inv.type].totalCurrentValue.add(currentValue);
      byType[inv.type].count += 1;
    });

    // Group returns by type
    const returnsByType: Record<string, Money> = {};
    returns.forEach((ret) => {
      const type = ret.returnType;
      if (!returnsByType[type]) {
        returnsByType[type] = new Money(0);
      }
      returnsByType[type] = returnsByType[type].add(new Money(ret.amountInBDT.toString()));
    });

    return NextResponse.json({
      portfolio: {
        totalInvested: totalInvested.toString(),
        totalCurrentValue: totalCurrentValue.toString(),
        totalRealizedGain: totalRealizedGain.toString(),
        totalUnrealizedGain: unrealizedGain.toString(),
        totalGain: totalGain.toString(),
        totalReturns: totalReturns.toString(),
        activeCount: activeInvestments.length,
        soldCount: soldInvestments.length,
        byType: Object.entries(byType).map(([type, data]) => ({
          type,
          totalInvested: data.totalInvested.toString(),
          totalCurrentValue: data.totalCurrentValue.toString(),
          count: data.count,
          gain: data.totalCurrentValue.subtract(data.totalInvested).toString(),
        })),
        returnsByType: Object.entries(returnsByType).map(([type, amount]) => ({
          type,
          amount: amount.toString(),
        })),
      },
    });
  } catch (error) {
    console.error("Error fetching portfolio:", error);
    return NextResponse.json(
      { error: "Failed to fetch portfolio" },
      { status: 500 }
    );
  }
}

