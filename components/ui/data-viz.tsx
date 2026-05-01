"use client";

import React from "react";

/* ════════════════════════════════════════════════════════════
   ShimmerCard — Subtle shimmer effect while loading data
   ════════════════════════════════════════════════════════════ */

interface ShimmerCardProps {
  isLoading: boolean;
  children: React.ReactNode;
  className?: string;
}

export function ShimmerCard({ isLoading, children, className = "" }: ShimmerCardProps) {
  if (isLoading) {
    return (
      <div className={`border-2 border-fig-black bg-fig-cream rounded-xl overflow-hidden shimmer-card ${className}`}>
        <div className="p-6 h-full flex flex-col justify-center gap-3">
          <div className="h-3 bg-fig-black w-1/3 mb-2" />
          <div className="h-6 border border-fig-black bg-transparent w-2/3" />
          <div className="h-2 bg-fig-black w-1/2 mt-2" />
        </div>
      </div>
    );
  }
  return (
    <div className={`${className}`}>
      {children}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   Animated SVG Progress Bar — For voter turnout
   ════════════════════════════════════════════════════════════ */

interface SVGProgressBarProps {
  percent: number;
  label?: string;
  color?: string;
  height?: number;
  showLabel?: boolean;
  animated?: boolean;
  className?: string;
}

export function SVGProgressBar({
  percent,
  label,
  color = "#1A1A1A",
  height = 12,
  showLabel = true,
  animated = true,
  className = "",
}: SVGProgressBarProps) {
  const clampedPercent = Math.max(0, Math.min(100, percent));
  const gradientId = `progress-gradient-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-baseline mb-1.5">
          {label && (
            <span className="font-courier-prime text-[10px] text-fig-black/40 tracking-widest uppercase">
              {label}
            </span>
          )}
          <span className="font-courier-prime text-xs text-fig-black font-bold tabular-nums">
            {clampedPercent}%
          </span>
        </div>
      )}
      <svg
        width="100%"
        height={height}
        viewBox={`0 0 100 ${height}`}
        preserveAspectRatio="none"
        className="rounded-full overflow-hidden"
        role="progressbar"
        aria-valuenow={clampedPercent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label || `Progress: ${clampedPercent}%`}
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={color} stopOpacity="0.5" />
            <stop offset="50%" stopColor={color} stopOpacity="0.9" />
            <stop offset="100%" stopColor={color} stopOpacity="0.7" />
          </linearGradient>
        </defs>
        {/* Background track */}
        <rect x="0" y="0" width="100" height={height} rx={height / 2} fill="rgba(0,0,0,0.06)" />
        {/* Filled bar */}
        <rect x="0" y="0" width={clampedPercent} height={height} rx={height / 2} fill={`url(#${gradientId})`} className={animated ? "progress-bar-animated" : ""} style={{ transformOrigin: "left" }}>
          {animated && (
            <animate attributeName="width" from="0" to={String(clampedPercent)} dur="1.2s" fill="freeze" calcMode="spline" keySplines="0.16 1 0.3 1" />
          )}
        </rect>
      </svg>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   Circular Progress Ring — For quick stat displays
   ════════════════════════════════════════════════════════════ */

interface ProgressRingProps {
  percent: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  label?: string;
  children?: React.ReactNode;
  className?: string;
}

export function ProgressRing({
  percent,
  size = 80,
  strokeWidth = 6,
  color = "#1A1A1A",
  label,
  children,
  className = "",
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth={strokeWidth} />
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} className="progress-ring-circle" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {children || (
          <>
            <span className="font-courier-prime text-sm text-fig-black font-bold">{percent}%</span>
            {label && <span className="font-courier-prime text-[7px] text-fig-black/30 tracking-widest uppercase">{label}</span>}
          </>
        )}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   OfflineBadge — Shown when API data is unavailable
   ════════════════════════════════════════════════════════════ */

interface OfflineBadgeProps {
  lastUpdated?: string;
  className?: string;
}

export function OfflineBadge({ lastUpdated, className = "" }: OfflineBadgeProps) {
  return (
    <div className={`offline-badge ${className}`} role="status" aria-live="polite">
      <span>[SYSTEM: OFFLINE INTELLIGENCE MODE - SHOWING CACHED DATA]</span>
      {lastUpdated && (
        <span className="text-amber-600/60">
          — {lastUpdated}
        </span>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   LiveIndicator — Pulsing dot for live data streams
   ════════════════════════════════════════════════════════════ */

interface LiveIndicatorProps {
  isLive: boolean;
  label?: string;
  className?: string;
}

export function LiveIndicator({ isLive, label, className = "" }: LiveIndicatorProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className={`w-2 h-2 rounded-full ${isLive ? "bg-green-500 animate-pulse" : "bg-amber-500"}`} />
      <span className={`font-courier-prime text-[9px] tracking-widest ${isLive ? "text-green-700" : "text-amber-700"}`}>
        {label || (isLive ? "LIVE" : "CACHED")}
      </span>
    </div>
  );
}
