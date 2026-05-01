"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import posthog from "posthog-js";
import { LOGO } from "@/lib/images";
import { lengthBucket, track } from "@/lib/analytics";

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "How does Tabby work?",
  "When does it launch?",
  "Do my friends need the app?",
  "How much does it cost?",
];

function QuestionIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden>
      <path
        d="M5.4 5.6a2.6 2.6 0 1 1 4.3 2.05c-.95.7-1.7 1.25-1.7 2.45"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <circle cx="8" cy="12.7" r="0.95" fill="currentColor" />
    </svg>
  );
}

function SendIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 14 14" fill="none" className={className} aria-hidden>
      <path
        d="M7 12V2M3 6l4-4 4 4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

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
              <span className="relative inline-flex w-9 h-9 sm:w-10 sm:h-10 items-center justify-center rounded-full bg-accent text-cream shrink-0">
                <QuestionIcon className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                {/* live dot */}
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
            className="fixed z-[60] bottom-3 right-3 left-3 sm:bottom-5 sm:right-5 sm:left-auto sm:w-[420px] sm:max-h-[min(660px,86vh)] h-[min(86dvh,720px)] sm:h-auto flex flex-col overflow-hidden bg-cream rounded-[24px] sm:rounded-[28px] shadow-[0_40px_100px_-20px_rgba(14,14,14,0.55)] border border-ink/10"
            style={{
              marginBottom: "max(0px, env(safe-area-inset-bottom, 0px))",
            }}
          >
            {/* accent ribbon */}
            <div
              aria-hidden
              className="h-[3px] w-full"
              style={{
                background:
                  "linear-gradient(90deg, rgb(255,124,97) 0%, rgb(253,213,9) 50%, rgb(255,124,97) 100%)",
              }}
            />

            {/* ──── Header ──── */}
            <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3.5 sm:py-4 bg-ink text-cream">
              <div className="flex items-center gap-3 min-w-0">
                <span className="relative inline-flex w-10 h-10 flex-shrink-0 items-center justify-center rounded-[30%] bg-cream">
                  <Image
                    src={LOGO}
                    alt="Tabby"
                    width={30}
                    height={30}
                    className="pointer-events-none"
                  />
                  {/* tiny live pulse on logo, mirrors the trigger */}
                  <span
                    aria-hidden
                    className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[rgb(2,213,124)] ring-2 ring-ink"
                  >
                    <span className="absolute inset-0 rounded-full bg-[rgb(2,213,124)] animate-ping opacity-70" />
                  </span>
                </span>
                <div className="leading-tight min-w-0">
                  <div className="font-grotesk font-bold text-[1.05rem] truncate tracking-[-0.01em]">
                    Ask Tabby
                  </div>
                  <div className="flex items-center gap-1.5 text-[0.6rem] uppercase tracking-[0.22em] text-cream/55 font-semibold truncate mt-0.5">
                    <span aria-hidden className="w-1 h-1 rounded-full bg-[rgb(2,213,124)]" />
                    Live · usually replies in seconds
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
                className="w-9 h-9 flex-shrink-0 rounded-full flex items-center justify-center hover:bg-cream/10 transition-colors active:scale-95"
              >
                <CloseIcon className="w-3 h-3" />
              </button>
            </div>

            {/* ──── Messages ──── */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto px-4 sm:px-5 py-5 sm:py-6 space-y-4"
            >
              {messages.length === 0 && (
                <div className="space-y-6">
                  {/* welcome */}
                  <motion.div
                    initial={{ y: 8, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <div className="flex items-center gap-2 text-[0.6rem] sm:text-[0.62rem] uppercase tracking-[0.24em] text-ink/40 font-semibold">
                      <span aria-hidden className="w-5 h-px bg-ink/25" />
                      Welcome
                    </div>
                    <p className="mt-3 font-grotesk font-bold text-ink text-[1.4rem] sm:text-[1.65rem] leading-[1.1] tracking-[-0.022em]">
                      Hey. <span className="italic font-medium text-accent">Ask me anything</span> about Tabby.
                    </p>
                    <p className="mt-2.5 text-ink/60 text-[0.88rem] sm:text-[0.93rem] leading-[1.55]">
                      How it works, pricing, launch date — whatever you need.
                    </p>
                  </motion.div>

                  {/* suggestion stack */}
                  <div className="flex flex-col gap-2">
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
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{
                          duration: 0.45,
                          ease: [0.22, 1, 0.36, 1],
                          delay: 0.18 + i * 0.06,
                        }}
                        className="group relative text-left text-[0.88rem] sm:text-[0.92rem] font-medium px-4 py-3 rounded-2xl bg-white border border-ink/10 hover:border-accent/60 hover:bg-accent/[0.03] transition-all duration-300"
                      >
                        <span className="flex items-center justify-between gap-3">
                          <span className="text-ink group-hover:text-ink transition-colors">
                            {s}
                          </span>
                          <span
                            aria-hidden
                            className="text-ink/30 group-hover:text-accent group-hover:translate-x-0.5 transition-all duration-300 text-[0.95rem]"
                          >
                            →
                          </span>
                        </span>
                      </motion.button>
                    ))}
                  </div>

                  {/* hairline trust note */}
                  <div className="pt-2 flex items-center gap-2 text-[0.62rem] uppercase tracking-[0.22em] text-ink/35 font-semibold">
                    <span aria-hidden className="w-1.5 h-1.5 rounded-full bg-accent" />
                    Trained on Tabby docs only
                  </div>
                </div>
              )}

              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ y: 6, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={
                      m.role === "user"
                        ? "max-w-[85%] px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-2xl rounded-br-md bg-ink text-cream text-[0.88rem] sm:text-[0.92rem] leading-[1.5] whitespace-pre-wrap break-words shadow-[0_8px_22px_-10px_rgba(14,14,14,0.5)]"
                        : "max-w-[92%] relative pl-3.5 text-ink text-[0.92rem] sm:text-[0.96rem] leading-[1.58] whitespace-pre-wrap break-words"
                    }
                  >
                    {m.role === "assistant" && (
                      <span
                        aria-hidden
                        className="absolute left-0 top-1.5 bottom-1.5 w-[2px] rounded-full bg-accent/55"
                      />
                    )}
                    {m.content || (
                      <span className="inline-flex items-center gap-2 text-ink/55 text-[0.82rem] uppercase tracking-[0.2em] font-semibold">
                        <span className="relative inline-flex">
                          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                          <span
                            aria-hidden
                            className="absolute inset-0 w-1.5 h-1.5 rounded-full bg-accent animate-ping opacity-70"
                          />
                        </span>
                        thinking
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* ──── Input ──── */}
            <form
              onSubmit={onSubmit}
              className="ph-no-capture border-t border-ink/10 bg-white px-3.5 sm:px-4 pt-3 pb-2.5 sm:pt-3.5"
            >
              <div className="flex items-end gap-2">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={onKeyDown}
                  rows={1}
                  placeholder="Ask anything…"
                  className="ph-no-capture flex-1 resize-none bg-transparent text-[16px] sm:text-[0.95rem] text-ink placeholder:text-ink/40 outline-none py-2 max-h-28 leading-[1.4]"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || streaming}
                  aria-label="Send message"
                  className="flex-shrink-0 w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed enabled:hover:shadow-[0_10px_28px_-8px_rgba(255,124,97,0.7)] enabled:hover:-translate-y-0.5 enabled:active:scale-95 transition-all duration-300"
                >
                  <SendIcon className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="mt-2.5 flex items-center justify-between gap-3 text-[0.56rem] uppercase tracking-[0.2em] text-ink/35 font-semibold">
                <span className="flex items-center gap-1.5">
                  <span aria-hidden>↵</span>
                  to send · <span aria-hidden>⇧↵</span> for new line
                </span>
                <span>AI · can be wrong</span>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
