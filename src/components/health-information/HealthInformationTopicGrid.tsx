"use client";

import { useMemo, type CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { BookIcon, SearchIcon } from "@/components/ui/icons";
import { useLanguage } from "@/lib/i18n/language-context";
import { withLangPrefix } from "@/lib/i18n/routing";
import type { Lang } from "@/lib/i18n/translations";
import {
  type TopicItem,
  getFeaturedHealthTopics,
  getHealthTopicsList,
  HEALTH_TOPICS_LIST,
  getHealthTopicGridDictionary,
} from "@/lib/i18n/health-information-topics";
import { TopicMetaBadge } from "./TopicMetaBadge";
import { openSmartSearch } from "@/components/search/smart-search-events";
import { getSmartSearchCopy } from "@/lib/i18n/smart-search-copy";

export type { TopicItem };
export { getHealthTopicsList, HEALTH_TOPICS_LIST };

export interface HealthInformationTopicGridProps {
  /** No longer used: the guides page shows the four main guides without filters. */
  initialCategory?: string;
  className?: string;
  /** Library tools: reading time and the dictionary. */
  readingLevel?: "simple" | "complete";
  onOpenDictionary?: () => void;
}

const LIBRARY_COPY: Record<
  Lang,
  {
    dictionary: string;
    title: string;
    firstStepLabel: string;
  }
> = {
  ru: {
    dictionary: "Словарь",
    title: "Путеводители по здоровью",
    firstStepLabel: "Первый практический шаг",
  },
  ro: {
    dictionary: "Dicționar medical",
    title: "Ghiduri de sănătate",
    firstStepLabel: "Primul pas practic",
  },
  en: {
    dictionary: "Medical dictionary",
    title: "Health guides",
    firstStepLabel: "Practical first step",
  },
  sq: {
    dictionary: "Fjalori mjekësor",
    title: "Udhëzues shëndetësorë",
    firstStepLabel: "Hapi i parë praktik",
  },
  it: {
    dictionary: "Dizionario medico",
    title: "Guide alla salute",
    firstStepLabel: "Primo passo pratico",
  },
  hr: {
    dictionary: "Medicinski rječnik",
    title: "Zdravstveni vodiči",
    firstStepLabel: "Prvi praktični korak",
  },
  rom: {
    dictionary: "Doktorengo lavustik",
    title: "Sikavimata vaš o sastipen",
    firstStepLabel: "Angluno praktikano paso",
  },
};

export function HealthInformationTopicGrid({
  className = "",
  readingLevel = "complete",
  onOpenDictionary,
}: HealthInformationTopicGridProps) {
  const { lang, t } = useLanguage();
  const gridCopy =
    t?.healthInfoPage?.topicGrid ?? getHealthTopicGridDictionary(lang);
  // Only the four main guides are shown; every other subject is under "Health topics" below.
  const topics = useMemo(() => getFeaturedHealthTopics(lang), [lang]);
  const searchCopy = getSmartSearchCopy(lang);
  const lib = LIBRARY_COPY[lang] ?? LIBRARY_COPY.ro;

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

      {/* The page's one search: it covers the guides, every article and the rest of the site. */}
      <button
        id="health-library-search"
        type="button"
        onClick={() => openSmartSearch()}
        aria-label={gridCopy.searchAriaLabel}
        className="press-row group flex min-h-12 w-full items-center gap-3 rounded-xl border border-border-control bg-card px-4 py-2.5 text-left text-body text-muted-foreground transition-[border-color,background-color] duration-(--dur-fast) ease-(--ease-out-calm) motion-reduce:transition-none hover:border-sapphire/40 hover:bg-sapphire-soft/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <SearchIcon
          className="h-5 w-5 shrink-0 text-muted-foreground transition-colors group-hover:text-sapphire motion-reduce:transition-none"
          aria-hidden="true"
        />
        <span className="min-w-0 truncate">{searchCopy.triggerPlaceholder}</span>
      </button>

      {onOpenDictionary && (
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            aria-haspopup="dialog"
            onClick={onOpenDictionary}
            className="press-row -mr-3 inline-flex min-h-11 items-center gap-2 whitespace-nowrap rounded-xl px-3 text-body font-semibold text-sapphire transition-colors duration-(--dur-fast) ease-(--ease-out-calm) motion-reduce:transition-none hover:bg-sapphire-soft/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:mr-0"
          >
            <BookIcon className="h-4.5 w-4.5" aria-hidden="true" />
            <span>{lib.dictionary}</span>
          </button>
        </div>
      )}

      <ul className={`${onOpenDictionary ? "mt-4" : "mt-8"} grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 xl:grid-cols-4`}>
        {topics.map((topic, index) => (
          <li key={topic.slug} className="list-in flex" style={{ "--i": index } as CSSProperties}>
            <TopicCard {...cardData(topic)} priority={index < 2} />
          </li>
        ))}
      </ul>
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
