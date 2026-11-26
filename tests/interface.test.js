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
  assert.ok(sw.includes("rock-b2b-shell-v6"));
  assert.ok(sw.includes("/rock-logo.svg"));
  assert.ok(sw.includes("self.skipWaiting()"));
  assert.ok(sw.includes("self.clients.claim()"));
});


test("the official ROCK wordmark is used in the workspace and sign-in screens", async () => {
  const app = await readFile(new URL("../apps/web/src/App.jsx", import.meta.url), "utf8");
  const logo = await readFile(new URL("../apps/web/public/rock-logo.svg", import.meta.url), "utf8");
  assert.ok(app.includes('src="/rock-logo.svg"'));
  assert.ok(app.includes('BrandMark tone="dark"'));
  assert.ok(app.includes('<BrandMark tone="dark"/>'));
  assert.ok(logo.includes('aria-label="ROCK"'));
});


test("workspace applies a refined white-first design without removing brand accents", async () => {
  const css = await readFile(new URL("../apps/web/src/styles.css", import.meta.url), "utf8");
  const app = await readFile(new URL("../apps/web/src/App.jsx", import.meta.url), "utf8");
  assert.ok(css.includes("ROCK B2B · Premium Light Workspace"));
  assert.ok(css.includes("--canvas:#f6f8fb"));
  assert.ok(css.includes(".sidebar{"));
  assert.ok(css.includes("background:#fff"));
  assert.ok(css.includes("@media(max-width:760px)"));
  assert.ok(app.includes('<BrandMark tone="dark"/>'));
});


test("ROCK B2B uses Naskh for Arabic and Manrope for English typography", async () => {
  const css = await readFile(new URL("../apps/web/src/styles.css", import.meta.url), "utf8");
  const html = await readFile(new URL("../apps/web/index.html", import.meta.url), "utf8");
  assert.ok(css.includes("Noto+Naskh+Arabic"));
  assert.ok(css.includes("Manrope:wght@400;500;600;700;800"));
  assert.ok(css.includes('[lang="en"]'));
  assert.ok(css.includes('[dir="ltr"]'));
  assert.ok(!css.includes("IBM Plex Sans Arabic"));
  assert.ok(!css.includes("Inter"));
  assert.ok(html.includes('rel="preconnect" href="https://fonts.googleapis.com"'));
  assert.ok(html.includes('href="https://fonts.gstatic.com" crossorigin'));
});


test("Apple-inspired workspace provides keyboard search and mobile navigation", async () => {
  const app = await readFile(new URL("../apps/web/src/App.jsx", import.meta.url), "utf8");
  const css = await readFile(new URL("../apps/web/src/styles.css", import.meta.url), "utf8");
  assert.ok(app.includes("function CommandPalette"));
  assert.ok(app.includes('role="dialog" aria-modal="true"'));
  assert.ok(app.includes("Ctrl K"));
  assert.ok(app.includes("event.metaKey||event.ctrlKey"));
  assert.ok(app.includes('className="mobile-tabbar"'));
  assert.ok(app.includes("sidebar-toggle"));
  assert.ok(css.includes(".command-palette"));
  assert.ok(css.includes(".mobile-tabbar"));
  assert.ok(css.includes(".sidebar.collapsed"));
  assert.ok(css.includes("prefers-reduced-motion:reduce"));
});
