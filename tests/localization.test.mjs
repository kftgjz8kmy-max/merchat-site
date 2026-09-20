import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("Spanish is the default locale and every language uses the shared landing page", async () => {
  const [routing, locales, rootPage, localePage] = await Promise.all([
    read("i18n/routing.ts"),
    read("i18n/locales.ts"),
    read("app/page.tsx"),
    read("app/[locale]/page.tsx"),
  ]);

  assert.match(routing, /defaultLocale:\s*"es"/);
  assert.match(routing, /localeDetection:\s*false/);
  assert.match(locales, /es:\s*"\/"/);
  assert.match(rootPage, /import LandingPage from "@\/components\/LandingPage"/);
  assert.match(localePage, /import LandingPage from "@\/components\/LandingPage"/);
});

test("Spanish content is the recursive fallback for every message consumer", async () => {
  const [messageSource, request, landingConfig] = await Promise.all([
    read("i18n/messages.ts"),
    read("i18n/request.ts"),
    read("config/landing.ts"),
  ]);

  assert.match(messageSource, /return spanish;/);
  assert.match(messageSource, /mergeWithSpanish\(value, translated\[index\]\)/);
  assert.match(messageSource, /getLocaleMessages/);
  assert.match(request, /messages:\s*getLocaleMessages\(locale\)/);
  assert.match(landingConfig, /return getLocaleMessages\(locale\)\.landing/);
  assert.match(landingConfig, /return getLocaleMessages\(locale\)\.ui/);
});

test("the shared onboarding section exposes the ChatGPT guide link", async () => {
  const [landingPage, site, spanishMessages] = await Promise.all([
    read("components/LandingPage.tsx"),
    read("config/site.ts"),
    read("messages/es.json"),
  ]);

  assert.match(landingPage, /siteConfig\.chatgptGuideUrl/);
  assert.match(landingPage, /ui\.chatgptGuideLabel/);
  assert.match(site, /chatgptGuideUrl: "https:\/\/ml-automation-iota\.vercel\.app\/guia-chatgpt"/);
  assert.match(spanishMessages, /"chatgptGuideLabel": "Guía para conectar merchat a ChatGPT"/);
});
