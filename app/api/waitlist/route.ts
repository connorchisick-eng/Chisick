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
          phone       TEXT NOT NULL,
          created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          user_agent  TEXT,
          referer     TEXT
        )
      `;
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
    const phone = clean(body.phone, 40);

    const digitCount = phone ? phone.replace(/\D/g, "").length : 0;
    if (!phone || digitCount < 10) {
      return NextResponse.json(
        { ok: false, error: "invalid_phone" },
        { status: 400 },
      );
    }

    const userAgent = req.headers.get("user-agent")?.slice(0, 300) ?? null;
    const referer = req.headers.get("referer")?.slice(0, 300) ?? null;

    await sql`
      INSERT INTO waitlist (name, phone, user_agent, referer)
      VALUES (${name}, ${phone}, ${userAgent}, ${referer})
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
