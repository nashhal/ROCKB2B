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
      const repRecord = record.data.reps.find((x) => x.name === repName);
      if (!repRecord) throw new Error("حساب المندوب غير مرتبط بسجل مندوب نشط.");

      const ownCustomer = (row) => row.rep === repName;
      const ownOrder = (row) => row.rep === repName;
      const ownInvoice = (row) => row.rep === repName;
      const existingCustomerIds = new Set(record.data.customers.filter(ownCustomer).map((x) => x.id));
      const incomingCustomers = incoming.customers.filter(ownCustomer);
      if (incomingCustomers.length !== incoming.customers.length) {
        throw new Error("لا يمكن إسناد عميل إلى حساب مندوب آخر.");
      }
      const newCustomers = incomingCustomers.filter((x) => !existingCustomerIds.has(x.id));
      if (newCustomers.some((x) => Number(x.creditLimit || 0) !== 0 || Number(x.balance || 0) !== 0)) {
        throw new Error("تحديد حد الائتمان أو الرصيد الافتتاحي متاح للإدارة فقط.");
      }

      const existingOrderIds = new Set(record.data.orders.filter(ownOrder).map((x) => x.id));
      const incomingOrders = incoming.orders.filter(ownOrder);
      if (incomingOrders.length !== incoming.orders.length) {
        throw new Error("لا يمكن إنشاء طلب باسم مندوب آخر.");
      }
      const newOrders = incomingOrders.filter((x) => !existingOrderIds.has(x.id));
      const customersAfterUpdate = [
        ...record.data.customers.filter((x) => !ownCustomer(x)),
        ...incomingCustomers
      ];
      const reservedByProduct = new Map();
      for (const order of record.data.orders) {
        if (order.productId && order.status !== "ملغي") {
          reservedByProduct.set(order.productId, (reservedByProduct.get(order.productId) || 0) + Number(order.quantity || 0));
        }
      }
      for (const order of newOrders) {
        const product = record.data.products.find((x) => x.id === order.productId);
        const customer = customersAfterUpdate.find((x) => x.id === order.customerId && x.rep === repName);
        const quantity = Number(order.quantity);
        const discount = Number(order.discount || 0);
        const limit = Number(repRecord.discountLimit || 0);
        if (!product || !customer || !Number.isInteger(quantity) || quantity < 1 ||
            !Number.isFinite(discount) || discount < 0 || discount > 100 ||
            Number(order.unitPrice) !== Number(product.price)) {
          throw new Error("بيانات الطلب غير صالحة أو أن العميل/المنتج لا يتبع حسابك.");
        }
        const expectedTotal = Math.round(Number(product.price) * quantity * (1 - discount / 100) * 100) / 100;
        const expectedStatus = discount > limit ? "بانتظار اعتماد الخصم" : "مفوتر";
        if (Number(order.total) !== expectedTotal || order.status !== expectedStatus) {
          throw new Error("تجاوز الطلب حد الخصم المسموح أو لا يطابق سعر المنتج المعتمد.");
        }
        const reserved = reservedByProduct.get(product.id) || 0;
        if (product.stock != null && quantity > Math.max(0, Number(product.stock) - reserved)) {
          throw new Error("الكمية المطلوبة تتجاوز رصيد المخزون المستورد.");
        }
        reservedByProduct.set(product.id, reserved + quantity);
      }

      const existingInvoiceIds = new Set(record.data.invoices.filter(ownInvoice).map((x) => x.id));
      const incomingInvoices = incoming.invoices.filter(ownInvoice);
      if (incomingInvoices.length !== incoming.invoices.length) {
        throw new Error("لا يمكن إصدار مستند باسم مندوب آخر.");
      }
      const newInvoices = incomingInvoices.filter((x) => !existingInvoiceIds.has(x.id));
      const invoiceOrderIds = new Set();
      for (const invoice of newInvoices) {
        const order = newOrders.find((x) => x.id === invoice.orderId);
        if (!order || order.status !== "مفوتر" || invoiceOrderIds.has(order.id) ||
            Number(invoice.total) !== Number(order.total) || Number(invoice.paid || 0) !== 0 ||
            invoice.status !== "غير مدفوعة" || invoice.rep !== repName ||
            invoice.customerId !== order.customerId || invoice.productId !== order.productId ||
            Number(invoice.quantity) !== Number(order.quantity)) {
          throw new Error("لا يمكن للمندوب إصدار فاتورة مدفوعة أو غير مرتبطة بطلب معتمد.");
        }
        invoiceOrderIds.add(order.id);
      }
      if (newOrders.some((x) => x.status === "مفوتر" && !invoiceOrderIds.has(x.id))) {
        throw new Error("كل طلب معتمد يحتاج مستند عرض مرتبطًا به.");
      }

      const existingOwnPayments = record.data.payments.filter((x) =>
        record.data.invoices.some((invoice) => invoice.rep === repName && invoice.id === x.invoiceId)
      );
      const incomingOwnPayments = incoming.payments.filter((x) =>
        incomingInvoices.some((invoice) => invoice.id === x.invoiceId)
      );
      if (incomingOwnPayments.length !== incoming.payments.length ||
          incomingOwnPayments.length !== existingOwnPayments.length) {
        throw new Error("تسجيل أو تعديل التحصيلات متاح للمالك والمالية فقط.");
      }

      next = {
        ...record.data,
        customers: mergeOwnAppendOnly(record.data.customers, incoming.customers, ownCustomer),
        orders: mergeOwnAppendOnly(record.data.orders, incoming.orders, ownOrder),
        invoices: mergeOwnAppendOnly(record.data.invoices, incoming.invoices, ownInvoice),
        payments: mergeOwnAppendOnly(record.data.payments, incoming.payments, (x) =>
          record.data.invoices.some((invoice) => invoice.rep === repName && invoice.id === x.invoiceId)
        ),
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
