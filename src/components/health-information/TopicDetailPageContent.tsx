"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import type { ComponentType, SVGProps } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { useLanguage } from "@/lib/i18n/language-context";
import { withLangPrefix } from "@/lib/i18n/routing";
import {
  ActivityIcon,
  AlertCircleIcon,
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
  const voiceEnabled = isVoiceEnabled(lang);
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

  const [activeSectionId, setActiveSectionId] =
    useState<string>("section-overview");
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const articleColumnRef = useRef<HTMLDivElement | null>(null);

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
      { id: "section-overview", label: ui.tocOverview, urgent: false },
      {
        id: "section-why-it-matters",
        label: ui.whyItMattersAudioPrefix,
        urgent: false,
      },
      { id: "section-explainer", label: ui.tocExplainer, urgent: false },
      { id: "section-steps", label: ui.stepsAudioPrefix, urgent: false },
      {
        id: "section-warning-signs",
        label: ui.warningSignsAudioPrefix,
        urgent: true,
      },
      { id: "section-myth", label: ui.tocMyth, urgent: false },
    ],
    [ui],
  );

  // IntersectionObserver for active ToC section + rAF scroll progress
  useEffect(() => {
    const elements = tocSections
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => Boolean(el));

    const observer =
      typeof IntersectionObserver !== "undefined" && elements.length > 0
        ? new IntersectionObserver(
            (entries) => {
              const visible = entries
                .filter((entry) => entry.isIntersecting)
                .sort(
                  (a, b) =>
                    a.boundingClientRect.top - b.boundingClientRect.top,
                );
              if (visible[0]?.target.id) {
                setActiveSectionId(visible[0].target.id);
              }
            },
            {
              rootMargin: "-15% 0px -65% 0px",
              threshold: [0, 0.25],
            },
          )
        : null;

    elements.forEach((el) => observer?.observe(el));

    let rafId: number | null = null;
    const measureScroll = () => {
      rafId = null;
      const col = articleColumnRef.current;
      if (!col) return;
      const rect = col.getBoundingClientRect();
      const viewportH = window.innerHeight || 1;
      const totalScrollable = Math.max(1, rect.height - viewportH * 0.55);
      const scrolled = Math.max(0, -rect.top + viewportH * 0.2);
      const pct = Math.max(
        0,
        Math.min(100, Math.round((scrolled / totalScrollable) * 100)),
      );
      setScrollProgress(pct);
    };

    const onScrollOrResize = () => {
      if (rafId === null) {
        rafId = requestAnimationFrame(measureScroll);
      }
    };

    onScrollOrResize();
    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize);

    return () => {
      observer?.disconnect();
      if (rafId !== null) cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, [tocSections]);

  const jumpToSection = (sectionId: string) => {
    setActiveSectionId(sectionId);
    const target = document.getElementById(sectionId);
    if (!target) return;
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    target.scrollIntoView({
      behavior: reduce ? "auto" : "smooth",
      block: "start",
    });
  };

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
        isPlayingAudio={isAudioPlayerOpen}
        lang={lang}
      />

      {/* Mobile sticky progress & quick-jump bar */}
      <nav
        aria-label={ui.tocAria}
        className="sticky top-[var(--chrome-h,0px)] z-20 border-b border-border bg-card/95 backdrop-blur-md lg:hidden print:hidden"
      >
        <div className="relative h-0.5 w-full overflow-hidden bg-muted">
          <div
            aria-hidden="true"
            className="h-full w-full origin-left bg-sapphire transition-transform duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] motion-reduce:transition-none"
            style={{ transform: `scaleX(${scrollProgress / 100})` }}
          />
        </div>
        <Container className="flex items-center gap-2 py-1">
          <span className="shrink-0 rounded-md bg-muted px-2 py-1 text-xs font-semibold tabular-nums text-foreground">
            {scrollProgress}%
          </span>
          <div className="flex flex-1 items-center gap-1 overflow-x-auto no-scrollbar">
            {tocSections.map((item) => {
              const active = activeSectionId === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => jumpToSection(item.id)}
                  aria-current={active ? "location" : undefined}
                  className={`inline-flex min-h-[44px] shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md px-2.5 text-xs font-semibold transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire ${
                    active
                      ? "bg-sapphire-soft text-sapphire"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {item.urgent && (
                    <AlertCircleIcon
                      className="h-3.5 w-3.5 shrink-0 text-primary"
                      aria-hidden="true"
                    />
                  )}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </Container>
      </nav>

      <Container className="py-10 sm:py-14 pb-24 lg:pb-14 print:py-4">
        {/* Main lesson content */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_320px] print:block">
          <div
            ref={articleColumnRef}
            className="space-y-12 print:space-y-6"
          >
            {/* Lead paragraph + zero-CLS clinical context callout in Complete mode */}
            <section
              id="section-overview"
              aria-label={ui.ariaSentenceSection}
              className="scroll-mt-28 print:hidden"
            >
              <SynchronizedSentenceReader
                paragraphs={[topic.intro]}
                activeSentenceIndex={activeSentenceIndex}
                lang={lang}
                className="max-w-[65ch]"
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
                    <p className="text-xs font-semibold text-sapphire">
                      {ui.clinicalContextBadge}
                    </p>

                    {firstRecommendation && (
                      <p className="mt-2.5 text-sm leading-relaxed text-foreground">
                        <strong className="font-semibold text-foreground">
                          {ui.clinicalPriorityLabel}{" "}
                        </strong>
                        {firstRecommendation.title} —{" "}
                        {firstRecommendation.description}
                      </p>
                    )}

                    {firstWarningSign && (
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
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

            {/* Why it matters 3 pillars */}
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
            <div id="section-explainer" className="scroll-mt-28">
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

            {/* Clinical warning signs & 112 guidance */}
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
          </div>

          {/* Sticky desktop editorial rail: Table of Contents + Dictionaries */}
          <aside className="space-y-5 self-start print:hidden lg:sticky lg:top-[calc(var(--chrome-h,0px)+1.5rem)]">
            <nav
              aria-label={ui.tocAria}
              className="hidden rounded-xl border border-border bg-card p-5 lg:block"
            >
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-xs font-semibold text-muted-foreground">
                  {ui.tocHeading}
                </h2>
                <span className="text-xs font-semibold tabular-nums text-sapphire">
                  {scrollProgress}%
                </span>
              </div>

              {/* 2px sliding sapphire progress bar */}
              <div className="mt-2.5 h-0.5 w-full overflow-hidden rounded-xs bg-muted">
                <div
                  aria-hidden="true"
                  className="h-full w-full origin-left bg-sapphire transition-transform duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] motion-reduce:transition-none"
                  style={{ transform: `scaleX(${scrollProgress / 100})` }}
                />
              </div>

              <ul className="mt-3 space-y-0.5 border-l border-border">
                {tocSections.map((item) => {
                  const active = activeSectionId === item.id;
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => jumpToSection(item.id)}
                        aria-current={active ? "location" : undefined}
                        className={`-ml-px flex min-h-11 w-full items-center justify-between gap-2 border-l-2 pl-3 pr-2 py-1.5 text-left text-sm transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sapphire ${
                          active
                            ? "border-sapphire bg-sapphire-soft/60 font-semibold text-sapphire"
                            : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
                        }`}
                      >
                        <span className="truncate">{item.label}</span>
                        {item.urgent && (
                          <AlertCircleIcon
                            className="h-3.5 w-3.5 shrink-0 text-primary"
                            aria-hidden="true"
                          />
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* The two dictionaries share one surface, split by a hairline. */}
            <div className="divide-y divide-border rounded-xl border border-border bg-card">
              <div className="p-5">
                <h2 className="text-sm font-semibold text-foreground">
                  {ui.dualGlossaryTitle}
                </h2>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {dualGlossaryDescription}
                </p>
                <button
                  type="button"
                  onClick={() => setOpenDrawer("dictionary")}
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
                  onClick={() => setOpenDrawer("romanes")}
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
        durationMinutes={effectiveAudioMinutes}
        isOpen={isAudioPlayerOpen}
        onClose={closeAudioPlayer}
        onActiveSentenceIndexChange={followNarration}
        lang={lang}
        chapterMarkers={chapterMarkers}
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
            href={withLangPrefix(
              `/medic-online?context=topic_${topic.slug}`,
              lang,
            )}
            className="flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-lg bg-sapphire px-3 py-2 text-xs font-semibold text-white transition-colors duration-[var(--dur-fast)] hover:bg-sapphire-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire"
          >
            <span>{ui.onlineDoctorLabel}</span>
          </Link>
        </aside>
      )}

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
