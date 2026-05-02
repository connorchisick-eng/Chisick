# Sam's Changelog — for Connor

Hey. Quick rundown of what I changed today, in plain English. No tech jargon.

---

## Speed score — fixed the big "layout jumping" issue

Vercel's Speed Insights dashboard was flagging us with a **0.28 CLS score** (CLS = "how much the page jumps around as it loads"). Anything over 0.25 is "poor" — and ours was sitting right there. The other metrics (load time, time-to-interactive, server response) were all green. Just this one was bleeding red.

Cause: our display font (Cabinet Grotesk — the bold italic one in the headlines) was being pulled in via a **slow CSS import from a third-party CDN**. While the page waited for it, every big headline was rendered with the laptop's default system font. Then the moment the real font finally arrived, every headline reflowed to a different width — and the whole page jumped.

Fix:

- **Stopped blocking the page on the font fetch.** It now downloads in parallel with the CSS instead of holding up the render.
- **Added a "stunt double" font.** Defined a backup font that uses the user's local Arial but with the *exact* metrics of Cabinet Grotesk (height of letters, line spacing, etc.) baked in. So when the page renders before the real font has arrived, headlines are already at the correct dimensions. When the real font swaps in, nothing moves.

Net effect: CLS should drop from 0.28 → under 0.1 (which is "good"), and the overall Speed Insights score should jump from 85 to 90+. Real-user data takes ~24 hours to repopulate.

---

## Help-agent chat — full visual redesign

The "Ask Tabby" floating helper got a polish pass. Three changes:

- **The button now uses the Tabby mascot** instead of the generic question-mark icon. The little green "live" dot still sits on the corner.
- **The mascot is also baked into every assistant response** as a small avatar — so when Tabby replies, you see the mascot next to the message instead of just floating text.
- **The chat panel itself was redesigned** to match the editorial feel of the rest of the site: ledger-paper hairlines in the background, a soft accent glow at the bottom, an oversized italic welcome headline, and the suggestion buttons are now numbered cards (01, 02, 03, 04) with a hairline that grows on hover. The composer (input box) has a pill-shaped design that lights up with an accent border when you start typing, and there's a real keyboard-style `↵` chip in the helper text below.
- The "thinking" indicator is now three bouncing dots instead of one pulsing one — feels more characterful.

Net effect: the chat reads like part of the site instead of a generic SaaS chat widget bolted on.

---

## "Don't pay for their caviar..." section — simplified

Tightened the editorial pull-quote section that sits between the hero and "How it works":

- Removed the "§ — The Principle" eyebrow label.
- Removed the giant ghost quote mark behind the headline.
- Removed the "02 / 06" pair counter and the "— the Tabby principle" signature underneath.
- Removed the strikethrough animation that drew across "caviar" — the user felt it was distracting.
- The flip animation between words ("caviar" → "truffle" → "lobster"...) is now a **typewriter effect**: backspaces the current word letter-by-letter, then types the next one in. Includes a blinking caret.

Net effect: the section is now just the headline. Much cleaner. The word swap reads like Tabby is correcting itself in real time.

---

## Footer — pared down

The footer was doing five jobs at once: a duplicate CTA, three nav columns, a giant wordmark, a scrolling marquee tagline, and copyright. The CTA already lives in its own dedicated section right above the footer — the duplicate was redundant.

Now the footer is just three rows:

1. Brand mark + tagline on the left, a single inline row of essential links on the right (Waitlist, How it works, FAQ, Privacy, Terms, Security).
2. The big edge-bleeding `tabby.` wordmark — the only flourish kept, because it's the page's signature.
3. Copyright line.

Net effect: half the footer code, none of the noise, much faster to scan.

---

## "How it works" phone — fixed top getting clipped on laptops

On laptops with shorter screens (~13" MacBooks), the top of the phone in the "How it works" sticky section was getting **partially hidden behind the navbar**. The cause was simple: the navbar is 104px tall but the section was only reserving 96px of clearance — so the phone's crown sat 8px behind the nav, and the nav's drop shadow visually clipped more.

Fix: bumped the top padding of the sticky section to clear the navbar with comfortable breathing room (32px gap on laptops). Phone scales naturally to fit whatever space is left, so no awkward layout fights.

---

## BotID — bot protection on chat + waitlist

Added Vercel BotID to the two endpoints that take real input: the help-agent chat (`/api/chat`) and the waitlist signup (`/api/waitlist`). Real visitors pass through invisibly; automated scripts and scrapers get a 403.

What this changes for users: nothing visible. What it stops: bots burning AI Gateway tokens by spamming the chatbot, and junk emails getting blasted into the waitlist table.

Heads-up — for full strength ("Deep Analysis"), flip on **Vercel BotID Deep Analysis** in the Vercel dashboard → Project → Firewall → Rules. It's a Pro/Enterprise feature and free until then runs in basic mode.

---

## PostHog analytics — fixed in production

PostHog wasn't actually collecting data on splittabby.com. The issue was a misconfigured setting on Vercel that was sending events to the wrong address (the PostHog *dashboard* instead of the *ingestion* endpoint) and also bypassing our ad-blocker-proof proxy.

Fix: removed the bad setting, redeployed. Analytics now flow through our own domain (`splittabby.com/ingest/*`), which means uBlock, Brave Shields, and similar ad-blockers can't strip events. Verified end-to-end by firing a test event from the command line and getting a `200 OK` from PostHog.

You should start seeing pageviews, the waitlist signup funnel, and help-agent chat events populate in PostHog immediately.

---

## Demo page — phone locked in place, text transitions smoothed

On the interactive demo (the live phone walkthrough), flipping between scenes felt twitchy. The phone would **slide up and down a little** each time the copy on the left changed length, and the text swap felt like it **disappeared too fast** before the new copy came in. The floating "Skip to recap" / "Join the waitlist" buttons in the bottom-right also floated around on shorter laptop screens.

Fixes:

- **Phone is now anchored in place.** The two columns are pinned to the top of the row, and the text column reserves a fixed vertical slot so the phone can't get nudged down when a scene's description is longer than another's.
- **Text crossfade is gentler.** Outgoing copy now takes a touch longer to leave and has less blur, so it overlaps the incoming copy cleanly instead of popping out.
- **Floating CTAs stay put.** They're pinned to the bottom-right of the viewport with safe-area padding, no overlap with the mobile bottom bar (which only shows on phones anyway).

Net effect: the whole scene-change feels like one smooth cross-dissolve instead of a small layout jolt.

---

## Mobile menu close control

On phones, opening the menu (the burger icon in the top-right) used to slide a full-screen panel over everything — but there was **no visible way to close it**. The little "X" button was hiding behind the panel, so tapping it did nothing. Felt broken.

Now:

- The top header **fades away** when the mobile menu opens, so it doesn't fight with the menu.
- A clean **round "X" button** sits in the top-right corner of the menu itself. Tap it to close.
- Hitting the **Escape** key on a keyboard also closes it.

Desktop is untouched — the menu only ever appears on mobile.

---

## Vercel Analytics & Speed Insights

Added `@vercel/analytics` and `@vercel/speed-insights` and wired `<Analytics />` and `<SpeedInsights />` in `app/layout.tsx`. After deploy, page views and Web Vitals-style performance show in the Vercel dashboard (give it ~30s; ad blockers can hide the beacons).

---

## 1. Made a new working copy of the site

I made a new branch called **refresh-sam**. Think of a branch like a sandbox — it's a fresh copy of the website where I can mess with stuff without breaking what's live. Once we're happy with the changes here, we merge them into the real site.

So if you hear me say "I'm working on refresh-sam," that's where everything below is happening. Live site is untouched.

---

## 2. Updated all the building blocks

Every website is built on top of a bunch of free tools made by other people. Over time those tools come out with new versions that fix bugs and run faster.

I bumped all of ours to the newest versions:

- **Next.js** (the main website framework) — went from version 14 to version 16
- **React** (the thing that draws the page) — version 18 to version 19
- **Tailwind** (how I style colors and spacing) — version 3 to version 4
- A bunch of smaller helpers got upgraded too

What this means for us: faster page loads, fewer bugs, and we stay current so future updates aren't a nightmare.

The site still looks and works exactly the same. I checked.

---

## 3. Fixed the "Don't pay for their caviar / when you had salad" animation

You know that big headline that flips between words like *caviar / wagyu / truffle* and *salad / water / fries*?

**Two problems before:**
- The animation was a little stiff. The words just kind of swapped.
- Sometimes a long word like "dry-aged" or "tap water" would break the headline into THREE rows instead of staying on two. Looked sloppy.

**What I did:**
- New animation. Words now slide up and fade with a tiny blur as they swap. Smooth. Feels more polished, kind of like an Apple keynote.
- The width of the slot now smoothly stretches to match each word, so the layout never jumps around.
- Locked the headline to always stay on two rows on desktop, no matter which word is showing.

Go look at it on the homepage. Way nicer.

---

## 4. Updated the AI chatbot's instructions

You sent me the new system prompt — the document that tells the AI how to talk, what to say, what NOT to say. I dropped it in. The chatbot now:

- Knows to mention BOTH the Free and Pro plan whenever someone asks about price
- Sounds like a knowledgeable friend, not a salesperson
- Has a banned word list (no more "revolutionizing," "seamlessly," etc.)
- Knows the team is you, me, and Dad
- Refuses to talk about investors, vendors, fee percentages, etc.
- Has a bunch of example conversations baked in so it copies the right tone

---

## 5. Switched the AI chatbot to a new brain

Before: the chatbot was using **Claude** (from Anthropic) directly.

Now: it's using **GPT-OSS 120B** (an open-source model from OpenAI) routed through Vercel's "AI Gateway."

**Why this is better:**
- One bill instead of separate bills with each AI company
- Easy to swap to a different model later without rewriting code
- Vercel handles all the rate limiting and retries for us

I added the new API key to the project so it works.

You don't need to do anything. Same chatbot, same UI, just a smarter cheaper engine.

**How much cheaper, in actual dollars:**

Per million tokens (the unit AI companies bill in):

| Model | Input | Output |
|---|---|---|
| **GPT-OSS 120B** (what we use now, mid-tier provider) | $0.15 | $0.60 |
| Claude Haiku 4.5 | $1.00 | $5.00 |
| Claude Sonnet 4.6 | $3.00 | $15.00 |
| Claude Opus 4.6 | $5.00 | $25.00 |

At our typical chatbot mix (~80% input / 20% output), that's roughly:
- **~87% cheaper** than Claude Haiku
- **~95% cheaper** than Claude Sonnet
- **~97% cheaper** than Claude Opus

A real example — **10,000 chats/month**, ~800 in + 200 out tokens each:

| Engine | Monthly cost |
|---|---|
| GPT-OSS 120B (now) | **~$2.40** |
| Claude Haiku 4.5 | ~$18 |
| Claude Sonnet 4.6 | ~$54 |
| Claude Opus 4.6 | ~$90 |

So if we'd been on Sonnet, we just went from **~$54/mo → ~$2.40/mo**. At 100k chats/month it's **$540 → $24**. Scales linearly from there.

Pricing references: [Vercel AI Gateway — gpt-oss-120b](https://vercel.com/ai-gateway/models/gpt-oss-120b), [Anthropic API pricing](https://platform.claude.com/docs/en/about-claude/pricing).

---

## 6. Fixed the chatbot being weirdly cold

You showed me this:

> User: hello
> Bot: I only answer questions about Tabby — happy to help with anything about the app.

Yeah that was bad. The chatbot was treating "hello," "?", "what," and even "????" as off-topic and spitting the same canned redirect.

**Fixed:** Now the bot can tell the difference between:

- A **greeting** ("hi," "hello," "yo") → friendly opener inviting a question
- A **confused message** ("?", "what," "huh") → gentle "what would you like to know?"
- **Random nonsense or profanity** ("p[enis?", "fuck") → polite neutral redirect, no lecture
- A **real off-topic request** ("write me a poem") → keeps the original redirect
- A **real Tabby question** → answers it

I also added a bunch of example exchanges so the AI has clear patterns to copy. Should feel way more human now.

---

## 7. Made the AI chat button actually look like an AI chat button

Before: there was a tiny black circle in the bottom-right with a forgettable icon. Hard to notice. Easy to mistake for a "back to top" button.

**What I did to the button:**

- Turned it into a labeled pill that says "**Ask Tabby**" so people instantly know what it is.
- Added a **question mark** icon in an orange circle next to the text so it's obvious it's "ask something," not a sparkle gimmick.
- Added a tiny green pulsing dot like Slack/Intercom use to show "live, ready to chat."
- A soft peach glow breathes around the whole button (3-second cycle) so it catches the eye without being obnoxious.
- It lifts up slightly and the shadow turns peach when you hover.
- Made the whole pill noticeably **bigger** so it doesn't feel like a tiny afterthought (you specifically asked for this — it's now a real call-to-action, not a footnote).

**What I did to the chat panel that opens:**

- New gradient stripe across the top (peach → yellow → peach) instead of a flat orange line.
- Header now shows the Tabby logo with the same green pulse dot, and the subtitle says "LIVE · USUALLY REPLIES IN SECONDS" instead of generic "AI · Instant replies."
- Welcome screen got a bigger headline ("Hey. *Ask me anything* about Tabby.") and a small "Trained on Tabby docs only" note so users know it's not just a generic chatbot.
- The four suggested questions are now actual cards that fade in one after another, with arrows that slide right when you hover.
- The AI's replies dropped the heavy gray bubble. Now they read as plain text with a small orange line down the left side. Looks more editorial, less "Facebook Messenger."
- The "thinking…" indicator went from three bouncing dots to a refined pulsing orange dot with a label.
- The send button glows peach on hover.
- Input footer shows the actual keyboard shortcuts ("↵ to send · ⇧↵ for new line").

Way more polished overall, and people will actually find it.

---

## 8. "How it works" — you can try two different layouts (A/B style)

Some people thought they had to **swipe left/right** on the laptop to move through the steps. That's the old design (horizontal cards).

**New option:** a vertical version where the section **stays pinned** while you scroll, and the phone + copy advance step by step — so it's obvious you're supposed to **scroll the page up and down**, not swipe sideways.

**How to try it (when we're testing):**

- Add **`?hiw=sticky`** to the URL for the sticky version, or **`?hiw=swipe`** for the original horizontal one.
- In local dev, there's a small **developer toggle** (only shows in development) so you can flip versions without memorizing URLs.
- There's a safety switch in config so we don't accidentally turn the experiment on for everyone in production until we're ready.

We also **log which version someone saw** (analytics) so we can compare behavior later.

---

## 9. Fixed the page crashing when switching How-it-works modes

Flipping between the swipe layout and the sticky layout could throw a browser error (`removeChild` — sounds scary, means the animation code and React stepped on each other).

**Fix:** the site now waits until it knows which version to show, then mounts **only that one**. No more mount/unmount fight with the scroll animation library.

---

## 10. Sticky layout — feels like a guided tour now

Early drafts felt like a long list you could blow past. Now:

- The section **actually sticks** for several scroll "beats" so you walk through the steps instead of racing past.
- **Bottom pill** tells you to keep scrolling (and shows progress / last step) so nobody's guessing.
- **Extra top padding** so the floating nav doesn't cover headlines mid-scroll.
- **Phone block is bigger** so the demo fills the viewport better and doesn't feel tiny.

---

## 11. Real phone frame on the sticky demo

You uploaded an iPhone-style frame asset; I wired it into the **sticky** How-it-works view so the screenshots sit inside a realistic bezel instead of a naked rectangle.

---

## 12. Showcase section — simpler, cleaner, less "too much"

That middle section had gotten dense. I **redesigned it** with a clearer magazine-style layout:

- **Payments + fee** are organized as one chapter instead of fighting each other for attention.
- **The handoff** story is tighter and easier to scan.
- On the payment methods list, those little **arrows looked like dropdowns or fake buttons**. I removed them and used short **labels** instead (things like "Instant," "Free," "Soon") so the line reads as information, not something to click.

Overall: same facts, less visual noise, easier to understand.

---

## 13. Demo page help button no longer blocks the CTAs

The floating **Ask Tabby** launcher is now hidden on `/demo`, so it can't cover the **Skip to recap** or **Join the waitlist** controls at the bottom of the demo.

The demo still has its own small `?` button in the top bar for reopening the intro, so people are not left without help inside the demo flow.

---

## 14. Sticky section no longer "snaps" you in

When you scrolled down into the **How it works** sticky section, it used to feel like the page **snapped** to a stop and locked you in. Kind of jarring — like hitting a wall mid-scroll.

**Why it was happening:** the smooth-scroll engine and the "pin this section" engine were running on slightly different clocks. They'd disagree by one frame and that one frame is what your eye reads as a snap.

**What I did:** put both engines on the same track so they move together. Also gave the step-to-step transitions a little more weight, so when one phone screen swaps for the next, they cross-fade instead of cutting. And I added a tiny dead-zone around each step boundary so a small scroll jiggle can't bounce you back and forth between two steps.

Net effect: scrolling into the section now **eases in** instead of locking you down. Walking through the four steps feels like a guided tour, not a turnstile.

---

## 15. Top nav text now flips automatically over dark sections

You know how the **tabby** wordmark and the menu links sit on top of every section? On the white sections they should be dark, and on the black sections (How it works, the orange CTA, the footer) they should be light.

That logic existed but was failing on the **How it works** section specifically. Two separate bugs stacked on top of each other:

1. The math behind the "is a dark section under the nav?" check used a broken measurement some browsers basically ignore.
2. The How-it-works section is the A/B test (sticky vs. swipe), and the page **picks which version to show after the page has already loaded**. The nav was looking for dark sections at load time, before the sticky section even existed — so it never noticed it.

**Fix:** rewrote the measurement so it's solid across browsers, AND made the nav keep watching for new sections that appear after load instead of only checking once. Now the wordmark, menu links, and **Live Demo** button all flip from black to cream the **moment** a dark section reaches the top, including the sticky How-it-works panel — and back to black when a light section returns.

Small thing, big polish — the header is always readable now, on every section.

---

## 16. Security hardening pass

I tightened the two public write endpoints:

- **Ask Tabby chat** now has same-origin JSON checks, a request-size cap, no-store error responses, and a per-IP rate limit so one browser/IP can't hammer the AI gateway.
- **Waitlist signup** now has same-origin JSON checks, a smaller request-size cap, normalized/cleaned inputs, no-store responses, and a stricter per-IP submission limit.

I also added baseline browser security headers site-wide: no iframe embedding, no MIME sniffing, stricter referrer behavior, locked-down browser permissions, and a conservative CSP that still allows the fonts/images/analytics the site actually uses.

Remaining note: this is an in-memory edge/serverless limiter, which is good for basic abuse. If the site starts seeing real bot traffic, the next step is a shared Redis/Upstash/Vercel KV limiter so limits persist across regions and cold starts.

---

## 17. Privacy / Terms / Security pages — redesigned to match the rest of the site

Before: those three pages were basically a wall of legal text on a white background. Functional but boring, looked nothing like the rest of the marketing site.

**What I did:**

- Big italic-orange display title with the same hand-drawn squiggle we use elsewhere — so "Privacy Policy" reads with "Privacy" in italic accent and a wavy underline beneath it.
- Added a TL;DR card up top — "**the short version**" — with four bullet points so anyone can skim the gist without reading the full doc. Things like "Data: phone number + optional name. That's it." for Privacy, or "Liability cap: $100" for Terms.
- A sticky table of contents on the left at desktop sizes, with numbered sections on the right (01 — What we collect / 02 — How we use it / 03 — Storage / etc.). Click a section in the TOC, page jumps right to it.
- A rotating **stamp seal** up top showing the document name and the last-revised date — same visual language as the Tabby stamp we use elsewhere.
- A massive italic letter ghosted into the background (P. for Privacy, T. for Terms, S. for Security) at low opacity, like a magazine drop cap.
- Outro band at the bottom in our usual ink/cream with a marquee ribbon ("your data, in the open" for Privacy, "rules of the table" for Terms, "trust, but verify" for Security) and a "back to tabby." pill.

Net: legal pages now feel like part of the brand instead of a homework assignment. Same content, way better delivery.

---

## 18. Brand-new 404 page

Before: there was no custom 404. If someone hit a broken link or typo'd a URL they got Next.js's generic black-and-white error screen. Embarrassing.

**What I built:**

- Headline "**Table 404 doesn't exist.**" — same italic-accent display treatment as the rest of the site, with the squiggle under "404."
- The Tabby cat mascot (the black cat holding a receipt) is the hero visual on the right side, tilted slightly. A diagonal "**TAB 404 / not found**" rubber-stamp seal sits across the receipt it's holding. Tells the story visually without needing extra copy.
- Below the headline, a receipt-styled "**menu of suggested pages**" — Home / How it works / FAQ / Waitlist — laid out as receipt line items, each tappable, with arrows that fill in orange on hover. Bottom line shows "Total due — $0.00 · come back soon."
- A trail of paw prints leading off the receipt because of course.
- Marquee ribbon at the bottom: "404 · the cat ate the page · ✶" repeating across.

Try it: go to splittabby.com/literally-anything-broken on the branch — the page now has personality instead of an error code.

---

## 19. Live demo — big polish pass (six things at once)

This was the biggest piece of today. The /demo page is our best marketing real estate but it had a bunch of rough edges. I fixed them all together because they all touched the same page.

### A. Real iPhone 17 chassis on the demo phone

You uploaded the iPhone 17 bezel a while back, and I had it on the static homepage screenshots but not on the live demo. Now the demo phone uses the **actual silver chassis with the real dynamic island** instead of the rounded-black-rectangle "fake phone" frame I had before. Looks like a real device now, not a stand-in.

### B. Story panel on the left of the phone

Before: the demo was one centered column with just the phone. The narrative copy I'd written for each scene ("step 02 / claim — Tap what you ordered. Claim your items first, your friends will start claiming the moment you do…") was sitting in the code but **never actually showing on screen**.

Now: at desktop sizes there's a dedicated **story panel on the left of the phone** that shows the eyebrow ("step 02 / claim"), the big italic title ("Tap what you ordered."), a paragraph of body copy, and on some scenes a highlighted callout card. Each of the 15 scenes gets its own narrative beat — copy that was already written but invisible.

I also added an "**Act 1 / Setup → Act 2 / Settle → Act 3 / Aftermath**" grouping so the user has a sense of which part of the story they're in (the 15 scenes split into 3 acts: Setup is opening the app and scanning, Settle is paying and pooling, Aftermath is the receipt and insights).

On tablets and mobile the panel stacks below the phone instead of being side-by-side.

### C. First-visit intro overlay

Before: people landed on /demo and were dropped cold into the dashboard with **no "what is this / where do I tap" hint**.

Now: first time you visit /demo, a centered welcome card pops up over the page:

- Big "Welcome to the **demo.**" title
- Two-sentence subhead explaining what they're about to see
- "**Start the demo**" button
- A small note: "**Best on desktop. Mobile works, but the phone-in-phone gets snug.**"

Dismissed forever after the first visit (saved in their browser). I also added a small **`?`** icon in the top bar so anyone can re-open the intro later if they want a refresher.

This also handles the "should we put a mobile warning?" question you asked the other day — instead of a separate dismissible banner, the warning lives inside the same overlay everyone sees on first visit.

### D. Mobile fixes (your "stepper too small" note)

You'd flagged that the 14 little dots at the top of /demo were too small to tap on a phone. **Fixed.** On mobile I now hide the dots entirely and replace them with proper **← / →** arrow buttons that are big enough for thumbs. On tablets and desktop the dots are still there.

### E. Persistent "join waitlist" + "skip to recap" CTAs

Before: the only "Join the waitlist" CTA inside the demo was on the very last "Replay" screen. So if someone watched two scenes and bounced, they had **zero obvious path to convert**.

Now: a floating pair of buttons lives in the **bottom-right corner of every scene** except the last one (which already has prominent CTAs):

- "**Skip to recap**" — quietly jumps to the final scene for people who want the gist without stepping through 15 scenes.
- "**Join the waitlist**" — the orange CTA, always visible.

I also made the "Back to tabby" button smarter. If someone clicks it past the halfway mark, a small popover drops down asking "**Leave mid-flow? You're 60% through. Next scene shows pick a tip.**" with Stay / Leave buttons. Earlier scenes leave silently — no friction for people just bouncing in the first 30 seconds.

### F. Keyboard / accessibility polish

- Pressing **Escape** now closes the split-item modal and the currency picker (didn't before — keyboard users had to click out).
- People with "**reduce motion**" turned on in their OS settings get instant scene swaps instead of all the slide animations. Standard accessibility courtesy.
- The active step dot in the stepper now reports itself correctly to screen readers.

That's a lot of changes, but it all ships together as one branch and should feel like a single coordinated upgrade when you click through.

---

## 20. Demo side-panel transitions feel intentional, not "refreshy"

Right after I added the story panel (item 19.B above), you pointed out that the side panel kind of "refreshed" every time you stepped to a new scene — the whole thing blanked out and popped back in. Felt jarring.

**What I changed:**

- The "**Act 1 / Setup**" header at the top of the panel now **only animates when the act actually changes**. So as you step through Setup → Setup → Setup it stays still, and only crossfades when you cross from Setup into Settle. Used to restart on every single click.
- The scene content (eyebrow / title / body / highlight) **slides horizontally** in the direction you're moving — stepping forward, content slides in from the right; clicking a previous dot, it slides in from the left. Plus a soft blur on the swap so it feels gentle, not jumpy.
- The four pieces of content **cascade in one after another** (eyebrow first, then title, then body, then highlight), 50ms apart. Feels like the panel is "writing itself" instead of flashing.
- The progress bar at the bottom of the panel now **stays put** between scenes — only the bar width and the "06/15" digit counter smoothly tween. Used to fully rebuild every step.
- The whole panel's height **smoothly tweens** when scenes have different content lengths (some scenes have a highlight card, some don't) — no more jumpy resize as the panel grows or shrinks.

Click through the demo dot stepper now — should feel like the panel is one continuous story being told, not 15 separate slide refreshes.

---

## 21. Security audit pass is ready to commit

Ran a general security pass across the public write endpoints and site headers.

- **Ask Tabby chat** now rejects cross-origin/invalid JSON requests, caps request size, sends no-store errors, and rate-limits per IP.
- **Waitlist signup** now does the same, with stricter submit limits and cleaned/normalized input before saving.
- Site-wide headers now block iframe embedding, MIME sniffing, overly broad browser permissions, and obvious CSP gaps while still allowing the fonts/images/analytics the site uses.

Production build passes after a small type-only Motion fix in the demo panel animation code.

---

## What's next

Things I think we should look at next, in priority order:

1. **Build the PostHog dashboard/funnels** — the tracking is now in the site, so the next step is turning those events into useful PostHog views: waitlist funnel, demo drop-off, CTA performance, chat-assisted conversion, and How It Works engagement.
2. **Apply the scroll-fade affordance to every scrollable scene** — I added a "there's more content below" gradient utility in the demo polish pass but only wired it into the CSS, not into every individual scene that overflows. Would take an hour to apply across.
3. **Split the giant demo file** — it's 5,000+ lines in one file and I just added another 600. Not user-facing, just makes it slower for me to work on. Would split into a folder of per-scene files.

(Item from last round about making the dot stepper bigger on mobile is **done** — see 19.D above. Knocked that out as part of this pass.)

If any of that sounds good let me know and I'll knock them out.

---

Last thing: the changes above are all sitting on the **refresh-sam** branch. I haven't pushed them to the live site yet. When you've had a chance to click around and confirm everything looks good, give me a thumbs up and I'll ship it.

— Sam

---

## 22. Showcase handoff alignment

- Aligned the cream "No one fronts the bill" handoff slab to the same 1440px container and responsive page padding used by the payments section above it.
- Removed the separate 88vw / 1280px slab sizing that made the second card sit inset and feel off-center against the surrounding section markers.

---

## 23. Demo transition and indicator polish

- Smoothed the interactive demo narrative swaps with a softer overlapping crossfade/slide instead of the previous wait-state handoff.
- Added matching blur/slide easing to phone screen changes so text and screen transitions feel more continuous.
- Moved the Insights Pro marker into the top title area and removed the floating badge row from the visual layout.
- Cleaned up the StickyStack scroll pill with a lighter final-state treatment, tighter typography, and a drawn arrow chip.

---

## 24. Added the PostHog learning layer

Added analytics in the places that actually answer product questions:

- Waitlist funnel: page view, field starts, submit click, success, failure code, and confirmation view.
- CTA clicks: nav, hero, final stamp, pricing, footer, demo floating button, and demo replay button.
- Live demo: scene views, deepest step, completion, abandonment, resets, skip-to-recap, exit confirmation, claims, tips, payment choices, split choices, and card taps.
- Help agent: open/close, suggested question clicks, message sends, response success, and response failure.
- Homepage learning: section views, FAQ opens, phone carousel changes, phone lightbox opens/closes, How It Works variant and step progress.

Kept it privacy-safe: no email, phone number, name, or chat message text gets sent to PostHog. The events only use booleans, buckets, IDs, route names, and error codes.

Production build passes.

---

## 25. Killed the "keep scrolling" pill on How it works

You sent me a screenshot — that little floating pill at the bottom of the **How it works** section ("Keep scrolling | STEP 02 / 04") looked generic. Like every other site's scroll hint. Template energy.

Then a second screenshot — the new version was clashing with the **Ask Tabby** chat bubble in the bottom-right corner.

**What I did:**

- **Killed the pill entirely.** No more rounded card with the orange chip. It looked like a tooltip, not part of the design.
- Replaced it with a small editorial cue in the **bottom-left** corner:
  - Tiny "↓ keep scrolling" label up top, with a thin animated down-arrow that bounces on a slow loop.
  - A **huge orange step number** (02, 03, 04…) underneath, with a thin hairline and a small "/04" total — like a magazine page count.
  - The active number **crossfades** as you scroll between steps. Soft blur, not a hard swap.
- Anchored it to the **same left edge as the dots column** that runs down the side, so the dots (mid-height) and the counter (bottom) read as one system — small dots tell you visually where you are, the big number spells it out.
- Bottom-left also keeps it **clear of the Ask Tabby bubble** in the bottom-right.
- On the **last step**, the orange number shifts to cream and the label flips to "Final step" — you can feel the section is wrapping up without us adding a separate "you're done" badge.

Net: less template, more like an actual designed page. And the chat bubble has its corner back.

---

## 26. Demo navigation and waitlist duplicate tightening

- Added a dedicated `demo_screen_navigated` PostHog event for explicit demo screen jumps, with source/target screens, step indexes, phase, and deepest step.
- Made the interactive demo easier to scrub: prev/next controls now stay visible beyond mobile, ArrowLeft/ArrowRight move between screens when no modal or form field is active, reset is more visible, and disabled states remain explicit.
- Kept the stepper's 5px dot visuals while expanding each dot button to a larger focusable/clickable target with tablist/tab semantics wired to `phone-screen`.
- Replaced random solo-shareable NPC responses with deterministic item-to-diner responses so demo screenshots and recordings are reproducible.
- Added `PRO_SCREENS` for the demo's Pro badge logic and documented that the demo's split math is display-only until moved to integer cents.
- Removed waitlist table/index DDL from the signup request path, added `scripts/migrate-waitlist.mjs`, and added `pnpm db:migrate:waitlist`.
- Made valid duplicate waitlist email submissions a polite no-op through `ON CONFLICT ((lower(email))) DO NOTHING`; the API response shape stays `{ ok: true }`.
- Added the TypeScript `ignoreDeprecations` setting needed for `pnpm exec tsc --noEmit` to pass with the installed compiler.

Verification: `pnpm build` and `pnpm exec tsc --noEmit` both pass. The live waitlist migration still needs to be run against the database before deploying the API change.

---

## 27. Hero first-load motion cleanup

- Shortened the claw headline reveal so the opening accent resolves quickly instead of sitting over the page while the rest of the hero waits.
- Brought the hero subcopy and primary CTA into the same entrance beat as the headline, with shorter transform/opacity animation and reduced-motion fallback.
- Hid the phone carousel track until it has measured and centered the starting phone, preventing the visible "slide into place" jump on first render.
- Cleaned up related dev-runtime noise from the first page load: removed a stale GSAP target in the flip statement, made nav color animation use concrete RGBA values, and fixed numeric icon image dimensions.

Verification: `pnpm exec tsc --noEmit` and `pnpm build` both pass.

---

## 29. Unified DevPanel and dev-only A/B controls

- Added `components/DevPanel.tsx`: a single floating dev surface mounted in `app/layout.tsx` (gated to `NODE_ENV=development` / `NEXT_PUBLIC_DEV_MODE=true`) that bundles every local A/B knob into one organized drawer.
- Replaces the per-component `DevToggle` pills that used to stack at bottom-left (one for HowItWorks swipe/sticky, one for Footer v1/v2) and look messy on mobile.
- Drawer sections: "How it works" (Auto / Swipe / Sticky), "Footer" (Auto / V1 / V2). Header has Reset and × close buttons. Esc closes. Collapsed pill shows current state ("DEV · auto · auto") with a pulse dot.
- Mobile-friendly: 86vw max width, safe-area-inset bottom padding, z-index below HelpAgent so they don't fight for the same corner.
- Clicking "Auto" strips both the localStorage key AND the `?hiw=` / `?footer=` URL query param before reloading, so resolution truly falls back to the PostHog flag / default (the resolvers re-pin from the URL on every load).
- Stripped the inline `DevToggle` JSX from `components/Footer.tsx` and `components/sections/HowItWorks.tsx`. Resolver logic, storage keys, and PostHog flag wiring untouched.

---

## 30. Footer mobile rewrite (V1 polish + V2 rebuild)

- Rebuilt `components/FooterV2.tsx` for mobile robustness: the "tabby tabby." edge-bleeding wordmark with `whitespace-nowrap` and `clamp(7rem, 26vw, 26rem)` was overflowing the viewport on phones; replaced with a single "tabby." word.
- Removed the brittle `xPercent` parallax on the wordmark (barely visible, contributed to the overflow).
- Forced the link grid to `grid-cols-3` on every breakpoint (was `grid-cols-2 md:grid-cols-3`, which left an orphan third column on phones).
- CTA cluster restacks to button-then-platform-badges on mobile so the row never wraps mid-element.
- Tightened ambient glow size at narrow viewports, reduced top padding on phones, tuned type sizes and line spacing for sub-`sm` widths.
- Same grid + type/spacing tightening pass on `components/FooterV1.tsx` for consistency.
- **Wordmark glyph clipping (follow-up):** wrapper switched from `overflow-hidden` to `overflow-x-clip` so horizontal bleed still clips while the descender on "y" and the period render fully. Dropped the `translateY(8%)` push that was driving the glyph into the marquee. Loosened `leading-[0.82]` → `leading-[0.95]` so the line-box itself isn't cropping the descender, plus `pb-[0.18em]` breathing room. Marquee margin `-mt-3 lg:-mt-8` → `mt-2 lg:mt-4` so it sits cleanly below the full word.

---

## 31. FlipStatement reframed as "The Principle" (with width-locked WordFlip)

- Rebuilt `components/sections/FlipStatement.tsx` so the headline anchors the page philosophy with editorial chrome instead of floating loose on cream.
- Added a chapter mark eyebrow (`§ — THE PRINCIPLE`) with hairline rules left and right, matching the Showcase chapter-mark family.
- Stamped a giant low-opacity italic open-quote glyph behind the headline as the "this is a pull-quote" frame.
- Wrapped the headline in top + bottom hairlines (receipt-slip motif) and added very faint vertical ledger pinstripes behind the section, masked away from the headline so they don't fight the type.
- Footer row: pair counter (`01/06` plus six pips, active widens) on the left, italic `— the Tabby principle` signature on the right.
- Added a hand-drawn strikethrough that re-draws across the luxury word every flip — "we crossed it off your tab." Wavy SVG stroke with `pathLength` 0→1 over 0.5s, delayed ~0.56s so it lands as the new word fully fades in. Path `opacity` is gated on the same delay so a `strokeLinecap="round"` cap dot doesn't render during the pre-draw window (looked like a typo otherwise).
- **Width-locked WordFlip (powers it):** rebuilt `components/WordFlip.tsx` so the slot width locks to the widest possible word — surrounding sentence never shifts when "fries" → "dry-aged" or vice versa. Implementation: `inline-grid` with one invisible ghost per word stacked into the same `col-start-1 row-start-1` cell; cell sizes to the widest ghost. Ghosts use both `visibility: hidden` and `color: transparent` so no glyph leaks through inherited italic / accent styling.
- Switched `AnimatePresence` from `mode="popLayout"` to `mode="wait"` and dropped the y-offset transition — with locked width the popLayout overlap looked glaring (two words in the same cell at slightly different y); now only one word is on-screen at any moment with a clean blur+fade in place.
- Visible word is left-aligned in the locked cell so it sits flush against the preceding text — no big gap between "their" and the active word.
- New `suffix` prop on WordFlip: trailing element rendered immediately after the active word inside the locked cell (counted in ghost width). Used for the accent period after "water" / "salad" so it hugs the word instead of floating at the cell's right edge.
- New `renderOverlay` prop on WordFlip: child of the active word's `motion.span`, sized to the visible glyph rect. Used for the strike-through so it matches the actual word width (not the locked cell width). Removed the now-unnecessary inner `AnimatePresence` from the Strike — parent `motion.span` mount/unmount handles its lifecycle.

---

## 32. StickyStack mobile + Showcase Handoff spacing

- Reverted the StickyStack mobile fallback to mirror the desktop per-frame composition (large `StepMeta` with `01/02/03/04` + accent eyebrow + hairline rule, headline, body, phone) stacked vertically. No GSAP pin, no scroll-driven swap — just natural page scroll. Desktop pinned-scroll animation untouched.
- Bumped the Showcase § 02 "Handoff" block top padding from `pt-2` to `pt-12 sm:pt-14` (kept `lg:pt-6` desktop unchanged) and added a touch more space below the chapter mark, so the `§ 02 — THE HANDOFF` mark has real breathing room above the cream slab on phones instead of being crushed against the tail of the Payments list.
- **Sticky scroll pacing (follow-up):** desktop pinned scroll was dragging — each step ate ~1 viewport of scroll + 0.5vh dwell (~4.5vh total for 4 steps). Tightened to `perStep = 0.55` + `dwell = 0.25` (~2.45vh total — almost half). Scrub eased from `1.0` → `0.5` and the step-commit dead-zone tightened from 12% → 8% so steps land sooner. AnimatePresence swap durations on the phone (0.7s/0.55s) and copy column (0.65s/0.5s) shaved to ~0.42s/0.32s and 0.4s/0.28s respectively, so per-step content swaps land cleanly inside the shorter slot instead of getting cut off mid-animation by a quick scroll past two steps.

---
 
## 33. Demo mobile conversion pass

- Reframed the first-run demo intro from "best on desktop" to touch-first guidance so mobile/iPad users are not warned away from the experience.
- Split CTA behavior by viewport: desktop/tablet keep the floating recap + waitlist cluster, while phones get a fixed bottom control bar with progress, previous, next, skip-to-recap, and join actions.
- Added mobile bottom spacing on `/demo` so the fixed conversion bar does not cover the phone walkthrough.
- Added `demo_mobile_bar` waitlist tracking and a separate mobile skip-to-recap action label for cleaner funnel analysis.

Verification: `pnpm exec tsc --noEmit` and `pnpm build` both pass.

---

## 34. Codebase hygiene pass

- Pinned package versions instead of leaving the app on `latest`, regenerated `pnpm-lock.yaml`, removed the stray `package-lock.json`, and changed Vercel to install/build with pnpm so local and deploy installs resolve the same dependency graph.
- Repaired the broken `pnpm lint` script by making it run the same TypeScript no-emit gate as `pnpm typecheck`; `next lint` is no longer valid in this Next 16 setup without adding a separate ESLint config.
- Added shared edge-safe request helpers in `lib/server-security.ts` and wired `/api/chat` + `/api/waitlist` through them so origin checks, JSON/content-length checks, client IP lookup, and in-memory rate limiting stop being duplicated.
- Added typed analytics event scaffolding in `lib/analytics.ts` while keeping the existing `track(event, props)` API backward-compatible.
- Generated WebP versions of exported phone screenshots and the mascot, then routed phone/hero/not-found/mascot display paths to WebP assets. The PNG originals stay in `public` as source assets.
- Added `.cursor` to `.gitignore` so local editor state does not keep showing up as an untracked project file.
- Deferred the giant `InteractiveDemo.tsx` split: that is still the right next cleanup, but it should happen on a separate clean branch because the current branch already has a large dirty worktree.

Verification: `pnpm exec tsc --noEmit`, `pnpm lint`, and `pnpm build` all pass.

---

## 35. Legal pages reality pass

- Rewrote `/privacy`, `/terms`, and `/security` around the current pre-launch website instead of implying the full app/payment stack is live.
- Corrected waitlist collection language: email is required; name and phone are optional, with partial phone entries dropped by the primary waitlist form.
- Updated privacy copy to include analytics, browser metadata, waitlist storage, and AI assistant processing without naming internal vendors or routing details.
- Tightened terms so screenshots, demo flows, pricing, launch timing, payment methods, escrow, and virtual card behavior are treated as product direction, not binding promises.
- Updated security copy to match implemented controls at a public-facing level: HTTPS, browser protections, request validation, abuse prevention, private credentials, and no payment-data collection on the site.
- Removed over-specific claims we cannot prove from the codebase today, including phone-required signup, IP allowlist wording, biometric/phone-verification commitments, and guaranteed request response timing.
- Follow-up: redacted vendor names, database engine names, AI routing details, and low-level API defense specifics from the public legal pages so the docs do not reveal more system detail than users need.
- Follow-up: softened the security page's assistant section so it no longer references internal prompt structure, model credentials, or low-level AI routing language.

Verification: `pnpm exec tsc --noEmit` passes.

---

## 36. Made the sticky/footer refresh the primary site

- Updated the local Git remote to `https://github.com/Chisick-Enterprises/tabby-landing.git`; the repo's default branch is `main`.
- Removed the temporary How-it-works A/B resolver, query/localStorage overrides, PostHog variant flag lookup, and old swipe implementation.
- Made the sticky How-it-works section the direct homepage path.
- Removed the footer A/B resolver and old footer implementation; the editorial footer v2 is now the direct site footer.
- Removed the global development panel from the layout and deleted the now-unused `DevPanel`, `FooterV1`, and `Swiper` files.
- Updated stale comments/docs so this branch is ready to merge toward the primary `main` branch without dev-only experiment controls.

Verification: `pnpm exec tsc --noEmit` and `pnpm build` both pass.

---

## 37. Cleared old Vercel env vars

- Linked this checkout to Vercel project `tabby-app/tabby-site`.
- Removed the old `ANTHROPIC_API_KEY` from Preview and Production.
- Removed the old PostHog variables: `NEXT_PUBLIC_tabby_POSTHOG_PROJECT_TOKEN`, `NEXT_PUBLIC_tabby_POSTHOG_HOST`, `NEXT_PUBLIC_POSTHOG_HOST`, and `NEXT_PUBLIC_POSTHOG_KEY`.
- Verified `vercel env ls --scope tabby-app` now only shows the database-related env vars.

---

## 38. Wired PostHog product + LLM analytics for production

- Updated browser analytics to read the new PostHog project token env names, prioritizing `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` and still accepting `NEXT_PUBLIC_POSTHOG_TOKEN` / old local fallback.
- Kept the `/ingest` reverse proxy path for browser events while allowing Vercel's PostHog host env to drive production.
- Added PostHog LLM observability through `@posthog/ai` and OpenTelemetry instrumentation for Node runtime.
- Switched `/api/chat` from Edge to Node runtime so the PostHog OpenTelemetry span processor can run.
- Added Vercel AI SDK `experimental_telemetry` metadata on the help-agent `streamText` call, including PostHog distinct/session IDs from the browser when available.
- Installed and pinned `@posthog/ai`, `@opentelemetry/sdk-node`, and `@opentelemetry/resources`.
- Verified Vercel now has fresh `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` and `NEXT_PUBLIC_POSTHOG_HOST` values for Production, Preview, and Development.

Verification: `pnpm exec tsc --noEmit` and `pnpm build` both pass.

---

## 39. Fixed Vercel's frozen pnpm install

- Matched the lockfile specifiers for `@opentelemetry/resources`, `@opentelemetry/sdk-node`, and `@posthog/ai` to the exact pinned versions already in `package.json`.
- This fixes Vercel's `ERR_PNPM_OUTDATED_LOCKFILE` failure during `pnpm install --frozen-lockfile`.
- Note: this cloud runner does not have Node/pnpm installed, so local install/build verification could not run here; the failure condition was verified directly against the manifest + lockfile mismatch from the Vercel log.

---
