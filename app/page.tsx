import { Hero } from "@/components/sections/Hero";
import { FlipStatement } from "@/components/sections/FlipStatement";
import { Swiper } from "@/components/sections/Swiper";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { Showcase } from "@/components/sections/Showcase";
import { Pricing } from "@/components/sections/Pricing";
import { FAQ } from "@/components/sections/FAQ";
import { CTA } from "@/components/sections/CTA";

export default function HomePage() {
  return (
    <main>
      <Hero />
      <FlipStatement variant="light" interval={2200} />
      <Swiper />
      <HowItWorks />
      <Showcase />
      <Pricing />
      <FAQ />
      <CTA />
    </main>
  );
}
