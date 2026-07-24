import { h as head } from "../../../chunks/renderer.js";
import { S as Site_shell } from "../../../chunks/site-shell.js";
import { F as Faq_section } from "../../../chunks/faq-section.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { data } = $$props;
    head("1bex8oj", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>FAQ — Trailblazers</title>`);
      });
      $$renderer3.push(`<meta name="description" content="Answers about Trailblazers young adults ministry, groups, events, and more."/>`);
    });
    Site_shell($$renderer2, {
      settings: data.settings,
      children: ($$renderer3) => {
        $$renderer3.push(`<section class="relative overflow-hidden bg-brand-dark py-14 text-white md:py-20"><div class="absolute inset-0 opacity-20"><img src="/images/wallpaper03.jpg" alt="" class="h-full w-full object-cover" sizes="100vw"/></div> <div class="absolute inset-0 bg-gradient-to-r from-brand-dark via-brand-dark to-brand-dark/80"></div> <div class="relative mx-auto max-w-4xl px-4 text-center sm:px-6 md:px-10"><p class="text-[11px] font-bold uppercase tracking-[0.22em] text-brand-gold">Help</p> <h1 class="mt-4 font-sans text-4xl font-black tracking-tight md:text-5xl">Frequently asked questions</h1> <p class="mx-auto mt-6 max-w-2xl text-lg text-gray-200">Quick answers to the questions we hear most — still stuck? We are only an email away.</p></div></section> `);
        Faq_section($$renderer3, {
          data: { title: "Your questions, answered", items: data.items }
        });
        $$renderer3.push(`<!----> <section class="border-t border-neutral-200/80 bg-brand-light py-14"><div class="mx-auto max-w-2xl px-4 text-center sm:px-6"><h2 class="font-sans text-xl font-bold text-brand-dark md:text-2xl">Did not find what you need?</h2> <p class="mt-3 text-brand-dark/70">Our team would love to help you take your next step.</p> <a class="mt-8 inline-flex rounded-full bg-brand-primary px-10 py-3 text-xs font-bold uppercase tracking-[0.12em] text-white shadow-md transition hover:brightness-105" href="/contact">Contact us</a></div></section>`);
      }
    });
  });
}
export {
  _page as default
};
