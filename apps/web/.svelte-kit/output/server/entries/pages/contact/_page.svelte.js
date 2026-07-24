import { h as head, b as attr_class, s as stringify } from "../../../chunks/renderer.js";
import { S as Site_shell, c as container, s as sectionY } from "../../../chunks/site-shell.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { data } = $$props;
    head("1bv7ezn", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Contact — Trailblazers</title>`);
      });
      $$renderer3.push(`<meta name="description" content="Reach the Trailblazers team — questions, prayer, groups, and next steps."/>`);
    });
    Site_shell($$renderer2, {
      settings: data.settings,
      children: ($$renderer3) => {
        $$renderer3.push(`<section class="relative overflow-hidden bg-brand-dark py-14 text-white md:py-20"><div class="absolute inset-0 opacity-30"><img src="/images/slider02.jpeg" alt="" class="h-full w-full object-cover object-center" sizes="100vw"/></div> <div class="absolute inset-0 bg-gradient-to-r from-brand-dark via-brand-dark/95 to-brand-dark/70"></div> <div${attr_class(`${stringify(container)} relative max-w-4xl`)}><p class="text-[11px] font-bold uppercase tracking-[0.22em] text-brand-gold">Connect</p> <h1 class="mt-4 font-sans text-4xl font-black tracking-tight md:text-5xl">We are here for you</h1> <p class="mt-6 max-w-2xl text-lg text-gray-200">Whether you are planning a visit, looking for a group, or need prayer — send a note and a real person will
				read it.</p></div></section> <section${attr_class(`bg-brand-light ${stringify(sectionY)}`)}><div${attr_class(container)}><div class="grid gap-12 lg:grid-cols-12 lg:gap-16"><div class="lg:col-span-5"><div class="sticky top-28 overflow-hidden rounded-2xl shadow-xl ring-1 ring-black/[0.06]"><img src="/images/image08.jpeg" alt="" class="aspect-[4/5] w-full object-cover lg:aspect-auto lg:min-h-[28rem]" loading="lazy" sizes="(max-width: 1024px) 100vw, 40vw"/></div> <div class="mt-8 rounded-2xl border border-neutral-200/90 bg-white p-6 shadow-sm"><p class="text-sm font-bold text-brand-dark">Visit us</p> <p class="mt-2 text-sm leading-relaxed text-brand-dark/70">Weekend gatherings and mid-week groups — ask for times and locations when you write in.</p></div></div> <div class="lg:col-span-7"><p class="text-[11px] font-bold uppercase tracking-[0.22em] text-brand-primary">Message</p> <h2 class="mt-2 font-sans text-2xl font-black text-brand-dark md:text-3xl">Send us a note</h2> <p class="mt-3 text-brand-dark/75">We typically respond within a few business days.</p> <form method="POST" class="mt-10 space-y-6"><div><label class="text-xs font-bold uppercase tracking-wide text-brand-dark/60" for="name">Name</label> <input id="name" name="name" required="" class="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-4 py-3.5 outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"/></div> <div><label class="text-xs font-bold uppercase tracking-wide text-brand-dark/60" for="email">Email</label> <input id="email" name="email" type="email" required="" class="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-4 py-3.5 outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"/></div> <div><label class="text-xs font-bold uppercase tracking-wide text-brand-dark/60" for="message">Message</label> <textarea id="message" name="message" required="" rows="6" class="mt-2 w-full resize-y rounded-xl border border-neutral-200 bg-white px-4 py-3.5 outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"></textarea></div> <button type="submit" class="rounded-full bg-brand-primary px-10 py-4 text-xs font-bold uppercase tracking-[0.12em] text-white shadow-md transition hover:brightness-105">Send message</button></form></div></div></div></section>`);
      }
    });
  });
}
export {
  _page as default
};
