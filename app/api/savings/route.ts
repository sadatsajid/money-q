import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { Money } from "@/lib/money";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const savingsBuckets = await prisma.savingsBucket.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        distributions: {
          orderBy: {
            createdAt: "desc",
          },
          take: 10,
        },
      },
      orderBy: {
        sortOrder: "asc",
      },
    });

    // Serialize
    const serialized = savingsBuckets.map((bucket) => ({
      ...bucket,
      currentBalance: bucket.currentBalance.toString(),
      targetAmount: bucket.targetAmount?.toString() || null,
      monthlyContribution: bucket.monthlyContribution?.toString() || null,
      autoDistributePercent: bucket.autoDistributePercent?.toString() || null,
      distributions: bucket.distributions.map((dist) => ({
        ...dist,
        amount: dist.amount.toString(),
      })),
    }));

    return NextResponse.json({ savingsBuckets: serialized });
  } catch (error) {
    console.error("Error fetching savings buckets:", error);
    return NextResponse.json(
      { error: "Failed to fetch savings buckets" },
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
      name,
      type,
      targetAmount,
      targetDate,
      monthlyContribution,
      autoDistributePercent,
    } = body;

    if (!name || !type) {
      return NextResponse.json(
        { error: "Name and type are required" },
        { status: 400 }
      );
    }

    const savingsBucket = await prisma.savingsBucket.create({
      data: {
        userId: session.user.id,
        name,
        type,
        currentBalance: new Money(0).toPrismaDecimal(),
        targetAmount: targetAmount ? new Money(targetAmount).toPrismaDecimal() : null,
        targetDate: targetDate ? new Date(targetDate) : null,
        monthlyContribution: monthlyContribution
          ? new Money(monthlyContribution).toPrismaDecimal()
          : null,
        autoDistributePercent: autoDistributePercent
          ? new Money(autoDistributePercent).toPrismaDecimal()
          : null,
      },
    });

    // Serialize
    const serialized = {
      ...savingsBucket,
      currentBalance: savingsBucket.currentBalance.toString(),
      targetAmount: savingsBucket.targetAmount?.toString() || null,
      monthlyContribution: savingsBucket.monthlyContribution?.toString() || null,
      autoDistributePercent: savingsBucket.autoDistributePercent?.toString() || null,
    };

    return NextResponse.json({ savingsBucket: serialized }, { status: 201 });
  } catch (error) {
    console.error("Error creating savings bucket:", error);
    return NextResponse.json(
      { error: "Failed to create savings bucket" },
      { status: 500 }
    );
  }
}

