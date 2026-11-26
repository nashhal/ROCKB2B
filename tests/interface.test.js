import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("premium sign-in has a responsive branded layout", async () => {
  const app = await readFile(new URL("../apps/web/src/App.jsx", import.meta.url), "utf8");
  const css = await readFile(new URL("../apps/web/src/styles.css", import.meta.url), "utf8");
  assert.ok(app.includes('className="auth-shell"'));
  assert.ok(app.includes('className="auth-aside"'));
  assert.ok(css.includes(".auth-shell"));
  assert.ok(css.includes("@media(max-width:760px)"));
  assert.ok(css.includes(".auth-screen > .auth-card:not(form)"));
});

test("ROCK interface uses a consistent brand palette and accessible focus states", async () => {
  const css = await readFile(new URL("../apps/web/src/styles.css", import.meta.url), "utf8");
  const icon = await readFile(new URL("../apps/web/public/icon.svg", import.meta.url), "utf8");
  assert.ok(css.includes("--navy:#071a33"));
  assert.ok(css.includes("--blue:#1479dc"));
  assert.ok(css.includes("button:focus-visible"));
  assert.ok(css.includes("prefers-reduced-motion:reduce"));
  assert.ok(icon.includes("#050505"));
  assert.ok(icon.includes("#FFFFFF"));
});

test("desktop and mobile workspaces have dedicated layout rules", async () => {
  const css = await readFile(new URL("../apps/web/src/styles.css", import.meta.url), "utf8");
  assert.ok(css.includes(".sidebar{"));
  assert.ok(css.includes(".main{"));
  assert.ok(css.includes("@media(max-width:1100px)"));
  assert.ok(css.includes("@media(max-width:760px)"));
  assert.ok(css.includes(".table-wrap"));
  assert.ok(css.includes("scroll-behavior:smooth"));
});

test("service worker rotates the shell cache so installed apps receive the new interface", async () => {
  const sw = await readFile(new URL("../apps/web/public/sw.js", import.meta.url), "utf8");
  assert.ok(sw.includes("rock-b2b-shell-v3"));
  assert.ok(sw.includes("/rock-logo.svg"));
  assert.ok(sw.includes("self.skipWaiting()"));
  assert.ok(sw.includes("self.clients.claim()"));
});


test("the official ROCK wordmark is used in the workspace and sign-in screens", async () => {
  const app = await readFile(new URL("../apps/web/src/App.jsx", import.meta.url), "utf8");
  const logo = await readFile(new URL("../apps/web/public/rock-logo.svg", import.meta.url), "utf8");
  assert.ok(app.includes('src="/rock-logo.svg"'));
  assert.ok(app.includes('BrandMark tone="dark"'));
  assert.ok(app.includes('BrandMark tone="light"'));
  assert.ok(logo.includes('aria-label="ROCK"'));
});
