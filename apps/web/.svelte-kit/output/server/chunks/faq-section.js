import { b as attr_class, e as escape_html, f as ensure_array_like, a as attr, c as clsx, s as stringify } from "./renderer.js";
import { s as sectionY, c as container, e as eyebrow, h as headline } from "./site-shell.js";
function Faq_section($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { data } = $$props;
    $$renderer2.push(`<section${attr_class(`border-b border-neutral-200/80 bg-white ${stringify(sectionY)}`)}><div${attr_class(container)}><div class="mx-auto max-w-3xl lg:mx-0"><p${attr_class(clsx(eyebrow))}>FAQ</p> <h2${attr_class(`mt-3 ${stringify(headline)}`)}>${escape_html(data.title ?? "Questions")}</h2></div> <div class="mx-auto mt-10 max-w-3xl space-y-3 lg:mx-0"><!--[-->`);
    const each_array = ensure_array_like(data.items);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let item = each_array[$$index];
      $$renderer2.push(`<details${attr("id", `faq-${item.id}`)} name="faq" class="group rounded-2xl border border-neutral-200/90 bg-[#fafaf8] px-5 py-1 transition hover:border-brand-primary/25"><summary class="flex cursor-pointer list-none items-center justify-between gap-4 py-4 font-sans text-base font-semibold text-brand-dark md:text-lg [&amp;::-webkit-details-marker]:hidden"${attr("aria-controls", `faq-panel-${item.id}`)}><span>${escape_html(item.question)}</span> <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-neutral-200 bg-white text-brand-primary transition group-open:rotate-180"><svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg></span></summary> <div${attr("id", `faq-panel-${item.id}`)} class="border-t border-neutral-200/80 pb-5 pt-4 text-sm leading-relaxed text-brand-dark/75 md:text-base" role="region">${escape_html(item.answer)}</div></details>`);
    }
    $$renderer2.push(`<!--]--></div></div></section>`);
  });
}
export {
  Faq_section as F
};
