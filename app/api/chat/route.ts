import { streamText, type ModelMessage } from "ai";
import { AGENT_SYSTEM_PROMPT } from "@/lib/agent-prompt";

export const runtime = "edge";

const MODEL_ID = "openai/gpt-oss-120b";
const MAX_MESSAGES = 20;
const MAX_CHARS_PER_MESSAGE = 2000;
const MAX_REQUEST_BYTES = 64_000;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 10;

type InMessage = { role: "user" | "assistant"; content: string };
type RateBucket = { count: number; resetAt: number };

const rateBuckets = new Map<string, RateBucket>();

function jsonError(message: string, status: number, headers?: HeadersInit) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store",
      ...headers,
    },
  });
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
    return jsonError("Too many requests.", 429, { "retry-after": retryAfter });
  }

  return null;
}

export async function POST(req: Request) {
  if (!process.env.AI_GATEWAY_API_KEY && !process.env.VERCEL_OIDC_TOKEN) {
    return jsonError("Agent is not configured.", 500);
  }

  if (!sameOrigin(req)) {
    return jsonError("Invalid origin.", 403);
  }

  if (!req.headers.get("content-type")?.includes("application/json")) {
    return jsonError("Content-Type must be application/json.", 415);
  }

  const contentLength = Number(req.headers.get("content-length") || 0);
  if (contentLength > MAX_REQUEST_BYTES) {
    return jsonError("Request body is too large.", 413);
  }

  const limited = rateLimit(req);
  if (limited) return limited;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid JSON.", 400);
  }

  const raw = (body as { messages?: unknown } | null)?.messages;
  if (!Array.isArray(raw)) {
    return jsonError("Invalid messages.", 400);
  }

  const messages: InMessage[] = (raw as unknown[])
    .slice(-MAX_MESSAGES)
    .map((m): InMessage => {
      const item = m as { role?: unknown; content?: unknown };
      return {
        role: item.role === "assistant" ? "assistant" : "user",
        content:
          typeof item.content === "string"
            ? item.content.slice(0, MAX_CHARS_PER_MESSAGE)
            : "",
      };
    })
    .filter((m) => m.content.length > 0);

  if (messages.length === 0 || messages[messages.length - 1].role !== "user") {
    return jsonError("Last message must be from user.", 400);
  }

  const modelMessages: ModelMessage[] = messages.map((m) => ({
    role: m.role,
    content: m.content,
  }));

  try {
    const result = streamText({
      model: MODEL_ID,
      system: AGENT_SYSTEM_PROMPT,
      messages: modelMessages,
      maxOutputTokens: 1024,
      temperature: 0.4,
    });

    return result.toTextStreamResponse({
      headers: { "cache-control": "no-store" },
    });
  } catch (err) {
    console.error("[chat] stream error", err);
    return new Response("\n\n[Something went wrong. Please try again.]", {
      status: 500,
      headers: {
        "content-type": "text/plain; charset=utf-8",
        "cache-control": "no-store",
      },
    });
  }
}
