import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const templateRoot = new URL("../", import.meta.url);

test("uses the Vercel-compatible Next.js runtime", async () => {
  const [packageJson, page, landingPage, layout, site, spanishMessages] = await Promise.all([
    readFile(new URL("../package.json", import.meta.url), "utf8"),
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/LandingPage.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../config/site.ts", import.meta.url), "utf8"),
    readFile(new URL("../messages/es.json", import.meta.url), "utf8"),
  ]);

  assert.match(packageJson, /"next": "\^16\.2\.6"/);
  assert.match(packageJson, /"build": "next build"/);
  assert.doesNotMatch(packageJson, /"build": ".*vinext build"/);
  assert.match(site, /name: "merchat"/);
  assert.doesNotMatch(`${page}\n${landingPage}`, new RegExp(["Mercado", "Chat"].join("")));
  assert.match(spanishMessages, /Mercado Libre/);
  assert.match(layout, /generateMetadata/);
  assert.match(layout, /icon: siteConfig\.brand\.icon/);
  assert.match(landingPage, /src=\{siteConfig\.brand\.logo\}/);
  assert.doesNotMatch(`\n\n\n`, /MercadoChat|mercadochat-(logo|icon)/i);
});

test("does not retain the disposable Sites preview scaffold", async () => {
  const [page, layout, packageJson] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  assert.doesNotMatch(page, /SkeletonPreview|_sites-preview|codex-preview|react-loading-skeleton/);
  assert.doesNotMatch(layout, /codex-preview|_sites-preview|react-loading-skeleton/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);

  await assert.rejects(
    access(new URL("app/_sites-preview", templateRoot)),
  );
});

test("uses the merchat brand assets without retaining the old public paths", async () => {
  const [site, layout, page, landingPage] = await Promise.all([
    readFile(new URL("../config/site.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/LandingPage.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(site, /name: "merchat"/);
  assert.match(site, /\/brand\/merchat-logo\.png/);
  assert.match(site, /\/brand\/merchat-icon\.png/);
  const previousAssetPrefix = ["mercado", "chat"].join("");
  assert.doesNotMatch(`${site}\n${layout}\n${page}\n${landingPage}`, new RegExp(`${previousAssetPrefix}-(logo|icon)`, "i"));

  await Promise.all([
    access(new URL("../public/brand/merchat-logo.png", import.meta.url)),
    access(new URL("../public/brand/merchat-icon.png", import.meta.url)),
  ]);

  await assert.rejects(
    access(new URL("../public/favicon.svg", import.meta.url)),
  );
});
