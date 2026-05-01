"use server";

const VISUAL_CROSSING_KEY = process.env.VISUAL_CROSSING_KEY || "";
const HYDERABAD_LAT = 17.385;
const HYDERABAD_LON = 78.4867;

export async function getLiveWeatherFromServer() {
  if (!VISUAL_CROSSING_KEY) {
    throw new Error("System Configuration Error: VISUAL_CROSSING_KEY is missing from environment variables.");
  }
  try {
    const weatherRes = await fetch(
      `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${HYDERABAD_LAT},${HYDERABAD_LON}?unitGroup=metric&key=${VISUAL_CROSSING_KEY}&contentType=json`,
      { next: { revalidate: 60 } }
    );
    if (weatherRes.ok) {
      return await weatherRes.json();
    }
  } catch (err) {
    console.warn("[WEATHER SERVER] API failed:", err);
  }
  return null;
}
