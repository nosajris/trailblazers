import { s as services } from "../../chunks/services.js";
const load = async ({ url }) => {
  const settings = await services.settings.getBundle();
  const siteUrl = url.origin;
  const orgName = settings.siteExtras.organizationName ?? "Trailblazers Young Adults";
  const jsonLdOrganization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: orgName,
    url: siteUrl,
    description: settings.seoDefaults.description
  };
  const jsonLdWebsite = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: settings.seoDefaults.title,
    url: siteUrl,
    publisher: {
      "@type": "Organization",
      name: orgName
    }
  };
  return { siteUrl, jsonLdOrganization, jsonLdWebsite };
};
export {
  load
};
