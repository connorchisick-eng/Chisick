import type { ScreenVariant } from "@/components/Screen";

/** Variants for the phone carousel. Each value maps to a Screen component. */
/**
 * Curated story cut — 7 screens that show the core value prop:
 * open → scan → claim → split shared items → settle → pay → everyone's done.
 * The other 10 exported screens stay available via ScreenVariant.
 */
/**
 * Curated story cut — follows the Figma file order, but dashboard is pulled
 * forward to slot #2 so the "home / hub" moment lands right after welcome.
 * Includes the insights-style screens (smart-receipts, order-summary).
 */
export const PHONE_VARIANTS: ScreenVariant[] = [
  "welcome",         // 1.  Open the app
  "friends",         // 2.  Groups — friends list
  "groups",          // 3.  Groups — recurring squads
  "scan",            // 4.  Create tab — scan the receipt
  "claim",           // 5.  Select items
  "claim-expanded",  // 6.  Select items — expanded row
  "split-amount",    // 7.  Split a shared item
  "add-split",       // 8.  Add a split amount
  "tip",             // 9.  Add tip
  "settle",          // 10. Pick a payment method
  "progress",        // 11. Tab progress — watch the table settle
  "card",            // 12. Virtual card (tap to pay)
  "confirmation",    // 13. Confirmation — itemized totals
  "smart-receipts",  // 14. PRO · Insights / dining patterns
  "sugarfish",       // 15. PRO · Restaurant detail (Sugarfish)
];

/**
 * Screens that are part of a future Pro tier rather than the closed beta.
 * The Hero carousel renders these with a visible "PRO" badge so users know
 * what's coming vs. what ships first.
 */
export const PREMIUM_VARIANTS: Set<ScreenVariant> = new Set([
  "smart-receipts",
  "sugarfish",
]);

/**
 * Screens whose source PNG is taller than the 9:19.5 phone aspect, so they
 * need a slow vertical auto-scroll to reveal the bottom instead of being
 * cropped. Kept as a set so we can grow it if other tall designs appear.
 */
export const TALL_VARIANTS: Set<ScreenVariant> = new Set([
  "smart-receipts",
]);

export const LOGO =
  "https://framerusercontent.com/images/8ziC1H7zLZIh36Br3ZlUaplUabg.png";
