import ical from "node-ical";

export async function handler() {
  try {
    const ICS_URL = process.env.SCHOOL_ICS; // set in Netlify dashboard
    const data = await ical.async.fromURL(ICS_URL);
    const now = new Date();

    const events = Object.values(data)
      .filter(
        (e) => e.type === "VEVENT" && e.start instanceof Date && e.start > now
      )
      .sort((a, b) => a.start - b.start)
      .slice(0, 3)
      .map((e) => ({
        title: e.summary || "",
        start: e.start,
        end: e.end || null,
        location: e.location || "",
      }));

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=900",
        "Access-Control-Allow-Origin": "*", // or lock to your GH-Pages domain
      },
      body: JSON.stringify({ events }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ events: [], error: "failed" }),
    };
  }
}
