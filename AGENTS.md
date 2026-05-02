## Learned User Preferences

- Prefers updating existing files over creating new ones unless explicitly asked for a new file.
- Wants large/disruptive changes (e.g., framework upgrades) done on a separate branch rather than the current working branch.
- Maintains a per-session changelog at `sam-changelog.markdown`; update it as part of substantive work.
- Wants the marketing site to feel hand-crafted and distinctive (bold typography, asymmetry, scroll/micro-interactions); avoid generic AI-template aesthetics.
- Communicates terse, action-oriented requests; proceed with sensible defaults instead of asking many clarifying questions.
- Frequently invokes `/frontend-design` and `/ui-ux-pro-max` skills for visual/UX work — read and follow them when triggered.
- Gate experimental/alternative UX behind a `DEV_MODE`-style env flag so it never ships to production by default.

## Learned Workspace Facts

- Project is the Tabby marketing site; Tabby is a bill-splitting iOS/Android app (scan receipt, claim items, escrow payments, virtual card tap-to-pay).
- Tabby is pre-launch: expected Q4 2026 launch on iOS + Android simultaneously, US-only at launch; closed beta with public waitlist on the site.
- Tabby (this project) is NOT affiliated with the Middle East BNPL company of the same name — the help agent must clarify if asked.
- Stack: Next.js 16 (App Router), React 19, Tailwind 4, framer-motion v12 using the `motion` import; package manager is pnpm (`pnpm-lock.yaml`).
- Root GitHub repo is `https://github.com/Chisick-Enterprises/tabby-landing`.
- Production domain is `splittabby.com` (NOT `gettabby.app` — that's an old/parallel domain; canonical prod is splittabby.com).
- Vercel project serving production is `tabby-site` under team `tabby-app` (project id `prj_EgDt8usZZeV5VpfKzMmgqv2bWTVT`). Always confirm `.vercel/project.json` points here before running `vercel env`/`vercel --prod`.
- PostHog proxy: client init lives in `components/PostHogProvider.tsx`; events are routed through same-origin `/ingest/*` rewrites in `next.config.mjs` to `us.i.posthog.com` (ad-blocker-proof). Do NOT set `NEXT_PUBLIC_POSTHOG_HOST` in prod — the code's `/ingest` fallback is the correct value; setting the var bypasses the proxy and (if pointed at `us.posthog.com`) breaks ingestion entirely.
- Active feature branch is `refresh-sam`; prepare changes to merge into the repo's primary branch unless told otherwise.
- Help-agent chatbot lives in `components/HelpAgent.tsx`; chat API in `app/api/chat/route.ts`; system prompt in `lib/agent-prompt.ts`.
- Chat backend uses the Vercel AI Gateway with model `openai/gpt-oss-120b` (via the `ai` SDK), not direct Anthropic.
- AI Gateway API key is stored in a local `.env*` file (gitignored); never commit the key. Production AI Gateway env vars are managed via the Vercel project / `vercel env` CLI, not via the repo.
- Scroll-driven hero sections live in `components/sections/StickyStack.tsx` and `components/sections/FlipStatement.tsx`; the site header must not overlap these on laptop viewports (recurring bug area).
- Floating help-agent launcher uses the Tabby mascot as its icon — not a generic `?`, sparkle, or chat glyph.
- Help agent is scope-locked to Tabby topics — it must decline off-topic, abusive, or non-Tabby questions while still handling greetings and unclear inputs gracefully.
- Legal pages (`app/privacy`, `app/terms`, `app/security`, `components/LegalPage.tsx`) are intentionally out of scope unless the user explicitly asks.
