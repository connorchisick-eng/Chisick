import { streamText } from "ai";
import { gateway } from "@ai-sdk/gateway";
import { withTracing } from "@posthog/ai";
import { AGENT_SYSTEM_PROMPT } from "@/lib/agent-prompt";
import {
  trackServer,
  flushAnalytics,
  getPosthogNodeClient,
} from "@/lib/server-analytics";

/**
 * Ask Tabby — streaming chat endpoint.
 *
 * Model: `openai/gpt-oss-20b` via Vercel AI Gateway.
 *   - Billing + rate-limiting handled by Vercel (set `AI_GATEWAY_API_KEY`
 *     in env; on Vercel prod it's auto-provisioned by the AI Gateway
 *     product when the project has billing enabled).
 *   - Swapping providers is a one-line change — the gateway prefix is
 *     `provider/model-id`, so we could move to OpenAI / Anthropic /
 *     another Google model by rewriting the string.
 *
 * Observability:
 *   - `@posthog/ai`'s `withTracing` wraps the LanguageModel so every
 *     completion emits a `$ai_generation` event with model, provider,
 *     input/output tokens, cost estimates, latency, and (unless
 *     `posthogPrivacyMode: true`) the prompt + completion. This feeds
 *     PostHog's LLM Observability view automatically — no dashboard
 *     work needed on our side.
 *   - We still emit app-level `help_agent_server_responded` /
 *     `help_agent_server_errored` in `onFinish` / `onError` so the
 *     same conversation-level timing is filterable without joining
 *     through AI events.
 *
 * Feature flag: the previously-gated `ai_help_agent` kill-switch has
 * been removed now that the chat is going live. The flag lib stays in
 * place for future rollouts.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

type InMessage = { role: "user" | "assistant"; content: string };

const MAX_MESSAGES = 20;
const MAX_CHARS_PER_MESSAGE = 2000;
const MODEL_ID = "openai/gpt-oss-20b";

function jsonError(body: Record<string, unknown>, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

export async function POST(req: Request) {
  const distinctId =
    req.headers.get("x-posthog-distinct-id") || "anon-no-id";

  const body = await req.json().catch(() => ({}));
  const raw = (body as { messages?: unknown })?.messages;
  if (!Array.isArray(raw)) {
    return jsonError({ error: "Invalid messages." }, 400);
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
    return jsonError({ error: "Last message must be from user." }, 400);
  }

  const phClient = getPosthogNodeClient();
  const baseModel = gateway(MODEL_ID);
  // If PostHog is configured, wrap the model so $ai_generation events
  // are emitted automatically. If not, we fall through to the raw
  // gateway model — the app still works, we just lose LLM analytics.
  const model = phClient
    ? withTracing(baseModel, phClient, {
        posthogDistinctId: distinctId,
        posthogProperties: {
          source: "ask_tabby",
          conversation_len: messages.length,
          last_user_msg_len: messages[messages.length - 1].content.length,
        },
      })
    : baseModel;

  const startedAt = Date.now();

  try {
    const result = streamText({
      model,
      system: AGENT_SYSTEM_PROMPT,
      messages,
      maxOutputTokens: 1024,
      onFinish: async ({ usage, finishReason }) => {
        await trackServer("help_agent_server_responded", distinctId, {
          duration_ms: Date.now() - startedAt,
          model: MODEL_ID,
          finish_reason: finishReason ?? null,
          input_tokens: usage?.inputTokens ?? null,
          output_tokens: usage?.outputTokens ?? null,
          total_tokens: usage?.totalTokens ?? null,
          conversation_len: messages.length,
        });
        await flushAnalytics();
      },
      onError: async ({ error }) => {
        console.error("[chat] stream error", error);
        await trackServer("help_agent_server_errored", distinctId, {
          duration_ms: Date.now() - startedAt,
          model: MODEL_ID,
          error_type: error instanceof Error ? error.name : "unknown",
          error_message:
            error instanceof Error
              ? error.message.slice(0, 200)
              : String(error).slice(0, 200),
        });
        await flushAnalytics();
      },
    });

    // Plain text stream so the existing frontend's `reader.read()` loop
    // keeps working unchanged.
    return result.toTextStreamResponse();
  } catch (err) {
    console.error("[chat] setup error", err);
    await trackServer("help_agent_server_errored", distinctId, {
      duration_ms: Date.now() - startedAt,
      model: MODEL_ID,
      phase: "setup",
      error_type: err instanceof Error ? err.name : "unknown",
    });
    await flushAnalytics();
    return jsonError({ error: "server_error" }, 500);
  }
}
