"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import posthog from "posthog-js";
import { LOGO } from "@/lib/images";
import { lengthBucket, track } from "@/lib/analytics";
import { Arrow } from "@/components/icons";

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "How does Tabby work?",
  "When does it launch?",
  "Do my friends need the app?",
  "How much does it cost?",
];

function CloseIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 12 12" fill="none" className={className} aria-hidden>
      <path
        d="M2 2l8 8M10 2l-8 8"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function posthogContext() {
  try {
    return {
      posthogDistinctId: posthog.get_distinct_id?.(),
      posthogSessionId: posthog.get_session_id?.(),
    };
  } catch {
    return {};
  }
}

export function HelpAgent() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const hiddenForDemo = pathname === "/demo";

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streaming]);

  useEffect(() => {
    if (open && !hiddenForDemo) inputRef.current?.focus();
  }, [hiddenForDemo, open]);

  useEffect(() => {
    if (hiddenForDemo) setOpen(false);
  }, [hiddenForDemo]);

  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 112)}px`;
  }, [input]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || streaming) return;

    const history: Msg[] = [...messages, { role: "user", content: trimmed }];
    const turnCount = history.filter((m) => m.role === "user").length;
    track("help_message_sent", {
      message_length_bucket: lengthBucket(trimmed),
      turn_count: turnCount,
      route: pathname,
    });
    setMessages([...history, { role: "assistant", content: "" }]);
    setInput("");
    setStreaming(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: history, ...posthogContext() }),
      });
      if (!res.ok || !res.body) throw new Error("bad response");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMessages((cur) => {
          const copy = cur.slice();
          copy[copy.length - 1] = { role: "assistant", content: acc };
          return copy;
        });
      }
      track("help_response_completed", {
        response_length_bucket: lengthBucket(acc),
        turn_count: turnCount,
        route: pathname,
      });
    } catch {
      track("help_response_failed", {
        turn_count: turnCount,
        route: pathname,
      });
      setMessages((cur) => {
        const copy = cur.slice();
        copy[copy.length - 1] = {
          role: "assistant",
          content: "Something went wrong. Please try again.",
        };
        return copy;
      });
    } finally {
      setStreaming(false);
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    send(input);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  }

  if (hiddenForDemo) return null;

  return (
    <>
      {/* ──────────────── Trigger pill ──────────────── */}
      <AnimatePresence>
        {!open && (
          <motion.button
            key="trigger"
            initial={{ y: 56, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 30, opacity: 0, scale: 0.95 }}
            transition={{
              type: "spring",
              stiffness: 240,
              damping: 22,
              delay: 0.4,
            }}
            onClick={() => {
              track("help_agent_opened", {
                route: pathname,
                message_count: messages.length,
              });
              setOpen(true);
            }}
            aria-label="Open Tabby help agent"
            className="group fixed right-4 sm:right-6 z-[60] outline-none"
            style={{
              bottom: "max(1rem, env(safe-area-inset-bottom, 0px))",
            }}
          >
            {/* breathing halo — draws the eye without being loud */}
            <motion.span
              aria-hidden
              className="absolute inset-0 rounded-full bg-accent/35 blur-2xl pointer-events-none"
              animate={{
                opacity: [0.5, 0.85, 0.5],
                scale: [0.92, 1.08, 0.92],
              }}
              transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
            />
            {/* hairline accent ring on hover */}
            <span
              aria-hidden
              className="absolute -inset-[3px] rounded-full ring-1 ring-accent/0 group-hover:ring-accent/60 transition-all duration-300"
            />

            {/* pill */}
            <span
              className="relative inline-flex items-center gap-3 pl-3 pr-5 py-2.5 sm:py-3 rounded-full bg-ink text-cream shadow-[0_22px_52px_-14px_rgba(14,14,14,0.6)] group-hover:shadow-[0_28px_64px_-12px_rgba(255,124,97,0.5)] group-hover:-translate-y-0.5 transition-all duration-300 active:scale-[0.97]"
            >
              <span className="relative inline-flex w-9 h-9 sm:w-10 sm:h-10 shrink-0">
                {/* Mascot disc — overflow-hidden so the logo crops cleanly
                    inside the circle. The live dot sits OUTSIDE this so the
                    crop doesn't clip it. */}
                <span className="relative w-full h-full overflow-hidden rounded-full bg-cream ring-1 ring-cream/20">
                  <Image
                    src={LOGO}
                    alt=""
                    width={40}
                    height={40}
                    className="w-full h-full object-contain"
                    unoptimized
                  />
                </span>
                {/* live dot — sibling of the clipped disc, not a child, so
                    the rounded crop can't shave it off. */}
                <span
                  aria-hidden
                  className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[rgb(2,213,124)] ring-2 ring-ink"
                >
                  <span className="absolute inset-0 rounded-full bg-[rgb(2,213,124)] animate-ping opacity-75" />
                </span>
              </span>
              <span className="font-grotesk font-semibold text-[1rem] sm:text-[1.05rem] tracking-[-0.015em] leading-none whitespace-nowrap">
                Ask Tabby
              </span>
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* ──────────────── Panel ──────────────── */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="panel"
            initial={{ y: 28, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 24, opacity: 0, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 290, damping: 28 }}
            data-lenis-prevent
            className="fixed z-[60] bottom-3 right-3 left-3 sm:bottom-5 sm:right-5 sm:left-auto sm:w-[440px] sm:max-h-[min(720px,88vh)] h-[min(88dvh,760px)] sm:h-auto flex flex-col overflow-hidden bg-surface-alt rounded-[26px] sm:rounded-[32px] shadow-[0_50px_120px_-24px_rgba(14,14,14,0.55),0_0_0_1px_rgba(14,14,14,0.06)]"
            style={{
              marginBottom: "max(0px, env(safe-area-inset-bottom, 0px))",
            }}
          >
            {/* Ledger-paper hairlines — same vertical pinstripe motif used in
                FlipStatement. Sits behind everything; very low opacity. */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(90deg, rgba(14,14,14,0.9) 0 1px, transparent 1px 8%)",
              }}
            />

            {/* Bottom-corner accent glow — warms the lower portion of the
                panel and gives the input area a gentle halo. */}
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-32 -right-20 w-[420px] h-[420px] rounded-full opacity-70"
              style={{
                background:
                  "radial-gradient(circle, rgba(255,124,97,0.18), rgba(255,124,97,0) 60%)",
                filter: "blur(60px)",
              }}
            />

            {/* ──── Header ──── editorial dark slab with grain */}
            <div className="relative flex items-start justify-between gap-3 px-5 sm:px-6 pt-5 sm:pt-6 pb-5 sm:pb-6 bg-ink text-cream overflow-hidden">
              <div className="noise" />
              {/* hairline accent rule across the bottom — replaces the old ribbon */}
              <div
                aria-hidden
                className="absolute left-5 right-5 sm:left-6 sm:right-6 bottom-0 h-px"
                style={{
                  background:
                    "linear-gradient(90deg, transparent 0%, rgba(255,124,97,0.55) 30%, rgba(255,124,97,0.55) 70%, transparent 100%)",
                }}
              />
              {/* faint corner accent dot */}
              <div
                aria-hidden
                className="absolute -top-16 -left-16 w-44 h-44 rounded-full pointer-events-none opacity-80"
                style={{
                  background:
                    "radial-gradient(circle, rgba(255,124,97,0.22), transparent 60%)",
                  filter: "blur(28px)",
                }}
              />

              <div className="relative flex items-center gap-3.5 min-w-0">
                <span className="relative inline-flex w-11 h-11 flex-shrink-0">
                  <span className="relative w-full h-full overflow-hidden rounded-[32%] bg-cream ring-1 ring-cream/15 shadow-[0_8px_22px_-8px_rgba(0,0,0,0.5)]">
                    <Image
                      src={LOGO}
                      alt=""
                      width={44}
                      height={44}
                      className="w-full h-full object-contain"
                      unoptimized
                    />
                  </span>
                  <span
                    aria-hidden
                    className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[rgb(2,213,124)] ring-2 ring-ink"
                  >
                    <span className="absolute inset-0 rounded-full bg-[rgb(2,213,124)] animate-ping opacity-70" />
                  </span>
                </span>
                <div className="leading-tight min-w-0">
                  <div className="flex items-center gap-2 text-[0.58rem] sm:text-[0.6rem] uppercase tracking-[0.32em] text-cream/55 font-semibold">
                    <span aria-hidden className="w-1.5 h-1.5 rounded-full bg-[rgb(2,213,124)]" />
                    Online
                  </div>
                  <div className="mt-1 font-grotesk font-bold text-[1.18rem] sm:text-[1.22rem] tracking-[-0.018em]">
                    Ask <span className="italic font-medium text-accent">Tabby</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  track("help_agent_closed", {
                    route: pathname,
                    message_count: messages.length,
                  });
                  setOpen(false);
                }}
                aria-label="Close help agent"
                className="relative w-9 h-9 flex-shrink-0 rounded-full grid place-items-center text-cream/70 hover:text-cream hover:bg-cream/10 transition-all active:scale-95"
              >
                <CloseIcon className="w-3 h-3" />
              </button>
            </div>

            {/* ──── Messages ──── */}
            <div
              ref={scrollRef}
              className="relative flex-1 overflow-y-auto px-5 sm:px-6 py-6 sm:py-7 space-y-5"
            >
              {messages.length === 0 && (
                <div className="space-y-7">
                  {/* Editorial welcome — chapter mark + oversized headline */}
                  <motion.div
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <div className="flex items-center gap-3 text-[0.58rem] sm:text-[0.6rem] uppercase tracking-[0.32em] text-ink/45 font-semibold">
                      <span aria-hidden className="h-px w-8 bg-ink/25" />
                      <span>§ — Hello</span>
                    </div>
                    <p className="mt-4 font-grotesk font-bold text-ink text-[1.55rem] sm:text-[1.78rem] leading-[1.05] tracking-[-0.028em]">
                      Anything you want{" "}
                      <span className="italic font-medium text-accent">to know.</span>
                    </p>
                    <p className="mt-3 text-ink/60 text-[0.92rem] sm:text-[0.96rem] leading-[1.55] max-w-[34ch]">
                      How it works, what it costs, when it lands. Pick one or
                      type your own.
                    </p>
                  </motion.div>

                  {/* Suggestion stack — numbered editorial cards */}
                  <div className="flex flex-col gap-2.5">
                    {SUGGESTIONS.map((s, i) => (
                      <motion.button
                        key={s}
                        onClick={() => {
                          track("help_suggestion_clicked", {
                            suggestion_index: i,
                            route: pathname,
                          });
                          send(s);
                        }}
                        initial={{ y: 12, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{
                          duration: 0.5,
                          ease: [0.22, 1, 0.36, 1],
                          delay: 0.22 + i * 0.07,
                        }}
                        className="group relative text-left rounded-2xl bg-white/85 backdrop-blur-sm border border-ink/[0.07] hover:border-accent/50 hover:bg-white shadow-[0_2px_8px_-4px_rgba(14,14,14,0.08)] hover:shadow-[0_14px_32px_-12px_rgba(255,124,97,0.28)] hover:-translate-y-[1px] transition-all duration-300 overflow-hidden"
                      >
                        {/* hairline accent that grows on hover */}
                        <span
                          aria-hidden
                          className="absolute left-0 top-3 bottom-3 w-[2px] bg-accent scale-y-0 group-hover:scale-y-100 origin-center transition-transform duration-300 rounded-full"
                        />
                        <span className="relative flex items-center gap-3.5 pl-4 pr-3.5 py-3">
                          <span
                            aria-hidden
                            className="font-grotesk font-bold tabular-nums text-[0.62rem] uppercase tracking-[0.2em] text-ink/35 group-hover:text-accent transition-colors duration-300"
                          >
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          <span className="flex-1 text-ink text-[0.9rem] sm:text-[0.94rem] font-medium leading-snug">
                            {s}
                          </span>
                          <Arrow
                            width={20}
                            height={10}
                            className="text-ink/30 group-hover:text-accent group-hover:translate-x-1 transition-all duration-300"
                          />
                        </span>
                      </motion.button>
                    ))}
                  </div>

                  {/* Trust note — same eyebrow style as section chapter marks */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.55, duration: 0.4 }}
                    className="pt-1 flex items-center gap-2.5 text-[0.6rem] uppercase tracking-[0.28em] text-ink/40 font-semibold"
                  >
                    <span aria-hidden className="h-px w-6 bg-ink/20" />
                    Trained on Tabby docs only
                  </motion.div>
                </div>
              )}

              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ y: 8, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {m.role === "user" ? (
                    <div className="max-w-[85%] px-4 py-2.5 rounded-[18px] rounded-br-[6px] bg-ink text-cream text-[0.92rem] leading-[1.5] whitespace-pre-wrap break-words shadow-[0_10px_28px_-12px_rgba(14,14,14,0.55)]">
                      {m.content}
                    </div>
                  ) : (
                    <div className="max-w-[92%] flex gap-3 items-start">
                      {/* Mascot avatar — small, sits flush with the first line */}
                      <span className="relative inline-flex w-7 h-7 mt-0.5 flex-shrink-0 overflow-hidden rounded-full bg-cream ring-1 ring-ink/10 shadow-[0_4px_10px_-4px_rgba(14,14,14,0.25)]">
                        <Image
                          src={LOGO}
                          alt=""
                          width={28}
                          height={28}
                          className="w-full h-full object-contain"
                          unoptimized
                        />
                      </span>
                      <div className="relative pl-3.5 text-ink text-[0.94rem] sm:text-[0.97rem] leading-[1.6] whitespace-pre-wrap break-words flex-1 min-w-0">
                        {/* hairline accent rule running down the assistant message */}
                        <span
                          aria-hidden
                          className="absolute left-0 top-1.5 bottom-1.5 w-[2px] rounded-full bg-accent/55"
                        />
                        {m.content || (
                          <span className="inline-flex items-center gap-2 text-ink/50 text-[0.78rem] uppercase tracking-[0.24em] font-semibold">
                            <span className="flex items-center gap-1">
                              <span className="w-1 h-1 rounded-full bg-accent animate-[bounce_1s_ease-in-out_infinite]" />
                              <span
                                className="w-1 h-1 rounded-full bg-accent animate-[bounce_1s_ease-in-out_infinite]"
                                style={{ animationDelay: "0.15s" }}
                              />
                              <span
                                className="w-1 h-1 rounded-full bg-accent animate-[bounce_1s_ease-in-out_infinite]"
                                style={{ animationDelay: "0.3s" }}
                              />
                            </span>
                            thinking
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            {/* ──── Input ──── pill-shaped composer */}
            <form
              onSubmit={onSubmit}
              className="ph-no-capture relative px-4 sm:px-5 pt-3 pb-3 sm:pb-4"
            >
              {/* hairline rule above the input */}
              <div
                aria-hidden
                className="absolute left-5 right-5 top-0 h-px bg-ink/8"
              />
              <div
                className={`relative flex items-end gap-2 rounded-[20px] bg-white border transition-all duration-300 px-3 py-1.5 ${
                  input.trim()
                    ? "border-accent/40 shadow-[0_8px_22px_-12px_rgba(255,124,97,0.35)]"
                    : "border-ink/10 shadow-[0_4px_14px_-8px_rgba(14,14,14,0.12)]"
                }`}
              >
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={onKeyDown}
                  rows={1}
                  placeholder="Ask anything…"
                  className="ph-no-capture flex-1 resize-none bg-transparent text-[16px] sm:text-[0.95rem] text-ink placeholder:text-ink/35 outline-none py-2 max-h-28 leading-[1.45]"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || streaming}
                  aria-label="Send message"
                  className="group flex-shrink-0 w-9 h-9 mb-1 rounded-full bg-accent text-cream grid place-items-center disabled:opacity-25 disabled:cursor-not-allowed enabled:hover:shadow-[0_10px_28px_-8px_rgba(255,124,97,0.7)] enabled:active:scale-95 transition-all duration-300"
                >
                  <Arrow
                    width={16}
                    height={9}
                    className="enabled:group-hover:translate-x-0.5 transition-transform duration-300"
                  />
                </button>
              </div>
              <div className="mt-2.5 flex items-center justify-between gap-3 text-[0.56rem] uppercase tracking-[0.22em] text-ink/35 font-semibold">
                <span className="flex items-center gap-1.5">
                  <kbd className="font-grotesk normal-case tracking-normal text-ink/45 bg-ink/[0.04] border border-ink/10 rounded px-1.5 py-0.5 text-[0.62rem]">
                    ↵
                  </kbd>
                  to send
                </span>
                <span className="flex items-center gap-1.5">
                  <span aria-hidden className="w-1 h-1 rounded-full bg-ink/30" />
                  AI — can be wrong
                </span>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
