import { G as ensure_array_like } from "../../chunks/renderer.js";
import { e as escape_html } from "../../chunks/escaping.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { data } = $$props;
    $$renderer2.push(`<div class="space-y-8"><div><h1 class="text-2xl font-bold text-zinc-900">Dashboard Overview</h1> <p class="text-sm text-zinc-500">Welcome to the PAOZ Trailblazers Staff Management Platform.</p></div> <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"><div class="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm"><div class="text-xs font-semibold uppercase tracking-wider text-zinc-500">Published Sermons</div> <div class="mt-2 text-3xl font-bold text-zinc-900">${escape_html(data.stats.totalSermons)}</div> <a href="/sermons" class="mt-3 inline-block text-xs font-semibold text-brand-primary hover:underline">Manage Sermons →</a></div> <div class="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm"><div class="text-xs font-semibold uppercase tracking-wider text-zinc-500">Scheduled Events</div> <div class="mt-2 text-3xl font-bold text-zinc-900">${escape_html(data.stats.totalEvents)}</div> <a href="/events" class="mt-3 inline-block text-xs font-semibold text-brand-primary hover:underline">Manage Events →</a></div> <div class="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm"><div class="text-xs font-semibold uppercase tracking-wider text-zinc-500">Connect Groups</div> <div class="mt-2 text-3xl font-bold text-zinc-900">${escape_html(data.stats.totalGroups)}</div> <a href="/groups" class="mt-3 inline-block text-xs font-semibold text-brand-primary hover:underline">Manage Groups →</a></div> <div class="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm"><div class="text-xs font-semibold uppercase tracking-wider text-zinc-500">Pending Follow-up Tasks</div> <div class="mt-2 text-3xl font-bold text-amber-600">${escape_html(data.stats.pendingTasks)}</div> <a href="/submissions" class="mt-3 inline-block text-xs font-semibold text-brand-primary hover:underline">View Leads &amp; Tasks →</a></div></div> <div class="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm"><div class="flex items-center justify-between mb-4"><div><h2 class="text-lg font-bold text-zinc-900">Recent Audit Activity</h2> <p class="text-xs text-zinc-500">Real-time system logging adopted from kura architecture.</p></div> <a href="/audit-logs" class="text-xs font-semibold text-brand-primary hover:underline">View All Logs</a></div> `);
    if (data.recentAuditLogs.length === 0) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<p class="text-xs text-zinc-500 py-4 text-center">No activity recorded yet.</p>`);
    } else {
      $$renderer2.push("<!--[-1-->");
      $$renderer2.push(`<div class="divide-y divide-zinc-100"><!--[-->`);
      const each_array = ensure_array_like(data.recentAuditLogs);
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let log = each_array[$$index];
        $$renderer2.push(`<div class="py-3 flex items-center justify-between text-xs"><div class="flex items-center gap-3"><span class="inline-flex rounded-md bg-zinc-100 px-2 py-0.5 font-mono font-semibold text-zinc-700">${escape_html(log.action)}</span> <span class="font-medium text-zinc-800">${escape_html(log.details || log.entityType)}</span></div> <div class="text-zinc-400">${escape_html(log.userName)} • ${escape_html(new Date(log.createdAt).toLocaleTimeString())}</div></div>`);
      }
      $$renderer2.push(`<!--]--></div>`);
    }
    $$renderer2.push(`<!--]--></div></div>`);
  });
}
export {
  _page as default
};
