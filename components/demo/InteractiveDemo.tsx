"use client";
import {
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx } from "clsx";
import { LOGO } from "@/lib/images";

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
  | "card"
  | "success"
  | "itemized"   // line-by-line breakdown of who paid what
  | "insights"
  | "sugarfish"
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
  { id: "visa", group: "card", name: "Visa — 7793", meta: "3% fee", logo: "VISA", logoBg: "#FFFFFF", logoColor: "#1A4079" },
  { id: "amex", group: "card", name: "AmEx — 8732", meta: "3% fee", logo: "AmEx", logoBg: "#0066B2" },
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
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "GOTO":
      return { ...state, screen: action.screen };
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
  success: "Done",
  itemized: "Bill",
  insights: "Insights",
  sugarfish: "Spot",
  replay: "Replay",
};

// ─────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────

export function InteractiveDemo() {
  const [state, dispatch] = useReducer(reducer, INITIAL);

  const yourSubtotal = shareForDiner(state.claims, state.customSplits, "you");
  const tipPct = typeof state.tipPct === "number" ? state.tipPct : 0;
  const tip = (yourSubtotal * tipPct) / 100;
  const tax = yourSubtotal * TAX_RATE;
  const yourTotal = yourSubtotal + tip + tax;

  const stepIdx = STEP_ORDER.indexOf(state.screen);

  return (
    <div className="mx-auto max-w-[1100px] flex flex-col" style={{ minHeight: "calc(100vh - 60px)" }}>
      {/* Top bar: title left, dot stepper center, reset right — single row */}
      <div className="flex items-center gap-4 flex-wrap">
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
              <img
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

        <div className="flex-1 min-w-[80px]" />

        <div className="flex items-center gap-1.5">
          {STEP_ORDER.map((s, i) => {
            const active = i === stepIdx;
            const done = i < stepIdx;
            return (
              <button
                key={s}
                onClick={() => dispatch({ type: "GOTO", screen: s })}
                aria-label={`Go to ${STEP_LABEL[s]}`}
                className="rounded-full transition-all"
                style={{
                  height: 6,
                  width: active ? 22 : 6,
                  background: active ? T.accent : done ? T.green : "rgba(14,14,14,0.15)",
                }}
              />
            );
          })}
        </div>

        <span
          className="text-[10px] uppercase tracking-[0.22em] font-semibold whitespace-nowrap"
          style={{ color: T.gray }}
        >
          {String(stepIdx + 1).padStart(2, "0")}/{STEP_ORDER.length}{" "}
          <span style={{ color: T.ink }}>{STEP_LABEL[state.screen]}</span>
        </span>

        <button
          onClick={() => dispatch({ type: "RESET" })}
          className="text-[11px] uppercase tracking-[0.22em] font-semibold transition px-3 py-1.5 rounded-full hover:bg-line/5"
          style={{ color: T.gray }}
        >
          ↺ reset
        </button>
      </div>

      {/* Phone — flexes to fill all remaining vertical space */}
      <div className="flex-1 flex flex-col justify-center items-center min-h-0 py-2 gap-3">
        {(state.screen === "insights" || state.screen === "sugarfish") && (
          <span
            className="inline-flex items-center uppercase font-bold whitespace-nowrap"
            style={{
              background: T.accent,
              color: "#fff",
              fontSize: "0.78rem",
              letterSpacing: "0.22em",
              padding: "0.55rem 1.15rem",
              borderRadius: "999px",
              boxShadow: "0 8px 22px -6px rgba(255,124,97,0.55)",
            }}
          >
            Pro · Coming later
          </span>
        )}
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
    eyebrow: "step 05 / one-time card",
    title: "Tap to pay.",
    body: "Tabby Pro mints a single-use card capped at your share. Hold the phone near the reader — the card dies the moment settlement clears.",
  },
  success: {
    eyebrow: "tab closed",
    title: "Walk out.",
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
  // Width-only sizing driven by .demo-phone-shell + aspect-[9/19.5]
  // takes care of height — picks the smaller of vertical-bound and
  // horizontal-bound width so the phone always fits both axes.
  return (
    <div className="demo-phone-shell relative aspect-[9/19.5] mx-auto">
      <div
        aria-hidden
        className="absolute -inset-12 rounded-full blur-3xl pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 50% 35%, rgba(255,124,97,0.32), transparent 60%)",
        }}
      />
      <div
        className="absolute inset-0 rounded-[2.6rem] p-[0.5rem] shadow-[0_60px_120px_-30px_rgba(14,14,14,0.6)]"
        style={{ background: "#0a0a0a" }}
      >
        <div
          className="relative w-full h-full rounded-[2.2rem] overflow-hidden"
          style={{ background: T.cream, containerType: "inline-size" }}
        >
          <div
            className="absolute top-1.5 left-1/2 -translate-x-1/2 rounded-full z-30"
            style={{ background: "#0a0a0a", width: "28%", height: "2.6%" }}
          />
          {children}
        </div>
      </div>
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
  return (
    <div className="absolute inset-0">
      <AnimatePresence mode="wait">
        <motion.div
          key={props.state.screen}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.32 }}
          className="absolute inset-0"
        >
          {props.state.screen === "camera" && <CameraScreen {...props} />}
          {props.state.screen === "scanning" && <ScanningScreen {...props} />}
          {props.state.screen === "items" && <ItemsScreen {...props} />}
          {props.state.screen === "tip" && <TipScreen {...props} />}
          {props.state.screen === "payment" && <PaymentScreen {...props} />}
          {props.state.screen === "card" && <CardScreen {...props} />}
          {props.state.screen === "success" && <SuccessScreen {...props} />}
          {props.state.screen === "dashboard" && <DashboardScreen {...props} />}
          {props.state.screen === "friends" && <FriendsScreen {...props} />}
          {props.state.screen === "itemized" && <ItemizedScreen {...props} />}
          {props.state.screen === "sugarfish" && <SugarfishScreen {...props} />}
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
      <span className="flex items-center" style={{ gap: "1.3cqw" }}>
        <span>•••</span>
        <span
          className="inline-block rounded-sm border"
          style={{ width: "4.3cqw", height: "2.4cqw", borderColor: color }}
        />
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
            fontSize: "5.4cqw",
            lineHeight: 1,
          }}
        >
          ‹
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
          <span style={{ fontSize: "6.7cqw" }}>‹</span>
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
            fontSize: "3.7cqw",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            fontWeight: 600,
            padding: "2.6cqw 0",
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

      {/* Pay pill */}
      <div style={{ padding: "3.4cqw 10.1cqw 8.4cqw" }}>
        <button
          disabled={yourClaims === 0}
          onClick={() => dispatch({ type: "GOTO", screen: "tip" })}
          className="w-full text-center font-bold transition active:scale-95"
          style={{
            borderRadius: "999px",
            padding: "6.7cqw 0",
            fontSize: "5.4cqw",
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
              ‹
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
            <span style={{ fontSize: "6.7cqw" }}>‹</span>
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

      {/* Modal sheet — bumped to 88% height with tighter spacing so the
          green Pay button never overflows. */}
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
          padding: "5cqw 8cqw 5cqw",
          height: "88%",
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

        <div className="flex-1" />

        {/* big green pay pill (Figma) */}
        <button
          onClick={() => dispatch({ type: "GOTO", screen: "payment" })}
          className="w-full font-bold transition active:scale-95"
          style={{
            marginTop: "3cqw",
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
    bank: { icon: "🏦", label: "Bank Accounts" },
    card: { icon: "💳", label: "Cards" },
    conn: { icon: "🔗", label: "Connections" },
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
            ‹
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
            padding: "2.4cqw 5.4cqw",
            fontSize: "4.1cqw",
            gap: "1.7cqw",
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
                className="flex items-center font-medium"
                style={{
                  gap: "2.5cqw",
                  color: T.gray,
                  fontSize: "4.3cqw",
                  marginBottom: "0.7cqw",
                }}
              >
                <span>{groupMeta[g].icon}</span>
                <span>{groupMeta[g].label}</span>
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
            padding: "6.7cqw 0",
            fontSize: "5.4cqw",
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
// 6. Card — Apple-Pay style cream card on dark backdrop (Figma)
// ─────────────────────────────────────────────────────────────────

function CardScreen({ dispatch, yourTotal }: RouterProps) {
  const [phase, setPhase] = useState<"ready" | "tapping" | "done">("ready");

  const onTap = () => {
    if (phase !== "ready") return;
    setPhase("tapping");
    setTimeout(() => {
      setPhase("done");
      setTimeout(() => dispatch({ type: "GOTO", screen: "success" }), 700);
    }, 1200);
  };

  return (
    <div
      className="relative w-full h-full font-grotesk overflow-hidden"
      style={{ background: T.charcoal, color: T.white }}
    >
      <StatusBar dark />

      {/* Cream payment card (Figma reference) */}
      <button
        onClick={onTap}
        className="absolute left-1/2 -translate-x-1/2 cursor-pointer"
        style={{
          top: "16%",
          width: "84%",
          aspectRatio: "1.55/1",
          background: T.cream,
          borderRadius: "8.4cqw",
          boxShadow: "0 30px 60px -20px rgba(0,0,0,0.55)",
          padding: "8.4cqw",
          textAlign: "left",
          color: T.ink,
        }}
      >
        {/* Pay $X.XX top-right */}
        <span
          className="absolute font-bold tabular-nums"
          style={{ top: "8.4cqw", right: "8.4cqw", fontSize: "5.4cqw" }}
        >
          Pay {fmt(yourTotal)}
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
      </button>

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
            fontSize: "8.4cqw",
          }}
          animate={
            phase === "tapping"
              ? { scale: [1, 1.15, 1] }
              : { scale: 1 }
          }
          transition={{ duration: 1, repeat: phase === "tapping" ? Infinity : 0 }}
        >
          ⌂
        </motion.span>
        <span
          className="font-medium block w-full text-center"
          style={{ marginTop: "3.4cqw", fontSize: "5cqw" }}
        >
          {phase === "ready" && "Hold near reader to pay"}
          {phase === "tapping" && "Authorizing…"}
          {phase === "done" && "Approved ✓"}
        </span>
        {phase === "ready" && (
          <motion.span
            className="uppercase font-bold text-center block w-full"
            style={{
              marginTop: "4.2cqw",
              fontSize: "3.4cqw",
              letterSpacing: "0.24em",
              color: T.white,
            }}
            animate={{ opacity: [0.55, 1, 0.55] }}
            transition={{ duration: 1.6, repeat: Infinity }}
          >
            ↑ tap the card to continue
          </motion.span>
        )}
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

const HISTORY_DATA: Array<{ name: string; date: string; price: string }> = [
  { name: "Lunch at The Olive Grove", date: "February 15, 2026", price: "$14.00" },
  { name: "Drinks at The Rustic Table", date: "January 10, 2026", price: "$12.50" },
  { name: "Drinks at The Golden Fork", date: "December 25, 2025", price: "$16.75" },
  { name: "Dinner at The Savory Spot", date: "November 30, 2025", price: "$10.99" },
  { name: "Brunch at The Morning Cafe", date: "March 5, 2026", price: "$18.40" },
];

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
            style={{ width: "14.4cqw", height: "14.4cqw", background: T.cream, color: T.ink, fontSize: "4.3cqw" }}
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
            onClick={() => dispatch({ type: "GOTO", screen: "friends" })}
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
        {HISTORY_DATA.map((h) => (
          <button
            key={h.name}
            type="button"
            onClick={() => dispatch({ type: "GOTO", screen: "itemized" })}
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
              {h.price}
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
            fontSize: "5.4cqw",
            lineHeight: 1,
            boxShadow: "0 4px 12px rgba(14,14,14,0.18)",
          }}
        >
          ‹
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

function SugarfishScreen({ dispatch }: RouterProps) {
  const [mapOpen, setMapOpen] = useState(false);
  return (
    <div className="relative w-full h-full font-grotesk overflow-hidden flex flex-col" style={{ background: T.cream, color: T.ink }}>
      <StatusBar />

      {/* Floating back button — above the map so it stays reachable even
          when the map is collapsed. */}
      <button
        onClick={() => dispatch({ type: "GOTO", screen: "insights" })}
        aria-label="Back to insights"
        className="absolute z-20 grid place-items-center font-bold rounded-full transition active:scale-90"
        style={{
          left: "5%",
          top: "4.5%",
          width: "11%",
          aspectRatio: "1",
          background: T.cream,
          color: T.ink,
          fontSize: "5.4cqw",
          lineHeight: 1,
          boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
        }}
      >
        ‹
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
              🐟
            </span>
          </div>
        )}
      </div>

      {/* Fish badge anchor — zero-height sibling that sits exactly on the
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
          🐟
        </div>
      </div>

      {/* Scrollable body — everything between the map header and the CTA */}
      <div
        className="flex-1 overflow-y-auto no-scrollbar relative"
        data-lenis-prevent
        style={{ overscrollBehavior: "contain", WebkitOverflowScrolling: "touch" }}
      >
      {/* Restaurant header — extra top padding to clear the floating fish badge */}
      <div className="text-center" style={{ paddingTop: "14cqw" }}>
        <div className="font-grotesk font-bold" style={{ fontSize: "6.6cqw", letterSpacing: "-0.02em" }}>
          Sugarfish
        </div>
        <div style={{ fontSize: "3.1cqw", color: T.gray, marginTop: "0.7cqw" }}>
          1345 2nd St., Santa Monica, CA 90401
        </div>
      </div>

      {/* Stats */}
      <div className="flex" style={{ gap: "3.6cqw", padding: "4.8cqw 6cqw 0" }}>
        {[
          { label: "Last Visit", value: "Today" },
          { label: "Average Spend", value: "$144.98" },
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
          {[
            ["Maki Roll", "$7.00"],
            ["Yellowtail Sashimi", "$12.00"],
            ["Grilled Salmon", "$18.00"],
          ].map(([item, price]) => (
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
          {[
            { name: "Maya Chen", color: "#CFAFA6", initials: "MC" },
            { name: "Sam Chisick", color: "#AFCFCB", initials: "SC" },
            { name: "Jake Martinez", color: "#F6C6B3", initials: "JM" },
          ].map((f) => (
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
          {[
            { date: "Today", price: "$82.08", with: "Maya, Sam, Jake" },
            { date: "Jan 5, 2026", price: "$144.98", with: "Maya, Sam" },
            { date: "Nov 12, 2025", price: "$167.40", with: "Sam" },
          ].map((v, i) => (
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
          onClick={() => dispatch({ type: "GOTO", screen: "success" })}
          aria-label="Back"
          className="grid place-items-center font-bold rounded-full transition active:scale-90"
          style={{
            width: "11%",
            aspectRatio: "1",
            background: T.ink,
            color: T.cream,
            fontSize: "5.4cqw",
            lineHeight: 1,
            boxShadow: "0 4px 12px rgba(14,14,14,0.18)",
          }}
        >
          ‹
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
          onClick={() => dispatch({ type: "GOTO", screen: "success" })}
          aria-label="Back"
          className="grid place-items-center font-bold rounded-full transition active:scale-90"
          style={{
            width: "11%",
            aspectRatio: "1",
            background: T.ink,
            color: T.cream,
            fontSize: "5.4cqw",
            lineHeight: 1,
            boxShadow: "0 4px 12px rgba(14,14,14,0.18)",
          }}
        >
          ‹
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
          className="rounded-full grid place-items-center"
          style={{
            width: "30%",
            aspectRatio: "1",
            background: T.accent,
            color: "#fff",
            fontSize: "12cqw",
            boxShadow: "0 18px 40px -14px rgba(255,124,97,0.55)",
          }}
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 18 }}
        >
          ✦
        </motion.div>

        <div
          className="uppercase font-semibold"
          style={{
            fontSize: "3.6cqw",
            letterSpacing: "0.24em",
            color: T.gray,
            marginTop: "4.8cqw",
          }}
        >
          end of demo
        </div>
        <div
          className="font-grotesk font-bold text-center"
          style={{ fontSize: "10.8cqw", letterSpacing: "-0.03em", marginTop: "1.8cqw", lineHeight: 1.05 }}
        >
          That&apos;s
          <br />
          Tabby.
        </div>
        <div
          className="text-center"
          style={{ fontSize: "4.1cqw", color: T.gray, marginTop: "3.6cqw", lineHeight: 1.45, maxWidth: "92%" }}
        >
          2 minutes from sit-down to settled. Replay the demo, or join the waitlist to be first in line.
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

