import { h as head, b as attr_class, f as ensure_array_like, a as attr, e as escape_html, s as stringify } from "../../../chunks/renderer.js";
import { S as Site_shell, c as container, s as sectionY } from "../../../chunks/site-shell.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { data } = $$props;
    const series = [
      {
        title: "Ignited for impact",
        subtitle: "Young adults · current emphasis",
        image: "/images/sermon1.jpg",
        href: "/watch"
      },
      {
        title: "Catalyst nights",
        subtitle: "Worship & word",
        image: "/images/slider03.jpeg",
        href: "/watch"
      },
      {
        title: "Marketplace faith",
        subtitle: "Work as worship",
        image: "/images/wallpaper02.jpg",
        href: "/watch"
      },
      {
        title: "Leadership tables",
        subtitle: "Character that scales",
        image: "/images/wallpaper07.jpg",
        href: "/stories"
      }
    ];
    head("1iamj51", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Messages — Trailblazers</title>`);
      });
      $$renderer3.push(`<meta name="description" content="Current series and past messages — watch, listen, and share."/>`);
    });
    Site_shell($$renderer2, {
      settings: data.settings,
      children: ($$renderer3) => {
        $$renderer3.push(`<section class="relative overflow-hidden bg-brand-dark py-16 text-white md:py-24"><div class="absolute inset-0 opacity-25"><img src="/images/sermon2.jpg" alt="" class="h-full w-full object-cover object-top" sizes="100vw"/></div> <div class="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/90 to-brand-dark/50"></div> <div${attr_class(`${stringify(container)} relative max-w-4xl`)}><p class="text-[11px] font-bold uppercase tracking-[0.22em] text-brand-gold">Messages</p> <h1 class="mt-4 font-sans text-4xl font-black tracking-tight md:text-6xl">Teaching that travels with you</h1> <p class="mt-6 max-w-2xl text-lg text-gray-200">Catch up on the current series, rewatch a talk that hit home, or send a message to a friend who needs hope
				today.</p> <div class="mt-10 flex flex-wrap gap-4"><a class="inline-flex rounded-full bg-brand-primary px-10 py-4 text-xs font-bold uppercase tracking-[0.14em] text-white shadow-lg transition hover:brightness-105" href="/watch">Watch now</a> <a class="inline-flex rounded-full border border-white/35 px-10 py-4 text-xs font-bold uppercase tracking-[0.14em] text-white transition hover:bg-white/10" href="/stories">Read stories</a></div></div></section> <section id="series"${attr_class(`bg-white ${stringify(sectionY)}`)}><div${attr_class(container)}><div class="flex flex-col justify-between gap-6 md:flex-row md:items-end"><div><p class="text-[11px] font-bold uppercase tracking-[0.22em] text-brand-primary">Series</p> <h2 class="mt-2 font-sans text-2xl font-black text-brand-dark md:text-4xl">Browse by series</h2> <p class="mt-3 max-w-xl text-brand-dark/70">Each series is built to be heard in order — but you can jump in anywhere the Spirit leads.</p></div></div> <div class="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4"><!--[-->`);
        const each_array = ensure_array_like(series);
        for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
          let s = each_array[$$index];
          $$renderer3.push(`<a${attr("href", s.href)} class="group overflow-hidden rounded-2xl border border-neutral-200/90 bg-brand-light shadow-sm ring-1 ring-black/[0.03] transition hover:-translate-y-1 hover:shadow-lg"><div class="aspect-[4/3] overflow-hidden"><img${attr("src", s.image)} alt="" class="h-full w-full object-cover transition duration-500 group-hover:scale-105" loading="lazy" sizes="(max-width: 640px) 100vw, 25vw"/></div> <div class="p-5"><p class="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-primary">Series</p> <h3 class="mt-1 font-sans text-lg font-bold text-brand-dark group-hover:text-brand-primary">${escape_html(s.title)}</h3> <p class="mt-2 text-sm text-brand-dark/65">${escape_html(s.subtitle)}</p></div></a>`);
        }
        $$renderer3.push(`<!--]--></div></div></section> <section class="border-t border-neutral-200/80 bg-[#f3f2ef] py-16 md:py-20"><div${attr_class(`${stringify(container)} max-w-3xl text-center`)}><h2 class="font-sans text-2xl font-black text-brand-dark md:text-3xl">Prefer audio on the go?</h2> <p class="mt-4 text-brand-dark/75">Streaming links can be wired to Apple Podcasts / Spotify from site settings when you are ready.</p> <a class="mt-8 inline-flex rounded-full border border-brand-dark/15 bg-white px-10 py-4 text-xs font-bold uppercase tracking-[0.12em] text-brand-dark transition hover:border-brand-primary" href="/contact">Ask the team</a></div></section>`);
      }
    });
  });
}
export {
  _page as default
};
