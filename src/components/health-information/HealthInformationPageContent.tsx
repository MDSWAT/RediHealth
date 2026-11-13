"use client";

import { useState } from "react";
import { Container } from "@/components/ui/Container";
import { BookIcon } from "@/components/ui/icons";
import { useLanguage } from "@/lib/i18n/language-context";
import { translations, type Lang } from "@/lib/i18n/translations";
import { ArticleListenButton } from "./ArticleListenButton";
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

export const HEALTH_HUB_EXPLORER_COPY: Record<
  Lang,
  {
    exploreAria: string;
    guides: string;
    articles: string;
    topics: string;
    myths: string;
    dictionary: string;
  }
> = {
  ro: {
    exploreAria: "Explorează secțiunile bibliotecii de sănătate",
    guides: "Ghiduri de prevenție",
    articles: "Articole detaliate",
    topics: "Subiecte medicale A–Z",
    myths: "Mituri și adevăr",
    dictionary: "Dicționar medical",
  },
  en: {
    exploreAria: "Explore health library sections",
    guides: "Prevention guides",
    articles: "Detailed articles",
    topics: "Medical topics A–Z",
    myths: "Myths and facts",
    dictionary: "Medical dictionary",
  },
  sq: {
    exploreAria: "Eksploro seksionet e bibliotekës shëndetësore",
    guides: "Udhëzues parandalimi",
    articles: "Artikuj të hollësishëm",
    topics: "Tema mjekësore A–Z",
    myths: "Mite dhe fakte",
    dictionary: "Fjalori mjekësor",
  },
  it: {
    exploreAria: "Esplora le sezioni della libreria sanitaria",
    guides: "Guide alla prevenzione",
    articles: "Articoli approfonditi",
    topics: "Argomenti medici A–Z",
    myths: "Miti e realtà",
    dictionary: "Dizionario medico",
  },
  hr: {
    exploreAria: "Istraži odjeljke zdravstvene knjižnice",
    guides: "Vodiči za prevenciju",
    articles: "Detaljni članci",
    topics: "Medicinske teme A–Z",
    myths: "Mitovi i činjenice",
    dictionary: "Medicinski rječnik",
  },
  rom: {
    exploreAria: "Dikh e sekciye e sastipnaska bibliotekake",
    guides: "Sikavimata vash prevenimos",
    articles: "Detaljime artikolura",
    topics: "Sastipnaske teme A–Z",
    myths: "Mitura thaj chachimos",
    dictionary: "Doktorengo lavustik",
  },
  ru: {
    exploreAria: "Разделы библиотеки здоровья",
    guides: "Путеводители по профилактике",
    articles: "Подробные статьи",
    topics: "Медицинские темы А–Я",
    myths: "Мифы и факты",
    dictionary: "Медицинский словарь",
  },
};

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
  const explorer = HEALTH_HUB_EXPLORER_COPY[lang] ?? HEALTH_HUB_EXPLORER_COPY.ro;

  const sharedTabCopy = DICTIONARY_TAB_LABELS[lang] ?? DICTIONARY_TAB_LABELS.ro;
  const drawerTabs = {
    dictionaryLabel: sharedTabCopy.dictionary,
    romanesLabel: sharedTabCopy.romanes,
    tablistAriaLabel: sharedTabCopy.tablistAria,
    dictionaryCount: ROMANIAN_MEDICAL_GLOSSARY.length,
    romanesCount: ROMANES_GLOSSARY_TERMS.length,
    onSelect: (tab: "dictionary" | "romanes") => setOpenDrawer(tab),
  };

  const explorerLinkClass =
    "press-row inline-flex min-h-11 shrink-0 items-center gap-2 whitespace-nowrap rounded-xl border border-border-control bg-card px-3.5 text-sm font-semibold text-foreground shadow-2xs transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] motion-reduce:transition-none hover:border-sapphire/50 hover:bg-sapphire-soft/45 hover:text-sapphire focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

  return (
    <main id="main-content" className="flex-1 bg-background">
      <section className="pb-12 pt-8 sm:pb-16 sm:pt-12">
        <Container>
          <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-3xl">
              <h1 className="text-[34px] font-semibold leading-[1.08] tracking-[-0.03em] text-foreground text-balance sm:text-5xl">
                {page.heroTitle}
              </h1>
              <p className="mt-3 max-w-[60ch] text-lg leading-relaxed text-muted-foreground text-pretty">
                {page.heroSubtitle}
              </p>
            </div>
            <div className="shrink-0 self-start sm:self-end">
              <ArticleListenButton
                uiLang={lang}
                textToSpeak={`${page.heroTitle}. ${page.heroSubtitle}`}
              />
            </div>
          </header>

          <nav
            aria-label={explorer.exploreAria}
            className="no-scrollbar -mx-4 mt-6 flex flex-nowrap gap-2 overflow-x-auto px-4 pb-1 [mask-image:linear-gradient(to_right,black_calc(100%-2.5rem),transparent)] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:[mask-image:none]"
          >
            <a href="#health-guides" className={explorerLinkClass}>
              {explorer.guides}
            </a>
            <a href="#health-articles" className={explorerLinkClass}>
              {explorer.articles}
            </a>
            <a href="#informedhealth-library" className={explorerLinkClass}>
              {explorer.topics}
            </a>
            <a href="#myths-quiz" className={explorerLinkClass}>
              {explorer.myths}
            </a>
            <button
              type="button"
              onClick={() => setOpenDrawer("dictionary")}
              className={explorerLinkClass}
            >
              <BookIcon className="h-4 w-4 shrink-0 text-sapphire" aria-hidden="true" />
              <span>{explorer.dictionary}</span>
            </button>
          </nav>

          <HealthInformationTopicGrid
            className="mt-7 sm:mt-8"
            initialCategory={initialCategory}
            readingLevel={readingLevel}
            onReadingLevelChange={setReadingLevel}
            onOpenDictionary={() => setOpenDrawer("dictionary")}
          />
        </Container>
      </section>

      <div className="border-t border-border py-10 sm:py-14"><Container><HealthArticleDirectory /></Container></div>
      <InformedHealthDirectory />

      <div id="myths-quiz" className="scroll-mt-24">
        <TrueFalseQuizSection className="border-t border-border" />
      </div>

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
