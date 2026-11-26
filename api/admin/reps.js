import { randomUUID } from "node:crypto";
import { db, ensureDatabase, json, body, currentUser, sameOrigin, hashPasswordForUpdate, safeError } from "../../lib/server.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });
  if (!sameOrigin(req)) return json(res, 403, { error: "طلب غير مسموح" });

  try {
    await ensureDatabase();
    const actor = await currentUser(req);
    if (!actor) return json(res, 401, { error: "سجّل الدخول أولًا." });
    if (actor.role !== "owner") return json(res, 403, { error: "إضافة المناديب متاحة لصاحب المؤسسة فقط." });

    const input = await body(req);
    const name = String(input.name || "").trim();
    const username = String(input.username || "").trim().toLowerCase();
    const phone = String(input.phone || "").trim().slice(0, 32);
    const password = String(input.password || "");
    const target = Number(input.target || 0);
    const discountLimit = Number(input.discountLimit || 0);

    if (name.length < 2 || name.length > 80) {
      return json(res, 400, { error: "أدخل اسم المندوب (من حرفين إلى 80 حرفًا)." });
    }
    if (!/^[a-z0-9._-]{3,32}$/.test(username)) {
      return json(res, 400, { error: "اسم المستخدم يجب أن يكون 3–32 حرفًا إنجليزيًا أو رقمًا." });
    }
    if (password.length < 12 || password.length > 200) {
      return json(res, 400, { error: "كلمة المرور يجب ألا تقل عن 12 حرفًا." });
    }
    if (!Number.isFinite(target) || target < 0 || target > 100000000) {
      return json(res, 400, { error: "الهدف الشهري غير صالح." });
    }
    if (!Number.isFinite(discountLimit) || discountLimit < 0 || discountLimit > 100) {
      return json(res, 400, { error: "حد الخصم يجب أن يكون بين 0 و100%." });
    }

    const rep = {
      id: "REP-" + randomUUID().slice(0, 8).toUpperCase(),
      name,
      phone,
      discountLimit,
      target,
      sales: 0,
      status: "نشط"
    };
    const sql = db();
    const created = await sql`
      WITH available_workspace AS (
        SELECT id
        FROM rock_workspace
        WHERE id = 1
          AND NOT EXISTS (
            SELECT 1
            FROM jsonb_array_elements(COALESCE(data->'reps', '[]'::jsonb)) AS representatives(rep)
            WHERE rep->>'name' = ${name}
          )
        FOR UPDATE
      ),
      created_user AS (
        INSERT INTO rock_users (username, full_name, role, rep_name, password_hash)
        SELECT ${username}, ${name}, 'rep', ${name}, ${hashPasswordForUpdate(password)}
        FROM available_workspace
        ON CONFLICT (username) DO NOTHING
        RETURNING id, username, full_name, role, rep_name, is_active, created_at
      ),
      updated_workspace AS (
        UPDATE rock_workspace
        SET data = jsonb_set(
              data,
              '{reps}',
              COALESCE(data->'reps', '[]'::jsonb) || ${JSON.stringify([rep])}::jsonb,
              true
            ),
            revision = revision + 1,
            updated_at = now()
        WHERE id = 1 AND EXISTS (SELECT 1 FROM created_user)
        RETURNING revision
      )
      SELECT created_user.*, updated_workspace.revision
      FROM created_user CROSS JOIN updated_workspace
    `;

    if (!created.length) {
      const checks = await sql`
        SELECT
          EXISTS (
            SELECT 1 FROM jsonb_array_elements(
              COALESCE((SELECT data->'reps' FROM rock_workspace WHERE id = 1), '[]'::jsonb)
            ) AS representatives(rep) WHERE rep->>'name' = ${name}
          ) AS rep_exists,
          EXISTS (SELECT 1 FROM rock_users WHERE username = ${username}) AS username_exists
      `;
      if (checks[0]?.rep_exists) return json(res, 409, { error: "يوجد مندوب بهذا الاسم بالفعل." });
      if (checks[0]?.username_exists) return json(res, 409, { error: "اسم المستخدم مستخدم بالفعل." });
      return json(res, 503, { error: "تعذر حفظ المندوب. حدّث الصفحة وحاول مجددًا." });
    }

    await sql`INSERT INTO rock_audit (actor_id, action) VALUES (${actor.id}, 'representative.created')`;
    const row = created[0];
    return json(res, 201, {
      rep,
      user: {
        id: row.id,
        username: row.username,
        fullName: row.full_name,
        role: row.role,
        repName: row.rep_name,
        isActive: row.is_active
      },
      revision: row.revision
    });
  } catch (error) {
    return json(res, 500, { error: safeError(error) });
  }
}
