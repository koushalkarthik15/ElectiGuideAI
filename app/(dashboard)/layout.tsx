"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import VoterAssistant from '@/components/copilot/VoterAssistant';
import { fetchElectionNews, getOverallTickerSeverity, type SecurityTickerItem } from '@/lib/news-service';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [tickerAlerts, setTickerAlerts] = useState<SecurityTickerItem[]>([]);
  const [systemStatus, setSystemStatus] = useState<"LIVE_SYNC" | "DEMO_MODE">("LIVE_SYNC");

  const navLinks = [
    { href: '/registration', label: 'Registration', icon: '📋' },
    { href: '/dossier', label: 'Dossier', icon: '🗂️' },
    { href: '/polling', label: 'Polling HQ', icon: '🏛️' },
    { href: '/results', label: 'Results', icon: '📊' },
  ];

  useEffect(() => {
    (async () => {
      try {
        const { items } = await fetchElectionNews();
        setTickerAlerts(items.slice(0, 3));
        setSystemStatus("LIVE_SYNC");
      } catch {
        setSystemStatus("DEMO_MODE");
      }
    })();
  }, []);

  const severity = tickerAlerts.length > 0 ? getOverallTickerSeverity(tickerAlerts) : "secure";

  return (
    <div className="min-h-screen bg-fig-cream text-fig-black flex flex-col font-inter relative paper-grain">
      {/* ═══ Header ═══ */}
      <header className="sticky top-0 z-50 bg-fig-cream/90 backdrop-blur-md border-b border-fig-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-3 group">
              <span className="font-instrument-serif text-3xl text-fig-black">Electi<span className="italic text-fig-red">Guide</span></span>
              <span className="machine-label hidden sm:inline-flex">AI</span>
            </Link>
            
            {/* Safety Status Pill — saffron for alerts (Law & Order) */}
            <div className={`hidden md:flex items-center space-x-2 ${
              severity === "warning" ? "bg-saffron/10 border-saffron/30" 
              : severity === "critical" ? "bg-fig-red/10 border-fig-red/30" 
              : "bg-green-100 border-green-400/30"
            } border px-4 py-1.5 rounded-full`}>
              <span className={`w-2 h-2 rounded-full animate-pulse ${
                severity === "warning" ? "bg-saffron" 
                : severity === "critical" ? "bg-fig-red" 
                : "bg-green-500"
              }`}></span>
              <span className={`text-[10px] font-courier-prime tracking-wider ${
                severity === "warning" ? "text-saffron" 
                : severity === "critical" ? "text-fig-red" 
                : "text-green-700"
              }`}>
                {severity === "secure" ? "ALL SYSTEMS NOMINAL" : severity === "warning" ? "ALERT ACTIVE" : severity === "critical" ? "CRITICAL" : "INFO STREAM"}
              </span>
            </div>

            <nav className="hidden md:flex space-x-1 text-sm font-medium">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    pathname === link.href
                      ? 'bg-fig-black text-fig-cream font-semibold'
                      : 'text-fig-black/60 hover:bg-fig-black/5 hover:text-fig-black'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Mobile menu */}
            <div className="md:hidden">
              <details className="relative">
                <summary className="list-none cursor-pointer w-10 h-10 rounded-lg hover:bg-fig-black/5 flex items-center justify-center">
                  <svg className="w-5 h-5 text-fig-black/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </summary>
                <div className="absolute right-0 mt-2 w-48 fig-panel-strong overflow-hidden">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`block px-4 py-3 text-sm font-inter transition-colors border-b border-fig-border last:border-0 ${
                        pathname === link.href
                          ? 'bg-fig-black text-fig-cream font-semibold'
                          : 'text-fig-black/60 hover:bg-fig-black/5 hover:text-fig-black'
                      }`}
                    >
                      <span className="mr-2">{link.icon}</span>{link.label}
                    </Link>
                  ))}
                </div>
              </details>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 relative z-[1]">
        {children}
      </main>

      {/* Footer System Status */}
      <footer className="w-full text-center py-2 border-t border-fig-border bg-fig-cream/80 backdrop-blur z-40 relative">
        <span className="font-geist-mono text-[10px] text-fig-black/40 tracking-widest">
          [SYSTEM_STATUS: {systemStatus}]
        </span>
      </footer>

      {/* Co-Pilot Agent Interface */}
      <VoterAssistant />
    </div>
  );
}
