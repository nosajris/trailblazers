import { h as head, b as attr_class, s as stringify } from "../../../chunks/renderer.js";
import { S as Site_shell, c as container, s as sectionY } from "../../../chunks/site-shell.js";
import { R as Rich_section } from "../../../chunks/rich-section.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { data } = $$props;
    head("17mllk4", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Serve — Trailblazers</title>`);
      });
      $$renderer3.push(`<meta name="description" content="Volunteer with Trailblazers — hospitality, production, groups, and more ways to build the church."/>`);
    });
    Site_shell($$renderer2, {
      settings: data.settings,
      children: ($$renderer3) => {
        $$renderer3.push(`<section class="relative overflow-hidden bg-brand-dark py-16 text-white md:py-24"><div class="absolute inset-0 opacity-25"><img src="/images/wallpaper01.jpg" alt="" class="h-full w-full object-cover" sizes="100vw"/></div> <div class="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/90 to-brand-dark/50"></div> <div${attr_class(`${stringify(container)} relative max-w-4xl`)}><p class="text-[11px] font-bold uppercase tracking-[0.22em] text-brand-gold">Serve</p> <h1 class="mt-4 font-sans text-4xl font-black tracking-tight md:text-6xl">Your seat was never meant to be passive</h1> <p class="mt-6 max-w-2xl text-lg text-gray-200">From greeting guests to running production, serving is how we become family — and how Sunday becomes home
				for someone else.</p></div></section> `);
        if (data.section) {
          $$renderer3.push("<!--[0-->");
          Rich_section($$renderer3, { data: data.section, eyebrow: "Teams" });
        } else {
          $$renderer3.push("<!--[-1-->");
          $$renderer3.push(`<section${attr_class(`bg-white ${stringify(sectionY)}`)}><div${attr_class(`${stringify(container)} max-w-3xl text-center`)}><p class="text-brand-dark/75">Serve team content is managed in the CMS. Contact us to find a team while this page is being configured.</p></div></section>`);
        }
        $$renderer3.push(`<!--]--> <section class="border-t border-neutral-200/80 bg-[#f3f2ef] py-16 md:py-20"><div${attr_class(`${stringify(container)} grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16`)}><div class="overflow-hidden rounded-2xl shadow-xl ring-1 ring-black/[0.04]"><img src="/images/slider05.jpeg" alt="" class="aspect-[4/3] w-full object-cover" loading="lazy" sizes="(max-width: 1024px) 100vw, 50vw"/></div> <div><p class="text-[11px] font-bold uppercase tracking-[0.22em] text-brand-primary">Next step</p> <h2 class="mt-3 font-sans text-2xl font-black text-brand-dark md:text-3xl">Tell us how you want to jump in</h2> <p class="mt-4 text-brand-dark/75">We will match your gifts and schedule with a team that fits — no awkward pressure, just a clear path.</p> <a class="mt-8 inline-flex rounded-full bg-brand-primary px-10 py-4 text-xs font-bold uppercase tracking-[0.12em] text-white shadow-md transition hover:brightness-105" href="/contact?topic=serve">Start the conversation</a></div></div></section>`);
      }
    });
  });
}
export {
  _page as default
};
