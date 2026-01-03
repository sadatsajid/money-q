import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateMonthlyInsight } from "@/lib/ai/generate-insight";
import { getCurrentMonth } from "@/lib/utils";

/**
 * Cron job to generate monthly insights for all users
 * Should run monthly via Vercel Cron (e.g., on the 1st of each month)
 * 
 * To set up in vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/generate-insights",
 *     "schedule": "0 3 1 * *"  // 3 AM on the 1st of every month
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

    // Generate insights for the previous month
    const currentDate = new Date();
    const previousMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    const month = `${previousMonth.getFullYear()}-${String(previousMonth.getMonth() + 1).padStart(2, "0")}`;

    console.log(`Generating insights for month: ${month}`);

    // Get all active users
    const users = await prisma.user.findMany({
      select: {
        id: true,
      },
    });

    let successCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    const errors: Array<{ userId: string; error: string }> = [];

    // Generate insights for each user
    for (const user of users) {
      try {
        const result = await generateMonthlyInsight(user.id, month);
        
        if (result.success) {
          if (result.insightId) {
            successCount++;
            console.log(`✅ Generated insight for user ${user.id}`);
          } else {
            skippedCount++;
            console.log(`⏭️  Insight already exists for user ${user.id}`);
          }
        } else {
          errorCount++;
          errors.push({ userId: user.id, error: result.error || "Unknown error" });
          console.error(`❌ Failed to generate insight for user ${user.id}: ${result.error}`);
        }
      } catch (error: any) {
        errorCount++;
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        errors.push({ userId: user.id, error: errorMessage });
        console.error(`❌ Error generating insight for user ${user.id}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      month,
      summary: {
        totalUsers: users.length,
        successCount,
        skippedCount,
        errorCount,
      },
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    console.error("Error in generate-insights cron job:", error);
    return NextResponse.json(
      {
        error: "Failed to generate insights",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

