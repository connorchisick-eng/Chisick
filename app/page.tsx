import { Hero } from "@/components/sections/Hero";
import { FlipStatement } from "@/components/sections/FlipStatement";
import { Swiper } from "@/components/sections/Swiper";
import { Showcase } from "@/components/sections/Showcase";
import { FAQ } from "@/components/sections/FAQ";
import { CTA } from "@/components/sections/CTA";

export default function HomePage() {
  return (
    <main>
      <Hero />
      <FlipStatement variant="light" interval={2200} />
      {/* Swiper IS the new How It Works (id="how-it-works") */}
      <Swiper />
      <Showcase />
      <FAQ />
      <CTA />
    </main>
  );
}
