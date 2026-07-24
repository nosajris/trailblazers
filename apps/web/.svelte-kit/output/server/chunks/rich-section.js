import { b as attr_class, e as escape_html, a as attr, c as clsx, s as stringify } from "./renderer.js";
import { s as sectionY, c as container, e as eyebrow, h as headline } from "./site-shell.js";
function Rich_section($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { data, eyebrow: eyebrowLabel } = $$props;
    if (data) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<section${attr_class(`border-b border-neutral-200/80 bg-[#f3f2ef] ${stringify(sectionY)}`)}><div${attr_class(container)}><div class="grid items-center gap-10 lg:grid-cols-2 lg:gap-16 xl:gap-24"><div class="order-2 lg:order-1">`);
      if (eyebrowLabel) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<p${attr_class(clsx(eyebrow))}>${escape_html(eyebrowLabel)}</p>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--> <h2${attr_class(`mt-3 ${stringify(headline)}`)}>${escape_html(data.headline)}</h2> `);
      if (data.subheadline) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<p class="mt-4 text-lg font-medium text-brand-dark/75 md:text-xl">${escape_html(data.subheadline)}</p>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--> `);
      if (data.body) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<p class="mt-5 max-w-xl text-base leading-relaxed text-brand-dark/70 md:text-lg">${escape_html(data.body)}</p>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--> `);
      if (data.ctaLabel && data.ctaHref) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<a class="mt-8 inline-flex min-h-[3rem] items-center justify-center rounded-full bg-brand-primary px-10 text-xs font-bold uppercase tracking-[0.14em] text-white shadow-md transition hover:brightness-110"${attr("href", data.ctaHref)}>${escape_html(data.ctaLabel)}</a>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--></div> <div class="order-1 lg:order-2">`);
      if (data.imageUrl) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<div class="overflow-hidden rounded-3xl shadow-2xl ring-1 ring-black/5"><img${attr("src", data.imageUrl)} alt="" class="aspect-[4/3] w-full object-cover md:aspect-[5/4]" loading="lazy"/></div>`);
      } else {
        $$renderer2.push("<!--[-1-->");
        $$renderer2.push(`<div class="aspect-[4/3] w-full rounded-3xl bg-gradient-to-br from-brand-secondary/50 to-brand-primary/40 md:aspect-[5/4]"></div>`);
      }
      $$renderer2.push(`<!--]--></div></div></div></section>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]-->`);
  });
}
export {
  Rich_section as R
};
