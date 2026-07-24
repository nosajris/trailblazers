import { s as services } from "../../../chunks/services.js";
const load = async () => {
  const posts = await services.blog.listPublished();
  return { posts };
};
export {
  load
};
