/**
 * Auth.js (v5) Configuration — ElectiGuide AI (Hardened)
 *
 * Passwordless OTP authentication flow.
 * Session tokens are stored in encrypted, HTTP-only cookies.
 * No voter data is persisted permanently on the server.
 *
 * Security features:
 * - Brute-force rate limiting (max 5 attempts per contact per window)
 * - OTP single-use with auto-expiry (5 min TTL)
 * - Cryptographic OTP generation
 * - Contact input sanitization
 */

// NOTE: Requires `next-auth@5` and a provider adapter.
// Install: npm i next-auth@beta

import type { NextAuthConfig } from "next-auth";

/* ────────────────── OTP Store ────────────────── */

const OTP_TTL_MS = 5 * 60 * 1000; // 5 minutes
const MAX_VERIFY_ATTEMPTS = 5;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

interface PendingOtp {
  code: string;
  expiresAt: number;
  attempts: number;
  rateLimitResetAt: number;
}

/**
 * In-memory OTP store with automatic TTL cleanup.
 * ⚠ SCAFFOLD ONLY — in production, use Redis with TTL keys.
 */
const pendingOtps = new Map<string, PendingOtp>();

function cleanupExpiredOtps() {
  const now = Date.now();
  for (const [key, entry] of pendingOtps) {
    if (entry.expiresAt <= now && entry.rateLimitResetAt <= now) {
      pendingOtps.delete(key);
    }
  }
}

/* ────────────────── Contact Sanitization ────────────────── */

/**
 * Sanitize and validate the contact input.
 * Returns null if the contact is invalid.
 */
export function sanitizeContact(raw: string): string | null {
  const trimmed = raw.trim().toLowerCase();

  // Must not be empty
  if (!trimmed) return null;

  // Must not exceed reasonable length
  if (trimmed.length > 254) return null;

  // Basic email pattern
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);

  // Phone: digits, spaces, plus, hyphens — at least 10 digits
  const digitsOnly = trimmed.replace(/[\s\-+()]/g, "");
  const isPhone = /^\d{10,15}$/.test(digitsOnly);

  if (!isEmail && !isPhone) return null;

  return trimmed;
}

/**
 * Mask a contact for display (e.g., "+91 987****210" or "te***@test.com")
 */
export function maskContact(contact: string): string {
  if (contact.includes("@")) {
    // Email: show first 2 chars, mask rest before @
    const [local, domain] = contact.split("@");
    const visible = local.slice(0, 2);
    const masked = "*".repeat(Math.max(local.length - 2, 1));
    return `${visible}${masked}@${domain}`;
  }
  // Phone: show first 4 and last 3, mask the rest
  if (contact.length <= 7) return contact.slice(0, 2) + "***" + contact.slice(-2);
  const start = contact.slice(0, 4);
  const end = contact.slice(-3);
  const middle = "*".repeat(Math.max(contact.length - 7, 3));
  return `${start}${middle}${end}`;
}

/* ────────────────── OTP Generation ────────────────── */

/**
 * Generate a cryptographically random 6-digit OTP code.
 */
function generateOtpCode(): string {
  const array = new Uint32Array(1);
  if (typeof globalThis.crypto !== "undefined") {
    globalThis.crypto.getRandomValues(array);
  } else {
    array[0] = Math.floor(Math.random() * 1000000);
  }
  return String(array[0] % 1000000).padStart(6, "0");
}

/* ────────────────── Public API ────────────────── */

/**
 * Dispatch OTP to the provided contact (mobile/email).
 */
export async function sendOtp(
  contact: string
): Promise<{ success: boolean; code?: string; maskedContact?: string; error?: string }> {
  cleanupExpiredOtps();

  // Check if currently rate-limited
  const existing = pendingOtps.get(contact);
  if (existing && existing.attempts >= MAX_VERIFY_ATTEMPTS && Date.now() < existing.rateLimitResetAt) {
    return {
      success: false,
      error: "Too many attempts. Please wait 15 minutes before requesting a new OTP.",
    };
  }

  const code = generateOtpCode();
  pendingOtps.set(contact, {
    code,
    expiresAt: Date.now() + OTP_TTL_MS,
    attempts: 0,
    rateLimitResetAt: Date.now() + RATE_LIMIT_WINDOW_MS,
  });

  // ── Real-Time Delivery (Resend Free Tier) ──
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  
  if (contact.includes("@")) {
    if (RESEND_API_KEY) {
      try {
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: "ElectiGuide <onboarding@resend.dev>",
            to: contact,
            subject: "Your ElectiGuide Verification Code",
            html: `
              <div style="font-family: sans-serif; padding: 20px; background: #F9F7F2; color: #1A1A1A;">
                <h2 style="color: #D32F2F;">ElectiGuide AI</h2>
                <p>Your authorization code for the voter dashboard is:</p>
                <div style="font-size: 32px; font-weight: bold; letter-spacing: 4px; padding: 20px; background: white; border: 2px solid #E8E4DB; border-radius: 12px; display: inline-block;">
                  ${code}
                </div>
                <p style="font-size: 12px; color: #666; margin-top: 20px;">
                  This code expires in 5 minutes. If you did not request this, please ignore this email.
                </p>
              </div>
            `,
          }),
        });
        
        if (!res.ok) {
          const err = await res.json();
          console.error("[RESEND ERROR]", err);
        }
      } catch (e) {
        console.error("[AUTH] Resend fetch failed:", e);
      }
    } else {
      console.warn("[AUTH] RESEND_API_KEY missing. Logging OTP to terminal only.");
    }
  } else {
    console.warn("[AUTH] Phone SMS disabled for free tier. Logging OTP to terminal only.");
  }

  // Always log to terminal for redundancy
  console.log(`[AUTH] OTP dispatched to: ${contact} → code: ${code}`);

  return {
    success: true,
    maskedContact: maskContact(contact),
    ...(process.env.NODE_ENV === "development" ? { code } : {}),
  };
}

/**
 * Verify an OTP code against the pending store.
 * Enforces brute-force rate limiting.
 */
export async function verifyOtp(
  contact: string,
  otp: string
): Promise<{ valid: boolean; reason?: string; remainingAttempts?: number }> {
  cleanupExpiredOtps();

  const entry = pendingOtps.get(contact);

  if (!entry) {
    console.log(`[AUTH] OTP verification for ${contact}: NO_PENDING_OTP`);
    return { valid: false, reason: "No OTP was requested for this contact." };
  }

  // Rate limit check
  if (entry.attempts >= MAX_VERIFY_ATTEMPTS) {
    console.log(`[AUTH] OTP verification for ${contact}: RATE_LIMITED`);
    return {
      valid: false,
      reason: "Too many failed attempts. Please request a new OTP.",
      remainingAttempts: 0,
    };
  }

  if (Date.now() > entry.expiresAt) {
    pendingOtps.delete(contact);
    console.log(`[AUTH] OTP verification for ${contact}: EXPIRED`);
    return { valid: false, reason: "OTP has expired. Please request a new one." };
  }

  if (entry.code !== otp) {
    entry.attempts += 1;
    const remaining = MAX_VERIFY_ATTEMPTS - entry.attempts;
    console.log(`[AUTH] OTP verification for ${contact}: MISMATCH (${remaining} attempts left)`);
    return {
      valid: false,
      reason: `Invalid OTP. ${remaining} attempt${remaining !== 1 ? "s" : ""} remaining.`,
      remainingAttempts: remaining,
    };
  }

  // Valid — consume the OTP (single-use)
  pendingOtps.delete(contact);
  console.log(`[AUTH] OTP verification for ${contact}: SUCCESS`);
  return { valid: true };
}

/* ────────────────── Auth.js Config ────────────────── */

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
  },
  providers: [
    {
      id: "otp",
      name: "OTP Login",
      type: "credentials",
      credentials: {
        contact: { label: "Mobile / Email", type: "text" },
        otp: { label: "OTP", type: "text" },
      },
      async authorize(credentials) {
        const { contact, otp } = credentials as { contact: string; otp: string };
        const sanitized = sanitizeContact(contact);
        if (!sanitized) return null;
        const result = await verifyOtp(sanitized, otp);
        if (!result.valid) return null;
        return { id: sanitized, name: maskContact(sanitized) };
      },
    },
  ],
  session: {
    strategy: "jwt",
    maxAge: 60 * 60, // 1 hour — short-lived for election security
  },
  callbacks: {
    authorized({ auth }) {
      return !!auth?.user;
    },
  },
};
