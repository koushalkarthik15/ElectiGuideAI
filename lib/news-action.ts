"use server";

const NEWSDATA_IO_KEY = process.env.NEWSDATA_IO_KEY || "";

export async function getLiveNewsFromServer() {
  if (!NEWSDATA_IO_KEY) {
    throw new Error("System Configuration Error: NEWSDATA_IO_KEY is missing from environment variables.");
  }
  try {
    const query = encodeURIComponent("Telangana Election OR Election Commission of India");
    const res = await fetch(
      `https://newsdata.io/api/1/news?apikey=${NEWSDATA_IO_KEY}&q=${query}&country=in&language=en`,
      { next: { revalidate: 60 } }
    );
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn("[NEWS SERVER] API failed:", err);
  }
  return null;
}
