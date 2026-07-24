import { G as ensure_array_like } from "../../../chunks/renderer.js";
import { e as escape_html } from "../../../chunks/escaping.js";
import { k as attr } from "../../../chunks/attributes.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { data } = $$props;
    $$renderer2.push(`<div class="space-y-6"><div class="flex items-center justify-between"><div><h1 class="text-2xl font-bold text-zinc-900">Events CMS Manager</h1> <p class="text-sm text-zinc-500">Manage national camps, workshops, and campus meetups.</p></div> <div class="flex items-center gap-3"><button class="rounded-lg border border-zinc-300 bg-white px-3.5 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50">Export CSV</button> <button class="rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-primary/90">+ Add Event</button></div></div> <div class="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm"><table class="min-w-full divide-y divide-zinc-200"><thead class="bg-zinc-50"><tr><th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Title</th><th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Type</th><th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Date &amp; Location</th><th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Featured</th><th class="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-500">Actions</th></tr></thead><tbody class="divide-y divide-zinc-200 bg-white">`);
    if (data.events.length === 0) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<tr><td colspan="5" class="px-6 py-8 text-center text-sm text-zinc-500">No events found. Click "+ Add Event" to publish an upcoming gathering.</td></tr>`);
    } else {
      $$renderer2.push("<!--[-1-->");
      $$renderer2.push(`<!--[-->`);
      const each_array = ensure_array_like(data.events);
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let event = each_array[$$index];
        $$renderer2.push(`<tr class="hover:bg-zinc-50/50"><td class="px-6 py-4"><div class="font-medium text-zinc-900">${escape_html(event.title)}</div> <div class="text-xs text-zinc-400 line-clamp-1">${escape_html(event.description)}</div></td><td class="px-6 py-4 text-sm text-zinc-600"><span class="inline-flex rounded-md bg-zinc-100 px-2 py-1 text-xs font-semibold text-zinc-700">${escape_html(event.type)}</span></td><td class="px-6 py-4 text-sm text-zinc-600"><div>${escape_html(new Date(event.date).toLocaleDateString())}</div> <div class="text-xs text-zinc-400">${escape_html(event.location)}</div></td><td class="px-6 py-4 text-sm">`);
        if (event.isFeatured) {
          $$renderer2.push("<!--[0-->");
          $$renderer2.push(`<span class="inline-flex rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">Featured</span>`);
        } else {
          $$renderer2.push("<!--[-1-->");
          $$renderer2.push(`<span class="text-xs text-zinc-400">Standard</span>`);
        }
        $$renderer2.push(`<!--]--></td><td class="px-6 py-4 text-right text-sm font-medium"><button class="mr-3 text-brand-primary hover:underline">Edit</button> <form action="?/deleteEvent" method="POST" class="inline"><input type="hidden" name="id"${attr("value", event.id)}/> <button type="submit" class="text-red-600 hover:underline">Delete</button></form></td></tr>`);
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
