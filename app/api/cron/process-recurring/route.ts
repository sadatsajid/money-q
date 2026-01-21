import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Money, convertToBDT } from "@/lib/money";

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentDate = new Date();
    const currentMonth = `${currentDate.getFullYear()}-${String(
      currentDate.getMonth() + 1
    ).padStart(2, "0")}`;

    console.log(`[Cron] Processing recurring expenses for ${currentMonth}`);

    // Get all active recurring expenses that need processing
    const recurringExpenses = await prisma.recurringExpense.findMany({
      where: {
        autoAdd: true,
        deletedAt: null,
        startDate: {
          lte: currentDate, // Started before or on current date
        },
        OR: [
          { endDate: null }, // No end date
          { endDate: { gte: currentDate } }, // End date is in the future
        ],
      },
      include: {
        category: true,
        user: {
          select: {
            id: true,
            email: true,
            defaultCurrency: true,
          },
        },
      },
    });

    console.log(`[Cron] Found ${recurringExpenses.length} recurring expenses to check`);

    let processed = 0;
    let skipped = 0;
    let errors = 0;

    for (const recurring of recurringExpenses) {
      try {
        // Check if already processed this month
        if (recurring.lastProcessedMonth === currentMonth) {
          console.log(`[Cron] Skipping ${recurring.name} - already processed for ${currentMonth}`);
          skipped++;
          continue;
        }

        // Determine if we should process based on frequency
        const shouldProcess = checkIfShouldProcess(
          recurring.frequency,
          recurring.startDate,
          recurring.lastProcessedMonth,
          currentMonth
        );

        if (!shouldProcess) {
          console.log(`[Cron] Skipping ${recurring.name} - not due yet based on frequency`);
          skipped++;
          continue;
        }

        // Get user's first payment method
        const paymentMethod = await prisma.paymentMethod.findFirst({
          where: {
            userId: recurring.userId,
            deletedAt: null,
          },
        });

        if (!paymentMethod) {
          console.warn(`[Cron] No payment method found for user ${recurring.userId}`);
          errors++;
          continue;
        }

        // Get exchange rate for currency conversion
        let amountInBDT = new Money(recurring.amount.toString());
        if (recurring.currency !== "BDT") {
          const exchangeRate = await prisma.globalExchangeRate.findFirst({
            where: {
              currency: recurring.currency,
              month: currentMonth,
            },
          });

          if (exchangeRate) {
            amountInBDT = convertToBDT(
              new Money(recurring.amount.toString()),
              recurring.currency,
              parseFloat(exchangeRate.rate.toString())
            );
          } else {
            // Fallback rates if no exchange rate found
            const fallbackRates: Record<string, number> = {
              USD: 110,
              EUR: 120,
              GBP: 140,
            };
            const rate = fallbackRates[recurring.currency] || 100;
            amountInBDT = convertToBDT(
              new Money(recurring.amount.toString()),
              recurring.currency,
              rate
            );
          }
        }

        // Create the expense
        const expense = await prisma.expense.create({
          data: {
            userId: recurring.userId,
            date: getExpenseDate(recurring.frequency, currentDate),
            merchant: recurring.name,
            categoryId: recurring.categoryId,
            amount: new Money(recurring.amount.toString()).toPrismaDecimal(),
            currency: recurring.currency,
            amountInBDT: amountInBDT.toPrismaDecimal(),
            paymentMethodId: paymentMethod.id,
            note: `Auto-added from recurring expense`,
            isRecurring: true,
            recurringExpenseId: recurring.id,
          },
        });

        // Update lastProcessedMonth
        await prisma.recurringExpense.update({
          where: { id: recurring.id },
          data: { lastProcessedMonth: currentMonth },
        });

        console.log(`[Cron] ✓ Created expense for ${recurring.name} (${expense.id})`);
        processed++;
      } catch (error) {
        console.error(`[Cron] Error processing ${recurring.name}:`, error);
        errors++;
      }
    }

    const summary = {
      message: "Recurring expenses processed",
      currentMonth,
      total: recurringExpenses.length,
      processed,
      skipped,
      errors,
      timestamp: new Date().toISOString(),
    };

    console.log(`[Cron] Summary:`, summary);

    return NextResponse.json(summary);
  } catch (error) {
    console.error("[Cron] Fatal error:", error);
    return NextResponse.json(
      { 
        error: "Failed to process recurring expenses",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

// Helper: Check if recurring expense should be processed this period
function checkIfShouldProcess(
  frequency: string,
  startDate: Date,
  lastProcessedMonth: string | null,
  currentMonth: string
): boolean {
  // If never processed, should process
  if (!lastProcessedMonth) {
    return true;
  }

  const [currentYear, currentMonthNum] = currentMonth.split("-").map(Number);
  const [lastYear, lastMonthNum] = lastProcessedMonth.split("-").map(Number);

  switch (frequency) {
    case "MONTHLY":
      // Process if current month is different from last processed
      return currentMonth !== lastProcessedMonth;

    case "WEEKLY":
      // Process every month (weekly expenses get added monthly)
      return currentMonth !== lastProcessedMonth;

    case "YEARLY":
      // Process if it's been a year since last processed
      const monthsSinceLastProcess =
        (currentYear - lastYear) * 12 + (currentMonthNum - lastMonthNum);
      return monthsSinceLastProcess >= 12;

    default:
      return false;
  }
}

// Helper: Get the appropriate date for the expense based on frequency
function getExpenseDate(frequency: string, currentDate: Date): Date {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  switch (frequency) {
    case "MONTHLY":
    case "YEARLY":
      // Use the 1st of the current month
      return new Date(year, month, 1);

    case "WEEKLY":
      // Use current date for weekly (since we process monthly, use start of month)
      return new Date(year, month, 1);

    default:
      return new Date(year, month, 1);
  }
}
