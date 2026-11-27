import { test, expect } from "@playwright/test";

async function enterRepresentativePreview(page, name = "نبراس") {
  await page.goto("/");
  await page.getByLabel("اختيار دور المعاينة").selectOption("rep");
  await page.getByLabel("اختيار المندوب للمعاينة").selectOption({ label: name });
  await expect(page.getByRole("heading", { name: new RegExp("مرحبًا، " + name) })).toBeVisible();
}

function nav(page, label) {
  return page.locator(".nav").filter({ hasText: label }).first();
}

test("representative dashboard renders and follow-up icons do not crash for overdue accounts", async ({ page }) => {
  await enterRepresentativePreview(page, "يحيى");
  await expect(page.getByText("متابعات تحتاج إجراء")).toBeVisible();
  await expect(page.getByText("زيارة أو اتصال مطلوب").first()).toBeVisible();

  await page.getByLabel("اختيار المندوب للمعاينة").selectOption({ label: "نبراس" });
  await expect(page.getByRole("heading", { name: /مرحبًا، نبراس/ })).toBeVisible();
  await expect(page.getByText("هدف المبيعات الشهري")).toBeVisible();
  await expect(page.getByText("حركة مبيعاتك وتحصيلاتك")).toBeVisible();
});

test("representative sees only assigned customers and their own orders", async ({ page }) => {
  await enterRepresentativePreview(page, "نبراس");
  await nav(page, "العملاء").click();
  await expect(page.getByText("مؤسسة ركن الأعمال")).toBeVisible();
  await expect(page.getByText("متاجر المدار")).toBeVisible();
  await expect(page.getByText("شركة نقطة التوريد")).toHaveCount(0);
  await expect(page.getByText("مركز التقنية الحديثة")).toHaveCount(0);

  await nav(page, "طلبات البيع").click();
  await expect(page.getByText("ORD-2084")).toBeVisible();
  await expect(page.getByText("ORD-2082")).toHaveCount(0);
});

test("representative can log a visit with opt-in GPS and open the plotted location", async ({ page, context }) => {
  await context.grantPermissions(["geolocation"]);
  await context.setGeolocation({ latitude: 21.543333, longitude: 39.172778, accuracy: 12 });
  await enterRepresentativePreview(page, "نبراس");

  await page.getByRole("button", { name: /تسجيل زيارة/ }).first().click();
  await page.locator('select[name="customer"]').selectOption("C-1001");
  await page.locator('select[name="channel"]').selectOption({ label: "ميداني" });
  await page.locator('select[name="result"]').selectOption({ label: "يحتاج متابعة" });
  await page.getByRole("button", { name: "تحديد موقعي الآن" }).click();
  await expect(page.getByText(/تم تسجيل الإحداثيات بدقة/)).toBeVisible();
  await page.getByRole("button", { name: "حفظ النشاط" }).click();
  await expect(page.getByText("تم تسجيل الزيارة مع الموقع")).toBeVisible();

  await nav(page, "الزيارات").click();
  const map = page.locator('iframe[title="خريطة العملاء والزيارات"]');
  await expect(map).toBeVisible();
  await expect(map).toHaveAttribute("src", /21\.543333/);
  await expect(page.getByRole("link", { name: /فتح في خرائط Google/ })).toHaveAttribute("href", /21\.543333/);
});

test("representative can create an order and submit a pending collection", async ({ page }) => {
  await enterRepresentativePreview(page, "نبراس");

  await page.getByRole("button", { name: "طلب بيع" }).click();
  await page.locator('select[name="customer"]').selectOption("C-1001");
  await page.locator('select[name="product"]').selectOption({ index: 0 });
  await page.locator('input[name="qty"]').fill("2");
  await page.locator('input[name="discount"]').fill("0");
  await page.locator('select[name="payment"]').selectOption({ label: "تحويل بنكي" });
  await page.getByRole("button", { name: "حفظ وإصدار فاتورة عرض" }).click();
  await expect(page.getByText("تم إنشاء الطلب وفاتورة العرض")).toBeVisible();

  await nav(page, "طلبات البيع").click();
  await expect(page.locator("tbody tr")).toHaveCount(3);

  await nav(page, "التحصيلات والذمم").click();
  await page.getByRole("button", { name: "تسجيل تحصيل" }).click();
  await page.locator('select[name="invoice"]').selectOption({ index: 0 });
  await page.locator('input[name="amount"]').fill("5");
  await page.locator('select[name="method"]').selectOption({ label: "نقدي" });
  await page.getByRole("button", { name: "تسجيل التحصيل" }).click();
  await expect(page.getByText("تم تسجيل التحصيل وهو بانتظار مراجعة المالية")).toBeVisible();
  await expect(page.getByText("بانتظار التحقق").first()).toBeVisible();

  await page.waitForTimeout(700);
  await page.reload();
  await expect(page.getByLabel("اختيار دور المعاينة")).toHaveValue("rep");
  await expect(page.getByLabel("اختيار المندوب للمعاينة")).toHaveValue("نبراس");
});
