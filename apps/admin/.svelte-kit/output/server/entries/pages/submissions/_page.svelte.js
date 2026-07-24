import { G as ensure_array_like, J as attr_class, K as stringify } from "../../../chunks/renderer.js";
import { e as escape_html } from "../../../chunks/escaping.js";
import { k as attr } from "../../../chunks/attributes.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { data } = $$props;
    $$renderer2.push(`<div class="space-y-8"><div><h1 class="text-2xl font-bold text-zinc-900">Visitor &amp; Serve Leads Management</h1> <p class="text-sm text-zinc-500">Track newcomer VIP visit requests, volunteer applications, and staff follow-up tasks.</p></div> <div class="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm"><h2 class="text-lg font-bold text-zinc-900 mb-4">Assigned Follow-up Tasks</h2> `);
    if (data.tasks.length === 0) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<p class="text-sm text-zinc-500 text-center py-4">No pending follow-up tasks.</p>`);
    } else {
      $$renderer2.push("<!--[-1-->");
      $$renderer2.push(`<div class="space-y-3"><!--[-->`);
      const each_array = ensure_array_like(data.tasks);
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let task = each_array[$$index];
        $$renderer2.push(`<div class="flex items-center justify-between p-3 rounded-lg border border-zinc-100 bg-zinc-50/50"><div><div${attr_class(`font-semibold text-sm text-zinc-900 ${stringify(task.isCompleted ? "line-through text-zinc-400" : "")}`)}>${escape_html(task.title)}</div> `);
        if (task.description) {
          $$renderer2.push("<!--[0-->");
          $$renderer2.push(`<div class="text-xs text-zinc-500">${escape_html(task.description)}</div>`);
        } else {
          $$renderer2.push("<!--[-1-->");
        }
        $$renderer2.push(`<!--]--></div> <form action="?/toggleTask" method="POST"><input type="hidden" name="taskId"${attr("value", task.id)}/> <input type="hidden" name="isCompleted"${attr("value", task.isCompleted ? "false" : "true")}/> <button type="submit"${attr_class(`rounded-md px-3 py-1 text-xs font-semibold transition ${stringify(task.isCompleted ? "bg-zinc-200 text-zinc-700" : "bg-emerald-600 text-white hover:bg-emerald-700")}`)}>${escape_html(task.isCompleted ? "Completed ✓" : "Mark Done")}</button></form></div>`);
      }
      $$renderer2.push(`<!--]--></div>`);
    }
    $$renderer2.push(`<!--]--></div> <div class="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm"><h2 class="text-lg font-bold text-zinc-900 mb-4">Recent Inquiries &amp; Contact Submissions</h2> <div class="overflow-hidden rounded-lg border border-zinc-200"><table class="min-w-full divide-y divide-zinc-200"><thead class="bg-zinc-50"><tr><th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Name</th><th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Email</th><th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Message</th><th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Submitted At</th></tr></thead><tbody class="divide-y divide-zinc-200 bg-white">`);
    if (data.inquiries.length === 0) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<tr><td colspan="4" class="px-6 py-8 text-center text-sm text-zinc-500">No contact inquiries received yet.</td></tr>`);
    } else {
      $$renderer2.push("<!--[-1-->");
      $$renderer2.push(`<!--[-->`);
      const each_array_1 = ensure_array_like(data.inquiries);
      for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
        let item = each_array_1[$$index_1];
        $$renderer2.push(`<tr class="hover:bg-zinc-50/50"><td class="px-6 py-4 font-medium text-zinc-900">${escape_html(item.fullName)}</td><td class="px-6 py-4 text-sm text-zinc-600">${escape_html(item.email)}</td><td class="px-6 py-4 text-sm text-zinc-600">${escape_html(item.message)}</td><td class="px-6 py-4 text-sm text-zinc-400">${escape_html(new Date(item.createdAt).toLocaleDateString())}</td></tr>`);
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--></tbody></table></div></div></div>`);
  });
}
export {
  _page as default
};
