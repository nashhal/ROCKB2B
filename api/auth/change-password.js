import { db, ensureDatabase, json, body, currentUser, sameOrigin, verifyPassword, hashPasswordForUpdate, safeError } from "../../lib/server.js";
export default async function handler(req, res) {
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });
  if (!sameOrigin(req)) return json(res, 403, { error: "طلب غير مسموح" });
  try {
    await ensureDatabase();
    const user = await currentUser(req);
    if (!user) return json(res, 401, { error: "سجّل الدخول أولًا." });
    const input = await body(req);
    const currentPassword = String(input.currentPassword || "");
    const newPassword = String(input.newPassword || "");
    if (newPassword.length < 12) return json(res, 400, { error: "كلمة المرور الجديدة يجب ألا تقل عن 12 حرفًا." });
    const rows = await db()`SELECT password_hash FROM rock_users WHERE id = ${user.id} LIMIT 1`;
    if (!rows[0] || !verifyPassword(currentPassword, rows[0].password_hash)) {
      return json(res, 401, { error: "كلمة المرور الحالية غير صحيحة." });
    }
    await db()`UPDATE rock_users SET password_hash = ${hashPasswordForUpdate(newPassword)}, updated_at = now() WHERE id = ${user.id}`;
    return json(res, 200, { ok: true });
  } catch (error) {
    return json(res, 500, { error: safeError(error) });
  }
}
