import { SmoothScroll } from "@/components/SmoothScroll";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Ready } from "@/components/Ready";
import { HelpAgent } from "@/components/HelpAgent";
import { HashScroller } from "@/components/HashScroller";
import { CursorSpot } from "@/components/CursorSpot";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <CursorSpot />
      <Ready />
      <SmoothScroll />
      <HashScroller />
      <Nav />
      <div id="main">{children}</div>
      <Footer />
      <HelpAgent />
    </>
  );
}
