"use client";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "@/components/SplitText";

const ITEMS = [
  {
    q: "How does Tabby split the bill?",
    a: "One person scans the receipt. Everyone on the tab claims the items they ordered. Shared plates can be split evenly or by custom amounts among whoever claims them. Each person selects a tip, reviews their total, and pays their share. All funds are held in escrow until everyone has paid. Once the full amount is collected, a one-time virtual card appears on the tab initiator's phone. They tap it to the POS terminal and pay the restaurant in one clean transaction. No one fronts the bill. No chasing payments after the meal. Done before the server comes back.",
  },
  {
    q: "Do all my friends need the app?",
    a: "No. While having the app makes the experience faster, anyone can join a tab through a URL link. The tab creator shares the link, and participants can claim their items and pay their share without downloading anything. For regular users, the app makes starting and joining tabs instant.",
  },
  {
    q: "What payment methods are supported?",
    a: "Debit cards, credit cards, and bank accounts. Cryptocurrency payments are coming in a future version. You add a payment method once and it's saved for future tabs.",
  },
  {
    q: "Is my payment info secure?",
    a: "Yes. Payment processing is handled through our banking infrastructure partner. We never store your card number or bank details on our servers. All transactions are encrypted and processed through PCI-compliant systems. Funds are held in secure escrow until the tab is complete. Your payment information is as secure as any major banking app.",
  },
  {
    q: "How much does Tabby cost?",
    a: "Tabby charges a flat 1.5% fee per settlement — no per-person fees, no hidden charges. You only pay when a tab is settled. Join the waitlist and you'll get early access to every feature when we launch.",
  },
  {
    q: "Is Tabby available outside the US?",
    a: "Not yet. We're launching in the United States first so we can nail the experience with one banking infrastructure. International rollout is planned for later — join the waitlist and we'll let you know the moment Tabby lands in your country.",
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  const ref = useRef<HTMLDivElement>(null);
  const bodyRefs = useRef<(HTMLDivElement | null)[]>([]);

  // entrance
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".acc-item",
        { y: 30, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.85,
          ease: "expo.out",
          stagger: 0.06,
          scrollTrigger: { trigger: ref.current, start: "top 80%", once: true },
        },
      );
    }, ref);
    return () => ctx.revert();
  }, []);

  // GSAP-driven accordion height animation
  useEffect(() => {
    bodyRefs.current.forEach((body, i) => {
      if (!body) return;
      const target = i === open ? body.scrollHeight : 0;
      gsap.to(body, {
        height: target,
        duration: 0.6,
        ease: "expo.inOut",
      });
    });
  }, [open]);

  return (
    <section id="faq" ref={ref} className="relative bg-surface">
      <div className="mx-auto max-w-[980px] px-6 lg:px-10 pt-24 lg:pt-32 pb-24 lg:pb-32">
        {/* Section header — large orange display heading */}
        <div className="text-center">
          <h2 className="font-grotesk font-bold italic text-accent text-display leading-[0.95]">
            FAQs.
          </h2>
        </div>

        {/* Q&A */}
        <div className="mt-14 lg:mt-20">
          {ITEMS.map((item, i) => {
            const isOpen = open === i;
            return (
              <div
                key={item.q}
                className={`acc-item ${isOpen ? "is-open" : ""}`}
              >
                <button
                  className="acc-head"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                >
                  <span className="flex items-start gap-5">
                    <span className="text-xs text-body/40 font-bold tracking-[0.22em] pt-2 hidden sm:inline">
                      0{i + 1}
                    </span>
                    <span>{item.q}</span>
                  </span>
                  <span className="acc-icon" />
                </button>
                <div
                  className="acc-body"
                  ref={(el) => {
                    bodyRefs.current[i] = el;
                  }}
                >
                  <div className="acc-body-inner pl-0 sm:pl-[52px]">
                    {item.a}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Still have questions? */}
        <div className="mt-16 lg:mt-20 text-center">
          <div className="inline-flex flex-col items-center gap-3">
            <span className="eyebrow text-body/40">Can't find it?</span>
            <p className="font-grotesk font-bold text-body text-3xl md:text-4xl leading-[1.1] tracking-[-0.02em] max-w-md">
              Still have questions?
            </p>
            <p className="text-body/60 text-base max-w-sm">
              Tap{" "}
              <span className="font-semibold text-body">Ask Tabby</span> in the
              corner — our AI answers in seconds.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
