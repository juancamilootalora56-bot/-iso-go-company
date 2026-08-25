const BASE_URL = "https://www.isogo.company";
const LOCALES = ["es", "en", "pt"] as const;
type Locale = (typeof LOCALES)[number];

export function buildAlternates(locale: string, path: string) {
  const l = (LOCALES as readonly string[]).includes(locale) ? (locale as Locale) : "es";
  const suffix = path ? `/${path}` : "";
  return {
    canonical: `${BASE_URL}/${l}${suffix}`,
    languages: Object.fromEntries(LOCALES.map((loc) => [loc, `${BASE_URL}/${loc}${suffix}`])),
  };
}
