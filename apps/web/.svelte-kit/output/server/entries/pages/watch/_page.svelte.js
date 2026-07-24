import { h as head, b as attr_class, e as escape_html, c as clsx, f as ensure_array_like, a as attr, s as stringify } from "../../../chunks/renderer.js";
import { S as Site_shell, c as container, s as sectionY } from "../../../chunks/site-shell.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { data } = $$props;
    head("ihder0", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Watch &amp; Messages — PAOZ Trailblazers</title>`);
      });
      $$renderer3.push(`<meta name="description" content="Watch latest sermons, video messages, and series from PAOZ Trailblazers."/>`);
    });
    Site_shell($$renderer2, {
      settings: data.settings,
      children: ($$renderer3) => {
        $$renderer3.push(`<section class="relative overflow-hidden border-b border-white/10 bg-brand-dark py-16 text-white md:py-24"><div class="absolute inset-0 opacity-30"><img src="/images/sermon1.jpg" alt="Sermons background" class="h-full w-full object-cover"/></div> <div class="absolute inset-0 bg-gradient-to-r from-brand-dark via-brand-dark/95 to-brand-dark/80"></div> <div${attr_class(`${stringify(container)} relative max-w-4xl`)}><p class="text-[11px] font-bold uppercase tracking-[0.22em] text-brand-gold">Watch &amp; Listen</p> <h1 class="mt-4 font-sans text-4xl font-black tracking-tight md:text-6xl">${escape_html(data.featuredSermon?.title || "Transformational Faith & Purpose")}</h1> <p class="mt-4 text-lg text-zinc-300 max-w-2xl">${escape_html(data.featuredSermon?.summary || "Explore powerful messages, practical teachings, and spiritual wisdom designed for young leaders.")}</p> `);
        if (data.featuredSermon?.youtubeId) {
          $$renderer3.push("<!--[0-->");
          $$renderer3.push(`<div class="mt-8"><button class="inline-flex items-center gap-3 rounded-full bg-brand-primary px-8 py-3.5 text-xs font-bold uppercase tracking-[0.14em] text-white shadow-xl transition hover:brightness-110"><svg class="h-5 w-5 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"></path></svg> Watch Featured Message</button></div>`);
        } else {
          $$renderer3.push("<!--[-1-->");
        }
        $$renderer3.push(`<!--]--></div></section> <section${attr_class(`bg-zinc-50 ${stringify(sectionY)}`)}><div${attr_class(clsx(container))}><div class="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4"><div><p class="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-primary">Message Archive</p> <h2 class="mt-2 text-3xl font-black text-zinc-900 tracking-tight">Recent Messages &amp; Teachings</h2></div></div> `);
        if (data.sermons.length === 0) {
          $$renderer3.push("<!--[0-->");
          $$renderer3.push(`<div class="rounded-2xl border border-zinc-200 bg-white p-12 text-center shadow-sm"><p class="text-zinc-500">No video messages available yet. Staff can publish sermons via the Staff Admin CMS.</p></div>`);
        } else {
          $$renderer3.push("<!--[-1-->");
          $$renderer3.push(`<div class="grid gap-8 sm:grid-cols-2 lg:grid-cols-3"><!--[-->`);
          const each_array = ensure_array_like(data.sermons);
          for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
            let sermon = each_array[$$index];
            $$renderer3.push(`<div class="group flex flex-col overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-sm transition hover:shadow-xl hover:-translate-y-1"><div class="relative aspect-video bg-zinc-900 overflow-hidden"><img${attr("src", sermon.thumbnailUrl || "/images/sermon2.jpg")}${attr("alt", sermon.title)} class="h-full w-full object-cover transition duration-500 group-hover:scale-105"/> `);
            if (sermon.youtubeId) {
              $$renderer3.push("<!--[0-->");
              $$renderer3.push(`<button class="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition group-hover:opacity-100" aria-label="Play video"><div class="flex h-14 w-14 items-center justify-center rounded-full bg-brand-primary text-white shadow-lg"><svg class="h-6 w-6 fill-current ml-0.5" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"></path></svg></div></button>`);
            } else {
              $$renderer3.push("<!--[-1-->");
            }
            $$renderer3.push(`<!--]--></div> <div class="flex flex-1 flex-col p-6"><p class="text-xs font-semibold text-brand-primary">${escape_html(sermon.speaker)}</p> <h3 class="mt-2 text-xl font-bold text-zinc-900 leading-snug">${escape_html(sermon.title)}</h3> `);
            if (sermon.scripture) {
              $$renderer3.push("<!--[0-->");
              $$renderer3.push(`<p class="mt-1 text-xs text-zinc-500 font-medium">${escape_html(sermon.scripture)}</p>`);
            } else {
              $$renderer3.push("<!--[-1-->");
            }
            $$renderer3.push(`<!--]--> `);
            if (sermon.summary) {
              $$renderer3.push("<!--[0-->");
              $$renderer3.push(`<p class="mt-3 text-sm text-zinc-600 line-clamp-2">${escape_html(sermon.summary)}</p>`);
            } else {
              $$renderer3.push("<!--[-1-->");
            }
            $$renderer3.push(`<!--]--> <div class="mt-auto pt-6">`);
            if (sermon.youtubeId) {
              $$renderer3.push("<!--[0-->");
              $$renderer3.push(`<button class="text-xs font-bold uppercase tracking-wider text-brand-primary hover:underline">Watch Message →</button>`);
            } else {
              $$renderer3.push("<!--[-1-->");
            }
            $$renderer3.push(`<!--]--></div></div></div>`);
          }
          $$renderer3.push(`<!--]--></div>`);
        }
        $$renderer3.push(`<!--]--></div></section> `);
        {
          $$renderer3.push("<!--[-1-->");
        }
        $$renderer3.push(`<!--]-->`);
      }
    });
  });
}
export {
  _page as default
};
