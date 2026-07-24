import { ae as ssr_context, b as attr_class, a as attr, f as ensure_array_like, e as escape_html, d as derived, s as stringify } from "./renderer.js";
import "clsx";
function onDestroy(fn) {
  /** @type {SSRContext} */
  ssr_context.r.on_destroy(fn);
}
const container = "mx-auto w-full max-w-[min(100%,88rem)] px-4 sm:px-6 md:px-10 lg:px-12 xl:px-16";
const sectionY = "py-16 md:py-[4.5rem] lg:py-24";
const headline = "font-sans text-[1.75rem] font-bold leading-[1.15] tracking-tight text-brand-dark sm:text-3xl md:text-4xl lg:text-[2.75rem]";
const eyebrow = "text-[11px] font-bold uppercase tracking-[0.22em] text-brand-primary";
const eyebrowGoldOnDark = "text-[11px] font-bold uppercase tracking-[0.22em] text-brand-gold";
const railRow = "flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 [-ms-overflow-style:none] [scrollbar-width:none] md:grid md:grid-cols-2 md:gap-8 md:overflow-visible md:pb-0 lg:grid-cols-3 lg:gap-10 [&::-webkit-scrollbar]:hidden";
const railItem = "min-w-[min(22rem,calc(100vw-2.5rem))] shrink-0 snap-start md:min-w-0 md:snap-none";
function Navbar($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    function isMegaNavItem(item) {
      return "columns" in item && Array.isArray(item.columns) && item.columns.length > 0;
    }
    let {
      navItems,
      extras,
      cta = { label: "Plan a visit", href: "/plan-a-visit" }
    } = $$props;
    let menuOpen = false;
    let openMega = null;
    const givingHref = derived(() => extras.givingUrl?.trim() ? extras.givingUrl : "/give");
    const watchHref = derived(() => extras.watchUrl?.trim() ? extras.watchUrl : "/watch");
    const messagesHref = derived(() => extras.messagesUrl?.trim() ? extras.messagesUrl : "/watch#messages");
    onDestroy(() => {
      document.body.style.overflow = "";
    });
    $$renderer2.push(`<div class="sticky top-0 z-50 border-b border-zinc-200/60 bg-white/80 shadow-[0_8px_32px_0_rgba(23,22,22,0.06)] backdrop-blur-xl"><div class="hidden border-b border-white/10 bg-[#171616]/95 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/90 backdrop-blur-md lg:block"><div${attr_class(`${stringify(container)} flex flex-wrap items-center justify-end gap-x-6 gap-y-2 py-2`)}><a class="transition hover:text-brand-gold"${attr("href", watchHref())}>Watch</a> <a class="transition hover:text-brand-gold"${attr("href", messagesHref())}>Messages</a> <a class="transition hover:text-brand-gold"${attr("href", givingHref())}>Give</a> `);
    if (extras.campuses && extras.campuses.length > 1) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<label class="inline-flex items-center gap-2 text-white/80"><span class="sr-only">Campus</span> <select class="max-w-[10rem] cursor-pointer rounded-md border border-white/20 bg-white/10 px-2 py-1 text-[11px] font-bold tracking-wide text-white outline-none backdrop-blur-sm focus:border-brand-primary"><!--[-->`);
      const each_array = ensure_array_like(extras.campuses);
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let c = each_array[$$index];
        $$renderer2.option({ value: c.id, class: "bg-[#171616] text-white" }, ($$renderer3) => {
          $$renderer3.push(`${escape_html(c.label)}`);
        });
      }
      $$renderer2.push(`<!--]--></select></label>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> `);
    if (extras.languageOptions && extras.languageOptions.length > 1) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="flex gap-3 border-l border-white/20 pl-6"><!--[-->`);
      const each_array_1 = ensure_array_like(extras.languageOptions);
      for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
        let lang = each_array_1[$$index_1];
        $$renderer2.push(`<a class="opacity-90 transition hover:text-brand-gold"${attr("href", lang.href ?? "#")}${attr("lang", lang.code)}>${escape_html(lang.label)}</a>`);
      }
      $$renderer2.push(`<!--]--></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></div></div> <div${attr_class(`${stringify(container)} flex h-14 items-center justify-between gap-4 sm:h-16 lg:h-[4.25rem]`)}><a href="/" class="font-sans text-lg font-black tracking-tight text-brand-dark sm:text-xl lg:text-2xl"><span class="text-brand-primary">Trail</span><span class="text-brand-dark">blazers</span></a> <nav class="hidden items-center gap-0.5 lg:flex xl:gap-1" aria-label="Primary"><!--[-->`);
    const each_array_2 = ensure_array_like(navItems);
    for (let i = 0, $$length = each_array_2.length; i < $$length; i++) {
      let item = each_array_2[i];
      if (isMegaNavItem(item)) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<div class="relative"><button type="button" class="flex items-center gap-1 rounded-full px-3 py-2 text-[13px] font-semibold text-brand-dark/90 transition hover:bg-black/5 hover:text-brand-primary xl:px-4 xl:text-sm"${attr("aria-expanded", openMega === item.label)} aria-haspopup="true">${escape_html(item.label)} <svg class="h-3.5 w-3.5 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg></button> `);
        if (openMega === item.label) {
          $$renderer2.push("<!--[0-->");
          $$renderer2.push(`<div class="absolute left-0 top-full z-[60] mt-2 w-[min(100vw-2rem,42rem)] rounded-2xl border border-white/60 bg-white/90 p-6 shadow-[0_20px_60px_rgba(23,22,22,0.15)] backdrop-blur-2xl ring-1 ring-black/5" role="region"${attr("aria-label", item.label)}><div class="grid gap-8 sm:grid-cols-2"><!--[-->`);
          const each_array_3 = ensure_array_like(item.columns);
          for (let $$index_3 = 0, $$length2 = each_array_3.length; $$index_3 < $$length2; $$index_3++) {
            let col = each_array_3[$$index_3];
            $$renderer2.push(`<div><p class="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-primary">${escape_html(col.title)}</p> <ul class="mt-4 space-y-2"><!--[-->`);
            const each_array_4 = ensure_array_like(col.links);
            for (let $$index_2 = 0, $$length3 = each_array_4.length; $$index_2 < $$length3; $$index_2++) {
              let link = each_array_4[$$index_2];
              $$renderer2.push(`<li><a class="block rounded-lg px-2.5 py-2 text-sm font-semibold text-brand-dark transition hover:bg-brand-primary/10 hover:text-brand-primary"${attr("href", link.href)}>${escape_html(link.label)}</a></li>`);
            }
            $$renderer2.push(`<!--]--></ul></div>`);
          }
          $$renderer2.push(`<!--]--></div> `);
          if (item.href) {
            $$renderer2.push("<!--[0-->");
            $$renderer2.push(`<div class="mt-6 border-t border-zinc-200/60 pt-4"><a class="text-sm font-bold text-brand-primary hover:underline"${attr("href", item.href)}>View all →</a></div>`);
          } else {
            $$renderer2.push("<!--[-1-->");
          }
          $$renderer2.push(`<!--]--></div>`);
        } else {
          $$renderer2.push("<!--[-1-->");
        }
        $$renderer2.push(`<!--]--></div>`);
      } else {
        $$renderer2.push("<!--[-1-->");
        $$renderer2.push(`<a class="rounded-full px-3 py-2 text-[13px] font-semibold text-brand-dark/90 transition hover:bg-black/5 hover:text-brand-primary xl:px-4 xl:text-sm"${attr("href", item.href)}>${escape_html(item.label)}</a>`);
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--></nav> <div class="hidden items-center gap-3 md:flex"><a class="rounded-full bg-brand-primary px-5 py-2.5 text-xs font-bold uppercase tracking-[0.12em] text-white shadow-[0_4px_20px_rgba(249,92,75,0.35)] transition hover:bg-brand-secondary hover:shadow-[0_6px_25px_rgba(249,92,75,0.45)] lg:px-6"${attr("href", cta.href)}>${escape_html(cta.label)}</a> <a class="rounded-full border border-brand-dark/20 bg-white/40 px-4 py-2.5 text-xs font-bold uppercase tracking-[0.12em] text-brand-dark backdrop-blur-sm transition hover:border-brand-primary hover:bg-brand-primary/10 hover:text-brand-primary" href="/admin">Staff Portal</a></div> <div class="flex items-center gap-2 md:hidden"><a class="rounded-full bg-brand-primary px-4 py-2 text-xs font-bold uppercase tracking-wide text-white shadow-md"${attr("href", cta.href)}>${escape_html(cta.label)}</a> <button type="button" class="inline-flex h-11 w-11 items-center justify-center rounded-full border border-zinc-200 bg-white/80 text-brand-dark shadow-sm backdrop-blur-md"${attr("aria-expanded", menuOpen)} aria-controls="mobile-nav-panel"${attr("aria-label", "Open menu")}>`);
    {
      $$renderer2.push("<!--[-1-->");
      $$renderer2.push(`<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>`);
    }
    $$renderer2.push(`<!--]--></button></div></div></div> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]-->`);
  });
}
function Footer($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { columns, extras } = $$props;
    const givingHref = derived(() => extras.givingUrl?.trim() ? extras.givingUrl : "/give");
    const watchHref = derived(() => extras.watchUrl?.trim() ? extras.watchUrl : "/watch");
    const messagesHref = derived(() => extras.messagesUrl?.trim() ? extras.messagesUrl : "/messages");
    $$renderer2.push(`<footer class="border-t border-white/10 bg-brand-dark text-gray-300"><div${attr_class(`${stringify(container)} ${stringify(sectionY)} pb-12 pt-14 lg:pb-16 lg:pt-20`)}><div class="grid gap-12 lg:grid-cols-12 lg:gap-10"><div class="lg:col-span-4"><p class="font-sans text-xl font-black tracking-tight text-white lg:text-2xl"><span class="text-brand-gold">Trail</span><span class="text-white">blazers</span></p> <p class="mt-4 max-w-sm text-sm leading-relaxed text-gray-400">A transformational leadership ecosystem for young adults — worship, community, and growth.</p> <form method="POST" action="/api/newsletter" class="mt-8 max-w-md"><p class="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-gold">Stay connected</p> <p class="mt-2 text-sm text-gray-400">Get updates on events and opportunities.</p> <div class="mt-4 flex flex-col gap-3 sm:flex-row"><label class="sr-only" for="footer-newsletter-email">Email address</label> <input id="footer-newsletter-email" type="email" name="email" required="" autocomplete="email" placeholder="Your email" class="min-h-12 flex-1 rounded-full border border-white/20 bg-white/5 px-4 text-sm text-white placeholder:text-gray-500 outline-none ring-brand-gold/30 transition focus:border-brand-gold focus:ring-2"/> <button type="submit" class="min-h-12 shrink-0 rounded-full bg-brand-primary px-8 text-xs font-bold uppercase tracking-[0.12em] text-white shadow-lg transition hover:brightness-105">Subscribe</button></div></form></div> <div class="grid gap-10 sm:grid-cols-2 lg:col-span-5 lg:grid-cols-2"><!--[-->`);
    const each_array = ensure_array_like(columns);
    for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
      let col = each_array[$$index_1];
      $$renderer2.push(`<div><h3 class="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-gold">${escape_html(col.title)}</h3> <ul class="mt-5 space-y-3 text-sm"><!--[-->`);
      const each_array_1 = ensure_array_like(col.links);
      for (let $$index = 0, $$length2 = each_array_1.length; $$index < $$length2; $$index++) {
        let link = each_array_1[$$index];
        $$renderer2.push(`<li><a class="transition hover:text-white"${attr("href", link.href)}>${escape_html(link.label)}</a></li>`);
      }
      $$renderer2.push(`<!--]--></ul></div>`);
    }
    $$renderer2.push(`<!--]--></div> <div class="lg:col-span-3"><h3 class="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-gold">Join us</h3> <ul class="mt-5 space-y-3 text-sm"><li><a class="transition hover:text-white" href="/plan-a-visit">Plan a visit</a></li> <li><a class="transition hover:text-white"${attr("href", watchHref())}>Watch</a></li> <li><a class="transition hover:text-white"${attr("href", messagesHref())}>Messages</a></li> <li><a class="transition hover:text-white"${attr("href", givingHref())}>Give</a></li> <li><a class="transition hover:text-white" href="/contact">Contact</a></li></ul></div></div></div> <div class="border-t border-white/10"><div${attr_class(`${stringify(container)} flex flex-col items-center justify-between gap-4 py-6 text-center text-xs text-gray-500 sm:flex-row sm:text-left`)}><p>© ${escape_html((/* @__PURE__ */ new Date()).getFullYear())}
				${escape_html(extras.organizationName ?? "Trailblazers")}. All rights reserved.</p> <div class="flex flex-wrap justify-center gap-6 sm:justify-end"><a class="transition hover:text-gray-300" href="/contact">Contact</a> <a class="transition hover:text-gray-300" href="/events">Events</a> <a class="transition hover:text-gray-300" href="/watch">Watch</a></div></div></div></footer>`);
  });
}
function Site_shell($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { settings, cta, children } = $$props;
    const ctaResolved = derived(() => cta ?? {
      label: "Plan a visit",
      href: settings.siteExtras.planVisitHref ?? "/plan-a-visit"
    });
    $$renderer2.push(`<div class="min-h-screen overflow-x-hidden bg-brand-light text-brand-dark antialiased">`);
    Navbar($$renderer2, {
      navItems: settings.navLinks,
      extras: settings.siteExtras,
      cta: ctaResolved()
    });
    $$renderer2.push(`<!----> <main id="main-content">`);
    children($$renderer2);
    $$renderer2.push(`<!----></main> `);
    Footer($$renderer2, { columns: settings.footerColumns, extras: settings.siteExtras });
    $$renderer2.push(`<!----></div>`);
  });
}
export {
  Site_shell as S,
  railItem as a,
  eyebrowGoldOnDark as b,
  container as c,
  eyebrow as e,
  headline as h,
  railRow as r,
  sectionY as s
};
