"use client";

import { useState, useEffect, Suspense } from "react";
import {
  fetchLiveWeather,
  calculateGoldenHourLive,
  getUVLabel,
  type LiveWeatherData,
  type GoldenHourRecommendation,
} from "@/lib/weather-service";
import {
  fetchElectionNews,
  getOverallTickerSeverity,
  getLastUpdatedLabel,
  type SecurityTickerItem,
} from "@/lib/news-service";
import {
  getCountdown,
  SOS_REMEDIES,
  type SOSRemedy,
} from "@/lib/polling-services";
import { formatLastUpdated } from "@/lib/format-utils";
import { ShimmerCard, OfflineBadge, LiveIndicator } from "@/components/ui/data-viz";
import { useVoterStore } from "@/lib/store";

export default function PollingPage() {
  const [mounted, setMounted] = useState(false);
  const [weather, setWeather] = useState<LiveWeatherData | null>(null);
  const [goldenHour, setGoldenHour] = useState<GoldenHourRecommendation | null>(null);
  const [alerts, setAlerts] = useState<SecurityTickerItem[]>([]);
  const [newsIsLive, setNewsIsLive] = useState(false);
  const [newsLastUpdated, setNewsLastUpdated] = useState("");
  const [countdown, setCountdown] = useState({ hours: 0, minutes: 0, seconds: 0, isOpen: false, pollCloseTime: "" });
  const [activeModal, setActiveModal] = useState<SOSRemedy | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [newsLoading, setNewsLoading] = useState(true);
  const [inkActive, setInkActive] = useState(false);
  const { hasVoted, markAsVoted } = useVoterStore();

  const handleIVoted = () => {
    setInkActive(true);
    setTimeout(() => { markAsVoted(); window.location.href = "/results"; }, 1800);
  };

  useEffect(() => {
    setMounted(true);
    (async () => {
      try {
        const w = await fetchLiveWeather();
        setWeather(w);
        setGoldenHour(calculateGoldenHourLive(w));
      } catch { /* fallback */ }
      finally { setWeatherLoading(false); }
    })();
  }, []);

  useEffect(() => {
    if (!mounted) return;
    (async () => {
      try {
        const { items, isLive, lastUpdated } = await fetchElectionNews();
        setAlerts(items);
        setNewsIsLive(isLive);
        setNewsLastUpdated(lastUpdated);
      } catch { setNewsIsLive(false); }
      finally { setNewsLoading(false); }
    })();
  }, [mounted]);

  useEffect(() => {
    if (!mounted) return;
    const id = setInterval(() => setCountdown(getCountdown()), 1000);
    setCountdown(getCountdown());
    return () => clearInterval(id);
  }, [mounted]);

  const severity = alerts.length > 0 ? getOverallTickerSeverity(alerts) : "secure";
  // Saffron for Law & Order alerts ONLY
  const sevColor = severity === "critical" ? "text-fig-red" : severity === "warning" ? "text-saffron" : "text-green-700";
  const sevBg = severity === "critical" ? "bg-fig-red/5 border-fig-red/20" : severity === "warning" ? "bg-saffron/5 border-saffron/20" : "bg-green-50 border-green-400/20";

  if (!mounted) return <div className="min-h-[60vh] flex items-center justify-center"><div className="w-8 h-8 border-2 border-fig-black/20 border-t-fig-black rounded-full animate-spin" /></div>;

  const uvInfo = weather ? getUVLabel(weather.uvIndex) : null;

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* ═══ Pulse Line ═══ */}
      <div className="relative h-8 overflow-hidden rounded-xl" aria-hidden="true">
        <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 1200 32">
          <path d="M0 16 L200 16 L230 4 L260 28 L290 8 L320 24 L350 16 L1200 16" fill="none" stroke="rgba(26,26,26,0.15)" strokeWidth="1.5">
            <animate attributeName="stroke-dashoffset" values="2400;0" dur="3s" repeatCount="indefinite" />
            <animate attributeName="stroke-dasharray" values="0 2400;2400 0" dur="3s" repeatCount="indefinite" />
          </path>
          <circle r="3" fill="#D32F2F">
            <animateMotion dur="3s" repeatCount="indefinite" path="M0 16 L200 16 L230 4 L260 28 L290 8 L320 24 L350 16 L1200 16" />
          </circle>
        </svg>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
          <LiveIndicator isLive={weather?.isLive ?? false} label={weather?.isLive ? "LIVE API" : "SIMULATED"} />
        </div>
      </div>

      {/* ═══ Safety Ticker Marquee — SAFFRON for Law & Order ═══ */}
      <Suspense fallback={<ShimmerCard isLoading={true} />}>
        <ShimmerCard isLoading={newsLoading}>
        <div className={`rounded-xl border px-4 py-2.5 overflow-hidden ${sevBg}`} role="marquee" aria-label="Safety alerts ticker">
          <div className="flex items-center gap-4">
            <span className={`flex-shrink-0 font-courier-prime text-[10px] tracking-widest uppercase font-bold ${sevColor} ${severity !== "secure" ? "animate-pulse" : ""}`}>
              {severity === "secure" ? "● SECURE" : severity === "warning" ? "▲ ALERT" : severity === "critical" ? "◆ CRITICAL" : "ℹ INFO"}
            </span>
            <div className="overflow-hidden flex-grow">
              {alerts.length > 0 ? (
                <div className="flex gap-16 animate-[marquee_30s_linear_infinite] whitespace-nowrap">
                  {[...alerts, ...alerts].map((a, i) => (
                    <span key={i} className={`font-courier-prime text-xs tracking-wider ${a.severity === "warning" || a.severity === "critical" ? "text-saffron" : "text-fig-black/60"}`}>
                      {a.headline}
                      <span className="text-fig-black/15 mx-3">|</span>
                    </span>
                  ))}
                </div>
              ) : (
                <OfflineBadge lastUpdated={formatLastUpdated()} />
              )}
            </div>
          </div>
        </div>
      </ShimmerCard>
      </Suspense>

      {/* ═══ Header ═══ */}
      <header>
        <span className="machine-label mb-3 inline-block">Polling Day HQ</span>
        <h1 className="font-instrument-serif text-5xl md:text-6xl text-fig-black leading-[0.95]">
          Command <span className="text-fig-red italic">Center</span>
        </h1>
        <p className="mt-2 font-inter text-fig-black/40 text-sm">
          Hyderabad Constituency, Telangana · Real-time monitoring
        </p>
      </header>

      {/* ═══ Top Grid: Countdown + Weather + Golden Hour ═══ */}
      <div className="grid md:grid-cols-3 gap-4">
        {/* Countdown */}
        <div className="fig-panel p-6 text-center">
          <p className="font-courier-prime text-[10px] text-fig-black/30 tracking-widest uppercase mb-3">
            {countdown.isOpen ? "Polls Close In" : "Status"}
          </p>
          {countdown.isOpen ? (
            <div className="flex justify-center gap-3">
              {[
                { val: countdown.hours, label: "HRS" },
                { val: countdown.minutes, label: "MIN" },
                { val: countdown.seconds, label: "SEC" },
              ].map((t) => (
                <div key={t.label}>
                  <span className="font-courier-prime text-3xl md:text-4xl text-fig-black font-bold tabular-nums">
                    {String(t.val).padStart(2, "0")}
                  </span>
                  <p className="font-courier-prime text-[8px] text-fig-black/30 tracking-widest mt-1">{t.label}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="font-instrument-serif text-2xl text-fig-black/50">Polls Closed</p>
          )}
          <p className="font-courier-prime text-[10px] text-fig-black/25 tracking-wider mt-3">
            Closes {countdown.pollCloseTime}
          </p>
        </div>

        {/* Weather — 31°C Partly Cloudy */}
        <Suspense fallback={<ShimmerCard isLoading={true} className="fig-panel p-6 h-full" />}>
          <ShimmerCard isLoading={weatherLoading} className="fig-panel p-6 text-center">
          <div className="flex items-center justify-between mb-3">
            <p className="font-courier-prime text-[10px] text-fig-black/30 tracking-widest uppercase">Current Weather</p>
            <LiveIndicator isLive={weather?.isLive ?? false} />
          </div>
          {weather ? (
            <>
              <div className="flex items-center justify-center gap-3 mb-2">
                <span className="text-4xl">{weather.icon}</span>
                <span className="font-courier-prime text-4xl text-fig-black font-bold data-live">{weather.temp}°</span>
              </div>
              <p className="font-inter text-xs text-fig-black/50">{weather.description} · Feels {weather.feelsLike}°</p>
              <div className="flex justify-center gap-4 mt-3 font-courier-prime text-[10px] text-fig-black/30">
                <span>💧 {weather.humidity}%</span>
                <span>💨 {weather.windSpeed} km/h</span>
              </div>
              <div className="mt-3 bg-fig-warm rounded-lg px-3 py-2 inline-flex items-center gap-2">
                <span className="font-courier-prime text-[9px] text-fig-black/25 tracking-widest">UV</span>
                <span className={`font-courier-prime text-sm font-bold ${uvInfo?.color}`}>{weather.uvIndex}</span>
                <span className={`font-courier-prime text-[9px] tracking-wider ${uvInfo?.color}`}>{uvInfo?.label}</span>
              </div>
              {/* Peak temp warning */}
              <div className="mt-2 bg-saffron/5 border border-saffron/20 rounded-lg px-3 py-1.5">
                <p className="font-courier-prime text-[9px] text-saffron">PEAK TODAY: {weather.peakTemp}°C</p>
              </div>
              <p className="font-courier-prime text-[9px] text-fig-black/20 mt-2">{weather.city} · ☀️ {weather.sunrise} — 🌙 {weather.sunset}</p>
            </>
          ) : (
            <OfflineBadge lastUpdated={formatLastUpdated()} />
          )}
          </ShimmerCard>
        </Suspense>

        {/* Golden Hour — 07:00–08:30 AM May 1 */}
        <Suspense fallback={<ShimmerCard isLoading={true} className="fig-panel p-6 h-full" />}>
          <ShimmerCard isLoading={weatherLoading} className="fig-panel p-6 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-fig-red/3 to-transparent pointer-events-none" />
          <p className="font-courier-prime text-[10px] text-fig-red/60 tracking-widest uppercase mb-3 relative">Golden Hour</p>
          {goldenHour ? (
            <div className="relative">
              <p className="font-instrument-serif text-3xl text-fig-red">{goldenHour.startTime}</p>
              <p className="font-courier-prime text-xs text-fig-black/40 mt-1">to {goldenHour.endTime} · {goldenHour.date}</p>
              <div className="flex justify-center gap-3 mt-3">
                <span className="px-2 py-0.5 rounded bg-fig-warm font-courier-prime text-[10px] text-fig-black/40">{goldenHour.temp}°C</span>
                <span className="px-2 py-0.5 rounded bg-fig-warm font-courier-prime text-[10px] text-fig-black/40">UV {goldenHour.uvIndex}</span>
                <span className={`px-2 py-0.5 rounded font-courier-prime text-[10px] ${goldenHour.crowdLevel === "low" ? "bg-green-50 text-green-700" : "bg-saffron/10 text-saffron"}`}>
                  {goldenHour.crowdLevel.toUpperCase()} CROWD
                </span>
              </div>
              <p className="font-inter text-[11px] text-fig-black/40 mt-3 max-w-[220px] mx-auto">{goldenHour.recommendation}</p>
              {goldenHour.heatAdvisory && (
                <div className="mt-3 bg-saffron/5 border border-saffron/20 rounded-lg px-3 py-2">
                  <p className="font-inter text-[10px] text-saffron">{goldenHour.heatAdvisory}</p>
                </div>
              )}
            </div>
          ) : (
            <p className="font-inter text-fig-black/40 text-sm relative">Calculating...</p>
          )}
          </ShimmerCard>
        </Suspense>
      </div>

      {/* ═══ I Have Voted / Verified Badge ═══ */}
      {hasVoted ? (
        <div className="fig-panel p-6 border-2 border-green-400/30 bg-green-50 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-green-100 border-2 border-green-400/40 flex items-center justify-center flex-shrink-0">
            <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
          </div>
          <div>
            <h3 className="font-instrument-serif text-2xl text-green-700">Verified Voter</h3>
            <p className="font-courier-prime text-[10px] text-fig-black/30 tracking-wider">YOUR VOTE HAS BEEN RECORDED · RESULTS DASHBOARD UNLOCKED</p>
          </div>
        </div>
      ) : (
        <button onClick={handleIVoted} data-testid="i-voted-btn" className="w-full fig-panel p-6 border-2 border-fig-red/20 hover:border-fig-red/40 text-center transition-all duration-300 hover:shadow-lg group">
          <div className="flex items-center justify-center gap-3">
            <span className="text-3xl">🗳️</span>
            <span className="font-instrument-serif text-3xl text-fig-black group-hover:text-fig-red transition-colors">I Have Voted</span>
          </div>
          <p className="font-courier-prime text-[10px] text-fig-black/30 tracking-wider mt-2">TAP TO CONFIRM · THIS ACTION CANNOT BE UNDONE</p>
        </button>
      )}

      {/* ═══ Ink Splash Overlay ═══ */}
      {inkActive && (
        <div className="fixed inset-0 z-[200] pointer-events-none flex items-center justify-center">
          <div className="w-[200vmax] h-[200vmax] rounded-full bg-fig-black animate-ink-splash" style={{ animationDuration: '1.5s' }} />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center animate-fade-in-up" style={{ animationDelay: '0.6s', animationFillMode: 'backwards' }}>
              <span className="text-6xl block mb-4">✓</span>
              <p className="font-instrument-serif text-4xl text-fig-cream">Vote Recorded</p>
              <p className="font-courier-prime text-xs text-fig-cream/60 tracking-widest mt-2">REDIRECTING TO RESULTS...</p>
            </div>
          </div>
        </div>
      )}

      {/* ═══ SOS Crisis Cards ═══ */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xl">🚨</span>
          <h2 className="font-instrument-serif text-2xl text-fig-black">Emergency Quick Actions</h2>
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          {SOS_REMEDIES.map((sos) => (
            <button key={sos.id} onClick={() => setActiveModal(sos)} className="fig-panel p-5 text-left transition-all duration-300 hover:shadow-md group">
              <span className="text-2xl block mb-3">{sos.icon}</span>
              <h3 className="font-instrument-serif text-lg text-fig-black group-hover:text-fig-red transition-colors">{sos.title}</h3>
              <p className="font-courier-prime text-[9px] text-fig-black/25 tracking-wider mt-1">{sos.legalRef}</p>
              <p className="font-inter text-[11px] text-fig-red/60 mt-3 flex items-center gap-1 group-hover:text-fig-red transition-colors">View Steps →</p>
            </button>
          ))}
        </div>
      </section>

      {/* ═══ Emergency Hotline ═══ */}
      <div className="fig-panel p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-saffron/10 border border-saffron/30 flex items-center justify-center flex-shrink-0">
            <span className="text-xl">📞</span>
          </div>
          <div>
            <h3 className="font-instrument-serif text-xl text-fig-black">ECI Emergency Hotline</h3>
            <p className="font-inter text-xs text-fig-black/40">24×7 available on polling day for voter assistance</p>
          </div>
        </div>
        <a href="tel:1950" className="scan-btn bg-fig-black text-fig-cream font-courier-prime font-bold text-lg px-8 py-3 rounded-xl tracking-widest hover:bg-fig-black/80 transition-all">
          1950
        </a>
      </div>

      {/* ═══ Safety Feed ═══ */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-instrument-serif text-2xl text-fig-black">Live Situation Feed</h2>
          {!newsIsLive && newsLastUpdated && (
            <OfflineBadge lastUpdated={getLastUpdatedLabel(newsLastUpdated)} />
          )}
        </div>
        <div className="space-y-3">
          <Suspense fallback={<ShimmerCard isLoading={true} className="h-24" />}>
            {alerts.length > 0 ? alerts.map((a) => (
            <ShimmerCard key={a.id} isLoading={newsLoading}>
              <div className="fig-panel p-4 flex items-start gap-4">
                <span className={`flex-shrink-0 mt-1 w-2 h-2 rounded-full ${a.severity === "secure" ? "bg-green-500" : a.severity === "warning" ? "bg-saffron animate-pulse" : a.severity === "critical" ? "bg-fig-red animate-pulse" : "bg-blue-500"}`} />
                <div className="flex-grow">
                  <p className="font-inter text-sm text-fig-black/80">{a.headline}</p>
                  <div className="flex gap-3 mt-1.5 font-courier-prime text-[9px] text-fig-black/25 tracking-wider">
                    <span>{new Date(a.timestamp).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</span>
                    <span>· {a.source}</span>
                  </div>
                </div>
              </div>
            </ShimmerCard>
          )) : (
            <div className="fig-panel p-6 text-center">
              <OfflineBadge lastUpdated={formatLastUpdated()} className="justify-center" />
              <p className="font-inter text-sm text-fig-black/40 mt-3">No alerts available. Check your connection.</p>
            </div>
          )}
          </Suspense>
        </div>
      </section>

      {/* ═══ SOS Modal ═══ */}
      {activeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={() => setActiveModal(null)}>
          <div className="absolute inset-0 bg-fig-black/40 backdrop-blur-sm" />
          <div className="relative fig-panel-strong border-2 border-fig-red/20 max-w-lg w-full max-h-[85vh] overflow-y-auto p-8 animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setActiveModal(null)} className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-fig-black/5 hover:bg-fig-black/10 flex items-center justify-center text-fig-black/40 hover:text-fig-black transition-colors" aria-label="Close modal">
              ✕
            </button>
            <span className="text-3xl block mb-4">{activeModal.icon}</span>
            <h2 className="font-instrument-serif text-3xl text-fig-black mb-1">{activeModal.title}</h2>
            <p className="font-courier-prime text-[10px] text-fig-red/60 tracking-wider mb-6">{activeModal.legalRef}</p>
            <ol className="space-y-4">
              {activeModal.steps.map((step, i) => (
                <li key={i} className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-fig-red/10 border border-fig-red/20 flex items-center justify-center font-courier-prime text-[10px] text-fig-red font-bold">{i + 1}</span>
                  <p className="font-inter text-sm text-fig-black/80 leading-relaxed pt-0.5">{step}</p>
                </li>
              ))}
            </ol>
            <div className="mt-6 pt-4 border-t border-fig-border flex items-center justify-between">
              <p className="font-courier-prime text-[10px] text-fig-black/30 tracking-wider">EMERGENCY HELPLINE</p>
              <a href={`tel:${activeModal.helpline}`} className="bg-fig-black text-fig-cream font-courier-prime font-bold px-5 py-2 rounded-lg text-sm tracking-widest hover:bg-fig-black/80 transition-all">
                📞 {activeModal.helpline}
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
