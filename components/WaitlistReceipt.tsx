"use client";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { AnimatePresence, motion } from "framer-motion";
import { Arrow } from "./icons";

/**
 * The waitlist receipt IS the signup form. The upper half is the stylized
 * bill (their order struck through, your order untouched) and the lower
 * half is a "sign the tab" section with name + phone inputs styled as
 * receipt signature lines. On submit, the receipt stamps itself PAID and
 * swaps the input block for a confirmation block.
 */

function formatPhone(raw: string) {
  const plus = raw.trim().startsWith("+");
  const digits = raw.replace(/\D/g, "").slice(0, 15);
  if (plus)
    return (
      "+" +
      digits.replace(/(\d{1,3})(\d{1,3})?(\d+)?/, (_, a, b, c) =>
        [a, b, c].filter(Boolean).join(" "),
      )
    );
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
}

export function WaitlistReceipt() {
  const rootRef = useRef<HTMLDivElement>(null);
  const paperRef = useRef<HTMLDivElement>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "done" | "error"
  >("idle");
  const [signing, setSigning] = useState(false);

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const phoneDigits = phone.replace(/\D/g, "").length;
  const phoneComplete = phoneDigits >= 10;
  // Phone is optional — the button's enabled state tracks email only.
  // A partial phone entry gets dropped at submit time instead of blocking.
  const valid = emailValid;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid || status === "loading") return;
    setStatus("loading");
    const phoneToSend = phoneComplete ? phone : "";
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone: phoneToSend }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      // Let the signature fully draw, then crossfade form → confirmation
      // while the ink dissolves in the same beat — no visible gap.
      setSigning(true);
      setTimeout(() => {
        setStatus("done");
        setSigning(false);
      }, 2000);
    } catch (err) {
      console.error("[waitlist] submission failed", err);
      setStatus("error");
    }
  };

  // Entrance: paper drops in and settles at -3.2deg.
  useEffect(() => {
    const ctx = gsap.context(() => {
      if (paperRef.current) {
        gsap.fromTo(
          paperRef.current,
          { opacity: 0, y: 40, rotate: -9, scale: 0.94 },
          {
            opacity: 1,
            y: 0,
            rotate: -3.2,
            scale: 1,
            duration: 1.4,
            ease: "expo.out",
            delay: 0.2,
          },
        );
      }
    }, rootRef);
    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={rootRef}
      className="relative mx-auto select-none"
      style={{ width: "min(360px, 84vw)" }}
    >
      {/* soft warm glow pool behind receipt */}
      <div
        aria-hidden
        className="absolute -inset-10 -z-10 blur-3xl opacity-70"
        style={{
          background:
            "radial-gradient(60% 55% at 50% 45%, rgba(255,124,97,0.28), transparent 70%)",
        }}
      />

      {/* Hand-drawn "sign here" arrow pointing at the input fields from the
          left margin. Lives outside the rotated paperRef so it stays upright
          like an annotation. Hidden once the waitlist is joined. */}
      <AnimatePresence>
        {status !== "done" && (
          <motion.div
            aria-hidden
            initial={{ opacity: 0, x: -18, rotate: 0 }}
            animate={{ opacity: 1, x: 0, rotate: -5 }}
            exit={{ opacity: 0, x: -14, transition: { duration: 0.3 } }}
            transition={{
              duration: 0.7,
              ease: [0.22, 1, 0.36, 1],
              delay: 1.3,
            }}
            className="absolute pointer-events-none hidden sm:block"
            style={{
              top: "59%",
              left: "-96px",
              width: "92px",
              zIndex: 20,
            }}
          >
            <div className="relative">
              <span
                className="block font-grotesk italic font-bold text-[0.95rem] leading-none whitespace-nowrap"
                style={{
                  color: "rgb(255,124,97)",
                  transform: "rotate(-6deg)",
                  marginLeft: "8px",
                }}
              >
                sign here
              </span>
              <svg
                width="92"
                height="82"
                viewBox="0 0 92 82"
                className="block mt-2"
                fill="none"
              >
                <path
                  d="M 4 8 C 18 14, 38 26, 58 44 C 70 54, 80 64, 86 72"
                  stroke="rgb(255,124,97)"
                  strokeWidth="2.6"
                  strokeLinecap="round"
                />
                <path
                  d="M 74 66 L 86 72 L 82 58"
                  stroke="rgb(255,124,97)"
                  strokeWidth="2.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        ref={paperRef}
        className="relative"
        style={{ opacity: 0, transformOrigin: "center center" }}
      >
        {/* Black cat pops its head up from behind the top of the receipt.
            Container height + image height match the Nav's proven crop so
            the receipt baked into the mascot image stays below the window. */}
        <span
          aria-hidden
          className="pointer-events-none absolute overflow-hidden"
          style={{
            bottom: "calc(100% - 8px)",
            left: "58%",
            transform: "translateX(-50%)",
            width: "70px",
            height: "38px",
            zIndex: 2,
          }}
        >
          <span
            className="block absolute left-0 top-0 w-full animate-cat-peek"
            style={{
              backgroundImage: "url('/cat-mascot.png')",
              backgroundSize: "100% auto",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center top",
              height: "80px",
            }}
          />
        </span>

        {/* Receipt paper — zigzag top + bottom edges via clip-path */}
        <form
          onSubmit={submit}
          className="relative bg-[#F3EBDA] text-[#2a2a2a] font-mono px-7 pt-7 pb-9 shadow-[0_40px_60px_-20px_rgba(14,14,14,0.35),0_12px_24px_-12px_rgba(14,14,14,0.18)] text-left"
          style={{
            clipPath:
              "polygon(0% 10px, 4% 0%, 8% 10px, 12% 0%, 16% 10px, 20% 0%, 24% 10px, 28% 0%, 32% 10px, 36% 0%, 40% 10px, 44% 0%, 48% 10px, 52% 0%, 56% 10px, 60% 0%, 64% 10px, 68% 0%, 72% 10px, 76% 0%, 80% 10px, 84% 0%, 88% 10px, 92% 0%, 96% 10px, 100% 0%, 100% calc(100% - 10px), 96% 100%, 92% calc(100% - 10px), 88% 100%, 84% calc(100% - 10px), 80% 100%, 76% calc(100% - 10px), 72% 100%, 68% calc(100% - 10px), 64% 100%, 60% calc(100% - 10px), 56% 100%, 52% calc(100% - 10px), 48% 100%, 44% calc(100% - 10px), 40% 100%, 36% calc(100% - 10px), 32% 100%, 28% calc(100% - 10px), 24% 100%, 20% calc(100% - 10px), 16% 100%, 12% calc(100% - 10px), 8% 100%, 4% calc(100% - 10px), 0% 100%)",
          }}
        >
          {/* subtle paper grain */}
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none opacity-[0.18] mix-blend-multiply"
            style={{
              backgroundImage:
                "repeating-linear-gradient(92deg, rgba(92,70,48,0.15) 0 1px, transparent 1px 4px), radial-gradient(120% 60% at 50% 0%, rgba(92,70,48,0.1), transparent 60%)",
            }}
          />

          {/* Header */}
          <div className="relative text-center mt-2">
            <div
              className="font-grotesk italic font-bold text-[1.6rem] leading-none tracking-[-0.04em]"
              style={{ color: "#1a1a1a" }}
            >
              tabby<span className="text-[rgb(255,124,97)]">.</span>
            </div>
          </div>

          <div className="relative my-4 border-t border-dashed border-[#2a2a2a]/35" />

          <div className="relative text-[0.72rem] leading-[1.75] opacity-80">
            <div className="flex items-center justify-between font-bold uppercase tracking-[0.18em] text-[0.6rem] opacity-60 mb-1.5">
              <span>Their order</span>
              <span>qty</span>
            </div>
            <Line item="Wagyu Ribeye" price="82.00" struck />
            <Line item="Truffle Fries" price="24.00" struck />
            <Line item="Caviar Service" price="120.00" struck />
            <Line item="Oysters × 12" price="38.00" struck />
            <Line item="Lobster Thermidor" price="68.00" struck />
          </div>

          <div className="relative my-4 border-t border-dashed border-[#2a2a2a]/35" />

          <div className="relative text-[0.78rem] leading-[1.7]">
            <div className="flex items-center justify-between font-bold uppercase tracking-[0.18em] text-[0.6rem] opacity-60 mb-1.5">
              <span>Your order</span>
              <span>qty</span>
            </div>
            <Line item="House Salad" price="14.00" mine />
            <Line item="Tap Water" price="0.00" mine />
          </div>

          <div className="relative my-4 border-t border-double border-[#2a2a2a]/40" />

          {/* Totals */}
          <div className="relative text-[0.72rem] leading-[1.7]">
            <div className="flex justify-between opacity-55">
              <span>Their share</span>
              <span className="line-through">$332.00</span>
            </div>
            <div className="flex justify-between font-bold text-[0.88rem] mt-1">
              <span>YOU PAY</span>
              <span style={{ color: "rgb(255,124,97)" }}>$14.00</span>
            </div>
          </div>

          {/* Perforated divider leading into the signature block */}
          <div
            aria-hidden
            className="relative my-5 flex items-center gap-1 text-[#2a2a2a]/40"
          >
            <span className="flex-1 border-t border-dashed border-current" />
            <span className="text-[0.52rem] uppercase tracking-[0.32em]">
              tear · sign · join
            </span>
            <span className="flex-1 border-t border-dashed border-current" />
          </div>

          {/* Form / confirmation block — swaps on submit */}
          <div className="relative">
            {/* Signature animation — draws a cursive scribble across the
                signature area the instant the submission succeeds. Stays
                visible through the confirmation swap so the signed receipt
                reads continuously rather than flickering. */}
            <AnimatePresence>
              {signing && (
                <motion.svg
                  key="signature"
                  aria-hidden
                  className="absolute pointer-events-none"
                  style={{
                    left: "-6%",
                    top: "-8px",
                    width: "112%",
                    height: "140px",
                    zIndex: 15,
                    overflow: "visible",
                  }}
                  viewBox="0 0 320 140"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{
                    opacity: 0,
                    transition: { duration: 1.1, ease: [0.22, 1, 0.36, 1] },
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <motion.path
                    d="M 14 82 C 22 50, 36 96, 50 68 C 60 48, 68 92, 78 70 C 86 54, 96 86, 104 62 C 114 34, 132 90, 142 68 C 152 46, 164 94, 178 70 C 194 44, 208 92, 224 66 C 242 40, 260 88, 280 60 L 304 46"
                    stroke="#1a1a1a"
                    strokeWidth="2.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{
                      pathLength: { duration: 1.5, ease: [0.42, 0, 0.15, 1] },
                      opacity: { duration: 0.15 },
                    }}
                    style={{ filter: "drop-shadow(0 1px 0 rgba(0,0,0,0.12))" }}
                  />
                  <motion.path
                    d="M 22 104 C 80 114, 180 110, 296 98"
                    stroke="#1a1a1a"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                    opacity={0.75}
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 0.75 }}
                    transition={{
                      pathLength: {
                        duration: 0.6,
                        ease: [0.4, 0, 0.2, 1],
                        delay: 1.4,
                      },
                      opacity: { duration: 0.15, delay: 1.4 },
                    }}
                  />
                </motion.svg>
              )}
            </AnimatePresence>
            <AnimatePresence mode="popLayout" initial={false}>
              {status !== "done" ? (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{
                    opacity: signing ? 0.28 : 1,
                    y: 0,
                    filter: signing ? "blur(1px)" : "blur(0px)",
                  }}
                  exit={{ opacity: 0, y: -4, filter: "blur(3px)" }}
                  transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
                  className="space-y-3"
                >
                  <Field
                    label="Name"
                    value={name}
                    onChange={setName}
                    placeholder="your name"
                    autoComplete="name"
                    type="text"
                  />
                  <Field
                    label="Email"
                    value={email}
                    onChange={setEmail}
                    placeholder="you@example.com"
                    autoComplete="email"
                    type="email"
                    required
                  />
                  <Field
                    label="Phone"
                    value={phone}
                    onChange={(v) => setPhone(formatPhone(v))}
                    placeholder="(555) 123-4567 · optional"
                    autoComplete="tel"
                    type="tel"
                  />

                  {status === "error" && (
                    <div
                      className="text-[0.62rem] uppercase tracking-[0.22em] font-bold text-[rgb(255,124,97)] mt-1"
                      role="alert"
                    >
                      * couldn't save · please try again *
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={status === "loading" || !valid}
                    className="group mt-3 w-full bg-[#1a1a1a] text-[#F3EBDA] uppercase tracking-[0.22em] font-bold text-[0.72rem] py-3.5 flex items-center justify-center gap-2 disabled:opacity-45 disabled:cursor-not-allowed transition-[background-color,transform] duration-200 hover:bg-[rgb(255,124,97)] active:translate-y-[1px]"
                    style={{ borderRadius: "2px" }}
                  >
                    <span>
                      {status === "loading"
                        ? "Signing…"
                        : status === "error"
                          ? "Try again"
                          : "Sign & Join"}
                    </span>
                    {status === "loading" ? (
                      <svg
                        className="w-3.5 h-3.5 animate-spin"
                        viewBox="0 0 14 14"
                        fill="none"
                        aria-hidden
                      >
                        <circle
                          cx="7"
                          cy="7"
                          r="5.5"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          opacity="0.3"
                        />
                        <path
                          d="M12.5 7a5.5 5.5 0 0 0-5.5-5.5"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                      </svg>
                    ) : (
                      <Arrow className="w-5 h-3 transition-transform duration-200 group-hover:translate-x-1" />
                    )}
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="done"
                  initial={{ opacity: 0, y: 6, filter: "blur(4px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{
                    duration: 0.85,
                    ease: [0.22, 1, 0.36, 1],
                    delay: 0.1,
                  }}
                  className="text-[0.74rem] leading-[1.7]"
                >
                  <div className="font-bold uppercase tracking-[0.18em] text-[0.62rem] opacity-60 mb-1.5">
                    ** you're on the list **
                  </div>
                  <ReadoutLine
                    label="Name"
                    value={(name.trim() || "guest").toUpperCase()}
                  />
                  <ReadoutLine label="Email" value={email.trim()} />
                  {phoneComplete && <ReadoutLine label="Phone" value={phone} />}
                  <ReadoutLine label="Notify" value="Q4 · 2026" />
                  <div className="mt-3 text-[0.62rem] uppercase tracking-[0.28em] opacity-55">
                    * enjoy the meal — not the math *
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Barcode-ish strip at the very bottom */}
          <div
            aria-hidden
            className="relative mt-6 flex justify-center items-end gap-[2px] h-5 opacity-65"
          >
            {BARCODE.map((w, i) => (
              <span
                key={i}
                className="bg-[#2a2a2a]"
                style={{ width: `${w}px`, height: "100%" }}
              />
            ))}
          </div>

        </form>
      </div>
    </div>
  );
}

function Line({
  item,
  price,
  struck,
  mine,
}: {
  item: string;
  price: string;
  struck?: boolean;
  mine?: boolean;
}) {
  return (
    <div className={`flex items-baseline ${struck ? "opacity-70" : ""}`}>
      <span
        className={`whitespace-nowrap ${
          struck ? "line-through decoration-[#2a2a2a]/55" : ""
        } ${mine ? "font-bold" : ""}`}
      >
        {item}
      </span>
      <span className="flex-1 overflow-hidden mx-2 opacity-35 text-[0.8em] tracking-[0.1em]">
        ······························
      </span>
      <span
        className={`${struck ? "line-through" : ""} ${mine ? "font-bold" : ""}`}
      >
        {price}
      </span>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type,
  autoComplete,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  type: "text" | "tel" | "email";
  autoComplete?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <div className="flex items-baseline gap-2">
        <span className="font-bold uppercase tracking-[0.2em] text-[0.58rem] opacity-55 w-[52px] shrink-0">
          {label}
        </span>
        <span className="flex-1 relative">
          <input
            type={type}
            inputMode={
              type === "tel" ? "tel" : type === "email" ? "email" : undefined
            }
            autoComplete={autoComplete}
            required={required}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="peer w-full bg-transparent font-mono text-[0.82rem] tracking-[0.02em] text-[#1a1a1a] placeholder:text-[#2a2a2a]/30 focus:outline-none pb-1 caret-[rgb(255,124,97)]"
          />
          <span className="pointer-events-none absolute left-0 right-0 bottom-0 border-b border-dashed border-[#2a2a2a]/45 peer-focus:border-[rgb(255,124,97)] peer-focus:border-solid transition-colors" />
        </span>
      </div>
    </label>
  );
}

function ReadoutLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline">
      <span className="font-bold uppercase tracking-[0.2em] text-[0.58rem] opacity-55 w-[52px] shrink-0">
        {label}
      </span>
      <span className="flex-1 overflow-hidden mx-2 opacity-30 text-[0.72em] tracking-[0.1em]">
        ······························
      </span>
      <span className="font-bold tracking-[0.02em]">{value}</span>
    </div>
  );
}

const BARCODE = [2, 1, 3, 1, 2, 4, 1, 2, 1, 3, 2, 1, 4, 2, 1, 2, 3, 1, 2, 1, 3, 2, 4, 1, 2, 1, 3];
