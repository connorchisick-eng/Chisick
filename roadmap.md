# Waitlist Page — Fun Roadmap

Living doc for ideas to make `/waitlist` feel more alive, without breaking the "this is a receipt" metaphor or adding friction to the signup.

Ranked by **fun-per-line-of-code**. Phase 1 is all quick wins that don't need backend changes.

---

## Current state

- Tilted cream receipt with zigzag top/bottom clip-path
- Black cat peeks from behind the top edge (fixed — no longer sits on top)
- Hand-drawn "sign here" arrow annotation
- Struck-through "their order" ($332) vs your "House Salad · Tap Water" ($14)
- Perforation → `NAME` / `PHONE` fields styled as signature lines
- Cursive signature SVG draws itself on submit (~1.5s)
- `JOINED · $14` stamp slams down after signature
- Barcode strip
- Ambient warm glow pool behind receipt
- Copy: *"enjoy the meal — not the math"*

This is already a strong moment. The roadmap is additive polish, not a redesign.

---

## Phase 1 — Ship now (quick wins, < ~30 min each)

### 1. Receipt "breathes" on idle
Very slow 6s ease-in-out rotate between `-3.2deg` and `-2.8deg` on the paper. Makes the page feel alive when the user is reading/thinking. Gsap timeline on `paperRef`.

### 2. Paper crinkle on hover
On `pointerenter` of the receipt, play a single 0.3s micro-rotation (±0.5deg) + 2px vertical bob. Gives tactile feedback without being cartoony.

### 3. Mobile haptic on submit
`navigator.vibrate?.(12)` inside `submit()` right before `setSigning(true)`. Adds a satisfying phone-level confirmation on Android/most iOS. Feature-detect, no-op on unsupported.

### 4. Randomized receipt flavor on each visit
Pool of 3–5 alternate "their order" sets (bougie brunch / omakase / steakhouse / wine bar / pizza night). Pick one per page load. `useMemo(..., [])` so it stays stable across re-renders, but different on refresh. Same for the "your order" — sometimes `Tap Water`, sometimes `Espresso`, sometimes `Side Salad`. Re-playability for anyone who hits the link twice.

### 5. Receipt-style metadata strip near the top
Under the `tabby.` logo, add a tiny monospace line:
```
#20-04-2026 · 09:14 PM · TBL 04 · SRV "MIRA"
```
Date is `new Date()`, server/table are stable per-visit randoms. Hits the restaurant-receipt vibe hard for two lines of JSX.

### 6. Stamp ink splatter
Five tiny orange dots scatter outward from the `JOINED · $14` stamp on impact (~150ms stagger). Absolutely positioned inside `stampRef`, animated via framer-motion. Sells the "slam."

### 7. Tip jar callout in the totals
Add a line after `YOU PAY`:
```
TIP (they got it) .............. $0.00  ✓
```
Small visual joke reinforcing the "you got off light" narrative.

### 8. Live-validating ticks on fields
Tiny `✓` in accent color fades in at the right edge of the field the moment it's valid. Phone turns its ✓ on at 10 digits, name at 1 non-whitespace char. Reassures users pre-submit.

---

## Phase 2 — Next (moderate effort)

### 9. Cat reacts to typing
Subtle: when `name` or `phone` state changes, trigger a 180ms ear-twitch or a single blink on the cat mascot (swap the background image offset briefly, or overlay an SVG eyelid). Feels like he's watching you sign.

### 10. Post-submit "savings" callout
After the stamp lands, fade in a small line under the confirmation block:
```
* you just saved $318.00 — and a breakup *
```
Uses the existing `their share` number minus `YOU PAY`. Delightful framing of the real product value.

### 11. Confetti-but-make-it-receipts
On `status === 'done'`, launch 8–12 tiny paper receipts (5×8px cream rectangles with a zigzag) falling from the top of the card, spinning slightly, fading out. `framer-motion` `AnimatePresence` with staggered children. No third-party library.

### 12. Konami-style easter egg
Tap the `tabby.` logo 5× quickly → cat does a full jump (200% peek height, bigger rotation), and a brief speech bubble above him: `meow`. Tracks as a PostHog event `waitlist_easter_egg_triggered` for bragging rights.

### 13. Shareable receipt image on success
Render the completed receipt to a PNG (via `html-to-image` or `satori` server-side) and show a "Download receipt" button after submit. The receipt has their name, `JOINED · $14`, and the timestamp — instantly shareable to IG/TikTok stories. Requires one new dependency, but the viral hook is worth it.

### 14. Paw-print trail from "sign here" arrow
Three tiny SVG paw prints fade in in sequence along the path from the arrow tip to the first input. Guides the eye on desktop without being loud. Already have paw-print logic elsewhere — reuse.

---

## Phase 3 — Later (needs backend or bigger lift)

### 15. Queue position on the confirmation
Replace `Text: Q4 · 2026` with a dynamic `#00,241` — their live position on the waitlist. Requires `/api/waitlist` to return `{ position }` after insert. Low DB cost (a `COUNT(*)`), very high emotional payoff. The "I got an early number" feeling is what makes waitlists shareable.

### 16. Referral bump
Each signup gets a unique share URL (`/waitlist?ref=<id>`). When someone joins via your ref, you move up N spots. Display the share link + "you've invited X, jumped Y spots" on the post-submit screen. This is the single biggest viral lever available to a pre-launch consumer app. Requires: referral codes in DB, attribution on insert, update position logic.

### 17. QR code on the receipt
After signup, the barcode strip morphs into a real scannable QR linking to their referral URL. One-shot canvas render. Pairs beautifully with idea #16 and the downloadable receipt (#13).

### 18. Soft ambient restaurant sound
Opt-in only. Small speaker icon in the bottom corner → plays a 20s loop of muffled restaurant ambience (clinking, chatter). Never autoplay. Most people won't toggle it, but the 5% who do will screenshot this. localStorage-persist the choice.

### 19. "Add to calendar" CTA after submit
Small secondary link after the confirmation: `+ add launch date to calendar` → downloads an `.ics` for Q4 2026 launch. Keeps people warm until launch.

---

## Explicitly skipped (and why — so we don't relitigate)

| Idea | Reason |
|------|--------|
| Signature pad (draw your name) | Already have an auto-drawn cursive animation on submit. Manual pad adds friction, feels fiddly on mobile, and competes with the existing signature moment. |
| Full sound effects on every interaction | Risks feeling gimmicky. Restaurant ambience (opt-in, idea #18) is the tasteful version. |
| Animated food emoji drifting around | Off-brand — the receipt's whole vibe is "real-world, typographic, understated." |
| Gamified "rate your server" step | Extra form step = lower conversion. The receipt is already the game. |
| Live chat on the waitlist page | Ask Tabby exists elsewhere. This page has exactly one job: capture the phone number. |

---

## Suggested first sprint

If picking a tight batch for the next commit, I'd ship **#1, #3, #5, #7, #8, #10** together — they're all small, all stay inside `WaitlistReceipt.tsx`, and layered together they take the page from "nice" to "people screenshot this unprompted."

Then #11 (confetti receipts) and #15 (queue position) as the standalone moments worth their own PR each.
