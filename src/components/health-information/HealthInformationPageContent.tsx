"use client";

import { useState } from "react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { useLanguage } from "@/lib/i18n/language-context";
import { translations, type Lang } from "@/lib/i18n/translations";
import { HealthInformationTopicGrid } from "./HealthInformationTopicGrid";
import { RomanesGlossaryDrawer } from "./RomanesGlossaryDrawer";
import { RomanianDualRegisterGlossary } from "./RomanianDualRegisterGlossary";
import { TopicNextSteps } from "./TopicNextSteps";
import { TrueFalseQuizSection } from "@/components/landing/TrueFalseQuizSection";

/** Kept for links that still pass a view; the page now has a single view. */
export type HealthInfoView = "menu" | "topics" | "triage";

export interface HealthInformationPageContentProps {
  initialView?: HealthInfoView;
  initialViewMode?: HealthInfoView;
  initialCategory?: string;
}

const dictionaryTabLabels: Record<
  Lang,
  {
    dictionary: string;
    romanes: string;
    simpleModeNote: string;
    completeModeNote: string;
  }
> = {
  ro: {
    dictionary: "Dicționar",
    romanes: "În romani",
    simpleModeNote: "Afișare în limbaj simplu — rezumate directe pentru lectură rapidă.",
    completeModeNote: "Afișare ghid complet — ideile clinice cheie apar direct pe fiecare card.",
  },
  en: {
    dictionary: "Dictionary",
    romanes: "In Romani",
    simpleModeNote: "Showing plain language — short summaries for quick reading.",
    completeModeNote: "Showing complete guide — key clinical facts appear on every card.",
  },
  sq: {
    dictionary: "Fjalori",
    romanes: "Në gjuhën rome",
    simpleModeNote: "Shfaqje me gjuhë të thjeshtë — përmbledhje të shkurtra për lexim të shpejtë.",
    completeModeNote: "Shfaqje e plotë — faktet klinike kryesore shfaqen në çdo kartë.",
  },
  it: {
    dictionary: "Dizionario",
    romanes: "In romanì",
    simpleModeNote: "Modalità linguaggio semplice — riassunti brevi per una lettura rapida.",
    completeModeNote: "Modalità guida completa — i punti clinici chiave compaiono su ogni scheda.",
  },
  hr: {
    dictionary: "Rječnik",
    romanes: "Na romskom",
    simpleModeNote: "Prikaz na jednostavnom jeziku: kratki sažeci za brzo čitanje.",
    completeModeNote: "Prikaz potpunog vodiča: ključne kliničke činjenice prikazane su na svakoj kartici.",
  },
  rom: {
    dictionary: "Lavustik",
    romanes: "Pe romani chib",
    simpleModeNote: "Lokhi chib: xarne sikavimata vash sigo drabarimos.",
    completeModeNote: "Sa o sikavimos: le bare sastipnaske faktura dichon pe svako karta.",
  },
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
 * Health information: one library. A short hero, then search, categories, reading
 * settings and every guide on the page background; no menu screen and no tabs.
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
      <section className="border-b border-border/70 bg-background">
        <Container className="pt-8 pb-6 sm:pt-10 sm:pb-8">
          <h1 className="text-3xl font-semibold tracking-[-0.025em] text-foreground text-balance sm:text-4xl">
            {page.heroTitle}
          </h1>
          <p className="mt-3 max-w-[65ch] text-base leading-relaxed text-muted-foreground text-pretty sm:text-lg">
            {page.heroSubtitle}
          </p>
          <p role="status" className="mt-3 text-sm font-medium text-sapphire">
            {readingLevel === "complete"
              ? tabLabels.completeModeNote
              : tabLabels.simpleModeNote}
          </p>
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
          <ol className="mt-8 grid gap-6 md:grid-cols-3">
            {page.usingInfoSteps.map(({ title, description }, index) => (
              <li
                key={title}
                className="flex flex-col rounded-xl border border-border bg-card p-6 sm:p-7"
              >
                <span className="inline-flex w-fit items-center rounded-md bg-sapphire-soft px-2.5 py-1 text-xs font-bold tabular-nums text-sapphire">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-3 text-xl font-semibold leading-snug text-foreground sm:text-[22px]">
                  {title}
                </h3>
                <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
                  {description}
                </p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* One closing surface: talk to a doctor, ask at a pharmacy, the safety note. */}
      <Container className="py-10 sm:py-12">
        <TopicNextSteps lang={lang} />
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
