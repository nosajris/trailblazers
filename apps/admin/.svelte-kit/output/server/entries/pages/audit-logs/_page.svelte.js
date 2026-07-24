import { G as ensure_array_like } from "../../../chunks/renderer.js";
import { e as escape_html } from "../../../chunks/escaping.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { data } = $$props;
    $$renderer2.push(`<div class="space-y-6"><div><h1 class="text-2xl font-bold text-zinc-900">System Audit Activity Log</h1> <p class="text-sm text-zinc-500">System audit trailing log adopted from kura architecture tracking staff operations.</p></div> <div class="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm"><table class="min-w-full divide-y divide-zinc-200"><thead class="bg-zinc-50"><tr><th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Timestamp</th><th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">User / Staff</th><th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Action</th><th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Entity</th><th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Details</th></tr></thead><tbody class="divide-y divide-zinc-200 bg-white">`);
    if (data.auditLogs.length === 0) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<tr><td colspan="5" class="px-6 py-8 text-center text-sm text-zinc-500">No activity recorded yet.</td></tr>`);
    } else {
      $$renderer2.push("<!--[-1-->");
      $$renderer2.push(`<!--[-->`);
      const each_array = ensure_array_like(data.auditLogs);
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let log = each_array[$$index];
        $$renderer2.push(`<tr class="hover:bg-zinc-50/50 text-sm"><td class="px-6 py-4 text-zinc-400 font-mono text-xs">${escape_html(new Date(log.createdAt).toLocaleString())}</td><td class="px-6 py-4 font-semibold text-zinc-900">${escape_html(log.userName)}</td><td class="px-6 py-4"><span class="inline-flex rounded-md bg-zinc-100 px-2 py-0.5 font-mono text-xs font-semibold text-zinc-700">${escape_html(log.action)}</span></td><td class="px-6 py-4 text-zinc-600 font-mono text-xs">${escape_html(log.entityType)}</td><td class="px-6 py-4 text-zinc-600">${escape_html(log.details || "—")}</td></tr>`);
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--></tbody></table></div></div>`);
  });
}
export {
  _page as default
};
