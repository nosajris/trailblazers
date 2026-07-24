import { h as head, b as attr_class, f as ensure_array_like, a as attr, s as stringify, e as escape_html } from "../../../chunks/renderer.js";
import { S as Site_shell, c as container, s as sectionY } from "../../../chunks/site-shell.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { data } = $$props;
    const fmt = (d) => new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(d));
    head("vvl6ey", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Stories — Trailblazers</title>`);
      });
      $$renderer3.push(`<meta name="description" content="Articles, recaps, and leadership insights from the Trailblazers community."/>`);
    });
    Site_shell($$renderer2, {
      settings: data.settings,
      children: ($$renderer3) => {
        $$renderer3.push(`<section class="relative overflow-hidden bg-brand-dark py-16 text-white md:py-24"><div class="absolute inset-0 opacity-30"><img src="/images/slider01.jpeg" alt="" class="h-full w-full object-cover" sizes="100vw"/></div> <div class="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/85 to-brand-dark/40"></div> <div${attr_class(`${stringify(container)} relative max-w-4xl`)}><p class="text-[11px] font-bold uppercase tracking-[0.22em] text-brand-gold">Stories</p> <h1 class="mt-4 font-sans text-4xl font-black tracking-tight md:text-6xl">What God is doing here</h1> <p class="mt-6 max-w-2xl text-lg text-gray-200">Weekend recaps, leadership thoughts, and honest reflections — written for young adults on the move.</p></div></section> <section${attr_class(`bg-brand-light ${stringify(sectionY)}`)}><div${attr_class(container)}>`);
        if (data.posts.length === 0) {
          $$renderer3.push("<!--[0-->");
          $$renderer3.push(`<p class="text-center text-brand-dark/70">Stories are on the way. Check back soon.</p>`);
        } else {
          $$renderer3.push("<!--[-1-->");
          $$renderer3.push(`<div class="grid gap-10 md:grid-cols-2 lg:grid-cols-3"><!--[-->`);
          const each_array = ensure_array_like(data.posts);
          for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
            let post = each_array[$$index];
            $$renderer3.push(`<a${attr("href", `/stories/${stringify(post.id)}`)} class="group flex flex-col overflow-hidden rounded-2xl border border-neutral-200/90 bg-white shadow-sm ring-1 ring-black/[0.03] transition hover:-translate-y-1 hover:shadow-xl">`);
            if (post.imageUrl) {
              $$renderer3.push("<!--[0-->");
              $$renderer3.push(`<div class="aspect-[16/10] overflow-hidden bg-neutral-100"><img${attr("src", post.imageUrl)} alt="" class="h-full w-full object-cover transition duration-500 group-hover:scale-105" loading="lazy" sizes="(max-width: 768px) 100vw, 33vw"/></div>`);
            } else {
              $$renderer3.push("<!--[-1-->");
            }
            $$renderer3.push(`<!--]--> <div class="flex flex-1 flex-col p-6 md:p-7"><p class="text-xs text-brand-dark/50">${escape_html(fmt(post.createdAt))}</p> `);
            if (post.category) {
              $$renderer3.push("<!--[0-->");
              $$renderer3.push(`<p class="mt-2 text-[10px] font-bold uppercase tracking-[0.18em] text-brand-primary">${escape_html(post.category)}</p>`);
            } else {
              $$renderer3.push("<!--[-1-->");
            }
            $$renderer3.push(`<!--]--> <h2 class="mt-2 font-sans text-xl font-bold leading-snug text-brand-dark group-hover:text-brand-primary md:text-2xl">${escape_html(post.title)}</h2> <p class="mt-3 flex-1 text-sm leading-relaxed text-brand-dark/70 line-clamp-4">${escape_html(post.summary)}</p> <span class="mt-5 text-xs font-bold uppercase tracking-wide text-brand-primary">Read more →</span></div></a>`);
          }
          $$renderer3.push(`<!--]--></div>`);
        }
        $$renderer3.push(`<!--]--></div></section>`);
      }
    });
  });
}
export {
  _page as default
};
