import { G as ensure_array_like } from "../../../chunks/renderer.js";
import { e as escape_html } from "../../../chunks/escaping.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { data } = $$props;
    $$renderer2.push(`<div class="space-y-6"><div class="flex items-center justify-between"><div><h1 class="text-2xl font-bold text-zinc-900">Connect Groups &amp; Campus Hubs Manager</h1> <p class="text-sm text-zinc-500">Manage small groups, student hubs, and leader contacts.</p></div></div> <div class="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm"><table class="min-w-full divide-y divide-zinc-200"><thead class="bg-zinc-50"><tr><th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Group Name</th><th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Leader</th><th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Type</th><th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Meeting Schedule</th></tr></thead><tbody class="divide-y divide-zinc-200 bg-white">`);
    if (data.groups.length === 0) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<tr><td colspan="4" class="px-6 py-8 text-center text-sm text-zinc-500">No active connect groups listed yet.</td></tr>`);
    } else {
      $$renderer2.push("<!--[-1-->");
      $$renderer2.push(`<!--[-->`);
      const each_array = ensure_array_like(data.groups);
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let group = each_array[$$index];
        $$renderer2.push(`<tr class="hover:bg-zinc-50/50"><td class="px-6 py-4 font-medium text-zinc-900">${escape_html(group.name)}</td><td class="px-6 py-4 text-sm text-zinc-600">${escape_html(group.leader)}</td><td class="px-6 py-4 text-sm text-zinc-600"><span class="inline-flex rounded-md bg-zinc-100 px-2 py-0.5 text-xs font-semibold text-zinc-700">${escape_html(group.type)}</span></td><td class="px-6 py-4 text-sm text-zinc-600">${escape_html(group.dayTime)}</td></tr>`);
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--></tbody></table></div></div>`);
  });
}
export {
  _page as default
};
