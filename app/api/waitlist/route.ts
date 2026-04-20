import { NextResponse } from "next/server";
import { getSql } from "@/lib/db";
import { trackServer, flushAnalytics } from "@/lib/server-analytics";

// Node runtime so posthog-node works without edge-compat gymnastics.
// The route's latency-sensitive path is the DB insert, not cold start.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

let tableReady: Promise<void> | null = null;
async function ensureTable() {
  if (!tableReady) {
    const sql = getSql();
    tableReady = (async () => {
      // Base table. `email` and `phone` are both nullable at the DB
      // layer so this migration is safe against historical rows that
      // predate the email-required flip. Required-ness is enforced in
      // the handler below.
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
      await sql`ALTER TABLE waitlist ADD COLUMN IF NOT EXISTS email TEXT`;
      await sql`ALTER TABLE waitlist ALTER COLUMN phone DROP NOT NULL`;
      await sql`CREATE UNIQUE INDEX IF NOT EXISTS waitlist_email_unique ON waitlist (lower(email))`;
      await sql`CREATE INDEX IF NOT EXISTS waitlist_phone_idx ON waitlist (phone)`;
    })();
  }
  return tableReady;
}

function clean(value: unknown, maxLen: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, maxLen);
}

// Intentionally loose: matches common typos folks still want to hear back
// from. Real deliverability is validated at send-time by the ESP.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  const startedAt = Date.now();
  const distinctId =
    req.headers.get("x-posthog-distinct-id") || "anon-no-id";

  try {
    await ensureTable();

    const body = await req.json().catch(() => ({}));
    const name = clean(body.name, 120);
    const rawEmail = clean(body.email, 200);
    const email = rawEmail ? rawEmail.toLowerCase() : null;
    const phone = clean(body.phone, 40);

    if (!email || !EMAIL_RE.test(email)) {
      await trackServer("waitlist_server_rejected", distinctId, {
        reason: "invalid_email",
        has_email: Boolean(email),
      });
      await flushAnalytics();
      return NextResponse.json(
        { ok: false, error: "invalid_email" },
        { status: 400 },
      );
    }

    // Phone is optional. If present, still require the same >=10-digit
    // heuristic we had before — otherwise treat as "not provided".
    const digitCount = phone ? phone.replace(/\D/g, "").length : 0;
    if (phone && digitCount < 10) {
      await trackServer("waitlist_server_rejected", distinctId, {
        reason: "invalid_phone",
        phone_digit_count: digitCount,
      });
      await flushAnalytics();
      return NextResponse.json(
        { ok: false, error: "invalid_phone" },
        { status: 400 },
      );
    }

    const userAgent = req.headers.get("user-agent")?.slice(0, 300) ?? null;
    const referer = req.headers.get("referer")?.slice(0, 300) ?? null;
    const emailDomain = email.split("@")[1] ?? null;

    const sql = getSql();
    // ON CONFLICT on the case-insensitive unique index: re-submissions
    // with the same email are idempotent, no 500s.
    const rows = await sql`
      INSERT INTO waitlist (name, email, phone, user_agent, referer)
      VALUES (${name}, ${email}, ${phone}, ${userAgent}, ${referer})
      ON CONFLICT ((lower(email))) DO NOTHING
      RETURNING id
    `;
    const alreadySubscribed = rows.length === 0;

    await trackServer("waitlist_server_insert_ok", distinctId, {
      duration_ms: Date.now() - startedAt,
      has_name: Boolean(name),
      has_email: true,
      has_phone: Boolean(phone),
      phone_digit_count: digitCount,
      email_domain: emailDomain,
      has_referer: Boolean(referer),
      already_subscribed: alreadySubscribed,
    });
    await flushAnalytics();

    return NextResponse.json({ ok: true, already_subscribed: alreadySubscribed });
  } catch (err) {
    console.error("[waitlist] insert failed", err);
    await trackServer("waitlist_server_insert_failed", distinctId, {
      duration_ms: Date.now() - startedAt,
      error_type: err instanceof Error ? err.name : "unknown",
      error_message:
        err instanceof Error ? err.message.slice(0, 200) : String(err).slice(0, 200),
    });
    await flushAnalytics();
    return NextResponse.json(
      { ok: false, error: "server_error" },
      { status: 500 },
    );
  }
}
