export type Locale = "en" | "ja";

/** Picks Japanese only when the user's top-priority language is Japanese. */
export function localeFromAcceptLanguage(header: string | null | undefined): Locale {
  const top = (header ?? "")
    .split(",")
    .map((part, index) => {
      const [tag, ...params] = part.trim().split(";");
      const q = params
        .map((p) => p.trim())
        .find((p) => p.startsWith("q="));
      const weight = q ? Number(q.slice(2)) : 1;
      return { tag: tag.toLowerCase(), weight: Number.isFinite(weight) ? weight : 0, index };
    })
    .filter((entry) => entry.tag && entry.tag !== "*" && entry.weight > 0)
    .sort((a, b) => b.weight - a.weight || a.index - b.index)[0];
  return top && (top.tag === "ja" || top.tag.startsWith("ja-")) ? "ja" : "en";
}

/** BCP 47 tag for Intl / toLocaleString. */
export function intlLocale(locale: Locale) {
  return locale === "ja" ? "ja-JP" : "en-US";
}

/** Declares a message table; the Japanese table must match the English shape. */
export function defineMessages<T>(en: T, ja: NoInfer<T>): Record<Locale, T> {
  return { en, ja };
}

/** Locale for non-React client code, taken from the server-rendered <html lang>. */
export function documentLocale(): Locale {
  if (typeof document === "undefined") return "en";
  return document.documentElement.lang === "ja" ? "ja" : "en";
}
