import type { Metadata } from "next";
import "./globals.css";
import { SmoothScroll } from "@/components/SmoothScroll";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Ready } from "@/components/Ready";
import { HelpAgent } from "@/components/HelpAgent";
import { HashScroller } from "@/components/HashScroller";
import { PostHogProvider } from "@/components/PostHogProvider";

export const metadata: Metadata = {
  title: "Tabby — Enjoy the meal, not the math.",
  description:
    "Scan the receipt. Claim your items. Settle up before you leave the table. Tabby launches Q4 2026.",
  metadataBase: new URL("https://tabby.app"),
  openGraph: {
    title: "Tabby — Enjoy the meal, not the math.",
    description:
      "Scan the receipt. Claim your items. Settle up before you leave the table.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <PostHogProvider>
          <Ready />
          <SmoothScroll />
          <HashScroller />
          <Nav />
          {children}
          <Footer />
          <HelpAgent />
        </PostHogProvider>
      </body>
    </html>
  );
}
