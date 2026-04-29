import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const runtime = "edge";

const MAX_REQUEST_BYTES = 8_000;
const RATE_LIMIT_WINDOW_MS = 10 * 60_000;
const RATE_LIMIT_MAX = 5;

type RateBucket = { count: number; resetAt: number };

const rateBuckets = new Map<string, RateBucket>();

let tableReady: Promise<void> | null = null;
async function ensureTable() {
  if (!tableReady) {
    tableReady = (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS waitlist (
          id          SERIAL PRIMARY KEY,
          name        TEXT,
          email       TEXT,
          phone       TEXT,
          created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          user_agent  TEXT,
          referer     TEXT
        )
      `;
      // Migrations for pre-existing tables: email is new, phone used to be NOT NULL.
      await sql`ALTER TABLE waitlist ADD COLUMN IF NOT EXISTS email TEXT`;
      await sql`ALTER TABLE waitlist ALTER COLUMN phone DROP NOT NULL`;
      await sql`CREATE INDEX IF NOT EXISTS waitlist_email_idx ON waitlist (email)`;
      await sql`CREATE INDEX IF NOT EXISTS waitlist_phone_idx ON waitlist (phone)`;
    })();
  }
  return tableReady;
}

function clean(value: unknown, maxLen: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.replace(/[\u0000-\u001F\u007F]/g, "").trim();
  if (!trimmed) return null;
  return trimmed.slice(0, maxLen);
}

function clientIp(req: Request) {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    req.headers.get("cf-connecting-ip") ||
    "unknown"
  );
}

function sameOrigin(req: Request) {
  const origin = req.headers.get("origin");
  if (!origin) return true;

  try {
    const originUrl = new URL(origin);
    const requestUrl = new URL(req.url);
    return originUrl.host === req.headers.get("host") || originUrl.host === requestUrl.host;
  } catch {
    return false;
  }
}

function rateLimit(req: Request) {
  const now = Date.now();
  const key = clientIp(req);
  const existing = rateBuckets.get(key);
  const bucket =
    existing && existing.resetAt > now
      ? existing
      : { count: 0, resetAt: now + RATE_LIMIT_WINDOW_MS };

  bucket.count += 1;
  rateBuckets.set(key, bucket);

  if (rateBuckets.size > 10_000) {
    for (const [bucketKey, value] of rateBuckets) {
      if (value.resetAt <= now) rateBuckets.delete(bucketKey);
    }
  }

  if (bucket.count > RATE_LIMIT_MAX) {
    const retryAfter = Math.ceil((bucket.resetAt - now) / 1000).toString();
    return NextResponse.json(
      { ok: false, error: "rate_limited" },
      {
        status: 429,
        headers: {
          "cache-control": "no-store",
          "retry-after": retryAfter,
        },
      },
    );
  }

  return null;
}

export async function POST(req: Request) {
  try {
    if (!sameOrigin(req)) {
      return NextResponse.json(
        { ok: false, error: "invalid_origin" },
        { status: 403, headers: { "cache-control": "no-store" } },
      );
    }

    if (!req.headers.get("content-type")?.includes("application/json")) {
      return NextResponse.json(
        { ok: false, error: "invalid_content_type" },
        { status: 415, headers: { "cache-control": "no-store" } },
      );
    }

    const contentLength = Number(req.headers.get("content-length") || 0);
    if (contentLength > MAX_REQUEST_BYTES) {
      return NextResponse.json(
        { ok: false, error: "body_too_large" },
        { status: 413, headers: { "cache-control": "no-store" } },
      );
    }

    const limited = rateLimit(req);
    if (limited) return limited;

    await ensureTable();

    let body: { name?: unknown; email?: unknown; phone?: unknown };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { ok: false, error: "invalid_json" },
        { status: 400, headers: { "cache-control": "no-store" } },
      );
    }

    const name = clean(body.name, 120);
    const email = clean(body.email, 200)?.toLowerCase();
    const phone = clean(body.phone, 40);

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { ok: false, error: "invalid_email" },
        { status: 400, headers: { "cache-control": "no-store" } },
      );
    }

    if (phone) {
      const digitCount = phone.replace(/\D/g, "").length;
      if (digitCount < 10) {
        return NextResponse.json(
          { ok: false, error: "invalid_phone" },
          { status: 400, headers: { "cache-control": "no-store" } },
        );
      }
    }

    const userAgent = req.headers.get("user-agent")?.slice(0, 300) ?? null;
    const referer = req.headers.get("referer")?.slice(0, 300) ?? null;

    await sql`
      INSERT INTO waitlist (name, email, phone, user_agent, referer)
      VALUES (${name}, ${email}, ${phone}, ${userAgent}, ${referer})
    `;

    return NextResponse.json(
      { ok: true },
      { headers: { "cache-control": "no-store" } },
    );
  } catch (err) {
    console.error("[waitlist] insert failed", err);
    return NextResponse.json(
      { ok: false, error: "server_error" },
      { status: 500, headers: { "cache-control": "no-store" } },
    );
  }
}
