import { ensureDatabase, json, currentUser, safeError } from "../_lib/core.js";
export default async function handler(req, res) {
  if (req.method !== "GET") return json(res, 405, { error: "Method not allowed" });
  try {
    await ensureDatabase();
    const user = await currentUser(req);
    if (!user) return json(res, 401, { user: null });
    return json(res, 200, { user });
  } catch (error) {
    return json(res, 500, { error: safeError(error) });
  }
}
