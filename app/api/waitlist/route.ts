import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import {
  bodyTooLarge,
  isJsonRequest,
  rateLimit,
  sameOrigin,
} from "@/lib/server-security";

export const runtime = "edge";

const MAX_REQUEST_BYTES = 8_000;
const RATE_LIMIT_WINDOW_MS = 10 * 60_000;
const RATE_LIMIT_MAX = 5;

const rateBuckets = new Map<string, { count: number; resetAt: number }>();

function clean(value: unknown, maxLen: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.replace(/[\u0000-\u001F\u007F]/g, "").trim();
  if (!trimmed) return null;
  return trimmed.slice(0, maxLen);
}

export async function POST(req: Request) {
  try {
    if (!sameOrigin(req)) {
      return NextResponse.json(
        { ok: false, error: "invalid_origin" },
        { status: 403, headers: { "cache-control": "no-store" } },
      );
    }

    if (!isJsonRequest(req)) {
      return NextResponse.json(
        { ok: false, error: "invalid_content_type" },
        { status: 415, headers: { "cache-control": "no-store" } },
      );
    }

    if (bodyTooLarge(req, MAX_REQUEST_BYTES)) {
      return NextResponse.json(
        { ok: false, error: "body_too_large" },
        { status: 413, headers: { "cache-control": "no-store" } },
      );
    }

    const limited = rateLimit({
      buckets: rateBuckets,
      windowMs: RATE_LIMIT_WINDOW_MS,
      max: RATE_LIMIT_MAX,
      request: req,
      onLimited: (retryAfter) =>
        NextResponse.json(
          { ok: false, error: "rate_limited" },
          {
            status: 429,
            headers: {
              "cache-control": "no-store",
              "retry-after": retryAfter,
            },
          },
        ),
    });
    if (limited) return limited;

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
      ON CONFLICT ((lower(email))) DO NOTHING
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
