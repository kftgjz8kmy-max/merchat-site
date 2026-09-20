import { defineRouting } from "next-intl/routing";
import { locales } from "./locales";

export const routing = defineRouting({
  locales,
  defaultLocale: "es",
  localePrefix: {
    mode: "as-needed",
    prefixes: {
      "pt-BR": "/pt-br",
      "zh-CN": "/zh-cn",
    },
  },
  localeDetection: false,
});
