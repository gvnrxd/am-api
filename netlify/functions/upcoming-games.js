// CommonJS version (works out of the box on Netlify)
const ical = require("node-ical");

exports.handler = async () => {
  try {
    const ICS_URL = process.env.SCHOOL_ICS;
    if (!ICS_URL) {
      throw new Error("Missing SCHOOL_ICS env var");
    }

    const data = await ical.async.fromURL(ICS_URL);
    const now = new Date();

    const events = Object.values(data)
      .filter(
        (e) =>
          e && e.type === "VEVENT" && e.start instanceof Date && e.start > now
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
        // lock to your GH Pages origin if you want:
        // "Access-Control-Allow-Origin": "https://<your-gh-username>.github.io"
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ events }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        events: [],
        error: String(err?.message || "failed"),
      }),
    };
  }
};
