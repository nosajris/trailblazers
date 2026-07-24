import { h as head, b as attr_class, f as ensure_array_like, a as attr, s as stringify, e as escape_html } from "../../../chunks/renderer.js";
import { S as Site_shell, c as container, s as sectionY } from "../../../chunks/site-shell.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { data } = $$props;
    head("1sgss7h", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Groups — Trailblazers</title>`);
      });
      $$renderer3.push(`<meta name="description" content="Find a Trailblazers group — campus circles, creatives, and professionals meeting weekly."/>`);
    });
    Site_shell($$renderer2, {
      settings: data.settings,
      children: ($$renderer3) => {
        $$renderer3.push(`<section class="relative overflow-hidden bg-brand-dark py-20 text-white md:py-28"><div class="absolute inset-0"><img src="/images/wallpaper04.jpg" alt="" class="h-full w-full object-cover opacity-35" sizes="100vw"/> <div class="absolute inset-0 bg-gradient-to-r from-brand-dark via-brand-dark/90 to-brand-dark/70"></div></div> <div${attr_class(`${stringify(container)} relative max-w-4xl`)}><p class="text-[11px] font-bold uppercase tracking-[0.22em] text-brand-gold">Community</p> <h1 class="mt-4 font-sans text-4xl font-black tracking-tight md:text-6xl">Life is better connected</h1> <p class="mt-6 max-w-2xl text-lg leading-relaxed text-gray-200">Groups are where friends become family — honest conversation, shared meals, and faith that fits real life.</p> <a class="mt-10 inline-flex rounded-full bg-brand-primary px-10 py-4 text-xs font-bold uppercase tracking-[0.14em] text-white shadow-lg transition hover:brightness-105" href="/contact">Find my group</a></div></section> <section${attr_class(`border-b border-neutral-200/80 bg-white ${stringify(sectionY)}`)}><div${attr_class(container)}><div class="mx-auto max-w-3xl text-center"><p class="text-[11px] font-bold uppercase tracking-[0.22em] text-brand-primary">How it works</p> <h2 class="mt-3 font-sans text-2xl font-black text-brand-dark md:text-4xl">Three rhythms, one table</h2> <p class="mt-4 text-brand-dark/75 md:text-lg">We gather in smaller circles during the week so Sunday feels like a reunion — not a first date.</p></div> <div class="mt-14 grid gap-8 md:grid-cols-3"><div class="rounded-2xl border border-neutral-200/90 bg-brand-light/60 p-8 text-center"><p class="text-sm font-black text-brand-primary">01</p> <h3 class="mt-2 font-sans text-lg font-bold text-brand-dark">Show up</h3> <p class="mt-3 text-sm text-brand-dark/70">Same night, same people — consistency builds trust.</p></div> <div class="rounded-2xl border border-neutral-200/90 bg-brand-light/60 p-8 text-center"><p class="text-sm font-black text-brand-primary">02</p> <h3 class="mt-2 font-sans text-lg font-bold text-brand-dark">Open up</h3> <p class="mt-3 text-sm text-brand-dark/70">Real questions, real prayer — no performance needed.</p></div> <div class="rounded-2xl border border-neutral-200/90 bg-brand-light/60 p-8 text-center"><p class="text-sm font-black text-brand-primary">03</p> <h3 class="mt-2 font-sans text-lg font-bold text-brand-dark">Grow out</h3> <p class="mt-3 text-sm text-brand-dark/70">What you learn in the room, you carry into your week.</p></div></div></div></section> <section id="directory"${attr_class(`bg-[#f3f2ef] ${stringify(sectionY)}`)}><div${attr_class(container)}><p class="text-[11px] font-bold uppercase tracking-[0.22em] text-brand-primary">Open groups</p> <h2 class="mt-3 font-sans text-2xl font-black text-brand-dark md:text-4xl">Find your people</h2> <p class="mt-4 max-w-2xl text-brand-dark/75">Browse what is currently open — tap a card to reach out and we will help you take the next step.</p> <div class="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3"><!--[-->`);
        const each_array = ensure_array_like(data.groups);
        for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
          let g = each_array[$$index];
          $$renderer3.push(`<article${attr("id", `group-${stringify(g.id)}`)} class="scroll-mt-28 overflow-hidden rounded-2xl border border-neutral-200/90 bg-white shadow-sm ring-1 ring-black/[0.03] transition hover:-translate-y-0.5 hover:shadow-lg">`);
          if (g.imageUrl) {
            $$renderer3.push("<!--[0-->");
            $$renderer3.push(`<div class="aspect-[16/10] overflow-hidden bg-neutral-100"><img${attr("src", g.imageUrl)} alt="" class="h-full w-full object-cover" loading="lazy" sizes="(max-width: 1024px) 100vw, 33vw"/></div>`);
          } else {
            $$renderer3.push("<!--[-1-->");
          }
          $$renderer3.push(`<!--]--> <div class="p-6 md:p-8"><p class="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-primary">${escape_html(g.type)}</p> <h3 class="mt-2 font-sans text-xl font-bold text-brand-dark">${escape_html(g.name)}</h3> <p class="mt-2 text-sm font-medium text-brand-dark/70">${escape_html(g.dayTime)} · Led by ${escape_html(g.leader)}</p> `);
          if (g.description) {
            $$renderer3.push("<!--[0-->");
            $$renderer3.push(`<p class="mt-4 text-sm leading-relaxed text-brand-dark/70">${escape_html(g.description)}</p>`);
          } else {
            $$renderer3.push("<!--[-1-->");
          }
          $$renderer3.push(`<!--]--> <a class="mt-6 inline-flex rounded-full border border-brand-dark/15 px-6 py-2.5 text-xs font-bold uppercase tracking-wide text-brand-dark transition hover:border-brand-primary hover:text-brand-primary"${attr("href", `/contact?topic=group&group=${stringify(encodeURIComponent(g.name))}`)}>Ask about this group</a></div></article>`);
        }
        $$renderer3.push(`<!--]--></div></div></section>`);
      }
    });
  });
}
export {
  _page as default
};
