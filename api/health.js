import { db, ensureDatabase, json, safeError } from "../lib/server.js";

export default async function handler(req, res) {
  if (req.method !== "GET") return json(res, 405, { error: "Method not allowed" });

  let stage = "database_connection";
  try {
    // Run a read-only ping first so connectivity failures are distinguishable
    // from schema/bootstrap errors.
    const sql = db();
    const ping = await sql`SELECT 1 AS ok`;
    if (!ping.length || Number(ping[0].ok) !== 1) {
      throw new Error("Database ping did not return the expected result.");
    }

    stage = "database_initialization";
    await ensureDatabase();

    stage = "database_health_query";
    const rows = await db()`SELECT now() AS database_time`;
    return json(res, 200, {
      ok: true,
      service: "ROCK B2B API",
      database: "connected",
      time: rows[0].database_time
    });
  } catch (error) {
    const code = typeof error?.code === "string" && /^[A-Z0-9_-]{1,24}$/.test(error.code)
      ? error.code
      : null;
    const errorName = typeof error?.name === "string" && /^[A-Za-z0-9_-]{1,40}$/.test(error.name)
      ? error.name
      : "Error";
    console.error("ROCK_B2B_HEALTH_FAILURE", JSON.stringify({ stage, errorName, code }));
    return json(res, 503, {
      ok: false,
      error: safeError(error),
      stage,
      errorName,
      code
    });
  }
}
