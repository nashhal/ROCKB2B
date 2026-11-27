import { db, ensureDatabase, json, body, currentUser, sameOrigin, safeError } from "../../lib/server.js";
import { seed } from "../../apps/web/src/data.js";
import { ROCK_AGENTS, canUseRockAgent, buildRockAgentContext, buildAgentInstructions } from "../../lib/rock-agents.js";

const MODEL = process.env.ROCK_AI_MODEL || process.env.AI_GATEWAY_MODEL || "openai/gpt-5.4-mini";
const GATEWAY_URL = "https://ai-gateway.vercel.sh/v1/responses";
const LEGAL_DOMAINS = [
  "zatca.gov.sa",
  "laws.boe.gov.sa",
  "uqn.gov.sa",
  "mc.gov.sa",
  "moj.gov.sa",
  "sama.gov.sa",
  "hrsd.gov.sa",
  "misa.gov.sa"
];

function isDemoMode() {
  return process.env.VERCEL_ENV !== "production" && process.env.VITE_DEMO_MODE === "true";
}

function responseText(payload) {
  if (typeof payload?.output_text === "string" && payload.output_text.trim()) return payload.output_text.trim();
  const parts = [];
  for (const item of payload?.output || []) {
    if (item.type !== "message") continue;
    for (const part of item.content || []) {
      if ((part.type === "output_text" || part.type === "text") && part.text) parts.push(part.text);
    }
  }
  return parts.join("\n").trim();
}

function responseSources(payload) {
  const sources = new Map();
  for (const item of payload?.output || []) {
    for (const part of item.content || []) {
      for (const annotation of part.annotations || []) {
        const url = annotation.url || annotation.url_citation?.url;
        if (!url || !/^https?:\/\//i.test(url)) continue;
        sources.set(url, {
          title: annotation.title || annotation.url_citation?.title || new URL(url).hostname,
          url
        });
      }
    }
  }
  return [...sources.values()].slice(0, 8);
}

export default async function handler(req, res) {
  if (req.method === "GET") {
    const configured = Boolean(process.env.VERCEL_OIDC_TOKEN || process.env.AI_GATEWAY_API_KEY);
    return json(res, 200, {
      enabled: configured,
      demoMode: isDemoMode(),
      model: MODEL,
      agents: Object.values(ROCK_AGENTS).map((agent) => ({
        id: agent.id,
        name: agent.name,
        title: agent.title,
        description: agent.description,
        roles: agent.roles
      }))
    });
  }
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });
  if (!sameOrigin(req)) return json(res, 403, { error: "طلب غير مسموح" });

  try {
    const input = await body(req);
    const agentId = String(input.agentId || "");
    const prompt = String(input.prompt || "").trim();
    const history = Array.isArray(input.history) ? input.history.slice(-8) : [];
    const demo = isDemoMode();

    if (!ROCK_AGENTS[agentId]) return json(res, 400, { error: "الوكيل المطلوب غير موجود." });
    if (!prompt || prompt.length > 2400) return json(res, 400, { error: "اكتب سؤالًا لا يتجاوز 2400 حرف." });
    if (!process.env.VERCEL_OIDC_TOKEN && !process.env.AI_GATEWAY_API_KEY) {
      return json(res, 503, { error: "بوابة الذكاء الاصطناعي غير مهيأة. يلزم ربط AI Gateway في إعدادات Vercel." });
    }

    let user;
    let data;
    if (demo) {
      const demoRole = String(input.demoRole || "owner");
      if (!["owner", "manager", "finance", "rep"].includes(demoRole)) {
        return json(res, 400, { error: "دور المعاينة غير صالح." });
      }
      user = {
        id: "protected-preview-demo",
        role: demoRole,
        fullName: "معاينة ROCK BUSINESS",
        repName: demoRole === "rep" ? (seed.reps?.[0]?.name || "") : null
      };
      data = seed;
    } else {
      await ensureDatabase();
      user = await currentUser(req);
      if (!user) return json(res, 401, { error: "انتهت الجلسة. سجّل الدخول مرة أخرى." });
      if (!sameOrigin(req)) return json(res, 403, { error: "طلب غير مسموح" });
      const rows = await db()`SELECT data FROM rock_workspace WHERE id = 1 LIMIT 1`;
      if (!rows.length) return json(res, 503, { error: "مساحة بيانات المؤسسة غير مهيأة." });
      data = rows[0].data;
    }

    if (!canUseRockAgent(agentId, user.role)) {
      return json(res, 403, { error: "هذا الوكيل غير متاح لدور حسابك." });
    }

    const context = buildRockAgentContext({ data, user, agentId });
    const instructions = buildAgentInstructions(agentId, context);
    const safeHistory = history
      .filter((item) => item && ["user", "assistant"].includes(item.role) && typeof item.content === "string")
      .map((item) => ({ role: item.role, content: item.content.slice(0, 2400) }));
    const conversation = [
      ...safeHistory,
      { role: "user", content: prompt }
    ];
    const payload = {
      model: MODEL,
      instructions,
      input: conversation,
      max_output_tokens: 1400,
      store: false
    };

    if (agentId === "legal") {
      payload.tools = [{
        type: "web_search",
        filters: { allowed_domains: LEGAL_DOMAINS },
        search_context_size: "medium",
        user_location: { type: "approximate", country: "SA", timezone: "Asia/Riyadh" }
      }];
      payload.tool_choice = "auto";
    }

    const token = process.env.VERCEL_OIDC_TOKEN || process.env.AI_GATEWAY_API_KEY;
    const upstream = await fetch(GATEWAY_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(45000)
    });

    const result = await upstream.json().catch(() => ({}));
    if (!upstream.ok) {
      if (upstream.status === 401) return json(res, 503, { error: "تعذر توثيق الاتصال ببوابة الذكاء الاصطناعي في Vercel." });
      if (upstream.status === 402 || upstream.status === 403) return json(res, 503, { error: "بوابة الذكاء الاصطناعي تحتاج تهيئة الرصيد أو التحقق أو حدود الإنفاق." });
      if (upstream.status === 429) return json(res, 429, { error: "وصلت الخدمة إلى حد الطلبات مؤقتًا. أعد المحاولة لاحقًا." });
      return json(res, 502, { error: "تعذر الحصول على رد من خدمة الذكاء الاصطناعي. حاول لاحقًا." });
    }

    const answer = responseText(result);
    if (!answer) return json(res, 502, { error: "لم تُرجع الخدمة نصًا قابلًا للعرض." });

    if (!demo) {
      await db()`INSERT INTO rock_audit (actor_id, action) VALUES (${user.id}, ${"agent.run:" + agentId})`;
    }

    return json(res, 200, {
      agentId,
      text: answer,
      sources: responseSources(result),
      model: result.model || MODEL,
      createdAt: new Date().toISOString(),
      dataScope: demo ? "synthetic-demo" : user.role === "rep" ? "assigned-representative" : "role-authorized-workspace"
    });
  } catch (error) {
    return json(res, 500, { error: safeError(error) });
  }
}
