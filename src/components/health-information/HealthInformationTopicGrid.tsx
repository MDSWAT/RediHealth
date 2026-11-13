"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRightIcon,
  BookIcon,
  CheckCircleIcon,
  SearchIcon,
  StethoscopeIcon,
} from "@/components/ui/icons";
import { useLanguage } from "@/lib/i18n/language-context";
import { withLangPrefix } from "@/lib/i18n/routing";
import type { Lang } from "@/lib/i18n/translations";
import {
  type TopicItem,
  getHealthTopicsList,
  getHealthInformationDictionary,
  HEALTH_TOPICS_LIST,
  getHealthTopicGridDictionary,
} from "@/lib/i18n/health-information-topics";
import { TopicMetaBadge } from "./TopicMetaBadge";
import { ReadingLevelSwitcher } from "./ReadingLevelSwitcher";
import { openSmartSearch } from "@/components/search/smart-search-events";
import { getSmartSearchCopy } from "@/lib/i18n/smart-search-copy";

export type { TopicItem };
export { getHealthTopicsList, HEALTH_TOPICS_LIST };

export interface HealthInformationTopicGridProps {
  initialCategory?: string;
  className?: string;
  /** Library tools: reading level, dictionary and the link to the 3D symptom check. */
  readingLevel?: "simple" | "complete";
  onReadingLevelChange?: (level: "simple" | "complete") => void;
  onOpenDictionary?: () => void;
}

/** Cards shown before "Show all topics", so the library fits one screen. */
const FIRST_VIEW_LIMIT = 9;

const LIBRARY_COPY: Record<
  Lang,
  {
    howToRead: string;
    dictionary: string;
    checkSymptom: string;
    showAll: string;
    title: string;
    keyFactLabel: string;
    firstStepLabel: string;
  }
> = {
ru: {
"firstStepLabel": "Первый практический шаг",


"keyFactLabel": "Главный медицинский факт",

 howToRead: "Как читать", dictionary: "Словарь", checkSymptom: "Проверьте симптом", showAll: "Показать все руководства", title: "Путеводители по здоровью" },

  ro: {
    howToRead: "Cum citești",
    dictionary: "Dicționar medical",
    checkSymptom: "Verifică un simptom",
    showAll: "Arată toate ghidurile",
    title: "Ghiduri de sănătate",
    keyFactLabel: "Idee clinică cheie",
    firstStepLabel: "Primul pas practic",
  },
  en: {
    howToRead: "How to read",
    dictionary: "Medical dictionary",
    checkSymptom: "Check a symptom",
    showAll: "Show all guides",
    title: "Health guides",
    keyFactLabel: "Key clinical fact",
    firstStepLabel: "Practical first step",
  },
  sq: {
    howToRead: "Si të lexosh",
    dictionary: "Fjalori mjekësor",
    checkSymptom: "Kontrollo një simptomë",
    showAll: "Shfaq të gjithë udhëzuesit",
    title: "Udhëzues shëndetësorë",
    keyFactLabel: "Fakt klinik kryesor",
    firstStepLabel: "Hapi i parë praktik",
  },
  it: {
    howToRead: "Come leggere",
    dictionary: "Dizionario medico",
    checkSymptom: "Controlla un sintomo",
    showAll: "Mostra tutte le guide",
    title: "Guide alla salute",
    keyFactLabel: "Punto clinico chiave",
    firstStepLabel: "Primo passo pratico",
  },
  hr: {
    howToRead: "Kako čitati",
    dictionary: "Medicinski rječnik",
    checkSymptom: "Provjeri simptom",
    showAll: "Prikaži sve vodiče",
    title: "Zdravstveni vodiči",
    keyFactLabel: "Ključna klinička činjenica",
    firstStepLabel: "Prvi praktični korak",
  },
  rom: {
    howToRead: "Sar te drabares",
    dictionary: "Doktorengo lavustik",
    checkSymptom: "Dikh jekh simptomo",
    showAll: "Sikav sa le sikavimata",
    title: "Sikavimata vaš o sastipen",
    keyFactLabel: "Baro sastipnasko fakto",
    firstStepLabel: "Angluno praktikano paso",
  },
};

export function HealthInformationTopicGrid({
  initialCategory = "toate",
  className = "",
  readingLevel = "simple",
  onReadingLevelChange,
  onOpenDictionary,
}: HealthInformationTopicGridProps) {
  const { lang, t } = useLanguage();
  const gridCopy =
    t?.healthInfoPage?.topicGrid ?? getHealthTopicGridDictionary(lang);
  const topics = useMemo(() => getHealthTopicsList(lang), [lang]);
  const fullTopicsBySlug = useMemo(() => {
    const dict = getHealthInformationDictionary(lang);
    const map: Record<string, string> = {};
    for (const item of dict.topics) {
      if (item.keyFacts?.[0]) {
        map[item.slug] = item.keyFacts[0];
      }
    }
    return map;
  }, [lang]);

  const [selectedCategory, setSelectedCategory] =
    useState<string>(initialCategory);
  const searchCopy = getSmartSearchCopy(lang);

  const filterChips = useMemo(
    () => [
      { slug: "toate", label: gridCopy.categories.toate },
      { slug: "inima", label: gridCopy.categories.inima },
      { slug: "diabet", label: gridCopy.categories.diabet },
      { slug: "nutritie", label: gridCopy.categories.nutritie },
      { slug: "miscare", label: gridCopy.categories.miscare },
      { slug: "minte", label: gridCopy.categories.minte },
      { slug: "fumat", label: gridCopy.categories.fumat },
      { slug: "screening", label: gridCopy.categories.screening },
      { slug: "femei", label: gridCopy.categories.femei },
    ],
    [gridCopy],
  );

  const categoryLabelsBySlug = useMemo(() => {
    const map: Record<string, string> = {};
    for (const chip of filterChips) {
      map[chip.slug] = chip.label;
    }
    return map;
  }, [filterChips]);

  const filteredTopics = topics.filter(
    (topic) =>
      selectedCategory === "toate" ||
      topic.categorySlug === selectedCategory ||
      topic.slug === selectedCategory,
  );

  const resultCountText =
    filteredTopics.length === 1
      ? gridCopy.countSingular
      : gridCopy.countPluralTemplate.replace(
          "{count}",
          String(filteredTopics.length),
        );

  const lib = LIBRARY_COPY[lang] ?? LIBRARY_COPY.ro;
  const checkSymptomLabel = t?.healthInfoPage?.tabs?.triage ?? lib.checkSymptom;
  const [showAll, setShowAll] = useState(false);
  const visibleTopics = showAll
    ? filteredTopics
    : filteredTopics.slice(0, FIRST_VIEW_LIMIT);

  const isSingleSpotlight = visibleTopics.length === 1;
  const isPairedView = visibleTopics.length === 2;
  const promoteLeadCard =
    selectedCategory === "toate" &&
    visibleTopics.length >= 3;

  const cardData = (topic: TopicItem) => ({
    topic,
    href: withLangPrefix(`/health-information/${topic.slug}`, lang),
    categoryLabel: categoryLabelsBySlug[topic.categorySlug] ?? "",
    keyFact: fullTopicsBySlug[topic.slug] ?? topic.keyFact ?? "",
    readMinutes: readingLevel === "complete" ? topic.readMinutes + 2 : topic.readMinutes,
    audioMinutes: readingLevel === "complete" ? topic.audioMinutes + 1 : topic.audioMinutes,
    isComplete: readingLevel === "complete",
    keyFactLabel: lib.keyFactLabel,
    firstStepLabel: lib.firstStepLabel,
    actionLabel: gridCopy.cardActionLabel,
    lang,
  });

  return (
    <section id="health-guides" aria-labelledby="health-library-title" className={`scroll-mt-24 ${className}`}>
      {/* The page H1 already names the library; this heading is for screen readers. */}
      <h2 id="health-library-title" className="sr-only">
        {lib.title}
      </h2>

      {/* Search first: most people arrive with a word in mind. The symptom check is the side door. */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          id="health-library-search"
          type="button"
          onClick={() => openSmartSearch()}
          aria-label={gridCopy.searchAriaLabel}
          className="press-row group flex min-h-12 w-full flex-1 items-center justify-between gap-3 rounded-xl border border-border-control bg-card px-4 py-2.5 text-left text-base text-muted-foreground transition-[border-color,background-color,box-shadow] duration-(--dur-fast) ease-(--ease-out-calm) motion-reduce:transition-none hover:border-sapphire/60 hover:bg-sapphire-soft/20 focus-visible:border-sapphire focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span className="flex min-w-0 items-center gap-3">
            <SearchIcon
              className="h-5 w-5 shrink-0 text-muted-foreground transition-colors group-hover:text-sapphire motion-reduce:transition-none"
              aria-hidden="true"
            />
            <span className="truncate">{searchCopy.triggerPlaceholder}</span>
          </span>
          <span className="hidden shrink-0 whitespace-nowrap rounded-lg border border-border bg-surface-subtle px-3 py-1 text-sm font-semibold text-foreground transition-colors group-hover:border-sapphire/40 group-hover:text-sapphire motion-reduce:transition-none sm:inline-flex">
            {searchCopy.triggerLabel}
          </span>
        </button>
        <Link
          href={withLangPrefix("/health-check", lang)}
          className="press-row group inline-flex min-h-12 max-w-full shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-border-control bg-card px-5 text-sm font-semibold text-foreground transition-[border-color,background-color] duration-(--dur-fast) ease-(--ease-out-calm) motion-reduce:transition-none hover:border-sapphire hover:bg-sapphire-soft/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:text-[0.9375rem]"
        >
          <StethoscopeIcon className="h-4.5 w-4.5 shrink-0 text-sapphire" aria-hidden="true" />
          <span className="min-w-0 truncate">{checkSymptomLabel}</span>
          <ArrowRightIcon
            className="h-4 w-4 text-sapphire transition-transform duration-(--dur-fast) ease-(--ease-out-calm) motion-safe:group-hover:translate-x-0.5 motion-reduce:transition-none"
            aria-hidden="true"
          />
        </Link>
      </div>

      {/* Topics: one row of chips; on phones it scrolls sideways and fades at the edge. */}
      <div
        role="group"
        aria-label={gridCopy.filterListAriaLabel}
        className="no-scrollbar -mx-4 mt-7 flex gap-2 overflow-x-auto px-4 pb-1 [mask-image:linear-gradient(to_right,black_calc(100%-2.5rem),transparent)] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:[mask-image:none]"
      >
        {filterChips.map((chip) => {
          const isActive = selectedCategory === chip.slug;
          return (
            <button
              key={chip.slug}
              type="button"
              aria-pressed={isActive}
              onClick={() => {
                setSelectedCategory(chip.slug);
                setShowAll(false);
              }}
              className={`inline-flex min-h-11 shrink-0 items-center whitespace-nowrap rounded-xl border px-4 text-sm font-medium transition-[color,background-color,border-color] duration-(--dur-fast) ease-(--ease-out-calm) motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                isActive
                  ? "press-solid border-sapphire bg-sapphire text-white shadow-2xs"
                  : "press-row border-border-control bg-card text-foreground hover:border-sapphire hover:bg-sapphire-soft/50"
              }`}
            >
              {chip.label}
            </button>
          );
        })}
      </div>

      {/* Count on the left, reading tools on the right; no box around them. */}
      <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-3 border-t border-border pt-5">
        <p role="status" className="mr-auto text-sm font-medium text-muted-foreground tabular-nums">
          {resultCountText}
        </p>
        {onOpenDictionary && (
          <button
            type="button"
            aria-haspopup="dialog"
            onClick={onOpenDictionary}
            className="press-row -mr-3 inline-flex min-h-11 items-center gap-2 whitespace-nowrap rounded-xl px-3 text-sm font-semibold text-sapphire transition-colors duration-(--dur-fast) ease-(--ease-out-calm) motion-reduce:transition-none hover:bg-sapphire-soft/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:mr-0"
          >
            <BookIcon className="h-4.5 w-4.5" aria-hidden="true" />
            <span>{lib.dictionary}</span>
          </button>
        )}
        {/* Phones: count and dictionary share a line; the reading switch wraps under them, in reading order. */}
        <div className="flex w-full flex-wrap items-center justify-between gap-2.5 sm:w-auto sm:justify-start">
          <span className="text-sm font-medium text-muted-foreground">{lib.howToRead}</span>
          <ReadingLevelSwitcher level={readingLevel} onChange={(lvl) => onReadingLevelChange?.(lvl)} />
        </div>
      </div>

      {filteredTopics.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-border-control px-6 py-12 text-center">
          <p className="text-lg font-semibold text-foreground">{gridCopy.emptyTitle}</p>
          <p className="mx-auto mt-1.5 max-w-md text-[15px] leading-relaxed text-muted-foreground">
            {gridCopy.emptyDescription}
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory("toate");
            }}
            className="press-row mt-5 inline-flex min-h-11 items-center justify-center whitespace-nowrap rounded-lg border border-border-control bg-card px-4 text-sm font-semibold text-foreground transition-colors duration-(--dur-fast) ease-(--ease-out-calm) motion-reduce:transition-none hover:border-sapphire hover:bg-sapphire-soft/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {gridCopy.emptyResetButton}
          </button>
        </div>
      ) : isSingleSpotlight ? (
        <div className="mt-8">
          <LeadTopicCard {...cardData(visibleTopics[0])} wide />
        </div>
      ) : (
        <>
          <ul
            className={`mt-8 grid grid-cols-1 gap-5 sm:gap-6 ${
              isPairedView ? "md:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4"
            }`}
          >
            {visibleTopics.map((topic, index) =>
              promoteLeadCard && index === 0 ? (
                <li key={topic.slug} className="flex sm:col-span-2">
                  <LeadTopicCard {...cardData(topic)} />
                </li>
              ) : (
                <li key={topic.slug} className="flex">
                  <TopicCard {...cardData(topic)} priority={index < 3} />
                </li>
              ),
            )}
          </ul>
          {!showAll && filteredTopics.length > FIRST_VIEW_LIMIT && (
            <div className="mt-8 text-center">
              <button
                type="button"
                onClick={() => setShowAll(true)}
                className="press-row inline-flex min-h-12 max-w-full items-center justify-center whitespace-nowrap rounded-xl border border-border-control bg-card px-5 text-sm font-semibold text-foreground transition-colors duration-(--dur-fast) ease-(--ease-out-calm) motion-reduce:transition-none hover:border-sapphire hover:bg-sapphire-soft/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:text-[0.9375rem]"
              >
                <span className="min-w-0 truncate">{lib.showAll}</span>
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}

type TopicCardProps = {
  topic: TopicItem;
  href: string;
  categoryLabel: string;
  keyFact: string;
  readMinutes: number;
  audioMinutes: number;
  isComplete: boolean;
  keyFactLabel: string;
  firstStepLabel: string;
  actionLabel: string;
  lang: Lang;
};

/** The card is one link: border at rest, a 2px lift and a darker edge on hover. */
const cardLinkClass =
  "press-row group flex w-full overflow-hidden rounded-2xl border border-border bg-card transition-[border-color,box-shadow,transform] duration-(--dur-base) ease-(--ease-out-calm) " +
  "hover:border-sapphire/45 hover:shadow-(--shadow-card-hover) motion-safe:hover:-translate-y-0.5 motion-safe:active:translate-y-0 motion-reduce:transition-none " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const photoClass =
  "object-cover transition-opacity duration-(--dur-base) ease-(--ease-out-calm) motion-reduce:transition-none";

function CardCategory({ topic, label }: { topic: TopicItem; label: string }) {
  const TopicIcon = topic.icon;
  if (!label) return null;
  return (
    <p className="inline-flex items-center gap-1.5 text-sm font-medium text-sapphire">
      <TopicIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
      <span>{label}</span>
    </p>
  );
}

function CardFooter({ readMinutes, audioMinutes, lang, actionLabel }: Pick<TopicCardProps, "readMinutes" | "audioMinutes" | "lang" | "actionLabel">) {
  return (
    <div className="mt-auto flex items-center justify-between gap-3 pt-5">
      <TopicMetaBadge readMinutes={readMinutes} audioMinutes={audioMinutes} compact bordered={false} lang={lang} />
      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sapphire-soft text-sapphire transition-[background-color,color] duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] group-hover:bg-sapphire group-hover:text-white motion-reduce:transition-none">
        <ArrowRightIcon
          aria-hidden="true"
          className="h-4 w-4 transition-transform duration-(--dur-fast) ease-(--ease-out-calm) motion-safe:group-hover:translate-x-0.5 motion-reduce:transition-none"
        />
      </span>
      <span className="sr-only">{actionLabel}</span>
    </div>
  );
}

function TopicCard(props: TopicCardProps & { priority?: boolean }) {
  const { topic, href, categoryLabel, keyFact, isComplete, keyFactLabel, priority = false } = props;
  return (
    <Link href={href} className={`${cardLinkClass} flex-col`}>
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-surface-subtle">
        <Image
          src={topic.image}
          alt=""
          fill
          priority={priority}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className={photoClass}
        />
      </div>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <CardCategory topic={topic} label={categoryLabel} />
        <h3 className="mt-2 text-xl font-semibold leading-snug tracking-[-0.015em] text-foreground text-balance">
          {topic.title}
        </h3>
        <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground text-pretty">{topic.description}</p>

        {keyFact && (
          <div
            aria-hidden={!isComplete}
            className={`grid transition-[grid-template-rows,opacity,margin] duration-[var(--dur-base)] ease-[var(--ease-out-calm)] motion-reduce:transition-none ${
              isComplete ? "mt-4 grid-rows-[1fr] opacity-100" : "mt-0 grid-rows-[0fr] opacity-0"
            }`}
          >
            <div className="overflow-hidden">
              <div className="border-t border-border pt-3.5">
                <p className="text-xs font-semibold text-sapphire">{keyFactLabel}</p>
                <p className="mt-1 text-sm leading-relaxed text-foreground">{keyFact}</p>
              </div>
            </div>
          </div>
        )}

        <CardFooter {...props} />
      </div>
    </Link>
  );
}

/** The first guide, set larger: photo beside the text, and its first practical step in one line. */
function LeadTopicCard(props: TopicCardProps & { wide?: boolean }) {
  const { topic, href, categoryLabel, keyFact, isComplete, keyFactLabel, firstStepLabel, wide = false } = props;
  return (
    <Link
      href={href}
      className={`${cardLinkClass} flex-col ${wide ? "lg:grid lg:grid-cols-12" : "md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]"}`}
    >
      <div
        className={`relative aspect-[16/10] w-full overflow-hidden bg-surface-subtle ${
          wide ? "lg:col-span-6 lg:aspect-auto lg:min-h-[22rem]" : "md:aspect-auto md:min-h-[20rem]"
        }`}
      >
        <Image
          src={topic.image}
          alt=""
          fill
          priority
          sizes={wide ? "(max-width: 1024px) 100vw, 50vw" : "(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"}
          className={photoClass}
        />
      </div>

      <div className={`flex flex-1 flex-col p-6 sm:p-7 ${wide ? "lg:col-span-6 lg:p-9" : ""}`}>
        <CardCategory topic={topic} label={categoryLabel} />
        <h3 className="mt-2 text-2xl font-semibold leading-tight tracking-[-0.02em] text-foreground text-balance sm:text-[28px]">
          {topic.title}
        </h3>
        <p className="mt-3 text-base leading-relaxed text-muted-foreground text-pretty">{topic.description}</p>

        {topic.recommendationBody && (
          <p className="mt-5 flex items-start gap-2.5 text-[15px] leading-relaxed text-foreground">
            <CheckCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-live-sage" aria-hidden="true" />
            <span>
              <span className="font-semibold">{topic.recommendationTitle || firstStepLabel}.</span>{" "}
              <span className="text-muted-foreground">{topic.recommendationBody}</span>
            </span>
          </p>
        )}

        {isComplete && keyFact && (
          <div className="mt-4 border-t border-border pt-4">
            <p className="text-xs font-semibold text-sapphire">{keyFactLabel}</p>
            <p className="mt-1 text-[15px] leading-relaxed text-foreground">{keyFact}</p>
          </div>
        )}

        <CardFooter {...props} />
      </div>
    </Link>
  );
}
