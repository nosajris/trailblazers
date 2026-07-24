import { a as attr, e as escape_html } from "../../../../chunks/renderer.js";
import { S as Site_shell } from "../../../../chunks/site-shell.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { data } = $$props;
    let { event } = data;
    const formatDate = (date) => {
      return new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit"
      }).format(new Date(date));
    };
    const formatPrice = (cents) => {
      if (cents === 0) return "Free";
      return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
    };
    Site_shell($$renderer2, {
      settings: data.settings,
      children: ($$renderer3) => {
        $$renderer3.push(`<div class="min-h-screen bg-brand-light pb-24"><div class="relative h-[50vh] w-full bg-brand-dark"><img${attr("src", event.imageUrl || "/images/wallpaper04.jpg")}${attr("alt", event.title)} class="h-full w-full object-cover opacity-70"/> <div class="absolute inset-0 bg-gradient-to-t from-brand-light to-transparent"></div> <div class="container absolute bottom-0 left-0 w-full max-w-5xl p-6 md:p-12 mx-auto"><span class="mb-4 inline-block rounded-full bg-brand-primary px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">${escape_html(event.type)}</span> <h1 class="mb-2 font-serif text-4xl font-bold text-brand-dark md:text-6xl">${escape_html(event.title)}</h1></div></div> <div class="container relative z-10 mx-auto -mt-8 max-w-5xl px-6"><div class="grid gap-8 md:grid-cols-3"><div class="space-y-8 md:col-span-2"><div class="rounded-lg bg-white p-8 shadow-sm"><h2 class="mb-4 font-serif text-2xl font-bold">About This Event</h2> <p class="whitespace-pre-line text-lg leading-relaxed text-gray-700">${escape_html(event.description)}</p></div></div> <div class="space-y-6"><div class="rounded-lg border-t-4 border-brand-primary bg-white p-6 shadow-lg"><h3 class="mb-6 text-xl font-bold">Event Details</h3> <div class="space-y-4"><div class="flex items-start gap-3"><div class="rounded bg-brand-light p-2 text-brand-primary"><svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg></div> <div><p class="text-xs font-bold uppercase text-gray-500">Date &amp; Time</p> <p class="font-medium">${escape_html(formatDate(event.date))}</p></div></div> <div class="flex items-start gap-3"><div class="rounded bg-brand-light p-2 text-brand-primary"><svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg></div> <div><p class="text-xs font-bold uppercase text-gray-500">Location</p> <p class="font-medium">${escape_html(event.location)}</p></div></div> <div class="flex items-start gap-3"><div class="rounded bg-brand-light p-2 text-brand-primary"><svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg></div> <div><p class="text-xs font-bold uppercase text-gray-500">Cost</p> <p class="font-medium">${escape_html(formatPrice(event.price || 0))}</p></div></div></div> <div class="mt-8 space-y-3"><a class="btn btn-primary flex w-full items-center justify-center py-3 text-center" href="/contact">Register / inquire</a> <a class="block text-center text-sm font-semibold text-brand-primary underline-offset-2 hover:underline"${attr("href", `/events/${event.id}/ics`)} download="">Download calendar (.ics)</a> `);
        if (event.capacity) {
          $$renderer3.push("<!--[0-->");
          $$renderer3.push(`<p class="text-center text-xs text-gray-500">${escape_html(event.capacity - (event.registeredCount || 0))} spots remaining</p>`);
        } else {
          $$renderer3.push("<!--[-1-->");
        }
        $$renderer3.push(`<!--]--></div></div></div></div></div></div>`);
      }
    });
  });
}
export {
  _page as default
};
