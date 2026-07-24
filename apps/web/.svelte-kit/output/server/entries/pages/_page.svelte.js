import { a as attr, b as attr_class, s as stringify, e as escape_html, d as derived, c as clsx, f as ensure_array_like, h as head } from "../../chunks/renderer.js";
import { c as container, s as sectionY, e as eyebrow, h as headline, r as railRow, a as railItem, b as eyebrowGoldOnDark, S as Site_shell } from "../../chunks/site-shell.js";
import { R as Rich_section } from "../../chunks/rich-section.js";
import { F as Faq_section } from "../../chunks/faq-section.js";
function Hero_section($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { data } = $$props;
    function youtubeEmbedUrl(url) {
      const trimmed = url.trim();
      if (!trimmed) return null;
      if (trimmed.includes("youtube-nocookie.com/embed/") || trimmed.includes("youtube.com/embed/")) {
        return trimmed.startsWith("http") ? trimmed : `https://${trimmed}`;
      }
      try {
        const u = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
        const v = u.searchParams.get("v");
        if (v) return `https://www.youtube-nocookie.com/embed/${v}`;
        if (u.hostname.replace("www.", "") === "youtu.be") {
          const id = u.pathname.replace(/^\//, "").split("/")[0];
          if (id) return `https://www.youtube-nocookie.com/embed/${id}`;
        }
      } catch {
        return null;
      }
      return null;
    }
    const embed = derived(() => data.videoUrl ? youtubeEmbedUrl(data.videoUrl) : null);
    $$renderer2.push(`<section class="relative min-h-[min(88vh,54rem)] overflow-hidden bg-brand-dark text-white"><div class="absolute inset-0">`);
    if (embed()) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="absolute inset-0 scale-105"><iframe class="pointer-events-none h-full w-full scale-[1.2] opacity-45 saturate-[1.05]"${attr("src", embed())} title="Hero video" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen=""></iframe></div>`);
    } else if (data.imageUrl) {
      $$renderer2.push("<!--[1-->");
      $$renderer2.push(`<img${attr("src", data.imageUrl)} alt="" class="h-full w-full scale-105 object-cover opacity-[0.38] saturate-[1.05]" sizes="100vw" fetchpriority="high" loading="eager" decoding="async"/>`);
    } else {
      $$renderer2.push("<!--[-1-->");
      $$renderer2.push(`<div class="h-full w-full bg-gradient-to-br from-brand-dark via-[#171616] to-brand-primary/35"></div>`);
    }
    $$renderer2.push(`<!--]--> <div class="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/80 to-brand-dark/30"></div> <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(249,92,75,0.18),_transparent_55%)]"></div></div> <div${attr_class(`${stringify(container)} relative flex min-h-[min(88vh,54rem)] flex-col justify-center py-20 sm:py-24 md:py-28 lg:py-32`)}><div class="grid gap-12 lg:grid-cols-12 lg:items-center"><div class="lg:col-span-8"><div class="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 backdrop-blur-md shadow-lg mb-6"><span class="h-2 w-2 rounded-full bg-brand-gold animate-pulse"></span> <span class="text-[11px] font-bold uppercase tracking-[0.22em] text-brand-gold">Young Adults &amp; Student Ecosystem</span></div> <h1 class="font-sans text-4xl font-black leading-[1.05] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl drop-shadow-md">${escape_html(data.title)}</h1> `);
    if (data.subtitle) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<p class="mt-6 max-w-2xl text-base leading-relaxed text-gray-200 sm:text-lg md:text-xl">${escape_html(data.subtitle)}</p>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> <div class="mt-10 flex w-full max-w-xl flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">`);
    if (data.primaryCta) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<a class="inline-flex min-h-[3.25rem] flex-1 items-center justify-center rounded-full bg-brand-primary px-8 text-center text-xs font-bold uppercase tracking-[0.14em] text-white shadow-[0_8px_30px_rgba(249,92,75,0.45)] transition hover:bg-brand-secondary hover:shadow-[0_12px_40px_rgba(249,92,75,0.55)] sm:flex-none sm:px-10"${attr("href", data.primaryCta.href)}>${escape_html(data.primaryCta.label)}</a>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> `);
    if (data.secondaryCta) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<a class="inline-flex min-h-[3.25rem] flex-1 items-center justify-center rounded-full border border-white/30 bg-white/10 px-8 text-center text-xs font-bold uppercase tracking-[0.14em] text-white backdrop-blur-md transition hover:bg-white/20 hover:border-white/50 sm:flex-none sm:px-10 shadow-lg"${attr("href", data.secondaryCta.href)}>${escape_html(data.secondaryCta.label)}</a>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></div></div> <div class="hidden lg:block lg:col-span-4"><div class="rounded-3xl border border-white/20 bg-white/10 p-8 shadow-[0_20px_50px_rgba(0,0,0,0.3)] backdrop-blur-2xl space-y-6"><div class="flex items-center gap-4"><div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-primary/20 text-brand-primary border border-brand-primary/30"><svg class="h-6 w-6 fill-none stroke-current stroke-2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg></div> <div><div class="text-2xl font-black text-white">5,000+</div> <div class="text-xs font-semibold text-gray-300">Active Young Adults</div></div></div> <div class="h-px w-full bg-white/10"></div> <div class="flex items-center gap-4"><div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/20 text-brand-gold border border-amber-500/30"><svg class="h-6 w-6 fill-none stroke-current stroke-2" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg></div> <div><div class="text-2xl font-black text-white">12+ Hubs</div> <div class="text-xs font-semibold text-gray-300">University &amp; City Hubs</div></div></div> <div class="h-px w-full bg-white/10"></div> <a href="/plan-a-visit" class="block w-full text-center rounded-xl bg-white/15 py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-white/25 transition border border-white/20">Join Next Gathering →</a></div></div></div></div></section>`);
  });
}
function Events_rail_section($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { data } = $$props;
    const formatDate = (d) => new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit"
    }).format(new Date(d));
    $$renderer2.push(`<section${attr_class(`border-b border-neutral-200/80 bg-white ${stringify(sectionY)}`)}><div${attr_class(container)}><div class="flex flex-col justify-between gap-6 md:flex-row md:items-end"><div class="max-w-3xl"><p${attr_class(clsx(eyebrow))}>Events</p> <h2${attr_class(`mt-3 ${stringify(headline)}`)}>${escape_html(data.title ?? "Upcoming events")}</h2> <p class="mt-3 max-w-2xl text-base leading-relaxed text-brand-dark/70 md:text-lg">Join us for camps, nights, and workshops.</p></div> <a class="inline-flex shrink-0 items-center gap-2 text-sm font-bold text-brand-primary transition hover:gap-3" href="/events">View all events <span aria-hidden="true">→</span></a></div> <div${attr_class(`mt-12 ${stringify(railRow)}`)}><!--[-->`);
    const each_array = ensure_array_like(data.events);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let event = each_array[$$index];
      $$renderer2.push(`<a${attr("href", `/events/${stringify(event.id)}`)}${attr_class(`${stringify(railItem)} card group flex flex-col overflow-hidden rounded-2xl border border-neutral-200/80 bg-brand-light shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg`)}><div class="relative aspect-[16/10] overflow-hidden bg-neutral-200">`);
      if (event.imageUrl) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<img${attr("src", event.imageUrl)} alt="" class="h-full w-full object-cover transition duration-500 group-hover:scale-105" loading="lazy"/>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--> <span class="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-brand-dark shadow-sm">${escape_html(event.type)}</span></div> <div class="flex flex-1 flex-col p-5 md:p-6"><p class="text-xs font-bold uppercase tracking-wide text-brand-primary">${escape_html(formatDate(event.date))}</p> <h3 class="mt-2 font-sans text-lg font-bold leading-snug text-brand-dark md:text-xl line-clamp-2">${escape_html(event.title)}</h3> <p class="mt-2 flex-1 text-sm leading-relaxed text-brand-dark/65 line-clamp-2 md:text-[15px]">${escape_html(event.description)}</p> <span class="mt-4 text-sm font-bold text-brand-primary transition group-hover:translate-x-0.5">Details →</span></div></a>`);
    }
    $$renderer2.push(`<!--]--></div></div></section>`);
  });
}
function Blog_section($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { data } = $$props;
    $$renderer2.push(`<section${attr_class(`border-b border-neutral-200/80 bg-[#f3f2ef] ${stringify(sectionY)}`)}><div${attr_class(container)}><div class="max-w-3xl"><p${attr_class(clsx(eyebrow))}>Stories</p> <h2${attr_class(`mt-3 ${stringify(headline)}`)}>${escape_html(data.title ?? "Stories & updates")}</h2></div> <div${attr_class(`mt-12 ${stringify(railRow)}`)}><!--[-->`);
    const each_array = ensure_array_like(data.posts);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let post = each_array[$$index];
      $$renderer2.push(`<a${attr("href", `/stories/${stringify(post.id)}`)}${attr_class(`${stringify(railItem)} flex flex-col overflow-hidden rounded-2xl border border-neutral-200/90 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md`)}>`);
      if (post.imageUrl) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<div class="aspect-[16/10] overflow-hidden bg-neutral-100"><img${attr("src", post.imageUrl)} alt="" class="h-full w-full object-cover" loading="lazy" sizes="(max-width: 768px) 85vw, 33vw"/></div>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--> <div class="flex flex-1 flex-col p-6 md:p-7">`);
      if (post.category) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<p class="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-primary">${escape_html(post.category)}</p>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--> <h3 class="mt-2 font-sans text-lg font-bold leading-snug text-brand-dark md:text-xl">${escape_html(post.title)}</h3> <p class="mt-3 flex-1 text-sm leading-relaxed text-brand-dark/65 line-clamp-4 md:text-[15px]">${escape_html(post.summary)}</p> <span class="mt-4 text-xs font-bold uppercase tracking-wide text-brand-primary">Read story →</span></div></a>`);
    }
    $$renderer2.push(`<!--]--></div> <div class="mt-10 text-center"><a class="inline-flex rounded-full border border-brand-dark/15 px-8 py-3 text-xs font-bold uppercase tracking-[0.12em] text-brand-dark transition hover:border-brand-primary hover:text-brand-primary" href="/stories">All stories</a></div></div></section>`);
  });
}
function Testimonials_section($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { data } = $$props;
    $$renderer2.push(`<section${attr_class(`border-b border-white/10 bg-brand-dark text-gray-200 ${stringify(sectionY)}`)}><div${attr_class(container)}><div class="mx-auto max-w-3xl text-center"><p${attr_class(clsx(eyebrowGoldOnDark))}>Stories</p> <h2 class="mt-4 text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl md:text-[2.75rem]">${escape_html(data.title ?? "What people are saying")}</h2></div> <div class="mt-14 grid gap-6 md:grid-cols-2 md:gap-8 lg:mt-16 lg:gap-10 max-md:flex max-md:snap-x max-md:snap-mandatory max-md:gap-4 max-md:overflow-x-auto max-md:pb-2 max-md:[-ms-overflow-style:none] max-md:[scrollbar-width:none] max-md:[&amp;::-webkit-scrollbar]:hidden"><!--[-->`);
    const each_array = ensure_array_like(data.items);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let t = each_array[$$index];
      $$renderer2.push(`<figure class="max-md:min-w-[min(22rem,calc(100vw-2.5rem))] max-md:shrink-0 max-md:snap-center rounded-2xl border border-white/10 bg-white/[0.04] p-8 backdrop-blur-sm md:min-w-0 md:snap-none"><blockquote class="text-lg leading-relaxed text-white/95 md:text-xl md:leading-relaxed">“${escape_html(t.content)}”</blockquote> <figcaption class="mt-6 border-l-2 border-brand-primary pl-4 text-sm font-semibold text-white">${escape_html(t.name)} `);
      if (t.role) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<span class="mt-1 block font-normal text-gray-400">${escape_html(t.role)}</span>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--></figcaption></figure>`);
    }
    $$renderer2.push(`<!--]--></div></div></section>`);
  });
}
function Groups_section($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { data } = $$props;
    $$renderer2.push(`<section${attr_class(`border-b border-neutral-200/80 bg-white ${stringify(sectionY)}`)}><div${attr_class(container)}><div class="max-w-3xl"><p${attr_class(clsx(eyebrow))}>Community</p> <h2${attr_class(`mt-3 ${stringify(headline)}`)}>${escape_html(data.title ?? "Connect in community")}</h2> <p class="mt-3 max-w-2xl text-base leading-relaxed text-brand-dark/70 md:text-lg">Find a group that fits your season — campus, creatives, and more.</p></div> <div${attr_class(`mt-12 ${stringify(railRow)}`)}><!--[-->`);
    const each_array = ensure_array_like(data.groups);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let g = each_array[$$index];
      $$renderer2.push(`<a${attr("href", `/groups#group-${stringify(g.id)}`)}${attr_class(`${stringify(railItem)} flex flex-col overflow-hidden rounded-2xl border border-neutral-200/80 bg-brand-light p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md md:p-7`)}>`);
      if (g.imageUrl) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<div class="aspect-[16/10] overflow-hidden rounded-xl bg-neutral-200"><img${attr("src", g.imageUrl)} alt="" class="h-full w-full object-cover" loading="lazy" sizes="(max-width: 768px) 85vw, 33vw"/></div>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--> <p class="mt-4 text-[10px] font-bold uppercase tracking-[0.18em] text-brand-primary">${escape_html(g.type)}</p> <h3 class="mt-2 font-sans text-lg font-bold text-brand-dark md:text-xl">${escape_html(g.name)}</h3> <p class="mt-2 text-sm font-medium text-brand-dark/70">${escape_html(g.dayTime)} · Led by ${escape_html(g.leader)}</p> `);
      if (g.description) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<p class="mt-3 text-sm leading-relaxed text-brand-dark/65 line-clamp-4">${escape_html(g.description)}</p>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--> <span class="mt-4 text-xs font-bold uppercase tracking-wide text-brand-primary">View on groups →</span></a>`);
    }
    $$renderer2.push(`<!--]--></div> <div class="mt-10 text-center"><a class="inline-flex rounded-full bg-brand-primary px-8 py-3 text-xs font-bold uppercase tracking-[0.12em] text-white shadow-md transition hover:brightness-105" href="/groups">Find a group</a></div></div></section>`);
  });
}
function Leaders_section($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { data } = $$props;
    $$renderer2.push(`<section${attr_class(`border-b border-neutral-200/80 bg-[#f3f2ef] ${stringify(sectionY)}`)}><div${attr_class(container)}><div class="max-w-3xl"><p${attr_class(clsx(eyebrow))}>Leadership</p> <h2${attr_class(`mt-3 ${stringify(headline)}`)}>${escape_html(data.title ?? "Leadership")}</h2></div> <div class="mt-12 grid gap-10 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3 lg:gap-12"><!--[-->`);
    const each_array = ensure_array_like(data.leaders);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let leader = each_array[$$index];
      $$renderer2.push(`<div class="flex flex-col items-center text-center sm:items-stretch md:text-left lg:items-center lg:text-center">`);
      if (leader.imageUrl) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<div class="relative w-40 overflow-hidden rounded-full shadow-lg ring-4 ring-white sm:w-44"><img${attr("src", leader.imageUrl)} alt="" class="aspect-square w-full object-cover" loading="lazy"/></div>`);
      } else {
        $$renderer2.push("<!--[-1-->");
        $$renderer2.push(`<div class="h-40 w-40 rounded-full bg-neutral-300 sm:h-44 sm:w-44"></div>`);
      }
      $$renderer2.push(`<!--]--> <h3 class="mt-5 font-sans text-lg font-bold text-brand-dark md:text-xl">${escape_html(leader.name)}</h3> <p class="mt-1 text-sm font-semibold text-brand-primary">${escape_html(leader.role)}</p></div>`);
    }
    $$renderer2.push(`<!--]--></div></div></section>`);
  });
}
function Contact_section($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { data } = $$props;
    $$renderer2.push(`<section${attr_class(`border-b border-neutral-200/80 bg-[#f3f2ef] ${stringify(sectionY)}`)}><div${attr_class(container)}><div class="mx-auto max-w-xl lg:mx-0 lg:max-w-none lg:grid lg:grid-cols-12 lg:gap-14 xl:gap-20"><div class="lg:col-span-5"><p${attr_class(clsx(eyebrow))}>Reach out</p> <h2${attr_class(`mt-3 ${stringify(headline)}`)}>${escape_html(data.title ?? "Contact")}</h2> `);
    if (data.intro) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<p class="mt-4 text-lg leading-relaxed text-brand-dark/75 md:text-xl">${escape_html(data.intro)}</p>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></div> <div class="mt-10 lg:col-span-7 lg:mt-0"><form method="POST" action="/contact" class="rounded-3xl border border-neutral-200/90 bg-white p-6 shadow-xl ring-1 ring-black/[0.03] sm:p-8 md:p-10"><div class="space-y-5"><div><label class="text-xs font-bold uppercase tracking-wide text-brand-dark/60" for="contact-name">Name</label> <input id="contact-name" name="name" required="" class="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-4 py-3.5 text-brand-dark outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"/></div> <div><label class="text-xs font-bold uppercase tracking-wide text-brand-dark/60" for="contact-email">Email</label> <input id="contact-email" name="email" type="email" required="" class="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-4 py-3.5 text-brand-dark outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"/></div> <div><label class="text-xs font-bold uppercase tracking-wide text-brand-dark/60" for="contact-message">Message</label> <textarea id="contact-message" name="message" required="" rows="5" class="mt-2 w-full resize-y rounded-xl border border-neutral-200 bg-white px-4 py-3.5 text-brand-dark outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"></textarea></div> <button type="submit" class="btn btn-primary w-full rounded-full py-4 text-xs font-bold uppercase tracking-[0.14em] md:w-auto md:px-12">Send message</button></div></form></div></div></div></section>`);
  });
}
function Home_blocks($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { blocks } = $$props;
    $$renderer2.push(`<!--[-->`);
    const each_array = ensure_array_like(blocks);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let block = each_array[$$index];
      if (block.kind === "HERO") {
        $$renderer2.push("<!--[0-->");
        Hero_section($$renderer2, { data: block.data });
      } else if (block.kind === "EVENTS_RAIL") {
        $$renderer2.push("<!--[1-->");
        Events_rail_section($$renderer2, { data: block.data });
      } else if (block.kind === "BLOG") {
        $$renderer2.push("<!--[2-->");
        $$renderer2.push(`<div id="blog">`);
        Blog_section($$renderer2, { data: block.data });
        $$renderer2.push(`<!----></div>`);
      } else if (block.kind === "TESTIMONIALS") {
        $$renderer2.push("<!--[3-->");
        Testimonials_section($$renderer2, { data: block.data });
      } else if (block.kind === "GROUPS") {
        $$renderer2.push("<!--[4-->");
        $$renderer2.push(`<div id="groups">`);
        Groups_section($$renderer2, { data: block.data });
        $$renderer2.push(`<!----></div>`);
      } else if (block.kind === "SERVE") {
        $$renderer2.push("<!--[5-->");
        $$renderer2.push(`<div id="serve">`);
        Rich_section($$renderer2, { data: block.data, eyebrow: "Serve" });
        $$renderer2.push(`<!----></div>`);
      } else if (block.kind === "LEADERS") {
        $$renderer2.push("<!--[6-->");
        Leaders_section($$renderer2, { data: block.data });
      } else if (block.kind === "IM_NEW") {
        $$renderer2.push("<!--[7-->");
        Rich_section($$renderer2, { data: block.data, eyebrow: "I'm new" });
      } else if (block.kind === "PARENTS") {
        $$renderer2.push("<!--[8-->");
        Rich_section($$renderer2, { data: block.data, eyebrow: "Parents" });
      } else if (block.kind === "FAQ") {
        $$renderer2.push("<!--[9-->");
        $$renderer2.push(`<div id="faq">`);
        Faq_section($$renderer2, { data: block.data });
        $$renderer2.push(`<!----></div>`);
      } else if (block.kind === "CONTACT") {
        $$renderer2.push("<!--[10-->");
        Contact_section($$renderer2, { data: block.data });
      } else if (block.kind === "CUSTOM") {
        $$renderer2.push("<!--[11-->");
        $$renderer2.push(`<section class="border-b border-gray-200 bg-brand-light py-12"><div class="mx-auto max-w-7xl px-4"><pre class="overflow-x-auto rounded-xl bg-white p-4 text-xs text-gray-600">${escape_html(JSON.stringify(block.data, null, 2))}</pre></div></section>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]-->`);
  });
}
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { data } = $$props;
    head("1uha8ag", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>${escape_html(data.settings.seoDefaults.title)}</title>`);
      });
      $$renderer3.push(`<meta name="description"${attr("content", data.settings.seoDefaults.description)}/>`);
    });
    Site_shell($$renderer2, {
      settings: data.settings,
      children: ($$renderer3) => {
        Home_blocks($$renderer3, { blocks: data.blocks });
      }
    });
  });
}
export {
  _page as default
};
