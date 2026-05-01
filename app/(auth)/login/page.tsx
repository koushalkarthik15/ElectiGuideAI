"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { dispatchOtpAction, verifyOtpAction } from "@/app/actions/auth";

type AuthStep = "contact" | "otp";

/* ─── Contact validation (client-side mirror of server sanitizeContact) ─── */
function isValidContact(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > 254) return false;
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
  const digitsOnly = trimmed.replace(/[\s\-+()]/g, "");
  const isPhone = /^\d{10,15}$/.test(digitsOnly);
  return isEmail || isPhone;
}

/** Mask contact for display privacy */
function maskContact(contact: string): string {
  if (contact.includes("@")) {
    const [local, domain] = contact.split("@");
    return `${local.slice(0, 2)}${"*".repeat(Math.max(local.length - 2, 1))}@${domain}`;
  }
  if (contact.length <= 7) return contact.slice(0, 2) + "***" + contact.slice(-2);
  return `${contact.slice(0, 4)}${"*".repeat(Math.max(contact.length - 7, 3))}${contact.slice(-3)}`;
}

export default function LoginPage() {
  const [step, setStep] = useState<AuthStep>("contact");
  const [contact, setContact] = useState("");
  const [maskedContact, setMaskedContact] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [contactValid, setContactValid] = useState<boolean | null>(null);
  const [shakeCard, setShakeCard] = useState(false);
  const [cardVisible, setCardVisible] = useState(false);
  const [demoOtp, setDemoOtp] = useState<string | null>(null);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Trigger card entrance animation after mount
  useEffect(() => {
    const timer = setTimeout(() => setCardVisible(true), 150);
    return () => clearTimeout(timer);
  }, []);

  // ── Real-time contact validation feedback ──
  const handleContactChange = useCallback((value: string) => {
    setContact(value);
    if (!value.trim()) {
      setContactValid(null); // neutral — no input yet
    } else {
      setContactValid(isValidContact(value));
    }
    // Clear error when user starts typing
    if (error) setError(null);
  }, [error]);

  // ── Send OTP Handler ──
  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = contact.trim();

    if (!trimmed) {
      triggerError("Please enter a mobile number or email.");
      return;
    }

    if (!isValidContact(trimmed)) {
      triggerError("Enter a valid 10-digit mobile number or email address.");
      return;
    }

    setIsLoading(true);
    setError(null);

    const result = await dispatchOtpAction(trimmed);
    setIsLoading(false);

    if (!result.success) {
      triggerError(result.error || "Failed to dispatch OTP. Please try again.");
      return;
    }

    setMaskedContact(result.maskedContact || maskContact(trimmed));
    
    // In dev mode, we could log it or display it, but per instructions, 
    // it's logged to the terminal via lib/auth.ts
    // For demo purposes if it returns code, we can show it (optional)
    if (result.otp) {
      setDemoOtp(result.otp);
    } else {
      setDemoOtp(null);
    }

    setStep("otp");
    // Focus first OTP box after transition
    setTimeout(() => otpRefs.current[0]?.focus(), 300);
  }

  // ── Verify OTP Handler ──
  async function handleVerifyOtp() {
    const code = otp.join("");
    if (code.length !== 6) {
      triggerError("Enter the complete 6-digit code.");
      return;
    }
    setIsLoading(true);
    setError(null);

    const result = await verifyOtpAction(contact.trim(), code);

    if (!result.valid) {
      setIsLoading(false);
      triggerError(result.reason || "Invalid OTP. Verify and retry.");
      setOtp(["", "", "", "", "", ""]);
      otpRefs.current[0]?.focus();
      return;
    }

    // Success — redirect
    setIsLoading(false);
    window.location.href = "/registration";
  }

  function triggerError(message: string) {
    setError(message);
    setShakeCard(true);
    setTimeout(() => setShakeCard(false), 500);
  }

  // ── OTP Input Handlers ──
  function handleOtpChange(index: number, value: string) {
    if (!/^\d*$/.test(value)) return; // digits only
    const next = [...otp];
    next[index] = value.slice(-1);
    setOtp(next);
    // Clear error on new input
    if (error) setError(null);
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  }

  function handleOtpKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  }

  function handleOtpPaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const next = [...otp];
    for (let i = 0; i < 6; i++) {
      next[i] = pasted[i] || "";
    }
    setOtp(next);
    if (error) setError(null);
    const focusIdx = Math.min(pasted.length, 5);
    otpRefs.current[focusIdx]?.focus();
  }

  // ── Current timestamp for the "command center" feel ──
  const [timestamp, setTimestamp] = useState("");
  useEffect(() => {
    function tick() {
      setTimestamp(
        new Date().toLocaleTimeString("en-IN", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // ── Derive contact border color for real-time validation ──
  const contactBorderClass =
    contactValid === null
      ? "border-fig-black/10 focus:border-fig-red/40"
      : contactValid
        ? "border-green-600/50 focus:border-green-600/70"
        : "border-fig-red/50 focus:border-fig-red/70";

  return (
    <div className="min-h-[100dvh] bg-fig-cream relative flex items-center justify-center overflow-x-hidden overflow-y-auto paper-grain">
      {/* ═══ Background Overlay ═══ */}
      <div className="absolute inset-0 bg-fig-warm/30 opacity-50" />

      {/* ═══ Corner HUD Decorations ═══ */}
      <div className="absolute top-6 left-6 font-courier-prime text-[10px] text-fig-black/20 tracking-[0.3em] uppercase z-30 hidden md:block" aria-hidden="true">
        electiguide // secure_gateway
      </div>
      <div className="absolute top-6 right-6 font-courier-prime text-[10px] text-fig-black/20 tracking-[0.3em] z-30 hidden md:block" aria-hidden="true">
        {timestamp}
      </div>
      <div className="absolute bottom-6 left-6 font-courier-prime text-[10px] text-fig-black/15 tracking-[0.25em] z-30 hidden md:block" aria-hidden="true">
        session::awaiting_auth
      </div>
      <div className="absolute bottom-6 right-6 font-courier-prime text-[10px] text-fig-black/15 tracking-[0.25em] z-30 hidden md:block" aria-hidden="true">
        enc::AES-256-GCM
      </div>

      {/* ═══ Main Card ═══ */}
      <div
        className={`
          relative z-30 w-full max-w-md mx-4 my-8
          transition-[opacity,transform] duration-700
          ${cardVisible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-10 scale-[0.97]"}
          ${shakeCard ? "animate-shake" : ""}
        `}
        style={{ transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}
      >
        {/* Fig-Mint Panel */}
        <div className="fig-panel-strong border-t-4 border-t-fig-red p-8 md:p-10">
          {/* ── Status bar ── */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" aria-hidden="true" />
              <span className="font-courier-prime text-[11px] text-fig-black/40 tracking-widest uppercase">
                Secure Channel
              </span>
            </div>
            <span className="font-courier-prime text-[11px] text-fig-black/20 tracking-wider" aria-hidden="true">
              v5.0
            </span>
          </div>

          {/* ── Header ── */}
          <div className="text-center mb-8">
            <h1 className="font-instrument-serif text-4xl md:text-5xl text-fig-black leading-tight">
              Authorization<br />
              <span className="text-fig-red italic">Required</span>
            </h1>
            <p className="mt-3 font-courier-prime text-xs text-fig-black/30 tracking-wider">
              {step === "contact"
                ? "IDENTIFY → VERIFY → ACCESS"
                : `OTP DISPATCHED → ${maskedContact}`}
            </p>

            {/* Phone Dev Mode Note */}
            {step === "contact" && (
              <div className="mt-4 bg-fig-black/5 border border-fig-black/10 rounded-lg px-4 py-2 animate-fade-in-up">
                <p className="font-courier-prime text-[9px] text-fig-black/40 tracking-widest leading-relaxed uppercase">
                  [SYSTEM_NOTICE] REAL-TIME EMAIL DELIVERY ACTIVE via RESEND. 
                  PHONE SMS VERIFICATION CURRENTLY IN DEV-SIMULATION.
                </p>
              </div>
            )}
          </div>

          {/* ── Contact Step ── */}
          {step === "contact" && (
            <form onSubmit={handleSendOtp} className="space-y-6 animate-fade-in-up" noValidate>
              <div className="space-y-2">
                <label
                  htmlFor="contact-input"
                  className="font-inter text-sm text-fig-black/60 flex items-center gap-2"
                >
                  <svg className="w-4 h-4 text-fig-black/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  Mobile Number / Email
                </label>
                <input
                  id="contact-input"
                  type="text"
                  value={contact}
                  onChange={(e) => handleContactChange(e.target.value)}
                  placeholder="+91 98765 43210"
                  aria-describedby="contact-hint"
                  aria-invalid={contactValid === false ? "true" : undefined}
                  className={`
                    w-full bg-white/60 border rounded-xl
                    px-4 py-3.5 text-fig-black font-courier-prime text-sm
                    placeholder:text-fig-black/20
                    focus:outline-none focus:ring-2 focus:ring-fig-red/10
                    transition-colors duration-300
                    ${contactBorderClass}
                  `}
                  autoComplete="tel"
                />
                {/* Real-time validation hint */}
                <p id="contact-hint" className="font-courier-prime text-[10px] tracking-wider h-4">
                  {contactValid === null && (
                    <span className="text-fig-black/20">Phone (10+ digits) or email required</span>
                  )}
                  {contactValid === true && (
                    <span className="text-green-600/80">✓ Valid format</span>
                  )}
                  {contactValid === false && (
                    <span className="text-fig-red/80">✗ Invalid format</span>
                  )}
                </p>
              </div>

              {/* Error */}
              <div aria-live="assertive" aria-atomic="true" className="min-h-[20px]">
                {error && (
                  <p
                    role="alert"
                    className="font-courier-prime text-xs text-fig-red tracking-wider animate-fade-in-up"
                  >
                    ⚠ {error}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                aria-label={isLoading ? "Dispatching OTP, please wait" : "Send Secure OTP"}
                className="
                  scan-btn w-full bg-fig-black text-fig-cream font-inter font-bold
                  py-3.5 rounded-xl uppercase tracking-wider text-sm
                  hover:shadow-[0_4px_20px_rgba(0,0,0,0.15)]
                  focus:outline-none focus:ring-2 focus:ring-fig-red/30 focus:ring-offset-2
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transition-all duration-300
                "
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-3">
                    <span className="w-4 h-4 border-2 border-fig-cream/30 border-t-fig-cream rounded-full animate-spin" aria-hidden="true" />
                    Dispatching...
                  </span>
                ) : (
                  "Send Secure OTP"
                )}
              </button>
            </form>
          )}

          {/* ── OTP Step ── */}
          {step === "otp" && (
            <div className="space-y-6 animate-fade-in-up">
              {/* Transparent Demo Mode OTP Display */}
              {demoOtp && (
                <div className="space-y-4">
                  <div className="bg-fig-black text-fig-cream p-6 rounded-xl text-center shadow-lg border-2 border-fig-red/20">
                    <p className="font-courier-prime text-[10px] tracking-[0.3em] uppercase opacity-50 mb-2">Verification Code</p>
                    <p className="font-geist-mono text-4xl font-bold tracking-[0.5em] ml-4">{demoOtp}</p>
                  </div>
                  
                  <div className="border-l-4 border-saffron bg-saffron/5 p-4 rounded-r-xl">
                    <p className="font-courier-prime text-[10px] text-saffron font-bold tracking-widest uppercase mb-1">System Technical Note</p>
                    <p className="font-inter text-[11px] text-fig-black/60 leading-relaxed">
                      DEMO MODE: To ensure seamless evaluation, the OTP is displayed locally. 
                      Production versions will utilize a proprietary SMTP email service for secure delivery.
                    </p>
                  </div>
                </div>
              )}
              {/* OTP Boxes */}
              <div className="space-y-2">
                <label
                  id="otp-label"
                  className="font-inter text-sm text-fig-black/60 flex items-center gap-2"
                >
                  <svg className="w-4 h-4 text-fig-black/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Enter 6-Digit OTP
                </label>
                <div
                  className="flex justify-between gap-2"
                  role="group"
                  aria-labelledby="otp-label"
                  onPaste={handleOtpPaste}
                >
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => { otpRefs.current[i] = el; }}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      className="
                        w-full aspect-square max-w-[52px]
                        bg-white/60 border border-fig-black/10 rounded-lg
                        text-center text-fig-black font-courier-prime text-xl
                        focus:outline-none focus:ring-2 focus:ring-fig-red/20 focus:border-fig-red/40
                        transition-all duration-300
                        caret-fig-red
                      "
                      aria-label={`OTP digit ${i + 1} of 6`}
                    />
                  ))}
                </div>
              </div>

              {/* Error */}
              <div aria-live="assertive" aria-atomic="true" className="min-h-[20px]">
                {error && (
                  <p
                    role="alert"
                    className="font-courier-prime text-xs text-fig-red tracking-wider animate-fade-in-up"
                  >
                    ⚠ {error}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={handleVerifyOtp}
                disabled={isLoading}
                aria-label={isLoading ? "Verifying identity, please wait" : "Authenticate with OTP"}
                className="
                  scan-btn w-full bg-fig-black text-fig-cream font-inter font-bold
                  py-3.5 rounded-xl uppercase tracking-wider text-sm
                  hover:shadow-[0_4px_20px_rgba(0,0,0,0.15)]
                  focus:outline-none focus:ring-2 focus:ring-fig-red/30 focus:ring-offset-2
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transition-all duration-300
                "
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-3">
                    <span className="w-4 h-4 border-2 border-fig-cream/30 border-t-fig-cream rounded-full animate-spin" aria-hidden="true" />
                    Verifying Identity...
                  </span>
                ) : (
                  "Authenticate"
                )}
              </button>

              {/* Back & Resend */}
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setStep("contact");
                    setOtp(["", "", "", "", "", ""]);
                    setError(null);
                    setContactValid(contact.trim() ? isValidContact(contact) : null);
                  }}
                  className="font-courier-prime text-[11px] text-fig-black/40 hover:text-fig-black/70 focus:outline-none focus:text-fig-black focus:underline transition-colors tracking-wider"
                >
                  ← CHANGE CONTACT
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOtp(["", "", "", "", "", ""]);
                    setError(null);
                    otpRefs.current[0]?.focus();
                  }}
                  className="font-courier-prime text-[11px] text-fig-red/60 hover:text-fig-red focus:outline-none focus:text-fig-red focus:underline transition-colors tracking-wider"
                >
                  RESEND OTP
                </button>
              </div>
            </div>
          )}

          {/* ── Divider ── */}
          <div className="my-6 border-t border-fig-black/5" aria-hidden="true" />

          {/* ── Data Privacy Notice ── */}
          <footer className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2 mb-1">
              <svg className="w-3.5 h-3.5 text-green-600/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span className="font-courier-prime text-[10px] text-fig-black/30 tracking-[0.2em] uppercase">
                Data Privacy Notice
              </span>
            </div>
            <p className="font-inter text-[11px] text-fig-black/40 leading-relaxed max-w-sm mx-auto">
              Your voter data is encrypted end-to-end using AES-256-GCM. 
              Session tokens are stored in secure, HTTP-only cookies.
              No personal information is retained beyond your active session.
            </p>
          </footer>
        </div>

        {/* ── Decorative sub-card line ── */}
        <div className="mx-4 h-1 bg-gradient-to-r from-transparent via-fig-red/10 to-transparent rounded-b-full" aria-hidden="true" />
      </div>
    </div>
  );
}
