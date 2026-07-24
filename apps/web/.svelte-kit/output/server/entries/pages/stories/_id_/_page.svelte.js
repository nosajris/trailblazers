import { h as head, e as escape_html, a as attr, b as attr_class, s as stringify } from "../../../../chunks/renderer.js";
import { S as Site_shell, c as container } from "../../../../chunks/site-shell.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { data } = $$props;
    const p = data.post;
    const fmt = (d) => new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" }).format(new Date(d));
    head("v4tp2a", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>${escape_html(p.title)} — Trailblazers Stories</title>`);
      });
      $$renderer3.push(`<meta name="description"${attr("content", p.summary)}/>`);
    });
    Site_shell($$renderer2, {
      settings: data.settings,
      children: ($$renderer3) => {
        $$renderer3.push(`<article class="bg-white pb-20 pt-8 md:pb-28 md:pt-12"><div${attr_class(`${stringify(container)} max-w-3xl`)}><a class="text-sm font-semibold text-brand-primary hover:underline" href="/stories">← All stories</a> <p class="mt-6 text-sm text-brand-dark/50">${escape_html(fmt(p.createdAt))}</p> `);
        if (p.category) {
          $$renderer3.push("<!--[0-->");
          $$renderer3.push(`<p class="mt-2 text-[11px] font-bold uppercase tracking-[0.2em] text-brand-primary">${escape_html(p.category)}</p>`);
        } else {
          $$renderer3.push("<!--[-1-->");
        }
        $$renderer3.push(`<!--]--> <h1 class="mt-4 font-sans text-3xl font-black leading-tight text-brand-dark md:text-5xl">${escape_html(p.title)}</h1> <p class="mt-6 text-lg leading-relaxed text-brand-dark/75">${escape_html(p.summary)}</p></div> `);
        if (p.imageUrl) {
          $$renderer3.push("<!--[0-->");
          $$renderer3.push(`<div class="mx-auto mt-12 max-w-5xl px-4 sm:px-6"><div class="overflow-hidden rounded-2xl shadow-lg ring-1 ring-black/[0.06]"><img${attr("src", p.imageUrl)} alt="" class="aspect-[21/9] w-full object-cover md:aspect-[2.4/1]" sizes="(max-width: 1024px) 100vw, 80vw"/></div></div>`);
        } else {
          $$renderer3.push("<!--[-1-->");
        }
        $$renderer3.push(`<!--]--> <div${attr_class(`${stringify(container)} prose prose-lg mt-12 max-w-3xl text-brand-dark prose-headings:font-sans prose-headings:font-bold prose-a:text-brand-primary`)}>`);
        if (p.content) {
          $$renderer3.push("<!--[0-->");
          $$renderer3.push(`<p class="whitespace-pre-line text-lg leading-relaxed text-brand-dark/90">${escape_html(p.content)}</p>`);
        } else {
          $$renderer3.push("<!--[-1-->");
          $$renderer3.push(`<p class="text-brand-dark/70">Full article content is being prepared.</p>`);
        }
        $$renderer3.push(`<!--]--></div></article>`);
      }
    });
  });
}
export {
  _page as default
};
