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
  assert.ok(sw.includes("rock-b2b-shell-v7"));
  assert.ok(sw.includes("/rock-logo.svg"));
  assert.ok(sw.includes("self.skipWaiting()"));
  assert.ok(sw.includes("self.clients.claim()"));
});


test("the official ROCK wordmark is used in the workspace and sign-in screens", async () => {
  const app = await readFile(new URL("../apps/web/src/App.jsx", import.meta.url), "utf8");
  const logo = await readFile(new URL("../apps/web/public/rock-logo.svg", import.meta.url), "utf8");
  assert.ok(app.includes('src="/rock-logo.svg"') || app.includes('src={`${import.meta.env.BASE_URL}rock-logo.svg`}'));
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
  assert.ok(app.includes("sidebar-rail-mark"));
  assert.ok(css.includes(".sidebar.collapsed .brand .sidebar-rail-mark"));
  assert.ok(css.includes(".command-palette"));
  assert.ok(css.includes(".mobile-tabbar"));
  assert.ok(css.includes(".sidebar.collapsed"));
  assert.ok(css.includes("prefers-reduced-motion:reduce"));
});


test("uploaded representative debt report matches source totals and preserves blank due fields", async () => {
  const { repDebtRows, repDebtReportMeta } = await import("../apps/web/src/debt-reports.js");
  const app = await readFile(new URL("../apps/web/src/App.jsx", import.meta.url), "utf8");
  const totalDebt = repDebtRows.reduce((sum, row) => sum + row.debt, 0);
  const knownDue = repDebtRows.reduce((sum, row) => sum + (row.due == null ? 0 : row.due), 0);
  const missingDue = repDebtRows.filter(row => row.due == null).length;

  assert.equal(repDebtRows.length, 36);
  assert.equal(Math.round(totalDebt * 100) / 100, repDebtReportMeta.reportedTotals.debt);
  assert.equal(Math.round(knownDue * 100) / 100, repDebtReportMeta.reportedTotals.due);
  assert.equal(missingDue, repDebtReportMeta.reportedTotals.missingDue);
  assert.deepEqual(
    [...new Set(repDebtRows.map(row => row.rep))],
    ["نبراس", "يحيى", "خلدون"]
  );
  assert.ok(app.includes('["rep-debts","تقارير المناديب"'));
  assert.ok(app.includes("تصدير التقرير CSV"));
  assert.ok(app.includes('row.due==null?<span className="debt-unknown">غير محدد'));
});


test("ROCK B2B dashboard uses a role-aware workflow map and interactive chart controls", async () => {
  const app = await readFile(new URL("../apps/web/src/App.jsx", import.meta.url), "utf8");
  const css = await readFile(new URL("../apps/web/src/styles.css", import.meta.url), "utf8");
  assert.ok(app.includes("const visibleWorkflowSteps=workflowSteps.filter"));
  assert.ok(app.includes("steps={visibleWorkflowSteps}"));
  assert.ok(app.includes("onNavigate={key=>{if(menus.some"));
  assert.ok(app.includes('aria-pressed={Boolean(chartSeries[item.key])}'));
  assert.ok(app.includes('className="nav-icon-badge"'));
  assert.ok(css.includes(".workflow-map"));
  assert.ok(css.includes(".workflow-node.tone-blue"));
  assert.ok(css.includes(".workflow-node.tone-green"));
  assert.ok(css.includes(".chart-legend-button.sales.active"));
  assert.ok(css.includes(".chart-legend-button.collections.active"));
  assert.ok(css.includes("@media(max-width:390px)"));
});


test("representative workspace scopes account data and adds a personal field dashboard", async () => {
  const app = await readFile(new URL("../apps/web/src/App.jsx", import.meta.url), "utf8");
  const css = await readFile(new URL("../apps/web/src/styles.css", import.meta.url), "utf8");
  assert.ok(app.includes('const currentRepName=role==="rep"'));
  assert.ok(app.includes("const scopedCustomers=role==="));
  assert.ok(app.includes("const scopedOrders=role==="));
  assert.ok(app.includes("const scopedInvoices=role==="));
  assert.ok(app.includes("const scopedVisits=role==="));
  assert.ok(app.includes("rep-dashboard"));
  assert.ok(app.includes("repFollowUps"));
  assert.ok(css.includes(".rep-hero"));
  assert.ok(css.includes(".rep-dashboard-grid"));
  assert.ok(css.includes("@media(max-width:760px)"));
});

test("field visits capture GPS only after a user action and provide an interactive map", async () => {
  const app = await readFile(new URL("../apps/web/src/App.jsx", import.meta.url), "utf8");
  const css = await readFile(new URL("../apps/web/src/styles.css", import.meta.url), "utf8");
  assert.ok(app.includes("navigator.geolocation.getCurrentPosition"));
  assert.ok(app.includes("capturedAt:new Date().toISOString()"));
  assert.ok(app.includes("selectedVisitHasLocation"));
  assert.ok(app.includes('https://maps.google.com/maps?q='));
  assert.ok(app.includes('className="visit-map-layout"'));
  assert.ok(app.includes("لا يتم الوصول للموقع إلا عند الضغط والموافقة"));
  assert.ok(css.includes(".visit-map-frame iframe"));
  assert.ok(css.includes(".location-capture"));
});

test("representatives can submit collections only as pending finance verification", async () => {
  const app = await readFile(new URL("../apps/web/src/App.jsx", import.meta.url), "utf8");
  const api = await readFile(new URL("../api/data.js", import.meta.url), "utf8");
  assert.ok(app.includes('["payments","التحصيلات والذمم",Wallet,["owner","finance","rep"]]'));
  assert.ok(app.includes('const confirmed=role!=="rep"&&method==="نقدي"'));
  assert.ok(api.includes("validateRepresentativePayments"));
  assert.ok(api.includes("ownInvoiceIds.has(x.invoiceId)"));
});


test("representative dashboard imports every rendered icon and clears visit reminders using recorded visits", async () => {
  const app = await readFile(new URL("../apps/web/src/App.jsx", import.meta.url), "utf8");
  assert.ok(app.includes("CalendarClock"));
  assert.ok(app.includes("const customerVisitDates=scopedVisits.filter"));
  assert.ok(app.includes("const lastVisitDate=[customer.lastVisit,...customerVisitDates]"));
  assert.ok(app.includes('customers:role==="rep"?o.customers:'));
});
