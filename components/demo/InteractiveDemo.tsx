"use client";
import {
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import type { Variants } from "motion/react";
import { clsx } from "clsx";
import { LOGO } from "@/lib/images";
import { Arrow } from "@/components/icons";
import {
  PHONE_ASPECT,
  PHONE_FRAME_SRC,
  PHONE_INSETS,
} from "@/lib/phoneInsets";
import { DemoOnboarding } from "@/components/demo/DemoOnboarding";
import { FloatingCtas } from "@/components/demo/FloatingCtas";
import { useEscapeClose } from "@/lib/useEscapeClose";
import { useReducedMotion } from "@/lib/useReducedMotion";

// ─────────────────────────────────────────────────────────────────
// Tabby palette — locked to Figma tokens
// ─────────────────────────────────────────────────────────────────
const T = {
  ink: "#0E0E0E",
  charcoal: "#1A1A1A",
  cream: "#F8F4F0",
  white: "#FDFBF9",
  accent: "#FF7C61",   // peach (CTA / brand)
  accent2: "#FDD509",  // sun yellow (highlights)
  green: "#02D57C",    // brand green (action / paid)
  greenDark: "#012F20", // deep green pill fill
  red: "#FF4D4D",      // remove dot
  gray: "#75847D",     // muted gray text
  graySoft: "#D9D9D9", // unfilled dot
  lavender: "#E7DEF3", // confirmation halo
  peachSoft: "#F4E4DC",// wallet card background
} as const;

// ─────────────────────────────────────────────────────────────────
// Types & data
// ─────────────────────────────────────────────────────────────────

type Screen =
  | "dashboard"
  | "friends"     // includes the Friends/Groups toggle
  | "camera"
  | "scanning"
  | "items"
  | "tip"
  | "payment"
  | "card"        // initiator (you) tap personal card → funds enter table pool
  | "pool"        // initiator-perspective pool fills as friends contribute; mints virtual Tabby card
  | "tabbyCard"   // initiator taps the minted one-time virtual Tabby card to merchant POS
  | "success"
  | "itemized"   // line-by-line breakdown of who paid what
  | "insights"
  | "sugarfish"
  | "historyDetail"  // past-tab detail opened from dashboard history
  | "replay";    // end of demo — replay or join waitlist

type Diner = "you" | "maya" | "sam" | "jake";

type Item = {
  id: string;
  section: "appetizers" | "entrees" | "drinks";
  name: string;
  price: number;
  qty?: number;
  shareable?: boolean;
};

type PaymentMethod = {
  id: string;
  group: "bank" | "card" | "conn";
  name: string;
  meta: string;
  logo: string;
  logoBg: string;
  logoColor?: string;
};

const DINERS: Record<Diner, { name: string; initials: string; color: string }> = {
  you: { name: "You", initials: "Y", color: T.accent },
  maya: { name: "Maya Chen", initials: "MC", color: "#CFAFA6" },
  sam: { name: "Sam Carpenter", initials: "SC", color: "#AFCFCB" },
  jake: { name: "Jake Martinez", initials: "JM", color: "#F6C6B3" },
};

const ITEMS: Item[] = [
  { id: "dip", section: "appetizers", name: "Spinach Artichoke Dip", price: 14, shareable: true },
  { id: "cala", section: "appetizers", name: "Calamari", price: 16, shareable: true },
  { id: "steak", section: "entrees", name: "NY Strip Steak", price: 42 },
  { id: "salmon", section: "entrees", name: "Grilled Salmon", price: 28 },
  { id: "alfredo", section: "entrees", name: "Chicken Alfredo", price: 24 },
  { id: "burger", section: "entrees", name: "Smash Burger Deluxe", price: 19 },
  { id: "marg", section: "drinks", name: "Margarita", price: 13, qty: 4, shareable: true },
  { id: "ipa", section: "drinks", name: "IPA Draft", price: 9, qty: 2, shareable: true },
  { id: "wine", section: "drinks", name: "House Wine", price: 11, qty: 2, shareable: true },
  { id: "spark", section: "drinks", name: "Sparkling Water", price: 5 },
];

// NPC claim sequence — fires only AFTER the user makes their first claim.
// Delays are relative to the moment the user claims for the first time.
const NPC_CLAIMS: { diner: Diner; itemId: string; delayMs: number }[] = [
  { diner: "maya", itemId: "alfredo", delayMs: 700 },
  { diner: "sam", itemId: "salmon", delayMs: 1500 },
  { diner: "jake", itemId: "burger", delayMs: 2300 },
  { diner: "maya", itemId: "marg", delayMs: 3100 },
  { diner: "sam", itemId: "ipa", delayMs: 3900 },
  { diner: "jake", itemId: "wine", delayMs: 4700 },
  { diner: "maya", itemId: "dip", delayMs: 5500 },
  { diner: "sam", itemId: "cala", delayMs: 6300 },
  { diner: "jake", itemId: "spark", delayMs: 7100 },
];

const PAYMENT_METHODS: PaymentMethod[] = [
  { id: "boa", group: "bank", name: "Bank of America", meta: "Fees apply", logo: "BoA", logoBg: "#E31837" },
  { id: "chase", group: "bank", name: "Chase", meta: "Fees apply", logo: "Ch", logoBg: "#1A4079" },
  { id: "visa", group: "card", name: "Visa — 7793", meta: "Fees apply", logo: "VISA", logoBg: "#FFFFFF", logoColor: "#1A4079" },
  { id: "amex", group: "card", name: "AmEx — 8732", meta: "Fees apply", logo: "AmEx", logoBg: "#0066B2" },
  { id: "coinbase", group: "conn", name: "Coinbase", meta: "Fees apply", logo: "C", logoBg: "#2775CA" },
  { id: "paypal", group: "conn", name: "Paypal", meta: "Fees apply", logo: "P", logoBg: "#253B80" },
];

// ─────────────────────────────────────────────────────────────────
// State machine
// ─────────────────────────────────────────────────────────────────

type Currency = "USD" | "EUR" | "GBP" | "JPY";

type State = {
  screen: Screen;
  claims: Record<string, Diner[]>;
  // Per-item custom split chosen by the user. If set, user pays
  // (num/denom) * lineTotal — denom is fixed at the table size.
  customSplits: Record<string, { num: number; denom: number }>;
  // Open split-modal — null means closed. tempDenom = candidate numerator
  splitModal:
    | { itemId: string; phase: "choose" | "custom"; tempDenom: number }
    | null;
  tipPct: 10 | 15 | 18 | 20 | "custom" | null;
  walletOn: boolean;
  paymentId: string | null;
  currency: Currency;
  currencyOpen: boolean;
  // Per-item: once the user has seen (or dismissed) the split prompt for
  // an item, suppress re-firing the modal for THAT item. Other items
  // still prompt the first time they become multi-claimed.
  splitPrompted: Record<string, boolean>;
  // Index into HISTORY_DATA when viewing a past-tab detail from the
  // dashboard. null = not in history flow.
  historyIdx: number | null;
};

type Action =
  | { type: "GOTO"; screen: Screen }
  | { type: "TOGGLE_CLAIM"; itemId: string; diner: Diner }
  | { type: "NPC_CLAIM"; itemId: string; diner: Diner }
  | { type: "SET_TIP"; pct: 10 | 15 | 18 | 20 | "custom" }
  | { type: "TOGGLE_WALLET" }
  | { type: "PICK_PAYMENT"; id: string }
  | { type: "OPEN_SPLIT"; itemId: string }
  | { type: "GOTO_SPLIT_PHASE"; phase: "choose" | "custom" }
  | { type: "SET_TEMP_DENOM"; denom: number }
  | { type: "CLOSE_SPLIT" }
  | { type: "APPLY_SPLIT_EVENLY" }
  | { type: "APPLY_CUSTOM_SPLIT" }
  | { type: "TOGGLE_CURRENCY_PICKER" }
  | { type: "SET_CURRENCY"; currency: Currency }
  | { type: "OPEN_HISTORY"; idx: number }
  | { type: "RESET" };

const INITIAL: State = {
  screen: "dashboard",
  claims: {},
  customSplits: {},
  splitModal: null,
  tipPct: 20,
  walletOn: false,
  paymentId: null,
  currency: "USD",
  currencyOpen: false,
  splitPrompted: {},
  historyIdx: null,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "GOTO":
      // Clear history context once the user leaves the history mini-flow
      // (historyDetail + the sugarfish detail they can reach from it).
      return {
        ...state,
        screen: action.screen,
        historyIdx:
          action.screen === "historyDetail" || action.screen === "sugarfish"
            ? state.historyIdx
            : null,
      };
    case "OPEN_HISTORY":
      return { ...state, screen: "historyDetail", historyIdx: action.idx };
    case "TOGGLE_CLAIM": {
      const cur = state.claims[action.itemId] ?? [];
      const has = cur.includes(action.diner);
      const next = has ? cur.filter((d) => d !== action.diner) : [...cur, action.diner];
      const nextCustom = { ...state.customSplits };
      // If the user is removing OR the claim count dropped below the user's
      // prior custom denominator, invalidate the custom split so the next
      // multi-claim prompts fresh.
      if (action.diner === "you" && has) delete nextCustom[action.itemId];
      const base = {
        ...state,
        claims: { ...state.claims, [action.itemId]: next },
        customSplits: nextCustom,
      };
      // Fire the split modal the first time the user lands on a shared
      // item. Per-item tracking: once they've seen/dismissed the prompt
      // for THIS item, don't re-fire — but new shared items still prompt.
      if (
        action.diner === "you" &&
        !has &&
        next.length >= 2 &&
        next.includes("you") &&
        state.screen === "items" &&
        !state.splitPrompted[action.itemId] &&
        !nextCustom[action.itemId] &&
        !state.splitModal
      ) {
        return {
          ...base,
          splitModal: { itemId: action.itemId, phase: "choose", tempDenom: next.length },
        };
      }
      return base;
    }
    case "NPC_CLAIM": {
      const cur = state.claims[action.itemId] ?? [];
      if (cur.includes(action.diner)) return state;
      const next = [...cur, action.diner];
      // When the claim count grows on an item the user is on, any prior
      // custom denominator is stale — drop it so the modal can re-prompt.
      const nextCustom = { ...state.customSplits };
      if (next.includes("you") && nextCustom[action.itemId]) {
        delete nextCustom[action.itemId];
      }
      const nextState = {
        ...state,
        claims: { ...state.claims, [action.itemId]: next },
        customSplits: nextCustom,
      };
      // Fire the modal the first time an NPC creates a multi-claim on an
      // item the user is on. Per-item — once prompted for this item,
      // don't re-fire when additional NPCs join.
      if (
        state.screen === "items" &&
        next.includes("you") &&
        next.length >= 2 &&
        !state.splitPrompted[action.itemId] &&
        !nextCustom[action.itemId] &&
        !state.splitModal
      ) {
        return {
          ...nextState,
          splitModal: { itemId: action.itemId, phase: "choose", tempDenom: next.length },
        };
      }
      return nextState;
    }
    case "SET_TIP":
      return { ...state, tipPct: action.pct };
    case "TOGGLE_WALLET":
      return { ...state, walletOn: !state.walletOn, paymentId: state.walletOn ? state.paymentId : null };
    case "PICK_PAYMENT":
      return { ...state, paymentId: action.id, walletOn: false };
    case "OPEN_SPLIT":
      return {
        ...state,
        splitModal: { itemId: action.itemId, phase: "choose", tempDenom: 2 },
      };
    case "GOTO_SPLIT_PHASE":
      if (!state.splitModal) return state;
      return { ...state, splitModal: { ...state.splitModal, phase: action.phase } };
    case "SET_TEMP_DENOM":
      if (!state.splitModal) return state;
      return { ...state, splitModal: { ...state.splitModal, tempDenom: action.denom } };
    case "CLOSE_SPLIT":
      return {
        ...state,
        splitModal: null,
        splitPrompted: state.splitModal
          ? { ...state.splitPrompted, [state.splitModal.itemId]: true }
          : state.splitPrompted,
      };
    case "APPLY_SPLIT_EVENLY": {
      if (!state.splitModal) return state;
      const id = state.splitModal.itemId;
      const cur = state.claims[id] ?? [];
      const next = cur.includes("you") ? cur : [...cur, "you" as Diner];
      const nextCustom = { ...state.customSplits };
      delete nextCustom[id]; // even split → no custom denom
      return {
        ...state,
        claims: { ...state.claims, [id]: next },
        customSplits: nextCustom,
        splitModal: null,
        splitPrompted: { ...state.splitPrompted, [id]: true },
      };
    }
    case "APPLY_CUSTOM_SPLIT": {
      if (!state.splitModal) return state;
      const id = state.splitModal.itemId;
      const numerator = Math.max(1, state.splitModal.tempDenom);
      const cur = state.claims[id] ?? [];
      const next = cur.includes("you") ? cur : [...cur, "you" as Diner];
      return {
        ...state,
        claims: { ...state.claims, [id]: next },
        customSplits: {
          ...state.customSplits,
          [id]: { num: numerator, denom: 4 },
        },
        splitModal: null,
        splitPrompted: { ...state.splitPrompted, [id]: true },
      };
    }
    case "TOGGLE_CURRENCY_PICKER":
      return { ...state, currencyOpen: !state.currencyOpen };
    case "SET_CURRENCY":
      return { ...state, currency: action.currency, currencyOpen: false };
    case "RESET":
      return INITIAL;
  }
}

const CURRENCY_RATES: Record<Currency, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.78,
  JPY: 155,
};
const CURRENCY_SYMBOL: Record<Currency, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  JPY: "¥",
};

function shareForDiner(
  claims: State["claims"],
  customSplits: State["customSplits"],
  diner: Diner,
): number {
  let sum = 0;
  for (const item of ITEMS) {
    const claimedBy = claims[item.id] ?? [];
    if (!claimedBy.includes(diner)) continue;
    const lineTotal = (item.qty ?? 1) * item.price;
    const userCustom = customSplits[item.id];
    const userOnItem = claimedBy.includes("you");
    const npcCount = claimedBy.filter((d) => d !== "you").length;

    if (userCustom && userOnItem) {
      // User locked in a custom share — rest splits the remainder so
      // totals across diners equal lineTotal exactly.
      if (diner === "you") {
        sum += lineTotal * (userCustom.num / userCustom.denom);
      } else if (npcCount > 0) {
        const remainder = lineTotal * ((userCustom.denom - userCustom.num) / userCustom.denom);
        sum += remainder / npcCount;
      }
    } else {
      sum += lineTotal / claimedBy.length;
    }
  }
  return sum;
}

const fmt = (n: number, currency: Currency = "USD") => {
  const v = n * (CURRENCY_RATES[currency] ?? 1);
  const sym = CURRENCY_SYMBOL[currency] ?? "$";
  if (currency === "JPY") {
    return `${sym}${Math.round(v).toLocaleString("en-US")}`;
  }
  return `${sym}${v.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};
const TAX_RATE = 0.0825;

// ─────────────────────────────────────────────────────────────────
// Step labels — top stepper
// ─────────────────────────────────────────────────────────────────

// Logical user-flow order:
// Open app → pick people → scan → claim → pay → settled → bill → insights → spot → replay
const STEP_ORDER: Screen[] = [
  "dashboard",
  "friends",
  "camera",
  "scanning",
  "items",
  "tip",
  "payment",
  "card",
  "pool",
  "tabbyCard",
  "success",
  "itemized",
  "insights",
  "sugarfish",
  "replay",
];
const STEP_LABEL: Record<Screen, string> = {
  dashboard: "Tabby Demo",
  friends: "Friends",
  camera: "Scan",
  scanning: "Parse",
  items: "Claim",
  tip: "Tip",
  payment: "Pay",
  card: "Card",
  pool: "Pool",
  tabbyCard: "Tabby Card",
  success: "Done",
  itemized: "Bill",
  insights: "Insights",
  sugarfish: "Spot",
  historyDetail: "History",
  replay: "Replay",
};

// Phase grouping — three acts of the demo. Used by the narrative side
// panel to give users a sense of "where they are in the story."
type PhaseId = 1 | 2 | 3;
const PHASE_LABEL: Record<PhaseId, string> = {
  1: "Setup",
  2: "Settle",
  3: "Aftermath",
};
const PHASES: Record<Screen, PhaseId> = {
  dashboard: 1,
  friends: 1,
  camera: 1,
  scanning: 1,
  items: 1,
  tip: 2,
  payment: 2,
  card: 2,
  pool: 2,
  tabbyCard: 2,
  success: 3,
  itemized: 3,
  insights: 3,
  sugarfish: 3,
  historyDetail: 3,
  replay: 3,
};

// ─────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────

// Threshold past which navigating away from the demo prompts a "are you
// sure?" popover, since the user has already invested time stepping through
// scenes. Earlier scenes are low-investment — let users leave silently.
const EXIT_CONFIRM_AFTER_STEP = 5;

export function InteractiveDemo() {
  const router = useRouter();
  const [state, dispatch] = useReducer(reducer, INITIAL);
  const [helpOpen, setHelpOpen] = useState(false);
  const [exitConfirmOpen, setExitConfirmOpen] = useState(false);

  const yourSubtotal = shareForDiner(state.claims, state.customSplits, "you");
  const tipPct = typeof state.tipPct === "number" ? state.tipPct : 0;
  const tip = (yourSubtotal * tipPct) / 100;
  const tax = yourSubtotal * TAX_RATE;
  const yourTotal = yourSubtotal + tip + tax;

  const stepIdx = STEP_ORDER.indexOf(state.screen);

  return (
    <div className="mx-auto max-w-[1440px] flex flex-col">
      {/* Top bar — two edge-aligned groups (back+title on left, stepper
          + label + reset on right) so the center column stays open and
          leaves room for the floating Pro badge on pro screens.
          Margin below collapses on pro screens because the pill row
          provides its own vertical spacing. */}
      <div
        className={clsx(
          "flex items-center justify-between gap-6 md:gap-10 flex-wrap",
          state.screen === "insights" || state.screen === "sugarfish"
            ? ""
            : "mb-4 md:mb-6",
        )}
      >
        <div className="flex items-center gap-3 md:gap-6 flex-wrap relative">
          <button
            type="button"
            aria-label="Back to Tabby"
            onClick={() => {
              if (stepIdx > EXIT_CONFIRM_AFTER_STEP) {
                setExitConfirmOpen(true);
              } else {
                router.push("/");
              }
            }}
            className="group inline-flex items-center gap-2 rounded-full text-[11px] md:text-sm font-semibold transition-all duration-300 border bg-transparent border-accent/40 text-accent hover:bg-accent/[0.08] hover:border-accent px-3 py-1.5 md:px-4 md:py-2 shrink-0 leading-none cursor-pointer"
          >
            <Arrow className="scale-x-[-1] transition-transform duration-300 group-hover:-translate-x-1" />
            <span className="leading-none hidden sm:inline">Back to tabby</span>
          </button>

          {/* Mid-flow exit confirmation — drops down from the back button.
              Only shown past EXIT_CONFIRM_AFTER_STEP. */}
          <AnimatePresence>
            {exitConfirmOpen && (
              <motion.div
                key="exit-confirm"
                role="dialog"
                aria-label="Leave the demo?"
                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.97 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                className="absolute top-[calc(100%+12px)] left-0 z-40 w-[300px] rounded-xl bg-surface shadow-[0_30px_60px_-15px_rgba(14,14,14,0.35)] border border-line/15 p-4"
              >
                <p className="font-grotesk font-bold text-body text-[0.95rem] leading-snug">
                  Leave mid-flow?
                </p>
                <p className="mt-1.5 text-body/65 text-[0.82rem] leading-[1.5]">
                  You&apos;re{" "}
                  <span className="text-accent font-semibold">
                    {Math.round(((stepIdx + 1) / STEP_ORDER.length) * 100)}%
                  </span>{" "}
                  through. The next scene shows{" "}
                  {NARRATIVES[STEP_ORDER[Math.min(stepIdx + 1, STEP_ORDER.length - 1)]].title.replace(/\.$/, "").toLowerCase()}.
                </p>
                <div className="mt-4 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setExitConfirmOpen(false)}
                    className="flex-1 px-3 py-2 rounded-full text-[0.78rem] font-semibold uppercase tracking-[0.18em] border border-line/15 text-body/65 hover:text-body hover:border-body/30 transition-colors"
                  >
                    Stay
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setExitConfirmOpen(false);
                      router.push("/");
                    }}
                    className="flex-1 px-3 py-2 rounded-full text-[0.78rem] font-semibold uppercase tracking-[0.18em] bg-body text-surface hover:bg-accent transition-colors"
                  >
                    Leave
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <AnimatePresence mode="wait">
            <motion.h2
              key={state.screen}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 6 }}
              transition={{ duration: 0.25 }}
              className="font-grotesk font-bold leading-none flex items-center gap-2.5"
              style={{
                color: T.ink,
                fontSize: "clamp(1.3rem, 1.9vw, 1.75rem)",
                letterSpacing: "-0.02em",
              }}
            >
              {state.screen === "dashboard" && (
                <Image
                  src={LOGO}
                  alt=""
                  aria-hidden
                  width={32}
                  height={32}
                  className="rounded-md"
                  style={{ background: "#fff", padding: 3 }}
                />
              )}
              {NARRATIVES[state.screen].title}
            </motion.h2>
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-3 md:gap-6 flex-wrap">
          {/* Mobile prev/next — replaces the cramped 15-dot stepper on
              narrow viewports. Hidden at sm+ where dots fit comfortably. */}
          <div className="flex sm:hidden items-center gap-2">
            <button
              type="button"
              onClick={() => {
                const prev = STEP_ORDER[Math.max(0, stepIdx - 1)];
                dispatch({ type: "GOTO", screen: prev });
              }}
              disabled={stepIdx === 0}
              aria-label="Previous scene"
              className="w-7 h-7 rounded-full border border-line/15 text-body/65 hover:text-body hover:border-accent/40 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
                <path d="M7 1 L3 5 L7 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => {
                const next = STEP_ORDER[Math.min(STEP_ORDER.length - 1, stepIdx + 1)];
                dispatch({ type: "GOTO", screen: next });
              }}
              disabled={stepIdx === STEP_ORDER.length - 1}
              aria-label="Next scene"
              className="w-7 h-7 rounded-full border border-line/15 text-body/65 hover:text-body hover:border-accent/40 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
                <path d="M3 1 L7 5 L3 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          {/* Dot stepper — visible at sm+; below sm we use the arrows above. */}
          <div className="hidden sm:flex items-center gap-1 md:gap-2.5">
            {STEP_ORDER.map((s, i) => {
              const active = i === stepIdx;
              const done = i < stepIdx;
              return (
                <button
                  key={s}
                  onClick={() => dispatch({ type: "GOTO", screen: s })}
                  aria-label={`Go to ${STEP_LABEL[s]}`}
                  aria-current={active ? "step" : undefined}
                  className="rounded-full transition-all shrink-0"
                  style={{
                    height: 5,
                    width: active ? 16 : 5,
                    background: active ? T.accent : done ? T.green : "rgba(14,14,14,0.15)",
                  }}
                />
              );
            })}
          </div>

          <span
            className="text-[9px] md:text-[10px] uppercase tracking-[0.22em] font-semibold whitespace-nowrap"
            style={{ color: T.gray }}
          >
            {String(stepIdx + 1).padStart(2, "0")}/{STEP_ORDER.length}{" "}
            <span style={{ color: T.ink }}>{STEP_LABEL[state.screen]}</span>
          </span>

          <button
            onClick={() => dispatch({ type: "RESET" })}
            className="text-[10px] md:text-[11px] uppercase tracking-[0.22em] font-semibold transition px-2.5 py-1 md:px-3 md:py-1.5 rounded-full hover:bg-line/5"
            style={{ color: T.gray }}
          >
            ↺ reset
          </button>
          <button
            type="button"
            onClick={() => setHelpOpen(true)}
            aria-label="Re-open the demo intro"
            className="w-7 h-7 rounded-full border border-line/15 text-body/55 hover:text-body hover:border-accent/40 hover:bg-accent/5 transition-colors flex items-center justify-center text-[0.78rem] font-semibold"
          >
            ?
          </button>
        </div>
      </div>

      {/* Pro pill — dedicated row between top bar and phone on pro-only
          screens, with vertical padding so it breathes between the top
          bar and the phone screen. Renders nothing on other screens so
          the phone sits tight to the top bar. */}
      {(state.screen === "insights" || state.screen === "sugarfish") && (
        <div className="flex justify-center" style={{ paddingTop: "6px", paddingBottom: "10px" }}>
          <span
            className="inline-flex items-center uppercase font-bold whitespace-nowrap"
            style={{
              background: T.accent,
              color: "#fff",
              fontSize: "0.72rem",
              letterSpacing: "0.22em",
              padding: "0.4rem 0.95rem",
              borderRadius: "999px",
              boxShadow: "0 8px 22px -6px rgba(255,124,97,0.55)",
            }}
          >
            Pro · Coming later
          </span>
        </div>
      )}

      {/* Body grid — narrative panel + phone. Stacks on mobile/tablet
          with phone first, narrative below. Two-column at lg+ with the
          narrative panel vertically centered against the phone in the
          right column. */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(320px,420px)_1fr] gap-8 lg:gap-14 xl:gap-20 items-start lg:items-center flex-1 min-h-0">
        <NarrativePanel
          screen={state.screen}
          stepIdx={stepIdx}
          className="order-2 lg:order-1 lg:pt-2"
        />
        <div className="order-1 lg:order-2 flex flex-col justify-start items-center min-h-0 pt-0 pb-2 w-full">
          <PhoneShell>
            <PhoneRouter
              state={state}
              dispatch={dispatch}
              yourSubtotal={yourSubtotal}
              yourTotal={yourTotal}
              tip={tip}
              tax={tax}
            />
          </PhoneShell>
        </div>
      </div>

      {/* First-visit onboarding — auto-opens via localStorage on first
          render, can be re-opened via the "?" button in the top bar. */}
      <DemoOnboarding
        forceOpen={helpOpen ? true : undefined}
        onClose={() => setHelpOpen(false)}
      />

      {/* Persistent CTAs — visible on every scene except the final
          replay screen, which already has its own prominent CTAs. */}
      <FloatingCtas
        visible={state.screen !== "replay"}
        onSkipToRecap={() => dispatch({ type: "GOTO", screen: "replay" })}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Narrative side panel — surfaces eyebrow / body / highlight per scene
// ─────────────────────────────────────────────────────────────────

// Variants for the scene-content slide. `direction` is +1 when stepping
// forward through the demo, -1 when stepping back. New content slides in
// from the side the user is moving *toward*; old content slides out the
// opposite way. A small filter blur softens the swap without feeling
// laggy. Children inherit the timing and animate in a quick cascade.
const scenePanelVariants: Variants = {
  initial: (direction: number) => ({
    opacity: 0,
    x: direction * 36,
    filter: "blur(6px)",
  }),
  animate: {
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.55,
      ease: [0.22, 1, 0.36, 1],
      when: "beforeChildren",
      staggerChildren: 0.05,
      delayChildren: 0.04,
    },
  },
  exit: (direction: number) => ({
    opacity: 0,
    x: -direction * 36,
    filter: "blur(6px)",
    transition: { duration: 0.28, ease: [0.76, 0, 0.24, 1] },
  }),
};

const sceneChildVariants: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
};

function NarrativePanel({
  screen,
  stepIdx,
  className,
}: {
  screen: Screen;
  stepIdx: number;
  className?: string;
}) {
  const n = NARRATIVES[screen];
  const phase = PHASES[screen];
  const phaseLabel = PHASE_LABEL[phase];

  // Track previous step so we can animate scene-content slide direction.
  // +1 = moving forward, -1 = moving back (reset / dot-stepper jump back).
  const prevStepIdxRef = useRef(stepIdx);
  const direction =
    stepIdx === prevStepIdxRef.current
      ? 1
      : stepIdx > prevStepIdxRef.current
      ? 1
      : -1;
  useEffect(() => {
    prevStepIdxRef.current = stepIdx;
  }, [stepIdx]);

  const reduced = useReducedMotion();

  // First and last index of the current phase, for the in-phase progress bar
  const phaseScreens = STEP_ORDER.filter((s) => PHASES[s] === phase);
  const phaseStart = STEP_ORDER.indexOf(phaseScreens[0]);
  const phaseEnd = STEP_ORDER.indexOf(phaseScreens[phaseScreens.length - 1]);
  const phaseProgress =
    phaseEnd === phaseStart
      ? 1
      : (stepIdx - phaseStart) / (phaseEnd - phaseStart);

  return (
    <aside className={clsx("relative w-full", className)}>
      {/* Phase chip — only animates when the *phase* actually changes,
          not on every scene step. Keyed on phase, not screen. */}
      <AnimatePresence mode="wait">
        <motion.div
          key={phase}
          initial={reduced ? false : { opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduced ? { opacity: 1 } : { opacity: 0, y: -4 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center gap-3 text-[0.74rem] uppercase tracking-[0.28em] font-semibold text-body/45"
        >
          <span aria-hidden className="inline-block w-8 h-px bg-body/30" />
          <span>
            Act {phase}{" "}
            <span className="text-body/30">·</span>{" "}
            <span className="text-body">{phaseLabel}</span>
          </span>
        </motion.div>
      </AnimatePresence>

      {/* Scene content slot — clips horizontal slide to the panel width
          and uses motion's layout animation so panel height tweens
          smoothly when scenes have different content lengths. */}
      <motion.div
        layout={!reduced}
        transition={{
          layout: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
        }}
        className="relative overflow-hidden mt-8"
      >
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={screen}
            custom={direction}
            variants={reduced ? undefined : scenePanelVariants}
            initial={reduced ? false : "initial"}
            animate={reduced ? { opacity: 1 } : "animate"}
            exit={reduced ? { opacity: 1 } : "exit"}
          >
            <motion.div
              variants={reduced ? undefined : sceneChildVariants}
              className="text-[0.78rem] uppercase tracking-[0.26em] font-semibold text-body/55"
            >
              {n.eyebrow}
            </motion.div>

            <motion.h3
              variants={reduced ? undefined : sceneChildVariants}
              className="mt-4 font-grotesk font-bold text-body leading-[1.0] tracking-[-0.03em]"
              style={{ fontSize: "clamp(2.1rem, 3.6vw, 3.3rem)" }}
            >
              {n.title}
            </motion.h3>

            <motion.p
              variants={reduced ? undefined : sceneChildVariants}
              className="mt-6 text-body/72 leading-[1.6] text-[1.08rem] md:text-[1.14rem]"
            >
              {n.body}
            </motion.p>

            {n.highlight && (
              <motion.div
                variants={reduced ? undefined : sceneChildVariants}
                className="mt-6 rounded-xl border border-accent/30 bg-accent/[0.06] px-5 py-4"
              >
                <div className="flex items-start gap-3">
                  <span
                    aria-hidden
                    className="mt-[0.55rem] w-2 h-2 rounded-full bg-accent flex-shrink-0"
                  />
                  <p className="text-body/78 leading-[1.55] text-[1rem]">
                    {n.highlight}
                  </p>
                </div>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Phase progress strip — stays mounted across scene changes.
          Only the bar width and the digit counter tween/swap. */}
      <div className="mt-10 flex items-center gap-3">
        <span className="text-[0.7rem] uppercase tracking-[0.24em] font-semibold text-body/45 whitespace-nowrap">
          {phaseLabel}
        </span>
        <span
          aria-hidden
          className="flex-1 h-[3px] rounded-full overflow-hidden"
          style={{ background: "rgba(14,14,14,0.08)" }}
        >
          <motion.span
            className="block h-full rounded-full"
            style={{ background: "rgb(255,124,97)" }}
            initial={false}
            animate={{
              width: `${Math.max(8, phaseProgress * 100).toFixed(0)}%`,
            }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          />
        </span>
        <span className="text-[0.7rem] uppercase tracking-[0.24em] font-semibold text-body/55 whitespace-nowrap relative inline-block min-w-[3.4em] text-right tabular-nums">
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={stepIdx}
              initial={reduced ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduced ? { opacity: 1 } : { opacity: 0, y: -6 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="block"
            >
              {String(stepIdx + 1).padStart(2, "0")}/{STEP_ORDER.length}
            </motion.span>
          </AnimatePresence>
        </span>
      </div>
    </aside>
  );
}

// ─────────────────────────────────────────────────────────────────
// Narrative copy (used inline by main caption)
// ─────────────────────────────────────────────────────────────────

const NARRATIVES: Record<Screen, { eyebrow: string; title: string; body: string; highlight?: string }> = {
  camera: {
    eyebrow: "step 01 / scan",
    title: "Tap the shutter.",
    body: "Tabby's OCR reads every line — items, modifiers, tax, suggested gratuity — in under two seconds.",
    highlight: "A shared wallet opens for the table on capture, so all four diners can claim items in real time.",
  },
  scanning: {
    eyebrow: "step 01 / parsing",
    title: "Parsing the bill.",
    body: "11 items detected. Tax detected. Suggested gratuity detected. A new shared wallet is opening.",
  },
  items: {
    eyebrow: "step 02 / claim",
    title: "Tap what you ordered.",
    body: "Claim your items first. Your friends will start claiming the moment you do — shared plates split between whoever had some.",
    highlight: "Watch the ledger on the right — totals update with every tap, math locks the second the last person claims.",
  },
  tip: {
    eyebrow: "step 03 / tip",
    title: "Pick a tip.",
    body: "Tabby applies the % to your subtotal and computes your slice of tax. The number you see matches the merchant ledger to the penny.",
  },
  payment: {
    eyebrow: "step 04 / pay",
    title: "Choose how it settles.",
    body: "Linked banks settle for free. Cards add a 3% fee. Toggle the wallet to use prefunded SilaUSD — instant and free.",
    highlight: "On tap, money moves from your account to the merchant in milliseconds.",
  },
  card: {
    eyebrow: "step 05 / fund the pool",
    title: "Send your share.",
    body: "Tap your personal card to drop your share into the table pool. Friends do the same on their phones — every contribution lands in the initiator's wallet, not at the merchant.",
    highlight: "Nothing hits the restaurant yet — Tabby safely holds every share in the table pool until it's fully covered.",
  },
  pool: {
    eyebrow: "step 06 / pool fills",
    title: "Pool's filling.",
    body: "From the initiator's view, watch each friend's card top up the table pool in real time. The moment it reaches 100%, Tabby mints a one-time virtual card capped at the exact bill total.",
    highlight: "One card. One charge. The merchant sees a single tap, not four — and the virtual card self-destructs the second it's used.",
  },
  tabbyCard: {
    eyebrow: "step 07 / one-time card",
    title: "Tap the Tabby card.",
    body: "The minted virtual Tabby card is loaded into the initiator's wallet. Hold the phone near the reader — one consolidated charge clears for the whole table.",
  },
  success: {
    eyebrow: "tab closed",
    title: "Squared up.",
    body: "Alberto's sees one consolidated payment, not four. Your itemized receipt is filed in Tabby. Settlement clears overnight.",
    highlight: "Avg time from sit-down receipt to closed tab in beta: 2 min 14 sec.",
  },
  itemized: {
    eyebrow: "post-tab / receipt",
    title: "Itemized bill.",
    body:
      "Line by line — every item, every claim, every share. The receipt that gets emailed to each diner.",
  },
  insights: {
    eyebrow: "explore / smart receipts",
    title: "Insights.",
    body:
      "Every closed tab feeds your spending dashboard — average ticket, cuisine mix, top restaurants, dining streak.",
  },
  sugarfish: {
    eyebrow: "explore / restaurant",
    title: "Spot detail.",
    body:
      "Each restaurant has its own page — last visit, average spend, the friends you usually go with, most-ordered dishes.",
  },
  historyDetail: {
    eyebrow: "history / past tab",
    title: "Past tab.",
    body:
      "Every closed tab keeps a full receipt — who paid what, per-person totals, tip and tax. Tap the restaurant to see the spot page.",
  },
  replay: {
    eyebrow: "end of demo",
    title: "That's Tabby.",
    body:
      "Two minutes from sit-down to settled. Replay the demo, or join the waitlist to be first in line.",
  },
  dashboard: {
    eyebrow: "step 00 / open the app",
    title: "Tabby Demo",
    body:
      "Open Tabby and you see what matters — any open tab a friend is on, your dining circle, and your recent history.",
  },
  friends: {
    eyebrow: "step 01 / pick who",
    title: "Pick your people.",
    body:
      "Friends or Groups — toggle at the top. Multi-select individuals, or tap a saved squad like Boys Night to load everyone at once.",
  },
};

// ─────────────────────────────────────────────────────────────────
// Phone shell
// ─────────────────────────────────────────────────────────────────

function PhoneShell({ children }: { children: React.ReactNode }) {
  // Outer aspect locked to the iPhone 17 SVG bezel (450×920). Width-only
  // sizing comes from .demo-phone-shell — the aspect inline style here
  // takes care of the height. The bezel's dynamic island is part of the
  // SVG itself, so no faux notch is rendered here.
  return (
    <div
      className="demo-phone-shell relative mx-auto"
      style={{ aspectRatio: PHONE_ASPECT }}
    >
      {/* warm halo behind the device */}
      <div
        aria-hidden
        className="absolute -inset-12 rounded-full blur-3xl pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 50% 35%, rgba(255,124,97,0.32), transparent 60%)",
        }}
      />

      {/* drop shadow for the device — sits behind the SVG so the bezel's
          natural transparency doesn't get a hard rectangular shadow */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          filter: "drop-shadow(0 60px 80px rgba(14,14,14,0.45))",
        }}
      >
        <img
          src={PHONE_FRAME_SRC}
          alt=""
          aria-hidden
          className="block w-full h-full select-none"
          draggable={false}
        />
      </div>

      {/* Inner screen content — clipped to the bezel cutout */}
      <div
        className="absolute overflow-hidden"
        style={{
          top: PHONE_INSETS.top,
          bottom: PHONE_INSETS.bottom,
          left: PHONE_INSETS.left,
          right: PHONE_INSETS.right,
          borderRadius: PHONE_INSETS.radius,
          background: T.cream,
          containerType: "inline-size",
        }}
      >
        {children}
      </div>

      {/* Bezel overlay — stacks on top of screen content so the silver
          chassis edges and dynamic island sit above the screen */}
      <img
        src={PHONE_FRAME_SRC}
        alt=""
        aria-hidden
        className="absolute inset-0 w-full h-full pointer-events-none select-none"
        draggable={false}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Router
// ─────────────────────────────────────────────────────────────────

type RouterProps = {
  state: State;
  dispatch: React.Dispatch<Action>;
  yourSubtotal: number;
  yourTotal: number;
  tip: number;
  tax: number;
};

function PhoneRouter(props: RouterProps) {
  const reduced = useReducedMotion();
  return (
    <div className="absolute inset-0">
      <AnimatePresence mode="wait">
        <motion.div
          key={props.state.screen}
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduced ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: reduced ? 0 : 0.32 }}
          className="absolute inset-0"
        >
          {props.state.screen === "camera" && <CameraScreen {...props} />}
          {props.state.screen === "scanning" && <ScanningScreen {...props} />}
          {props.state.screen === "items" && <ItemsScreen {...props} />}
          {props.state.screen === "tip" && <TipScreen {...props} />}
          {props.state.screen === "payment" && <PaymentScreen {...props} />}
          {props.state.screen === "card" && <CardScreen {...props} />}
          {props.state.screen === "pool" && <PoolScreen {...props} />}
          {props.state.screen === "tabbyCard" && <TabbyCardScreen {...props} />}
          {props.state.screen === "success" && <SuccessScreen {...props} />}
          {props.state.screen === "dashboard" && <DashboardScreen {...props} />}
          {props.state.screen === "friends" && <FriendsScreen {...props} />}
          {props.state.screen === "itemized" && <ItemizedScreen {...props} />}
          {props.state.screen === "sugarfish" && <SugarfishScreen {...props} />}
          {props.state.screen === "historyDetail" && <HistoryDetailScreen {...props} />}
          {props.state.screen === "insights" && <InsightsScreen {...props} />}
          {props.state.screen === "replay" && <ReplayScreen {...props} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Status bar
// ─────────────────────────────────────────────────────────────────

function StatusBar({ dark }: { dark?: boolean }) {
  const color = dark ? T.white : T.ink;
  return (
    <div
      className="flex items-center justify-between font-semibold relative z-20"
      style={{ color, fontSize: "4.3cqw", padding: "5.4cqw 8.4cqw 2.4cqw" }}
    >
      <span className="tabular-nums">9:41</span>
      <span style={{ width: "28%" }} />
      <span className="flex items-center" style={{ gap: "1.7cqw" }}>
        {/* Full cellular signal — 4 ascending filled bars */}
        <svg
          viewBox="0 0 17 10"
          style={{ height: "2.6cqw", width: "auto" }}
          aria-hidden
        >
          <rect x="0"  y="7" width="3" height="3" rx="0.6" fill={color} />
          <rect x="4"  y="5" width="3" height="5" rx="0.6" fill={color} />
          <rect x="8"  y="2.5" width="3" height="7.5" rx="0.6" fill={color} />
          <rect x="12" y="0" width="3" height="10" rx="0.6" fill={color} />
        </svg>
        {/* Wi-Fi — 2 concentric arcs + dot, centered */}
        <svg
          viewBox="0 0 20 14"
          style={{ height: "2.6cqw", width: "auto" }}
          fill="none"
          stroke={color}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M2 5 Q 10 -1 18 5" />
          <path d="M5 8.5 Q 10 4.5 15 8.5" />
          <circle cx="10" cy="12" r="1.1" fill={color} stroke="none" />
        </svg>
        {/* Battery — filled inner + positive terminal nub, sized to
            match the cellular/wifi glyphs. */}
        <span className="relative inline-flex items-center">
          <span
            className="inline-block relative"
            style={{
              width: "5cqw",
              height: "2.6cqw",
              border: `0.22cqw solid ${color}`,
              borderRadius: "0.6cqw",
              padding: "0.22cqw",
            }}
          >
            <span
              className="block h-full"
              style={{ width: "100%", background: color, borderRadius: "0.3cqw" }}
            />
          </span>
          <span
            className="inline-block"
            style={{
              width: "0.4cqw",
              height: "1.2cqw",
              background: color,
              borderTopRightRadius: "0.2cqw",
              borderBottomRightRadius: "0.2cqw",
              marginLeft: "0.15cqw",
            }}
          />
        </span>
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// 1. Camera
// ─────────────────────────────────────────────────────────────────

function CameraScreen({ dispatch }: RouterProps) {
  return (
    <div
      className="relative w-full h-full font-grotesk flex flex-col"
      style={{ background: T.ink, color: T.white }}
    >
      <StatusBar dark />
      <div className="flex items-center" style={{ padding: "4.1cqw 8.4cqw 5cqw", gap: "5cqw", fontSize: "5cqw" }}>
        <button
          type="button"
          onClick={() => dispatch({ type: "GOTO", screen: "dashboard" })}
          aria-label="Back"
          className="grid place-items-center rounded-full transition active:scale-90"
          style={{
            width: "9cqw",
            height: "9cqw",
            background: "rgba(255,255,255,0.08)",
            color: T.white,
            fontSize: "7.4cqw",
            lineHeight: 1,
          }}
        >
          ❮
        </button>
        <span className="font-bold" style={{ fontSize: "6cqw" }}>Scan Receipt</span>
      </div>

      <div
        className="relative flex-1 overflow-hidden"
        style={{ margin: "0 8.4cqw", borderRadius: "6.7cqw", background: "#1a140d" }}
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              "repeating-linear-gradient(100deg, #2a1e14 0 6px, #1f140c 6px 14px, #31221a 14px 22px)",
            opacity: 0.9,
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 50% 40%, rgba(0,0,0,0) 30%, rgba(0,0,0,0.45) 90%)",
          }}
        />

        <div
          className="absolute font-mono"
          style={{
            left: "4%", right: "4%", top: "6%", bottom: "6%",
            background: "#F3EBDA", color: "#2a2a2a",
            borderRadius: "3.4cqw", padding: "6cqw",
            fontSize: "3.6cqw", lineHeight: 1.35,
            boxShadow: "0 8px 16px rgba(0,0,0,0.35)",
          }}
        >
          <div className="text-center font-bold" style={{ fontSize: "6.7cqw" }}>ALBERTO&apos;S</div>
          <div className="text-center" style={{ fontSize: "3.7cqw", opacity: 0.7, marginBottom: "3.4cqw" }}>
            Table 12 · 4 guests
          </div>
          <div className="font-bold">Appetizers</div>
          <Row item="Spinach Artichoke Dip" price="$14.00" />
          <Row item="Calamari" price="$16.00" />
          <div style={{ marginTop: "2.5cqw" }} className="font-bold">Entrees</div>
          <Row item="NY Strip Steak" price="$42.00" />
          <Row item="Grilled Salmon" price="$28.00" />
          <Row item="Chicken Alfredo" price="$24.00" />
          <Row item="Smash Burger Deluxe" price="$19.00" />
          <div style={{ marginTop: "2.5cqw" }} className="font-bold">Drinks</div>
          <Row item="4× Margaritas" price="$52.00" />
          <Row item="2× IPA Draft" price="$18.00" />
          <Row item="2× House Wine" price="$22.00" />
          <Row item="Sparkling Water" price="$5.00" />
          <div style={{ marginTop: "3.4cqw" }} className="font-bold flex justify-between">
            <span>Subtotal</span><span>$240.00</span>
          </div>
          <div className="font-bold flex justify-between">
            <span>Tax (8.25%)</span><span>$19.80</span>
          </div>
        </div>

        {[
          { top: "3%", left: "3%", borderTop: 2, borderLeft: 2 },
          { top: "3%", right: "3%", borderTop: 2, borderRight: 2 },
          { bottom: "3%", left: "3%", borderBottom: 2, borderLeft: 2 },
          { bottom: "3%", right: "3%", borderBottom: 2, borderRight: 2 },
        ].map((s, i) => (
          <span
            key={i}
            className="absolute"
            style={{ ...s, width: "8%", height: "5%", borderColor: T.green, borderStyle: "solid" }}
          />
        ))}

      </div>

      {/* Shutter row — the pulsing green ring around the shutter conveys
          tap affordance, no separate label needed (matches Figma). */}
      <div className="flex items-center justify-between relative" style={{ padding: "6cqw 14% 6.6cqw" }}>
        <span
          className="aspect-square rounded-sm border"
          style={{ width: "7%", borderColor: "rgba(255,255,255,0.4)", opacity: 0.7 }}
        />
        <button
          onClick={() => dispatch({ type: "GOTO", screen: "scanning" })}
          className="relative aspect-square rounded-full flex items-center justify-center cursor-pointer transition active:scale-90 hover:scale-105"
          style={{ width: "20%", background: T.white }}
        >
          <span className="absolute inset-[14%] rounded-full" style={{ border: `2px solid ${T.ink}` }} />
          <motion.span
            className="absolute -inset-1 rounded-full"
            style={{ border: `2px solid ${T.green}` }}
            animate={{ scale: [1, 1.25, 1], opacity: [0.7, 0, 0.7] }}
            transition={{ duration: 1.6, repeat: Infinity }}
          />
        </button>
        <span
          className="aspect-square rounded-full border flex items-center justify-center"
          style={{ width: "7%", borderColor: "rgba(255,255,255,0.4)", opacity: 0.7, fontSize: "5cqw" }}
        >
          ⚡
        </span>
      </div>
    </div>
  );
}

function Row({ item, price }: { item: string; price: string }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: "0.4em" }}>
      <span
        style={{
          minWidth: 0,
          flexShrink: 1,
          wordBreak: "break-word",
        }}
      >
        {item}
      </span>
      <span
        aria-hidden
        style={{
          flex: "1 1 0",
          minWidth: "0.5em",
          opacity: 0.45,
          overflow: "hidden",
          whiteSpace: "nowrap",
        }}
      >
        ················································································
      </span>
      <span style={{ flexShrink: 0, whiteSpace: "nowrap" }}>{price}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// 2. Scanning
// ─────────────────────────────────────────────────────────────────

function ScanningScreen({ dispatch }: RouterProps) {
  useEffect(() => {
    const t = setTimeout(() => dispatch({ type: "GOTO", screen: "items" }), 2400);
    return () => clearTimeout(t);
  }, [dispatch]);

  // Three-step progress that ticks across while scanning runs
  const steps = ["OCR", "Ledger", "Wallet"];
  const [done, setDone] = useState(0);
  useEffect(() => {
    const ts = [
      setTimeout(() => setDone(1), 600),
      setTimeout(() => setDone(2), 1200),
      setTimeout(() => setDone(3), 1800),
    ];
    return () => ts.forEach(clearTimeout);
  }, []);

  return (
    <div
      className="relative w-full h-full font-grotesk flex flex-col"
      style={{ background: T.cream, color: T.ink }}
    >
      <StatusBar />

      <div className="flex-1 flex flex-col items-center justify-center" style={{ padding: "0 8%" }}>
        {/* Receipt card with scan-line animation */}
        <motion.div
          className="relative overflow-hidden"
          style={{
            width: "58%",
            aspectRatio: "3/4",
            background: T.white,
            borderRadius: "4.8cqw",
            boxShadow: `0 24px 60px -28px rgba(14,14,14,0.32), inset 0 0 0 1px rgba(14,14,14,0.06)`,
          }}
          initial={{ scale: 0.94, opacity: 0.7 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          {/* Receipt header */}
          <div
            className="text-center font-bold"
            style={{
              fontSize: "3.6cqw",
              letterSpacing: "0.18em",
              color: T.ink,
              paddingTop: "6%",
            }}
          >
            ALBERTO&apos;S
          </div>
          {/* Body lines */}
          <div className="absolute flex flex-col" style={{ inset: "20% 12% 12%", gap: "4%" }}>
            {[0.7, 0.9, 0.8, 0.85, 0.75, 0.9, 0.6, 0.7, 0.95, 0.65].map((w, i) => (
              <div
                key={i}
                className="rounded-sm"
                style={{ height: "3%", width: `${w * 100}%`, background: "rgba(14,14,14,0.18)" }}
              />
            ))}
          </div>
          {/* Scan line */}
          <motion.div
            className="absolute left-0 right-0"
            style={{
              height: "2.5%",
              background: `linear-gradient(180deg, ${T.green}00, ${T.green}, ${T.green}00)`,
              boxShadow: `0 0 24px ${T.green}`,
            }}
            animate={{ top: ["0%", "97%", "0%"] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>

        {/* Caption */}
        <div
          className="font-bold text-center"
          style={{
            fontSize: "5.3cqw",
            letterSpacing: "-0.02em",
            color: T.ink,
            marginTop: "7.2cqw",
          }}
        >
          Reading receipt
        </div>
        <div
          className="text-center"
          style={{
            fontSize: "3.4cqw",
            color: T.gray,
            marginTop: "1.2cqw",
          }}
        >
          10 items detected · subtotal $240.00
        </div>

        {/* Progress chips */}
        <div className="flex items-center" style={{ gap: "2.4cqw", marginTop: "6cqw" }}>
          {steps.map((s, i) => {
            const active = i < done;
            return (
              <div
                key={s}
                className="flex items-center"
                style={{
                  gap: "1.4cqw",
                  padding: "1.7cqw 3.1cqw",
                  borderRadius: "999px",
                  background: active ? "rgba(2,213,124,0.16)" : T.white,
                  border: `1px solid ${active ? "rgba(2,213,124,0.4)" : "rgba(14,14,14,0.08)"}`,
                  fontSize: "3.1cqw",
                  fontWeight: 600,
                  color: active ? "#0a8c54" : T.gray,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  transition: "all 0.3s",
                }}
              >
                <span
                  className="rounded-full grid place-items-center"
                  style={{
                    width: "2.6cqw",
                    height: "2.6cqw",
                    background: active ? T.green : "rgba(14,14,14,0.15)",
                    color: "#fff",
                    fontSize: "1.9cqw",
                  }}
                >
                  {active ? "✓" : ""}
                </span>
                {s}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// 3. Items — matches Figma: gray "+" / red "−", per-item avatar
// NPCs hold off until user makes their first claim
// ─────────────────────────────────────────────────────────────────

function ItemsScreen({ state, dispatch }: RouterProps) {
  const userHasClaimed = useMemo(
    () => Object.values(state.claims).some((ds) => ds.includes("you")),
    [state.claims],
  );

  // Latch: once true, never resets while on this screen.
  const [npcStarted, setNpcStarted] = useState(false);
  useEffect(() => {
    if (userHasClaimed) setNpcStarted(true);
  }, [userHasClaimed]);

  // Fire the NPC claim sequence exactly once when the latch flips.
  useEffect(() => {
    if (!npcStarted) return;
    const timeouts = NPC_CLAIMS.map((c) =>
      setTimeout(() => {
        dispatch({ type: "NPC_CLAIM", itemId: c.itemId, diner: c.diner });
      }, c.delayMs),
    );
    return () => timeouts.forEach(clearTimeout);
  }, [npcStarted, dispatch]);

  // Reactive NPC behavior — when the user claims a shareable item solo,
  // an NPC pops on a few seconds later so the split modal actually fires.
  // Track which items have already been "responded to" to avoid duplicates.
  const respondedRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    const timeouts: ReturnType<typeof setTimeout>[] = [];
    for (const item of ITEMS) {
      if (!item.shareable) continue;
      const claimedBy = state.claims[item.id] ?? [];
      // Only respond once per item; only when user is alone on it
      if (
        claimedBy.length === 1 &&
        claimedBy[0] === "you" &&
        !respondedRef.current.has(item.id)
      ) {
        respondedRef.current.add(item.id);
        // Only ~55% of solo claims get an NPC response, so sometimes
        // shared items stay yours — feels more natural than "always".
        if (Math.random() > 0.55) continue;
        const npcs = (["maya", "sam", "jake"] as Diner[]).filter(
          (d) => !claimedBy.includes(d),
        );
        if (npcs.length === 0) continue;
        const npc = npcs[Math.floor(Math.random() * npcs.length)];
        // Near-instant — friend "joins" you on this item right after you tap.
        timeouts.push(
          setTimeout(() => {
            dispatch({ type: "NPC_CLAIM", itemId: item.id, diner: npc });
          }, 250),
        );
      }
    }
    return () => timeouts.forEach(clearTimeout);
  }, [state.claims, dispatch]);

  const yourClaims = useMemo(
    () => Object.values(state.claims).filter((ds) => ds.includes("you")).length,
    [state.claims],
  );
  const yourSubtotal = shareForDiner(state.claims, state.customSplits, "you");

  const sections: Item["section"][] = ["appetizers", "entrees", "drinks"];
  const sectionLabel: Record<Item["section"], { icon: string; label: string }> = {
    appetizers: { icon: "🥨", label: "Appetizers" },
    entrees: { icon: "🍽", label: "Entrees" },
    drinks: { icon: "🥂", label: "Drinks" },
  };

  return (
    <div
      className="relative w-full h-full font-grotesk flex flex-col"
      style={{ background: T.cream, color: T.ink }}
    >
      <StatusBar />

      {/* Header */}
      <div className="flex items-center justify-between" style={{ padding: "3.4cqw 8.4cqw 5cqw" }}>
        <div className="flex items-center" style={{ gap: "5cqw" }}>
          <span style={{ fontSize: "6.7cqw" }}>❮</span>
          <span className="font-bold" style={{ fontSize: "7.4cqw", letterSpacing: "-0.02em" }}>
            Select Items
          </span>
        </div>
        <button
          onClick={() => dispatch({ type: "TOGGLE_CURRENCY_PICKER" })}
          className="flex items-center font-semibold transition active:scale-95"
          style={{
            background: T.white,
            border: "1px solid rgba(14,14,14,0.08)",
            borderRadius: "999px",
            padding: "2.4cqw 5cqw",
            fontSize: "4.1cqw",
            gap: "1.7cqw",
            color: T.ink,
          }}
        >
          {state.currency} <span style={{ fontSize: "70%" }}>▾</span>
        </button>
      </div>
      <div style={{ borderTop: "1px solid rgba(14,14,14,0.08)" }} />

      {/* Hint when you haven't claimed yet */}
      {!userHasClaimed && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
          style={{
            background: T.accent,
            color: T.white,
            fontSize: "2.4cqw",
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            fontWeight: 600,
            padding: "1cqw 0",
          }}
        >
          tap an item to claim · friends claim after you
        </motion.div>
      )}

      {/* List */}
      <div className="flex-1 overflow-y-auto no-scrollbar" style={{ padding: "1.7cqw 5cqw" }}>
        {sections.map((s) => {
          const items = ITEMS.filter((i) => i.section === s);
          return (
            <div key={s}>
              <div
                className="flex items-center"
                style={{
                  gap: "2.5cqw",
                  color: T.gray,
                  fontSize: "4.3cqw",
                  marginTop: "4.2cqw",
                  marginBottom: "0.8cqw",
                  fontWeight: 500,
                }}
              >
                <span>{sectionLabel[s].icon}</span>
                <span>{sectionLabel[s].label}</span>
              </div>
              {items.map((item) => {
                const claimedBy = state.claims[item.id] ?? [];
                const youClaimed = claimedBy.includes("you");
                const othersOnIt = claimedBy.filter((d) => d !== "you").length;
                const onTap = () => {
                  if (youClaimed) {
                    // Already claimed → unclaim directly (also drops customSplit)
                    dispatch({ type: "TOGGLE_CLAIM", itemId: item.id, diner: "you" });
                  } else if (item.shareable && othersOnIt > 0) {
                    // Joining an item someone else already has → ask how to split
                    dispatch({ type: "OPEN_SPLIT", itemId: item.id });
                  } else {
                    // First claimer (whether shareable or not) → just take it
                    dispatch({ type: "TOGGLE_CLAIM", itemId: item.id, diner: "you" });
                  }
                };
                return (
                  <ItemRow
                    key={item.id}
                    item={item}
                    claimedBy={claimedBy}
                    customSplit={state.customSplits[item.id]}
                    currency={state.currency}
                    onToggle={onTap}
                  />
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Pay pill — sized to match the Continue pill on Itemized/Tip */}
      <div style={{ padding: "2.4cqw 10.1cqw 5cqw" }}>
        <button
          disabled={yourClaims === 0}
          onClick={() => dispatch({ type: "GOTO", screen: "tip" })}
          className="w-full text-center font-bold transition active:scale-95"
          style={{
            borderRadius: "999px",
            padding: "3.4cqw 0",
            fontSize: "3.4cqw",
            background: yourClaims === 0 ? "rgba(14,14,14,0.12)" : T.ink,
            color: yourClaims === 0 ? "rgba(14,14,14,0.4)" : T.cream,
            cursor: yourClaims === 0 ? "not-allowed" : "pointer",
          }}
        >
          {yourClaims === 0
            ? "Tap an item to claim"
            : `Pay ${fmt(yourSubtotal, state.currency)}`}
        </button>
      </div>

      {/* ───────── Currency picker overlay ───────── */}
      {state.currencyOpen && (
        <CurrencyPicker
          current={state.currency}
          onPick={(c) => dispatch({ type: "SET_CURRENCY", currency: c })}
          onClose={() => dispatch({ type: "TOGGLE_CURRENCY_PICKER" })}
        />
      )}

      {/* ───────── Split modal overlay ───────── */}
      {state.splitModal && (
        <SplitModal state={state} dispatch={dispatch} />
      )}
    </div>
  );
}

// Choose Split / Custom Split — bottom sheet over the items screen.
// Custom split is a wheel: denominator is fixed at the table size
// (4 diners), numerator is the user-pickable portion (1..3 of 4).
const TABLE_SIZE = 4;

function SplitModal({
  state,
  dispatch,
}: {
  state: State;
  dispatch: React.Dispatch<Action>;
}) {
  const modal = state.splitModal!;
  const item = ITEMS.find((i) => i.id === modal.itemId)!;
  const lineTotal = (item.qty ?? 1) * item.price;
  const subtitle = `${item.qty && item.qty > 1 ? `${item.qty}× ` : ""}${item.name} — ${fmt(lineTotal)}`;
  const claimedBy = state.claims[modal.itemId] ?? [];
  const evenShare = lineTotal / Math.max(1, claimedBy.length + (claimedBy.includes("you") ? 0 : 1));
  // For custom split, tempDenom now means the *numerator* (1..3) since
  // the denominator is fixed at TABLE_SIZE.
  const numerator = Math.min(Math.max(modal.tempDenom, 1), TABLE_SIZE - 1);
  const customShare = (lineTotal * numerator) / TABLE_SIZE;

  // Escape closes the modal — keyboard a11y.
  useEscapeClose(true, () => dispatch({ type: "CLOSE_SPLIT" }));

  return (
    <>
      {/* Tap-out backdrop */}
      <button
        aria-label="Close split modal"
        onClick={() => dispatch({ type: "CLOSE_SPLIT" })}
        className="absolute inset-0 z-20"
        style={{ background: "rgba(14,14,14,0.45)" }}
      />

      {/* Sheet */}
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 220, damping: 28 }}
        className="absolute left-0 right-0 bottom-0 z-30 flex flex-col"
        style={{
          background: T.ink,
          color: T.white,
          borderTopLeftRadius: "7.2cqw",
          borderTopRightRadius: "7.2cqw",
          padding: "6cqw 7.2cqw 6cqw",
          boxShadow: "0 -20px 40px -10px rgba(0,0,0,0.45)",
        }}
      >
        {/* sheet handle */}
        <span
          className="absolute left-1/2 -translate-x-1/2"
          style={{
            top: "1.7cqw",
            width: "12%",
            height: "0.8cqw",
            background: "rgba(255,255,255,0.18)",
            borderRadius: "999px",
          }}
        />

        {/* Header */}
        <div
          className="flex items-center justify-center relative"
          style={{ marginTop: "3.1cqw" }}
        >
          {modal.phase === "custom" && (
            <button
              onClick={() => dispatch({ type: "GOTO_SPLIT_PHASE", phase: "choose" })}
              className="absolute left-0 grid place-items-center font-bold rounded-full"
              style={{
                top: "50%",
                transform: "translateY(-50%)",
                background: "rgba(255,255,255,0.1)",
                color: T.white,
                width: "8%",
                aspectRatio: "1",
                fontSize: "3.1cqw",
              }}
            >
              ❮
            </button>
          )}
          <span className="font-bold" style={{ fontSize: "4.8cqw" }}>
            {modal.phase === "choose" ? "Choose Split" : "Add Split Amount"}
          </span>
          <button
            onClick={() => dispatch({ type: "CLOSE_SPLIT" })}
            className="absolute right-0 grid place-items-center font-bold rounded-full"
            style={{
              top: "50%",
              transform: "translateY(-50%)",
              background: "rgba(255,255,255,0.1)",
              color: T.white,
              width: "8%",
              aspectRatio: "1",
              fontSize: "3.1cqw",
            }}
          >
            ×
          </button>
        </div>

        {/* Subtitle (item) */}
        <div
          className="text-center"
          style={{ fontSize: "3.4cqw", color: "rgba(248,244,240,0.6)", marginTop: "1.8cqw" }}
        >
          {subtitle}
        </div>

        {modal.phase === "choose" ? (
          <>
            <div className="flex flex-col" style={{ gap: "2.2cqw", marginTop: "6cqw" }}>
              <button
                onClick={() => dispatch({ type: "APPLY_SPLIT_EVENLY" })}
                className="w-full font-bold transition active:scale-95"
                style={{
                  padding: "4.1cqw 0",
                  fontSize: "3.6cqw",
                  borderRadius: "999px",
                  background: T.greenDark,
                  border: `1.5px solid ${T.green}`,
                  color: T.white,
                }}
              >
                Split Evenly
              </button>
              <button
                onClick={() => dispatch({ type: "GOTO_SPLIT_PHASE", phase: "custom" })}
                className="w-full font-bold transition active:scale-95"
                style={{
                  padding: "4.1cqw 0",
                  fontSize: "3.6cqw",
                  borderRadius: "999px",
                  background: T.charcoal,
                  border: "1.5px solid transparent",
                  color: T.white,
                }}
              >
                Custom Split
              </button>
            </div>

            <div className="flex-1" />
            <button
              onClick={() => dispatch({ type: "APPLY_SPLIT_EVENLY" })}
              className="w-full font-bold transition active:scale-95"
              style={{
                marginTop: "4.8cqw",
                borderRadius: "999px",
                padding: "4.8cqw 0",
                fontSize: "3.8cqw",
                background: T.green,
                color: T.ink,
                boxShadow: "0 14px 32px -14px rgba(2,213,124,0.6)",
              }}
            >
              My Split Amount {fmt(evenShare)}
            </button>
          </>
        ) : (
          <>
            {/* Wheel picker — fixed denominator (table size) on the right,
                numerator wheel on the left. Tap ▲/▼ or any visible row. */}
            <div
              className="flex items-center justify-center"
              style={{ gap: "6cqw", marginTop: "6cqw" }}
            >
              <NumeratorWheel
                value={numerator}
                max={TABLE_SIZE - 1}
                onChange={(n) => dispatch({ type: "SET_TEMP_DENOM", denom: n })}
              />
              <span
                className="font-grotesk font-bold"
                style={{ fontSize: "9.6cqw", color: "rgba(255,255,255,0.5)" }}
              >
                /
              </span>
              <span
                className="font-grotesk font-bold"
                style={{ fontSize: "9.6cqw", color: T.white }}
              >
                {TABLE_SIZE}
              </span>
            </div>

            <div
              className="text-center"
              style={{ fontSize: "3.1cqw", color: "rgba(248,244,240,0.55)", marginTop: "3.6cqw", letterSpacing: "0.02em" }}
            >
              You take {numerator}/{TABLE_SIZE} of {fmt(lineTotal)}
            </div>

            <div className="flex-1" />
            <button
              onClick={() => dispatch({ type: "APPLY_CUSTOM_SPLIT" })}
              className="w-full font-bold transition active:scale-95"
              style={{
                marginTop: "4.8cqw",
                borderRadius: "999px",
                padding: "4.8cqw 0",
                fontSize: "3.8cqw",
                background: T.green,
                color: T.ink,
                boxShadow: "0 14px 32px -14px rgba(2,213,124,0.6)",
              }}
            >
              My Split Amount {fmt(customShare)}
            </button>
          </>
        )}
      </motion.div>
    </>
  );
}

// Tiny currency picker that pops up when the USD ▾ pill is tapped.
function CurrencyPicker({
  current,
  onPick,
  onClose,
}: {
  current: Currency;
  onPick: (c: Currency) => void;
  onClose: () => void;
}) {
  const opts: { code: Currency; name: string }[] = [
    { code: "USD", name: "US Dollar" },
    { code: "EUR", name: "Euro" },
    { code: "GBP", name: "Pound Sterling" },
    { code: "JPY", name: "Japanese Yen" },
  ];
  // Escape closes the picker — keyboard a11y.
  useEscapeClose(true, onClose);
  return (
    <>
      <button
        aria-label="Close currency picker"
        onClick={onClose}
        className="absolute inset-0 z-20"
        style={{ background: "rgba(14,14,14,0.35)" }}
      />
      <motion.div
        initial={{ opacity: 0, y: -8, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
        className="absolute z-30"
        style={{
          top: "12cqw",
          right: "6cqw",
          background: T.white,
          borderRadius: "3.6cqw",
          padding: "1.7cqw",
          boxShadow: "0 14px 30px -10px rgba(14,14,14,0.35)",
          border: "1px solid rgba(14,14,14,0.06)",
          minWidth: "44%",
        }}
      >
        {opts.map((o) => {
          const active = current === o.code;
          return (
            <button
              key={o.code}
              onClick={() => onPick(o.code)}
              className="w-full flex items-center justify-between transition active:scale-95"
              style={{
                gap: "2.4cqw",
                padding: "2.9cqw 3.4cqw",
                borderRadius: "2.4cqw",
                background: active ? "rgba(2,213,124,0.14)" : "transparent",
                color: T.ink,
              }}
            >
              <span className="font-bold tabular-nums" style={{ fontSize: "4.1cqw" }}>
                {CURRENCY_SYMBOL[o.code]} {o.code}
              </span>
              <span style={{ fontSize: "2.9cqw", color: T.gray }}>{o.name}</span>
              {active && <span style={{ color: T.green, fontSize: "3.6cqw" }}>✓</span>}
            </button>
          );
        })}
      </motion.div>
    </>
  );
}

// iOS-style picker wheel for the custom-split numerator. Renders the
// previous, current, next options as a vertical stack with the centered
// row highlighted in green. Tap above/below to step.
function NumeratorWheel({
  value,
  max,
  onChange,
}: {
  value: number;
  max: number;
  onChange: (n: number) => void;
}) {
  const above = value > 1 ? value - 1 : null;
  const below = value < max ? value + 1 : null;

  return (
    <div className="flex flex-col items-center" style={{ gap: "1.9cqw" }}>
      <button
        onClick={() => above !== null && onChange(above)}
        disabled={above === null}
        className="font-grotesk font-bold tabular-nums transition"
        style={{
          fontSize: "4.8cqw",
          color: above !== null ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.12)",
          padding: "1.2cqw 0",
        }}
      >
        {above ?? "—"}
      </button>
      <div
        className="font-grotesk font-bold tabular-nums grid place-items-center"
        style={{
          fontSize: "9.6cqw",
          color: T.white,
          background: T.greenDark,
          border: `1.5px solid ${T.green}`,
          borderRadius: "3.6cqw",
          width: "19.2cqw",
          height: "19.2cqw",
        }}
      >
        {value}
      </div>
      <button
        onClick={() => below !== null && onChange(below)}
        disabled={below === null}
        className="font-grotesk font-bold tabular-nums transition"
        style={{
          fontSize: "4.8cqw",
          color: below !== null ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.12)",
          padding: "1.2cqw 0",
        }}
      >
        {below ?? "—"}
      </button>
    </div>
  );
}

function ItemRow({
  item,
  claimedBy,
  customSplit,
  currency,
  onToggle,
}: {
  item: Item;
  claimedBy: Diner[];
  customSplit?: { num: number; denom: number };
  currency: Currency;
  onToggle: () => void;
}) {
  const youClaimed = claimedBy.includes("you");
  const lineTotal = (item.qty ?? 1) * item.price;
  const shared = claimedBy.length > 1;

  let subtitle: string | null = null;
  if (youClaimed && customSplit) {
    subtitle = `you ${customSplit.num}/${customSplit.denom} · ${fmt((lineTotal * customSplit.num) / customSplit.denom, currency)}`;
  } else if (shared) {
    subtitle = `${claimedBy.length} people splitting`;
  }

  return (
    <button
      onClick={onToggle}
      className="w-full flex items-center text-left transition active:scale-[0.99]"
      style={{
        gap: "3cqw",
        padding: "3.4cqw 0",
      }}
    >
      <ItemAvatar claimedBy={claimedBy} />
      <span className="flex-1 min-w-0">
        <span
          className="block font-medium"
          style={{
            fontSize: "4.4cqw",
            letterSpacing: "-0.01em",
            lineHeight: 1.2,
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            wordBreak: "break-word",
          }}
        >
          {item.qty && item.qty > 1 ? `${item.qty}× ` : ""}
          {item.name}
        </span>
        {subtitle && (
          <span
            className="block"
            style={{
              fontSize: "2.9cqw",
              color: "#0a8c54",
              fontWeight: 500,
              marginTop: "0.5cqw",
              letterSpacing: "0.01em",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {subtitle}
          </span>
        )}
      </span>
      <span
        className="tabular-nums whitespace-nowrap text-right"
        style={{
          fontSize: "4.1cqw",
          color: youClaimed ? T.ink : T.gray,
          minWidth: "18cqw",
          flexShrink: 0,
          fontVariantNumeric: "tabular-nums",
          fontWeight: youClaimed ? 700 : 500,
        }}
      >
        {fmt(lineTotal, currency)}
      </span>
    </button>
  );
}

function ItemAvatar({ claimedBy }: { claimedBy: Diner[] }) {
  if (claimedBy.length === 0) {
    return (
      <span
        className="aspect-square rounded-full flex items-center justify-center"
        style={{ width: "8%", background: "rgba(14,14,14,0.08)" }}
      >
        <span style={{ fontSize: "3.4cqw", color: T.gray }}>·</span>
      </span>
    );
  }
  if (claimedBy.length === 1) {
    const d = claimedBy[0];
    return (
      <motion.span
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="aspect-square rounded-full grid place-items-center font-bold"
        style={{
          width: "8%",
          background: DINERS[d].color,
          color: d === "you" ? T.white : T.ink,
          fontSize: "3cqw",
        }}
      >
        {DINERS[d].initials}
      </motion.span>
    );
  }
  // Stacked when multiple, with green corner badge for "shared"
  return (
    <span className="relative" style={{ width: "8%", aspectRatio: "1" }}>
      <span className="flex w-full h-full">
        {claimedBy.slice(0, 3).map((d, i) => (
          <motion.span
            key={d}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="absolute aspect-square rounded-full grid place-items-center font-bold"
            style={{
              width: "100%",
              left: `${i * -22}%`,
              zIndex: 5 - i,
              background: DINERS[d].color,
              color: d === "you" ? T.white : T.ink,
              fontSize: "2.9cqw",
              border: `1.5px solid ${T.cream}`,
            }}
          >
            {DINERS[d].initials}
          </motion.span>
        ))}
      </span>
    </span>
  );
}

function PlusMinusDot({ active }: { active: boolean }) {
  return (
    <motion.span
      key={active ? "minus" : "plus"}
      initial={{ scale: 0.7 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 320, damping: 18 }}
      className="aspect-square rounded-full grid place-items-center font-bold transition"
      style={{
        width: "6.5%",
        background: active ? T.red : T.graySoft,
        color: active ? "#fff" : "rgba(14,14,14,0.45)",
        fontSize: "5cqw",
        lineHeight: 1,
      }}
    >
      {active ? "−" : "+"}
    </motion.span>
  );
}

// ─────────────────────────────────────────────────────────────────
// 4. Tip — modal sheet over a faded items page
// ─────────────────────────────────────────────────────────────────

function TipScreen({ state, dispatch, yourSubtotal, tip, tax, yourTotal }: RouterProps) {
  const tips: { label: string; pct: 10 | 15 | 18 | 20 | "custom" }[] = [
    { label: "10%", pct: 10 },
    { label: "15%", pct: 15 },
    { label: "18%", pct: 18 },
    { label: "20%", pct: 20 },
    { label: "Custom", pct: "custom" },
  ];

  return (
    <div
      className="relative w-full h-full font-grotesk flex flex-col"
      style={{ background: T.cream, color: T.ink }}
    >
      <StatusBar />

      {/* Faded items behind modal */}
      <div style={{ opacity: 0.35 }}>
        <div className="flex items-center justify-between" style={{ padding: "3.4cqw 8.4cqw 5cqw" }}>
          <div className="flex items-center" style={{ gap: "5cqw" }}>
            <span style={{ fontSize: "6.7cqw" }}>❮</span>
            <span className="font-bold" style={{ fontSize: "7.4cqw", letterSpacing: "-0.02em" }}>
              Select Items
            </span>
          </div>
          <span
            className="flex items-center font-semibold"
            style={{
              background: T.white,
              borderRadius: "999px",
              padding: "2.4cqw 5cqw",
              fontSize: "4.1cqw",
              gap: "1.7cqw",
            }}
          >
            USD <span style={{ fontSize: "70%" }}>▾</span>
          </span>
        </div>
        <div style={{ padding: "1.7cqw 8.4cqw" }}>
          <div style={{ color: T.gray, fontSize: "4.3cqw", marginTop: "3.4cqw" }}>🥨 Appetizers</div>
          <div className="flex items-center" style={{ gap: "5cqw", marginTop: "3.4cqw" }}>
            <span
              className="aspect-square rounded-full"
              style={{ width: "8%", background: T.accent }}
            />
            <span className="flex-1" style={{ fontSize: "5cqw", fontWeight: 500 }}>
              Spinach Artichoke Dip
            </span>
            <span style={{ fontSize: "4.7cqw", color: T.gray }}>$14.00</span>
          </div>
        </div>
      </div>

      {/* Modal sheet — height follows content so there's no empty
          dark space below the Pay button. Bottom corners match the
          phone's rounded frame so the sheet looks flush with the edges. */}
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 28 }}
        className="absolute left-0 right-0 bottom-0 flex flex-col"
        style={{
          background: T.ink,
          color: T.white,
          borderTopLeftRadius: "10.1cqw",
          borderTopRightRadius: "10.1cqw",
          padding: "5cqw 8cqw 9cqw",
          boxShadow: "0 -20px 40px -10px rgba(0,0,0,0.45)",
        }}
      >
        {/* sheet handle */}
        <span
          className="absolute left-1/2 -translate-x-1/2"
          style={{
            top: "2cqw",
            width: "12%",
            height: "1cqw",
            background: "rgba(255,255,255,0.18)",
            borderRadius: "999px",
          }}
        />

        {/* title row */}
        <div className="flex items-center justify-center relative" style={{ marginTop: "3cqw" }}>
          <span className="font-bold" style={{ fontSize: "5.6cqw" }}>Add Tip</span>
          <button
            onClick={() => dispatch({ type: "GOTO", screen: "items" })}
            className="absolute right-0 grid place-items-center font-bold rounded-full"
            style={{
              top: "50%",
              transform: "translateY(-50%)",
              background: "rgba(255,255,255,0.1)",
              color: T.white,
              width: "8%",
              aspectRatio: "1",
              fontSize: "3.8cqw",
            }}
          >
            ×
          </button>
        </div>

        {/* tip pills — tighter padding and gap */}
        <div className="flex flex-col" style={{ gap: "1.8cqw", marginTop: "4cqw" }}>
          {tips.map((t) => {
            const selected = state.tipPct === t.pct;
            return (
              <button
                key={t.label}
                onClick={() => dispatch({ type: "SET_TIP", pct: t.pct })}
                className="w-full flex items-center justify-center font-bold transition active:scale-95"
                style={{
                  padding: "3.6cqw 0",
                  fontSize: "4.2cqw",
                  borderRadius: "999px",
                  background: selected ? T.greenDark : T.charcoal,
                  border: `1.5px solid ${selected ? T.green : "transparent"}`,
                  color: T.white,
                }}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        {/* totals */}
        <div
          style={{
            marginTop: "4cqw",
            display: "flex",
            flexDirection: "column",
            gap: "1.4cqw",
            fontSize: "3.6cqw",
          }}
        >
          <Line k="Subtotal" v={fmt(yourSubtotal)} />
          <Line k="Tip" v={fmt(tip)} accent />
          <Line k="Tax (8.25%)" v={fmt(tax)} />
          <Line k="Total" v={fmt(yourTotal)} bold />
        </div>

        {/* big green pay pill (Figma) */}
        <button
          onClick={() => dispatch({ type: "GOTO", screen: "payment" })}
          className="w-full font-bold transition active:scale-95"
          style={{
            marginTop: "5cqw",
            borderRadius: "999px",
            padding: "5cqw 0",
            fontSize: "4.5cqw",
            background: T.green,
            color: T.ink,
            boxShadow: "0 14px 32px -14px rgba(2,213,124,0.6)",
          }}
        >
          Pay {fmt(yourTotal)}
        </button>
      </motion.div>
    </div>
  );
}

function Line({ k, v, bold, accent }: { k: string; v: string; bold?: boolean; accent?: boolean }) {
  return (
    <div
      className="flex justify-between"
      style={{
        color: bold ? T.white : "rgba(248,244,240,0.65)",
        fontWeight: bold ? 600 : 400,
      }}
    >
      <span>{k}</span>
      <span className="tabular-nums" style={{ color: accent ? T.green : undefined }}>
        {v}
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// 5. Payment Methods — featured Wallet card with toggle, then list
// ─────────────────────────────────────────────────────────────────

function PaymentScreen({ state, dispatch, yourTotal }: RouterProps) {
  const groupOrder: PaymentMethod["group"][] = ["bank", "card", "conn"];
  const groupMeta: Record<PaymentMethod["group"], { icon: string; label: string }> = {
    bank: { icon: "", label: "Bank Accounts" },
    card: { icon: "", label: "Cards" },
    conn: { icon: "", label: "Connections · Coming later" },
  };

  const canPay = state.walletOn || state.paymentId !== null;
  const goCard = () => dispatch({ type: "GOTO", screen: "card" });

  return (
    <div
      className="relative w-full h-full font-grotesk flex flex-col"
      style={{ background: T.cream, color: T.ink }}
    >
      <StatusBar />

      {/* Header */}
      <div className="flex items-center justify-between" style={{ padding: "3.4cqw 8.4cqw 5cqw" }}>
        <div className="flex items-center" style={{ gap: "5cqw" }}>
          <button onClick={() => dispatch({ type: "GOTO", screen: "tip" })} style={{ fontSize: "6.7cqw" }}>
            ❮
          </button>
          <span className="font-bold" style={{ fontSize: "7.4cqw", letterSpacing: "-0.02em" }}>
            Payment Methods
          </span>
        </div>
        <span
          className="font-semibold flex items-center"
          style={{
            background: T.ink,
            color: T.cream,
            borderRadius: "999px",
            padding: "1.4cqw 3.4cqw",
            fontSize: "2.9cqw",
            gap: "1cqw",
          }}
        >
          ＋ Add
        </span>
      </div>

      {/* Featured Wallet card with toggle */}
      <div style={{ padding: "0 8.4cqw" }}>
        <div
          className="flex items-center"
          style={{
            background: T.white,
            borderRadius: "5.9cqw",
            padding: "5cqw",
            gap: "5cqw",
            border: "1px solid rgba(14,14,14,0.05)",
          }}
        >
          <WalletGraphic />
          <div className="flex-1">
            <div className="font-bold" style={{ fontSize: "5.4cqw" }}>Wallet</div>
            <div style={{ fontSize: "4.1cqw", color: T.gray }}>Balance: $85.32</div>
          </div>
          <Toggle on={state.walletOn} onClick={() => dispatch({ type: "TOGGLE_WALLET" })} />
        </div>
      </div>

      {/* Method list */}
      <div className="flex-1 overflow-y-auto no-scrollbar" style={{ padding: "0 8.4cqw" }}>
        {groupOrder.map((g) => {
          const methods = PAYMENT_METHODS.filter((m) => m.group === g);
          return (
            <div key={g} style={{ marginTop: "5cqw" }}>
              <div
                className="font-medium text-left"
                style={{
                  color: T.gray,
                  fontSize: "4.3cqw",
                  marginBottom: "0.7cqw",
                }}
              >
                {groupMeta[g].label}
              </div>
              {methods.map((m) => {
                const selected = !state.walletOn && state.paymentId === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => dispatch({ type: "PICK_PAYMENT", id: m.id })}
                    className="w-full flex items-center transition active:scale-[0.99]"
                    style={{
                      gap: "5cqw",
                      padding: "4.1cqw 0",
                    }}
                  >
                    <span
                      className="aspect-square rounded-full grid place-items-center font-bold"
                      style={{
                        width: "10%",
                        background: m.logoBg,
                        color: m.logoColor ?? "#fff",
                        fontSize: "3.7cqw",
                      }}
                    >
                      {m.logo}
                    </span>
                    <span className="flex-1 text-left font-medium" style={{ fontSize: "4.7cqw" }}>
                      {m.name}
                    </span>
                    <span style={{ fontSize: "4.1cqw", color: T.gray, marginRight: "3.4cqw" }}>
                      {m.meta}
                    </span>
                    <Checkdot on={selected} />
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Pay button */}
      <div style={{ padding: "3.4cqw 10.1cqw 5cqw" }}>
        <button
          disabled={!canPay}
          onClick={goCard}
          className="w-full text-center font-bold transition active:scale-95"
          style={{
            borderRadius: "999px",
            padding: "4.4cqw 0",
            fontSize: "4cqw",
            background: !canPay ? "rgba(14,14,14,0.12)" : T.accent,
            color: !canPay ? "rgba(14,14,14,0.4)" : "#fff",
            cursor: !canPay ? "not-allowed" : "pointer",
            boxShadow: canPay ? "0 14px 32px -14px rgba(255,124,97,0.6)" : "none",
          }}
        >
          {!canPay ? "Pick a method to continue" : `Pay ${fmt(yourTotal)}`}
        </button>
      </div>

      {/* Bottom nav */}
      <BottomNav active="card" dispatch={dispatch} />
    </div>
  );
}

function WalletGraphic() {
  return (
    <span
      className="relative shrink-0 grid place-items-center overflow-hidden"
      style={{
        width: "22%",
        aspectRatio: "3/2",
        borderRadius: "12%",
        background: `linear-gradient(135deg, ${T.peachSoft} 0%, #ead2c4 100%)`,
      }}
    >
      <span
        className="absolute rounded-full"
        style={{
          top: "12%",
          left: "10%",
          width: "30%",
          aspectRatio: "1",
          background: T.accent,
        }}
      />
      <span
        className="absolute font-extrabold"
        style={{
          right: "10%",
          bottom: "10%",
          fontSize: "3.7cqw",
          color: T.ink,
          letterSpacing: "-0.02em",
        }}
      >
        VISA
      </span>
    </span>
  );
}

function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="relative shrink-0 transition"
      style={{
        width: "16%",
        height: "8%",
        minHeight: "16px",
        borderRadius: "999px",
        background: on ? T.green : T.graySoft,
      }}
      aria-pressed={on}
    >
      <motion.span
        className="absolute aspect-square rounded-full bg-white"
        style={{ top: "10%", height: "80%" }}
        animate={{ left: on ? "44%" : "6%" }}
        transition={{ type: "spring", stiffness: 350, damping: 28 }}
      />
    </button>
  );
}

function Checkdot({ on }: { on: boolean }) {
  return (
    <span
      className="aspect-square rounded-full grid place-items-center font-bold"
      style={{
        width: "6.5%",
        background: on ? T.green : "transparent",
        border: on ? "none" : `2px solid ${T.graySoft}`,
        color: "#fff",
        fontSize: "4.1cqw",
      }}
    >
      {on ? "✓" : ""}
    </span>
  );
}

function BottomNavIcon({ id }: { id: "home" | "people" | "scan" | "card" | "settings" }) {
  // Monochrome stroke icons — inherit currentColor so active/inactive
  // shows via the parent button's color value. Style references the
  // line-icon set used in the Tabby Figma bottom ribbon.
  const common = {
    width: "5.6cqw",
    height: "5.6cqw",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  switch (id) {
    case "home":
      return (
        <svg {...common}>
          <path d="M3 11 12 3l9 8v9a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1v-9z" />
        </svg>
      );
    case "people":
      return (
        <svg {...common}>
          <circle cx="9" cy="8" r="3.3" />
          <path d="M2.5 20.5c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6" />
          <circle cx="17" cy="9" r="2.5" />
          <path d="M16 14.6c3.3 0 5.5 2 5.5 4.9" />
        </svg>
      );
    case "scan":
      return (
        <svg {...common}>
          <path d="M3 8V5a1 1 0 0 1 1-1h3" />
          <path d="M17 4h3a1 1 0 0 1 1 1v3" />
          <path d="M21 16v3a1 1 0 0 1-1 1h-3" />
          <path d="M7 20H4a1 1 0 0 1-1-1v-3" />
          <circle cx="12" cy="12" r="3.2" />
        </svg>
      );
    case "card":
      return (
        <svg {...common}>
          <path d="M7 3h10l-.6 18-4.4-2.2L7.6 21 7 3z" />
          <path d="M10 8h4" />
          <path d="M10 12h4" />
          <path d="M10 16h3" />
        </svg>
      );
    case "settings":
      return (
        <svg {...common}>
          <rect x="3.5" y="14" width="3" height="6.5" rx="1" />
          <rect x="10.5" y="9" width="3" height="11.5" rx="1" />
          <rect x="17.5" y="5" width="3" height="15.5" rx="1" />
        </svg>
      );
  }
}

function BottomNav({
  active,
  dispatch,
}: {
  active: "home" | "people" | "scan" | "card" | "settings";
  dispatch: React.Dispatch<Action>;
}) {
  const items: { id: typeof active; label: string; target: Screen }[] = [
    { id: "home", label: "Home", target: "dashboard" },
    { id: "people", label: "People", target: "friends" },
    { id: "scan", label: "Scan", target: "camera" },
    { id: "card", label: "Bill", target: "itemized" },
    { id: "settings", label: "Insights", target: "insights" },
  ];
  return (
    <div
      className="grid"
      style={{
        gridTemplateColumns: "repeat(5, 1fr)",
        borderTop: "1px solid rgba(14,14,14,0.08)",
        padding: "2cqw 1.5cqw 3.6cqw",
        background: T.cream,
      }}
    >
      {items.map((i) => {
        const isActive = i.id === active;
        return (
          <button
            key={i.id}
            type="button"
            onClick={() => dispatch({ type: "GOTO", screen: i.target })}
            aria-label={i.label}
            aria-current={isActive ? "page" : undefined}
            className="relative flex flex-col items-center justify-center transition active:scale-90"
            style={{
              padding: "1.4cqw 0",
              color: isActive ? T.accent : T.ink,
              opacity: isActive ? 1 : 0.55,
            }}
          >
            <BottomNavIcon id={i.id} />
            <span
              style={{
                fontSize: "2.2cqw",
                marginTop: "1cqw",
                fontWeight: isActive ? 700 : 500,
                letterSpacing: "0.04em",
              }}
            >
              {i.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// 6. Card — initiator's Tabby wallet card funding the table pool.
//    The merchant-facing one-time card lives on tabbyCard.
// ─────────────────────────────────────────────────────────────────

function CardScreen({ dispatch, yourTotal }: RouterProps) {
  const [phase, setPhase] = useState<"ready" | "tapping" | "done">("ready");

  const onTap = () => {
    if (phase !== "ready") return;
    setPhase("tapping");
    setTimeout(() => {
      setPhase("done");
      setTimeout(() => dispatch({ type: "GOTO", screen: "pool" }), 700);
    }, 1200);
  };

  return (
    <div
      className="relative w-full h-full font-grotesk overflow-hidden"
      style={{ background: T.charcoal, color: T.white }}
    >
      <StatusBar dark />

      {/* Instruction above the card */}
      {phase === "ready" && (
        <motion.span
          className="absolute left-1/2 -translate-x-1/2 uppercase font-bold text-center whitespace-nowrap"
          style={{
            top: "8.5%",
            fontSize: "3.2cqw",
            letterSpacing: "0.24em",
            color: T.white,
          }}
          animate={{ opacity: [0.55, 1, 0.55] }}
          transition={{ duration: 1.6, repeat: Infinity }}
        >
          ↓ tap to fund the pool
        </motion.span>
      )}

      {/* Tabby-branded wallet card — your share into the pool. Positioning
          is on a wrapper; the motion.button handles only scale/opacity so
          framer-managed transforms don't clobber the centering translate. */}
      <div
        className="absolute left-1/2 -translate-x-1/2"
        style={{ top: "16%", width: "84%" }}
      >
      <motion.button
        onClick={onTap}
        initial={{ scale: 0.92, opacity: 0, rotateX: -10 }}
        animate={{ scale: 1, opacity: 1, rotateX: 0 }}
        transition={{ type: "spring", stiffness: 220, damping: 20 }}
        className="block w-full cursor-pointer overflow-hidden text-left relative"
        style={{
          aspectRatio: "1.55/1",
          background: `linear-gradient(135deg, ${T.accent} 0%, #FF5C3A 60%, ${T.ink} 100%)`,
          borderRadius: "8.4cqw",
          boxShadow: `0 30px 60px -20px ${T.accent}99, 0 0 0 1px rgba(255,255,255,0.12) inset`,
          color: T.cream,
        }}
      >
        {/* Diagonal sheen */}
        <span
          aria-hidden
          className="absolute pointer-events-none"
          style={{
            top: "-30%",
            right: "-12%",
            width: "55%",
            height: "160%",
            background: "rgba(255,255,255,0.07)",
            transform: "rotate(20deg)",
          }}
        />

        {/* Top row: chip + brand */}
        <div
          className="absolute flex items-center justify-between"
          style={{ top: "5cqw", left: "6cqw", right: "6cqw" }}
        >
          <span
            aria-hidden
            style={{
              width: "10cqw",
              height: "7.6cqw",
              borderRadius: "1.4cqw",
              background:
                "linear-gradient(135deg, #F5D478, #C49A3A 55%, #8A6620)",
              boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.25)",
            }}
          />
          <span
            className="font-extrabold"
            style={{
              fontSize: "5.6cqw",
              lineHeight: 1,
              letterSpacing: "-0.025em",
              color: T.cream,
            }}
          >
            tabby
          </span>
        </div>

        {/* Masked PAN center */}
        <div
          className="absolute font-bold tabular-nums"
          style={{
            left: "6cqw",
            right: "6cqw",
            top: "50%",
            transform: "translateY(-50%)",
            fontSize: "5.2cqw",
            letterSpacing: "0.22em",
            color: "rgba(255,255,255,0.92)",
          }}
        >
          •• •• •• 4419
        </div>

        {/* Bottom row: destination + amount */}
        <div
          className="absolute"
          style={{ left: "6cqw", right: "6cqw", bottom: "5cqw" }}
        >
          <span
            className="block uppercase font-bold"
            style={{
              fontSize: "2.4cqw",
              letterSpacing: "0.22em",
              color: "rgba(255,236,224,0.7)",
            }}
          >
            → Table Pool
          </span>
          <span
            className="block font-bold tabular-nums"
            style={{
              fontSize: "6.4cqw",
              letterSpacing: "-0.02em",
              color: T.cream,
              lineHeight: 1.05,
              marginTop: "0.6cqw",
            }}
          >
            {fmt(yourTotal)}
          </span>
        </div>
      </motion.button>
      </div>

      {/* NFC icon + caption + demo instruction */}
      <div
        className="absolute left-0 right-0 flex flex-col items-center text-center px-6"
        style={{ top: "50%" }}
      >
        <motion.span
          className="grid place-items-center rounded-full border"
          style={{
            width: "18.5cqw",
            height: "18.5cqw",
            borderColor: phase === "tapping" ? T.green : "rgba(255,255,255,0.4)",
            color: phase === "tapping" ? T.green : T.white,
          }}
          animate={
            phase === "tapping"
              ? { scale: [1, 1.15, 1] }
              : { scale: 1 }
          }
          transition={{ duration: 1, repeat: phase === "tapping" ? Infinity : 0 }}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ width: "10.5cqw", height: "10.5cqw" }}
            aria-hidden
          >
            <path d="M4 8.32 a 7.43 7.43 0 0 1 0 7.36" />
            <path d="M7.46 6.21 a 11.76 11.76 0 0 1 0 11.58" />
            <path d="M10.91 4.1 a 15.91 15.91 0 0 1 0 15.8" />
            <path d="M14.37 2 a 20.16 20.16 0 0 1 0 20" />
          </svg>
        </motion.span>
        <span
          className="font-medium block w-full text-center"
          style={{ marginTop: "3.4cqw", fontSize: "5cqw" }}
        >
          {phase === "ready" && "Send your share to the pool"}
          {phase === "tapping" && "Funding pool…"}
          {phase === "done" && "In the pool ✓"}
        </span>
        <span
          className="block w-full text-center"
          style={{
            marginTop: "1.6cqw",
            fontSize: "2.9cqw",
            letterSpacing: "0.04em",
            color: "rgba(255,255,255,0.55)",
            maxWidth: "78%",
            marginLeft: "auto",
            marginRight: "auto",
            lineHeight: 1.45,
          }}
        >
          Funds land in the table pool — nothing hits the merchant yet.
        </span>
      </div>

      {/* Swipe-up cancel */}
      <button
        onClick={() => dispatch({ type: "GOTO", screen: "payment" })}
        className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center"
        style={{
          bottom: "6.7cqw",
          color: "rgba(255,255,255,0.55)",
          fontSize: "4.3cqw",
        }}
      >
        <span>⌃</span>
        <span style={{ marginTop: "1cqw" }}>Swipe up to cancel</span>
      </button>
    </div>
  );
}

function PhoneNFCIllustration({ tapping, done }: { tapping: boolean; done: boolean }) {
  return (
    <span
      className="absolute"
      style={{ left: "8%", bottom: "12%", width: "32%", aspectRatio: "1" }}
    >
      {/* Orange dot behind phone */}
      <span
        className="absolute rounded-full"
        style={{
          left: "20%",
          top: "20%",
          width: "55%",
          aspectRatio: "1",
          background: T.accent,
          opacity: 0.85,
        }}
      />
      {/* NFC arcs (top-left of phone) */}
      <svg
        viewBox="0 0 100 100"
        className="absolute"
        style={{ left: "4%", top: "8%", width: "44%" }}
      >
        {[18, 30, 42].map((r, i) => (
          <motion.path
            key={r}
            d={`M ${50 - r * 0.8} ${50 - r * 0.4} A ${r} ${r} 0 0 1 ${50 - r * 0.8} ${50 + r * 0.4}`}
            fill="none"
            stroke={T.ink}
            strokeWidth="6"
            strokeLinecap="round"
            initial={{ opacity: 0.85 }}
            animate={
              tapping ? { opacity: [0.85, 1, 0.85] } : done ? { opacity: 0.6 } : { opacity: 0.85 }
            }
            transition={{ duration: 0.8, delay: i * 0.15, repeat: tapping ? Infinity : 0 }}
          />
        ))}
      </svg>
      {/* Phone-in-hand silhouette (simple SVG) */}
      <svg
        viewBox="0 0 100 140"
        className="absolute"
        style={{ left: "30%", top: "14%", width: "62%" }}
      >
        {/* hand */}
        <path
          d="M 55 140 L 55 100 Q 30 95 30 78 L 30 30 Q 30 18 42 18 L 70 18 Q 82 18 82 30 L 82 105 Q 82 140 70 140 Z"
          fill={T.ink}
        />
        {/* phone screen highlight */}
        <rect x="38" y="26" width="36" height="62" rx="4" fill="#3a3a3a" />
        <rect x="42" y="32" width="28" height="50" rx="2" fill={T.cream} />
      </svg>
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────
// 6b. Pool — initiator-perspective view: friends' shares pour into
//     the table pool; on full, a one-time virtual Tabby card is minted.
// ─────────────────────────────────────────────────────────────────

const POOL_ORDER: Diner[] = ["you", "maya", "sam", "jake"];

type DinerStatus = "queued" | "tapping" | "paid";

// Coin start positions for the flying-coin animation. These match
// the 2x2 diner grid roughly — tuned by eye since pixel-perfect
// alignment isn't necessary for the visual metaphor to read.
const COIN_START: Record<Diner, { left: string; top: string }> = {
  you:  { left: "26%", top: "76%" },
  maya: { left: "74%", top: "76%" },
  sam:  { left: "26%", top: "90%" },
  jake: { left: "74%", top: "90%" },
};
const RING_CENTER = { left: "50%", top: "32%" };

function PoolScreen({ state, dispatch }: RouterProps) {
  const tipPct = typeof state.tipPct === "number" ? state.tipPct / 100 : 0;
  const billMultiplier = 1 + tipPct + TAX_RATE;

  const dinerTotals = useMemo(
    () =>
      POOL_ORDER.map((d) => ({
        diner: d,
        amount: shareForDiner(state.claims, state.customSplits, d) * billMultiplier,
      })),
    [state.claims, state.customSplits, billMultiplier],
  );
  const billTotal = dinerTotals.reduce((a, b) => a + b.amount, 0);

  // You arrived here straight from the card-tap, so you start as paid.
  const [statuses, setStatuses] = useState<Record<Diner, DinerStatus>>({
    you: "paid",
    maya: "queued",
    sam: "queued",
    jake: "queued",
  });
  const [coins, setCoins] = useState<Array<{ id: string; from: Diner }>>([]);
  const [minted, setMinted] = useState(false);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    const queue: Diner[] = ["maya", "sam", "jake"];
    let t = 700;
    queue.forEach((d) => {
      // Card pulses in tapping state
      timers.push(setTimeout(() => {
        setStatuses((s) => ({ ...s, [d]: "tapping" }));
      }, t));
      // Coin spawns mid-tap and flies to the ring
      timers.push(setTimeout(() => {
        setCoins((c) => [...c, { id: `${d}-${Date.now()}`, from: d }]);
      }, t + 350));
      // Coin "lands" → mark paid, increment ring fill
      timers.push(setTimeout(() => {
        setStatuses((s) => ({ ...s, [d]: "paid" }));
      }, t + 950));
      t += 1250;
    });
    // Mint reveal
    timers.push(setTimeout(() => setMinted(true), t + 250));
    // Auto-route to Tabby card screen
    timers.push(setTimeout(
      () => dispatch({ type: "GOTO", screen: "tabbyCard" }),
      t + 2100,
    ));
    return () => timers.forEach(clearTimeout);
  }, [dispatch]);

  const pooledAmount = dinerTotals
    .filter((d) => statuses[d.diner] === "paid")
    .reduce((a, b) => a + b.amount, 0);
  const pct = billTotal > 0 ? Math.min(100, (pooledAmount / billTotal) * 100) : 0;

  // Ring geometry
  const ringR = 78;
  const ringC = 2 * Math.PI * ringR;
  const dashOffset = ringC * (1 - pct / 100);

  return (
    <div
      className="relative w-full h-full font-grotesk overflow-hidden"
      style={{ background: T.cream, color: T.ink }}
    >
      <StatusBar />

      {/* Header */}
      <div
        className="text-center"
        style={{ paddingTop: "3cqw", paddingBottom: "1cqw" }}
      >
        <span
          className="block uppercase font-bold"
          style={{
            fontSize: "2.7cqw",
            letterSpacing: "0.3em",
            color: T.accent,
          }}
        >
          Table Pool
        </span>
        <span
          className="block font-medium"
          style={{
            fontSize: "3cqw",
            color: T.gray,
            marginTop: "0.6cqw",
            letterSpacing: "0.04em",
          }}
        >
          Alberto&apos;s · Table 12 · 4 diners
        </span>
      </div>

      {/* Ring gauge */}
      <div
        className="absolute"
        style={{
          left: "50%",
          top: RING_CENTER.top,
          transform: "translate(-50%, -50%)",
          width: "62%",
          aspectRatio: "1",
        }}
      >
        {/* Ambient peach glow */}
        <motion.span
          aria-hidden
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            background: `radial-gradient(circle at 50% 50%, ${T.accent}33, transparent 65%)`,
            filter: "blur(10px)",
          }}
          animate={{ opacity: [0.45, 0.85, 0.45] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Progress ring */}
        <svg
          viewBox="0 0 200 200"
          className="absolute inset-0 w-full h-full"
          style={{ overflow: "visible" }}
        >
          <circle
            cx="100"
            cy="100"
            r={ringR}
            fill="none"
            stroke="rgba(14,14,14,0.08)"
            strokeWidth="14"
          />
          <motion.circle
            cx="100"
            cy="100"
            r={ringR}
            fill="none"
            stroke={T.accent}
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={ringC}
            initial={false}
            animate={{ strokeDashoffset: dashOffset }}
            transition={{ type: "spring", stiffness: 90, damping: 22 }}
            transform="rotate(-90 100 100)"
            style={{ filter: `drop-shadow(0 0 6px ${T.accent}80)` }}
          />
        </svg>

        {/* Inner content — counter or virtual card preview */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <AnimatePresence mode="wait">
            {!minted ? (
              <motion.div
                key="counter"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center"
              >
                <motion.div
                  key={pooledAmount}
                  initial={{ scale: 0.94, opacity: 0.7 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 280, damping: 20 }}
                  className="font-grotesk font-bold tabular-nums leading-none"
                  style={{
                    fontSize: "10.4cqw",
                    letterSpacing: "-0.03em",
                    color: T.ink,
                  }}
                >
                  {fmt(pooledAmount)}
                </motion.div>
                <div
                  className="font-medium tabular-nums"
                  style={{
                    marginTop: "1.4cqw",
                    fontSize: "2.6cqw",
                    color: T.gray,
                    letterSpacing: "0.04em",
                  }}
                >
                  of {fmt(billTotal)}
                </div>
                <div
                  className="font-bold tabular-nums"
                  style={{
                    marginTop: "1cqw",
                    fontSize: "2.8cqw",
                    color: T.accent,
                    letterSpacing: "0.08em",
                  }}
                >
                  {Math.round(pct)}% POOLED
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="mini-card"
                initial={{ scale: 0, rotate: -14, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 14 }}
                className="rounded-md flex flex-col justify-between"
                style={{
                  width: "76%",
                  aspectRatio: "1.55/1",
                  background: T.white,
                  padding: "2.4cqw 2.6cqw",
                  color: T.ink,
                  boxShadow:
                    "0 12px 28px -8px rgba(14,14,14,0.18), 0 0 0 1px rgba(14,14,14,0.06) inset",
                }}
              >
                <div className="flex items-center justify-between">
                  <span
                    aria-hidden
                    style={{
                      width: "3.6cqw",
                      height: "2.6cqw",
                      borderRadius: "0.5cqw",
                      background:
                        "linear-gradient(135deg, #F5D478, #C49A3A 55%, #8A6620)",
                    }}
                  />
                  <span
                    className="uppercase font-bold"
                    style={{
                      fontSize: "1.2cqw",
                      letterSpacing: "0.2em",
                      padding: "0.4cqw 1cqw",
                      borderRadius: "999px",
                      background: T.accent,
                      color: T.cream,
                    }}
                  >
                    1×
                  </span>
                </div>
                <div className="flex items-end justify-between">
                  <span
                    className="font-bold tabular-nums"
                    style={{
                      fontSize: "3.2cqw",
                      letterSpacing: "-0.02em",
                      color: T.ink,
                    }}
                  >
                    {fmt(billTotal)}
                  </span>
                  <span
                    className="font-extrabold italic"
                    style={{
                      fontSize: "3cqw",
                      letterSpacing: "-0.01em",
                      color: "#1A1F71",
                      lineHeight: 1,
                    }}
                  >
                    VISA
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Live status caption (sits between ring and grid) */}
      <div
        className="absolute text-center"
        style={{ left: 0, right: 0, top: "53%" }}
      >
        <AnimatePresence mode="wait">
          {!minted ? (
            <motion.span
              key={`cap-${Object.values(statuses).join("-")}`}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.25 }}
              className="font-medium block uppercase"
              style={{
                fontSize: "2.6cqw",
                letterSpacing: "0.18em",
                color: T.gray,
              }}
            >
              {(() => {
                const tappingDiner = (POOL_ORDER as Diner[]).find(
                  (d) => statuses[d] === "tapping",
                );
                if (tappingDiner) {
                  return `${DINERS[tappingDiner].name.split(" ")[0]} is tapping…`;
                }
                const allPaid = (POOL_ORDER as Diner[]).every(
                  (d) => statuses[d] === "paid",
                );
                if (allPaid) return "Pool full · minting card";
                return "Waiting on the table…";
              })()}
            </motion.span>
          ) : (
            <motion.span
              key="cap-minted"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="font-bold block uppercase"
              style={{
                fontSize: "2.6cqw",
                letterSpacing: "0.22em",
                color: T.accent,
              }}
            >
              ✦ Loading into your wallet…
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Diner grid 2x2 */}
      <div
        className="absolute"
        style={{
          left: "5cqw",
          right: "5cqw",
          bottom: "5cqw",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "2.4cqw",
        }}
      >
        {dinerTotals.map(({ diner, amount }) => {
          const status = statuses[diner];
          const meta = DINERS[diner];
          const isPaid = status === "paid";
          const isTapping = status === "tapping";
          return (
            <motion.div
              key={diner}
              animate={
                isTapping
                  ? { scale: [1, 1.04, 1] }
                  : { scale: 1 }
              }
              transition={{ duration: 0.55, repeat: isTapping ? Infinity : 0 }}
              className="flex items-center"
              style={{
                background: T.white,
                border: `1px solid ${
                  isPaid
                    ? T.accent
                    : isTapping
                    ? T.accent
                    : "rgba(14,14,14,0.08)"
                }`,
                borderRadius: "3cqw",
                padding: "2.4cqw 2.6cqw",
                gap: "2.2cqw",
                boxShadow: isPaid
                  ? `0 6px 18px -10px ${T.accent}80`
                  : "0 4px 12px -8px rgba(14,14,14,0.18)",
              }}
            >
              <span
                className="grid place-items-center font-bold rounded-full shrink-0"
                style={{
                  width: "8.4cqw",
                  height: "8.4cqw",
                  background: meta.color,
                  color: T.ink,
                  fontSize: "3cqw",
                }}
              >
                {meta.initials}
              </span>
              <div className="flex-1 min-w-0">
                <div
                  className="font-bold tabular-nums"
                  style={{
                    fontSize: "3.2cqw",
                    color: T.ink,
                    letterSpacing: "-0.01em",
                  }}
                >
                  {fmt(amount)}
                </div>
                <div
                  className="font-bold uppercase"
                  style={{
                    fontSize: "1.9cqw",
                    color: isPaid
                      ? T.accent
                      : isTapping
                      ? T.accent
                      : T.gray,
                    letterSpacing: "0.16em",
                    marginTop: "0.5cqw",
                  }}
                >
                  {isPaid ? "✓ paid" : isTapping ? "tapping" : "queued"}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Flying coins — peach orbs flowing into the ring */}
      <AnimatePresence>
        {coins.map((c) => (
          <motion.div
            key={c.id}
            className="absolute pointer-events-none rounded-full"
            initial={{
              left: COIN_START[c.from].left,
              top: COIN_START[c.from].top,
              scale: 0.6,
              opacity: 0,
            }}
            animate={{
              left: [COIN_START[c.from].left, COIN_START[c.from].left, RING_CENTER.left],
              top: [COIN_START[c.from].top, COIN_START[c.from].top, RING_CENTER.top],
              scale: [0.6, 1.15, 0.4],
              opacity: [0, 1, 0],
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: [0.4, 0, 0.65, 1], times: [0, 0.18, 1] }}
            onAnimationComplete={() => {
              setCoins((cs) => cs.filter((x) => x.id !== c.id));
            }}
            style={{
              width: "5cqw",
              height: "5cqw",
              background: `radial-gradient(circle at 30% 30%, #FFD8B0, ${T.accent})`,
              boxShadow: `0 4px 16px ${T.accent}99, 0 0 0 1px rgba(255,255,255,0.5) inset`,
              transform: "translate(-50%, -50%)",
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// 6c. Tabby Card — initiator taps the minted one-time virtual card
//     to the merchant POS for the consolidated bill total.
// ─────────────────────────────────────────────────────────────────

function TabbyCardScreen({ state, dispatch }: RouterProps) {
  const tipPct = typeof state.tipPct === "number" ? state.tipPct / 100 : 0;
  const billMultiplier = 1 + tipPct + TAX_RATE;
  const billTotal = useMemo(
    () =>
      POOL_ORDER.reduce(
        (sum, d) =>
          sum + shareForDiner(state.claims, state.customSplits, d) * billMultiplier,
        0,
      ),
    [state.claims, state.customSplits, billMultiplier],
  );

  const [phase, setPhase] = useState<"ready" | "tapping" | "done">("ready");

  const onTap = () => {
    if (phase !== "ready") return;
    setPhase("tapping");
    setTimeout(() => {
      setPhase("done");
      setTimeout(() => dispatch({ type: "GOTO", screen: "success" }), 800);
    }, 1300);
  };

  return (
    <div
      className="relative w-full h-full font-grotesk overflow-hidden"
      style={{ background: T.charcoal, color: T.white }}
    >
      <StatusBar dark />

      {/* Instruction */}
      {phase === "ready" && (
        <motion.span
          className="absolute left-1/2 -translate-x-1/2 uppercase font-bold text-center whitespace-nowrap"
          style={{
            top: "8.5%",
            fontSize: "3.4cqw",
            letterSpacing: "0.24em",
            color: T.accent,
          }}
          animate={{ opacity: [0.55, 1, 0.55] }}
          transition={{ duration: 1.6, repeat: Infinity }}
        >
          ✦ tap to charge merchant
        </motion.span>
      )}

      {/* Cream Visa-style one-time virtual card — Tabby-issued. Mirrors
          the original Apple-Pay card layout: amount top-right, phone-NFC
          illustration on the left, VISA wordmark bottom-right. */}
      <div
        className="absolute left-1/2 -translate-x-1/2"
        style={{ top: "16%", width: "84%" }}
      >
        <motion.button
          onClick={onTap}
          initial={{ scale: 0.85, opacity: 0, rotateX: -18 }}
          animate={{ scale: 1, opacity: 1, rotateX: 0 }}
          transition={{ type: "spring", stiffness: 220, damping: 18 }}
          className="block w-full cursor-pointer relative text-left"
          style={{
            aspectRatio: "1.55/1",
            background: T.cream,
            borderRadius: "8.4cqw",
            boxShadow: "0 30px 60px -20px rgba(0,0,0,0.55)",
            padding: "8.4cqw",
            color: T.ink,
          }}
        >
          {/* Pay $X.XX top-right */}
          <span
            className="absolute font-bold tabular-nums"
            style={{ top: "8.4cqw", right: "8.4cqw", fontSize: "5.4cqw" }}
          >
            Pay {fmt(billTotal)}
          </span>

          {/* Phone-with-NFC illustration */}
          <PhoneNFCIllustration tapping={phase === "tapping"} done={phase === "done"} />

          {/* VISA bottom-right */}
          <span
            className="absolute font-extrabold"
            style={{
              right: "8.4cqw",
              bottom: "6.7cqw",
              fontSize: "8.4cqw",
              letterSpacing: "0.02em",
              color: "#1A1F71",
            }}
          >
            VISA
          </span>
        </motion.button>
      </div>

      {/* NFC indicator + caption */}
      <div
        className="absolute left-0 right-0 flex flex-col items-center text-center px-6"
        style={{ top: "53%" }}
      >
        <motion.span
          className="grid place-items-center rounded-full border"
          style={{
            width: "18.5cqw",
            height: "18.5cqw",
            borderColor:
              phase === "tapping"
                ? T.green
                : phase === "done"
                ? T.green
                : "rgba(255,255,255,0.4)",
            color: phase === "tapping" || phase === "done" ? T.green : T.white,
          }}
          animate={
            phase === "tapping" ? { scale: [1, 1.18, 1] } : { scale: 1 }
          }
          transition={{ duration: 1, repeat: phase === "tapping" ? Infinity : 0 }}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ width: "10.5cqw", height: "10.5cqw" }}
            aria-hidden
          >
            <path d="M4 8.32 a 7.43 7.43 0 0 1 0 7.36" />
            <path d="M7.46 6.21 a 11.76 11.76 0 0 1 0 11.58" />
            <path d="M10.91 4.1 a 15.91 15.91 0 0 1 0 15.8" />
            <path d="M14.37 2 a 20.16 20.16 0 0 1 0 20" />
          </svg>
        </motion.span>
        <span
          className="font-medium block w-full text-center"
          style={{ marginTop: "3.4cqw", fontSize: "5cqw" }}
        >
          {phase === "ready" && "Hold near merchant reader"}
          {phase === "tapping" && "Settling with Alberto's…"}
          {phase === "done" && "Card consumed ✓"}
        </span>
        <span
          className="block w-full text-center"
          style={{
            marginTop: "1.6cqw",
            fontSize: "2.9cqw",
            letterSpacing: "0.04em",
            color: "rgba(255,255,255,0.55)",
            maxWidth: "82%",
            marginLeft: "auto",
            marginRight: "auto",
            lineHeight: 1.45,
          }}
        >
          One charge for the whole table — the virtual card self-destructs after.
        </span>
      </div>

      {/* Back to pool */}
      <button
        onClick={() => dispatch({ type: "GOTO", screen: "pool" })}
        className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center"
        style={{
          bottom: "6.7cqw",
          color: "rgba(255,255,255,0.55)",
          fontSize: "4.3cqw",
        }}
      >
        <span>⌃</span>
        <span style={{ marginTop: "1cqw" }}>Back to pool</span>
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// 7. Success — receipt illustration + totals (Figma)
// ─────────────────────────────────────────────────────────────────

function SuccessScreen({ dispatch, yourSubtotal, tip, tax, yourTotal }: RouterProps) {
  return (
    <div
      className="relative w-full h-full font-grotesk flex flex-col"
      style={{ background: T.cream, color: T.ink }}
    >
      <StatusBar />

      {/* Close — stays in top-right of the screen */}
      <button
        onClick={() => dispatch({ type: "RESET" })}
        className="absolute grid place-items-center rounded-full"
        style={{
          top: "6%",
          right: "5%",
          width: "9%",
          aspectRatio: "1",
          background: T.white,
          color: T.ink,
          fontSize: "5cqw",
          fontWeight: 600,
          boxShadow: "0 4px 12px rgba(14,14,14,0.08)",
          zIndex: 5,
        }}
      >
        ×
      </button>

      {/* Hero — green check, "You paid", amount, restaurant line. Centered, no halo. */}
      <div
        className="flex flex-col items-center justify-center"
        style={{ paddingTop: "12cqw", paddingBottom: "6cqw" }}
      >
        <motion.div
          className="rounded-full grid place-items-center"
          style={{
            width: "22%",
            aspectRatio: "1",
            background: T.green,
            color: "#fff",
            fontSize: "9.6cqw",
            fontWeight: 700,
            boxShadow: `0 16px 36px -14px rgba(2,213,124,0.55)`,
          }}
          initial={{ scale: 0, rotate: -90 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 220, damping: 16 }}
        >
          ✓
        </motion.div>

        <div
          className="font-medium"
          style={{ fontSize: "4.1cqw", color: T.gray, marginTop: "4.8cqw", letterSpacing: "0.04em" }}
        >
          You paid
        </div>
        <div
          className="font-grotesk font-bold tabular-nums leading-none"
          style={{ fontSize: "14.4cqw", letterSpacing: "-0.03em", marginTop: "1.7cqw" }}
        >
          {fmt(yourTotal)}
        </div>
        <div
          className="font-medium text-center"
          style={{ fontSize: "3.4cqw", color: T.gray, marginTop: "3cqw", letterSpacing: "0.02em" }}
        >
          Alberto&apos;s · Table 12
        </div>
      </div>

      {/* Spacer so totals dock to the bottom */}
      <div className="flex-1" />

      {/* Totals card */}
      <div style={{ padding: "0 8.4cqw" }}>
        <div
          style={{
            background: T.white,
            borderRadius: "4.2cqw",
            padding: "4.8cqw 5.4cqw",
            boxShadow: "0 12px 30px -18px rgba(14,14,14,0.18)",
            display: "flex",
            flexDirection: "column",
            gap: "1.9cqw",
            fontSize: "3.8cqw",
          }}
        >
          <SuccLine k="Subtotal" v={fmt(yourSubtotal)} />
          <SuccLine k="Gratuity" v={fmt(tip)} />
          <SuccLine k="Tax (8.25%)" v={fmt(tax)} />
          <div style={{ borderTop: "1px solid rgba(14,14,14,0.1)", marginTop: "1.2cqw", paddingTop: "2.9cqw" }}>
            <SuccLine k="Total" v={fmt(yourTotal)} bold />
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={{ padding: "4.8cqw 8.4cqw 7.2cqw" }}>
        <button
          onClick={() => dispatch({ type: "GOTO", screen: "itemized" })}
          className="w-full font-bold transition active:scale-95"
          style={{
            borderRadius: "999px",
            background: T.ink,
            color: T.cream,
            padding: "4.8cqw 0",
            fontSize: "4.1cqw",
          }}
        >
          View Itemized Bill
        </button>
      </div>
    </div>
  );
}

function SuccLine({ k, v, bold }: { k: string; v: string; bold?: boolean }) {
  return (
    <div className="flex justify-between items-baseline" style={{ color: bold ? T.ink : T.gray, fontWeight: bold ? 600 : 400 }}>
      <span>{k}</span>
      <span
        className="tabular-nums text-right"
        style={{ minWidth: "20cqw", flexShrink: 0, fontVariantNumeric: "tabular-nums" }}
      >
        {v}
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Dashboard — home screen. Matches Figma 439:1381.
// Open-tab promo card → tap to advance; recent history list below.
// ─────────────────────────────────────────────────────────────────

type SpotInfo = {
  emoji: string;
  address: string;
  lastVisit: string;
  avgSpend: string;
  mostOrdered: Array<[string, string]>;
  visits: Array<{ date: string; price: string; with: string }>;
};

type HistoryEntry = {
  id: string;
  name: string;
  restaurant: string;
  tableNo: string;
  date: string;
  diners: Diner[];
  items: Array<{ name: string; qty: number; price: number; claimedBy: Diner[] }>;
  tipPct: number; // as decimal, e.g. 0.20
  spot: SpotInfo;
};

const SUGARFISH_SPOT: SpotInfo = {
  emoji: "🐟",
  address: "1345 2nd St., Santa Monica, CA 90401",
  lastVisit: "Today",
  avgSpend: "$144.98",
  mostOrdered: [
    ["Maki Roll", "$7.00"],
    ["Yellowtail Sashimi", "$12.00"],
    ["Grilled Salmon", "$18.00"],
  ],
  visits: [
    { date: "Today", price: "$82.08", with: "Maya, Sam, Jake" },
    { date: "Jan 5, 2026", price: "$144.98", with: "Maya, Sam" },
    { date: "Nov 12, 2025", price: "$167.40", with: "Sam" },
  ],
};

const HISTORY_DATA: HistoryEntry[] = [
  {
    id: "olive",
    name: "Lunch at The Olive Grove",
    restaurant: "The Olive Grove",
    tableNo: "Table 4",
    date: "February 15, 2026",
    diners: ["you", "maya"],
    tipPct: 0.20,
    items: [
      { name: "Kale Caesar Salad", qty: 1, price: 11, claimedBy: ["you"] },
      { name: "Garlic Bread", qty: 1, price: 7, claimedBy: ["you", "maya"] },
      { name: "Sparkling Water", qty: 2, price: 4.5, claimedBy: ["you", "maya"] },
    ],
    spot: {
      emoji: "🫒",
      address: "842 Abbot Kinney Blvd, Venice, CA 90291",
      lastVisit: "Feb 15",
      avgSpend: "$28.42",
      mostOrdered: [
        ["Kale Caesar Salad", "$11.00"],
        ["Margherita Pizza", "$17.00"],
        ["Tiramisu", "$9.00"],
      ],
      visits: [
        { date: "Feb 15, 2026", price: "$24.37", with: "Maya" },
        { date: "Jan 3, 2026", price: "$32.18", with: "Maya, Sam" },
        { date: "Nov 20, 2025", price: "$28.72", with: "Maya" },
      ],
    },
  },
  {
    id: "rustic",
    name: "Drinks at The Rustic Table",
    restaurant: "The Rustic Table",
    tableNo: "Bar seat 3",
    date: "January 10, 2026",
    diners: ["you", "jake", "sam"],
    tipPct: 0.20,
    items: [
      { name: "IPA Draft", qty: 1, price: 9, claimedBy: ["you"] },
      { name: "Margarita", qty: 3, price: 13, claimedBy: ["you", "jake", "sam"] },
      { name: "Truffle Fries", qty: 1, price: 12, claimedBy: ["you", "jake", "sam"] },
    ],
    spot: {
      emoji: "🍷",
      address: "212 Montana Ave, Santa Monica, CA 90403",
      lastVisit: "Jan 10",
      avgSpend: "$42.10",
      mostOrdered: [
        ["Old Fashioned", "$15.00"],
        ["Truffle Fries", "$12.00"],
        ["Burrata Plate", "$18.00"],
      ],
      visits: [
        { date: "Jan 10, 2026", price: "$33.35", with: "Jake, Sam" },
        { date: "Dec 14, 2025", price: "$48.20", with: "Jake, Sam, Maya" },
        { date: "Oct 9, 2025", price: "$44.75", with: "Jake" },
      ],
    },
  },
  {
    id: "golden",
    name: "Drinks at The Golden Fork",
    restaurant: "The Golden Fork",
    tableNo: "Table 7",
    date: "December 25, 2025",
    diners: ["you", "maya", "sam", "jake"],
    tipPct: 0.20,
    items: [
      { name: "Old Fashioned", qty: 1, price: 16, claimedBy: ["you"] },
      { name: "Negroni", qty: 3, price: 15, claimedBy: ["maya", "sam", "jake"] },
      { name: "Calamari", qty: 1, price: 16, claimedBy: ["you", "maya", "sam", "jake"] },
    ],
    spot: {
      emoji: "🍽️",
      address: "611 S Spring St, Los Angeles, CA 90014",
      lastVisit: "Dec 25",
      avgSpend: "$85.30",
      mostOrdered: [
        ["NY Strip Steak", "$42.00"],
        ["Calamari", "$16.00"],
        ["Negroni", "$15.00"],
      ],
      visits: [
        { date: "Dec 25, 2025", price: "$25.65", with: "Maya, Sam, Jake" },
        { date: "Oct 31, 2025", price: "$98.40", with: "Maya, Sam" },
        { date: "Aug 12, 2025", price: "$76.90", with: "Jake" },
      ],
    },
  },
  {
    id: "savory",
    name: "Dinner at The Savory Spot",
    restaurant: "The Savory Spot",
    tableNo: "Table 12",
    date: "November 30, 2025",
    diners: ["you", "maya"],
    tipPct: 0.20,
    items: [
      { name: "Roast Chicken", qty: 1, price: 26, claimedBy: ["you"] },
      { name: "Branzino", qty: 1, price: 32, claimedBy: ["maya"] },
      { name: "House Salad", qty: 2, price: 10, claimedBy: ["you", "maya"] },
      { name: "Bread Service", qty: 1, price: 6, claimedBy: ["you", "maya"] },
    ],
    spot: {
      emoji: "🍗",
      address: "3109 W Sunset Blvd, Los Angeles, CA 90026",
      lastVisit: "Nov 30",
      avgSpend: "$58.72",
      mostOrdered: [
        ["Roast Chicken", "$26.00"],
        ["Branzino", "$32.00"],
        ["House Salad", "$10.00"],
      ],
      visits: [
        { date: "Nov 30, 2025", price: "$50.02", with: "Maya" },
        { date: "Sep 18, 2025", price: "$64.30", with: "Maya, Jake" },
        { date: "Jul 22, 2025", price: "$55.80", with: "Maya" },
      ],
    },
  },
  {
    id: "morning",
    name: "Brunch at The Morning Cafe",
    restaurant: "The Morning Cafe",
    tableNo: "Table 9",
    date: "March 5, 2026",
    diners: ["you", "maya", "sam"],
    tipPct: 0.20,
    items: [
      { name: "Avocado Toast", qty: 1, price: 16, claimedBy: ["you"] },
      { name: "Eggs Benedict", qty: 1, price: 18, claimedBy: ["maya"] },
      { name: "Shakshuka", qty: 1, price: 17, claimedBy: ["sam"] },
      { name: "Cold Brew", qty: 3, price: 6, claimedBy: ["you", "maya", "sam"] },
      { name: "Fruit Plate", qty: 1, price: 11, claimedBy: ["you", "maya", "sam"] },
    ],
    spot: {
      emoji: "☕",
      address: "1714 Silver Lake Blvd, Los Angeles, CA 90026",
      lastVisit: "Mar 5",
      avgSpend: "$34.10",
      mostOrdered: [
        ["Avocado Toast", "$16.00"],
        ["Eggs Benedict", "$18.00"],
        ["Cold Brew", "$6.00"],
      ],
      visits: [
        { date: "Mar 5, 2026", price: "$32.92", with: "Maya, Sam" },
        { date: "Feb 8, 2026", price: "$38.14", with: "Maya" },
        { date: "Jan 4, 2026", price: "$29.80", with: "Sam" },
      ],
    },
  },
];

function historyUserTotal(entry: HistoryEntry): number {
  const yourSubtotal = entry.items.reduce((sum, it) => {
    if (!it.claimedBy.includes("you")) return sum;
    return sum + (it.qty * it.price) / it.claimedBy.length;
  }, 0);
  return yourSubtotal * (1 + entry.tipPct + TAX_RATE);
}

const FRIEND_AVATARS: Array<{ initials: string; color: string }> = [
  { initials: "JM", color: "#F6C6B3" },
  { initials: "MC", color: "#CFAFA6" },
  { initials: "SC", color: "#AFCFCB" },
  { initials: "LP", color: "#FDD509" },
  { initials: "OS", color: "#C8B9D8" },
];

function DashboardScreen({ dispatch }: RouterProps) {
  return (
    <div className="relative w-full h-full font-grotesk flex flex-col" style={{ background: T.cream, color: T.ink }}>
      <StatusBar />

      {/* Tabby wordmark */}
      <div className="text-center" style={{ paddingTop: "3cqw", paddingBottom: "3.6cqw" }}>
        <span
          className="font-grotesk font-bold"
          style={{ fontSize: "7.2cqw", letterSpacing: "-0.025em", color: "#012F20" }}
        >
          tabby
        </span>
      </div>

      {/* Open-tab promo card (peach) */}
      <div style={{ padding: "0 6cqw" }}>
        <div
          className="rounded-[6cqw] flex flex-col items-center"
          style={{ background: T.accent, padding: "6cqw 6cqw 4.8cqw" }}
        >
          <span
            className="rounded-full grid place-items-center font-bold"
            style={{
              width: "14.4cqw",
              height: "14.4cqw",
              background: T.cream,
              color: T.ink,
              fontSize: "4.3cqw",
              lineHeight: 1,
              textAlign: "center",
            }}
          >
            JM
          </span>
          <div
            className="text-center font-bold"
            style={{ fontSize: "4.1cqw", color: T.ink, marginTop: "2.4cqw", lineHeight: 1.35 }}
          >
            Jenny has an open tab at
            <br />
            The Rustic Table
          </div>
          <button
            onClick={() => dispatch({ type: "GOTO", screen: "items" })}
            className="font-bold transition active:scale-95"
            style={{
              marginTop: "3.6cqw",
              background: T.ink,
              color: T.cream,
              borderRadius: "999px",
              padding: "3.6cqw 14%",
              fontSize: "3.8cqw",
            }}
          >
            Join Tab
          </button>
        </div>
      </div>

      {/* Friends row */}
      <div style={{ padding: "6cqw 6cqw 0" }}>
        <div
          className="uppercase font-semibold flex items-center"
          style={{ fontSize: "2.9cqw", color: T.gray, letterSpacing: "0.16em", gap: "1.8cqw" }}
        >
          <span>◎</span> Friends
        </div>
        <div className="flex items-center justify-between" style={{ marginTop: "2.4cqw" }}>
          <button
            onClick={() => dispatch({ type: "GOTO", screen: "friends" })}
            className="flex items-center"
          >
            {FRIEND_AVATARS.map((a, i) => (
              <span
                key={a.initials}
                className="rounded-full grid place-items-center font-bold shrink-0"
                style={{
                  width: "10.8cqw",
                  height: "10.8cqw",
                  background: a.color,
                  color: T.ink,
                  fontSize: "3.1cqw",
                  border: `2px solid ${T.cream}`,
                  marginLeft: i === 0 ? 0 : "-2.4cqw",
                }}
              >
                {a.initials}
              </span>
            ))}
            <span
              className="rounded-full grid place-items-center font-bold shrink-0"
              style={{
                width: "10.8cqw",
                height: "10.8cqw",
                background: T.cream,
                border: `1.5px solid rgba(14,14,14,0.15)`,
                color: T.gray,
                fontSize: "2.9cqw",
                marginLeft: "-2.4cqw",
              }}
            >
              +18
            </span>
          </button>
          <button
            onClick={() => dispatch({ type: "GOTO", screen: "friends" })}
            className="rounded-full font-semibold transition active:scale-95 hover:bg-[rgba(14,14,14,0.04)]"
            style={{
              fontSize: "3.1cqw",
              padding: "1.4cqw 3.6cqw",
              background: T.white,
              border: "1px solid rgba(14,14,14,0.08)",
              color: T.ink,
            }}
          >
            Manage
          </button>
        </div>
      </div>

      {/* History */}
      <div style={{ padding: "6cqw 6cqw 0" }} className="flex-1 overflow-y-auto no-scrollbar">
        <div
          className="uppercase font-semibold flex items-center"
          style={{ fontSize: "2.9cqw", color: T.gray, letterSpacing: "0.16em", gap: "1.8cqw", marginBottom: "2.4cqw" }}
        >
          <span>↻</span> History
        </div>
        {HISTORY_DATA.map((h, idx) => (
          <button
            key={h.id}
            type="button"
            onClick={() => dispatch({ type: "OPEN_HISTORY", idx })}
            aria-label={`View ${h.name}`}
            className="w-full flex items-start text-left transition active:scale-[0.99] hover:bg-black/[0.02]"
            style={{ padding: "2.9cqw 0", borderBottom: "1px solid rgba(14,14,14,0.06)", gap: "3cqw" }}
          >
            <div className="flex-1 min-w-0">
              <div
                className="font-semibold"
                style={{
                  fontSize: "3.6cqw",
                  letterSpacing: "-0.01em",
                  overflow: "hidden",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  wordBreak: "break-word",
                }}
              >
                {h.name}
              </div>
              <div style={{ fontSize: "2.7cqw", color: T.gray, marginTop: "0.5cqw" }}>
                {h.date}
              </div>
            </div>
            <span
              className="tabular-nums font-semibold text-right"
              style={{ fontSize: "3.8cqw", minWidth: "18cqw", flexShrink: 0, fontVariantNumeric: "tabular-nums" }}
            >
              {fmt(historyUserTotal(h))}
            </span>
            <span style={{ fontSize: "3.4cqw", color: T.gray, flexShrink: 0, marginLeft: "0.4cqw" }}>›</span>
          </button>
        ))}
      </div>

      <BottomNav active="home" dispatch={dispatch} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Friends/Groups screen with toggle. Matches Figma 439:1491 / 439:1610.
// ─────────────────────────────────────────────────────────────────

const GROUPS_DATA: Array<{
  id: string;
  name: string;
  members: number;
  tabs: number;
  last: string;
  colors: string[];
  emoji: string;
}> = [
  { id: "boys", name: "Boys Night", members: 3, tabs: 33, last: "8 days ago", emoji: "🍻", colors: ["#F6C6B3", "#AFCFCB", "#CFAFA6"] },
  { id: "brunch", name: "Sunday Brunch Crew", members: 5, tabs: 9, last: "4 days ago", emoji: "🥞", colors: ["#CFAFA6", "#F6C6B3", "#FDD509", "#AFCFCB", "#FF7C61"] },
  { id: "work", name: "Work Lunch Squad", members: 4, tabs: 18, last: "2 days ago", emoji: "💼", colors: ["#AFCFCB", "#CFAFA6", "#F6C6B3", "#FDD509"] },
  { id: "weho", name: "WeHo Apartment", members: 2, tabs: 4, last: "3 weeks ago", emoji: "🏠", colors: ["#FF7C61", "#CFAFA6"] },
  { id: "church", name: "Church", members: 2, tabs: 4, last: "1 month ago", emoji: "⛪", colors: ["#AFCFCB", "#F6C6B3"] },
];

const FRIENDS_DATA: Array<{ id: string; name: string; splits: number; last: string; color: string; initials: string }> = [
  { id: "jake", name: "Jake Martinez", splits: 12, last: "Yesterday", color: "#F6C6B3", initials: "JM" },
  { id: "maya", name: "Maya Chen", splits: 8, last: "3 days ago", color: "#CFAFA6", initials: "MC" },
  { id: "sam", name: "Sam Carpenter", splits: 24, last: "Feb 19", color: "#AFCFCB", initials: "SC" },
  { id: "lisa", name: "Lisa Park", splits: 5, last: "Jan 28", color: "#FDD509", initials: "LP" },
  { id: "omar", name: "Omar Schmidt", splits: 15, last: "Feb 15", color: "#C8B9D8", initials: "OS" },
  { id: "nina", name: "Nina Patel", splits: 10, last: "Feb 10", color: "#B8C8D8", initials: "NP" },
  { id: "ethan", name: "Ethan Brown", splits: 18, last: "Feb 25", color: "#D8CBA8", initials: "EB" },
];

function FriendsScreen({ dispatch }: RouterProps) {
  const [tab, setTab] = useState<"friends" | "groups">("friends");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggleFriend = (id: string) => {
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="relative w-full h-full font-grotesk flex flex-col" style={{ background: T.cream, color: T.ink }}>
      <StatusBar />

      {/* Header */}
      <div className="flex items-center justify-between" style={{ padding: "3.4cqw 6cqw 3.6cqw" }}>
        <button
          onClick={() => dispatch({ type: "GOTO", screen: "dashboard" })}
          aria-label="Back to home"
          className="grid place-items-center font-bold rounded-full transition active:scale-90 hover:scale-105"
          style={{
            width: "11%",
            aspectRatio: "1",
            background: T.ink,
            color: T.cream,
            fontSize: "7.4cqw",
            lineHeight: 1,
            boxShadow: "0 4px 12px rgba(14,14,14,0.18)",
          }}
        >
          ❮
        </button>
        <span className="font-bold" style={{ fontSize: "5.3cqw", letterSpacing: "-0.02em" }}>
          {tab === "friends" ? "Friends" : "Groups"}
        </span>
        <span
          className="font-semibold"
          style={{ background: T.ink, color: T.cream, borderRadius: "999px", padding: "1.9cqw 4.3cqw", fontSize: "3.1cqw" }}
        >
          ＋ Add
        </span>
      </div>

      {/* Friends/Groups segmented toggle */}
      <div style={{ padding: "0 8.4cqw 3.6cqw" }}>
        <div
          className="grid grid-cols-2 relative"
          style={{
            background: T.white,
            borderRadius: "999px",
            padding: "1cqw",
            border: "1px solid rgba(14,14,14,0.06)",
          }}
        >
          {(["friends", "groups"] as const).map((t) => {
            const active = tab === t;
            return (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="font-semibold transition relative z-10"
                style={{
                  padding: "2.4cqw 0",
                  fontSize: "3.6cqw",
                  borderRadius: "999px",
                  background: active ? T.ink : "transparent",
                  color: active ? T.cream : T.gray,
                  textTransform: "capitalize",
                }}
              >
                {t}
              </button>
            );
          })}
        </div>
      </div>

      {/* Body — switches based on tab */}
      <div className="flex-1 overflow-y-auto no-scrollbar" style={{ padding: "0 6cqw" }}>
        {tab === "friends" &&
          FRIENDS_DATA.map((f) => {
            const on = selected.has(f.id);
            return (
              <button
                key={f.id}
                onClick={() => toggleFriend(f.id)}
                className="w-full flex items-center transition active:scale-[0.99]"
                style={{
                  gap: "4.2cqw",
                  padding: "3.1cqw 2.4cqw",
                  background: on ? "rgba(2,213,124,0.10)" : "transparent",
                  borderRadius: "3cqw",
                }}
              >
                <span
                  className="rounded-full grid place-items-center font-bold shrink-0"
                  style={{ width: "13%", aspectRatio: "1", background: f.color, color: T.ink, fontSize: "3.6cqw" }}
                >
                  {f.initials}
                </span>
                <span className="flex-1 text-left">
                  <span className="block font-semibold truncate" style={{ fontSize: "4.3cqw", letterSpacing: "-0.01em" }}>
                    {f.name}
                  </span>
                  <span className="block" style={{ fontSize: "3.1cqw", color: T.gray, marginTop: "0.5cqw" }}>
                    {f.splits} splits · {f.last}
                  </span>
                </span>
                <Checkdot on={on} />
              </button>
            );
          })}

        {tab === "groups" &&
          GROUPS_DATA.map((g) => (
            <button
              key={g.id}
              onClick={() => dispatch({ type: "GOTO", screen: "camera" })}
              className="w-full flex items-center transition active:scale-[0.99]"
              style={{ gap: "4.2cqw", padding: "3.6cqw 2.4cqw" }}
            >
              <span
                className="rounded-full grid place-items-center shrink-0"
                style={{ width: "13%", aspectRatio: "1", background: T.peachSoft, fontSize: "6cqw" }}
              >
                {g.emoji}
              </span>
              <span className="flex-1 text-left">
                <span className="block font-semibold truncate" style={{ fontSize: "4.3cqw", letterSpacing: "-0.01em" }}>
                  {g.name}
                </span>
                <span className="block" style={{ fontSize: "3.1cqw", color: T.gray, marginTop: "0.5cqw" }}>
                  {g.members} members · {g.tabs} tabs · {g.last}
                </span>
              </span>
              <span className="flex shrink-0">
                {g.colors.slice(0, 3).map((c, i) => (
                  <span
                    key={i}
                    className="aspect-square rounded-full"
                    style={{
                      width: "7.2cqw",
                      background: c,
                      border: `2px solid ${T.cream}`,
                      marginLeft: i === 0 ? 0 : "-1.9cqw",
                    }}
                  />
                ))}
              </span>
            </button>
          ))}
      </div>

      {/* CTA */}
      <div style={{ padding: "2.4cqw 8.4cqw 3.6cqw" }}>
        <button
          onClick={() => dispatch({ type: "GOTO", screen: "camera" })}
          disabled={tab === "friends" && selected.size === 0}
          className="w-full font-bold transition active:scale-95 disabled:cursor-not-allowed"
          style={{
            borderRadius: "999px",
            background: tab === "friends" && selected.size > 0 ? T.ink : "rgba(14,14,14,0.12)",
            color: tab === "friends" && selected.size > 0 ? T.cream : "rgba(14,14,14,0.45)",
            padding: "4.8cqw 0",
            fontSize: "4.1cqw",
          }}
        >
          {tab === "friends" && selected.size > 0
            ? `Start tab with ${selected.size}`
            : tab === "groups"
            ? "Tap a group to start a tab"
            : "Select people to continue"}
        </button>
      </div>

      <BottomNav active="people" dispatch={dispatch} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Sugarfish — restaurant detail page after the tab settles.
// Matches Figma 439:1728.
// ─────────────────────────────────────────────────────────────────

function SugarfishScreen({ state, dispatch }: RouterProps) {
  const [mapOpen, setMapOpen] = useState(false);
  // Routes that lead into SugarfishScreen:
  //  • insights  (default — shows Sugarfish)
  //  • historyDetail  (past-tab → tap restaurant header → shows that restaurant)
  const entry = state.historyIdx != null ? HISTORY_DATA[state.historyIdx] : null;
  const restaurantName = entry?.restaurant ?? "Sugarfish";
  const spot = entry?.spot ?? SUGARFISH_SPOT;
  const usuallyWith = entry
    ? entry.diners
        .filter((d) => d !== "you")
        .map((d) => ({ name: DINERS[d].name, color: DINERS[d].color, initials: DINERS[d].initials }))
    : [
        { name: "Maya Chen", color: "#CFAFA6", initials: "MC" },
        { name: "Sam Carpenter", color: "#AFCFCB", initials: "SC" },
        { name: "Jake Martinez", color: "#F6C6B3", initials: "JM" },
      ];
  const backScreen: Screen = state.historyIdx != null ? "historyDetail" : "insights";
  return (
    <div className="relative w-full h-full font-grotesk overflow-hidden flex flex-col" style={{ background: T.cream, color: T.ink }}>
      <StatusBar />

      {/* Floating back button — above the map so it stays reachable even
          when the map is collapsed. */}
      <button
        onClick={() => dispatch({ type: "GOTO", screen: backScreen })}
        aria-label="Back"
        className="absolute z-20 grid place-items-center font-bold rounded-full transition active:scale-90"
        style={{
          left: "5%",
          top: "4.5%",
          width: "11%",
          aspectRatio: "1",
          background: T.cream,
          color: T.ink,
          fontSize: "7.4cqw",
          lineHeight: 1,
          boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
        }}
      >
        ❮
      </button>


      {/* Map header — collapsed to a thin handle by default so the
          Sugarfish insights lead. Tap to expand / collapse. */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => setMapOpen((v) => !v)}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setMapOpen((v) => !v); } }}
        aria-expanded={mapOpen}
        aria-label={mapOpen ? "Collapse map" : "Expand map"}
        className="relative overflow-hidden flex-shrink-0 w-full cursor-pointer"
        style={{
          height: mapOpen ? "32%" : "6.5%",
          background: "#2f2f2f",
          transition: "height 0.4s cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            opacity: 0.5,
            backgroundImage:
              "linear-gradient(rgba(120,120,120,0.45) 1px, transparent 1px), linear-gradient(90deg, rgba(120,120,120,0.45) 1px, transparent 1px)",
            backgroundSize: "10% 9%",
            transform: "rotate(-8deg) scale(1.2)",
            transformOrigin: "center",
          }}
        />
        <div
          className="absolute inset-0"
          style={{ background: "radial-gradient(ellipse at 50% 75%, rgba(0,0,0,0.55), transparent 60%)" }}
        />
        {/* Collapsed-state label */}
        {!mapOpen && (
          <span
            className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 font-semibold text-white/85 flex items-center"
            style={{ fontSize: "2.9cqw", letterSpacing: "0.2em", textTransform: "uppercase", gap: "1.4cqw" }}
          >
            Tap to view map <span>▾</span>
          </span>
        )}
        {/* Expanded-only: Open in Maps pill */}
        {mapOpen && (
          <span
            className="absolute font-semibold"
            style={{
              right: "5%",
              top: "10%",
              background: T.ink,
              color: T.cream,
              borderRadius: "1.8cqw",
              padding: "1.4cqw 3.4cqw",
              fontSize: "3.1cqw",
            }}
          >
            Open in Maps
          </span>
        )}
        {/* Drop pin — visible only when the map is open */}
        {mapOpen && (
          <div
            className="absolute left-1/2 -translate-x-1/2"
            style={{ bottom: "30%" }}
          >
            <span
              className="rounded-full grid place-items-center"
              style={{ width: "10.8cqw", height: "10.8cqw", background: T.accent, fontSize: "4.8cqw" }}
            >
              {spot.emoji}
            </span>
          </div>
        )}
      </div>

      {/* Spot badge anchor — zero-height sibling that sits exactly on the
          map/body boundary in the flex column. The badge renders as an
          absolute child with overflow visible so it straddles both. */}
      <div className="relative" style={{ height: 0, overflow: "visible" }}>
        <div
          className="absolute left-1/2 -translate-x-1/2 rounded-full grid place-items-center z-10"
          style={{
            top: "-9.6cqw",
            width: "19.2cqw",
            height: "19.2cqw",
            background: T.white,
            boxShadow: "0 8px 20px rgba(0,0,0,0.25)",
            fontSize: "8.4cqw",
          }}
        >
          {spot.emoji}
        </div>
      </div>

      {/* Scrollable body — everything between the map header and the CTA */}
      <div
        className="flex-1 overflow-y-auto no-scrollbar relative"
        data-lenis-prevent
        style={{ overscrollBehavior: "contain", WebkitOverflowScrolling: "touch" }}
      >
      {/* Restaurant header — extra top padding to clear the floating spot badge */}
      <div className="text-center" style={{ paddingTop: "14cqw" }}>
        <div className="font-grotesk font-bold" style={{ fontSize: "6.6cqw", letterSpacing: "-0.02em" }}>
          {restaurantName}
        </div>
        <div style={{ fontSize: "3.1cqw", color: T.gray, marginTop: "0.7cqw" }}>
          {spot.address}
        </div>
      </div>

      {/* Stats */}
      <div className="flex" style={{ gap: "3.6cqw", padding: "4.8cqw 6cqw 0" }}>
        {[
          { label: "Last Visit", value: spot.lastVisit },
          { label: "Average Spend", value: spot.avgSpend },
        ].map((s) => (
          <div
            key={s.label}
            className="flex-1"
            style={{
              background: T.white,
              borderRadius: "3.6cqw",
              padding: "3.6cqw 4.8cqw",
              border: "1px solid rgba(14,14,14,0.06)",
            }}
          >
            <div style={{ fontSize: "2.9cqw", color: T.gray, fontWeight: 500 }}>{s.label}</div>
            <div className="font-grotesk font-bold" style={{ fontSize: "4.8cqw", marginTop: "0.7cqw", color: "#012F20" }}>
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* Most ordered */}
      <div style={{ padding: "4.8cqw 6cqw 0" }}>
        <div
          className="uppercase font-semibold flex items-center"
          style={{ fontSize: "2.9cqw", color: T.gray, letterSpacing: "0.16em", gap: "1.8cqw" }}
        >
          <span>🍴</span> Most Ordered
        </div>
        <div style={{ marginTop: "2.4cqw", display: "flex", flexDirection: "column", gap: "1.9cqw" }}>
          {spot.mostOrdered.map(([item, price]) => (
            <div key={item} className="flex items-center justify-between">
              <span style={{ fontSize: "3.8cqw", fontWeight: 500 }}>{item}</span>
              <span style={{ fontSize: "3.4cqw", color: T.gray, fontWeight: 500 }}>{price}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Friends you go with */}
      <div style={{ padding: "3.6cqw 6cqw 0" }}>
        <div
          className="uppercase font-semibold flex items-center"
          style={{ fontSize: "2.9cqw", color: T.gray, letterSpacing: "0.16em", gap: "1.8cqw" }}
        >
          <span>◎</span> Usually with
        </div>
        <div style={{ marginTop: "2.4cqw", display: "flex", gap: "2.4cqw", flexWrap: "wrap" }}>
          {usuallyWith.map((f) => (
            <div
              key={f.name}
              className="flex items-center"
              style={{
                gap: "1.7cqw",
                background: T.white,
                borderRadius: "999px",
                padding: "1.7cqw 3.6cqw 1.7cqw 1.7cqw",
              }}
            >
              <span
                className="rounded-full grid place-items-center font-bold"
                style={{ width: "6cqw", height: "6cqw", background: f.color, fontSize: "2.4cqw" }}
              >
                {f.initials}
              </span>
              <span style={{ fontSize: "3.1cqw", fontWeight: 500 }}>{f.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent visits at this spot — fills the empty space at the bottom */}
      <div style={{ padding: "3.6cqw 6cqw 0" }}>
        <div
          className="uppercase font-semibold flex items-center"
          style={{ fontSize: "2.9cqw", color: T.gray, letterSpacing: "0.16em", gap: "1.8cqw" }}
        >
          <span>↻</span> Your visits
        </div>
        <div style={{ marginTop: "1.8cqw", display: "flex", flexDirection: "column", gap: "1.4cqw" }}>
          {spot.visits.map((v, i) => (
            <div
              key={i}
              className="flex items-center"
              style={{
                padding: "1.9cqw 0",
                borderBottom: "1px solid rgba(14,14,14,0.06)",
                gap: "3cqw",
              }}
            >
              <div className="flex-1 min-w-0">
                <div className="font-semibold" style={{ fontSize: "3.4cqw" }}>{v.date}</div>
                <div style={{ fontSize: "2.6cqw", color: T.gray, marginTop: "0.4cqw", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>with {v.with}</div>
              </div>
              <span
                className="font-grotesk font-bold tabular-nums text-right"
                style={{ fontSize: "3.6cqw", minWidth: "18cqw", flexShrink: 0, fontVariantNumeric: "tabular-nums" }}
              >
                {v.price}
              </span>
            </div>
          ))}
        </div>
      </div>

      </div>

      {/* CTA — two buttons, Reserve Table + Order Online. In the real app
           these deep-link to OpenTable/Resy and Uber Eats/DoorDash; for
           the demo both advance to the replay screen. */}
      <div
        className="flex-shrink-0"
        style={{ padding: "3.6cqw 6cqw 4.8cqw", background: T.cream }}
      >
        <div
          className="uppercase font-semibold text-center"
          style={{ fontSize: "2.6cqw", color: T.gray, letterSpacing: "0.22em", marginBottom: "2.4cqw" }}
        >
          Tap to finish the demo
        </div>
        <div className="flex" style={{ gap: "2.4cqw" }}>
          <button
            onClick={() => dispatch({ type: "GOTO", screen: "replay" })}
            className="flex-1 font-bold transition active:scale-95"
            style={{
              borderRadius: "999px",
              background: T.ink,
              color: T.cream,
              padding: "4.2cqw 0",
              fontSize: "3.4cqw",
              whiteSpace: "nowrap",
            }}
          >
            Reserve Table
          </button>
          <button
            onClick={() => dispatch({ type: "GOTO", screen: "replay" })}
            className="flex-1 font-bold transition active:scale-95"
            style={{
              borderRadius: "999px",
              background: T.accent,
              color: "#fff",
              padding: "4.2cqw 0",
              fontSize: "3.4cqw",
              whiteSpace: "nowrap",
            }}
          >
            Order Online
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Insights — your spending dashboard. Matches Figma 439:1794.
// ─────────────────────────────────────────────────────────────────

function InsightsScreen({ dispatch }: RouterProps) {
  const [period, setPeriod] = useState<"week" | "month" | "year" | "all">("month");

  // All stats respond to the selected period. Numbers are demo data,
  // but they scale realistically (week < month < year < all time).
  const PERIOD_DATA: Record<
    "week" | "month" | "year" | "all",
    {
      bigStats: { v: string; l: string }[];
      cuisines: { name: string; pct: number; color: string }[];
      restaurants: { name: string; spent: number; visits: number; dish: string; target?: Screen }[];
      patterns: { icon: string; label: string; value: string }[];
      recent: { name: string; date: string; price: string }[];
    }
  > = {
    week: {
      bigStats: [
        { v: "$187", l: "Spent" },
        { v: "$47", l: "Avg" },
        { v: "4", l: "Meals" },
      ],
      cuisines: [
        { name: "Japanese", pct: 50, color: T.accent },
        { name: "Italian", pct: 25, color: T.green },
        { name: "Mexican", pct: 15, color: T.accent2 },
        { name: "American", pct: 10, color: "#C8B9D8" },
      ],
      restaurants: [
        { name: "Sugarfish", spent: 82, visits: 1, dish: "Trust Me", target: "sugarfish" },
        { name: "The Rustic Table", spent: 62, visits: 2, dish: "Margaritas" },
        { name: "Albertos", spent: 43, visits: 1, dish: "Strip Steak" },
      ],
      patterns: [
        { icon: "⏰", label: "Peak time", value: "7–9 PM" },
        { icon: "📆", label: "Best day", value: "Saturday" },
        { icon: "👥", label: "Avg group", value: "3.5 ppl" },
        { icon: "💰", label: "Avg tip", value: "20.1%" },
        { icon: "🍻", label: "Drinks", value: "38%" },
        { icon: "🔥", label: "Streak", value: "This week" },
      ],
      recent: [
        { name: "Dinner at Sugarfish", date: "Today", price: "$82.08" },
        { name: "Drinks at The Rustic Table", date: "Wed", price: "$32.40" },
        { name: "Brunch at Albertos", date: "Sun", price: "$43.20" },
      ],
    },
    month: {
      bigStats: [
        { v: "$847", l: "Spent" },
        { v: "$42", l: "Avg" },
        { v: "20", l: "Meals" },
      ],
      cuisines: [
        { name: "Japanese", pct: 38, color: T.accent },
        { name: "Italian", pct: 24, color: T.green },
        { name: "Mexican", pct: 18, color: T.accent2 },
        { name: "American", pct: 12, color: "#C8B9D8" },
        { name: "Other", pct: 8, color: T.gray },
      ],
      restaurants: [
        { name: "Sugarfish", spent: 312, visits: 6, dish: "Trust Me", target: "sugarfish" },
        { name: "The Rustic Table", spent: 186, visits: 4, dish: "Margaritas" },
        { name: "Albertos", spent: 142, visits: 3, dish: "Strip Steak" },
        { name: "The Olive Grove", spent: 98, visits: 2, dish: "Branzino" },
        { name: "The Golden Fork", spent: 76, visits: 2, dish: "Ribeye" },
      ],
      patterns: [
        { icon: "⏰", label: "Peak time", value: "7–9 PM" },
        { icon: "📆", label: "Best day", value: "Saturday" },
        { icon: "👥", label: "Avg group", value: "3.2 ppl" },
        { icon: "💰", label: "Avg tip", value: "19.8%" },
        { icon: "🍻", label: "Drinks", value: "34%" },
        { icon: "🔥", label: "Streak", value: "5 weeks" },
      ],
      recent: [
        { name: "Lunch at The Olive Grove", date: "Feb 15", price: "$14.00" },
        { name: "Drinks at The Rustic Table", date: "Jan 10", price: "$12.50" },
        { name: "Drinks at The Golden Fork", date: "Dec 25", price: "$16.75" },
      ],
    },
    year: {
      bigStats: [
        { v: "$9,820", l: "Spent" },
        { v: "$41", l: "Avg" },
        { v: "238", l: "Meals" },
      ],
      cuisines: [
        { name: "Japanese", pct: 34, color: T.accent },
        { name: "Italian", pct: 22, color: T.green },
        { name: "Mexican", pct: 19, color: T.accent2 },
        { name: "American", pct: 15, color: "#C8B9D8" },
        { name: "Other", pct: 10, color: T.gray },
      ],
      restaurants: [
        { name: "Sugarfish", spent: 3420, visits: 74, dish: "Trust Me", target: "sugarfish" },
        { name: "The Rustic Table", spent: 1980, visits: 41, dish: "Margaritas" },
        { name: "Albertos", spent: 1470, visits: 32, dish: "Strip Steak" },
        { name: "The Olive Grove", spent: 1120, visits: 24, dish: "Branzino" },
        { name: "The Golden Fork", spent: 870, visits: 19, dish: "Ribeye" },
      ],
      patterns: [
        { icon: "⏰", label: "Peak time", value: "7–9 PM" },
        { icon: "📆", label: "Best day", value: "Friday" },
        { icon: "👥", label: "Avg group", value: "3.4 ppl" },
        { icon: "💰", label: "Avg tip", value: "20.2%" },
        { icon: "🍻", label: "Drinks", value: "32%" },
        { icon: "🔥", label: "Streak", value: "58 weeks" },
      ],
      recent: [
        { name: "Dinner at Sugarfish", date: "Apr 22", price: "$82.08" },
        { name: "Brunch at The Olive Grove", date: "Feb 15", price: "$14.00" },
        { name: "Drinks at The Rustic Table", date: "Jan 10", price: "$12.50" },
      ],
    },
    all: {
      bigStats: [
        { v: "$28,610", l: "Spent" },
        { v: "$39", l: "Avg" },
        { v: "724", l: "Meals" },
      ],
      cuisines: [
        { name: "Japanese", pct: 30, color: T.accent },
        { name: "Italian", pct: 22, color: T.green },
        { name: "Mexican", pct: 20, color: T.accent2 },
        { name: "American", pct: 16, color: "#C8B9D8" },
        { name: "Other", pct: 12, color: T.gray },
      ],
      restaurants: [
        { name: "Sugarfish", spent: 11240, visits: 218, dish: "Trust Me", target: "sugarfish" },
        { name: "The Rustic Table", spent: 5780, visits: 124, dish: "Margaritas" },
        { name: "Albertos", spent: 4120, visits: 96, dish: "Strip Steak" },
        { name: "The Olive Grove", spent: 3560, visits: 81, dish: "Branzino" },
        { name: "The Golden Fork", spent: 2540, visits: 62, dish: "Ribeye" },
      ],
      patterns: [
        { icon: "⏰", label: "Peak time", value: "7–9 PM" },
        { icon: "📆", label: "Best day", value: "Saturday" },
        { icon: "👥", label: "Avg group", value: "3.3 ppl" },
        { icon: "💰", label: "Avg tip", value: "20.0%" },
        { icon: "🍻", label: "Drinks", value: "33%" },
        { icon: "🔥", label: "Streak", value: "All time" },
      ],
      recent: [
        { name: "Dinner at Sugarfish", date: "Apr 22", price: "$82.08" },
        { name: "Brunch at The Olive Grove", date: "Feb 15 '26", price: "$14.00" },
        { name: "Drinks at The Rustic Table", date: "Jan 10 '26", price: "$12.50" },
      ],
    },
  };

  const { bigStats, cuisines, restaurants, patterns, recent } = PERIOD_DATA[period];

  return (
    <div className="relative w-full h-full font-grotesk flex flex-col" style={{ background: T.cream, color: T.ink }}>
      <StatusBar />
      <div className="flex items-center justify-between" style={{ padding: "3.4cqw 6cqw 2.4cqw" }}>
        <button
          onClick={() => dispatch({ type: "GOTO", screen: "dashboard" })}
          aria-label="Back"
          className="grid place-items-center font-bold rounded-full transition active:scale-90"
          style={{
            width: "11%",
            aspectRatio: "1",
            background: T.ink,
            color: T.cream,
            fontSize: "7.4cqw",
            lineHeight: 1,
            boxShadow: "0 4px 12px rgba(14,14,14,0.18)",
          }}
        >
          ❮
        </button>
        <span className="font-bold" style={{ fontSize: "5.3cqw", letterSpacing: "-0.02em" }}>
          Smart Receipts
        </span>
        <span style={{ width: "11%" }} />
      </div>

      {/* Period filter */}
      <div className="flex" style={{ padding: "0 6cqw 2.4cqw", gap: "1.8cqw" }}>
        {(["week", "month", "year", "all"] as const).map((p) => {
          const active = p === period;
          return (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className="font-semibold transition flex-1"
              style={{
                fontSize: "3.1cqw",
                padding: "1.7cqw 0",
                borderRadius: "999px",
                background: active ? T.ink : T.white,
                color: active ? T.cream : T.gray,
                border: active ? "none" : "1px solid rgba(14,14,14,0.08)",
                textTransform: "capitalize",
              }}
            >
              {p}
            </button>
          );
        })}
      </div>

      {/* Scrollable body */}
      <div
        className="flex-1 overflow-y-auto no-scrollbar"
        data-lenis-prevent
        style={{ padding: "0 6cqw 4.8cqw", overscrollBehavior: "contain", WebkitOverflowScrolling: "touch" }}
      >
        {/* Big stats card */}
        <div
          className="grid grid-cols-3"
          style={{
            background: T.ink,
            color: T.cream,
            borderRadius: "4.2cqw",
            padding: "4.8cqw 3.6cqw",
            gap: "2.4cqw",
          }}
        >
          {bigStats.map((s) => (
            <div key={s.l} className="text-center">
              <div className="font-grotesk font-bold tabular-nums" style={{ fontSize: "6.7cqw", letterSpacing: "-0.02em" }}>
                {s.v}
              </div>
              <div
                className="uppercase font-semibold"
                style={{ fontSize: "2.4cqw", color: "rgba(248,244,240,0.5)", letterSpacing: "0.18em", marginTop: "0.6cqw" }}
              >
                {s.l}
              </div>
            </div>
          ))}
        </div>

        {/* Cuisine bar */}
        <div style={{ marginTop: "3.6cqw" }}>
          <div
            className="uppercase font-semibold"
            style={{ fontSize: "2.9cqw", color: T.gray, letterSpacing: "0.16em", marginBottom: "1.8cqw" }}
          >
            Cuisine mix
          </div>
          <div className="flex w-full overflow-hidden" style={{ borderRadius: "999px", height: "3.6cqw" }}>
            {cuisines.map((c) => (
              <span key={c.name} style={{ width: `${c.pct}%`, background: c.color }} />
            ))}
          </div>
          <div className="flex flex-wrap" style={{ gap: "1.8cqw", marginTop: "1.8cqw" }}>
            {cuisines.map((c) => (
              <div key={c.name} className="flex items-center" style={{ gap: "1cqw" }}>
                <span style={{ width: "2.2cqw", height: "2.2cqw", borderRadius: "999px", background: c.color }} />
                <span style={{ fontSize: "2.9cqw", color: T.ink, fontWeight: 500 }}>
                  {c.name} {c.pct}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Dining patterns grid (Figma 439:1794) */}
        <div style={{ marginTop: "4.2cqw" }}>
          <div
            className="uppercase font-semibold"
            style={{ fontSize: "2.9cqw", color: T.gray, letterSpacing: "0.16em", marginBottom: "1.8cqw" }}
          >
            Dining patterns
          </div>
          <div className="grid grid-cols-3" style={{ gap: "1.8cqw" }}>
            {patterns.map((p) => (
              <div
                key={p.label}
                style={{
                  background: T.white,
                  borderRadius: "3cqw",
                  padding: "3cqw 2.4cqw",
                  border: "1px solid rgba(14,14,14,0.06)",
                }}
              >
                <div style={{ fontSize: "4.8cqw", lineHeight: 1 }}>{p.icon}</div>
                <div
                  className="font-grotesk font-bold tabular-nums"
                  style={{ fontSize: "3.6cqw", marginTop: "1.2cqw", letterSpacing: "-0.02em" }}
                >
                  {p.value}
                </div>
                <div style={{ fontSize: "2.4cqw", color: T.gray, marginTop: "0.5cqw", fontWeight: 500 }}>
                  {p.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top restaurants — Sugarfish is tappable */}
        <div style={{ marginTop: "4.2cqw" }}>
          <div
            className="flex items-center justify-between"
            style={{ marginBottom: "1.8cqw" }}
          >
            <div
              className="uppercase font-semibold"
              style={{ fontSize: "2.9cqw", color: T.gray, letterSpacing: "0.16em" }}
            >
              Top restaurants
            </div>
            <div style={{ fontSize: "2.6cqw", color: T.accent, fontWeight: 600 }}>
              Tap Sugarfish ↓
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "1.4cqw" }}>
            {restaurants.map((r) => {
              const tappable = !!r.target;
              const inner = (
                <div
                  className="flex items-center"
                  style={{
                    gap: "3cqw",
                    padding: "2.9cqw 3.6cqw",
                    background: tappable ? T.white : "transparent",
                    border: tappable ? `1px solid ${T.accent}` : "1px solid rgba(14,14,14,0.06)",
                    borderRadius: "3cqw",
                  }}
                >
                  {tappable && (
                    <span
                      className="rounded-full grid place-items-center"
                      style={{ width: "9.6cqw", height: "9.6cqw", background: T.peachSoft, fontSize: "4.3cqw" }}
                    >
                      🐟
                    </span>
                  )}
                  <span className="flex-1 text-left min-w-0">
                    <span
                      className="block"
                      style={{
                        fontSize: "3.6cqw",
                        fontWeight: 600,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {r.name}
                    </span>
                    <span className="block" style={{ fontSize: "2.6cqw", color: T.gray, marginTop: "0.4cqw", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {r.visits} visits · usual: {r.dish}
                    </span>
                  </span>
                  <span
                    className="font-grotesk font-bold tabular-nums text-right"
                    style={{ fontSize: "3.8cqw", minWidth: "18cqw", flexShrink: 0, fontVariantNumeric: "tabular-nums" }}
                  >
                    ${r.spent}
                  </span>
                  {tappable && (
                    <span style={{ fontSize: "3.6cqw", color: T.accent, marginLeft: "0.7cqw" }}>›</span>
                  )}
                </div>
              );
              return tappable ? (
                <button
                  key={r.name}
                  onClick={() => dispatch({ type: "GOTO", screen: r.target! })}
                  className="block transition active:scale-[0.99]"
                >
                  {inner}
                </button>
              ) : (
                <div key={r.name}>{inner}</div>
              );
            })}
          </div>
        </div>

        {/* Recent visits */}
        <div style={{ marginTop: "4.2cqw" }}>
          <div
            className="uppercase font-semibold"
            style={{ fontSize: "2.9cqw", color: T.gray, letterSpacing: "0.16em", marginBottom: "1.8cqw" }}
          >
            Recent
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "1.4cqw" }}>
            {recent.map((v) => (
              <div key={v.name} className="flex items-center" style={{ padding: "1.7cqw 0", borderBottom: "1px solid rgba(14,14,14,0.06)", gap: "3cqw" }}>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold" style={{ fontSize: "3.1cqw", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v.name}</div>
                  <div style={{ fontSize: "2.4cqw", color: T.gray, marginTop: "0.4cqw" }}>{v.date}</div>
                </div>
                <span
                  className="tabular-nums font-semibold text-right"
                  style={{ fontSize: "3.1cqw", minWidth: "16cqw", flexShrink: 0, fontVariantNumeric: "tabular-nums" }}
                >
                  {v.price}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Itemized Bill — line-by-line breakdown of who paid what
// ─────────────────────────────────────────────────────────────────

function ItemizedScreen({ state, dispatch }: RouterProps) {
  const claimedItems = ITEMS.filter((i) => (state.claims[i.id] ?? []).length > 0);
  const subtotalsByDiner = (["you", "maya", "sam", "jake"] as Diner[]).map((d) => ({
    diner: d,
    name: DINERS[d].name,
    color: DINERS[d].color,
    initials: DINERS[d].initials,
    amount: shareForDiner(state.claims, state.customSplits, d),
  }));
  const billSubtotal = subtotalsByDiner.reduce((a, b) => a + b.amount, 0);
  const billTip = billSubtotal * (typeof state.tipPct === "number" ? state.tipPct / 100 : 0);
  const billTax = billSubtotal * TAX_RATE;
  const billTotal = billSubtotal + billTip + billTax;

  return (
    <div className="relative w-full h-full font-grotesk flex flex-col" style={{ background: T.cream, color: T.ink }}>
      <StatusBar />
      <div className="flex items-center justify-between" style={{ padding: "3.4cqw 6cqw 2.4cqw" }}>
        <button
          onClick={() => dispatch({ type: "GOTO", screen: "dashboard" })}
          aria-label="Back"
          className="grid place-items-center font-bold rounded-full transition active:scale-90"
          style={{
            width: "11%",
            aspectRatio: "1",
            background: T.ink,
            color: T.cream,
            fontSize: "7.4cqw",
            lineHeight: 1,
            boxShadow: "0 4px 12px rgba(14,14,14,0.18)",
          }}
        >
          ❮
        </button>
        <span className="font-bold" style={{ fontSize: "5.3cqw", letterSpacing: "-0.02em" }}>
          Itemized Bill
        </span>
        <span style={{ width: "11%" }} />
      </div>

      {/* Restaurant header strip */}
      <div style={{ padding: "0 6cqw 2.4cqw" }}>
        <div
          style={{
            background: T.white,
            borderRadius: "3.6cqw",
            padding: "2.9cqw 3.6cqw",
            border: "1px solid rgba(14,14,14,0.06)",
          }}
        >
          <div className="font-bold" style={{ fontSize: "3.8cqw", letterSpacing: "-0.01em" }}>
            Alberto&apos;s · Table 12
          </div>
          <div style={{ fontSize: "2.9cqw", color: T.gray, marginTop: "0.5cqw" }}>
            Apr 22, 2026 · 4 diners
          </div>
        </div>
      </div>

      {/* Body — items + per-diner */}
      <div
        className="flex-1 overflow-y-auto no-scrollbar"
        data-lenis-prevent
        style={{ padding: "0 6cqw 3.6cqw", overscrollBehavior: "contain", WebkitOverflowScrolling: "touch" }}
      >
        {/* Items */}
        <div
          className="uppercase font-semibold"
          style={{ fontSize: "2.9cqw", color: T.gray, letterSpacing: "0.16em", marginTop: "1.2cqw", marginBottom: "1.8cqw" }}
        >
          Items
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "1.7cqw" }}>
          {claimedItems.length === 0 && (
            <div style={{ fontSize: "3.1cqw", color: T.gray, fontStyle: "italic" }}>
              No items claimed in this demo run.
            </div>
          )}
          {claimedItems.map((item) => {
            const claimedBy = state.claims[item.id] ?? [];
            const lineTotal = (item.qty ?? 1) * item.price;
            return (
              <div
                key={item.id}
                className="flex items-center"
                style={{
                  background: T.white,
                  borderRadius: "3cqw",
                  padding: "2.4cqw 3cqw",
                  gap: "3cqw",
                  border: "1px solid rgba(14,14,14,0.06)",
                }}
              >
                <span className="flex shrink-0">
                  {claimedBy.slice(0, 4).map((d, i) => (
                    <span
                      key={d}
                      className="aspect-square rounded-full grid place-items-center font-bold"
                      style={{
                        width: "7.2cqw",
                        background: DINERS[d].color,
                        color: d === "you" ? T.white : T.ink,
                        border: `1.5px solid ${T.cream}`,
                        marginLeft: i === 0 ? 0 : "-1.7cqw",
                        fontSize: "2.2cqw",
                        zIndex: 4 - i,
                      }}
                    >
                      {DINERS[d].initials}
                    </span>
                  ))}
                </span>
                <span className="flex-1 min-w-0">
                  <span
                    className="block font-medium"
                    style={{
                      fontSize: "3.4cqw",
                      lineHeight: 1.25,
                      overflow: "hidden",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      wordBreak: "break-word",
                    }}
                  >
                    {item.qty && item.qty > 1 ? `${item.qty}× ` : ""}
                    {item.name}
                  </span>
                  {claimedBy.length > 1 && (
                    <span className="block" style={{ fontSize: "2.4cqw", color: T.gray, marginTop: "0.5cqw" }}>
                      split {claimedBy.length} ways
                    </span>
                  )}
                </span>
                <span
                  className="font-grotesk font-bold tabular-nums text-right"
                  style={{ fontSize: "3.4cqw", minWidth: "14cqw", flexShrink: 0, fontVariantNumeric: "tabular-nums" }}
                >
                  {fmt(lineTotal)}
                </span>
              </div>
            );
          })}
        </div>

        {/* Per-person */}
        <div
          className="uppercase font-semibold"
          style={{ fontSize: "2.9cqw", color: T.gray, letterSpacing: "0.16em", marginTop: "3.6cqw", marginBottom: "1.8cqw" }}
        >
          Per person
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "1.4cqw" }}>
          {subtotalsByDiner.map((p) => (
            <div
              key={p.diner}
              className="flex items-center"
              style={{ padding: "1.7cqw 0", borderBottom: "1px solid rgba(14,14,14,0.06)", gap: "3cqw" }}
            >
              <span
                className="rounded-full grid place-items-center font-bold shrink-0"
                style={{
                  width: "9.6cqw",
                  height: "9.6cqw",
                  background: p.color,
                  color: p.diner === "you" ? T.white : T.ink,
                  fontSize: "2.9cqw",
                }}
              >
                {p.initials}
              </span>
              <span className="flex-1 font-semibold" style={{ fontSize: "3.6cqw" }}>
                {p.name}
              </span>
              <span
                className="font-grotesk font-bold tabular-nums text-right"
                style={{ fontSize: "3.8cqw", minWidth: "18cqw", flexShrink: 0, fontVariantNumeric: "tabular-nums" }}
              >
                {fmt(p.amount)}
              </span>
            </div>
          ))}
        </div>

        {/* Bill totals */}
        <div
          style={{
            background: T.ink,
            color: T.cream,
            borderRadius: "3.6cqw",
            padding: "3.6cqw 4.2cqw",
            marginTop: "3.6cqw",
            display: "flex",
            flexDirection: "column",
            gap: "1.4cqw",
            fontSize: "3.1cqw",
          }}
        >
          <BillRow k="Subtotal" v={fmt(billSubtotal)} />
          <BillRow k="Tip" v={fmt(billTip)} />
          <BillRow k="Tax (8.25%)" v={fmt(billTax)} />
          <div style={{ borderTop: "1px solid rgba(248,244,240,0.15)", paddingTop: "1.4cqw" }}>
            <BillRow k="Total" v={fmt(billTotal)} bold />
          </div>
        </div>
      </div>

      {/* Continue */}
      <div style={{ padding: "2.4cqw 6cqw 6cqw" }}>
        <button
          onClick={() => dispatch({ type: "GOTO", screen: "insights" })}
          className="w-full font-bold transition active:scale-95"
          style={{
            borderRadius: "999px",
            background: T.green,
            color: T.ink,
            padding: "4.8cqw 0",
            fontSize: "3.8cqw",
            boxShadow: "0 14px 32px -14px rgba(2,213,124,0.6)",
          }}
        >
          Continue to Insights
        </button>
      </div>
    </div>
  );
}

function BillRow({ k, v, bold }: { k: string; v: string; bold?: boolean }) {
  return (
    <div
      className="flex justify-between items-baseline"
      style={{ color: bold ? T.cream : "rgba(248,244,240,0.65)", fontWeight: bold ? 700 : 400, fontSize: bold ? "3.6cqw" : "3.1cqw" }}
    >
      <span>{k}</span>
      <span
        className="tabular-nums text-right"
        style={{ minWidth: "18cqw", flexShrink: 0, fontVariantNumeric: "tabular-nums" }}
      >
        {v}
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// History detail — past-tab view opened from dashboard history row.
// Restaurant header is tappable and routes to SugarfishScreen
// (the generic "restaurant page" template).
// ─────────────────────────────────────────────────────────────────

function HistoryDetailScreen({ state, dispatch }: RouterProps) {
  const entry = state.historyIdx != null ? HISTORY_DATA[state.historyIdx] : null;
  if (!entry) return null;

  const subtotalsByDiner = entry.diners.map((d) => ({
    diner: d,
    name: DINERS[d].name,
    color: DINERS[d].color,
    initials: DINERS[d].initials,
    amount: entry.items.reduce((sum, it) => {
      if (!it.claimedBy.includes(d)) return sum;
      return sum + (it.qty * it.price) / it.claimedBy.length;
    }, 0),
  }));
  const billSubtotal = subtotalsByDiner.reduce((a, b) => a + b.amount, 0);
  const billTip = billSubtotal * entry.tipPct;
  const billTax = billSubtotal * TAX_RATE;
  const billTotal = billSubtotal + billTip + billTax;

  return (
    <div className="relative w-full h-full font-grotesk flex flex-col" style={{ background: T.cream, color: T.ink }}>
      <StatusBar />
      <div className="flex items-center justify-between" style={{ padding: "3.4cqw 6cqw 2.4cqw" }}>
        <button
          onClick={() => dispatch({ type: "GOTO", screen: "dashboard" })}
          aria-label="Back to home"
          className="grid place-items-center font-bold rounded-full transition active:scale-90"
          style={{
            width: "11%",
            aspectRatio: "1",
            background: T.ink,
            color: T.cream,
            fontSize: "7.4cqw",
            lineHeight: 1,
            boxShadow: "0 4px 12px rgba(14,14,14,0.18)",
          }}
        >
          ❮
        </button>
        <span className="font-bold" style={{ fontSize: "5.3cqw", letterSpacing: "-0.02em" }}>
          Past tab
        </span>
        <span style={{ width: "11%" }} />
      </div>

      {/* Tappable restaurant header — opens the restaurant page (Sugarfish template) */}
      <div style={{ padding: "0 6cqw 2.4cqw" }}>
        <button
          onClick={() => dispatch({ type: "GOTO", screen: "sugarfish" })}
          className="w-full text-left transition active:scale-[0.99] hover:bg-black/[0.02]"
          style={{
            background: T.white,
            borderRadius: "3.6cqw",
            padding: "2.9cqw 3.6cqw",
            border: "1px solid rgba(14,14,14,0.06)",
            display: "flex",
            alignItems: "center",
            gap: "3cqw",
          }}
          aria-label={`Open ${entry.restaurant} page`}
        >
          <span className="flex-1 min-w-0">
            <span className="block font-bold" style={{ fontSize: "3.8cqw", letterSpacing: "-0.01em" }}>
              {entry.restaurant} · {entry.tableNo}
            </span>
            <span className="block" style={{ fontSize: "2.9cqw", color: T.gray, marginTop: "0.5cqw" }}>
              {entry.date} · {entry.diners.length} diners
            </span>
          </span>
          <span style={{ fontSize: "4.2cqw", color: T.gray, flexShrink: 0 }}>›</span>
        </button>
      </div>

      {/* Body — items + per-diner */}
      <div
        className="flex-1 overflow-y-auto no-scrollbar"
        data-lenis-prevent
        style={{ padding: "0 6cqw 3.6cqw", overscrollBehavior: "contain", WebkitOverflowScrolling: "touch" }}
      >
        <div
          className="uppercase font-semibold"
          style={{ fontSize: "2.9cqw", color: T.gray, letterSpacing: "0.16em", marginTop: "1.2cqw", marginBottom: "1.8cqw" }}
        >
          Items
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "1.7cqw" }}>
          {entry.items.map((item, i) => {
            const lineTotal = item.qty * item.price;
            return (
              <div
                key={`${item.name}-${i}`}
                className="flex items-center"
                style={{
                  background: T.white,
                  borderRadius: "3cqw",
                  padding: "2.4cqw 3cqw",
                  gap: "3cqw",
                  border: "1px solid rgba(14,14,14,0.06)",
                }}
              >
                <span className="flex shrink-0">
                  {item.claimedBy.slice(0, 4).map((d, j) => (
                    <span
                      key={d}
                      className="aspect-square rounded-full grid place-items-center font-bold"
                      style={{
                        width: "7.2cqw",
                        background: DINERS[d].color,
                        color: d === "you" ? T.white : T.ink,
                        border: `1.5px solid ${T.cream}`,
                        marginLeft: j === 0 ? 0 : "-1.7cqw",
                        fontSize: "2.2cqw",
                        zIndex: 4 - j,
                      }}
                    >
                      {DINERS[d].initials}
                    </span>
                  ))}
                </span>
                <span className="flex-1 min-w-0">
                  <span
                    className="block font-medium"
                    style={{
                      fontSize: "3.4cqw",
                      lineHeight: 1.25,
                      overflow: "hidden",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      wordBreak: "break-word",
                    }}
                  >
                    {item.qty > 1 ? `${item.qty}× ` : ""}
                    {item.name}
                  </span>
                  {item.claimedBy.length > 1 && (
                    <span className="block" style={{ fontSize: "2.4cqw", color: T.gray, marginTop: "0.5cqw" }}>
                      split {item.claimedBy.length} ways
                    </span>
                  )}
                </span>
                <span
                  className="font-grotesk font-bold tabular-nums text-right"
                  style={{ fontSize: "3.4cqw", minWidth: "14cqw", flexShrink: 0, fontVariantNumeric: "tabular-nums" }}
                >
                  {fmt(lineTotal)}
                </span>
              </div>
            );
          })}
        </div>

        <div
          className="uppercase font-semibold"
          style={{ fontSize: "2.9cqw", color: T.gray, letterSpacing: "0.16em", marginTop: "3.6cqw", marginBottom: "1.8cqw" }}
        >
          Per person
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "1.4cqw" }}>
          {subtotalsByDiner.map((p) => (
            <div
              key={p.diner}
              className="flex items-center"
              style={{ padding: "1.7cqw 0", borderBottom: "1px solid rgba(14,14,14,0.06)", gap: "3cqw" }}
            >
              <span
                className="rounded-full grid place-items-center font-bold shrink-0"
                style={{
                  width: "9.6cqw",
                  height: "9.6cqw",
                  background: p.color,
                  color: p.diner === "you" ? T.white : T.ink,
                  fontSize: "2.9cqw",
                }}
              >
                {p.initials}
              </span>
              <span className="flex-1 font-semibold" style={{ fontSize: "3.6cqw" }}>
                {p.name}
              </span>
              <span
                className="font-grotesk font-bold tabular-nums text-right"
                style={{ fontSize: "3.8cqw", minWidth: "18cqw", flexShrink: 0, fontVariantNumeric: "tabular-nums" }}
              >
                {fmt(p.amount * (1 + entry.tipPct + TAX_RATE))}
              </span>
            </div>
          ))}
        </div>

        <div
          style={{
            background: T.ink,
            color: T.cream,
            borderRadius: "3.6cqw",
            padding: "3.6cqw 4.2cqw",
            marginTop: "3.6cqw",
            display: "flex",
            flexDirection: "column",
            gap: "1.4cqw",
            fontSize: "3.1cqw",
          }}
        >
          <BillRow k="Subtotal" v={fmt(billSubtotal)} />
          <BillRow k={`Tip (${Math.round(entry.tipPct * 100)}%)`} v={fmt(billTip)} />
          <BillRow k="Tax (8.25%)" v={fmt(billTax)} />
          <div style={{ borderTop: "1px solid rgba(248,244,240,0.15)", paddingTop: "1.4cqw" }}>
            <BillRow k="Total" v={fmt(billTotal)} bold />
          </div>
        </div>
      </div>

      {/* Primary action — open restaurant page */}
      <div style={{ padding: "2.4cqw 6cqw 6cqw" }}>
        <button
          onClick={() => dispatch({ type: "GOTO", screen: "sugarfish" })}
          className="w-full font-bold transition active:scale-95"
          style={{
            borderRadius: "999px",
            background: T.ink,
            color: T.cream,
            padding: "4.8cqw 0",
            fontSize: "3.8cqw",
          }}
        >
          View {entry.restaurant} →
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Replay screen — end-of-demo prompt
// ─────────────────────────────────────────────────────────────────

function ReplayScreen({ dispatch }: RouterProps) {
  return (
    <div
      className="relative w-full h-full font-grotesk flex flex-col"
      style={{ background: T.cream, color: T.ink }}
    >
      <StatusBar />

      {/* Centered hero */}
      <div className="flex-1 flex flex-col items-center justify-center" style={{ padding: "0 7%" }}>
        <motion.div
          className="rounded-[30%] grid place-items-center overflow-hidden"
          style={{
            width: "30%",
            aspectRatio: "1",
            background: T.ink,
            boxShadow: "0 18px 40px -14px rgba(14,14,14,0.55)",
          }}
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 18 }}
        >
          <img
            src={LOGO}
            alt="Tabby"
            className="block w-full h-full object-contain"
            draggable={false}
          />
        </motion.div>

        <div
          className="font-grotesk font-bold text-center"
          style={{ fontSize: "10.8cqw", letterSpacing: "-0.03em", marginTop: "4.8cqw", lineHeight: 1.05 }}
        >
          That&apos;s
          <br />
          Tabby.
        </div>
      </div>

      {/* CTAs pinned to bottom */}
      <div style={{ padding: "0 7% 7.2cqw", display: "flex", flexDirection: "column", gap: "2.4cqw" }}>
        <button
          onClick={() => dispatch({ type: "RESET" })}
          className="w-full font-bold transition active:scale-95"
          style={{
            borderRadius: "999px",
            background: T.ink,
            color: T.cream,
            padding: "4.8cqw 0",
            fontSize: "4.1cqw",
            boxShadow: "0 14px 32px -14px rgba(14,14,14,0.4)",
          }}
        >
          Replay demo
        </button>
        <a
          href="/waitlist"
          className="w-full font-bold transition active:scale-95 text-center"
          style={{
            borderRadius: "999px",
            background: T.accent,
            color: "#fff",
            padding: "4.8cqw 0",
            fontSize: "4.1cqw",
            boxShadow: "0 14px 32px -14px rgba(255,124,97,0.6)",
          }}
        >
          Join the waitlist →
        </a>
      </div>
    </div>
  );
}

