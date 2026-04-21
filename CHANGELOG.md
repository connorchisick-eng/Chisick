# Changelog

A plain-English log of what's changed on the site. Dates are roughly when each batch shipped.

---

## April 2026 — Ask Tabby is live + behind-the-scenes upgrades

### The chat agent ("Ask Tabby")

- **It's on for everyone now.** The little chat bubble in the corner — users can ask it questions about Tabby and it answers. No more feature-flag switch; it just runs.
- **Swapped the model provider.** Moved the brain behind the chat from Anthropic (Claude) directly to Vercel's AI Gateway, which is a central hub that routes to different models. Currently pointed at an open-source model (`gpt-oss-20b`). Easier to swap providers later — it's a one-line change.
- **Billing runs through Vercel now.** No separate Anthropic bill. One vendor, one invoice.
- **We can see every chat in analytics.** Every conversation sends cost, tokens, response time, and the actual prompt/answer to PostHog so we can tell how people use it and catch problems early.

### Analytics + tracking (new this cycle)

- **PostHog is fully wired up.** It's the tool we use to see how people use the site: clicks, scrolls, pageviews, session replays (short videos of user sessions), error reports, and funnels.
- **Waitlist funnel tracked end-to-end.** We can see exactly where people drop off: landing → scrolled → clicked sign up → started typing → submitted → success.
- **Every button knows where it lives.** Clicking "Join the waitlist" from the nav, hero, pricing card, or mobile menu all get tracked with which "surface" they came from, so we know which part of the site actually drives signups.
- **Section views + scroll depth.** We know how far down people scroll (25 / 50 / 75 / 100%) and which sections they actually see.
- **Hero carousel tracked.** We know when people swipe the phone carousel, whether by clicking arrows, dragging, scrolling, or letting it auto-advance. We can also see if they circle all the way around the loop.
- **PII stays private.** We never use a phone number as the user's ID in analytics. We hash it first, so we get the funnel math without PostHog ever seeing raw numbers. Phone inputs and the chat textbox are also masked in session recordings.
- **Feature-flag system.** We can turn features on/off for specific users without redeploying the site — useful if we want to A/B test something or soft-launch a feature to a percentage of users.
- **Setup script.** Running `npm run posthog:setup` once provisions all our dashboards and insights in PostHog automatically, so we don't have to click-build them.

---

## March 2026 — Design polish + dark mode

### Dark mode

- **The site now has a dark theme.** There's a sun/moon toggle in the nav. Your choice is saved, and the site remembers it next time. First load respects your system's dark-mode preference if you haven't set it manually.
- **Smooth cross-fade between themes.** No harsh flip — colors transition over a third of a second.
- **Dark-mode-only cursor spotlight.** In dark mode, a subtle warm glow follows your cursor. Just a small detail that makes it feel alive.

### Hero section

- **The phone carousel is now an infinite loop.** Before, it stopped at the last phone; now it wraps around forever in both directions. The arrows never gray out, and swiping past the end rolls silently to the start.
- **The "claw mark" scratches stay permanent.** They used to fade out after a few seconds; now they're a permanent design element sitting behind the headline.
- **Headline readable in both themes.** First line used to be fixed black — now it flips to cream on dark mode.

### The primary button

- **Restored the original "glowing orange pill" design.** We tried a few variations (dark roll-up on hover, offset shadow stamps, gradient face, yellow live-dot) and landed back close to the original. Keeps the pulse glow and the subtle shimmer sweep. The pill lifts on hover, the arrow slides right.

### Legal pages

- **Privacy, Terms, and Security pages all rewritten in warmer language.** Same commitments, friendlier voice. Privacy now opens with "we never sell your information." Terms calls out the $100 cap up front instead of burying it. Security spells out the pre-launch + launch commitments clearly.

### Accessibility

- **Skip-to-content link.** Keyboard users can tab past the nav on the first press.
- **Focus outlines everywhere.** Clear coral ring on focused elements; pill-shaped buttons get a rounded halo.
- **Screen-reader labels.** Mobile menu, FAQ, chat, pricing toggles — everything interactive now has proper roles and labels.
- **Reduced-motion respected.** If your system says "less motion," the animations dial way down.

### Other polish

- **Scrollbars hidden.** Native scrollbars felt clunky; now the page just scrolls smoothly with Lenis handling it.
- **All colors moved to "tokens"** so dark mode flips everything at once instead of hunting down hardcoded hex values everywhere.

---

## February 2026 — Framework upgrades

- Bumped Next.js from 14 → 16 (the framework the site runs on).
- React 18 → 19.
- Tailwind 3 → 4 (our CSS toolkit).
- TypeScript 5 → 6.

All the usual migration grunt work — code changes behind the scenes, no visible difference to users. Everything still builds clean.

---

## Initial launch — Tabby marketing site

The base site: hero, scroll-pinned sections (flip statement, horizontal swiper, how-it-works, showcase, pricing, FAQ, CTA), waitlist form, legal pages, and the chat agent scaffolding.
