import { streamText, type ModelMessage } from "ai";
import { AGENT_SYSTEM_PROMPT } from "@/lib/agent-prompt";
import {
  bodyTooLarge,
  isJsonRequest,
  rateLimit,
  sameOrigin,
} from "@/lib/server-security";

export const runtime = "nodejs";

const MODEL_ID = "openai/gpt-oss-120b";
const MAX_MESSAGES = 20;
const MAX_CHARS_PER_MESSAGE = 2000;
const MAX_REQUEST_BYTES = 64_000;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 10;

type InMessage = { role: "user" | "assistant"; content: string };
const rateBuckets = new Map<string, { count: number; resetAt: number }>();

function cleanTelemetryValue(value: unknown) {
  return typeof value === "string" && value.length > 0
    ? value.slice(0, 200)
    : undefined;
}

function configuredForPostHog() {
  return Boolean(
    process.env.POSTHOG_TOKEN ||
      process.env.POSTHOG_PROJECT_TOKEN ||
      process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN ||
      process.env.NEXT_PUBLIC_POSTHOG_TOKEN ||
      process.env.NEXT_PUBLIC_POSTHOG_KEY,
  );
}

function telemetryMetadata(payload: {
  posthogDistinctId?: unknown;
  posthogSessionId?: unknown;
} | null) {
  const metadata: Record<string, string> = {
    posthog_trace_id: crypto.randomUUID(),
    route: "/api/chat",
    feature: "help_agent",
  };
  const distinctId = cleanTelemetryValue(payload?.posthogDistinctId);
  const sessionId = cleanTelemetryValue(payload?.posthogSessionId);
  if (distinctId) metadata.posthog_distinct_id = distinctId;
  if (sessionId) metadata.posthog_session_id = sessionId;
  return metadata;
}

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

export async function POST(req: Request) {
  if (!process.env.AI_GATEWAY_API_KEY && !process.env.VERCEL_OIDC_TOKEN) {
    return jsonError("Agent is not configured.", 500);
  }

  if (!sameOrigin(req)) {
    return jsonError("Invalid origin.", 403);
  }

  if (!isJsonRequest(req)) {
    return jsonError("Content-Type must be application/json.", 415);
  }

  if (bodyTooLarge(req, MAX_REQUEST_BYTES)) {
    return jsonError("Request body is too large.", 413);
  }

  const limited = rateLimit({
    buckets: rateBuckets,
    windowMs: RATE_LIMIT_WINDOW_MS,
    max: RATE_LIMIT_MAX,
    request: req,
    onLimited: (retryAfter) =>
      jsonError("Too many requests.", 429, { "retry-after": retryAfter }),
  });
  if (limited) return limited;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid JSON.", 400);
  }

  const payload = body as {
    messages?: unknown;
    posthogDistinctId?: unknown;
    posthogSessionId?: unknown;
  } | null;
  const raw = payload?.messages;
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
      experimental_telemetry: {
        isEnabled: configuredForPostHog(),
        functionId: "help-agent-chat",
        metadata: telemetryMetadata(payload),
      },
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
