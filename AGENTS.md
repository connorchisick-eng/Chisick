## Learned User Preferences

- Prefers updating existing files over creating new ones unless explicitly asked for a new file.
- Wants large/disruptive changes (e.g., framework upgrades) done on a separate branch rather than the current working branch.
- Maintains a per-session changelog at `sam-changelog.markdown`; update it as part of substantive work.
- Wants the marketing site to feel hand-crafted and distinctive (bold typography, asymmetry, scroll/micro-interactions); avoid generic AI-template aesthetics.
- Communicates terse, action-oriented requests; proceed with sensible defaults instead of asking many clarifying questions.

## Learned Workspace Facts

- Project is the Tabby marketing site; Tabby is a bill-splitting iOS/Android app (scan receipt, claim items, escrow payments, virtual card tap-to-pay).
- Tabby is pre-launch: expected Q4 2026 launch on iOS + Android simultaneously, US-only at launch; closed beta with public waitlist on the site.
- Tabby (this project) is NOT affiliated with the Middle East BNPL company of the same name — the help agent must clarify if asked.
- Stack: Next.js 16 (App Router), React 19, Tailwind 4, framer-motion v12 using the `motion` import; package manager is pnpm (`pnpm-lock.yaml`).
- Root GitHub repo is `https://github.com/Chisick-Enterprises/tabby-landing`.
- Active feature branch is `refresh-sam`; prepare changes to merge into the repo's primary branch unless told otherwise.
- Help-agent chatbot lives in `components/HelpAgent.tsx`; chat API in `app/api/chat/route.ts`; system prompt in `lib/agent-prompt.ts`.
- Chat backend uses the Vercel AI Gateway with model `openai/gpt-oss-120b` (via the `ai` SDK), not direct Anthropic.
- AI Gateway API key is stored in a local `.env*` file (gitignored); never commit the key.
- Help agent is scope-locked to Tabby topics — it must decline off-topic, abusive, or non-Tabby questions while still handling greetings and unclear inputs gracefully.
- Legal pages (`app/privacy`, `app/terms`, `app/security`, `components/LegalPage.tsx`) are intentionally out of scope unless the user explicitly asks.
