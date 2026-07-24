import { s as services } from "../../../chunks/services.js";
const NO_EVENTS = [];
const load = async ({ url }) => {
  const search = url.searchParams.get("q") || "";
  const type = url.searchParams.get("type") || "ALL";
  const sort = url.searchParams.get("sort") || "date_asc";
  const page = Number(url.searchParams.get("page")) || 1;
  const limit = 9;
  const view = url.searchParams.get("view") === "calendar" ? "calendar" : "list";
  const now = /* @__PURE__ */ new Date();
  const y = Number(url.searchParams.get("y")) || now.getFullYear();
  const m = Number(url.searchParams.get("m")) || now.getMonth() + 1;
  const calYear = Number.isFinite(y) && y >= 2e3 && y <= 2100 ? y : now.getFullYear();
  const calMonth = Number.isFinite(m) && m >= 1 && m <= 12 ? m : now.getMonth() + 1;
  const settings = await services.settings.getBundle();
  if (view === "calendar") {
    const [calendarEvents, featuredEvent] = await Promise.all([
      services.events.listInMonth(calYear, calMonth),
      services.events.getFeaturedOrFallback()
    ]);
    return {
      settings,
      view: "calendar",
      calYear,
      calMonth,
      calendarEvents,
      featuredEvent,
      events: [],
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalEvents: calendarEvents.length
      },
      filters: { search: "", type: "ALL", sort: "date_asc" }
    };
  }
  const listing = await services.events.listListing({
    search,
    type,
    sort,
    page,
    limit
  });
  return {
    ...listing,
    settings,
    view: "list",
    calYear,
    calMonth,
    calendarEvents: NO_EVENTS
  };
};
export {
  load
};
