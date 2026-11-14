"use client";

import { useMemo, useState, type CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { BookIcon, SearchIcon } from "@/components/ui/icons";
import { useLanguage } from "@/lib/i18n/language-context";
import { withLangPrefix } from "@/lib/i18n/routing";
import type { Lang } from "@/lib/i18n/translations";
import {
  type TopicItem,
  getHealthTopicsList,
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
    showAll: string;
    title: string;
    firstStepLabel: string;
  }
> = {
  ru: {
    howToRead: "Как читать",
    dictionary: "Словарь",
    showAll: "Показать все руководства",
    title: "Путеводители по здоровью",
    firstStepLabel: "Первый практический шаг",
  },
  ro: {
    howToRead: "Cum citești",
    dictionary: "Dicționar medical",
    showAll: "Arată toate ghidurile",
    title: "Ghiduri de sănătate",
    firstStepLabel: "Primul pas practic",
  },
  en: {
    howToRead: "How to read",
    dictionary: "Medical dictionary",
    showAll: "Show all guides",
    title: "Health guides",
    firstStepLabel: "Practical first step",
  },
  sq: {
    howToRead: "Si të lexosh",
    dictionary: "Fjalori mjekësor",
    showAll: "Shfaq të gjithë udhëzuesit",
    title: "Udhëzues shëndetësorë",
    firstStepLabel: "Hapi i parë praktik",
  },
  it: {
    howToRead: "Come leggere",
    dictionary: "Dizionario medico",
    showAll: "Mostra tutte le guide",
    title: "Guide alla salute",
    firstStepLabel: "Primo passo pratico",
  },
  hr: {
    howToRead: "Kako čitati",
    dictionary: "Medicinski rječnik",
    showAll: "Prikaži sve vodiče",
    title: "Zdravstveni vodiči",
    firstStepLabel: "Prvi praktični korak",
  },
  rom: {
    howToRead: "Sar te drabares",
    dictionary: "Doktorengo lavustik",
    showAll: "Sikav sa le sikavimata",
    title: "Sikavimata vaš o sastipen",
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
  const [showAll, setShowAll] = useState(false);
  const visibleTopics = showAll
    ? filteredTopics
    : filteredTopics.slice(0, FIRST_VIEW_LIMIT);

  // Cards revealed by "show all" count their stagger from the first new card, not from the top.
  const dealStyle = (index: number) =>
    ({ "--i": showAll && index >= FIRST_VIEW_LIMIT ? index - FIRST_VIEW_LIMIT : index }) as CSSProperties;

  const isSingleSpotlight = visibleTopics.length === 1;
  const isPairedView = visibleTopics.length === 2;
  const promoteLeadCard =
    selectedCategory === "toate" &&
    visibleTopics.length >= 3;

  const cardData = (topic: TopicItem) => ({
    topic,
    href: withLangPrefix(`/health-information/${topic.slug}`, lang),
    readMinutes: readingLevel === "complete" ? topic.readMinutes + 2 : topic.readMinutes,
    audioMinutes: readingLevel === "complete" ? topic.audioMinutes + 1 : topic.audioMinutes,
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

      {/* Search first: the field itself is the control; "Check a symptom" sits in the page lead above. */}
      <button
        id="health-library-search"
        type="button"
        onClick={() => openSmartSearch()}
        aria-label={gridCopy.searchAriaLabel}
        className="press-row group flex min-h-12 w-full items-center gap-3 rounded-xl border border-border-control bg-card px-4 py-2.5 text-left text-body text-muted-foreground transition-[border-color,background-color,box-shadow] duration-(--dur-fast) ease-(--ease-out-calm) motion-reduce:transition-none hover:border-sapphire/60 hover:bg-sapphire-soft/20 focus-visible:border-sapphire focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <SearchIcon
          className="h-5 w-5 shrink-0 text-muted-foreground transition-colors group-hover:text-sapphire motion-reduce:transition-none"
          aria-hidden="true"
        />
        <span className="min-w-0 truncate">{searchCopy.triggerPlaceholder}</span>
      </button>

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
              className={`inline-flex min-h-11 shrink-0 items-center whitespace-nowrap rounded-xl border px-4 text-body font-medium transition-[color,background-color,border-color] duration-(--dur-fast) ease-(--ease-out-calm) motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
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
        <p role="status" className="mr-auto text-body font-medium text-muted-foreground tabular-nums">
          {/* The figure settles in again whenever the filter changes it. */}
          <span key={resultCountText} className="swap-in inline-block">
            {resultCountText}
          </span>
        </p>
        {onOpenDictionary && (
          <button
            type="button"
            aria-haspopup="dialog"
            onClick={onOpenDictionary}
            className="press-row -mr-3 inline-flex min-h-11 items-center gap-2 whitespace-nowrap rounded-xl px-3 text-body font-semibold text-sapphire transition-colors duration-(--dur-fast) ease-(--ease-out-calm) motion-reduce:transition-none hover:bg-sapphire-soft/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:mr-0"
          >
            <BookIcon className="h-4.5 w-4.5" aria-hidden="true" />
            <span>{lib.dictionary}</span>
          </button>
        )}
        {/* Phones: count and dictionary share a line; the reading switch wraps under them, in reading order. */}
        <div className="flex w-full flex-wrap items-center justify-between gap-2.5 sm:w-auto sm:justify-start">
          <span className="text-meta font-medium text-muted-foreground">{lib.howToRead}</span>
          <ReadingLevelSwitcher level={readingLevel} onChange={(lvl) => onReadingLevelChange?.(lvl)} />
        </div>
      </div>

      {filteredTopics.length === 0 ? (
        <div key="empty" className="swap-in mt-8 rounded-2xl border border-dashed border-border-control px-6 py-12 text-center">
          <p className="text-lead font-semibold text-foreground">{gridCopy.emptyTitle}</p>
          <p className="mx-auto mt-1.5 max-w-md text-body text-muted-foreground">
            {gridCopy.emptyDescription}
          </p>
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={() => {
              setSelectedCategory("toate");
              setShowAll(false);
            }}
            className="mt-5 hover:border-sapphire hover:bg-sapphire-soft/45"
          >
            {gridCopy.emptyResetButton}
          </Button>
        </div>
      ) : isSingleSpotlight ? (
        <div key={selectedCategory} className="swap-in mt-8">
          <LeadTopicCard {...cardData(visibleTopics[0])} wide />
        </div>
      ) : (
        <>
          {/* Keyed by filter: a new choice re-deals the cards in order; "show all" only deals the new ones. */}
          <ul
            key={selectedCategory}
            className={`mt-8 grid grid-cols-1 gap-5 sm:gap-6 ${
              isPairedView ? "md:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4"
            }`}
          >
            {visibleTopics.map((topic, index) =>
              promoteLeadCard && index === 0 ? (
                <li key={topic.slug} className="list-in flex sm:col-span-2" style={dealStyle(index)}>
                  <LeadTopicCard {...cardData(topic)} />
                </li>
              ) : (
                <li key={topic.slug} className="list-in flex" style={dealStyle(index)}>
                  <TopicCard {...cardData(topic)} priority={index < 3} />
                </li>
              ),
            )}
          </ul>
          {!showAll && filteredTopics.length > FIRST_VIEW_LIMIT && (
            <div className="mt-8 text-center">
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => setShowAll(true)}
                className="hover:border-sapphire hover:bg-sapphire-soft/45"
              >
                <span className="min-w-0 truncate">{lib.showAll}</span>
              </Button>
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
  readMinutes: number;
  audioMinutes: number;
  firstStepLabel: string;
  actionLabel: string;
  lang: Lang;
};

/** The card is one link: the shared card hover (shadow deepens, edge tints, nothing moves). */
const cardLinkClass =
  "card-interactive press-row group flex w-full overflow-hidden rounded-2xl border border-border bg-card motion-reduce:transition-none " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const photoClass =
  "object-cover transition-opacity duration-(--dur-base) ease-(--ease-out-calm) motion-reduce:transition-none";

function CardFooter({ readMinutes, audioMinutes, lang, actionLabel }: Pick<TopicCardProps, "readMinutes" | "audioMinutes" | "lang" | "actionLabel">) {
  return (
    <div className="mt-auto pt-5">
      <TopicMetaBadge readMinutes={readMinutes} audioMinutes={audioMinutes} compact bordered={false} lang={lang} />
      <span className="sr-only">{actionLabel}</span>
    </div>
  );
}

function TopicCard(props: TopicCardProps & { priority?: boolean }) {
  const { topic, href, priority = false } = props;
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
        <h3 className="text-title font-semibold leading-snug text-foreground text-balance transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] group-hover:text-sapphire motion-reduce:transition-none">
          {topic.title}
        </h3>
        <p className="mt-2 text-body text-muted-foreground text-pretty">{topic.description}</p>

        <CardFooter {...props} />
      </div>
    </Link>
  );
}

/** The first guide, set larger: photo beside the text, and its first practical step in one line. */
function LeadTopicCard(props: TopicCardProps & { wide?: boolean }) {
  const { topic, href, firstStepLabel, wide = false } = props;
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
        <h3 className="text-section font-semibold leading-tight text-foreground text-balance transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] group-hover:text-sapphire motion-reduce:transition-none">
          {topic.title}
        </h3>
        <p className="mt-3 text-body text-muted-foreground text-pretty">{topic.description}</p>

        {topic.recommendationBody && (
          <p className="mt-5 text-body text-foreground">
            <span className="font-semibold">{topic.recommendationTitle || firstStepLabel}.</span>{" "}
            <span className="text-muted-foreground">{topic.recommendationBody}</span>
          </p>
        )}

        <CardFooter {...props} />
      </div>
    </Link>
  );
}
