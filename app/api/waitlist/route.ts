import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const runtime = "edge";

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
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, maxLen);
}

export async function POST(req: Request) {
  try {
    await ensureTable();

    const body = await req.json().catch(() => ({}));
    const name = clean(body.name, 120);
    const email = clean(body.email, 200);
    const phone = clean(body.phone, 40);

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { ok: false, error: "invalid_email" },
        { status: 400 },
      );
    }

    if (phone) {
      const digitCount = phone.replace(/\D/g, "").length;
      if (digitCount < 10) {
        return NextResponse.json(
          { ok: false, error: "invalid_phone" },
          { status: 400 },
        );
      }
    }

    const userAgent = req.headers.get("user-agent")?.slice(0, 300) ?? null;
    const referer = req.headers.get("referer")?.slice(0, 300) ?? null;

    await sql`
      INSERT INTO waitlist (name, email, phone, user_agent, referer)
      VALUES (${name}, ${email}, ${phone}, ${userAgent}, ${referer})
    `;

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[waitlist] insert failed", err);
    return NextResponse.json(
      { ok: false, error: "server_error" },
      { status: 500 },
    );
  }
}
