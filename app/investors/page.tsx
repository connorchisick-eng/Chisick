import type { Metadata } from "next";
import { InteractiveDemo } from "@/components/demo/InteractiveDemo";
import { MoneyFlow } from "@/components/demo/MoneyFlow";
import { MerchantConsole } from "@/components/demo/MerchantConsole";
import { ScrollToTop } from "@/components/ScrollToTop";

export const metadata: Metadata = {
  title: "Investor briefing — Tabby",
  description:
    "A working tour of Tabby's product, money-movement architecture, merchant surface, and unit economics — built on Sila banking rails.",
  robots: { index: false, follow: false },
};

export default function InvestorsPage() {
  return (
    <main className="relative bg-surface overflow-hidden">
      <ScrollToTop />

      {/* ───────── 01 — Cover ───────── */}
      <section className="relative pt-32 pb-24 lg:pt-40 lg:pb-32">
        <div
          className="absolute inset-x-0 top-0 h-[700px] pointer-events-none"
          aria-hidden
          style={{
            background:
              "radial-gradient(60% 60% at 50% 0%, rgba(255,124,97,0.16), transparent 70%)",
          }}
        />
        <div className="relative mx-auto max-w-[1280px] px-6 lg:px-12">
          <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.28em] text-body/50 font-semibold">
            <span className="w-7 h-px bg-body/30" />
            confidential · investor briefing · April 2026
          </div>
          <h1
            className="mt-8 font-grotesk font-bold text-body leading-[0.92]"
            style={{
              fontSize: "clamp(3.5rem, 9.5vw, 9.5rem)",
              letterSpacing: "-0.04em",
            }}
          >
            The bill
            <br />
            settles <span className="italic text-accent">itself.</span>
          </h1>
          <p className="mt-8 text-[1.3rem] md:text-[1.5rem] text-body/65 max-w-[780px] leading-[1.45]">
            Tabby is the consumer rail that makes a four-person dinner check
            close in 2 minutes. We don&apos;t take card fees. We don&apos;t
            hold money. We sit on top of <strong className="text-body">Sila</strong>{" "}
            — chartered banking, FDIC pass-through wallets, ACH licenses — and
            ship a hand-crafted UX that diners actually open at the table.
          </p>

          <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-6">
            <Headline n="$612B" l="US restaurant TAM" />
            <Headline n="2.1×" l="larger group bills via Tabby" />
            <Headline n="0%" l="card fees to merchants" />
            <Headline n="t+1" l="merchant payout via Sila ACH" />
          </div>
        </div>
      </section>

      {/* ───────── 02 — Problem ───────── */}
      <section className="relative bg-ink text-cream py-24 lg:py-32" data-nav-invert>
        <div className="mx-auto max-w-[1280px] px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-5">
            <Eyebrow color="cream">02 / the problem</Eyebrow>
            <h2
              className="mt-5 font-grotesk font-bold leading-[0.95]"
              style={{
                fontSize: "clamp(2.6rem, 5.4vw, 5rem)",
                letterSpacing: "-0.03em",
              }}
            >
              Splitting a check is the worst part of a meal.
            </h2>
          </div>
          <div className="lg:col-span-7 space-y-6 text-cream/75 text-[1.08rem] leading-[1.65]">
            <p>
              An eight-person dinner ends with a calculator passed around the
              table, three Venmo requests that never resolve, one person
              fronting $400 they shouldn&apos;t have, and a server who waits
              eleven minutes to swipe one card.
            </p>
            <p>
              Card networks won&apos;t fix it — every split adds a fee.
              Banking apps won&apos;t fix it — they don&apos;t see the
              receipt. P2P apps won&apos;t fix it — they have no merchant
              relationship.
            </p>
            <div className="grid grid-cols-3 gap-4 pt-2">
              <Hurt n="78%" l="diners avoid splitting" />
              <Hurt n="$23" l="avg unreimbursed per group meal" />
              <Hurt n="11 min" l="server time per split" />
            </div>
          </div>
        </div>
      </section>

      {/* ───────── 03 — Live diner demo ───────── */}
      <section className="relative bg-surface-alt py-24 lg:py-32">
        <div className="mx-auto max-w-[1440px] px-6 lg:px-12">
          <div className="max-w-[800px] mb-16">
            <Eyebrow>03 / the diner experience</Eyebrow>
            <h2
              className="mt-5 font-grotesk font-bold text-body leading-[0.94]"
              style={{
                fontSize: "clamp(2.6rem, 5.4vw, 5rem)",
                letterSpacing: "-0.03em",
              }}
            >
              Watch a tab close.
            </h2>
            <p className="mt-5 text-[1.1rem] text-body/65 max-w-[620px] leading-[1.55]">
              The same hands-on demo a customer sees at <code className="font-mono text-body/80 bg-body/5 px-1.5 py-0.5 rounded">/demo</code>.
              Tap the camera, claim items as &quot;You,&quot; pick a tip, choose a
              payment method, settle with the one-time virtual card — every
              Sila call surfaces as you fire it.
            </p>
          </div>
          <InteractiveDemo />
        </div>
      </section>

      {/* ───────── 04 — Money flow architecture ───────── */}
      <section className="relative bg-surface py-24 lg:py-32">
        <div className="mx-auto max-w-[1280px] px-6 lg:px-12">
          <div className="max-w-[760px] mb-16">
            <Eyebrow>04 / how money actually moves</Eyebrow>
            <h2
              className="mt-5 font-grotesk font-bold text-body leading-[0.95]"
              style={{
                fontSize: "clamp(2.6rem, 5.4vw, 5rem)",
                letterSpacing: "-0.03em",
              }}
            >
              No cards. No <span className="italic text-accent">float.</span>
            </h2>
            <p className="mt-5 text-[1.1rem] text-body/65 leading-[1.55] max-w-[620px]">
              Sila is a chartered banking-as-a-service partner. We
              instrument three of their endpoints —{" "}
              <code className="font-mono text-body/80 bg-body/5 px-1 rounded">issue_sila</code>,{" "}
              <code className="font-mono text-body/80 bg-body/5 px-1 rounded">transfer_sila</code>,{" "}
              <code className="font-mono text-body/80 bg-body/5 px-1 rounded">redeem_sila</code>{" "}
              — and inherit FDIC pass-through, OFAC screening, ACH
              connectivity, and 24/7 settlement.
            </p>
          </div>

          <MoneyFlow />

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <Layer
              eyebrow="layer 1 · tabby"
              title="UX + intent"
              body="OCR, claim engine, group state, push notifications, virtual card. Everything a diner sees and touches."
            />
            <Layer
              eyebrow="layer 2 · sila"
              title="Banking rails"
              body="Wallet ledger, KYC, ACH debit/credit, SILAUSD settlement token, statements, webhooks."
            />
            <Layer
              eyebrow="layer 3 · banks"
              title="Money custody"
              body="Sila&apos;s partner banks (Evolve, Pacific Coast) hold the actual deposits. We never touch them."
            />
          </div>
        </div>
      </section>

      {/* ───────── 05 — Merchant surface ───────── */}
      <section className="relative bg-surface-alt py-24 lg:py-32">
        <div className="mx-auto max-w-[1280px] px-6 lg:px-12">
          <div className="max-w-[760px] mb-12">
            <Eyebrow>05 / the merchant surface</Eyebrow>
            <h2
              className="mt-5 font-grotesk font-bold text-body leading-[0.95]"
              style={{
                fontSize: "clamp(2.6rem, 5.4vw, 5rem)",
                letterSpacing: "-0.03em",
              }}
            >
              The other half of the product.
            </h2>
            <p className="mt-5 text-[1.1rem] text-body/65 leading-[1.55] max-w-[620px]">
              Restaurants get a live view of every open tab and a single
              consolidated ACH credit per shift. No card terminals to babysit,
              no per-diner reconciliation, no chargebacks.
            </p>
          </div>

          <MerchantConsole />

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <CalloutCard
              k="3.2%"
              title="card fees eliminated"
              body="ACH settlement at fractions of a cent vs. interchange."
            />
            <CalloutCard
              k="–84%"
              title="reconciliation time"
              body="One row per shift instead of one per cover."
            />
            <CalloutCard
              k="0"
              title="POS hardware"
              body="QR-code or NFC tap on the existing check presenter."
            />
          </div>
        </div>
      </section>

      {/* ───────── 06 — Unit economics ───────── */}
      <section className="relative bg-ink text-cream py-24 lg:py-32" data-nav-invert>
        <div className="mx-auto max-w-[1280px] px-6 lg:px-12">
          <div className="max-w-[760px] mb-14">
            <Eyebrow color="cream">06 / unit economics</Eyebrow>
            <h2
              className="mt-5 font-grotesk font-bold leading-[0.95]"
              style={{
                fontSize: "clamp(2.6rem, 5.4vw, 5rem)",
                letterSpacing: "-0.03em",
              }}
            >
              We make money without taxing the meal.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Econ
              role="Diner / consumer"
              free="Free forever"
              bullets={[
                "Splitting, claiming, paying — all free",
                "Tabby Pro: $4.99/mo — receipt history, dining insights, virtual card",
                "ARPU at 8% Pro attach: $0.40/diner/mo",
              ]}
            />
            <Econ
              role="Restaurant / merchant"
              free="$0.18 per closed tab"
              bullets={[
                "Replaces 3.2% card interchange — net 91% savings on a $40 cover",
                "Annual contract above 600 tabs/mo",
                "Median pilot: $1,840 saved/mo per location",
              ]}
            />
          </div>

          <div className="mt-12 rounded-[28px] border border-white/10 bg-white/[0.03] p-8 md:p-10 grid grid-cols-1 md:grid-cols-4 gap-8">
            <BigNum n="$0.18" l="net take per tab" />
            <BigNum n="42%" l="contribution margin yr 2" />
            <BigNum n="$1.20" l="diner CAC (referral 0.4)" />
            <BigNum n="13 mo" l="payback at current rate" />
          </div>
        </div>
      </section>

      {/* ───────── 07 — Roadmap / ask ───────── */}
      <section className="relative bg-surface py-24 lg:py-32">
        <div className="mx-auto max-w-[1280px] px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-5">
            <Eyebrow>07 / the next 18 months</Eyebrow>
            <h2
              className="mt-5 font-grotesk font-bold text-body leading-[0.95]"
              style={{
                fontSize: "clamp(2.4rem, 5vw, 4.6rem)",
                letterSpacing: "-0.03em",
              }}
            >
              Closed beta → 250 LA restaurants → national.
            </h2>
            <p className="mt-6 text-[1.05rem] text-body/65 leading-[1.6] max-w-[480px]">
              Sila gives us bank rails on day one. The work ahead is local —
              merchant onboarding, server training, the human side of
              splitting a check.
            </p>
          </div>
          <div className="lg:col-span-7 space-y-4">
            <Milestone
              when="Q4 2026"
              title="Public launch · 30 LA restaurants"
              body="Westside dinner corridor — Sugarfish, Alberto&apos;s, The Rustic Table — already in pilot."
            />
            <Milestone
              when="Q1 2027"
              title="Tabby Pro live · virtual card ships"
              body="Activates Sila /link_card and /transact for in-app spend; subscription engine."
            />
            <Milestone
              when="Q3 2027"
              title="250 merchants · NYC + SF"
              body="Direct sales motion to mid-market chains. Restaurant CAC drops as referrals compound."
            />
            <Milestone
              when="2028"
              title="Tabby Business · groups & expense"
              body="Sila /kyb unlocks corporate cards. We become the default rail for any group meal."
            />
          </div>
        </div>
      </section>

      {/* ───────── 08 — Ask ───────── */}
      <section className="relative bg-accent text-ink py-24 lg:py-28">
        <div className="mx-auto max-w-[1280px] px-6 lg:px-12 grid grid-cols-1 md:grid-cols-12 gap-8 items-end">
          <div className="md:col-span-8">
            <div className="text-[11px] uppercase tracking-[0.28em] font-semibold opacity-70">
              08 / the ask
            </div>
            <h2
              className="mt-4 font-grotesk font-bold leading-[0.95]"
              style={{
                fontSize: "clamp(2.6rem, 6vw, 5.6rem)",
                letterSpacing: "-0.035em",
              }}
            >
              $4M seed.
              <br />
              18 months of runway.
            </h2>
          </div>
          <div className="md:col-span-4">
            <ul className="space-y-2 text-[1.05rem] font-medium leading-[1.55]">
              <li>· $1.6M product · 4 eng + 1 design</li>
              <li>· $1.4M growth · LA → SF → NYC</li>
              <li>· $0.6M ops · merchant success</li>
              <li>· $0.4M reserves · runway extension</li>
            </ul>
            <a
              href="mailto:connorchisick@gmail.com?subject=Tabby%20—%20investor%20briefing"
              className="mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-ink text-cream text-sm font-semibold hover:opacity-90 transition"
            >
              Reply to the ask →
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}

/* ───────── small primitives ───────── */

function Eyebrow({
  color = "ink",
  children,
}: {
  color?: "ink" | "cream";
  children: React.ReactNode;
}) {
  return (
    <div
      className={`inline-flex items-center gap-3 text-[10px] uppercase tracking-[0.26em] font-semibold ${
        color === "cream" ? "text-cream/55" : "text-body/45"
      }`}
    >
      <span
        className={`w-7 h-px ${
          color === "cream" ? "bg-cream/35" : "bg-body/30"
        }`}
      />
      {children}
    </div>
  );
}

function Headline({ n, l }: { n: string; l: string }) {
  return (
    <div>
      <div className="font-grotesk font-bold text-body text-4xl md:text-5xl tabular-nums tracking-[-0.03em]">
        {n}
      </div>
      <div className="mt-2 text-[11px] uppercase tracking-[0.18em] text-body/45 font-semibold">
        {l}
      </div>
    </div>
  );
}

function Hurt({ n, l }: { n: string; l: string }) {
  return (
    <div className="rounded-2xl border border-cream/12 px-4 py-5">
      <div className="font-grotesk font-bold text-3xl tabular-nums">{n}</div>
      <div className="mt-2 text-[10px] uppercase tracking-[0.16em] text-cream/55 font-semibold leading-snug">
        {l}
      </div>
    </div>
  );
}

function Layer({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-2xl border border-line/15 bg-surface p-6">
      <div className="text-[10px] uppercase tracking-[0.22em] text-accent font-semibold">
        {eyebrow}
      </div>
      <div className="mt-3 font-grotesk font-bold text-2xl tracking-[-0.02em]">
        {title}
      </div>
      <p className="mt-3 text-[0.96rem] text-body/65 leading-[1.55]">{body}</p>
    </div>
  );
}

function CalloutCard({
  k,
  title,
  body,
}: {
  k: string;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-2xl bg-surface border border-line/10 p-6">
      <div className="font-grotesk font-bold text-4xl text-accent tabular-nums">
        {k}
      </div>
      <div className="mt-3 font-semibold text-body text-[1.05rem]">{title}</div>
      <p className="mt-1 text-[0.95rem] text-body/60 leading-[1.5]">{body}</p>
    </div>
  );
}

function Econ({
  role,
  free,
  bullets,
}: {
  role: string;
  free: string;
  bullets: string[];
}) {
  return (
    <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-7">
      <div className="text-[10px] uppercase tracking-[0.24em] text-cream/45 font-semibold">
        {role}
      </div>
      <div className="mt-3 font-grotesk font-bold text-3xl tracking-[-0.025em]">
        {free}
      </div>
      <ul className="mt-5 space-y-2 text-[0.98rem] text-cream/70 leading-[1.55]">
        {bullets.map((b) => (
          <li key={b} className="flex gap-2">
            <span className="text-accent">›</span>
            <span>{b}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function BigNum({ n, l }: { n: string; l: string }) {
  return (
    <div>
      <div className="font-grotesk font-bold text-4xl md:text-5xl tabular-nums tracking-[-0.03em]">
        {n}
      </div>
      <div className="mt-2 text-[10px] uppercase tracking-[0.2em] text-cream/50 font-semibold">
        {l}
      </div>
    </div>
  );
}

function Milestone({
  when,
  title,
  body,
}: {
  when: string;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-2xl border border-line/12 bg-surface p-6 grid grid-cols-12 gap-4 items-baseline">
      <div className="col-span-3 text-[11px] uppercase tracking-[0.22em] font-semibold text-accent">
        {when}
      </div>
      <div className="col-span-9">
        <div className="font-grotesk font-bold text-xl tracking-[-0.02em]">
          {title}
        </div>
        <p className="mt-2 text-[0.95rem] text-body/60 leading-[1.55]">
          {body}
        </p>
      </div>
    </div>
  );
}
