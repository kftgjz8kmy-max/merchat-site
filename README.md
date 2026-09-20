# merchat landing page

The merchat marketing site is a shared Next/Vinext App Router landing page. It
uses React, TypeScript, next-intl, and the shared `LandingPage` component for
every language.

## Locales and content

Spanish is the default language at `/`. The other routes use the same site
structure and change only the locale and message content:

- `/` — Spanish (`es`)
- `/en` — English (`en`)
- `/pt-br` — Brazilian Portuguese (`pt-BR`)
- `/zh-cn` — Simplified Chinese (`zh-CN`)

Spanish is the canonical content source. Add new user-facing copy to
`messages/es.json` first. Add translations to the other locale files when
available. Missing translations fall back recursively to Spanish, including
nested landing content, UI labels, metadata, and partially translated arrays.

The main files are:

- `components/LandingPage.tsx` — shared site structure and interactions.
- `messages/es.json` — Spanish source copy and fallback content.
- `messages/en.json`, `messages/pt-BR.json`, `messages/zh-CN.json` — optional
  translations with the same message shape.
- `i18n/locales.ts` — supported locales, paths, and language switcher labels.
- `i18n/messages.ts` — recursive Spanish fallback merge.
- `i18n/routing.ts` and `i18n/request.ts` — locale routing and message loading.
- `config/landing.ts` — typed access to localized landing content.
- `config/site.ts` — product identity and external links.
- `public/animations/pregunta-viva/pregunta-viva.html` — shared hero animation;
  add locale-specific animation copy there when needed.

When adding a section, update the shared component and add its Spanish copy to
`messages/es.json`. It will appear on every locale immediately; untranslated
locales will show the Spanish copy until their translation is added. Keep
structure and behavior in the shared component so languages do not become
separate site implementations.

## Commands

```bash
npm install
npm run dev
npm run lint
npm run typecheck
npm run build
npm test
```

Use Node.js 22.13 or newer. Do not edit or commit generated output such as
`.next/`, `dist/`, `build/`, `.vinext/`, or `.wrangler/`.
