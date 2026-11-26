import { db, ensureDatabase, json, safeError } from "./_lib/core.js";
export default async function handler(req, res) {
  if (req.method !== "GET") return json(res, 405, { error: "Method not allowed" });
  try {
    await ensureDatabase();
    const rows = await db()`SELECT now() AS database_time`;
    return json(res, 200, { ok: true, service: "ROCK B2B API", database: "connected", time: rows[0].database_time });
  } catch (error) {
    return json(res, 503, { ok: false, error: safeError(error) });
  }
}
