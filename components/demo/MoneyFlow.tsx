"use client";
import { motion } from "motion/react";
import { useEffect, useState } from "react";

// Animated 4-node sequence diagram of money movement.
// Diner → Sila Issue (mint SILAUSD from ACH debit) → Sila Transfer
// (instant intra-Sila move) → Sila Redeem (ACH credit to merchant bank).
const NODES = [
  { id: "diner", label: "Diner", sub: "Chase ···7793" },
  { id: "issue", label: "Sila / Issue", sub: "ach_debit · t+0" },
  { id: "transfer", label: "Sila / Transfer", sub: "SILAUSD · instant" },
  { id: "redeem", label: "Sila / Redeem", sub: "ach_credit · t+1" },
  { id: "merchant", label: "Merchant", sub: "BoA ···0094" },
];

export function MoneyFlow() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick((v) => v + 1), 2400);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="relative rounded-[28px] bg-[#0E0E0E] text-cream p-8 md:p-10 overflow-hidden border border-white/5 shadow-[0_40px_80px_-30px_rgba(0,0,0,0.6)]">
      {/* faint grid */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative">
        <div className="text-[10px] uppercase tracking-[0.28em] text-cream/45 font-semibold">
          flow / one tap → settled
        </div>
        <div className="mt-2 font-grotesk font-bold text-3xl md:text-5xl tracking-[-0.025em]">
          $82.08 moves <span className="text-[#02D57C]">in 458ms.</span>
        </div>
        <p className="mt-3 text-cream/55 max-w-[640px] text-[0.98rem] leading-[1.55]">
          Three Sila calls behind every "Pay" tap. Two are synchronous so the
          diner sees a green check; the third is async so the merchant gets a
          single, batched ACH credit overnight.
        </p>

        {/* node row */}
        <div className="relative mt-10">
          {/* connector line */}
          <div className="absolute left-0 right-0 top-[34px] h-px bg-cream/15" />
          <motion.div
            key={tick}
            className="absolute top-[33px] h-[3px] rounded-full bg-[#02D57C] shadow-[0_0_20px_rgba(2,213,124,0.8)]"
            initial={{ left: 0, width: 0 }}
            animate={{ left: 0, width: "100%" }}
            transition={{ duration: 2.1, ease: [0.65, 0, 0.35, 1] }}
          />

          <div className="relative grid grid-cols-5 gap-2 md:gap-4">
            {NODES.map((n, i) => (
              <div key={n.id} className="flex flex-col items-center text-center">
                <motion.span
                  key={`${n.id}-${tick}`}
                  initial={{ scale: 0.8, background: "#1a1a1a" }}
                  animate={{
                    scale: [0.8, 1.2, 1],
                    background: ["#1a1a1a", "#02D57C", "#1a1a1a"],
                  }}
                  transition={{ delay: i * 0.42, duration: 0.7 }}
                  className="w-[18px] h-[18px] rounded-full border-2 border-cream/20 z-10"
                />
                <div className="mt-3 text-[12px] font-bold tracking-[-0.01em]">
                  {n.label}
                </div>
                <div className="mt-1 text-[10px] uppercase tracking-[0.16em] text-cream/40 font-semibold">
                  {n.sub}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* legend */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-5">
          <Legend
            color="#FF7C61"
            label="diner-facing"
            body="One tap. Green check. No statement of unfamiliar charges."
          />
          <Legend
            color="#02D57C"
            label="sila rails"
            body="Issue → Transfer → Redeem. FDIC pass-through wallet between every step."
          />
          <Legend
            color="#FDD509"
            label="merchant payout"
            body="One ACH credit per shift, not per diner. Reconciliation is one row."
          />
        </div>
      </div>
    </div>
  );
}

function Legend({
  color,
  label,
  body,
}: {
  color: string;
  label: string;
  body: string;
}) {
  return (
    <div className="rounded-2xl bg-white/[0.04] border border-white/5 p-4">
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] font-semibold text-cream/55">
        <span className="w-2 h-2 rounded-full" style={{ background: color }} />
        {label}
      </div>
      <p className="mt-2 text-[12.5px] leading-[1.55] text-cream/70">{body}</p>
    </div>
  );
}
