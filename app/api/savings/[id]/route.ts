import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { Money } from "@/lib/money";

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

    // Verify ownership
    const existing = await prisma.savingsBucket.findUnique({
      where: { id },
    });

    if (!existing || existing.userId !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const updateData: any = {};

    if (body.name !== undefined) updateData.name = body.name;
    if (body.type !== undefined) updateData.type = body.type;
    if (body.sortOrder !== undefined) updateData.sortOrder = body.sortOrder;
    if (body.targetDate !== undefined)
      updateData.targetDate = body.targetDate ? new Date(body.targetDate) : null;

    if (body.targetAmount !== undefined) {
      updateData.targetAmount = body.targetAmount
        ? new Money(body.targetAmount).toPrismaDecimal()
        : null;
    }

    if (body.monthlyContribution !== undefined) {
      updateData.monthlyContribution = body.monthlyContribution
        ? new Money(body.monthlyContribution).toPrismaDecimal()
        : null;
    }

    if (body.autoDistributePercent !== undefined) {
      updateData.autoDistributePercent = body.autoDistributePercent
        ? new Money(body.autoDistributePercent).toPrismaDecimal()
        : null;
    }

    const savingsBucket = await prisma.savingsBucket.update({
      where: { id },
      data: updateData,
    });

    // Serialize
    const serialized = {
      ...savingsBucket,
      currentBalance: savingsBucket.currentBalance.toString(),
      targetAmount: savingsBucket.targetAmount?.toString() || null,
      monthlyContribution: savingsBucket.monthlyContribution?.toString() || null,
      autoDistributePercent: savingsBucket.autoDistributePercent?.toString() || null,
    };

    return NextResponse.json({ savingsBucket: serialized });
  } catch (error) {
    console.error("Error updating savings bucket:", error);
    return NextResponse.json(
      { error: "Failed to update savings bucket" },
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

    // Verify ownership
    const existing = await prisma.savingsBucket.findUnique({
      where: { id },
    });

    if (!existing || existing.userId !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Check if bucket has a balance
    if (parseFloat(existing.currentBalance.toString()) > 0) {
      return NextResponse.json(
        { error: "Cannot delete bucket with balance. Withdraw funds first." },
        { status: 400 }
      );
    }

    // Delete bucket and its distributions
    await prisma.savingsBucket.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting savings bucket:", error);
    return NextResponse.json(
      { error: "Failed to delete savings bucket" },
      { status: 500 }
    );
  }
}

