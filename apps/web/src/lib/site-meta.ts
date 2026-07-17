export const SITE_NAME = "MT Operation Systems";
export const SITE_DESCRIPTION =
  "operations platform for invoices, jobsites and teams.";
export const OG_IMAGE_PATH = "/og-image.png";

export function getSiteOrigin() {
  const configured = import.meta.env.VITE_SITE_URL;
  if (typeof configured === "string" && configured.length > 0) {
    return configured.replace(/\/$/, "");
  }

  if (typeof process !== "undefined" && process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return "http://localhost:5173";
}

export function absoluteSiteUrl(path: string) {
  return new URL(path, `${getSiteOrigin()}/`).href;
}

type SiteMetaOptions = {
  title?: string;
  description?: string;
  path?: string;
};

export function createSiteMeta({
  title = SITE_NAME,
  description = SITE_DESCRIPTION,
  path = "/",
}: SiteMetaOptions = {}) {
  const origin = getSiteOrigin();
  const url = new URL(path, `${origin}/`).href;
  const ogImage = absoluteSiteUrl(OG_IMAGE_PATH);

  return [
    { title },
    { name: "description", content: description },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:image", content: ogImage },
    { property: "og:image:alt", content: SITE_NAME },
    { property: "og:type", content: "website" },
    { property: "og:site_name", content: SITE_NAME },
    { property: "og:url", content: url },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: ogImage },
  ];
}
