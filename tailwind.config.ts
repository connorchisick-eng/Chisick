import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        accent: "rgb(255, 124, 97)",
        accent2: "rgb(253, 213, 9)",
        cream: "rgb(248, 244, 240)",
        ink: "rgb(14, 14, 14)",
        charcoal: "rgb(26, 26, 26)",
        muted: "rgb(117, 132, 125)",
        surface: "rgb(var(--surface) / <alpha-value>)",
        "surface-alt": "rgb(var(--surface-alt) / <alpha-value>)",
        body: "rgb(var(--text-primary) / <alpha-value>)",
        line: "rgb(var(--line) / <alpha-value>)",
      },
      fontFamily: {
        grotesk: ["'Cabinet Grotesk'", "'Cabinet Grotesk Fallback'", "system-ui", "sans-serif"],
      },
      fontSize: {
        "hero": ["clamp(4.5rem, 13.2vw, 14rem)", { lineHeight: "0.88", letterSpacing: "-0.04em" }],
        "display": ["clamp(3.25rem, 9vw, 9rem)", { lineHeight: "0.92", letterSpacing: "-0.035em" }],
        "section": ["clamp(3.25rem, 7.2vw, 7.5rem)", { lineHeight: "0.94", letterSpacing: "-0.032em" }],
        "title": ["clamp(2rem, 4.4vw, 4.25rem)", { lineHeight: "1.02", letterSpacing: "-0.02em" }],
      },
      keyframes: {
        tailSway: {
          "0%, 100%": { transform: "rotate(-8deg)" },
          "50%": { transform: "rotate(8deg)" },
        },
        blink: {
          "0%, 97%, 100%": { transform: "scaleY(1)" },
          "98%, 99%": { transform: "scaleY(0.08)" },
        },
        sleep: {
          "0%, 100%": { transform: "scaleY(1)" },
          "50%": { transform: "scaleY(1.04)" },
        },
        zzz: {
          "0%": { transform: "translate(0,0) scale(0.6)", opacity: "0" },
          "25%": { opacity: "1" },
          "100%": { transform: "translate(18px,-36px) scale(1)", opacity: "0" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        tailSway: "tailSway 2.6s ease-in-out infinite",
        blink: "blink 5s ease-in-out infinite",
        sleep: "sleep 2.4s ease-in-out infinite",
        zzz: "zzz 3s ease-in-out infinite",
        marquee: "marquee 40s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
