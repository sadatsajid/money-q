import {
  Money,
  formatMoney,
  convertToBDT,
  sumMoney,
  parseMoney,
} from "@/lib/money";

describe("Money class", () => {
  describe("basic operations", () => {
    it("should add two money values correctly", () => {
      const a = new Money(100.50);
      const b = new Money(50.25);
      const result = a.add(b);
      expect(result.toString()).toBe("150.75");
    });

    it("should subtract two money values correctly", () => {
      const a = new Money(100.50);
      const b = new Money(50.25);
      const result = a.subtract(b);
      expect(result.toString()).toBe("50.25");
    });

    it("should multiply money by a factor", () => {
      const money = new Money(100);
      const result = money.multiply(1.5);
      expect(result.toString()).toBe("150.00");
    });

    it("should divide money by a factor", () => {
      const money = new Money(100);
      const result = money.divide(4);
      expect(result.toString()).toBe("25.00");
    });

    it("should calculate percentage correctly", () => {
      const money = new Money(1000);
      const result = money.percentage(15);
      expect(result.toString()).toBe("150.00");
    });
  });

  describe("comparisons", () => {
    it("should compare money values correctly", () => {
      const a = new Money(100);
      const b = new Money(50);
      const c = new Money(100);

      expect(a.greaterThan(b)).toBe(true);
      expect(b.lessThan(a)).toBe(true);
      expect(a.equals(c)).toBe(true);
    });

    it("should check if money is zero", () => {
      const zero = new Money(0);
      const nonZero = new Money(10);

      expect(zero.isZero()).toBe(true);
      expect(nonZero.isZero()).toBe(false);
    });

    it("should check if money is positive or negative", () => {
      const positive = new Money(100);
      const negative = new Money(-50);

      expect(positive.isPositive()).toBe(true);
      expect(negative.isNegative()).toBe(true);
    });
  });

  describe("precision", () => {
    it("should handle decimal precision correctly", () => {
      const a = new Money("0.1");
      const b = new Money("0.2");
      const result = a.add(b);
      expect(result.toString()).toBe("0.30");
    });

    it("should handle large numbers correctly", () => {
      const a = new Money("999999999999.99");
      const b = new Money("0.01");
      const result = a.add(b);
      expect(result.toString()).toBe("1000000000000.00");
    });

    it("should round correctly", () => {
      const money = new Money("10.555");
      expect(money.toString()).toBe("10.56");
    });
  });

  describe("absolute value", () => {
    it("should return absolute value", () => {
      const negative = new Money(-100);
      const result = negative.abs();
      expect(result.toString()).toBe("100.00");
    });
  });
});

describe("formatMoney", () => {
  it("should format BDT correctly", () => {
    const money = new Money(1234.56);
    expect(formatMoney(money, "BDT")).toBe("৳1,234.56");
  });

  it("should format USD correctly", () => {
    const money = new Money(1234.56);
    expect(formatMoney(money, "USD")).toBe("$1,234.56");
  });

  it("should handle string input", () => {
    expect(formatMoney("1234.56", "BDT")).toBe("৳1,234.56");
  });

  it("should handle number input", () => {
    expect(formatMoney(1234.56, "BDT")).toBe("৳1,234.56");
  });
});

describe("convertToBDT", () => {
  it("should return same amount for BDT", () => {
    const money = new Money(1000);
    const result = convertToBDT(money, "BDT");
    expect(result.toString()).toBe("1000.00");
  });

  it("should convert USD to BDT with exchange rate", () => {
    const money = new Money(100);
    const result = convertToBDT(money, "USD", 110);
    expect(result.toString()).toBe("11000.00");
  });

  it("should throw error if exchange rate is missing", () => {
    const money = new Money(100);
    expect(() => convertToBDT(money, "USD")).toThrow();
  });
});

describe("sumMoney", () => {
  it("should sum array of money values", () => {
    const amounts = [
      new Money(100),
      new Money(200),
      new Money(300),
    ];
    const result = sumMoney(amounts);
    expect(result.toString()).toBe("600.00");
  });

  it("should return zero for empty array", () => {
    const result = sumMoney([]);
    expect(result.toString()).toBe("0.00");
  });
});

describe("parseMoney", () => {
  it("should parse plain number string", () => {
    const result = parseMoney("1234.56");
    expect(result.toString()).toBe("1234.56");
  });

  it("should parse number with commas", () => {
    const result = parseMoney("1,234.56");
    expect(result.toString()).toBe("1234.56");
  });

  it("should parse BDT formatted string", () => {
    const result = parseMoney("৳1,234.56");
    expect(result.toString()).toBe("1234.56");
  });

  it("should parse USD formatted string", () => {
    const result = parseMoney("$1,234.56");
    expect(result.toString()).toBe("1234.56");
  });
});

