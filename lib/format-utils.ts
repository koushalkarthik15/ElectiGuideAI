/* ════════════════════════════════════════════════════════════
   ElectiGuide AI — Formatting Utilities
   Intl.NumberFormat for INR, number formatting, timestamps
   ════════════════════════════════════════════════════════════ */

/* ──── INR Currency Formatter (Intl.NumberFormat) ──── */

const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
  minimumFractionDigits: 0,
});

const inrFormatterDetailed = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
  minimumFractionDigits: 0,
});

/**
 * Format amount as INR using Intl.NumberFormat.
 * Returns human-readable abbreviations for Crores/Lakhs.
 * Falls back to "₹0" for invalid inputs.
 */
export function formatINRIntl(amount: number | null | undefined): string {
  if (amount == null || isNaN(amount)) return "₹0";

  const abs = Math.abs(amount);

  if (abs >= 1_00_00_00_000) {
    // 100+ Cr
    const val = abs / 1_00_00_000;
    return `₹${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(val)} Cr`;
  }
  if (abs >= 1_00_00_000) {
    // 1 Cr+
    const val = abs / 1_00_00_000;
    return `₹${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(val)} Cr`;
  }
  if (abs >= 1_00_000) {
    // 1 Lakh+
    const val = abs / 1_00_000;
    return `₹${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 }).format(val)} L`;
  }

  return inrFormatter.format(abs);
}

/**
 * Format amount as full INR with Indian numbering system.
 * Example: 4,50,00,000 → ₹4,50,00,000
 */
export function formatINRFull(amount: number | null | undefined): string {
  if (amount == null || isNaN(amount)) return "₹0";
  return inrFormatter.format(Math.abs(amount));
}

/**
 * Format amount with detailed decimals.
 * Example: 82000000 → ₹8,20,00,000
 */
export function formatINRDetailed(amount: number | null | undefined): string {
  if (amount == null || isNaN(amount)) return "₹0";
  return inrFormatterDetailed.format(Math.abs(amount));
}

/* ──── Number Formatter ──── */

const indianNumberFormatter = new Intl.NumberFormat("en-IN");

/**
 * Format a number with Indian locale grouping.
 * Example: 1892543 → 18,92,543
 */
export function formatNumber(num: number | null | undefined): string {
  if (num == null || isNaN(num)) return "0";
  return indianNumberFormatter.format(num);
}

/* ──── Net Worth Calculator ──── */

export function calculateNetWorth(assets: number, liabilities: number): {
  netWorth: number;
  formatted: string;
  isPositive: boolean;
} {
  const netWorth = assets - liabilities;
  return {
    netWorth,
    formatted: formatINRIntl(Math.abs(netWorth)),
    isPositive: netWorth >= 0,
  };
}

/* ──── Timestamp Formatter ──── */

/**
 * Returns a formatted "last updated" timestamp.
 */
export function formatLastUpdated(date?: Date | string | number): string {
  try {
    const d = date ? new Date(date) : new Date();
    return d.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch {
    return "Unknown";
  }
}

/**
 * Returns relative time string (e.g., "2 min ago", "1 hr ago").
 */
export function getRelativeTime(isoString: string): string {
  try {
    const diff = Date.now() - new Date(isoString).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins} min ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} hr${hrs > 1 ? "s" : ""} ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  } catch {
    return "";
  }
}
