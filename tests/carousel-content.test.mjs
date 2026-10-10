import assert from "node:assert/strict";
import { readFile, access } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const locales = ["es", "en", "pt-BR", "zh-CN"];
const readMessages = async (locale) => JSON.parse(await readFile(new URL(`messages/${locale}.json`, root), "utf8"));

test("every locale has the same 12 workflows and four distinct existing photos", async () => {
  const messages = await Promise.all(locales.map(readMessages));
  const ids = messages[0].landing.useCases.map((card) => card.id);
  assert.equal(ids.length, 12);
  assert.equal(new Set(ids).size, 12);
  for (const { landing, ui } of messages) {
    assert.deepEqual(landing.useCases.map((card) => card.id), ids);
    assert.equal(new Set(landing.useCases.map((card) => card.resultType)).size, 12);
    assert.equal(landing.photoExamples.length, 4);
    assert.equal(new Set(landing.photoExamples.map((photo) => photo.image)).size, 4);
    for (const card of landing.useCases) {
      for (const value of [card.category, card.prompt, card.resultTitle, card.resultDescription, card.preview.label, card.preview.status]) assert.ok(value?.trim());
      assert.ok(Array.isArray(card.preview.items));
    }
    assert.ok(ui.showcaseIntro && ui.showcaseDisclaimer);
    for (const photo of landing.photoExamples) await access(new URL(`public${photo.image}`, root));
  }
});

test("illustrative previews preserve approval gates, uncertainty and account separation", async () => {
  const { landing } = await readMessages("es");
  const byId = Object.fromEntries(landing.useCases.map((card) => [card.id, card]));
  assert.match(byId["photo-listing"].preview.status, /pendiente de aprobación/);
  assert.match(byId["inventory-file"].preview.status, /Pendiente de aprobación/);
  assert.match(byId["photo-order"].preview.status, /Pendiente de aprobación/);
  assert.match(byId["batch-campaign"].preview.status, /después de aprobar/);
  assert.equal(byId["batch-campaign"].preview.items[1].value, "21/21");
  assert.match(byId["market-research"].preview.status, /ilustrativa/);
  assert.match(byId["margin-diagnosis"].preview.status, /Costos aportados/);
  assert.match(byId["stock-coverage"].preview.status, /Si continúa/);
  assert.deepEqual(byId["account-comparison"].preview.items.map((item) => item.label), ["Tienda A", "Tienda B"]);
  assert.match(byId["order-status"].preview.items[1].label, /Pendiente/);
});
