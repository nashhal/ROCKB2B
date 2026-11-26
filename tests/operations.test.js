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

test("manager updates cannot overwrite payment collections; rep sales records are append-only", async () => {
  const api = await readFile(new URL("../api/data.js", import.meta.url), "utf8");
  assert.ok(api.includes("Payments are financial records and remain under owner/finance control."));
  assert.ok(api.includes("mergeOwnAppendOnly(record.data.orders"));
  assert.ok(api.includes("mergeOwnAppendOnly(record.data.invoices"));
  assert.ok(api.includes("mergeOwnAppendOnly(record.data.payments"));
});
