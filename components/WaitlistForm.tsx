"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Arrow } from "./icons";

// Light-touch US/intl phone mask: strips non-digits, pretty-prints US
// as (xxx) xxx-xxxx, otherwise leaves a leading "+" and spaces every 3.
function formatPhone(raw: string) {
  const plus = raw.trim().startsWith("+");
  const digits = raw.replace(/\D/g, "").slice(0, 15);
  if (plus) return "+" + digits.replace(/(\d{1,3})(\d{1,3})?(\d+)?/, (_, a, b, c) =>
    [a, b, c].filter(Boolean).join(" "));
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
}

export function WaitlistForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");

  const digitCount = phone.replace(/\D/g, "").length;
  const valid = digitCount >= 10;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    setStatus("loading");
    await new Promise((r) => setTimeout(r, 700));
    setStatus("done");
  };

  return (
    <div className="relative max-w-md mx-auto">
      <AnimatePresence mode="wait">
        {status !== "done" ? (
          <motion.form
            key="form"
            onSubmit={submit}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col gap-4 text-left"
          >
            <label className="block">
              <span className="text-xs uppercase tracking-[0.22em] text-ink/50 font-semibold">
                Name
              </span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="mt-2 w-full rounded-full bg-white border border-black/10 px-6 py-4 text-ink placeholder:text-ink/30 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition"
              />
            </label>
            <label className="block">
              <span className="text-xs uppercase tracking-[0.22em] text-ink/50 font-semibold">
                Phone number
              </span>
              <input
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                required
                value={phone}
                onChange={(e) => setPhone(formatPhone(e.target.value))}
                placeholder="(555) 123-4567"
                className="mt-2 w-full rounded-full bg-white border border-black/10 px-6 py-4 text-ink placeholder:text-ink/30 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition"
              />
            </label>
            <button
              type="submit"
              disabled={status === "loading" || !valid}
              className="btn-primary mt-4 justify-center !py-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === "loading" ? "Joining…" : "Join the Waitlist"}
              {status !== "loading" && <Arrow className="arrow" />}
            </button>
          </motion.form>
        ) : (
          <motion.div
            key="done"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-3xl border border-black/10 bg-white p-10 text-left shadow-[0_30px_80px_-40px_rgba(14,14,14,0.25)]"
          >
            <div className="w-10 h-10 rounded-full bg-accent text-white grid place-items-center font-bold">
              ✓
            </div>
            <h3 className="mt-5 font-grotesk text-3xl font-bold text-ink">
              You're on the list.
            </h3>
            <p className="mt-4 text-ink/60 leading-relaxed">
              Thanks{name ? `, ${name.split(" ")[0]}` : ""}. We'll text{" "}
              <span className="text-ink font-medium">{phone}</span> when Tabby
              launches in Q4 2026.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
