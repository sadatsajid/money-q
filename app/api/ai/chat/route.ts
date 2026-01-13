import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { buildFinancialContext } from "@/lib/ai/context-builder";
import { getCurrentMonth } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !authUser) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { messages } = await request.json();

    // Build financial context
    const month = getCurrentMonth();
    const financialContext = await buildFinancialContext(authUser.id, month);

    // Create system message with context
    const systemMessage = `You are MoneyQ AI, a helpful financial advisor for users in Bangladesh.

You have access to the user's financial data and should provide personalized advice based on their actual spending patterns, income, and savings goals.

${financialContext}

Guidelines:
- All amounts are in BDT (Bangladeshi Taka) - use ৳ symbol
- Provide actionable, specific advice based on their actual data
- Be encouraging but realistic
- Consider the Bangladesh context (e.g., typical living costs, savings culture)
- Help them understand their spending patterns
- Suggest ways to optimize their budget
- Answer questions about their finances clearly
- Use bullet points for clarity when appropriate
- Keep responses concise but informative

If the user asks about something not in their data, politely explain you can only help with their tracked financial information.`;

    const result = await streamText({
      model: openai(process.env.OPENAI_MODEL || "gpt-4o-mini") as any,
      system: systemMessage,
      messages,
    });

    return result.toTextStreamResponse();
  } catch (error: any) {
    console.error("Error in AI chat:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to process chat" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

