export const locales = ["es", "en", "pt-BR", "zh-CN"] as const;

export type AppLocale = (typeof locales)[number];

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
