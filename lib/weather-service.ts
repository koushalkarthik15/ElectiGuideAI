/* ════════════════════════════════════════════════════════════
   ElectiGuide AI — Weather Service (Fig Mint Edition)
   Hyderabad — April 30, 2026: 31°C Partly Cloudy, Peak 40°C
   Golden Hour: 07:00 AM – 08:30 AM (May 1) before UV 11
   ════════════════════════════════════════════════════════════ */

export interface LiveWeatherData {
  temp: number;
  feelsLike: number;
  humidity: number;
  description: string;
  icon: string;
  windSpeed: number;
  uvIndex: number;
  peakTemp: number;
  city: string;
  isSafe: boolean;
  cachedAt: number;
  isLive: boolean;
  sunrise: string;
  sunset: string;
}

export interface GoldenHourRecommendation {
  startTime: string;
  endTime: string;
  date: string;
  temp: number;
  uvIndex: number;
  peakUV: number;
  crowdLevel: "low" | "medium" | "high";
  recommendation: string;
  heatAdvisory: string | null;
}

/* ──── Config ──── */

const WEATHER_CACHE_KEY = "electiguide-weather-live";
const CACHE_TTL_MS = 10 * 60 * 1000;
import { getLiveWeatherFromServer } from "./weather-action";
/* ──── Weather Emoji Mapping ──── */

function getWeatherEmoji(iconCode: string): string {
  const map: Record<string, string> = {
    "01d": "☀️", "01n": "🌙", "02d": "⛅", "02n": "☁️",
    "03d": "☁️", "03n": "☁️", "04d": "☁️", "04n": "☁️",
    "09d": "🌧️", "09n": "🌧️", "10d": "🌦️", "10n": "🌧️",
    "11d": "⛈️", "11n": "⛈️", "13d": "❄️", "13n": "❄️",
    "50d": "🌫️", "50n": "🌫️",
    "clear-day": "☀️", "clear-night": "🌙",
    "partly-cloudy-day": "⛅", "partly-cloudy-night": "☁️",
    "cloudy": "☁️", "rain": "🌧️", "snow": "❄️", "fog": "🌫️",
    "wind": "💨", "thunder-rain": "⛈️", "thunder-showers-day": "🌦️",
  };
  return map[iconCode] || "🌤️";
}

/* ──── Cache Helpers ──── */

function getCachedWeather(): LiveWeatherData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(WEATHER_CACHE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as LiveWeatherData;
    if (Date.now() - data.cachedAt < CACHE_TTL_MS && data.isLive) return data;
    return null;
  } catch { return null; }
}

function setCachedWeather(data: LiveWeatherData) {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(WEATHER_CACHE_KEY, JSON.stringify(data)); }
  catch { /* quota exceeded */ }
}

/* ──── Live API Fetch ──── */

export async function fetchLiveWeather(): Promise<LiveWeatherData> {
  const cached = getCachedWeather();
  if (cached) return cached;

  try {
    const w = await getLiveWeatherFromServer();
    if (w && w.currentConditions) {
      const current = w.currentConditions;
      const today = w.days?.[0] || {};
      const data: LiveWeatherData = {
        temp: Math.round(current.temp),
        feelsLike: Math.round(current.feelslike),
        humidity: current.humidity,
        description: current.conditions || "Partly Cloudy",
        icon: getWeatherEmoji(current.icon || "partly-cloudy-day"),
        windSpeed: Math.round(current.windspeed || 0),
        uvIndex: current.uvindex || estimateUV(),
        peakTemp: Math.round(today.tempmax || current.temp + 5),
        city: "Hyderabad",
        isSafe: current.temp < 45,
        cachedAt: Date.now(),
        isLive: true,
        sunrise: current.sunrise || "06:00:00",
        sunset: current.sunset || "18:30:00",
      };
      setCachedWeather(data);
      return data;
    }
    console.warn("[WEATHER] Invalid API response format from weather server action.");
  } catch (err) {
    console.warn("[WEATHER] API failed or disabled, falling back to simulated data.", err);
  }

  return getHyderabadApril30Weather();
}

/* ──── UV Index Estimation ──── */

function estimateUV(): number {
  const hour = new Date().getHours();
  if (hour < 7 || hour > 18) return 0;
  if (hour < 9) return 4;
  if (hour < 11) return 8;
  if (hour < 14) return 11; // Extreme UV at peak
  if (hour < 16) return 9;
  return 5;
}

/* ──── Hyderabad April 30, 2026 — Hardcoded Realistic Data ──── */

function getHyderabadApril30Weather(): LiveWeatherData {
  const hour = new Date().getHours();

  // Diurnal temperature curve for Hyderabad April 30
  let temp = 31; // Default: current 31°C
  if (hour < 6) temp = 26;
  else if (hour < 8) temp = 28;
  else if (hour < 10) temp = 31;
  else if (hour < 12) temp = 35;
  else if (hour < 14) temp = 38;
  else if (hour < 15) temp = 40; // Peak at 2-3 PM
  else if (hour < 17) temp = 37;
  else if (hour < 19) temp = 33;
  else if (hour < 21) temp = 30;
  else temp = 28;

  const data: LiveWeatherData = {
    temp,
    feelsLike: temp + 3,
    humidity: 42,
    description: "Partly Cloudy",
    icon: hour >= 6 && hour <= 18 ? "⛅" : "🌙",
    windSpeed: 14,
    uvIndex: estimateUV(),
    peakTemp: 40,
    city: "Hyderabad",
    isSafe: temp < 45,
    cachedAt: Date.now(),
    isLive: false,
    sunrise: "05:52 AM",
    sunset: "06:31 PM",
  };

  setCachedWeather(data);
  return data;
}

/* ──── Golden Hour Algorithm — May 1 Before UV 11 ──── */

export function calculateGoldenHourLive(weather: LiveWeatherData): GoldenHourRecommendation {
  const temp = weather.temp;
  const peakTemp = weather.peakTemp;

  // Heat advisory based on peak and current
  let heatAdvisory: string | null = null;
  if (temp > 35) {
    heatAdvisory = `⚠️ EXTREME HEAT ALERT — Current ${temp}°C. Vote during 07:00 AM – 08:30 AM.`;
  } else if (peakTemp >= 40) {
    heatAdvisory = `⚠️ HEATWAVE ALERT — Peak ${peakTemp}°C expected. Carry 1L water, wear cotton, avoid 11 AM–3 PM sun exposure.`;
  } else if (temp >= 38) {
    heatAdvisory = "☀️ High temperature — stay hydrated, avoid prolonged sun exposure.";
  }

  // Golden hour: always recommend 7:00–8:30 AM tomorrow (May 1) 
  // before UV index hits 11 (Extreme) around 11 AM
  return {
    startTime: "07:00 AM",
    endTime: "08:30 AM",
    date: "May 1, 2026",
    temp: 28, // Expected morning temp
    uvIndex: 4,
    peakUV: 11,
    crowdLevel: "low",
    recommendation: "Vote before the UV index hits 11 (Extreme) by 11 AM. Morning temperatures around 28°C are comfortable.",
    heatAdvisory,
  };
}

/* ──── UV Index Label ──── */

export function getUVLabel(uv: number): { label: string; color: string } {
  if (uv <= 2) return { label: "Low", color: "text-green-600" };
  if (uv <= 5) return { label: "Moderate", color: "text-amber-600" };
  if (uv <= 7) return { label: "High", color: "text-orange-600" };
  if (uv <= 10) return { label: "Very High", color: "text-fig-red" };
  return { label: "Extreme", color: "text-purple-700" };
}
