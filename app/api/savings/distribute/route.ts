import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { Money, sumMoney } from "@/lib/money";
import { getCurrentMonth } from "@/lib/utils";

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
    const { month = getCurrentMonth(), distributions } = body;

    // distributions: [{ bucketId: string, amount: string, note?: string }]
    if (!Array.isArray(distributions) || distributions.length === 0) {
      return NextResponse.json(
        { error: "Distributions array is required" },
        { status: 400 }
      );
    }

    // Verify all buckets belong to user
    const bucketIds = distributions.map((d: any) => d.bucketId);
    const buckets = await prisma.savingsBucket.findMany({
      where: {
        id: { in: bucketIds },
        userId: session.user.id,
      },
    });

    if (buckets.length !== bucketIds.length) {
      return NextResponse.json(
        { error: "Invalid bucket(s)" },
        { status: 400 }
      );
    }

    // Create distributions in a transaction
    const results = await prisma.$transaction(async (tx) => {
      const createdDistributions = [];

      for (const dist of distributions) {
        const amount = new Money(dist.amount);

        // Create distribution
        const distribution = await tx.savingsDistribution.create({
          data: {
            userId: session.user.id,
            bucketId: dist.bucketId,
            month,
            amount: amount.toPrismaDecimal(),
            note: dist.note || null,
          },
        });

        // Update bucket balance
        await tx.savingsBucket.update({
          where: { id: dist.bucketId },
          data: {
            currentBalance: {
              increment: amount.toPrismaDecimal(),
            },
          },
        });

        createdDistributions.push(distribution);
      }

      return createdDistributions;
    });

    // Serialize
    const serialized = results.map((dist) => ({
      ...dist,
      amount: dist.amount.toString(),
    }));

    return NextResponse.json({ distributions: serialized }, { status: 201 });
  } catch (error: any) {
    console.error("Error distributing savings:", error);
    
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Distribution already exists for this bucket and month" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to distribute savings" },
      { status: 500 }
    );
  }
}

// Auto-distribute based on percentages
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { month = getCurrentMonth(), totalSavings } = body;

    if (!totalSavings) {
      return NextResponse.json(
        { error: "totalSavings is required" },
        { status: 400 }
      );
    }

    // Get buckets with auto-distribute percentages
    const buckets = await prisma.savingsBucket.findMany({
      where: {
        userId: session.user.id,
        autoDistributePercent: { not: null },
      },
    });

    if (buckets.length === 0) {
      return NextResponse.json(
        { error: "No buckets configured for auto-distribution" },
        { status: 400 }
      );
    }

    const totalSavingsMoney = new Money(totalSavings);
    const distributions: any[] = [];

    for (const bucket of buckets) {
      const percent = bucket.autoDistributePercent!.toString();
      const amount = totalSavingsMoney.percentage(percent);

      distributions.push({
        bucketId: bucket.id,
        amount: amount.toString(),
        note: `Auto-distributed ${percent}%`,
      });
    }

    // Call the POST method to create distributions
    return await POST(
      new NextRequest(request.url, {
        method: "POST",
        headers: request.headers,
        body: JSON.stringify({ month, distributions }),
      })
    );
  } catch (error) {
    console.error("Error auto-distributing savings:", error);
    return NextResponse.json(
      { error: "Failed to auto-distribute savings" },
      { status: 500 }
    );
  }
}

