/**
 * ElectiGuide AI — Unit Tests: Format Utilities
 * Tests Intl.NumberFormat INR formatting, edge cases, and number formatting
 *
 * Run: npx jest __tests__/format-utils.test.ts
 * Or:  npx tsx --test __tests__/format-utils.test.ts
 */

import {
  formatINRIntl,
  formatINRFull,
  formatINRDetailed,
  formatNumber,
  calculateNetWorth,
  formatLastUpdated,
  getRelativeTime,
} from "../lib/format-utils";

/* ════════════════════════════════════════════════════════════
   formatINRIntl — Crores/Lakhs abbreviation
   ════════════════════════════════════════════════════════════ */

describe("formatINRIntl", () => {
  test("formats 45 Cr correctly", () => {
    expect(formatINRIntl(45_00_00_000)).toBe("₹45 Cr");
  });

  test("formats 28.5 Cr correctly", () => {
    expect(formatINRIntl(28_50_00_000)).toBe("₹28.5 Cr");
  });

  test("formats 2 Cr liabilities", () => {
    expect(formatINRIntl(2_00_00_000)).toBe("₹2 Cr");
  });

  test("formats 8.2 Cr correctly", () => {
    expect(formatINRIntl(8_20_00_000)).toBe("₹8.2 Cr");
  });

  test("formats 67.3 Cr correctly", () => {
    expect(formatINRIntl(67_30_00_000)).toBe("₹67.3 Cr");
  });

  test("formats 52.8 Cr correctly", () => {
    expect(formatINRIntl(52_80_00_000)).toBe("₹52.8 Cr");
  });

  test("formats 100+ Cr correctly", () => {
    const result = formatINRIntl(1_05_00_00_000);
    expect(result).toContain("₹");
    expect(result).toContain("Cr");
  });

  test("formats lakhs correctly", () => {
    const result = formatINRIntl(5_50_000);
    expect(result).toContain("₹");
    expect(result).toContain("L");
  });

  test("formats small amounts with full ₹ symbol", () => {
    const result = formatINRIntl(50000);
    expect(result).toContain("₹");
  });

  test("handles null input gracefully", () => {
    expect(formatINRIntl(null)).toBe("₹0");
  });

  test("handles undefined input gracefully", () => {
    expect(formatINRIntl(undefined)).toBe("₹0");
  });

  test("handles NaN input gracefully", () => {
    expect(formatINRIntl(NaN)).toBe("₹0");
  });

  test("handles zero correctly", () => {
    expect(formatINRIntl(0)).toBe("₹0");
  });
});

/* ════════════════════════════════════════════════════════════
   formatINRFull — Full Indian numbering
   ════════════════════════════════════════════════════════════ */

describe("formatINRFull", () => {
  test("formats 45 Cr in full", () => {
    const result = formatINRFull(45_00_00_000);
    expect(result).toContain("₹");
    // Should have Indian numbering: 45,00,00,000
    expect(result).toContain("45");
  });

  test("handles null gracefully", () => {
    expect(formatINRFull(null)).toBe("₹0");
  });
});

/* ════════════════════════════════════════════════════════════
   formatNumber — Indian locale grouping
   ════════════════════════════════════════════════════════════ */

describe("formatNumber", () => {
  test("formats electors count with commas", () => {
    const result = formatNumber(1534287);
    expect(result).toContain("15");
    expect(result).toContain(",");
  });

  test("handles null gracefully", () => {
    expect(formatNumber(null)).toBe("0");
  });

  test("handles zero", () => {
    expect(formatNumber(0)).toBe("0");
  });
});

/* ════════════════════════════════════════════════════════════
   calculateNetWorth
   ════════════════════════════════════════════════════════════ */

describe("calculateNetWorth", () => {
  test("positive net worth (assets > liabilities)", () => {
    const result = calculateNetWorth(45_00_00_000, 2_00_00_000);
    expect(result.isPositive).toBe(true);
    expect(result.netWorth).toBe(43_00_00_000);
    expect(result.formatted).toContain("₹");
  });

  test("negative net worth (liabilities > assets)", () => {
    const result = calculateNetWorth(1_00_00_000, 5_00_00_000);
    expect(result.isPositive).toBe(false);
    expect(result.netWorth).toBe(-4_00_00_000);
  });

  test("zero net worth", () => {
    const result = calculateNetWorth(10_00_00_000, 10_00_00_000);
    expect(result.netWorth).toBe(0);
    expect(result.isPositive).toBe(true);
  });
});

/* ════════════════════════════════════════════════════════════
   formatLastUpdated
   ════════════════════════════════════════════════════════════ */

describe("formatLastUpdated", () => {
  test("formats current date", () => {
    const result = formatLastUpdated();
    expect(result).not.toBe("Unknown");
    expect(result.length).toBeGreaterThan(5);
  });

  test("handles invalid input", () => {
    const result = formatLastUpdated("invalid-date");
    // Should return something, not crash
    expect(typeof result).toBe("string");
  });
});

/* ════════════════════════════════════════════════════════════
   getRelativeTime
   ════════════════════════════════════════════════════════════ */

describe("getRelativeTime", () => {
  test("recent time shows 'Just now'", () => {
    const result = getRelativeTime(new Date().toISOString());
    expect(result).toBe("Just now");
  });

  test("5 minutes ago", () => {
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const result = getRelativeTime(fiveMinAgo);
    expect(result).toContain("min ago");
  });

  test("2 hours ago", () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    const result = getRelativeTime(twoHoursAgo);
    expect(result).toContain("hrs ago");
  });
});
