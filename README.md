# Tabby — Landing

> Enjoy the meal, not the math.

Marketing site and waitlist for **Tabby** — scan the receipt, claim your items, settle up before you leave the table. Launching Q4 2026.

Live: [tabby.app](https://tabby.app)

---

## Stack

| Layer           | Choice |
| --------------- | --- |
| Framework       | [Next.js 16](https://nextjs.org) (App Router, React 19, TypeScript 6) |
| Styling         | [Tailwind CSS v4](https://tailwindcss.com) via `@tailwindcss/postcss`, class-based dark variant keyed off `[data-theme="dark"]` |
| Motion          | [GSAP](https://gsap.com) + ScrollTrigger for scroll-pinned sections, [Framer Motion](https://www.framer.com/motion/) for UI micro-interactions, [Lenis](https://lenis.darkroom.engineering) for smooth scroll |
| Waitlist DB     | [Neon](https://neon.tech) serverless Postgres (`@neondatabase/serverless`) |
| Analytics       | [PostHog](https://posthog.com) — client events, server events, feature flags |
| AI help agent   | [Vercel AI SDK](https://sdk.vercel.ai) + [AI Gateway](https://vercel.com/docs/ai-gateway) routed to Anthropic |
| Deploy          | [Vercel](https://vercel.com) |

---

## Quick start

```bash
# 1. Install (bun is the dev default — npm/pnpm work too)
bun install

# 2. Copy env template and fill it in
cp .env.example .env.local

# 3. Dev
bun dev
# → http://localhost:3000
```

Required for dev: `DATABASE_URL`. Everything else degrades gracefully (PostHog events silently no-op, the help agent route returns an error, etc.) so you can run the site without a full env set.

---

## Environment variables

Runtime (set in Vercel + `.env.local`):

| Key | Purpose | Required |
| --- | --- | --- |
| `DATABASE_URL` | Neon Postgres connection string. Also accepts `POSTGRES_URL`, `POSTGRES_PRISMA_URL`, `POSTGRES_URL_NON_POOLING` as fallbacks. | Yes (waitlist API) |
| `NEXT_PUBLIC_POSTHOG_KEY` | PostHog project API key for browser analytics. | Recommended |
| `NEXT_PUBLIC_POSTHOG_HOST` | PostHog ingest host. Defaults to `https://us.i.posthog.com`. | No |
| `POSTHOG_KEY` | Server-side PostHog key. Falls back to `NEXT_PUBLIC_POSTHOG_KEY`. | No |
| `POSTHOG_HOST` | Server-side PostHog host. Defaults to `https://us.i.posthog.com`. | No |
| `AI_GATEWAY_API_KEY` | Vercel AI Gateway key. Powers the "Ask Tabby" help agent. | Optional (agent disabled without it) |

Tooling-only (not needed at runtime):

| Key | Purpose |
| --- | --- |
| `POSTHOG_PERSONAL_API_KEY` | Used by `bun run posthog:setup` to provision events/dashboards. |
| `POSTHOG_PROJECT_ID` | Target project for the setup script. |
| `FIGMA_TOKEN` | Used by `scripts/export-figma-screens.mjs` to re-pull phone mockups. |

---

## Scripts

```bash
bun dev                # Next dev server (turbopack)
bun run build          # Production build
bun start              # Serve the built output
bun run lint           # next lint
bun run posthog:setup  # One-shot: create canonical PostHog events/insights
```

---

## Project structure

```
app/
  api/
    chat/route.ts          Streaming AI help agent (Vercel AI SDK + Anthropic)
    waitlist/route.ts      Signup endpoint → Neon
  opengraph-image.tsx      Dynamic 1200x630 OG card for link previews
  icon.tsx                 Dynamic favicon
  layout.tsx               Root layout, Nav/Footer/Providers
  page.tsx                 Landing page — stitches the section components below
  privacy/ security/ terms/   Legal pages
  waitlist/page.tsx        Waitlist form flow

components/
  sections/
    Hero.tsx               Headline + infinite phone carousel
    FlipStatement.tsx      Word-flipping PSA block
    Swiper.tsx             Pinned horizontal scroll (Scan / Claim / Settle)
    HowItWorks.tsx         Pinned 3-step animated walkthrough
    Showcase.tsx           Payment methods, "No one fronts the bill", friend invite
    Pricing.tsx            Free vs Pro, monthly/annual toggle
    FAQ.tsx                Accordion FAQ with GSAP height animation
    CTA.tsx                Giant "tabby." wordmark + stamp + waitlist CTA
  HelpAgent.tsx            Floating "Ask Tabby" chat (feature-flagged)
  WaitlistReceipt.tsx      Receipt-styled signup form
  Phone.tsx / Screen.tsx   SVG phone frame + pixel-perfect screen recreations
  ClawReveal.tsx           Hero headline claw-reveal effect
  providers/PostHogProvider.tsx   Boots client analytics + pageviews

lib/
  db.ts                    Neon client singleton
  agent-prompt.ts          System prompt for the help agent
  analytics.ts             Client event helpers (`track(...)`)
  server-analytics.ts      Server-side PostHog wrapper
  flags.ts                 Typed PostHog feature-flag hook
  images.ts                Phone variant constants

public/
  icons/                   Payment-method SVGs (currentColor, rendered via CSS mask)
  screens/                 Phone mockup PNGs (exported from Figma)

scripts/
  posthog-setup.mjs        Provision PostHog events/insights
  export-figma-screens.mjs Re-pull phone screens from Figma
```

---

## Theming

Light is the default. Dark mode is opt-in via `[data-theme="dark"]` on `<html>`, set synchronously by a boot script in `app/layout.tsx` so there's no FOUC.

Tokens live in `app/globals.css`:

- **Semantic (theme-adaptive):** `canvas`, `fg`, `surface`, `card`, `line`, `line-strong`. Use these on anything that should track the theme.
- **Primitive (fixed):** `ink`, `cream`, `charcoal`, `accent`. Use these when a surface is *intentionally* dark-or-light regardless of theme (CTA section, the "No one fronts the bill" block, etc.).

Accessible as Tailwind utilities: `bg-canvas`, `text-fg`, `border-line`, `bg-accent`, etc.

---

## Analytics conventions

Client events are tracked via `track(eventName, properties)` from `lib/analytics.ts`. The convention:

- Section scrolls → `section_viewed { section }`
- Nav / CTA clicks → `cta_join_waitlist_clicked { surface }`, `nav_link_clicked { section, surface }`
- Interactive components → `hero_carousel_advanced`, `faq_item_toggled`, `pricing_period_toggled`, etc.

Every surface that can drive a waitlist signup passes a distinct `surface` prop so PostHog can attribute conversions by placement.

---

## Deploy

Vercel, with this repo connected as the Git source.

Production is `main`. Preview deploys fire on every push / PR. Remember to set all env vars in the Vercel dashboard (Settings → Environment Variables) for Production, Preview, *and* Development if you use `vercel env pull`.

---

## License

Proprietary. All rights reserved — Tabby / Chisick Enterprises.
