import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { seed } from "../apps/web/src/data.js";

const products = seed.products;
const representatives = seed.reps;

test("ROCK 2026 catalogue contains exactly 41 products", () => {
  assert.equal(products.length, 41);
  assert.ok(products.every((product) => product.catalogVersion === "ROCK-2026"));
});

test("catalogue department totals match the supplied price list", () => {
  const counts = Object.fromEntries(
    [...new Set(products.map((product) => product.category))]
      .map((category) => [category, products.filter((product) => product.category === category).length])
  );
  assert.deepEqual(counts, {
    "الكابلات": 6,
    "الشواحن": 6,
    "السماعات": 14,
    "ROCK Lifestyle": 9,
    "منتجات إضافية": 6
  });
});

test("each barcode is stored as text and unique", () => {
  const barcodes = products.map((product) => product.barcode);
  assert.ok(barcodes.every((barcode) => typeof barcode === "string" && /^\d{8,14}$/.test(barcode)));
  assert.equal(new Set(barcodes).size, products.length);
});

test("distribution prices are numeric and do not assume a currency or tax rate", () => {
  assert.ok(products.every((product) => Number.isFinite(product.price) && product.price >= 0));
  assert.ok(products.every((product) => product.priceCurrency === null && product.vat === null));
});

test("product identifiers, model fields and image availability are explicit", () => {
  assert.equal(new Set(products.map((product) => product.id)).size, 41);
  assert.ok(products.every((product) => product.id && product.sku && product.name && product.description));
  assert.equal(products.filter((product) => product.imageUrl).length, 38);
  assert.equal(products.filter((product) => !product.model).length, 7);
});

test("four new representatives remain in the shared sales roster", () => {
  const names = new Set(representatives.map((rep) => rep.name));
  for (const name of ["خلدون", "نبراس", "يحيى", "علي"]) assert.ok(names.has(name), name);
});

test("server bootstrap provisions login accounts for every newly added representative", async () => {
  const server = await readFile(new URL("../lib/server.js", import.meta.url), "utf8");
  for (const [username, envKey, repName] of [
    ["khaldoun", "ROCK_REP_KHALDOUN_PASSWORD", "خلدون"],
    ["khaled", "ROCK_REP_KHALED_PASSWORD", "خالد"],
    ["mohammed", "ROCK_REP_MOHAMMED_PASSWORD", "محمد"],
    ["nebras", "ROCK_REP_NEBRAS_PASSWORD", "نبراس"],
    ["yahya", "ROCK_REP_YAHYA_PASSWORD", "يحيى"],
    ["ali", "ROCK_REP_ALI_PASSWORD", "علي"]
  ]) {
    assert.ok(server.includes(`["${username}", "${repName}", "rep", "${repName}", process.env.${envKey}]`));
  }
});


test("bootstrap password rotation is versioned and never runs on every cold start", async () => {
  const server = await readFile(new URL("../lib/server.js", import.meta.url), "utf8");
  assert.ok(server.includes("ROCK_BOOTSTRAP_PASSWORD_VERSION"));
  assert.ok(server.includes("bootstrap_password_version"));
  assert.ok(server.includes("UPDATE rock_users SET password_hash"));
});

test("pilot cleanup snapshots the workspace and targets only shipped demo record IDs", async () => {
  const server = await readFile(new URL("../lib/server.js", import.meta.url), "utf8");
  assert.ok(server.includes("rock_workspace_snapshots"));
  assert.ok(server.includes("pilot-cleanup-"));
  for (const collection of ["customers", "orders", "invoices", "payments", "visits"]) {
    assert.ok(server.includes(`seed.${collection}`));
    assert.ok(server.includes(`${collection}: (workspaceData.${collection} || []).filter`));
  }
});

test("invoice UI clearly labels demo invoices as not tax invoices", async () => {
  const app = await readFile(new URL("../apps/web/src/App.jsx", import.meta.url), "utf8");
  assert.ok(app.includes("DEMO — NOT A TAX INVOICE"));
});
