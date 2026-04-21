import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import { ThemeInit } from "@/components/ThemeInit";
import { PostHogProvider } from "@/components/providers/PostHogProvider";
import { PageViewTracker } from "@/components/PageViewTracker";

export const metadata: Metadata = {
  title: {
    default: "Tabby — Enjoy the meal, not the math.",
    template: "%s — Tabby",
  },
  description:
    "Scan the receipt. Claim your items. Settle up before you leave the table. No IOUs, no Venmo requests. Tabby launches Q4 2026.",
  metadataBase: new URL("https://tabby.app"),
  applicationName: "Tabby",
  keywords: [
    "bill splitting",
    "split the check",
    "restaurant bill",
    "receipt scanner",
    "group payments",
    "venmo alternative",
    "splitwise alternative",
    "tabby app",
  ],
  authors: [{ name: "Tabby" }],
  creator: "Tabby",
  publisher: "Tabby",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    title: "Tabby — Enjoy the meal, not the math.",
    description:
      "Scan the receipt. Claim your items. Settle up before you leave the table.",
    url: "https://tabby.app",
    siteName: "Tabby",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tabby — Enjoy the meal, not the math.",
    description:
      "Scan the receipt. Claim your items. Settle up before you leave the table.",
  },
  category: "finance",
};

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F8F4F0" },
    { media: "(prefers-color-scheme: dark)", color: "#0E0E0E" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeInit />
      </head>
      <body>
        <PostHogProvider>
          <Suspense fallback={null}>
            <PageViewTracker />
          </Suspense>
          {children}
        </PostHogProvider>
      </body>
    </html>
  );
}
