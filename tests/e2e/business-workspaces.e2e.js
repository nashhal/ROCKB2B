import { test, expect } from "@playwright/test";

function nav(page, label) {
  return page.locator(".nav").filter({ hasText: label }).first();
}

test("owner lands on the finance-first workspace and can open receivables aging", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByLabel("اختيار دور المعاينة")).toHaveValue("owner");
  await expect(page.getByRole("heading", { name: "مركز المالية" })).toBeVisible();
  await expect(page.getByText("توزيع أعمار الذمم")).toBeVisible();
  await nav(page, "أعمار الديون").click();
  await expect(page.getByRole("heading", { name: "أعمار الديون" })).toBeVisible();
  await expect(page.getByText("غير محدد الاستحقاق").first()).toBeVisible();
});

test("owner can view all five ROCK specialist agents and agent gateway status", async ({ page }) => {
  await page.goto("/");
  await nav(page, "مركز الوكلاء الذكي").click();
  await expect(page.getByRole("heading", { name: "مركز الوكلاء الذكي" })).toBeVisible();
  await expect(page.locator(".agent-card")).toHaveCount(5);
  await expect(page.getByText("المحلل الاقتصادي والمالي")).toBeVisible();
  await expect(page.getByText("مستشار الأنظمة والامتثال")).toBeVisible();
  await expect(page.getByText("خبير التسويق والسوشيال ميديا")).toBeVisible();
  await expect(page.getByText("خبير المبيعات وتطوير العملاء")).toBeVisible();
  await expect(page.getByText("خبير الإدارة والتشغيل")).toBeVisible();
  await expect(page.getByText(/بوابة الذكاء/).first()).toBeVisible();
});

test("representative sees only the sales specialist agent", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("اختيار دور المعاينة").selectOption("rep");
  await page.getByLabel("اختيار المندوب للمعاينة").selectOption({ label: "نبراس" });
  await expect(page.getByRole("heading", { name: /مرحبًا، نبراس/ })).toBeVisible();
  await nav(page, "مركز الوكلاء الذكي").click();
  await expect(page.getByRole("heading", { name: "مركز الوكلاء الذكي" })).toBeVisible();
  await expect(page.locator(".agent-card")).toHaveCount(1);
  await expect(page.getByText("خبير المبيعات وتطوير العملاء")).toBeVisible();
  await expect(page.getByText("المحلل الاقتصادي والمالي")).toHaveCount(0);
  await expect(page.getByText("خبير التسويق والسوشيال ميديا")).toHaveCount(0);
});
