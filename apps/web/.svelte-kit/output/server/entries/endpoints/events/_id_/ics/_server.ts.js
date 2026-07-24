import { s as services } from "../../../../../chunks/services.js";
import { error } from "@sveltejs/kit";
function esc(s) {
  return s.replace(/\\/g, "\\\\").replace(/\r?\n/g, "\\n").replace(/;/g, "\\;").replace(/,/g, "\\,");
}
function fmtUtc(d) {
  return d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}
function buildGoogleCalendarIcs(input) {
  const end = new Date(input.start.getTime() + 2 * 60 * 60 * 1e3);
  let host = "trailblazers";
  try {
    host = new URL(input.siteUrl).hostname || host;
  } catch {
  }
  const uid = `event-${input.id}@${host}`;
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Trailblazers//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${fmtUtc(/* @__PURE__ */ new Date())}`,
    `DTSTART:${fmtUtc(input.start)}`,
    `DTEND:${fmtUtc(end)}`,
    `SUMMARY:${esc(input.title)}`,
    `DESCRIPTION:${esc(input.description)}`,
    `LOCATION:${esc(input.location)}`,
    `URL:${esc(`${input.siteUrl.replace(/\/$/, "")}/events/${input.id}`)}`,
    "END:VEVENT",
    "END:VCALENDAR"
  ];
  return lines.join("\r\n");
}
const GET = async ({ params, url }) => {
  const eventId = Number(params.id);
  if (Number.isNaN(eventId)) throw error(400, "Invalid id");
  const event = await services.events.getById(eventId);
  if (!event) throw error(404, "Not found");
  const ics = buildGoogleCalendarIcs({
    id: event.id,
    title: event.title,
    description: event.description,
    location: event.location,
    start: new Date(event.date),
    siteUrl: url.origin
  });
  return new Response(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="trailblazers-event-${event.id}.ics"`
    }
  });
};
export {
  GET
};
