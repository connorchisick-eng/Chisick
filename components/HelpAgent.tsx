"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LOGO } from "@/lib/images";
import { getDistinctId, track } from "@/lib/analytics";

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "How does Tabby work?",
  "When does it launch?",
  "Do my friends need the app?",
  "How much does it cost?",
];

export function HelpAgent() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streaming]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

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
    setMessages([...history, { role: "assistant", content: "" }]);
    setInput("");
    setStreaming(true);

    track("help_agent_message_sent", {
      msg_count: history.length,
      user_msg_len: trimmed.length,
    });

    const startedAt = performance.now();
    let firstTokenMs: number | null = null;
    let tokens = 0;

    try {
      const distinctId = getDistinctId();
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...(distinctId ? { "x-posthog-distinct-id": distinctId } : {}),
        },
        body: JSON.stringify({ messages: history }),
      });
      if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        if (firstTokenMs == null) firstTokenMs = performance.now() - startedAt;
        tokens += 1;
        acc += decoder.decode(value, { stream: true });
        setMessages((cur) => {
          const copy = cur.slice();
          copy[copy.length - 1] = { role: "assistant", content: acc };
          return copy;
        });
      }

      track("help_agent_response_streamed", {
        duration_ms: Math.round(performance.now() - startedAt),
        first_token_ms: firstTokenMs != null ? Math.round(firstTokenMs) : null,
        tokens_est: tokens,
        msg_count: history.length,
      });
    } catch (err) {
      setMessages((cur) => {
        const copy = cur.slice();
        copy[copy.length - 1] = {
          role: "assistant",
          content: "Something went wrong. Please try again.",
        };
        return copy;
      });
      track("help_agent_errored", {
        duration_ms: Math.round(performance.now() - startedAt),
        error_type: err instanceof Error ? err.name : "unknown",
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

  return (
    <>
      {/* Trigger */}
      <AnimatePresence>
        {!open && (
          <motion.button
            key="trigger"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            onClick={() => {
              setOpen(true);
              track("help_agent_opened", { msg_count: messages.length });
            }}
            aria-label="Open help agent"
            className="fixed right-5 sm:right-6 z-60 w-12 h-12 rounded-full bg-ink text-cream flex items-center justify-center shadow-[0_12px_32px_-14px_rgba(14,14,14,0.55)] hover:bg-accent transition-colors"
            style={{
              bottom: "max(1.25rem, env(safe-area-inset-bottom, 0px))",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 12 12" fill="none" aria-hidden>
              <path
                d="M4 4.2a2 2 0 1 1 3.2 1.6c-.7.5-1.2.9-1.2 1.7"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              <circle cx="6" cy="9.3" r="0.7" fill="currentColor" />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="panel"
            initial={{ y: 24, opacity: 0, scale: 0.97 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 280, damping: 26 }}
            data-lenis-prevent
            role="dialog"
            aria-modal="false"
            aria-label="Ask Tabby"
            className="fixed z-60 bottom-3 right-3 left-3 sm:bottom-5 sm:right-5 sm:left-auto sm:w-[400px] sm:max-h-[min(640px,85vh)] h-[min(82dvh,680px)] sm:h-auto flex flex-col overflow-hidden bg-surface rounded-[22px] sm:rounded-[28px] shadow-[0_30px_80px_-20px_rgba(14,14,14,0.45)] border border-line"
            style={{
              marginBottom: "max(0px, env(safe-area-inset-bottom, 0px))",
            }}
          >
            {/* Accent stripe */}
            <div className="h-1 w-full bg-gradient-to-r from-accent via-[rgb(253,213,9)] to-accent" />

            {/* Header */}
            <div className="relative flex items-center justify-between gap-3 px-4 py-3.5 bg-ink text-cream">
              <div className="flex items-center gap-3 min-w-0">
                <span className="relative inline-flex w-10 h-10 shrink-0 items-center justify-center rounded-[30%] bg-white shadow-[0_8px_20px_-8px_rgba(255,124,97,0.55)] ring-1 ring-white/20">
                  <Image
                    src={LOGO}
                    alt="Tabby"
                    width={30}
                    height={30}
                    className="pointer-events-none"
                  />
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[rgb(74,222,128)] ring-2 ring-ink" aria-hidden />
                </span>
                <div className="leading-tight min-w-0">
                  <div className="font-grotesk font-bold text-[1rem] truncate">
                    Ask Tabby
                  </div>
                  <div className="text-[0.6rem] uppercase tracking-[0.22em] text-cream/55 font-semibold truncate flex items-center gap-1.5">
                    <span className="inline-block w-1 h-1 rounded-full bg-[rgb(74,222,128)]" />
                    Online · Instant replies
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  setOpen(false);
                  track("help_agent_closed", { msg_count: messages.length });
                }}
                aria-label="Close help agent"
                className="w-9 h-9 shrink-0 rounded-full flex items-center justify-center bg-cream/5 hover:bg-cream/15 hover:rotate-90 transition-all duration-300"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
                  <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {/* Messages */}
            <div
              ref={scrollRef}
              className="no-scrollbar flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 sm:px-5 py-5 sm:py-6 space-y-4"
            >
              {messages.length === 0 && (
                <div className="space-y-5">
                  <div>
                    <div className="text-[0.6rem] sm:text-[0.62rem] uppercase tracking-[0.24em] text-fg/40 font-semibold">
                      Welcome
                    </div>
                    <p className="mt-2 font-grotesk font-bold text-fg text-[1.3rem] sm:text-[1.55rem] leading-[1.15] sm:leading-[1.1] tracking-[-0.02em]">
                      Hey. <span className="italic text-accent">Ask me anything</span> about Tabby.
                    </p>
                    <p className="mt-3 text-fg/60 text-[0.85rem] sm:text-[0.92rem] leading-normal">
                      How it works, pricing, launch date — whatever you need.
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="text-[0.58rem] uppercase tracking-[0.24em] text-fg/35 font-semibold mb-1">
                      Suggested
                    </div>
                    {SUGGESTIONS.map((s) => (
                      <button
                        key={s}
                        onClick={() => {
                          track("help_agent_suggestion_clicked", {
                            suggestion: s,
                          });
                          send(s);
                        }}
                        className="group flex items-center justify-between gap-3 text-left text-[0.85rem] sm:text-[0.88rem] px-4 py-2.5 sm:py-3 rounded-2xl bg-card border border-line text-fg hover:border-accent hover:bg-accent/5 hover:-translate-y-px transition-all"
                      >
                        <span className="truncate">{s}</span>
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 12 12"
                          fill="none"
                          aria-hidden
                          className="shrink-0 text-fg/30 group-hover:text-accent group-hover:translate-x-0.5 transition-all"
                        >
                          <path d="M3 6h6M6 3l3 3-3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={
                      m.role === "user"
                        ? "max-w-[85%] px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-2xl rounded-br-md bg-ink text-cream text-[0.88rem] sm:text-[0.92rem] leading-normal whitespace-pre-wrap wrap-break-word shadow-[0_6px_18px_-10px_rgba(14,14,14,0.5)]"
                        : "max-w-[92%] text-fg text-[0.9rem] sm:text-[0.95rem] leading-[1.55] whitespace-pre-wrap wrap-break-word"
                    }
                  >
                    {m.content || (
                      <span className="inline-flex gap-1.5 items-center h-5" aria-label="Tabby is typing">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent/70 animate-bounce [animation-delay:-0.3s]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-accent/70 animate-bounce [animation-delay:-0.15s]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-accent/70 animate-bounce" />
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <form
              onSubmit={onSubmit}
              className="border-t border-line bg-card px-3 sm:px-3.5 py-3 sm:py-3.5"
            >
              <div className="flex items-end gap-2 rounded-full bg-surface border border-line pl-4 pr-1.5 py-1 focus-within:border-accent focus-within:shadow-[0_0_0_4px_rgba(255,124,97,0.12)] transition-all">
                <label htmlFor="help-agent-input" className="sr-only">
                  Ask Tabby
                </label>
                <textarea
                  id="help-agent-input"
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={onKeyDown}
                  rows={1}
                  placeholder="Ask anything…"
                  /* Mask chat content out of PostHog session recordings. */
                  data-ph-no-capture
                  style={{ outline: "none", boxShadow: "none" }}
                  className="no-scrollbar flex-1 resize-none bg-transparent text-[16px] sm:text-[0.95rem] text-fg placeholder:text-fg/40 outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:shadow-none py-2 max-h-28 leading-[1.4]"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || streaming}
                  aria-label="Send message"
                  className="shrink-0 w-9 h-9 rounded-full bg-accent text-white flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[rgb(240,108,82)] hover:scale-105 active:scale-95 transition-all shadow-[0_6px_14px_-6px_rgba(255,124,97,0.7)] disabled:shadow-none"
                >
                  <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden>
                    <path d="M7 12V2M3 6l4-4 4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
              <div className="mt-2.5 pb-0.5 text-center text-[0.48rem] uppercase tracking-[0.18em] text-fg/30">
                AI answers can occasionally be wrong
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
