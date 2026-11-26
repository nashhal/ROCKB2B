import { db, ensureDatabase, json, body, currentUser, sameOrigin, safeError } from "../lib/server.js";

function filterForUser(data, user) {
  if (user.role !== "rep") return data;
  const repName = user.repName || user.fullName;
  const customers = data.customers.filter((x) => x.rep === repName);
  const orders = data.orders.filter((x) => x.rep === repName);
  const invoices = data.invoices.filter((x) => x.rep === repName);
  const invoiceIds = new Set(invoices.map((x) => x.id));
  return {
    ...data,
    customers,
    orders,
    invoices,
    payments: data.payments.filter((x) => invoiceIds.has(x.invoiceId)),
    visits: data.visits.filter((x) => x.rep === repName),
    reps: data.reps.filter((x) => x.name === repName)
  };
}

function mergeOwn(existing, incoming, predicate) {
  const keep = existing.filter((row) => !predicate(row));
  const existingOwn = existing.filter(predicate);
  const incomingOwn = incoming.filter((row) => row && typeof row === "object" && predicate(row));
  if (incomingOwn.length !== incoming.length) {
    throw new Error("تم رفض سجل لا يتبع حساب المندوب.");
  }
  const incomingIds = new Set(incomingOwn.map((row) => row.id));
  if (existingOwn.some((row) => !incomingIds.has(row.id))) {
    throw new Error("لا يمكن حذف سجلات العملاء من حساب المندوب.");
  }
  const byId = new Map(keep.map((row) => [row.id, row]));
  for (const row of incomingOwn) byId.set(row.id, row);
  return [...byId.values()];
}

function mergeOwnAppendOnly(existing, incoming, predicate) {
  const keep = existing.filter((row) => !predicate(row));
  const existingOwn = existing.filter(predicate);
  const incomingOwn = incoming.filter((row) => row && typeof row === "object" && predicate(row));
  if (incomingOwn.length !== incoming.length) {
    throw new Error("تم رفض سجل لا يتبع حساب المندوب.");
  }
  const byId = new Map(incomingOwn.map((row) => [row.id, row]));
  for (const row of existingOwn) {
    const submitted = byId.get(row.id);
    if (!submitted) throw new Error("لا يمكن حذف مستندات المبيعات أو التحصيل.");
    if (JSON.stringify(submitted) !== JSON.stringify(row)) {
      throw new Error("لا يمكن تعديل مستندات البيع أو التحصيل بعد حفظها.");
    }
  }
  return [...keep, ...existingOwn, ...incomingOwn.filter((row) => !existingOwn.some((old) => old.id === row.id))];
}

function preserveExistingAndAppend(existing, incoming) {
  const byId = new Map(incoming.map((row) => [row?.id, row]));
  for (const row of existing) {
    if (!byId.has(row.id)) throw new Error("لا يمكن حذف مستند مالي محفوظ من دور المبيعات.");
  }
  return [...existing, ...incoming.filter((row) => !existing.some((old) => old.id === row?.id))];
}

export default async function handler(req, res) {
  if (!["GET", "PUT"].includes(req.method)) return json(res, 405, { error: "Method not allowed" });
  if (req.method === "PUT" && !sameOrigin(req)) return json(res, 403, { error: "طلب غير مسموح" });
  try {
    await ensureDatabase();
    const user = await currentUser(req);
    if (!user) return json(res, 401, { error: "انتهت الجلسة. سجّل الدخول مرة أخرى." });
    const sql = db();
    const rows = await sql`SELECT data, revision FROM rock_workspace WHERE id = 1 LIMIT 1`;
    if (!rows.length) return json(res, 503, { error: "لم يتم تهيئة مساحة العمل بعد." });
    const record = rows[0];
    if (req.method === "GET") {
      return json(res, 200, { data: filterForUser(record.data, user), revision: record.revision, user });
    }
    const input = await body(req);
    const incoming = input.data;
    const revision = Number(input.revision);
    const collections = ["customers", "products", "orders", "invoices", "payments", "visits", "reps"];
    if (!incoming || typeof incoming !== "object" || !Number.isInteger(revision) ||
        collections.some((key) => !Array.isArray(incoming[key]))) {
      return json(res, 400, { error: "صيغة البيانات غير صحيحة." });
    }
    let next = record.data;
    if (user.role === "owner") {
      next = Object.fromEntries(collections.map((key) => [key, incoming[key]]));
    } else if (user.role === "manager") {
      next = {
        ...record.data,
        customers: incoming.customers,
        products: incoming.products,
        orders: incoming.orders,
        invoices: preserveExistingAndAppend(record.data.invoices, incoming.invoices),
        visits: incoming.visits,
        reps: record.data.reps
        // Payments are financial records and remain under owner/finance control.
      };
    } else if (user.role === "finance") {
      next = { ...record.data, invoices: incoming.invoices, payments: incoming.payments };
    } else if (user.role === "rep") {
      const repName = user.repName || user.fullName;
      const ownInvoiceIds = new Set([
        ...record.data.invoices.filter((x) => x.rep === repName).map((x) => x.id),
        ...incoming.invoices.filter((x) => x.rep === repName).map((x) => x.id)
      ]);
      next = {
        ...record.data,
        customers: mergeOwn(record.data.customers, incoming.customers, (x) => x.rep === repName),
        orders: mergeOwnAppendOnly(record.data.orders, incoming.orders, (x) => x.rep === repName),
        invoices: mergeOwnAppendOnly(record.data.invoices, incoming.invoices, (x) => x.rep === repName),
        payments: mergeOwnAppendOnly(record.data.payments, incoming.payments, (x) => ownInvoiceIds.has(x.invoiceId)),
        visits: mergeOwnAppendOnly(record.data.visits, incoming.visits, (x) => x.rep === repName)
      };
    }
    const updated = await sql`UPDATE rock_workspace SET data = ${JSON.stringify(next)}::jsonb,
      revision = revision + 1, updated_at = now()
      WHERE id = 1 AND revision = ${revision}
      RETURNING revision`;
    if (!updated.length) return json(res, 409, { error: "تغيرت البيانات من مستخدم آخر. حدّث الصفحة وحاول مجددًا." });
    await sql`INSERT INTO rock_audit (actor_id, action) VALUES (${user.id}, ${"workspace.updated:" + user.role})`;
    return json(res, 200, { ok: true, revision: updated[0].revision });
  } catch (error) {
    const message = error?.message === "تم رفض سجل لا يتبع حساب المندوب."
      ? error.message : safeError(error);
    return json(res, 500, { error: message });
  }
}
