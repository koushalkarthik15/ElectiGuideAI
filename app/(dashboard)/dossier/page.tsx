"use client";

import { useState, useCallback, useEffect } from "react";
import {
  CANDIDATES,
  CONSTITUENCY,
  formatINR,
  getAssetLiabilityPercent,
  compareCandidates,
} from "@/lib/candidates";
import { formatINRIntl, formatINRFull, calculateNetWorth, formatNumber } from "@/lib/format-utils";
import { ShimmerCard, SVGProgressBar } from "@/components/ui/data-viz";
import type { Candidate, CandidateComparison } from "@/types/election";

export default function DossierPage() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [comparison, setComparison] = useState<CandidateComparison | null>(null);
  const [tiltStyle, setTiltStyle] = useState<Record<string, React.CSSProperties>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  const toggleCompare = useCallback((id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 2) return [prev[1], id];
      return [...prev, id];
    });
  }, []);

  const handleCompare = () => {
    if (selectedIds.length === 2) {
      setComparison(compareCandidates(selectedIds[0], selectedIds[1]));
      setExpandedId(null);
    }
  };

  const handleTilt = (id: string, e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 6;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -6;
    setTiltStyle((prev) => ({ ...prev, [id]: { transform: `perspective(800px) rotateY(${x}deg) rotateX(${y}deg) scale(1.01)` } }));
  };

  const resetTilt = (id: string) => {
    setTiltStyle((prev) => ({ ...prev, [id]: { transform: "perspective(800px) rotateY(0deg) rotateX(0deg) scale(1)" } }));
  };

  // ── Expanded Dossier View ──
  if (expandedId) {
    const c = CANDIDATES.find((x) => x.id === expandedId)!;
    const alp = getAssetLiabilityPercent(c);
    const netWorth = calculateNetWorth(c.totalAssets, c.liabilities);
    return (
      <div className="max-w-4xl mx-auto animate-fade-in-up space-y-6">
        <button onClick={() => setExpandedId(null)} className="flex items-center gap-2 font-courier-prime text-xs text-fig-black/40 hover:text-fig-black/70 transition-colors tracking-wider">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          BACK TO GRID
        </button>
        <div className="fig-panel overflow-hidden">
          <div className="p-8 md:p-10 border-b border-fig-border flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="px-2.5 py-1 rounded-md text-[10px] font-courier-prime tracking-widest uppercase font-bold border" style={{ borderColor: c.partyColor + "40", color: c.partyColor, backgroundColor: c.partyColor + "10" }}>{c.partyAbbr}</span>
                <span className="font-courier-prime text-[10px] text-fig-black/30 tracking-widest">{c.constituency.toUpperCase()}</span>
              </div>
              <h1 className="font-instrument-serif text-4xl md:text-5xl text-fig-black">{c.name}</h1>
              <p className="mt-1 font-inter text-fig-black/50 text-sm">{c.party} · Age {c.age}</p>
            </div>
            <div className="text-right">
              <p className="font-courier-prime text-[10px] text-fig-black/30 tracking-widest uppercase">Dossier ID</p>
              <p className="font-courier-prime text-sm text-fig-red">{c.id.toUpperCase()}</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-0">
            <div className="p-8 space-y-6 border-r border-fig-border">
              <div>
                <p className="font-courier-prime text-[10px] text-fig-black/30 tracking-widest uppercase mb-1">Education</p>
                <p className="font-inter text-fig-black/90">{c.education}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <StatBlock label="Total Assets" value={formatINRIntl(c.totalAssets)} />
                <StatBlock label="Liabilities" value={formatINRIntl(c.liabilities)} />
                <StatBlock label="Criminal Cases" value={String(c.criminalCases)} alert={c.criminalCases > 0} />
                <StatBlock label="Serious Cases" value={String(c.seriousCriminalCases)} alert={c.seriousCriminalCases > 0} />
              </div>
              <div className="bg-fig-warm rounded-xl p-4 border border-fig-border">
                <p className="font-courier-prime text-[10px] text-fig-black/30 tracking-widest uppercase mb-1">Net Worth</p>
                <p className={`font-courier-prime text-2xl font-bold ${netWorth.isPositive ? "text-green-700" : "text-fig-red"}`}>
                  {netWorth.isPositive ? "+" : "-"}{netWorth.formatted}
                </p>
                <p className="font-courier-prime text-[9px] text-fig-black/20 mt-1">
                  {formatINRFull(c.totalAssets)} Assets − {formatINRFull(c.liabilities)} Liabilities
                </p>
              </div>
              <div>
                <SVGProgressBar percent={alp} label="Asset / Liability Ratio" color="#16a34a" height={8} />
                <div className="flex justify-between mt-1 font-courier-prime text-[9px] text-fig-black/30">
                  <span>Assets {alp}%</span><span>Liabilities {100 - alp}%</span>
                </div>
              </div>
            </div>
            <div className="p-8 space-y-6">
              <div>
                <p className="font-courier-prime text-[10px] text-fig-black/30 tracking-widest uppercase mb-3">Party History</p>
                {c.partyHistory.length === 0 ? (
                  <p className="font-inter text-fig-black/40 text-sm italic">No prior political affiliations</p>
                ) : (
                  <div className="space-y-2">
                    {c.partyHistory.map((ph, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <span className="font-courier-prime text-[10px] text-fig-black/30 w-20">{ph.from}–{ph.to ?? "Now"}</span>
                        <span className="font-inter text-sm text-fig-black/70">{ph.party}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <p className="font-courier-prime text-[10px] text-fig-black/30 tracking-widest uppercase mb-3">Affidavit Declarations</p>
                <ul className="space-y-2">
                  {c.declarations.map((d, i) => (
                    <li key={i} className="flex gap-2 text-sm font-inter text-fig-black/60">
                      <span className="text-fig-red/60 flex-shrink-0">›</span>{d}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Comparison View ──
  if (comparison) {
    const { candidateA: a, candidateB: b } = comparison;
    return (
      <div className="max-w-5xl mx-auto animate-fade-in-up space-y-6">
        <button onClick={() => setComparison(null)} className="flex items-center gap-2 font-courier-prime text-xs text-fig-black/40 hover:text-fig-black/70 transition-colors tracking-wider">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          BACK TO GRID
        </button>
        <header className="text-center">
          <span className="machine-label mb-2 inline-block">Intelligence Briefing</span>
          <h1 className="font-instrument-serif text-4xl md:text-5xl text-fig-black">Candidate <span className="text-fig-red italic">Comparison</span></h1>
        </header>
        <div className="fig-panel overflow-hidden">
          <div className="grid grid-cols-3 border-b border-fig-border">
            <div className="p-4 border-r border-fig-border" />
            <div className="p-4 border-r border-fig-border text-center">
              <span className="px-2 py-0.5 rounded-md text-[10px] font-courier-prime tracking-widest font-bold border" style={{ borderColor: a.partyColor + "40", color: a.partyColor, backgroundColor: a.partyColor + "10" }}>{a.partyAbbr}</span>
              <p className="font-instrument-serif text-lg text-fig-black mt-1">{a.name}</p>
            </div>
            <div className="p-4 text-center">
              <span className="px-2 py-0.5 rounded-md text-[10px] font-courier-prime tracking-widest font-bold border" style={{ borderColor: b.partyColor + "40", color: b.partyColor, backgroundColor: b.partyColor + "10" }}>{b.partyAbbr}</span>
              <p className="font-instrument-serif text-lg text-fig-black mt-1">{b.name}</p>
            </div>
          </div>
          {[
            { label: "Total Assets", va: formatINRIntl(a.totalAssets), vb: formatINRIntl(b.totalAssets), highlight: true },
            { label: "Liabilities", va: formatINRIntl(a.liabilities), vb: formatINRIntl(b.liabilities), highlight: false },
            { label: "Net Worth", va: calculateNetWorth(a.totalAssets, a.liabilities).formatted, vb: calculateNetWorth(b.totalAssets, b.liabilities).formatted, highlight: true },
            { label: "Education", va: a.education, vb: b.education, highlight: true },
            { label: "Criminal Cases", va: String(a.criminalCases), vb: String(b.criminalCases), highlight: a.criminalCases !== b.criminalCases },
            { label: "Serious Cases", va: String(a.seriousCriminalCases), vb: String(b.seriousCriminalCases), highlight: a.seriousCriminalCases !== b.seriousCriminalCases },
            { label: "Age", va: String(a.age), vb: String(b.age), highlight: false },
            { label: "Party Switches", va: String(a.partyHistory.length), vb: String(b.partyHistory.length), highlight: a.partyHistory.length !== b.partyHistory.length },
          ].map((row, i) => (
            <div key={i} className={`grid grid-cols-3 ${i % 2 === 0 ? "bg-fig-warm/50" : ""} border-b border-fig-border/50`}>
              <div className="p-4 border-r border-fig-border font-courier-prime text-[11px] text-fig-black/40 tracking-wider uppercase flex items-center">{row.label}</div>
              <div className={`p-4 border-r border-fig-border font-courier-prime text-sm text-center ${row.highlight ? "text-fig-red font-bold" : "text-fig-black/80"}`}>{row.va}</div>
              <div className={`p-4 font-courier-prime text-sm text-center ${row.highlight ? "text-fig-red font-bold" : "text-fig-black/80"}`}>{row.vb}</div>
            </div>
          ))}
          <div className="p-6 bg-fig-warm border-t border-fig-border">
            <div className="grid md:grid-cols-3 gap-4 text-center">
              <div>
                <p className="font-courier-prime text-[10px] text-fig-black/30 tracking-widest uppercase mb-1">Wealth Ratio</p>
                <p className="font-instrument-serif text-2xl text-fig-red">{comparison.wealthRatio}</p>
              </div>
              <div>
                <p className="font-courier-prime text-[10px] text-fig-black/30 tracking-widest uppercase mb-1">Education</p>
                <p className="font-inter text-sm text-fig-black/70">{comparison.educationDiff}</p>
              </div>
              <div>
                <p className="font-courier-prime text-[10px] text-fig-black/30 tracking-widest uppercase mb-1">Criminal Diff</p>
                <p className="font-instrument-serif text-2xl text-fig-black">{comparison.criminalDiff > 0 ? "+" : ""}{comparison.criminalDiff}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Main Grid View ──
  return (
    <div className="space-y-8 animate-fade-in-up">
      <header>
        <span className="machine-label mb-3 inline-block">Intelligence Module</span>
        <h1 className="font-instrument-serif text-5xl md:text-6xl text-fig-black leading-[0.95]">
          Candidate <span className="text-fig-red italic">Dossier</span>
        </h1>
        <div className="mt-4 flex items-center gap-2">
          <span className="machine-label bg-fig-red/10 text-fig-red border-fig-red/20">DEMO MODE ACTIVE</span>
          <p className="font-inter text-fig-black/40 text-[10px] tracking-wider uppercase">Showing simulated candidate data for election cycle demonstration.</p>
        </div>
        <p className="mt-4 font-inter text-fig-black/50 text-sm max-w-lg">
          {CONSTITUENCY.name} Constituency, {CONSTITUENCY.state} · <span className="font-courier-prime">{formatNumber(CONSTITUENCY.electors)}</span> Registered Electors
        </p>
      </header>

      {selectedIds.length > 0 && (
        <div className="fig-panel p-4 flex items-center justify-between animate-fade-in-up">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-fig-red animate-pulse" />
            <span className="font-courier-prime text-xs text-fig-black/60 tracking-wider">
              {selectedIds.length}/2 SELECTED FOR COMPARISON
            </span>
          </div>
          {selectedIds.length === 2 ? (
            <button onClick={handleCompare} className="scan-btn bg-fig-black text-fig-cream font-inter font-bold text-sm px-6 py-2 rounded-lg hover:bg-fig-black/80 transition-all">
              Compare Now
            </button>
          ) : (
            <span className="font-courier-prime text-[10px] text-fig-black/30 tracking-wider">Select one more candidate</span>
          )}
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {CANDIDATES.map((c) => (
          <ShimmerCard key={c.id} isLoading={isLoading}>
            <DossierCard
              candidate={c}
              isSelected={selectedIds.includes(c.id)}
              onToggleCompare={() => toggleCompare(c.id)}
              onExpand={() => setExpandedId(c.id)}
              tiltStyle={tiltStyle[c.id]}
              onMouseMove={(e) => handleTilt(c.id, e)}
              onMouseLeave={() => resetTilt(c.id)}
            />
          </ShimmerCard>
        ))}
      </div>
    </div>
  );
}

function StatBlock({ label, value, alert }: { label: string; value: string; alert?: boolean }) {
  return (
    <div>
      <p className="font-courier-prime text-[10px] text-fig-black/30 tracking-widest uppercase mb-1">{label}</p>
      <p className={`font-courier-prime text-lg font-bold ${alert ? "text-fig-red" : "text-fig-black"}`}>{value}</p>
    </div>
  );
}

function DossierCard({
  candidate: c, isSelected, onToggleCompare, onExpand, tiltStyle, onMouseMove, onMouseLeave,
}: {
  candidate: Candidate; isSelected: boolean; onToggleCompare: () => void; onExpand: () => void;
  tiltStyle?: React.CSSProperties; onMouseMove: (e: React.MouseEvent<HTMLDivElement>) => void; onMouseLeave: () => void;
}) {
  const alp = getAssetLiabilityPercent(c);
  const netWorth = calculateNetWorth(c.totalAssets, c.liabilities);

  return (
    <div
      className={`fig-panel overflow-hidden transition-all duration-300 cursor-pointer ${isSelected ? "ring-2 ring-fig-red/40 shadow-lg" : "hover:shadow-md"}`}
      style={{ ...tiltStyle, transition: "transform 0.15s ease-out, box-shadow 0.3s" }}
      onMouseMove={onMouseMove} onMouseLeave={onMouseLeave} onClick={onExpand}
    >
      <div className="flex items-center justify-between px-5 py-3 border-b border-fig-border bg-fig-warm/30">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-md text-[9px] font-courier-prime tracking-widest font-bold border" style={{ borderColor: c.partyColor + "40", color: c.partyColor, backgroundColor: c.partyColor + "10" }}>{c.partyAbbr}</span>
          <span className="font-courier-prime text-[9px] text-fig-black/25 tracking-widest">{c.id.toUpperCase()}</span>
        </div>
        <label className="flex items-center gap-2 cursor-pointer" onClick={(e) => e.stopPropagation()}>
          <span className="font-courier-prime text-[9px] text-fig-black/30 tracking-wider">CMP</span>
          <button
            onClick={(e) => { e.stopPropagation(); onToggleCompare(); }}
            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all focus:outline-none focus:ring-2 focus:ring-fig-red/30 ${isSelected ? "bg-fig-red border-fig-red" : "border-fig-black/20 hover:border-fig-red/50"}`}
            aria-label={`${isSelected ? "Deselect" : "Select"} ${c.name} for comparison`}
          >
            {isSelected && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
          </button>
        </label>
      </div>

      <div className="p-5 space-y-4">
        <div>
          <h2 className="font-instrument-serif text-2xl text-fig-black leading-tight">{c.name}</h2>
          <p className="font-inter text-xs text-fig-black/40 mt-0.5">{c.party} · Age {c.age}</p>
        </div>
        <p className="font-inter text-xs text-fig-black/50">{c.education}</p>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <p className="font-courier-prime text-[9px] text-fig-black/25 tracking-widest uppercase">Assets</p>
            <p className="font-courier-prime text-sm text-fig-black font-bold">{formatINRIntl(c.totalAssets)}</p>
          </div>
          <div>
            <p className="font-courier-prime text-[9px] text-fig-black/25 tracking-widest uppercase">Liabilities</p>
            <p className="font-courier-prime text-sm text-fig-black/70">{formatINRIntl(c.liabilities)}</p>
          </div>
          <div>
            <p className="font-courier-prime text-[9px] text-fig-black/25 tracking-widest uppercase">Cases</p>
            <p className={`font-courier-prime text-sm font-bold ${c.criminalCases > 0 ? "text-fig-red" : "text-green-700"}`}>{c.criminalCases}</p>
          </div>
        </div>
        <div className="bg-fig-warm rounded-lg px-3 py-2 border border-fig-border">
          <p className="font-courier-prime text-[8px] text-fig-black/20 tracking-widest uppercase">Net Worth</p>
          <p className={`font-courier-prime text-sm font-bold ${netWorth.isPositive ? "text-green-700" : "text-fig-red"}`}>
            {netWorth.isPositive ? "+" : "-"}{netWorth.formatted}
          </p>
        </div>
        <SVGProgressBar percent={alp} color="#16a34a" height={6} showLabel={false} />
        <div className="flex justify-between font-courier-prime text-[8px] text-fig-black/20">
          <span>A:{alp}%</span><span>L:{100 - alp}%</span>
        </div>
      </div>

      <div className="px-5 py-3 border-t border-fig-border bg-fig-warm/30 flex justify-between items-center">
        <span className="font-courier-prime text-[9px] text-fig-black/20 tracking-widest">TAP TO EXPAND</span>
        <svg className="w-4 h-4 text-fig-black/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
      </div>
    </div>
  );
}
