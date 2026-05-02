import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { SmoothScroll } from "@/components/SmoothScroll";
import { SiteChrome } from "@/components/SiteChrome";
import { Ready } from "@/components/Ready";
import { HelpAgent } from "@/components/HelpAgent";
import { HashScroller } from "@/components/HashScroller";
import { PostHogProvider } from "@/components/PostHogProvider";

export const metadata: Metadata = {
  title: "Tabby — Enjoy the meal, not the math.",
  description:
    "Scan the receipt. Claim your items. Settle up before you leave the table. Tabby launches Q4 2026.",
  metadataBase: new URL("https://splittabby.com"),
  alternates: { canonical: "/" },
  openGraph: {
    title: "Tabby — Enjoy the meal, not the math.",
    description:
      "Scan the receipt. Claim your items. Settle up before you leave the table.",
    type: "website",
    url: "https://splittabby.com",
    siteName: "Tabby",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tabby — Enjoy the meal, not the math.",
    description:
      "Scan the receipt. Claim your items. Settle up before you leave the table.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Cabinet Grotesk — fetched via a non-blocking <link> instead of
            a CSS @import so it doesn't block CSS parsing / first paint.
            Preconnect warms up the TLS handshake. While the font is in
            flight, a metric-matched fallback face (defined in globals.css)
            renders text at the same dimensions, eliminating CLS on swap. */}
        <link rel="preconnect" href="https://fonts.cdnfonts.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.cdnfonts.com/css/cabinet-grotesk"
        />
      </head>
      <body>
        <PostHogProvider>
          <Ready />
          <SmoothScroll />
          <HashScroller />
          <SiteChrome>{children}</SiteChrome>
          <HelpAgent />
          <Analytics />
          <SpeedInsights />
        </PostHogProvider>
      </body>
    </html>
  );
}
