import { Hero } from "@/components/landing/Hero";
import { RegionalHealthRibbon } from "@/components/news/RegionalHealthRibbon";
import { HealthTopics } from "@/components/landing/HealthTopics";
import { TrueFalseQuizSection } from "@/components/landing/TrueFalseQuizSection";
import { TrustSection } from "@/components/landing/TrustSection";

export default function Home() {
  return (
    <main id="main-content" className="flex-1">
      <div className="bg-ink-950">
        <Hero />
        <RegionalHealthRibbon />
      </div>
      <HealthTopics />
      <TrueFalseQuizSection />
      <TrustSection />
    </main>
  );
}
