"use client";

import { useState } from "react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { useLanguage } from "@/lib/i18n/language-context";
import { translations, type Lang } from "@/lib/i18n/translations";
import { HealthInformationTopicGrid } from "./HealthInformationTopicGrid";
import { RomanesGlossaryDrawer } from "./RomanesGlossaryDrawer";
import { RomanianDualRegisterGlossary } from "./RomanianDualRegisterGlossary";
import { MedicalSafetyDisclaimer } from "./MedicalSafetyDisclaimer";
import { DoctorValidatedBadge } from "./DoctorValidatedBadge";
import { TopicDoctorExitBanner } from "./TopicDoctorExitBanner";
import { FindHelpPrompt } from "@/components/find-help/FindHelpPrompt";
import { TrueFalseQuizSection } from "@/components/landing/TrueFalseQuizSection";

/** Kept for links that still pass a view; the page now has a single view. */
export type HealthInfoView = "menu" | "topics" | "triage";

export interface HealthInformationPageContentProps {
  initialView?: HealthInfoView;
  initialViewMode?: HealthInfoView;
  initialCategory?: string;
}

const dictionaryTabLabels: Record<Lang, { dictionary: string; romanes: string }> = {
  ro: { dictionary: "Dicționar", romanes: "În romani" },
  en: { dictionary: "Dictionary", romanes: "In Romani" },
  sq: { dictionary: "Fjalori", romanes: "Në gjuhën rome" },
  it: { dictionary: "Dizionario", romanes: "In romanì" },
};

function useSafeLanguage() {
  try {
    const ctx = useLanguage();
    return ctx;
  } catch {
    return { lang: "ro" as Lang, t: translations.ro, setLang: () => {} };
  }
}

/**
 * Health information: one library. A short hero, then a single card with search,
 * categories, reading settings and every guide; no menu screen and no tabs.
 * "Check a symptom" opens the 3D health check at /health-check.
 */
export function HealthInformationPageContent(props: HealthInformationPageContentProps = {}) {
  const { initialCategory = "toate" } = props;
  const { lang, t } = useSafeLanguage();
  const page = t.healthInfoPage;

  const [readingLevel, setReadingLevel] = useState<"simple" | "complete">("simple");
  const [openDrawer, setOpenDrawer] = useState<"dictionary" | "romanes" | null>(null);

  const tabLabels = dictionaryTabLabels[lang] ?? dictionaryTabLabels.ro;
  const drawerTabs = {
    dictionaryLabel: tabLabels.dictionary,
    romanesLabel: tabLabels.romanes,
    onSelect: (tab: "dictionary" | "romanes") => setOpenDrawer(tab),
  };

  return (
    <main id="main-content" className="flex-1 bg-background">
      <section className="bg-background">
        <Container className="pt-8 sm:pt-10">
          <h1 className="text-3xl font-semibold tracking-[-0.025em] text-foreground text-balance sm:text-4xl">
            {page.heroTitle}
          </h1>
          <p className="mt-3 max-w-[65ch] text-base leading-relaxed text-muted-foreground text-pretty sm:text-lg">
            {page.heroSubtitle}
          </p>
          <DoctorValidatedBadge variant="inline" doctorName="Dr. Elena Radu" className="mt-3 -ml-0.5" />
        </Container>
      </section>

      <section className="py-6 sm:py-8">
        <Container>
          <HealthInformationTopicGrid
            initialCategory={initialCategory}
            readingLevel={readingLevel}
            onReadingLevelChange={setReadingLevel}
            onOpenDictionary={() => setOpenDrawer("dictionary")}
          />
        </Container>
      </section>

      <TrueFalseQuizSection className="border-t border-border" />

      <section className="border-b border-border py-12 sm:py-16">
        <Container>
          <SectionHeading as="h2" title={page.usingInfoTitle} subtitle={page.usingInfoSubtitle} />
          {/* Three short steps as a plain numbered list: no cards, no icons, no entrance cascade. */}
          <ol className="mt-8 grid gap-x-8 gap-y-6 md:grid-cols-3">
            {page.usingInfoSteps.map(({ title, description }, index) => (
              <li key={title} className="flex gap-3 border-t border-border pt-4">
                <span className="w-5 shrink-0 text-lg font-semibold tabular-nums text-muted-foreground">{index + 1}</span>
                <div>
                  <h3 className="text-lg font-semibold leading-snug text-foreground">{title}</h3>
                  <p className="mt-1.5 text-base leading-relaxed text-muted-foreground">{description}</p>
                </div>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <Container className="py-10">
        <TopicDoctorExitBanner />
        <FindHelpPrompt lang={lang} className="mt-4" />
      </Container>

      <Container className="pb-10">
        <MedicalSafetyDisclaimer lang={lang} />
      </Container>

      <RomanianDualRegisterGlossary
        isOpen={openDrawer === "dictionary"}
        onClose={() => setOpenDrawer(null)}
        tabs={drawerTabs}
        lang={lang}
      />
      <RomanesGlossaryDrawer
        isOpen={openDrawer === "romanes"}
        onClose={() => setOpenDrawer(null)}
        tabs={drawerTabs}
        lang={lang}
      />
    </main>
  );
}
