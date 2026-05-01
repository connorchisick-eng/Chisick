import { resourceFromAttributes } from "@opentelemetry/resources";
import { NodeSDK } from "@opentelemetry/sdk-node";
import { PostHogSpanProcessor } from "@posthog/ai/otel";

declare global {
  var __tabbyPostHogOtelStarted: boolean | undefined;
}

function posthogHost() {
  const host = process.env.POSTHOG_HOST || process.env.NEXT_PUBLIC_POSTHOG_HOST;
  if (!host || host.startsWith("/")) return "https://us.i.posthog.com";
  return host;
}

const token =
  process.env.POSTHOG_TOKEN ||
  process.env.POSTHOG_PROJECT_TOKEN ||
  process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN ||
  process.env.NEXT_PUBLIC_POSTHOG_TOKEN ||
  process.env.NEXT_PUBLIC_POSTHOG_KEY;

if (token && !globalThis.__tabbyPostHogOtelStarted) {
  globalThis.__tabbyPostHogOtelStarted = true;

  const sdk = new NodeSDK({
    resource: resourceFromAttributes({
      "service.name": "tabby-site",
    }),
    spanProcessors: [
      new PostHogSpanProcessor({
        apiKey: token,
        host: posthogHost(),
      }),
    ],
  });

  sdk.start();
}
