"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

// Live "merchant POS" view — the partner-facing surface that the
// Tabby-Merchant-API powers. Tabs flow in; settled rows light up green.
type TabRow = {
  id: string;
  table: string;
  diners: number;
  total: number;
  paidPct: number;
  status: "open" | "settling" | "settled";
};

const SEED: TabRow[] = [
  { id: "t-118", table: "Patio · 12", diners: 4, total: 334.73, paidPct: 100, status: "settled" },
  { id: "t-119", table: "Bar · 4", diners: 2, total: 132.04, paidPct: 100, status: "settled" },
  { id: "t-120", table: "Window · 7", diners: 5, total: 488.6, paidPct: 70, status: "settling" },
  { id: "t-121", table: "Patio · 18", diners: 3, total: 211.4, paidPct: 33, status: "open" },
  { id: "t-122", table: "Bar · 2", diners: 4, total: 396.0, paidPct: 0, status: "open" },
];

export function MerchantConsole() {
  const [rows, setRows] = useState(SEED);
  const [todayTotal, setTodayTotal] = useState(8421.18);

  // Slow tick — bumps a random open tab toward settled, refreshes today's total.
  useEffect(() => {
    const t = setInterval(() => {
      setRows((curr) => {
        const next = curr.map((r) => {
          if (r.status === "settled") return r;
          const bump = Math.min(100, r.paidPct + Math.round(Math.random() * 30));
          return {
            ...r,
            paidPct: bump,
            status: bump >= 100 ? "settled" : bump > 0 ? "settling" : "open",
          } as TabRow;
        });
        return next;
      });
      setTodayTotal((v) => v + Math.round(Math.random() * 90));
    }, 3200);
    return () => clearInterval(t);
  }, []);

  const open = rows.filter((r) => r.status !== "settled").length;
  const cleared = rows.filter((r) => r.status === "settled").length;

  return (
    <div className="rounded-[28px] bg-surface border border-line/10 shadow-[0_30px_60px_-30px_rgba(14,14,14,0.25)] overflow-hidden">
      {/* header */}
      <div className="flex items-center justify-between px-7 py-5 border-b border-line/10 bg-surface-alt/40">
        <div>
          <div className="text-[10px] uppercase tracking-[0.24em] text-body/45 font-semibold">
            tabby for restaurants · alberto&apos;s
          </div>
          <div className="font-grotesk font-bold text-2xl mt-0.5">
            Live Service
          </div>
        </div>
        <div className="flex items-center gap-7 text-right">
          <Metric label="today" value={`$${todayTotal.toFixed(0)}`} />
          <Metric label="open tabs" value={open.toString()} />
          <Metric label="cleared" value={cleared.toString()} />
        </div>
      </div>

      {/* table */}
      <div className="px-7 py-5">
        <div className="grid grid-cols-12 text-[10px] uppercase tracking-[0.18em] font-semibold text-body/40 border-b border-line/10 pb-3 mb-3">
          <div className="col-span-2">tab</div>
          <div className="col-span-3">table</div>
          <div className="col-span-1">pax</div>
          <div className="col-span-2 text-right">total</div>
          <div className="col-span-2">collected</div>
          <div className="col-span-2 text-right">status</div>
        </div>
        <AnimatePresence initial={false}>
          {rows.map((r) => (
            <motion.div
              key={r.id}
              layout
              className="grid grid-cols-12 items-center text-[13.5px] py-3 border-b border-line/5 last:border-b-0"
            >
              <div className="col-span-2 font-mono text-body/65 text-[12px]">
                #{r.id}
              </div>
              <div className="col-span-3 font-medium">{r.table}</div>
              <div className="col-span-1 text-body/55">{r.diners}</div>
              <div className="col-span-2 text-right tabular-nums font-medium">
                ${r.total.toFixed(2)}
              </div>
              <div className="col-span-2">
                <div className="h-1.5 rounded-full bg-line/10 overflow-hidden">
                  <motion.div
                    className="h-full bg-[#02D57C]"
                    animate={{ width: `${r.paidPct}%` }}
                    transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  />
                </div>
                <div className="mt-1 text-[10px] text-body/45 tabular-nums">
                  {r.paidPct}%
                </div>
              </div>
              <div className="col-span-2 text-right">
                <StatusChip status={r.status} />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* footer / payout strip */}
      <div className="px-7 py-4 bg-ink text-cream flex items-center justify-between">
        <div className="text-[11px] uppercase tracking-[0.22em] text-cream/50 font-semibold">
          next payout · ach credit
        </div>
        <div className="text-[13px] font-semibold tabular-nums">
          ${(todayTotal - 412.5).toFixed(2)} → BoA ···0094 · clears 6:00 AM PT
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[9px] uppercase tracking-[0.22em] text-body/40 font-semibold">
        {label}
      </div>
      <div className="font-grotesk font-bold text-xl tabular-nums">
        {value}
      </div>
    </div>
  );
}

function StatusChip({ status }: { status: TabRow["status"] }) {
  const map = {
    open: { bg: "bg-line/10", text: "text-body/60", label: "open" },
    settling: {
      bg: "bg-[#FFE9C2]",
      text: "text-[#7C5419]",
      label: "settling",
    },
    settled: {
      bg: "bg-[#02D57C]/15",
      text: "text-[#0a8c54]",
      label: "settled",
    },
  } as const;
  const s = map[status];
  return (
    <span
      className={`inline-flex text-[10px] font-semibold uppercase tracking-[0.14em] px-2.5 py-1 rounded-full ${s.bg} ${s.text}`}
    >
      {s.label}
    </span>
  );
}
