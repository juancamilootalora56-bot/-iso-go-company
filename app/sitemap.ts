import { MetadataRoute } from "next";

const baseUrl = "https://isogo.company";
const locales = ["es", "en", "pt"];

const pages = [
  "",
  "/nosotros",
  "/certificaciones",
  "/kosher",
  "/especialidades",
  "/software",
  "/blog",
  "/contacto",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const urls: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    for (const page of pages) {
      urls.push({
        url: `${baseUrl}/${locale}${page}`,
        lastModified: new Date(),
        changeFrequency: page === "" ? "weekly" : "monthly",
        priority: page === "" ? 1 : page === "/certificaciones" || page === "/kosher" ? 0.9 : 0.8,
      });
    }
  }

  return urls;
}
