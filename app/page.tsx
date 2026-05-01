import { Hero } from "@/components/sections/Hero";
import { FlipStatement } from "@/components/sections/FlipStatement";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { Showcase } from "@/components/sections/Showcase";
import { FAQ } from "@/components/sections/FAQ";
import { SectionAnalytics } from "@/components/SectionAnalytics";

export default function HomePage() {
  return (
    <main>
      <SectionAnalytics />
      <Hero />
      <FlipStatement variant="light" interval={2200} />
      <HowItWorks />
      <Showcase />
      <FAQ />
    </main>
  );
}
