"use client";

import { useState, useCallback } from "react";
import type { ComponentType, SVGProps } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { useLanguage } from "@/lib/i18n/language-context";
import { withLangPrefix } from "@/lib/i18n/routing";
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
import { HEALTH_TOPICS_BASE, type HealthTopicContent } from "@/lib/i18n/health-information-topics";
import { getHealthMyths, type HealthMyth } from "@/lib/i18n/health-myths";
import { TopicHeroSection } from "./TopicHeroSection";
import { WhyItMattersInfographic } from "./WhyItMattersInfographic";
import { ActionableStepsChecklist } from "./ActionableStepsChecklist";
import { WarningSignsEmergencyCard } from "./WarningSignsEmergencyCard";
import { TopicMythCard } from "./TopicMythCard";
import { RelatedTopicsCarousel } from "./RelatedTopicsCarousel";
import { TopicNextSteps } from "./TopicNextSteps";
import { TopicExplainer } from "./explainers/TopicExplainer";
import { GlobalHealthAudioPlayer } from "./GlobalHealthAudioPlayer";
import { isVoiceEnabled } from "@/lib/audio/voice-availability";
import { SynchronizedSentenceReader } from "./SynchronizedSentenceReader";
import { RomanesGlossaryDrawer } from "./RomanesGlossaryDrawer";
import { RomanianDualRegisterGlossary } from "./RomanianDualRegisterGlossary";
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
}

const TOPIC_PAGE_UI_STRINGS: Record<Lang, TopicPageUiStrings> = {
  ro: {
    whyItMattersAudioPrefix: "De ce contează",
    stepsAudioPrefix: "Ce poți face",
    warningSignsAudioPrefix: "Când ai nevoie de ajutor",
    dualGlossaryTitle: "Dicționar medical",
    dualGlossaryDescription:
      "22 de cuvinte de pe rețete și bilete de trimitere, spuse simplu.",
    dualGlossaryCta: "Deschide dicționarul",
    romanesGlossaryTitle: "Cuvinte medicale în romani",
    romanesGlossaryDescription:
      "Cuvintele din acest ghid, spuse și în limba romani.",
    romanesGlossaryCta: "Vezi cuvintele",
    listenGuideLabel: "Ascultă ghidul",
    onlineDoctorLabel: "Medic online",
    ariaSentenceSection: "Textul ghidului",
    ariaMobileActions: "Butoane pentru ghid",
  },
  en: {
    whyItMattersAudioPrefix: "Why it matters",
    stepsAudioPrefix: "What you can do",
    warningSignsAudioPrefix: "When to get help",
    dualGlossaryTitle: "Medical dictionary",
    dualGlossaryDescription:
      "22 words from prescriptions and referrals, in plain words.",
    dualGlossaryCta: "Open the dictionary",
    romanesGlossaryTitle: "Medical words in Romani",
    romanesGlossaryDescription:
      "The words in this guide, also in Romani.",
    romanesGlossaryCta: "See the words",
    listenGuideLabel: "Listen to the guide",
    onlineDoctorLabel: "Online doctor",
    ariaSentenceSection: "Guide text",
    ariaMobileActions: "Guide buttons",
  },
  sq: {
    whyItMattersAudioPrefix: "Pse ka rëndësi",
    stepsAudioPrefix: "Çfarë mund të bësh",
    warningSignsAudioPrefix: "Kur të duhet ndihmë",
    dualGlossaryTitle: "Fjalor mjekësor",
    dualGlossaryDescription:
      "22 fjalë nga recetat dhe fletët e referimit, të thëna thjesht.",
    dualGlossaryCta: "Hap fjalorin",
    romanesGlossaryTitle: "Fjalë mjekësore në gjuhën rome",
    romanesGlossaryDescription:
      "Fjalët e këtij udhëzuesi, edhe në gjuhën rome.",
    romanesGlossaryCta: "Shiko fjalët",
    listenGuideLabel: "Dëgjo udhëzuesin",
    onlineDoctorLabel: "Mjeku online",
    ariaSentenceSection: "Teksti i udhëzuesit",
    ariaMobileActions: "Butonat e udhëzuesit",
  },
  it: {
    whyItMattersAudioPrefix: "Perché è importante",
    stepsAudioPrefix: "Cosa puoi fare",
    warningSignsAudioPrefix: "Quando chiedere aiuto",
    dualGlossaryTitle: "Dizionario medico",
    dualGlossaryDescription:
      "22 parole di ricette e impegnative, dette in modo semplice.",
    dualGlossaryCta: "Apri il dizionario",
    romanesGlossaryTitle: "Parole mediche in romanì",
    romanesGlossaryDescription:
      "Le parole di questa guida, anche in romanì.",
    romanesGlossaryCta: "Vedi le parole",
    listenGuideLabel: "Ascolta la guida",
    onlineDoctorLabel: "Medico online",
    ariaSentenceSection: "Testo della guida",
    ariaMobileActions: "Pulsanti della guida",
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
  const voiceEnabled = isVoiceEnabled(lang);
  const [readingLevel, setReadingLevel] = useState<"simple" | "complete">("simple");
  const [isAudioPlayerOpen, setIsAudioPlayerOpen] = useState(false);
  const [activeSentenceIndex, setActiveSentenceIndex] = useState<number | null>(null);
  const [isGlossaryOpen, setIsGlossaryOpen] = useState(false);
  const [isDualGlossaryOpen, setIsDualGlossaryOpen] = useState(false);

  const ui = TOPIC_PAGE_UI_STRINGS[lang] ?? TOPIC_PAGE_UI_STRINGS.ro;
  const timing = HEALTH_TOPICS_BASE.find((t) => t.slug === topic.slug);
  const readMinutes = timing?.readMinutes ?? 3;
  const audioMinutes = timing?.audioMinutes ?? 2;
  const closeAudioPlayer = useCallback(() => setIsAudioPlayerOpen(false), []);
  const followNarration = useCallback((idx: number) => setActiveSentenceIndex(Math.max(0, idx - 1)), []);
  const Icon = iconsBySlug[topic.slug] || HeartIcon;

  // Find relevant myth or fallback to first
  const myths = getHealthMyths(lang);
  const topicMyth: HealthMyth =
    myths.find((m) => m.relatedTopicSlug === topic.slug) ||
    myths[0];

  // Construct full narration text
  const narrationScript = `${topic.title}. ${topic.intro} ${ui.whyItMattersAudioPrefix}: ${topic.keyFacts.join(
    ". "
  )}. ${ui.stepsAudioPrefix}: ${topic.recommendations
    .map((r) => `${r.title}: ${r.description}`)
    .join(". ")}. ${ui.warningSignsAudioPrefix}: ${topic.warningSigns.join(". ")}.`;

  // Plain language: the intro only (the key facts follow right below).
  // Complete guide: the intro and the key facts read as one text.
  const paragraphsToDisplay =
    readingLevel === "simple" ? [topic.intro] : [topic.intro, topic.keyFacts.join(" ")];

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
        isPlayingAudio={isAudioPlayerOpen}
        lang={lang}
      />

      <Container className="py-10 sm:py-14 pb-24 lg:pb-14 print:py-4">
        {/* Main lesson content */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_320px] print:block">
          <div className="space-y-12 print:space-y-6">
            {/* Lead paragraph: plain text, no card. It follows the narration when the guide is read aloud. */}
            <section aria-label={ui.ariaSentenceSection} className="print:hidden">
              <SynchronizedSentenceReader
                paragraphs={paragraphsToDisplay}
                activeSentenceIndex={activeSentenceIndex}
                lang={lang}
                className="max-w-[65ch]"
              />
            </section>

            {/* Why it matters 3 pillars */}
            <div data-print-guide-section>
              <WhyItMattersInfographic
                topicTitle={topic.title}
                keyFacts={topic.keyFacts}
                lang={lang}
              />
            </div>

            {/* Interactive health literacy visualizer or anatomical explainer */}
            <TopicExplainer slug={topic.slug} lang={lang} />

            {/* Daily actionable steps checklist */}
            <div data-print-guide-section>
              <ActionableStepsChecklist
                slug={topic.slug}
                topicTitle={topic.title}
                recommendations={topic.recommendations}
                lang={lang}
              />
            </div>

            {/* Clinical warning signs & 112 guidance */}
            <div data-print-guide-section>
              <WarningSignsEmergencyCard
                topicTitle={topic.title}
                warningSigns={topic.warningSigns}
                lang={lang}
              />
            </div>

            {/* Topic myth challenge */}
            <div className="print:hidden">
              <TopicMythCard myth={topicMyth} lang={lang} />
            </div>
          </div>

          {/*
            Sidebar: the two dictionaries only (each topic's explainer lives once, in the main
            column). On desktop it stays in view below the site header while the guide scrolls.
          */}
          <aside className="self-start print:hidden lg:sticky lg:top-[calc(var(--chrome-h,0px)+1.5rem)]">
            {/* The two dictionaries share one surface, split by a hairline. */}
            <div className="divide-y divide-border rounded-xl border border-border bg-card">
              <div className="p-5">
                <h2 className="text-sm font-semibold text-foreground">
                  {ui.dualGlossaryTitle}
                </h2>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {ui.dualGlossaryDescription}
                </p>
                <button
                  type="button"
                  onClick={() => setIsDualGlossaryOpen(true)}
                  className="mt-3.5 inline-flex min-h-[44px] w-full items-center justify-center rounded-lg bg-sapphire px-3 py-2 text-sm font-semibold text-white transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-sapphire-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire focus-visible:ring-offset-2"
                >
                  {ui.dualGlossaryCta}
                </button>
              </div>

              <div className="p-5">
                <h2 className="text-sm font-semibold text-foreground">
                  {ui.romanesGlossaryTitle}
                </h2>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {ui.romanesGlossaryDescription}
                </p>
                <button
                  type="button"
                  onClick={() => setIsGlossaryOpen(true)}
                  className="mt-3.5 inline-flex min-h-[44px] w-full items-center justify-center rounded-lg border border-border bg-card px-3 py-2 text-sm font-semibold text-foreground transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire"
                >
                  {ui.romanesGlossaryCta}
                </button>
              </div>
            </div>
          </aside>
        </div>

        {/* Related topics carousel */}
        <div className="print:hidden">
          <RelatedTopicsCarousel topics={relatedTopics} lang={lang} />
        </div>

        {/* Next steps: online doctor, pharmacy, and the "not a diagnosis" reminder, in one surface */}
        <TopicNextSteps
          lang={lang}
          topicSlug={topic.slug}
          topicTitle={topic.title}
          className="mt-12 print:mt-6"
        />
      </Container>

      {/* Global floating audio player drawer */}
      <GlobalHealthAudioPlayer
        title={topic.title}
        textToNarrate={narrationScript}
        durationMinutes={audioMinutes}
        isOpen={isAudioPlayerOpen}
        onClose={closeAudioPlayer}
        onActiveSentenceIndexChange={followNarration}
        lang={lang}
      />

      {/* Mobile action bar */}
      {!isAudioPlayerOpen && (
        <aside
          role="complementary"
          aria-label={ui.ariaMobileActions}
          data-bottom-bar
          className="fixed bottom-0 inset-x-0 z-30 flex h-14 items-center justify-between gap-3 border-t border-border bg-card px-4 py-2 lg:hidden print:hidden"
        >
          {/* 1-tap audio launcher */}
          {voiceEnabled && (
            <button
              type="button"
              onClick={() => setIsAudioPlayerOpen(true)}
              className="flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-lg border border-sapphire-border bg-sapphire-soft px-3 py-2 text-xs font-semibold text-sapphire transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-sapphire-soft/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire"
            >
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
              </svg>
              <span>{ui.listenGuideLabel}</span>
            </button>
          )}

          {/* Doctor connection */}
          <Link
            href={withLangPrefix(`/medic-online?context=topic_${topic.slug}`, lang)}
            className="flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-lg bg-sapphire px-3 py-2 text-xs font-semibold text-white transition-colors duration-[var(--dur-fast)] hover:bg-sapphire-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire"
          >
            <span>{ui.onlineDoctorLabel}</span>
          </Link>
        </aside>
      )}

      {/* Dual-register 22-term Romanian medical dictionary drawer */}
      <RomanianDualRegisterGlossary
        isOpen={isDualGlossaryOpen}
        onClose={() => setIsDualGlossaryOpen(false)}
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
        isOpen={isGlossaryOpen}
        onClose={() => setIsGlossaryOpen(false)}
        lang={lang}
      />
    </div>
  );
}
