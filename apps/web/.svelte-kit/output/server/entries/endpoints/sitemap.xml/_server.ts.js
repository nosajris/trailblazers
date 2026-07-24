import { s as services } from "../../../chunks/services.js";
const GET = async ({ url }) => {
  const origin = url.origin;
  const [sermons, events, posts] = await Promise.all([
    services.sermons.getAllSermons(),
    services.events.listUpcomingForHome(20),
    services.blog.listPublished(20)
  ]);
  const staticPages = ["", "/watch", "/bep-hub", "/events", "/groups", "/give", "/plan-a-visit", "/serve", "/stories"];
  const urls = [
    ...staticPages.map((path) => `<url><loc>${origin}${path}</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>`),
    ...sermons.map((s) => `<url><loc>${origin}/watch</loc><changefreq>weekly</changefreq><priority>0.7</priority></url>`),
    ...events.map((e) => `<url><loc>${origin}/events/${e.id}</loc><changefreq>daily</changefreq><priority>0.9</priority></url>`),
    ...posts.map((p) => `<url><loc>${origin}/stories/${p.id}</loc><changefreq>monthly</changefreq><priority>0.6</priority></url>`)
  ];
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`;
  return new Response(body, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "max-age=0, s-maxage=3600"
    }
  });
};
export {
  GET
};
