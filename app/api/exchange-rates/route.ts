import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { getCurrentMonth } from "@/lib/utils";

// Free exchange rate API - exchangerate-api.com
const EXCHANGE_API_URL = process.env.EXCHANGE_RATE_API_URL || "https://api.exchangerate-api.com/v4/latest/USD";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const month = searchParams.get("month") || getCurrentMonth();

    // Get exchange rates for the user and month
    const rates = await prisma.exchangeRate.findMany({
      where: {
        userId: authUser.id,
        month,
      },
    });

    // Serialize Decimal fields
    const serialized = rates.map((rate) => ({
      ...rate,
      rate: rate.rate.toString(),
    }));

    return NextResponse.json({ rates: serialized });
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error fetching exchange rates:", error.message, error);
    } else {
      console.error("Error fetching exchange rates:", error);
    }
    return NextResponse.json(
      { error: "Failed to fetch exchange rates" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { currency, rate, month } = body;

    if (!currency || !rate || !month) {
      return NextResponse.json(
        { error: "currency, rate, and month are required" },
        { status: 400 }
      );
    }

    // Upsert exchange rate
    const exchangeRate = await prisma.exchangeRate.upsert({
      where: {
        userId_month_currency: {
          userId: authUser.id,
          month,
          currency,
        },
      },
      create: {
        userId: authUser.id,
        month,
        currency,
        rate: parseFloat(rate),
      },
      update: {
        rate: parseFloat(rate),
      },
    });

    return NextResponse.json({
      rate: {
        ...exchangeRate,
        rate: exchangeRate.rate.toString(),
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error saving exchange rate:", error.message, error);
    } else {
      console.error("Error saving exchange rate:", error);
    }
    return NextResponse.json(
      { error: "Failed to save exchange rate" },
      { status: 500 }
    );
  }
}

// Fetch latest exchange rates from external API
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { month } = body;

    if (!month) {
      return NextResponse.json(
        { error: "month is required" },
        { status: 400 }
      );
    }

    // Fetch latest rates from external API
    const response = await fetch(EXCHANGE_API_URL);
    
    if (!response.ok) {
      throw new Error("Failed to fetch exchange rates from external API");
    }

    const data = await response.json();
    const rates = data.rates;

    // Common currencies
    const currencies = ["EUR", "GBP", "BDT"];
    const updatedRates = [];

    for (const currency of currencies) {
      if (rates[currency]) {
        const exchangeRate = await prisma.exchangeRate.upsert({
          where: {
            userId_month_currency: {
              userId: authUser.id,
              month,
              currency,
            },
          },
          create: {
            userId: authUser.id,
            month,
            currency,
            rate: rates[currency],
          },
          update: {
            rate: rates[currency],
          },
        });

        updatedRates.push({
          ...exchangeRate,
          rate: exchangeRate.rate.toString(),
        });
      }
    }

    return NextResponse.json({
      success: true,
      rates: updatedRates,
      source: "exchangerate-api.com",
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error fetching exchange rates:", error.message, error);
    } else {
      console.error("Error fetching exchange rates:", error);
    }
    return NextResponse.json(
      { error: "Failed to fetch exchange rates" },
      { status: 500 }
    );
  }
}

