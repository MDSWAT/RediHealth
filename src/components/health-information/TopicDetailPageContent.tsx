"use client";

import { useState, useCallback, useMemo } from "react";
import type { ComponentType, SVGProps } from "react";
import { Container } from "@/components/ui/Container";
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
  dualGlossaryTitle: string;
  dualGlossaryDescription: string;
  dualGlossaryCta: string;
  romanesGlossaryTitle: string;
  romanesGlossaryDescription: string;
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
  clinicalContextBadge: string;
  clinicalPriorityLabel: string;
  clinicalAlertLabel: string;
}

const TOPIC_PAGE_UI_STRINGS: Record<Lang, TopicPageUiStrings> = {
  ru: {
    tocHeading: "В этом руководстве",
    tocAria: "Содержание руководства",
    tocOverview: "Обзор",
    tocExplainer: "Наглядное объяснение",
    tocMyth: "Правда или миф",
    clinicalContextBadge: "Подробная медицинская информация",
    clinicalPriorityLabel: "Рекомендуемая первая привычка:",
    clinicalAlertLabel: "Важный признак для наблюдения:",
    whyItMattersAudioPrefix: "Почему это важно",
    stepsAudioPrefix: "Что вы можете сделать",
    warningSignsAudioPrefix: "Когда получить помощь",
    dualGlossaryTitle: "Медицинский словарь",
    dualGlossaryDescription:
      "22 термина из рецептов и направлений простыми словами.",
    dualGlossaryCta: "Открыть словарь",
    romanesGlossaryTitle: "Медицинские слова на цыганском языке",
    romanesGlossaryDescription:
      "Слова в этом руководстве также на цыганском языке.",
    romanesGlossaryCta: "Смотрите слова",
    listenGuideLabel: "Слушайте руководство",
    onlineDoctorLabel: "Онлайн врач",
    ariaSentenceSection: "Текст руководства",
    ariaMobileActions: "Кнопки руководства",
  },
  ro: {
    whyItMattersAudioPrefix: "De ce contează",
    stepsAudioPrefix: "Ce poți face",
    warningSignsAudioPrefix: "Când ai nevoie de ajutor",
    dualGlossaryTitle: "Dicționar medical",
    dualGlossaryDescription:
      "22 de termeni de pe rețete și bilete de trimitere, explicați pe scurt.",
    dualGlossaryCta: "Deschide dicționarul",
    romanesGlossaryTitle: "Cuvinte medicale în romani",
    romanesGlossaryDescription:
      "Cuvintele din acest ghid, spuse și în limba romani.",
    romanesGlossaryCta: "Vezi cuvintele",
    listenGuideLabel: "Ascultă ghidul",
    onlineDoctorLabel: "Medic online",
    ariaSentenceSection: "Textul ghidului",
    ariaMobileActions: "Butoane pentru ghid",
    tocHeading: "În acest ghid",
    tocAria: "Cuprinsul ghidului",
    tocOverview: "Introducere",
    tocExplainer: "Ghid vizual",
    tocMyth: "Adevărat sau fals",
    clinicalContextBadge: "Sinteză clinică extinsă",
    clinicalPriorityLabel: "Primul pas recomandat:",
    clinicalAlertLabel: "Semn de urmărit atent:",
  },
  en: {
    whyItMattersAudioPrefix: "Why it matters",
    stepsAudioPrefix: "What you can do",
    warningSignsAudioPrefix: "When to get help",
    dualGlossaryTitle: "Medical dictionary",
    dualGlossaryDescription:
      "22 terms from prescriptions and referrals, explained clearly.",
    dualGlossaryCta: "Open the dictionary",
    romanesGlossaryTitle: "Medical words in Romani",
    romanesGlossaryDescription:
      "The words in this guide, also in Romani.",
    romanesGlossaryCta: "See the words",
    listenGuideLabel: "Listen to the guide",
    onlineDoctorLabel: "Online doctor",
    ariaSentenceSection: "Guide text",
    ariaMobileActions: "Guide buttons",
    tocHeading: "In this guide",
    tocAria: "Guide contents",
    tocOverview: "Overview",
    tocExplainer: "Visual guide",
    tocMyth: "True or false",
    clinicalContextBadge: "Extended clinical context",
    clinicalPriorityLabel: "Recommended first habit:",
    clinicalAlertLabel: "Key sign to watch closely:",
  },
  sq: {
    whyItMattersAudioPrefix: "Pse ka rëndësi",
    stepsAudioPrefix: "Çfarë mund të bësh",
    warningSignsAudioPrefix: "Kur të duhet ndihmë",
    dualGlossaryTitle: "Fjalor mjekësor",
    dualGlossaryDescription:
      "22 terma nga recetat dhe fletët e referimit, të shpjeguar qartë.",
    dualGlossaryCta: "Hap fjalorin",
    romanesGlossaryTitle: "Fjalë mjekësore në gjuhën rome",
    romanesGlossaryDescription:
      "Fjalët e këtij udhëzuesi, edhe në gjuhën rome.",
    romanesGlossaryCta: "Shiko fjalët",
    listenGuideLabel: "Dëgjo udhëzuesin",
    onlineDoctorLabel: "Mjeku online",
    ariaSentenceSection: "Teksti i udhëzuesit",
    ariaMobileActions: "Butonat e udhëzuesit",
    tocHeading: "Në këtë udhëzues",
    tocAria: "Përmbajtja e udhëzuesit",
    tocOverview: "Hyrje",
    tocExplainer: "Udhëzues pamor",
    tocMyth: "E vërtetë apo e gabuar",
    clinicalContextBadge: "Përmbledhje klinike e zgjeruar",
    clinicalPriorityLabel: "Hapi i parë i këshilluar:",
    clinicalAlertLabel: "Shenja që duhet ndjekur me kujdes:",
  },
  it: {
    whyItMattersAudioPrefix: "Perché è importante",
    stepsAudioPrefix: "Cosa puoi fare",
    warningSignsAudioPrefix: "Quando chiedere aiuto",
    dualGlossaryTitle: "Dizionario medico",
    dualGlossaryDescription:
      "22 termini di ricette e impegnative, spiegati con chiarezza.",
    dualGlossaryCta: "Apri il dizionario",
    romanesGlossaryTitle: "Parole mediche in romanì",
    romanesGlossaryDescription:
      "Le parole di questa guida, anche in romanì.",
    romanesGlossaryCta: "Vedi le parole",
    listenGuideLabel: "Ascolta la guida",
    onlineDoctorLabel: "Medico online",
    ariaSentenceSection: "Testo della guida",
    ariaMobileActions: "Pulsanti della guida",
    tocHeading: "In questa guida",
    tocAria: "Indice della guida",
    tocOverview: "Panoramica",
    tocExplainer: "Guida visiva",
    tocMyth: "Vero o falso",
    clinicalContextBadge: "Contesto clinico esteso",
    clinicalPriorityLabel: "Primo passo consigliato:",
    clinicalAlertLabel: "Segnale da osservare con attenzione:",
  },
  hr: {
    whyItMattersAudioPrefix: "Zašto je važno",
    stepsAudioPrefix: "Što možeš učiniti",
    warningSignsAudioPrefix: "Kada potražiti pomoć",
    dualGlossaryTitle: "Medicinski rječnik",
    dualGlossaryDescription:
      "22 pojma s recepata i uputnica, jasno objašnjena.",
    dualGlossaryCta: "Otvori rječnik",
    romanesGlossaryTitle: "Medicinske riječi na romskom",
    romanesGlossaryDescription:
      "Riječi iz ovog vodiča, objašnjene i na romskom jeziku.",
    romanesGlossaryCta: "Pogledaj riječi",
    listenGuideLabel: "Poslušaj vodič",
    onlineDoctorLabel: "Liječnik online",
    ariaSentenceSection: "Tekst vodiča",
    ariaMobileActions: "Gumbi za vodič",
    tocHeading: "U ovom vodiču",
    tocAria: "Sadržaj vodiča",
    tocOverview: "Uvod",
    tocExplainer: "Vizualni vodič",
    tocMyth: "Točno ili netočno",
    clinicalContextBadge: "Prošireni klinički kontekst",
    clinicalPriorityLabel: "Preporučeni prvi korak:",
    clinicalAlertLabel: "Znak na koji treba paziti:",
  },
  rom: {
    whyItMattersAudioPrefix: "Sostar si baro",
    stepsAudioPrefix: "So shay te keres",
    warningSignsAudioPrefix: "Kana trebul zhutimos",
    dualGlossaryTitle: "Doktorengo lavustik",
    dualGlossaryDescription:
      "22 lava katar le retsete thaj le lila, ashkarde mishto.",
    dualGlossaryCta: "Phuter o lavustik",
    romanesGlossaryTitle: "Doktorenge lava pe romani chib",
    romanesGlossaryDescription:
      "Le lava katar kadava sikavimos, phende vi pe romani chib.",
    romanesGlossaryCta: "Dikh le lava",
    listenGuideLabel: "Ashun o sikavimos",
    onlineDoctorLabel: "Doktori online",
    ariaSentenceSection: "O teksto le sikavimasko",
    ariaMobileActions: "Butona vaš o sikavimos",
    tocHeading: "Ande kadava sikavimos",
    tocAria: "So si ando sikavimos",
    tocOverview: "Angluno lav",
    tocExplainer: "Vizualno sikavimos",
    tocMyth: "Chacho vay xoxamno",
    clinicalContextBadge: "Baro sastipnasko sikavimos",
    clinicalPriorityLabel: "Angluno lačho phirimos:",
    clinicalAlertLabel: "Semno savo trebul dikhlo:",
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
  const dualGlossaryDescription = ui.dualGlossaryDescription.replace(
    /\b22\b/g,
    String(ROMANIAN_MEDICAL_GLOSSARY.length),
  );
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
  const closeAudioPlayer = useCallback(() => setIsAudioPlayerOpen(false), []);
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

  const firstRecommendation = topic.recommendations[0];
  const firstWarningSign = topic.warningSigns[0];
  const isComplete = readingLevel === "complete";

  return (
    <div className="bg-background">
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

            {/* Lead paragraph and zero-CLS clinical context callout in Complete mode */}
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

              <div
                aria-hidden={!isComplete}
                className={`max-w-[65ch] grid transition-[grid-template-rows,opacity,margin] duration-[var(--dur-base)] ease-[var(--ease-out-calm)] motion-reduce:transition-none ${
                  isComplete
                    ? "mt-5 grid-rows-[1fr] opacity-100"
                    : "mt-0 grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <div className="rounded-r-lg border-l-2 border-sapphire bg-surface-subtle/70 p-4 sm:p-5">
                    <p className="text-sm font-semibold text-sapphire">
                      {ui.clinicalContextBadge}
                    </p>

                    {firstRecommendation && (
                      <p className="mt-2.5 text-base leading-relaxed text-foreground">
                        <strong className="font-semibold text-foreground">
                          {ui.clinicalPriorityLabel}{" "}
                        </strong>
                        {firstRecommendation.title} —{" "}
                        {firstRecommendation.description}
                      </p>
                    )}

                    {firstWarningSign && (
                      <p className="mt-2 text-base leading-relaxed text-foreground">
                        <strong className="font-semibold text-foreground">
                          {ui.clinicalAlertLabel}{" "}
                        </strong>
                        {firstWarningSign}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* Why it matters */}
            <div
              id="section-why-it-matters"
              data-print-guide-section
              className="scroll-mt-28"
            >
              <WhyItMattersInfographic
                topicTitle={topic.title}
                keyFacts={topic.keyFacts}
                lang={lang}
              />
            </div>

            {/* Interactive health literacy visualizer or anatomical explainer */}
            <div id="section-explainer" className="scroll-mt-28 overflow-x-hidden">
              <TopicExplainer slug={topic.slug} lang={lang} />
            </div>

            {/* Daily actionable steps checklist */}
            <div
              id="section-steps"
              data-print-guide-section
              className="scroll-mt-28"
            >
              <ActionableStepsChecklist
                slug={topic.slug}
                topicTitle={topic.title}
                recommendations={topic.recommendations}
                lang={lang}
              />
            </div>

            {/* Clinical warning signs and 112 guidance */}
            <div
              id="section-warning-signs"
              data-print-guide-section
              className="scroll-mt-28"
            >
              <WarningSignsEmergencyCard
                topicTitle={topic.title}
                warningSigns={topic.warningSigns}
                lang={lang}
              />
            </div>

            {/* Topic myth challenge */}
            <div id="section-myth" className="scroll-mt-28 print:hidden">
              <TopicMythCard myth={topicMyth} lang={lang} />
            </div>

            {/* Calm hairline glossary helpers */}
            <section
              aria-label={ui.dualGlossaryTitle}
              className="divide-y divide-border rounded-xl border border-border bg-card print:hidden"
            >
              <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-7">
                <div className="max-w-xl">
                  <h2 className="text-lg font-semibold leading-snug text-foreground">
                    {ui.dualGlossaryTitle}
                  </h2>
                  <p className="mt-1.5 text-base leading-relaxed text-muted-foreground">
                    {dualGlossaryDescription}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setOpenDrawer("dictionary")}
                  className="press-solid inline-flex min-h-12 shrink-0 items-center justify-center whitespace-nowrap rounded-lg bg-sapphire px-5 py-2.5 text-base font-semibold text-white transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] motion-reduce:transition-none hover:bg-sapphire-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  {ui.dualGlossaryCta}
                </button>
              </div>

              <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-7">
                <div className="max-w-xl">
                  <h2 className="text-lg font-semibold leading-snug text-foreground">
                    {ui.romanesGlossaryTitle}
                  </h2>
                  <p className="mt-1.5 text-base leading-relaxed text-muted-foreground">
                    {ui.romanesGlossaryDescription}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setOpenDrawer("romanes")}
                  className="press-row inline-flex min-h-12 shrink-0 items-center justify-center whitespace-nowrap rounded-lg border border-border-control bg-card px-5 py-2.5 text-base font-semibold text-foreground transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] motion-reduce:transition-none hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {ui.romanesGlossaryCta}
                </button>
              </div>
            </section>

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
