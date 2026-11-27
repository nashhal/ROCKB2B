export function validateRepresentativePayments({
  repName,
  existingInvoices,
  incomingInvoices,
  existingPayments,
  incomingPayments
}) {
  const invoicesById = new Map();
  for (const invoice of existingInvoices || []) {
    if (invoice?.rep === repName && invoice?.id) invoicesById.set(invoice.id, invoice);
  }
  for (const invoice of incomingInvoices || []) {
    if (invoice?.rep === repName && invoice?.id && !invoicesById.has(invoice.id)) invoicesById.set(invoice.id, invoice);
  }

  const ownedPayments = (incomingPayments || []).filter((payment) => invoicesById.has(payment?.invoiceId));
  if (ownedPayments.length !== (incomingPayments || []).length) {
    throw new Error("لا يمكن تسجيل تحصيل على فاتورة لا تتبع حسابك.");
  }
  const submittedIds = new Set(ownedPayments.map((payment) => payment?.id));
  if (submittedIds.size !== ownedPayments.length) {
    throw new Error("يوجد رقم مكرر في سجل التحصيل.");
  }

  const oldOwnPayments = (existingPayments || []).filter((payment) => invoicesById.has(payment?.invoiceId));
  const incomingById = new Map(ownedPayments.map((payment) => [payment.id, payment]));
  for (const previous of oldOwnPayments) {
    const submitted = incomingById.get(previous.id);
    if (!submitted || JSON.stringify(submitted) !== JSON.stringify(previous)) {
      throw new Error("لا يمكن حذف أو تعديل تحصيل محفوظ من حساب المندوب.");
    }
  }

  const knownIds = new Set(oldOwnPayments.map((payment) => payment.id));
  const pendingByInvoice = new Map();
  for (const payment of oldOwnPayments) {
    if (payment.status === "بانتظار التحقق") {
      pendingByInvoice.set(payment.invoiceId, (pendingByInvoice.get(payment.invoiceId) || 0) + Number(payment.amount || 0));
    }
  }

  for (const payment of ownedPayments) {
    if (knownIds.has(payment.id)) continue;
    const invoice = invoicesById.get(payment.invoiceId);
    const amount = Number(payment.amount);
    if (!invoice || !Number.isFinite(amount) || amount <= 0 ||
        !["نقدي", "تحويل بنكي"].includes(payment.method) ||
        payment.status !== "بانتظار التحقق" ||
        !/^\d{4}-\d{2}-\d{2}$/.test(String(payment.date || ""))) {
      throw new Error("يجب تسجيل التحصيل بحالة انتظار التحقق وببيانات صحيحة.");
    }
    const pending = pendingByInvoice.get(payment.invoiceId) || 0;
    const outstanding = Number(invoice.total || 0) - Number(invoice.paid || 0) - pending;
    if (amount > outstanding + 0.000001) {
      throw new Error("قيمة التحصيل تتجاوز الرصيد المتاح بعد احتساب التحصيلات المعلقة.");
    }
    pendingByInvoice.set(payment.invoiceId, pending + amount);
    knownIds.add(payment.id);
  }

  return true;
}
