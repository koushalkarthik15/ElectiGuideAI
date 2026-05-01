/* ════════════════════════════════════════════════════════════
   ElectiGuide AI — News Ticker Service (Fig Mint Edition)
   Real-time Telangana election headlines
   ════════════════════════════════════════════════════════════ */

export interface SecurityTickerItem {
  id: string;
  headline: string;
  severity: "secure" | "info" | "warning" | "critical";
  timestamp: string;
  source: string;
  url?: string;
}

import { getLiveNewsFromServer } from "./news-action";

/* ──── Config ──── */

const NEWS_CACHE_KEY = "electiguide-news-cache";
const NEWS_CACHE_TTL = 15 * 60 * 1000;

function sanitizeHtml(str: string): string {
  return str.replace(/[&<>"']/g, (match) => {
    const escape: Record<string, string> = {
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    };
    return escape[match] || match;
  });
}

/* ──── Severity Classification ──── */

const CRITICAL_KEYWORDS = ["violence", "riot", "death", "bomb", "attack", "emergency", "curfew"];
const WARNING_KEYWORDS = ["delay", "malfunction", "evm", "complaint", "protest", "dispute", "irregularity", "recount"];
const INFO_KEYWORDS = ["turnout", "deploy", "security", "commission", "schedule", "update", "preparation", "leads", "counting"];

function classifySeverity(headline: string): SecurityTickerItem["severity"] {
  const lower = headline.toLowerCase();
  if (CRITICAL_KEYWORDS.some((kw) => lower.includes(kw))) return "critical";
  if (WARNING_KEYWORDS.some((kw) => lower.includes(kw))) return "warning";
  if (INFO_KEYWORDS.some((kw) => lower.includes(kw))) return "info";
  return "secure";
}

/* ──── Cache Helpers ──── */

interface CachedNews { items: SecurityTickerItem[]; cachedAt: number; }

function getCachedNews(): SecurityTickerItem[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(NEWS_CACHE_KEY);
    if (!raw) return null;
    const cached = JSON.parse(raw) as CachedNews;
    if (Date.now() - cached.cachedAt < NEWS_CACHE_TTL && cached.items[0]?.id !== "tel-1") return cached.items;
    return null;
  } catch { return null; }
}

function setCachedNews(items: SecurityTickerItem[]) {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(NEWS_CACHE_KEY, JSON.stringify({ items, cachedAt: Date.now() })); }
  catch { /* quota */ }
}

/* ──── Live News Fetch ──── */

export async function fetchElectionNews(): Promise<{ items: SecurityTickerItem[]; isLive: boolean; lastUpdated: string }> {
  const cached = getCachedNews();
  if (cached) return { items: cached, isLive: true, lastUpdated: new Date().toISOString() };

  try {
    const data = await getLiveNewsFromServer();
    if (data) {
      const items: SecurityTickerItem[] = (data.results || []).slice(0, 8).map((article: any, i: number) => ({
        id: `news-live-${i}`,
        headline: sanitizeHtml(article.title?.replace(/ - .*$/, "") || "Election Update"),
        severity: classifySeverity(article.title || ""),
        timestamp: article.pubDate || new Date().toISOString(),
        source: article.source_id || "News Service",
        url: article.link,
      }));
      setCachedNews(items);
      return { items, isLive: true, lastUpdated: new Date().toISOString() };
    }
    console.warn("[NEWS] Invalid API response format from news server action.");
  } catch (err) {
    console.warn("[NEWS] API failed or disabled, falling back to simulated data.", err);
  }

  const simulated = getTelanganaElectionNews();
  return { items: simulated, isLive: false, lastUpdated: new Date().toISOString() };
}

/* ──── Simulated Telangana Election News — User-specified headlines ──── */

function getTelanganaElectionNews(): SecurityTickerItem[] {
  const now = Date.now();
  return [
    {
      id: "tel-1",
      headline: "Telangana Local Election Results: INC leads with 1537 seats, BRS at 781, BJP at 260",
      severity: "info",
      timestamp: new Date(now).toISOString(),
      source: "Telangana SEC",
    },
    {
      id: "tel-2",
      headline: "Counting Day officially set for May 4, 2026",
      severity: "info",
      timestamp: new Date(now - 15 * 60000).toISOString(),
      source: "Election Commission of India",
    },
    {
      id: "tel-3",
      headline: "Hyderabad — All 2,756 polling booths report peaceful voting operations",
      severity: "secure",
      timestamp: new Date(now - 30 * 60000).toISOString(),
      source: "Telangana SEC",
    },
    {
      id: "tel-4",
      headline: "EC deploys 15,000 CAPF personnel across Greater Hyderabad for security",
      severity: "info",
      timestamp: new Date(now - 50 * 60000).toISOString(),
      source: "Election Commission",
    },
    {
      id: "tel-5",
      headline: "Heatwave advisory: IMD warns of 40°C peak — voters advised to carry water",
      severity: "warning",
      timestamp: new Date(now - 75 * 60000).toISOString(),
      source: "India Meteorological Department",
    },
    {
      id: "tel-6",
      headline: "Webcasting enabled at 100% polling stations for real-time monitoring",
      severity: "secure",
      timestamp: new Date(now - 100 * 60000).toISOString(),
      source: "ECI Tech Division",
    },
    {
      id: "tel-7",
      headline: "Special transport arranged for voters with disabilities at 180 booths",
      severity: "info",
      timestamp: new Date(now - 130 * 60000).toISOString(),
      source: "DEO Office",
    },
    {
      id: "tel-8",
      headline: "Chief Electoral Officer confirms smooth conduct — no major incidents reported",
      severity: "secure",
      timestamp: new Date(now - 160 * 60000).toISOString(),
      source: "CEO Telangana",
    },
  ];
}

/* ──── Severity Utils ──── */

export function getOverallTickerSeverity(items: SecurityTickerItem[]): SecurityTickerItem["severity"] {
  if (items.some((a) => a.severity === "critical")) return "critical";
  if (items.some((a) => a.severity === "warning")) return "warning";
  if (items.some((a) => a.severity === "info")) return "info";
  return "secure";
}

export function getLastUpdatedLabel(isoString: string): string {
  try {
    return new Date(isoString).toLocaleTimeString("en-IN", {
      hour: "2-digit", minute: "2-digit", second: "2-digit",
    });
  } catch { return "Unknown"; }
}
