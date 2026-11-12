"use client";

import { useState } from "react";
import { Container } from "@/components/ui/Container";
import { useLanguage } from "@/lib/i18n/language-context";
import { translations, type Lang } from "@/lib/i18n/translations";
import { HealthInformationTopicGrid } from "./HealthInformationTopicGrid";
import { DICTIONARY_TAB_LABELS } from "./DictionaryTabs";
import { RomanesGlossaryDrawer } from "./RomanesGlossaryDrawer";
import { RomanianDualRegisterGlossary } from "./RomanianDualRegisterGlossary";
import { TopicNextSteps } from "./TopicNextSteps";
import { TrueFalseQuizSection } from "@/components/landing/TrueFalseQuizSection";
import { ROMANIAN_MEDICAL_GLOSSARY } from "@/lib/i18n/romanian-medical-glossary";
import { ROMANES_GLOSSARY_TERMS } from "@/lib/i18n/romanes-glossary";
import { InformedHealthDirectory } from "./InformedHealthDirectory";
import { HealthArticleDirectory } from "./HealthArticleDirectory";

/** Kept for links that still pass a view; the page now has a single view. */
export type HealthInfoView = "menu" | "topics" | "triage";

export interface HealthInformationPageContentProps {
  initialView?: HealthInfoView;
  initialViewMode?: HealthInfoView;
  initialCategory?: string;
}

function useSafeLanguage() {
  try {
    const ctx = useLanguage();
    return ctx;
  } catch {
    return { lang: "ro" as Lang, t: translations.ro, setLang: () => {} };
  }
}

/**
 * Health information is a library: the title, then search, topics, reading tools and the guides,
 * all on one surface. After the guides come the true-or-false quiz and the "talk to a doctor" close.
 * "Check a symptom" opens the 3D health check at /health-check.
 */
export function HealthInformationPageContent(props: HealthInformationPageContentProps = {}) {
  const { initialCategory = "toate" } = props;
  const { lang, t } = useSafeLanguage();
  const page = t.healthInfoPage;

  const [readingLevel, setReadingLevel] = useState<"simple" | "complete">("simple");
  const [openDrawer, setOpenDrawer] = useState<"dictionary" | "romanes" | null>(null);

  const sharedTabCopy = DICTIONARY_TAB_LABELS[lang] ?? DICTIONARY_TAB_LABELS.ro;
  const drawerTabs = {
    dictionaryLabel: sharedTabCopy.dictionary,
    romanesLabel: sharedTabCopy.romanes,
    tablistAriaLabel: sharedTabCopy.tablistAria,
    dictionaryCount: ROMANIAN_MEDICAL_GLOSSARY.length,
    romanesCount: ROMANES_GLOSSARY_TERMS.length,
    onSelect: (tab: "dictionary" | "romanes") => setOpenDrawer(tab),
  };

  return (
    <main id="main-content" className="flex-1 bg-background">
      <section className="pb-12 pt-8 sm:pb-16 sm:pt-12">
        <Container>
          <header className="max-w-3xl">
            <h1 className="text-[34px] font-semibold leading-[1.08] tracking-[-0.03em] text-foreground text-balance sm:text-5xl">
              {page.heroTitle}
            </h1>
            <p className="mt-3 max-w-[60ch] text-lg leading-relaxed text-muted-foreground text-pretty">
              {page.heroSubtitle}
            </p>
          </header>

          <HealthInformationTopicGrid
            className="mt-8 sm:mt-10"
            initialCategory={initialCategory}
            readingLevel={readingLevel}
            onReadingLevelChange={setReadingLevel}
            onOpenDictionary={() => setOpenDrawer("dictionary")}
          />
        </Container>
      </section>

      <div className="border-t border-border py-10 sm:py-14"><Container><HealthArticleDirectory /></Container></div>
      <InformedHealthDirectory />

      <TrueFalseQuizSection className="border-t border-border" />

      {/* One closing surface: talk to a doctor, ask at a pharmacy, the safety note. */}
      <section className="border-t border-border">
        <Container className="py-12 sm:py-16">
          <TopicNextSteps lang={lang} />
        </Container>
      </section>

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
