import { neon } from "@neondatabase/serverless";
import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { seed } from "../apps/web/src/data.js";

let client;
let schemaReady;

export function db() {
  const url = process.env.POSTGRES_URL || process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not configured");
  if (!client) client = neon(url);
  return client;
}

function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function hashPasswordForUpdate(password) { return hashPassword(password); }

export function verifyPassword(password, stored) {
  if (!stored || typeof password !== "string") return false;
  const [salt, expectedHex] = stored.split(":");
  if (!salt || !expectedHex) return false;
  const expected = Buffer.from(expectedHex, "hex");
  const actual = scryptSync(password, salt, 64);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export async function ensureDatabase() {
  if (!schemaReady) {
    schemaReady = (async () => {
      const sql = db();
      await sql`CREATE TABLE IF NOT EXISTS rock_users (
        id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
        username text NOT NULL UNIQUE,
        full_name text NOT NULL,
        role text NOT NULL CHECK (role IN ('owner','manager','finance','rep')),
        rep_name text,
        password_hash text NOT NULL,
        is_active boolean NOT NULL DEFAULT true,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      )`;
      await sql`CREATE TABLE IF NOT EXISTS rock_workspace (
        id integer PRIMARY KEY CHECK (id = 1),
        data jsonb NOT NULL,
        revision integer NOT NULL DEFAULT 1,
        updated_at timestamptz NOT NULL DEFAULT now()
      )`;
      await sql`CREATE TABLE IF NOT EXISTS rock_audit (
        id bigserial PRIMARY KEY,
        actor_id text,
        action text NOT NULL,
        created_at timestamptz NOT NULL DEFAULT now()
      )`;
      await sql`INSERT INTO rock_workspace (id, data) VALUES (1, ${JSON.stringify(seed)}::jsonb)
        ON CONFLICT (id) DO NOTHING`;

      const initialUsers = [
        ["owner", "صاحب المؤسسة", "owner", null, process.env.ROCK_OWNER_PASSWORD],
        ["manager", "مدير المبيعات", "manager", null, process.env.ROCK_MANAGER_PASSWORD],
        ["finance", "المحاسب", "finance", null, process.env.ROCK_FINANCE_PASSWORD],
        ["rep", "أحمد", "rep", "أحمد", process.env.ROCK_REP_PASSWORD],
        ["khaldoun", "خلدون", "rep", "خلدون", process.env.ROCK_REP_KHALDOUN_PASSWORD],
        ["nebras", "نبراس", "rep", "نبراس", process.env.ROCK_REP_NEBRAS_PASSWORD],
        ["yahya", "يحيى", "rep", "يحيى", process.env.ROCK_REP_YAHYA_PASSWORD],
        ["ali", "علي", "rep", "علي", process.env.ROCK_REP_ALI_PASSWORD]
      ];
      for (const [username, fullName, role, repName, password] of initialUsers) {
        if (!password) throw new Error(`Missing initial password for ${username}`);
        await sql`INSERT INTO rock_users (username, full_name, role, rep_name, password_hash)
          VALUES (${username}, ${fullName}, ${role}, ${repName}, ${hashPassword(password)})
          ON CONFLICT (username) DO NOTHING`;
      }

      // Safely add newly configured reps to an already initialized workspace.
      // Existing customer/order data and existing rep records remain untouched.
      const workspaceRows = await sql`SELECT data FROM rock_workspace WHERE id = 1 LIMIT 1`;
      const workspaceData = workspaceRows[0]?.data;
      if (workspaceData && Array.isArray(workspaceData.reps)) {
        const knownRepNames = new Set(workspaceData.reps.map((rep) => rep.name));
        const additions = [
          { id: "U-04", name: "خلدون", phone: "", discountLimit: 0, target: 0, sales: 0, status: "نشط" },
          { id: "U-05", name: "نبراس", phone: "", discountLimit: 0, target: 0, sales: 0, status: "نشط" },
          { id: "U-06", name: "يحيى", phone: "", discountLimit: 0, target: 0, sales: 0, status: "نشط" },
          { id: "U-07", name: "علي", phone: "", discountLimit: 0, target: 0, sales: 0, status: "نشط" }
        ].filter((rep) => !knownRepNames.has(rep.name));
        if (additions.length) {
          const nextReps = [...workspaceData.reps, ...additions];
          await sql`UPDATE rock_workspace
            SET data = jsonb_set(data, '{reps}', ${JSON.stringify(nextReps)}::jsonb),
                updated_at = now()
            WHERE id = 1`;
        }
      }
    })().catch((error) => {
      schemaReady = null;
      throw error;
    });
  }
  await schemaReady;
}

export function json(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(body));
}

export async function body(req) {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string") {
    try { return JSON.parse(req.body); } catch { return {}; }
  }
  const chunks = [];
  for await (const chunk of req) chunks.push(Buffer.from(chunk));
  if (!chunks.length) return {};
  try { return JSON.parse(Buffer.concat(chunks).toString("utf8")); } catch { return {}; }
}

function cookieToken(req) {
  const raw = req.headers.cookie || "";
  const pair = raw.split(";").map((x) => x.trim()).find((x) => x.startsWith("rock_session="));
  return pair ? decodeURIComponent(pair.slice("rock_session=".length)) : "";
}

function sign(value) {
  const secret = process.env.ROCK_AUTH_SECRET;
  if (!secret) throw new Error("ROCK_AUTH_SECRET is not configured");
  return createHmac("sha256", secret).update(value).digest("base64url");
}

export function issueSession(res, req, user) {
  const payload = Buffer.from(JSON.stringify({
    sub: user.id,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 12
  })).toString("base64url");
  const token = `${payload}.${sign(payload)}`;
  const secure = String(req.headers["x-forwarded-proto"] || "").includes("https") ? "; Secure" : "";
  res.setHeader("Set-Cookie", `rock_session=${encodeURIComponent(token)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=43200${secure}`);
}

export function clearSession(res, req) {
  const secure = String(req.headers["x-forwarded-proto"] || "").includes("https") ? "; Secure" : "";
  res.setHeader("Set-Cookie", `rock_session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0${secure}`);
}

export async function currentUser(req) {
  const token = cookieToken(req);
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;
  let expected;
  try { expected = sign(payload); } catch { return null; }
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  let claims;
  try { claims = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")); } catch { return null; }
  if (!claims.sub || !claims.exp || claims.exp < Math.floor(Date.now() / 1000)) return null;
  const rows = await db()`SELECT id, username, full_name, role, rep_name, is_active FROM rock_users WHERE id = ${claims.sub} LIMIT 1`;
  const user = rows[0];
  if (!user || !user.is_active) return null;
  return {
    id: user.id,
    username: user.username,
    fullName: user.full_name,
    role: user.role,
    repName: user.rep_name
  };
}

export function sameOrigin(req) {
  const origin = req.headers.origin;
  if (!origin) return true;
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  try { return new URL(origin).host === host; } catch { return false; }
}

export function safeError(error) {
  // Database and connection details must never be sent to the browser.
  return error?.message?.includes("not configured")
    ? "إعدادات الاتصال غير مكتملة. راجع متغيرات البيئة في Vercel."
    : "حدث خطأ في الخادم. حاول مرة أخرى.";
}
