import { s as services } from "../../../../chunks/services.js";
import { error } from "@sveltejs/kit";
const load = async ({ params }) => {
  const id = Number(params.id);
  if (Number.isNaN(id)) throw error(404, "Not found");
  const [post, settings] = await Promise.all([
    services.blog.getPublishedPost(id),
    services.settings.getBundle()
  ]);
  if (!post) throw error(404, "Not found");
  return { post, settings };
};
export {
  load
};
