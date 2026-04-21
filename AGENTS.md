## Learned User Preferences

- Prefer editing existing files over creating new ones; do not scaffold extra files unless explicitly asked.
- Favor clean, subtle, minimal design — typography-only callouts with small uppercase eyebrows, hairline dividers, and muted accent dots instead of bordered cards, pulsing tags, filled buttons, or heavy gradients.
- Use the orange accent sparingly (thin hairlines, dots, small tags, subtle top-edge gradients); never as a full card background or loud wash.
- Copy should be direct and conversational, leading with the value; avoid marketing words like "revolutionizing", "seamlessly", "empowering", "cutting-edge", and prefer short punchy framings (e.g. "Test early. Get Pro free.").
- Follow a plan-mode workflow for multi-step changes: write a plan with todos, then implement and mark todos in-progress/complete as work proceeds.
- Run `npm run build` after substantive Next.js changes to confirm the build still passes.
- Keep PostHog-flagged features (e.g. `ai_help_agent`) consistent site-wide — update related UI copy to stay flag-dependent so messaging doesn't point users to features that are currently off.
- Keep the closed-beta framing consistent across Pricing, FAQ, CTA, and the help agent prompt: closed beta = Pro free as thanks for testing; open beta = paid.
- Waitlist signup: email is required (TestFlight invites by email), phone is optional; mark email and phone inputs with `data-ph-no-capture` to exclude them from PostHog session recordings.
- Avoid code comments that merely narrate what the code does; only add comments for non-obvious intent or constraints.
- For any library/framework/API question, consult current docs (e.g. Context7) rather than rely on training knowledge.
- Every section of the marketing site should feel distinct and hand-crafted — no template/cookie-cutter patterns, use unexpected layouts, asymmetry, scroll-triggered animations, and micro-interactions.

## Learned Workspace Facts

- This repo is the marketing site for **Tabby**, a group bill-splitting mobile app (scan receipt → claim items → escrow pay → one-tap virtual card at terminal); targeting Q4 2026 iOS + Android launch.
- Team: Connor (business/strategy), Sam (technical), Jamie (oversight); company is based in Los Angeles.
- Stack: Next.js (App Router) + TypeScript + Tailwind CSS 4; GSAP + ScrollTrigger for scroll reveals; framer-motion for micro-interactions; deployed on Vercel.
- Data layer: Neon serverless Postgres accessed via `lib/db.ts`; `waitlist` table has `email` (required, `UNIQUE INDEX (lower(email))`), `phone` (optional), `name`, `user_agent`, `referer`; inserts use `ON CONFLICT ... DO NOTHING` for idempotent re-submits.
- Analytics: PostHog client via `lib/analytics.ts` (`track`, `identify`, `sha256Hex`) and server-side via `lib/server-analytics.ts` (`trackServer`, `flushAnalytics`); `identify()` distinct id is `ph_` + sha256 of lowercased email.
- AI help agent: `app/api/chat/route.ts` streams from Vercel AI Gateway (model slug in `MODEL_ID`, currently `openai/gpt-oss-20b`); system prompt lives in `lib/agent-prompt.ts` as `AGENT_SYSTEM_PROMPT`; route gated by PostHog flag `ai_help_agent` (default off); AI Gateway requires a Vercel billing card.
- Design tokens in Tailwind: `bg-canvas` / `bg-surface` / `bg-card` / `bg-ink` / `bg-fg`, `text-fg` / `text-ink`, `border-line` / `border-line-strong`, `text-accent` (~`rgb(255,124,97)`), cream `#F8F4F0`; custom display class `font-grotesk`.
- Global utility classes defined in `app/globals.css`: `eyebrow`, `text-section`, `.no-scrollbar`, `.btn-primary`.
- Marketing sections live in `components/sections/{Hero,Showcase,HowItWorks,Pricing,FAQ,CTA,FlipStatement,Swiper}.tsx`; chat launcher is `components/HelpAgent.tsx`; waitlist uses `components/WaitlistReceipt.tsx` mounted at `/waitlist` (legacy `WaitlistForm.tsx` was deleted as dead code).
- Pricing model: Free (5 receipt scans/month) and Pro ($1.99/month or $18.99/year — annual saves 20%); closed-beta testers get Pro free; SmartReceipts (AI spending insights) is Pro-only.
- SVG icons in `public/icons/*.svg` use `fill="currentColor"` and must be rendered via CSS `mask-image` (not `<img>`) so color follows theme tokens — see `MaskIcon` helper in `Showcase.tsx`.
- Repo root contains `roadmap.md` (phased waitlist-page polish ideas), `CHANGELOG.md` (site changes), and `app/opengraph-image.tsx` (dynamic 1200×630 OG card via `next/og`); `app/icon.tsx` must pass numeric `width`/`height` to `ImageResponse` (Satori rejects string numbers).
