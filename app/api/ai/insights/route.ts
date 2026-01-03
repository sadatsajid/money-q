import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { getCurrentMonth } from "@/lib/utils";
import { generateMonthlyInsight } from "@/lib/ai/generate-insight";

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
    const { month = getCurrentMonth() } = body;

    // Check if insights already exist for this month
    const existingInsight = await prisma.monthlyInsight.findUnique({
      where: {
        userId_month: {
          userId: session.user.id,
          month,
        },
      },
    });

    if (existingInsight) {
      return NextResponse.json({
        insight: {
          ...existingInsight,
          content: existingInsight.content,
        },
      });
    }

    // Generate insight using shared function
    const result = await generateMonthlyInsight(session.user.id, month);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to generate insights" },
        { status: 500 }
      );
    }

    // Fetch the generated insight
    const insight = await prisma.monthlyInsight.findUnique({
      where: {
        id: result.insightId!,
      },
    });

    if (!insight) {
      return NextResponse.json(
        { error: "Insight was created but could not be retrieved" },
        { status: 500 }
      );
    }

    return NextResponse.json({ insight }, { status: 201 });
  } catch (error: any) {
    console.error("Error generating insights:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate insights" },
      { status: 500 }
    );
  }
}

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
    const month = searchParams.get("month") || getCurrentMonth();

    const insight = await prisma.monthlyInsight.findUnique({
      where: {
        userId_month: {
          userId: session.user.id,
          month,
        },
      },
    });

    if (!insight) {
      return NextResponse.json({ insight: null });
    }

    return NextResponse.json({ insight });
  } catch (error) {
    console.error("Error fetching insight:", error);
    return NextResponse.json(
      { error: "Failed to fetch insight" },
      { status: 500 }
    );
  }
}

