/* ════════════════════════════════════════════════════════════
   ElectiGuide AI — Polling Day Services
   Weather, Safety Ticker, Golden Hour, Countdown
   ════════════════════════════════════════════════════════════ */

/* ──── Types ──── */

export interface WeatherData {
  temp: number;
  feelsLike: number;
  humidity: number;
  description: string;
  icon: string;
  windSpeed: number;
  city: string;
  isSafe: boolean;
  cachedAt: number;
}

export interface GoldenHour {
  startTime: string;
  endTime: string;
  temp: number;
  crowdLevel: "low" | "medium" | "high";
  recommendation: string;
}

export interface SafetyAlert {
  id: string;
  headline: string;
  severity: "secure" | "info" | "warning" | "critical";
  timestamp: string;
  source: string;
}

export interface SOSRemedy {
  id: string;
  title: string;
  icon: string;
  legalRef: string;
  steps: string[];
  helpline: string;
}

/* ──── Mock Weather Service ──── */

const WEATHER_CACHE_KEY = "electiguide-weather-cache";

export function getMockWeather(city = "Varanasi"): WeatherData {
  // Check cache first
  if (typeof window !== "undefined") {
    try {
      const cached = localStorage.getItem(WEATHER_CACHE_KEY);
      if (cached) {
        const data = JSON.parse(cached) as WeatherData;
        if (Date.now() - data.cachedAt < 10 * 60 * 1000) return data; // 10 min cache
      }
    } catch { /* ignore */ }
  }

  const data: WeatherData = {
    temp: 34,
    feelsLike: 38,
    humidity: 62,
    description: "Partly Cloudy",
    icon: "⛅",
    windSpeed: 12,
    city,
    isSafe: true,
    cachedAt: Date.now(),
  };

  if (typeof window !== "undefined") {
    try { localStorage.setItem(WEATHER_CACHE_KEY, JSON.stringify(data)); } catch { /* ignore */ }
  }
  return data;
}

/* ──── Golden Hour Calculator ──── */

export function calculateGoldenHour(currentTemp: number): GoldenHour {
  // Early morning (7-9 AM) or late afternoon (4-5:30 PM) are optimal
  const hour = new Date().getHours();

  if (hour < 9) {
    return { startTime: "7:00 AM", endTime: "9:00 AM", temp: currentTemp - 6, crowdLevel: "low", recommendation: "Ideal window — cool temperature, minimal queues." };
  }
  if (hour < 15) {
    return { startTime: "4:00 PM", endTime: "5:30 PM", temp: currentTemp - 4, crowdLevel: "medium", recommendation: "Afternoon slot — temperature drops, moderate crowd expected." };
  }
  return { startTime: "4:00 PM", endTime: "5:30 PM", temp: currentTemp - 2, crowdLevel: "low", recommendation: "You're in the golden window now — head to your booth!" };
}

/* ──── Safety Ticker Feed ──── */

export function getMockSafetyAlerts(): SafetyAlert[] {
  return [
    { id: "sa-1", headline: "Varanasi — All 412 booths reporting peaceful polling", severity: "secure", timestamp: new Date().toISOString(), source: "ECI Situation Room" },
    { id: "sa-2", headline: "EC deploys additional CAPF at 23 sensitive booths in Varanasi South", severity: "info", timestamp: new Date(Date.now() - 25 * 60000).toISOString(), source: "DEO Office" },
    { id: "sa-3", headline: "Minor EVM delay at Booth #187, Sigra — resolved within 15 minutes", severity: "warning", timestamp: new Date(Date.now() - 45 * 60000).toISOString(), source: "Sector Magistrate" },
    { id: "sa-4", headline: "High voter turnout — 42.3% recorded by 1:00 PM across constituency", severity: "info", timestamp: new Date(Date.now() - 90 * 60000).toISOString(), source: "Returning Officer" },
    { id: "sa-5", headline: "All VVPAT machines functioning — zero replacements needed today", severity: "secure", timestamp: new Date(Date.now() - 120 * 60000).toISOString(), source: "ECI Tech Wing" },
  ];
}

export function getOverallSeverity(alerts: SafetyAlert[]): "secure" | "info" | "warning" | "critical" {
  if (alerts.some((a) => a.severity === "critical")) return "critical";
  if (alerts.some((a) => a.severity === "warning")) return "warning";
  if (alerts.some((a) => a.severity === "info")) return "info";
  return "secure";
}

/* ──── Voting Countdown ──── */

export function getCountdown(): { hours: number; minutes: number; seconds: number; isOpen: boolean; pollCloseTime: string } {
  const now = new Date();
  // Polls close at 6:00 PM IST
  const close = new Date(now);
  close.setHours(18, 0, 0, 0);
  const pollCloseTime = "6:00 PM IST";

  if (now >= close) {
    return { hours: 0, minutes: 0, seconds: 0, isOpen: false, pollCloseTime };
  }

  const open = new Date(now);
  open.setHours(7, 0, 0, 0);
  if (now < open) {
    const diff = open.getTime() - now.getTime();
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    return { hours: h, minutes: m, seconds: s, isOpen: false, pollCloseTime: "7:00 AM IST (opens)" };
  }

  const diff = close.getTime() - now.getTime();
  return {
    hours: Math.floor(diff / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
    isOpen: true,
    pollCloseTime,
  };
}

/* ──── SOS Legal Remedies ──── */

export const SOS_REMEDIES: SOSRemedy[] = [
  {
    id: "sos-missing",
    title: "Name Missing from List",
    icon: "🔍",
    legalRef: "Section 49(2) of the R.P. Act, 1951",
    steps: [
      "Show your EPIC (Voter ID) card to the Presiding Officer.",
      "If your name is missing from the electoral roll, you can cast a 'Tendered Vote' under Section 49(2).",
      "The Presiding Officer will provide Form 49AA — fill it out with your details.",
      "Your vote is recorded on a separate tendered ballot paper (not EVM).",
      "File a formal complaint at the DEO office within 7 days with proof of residence.",
      "Call the ECI Helpline 1950 immediately for live assistance.",
    ],
    helpline: "1950",
  },
  {
    id: "sos-49p",
    title: "Already Voted (Sec 49P)",
    icon: "⚖️",
    legalRef: "Section 49P of the Conduct of Elections Rules, 1961",
    steps: [
      "If someone has already voted using your identity, DO NOT LEAVE the booth.",
      "Immediately inform the Presiding Officer that your vote has been 'personated.'",
      "Demand a 'Challenged Vote' under Rule 49P — you have the legal right.",
      "The Presiding Officer must record a 'challenged vote' on a tendered ballot paper.",
      "Sign a declaration in Form 49AA confirming your identity.",
      "File an FIR at the nearest police station for voter impersonation (IPC Section 171D).",
      "Contact the Returning Officer and ECI Helpline 1950 to escalate the complaint.",
    ],
    helpline: "1950",
  },
  {
    id: "sos-nota",
    title: "NOTA Guide",
    icon: "✋",
    legalRef: "NOTA — Rule 49-O, Supreme Court Judgment (2013)",
    steps: [
      "NOTA (None of the Above) is the last button on the EVM.",
      "It is your constitutional right to reject all candidates if none meet your standards.",
      "Press the NOTA button — you will hear the EVM beep and see the light confirm.",
      "NOTA votes are counted and reported officially in election results.",
      "Even if NOTA wins the highest votes, the candidate with the most votes still wins (as per current law).",
      "Your NOTA vote is completely secret — no one can identify how you voted.",
    ],
    helpline: "1950",
  },
];
