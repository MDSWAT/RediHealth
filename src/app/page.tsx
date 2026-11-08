import { Hero } from "@/components/landing/Hero";
import { RegionalHealthRibbon } from "@/components/news/RegionalHealthRibbon";
import { HelpOptions } from "@/components/landing/HelpOptions";
import { HealthTopics } from "@/components/landing/HealthTopics";
import { TrueFalseQuizSection } from "@/components/landing/TrueFalseQuizSection";
import { TrustSection } from "@/components/landing/TrustSection";

export default function Home() {
  return (
    <main id="main-content" className="flex-1">
      <Hero />
      <RegionalHealthRibbon />
      <HelpOptions />
      <HealthTopics />
      <TrueFalseQuizSection />
      <TrustSection />
    </main>
  );
}
