"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon, SearchIcon } from "@/components/ui/icons";
import { useLanguage } from "@/lib/i18n/language-context";
import { withLangPrefix } from "@/lib/i18n/routing";
import {
  type TopicItem,
  getHealthTopicsList,
  HEALTH_TOPICS_LIST,
  getHealthTopicGridDictionary,
} from "@/lib/i18n/health-information-topics";
import { TopicMetaBadge } from "./TopicMetaBadge";
import { ReadingLevelSwitcher } from "./ReadingLevelSwitcher";
import { TOPIC_PICTOGRAMS } from "./TopicIcons";
import { useRowMasonry } from "./useRowMasonry";

export type { TopicItem };
export { getHealthTopicsList, HEALTH_TOPICS_LIST };

/**
 * Checkerboard masonry rhythm across 4-column desktop and 2-column tablet grids:
 * Row 1 alternates [Feature, Compact, Feature, Compact] and Row 2 alternates [Compact, Feature, Compact, Feature].
 * Every column gets 1 Feature + 1 Compact card (4 cols) or 2 Feature + 2 Compact cards (2 cols),
 * staggering the horizontal interior seam while keeping the bottom edge balanced.
 */
const MASONRY_FEATURE_INDICES = new Set([0, 2, 5, 7]);

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

const LIBRARY_COPY: Record<string, { howToRead: string; dictionary: string; checkSymptom: string; showAll: string; title: string }> = {
  ro: { howToRead: "Cum citești", dictionary: "Dicționar", checkSymptom: "Verifică un simptom", showAll: "Arată toate ghidurile", title: "Ghiduri de sănătate" },
  en: { howToRead: "How to read", dictionary: "Dictionary", checkSymptom: "Check a symptom", showAll: "Show all guides", title: "Health guides" },
  sq: { howToRead: "Si të lexosh", dictionary: "Fjalori", checkSymptom: "Kontrollo një simptomë", showAll: "Shfaq të gjithë udhëzuesit", title: "Udhëzues shëndetësorë" },
  it: { howToRead: "Come leggere", dictionary: "Dizionario", checkSymptom: "Controlla un sintomo", showAll: "Mostra tutte le guide", title: "Guide alla salute" },
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
  const [searchQuery, setSearchQuery] = useState<string>("");

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

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredTopics = topics.filter((topic) => {
    const matchesCategory =
      selectedCategory === "toate" ||
      topic.categorySlug === selectedCategory ||
      topic.slug === selectedCategory;
    if (!matchesCategory) return false;
    if (!normalizedQuery) return true;
    const categoryLabel =
      filterChips.find((c) => c.slug === topic.categorySlug)?.label ?? "";
    return (
      topic.title.toLowerCase().includes(normalizedQuery) ||
      topic.description.toLowerCase().includes(normalizedQuery) ||
      topic.categorySlug.toLowerCase().includes(normalizedQuery) ||
      categoryLabel.toLowerCase().includes(normalizedQuery)
    );
  });

  // Bento only when every topic is visible; filtered results use the plain grid.

  const resultCountText =
    filteredTopics.length === 1
      ? gridCopy.countSingular
      : gridCopy.countPluralTemplate.replace(
          "{count}",
          String(filteredTopics.length),
        );

  const lib = LIBRARY_COPY[lang] ?? LIBRARY_COPY.ro;
  // Same wording as the rest of the site for the symptom check.
  const checkSymptomLabel = t?.healthInfoPage?.tabs?.triage ?? lib.checkSymptom;
  const [showAll, setShowAll] = useState(false);
  const visibleTopics = showAll ? filteredTopics : filteredTopics.slice(0, FIRST_VIEW_LIMIT);
  const listRef = useRef<HTMLUListElement | null>(null);
  useRowMasonry(listRef, [visibleTopics, readingLevel, lang]);

  return (
    <section
      aria-labelledby="health-library-title"
      className={`rounded-xl border border-border bg-card p-4 shadow-xs sm:p-5 ${className}`}
    >
      {/* The page H1 already names the library; this heading is for screen readers. */}
      <h2 id="health-library-title" className="sr-only">
        {lib.title}
      </h2>

      {/* Row 1: search, and the one way out to the symptom check */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={gridCopy.searchPlaceholder}
            aria-label={gridCopy.searchAriaLabel}
            className="min-h-12 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-base text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none"
          />
        </div>
        <Link
          href={withLangPrefix("/health-check", lang)}
          className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-lg bg-foreground px-5 text-base font-semibold text-white transition-colors hover:bg-ink-800"
        >
          {checkSymptomLabel}
          <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>

      {/* Row 2: categories only, as underlined text; scrolls sideways on phones */}
      <div
        role="group"
        aria-label={gridCopy.filterListAriaLabel}
        className="mt-3 flex overflow-x-auto border-b border-border scrollbar-none"
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
              className={`-mb-px inline-flex min-h-11 shrink-0 items-center border-b-2 px-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sapphire ${
                isActive
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {chip.label}
            </button>
          );
        })}
      </div>

      {/* Row 3: reading settings on their own labelled line */}
      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
        <span className="text-muted-foreground">{lib.howToRead}:</span>
        <ReadingLevelSwitcher
          level={readingLevel}
          onChange={(lvl) => onReadingLevelChange?.(lvl)}
        />
        {onOpenDictionary && (
          <>
            <button
              type="button"
              aria-haspopup="dialog"
              onClick={onOpenDictionary}
              className="min-h-11 font-medium text-foreground underline underline-offset-4 hover:text-muted-foreground"
            >
              {lib.dictionary}
            </button>
          </>
        )}
        <p role="status" className="ml-auto text-muted-foreground">
          {resultCountText}
          {searchQuery ? gridCopy.countSearchSuffix : ""}
        </p>
      </div>

      {filteredTopics.length === 0 ? (
        <div className="mt-6 rounded-lg border border-dashed border-border px-6 py-10 text-center">
          <p className="text-base font-semibold text-foreground">{gridCopy.emptyTitle}</p>
          <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">{gridCopy.emptyDescription}</p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("toate");
            }}
            className="mt-4 inline-flex min-h-11 items-center justify-center rounded-lg border border-border bg-card px-4 text-sm font-semibold text-foreground hover:bg-muted"
          >
            {gridCopy.emptyResetButton}
          </button>
        </div>
      ) : (
        <>
          {/* Row-first masonry grid combining editorial topic photography with custom health pictograms. */}
          <ul
            ref={listRef}
            className="mt-4 grid grid-cols-1 items-start gap-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            {visibleTopics.map((topic, index) => {
              const Pictogram = TOPIC_PICTOGRAMS[topic.slug];
              const categoryLabel =
                filterChips.find((c) => c.slug === topic.categorySlug)?.label ?? "";
              const isFeatureCard = MASONRY_FEATURE_INDICES.has(index % 8);
              const showTakeaway =
                isFeatureCard ||
                readingLevel === "complete" ||
                filteredTopics.length <= 2;
              const showExtraStep =
                isFeatureCard &&
                readingLevel === "complete" &&
                Boolean(topic.recommendationTitle);

              return (
                <li key={topic.slug} className="block">
                  <Link
                    href={withLangPrefix(`/health-information/${topic.slug}`, lang)}
                    className="group flex w-full flex-col overflow-hidden rounded-xl border border-border bg-card shadow-[0_1px_2px_rgb(28_25_23/0.04)] transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-foreground/30 hover:shadow-[0_14px_34px_-18px_rgb(28_25_23/0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire focus-visible:ring-offset-2"
                  >
                    <div
                      className={`relative w-full overflow-hidden border-b border-border/60 bg-surface-subtle ${
                        isFeatureCard
                          ? "aspect-[16/10] sm:aspect-[4/3]"
                          : "aspect-[16/10] sm:aspect-[2/1]"
                      }`}
                    >
                      <Image
                        src={topic.image}
                        alt=""
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
                        className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03] motion-reduce:transition-none"
                      />
                      <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/20 to-transparent"
                      />
                    </div>

                    <div className="flex flex-1 flex-col px-4 pb-4 pt-0 sm:px-5 sm:pb-5">
                      <div className="flex items-end justify-between gap-3">
                        {Pictogram && (
                          <span className="relative z-10 -mt-6 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-border bg-card text-foreground shadow-xs transition-colors duration-200 group-hover:border-foreground group-hover:bg-foreground group-hover:text-background">
                            <Pictogram className="h-7 w-7" />
                          </span>
                        )}
                        {categoryLabel && (
                          <span className="pt-2.5 text-xs font-medium text-muted-foreground">
                            {categoryLabel}
                          </span>
                        )}
                      </div>

                      <h3 className="mt-3 text-base font-semibold leading-snug tracking-[-0.01em] text-foreground text-balance sm:text-lg">
                        {topic.title}
                      </h3>
                      <p className="mt-1.5 text-base leading-relaxed text-muted-foreground text-pretty sm:text-sm">
                        {topic.description}
                      </p>

                      {showTakeaway && topic.keyFact && (
                        <div className="mt-3.5 border-t border-border/70 pt-3">
                          <p className="text-xs leading-relaxed text-foreground/85 text-pretty">
                            {topic.keyFact}
                          </p>
                          {showExtraStep && (
                            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground text-pretty">
                              <span className="font-semibold text-foreground">
                                {topic.recommendationTitle}:
                              </span>{" "}
                              {topic.recommendationBody}
                            </p>
                          )}
                        </div>
                      )}

                      <div className="mt-auto flex items-center justify-between gap-3 pt-4">
                        <TopicMetaBadge
                          readMinutes={topic.readMinutes}
                          audioMinutes={topic.audioMinutes}
                          compact={true}
                          bordered={false}
                        />
                        <ArrowRightIcon
                          aria-hidden="true"
                          className="h-4 w-4 shrink-0 text-muted-foreground transition-[transform,color] duration-200 group-hover:translate-x-0.5 group-hover:text-foreground motion-reduce:transition-none"
                        />
                      </div>
                      <span className="sr-only">{gridCopy.cardActionLabel}</span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
          {!showAll && filteredTopics.length > FIRST_VIEW_LIMIT && (
            <div className="mt-5 text-center">
              <button
                type="button"
                onClick={() => setShowAll(true)}
                className="inline-flex min-h-12 items-center justify-center rounded-lg border border-border bg-card px-5 text-base font-semibold text-foreground hover:bg-muted"
              >
                {lib.showAll}
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
