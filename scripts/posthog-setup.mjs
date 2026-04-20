#!/usr/bin/env node
/**
 * posthog-setup.mjs
 * -----------------
 * Idempotently provisions the PostHog side of the Tabby analytics stack:
 *   - feature flag `ai_help_agent` (default OFF / 0% rollout)
 *   - insights matching the event taxonomy we ship
 *   - a dashboard "Tabby — Product Metrics" that pins them all
 *
 * Every create step searches for an existing item with the same name/key
 * first, so re-running the script won't duplicate anything — it'll
 * only create what's missing.
 *
 * Usage:
 *   POSTHOG_PERSONAL_API_KEY=phx_...     # create at /project/settings/personal-api-keys
 *   POSTHOG_PROJECT_ID=12345              # numeric project id
 *   POSTHOG_HOST=https://us.posthog.com   # optional, defaults to US cloud
 *   node scripts/posthog-setup.mjs
 *
 *   (also exposed as `npm run posthog:setup`)
 *
 * The personal API key is the one with CRUD scope on your PostHog
 * project — it is NOT the public `NEXT_PUBLIC_POSTHOG_KEY` that the
 * browser uses. Do not commit it.
 */

const HOST = (process.env.POSTHOG_HOST || "https://us.posthog.com").replace(/\/$/, "");
const API_KEY = process.env.POSTHOG_PERSONAL_API_KEY;
const PROJECT_ID = process.env.POSTHOG_PROJECT_ID;

if (!API_KEY || !PROJECT_ID) {
  console.error(
    "Missing env. Required:\n" +
      "  POSTHOG_PERSONAL_API_KEY (create at /project/settings/personal-api-keys)\n" +
      "  POSTHOG_PROJECT_ID (the numeric project id)\n" +
      "Optional:\n" +
      "  POSTHOG_HOST (default: https://us.posthog.com)",
  );
  process.exit(1);
}

const BASE = `${HOST}/api/projects/${PROJECT_ID}`;

const c = {
  reset: "\x1b[0m",
  dim: "\x1b[2m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  red: "\x1b[31m",
};

function log(color, label, msg) {
  console.log(`${c[color]}${label.padEnd(8)}${c.reset} ${msg}`);
}

async function api(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = text;
  }
  if (!res.ok) {
    throw new Error(
      `PostHog API ${method} ${path} → ${res.status}\n${typeof json === "string" ? json : JSON.stringify(json, null, 2)}`,
    );
  }
  return json;
}

// Paginated helper for GET endpoints that return { results, next }.
async function findByName(path, name, key = "name") {
  const url = `${path}?search=${encodeURIComponent(name)}&limit=200`;
  const res = await api("GET", url);
  const results = Array.isArray(res?.results) ? res.results : [];
  return results.find((r) => r[key] === name) ?? null;
}

// --------------------------------------------------------------------
// Feature flag
// --------------------------------------------------------------------

async function ensureFlag(key, name, description) {
  // Flags are keyed (unique) — search by key, not name.
  const existing = await findByName("/feature_flags/", key, "key");
  if (existing) {
    log("dim", "flag", `${key} already exists (id ${existing.id}) — skipping`);
    return existing;
  }
  const created = await api("POST", "/feature_flags/", {
    key,
    name,
    active: true,
    filters: {
      // 0% rollout means the flag is live but evaluates false for everyone.
      // Flip the slider (or add a release condition) in the PostHog UI
      // when the team is ready.
      groups: [{ properties: [], rollout_percentage: 0 }],
    },
    ...(description ? { tags: ["tabby"], description } : {}),
  });
  log("green", "flag", `created ${key} (id ${created.id}) — currently OFF`);
  return created;
}

// --------------------------------------------------------------------
// Dashboards + insights
// --------------------------------------------------------------------

async function ensureDashboard(name, description) {
  const existing = await findByName("/dashboards/", name);
  if (existing) {
    log("dim", "dash", `"${name}" already exists (id ${existing.id}) — reusing`);
    return existing;
  }
  const created = await api("POST", "/dashboards/", {
    name,
    description: description ?? "",
    pinned: true,
  });
  log("green", "dash", `created "${name}" (id ${created.id})`);
  return created;
}

async function ensureInsight({ name, description, filters, dashboardId }) {
  const existing = await findByName("/insights/", name);
  if (existing) {
    log("dim", "insight", `"${name}" already exists (id ${existing.id}) — skipping`);
    // Best-effort link to the dashboard in case the insight was created
    // elsewhere first.
    if (dashboardId && !(existing.dashboards ?? []).includes(dashboardId)) {
      await api("PATCH", `/insights/${existing.id}/`, {
        dashboards: [...(existing.dashboards ?? []), dashboardId],
      });
    }
    return existing;
  }
  const created = await api("POST", "/insights/", {
    name,
    description: description ?? "",
    filters,
    saved: true,
    ...(dashboardId ? { dashboards: [dashboardId] } : {}),
  });
  log("green", "insight", `created "${name}" (id ${created.id})`);
  return created;
}

// --------------------------------------------------------------------
// Filter builders — shared so every insight reads the same date range
// --------------------------------------------------------------------

const DATE_FROM = "-30d";
const DATE_TO = null;

function funnel(steps, extra = {}) {
  return {
    insight: "FUNNELS",
    events: steps.map((id, i) => ({ id, type: "events", order: i })),
    date_from: DATE_FROM,
    date_to: DATE_TO,
    funnel_viz_type: "steps",
    funnel_window_interval: 1,
    funnel_window_interval_unit: "day",
    ...extra,
  };
}

function trend(eventId, extra = {}) {
  return {
    insight: "TRENDS",
    events: [{ id: eventId, type: "events", order: 0, math: "total" }],
    date_from: DATE_FROM,
    date_to: DATE_TO,
    display: "ActionsLineGraph",
    interval: "day",
    ...extra,
  };
}

// --------------------------------------------------------------------
// Main
// --------------------------------------------------------------------

async function main() {
  log("cyan", "posthog", `host=${HOST} project=${PROJECT_ID}`);

  // No feature flags created by default any more — the former
  // `ai_help_agent` kill-switch was removed when Ask Tabby went live.
  // Add `ensureFlag(...)` calls here if/when new flags are needed.

  // Dashboard
  const dash = await ensureDashboard(
    "Tabby — Product Metrics",
    "The single-pane view of visitor behaviour, conversion, and engagement on the marketing site. Built via scripts/posthog-setup.mjs.",
  );
  const dashboardId = dash.id;

  // Insights, all pinned to the dashboard above
  await ensureInsight({
    name: "Waitlist — conversion funnel",
    description:
      "Scroll → view form → start typing → submit → success. Break down by device_type or theme in the UI.",
    filters: funnel([
      "section_viewed",
      "waitlist_form_viewed",
      "waitlist_form_started",
      "waitlist_form_submitted",
      "waitlist_form_succeeded",
    ]),
    dashboardId,
  });

  await ensureInsight({
    name: "Waitlist — submit vs. success (reliability)",
    description:
      "How many submit attempts actually succeed server-side. A gap here means /api/waitlist is erroring.",
    filters: funnel(["waitlist_form_submitted", "waitlist_server_insert_ok"]),
    dashboardId,
  });

  await ensureInsight({
    name: "Pricing interest → waitlist",
    description:
      "Section view → period toggle → pricing CTA → waitlist join. Segment by tier for free-vs-pro pull.",
    filters: funnel([
      "section_viewed",
      "pricing_period_toggled",
      "pricing_cta_clicked",
      "cta_join_waitlist_clicked",
      "waitlist_form_succeeded",
    ]),
    dashboardId,
  });

  await ensureInsight({
    name: "Hero carousel — advances per user",
    description:
      "Total `hero_carousel_advanced` events per day. Break down by `via` in the UI to split auto vs. user-driven.",
    filters: trend("hero_carousel_advanced"),
    dashboardId,
  });

  await ensureInsight({
    name: "Hero carousel — loop wraps",
    description:
      "How often users actually circle past the end of the phone gallery. Higher = more engagement.",
    filters: trend("hero_carousel_wrapped"),
    dashboardId,
  });

  await ensureInsight({
    name: "Ask Tabby — open → message → response funnel",
    description:
      "Happy-path chat funnel once the flag is ON. A big drop at `help_agent_response_streamed` means /api/chat is failing.",
    filters: funnel(
      [
        "help_agent_opened",
        "help_agent_message_sent",
        "help_agent_response_streamed",
      ],
      { funnel_window_interval: 10, funnel_window_interval_unit: "minute" },
    ),
    dashboardId,
  });

  await ensureInsight({
    name: "Ask Tabby — errors",
    description: "Total client + server errors from the AI chat.",
    filters: {
      insight: "TRENDS",
      events: [
        { id: "help_agent_errored", type: "events", order: 0, math: "total" },
        { id: "help_agent_server_errored", type: "events", order: 1, math: "total" },
      ],
      date_from: DATE_FROM,
      display: "ActionsLineGraph",
      interval: "day",
    },
    dashboardId,
  });

  await ensureInsight({
    name: "Theme adoption — light vs. dark",
    description:
      "Count of `theme_toggled` events over time. Break down by `to` in the UI to see which direction users flip.",
    filters: trend("theme_toggled"),
    dashboardId,
  });

  await ensureInsight({
    name: "Scroll depth — 25 / 50 / 75 / 100",
    description: "How deep people actually read. Break down by `depth`.",
    filters: trend("scroll_depth_reached"),
    dashboardId,
  });

  await ensureInsight({
    name: "FAQ engagement",
    description:
      "`faq_item_toggled` volume. Break down by `index` or `question_preview` to see which questions matter.",
    filters: trend("faq_item_toggled"),
    dashboardId,
  });

  await ensureInsight({
    name: "Primary CTA clicks by surface",
    description:
      "`cta_join_waitlist_clicked` per day. Break down by `surface` to compare nav / hero / mobile / pricing.",
    filters: trend("cta_join_waitlist_clicked"),
    dashboardId,
  });

  log(
    "green",
    "done",
    `Dashboard ready → ${HOST}/project/${PROJECT_ID}/dashboard/${dashboardId}`,
  );
}

main().catch((err) => {
  log("red", "error", err.message || String(err));
  process.exit(1);
});
