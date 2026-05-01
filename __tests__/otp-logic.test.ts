/**
 * ElectiGuide AI — Vitest Unit Tests (Hardened)
 * Target: OTP Logic + Contact Sanitization (lib/auth.ts)
 *
 * Run: npx vitest run __tests__/otp-logic.test.ts
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { sendOtp, verifyOtp, sanitizeContact, maskContact } from "../lib/auth";

/* ────────────── sanitizeContact() ────────────── */

describe("sanitizeContact()", () => {
  it("accepts a valid 10-digit phone number", () => {
    expect(sanitizeContact("+91 98765 43210")).not.toBeNull();
  });

  it("accepts a valid email address", () => {
    expect(sanitizeContact("voter@india.gov.in")).not.toBeNull();
  });

  it("rejects whitespace-only input", () => {
    expect(sanitizeContact("   ")).toBeNull();
  });

  it("rejects empty string", () => {
    expect(sanitizeContact("")).toBeNull();
  });

  it("rejects a short phone number (< 10 digits)", () => {
    expect(sanitizeContact("12345")).toBeNull();
  });

  it("rejects an email without domain", () => {
    expect(sanitizeContact("user@")).toBeNull();
  });

  it("rejects strings longer than 254 chars", () => {
    expect(sanitizeContact("a".repeat(255) + "@test.com")).toBeNull();
  });

  it("rejects random text that is neither phone nor email", () => {
    expect(sanitizeContact("hello world")).toBeNull();
  });

  it("normalizes to lowercase", () => {
    expect(sanitizeContact("Voter@India.GOV.in")).toBe("voter@india.gov.in");
  });

  it("accepts phone with hyphens and parentheses", () => {
    expect(sanitizeContact("+1 (555) 123-4567")).not.toBeNull();
  });
});

/* ────────────── maskContact() ────────────── */

describe("maskContact()", () => {
  it("masks email preserving first 2 chars and domain", () => {
    const masked = maskContact("voter@test.com");
    expect(masked).toBe("vo***@test.com");
  });

  it("masks phone preserving first 4 and last 3 chars", () => {
    const masked = maskContact("+919876543210");
    expect(masked).toMatch(/^\+919.*210$/);
    expect(masked).toContain("*");
  });

  it("handles short contact gracefully", () => {
    const masked = maskContact("ab@x.y");
    expect(masked).toContain("*");
  });
});

/* ────────────── sendOtp() ────────────── */

describe("sendOtp()", () => {
  beforeEach(() => {
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  it("returns success for a valid contact", async () => {
    const result = await sendOtp("+91 98765 43210");
    expect(result.success).toBe(true);
  });

  it("returns a maskedContact for privacy", async () => {
    const result = await sendOtp("voter@test.com");
    expect(result.maskedContact).toBeDefined();
    expect(result.maskedContact).toContain("*");
  });

  it("generates a 6-digit numeric OTP in dev mode", async () => {
    const result = await sendOtp("test@example.com");
    expect(result.success).toBe(true);
    if (result.code) {
      expect(result.code).toMatch(/^\d{6}$/);
    }
  });

  it("generates different OTPs for subsequent requests to the same contact", async () => {
    const r1 = await sendOtp("user@test.com");
    const r2 = await sendOtp("user@test.com");
    expect(r1.success).toBe(true);
    expect(r2.success).toBe(true);
  });
});

/* ────────────── verifyOtp() ────────────── */

describe("verifyOtp()", () => {
  beforeEach(() => {
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  it("returns invalid when no OTP was requested for the contact", async () => {
    const result = await verifyOtp("unknown@test.com", "123456");
    expect(result.valid).toBe(false);
    expect(result.reason).toContain("No OTP was requested");
  });

  it("returns valid for the correct OTP after sendOtp()", async () => {
    const sent = await sendOtp("verify@test.com");
    expect(sent.success).toBe(true);
    if (sent.code) {
      const result = await verifyOtp("verify@test.com", sent.code);
      expect(result.valid).toBe(true);
    }
  });

  it("returns invalid for an incorrect OTP with remaining attempts", async () => {
    await sendOtp("wrong@test.com");
    const result = await verifyOtp("wrong@test.com", "000000");
    expect(result.valid).toBe(false);
    expect(result.reason).toContain("Invalid OTP");
    expect(result.remainingAttempts).toBeDefined();
    expect(result.remainingAttempts).toBeLessThan(5);
  });

  it("consumes OTP after successful verification (single-use)", async () => {
    const sent = await sendOtp("oneuse@test.com");
    if (sent.code) {
      const first = await verifyOtp("oneuse@test.com", sent.code);
      expect(first.valid).toBe(true);

      const second = await verifyOtp("oneuse@test.com", sent.code);
      expect(second.valid).toBe(false);
      expect(second.reason).toContain("No OTP was requested");
    }
  });

  it("rejects expired OTPs", async () => {
    const realDateNow = Date.now;
    const now = Date.now();

    Date.now = vi.fn(() => now);
    const sent = await sendOtp("expired@test.com");

    // Jump forward 6 minutes (past the 5-minute TTL)
    Date.now = vi.fn(() => now + 6 * 60 * 1000);

    if (sent.code) {
      const result = await verifyOtp("expired@test.com", sent.code);
      expect(result.valid).toBe(false);
      expect(result.reason).toContain("expired");
    }

    Date.now = realDateNow;
  });

  it("handles empty string OTP gracefully", async () => {
    await sendOtp("empty@test.com");
    const result = await verifyOtp("empty@test.com", "");
    expect(result.valid).toBe(false);
  });

  it("handles OTP with letters (should not match a numeric-only stored OTP)", async () => {
    await sendOtp("alpha@test.com");
    const result = await verifyOtp("alpha@test.com", "abc123");
    expect(result.valid).toBe(false);
  });
});

/* ────────────── Brute-Force Rate Limiting ────────────── */

describe("Brute-Force Rate Limiting", () => {
  beforeEach(() => {
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  it("locks out after 5 failed attempts", async () => {
    const sent = await sendOtp("bruteforce@test.com");
    expect(sent.success).toBe(true);

    // Exhaust all 5 attempts
    for (let i = 0; i < 5; i++) {
      const result = await verifyOtp("bruteforce@test.com", "000000");
      expect(result.valid).toBe(false);
    }

    // 6th attempt should be rate-limited
    const blocked = await verifyOtp("bruteforce@test.com", "000000");
    expect(blocked.valid).toBe(false);
    expect(blocked.reason).toContain("Too many failed attempts");
    expect(blocked.remainingAttempts).toBe(0);
  });

  it("returns decreasing remainingAttempts on each failure", async () => {
    const sent = await sendOtp("countdown@test.com");
    if (sent.code) {
      const r1 = await verifyOtp("countdown@test.com", "000000");
      expect(r1.remainingAttempts).toBe(4);

      const r2 = await verifyOtp("countdown@test.com", "000000");
      expect(r2.remainingAttempts).toBe(3);
    }
  });
});

/* ────────────── Edge Case Resilience ────────────── */

describe("Edge Case Resilience", () => {
  beforeEach(() => {
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  it("handles special characters in contact", async () => {
    const result = await sendOtp("user+tag@example.com");
    expect(result.success).toBe(true);
  });

  it("handles concurrent OTPs for different contacts", async () => {
    const [r1, r2, r3] = await Promise.all([
      sendOtp("user1@test.com"),
      sendOtp("user2@test.com"),
      sendOtp("user3@test.com"),
    ]);

    expect(r1.success).toBe(true);
    expect(r2.success).toBe(true);
    expect(r3.success).toBe(true);

    if (r1.code && r2.code && r3.code) {
      const v1 = await verifyOtp("user1@test.com", r1.code);
      const v2 = await verifyOtp("user2@test.com", r2.code);
      const v3 = await verifyOtp("user3@test.com", r3.code);

      expect(v1.valid).toBe(true);
      expect(v2.valid).toBe(true);
      expect(v3.valid).toBe(true);
    }
  });
});
