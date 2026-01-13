import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentMonth } from "@/lib/utils";

/**
 * Cron job to update global exchange rates
 * Should run monthly via Vercel Cron (e.g., on the 1st of each month)
 *
 * Example vercel.json config:
 *   "crons": [{
 *     "path": "/api/cron/update-exchange-rates",
 *     "schedule": "0 1 1 * *" // 1 AM on the 1st of each month
 *   }]
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentMonth = getCurrentMonth();
    
    // Free exchange rate API - Using exchangerate-api.com with USD base
    // We'll fetch USD rates and calculate BDT rates
    const EXCHANGE_API_URL = process.env.EXCHANGE_RATE_API_URL || 
      "https://api.exchangerate-api.com/v4/latest/USD";

    console.log(`[Cron] Updating global exchange rates for ${currentMonth}...`);

    // Fetch latest rates from external API
    const response = await fetch(EXCHANGE_API_URL);
    
    if (!response.ok) {
      throw new Error("Failed to fetch exchange rates from external API");
    }

    const data = await response.json();
    const rates = data.rates;

    // Common currencies we support
    const currencies = ["USD", "EUR", "GBP", "MYR", "SGD"];
    const updatedRates = [];

    // Get USD to BDT rate (if available, otherwise use fallback)
    // Note: exchangerate-api.com may not have BDT, so we use a reasonable default
    // In production, you might want to use a different API that supports BDT
    const usdToBDT = rates["BDT"] || 110; // Fallback: typical USD to BDT rate

    for (const currency of currencies) {
      let rateToBDT: number;
      
      if (currency === "USD") {
        rateToBDT = usdToBDT;
      } else {
        // For other currencies: convert via USD
        // Example: EUR to BDT = (1 USD / EUR rate) * (USD to BDT)
        // The API returns rates like: 1 USD = X EUR, so 1 EUR = 1/X USD
        if (rates[currency]) {
          const currencyToUSD = 1 / rates[currency];
          rateToBDT = currencyToUSD * usdToBDT;
        } else {
          console.warn(`Rate for ${currency} not found in API response, skipping`);
          continue;
        }
      }

        const globalRate = await prisma.globalExchangeRate.upsert({
          where: {
            month_currency: {
              month: currentMonth,
              currency,
            },
          },
          create: {
            month: currentMonth,
            currency,
            rate: rateToBDT,
          },
          update: {
            rate: rateToBDT,
          },
        });

        updatedRates.push({
          currency: globalRate.currency,
          month: globalRate.month,
          rate: globalRate.rate.toString(),
        });

        console.log(`[Cron] Updated ${currency} rate: ${rateToBDT} BDT for ${currentMonth}`);
    }

    return NextResponse.json({
      success: true,
      month: currentMonth,
      rates: updatedRates,
      source: "exchangerate-api.com",
      message: `Updated ${updatedRates.length} exchange rates for ${currentMonth}`,
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error in update-exchange-rates cron job:", error.message, error);
    } else {
      console.error("Error in update-exchange-rates cron job:", error);
    }
    return NextResponse.json(
      { error: "Failed to update exchange rates", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

