import Decimal from "decimal.js";
import { Prisma } from "@prisma/client";

// Configure Decimal.js globally for financial precision
Decimal.set({
  precision: 20,
  rounding: Decimal.ROUND_HALF_UP,
  toExpNeg: -9e15,
  toExpPos: 9e15,
  minE: -9e15,
  maxE: 9e15,
});

/**
 * Money class for deterministic financial calculations
 * All monetary values should use this class to ensure precision
 */
export class Money {
  private readonly amount: Decimal;

  constructor(value: string | number | Decimal) {
    this.amount = new Decimal(value);
  }

  /**
   * Add another Money instance
   */
  add(other: Money): Money {
    return new Money(this.amount.plus(other.amount));
  }

  /**
   * Subtract another Money instance
   */
  subtract(other: Money): Money {
    return new Money(this.amount.minus(other.amount));
  }

  /**
   * Multiply by a factor
   */
  multiply(factor: string | number | Decimal): Money {
    return new Money(this.amount.times(factor));
  }

  /**
   * Divide by a factor
   */
  divide(factor: string | number | Decimal): Money {
    return new Money(this.amount.dividedBy(factor));
  }

  /**
   * Calculate percentage
   */
  percentage(percent: string | number | Decimal): Money {
    return new Money(this.amount.times(percent).dividedBy(100));
  }

  /**
   * Check if amount is zero
   */
  isZero(): boolean {
    return this.amount.isZero();
  }

  /**
   * Check if amount is positive
   */
  isPositive(): boolean {
    return this.amount.greaterThan(0);
  }

  /**
   * Check if amount is negative
   */
  isNegative(): boolean {
    return this.amount.lessThan(0);
  }

  /**
   * Compare with another Money instance
   */
  greaterThan(other: Money): boolean {
    return this.amount.greaterThan(other.amount);
  }

  lessThan(other: Money): boolean {
    return this.amount.lessThan(other.amount);
  }

  equals(other: Money): boolean {
    return this.amount.equals(other.amount);
  }

  /**
   * Get absolute value
   */
  abs(): Money {
    return new Money(this.amount.abs());
  }

  /**
   * Convert to number (use with caution)
   */
  toNumber(): number {
    return this.amount.toNumber();
  }

  /**
   * Convert to string with 2 decimal places (for display)
   */
  toString(): string {
    return this.amount.toFixed(2);
  }

  /**
   * Convert to string for JSON serialization
   */
  toJSON(): string {
    return this.toString();
  }

  /**
   * Get Decimal instance (for Prisma operations)
   */
  toDecimal(): Decimal {
    return this.amount;
  }

  /**
   * Get Prisma Decimal type
   */
  toPrismaDecimal(): Prisma.Decimal {
    return new Prisma.Decimal(this.toString());
  }
}

/**
 * Convert Prisma Decimal to Money instance
 */
export function prismaDecimalToMoney(value: Prisma.Decimal | Decimal): Money {
  return new Money(value.toString());
}

/**
 * Format money for display with currency symbol
 */
export function formatMoney(amount: Money | string | number, currency = "BDT"): string {
  const money = amount instanceof Money ? amount : new Money(amount);
  const formatted = money.toNumber().toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  if (currency === "BDT") {
    return `৳${formatted}`;
  } else if (currency === "USD") {
    return `$${formatted}`;
  }
  
  return `${formatted} ${currency}`;
}

/**
 * Convert currency to BDT using exchange rate
 */
export function convertToBDT(
  amount: Money,
  fromCurrency: string,
  exchangeRate?: number
): Money {
  if (fromCurrency === "BDT") {
    return amount;
  }

  if (!exchangeRate) {
    throw new Error(`Exchange rate required for ${fromCurrency} to BDT conversion`);
  }

  return amount.multiply(exchangeRate);
}

/**
 * Calculate sum of Money array
 */
export function sumMoney(amounts: Money[]): Money {
  return amounts.reduce(
    (sum, amount) => sum.add(amount),
    new Money(0)
  );
}

/**
 * Parse money string to Money instance
 * Handles various formats: "1234.56", "1,234.56", "৳1,234.56"
 */
export function parseMoney(value: string): Money {
  // Remove currency symbols and commas
  const cleaned = value.replace(/[৳$,\s]/g, "");
  return new Money(cleaned);
}

