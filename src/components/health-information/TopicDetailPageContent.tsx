"use client";

import { useState, useCallback, useMemo } from "react";
import type { ComponentType, SVGProps } from "react";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { useLanguage } from "@/lib/i18n/language-context";
import {
  ActivityIcon,
  AppleIcon,
  BrainIcon,
  DropletIcon,
  HeartIcon,
  NoSmokingIcon,
  SearchIcon,
  ShieldIcon,
} from "@/components/ui/icons";
import {
  HEALTH_TOPICS_BASE,
  type HealthTopicContent,
} from "@/lib/i18n/health-information-topics";
import { getHealthMyths, type HealthMyth } from "@/lib/i18n/health-myths";
import { TopicHeroSection } from "./TopicHeroSection";
import {
  HEALTH_ARTICLE_CONTAINER_CLASS,
  HealthArticleToc,
} from "./HealthArticleShell";
import { WhyItMattersInfographic } from "./WhyItMattersInfographic";
import { ActionableStepsChecklist } from "./ActionableStepsChecklist";
import { WarningSignsEmergencyCard } from "./WarningSignsEmergencyCard";
import { TopicMythCard } from "./TopicMythCard";
import { RelatedTopicsCarousel } from "./RelatedTopicsCarousel";
import { TopicNextSteps } from "./TopicNextSteps";
import { TopicExplainer } from "./explainers/TopicExplainer";
import { GlobalHealthAudioPlayer } from "./GlobalHealthAudioPlayer";
import { SynchronizedSentenceReader } from "./SynchronizedSentenceReader";
import { DICTIONARY_TAB_LABELS } from "./DictionaryTabs";
import { RomanesGlossaryDrawer } from "./RomanesGlossaryDrawer";
import { RomanianDualRegisterGlossary } from "./RomanianDualRegisterGlossary";
import { ROMANIAN_MEDICAL_GLOSSARY } from "@/lib/i18n/romanian-medical-glossary";
import { ROMANES_GLOSSARY_TERMS } from "@/lib/i18n/romanes-glossary";
import type { Lang } from "@/lib/i18n/translations";

interface TopicPageUiStrings {
  whyItMattersAudioPrefix: string;
  stepsAudioPrefix: string;
  warningSignsAudioPrefix: string;
  dictionaryPrompt: string;
  dualGlossaryCta: string;
  romanesGlossaryCta: string;
  listenGuideLabel: string;
  onlineDoctorLabel: string;
  ariaSentenceSection: string;
  ariaMobileActions: string;
  tocHeading: string;
  tocAria: string;
  tocOverview: string;
  tocExplainer: string;
  tocMyth: string;
}

const TOPIC_PAGE_UI_STRINGS: Record<Lang, TopicPageUiStrings> = {
  ru: {
    tocHeading: "В этом руководстве",
    tocAria: "Содержание руководства",
    tocOverview: "Обзор",
    tocExplainer: "Наглядное объяснение",
    tocMyth: "Правда или миф",
    whyItMattersAudioPrefix: "Почему это важно",
    stepsAudioPrefix: "Что вы можете сделать",
    warningSignsAudioPrefix: "Когда получить помощь",
    dictionaryPrompt: "Сложные слова?",
    dualGlossaryCta: "Открыть словарь",
    romanesGlossaryCta: "Слова на цыганском",
    listenGuideLabel: "Слушайте руководство",
    onlineDoctorLabel: "Онлайн врач",
    ariaSentenceSection: "Текст руководства",
    ariaMobileActions: "Кнопки руководства",
  },
  ro: {
    whyItMattersAudioPrefix: "De ce contează",
    stepsAudioPrefix: "Ce poți face",
    warningSignsAudioPrefix: "Când ai nevoie de ajutor",
    dictionaryPrompt: "Cuvinte grele?",
    dualGlossaryCta: "Deschide dicționarul",
    romanesGlossaryCta: "Cuvinte în romani",
    listenGuideLabel: "Ascultă ghidul",
    onlineDoctorLabel: "Medic online",
    ariaSentenceSection: "Textul ghidului",
    ariaMobileActions: "Butoane pentru ghid",
    tocHeading: "În acest ghid",
    tocAria: "Cuprinsul ghidului",
    tocOverview: "Introducere",
    tocExplainer: "Ghid vizual",
    tocMyth: "Adevărat sau fals",
  },
  en: {
    whyItMattersAudioPrefix: "Why it matters",
    stepsAudioPrefix: "What you can do",
    warningSignsAudioPrefix: "When to get help",
    dictionaryPrompt: "Hard words?",
    dualGlossaryCta: "Open the dictionary",
    romanesGlossaryCta: "Words in Romani",
    listenGuideLabel: "Listen to the guide",
    onlineDoctorLabel: "Online doctor",
    ariaSentenceSection: "Guide text",
    ariaMobileActions: "Guide buttons",
    tocHeading: "In this guide",
    tocAria: "Guide contents",
    tocOverview: "Overview",
    tocExplainer: "Visual guide",
    tocMyth: "True or false",
  },
  sq: {
    whyItMattersAudioPrefix: "Pse ka rëndësi",
    stepsAudioPrefix: "Çfarë mund të bësh",
    warningSignsAudioPrefix: "Kur të duhet ndihmë",
    dictionaryPrompt: "Fjalë të vështira?",
    dualGlossaryCta: "Hap fjalorin",
    romanesGlossaryCta: "Fjalë në gjuhën rome",
    listenGuideLabel: "Dëgjo udhëzuesin",
    onlineDoctorLabel: "Mjeku online",
    ariaSentenceSection: "Teksti i udhëzuesit",
    ariaMobileActions: "Butonat e udhëzuesit",
    tocHeading: "Në këtë udhëzues",
    tocAria: "Përmbajtja e udhëzuesit",
    tocOverview: "Hyrje",
    tocExplainer: "Udhëzues pamor",
    tocMyth: "E vërtetë apo e gabuar",
  },
  it: {
    whyItMattersAudioPrefix: "Perché è importante",
    stepsAudioPrefix: "Cosa puoi fare",
    warningSignsAudioPrefix: "Quando chiedere aiuto",
    dictionaryPrompt: "Parole difficili?",
    dualGlossaryCta: "Apri il dizionario",
    romanesGlossaryCta: "Parole in romanì",
    listenGuideLabel: "Ascolta la guida",
    onlineDoctorLabel: "Medico online",
    ariaSentenceSection: "Testo della guida",
    ariaMobileActions: "Pulsanti della guida",
    tocHeading: "In questa guida",
    tocAria: "Indice della guida",
    tocOverview: "Panoramica",
    tocExplainer: "Guida visiva",
    tocMyth: "Vero o falso",
  },
  hr: {
    whyItMattersAudioPrefix: "Zašto je važno",
    stepsAudioPrefix: "Što možeš učiniti",
    warningSignsAudioPrefix: "Kada potražiti pomoć",
    dictionaryPrompt: "Teške riječi?",
    dualGlossaryCta: "Otvori rječnik",
    romanesGlossaryCta: "Riječi na romskom",
    listenGuideLabel: "Poslušaj vodič",
    onlineDoctorLabel: "Liječnik online",
    ariaSentenceSection: "Tekst vodiča",
    ariaMobileActions: "Gumbi za vodič",
    tocHeading: "U ovom vodiču",
    tocAria: "Sadržaj vodiča",
    tocOverview: "Uvod",
    tocExplainer: "Vizualni vodič",
    tocMyth: "Točno ili netočno",
  },
  rom: {
    whyItMattersAudioPrefix: "Sostar si baro",
    stepsAudioPrefix: "So shay te keres",
    warningSignsAudioPrefix: "Kana trebul zhutimos",
    dictionaryPrompt: "Phare lava?",
    dualGlossaryCta: "Phuter o lavustik",
    romanesGlossaryCta: "Lava pe romani chib",
    listenGuideLabel: "Ashun o sikavimos",
    onlineDoctorLabel: "Doktori online",
    ariaSentenceSection: "O teksto le sikavimasko",
    ariaMobileActions: "Butona vaš o sikavimos",
    tocHeading: "Ande kadava sikavimos",
    tocAria: "So si ando sikavimos",
    tocOverview: "Angluno lav",
    tocExplainer: "Vizualno sikavimos",
    tocMyth: "Chacho vay xoxamno",
  },
};

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

const iconsBySlug: Record<string, IconComponent> = {
  "heart-health": HeartIcon,
  diabetes: DropletIcon,
  "healthy-eating": AppleIcon,
  "physical-activity": ActivityIcon,
  "mental-wellbeing": BrainIcon,
  smoking: NoSmokingIcon,
  "preventive-screening": SearchIcon,
  "womens-health": ShieldIcon,
};

export interface TopicDetailPageContentProps {
  topic: HealthTopicContent;
  relatedTopics: HealthTopicContent[];
}

export function TopicDetailPageContent({
  topic,
  relatedTopics,
}: TopicDetailPageContentProps) {
  const { lang } = useLanguage();
  const [readingLevel, setReadingLevel] = useState<"simple" | "complete">(
    "simple",
  );
  const [isAudioPlayerOpen, setIsAudioPlayerOpen] = useState(false);
  const [activeSentenceIndex, setActiveSentenceIndex] = useState<number | null>(
    null,
  );
  const [openDrawer, setOpenDrawer] = useState<"dictionary" | "romanes" | null>(
    null,
  );

  const ui = TOPIC_PAGE_UI_STRINGS[lang] ?? TOPIC_PAGE_UI_STRINGS.ro;
  const tabCopy = DICTIONARY_TAB_LABELS[lang] ?? DICTIONARY_TAB_LABELS.ro;
  const drawerTabs = useMemo(
    () => ({
      dictionaryLabel: tabCopy.dictionary,
      romanesLabel: tabCopy.romanes,
      tablistAriaLabel: tabCopy.tablistAria,
      dictionaryCount: ROMANIAN_MEDICAL_GLOSSARY.length,
      romanesCount: ROMANES_GLOSSARY_TERMS.length,
      onSelect: (tab: "dictionary" | "romanes") => setOpenDrawer(tab),
    }),
    [tabCopy],
  );
  const timing = HEALTH_TOPICS_BASE.find((t) => t.slug === topic.slug);
  const readMinutes = timing?.readMinutes ?? 3;
  const audioMinutes = timing?.audioMinutes ?? 2;
  const effectiveAudioMinutes =
    readingLevel === "complete" ? audioMinutes + 1 : audioMinutes;
  const closeAudioPlayer = useCallback(() => {
    setIsAudioPlayerOpen(false);
    setActiveSentenceIndex(null);
  }, []);
  const followNarration = useCallback(
    (idx: number) => setActiveSentenceIndex(Math.max(0, idx - 1)),
    [],
  );
  const Icon = iconsBySlug[topic.slug] || HeartIcon;

  const myths = getHealthMyths(lang);
  const topicMyth: HealthMyth =
    myths.find((m) => m.relatedTopicSlug === topic.slug) || myths[0];

  const tocSections = useMemo(
    () => [
      { id: "section-overview", label: ui.tocOverview },
      { id: "section-why-it-matters", label: ui.whyItMattersAudioPrefix },
      { id: "section-explainer", label: ui.tocExplainer },
      { id: "section-steps", label: ui.stepsAudioPrefix },
      { id: "section-warning-signs", label: ui.warningSignsAudioPrefix },
      { id: "section-myth", label: ui.tocMyth },
    ],
    [ui],
  );

  // Construct full narration text
  const narrationScript = `${topic.title}. ${topic.intro} ${ui.whyItMattersAudioPrefix}: ${topic.keyFacts.join(
    ". ",
  )}. ${ui.stepsAudioPrefix}: ${topic.recommendations
    .map((r) => `${r.title}: ${r.description}`)
    .join(". ")}. ${ui.warningSignsAudioPrefix}: ${topic.warningSigns.join(". ")}.`;

  const chapterMarkers = useMemo(
    () => [
      { label: ui.whyItMattersAudioPrefix, prefix: ui.whyItMattersAudioPrefix },
      { label: ui.stepsAudioPrefix, prefix: ui.stepsAudioPrefix },
      { label: ui.warningSignsAudioPrefix, prefix: ui.warningSignsAudioPrefix },
    ],
    [ui],
  );

  return (
    <div className="bg-background">
      {/* A long read: a hairline under the header fills as the guide is read. */}
      <div className="read-progress" aria-hidden="true" />

      {/* Hero section */}
      <TopicHeroSection
        topic={topic}
        icon={Icon}
        readingLevel={readingLevel}
        readMinutes={readMinutes}
        audioMinutes={audioMinutes}
        onReadingLevelChange={(lvl) => setReadingLevel(lvl)}
        onListenClick={() => setIsAudioPlayerOpen(true)}
        onStopClick={closeAudioPlayer}
        isPlayingAudio={isAudioPlayerOpen}
        afterActions={
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
            <span>{ui.dictionaryPrompt}</span>
            <button
              type="button"
              onClick={() => setOpenDrawer("dictionary")}
              className="inline-flex min-h-11 items-center whitespace-nowrap rounded-sm px-1 font-medium text-sapphire underline decoration-sapphire/40 underline-offset-4 transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:text-sapphire-light hover:decoration-sapphire focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
            >
              {ui.dualGlossaryCta}
            </button>
            <span aria-hidden="true" className="text-muted-foreground">
              /
            </span>
            <button
              type="button"
              onClick={() => setOpenDrawer("romanes")}
              className="inline-flex min-h-11 items-center whitespace-nowrap rounded-sm px-1 font-medium text-sapphire underline decoration-sapphire/40 underline-offset-4 transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:text-sapphire-light hover:decoration-sapphire focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
            >
              {ui.romanesGlossaryCta}
            </button>
          </p>
        }
        lang={lang}
      />

      <div className="bg-background pb-12 pt-6 sm:pb-16 sm:pt-8 print:py-4">
        <Container>
          <div
            className={`${HEALTH_ARTICLE_CONTAINER_CLASS} space-y-10 sm:space-y-12 print:space-y-6`}
            data-health-article-column
          >
            <HealthArticleToc
              title={ui.tocHeading}
              ariaLabel={ui.tocAria}
              items={tocSections.map((item) => ({
                href: `#${item.id}`,
                label: item.label,
              }))}
              className="mt-0"
            />

            {/* Lead paragraph */}
            <section
              id="section-overview"
              aria-label={ui.ariaSentenceSection}
              className="scroll-mt-28 print:hidden"
            >
              <SynchronizedSentenceReader
                paragraphs={[topic.intro]}
                activeSentenceIndex={activeSentenceIndex}
                lang={lang}
              />
            </section>

            {/* Why it matters */}
            <div
              id="section-why-it-matters"
              data-print-guide-section
              className="scroll-mt-28"
            >
              <Reveal>
                <WhyItMattersInfographic
                  topicTitle={topic.title}
                  keyFacts={topic.keyFacts}
                  lang={lang}
                />
              </Reveal>
            </div>

            {/* Interactive health literacy visualizer or anatomical explainer */}
            <div id="section-explainer" className="scroll-mt-28 overflow-x-hidden">
              <Reveal variant="fade">
                <TopicExplainer slug={topic.slug} lang={lang} />
              </Reveal>
            </div>

            {/* Daily actionable steps checklist */}
            <div
              id="section-steps"
              data-print-guide-section
              className="scroll-mt-28"
            >
              <Reveal>
                <ActionableStepsChecklist
                  slug={topic.slug}
                  topicTitle={topic.title}
                  recommendations={topic.recommendations}
                  lang={lang}
                />
              </Reveal>
            </div>

            {/* Clinical warning signs and 112 guidance */}
            <div
              id="section-warning-signs"
              data-print-guide-section
              className="scroll-mt-28"
            >
              <Reveal>
                <WarningSignsEmergencyCard
                  topicTitle={topic.title}
                  warningSigns={topic.warningSigns}
                  lang={lang}
                />
              </Reveal>
            </div>

            {/* Topic myth challenge */}
            <div id="section-myth" className="scroll-mt-28 print:hidden">
              <Reveal>
                <TopicMythCard myth={topicMyth} lang={lang} />
              </Reveal>
            </div>

            {/* Related topics */}
            <RelatedTopicsCarousel topics={relatedTopics} lang={lang} />

            {/* Next steps: online doctor, pharmacy, and the "not a diagnosis" reminder */}
            <TopicNextSteps
              lang={lang}
              topicSlug={topic.slug}
              topicTitle={topic.title}
              className="mt-12 print:mt-6"
            />
          </div>
        </Container>
      </div>

      {/* Global floating audio player drawer */}
      <GlobalHealthAudioPlayer
        title={topic.title}
        textToNarrate={narrationScript}
        durationMinutes={effectiveAudioMinutes}
        isOpen={isAudioPlayerOpen}
        onClose={closeAudioPlayer}
        onActiveSentenceIndexChange={followNarration}
        lang={lang}
        chapterMarkers={chapterMarkers}
      />

      {/* Dual-register Romanian medical dictionary drawer */}
      <RomanianDualRegisterGlossary
        isOpen={openDrawer === "dictionary"}
        onClose={() => setOpenDrawer(null)}
        tabs={drawerTabs}
        priorityTopicSlug={topic.slug}
        lang={lang}
        initialCategory={
          topic.slug === "diabetes"
            ? "diabet"
            : topic.slug === "heart-health"
              ? "cardiologie"
              : "all"
        }
      />

      {/* Romanes glossary drawer */}
      <RomanesGlossaryDrawer
        isOpen={openDrawer === "romanes"}
        onClose={() => setOpenDrawer(null)}
        tabs={drawerTabs}
        lang={lang}
      />
    </div>
  );
}
