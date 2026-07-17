export const SITE_NAME = "Fieldops";
export const SITE_DESCRIPTION =
  "Operations platform for field teams, jobsites, and workflows.";
export const OG_IMAGE_PATH = "/og-image.png";

export function resolveSiteOrigin(
  requestOrigin?: string,
  matches?: ReadonlyArray<{ loaderData: unknown } | undefined>,
) {
  if (requestOrigin) {
    return requestOrigin.replace(/\/$/, "");
  }

  if (matches) {
    for (const match of matches) {
      if (!match) continue;
      const loaderData = match.loaderData as { siteOrigin?: string } | undefined;
      if (loaderData?.siteOrigin) {
        return loaderData.siteOrigin.replace(/\/$/, "");
      }
    }
  }

  const configured = import.meta.env.VITE_SITE_URL;
  if (typeof configured === "string" && configured.length > 0) {
    return configured.replace(/\/$/, "");
  }

  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  return "http://localhost:5173";
}

export function absoluteSiteUrl(path: string, origin?: string) {
  return new URL(path, `${resolveSiteOrigin(origin)}/`).href;
}

type SiteMetaOptions = {
  title?: string;
  description?: string;
  path?: string;
  origin?: string;
  matches?: ReadonlyArray<{ loaderData: unknown } | undefined>;
};

export function createSiteMeta({
  title = SITE_NAME,
  description = SITE_DESCRIPTION,
  path = "/",
  origin,
  matches,
}: SiteMetaOptions = {}) {
  const siteOrigin = resolveSiteOrigin(origin, matches);
  const url = new URL(path, `${siteOrigin}/`).href;
  const ogImage = absoluteSiteUrl(OG_IMAGE_PATH, siteOrigin);

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
