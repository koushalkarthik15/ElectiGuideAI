"use client";

import { useState, useEffect } from "react";
import { useVoterStore } from "@/lib/store";
import { CANDIDATES, formatINR } from "@/lib/candidates";
import { formatINRIntl, formatNumber } from "@/lib/format-utils";
import { SVGProgressBar, ProgressRing, ShimmerCard } from "@/components/ui/data-viz";

const TURNOUT_DATA = [
  { time: "9 AM", percent: 12 },
  { time: "11 AM", percent: 28 },
  { time: "1 PM", percent: 42 },
  { time: "3 PM", percent: 58 },
  { time: "5 PM", percent: 71 },
  { time: "6 PM", percent: 78 },
];

const COUNTING_STAGES = [
  { id: 1, title: "EVM Sealing & Transport", status: "complete" as const, desc: "All EVMs sealed with unique codes and transported to strongroom under CCTV surveillance.", time: "6:30 PM — Day 1" },
  { id: 2, title: "Strongroom Security", status: "active" as const, desc: "24/7 CAPF guard deployed. Triple-lock protocol active. Candidates' agents have visual access.", time: "Ongoing — 72 hrs" },
  { id: 3, title: "Counting Day", status: "upcoming" as const, desc: "Round-by-round counting begins. Results streamed live to Returning Officer's dashboard.", time: "May 4, 8:00 AM" },
  { id: 4, title: "Official Declaration", status: "upcoming" as const, desc: "Returning Officer declares final results. Winner issued Certificate of Election.", time: "May 4 (Expected)" },
];

const CANDIDATE_RESULTS = CANDIDATES.map((c, i) => ({
  ...c,
  votes: [245320, 198450, 142890, 67230, 34180, 12450][i] ?? 0,
  leadStatus: i === 0 ? "leading" as const : "trailing" as const,
  roundsWon: [12, 8, 3, 1, 0, 0][i] ?? 0,
}));

export default function ResultsPage() {
  const [mounted, setMounted] = useState(false);
  const { hasVoted } = useVoterStore();
  const [countdownToCount, setCountdownToCount] = useState({ days: 0, hours: 0, minutes: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { setMounted(true); setTimeout(() => setIsLoading(false), 800); }, []);

  useEffect(() => {
    if (!mounted) return;
    function calcCountdown() {
      // Counting Day: May 4, 2026 8:00 AM
      const countDate = new Date(2026, 4, 4, 8, 0, 0); // May 4
      const diff = Math.max(countDate.getTime() - Date.now(), 0);
      setCountdownToCount({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
      });
    }
    calcCountdown();
    const id = setInterval(calcCountdown, 60000);
    return () => clearInterval(id);
  }, [mounted]);

  if (!mounted) return <div className="min-h-[60vh] flex items-center justify-center"><div className="w-8 h-8 border-2 border-fig-black/20 border-t-fig-black rounded-full animate-spin" /></div>;

  const totalVotes = CANDIDATE_RESULTS.reduce((s, c) => s + c.votes, 0);
  const maxVotes = Math.max(...CANDIDATE_RESULTS.map((c) => c.votes));
  const finalTurnout = TURNOUT_DATA[TURNOUT_DATA.length - 1].percent;

  return (
    <div className="space-y-8 animate-fade-in-up">
      {hasVoted && (
        <div className="relative overflow-hidden rounded-2xl border-2 border-green-400/30 bg-green-50 p-6 flex items-center gap-5" data-testid="verified-badge">
          <div className="w-16 h-16 rounded-full bg-green-100 border-2 border-green-400/40 flex items-center justify-center flex-shrink-0">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
          </div>
          <div>
            <h3 className="font-instrument-serif text-3xl text-green-700">Verified Voter</h3>
            <p className="font-courier-prime text-[10px] text-fig-black/40 tracking-wider mt-1">YOUR CIVIC DUTY IS COMPLETE · THANK YOU FOR PARTICIPATING IN DEMOCRACY</p>
          </div>
          <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full border-4 border-green-400/10 rotate-[-12deg] flex items-center justify-center" aria-hidden="true">
            <span className="font-courier-prime text-[8px] text-green-600/20 tracking-widest uppercase text-center leading-tight">Verified<br />2026</span>
          </div>
        </div>
      )}

      <header>
        <span className="machine-label mb-3 inline-block">Post-Voting Analytics</span>
        <h1 className="font-instrument-serif text-5xl md:text-6xl text-fig-black leading-[0.95]">
          Results <span className="text-fig-red italic">Dashboard</span>
        </h1>
        <div className="mt-4 flex items-center gap-2">
          <span className="machine-label bg-fig-red/10 text-fig-red border-fig-red/20">DEMO MODE ACTIVE</span>
          <p className="font-inter text-fig-black/40 text-[10px] tracking-wider uppercase">Showing simulated results as no active election is currently live.</p>
        </div>
        <p className="mt-4 font-inter text-fig-black/50 text-sm">Hyderabad Constituency · <span className="font-courier-prime">{formatNumber(totalVotes)}</span> total votes counted</p>
      </header>

      {/* ── Turnout Visualization ── */}
      <section className="fig-panel p-6">
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-instrument-serif text-2xl text-fig-black">Voter Turnout</h2>
          <ProgressRing percent={finalTurnout} size={64} strokeWidth={5} color="#1A1A1A">
            <span className="font-courier-prime text-xs text-fig-black font-bold">{finalTurnout}%</span>
          </ProgressRing>
        </div>
        <p className="font-courier-prime text-[10px] text-fig-black/30 tracking-widest mb-6">HOURLY PROGRESSION · FINAL: {finalTurnout}%</p>

        <div className="space-y-4">
          {TURNOUT_DATA.map((d, i) => (
            <div key={i} className="flex items-center gap-4">
              <span className="font-courier-prime text-[11px] text-fig-black/40 w-14 flex-shrink-0 text-right">{d.time}</span>
              <div className="flex-grow">
                <SVGProgressBar percent={d.percent} color="#1A1A1A" height={10} showLabel={false} animated={!isLoading} />
              </div>
              <span className="font-courier-prime text-xs text-fig-black font-bold w-12 text-right tabular-nums">{d.percent}%</span>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-fig-border">
          <p className="font-courier-prime text-[9px] text-fig-black/20 tracking-widest mb-3">BAR VISUALIZATION</p>
          <div className="flex items-end gap-3 h-32">
            {TURNOUT_DATA.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <span className="font-courier-prime text-[10px] text-fig-black font-bold">{d.percent}%</span>
                <div className="w-full bg-fig-black/5 rounded-t-lg overflow-hidden relative" style={{ height: "100%" }}>
                  <div className="absolute bottom-0 w-full bg-gradient-to-t from-fig-black to-fig-black/30 rounded-t-lg transition-all duration-1000" style={{ height: `${(d.percent / 100) * 100}%`, animationDelay: `${i * 0.15}s` }} />
                </div>
                <span className="font-courier-prime text-[9px] text-fig-black/25">{d.time}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Candidate Results ── */}
      <section>
        <h2 className="font-instrument-serif text-2xl text-fig-black mb-4">Candidate Standings</h2>
        <div className="space-y-3">
          {CANDIDATE_RESULTS.sort((a, b) => b.votes - a.votes).map((c, i) => {
            const votePercent = Math.round((c.votes / totalVotes) * 100 * 10) / 10;
            return (
              <ShimmerCard key={c.id} isLoading={isLoading}>
                <div className={`fig-panel p-5 ${i === 0 ? "ring-2 ring-fig-red/20 bg-fig-red/[0.02]" : ""} flex flex-col sm:flex-row sm:items-center gap-4`}>
                  <div className="flex items-center gap-4 flex-grow">
                    <span className="font-courier-prime text-2xl font-bold text-fig-black/15 w-8">#{i + 1}</span>
                    <div className="flex-grow">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded-md text-[9px] font-courier-prime tracking-widest font-bold border" style={{ borderColor: c.partyColor + "40", color: c.partyColor, backgroundColor: c.partyColor + "10" }}>{c.partyAbbr}</span>
                        {i === 0 && <span className="px-2 py-0.5 rounded-md bg-green-50 text-green-700 font-courier-prime text-[9px] tracking-widest font-bold border border-green-400/20 animate-pulse">LEADING</span>}
                        {i > 0 && <span className="px-2 py-0.5 rounded-md bg-fig-warm text-fig-black/30 font-courier-prime text-[9px] tracking-widest border border-fig-border">TRAILING</span>}
                      </div>
                      <h3 className="font-instrument-serif text-xl text-fig-black">{c.name}</h3>
                      <p className="font-inter text-xs text-fig-black/40">{c.party}</p>
                    </div>
                  </div>
                  <div className="sm:text-right flex-shrink-0">
                    <p className="font-courier-prime text-2xl text-fig-black font-bold">{formatNumber(c.votes)}</p>
                    <p className="font-courier-prime text-[10px] text-fig-black/30">{votePercent}% · {c.roundsWon} rounds won</p>
                  </div>
                  <div className="w-full sm:w-40 flex-shrink-0">
                    <SVGProgressBar percent={Math.round((c.votes / maxVotes) * 100)} color={c.partyColor} height={8} showLabel={false} animated={!isLoading} />
                  </div>
                </div>
              </ShimmerCard>
            );
          })}
        </div>
      </section>

      {/* ── Counting Roadmap — May 4 ── */}
      <section className="fig-panel p-6">
        <h2 className="font-instrument-serif text-2xl text-fig-black mb-1">Counting Roadmap</h2>
        <p className="font-courier-prime text-[10px] text-fig-black/30 tracking-widest mb-6">POST-POLLING PROCESS · COUNTING DAY: MAY 4, 2026</p>
        <div className="space-y-0">
          {COUNTING_STAGES.map((stage, i) => (
            <div key={stage.id} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${stage.status === "complete" ? "bg-green-50 border-green-400/40" : stage.status === "active" ? "bg-fig-red/5 border-fig-red/40 animate-pulse" : "bg-fig-warm border-fig-border"}`}>
                  {stage.status === "complete" ? (
                    <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  ) : stage.status === "active" ? (
                    <span className="w-2 h-2 rounded-full bg-fig-red" />
                  ) : (
                    <span className="font-courier-prime text-[10px] text-fig-black/25">{stage.id}</span>
                  )}
                </div>
                {i < COUNTING_STAGES.length - 1 && <div className={`w-0.5 flex-grow min-h-[40px] ${stage.status === "complete" ? "bg-green-400/20" : "bg-fig-border"}`} />}
              </div>
              <div className="pb-8">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className={`font-instrument-serif text-lg ${stage.status === "active" ? "text-fig-red" : stage.status === "complete" ? "text-fig-black/70" : "text-fig-black/40"}`}>{stage.title}</h3>
                  {stage.status === "active" && <span className="machine-label">IN PROGRESS</span>}
                </div>
                <p className="font-inter text-xs text-fig-black/40 mb-1">{stage.desc}</p>
                <p className="font-courier-prime text-[10px] text-fig-black/25 tracking-wider">{stage.time}</p>
                {stage.id === 3 && (
                  <div className="mt-3 flex gap-3">
                    {[{ val: countdownToCount.days, label: "DAYS" }, { val: countdownToCount.hours, label: "HRS" }, { val: countdownToCount.minutes, label: "MIN" }].map((t) => (
                      <div key={t.label} className="bg-fig-warm rounded-lg px-3 py-2 text-center border border-fig-border">
                        <span className="font-courier-prime text-lg text-fig-black font-bold">{String(t.val).padStart(2, "0")}</span>
                        <p className="font-courier-prime text-[7px] text-fig-black/25 tracking-widest">{t.label}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
