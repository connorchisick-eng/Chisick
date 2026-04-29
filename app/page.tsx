import { Hero } from "@/components/sections/Hero";
import { FlipStatement } from "@/components/sections/FlipStatement";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { Showcase } from "@/components/sections/Showcase";
import { FAQ } from "@/components/sections/FAQ";
import { CTA } from "@/components/sections/CTA";

export default function HomePage() {
  return (
    <main>
      <Hero />
      <FlipStatement variant="light" interval={2200} />
      {/* How It Works — A/B between horizontal Swiper (control) and
          vertical StickyStack (variant). Toggle with ?hiw=sticky / ?hiw=swipe
          or the dev floater bottom-left. */}
      <HowItWorks />
      <Showcase />
      <FAQ />
      <CTA />
    </main>
  );
}
