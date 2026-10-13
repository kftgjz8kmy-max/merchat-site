export const locales = ["es", "en", "pt-BR", "zh-CN"] as const;

export type AppLocale = (typeof locales)[number];

export const localeCookieName = "merchat-language";
export const localeCookieMaxAge = 60 * 60 * 24 * 365;

export function normalizeLocale(value: string | null | undefined): AppLocale | null {
  switch (value?.toLowerCase()) {
    case "es": return "es";
    case "en": return "en";
    case "pt-br": return "pt-BR";
    case "zh-cn": return "zh-CN";
    default: return null;
  }
}

function localeForLanguageTag(value: string): AppLocale | null {
  const languageTag = value.toLowerCase();
  if (languageTag === "es" || languageTag.startsWith("es-")) return "es";
  if (languageTag === "en" || languageTag.startsWith("en-")) return "en";
  if (languageTag === "pt" || languageTag.startsWith("pt-")) return "pt-BR";
  if (languageTag === "zh" || languageTag.startsWith("zh-")) return "zh-CN";
  return null;
}

export function detectLocaleFromAcceptLanguage(header: string | null): AppLocale {
  const preferences = (header ?? "").split(",").map((entry, index) => {
    const [tag, ...parameters] = entry.trim().split(";");
    const quality = parameters.find((parameter) => parameter.trim().startsWith("q="))?.trim().slice(2);
    const weight = quality === undefined ? 1 : Number(quality);
    return { tag, weight: Number.isFinite(weight) ? weight : 0, index };
  }).filter(({ tag, weight }) => tag && weight > 0)
    .sort((a, b) => b.weight - a.weight || a.index - b.index);

  for (const { tag } of preferences) {
    const locale = localeForLanguageTag(tag);
    if (locale) return locale;
  }
  return "es";
}

export const localePaths: Record<AppLocale, string> = {
  es: "/",
  en: "/en",
  "pt-BR": "/pt-br",
  "zh-CN": "/zh-cn",
};

export const localeOptions: ReadonlyArray<{ code: AppLocale; label: string; shortLabel: string }> = [
  { code: "es", label: "Español", shortLabel: "ES" },
  { code: "en", label: "English", shortLabel: "EN" },
  { code: "pt-BR", label: "Português", shortLabel: "PT" },
  { code: "zh-CN", label: "中文", shortLabel: "中文" },
];
