import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { Money, convertToBDT } from "@/lib/money";

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
    const existing = await prisma.expense.findUnique({
      where: { id },
    });

    if (!existing || existing.userId !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const updateData: any = {};

    if (body.date !== undefined) updateData.date = new Date(body.date);
    if (body.merchant !== undefined) updateData.merchant = body.merchant;
    if (body.categoryId !== undefined) updateData.categoryId = body.categoryId;
    if (body.paymentMethodId !== undefined) updateData.paymentMethodId = body.paymentMethodId;
    if (body.note !== undefined) updateData.note = body.note;

    // Handle amount and currency updates
    if (body.amount !== undefined) {
      const currency = body.currency || existing.currency;
      const amountMoney = new Money(body.amount);
      let amountInBDT = amountMoney;

      if (currency !== "BDT") {
        const expenseDate = body.date ? new Date(body.date) : existing.date;
        const month = `${expenseDate.getFullYear()}-${String(expenseDate.getMonth() + 1).padStart(2, "0")}`;
        
        const exchangeRate = await prisma.exchangeRate.findUnique({
          where: {
            userId_month_currency: {
              userId: session.user.id,
              month,
              currency,
            },
          },
        });

        if (!exchangeRate) {
          return NextResponse.json(
            { error: `Exchange rate for ${currency} not set for ${month}` },
            { status: 400 }
          );
        }

        amountInBDT = convertToBDT(amountMoney, currency, exchangeRate.rate.toNumber());
      }

      updateData.amount = amountMoney.toPrismaDecimal();
      updateData.amountInBDT = amountInBDT.toPrismaDecimal();
      updateData.currency = currency;
    }

    const expense = await prisma.expense.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
        paymentMethod: true,
      },
    });

    // Serialize
    const serialized = {
      ...expense,
      amount: expense.amount.toString(),
      amountInBDT: expense.amountInBDT.toString(),
    };

    return NextResponse.json({ expense: serialized });
  } catch (error) {
    console.error("Error updating expense:", error);
    return NextResponse.json(
      { error: "Failed to update expense" },
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
    const existing = await prisma.expense.findUnique({
      where: { id },
    });

    if (!existing || existing.userId !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Soft delete
    await prisma.expense.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting expense:", error);
    return NextResponse.json(
      { error: "Failed to delete expense" },
      { status: 500 }
    );
  }
}

