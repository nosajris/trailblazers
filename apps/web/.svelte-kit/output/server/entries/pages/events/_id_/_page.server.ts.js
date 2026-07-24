import { s as services } from "../../../../chunks/services.js";
import { error } from "@sveltejs/kit";
const load = async ({ params }) => {
  const eventId = Number(params.id);
  if (Number.isNaN(eventId)) {
    throw error(404, "Invalid event ID");
  }
  const [event, settings] = await Promise.all([
    services.events.getById(eventId),
    services.settings.getBundle()
  ]);
  if (!event) {
    throw error(404, "Event not found");
  }
  return {
    event,
    settings
  };
};
export {
  load
};
