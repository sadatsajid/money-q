import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
    const { merchant, amount, note, expenseIds } = body;

    // Get categories
    const categories = await prisma.category.findMany({
      select: { id: true, name: true },
      orderBy: { sortOrder: "asc" },
    });

    const categoryList = categories.map((c) => c.name).join(", ");

    let prompt = "";

    if (expenseIds && Array.isArray(expenseIds)) {
      // Batch categorization
      const expenses = await prisma.expense.findMany({
        where: {
          id: { in: expenseIds },
          userId: session.user.id,
        },
      });

      prompt = `You are a financial categorization assistant. Categorize these expenses into one of these categories: ${categoryList}.

Expenses to categorize:
${expenses.map((exp, idx) => `${idx + 1}. Merchant: ${exp.merchant}, Amount: ${exp.amount}, Note: ${exp.note || "N/A"}`).join("\n")}

Return ONLY a JSON array with format: [{"expenseId": "id", "category": "Category Name", "confidence": 0.95}]`;
    } else {
      // Single categorization
      prompt = `You are a financial categorization assistant. Based on the merchant name, amount, and optional note, suggest the most appropriate category from this list: ${categoryList}.

Merchant: ${merchant}
Amount: ${amount}
Note: ${note || "N/A"}

Return ONLY a JSON object with format: {"category": "Category Name", "confidence": 0.95}`;
    }

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-5-mini",
      messages: [
        {
          role: "system",
          content: "You are a helpful financial assistant that categorizes expenses accurately. Always return valid JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_completion_tokens: 500,
    });

    const responseText = completion.choices[0]?.message?.content || "{}";
    
    // Parse JSON response
    type CategorizationResult = {
      expenseId?: string;
      category: string;
      confidence: number;
      categoryId?: string | null;
    };
    
    let result: CategorizationResult | CategorizationResult[];
    try {
      result = JSON.parse(responseText);
    } catch (parseError) {
      console.error("Failed to parse AI response:", responseText);
      return NextResponse.json(
        { error: "Failed to parse AI response" },
        { status: 500 }
      );
    }

    // Map category names to IDs
    if (Array.isArray(result)) {
      result = result.map((item: CategorizationResult) => {
        const category = categories.find(
          (c) => c.name.toLowerCase() === item.category.toLowerCase()
        );
        return {
          ...item,
          categoryId: category?.id || null,
        };
      });
    } else {
      const singleResult = result as CategorizationResult;
      const category = categories.find(
        (c) => c.name.toLowerCase() === singleResult.category.toLowerCase()
      );
      result = {
        ...singleResult,
        categoryId: category?.id || null,
      };
    }

    return NextResponse.json({ result });
  } catch (error: any) {
    console.error("Error in AI categorization:", error);
    return NextResponse.json(
      { error: error.message || "Failed to categorize" },
      { status: 500 }
    );
  }
}

