import { h as head } from "../../../chunks/renderer.js";
import { S as Site_shell } from "../../../chunks/site-shell.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { data } = $$props;
    head("18kzbb6", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Give — Trailblazers</title>`);
      });
      $$renderer3.push(`<meta name="description" content="Partner with Trailblazers through generous giving."/>`);
    });
    Site_shell($$renderer2, {
      settings: data.settings,
      children: ($$renderer3) => {
        $$renderer3.push(`<section class="border-b border-neutral-200/80 bg-gradient-to-b from-brand-light to-white py-16 md:py-24"><div class="mx-auto max-w-3xl px-4 text-center md:px-6"><p class="text-[11px] font-bold uppercase tracking-[0.22em] text-brand-primary">Give</p> <h1 class="mt-4 font-sans text-3xl font-black tracking-tight text-brand-dark md:text-5xl">Generosity fuels the mission</h1> <p class="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-brand-dark/75">Online giving is being configured for this site. Contact the office to give today, or speak with a
				team member on Sunday.</p> <div class="mt-10 flex flex-wrap justify-center gap-4"><a class="inline-flex min-h-[3rem] items-center justify-center rounded-full bg-brand-primary px-10 text-xs font-bold uppercase tracking-[0.14em] text-white shadow-lg transition hover:brightness-105" href="/contact">Contact us</a> <a class="inline-flex min-h-[3rem] items-center justify-center rounded-full border border-brand-dark/15 bg-white px-10 text-xs font-bold uppercase tracking-[0.14em] text-brand-dark transition hover:border-brand-primary" href="/events">Join an event</a></div></div></section>`);
      }
    });
  });
}
export {
  _page as default
};
