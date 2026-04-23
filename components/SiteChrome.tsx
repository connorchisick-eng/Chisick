"use client";
import { usePathname } from "next/navigation";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";

// Routes that render only the demo and should not show site-wide Nav/Footer
// chrome. Everything else keeps the standard shell.
const HIDE_CHROME = new Set<string>(["/"]);

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hidden = HIDE_CHROME.has(pathname);
  return (
    <>
      {!hidden && <Nav />}
      {children}
      {!hidden && <Footer />}
    </>
  );
}
