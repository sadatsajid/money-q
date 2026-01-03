import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Money, convertToBDT } from "@/lib/money";
import { getCurrentMonth } from "@/lib/utils";

/**
 * Cron job to process recurring expenses
 * Should run daily via Vercel Cron
 * 
 * To set up in vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/process-recurring",
 *     "schedule": "0 2 * * *"
 *   }]
 * }
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentMonth = getCurrentMonth();
    const currentDate = new Date();

    // Find all active recurring expenses
    const recurringExpenses = await prisma.recurringExpense.findMany({
      where: {
        autoAdd: true,
        deletedAt: null,
        startDate: {
          lte: currentDate,
        },
        AND: [
          {
            OR: [
              { endDate: null },
              { endDate: { gte: currentDate } },
            ],
          },
          {
            // Only process if not already processed this month
            OR: [
              { lastProcessedMonth: null },
              { lastProcessedMonth: { not: currentMonth } },
            ],
          },
        ],
      },
      include: {
        user: true,
      },
    });

    let processedCount = 0;
    let errorCount = 0;

    for (const recurring of recurringExpenses) {
      try {
        // Get or create default payment method (Cash)
        const paymentMethod = await prisma.paymentMethod.findFirst({
          where: {
            userId: recurring.userId,
            type: "Cash",
            deletedAt: null,
          },
        });

        if (!paymentMethod) {
          console.error(`No payment method found for user ${recurring.userId}`);
          errorCount++;
          continue;
        }

        // Calculate BDT amount
        const amountMoney = new Money(recurring.amount.toString());
        let amountInBDT = amountMoney;

        if (recurring.currency !== "BDT") {
          const exchangeRate = await prisma.exchangeRate.findUnique({
            where: {
              userId_month_currency: {
                userId: recurring.userId,
                month: currentMonth,
                currency: recurring.currency,
              },
            },
          });

          if (exchangeRate) {
            amountInBDT = convertToBDT(
              amountMoney,
              recurring.currency,
              exchangeRate.rate.toNumber()
            );
          } else {
            // Skip if no exchange rate found
            console.warn(
              `No exchange rate for ${recurring.currency} - ${currentMonth}`
            );
            errorCount++;
            continue;
          }
        }

        // Create expense entry
        await prisma.expense.create({
          data: {
            userId: recurring.userId,
            date: currentDate,
            merchant: recurring.name,
            categoryId: recurring.categoryId,
            amount: amountMoney.toPrismaDecimal(),
            currency: recurring.currency,
            amountInBDT: amountInBDT.toPrismaDecimal(),
            paymentMethodId: paymentMethod.id,
            isRecurring: true,
            recurringExpenseId: recurring.id,
            note: "Auto-added recurring expense",
          },
        });

        // Update lastProcessedMonth
        await prisma.recurringExpense.update({
          where: { id: recurring.id },
          data: { lastProcessedMonth: currentMonth },
        });

        processedCount++;
      } catch (error) {
        console.error(`Error processing recurring expense ${recurring.id}:`, error);
        errorCount++;
      }
    }

    return NextResponse.json({
      success: true,
      processedCount,
      errorCount,
      month: currentMonth,
    });
  } catch (error) {
    console.error("Error in process-recurring cron:", error);
    return NextResponse.json(
      { error: "Failed to process recurring expenses" },
      { status: 500 }
    );
  }
}

