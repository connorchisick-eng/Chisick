"use client";
import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

type Props = {
  text: string;
  className?: string;
  as?: "span" | "div" | "h1" | "h2" | "h3" | "p";
  stagger?: number;
  delay?: number;
  trigger?: "load" | "scroll";
  duration?: number;
  accent?: boolean; // paint italic accent orange
};

export function SplitText({
  text,
  className = "",
  as = "span",
  stagger = 0.07,
  delay = 0,
  trigger = "load",
  duration = 1.1,
}: Props) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    gsap.registerPlugin(ScrollTrigger);
    const spans = ref.current.querySelectorAll<HTMLElement>(".word > span");

    const tween = gsap.fromTo(
      spans,
      { yPercent: 112 },
      {
        yPercent: 0,
        duration,
        ease: "expo.out",
        stagger,
        delay,
        paused: true,
      },
    );

    if (trigger === "load") {
      tween.play();
      return () => {
        tween.kill();
      };
    }
    const st = ScrollTrigger.create({
      trigger: ref.current,
      start: "top 85%",
      once: true,
      onEnter: () => tween.play(),
    });
    return () => {
      st.kill();
      tween.kill();
    };
  }, [text, stagger, delay, trigger, duration]);

  const words = text.split(" ");
  const content = words.map((w, i) => (
    <span className="word" key={`${w}-${i}`}>
      <span>
        {w}
        {i < words.length - 1 ? "\u00A0" : ""}
      </span>
    </span>
  ));

  const Tag = as as keyof React.JSX.IntrinsicElements;
  return (
    // @ts-expect-error — dynamic tag ref typing
    <Tag ref={ref} className={className} aria-label={text}>
      {content}
    </Tag>
  );
}
