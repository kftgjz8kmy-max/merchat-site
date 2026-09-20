import englishMessages from "@/messages/en.json";
import portugueseMessages from "@/messages/pt-BR.json";
import spanishMessages from "@/messages/es.json";
import chineseMessages from "@/messages/zh-CN.json";
import type { AppLocale } from "./locales";

const messagesByLocale = {
  es: spanishMessages,
  en: englishMessages,
  "pt-BR": portugueseMessages,
  "zh-CN": chineseMessages,
} as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function mergeWithSpanish<T>(spanish: T, translated: unknown): T {
  if (translated === undefined) return spanish;
  if (Array.isArray(spanish)) {
    if (!Array.isArray(translated)) return spanish;
    return spanish.map((value, index) => mergeWithSpanish(value, translated[index])) as T;
  }
  if (isRecord(spanish) && isRecord(translated)) {
    return Object.fromEntries(Object.entries(spanish).map(([key, value]) => [key, mergeWithSpanish(value, translated[key])])) as T;
  }
  return translated as T;
}

export function getLocaleMessages(locale: string) {
  const translated = messagesByLocale[locale as AppLocale] ?? spanishMessages;
  return mergeWithSpanish(spanishMessages, translated);
}
