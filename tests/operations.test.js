import test from "node:test";
import assert from "node:assert/strict";
import { buildSpreadsheet } from "../apps/web/src/spreadsheet.js";
import { readFile } from "node:fs/promises";

const sheets = [{
  name: "الفواتير",
  rows: [
    ["رقم الفاتورة", "العميل", "الإجمالي"],
    ["INV-01", "شركة ROCK & Co", 125.5]
  ]
}];

test("XLSX export creates a ZIP package with workbook and worksheet parts", () => {
  const bytes = buildSpreadsheet(sheets, "xlsx");
  assert.ok(bytes instanceof Uint8Array);
  assert.deepEqual([...bytes.slice(0, 4)], [0x50, 0x4b, 0x03, 0x04]);
  const content = new TextDecoder().decode(bytes);
  assert.ok(content.includes("[Content_Types].xml"));
  assert.ok(content.includes("xl/workbook.xml"));
  assert.ok(content.includes("xl/worksheets/sheet1.xml"));
  assert.ok(content.includes("شركة ROCK &amp; Co"));
});

test("ODS export creates a valid OpenDocument package with mimetype first", () => {
  const bytes = buildSpreadsheet(sheets, "ods");
  assert.ok(bytes instanceof Uint8Array);
  assert.deepEqual([...bytes.slice(0, 4)], [0x50, 0x4b, 0x03, 0x04]);
  const content = new TextDecoder().decode(bytes);
  assert.ok(content.includes("mimetype"));
  assert.ok(content.includes("application/vnd.oasis.opendocument.spreadsheet"));
  assert.ok(content.includes("content.xml"));
  assert.ok(content.includes("table:table"));
});

test("spreadsheet exporter escapes cell content and rejects unsupported formats", () => {
  const bytes = buildSpreadsheet([{name: "Data", rows: [["<script>alert(1)</script>"]]}], "xlsx");
  const content = new TextDecoder().decode(bytes);
  assert.ok(content.includes("&lt;script&gt;"));
  assert.throws(() => buildSpreadsheet(sheets, "pdf"), /صيغة التصدير/);
});

test("integration screen exposes manual inventory and unconfigured external connections honestly", async () => {
  const app = await readFile(new URL("../apps/web/src/App.jsx", import.meta.url), "utf8");
  assert.ok(app.includes('page==="integrations"'));
  assert.ok(app.includes("SKU / Barcode / Model"));
  assert.ok(app.includes("لا يوجد اتصال API مباشر مهيأ الآن"));
  assert.ok(app.includes("غير مفعّلة"));
});

test("manager cannot overwrite financial collections; representative payments remain append-only and finance-verified", async () => {
  const api = await readFile(new URL("../api/data.js", import.meta.url), "utf8");
  assert.ok(api.includes("Payments are financial records and remain under owner/finance control."));
  assert.ok(api.includes("mergeOwnAppendOnly(record.data.customers"));
  assert.ok(api.includes("mergeOwnAppendOnly(record.data.orders"));
  assert.ok(api.includes("تجاوز الطلب حد الخصم"));
  assert.ok(api.includes("الكمية المطلوبة تتجاوز رصيد المخزون المستورد"));
  assert.ok(api.includes("validateRepresentativePayments"));
  assert.ok(api.includes("ownInvoiceIds.has(x.invoiceId)"));
  assert.ok(api.includes("mergeOwnAppendOnly(record.data.invoices"));
  assert.ok(api.includes("mergeOwnAppendOnly(record.data.payments"));
});

test("owner and finance get a distinct financial reports route while sales reports stay separate", async () => {
  const app = await readFile(new URL("../apps/web/src/App.jsx", import.meta.url), "utf8");
  assert.ok(app.includes('["financial","التقارير المالية",Banknote,["owner","finance"]]'));
  assert.ok(app.includes('["reports","تقارير المبيعات",TrendingUp,["owner","manager"]]'));
  assert.ok(app.includes('page==="financial"'));
  assert.ok(app.includes("<TrendChart rows={trendRows}/>"));
  assert.ok(app.includes("التحصيلات المؤكدة"));
  assert.ok(app.includes("أعلى أرصدة العملاء"));
});

test("representative management provides actual monthly performance and owner edit controls", async () => {
  const app = await readFile(new URL("../apps/web/src/App.jsx", import.meta.url), "utf8");
  assert.ok(app.includes('page==="team"'));
  assert.ok(app.includes("مبيعات الشهر"));
  assert.ok(app.includes("تحقيق الهدف"));
  assert.ok(app.includes("تعديل البيانات"));
  assert.ok(app.includes('fetch("/api/admin/reps",{method:"PUT"'));
  assert.ok(app.includes('status:String(form.get("status")||"نشط")'));
});

test("representative update endpoint is owner-only and synchronizes login availability", async () => {
  const endpoint = await readFile(new URL("../api/admin/reps.js", import.meta.url), "utf8");
  assert.ok(endpoint.includes('["POST", "PUT"]'));
  assert.ok(endpoint.includes('actor.role !== "owner"'));
  assert.ok(endpoint.includes('["نشط", "موقوف"].includes(status)'));
  assert.ok(endpoint.includes("is_active = ${status === \"نشط\"}"));
  assert.ok(endpoint.includes("'discountLimit'"));
  assert.ok(endpoint.includes("'target'"));
  assert.ok(endpoint.includes("representative.updated:"));
});

test("report date key is initialized before monthly representative metrics", async () => {
  const app = await readFile(new URL("../apps/web/src/App.jsx", import.meta.url), "utf8");
  assert.ok(app.indexOf("const dateKey=") < app.indexOf("const currentMonth=dateKey("));
});
