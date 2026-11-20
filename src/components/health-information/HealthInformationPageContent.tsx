"use client";

import { useCallback, useEffect, useState } from "react";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { useLanguage } from "@/lib/i18n/language-context";
import { translations, type Lang } from "@/lib/i18n/translations";
import { ArticleListenButton } from "./ArticleListenButton";
import { HealthInformationTopicGrid } from "./HealthInformationTopicGrid";
import { DICTIONARY_TAB_LABELS } from "./DictionaryTabs";
import { RomanesGlossaryContent } from "./RomanesGlossaryDrawer";
import { DualRegisterGlossaryContent } from "./RomanianDualRegisterGlossary";
import { TopicNextSteps } from "./TopicNextSteps";
import { ROMANIAN_MEDICAL_GLOSSARY } from "@/lib/i18n/romanian-medical-glossary";
import { ROMANES_GLOSSARY_TERMS } from "@/lib/i18n/romanes-glossary";
import { HealthTopicCategories } from "./HealthTopicCategories";
import { TrueFalseQuizSection } from "@/components/landing/TrueFalseQuizSection";
import { handleTabKey, tabClass, TAB_LIST_CLASS } from "./diabetes/choice-styles";

export const LEARN_HUB_TABS = ["guides", "topics", "quiz", "dictionary"] as const;
export type LearnHubTab = (typeof LEARN_HUB_TABS)[number];

export const HEALTH_HUB_EXPLORER_COPY: Record<
  Lang,
  {
    exploreAria: string;
    onThisPage: string;
    guides: string;
    articles: string;
    topics: string;
    myths: string;
    dictionary: string;
    title: string;
    subtitle: string;
  }
> = {
  ro: {
    exploreAria: "Secțiunile paginii Învață și testează-te",
    onThisPage: "Alege o secțiune",
    guides: "Ghiduri și instrumente",
    articles: "Articole",
    topics: "Toate temele",
    myths: "Adevărat sau fals",
    dictionary: "Dicționar medical",
    title: "Învață și testează-te",
    subtitle:
      "Ghiduri clare cu exerciții interactive pentru tensiune, glicemie, sare, respirație și controale, plus întrebări adevărat sau fals și dicționar medical.",
  },
  en: {
    exploreAria: "Learn and test yourself sections",
    onThisPage: "Choose a section",
    guides: "Guides and tools",
    articles: "Articles",
    topics: "All topics",
    myths: "True or false",
    dictionary: "Medical dictionary",
    title: "Learn and test yourself",
    subtitle:
      "Plain guides with interactive checks for blood pressure, blood sugar, salt, breathing, and screening, plus true or false questions and a medical dictionary.",
  },
  sq: {
    exploreAria: "Seksionet Mëso dhe testo veten",
    onThisPage: "Zgjidh një seksion",
    guides: "Udhëzues dhe mjete",
    articles: "Artikuj",
    topics: "Të gjitha temat",
    myths: "E vërtetë apo e rreme",
    dictionary: "Fjalori mjekësor",
    title: "Mëso dhe testo veten",
    subtitle:
      "Udhëzues të qartë me kontrolle praktike për tensionin, gliceminë, kripën, frymëmarrjen dhe analizat, plus pyetje e vërtetë apo e rreme dhe fjalor mjekësor.",
  },
  it: {
    exploreAria: "Sezioni Impara e mettiti alla prova",
    onThisPage: "Scegli una sezione",
    guides: "Guide e strumenti",
    articles: "Articoli",
    topics: "Tutti i temi",
    myths: "Vero o falso",
    dictionary: "Dizionario medico",
    title: "Impara e mettiti alla prova",
    subtitle:
      "Guide chiare con strumenti pratici per pressione, glicemia, sale, respirazione e controlli, più domande vero o falso e dizionario medico.",
  },
  hr: {
    exploreAria: "Odjeljci Uči i testiraj se",
    onThisPage: "Odaberi odjeljak",
    guides: "Vodiči i alati",
    articles: "Članci",
    topics: "Sve teme",
    myths: "Točno ili netočno",
    dictionary: "Medicinski rječnik",
    title: "Uči i testiraj se",
    subtitle:
      "Jasni vodiči s praktičnim provjerama za tlak, šećer, sol, disanje i preglede, te pitanja točno ili netočno i medicinski rječnik.",
  },
  rom: {
    exploreAria: "Sekciye Sikljov thaj proba tu",
    onThisPage: "Alosar jekh sekciya",
    guides: "Droma thaj instrumentura",
    articles: "Artikolura",
    topics: "Sa e teme",
    myths: "Čačes vaj na",
    dictionary: "Doktorengo lavustik",
    title: "Sikljov thaj proba tu",
    subtitle:
      "Lokhe droma praktikane dikhimasa vaš o presia, guglimo, lon, phurdipen thaj kontrole, plus čačes vaj na pučimata thaj doktorengo lavustik.",
  },
  ru: {
    exploreAria: "Разделы Учись и проверяй себя",
    onThisPage: "Выберите раздел",
    guides: "Памятки и тесты",
    articles: "Статьи",
    topics: "Все темы",
    myths: "Правда или ложь",
    dictionary: "Медицинский словарь",
    title: "Учись и проверяй себя",
    subtitle:
      "Понятные памятки с практическими проверками давления, сахара, соли, дыхания и обследований, а также вопросы правда или ложь и медицинский словарь.",
  },
};

/** Kept for links that pass an initial tab alias. */
export type HealthInfoView = "menu" | "topics" | "triage";

export interface HealthInformationPageContentProps {
  initialView?: HealthInfoView;
  initialViewMode?: HealthInfoView;
  initialCategory?: string;
}

function useSafeLanguage() {
  try {
    return useLanguage();
  } catch {
    return { lang: "ro" as Lang, t: translations.ro, setLang: () => {} };
  }
}

function resolveTabFromUrl(): { tab: LearnHubTab | null; dictSub: "dictionary" | "romanes" | null } {
  if (typeof window === "undefined") return { tab: null, dictSub: null };
  const params = new URLSearchParams(window.location.search);
  const qTab = params.get("tab");
  const hash = window.location.hash.replace(/^#/, "");

  if (hash === "romanes" || qTab === "romanes") {
    return { tab: "dictionary", dictSub: "romanes" };
  }
  if (qTab === "dictionary" || hash === "dictionary" || hash === "medical-dictionary") {
    return { tab: "dictionary", dictSub: params.get("sub") === "romanes" ? "romanes" : null };
  }
  if (qTab === "quiz" || hash === "mituri-sanatate" || hash === "quiz") {
    return { tab: "quiz", dictSub: null };
  }
  if (qTab === "topics" || hash === "health-topics") {
    return { tab: "topics", dictSub: null };
  }
  if (qTab === "guides" || hash === "health-guides") {
    return { tab: "guides", dictSub: null };
  }
  return { tab: null, dictSub: null };
}

/**
 * Learn and test yourself hub: 4 clear tabs covering all 8 interactive guides,
 * the topic library, the true-or-false myth check, and the inline dual-register + Romani dictionary.
 */
export function HealthInformationPageContent(props: HealthInformationPageContentProps = {}) {
  const { initialView, initialCategory = "toate" } = props;
  const { lang } = useSafeLanguage();

  const [activeTab, setActiveTab] = useState<LearnHubTab>(
    initialView === "topics" ? "topics" : "guides",
  );
  const [dictSubTab, setDictSubTab] = useState<"dictionary" | "romanes">("dictionary");
  const explorer = HEALTH_HUB_EXPLORER_COPY[lang] ?? HEALTH_HUB_EXPLORER_COPY.ro;

  useEffect(() => {
    const syncFromUrl = () => {
      const resolved = resolveTabFromUrl();
      if (resolved.tab) {
        setActiveTab(resolved.tab);
      }
      if (resolved.dictSub) {
        setDictSubTab(resolved.dictSub);
      }
    };
    syncFromUrl();
    window.addEventListener("hashchange", syncFromUrl);
    return () => window.removeEventListener("hashchange", syncFromUrl);
  }, []);

  const handleSelectTab = useCallback((nextTab: LearnHubTab) => {
    setActiveTab(nextTab);
    if (typeof window !== "undefined") {
      try {
        const nextUrl = new URL(window.location.href);
        if (nextTab === "guides") {
          nextUrl.searchParams.delete("tab");
          if (nextUrl.hash === "#health-topics" || nextUrl.hash === "#mituri-sanatate") {
            nextUrl.hash = "";
          }
        } else {
          nextUrl.searchParams.set("tab", nextTab);
          if (nextTab === "topics") nextUrl.hash = "#health-topics";
          else if (nextTab === "quiz") nextUrl.hash = "#mituri-sanatate";
          else nextUrl.hash = "";
        }
        window.history.replaceState(null, "", nextUrl.toString());
      } catch {
        // Ignore history state errors
      }
    }
  }, []);

  const sharedTabCopy = DICTIONARY_TAB_LABELS[lang] ?? DICTIONARY_TAB_LABELS.ro;
  const inlineDictionaryTabs = {
    dictionaryLabel: sharedTabCopy.dictionary,
    romanesLabel: sharedTabCopy.romanes,
    tablistAriaLabel: sharedTabCopy.tablistAria,
    dictionaryCount: ROMANIAN_MEDICAL_GLOSSARY.length,
    romanesCount: ROMANES_GLOSSARY_TERMS.length,
    onSelect: (tab: "dictionary" | "romanes") => setDictSubTab(tab),
  };

  const tabLabels: Record<LearnHubTab, string> = {
    guides: explorer.guides,
    topics: explorer.topics,
    quiz: explorer.myths,
    dictionary: explorer.dictionary,
  };

  return (
    <main id="main-content" className="flex-1 bg-background">
      <section className="pb-12 sm:pb-16">
        <Container>
          <PageHeader
            title={explorer.title}
            lead={explorer.subtitle}
            actions={
              <ArticleListenButton
                uiLang={lang}
                textToSpeak={`${explorer.title}. ${explorer.subtitle}`}
              />
            }
          />

          <div
            role="tablist"
            aria-label={explorer.exploreAria}
            className={`${TAB_LIST_CLASS} mt-6`}
          >
            {LEARN_HUB_TABS.map((tabId) => {
              const isSelected = activeTab === tabId;
              return (
                <button
                  key={tabId}
                  id={`learn-tab-${tabId}`}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  aria-controls={`learn-panel-${tabId}`}
                  tabIndex={isSelected ? 0 : -1}
                  onClick={() => handleSelectTab(tabId)}
                  onKeyDown={(event) =>
                    handleTabKey(event, LEARN_HUB_TABS, activeTab, handleSelectTab)
                  }
                  className={tabClass(isSelected)}
                >
                  {tabLabels[tabId]}
                </button>
              );
            })}
          </div>

          <div
            id={`learn-panel-${activeTab}`}
            role="tabpanel"
            aria-labelledby={`learn-tab-${activeTab}`}
            className="mt-7 sm:mt-8"
          >
            {activeTab === "guides" && (
              <HealthInformationTopicGrid
                initialCategory={initialCategory}
                onOpenDictionary={() => {
                  setDictSubTab("dictionary");
                  handleSelectTab("dictionary");
                }}
              />
            )}

            {activeTab === "topics" && <HealthTopicCategories embedded />}

            {activeTab === "quiz" && (
              <TrueFalseQuizSection embedded initialCategory={initialCategory} />
            )}

            {activeTab === "dictionary" && (
              <div className="space-y-6">
                {dictSubTab === "dictionary" ? (
                  <DualRegisterGlossaryContent
                    inline
                    isActive={activeTab === "dictionary" && dictSubTab === "dictionary"}
                    tabs={inlineDictionaryTabs}
                    lang={lang}
                  />
                ) : (
                  <RomanesGlossaryContent
                    inline
                    isActive={activeTab === "dictionary" && dictSubTab === "romanes"}
                    tabs={inlineDictionaryTabs}
                    lang={lang}
                  />
                )}
              </div>
            )}
          </div>
        </Container>
      </section>

      <section className="border-t border-border">
        <Container className="py-10 sm:py-14">
          <TopicNextSteps lang={lang} />
        </Container>
      </section>
    </main>
  );
}
