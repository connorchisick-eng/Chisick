import Anthropic from "@anthropic-ai/sdk";
import { AGENT_SYSTEM_PROMPT } from "@/lib/agent-prompt";

export const runtime = "edge";

type InMessage = { role: "user" | "assistant"; content: string };

const MAX_MESSAGES = 20;
const MAX_CHARS_PER_MESSAGE = 2000;

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "Agent is not configured." }),
      { status: 500, headers: { "content-type": "application/json" } },
    );
  }

  const body = await req.json().catch(() => ({}));
  const raw = body?.messages;
  if (!Array.isArray(raw)) {
    return new Response(
      JSON.stringify({ error: "Invalid messages." }),
      { status: 400, headers: { "content-type": "application/json" } },
    );
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
    return new Response(
      JSON.stringify({ error: "Last message must be from user." }),
      { status: 400, headers: { "content-type": "application/json" } },
    );
  }

  const client = new Anthropic({ apiKey });

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const response = await client.messages.stream({
          model: "claude-sonnet-4-5",
          max_tokens: 1024,
          system: [
            {
              type: "text",
              text: AGENT_SYSTEM_PROMPT,
              cache_control: { type: "ephemeral" },
            },
          ],
          messages,
        });

        for await (const event of response) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
        controller.close();
      } catch (err) {
        console.error("[chat] stream error", err);
        controller.enqueue(
          encoder.encode("\n\n[Something went wrong. Please try again.]"),
        );
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}
