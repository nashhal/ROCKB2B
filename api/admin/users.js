import { db, ensureDatabase, json, body, currentUser, sameOrigin, hashPasswordForUpdate, safeError } from "../../lib/server.js";

const roles = new Set(["owner", "manager", "finance", "rep"]);
export default async function handler(req, res) {
  if (!["GET", "POST"].includes(req.method)) return json(res, 405, { error: "Method not allowed" });
  if (req.method === "POST" && !sameOrigin(req)) return json(res, 403, { error: "طلب غير مسموح" });
  try {
    await ensureDatabase();
    const actor = await currentUser(req);
    if (!actor) return json(res, 401, { error: "سجّل الدخول أولًا." });
    if (!["owner", "manager"].includes(actor.role)) return json(res, 403, { error: "ليست لديك صلاحية إدارة الحسابات." });

    if (req.method === "GET") {
      const rows = await db()`SELECT id, username, full_name, role, rep_name, is_active, created_at FROM rock_users ORDER BY created_at`;
      return json(res, 200, { users: rows });
    }
    if (actor.role !== "owner") return json(res, 403, { error: "إنشاء الحسابات متاح لصاحب المؤسسة فقط." });

    const input = await body(req);
    const username = String(input.username || "").trim().toLowerCase();
    const fullName = String(input.fullName || "").trim();
    const role = String(input.role || "");
    const repName = role === "rep" ? String(input.repName || "").trim() : null;
    const password = String(input.password || "");
    if (!/^[a-z0-9._-]{3,32}$/.test(username)) return json(res, 400, { error: "اسم المستخدم يجب أن يكون 3–32 حرفًا إنجليزيًا أو رقمًا." });
    if (fullName.length < 2 || fullName.length > 80) return json(res, 400, { error: "أدخل الاسم الكامل." });
    if (!roles.has(role)) return json(res, 400, { error: "نوع الحساب غير صالح." });
    if (password.length < 12 || password.length > 200) return json(res, 400, { error: "كلمة المرور يجب ألا تقل عن 12 حرفًا." });
    if (role === "rep") {
      const rows = await db()`SELECT data FROM rock_workspace WHERE id = 1`;
      const exists = rows[0]?.data?.reps?.some((r) => r.name === repName);
      if (!exists) return json(res, 400, { error: "اختر مندوبًا موجودًا في فريق المبيعات." });
    }
    const inserted = await db()`INSERT INTO rock_users (username, full_name, role, rep_name, password_hash)
      VALUES (${username}, ${fullName}, ${role}, ${repName}, ${hashPasswordForUpdate(password)})
      ON CONFLICT (username) DO NOTHING
      RETURNING id, username, full_name, role, rep_name, is_active, created_at`;
    if (!inserted.length) return json(res, 409, { error: "اسم المستخدم مستخدم بالفعل." });
    await db()`INSERT INTO rock_audit (actor_id, action) VALUES (${actor.id}, ${"user.created:" + role})`;
    return json(res, 201, { user: inserted[0] });
  } catch (error) {
    return json(res, 500, { error: safeError(error) });
  }
}
