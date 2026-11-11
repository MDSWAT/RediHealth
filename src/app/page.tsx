import { Hero } from "@/components/landing/Hero";
import { RegionalHealthRibbon } from "@/components/news/RegionalHealthRibbon";
import { HelpOptions } from "@/components/landing/HelpOptions";
import { StackedSections, StackLayer } from "@/components/landing/StackedSections";
import { HealthTopics } from "@/components/landing/HealthTopics";
import { TrueFalseQuizSection } from "@/components/landing/TrueFalseQuizSection";
import { TrustSection } from "@/components/landing/TrustSection";

export default function Home() {
  return (
    <main id="main-content" className="flex-1">
      <StackedSections>
        <StackLayer className="bg-ink-950">
          <Hero />
          <RegionalHealthRibbon />
        </StackLayer>
        <StackLayer>
          <HelpOptions />
        </StackLayer>
        <StackLayer>
          <HealthTopics />
        </StackLayer>
        <StackLayer>
          <TrueFalseQuizSection />
        </StackLayer>
        <StackLayer>
          <TrustSection />
        </StackLayer>
      </StackedSections>
    </main>
  );
}
