import test from "node:test";
import assert from "node:assert/strict";
import { validateRepresentativePayments } from "../lib/rep-payments.js";

const invoice = {
  id: "INV-REP-1",
  rep: "نبراس",
  total: 500,
  paid: 100,
  status: "مدفوعة جزئيًا"
};

const collection = (overrides = {}) => ({
  id: "PAY-REP-1",
  invoiceId: invoice.id,
  amount: 200,
  method: "نقدي",
  status: "بانتظار التحقق",
  date: "2026-11-27",
  customer: "عميل تجريبي",
  ...overrides
});

function validate({ existingPayments = [], incomingPayments = [collection()], incomingInvoices = [invoice] } = {}) {
  return validateRepresentativePayments({
    repName: "نبراس",
    existingInvoices: [invoice],
    incomingInvoices,
    existingPayments,
    incomingPayments
  });
}

test("representative may submit a cash collection as pending finance verification", () => {
  assert.equal(validate(), true);
});

test("representative may submit a bank transfer as pending finance verification", () => {
  assert.equal(validate({ incomingPayments: [collection({ method: "تحويل بنكي" })] }), true);
});

test("representative cannot mark their own collection as confirmed", () => {
  assert.throws(
    () => validate({ incomingPayments: [collection({ status: "مؤكد" })] }),
    /انتظار التحقق/
  );
});

test("representative cannot collect more than the remaining invoice balance", () => {
  assert.throws(
    () => validate({ incomingPayments: [collection({ amount: 401 })] }),
    /تتجاوز الرصيد المتاح/
  );
});

test("pending collections reserve the remaining balance against duplicate claims", () => {
  const oldPayment = collection({ id: "PAY-OLD", amount: 250 });
  assert.throws(
    () => validate({ existingPayments: [oldPayment], incomingPayments: [oldPayment, collection({ id: "PAY-NEW", amount: 151 })] }),
    /تتجاوز الرصيد المتاح/
  );
});

test("representative cannot alter or remove a previously recorded collection", () => {
  const oldPayment = collection({ id: "PAY-OLD", amount: 100 });
  assert.throws(
    () => validate({ existingPayments: [oldPayment], incomingPayments: [] }),
    /حذف أو تعديل/
  );
  assert.throws(
    () => validate({ existingPayments: [oldPayment], incomingPayments: [{ ...oldPayment, amount: 90 }] }),
    /حذف أو تعديل/
  );
});

test("representative cannot submit a collection against another representative's invoice", () => {
  const otherInvoice = { ...invoice, id: "INV-OTHER", rep: "خلدون" };
  assert.throws(
    () => validate({ incomingInvoices: [otherInvoice], incomingPayments: [collection({ invoiceId: "INV-OTHER" })] }),
    /لا تتبع حسابك/
  );
});
