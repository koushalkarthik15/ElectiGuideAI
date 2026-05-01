"use client";

import { useState, useCallback, useEffect } from "react";
import {
  useVoterStore,
  NEWBIE_STEPS,
  VETERAN_STEPS,
  type VoterPath,
  type VoterStep,
} from "@/lib/store";

/* ════════════════════════════════════════════════════════════
   REGISTRATION PAGE — The Ballot Experience (Fig Mint Edition)
   ════════════════════════════════════════════════════════════ */

export default function RegistrationPage() {
  const {
    voterPath,
    completedSteps,
    setVoterPath,
    toggleStep,
    isStepComplete,
    resetProgress,
    getProgressPercent,
  } = useVoterStore();

  const [mounted, setMounted] = useState(false);
  const [inkSplashes, setInkSplashes] = useState<
    { id: number; x: number; y: number }[]
  >([]);

  useEffect(() => setMounted(true), []);

  const progress = mounted ? getProgressPercent() : 0;
  const currentSteps = voterPath === "newbie" ? NEWBIE_STEPS : VETERAN_STEPS;

  const triggerInkSplash = useCallback(
    (e: React.MouseEvent) => {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const splash = {
        id: Date.now(),
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
      setInkSplashes((prev) => [...prev, splash]);
      setTimeout(
        () => setInkSplashes((prev) => prev.filter((s) => s.id !== splash.id)),
        700
      );
    },
    []
  );

  function handleSelectPath(path: VoterPath) {
    setVoterPath(path);
  }

  if (!mounted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-fig-black/20 border-t-fig-black rounded-full animate-spin" />
      </div>
    );
  }

  /* ════════════════ PATH SELECTION SCREEN ════════════════ */
  // Fix: Explicitly check for null or undefined to prevent hiding cards on empty string path
  if (!voterPath) {
    return (
      <div className="space-y-10 animate-fade-in-up">
        <header className="text-center max-w-2xl mx-auto">
          <span className="machine-label mb-4 inline-block font-geist-mono">Mission: Registration</span>
          <h1 className="font-instrument-serif text-5xl md:text-7xl text-fig-black leading-[0.95]">
            Choose Your<br />
            <span className="text-fig-red italic">Quest</span>
          </h1>
          <p className="mt-4 font-inter text-fig-black/50 text-sm md:text-base max-w-md mx-auto">
            Select your voter journey below. Your progress is saved automatically
            and persists across sessions.
          </p>
        </header>

        <div className="grid md:grid-cols-2 gap-6 md:gap-8 max-w-4xl mx-auto">
          {/* ── Newbie Quest Card ── */}
          <button
            onClick={() => handleSelectPath("newbie")}
            className="group text-left focus:outline-none transition-transform duration-300 hover:scale-[1.02]"
          >
            <div className="ballot-card bg-fig-black text-fig-cream paper-texture rounded-l-2xl p-8 md:p-10 pr-12 relative overflow-hidden shadow-2xl shadow-fig-black/10">
              <div className="absolute top-4 right-8 w-20 h-20 border-4 border-fig-red/20 rounded-full flex items-center justify-center rotate-[-12deg] group-hover:border-fig-red/40 transition-colors">
                <span className="font-geist-mono text-[8px] text-fig-red/40 tracking-widest uppercase text-center leading-tight group-hover:text-fig-red/60 transition-colors">
                  First<br />Timer
                </span>
              </div>

              <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-fig-red animate-pulse" />
                <span className="font-geist-mono text-[10px] text-fig-cream/60 tracking-widest uppercase">
                  4 Steps
                </span>
              </div>

              <h2 className="font-instrument-serif text-4xl md:text-5xl text-fig-cream leading-none mb-3">
                The Newbie<br />
                <span className="text-fig-red italic">Quest</span>
              </h2>

              <p className="font-inter text-sm text-fig-cream/50 mb-8 max-w-xs">
                First-time voter? Start here. We&apos;ll guide you from electoral roll
                search to BLO verification.
              </p>

              <div className="space-y-2 mb-6">
                {NEWBIE_STEPS.map((step, i) => (
                  <div key={step.id} className="flex items-center gap-3">
                    <span className="font-geist-mono text-[10px] text-fig-cream/20 w-4">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="font-inter text-xs text-fig-cream/40 group-hover:text-fig-cream/70 transition-colors">
                      {step.title}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 text-fig-red font-inter font-semibold text-sm group-hover:gap-3 transition-all">
                Begin Quest
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </div>
          </button>

          {/* ── Veteran Audit Card ── */}
          <button
            onClick={() => handleSelectPath("veteran")}
            className="group text-left focus:outline-none transition-transform duration-300 hover:scale-[1.02]"
          >
            <div className="ballot-card-left bg-fig-black text-fig-cream paper-texture rounded-r-2xl p-8 md:p-10 pl-12 relative overflow-hidden shadow-2xl shadow-fig-black/10">
              <div className="absolute top-4 left-8 w-20 h-20 border-4 border-fig-cream/10 rounded-full flex items-center justify-center rotate-[12deg] group-hover:border-fig-cream/20 transition-colors">
                <span className="font-geist-mono text-[8px] text-fig-cream/20 tracking-widest uppercase text-center leading-tight group-hover:text-fig-cream/40 transition-colors">
                  Return<br />Voter
                </span>
              </div>

              <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-fig-red animate-pulse" />
                <span className="font-geist-mono text-[10px] text-fig-cream/60 tracking-widest uppercase">
                  4 Steps
                </span>
              </div>

              <h2 className="font-instrument-serif text-4xl md:text-5xl text-fig-cream leading-none mb-3">
                The Veteran<br />
                <span className="text-fig-red italic">Audit</span>
              </h2>

              <p className="font-inter text-sm text-fig-cream/50 mb-8 max-w-xs">
                Returning voter? Audit your records. Verify EPIC, sync address,
                and confirm your booth assignment.
              </p>

              <div className="space-y-2 mb-6">
                {VETERAN_STEPS.map((step, i) => (
                  <div key={step.id} className="flex items-center gap-3">
                    <span className="font-geist-mono text-[10px] text-fig-cream/20 w-4">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="font-inter text-xs text-fig-cream/40 group-hover:text-fig-cream/70 transition-colors">
                      {step.title}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 text-fig-red font-inter font-semibold text-sm group-hover:gap-3 transition-all">
                Start Audit
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </div>
          </button>
        </div>
      </div>
    );
  }

  /* ════════════════ CHECKLIST SCREEN ════════════════ */
  const pathLabel = voterPath === "newbie" ? "Newbie Quest" : "Veteran Audit";
  const allComplete = completedSteps.length === currentSteps.length;

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <button
          onClick={() => resetProgress()}
          className="flex items-center gap-2 font-courier-prime text-xs text-fig-black/40 hover:text-fig-black/70 focus:outline-none focus:text-fig-black focus:underline transition-colors tracking-wider"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          CHANGE PATH
        </button>
        <span className="machine-label">{pathLabel}</span>
      </div>

      <header>
        <h1 className="font-instrument-serif text-5xl md:text-6xl text-fig-black leading-[0.95]">
          {voterPath === "newbie" ? (
            <>
              The Newbie<br />
              <span className="text-fig-red italic">Quest</span>
            </>
          ) : (
            <>
              The Veteran<br />
              <span className="text-fig-red italic">Audit</span>
            </>
          )}
        </h1>
        <p className="mt-3 font-inter text-fig-black/50 text-sm max-w-lg">
          {voterPath === "newbie"
            ? "Complete each step to register as a new voter. Tap to mark steps as done."
            : "Audit your existing voter records. Ensure everything is accurate before polling day."}
        </p>
      </header>

      {/* ── Progress Bar ── */}
      <div className="space-y-2" data-testid="progress-bar">
        <div className="flex justify-between font-courier-prime text-[11px] tracking-wider">
          <span className="text-fig-black/40">PROGRESS</span>
          <span className="text-fig-red">
            {completedSteps.length}/{currentSteps.length} — {progress}%
          </span>
        </div>
        <div className="h-1.5 bg-fig-black/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-fig-red to-fig-red/60 rounded-full transition-all duration-700 ease-out"
            style={{ width: `${progress}%` }}
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Registration progress: ${progress}%`}
          />
        </div>
      </div>

      {/* ── Ticket Stack ── */}
      <div className="space-y-0" role="list" aria-label="Registration steps">
        {currentSteps.map((step, index) => (
          <TicketStep
            key={step.id}
            step={step}
            index={index}
            isComplete={isStepComplete(step.id)}
            isLast={index === currentSteps.length - 1}
            onToggle={(e) => {
              triggerInkSplash(e);
              toggleStep(step.id);
            }}
          />
        ))}
      </div>

      {/* ── Ink Splash Layer ── */}
      <div className="fixed inset-0 pointer-events-none z-50">
        {inkSplashes.map((splash) => (
          <div
            key={splash.id}
            className="ink-splash w-24 h-24 animate-ink-splash"
            style={{
              left: splash.x - 48,
              top: splash.y - 48,
            }}
          />
        ))}
      </div>

      {/* ── Completion Banner ── */}
      {allComplete && (
        <div className="ballot-card bg-fig-warm paper-texture rounded-l-2xl p-8 relative overflow-hidden animate-stamp-press">
          <div className="absolute top-4 right-8 rotate-[-12deg]">
            <div className="border-4 border-stamp-red rounded-lg px-4 py-2">
              <span className="font-courier-prime text-stamp-red font-bold text-lg tracking-widest uppercase">
                VERIFIED
              </span>
            </div>
          </div>

          <h3 className="font-instrument-serif text-3xl text-fig-black mb-2">
            Mission Complete
          </h3>
          <p className="font-inter text-sm text-fig-black/60 max-w-sm">
            {voterPath === "newbie"
              ? "All registration steps are complete. You're ready to vote!"
              : "Your voter records have been fully audited. See you on polling day."}
          </p>

          <div className="mt-6 flex gap-3">
            <a
              href="https://voters.eci.gov.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-fig-black text-fig-cream font-inter font-semibold text-sm px-5 py-2.5 rounded-lg hover:bg-fig-black/80 transition-colors"
            >
              Visit Voter Portal
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
            <button
              onClick={resetProgress}
              className="font-courier-prime text-xs text-fig-black/40 hover:text-fig-black/70 border border-fig-black/20 px-4 py-2.5 rounded-lg transition-colors"
            >
              RESET
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   TICKET STEP COMPONENT
   ════════════════════════════════════════════════════════════ */

function TicketStep({
  step, index, isComplete, isLast, onToggle,
}: {
  step: VoterStep; index: number; isComplete: boolean; isLast: boolean;
  onToggle: (e: React.MouseEvent) => void;
}) {
  return (
    <div
      role="listitem"
      className="animate-fade-in-up"
      style={{ animationDelay: `${index * 0.08}s`, animationFillMode: "backwards" }}
    >
      <div className={`ballot-card relative ${isComplete ? "bg-paper-beige-dark" : "bg-fig-warm"} paper-texture rounded-l-xl transition-all duration-500 ${isComplete ? "opacity-75" : "opacity-100"}`}>
        <div className="flex items-stretch">
          <div className={`flex-shrink-0 w-16 md:w-20 flex flex-col items-center justify-center border-r-2 ticket-separator py-6 transition-colors duration-500 ${isComplete ? "bg-fig-black/5" : "bg-transparent"}`}>
            <span className={`font-courier-prime text-2xl md:text-3xl font-bold leading-none transition-colors duration-500 ${isComplete ? "text-fig-red" : "text-fig-black/20"}`}>
              {String(index + 1).padStart(2, "0")}
            </span>
          </div>

          <div className="flex-grow p-5 md:p-6 pr-10 flex flex-col md:flex-row md:items-center gap-4 relative">
            <div className="flex-grow">
              <h3 className={`font-instrument-serif text-xl md:text-2xl mb-1 transition-all duration-500 ${isComplete ? "text-fig-black/40 line-through decoration-fig-red decoration-2" : "text-fig-black"}`}>
                {step.title}
              </h3>
              <p className={`font-inter text-xs md:text-sm transition-colors duration-500 ${isComplete ? "text-fig-black/30" : "text-fig-black/60"}`}>
                {step.description}
              </p>
              <a
                href={step.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 mt-2 font-courier-prime text-[10px] text-fig-red/60 hover:text-fig-red tracking-wider transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                {step.externalLabel}
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>

            <button
              onClick={onToggle}
              className={`flex-shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-xl border-2 flex items-center justify-center transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-fig-red/30 ${isComplete
                ? "bg-fig-red border-fig-red text-white shadow-lg shadow-fig-red/20"
                : "border-fig-black/20 text-fig-black/20 hover:border-fig-red/50 hover:text-fig-red/50"
              }`}
              aria-label={`${isComplete ? "Mark incomplete" : "Mark complete"}: ${step.title}`}
            >
              {isComplete ? (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <span className="w-4 h-4 rounded-sm border-2 border-current" />
              )}
            </button>

            {isComplete && (
              <div className="absolute top-2 right-14 rotate-[-12deg] animate-stamp-press pointer-events-none">
                <span className="font-courier-prime text-[9px] text-stamp-red/60 font-bold tracking-[0.3em] uppercase border border-stamp-red/30 px-2 py-0.5 rounded">
                  Done
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
      {!isLast && <div className="h-px mx-8 bg-fig-border" />}
    </div>
  );
}
