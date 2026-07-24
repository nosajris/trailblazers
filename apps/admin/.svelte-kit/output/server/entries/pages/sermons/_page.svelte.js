import { G as ensure_array_like } from "../../../chunks/renderer.js";
import { e as escape_html } from "../../../chunks/escaping.js";
import { k as attr } from "../../../chunks/attributes.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { data } = $$props;
    $$renderer2.push(`<div class="space-y-6"><div class="flex items-center justify-between"><div><h1 class="text-2xl font-bold text-zinc-900">Sermons &amp; Media CMS Manager</h1> <p class="text-sm text-zinc-500">Manage video messages, live stream status, and downloadable study guides.</p></div> <button class="rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-primary/90">+ Add Sermon</button></div> <div class="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm"><table class="min-w-full divide-y divide-zinc-200"><thead class="bg-zinc-50"><tr><th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Title</th><th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Speaker</th><th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Scripture</th><th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Status</th><th class="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-500">Actions</th></tr></thead><tbody class="divide-y divide-zinc-200 bg-white">`);
    if (data.sermons.length === 0) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<tr><td colspan="5" class="px-6 py-8 text-center text-sm text-zinc-500">No sermons added yet. Click "+ Add Sermon" to create your first message.</td></tr>`);
    } else {
      $$renderer2.push("<!--[-1-->");
      $$renderer2.push(`<!--[-->`);
      const each_array = ensure_array_like(data.sermons);
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let sermon = each_array[$$index];
        $$renderer2.push(`<tr class="hover:bg-zinc-50/50"><td class="px-6 py-4"><div class="font-medium text-zinc-900">${escape_html(sermon.title)}</div> <div class="text-xs text-zinc-400">${escape_html(sermon.slug)}</div></td><td class="px-6 py-4 text-sm text-zinc-600">${escape_html(sermon.speaker)}</td><td class="px-6 py-4 text-sm text-zinc-600">${escape_html(sermon.scripture || "—")}</td><td class="px-6 py-4 text-sm">`);
        if (sermon.isLiveNow) {
          $$renderer2.push("<!--[0-->");
          $$renderer2.push(`<span class="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-bold text-red-700 animate-pulse">● LIVE NOW</span>`);
        } else if (sermon.isFeatured) {
          $$renderer2.push("<!--[1-->");
          $$renderer2.push(`<span class="inline-flex rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">Featured</span>`);
        } else {
          $$renderer2.push("<!--[-1-->");
          $$renderer2.push(`<span class="text-xs text-zinc-400">Standard</span>`);
        }
        $$renderer2.push(`<!--]--></td><td class="px-6 py-4 text-right text-sm font-medium"><button class="mr-3 text-brand-primary hover:underline">Edit</button> <form action="?/deleteSermon" method="POST" class="inline"><input type="hidden" name="id"${attr("value", sermon.id)}/> <button type="submit" class="text-red-600 hover:underline">Delete</button></form></td></tr>`);
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--></tbody></table></div></div> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]-->`);
  });
}
export {
  _page as default
};
