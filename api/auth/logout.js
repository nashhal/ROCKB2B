import { json, clearSession, sameOrigin } from "../../lib/server.js";
export default async function handler(req, res) {
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });
  if (!sameOrigin(req)) return json(res, 403, { error: "طلب غير مسموح" });
  clearSession(res, req);
  return json(res, 200, { ok: true });
}
