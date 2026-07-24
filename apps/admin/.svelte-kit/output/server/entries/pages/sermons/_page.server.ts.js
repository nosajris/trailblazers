import { fail } from "@sveltejs/kit";
import { s as services } from "../../../chunks/services.js";
const load = async () => {
  const [sermonsList, seriesList] = await Promise.all([
    services.sermons.getAllSermons(),
    services.sermons.getAllSeries()
  ]);
  return { sermons: sermonsList, series: seriesList };
};
const actions = {
  saveSermon: async ({ request, locals }) => {
    const form = await request.formData();
    const id = form.get("id") ? Number(form.get("id")) : void 0;
    const title = form.get("title")?.toString().trim();
    const speaker = form.get("speaker")?.toString().trim() || "Pastor / Speaker";
    const videoUrl = form.get("videoUrl")?.toString().trim();
    const youtubeId = form.get("youtubeId")?.toString().trim();
    const audioUrl = form.get("audioUrl")?.toString().trim();
    const scripture = form.get("scripture")?.toString().trim();
    const summary = form.get("summary")?.toString().trim();
    const notes = form.get("notes")?.toString().trim();
    const discussionGuide = form.get("discussionGuide")?.toString().trim();
    const notesUrl = form.get("notesUrl")?.toString().trim();
    const isFeatured = form.get("isFeatured") === "on" || form.get("isFeatured") === "true";
    const isLiveNow = form.get("isLiveNow") === "on" || form.get("isLiveNow") === "true";
    if (!title) {
      return fail(400, { error: "Sermon title is required" });
    }
    const saved = await services.sermons.saveSermon({
      id,
      title,
      speaker,
      videoUrl,
      youtubeId,
      audioUrl,
      scripture,
      summary,
      notes,
      discussionGuide,
      notesUrl,
      isFeatured,
      isLiveNow
    });
    await services.auditLogs.logAction(
      id ? "UPDATE_SERMON" : "CREATE_SERMON",
      "SERMON",
      String(saved.id),
      `Saved sermon: ${saved.title}`,
      locals.user?.id,
      locals.user?.fullName
    );
    return { success: true };
  },
  deleteSermon: async ({ request, locals }) => {
    const form = await request.formData();
    const id = Number(form.get("id"));
    if (id) {
      await services.sermons.deleteSermon(id);
      await services.auditLogs.logAction("DELETE_SERMON", "SERMON", String(id), `Deleted sermon ID: ${id}`, locals.user?.id, locals.user?.fullName);
    }
    return { success: true };
  }
};
export {
  actions,
  load
};
