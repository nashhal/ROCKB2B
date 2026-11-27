import test from "node:test";
import assert from "node:assert/strict";
import { ROCK_AGENTS, canUseRockAgent, buildRockAgentContext, buildAgentInstructions } from "../lib/rock-agents.js";

test("registers five specialist agents with distinct access scopes", () => {
  assert.equal(Object.keys(ROCK_AGENTS).length, 5);
  assert.ok(canUseRockAgent("economy", "owner"));
  assert.ok(canUseRockAgent("economy", "finance"));
  assert.ok(!canUseRockAgent("economy", "rep"));
  assert.ok(canUseRockAgent("sales", "rep"));
  assert.ok(!canUseRockAgent("marketing", "rep"));
  assert.ok(canUseRockAgent("management", "manager"));
});

test("representative context is scoped to assigned customer and sales records", () => {
  const data = {
    customers: [{ id: "a", name: "عميل أ", rep: "نبراس" }, { id: "b", name: "عميل ب", rep: "خلدون" }],
    orders: [{ id: "1", rep: "نبراس", customer: "عميل أ" }, { id: "2", rep: "خلدون", customer: "عميل ب" }],
    invoices: [{ id: "i1", rep: "نبراس", customer: "عميل أ", total: 100, paid: 20 }, { id: "i2", rep: "خلدون", customer: "عميل ب", total: 900, paid: 0 }],
    payments: [{ id: "p1", invoiceId: "i1", amount: 20, status: "مؤكد" }, { id: "p2", invoiceId: "i2", amount: 900, status: "مؤكد" }],
    visits: [{ id: "v1", rep: "نبراس" }, { id: "v2", rep: "خلدون" }],
    products: [],
    reps: [{ id: "r1", name: "نبراس" }, { id: "r2", name: "خلدون" }]
  };
  const context = buildRockAgentContext({
    data,
    user: { role: "rep", repName: "نبراس", fullName: "نبراس" },
    agentId: "sales",
    now: new Date("2026-11-27T12:00:00Z")
  });
  assert.equal(context.counts.customers, 1);
  assert.equal(context.counts.orders, 1);
  assert.equal(context.counts.visits, 1);
  assert.deepEqual(context.customers.map((x) => x.name), ["عميل أ"]);
  assert.equal(context.recentOrders[0].customer, "عميل أ");
  assert.equal(context.finance.invoicedTotal, 100);
  assert.equal(context.finance.confirmedCollections, 20);
});

test("finance context distinguishes confirmed and pending receipts and missing due dates", () => {
  const data = {
    customers: [],
    products: [],
    orders: [],
    invoices: [
      { id: "i1", customer: "أ", total: 100, paid: 20, dueDate: "2026-11-01" },
      { id: "i2", customer: "ب", total: 50, paid: 0 }
    ],
    payments: [
      { id: "p1", invoiceId: "i1", amount: 20, status: "مؤكد" },
      { id: "p2", invoiceId: "i2", amount: 10, status: "بانتظار التحقق" }
    ],
    visits: [],
    reps: []
  };
  const context = buildRockAgentContext({
    data,
    user: { role: "finance" },
    agentId: "economy",
    now: new Date("2026-11-27T12:00:00Z")
  });
  assert.equal(context.finance.invoicedTotal, 150);
  assert.equal(context.finance.paidAllocatedTotal, 20);
  assert.equal(context.finance.outstandingTotal, 130);
  assert.equal(context.finance.confirmedCollections, 20);
  assert.equal(context.finance.pendingCollections, 10);
  assert.equal(context.finance.overdueInvoiceCount, 1);
  assert.equal(context.finance.missingDueDateCount, 1);
});

test("instructions explicitly prohibit autonomous financial/legal/marketing actions", () => {
  const instructions = buildAgentInstructions("legal", { snapshotDate: "2026-11-27" });
  assert.match(instructions, /لا تنفذ إجراءات خارجية/);
  assert.match(ROCK_AGENTS.legal.instructions, /لست محاميًا/);
});
