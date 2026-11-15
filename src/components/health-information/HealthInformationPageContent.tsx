"use client";

import { useState } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { useLanguage } from "@/lib/i18n/language-context";
import { withLangPrefix } from "@/lib/i18n/routing";
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
    onThisPage: string;
    guides: string;
    articles: string;
    topics: string;
    myths: string;
    feelingUnwell: string;
    checkSymptom: string;
  }
> = {
  ro: {
    exploreAria: "Explorează secțiunile bibliotecii de sănătate",
    onThisPage: "Pe această pagină",
    guides: "Ghiduri",
    articles: "Articole",
    topics: "Subiecte A–Z",
    myths: "Mituri",
    feelingUnwell: "Te simți rău?",
    checkSymptom: "Verifică un simptom",
  },
  en: {
    exploreAria: "Explore health library sections",
    onThisPage: "On this page",
    guides: "Guides",
    articles: "Articles",
    topics: "Topics A–Z",
    myths: "Myths",
    feelingUnwell: "Feeling unwell?",
    checkSymptom: "Check a symptom",
  },
  sq: {
    exploreAria: "Eksploro seksionet e bibliotekës shëndetësore",
    onThisPage: "Në këtë faqe",
    guides: "Udhëzues",
    articles: "Artikuj",
    topics: "Tema A–Z",
    myths: "Mite",
    feelingUnwell: "Ndihesh keq?",
    checkSymptom: "Kontrollo një simptomë",
  },
  it: {
    exploreAria: "Esplora le sezioni della libreria sanitaria",
    onThisPage: "In questa pagina",
    guides: "Guide",
    articles: "Articoli",
    topics: "Argomenti A–Z",
    myths: "Miti",
    feelingUnwell: "Non ti senti bene?",
    checkSymptom: "Controlla un sintomo",
  },
  hr: {
    exploreAria: "Istraži odjeljke zdravstvene knjižnice",
    onThisPage: "Na ovoj stranici",
    guides: "Vodiči",
    articles: "Članci",
    topics: "Teme A–Z",
    myths: "Mitovi",
    feelingUnwell: "Osjećate se loše?",
    checkSymptom: "Provjeri simptom",
  },
  rom: {
    exploreAria: "Dikh e sekciye e sastipnaska bibliotekake",
    onThisPage: "Pe kadaja patrin",
    guides: "Sikavimata",
    articles: "Artikolura",
    topics: "Teme A–Z",
    myths: "Mitura",
    feelingUnwell: "Nakhli tut mishto?",
    checkSymptom: "Dikh e simptome",
  },
  ru: {
    exploreAria: "Разделы библиотеки здоровья",
    onThisPage: "На этой странице",
    guides: "Руководства",
    articles: "Статьи",
    topics: "Темы А–Я",
    myths: "Мифы",
    feelingUnwell: "Плохо себя чувствуете?",
    checkSymptom: "Проверьте симптом",
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
    "inline-flex min-h-11 items-center whitespace-nowrap rounded-sm text-body font-medium text-sapphire underline-offset-4 transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] motion-reduce:transition-none hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:text-sapphire-border";

  return (
    <main id="main-content" className="flex-1 bg-background">
      <section className="pb-12 sm:pb-16">
        <Container>
          <PageHeader
            title={page.heroTitle}
            lead={
              <>
                {page.heroSubtitle}{" "}
                <span>
                  {explorer.feelingUnwell}{" "}
                  <Link
                    href={withLangPrefix("/health-check", lang)}
                    className="inline-flex min-h-11 items-center rounded-sm font-semibold text-sapphire underline underline-offset-4 transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] motion-reduce:transition-none hover:text-sapphire-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:text-sapphire-border dark:hover:text-white"
                  >
                    {t.healthInfoPage?.tabs?.triage ?? explorer.checkSymptom}
                  </Link>
                </span>
              </>
            }
            actions={
              <ArticleListenButton
                uiLang={lang}
                textToSpeak={`${page.heroTitle}. ${page.heroSubtitle}`}
              />
            }
          />

          <nav
            aria-label={explorer.exploreAria}
            className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1"
          >
            <span className="text-body font-medium text-muted-foreground">
              {explorer.onThisPage}:
            </span>
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
