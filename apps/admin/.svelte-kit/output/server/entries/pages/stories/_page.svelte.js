import { G as ensure_array_like } from "../../../chunks/renderer.js";
import { e as escape_html } from "../../../chunks/escaping.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { data } = $$props;
    $$renderer2.push(`<div class="space-y-6"><div class="flex items-center justify-between"><div><h1 class="text-2xl font-bold text-zinc-900">Transformation Stories &amp; Articles Manager</h1> <p class="text-sm text-zinc-500">Draft, edit, and publish life testimonies and blog stories.</p></div></div> <div class="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm"><table class="min-w-full divide-y divide-zinc-200"><thead class="bg-zinc-50"><tr><th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Title</th><th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Category</th><th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Summary</th><th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Created Date</th></tr></thead><tbody class="divide-y divide-zinc-200 bg-white">`);
    if (data.posts.length === 0) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<tr><td colspan="4" class="px-6 py-8 text-center text-sm text-zinc-500">No stories published yet.</td></tr>`);
    } else {
      $$renderer2.push("<!--[-1-->");
      $$renderer2.push(`<!--[-->`);
      const each_array = ensure_array_like(data.posts);
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let post = each_array[$$index];
        $$renderer2.push(`<tr class="hover:bg-zinc-50/50"><td class="px-6 py-4 font-medium text-zinc-900">${escape_html(post.title)}</td><td class="px-6 py-4 text-sm text-zinc-600 font-semibold">${escape_html(post.category || "Story")}</td><td class="px-6 py-4 text-sm text-zinc-600 line-clamp-1">${escape_html(post.summary)}</td><td class="px-6 py-4 text-sm text-zinc-400">${escape_html(new Date(post.createdAt).toLocaleDateString())}</td></tr>`);
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--></tbody></table></div></div>`);
  });
}
export {
  _page as default
};
