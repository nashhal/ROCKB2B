import { db, ensureDatabase, json, body, issueSession, verifyPassword, safeError, sameOrigin } from "../../lib/server.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });
  if (!sameOrigin(req)) return json(res, 403, { error: "طلب غير مسموح" });
  try {
    await ensureDatabase();
    const input = await body(req);
    const username = String(input.username || "").trim().toLowerCase();
    const password = String(input.password || "");
    if (!username || !password || password.length > 200) return json(res, 400, { error: "أدخل اسم المستخدم وكلمة المرور." });
    const rows = await db()`SELECT id, username, full_name, role, rep_name, password_hash, is_active FROM rock_users WHERE username = ${username} LIMIT 1`;
    const user = rows[0];
    if (!user || !user.is_active || !verifyPassword(password, user.password_hash)) {
      return json(res, 401, { error: "بيانات الدخول غير صحيحة." });
    }
    const safeUser = { id: user.id, username: user.username, fullName: user.full_name, role: user.role, repName: user.rep_name };
    issueSession(res, req, safeUser);
    return json(res, 200, { user: safeUser });
  } catch (error) {
    return json(res, 500, { error: safeError(error) });
  }
}
