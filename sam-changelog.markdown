# Sam's Changelog — for Connor

Hey. Quick rundown of what I changed today, in plain English. No tech jargon.

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

1. **Track demo events** — right now we don't know how many people get all the way through the live demo, or where they drop off. I can add tracking in like 10 minutes that shows you in PostHog where people abandon.
2. **Apply the scroll-fade affordance to every scrollable scene** — I added a "there's more content below" gradient utility in the demo polish pass but only wired it into the CSS, not into every individual scene that overflows. Would take an hour to apply across.
3. **Split the giant demo file** — it's 5,000+ lines in one file and I just added another 600. Not user-facing, just makes it slower for me to work on. Would split into a folder of per-scene files.

(Item from last round about making the dot stepper bigger on mobile is **done** — see 19.D above. Knocked that out as part of this pass.)

If any of that sounds good let me know and I'll knock them out.

---

Last thing: the changes above are all sitting on the **refresh-sam** branch. I haven't pushed them to the live site yet. When you've had a chance to click around and confirm everything looks good, give me a thumbs up and I'll ship it.

— Sam
