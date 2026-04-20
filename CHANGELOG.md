# Changelog

## [Unreleased] — 2026-04-19

### Changed — Ask Tabby: live, on Vercel AI Gateway, with PostHog LLM tracing

- **Unflagged.** The `ai_help_agent` feature-flag kill-switch is gone. `components/HelpAgent.tsx` no longer imports `useFlag` or early-returns `null`; the chat renders on every page load. `app/api/chat/route.ts` no longer calls `isFlagEnabledServer`. `lib/flags.ts` stays in place for future flags — the type union still lists `ai_help_agent` so old references don't break, but nothing in the app reads it.
- **Model: Vercel AI Gateway (`google/gemini-3.1-flash-lite-preview`).** `app/api/chat/route.ts` rewritten from the Anthropic SDK to Vercel's gateway:
  - Uses `streamText` from `ai` (v6) with `gateway("google/gemini-3.1-flash-lite-preview")` from `@ai-sdk/gateway`.
  - Billing + rate-limiting runs through Vercel's AI Gateway product (set `AI_GATEWAY_API_KEY` locally; on Vercel prod it's auto-provisioned when the project has billing enabled).
  - Response is returned via `result.toTextStreamResponse()` — `text/plain; charset=utf-8` plain-text chunks, which the existing HelpAgent frontend (`reader.read()` loop) consumes unchanged.
  - Model id lives in a constant (`MODEL_ID`) so swapping providers is a single-line change.
  - `maxTokens: 1024`, `maxDuration: 30` — tunable.
  - Anthropic-specific `cache_control: { type: "ephemeral" }` removed with the SDK swap.
- **PostHog LLM observability via `@posthog/ai`.** The gateway model is wrapped in `withTracing(baseModel, posthogClient, { posthogDistinctId, posthogProperties })`. Every completion now emits a `$ai_generation` event on the user's person profile with model, provider, input/output tokens, Vercel Gateway cost, latency, and (default) prompt + completion — populating PostHog's LLM Observability view with zero extra dashboarding. The wrapper reads the `x-posthog-distinct-id` header the client already sends, so these events attach to the same person as the waitlist funnel.
- **App-level timing events kept.** `help_agent_server_responded` / `help_agent_server_errored` now fire from `onFinish` / `onError` of `streamText`, carrying `model`, `finish_reason`, `input_tokens`, `output_tokens`, `total_tokens`, and `duration_ms`. These complement (don't duplicate) the `$ai_generation` events — they're filterable without joining through AI events, useful for monitoring the endpoint itself.
- **`lib/server-analytics.ts`** now exports `getPosthogNodeClient()`, a thin accessor over the cached singleton. Used by the chat route to hand the same client to `withTracing`, so LLM events and the rest of our server-side events share a single posthog-node instance (respects the same flush config).
- **`scripts/posthog-setup.mjs`** trimmed: no longer creates the `ai_help_agent` flag. Re-running the script after this change is still safe — existing flags aren't deleted, just not created fresh. Dashboards and insights (chat funnel, chat errors, etc.) all still track through `help_agent_*` events + PostHog's own `$ai_generation` view.
- **Env:** new `AI_GATEWAY_API_KEY` required locally (auto-provisioned on Vercel); `ANTHROPIC_API_KEY` no longer read by the chat route — the `@anthropic-ai/sdk` dependency is left installed for now in case other routes need it, but can be removed in a future cleanup.

### Added — PostHog analytics + feature flags

- **Full PostHog integration** for product analytics, session replay, error tracking, and feature flags. No analytics existed before this change.
- **Ingest proxy.** `next.config.mjs` now rewrites `/ingest/static/*`, `/ingest/decide`, and `/ingest/*` to PostHog's US cluster, plus `skipTrailingSlashRedirect: true`. All client traffic goes through this same-origin path so common ad-blockers don't take analytics or feature-flag decisions down with them.
- **Client provider.** `components/providers/PostHogProvider.tsx` boots `posthog-js` once per tab (idempotent via a window flag so Strict-Mode double-mount + HMR don't re-init). `api_host: '/ingest'`, autocapture + heatmaps on, `capture_pageview: false` (manual — see below), `capture_pageleave: true`, persistence `localStorage+cookie`. Session recording is configured with `maskTextSelector: "[data-ph-no-capture]"` so phone inputs and chat textareas are masked without opting every field out. Global props registered once at boot: `theme`, `prefers_reduced_motion`, `device_type` (mobile/tablet/desktop), `viewport_w/h` — every captured event carries them. Also hooks `window.onerror` + `onunhandledrejection` into `posthog.captureException` for PostHog Error Tracking.
- **App-Router pageviews.** `components/PageViewTracker.tsx` (Suspense-wrapped in `app/layout.tsx` because it uses `useSearchParams`) calls `posthog.capture('$pageview')` on every `pathname` + `searchParams` change. Required because PostHog's built-in auto-pageview relies on `popstate` / `pushState` observation that Next's client router short-circuits.
- **Typed analytics layer.** `lib/analytics.ts` exposes a union-typed `AnalyticsEvent` and `track(event, props)` / `identify(distinctId, props)` / `reset()` / `getDistinctId()` — all no-op if PostHog isn't loaded (SSR, ad-blocker, missing key). Also ships `sha256Hex()` + `normalizePhoneE164()` used for privacy-preserving identify (see below). Every component imports from here; nothing imports `posthog-js` directly, so event names stay typed and swapping sinks later is a one-file change.
- **Typed flag layer.** `lib/flags.ts` exports a `FeatureFlag` union (currently `"ai_help_agent"`) + a `useFlag(flag, fallback)` hook that wraps `posthog-js/react`'s `useFeatureFlagEnabled`. Returns `fallback` (default `false`) during the pre-decide window so gated UI never flashes in before the decision lands.
- **Server-side SDK.** `lib/server-analytics.ts` wraps `posthog-node` with a cached singleton (`flushAt: 1, flushInterval: 0` so serverless handlers can flush-and-exit fast). Exports `trackServer(event, distinctId, props)`, `isFlagEnabledServer(flag, distinctId, fallback)`, and `flushAnalytics()` — the last to be called from route handlers' `finally` blocks.
- **Home-page section tracker.** `components/HomeSectionTracker.tsx` watches every element with a `data-section="..."` attribute via a single IntersectionObserver at 35% threshold; emits `section_viewed` once per name per load. Each home-page section root (Hero / FlipStatement / Swiper / HowItWorks / Showcase / Pricing / FAQ / CTA) was tagged with a `data-section` attribute instead of threading refs through every component. Scroll-depth (25/50/75/100) is emitted by the companion `SectionTracker` utility when it's used directly.

### Added — event taxonomy (instrumented across the app)

Every event is snake_case, past-tense, and carries the global props listed above.

- **Waitlist funnel** (`components/WaitlistReceipt.tsx` + `app/api/waitlist/route.ts`):
  - `waitlist_form_viewed` on mount, `waitlist_form_started` on first keystroke (latched), `waitlist_form_field_blurred` per-field with `length` / `digits_len` / `valid`, `waitlist_form_submitted` on submit click with `has_name` + `phone_digits_len`, `waitlist_form_succeeded` / `waitlist_form_failed` with `duration_ms`, `error_type`, `http_status`.
  - Server-authoritative events: `waitlist_server_insert_ok`, `waitlist_server_insert_failed`, `waitlist_server_rejected` (invalid phone). These trust the DB write, not the client.
  - On success we call `identify("ph_" + sha256(e164_phone).slice(0,40), { first_name, phone_digits_len, waitlist_joined_at })`. The raw phone number is **never** used as the distinct id — only a truncated SHA-256. This stitches the anonymous pre-signup session into the identified person profile so funnels work across the conversion boundary.
- **Help agent / AI chat** (`components/HelpAgent.tsx` + `app/api/chat/route.ts`):
  - Client: `help_agent_opened` / `help_agent_closed` (with `msg_count`), `help_agent_suggestion_clicked` (with the suggestion text), `help_agent_message_sent` (with `msg_count` + `user_msg_len`), `help_agent_response_streamed` (with `duration_ms`, `first_token_ms`, `tokens_est`), `help_agent_errored` (with `duration_ms`, `error_type`).
  - Server: `help_agent_server_responded` (with timing + token count + conversation length), `help_agent_server_errored` (with error detail), `help_agent_server_blocked` (emitted when the server-side flag check denies a request).
- **Hero carousel** (`components/sections/Hero.tsx`): `hero_carousel_advanced` from a single choke-point helper with `via ∈ {auto, prev, next, drag, wheel, dot, tap}` + `from_idx` / `to_idx` / `base_to_idx` / `direction`. `hero_carousel_wrapped` fires when the silent-teleport runs (tells us whether users actually circle the loop). `hero_carousel_paused` / `hero_carousel_resumed` on hover enter/leave with `reason`.
- **Nav + theme** (`components/Nav.tsx` + `components/ThemeToggle.tsx`): `nav_logo_clicked`, `nav_link_clicked` (with `section` + `surface ∈ {desktop, mobile}`), `mobile_menu_toggled` (with `is_open`), `theme_toggled` (with `from`, `to`, `via_view_transition`).
- **Pricing** (`components/sections/Pricing.tsx`): `pricing_period_toggled` (with `period`), `pricing_cta_clicked` (with `tier ∈ {free, pro}` + current `period`). Pricing CTAs also emit `cta_join_waitlist_clicked` with `surface ∈ {pricing_free, pricing_pro}` so the main CTA funnel stays unified.
- **FAQ** (`components/sections/FAQ.tsx`): `faq_item_toggled` with `index`, `is_open`, `question_preview` (first 40 chars — enough to group in dashboards, short enough not to leak copy edits into analytics).
- **Waitlist CTA surfaces**: `cta_join_waitlist_clicked` fires from Nav (pill + expanded), Hero, Mobile Menu, and both Pricing cards with a `surface` prop — one event, clean segmentation in PostHog.
- **Sections + scroll**: `section_viewed` once per section per load (`hero`, `flip_statement`, `swiper`, `how_it_works`, `showcase`, `pricing`, `faq`, `cta`). `scroll_depth_reached` at 25/50/75/100 %, latched.

### Added — feature flags

- **`ai_help_agent`** (boolean, default OFF in PostHog until the team flips it).
  - Client gate: `components/HelpAgent.tsx` calls `useFlag('ai_help_agent')` at the top of the component; when false, returns `null` — nothing renders, including the launcher pill.
  - Server gate: `app/api/chat/route.ts` checks `isFlagEnabledServer('ai_help_agent', distinctId)` before doing anything else. On `false`, it emits `help_agent_server_blocked` and returns `403 { ok: false, error: "disabled" }`. Prevents direct-curl bypass.
  - Client sends its PostHog distinct id via `x-posthog-distinct-id` so the server-side flag check uses the same id as the client and stitches the block event into the same person profile.

### Changed — API routes switched to Node runtime

- `app/api/chat/route.ts` and `app/api/waitlist/route.ts` moved from `runtime: "edge"` to `runtime: "nodejs"`. Reason: `posthog-node` is Node-targeted and the edge-compat dance wasn't worth the latency savings on endpoints that already make cross-region calls to Anthropic / Neon. Both routes are also marked `dynamic: "force-dynamic"` so page-data collection doesn't try to prerender them.

### Added — dependencies + env

- Added `posthog-js` + `posthog-node`. Nothing else pulled in.
- **New env vars:** `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST` (optional — defaults to `https://us.posthog.com` for UI links), `POSTHOG_KEY` (server, same value), `POSTHOG_HOST` (optional). If `NEXT_PUBLIC_POSTHOG_KEY` is absent the entire analytics stack no-ops — the site builds and runs without it, which keeps local dev lightweight.

### PII posture

- Phone numbers are **never** sent to PostHog as the distinct id. Identify is on `ph_<sha256(e164)>` truncated to 40 hex chars.
- Phone input (WaitlistReceipt) and chat textarea (HelpAgent) both carry `data-ph-no-capture`, and the PostHog recording config's `maskTextSelector` masks them in session replays.
- Autocapture is on by default, which means clicks / form submits are captured structurally — the element text is allowed through for non-masked elements. Elements displaying PII should receive `data-ph-no-capture` before launch.

### Added — one-shot PostHog setup script

- `scripts/posthog-setup.mjs` provisions the PostHog side of the stack via the REST API so nobody has to click-build dashboards by hand. Run with `npm run posthog:setup` after exporting `POSTHOG_PERSONAL_API_KEY` + `POSTHOG_PROJECT_ID` (and optionally `POSTHOG_HOST`).
- **Idempotent.** Every create step searches PostHog first and only creates what's missing — re-running the script after adding new insights to the file only creates the new ones, and will also best-effort back-link orphan insights to the shared dashboard.
- **What it creates:**
  - Feature flag `ai_help_agent` (0% rollout, active — i.e. live but evaluating false for everyone until the team flips it).
  - Dashboard "Tabby — Product Metrics" (pinned).
  - Insights pinned to the dashboard:
    - Waitlist — conversion funnel (`section_viewed → waitlist_form_viewed → waitlist_form_started → waitlist_form_submitted → waitlist_form_succeeded`, 1-day window).
    - Waitlist — submit vs. success reliability (`waitlist_form_submitted → waitlist_server_insert_ok`).
    - Pricing interest → waitlist (`section_viewed → pricing_period_toggled → pricing_cta_clicked → cta_join_waitlist_clicked → waitlist_form_succeeded`).
    - Hero carousel — advances per user (`hero_carousel_advanced` trend; break down by `via` in the UI).
    - Hero carousel — loop wraps (`hero_carousel_wrapped` trend).
    - Ask Tabby — open → message → response funnel (10-minute window, for post-flag-flip quality-of-experience).
    - Ask Tabby — errors (`help_agent_errored` + `help_agent_server_errored` combined).
    - Theme adoption — light vs. dark (`theme_toggled`, break down by `to`).
    - Scroll depth — 25/50/75/100 (`scroll_depth_reached`, break down by `depth`).
    - FAQ engagement (`faq_item_toggled`, break down by `question_preview`).
    - Primary CTA clicks by surface (`cta_join_waitlist_clicked`, break down by `surface`).
- **`npm run posthog:setup`** added to `package.json`.

### Changed — button revert, stamp selection, legal copy

- **`.btn-primary` reverted** in `app/globals.css` to the exact initial-commit definition — the pulse-glow chain (`btn-glow-pulse` over 2.6s), the `::after` shimmer sweep (3.4s, 1s delay), and the `::before` dark-ink panel that slides up from `translateY(100%)` on hover. Because the token system remaps `rgb(var(--ink))` when `[data-theme="dark"]` is active, the hover fill automatically flips to a light panel in dark mode — contrast holds in both themes. All intermediate iterations removed: stamp offset shadow, yellow live-dot `::before`, coral→deep-coral gradient face, `filter: brightness(1.04)`, `:active` postmarking press, and the explicit reduced-motion override. Design lead picked the original over the iterations.
- **CTA signature stamp locked against selection.** `components/sections/CTA.tsx` — the container wrapping the rotating SVG textPath ("Enjoy the meal · Not the math · …") and the italic "est. 2026" signature now carries `select-none` + inline `userSelect: 'none'` / `WebkitUserSelect: 'none'`. Highlighting either element previously split the textPath glyphs apart and rendered "est. 2026" with a misaligned selection rectangle against its -8° rotation — the seal illusion broke. The container is already `aria-hidden`, so preventing selection is only a visual concern.
- **Legal pages rewritten** with warmer brand voice while preserving every factual/legal commitment:
  - `app/privacy/page.tsx` — opens "Tabby is committed to protecting your privacy." Added "We never sell your information." as a pull-line, reframed "What we collect" around the "collect the minimum we need" philosophy, and expanded the rights section into "Your rights + your control."
  - `app/terms/page.tsx` — friendlier intro ("no small-print tricks, no buried gotchas"). Each numbered clause (waitlist, acceptable use, AI assistant, IP, disclaimers, liability, governing law) gets a plain-English rewrite; the limitation-of-liability clause now explicitly names its $100 cap as "so there are no surprises" instead of burying it.
  - `app/security/page.tsx` — opens "Tabby is built with modern, bank-grade security measures from day one." Pre-launch section adds a continuous-monitoring bullet; launch-commitments section expanded from 4 → 6 bullets to include **principle of least privilege** (role-based, logged, audited production access) and **third-party review** (pen test + code review before GA). Vulnerability-disclosure section explicitly commits to response times and public credit for researchers.

### Changed — hero polish + infinite carousel

- **Hero headline legibility in dark mode.** `components/ClawReveal.tsx` line 1 ("Enjoy the meal,") swapped from `text-ink` (fixed dark) to `text-fg` (theme-adaptive). In light mode still renders the original near-black ink; in dark mode renders warm off-white (`rgb(242, 238, 232)`) against the dark canvas. The italic accent line ("not the math.") was already on `text-accent` and stays coral.
- **Claw scratches are now a permanent design element, sitting behind the text.** The SVG in `ClawReveal` moved from `z-20` → `z-0`; headline copy stays at `z-10`, so the letterforms always punch cleanly through the orange slashes. The GSAP timeline's trailing `opacity → 0` tween was removed so the scratches no longer fade out after ~3s — they stay on the page as intended decoration. Letters fully occlude the stroke intersections, so the text remains readable even on long-form dark-mode viewing.
- **Hero phone carousel is now a seamless infinite loop.** `components/sections/Hero.tsx` was refactored:
  - Track renders `PHONE_VARIANTS` tripled (`3 × 16 = 48` phones). Active index lives in the middle copy.
  - Prev / next / drag / wheel / auto-advance all increment without bounds (no more disabled chevrons at edges).
  - Once `activeIdx` drifts outside the middle-copy range `[n, 2n)`, a timer waits the 720ms transition out and then silently teleports by `±n` — a dedicated `animate` flag flips the CSS `transition` to `none` for one committed frame, shifts the index, and re-enables transition on the second `requestAnimationFrame`. No visible snap.
  - Dot indicators are still 16 (one per *real* variant) and compared against the reduced `baseIdx = ((activeIdx % n) + n) % n`. Clicking a dot jumps to the equivalent index in the middle copy, so direct selection never triggers a teleport.
  - Counter reads `baseIdx + 1 / n`, so it wraps `01/16` → `16/16` → `01/16` instead of stalling.
  - Added `role="tablist"` with `aria-selected` on the dots; inactive rendered phones get `aria-hidden="true"`.
- **Native scrollbars hidden globally.** Added `scrollbar-width: none` + `-ms-overflow-style: none` on `html, body`, plus `::-webkit-scrollbar { display: none; width: 0; height: 0 }`. Lenis drives the smooth scroll anyway; the native gutter added nothing but chrome noise. Wheel / touch / keyboard scrolling unaffected.

### Changed — primary CTA button

- Reworked `.btn-primary` in `app/globals.css`, then — after iteration — landed on a version close to the original:
  - **Stays orange start-to-finish.** No dark-panel roll-up on hover. The button is a flat coral pill (`background: rgb(var(--accent))`).
  - Kept the original pulse glow (`btn-glow-pulse`, 2.6s) and shimmer sweep (`btn-shimmer`, 3.4s).
  - **Hover** lifts the pill `translateY(-3px) scale(1.03)`, pauses the pulse, adds `filter: brightness(1.04)` for a subtle "fresh print" beat, and intensifies the warm glow (`box-shadow: 0 26px 60px -18px rgba(255,124,97,0.8)`). The arrow slides `6px` right. No color inversion.
  - **Active press** `translateY(-1px) scale(0.99)` — keeps the lift but nudges down a hair on click.
  - Added a `@media (prefers-reduced-motion: reduce)` block that disables both the glow and shimmer animations.
  - Iterations in between (offset "ghost-stamp" shadow, coral gradient face, pulsing yellow live-dot, hover fg-panel roll-up, "postmarking" active press) were explored and removed — design lead preferred the simpler always-orange pill.

### Added — dark mode

- **Theme infrastructure.** A `[data-theme="light|dark"]` attribute on `<html>` drives the palette. The attribute is set pre-paint by a synchronous inline script (`components/ThemeInit.tsx`) rendered inside `<head>` in `app/layout.tsx`, so there is no first-paint flash. Priority order: `localStorage["tabby-theme"]` → `prefers-color-scheme` → `"light"`. Any invalid/missing state falls back to `"light"`.
- **Theme toggle.** New `components/ThemeToggle.tsx` (sun/moon glyph, hand-crafted; tilts on hover). Mounted next to the waitlist CTA in `components/Nav.tsx`. Uses the View Transitions API (`document.startViewTransition`) for a cross-fade between themes when the browser supports it and the user isn't on reduced motion; falls back to an instant swap otherwise. Persists the choice to `localStorage`, exposes `aria-pressed` + dynamic `aria-label`.
- **Tri-tier color tokens** in `app/globals.css`:
  - *Brand (fixed):* `--color-accent`, `--color-accent2`.
  - *Primitive (fixed):* `--color-ink`, `--color-cream`, `--color-charcoal`, `--color-muted`. Retained as-is so that intentionally-dark sections (CTA, Showcase, Swiper, Footer, Pro pricing card, mobile menu overlay, help-agent header, user chat bubbles) stay dark in both themes. `[data-theme="dark"] .bg-ink` / `.text-cream` / `.bg-cream\/15` / etc. are explicitly pinned back to their light-mode values so these elements don't invert.
  - *Semantic (adaptive):* `--color-canvas` (page bg), `--color-fg` (primary text), `--color-surface` (section panels), `--color-card` (elevated cards on surface), `--color-line` + `--color-line-strong` (borders). Backed by raw `--canvas/--fg/--surface/--card/--line` variables redeclared under `[data-theme="dark"]`. Utilities like `bg-canvas`, `text-fg`, `bg-surface`, `bg-card`, `border-line` flip automatically.
- **Dark palette values:** `canvas` rgb(11,11,12), `fg` rgb(242,238,232), `surface` rgb(22,21,20), `card` rgb(28,26,24), `line` rgba(fg, 0.12), `line-strong` rgba(fg, 0.22). Color-scheme hint (`color-scheme: dark`) emitted so form controls, scrollbars, and caret track the theme. `--noise-opacity` bumped from 0.05 → 0.08 in dark so the grain overlay stays visible.
- **Section migration to semantic tokens:**
  - `components/sections/Hero.tsx` — `bg-white` → `bg-canvas`; phone carousel chevrons `bg-ink text-white` → `bg-fg text-canvas`; indicator inactive color now `var(--line-strong)` (was hardcoded `rgba(14,14,14,0.2)`); dim text swapped to `text-fg/*`.
  - `components/sections/FAQ.tsx` — `bg-white` → `bg-canvas`; all `text-ink/*` → `text-fg/*`.
  - `components/sections/HowItWorks.tsx` — section `bg-cream` → `bg-surface`; progress track `bg-ink/10` → `bg-line`; mobile card `bg-white border-ink/10` → `bg-card border-line`; step indicators now driven by `var(--line-strong)` (was `rgba(14,14,14,0.15)`); all text tokens migrated.
  - `components/sections/Pricing.tsx` — section `bg-cream` → `bg-surface`; period toggle container `bg-white border-ink/10` → `bg-card border-line`; active toggle `bg-ink text-white` → `bg-fg text-canvas`; Free card `bg-white border-ink/10` → `bg-card border-line`; Free CTA `bg-ink text-white hover:bg-black` → `bg-fg text-canvas hover:bg-accent`; Pro card left as `bg-ink text-cream` (intentional dark).
  - `components/sections/FlipStatement.tsx` — light variant `bg-cream text-ink` → `bg-surface text-fg`; divider rules and inner border swapped to `bg-fg/20` and `border-fg/25`; dark variant left unchanged.
  - `components/LegalPage.tsx` — `bg-white` → `bg-canvas`; body/divider text to `text-fg/*`; footer rule `border-ink/10` → `border-line`.
  - `app/waitlist/page.tsx` — `bg-cream` → `bg-surface`; disclaimer `text-ink/40` → `text-fg/40`.
  - `components/WaitlistForm.tsx` — input + success card `bg-white border-black/10` → `bg-card border-line`; all text swapped to `text-fg/*`; added `role="status" aria-live="polite"` on the success state.
  - `components/HelpAgent.tsx` — panel `bg-cream border-ink/10` → `bg-surface border-line`; input bar `bg-white border-ink/10` → `bg-card border-line`; suggestion chips flipped to `bg-card border-line text-fg`; typing dots + assistant text to `text-fg/*`. Header intentionally kept `bg-ink text-cream`.
  - `components/Nav.tsx` — header backdrop now driven by `rgba(var(--nav-bg), 0.92)` (a new `--nav-bg` RGB tuple that flips with theme) instead of hardcoded `rgba(255,255,255,0.92)`; divider shadow uses `var(--line)`; wordmark/subtitle/nav link text all on `text-fg/*`.
  - `components/WaitlistReceipt.tsx` — deliberately left on cream paper + dark text (`#F3EBDA`/`#2a2a2a`). It is a visual prop meant to read as printed receipt paper; flipping it would defeat the metaphor.
- **Dark-mode-only cursor spotlight.** New `components/CursorSpot.tsx` writes `--mx`/`--my` CSS properties onto `<html>` via rAF-throttled `pointermove`. `.cursor-spot` in `globals.css` is a fixed radial gradient (warm accent tint) that is hidden in light mode, on touch devices (`@media (hover: none)`), and under reduced motion.
- **Smooth theme transition.** `html`, `body`, `section`, `header`, `footer`, `main`, `aside`, `.legal-prose` transition `background-color` / `color` / `border-color` over 0.35s (`cubic-bezier(.22,1,.36,1)`). View-Transitions pseudo-elements get a matching 0.45s cross-fade.

### Added — accessibility

- **Skip-to-content link.** `.skip-link` in `globals.css`, rendered as the first focusable element of `<body>` in `app/layout.tsx` (`href="#main"`). Parked off-screen at `top: -80px`; slides in on `:focus-visible` to `top: 16px`. `<div id="main">` now wraps `{children}` in the layout.
- **Global focus styling.** `:focus-visible` now paints an accent-colored 2px outline with 3px offset. Pill elements (`.btn-primary`, `.btn-ghost`, `.theme-toggle`) get a custom rounded halo (`0 0 0 3px var(--canvas), 0 0 0 5px rgb(var(--accent))`) instead of the rectangular default, so the ring hugs the shape.
- **`.sr-only` utility** added for screen-reader-only text (used on the help-agent textarea label and the Pricing section heading).
- **Keyboard + assistive labeling:**
  - Mobile menu: `role="dialog"` + `aria-modal="true"` + `aria-label="Main navigation"`, `aria-expanded` on the trigger, `aria-controls="mobile-menu"`, and Escape key now closes the menu.
  - Scroll progress bar in the nav carries `role="progressbar"` with live `aria-valuenow`.
  - Primary nav: `<nav aria-label="Primary">`; `header` carries `role="banner"`.
  - Help agent: `role="dialog" aria-label="Ask Tabby"` on the panel; typing indicator gets `aria-label="Tabby is typing"`; textarea has a linked `<label class="sr-only">`.
  - FAQ accordion: each trigger gets `id` + `aria-controls="faq-panel-N"` + `aria-expanded`; each panel gets matching `id` + `role="region"` + `aria-labelledby`; the `+/×` icon is `aria-hidden`.
  - Pricing: `<section aria-labelledby="pricing-heading">` with a visually-hidden `<h2>`; period buttons wrapped in `role="group" aria-label="Billing period"` (already had `aria-pressed`).
  - Waitlist form: phone input gains `aria-required` + `aria-invalid` (driven by validity), Name input gains `autoComplete="name"`.
  - Hero: `aria-label="Hero"`; HowItWorks/FAQ also labelled via `aria-labelledby`.
  - Logo link: `aria-label="Tabby — home"`; decorative logo images switched to empty `alt=""` (the link carries the name).
  - FlipStatement: `aria-label="Public service announcement"`.
- **Reduced-motion audit.** The existing global `prefers-reduced-motion` rule stays; added targeted disables for `.animate-cat-peek`, `.animate-stamp-spin`, and `.cursor-spot`. View Transitions skip entirely under reduced motion.
- **Text entity fixes.** Unescaped apostrophes in FAQ / FlipStatement / WaitlistForm replaced with `&apos;` to keep JSX strict-mode happy.

### Changed — polish

- **Button ghost + primary rework** for theme awareness:
  - `.btn-ghost` now uses `var(--fg)` / `var(--line-strong)` / `var(--canvas)` so it inverts cleanly in dark (was hardcoded rgba against ink).
  - `.btn-primary::before` hover-fill and `:hover color` switched to `var(--fg)` / `var(--canvas)` so the pill keeps contrast on both themes.
- **Accordion rebuild.** `.acc-item` borders now use `var(--line)` (was `rgba(14,14,14,0.12)`). `.acc-icon` and its `::before/::after` use `var(--fg)` / `var(--canvas)` so the +/× stays legible after flip; open-state `::before/::after` forced to `#fff` against the accent pill.
- **Legal prose** palette ported to tokens: headings/body/links use `var(--fg)` + `color-mix(in srgb, var(--fg) 78%, transparent)`. Accent underline on links preserved.
- **Eyebrow / vertical labels / zzz particles** moved from hardcoded rgba to `color-mix(in srgb, var(--fg) X%, transparent)` so they keep the right hierarchy in dark.
- **Nav**: header backdrop animates against `--nav-bg` instead of fixed white; divider shadow uses `var(--line)`. Mobile menu dialog explicitly forced dark in both themes via `[data-theme="dark"] .menu-overlay` so the overlay identity is consistent.
- **Phone hover shadow** (`.phone-card:hover`) gets a deeper dark-mode variant so the lift still reads on the dark canvas.

### Added — new files

- `components/ThemeInit.tsx` — inline head-blocking boot script.
- `components/ThemeToggle.tsx` — nav theme switcher.
- `components/CursorSpot.tsx` — dark-mode pointer spotlight.

### Changed — upgrades (earlier in this cycle)

- Upgraded `next` 14.2.15 → 16.2.4 (Turbopack is now the default bundler).
- Upgraded `react` and `react-dom` 18.3.1 → 19.2.5.
- Upgraded `tailwindcss` 3.4.14 → 4.2.2. Migrated `app/globals.css`, `tailwind.config.ts`, and `postcss.config.js` via the official `@tailwindcss/upgrade` codemod. Added `@tailwindcss/postcss`; removed `autoprefixer` (Tailwind v4 handles vendor prefixing internally).
- Upgraded `framer-motion` 11.x → 12.38.0.
- Upgraded `typescript` 5 → 6.0.3.
- Upgraded `@types/node` 20 → 25, `@types/react` 18 → 19, `@types/react-dom` 18 → 19.
- `components/SplitText.tsx`: `JSX.IntrinsicElements` → `React.JSX.IntrinsicElements` (React 19 moved the global JSX namespace under `React`).
- `lib/db.ts` and `app/api/waitlist/route.ts`: Neon client is now lazy (`getSql()`) instead of initialized at module load. Next 16 evaluates edge route modules more eagerly during page-data collection, so throwing on missing `DATABASE_URL` broke `next build` in environments without the env var. Connection failures now surface only when a query actually runs.

### Known caveats

- The browser-automation sandbox in this session couldn't open the dev server, so the theme work was verified via `next build` (passes) and by curl-ing the compiled CSS/HTML (confirms the boot script, `[data-theme="dark"]` rules, and new `bg-canvas`/`text-fg`/`bg-surface`/`bg-card`/`border-line` utilities are present). Visual QA pass in both themes + across breakpoints is still open.
- `bg-white` / `text-white` are *not* globally flipped in dark mode — they remain Tailwind's built-in whites. This is intentional: the Footer logo chip and a handful of other spots depend on a literal white background. Adaptive surfaces were migrated to `bg-canvas` / `bg-card` explicitly. If a future section needs to flip, use the semantic tokens rather than relying on `bg-white`.
- `WaitlistReceipt` stays on its cream-paper palette in both themes by design (it's styled as physical receipt paper).
