"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon, BookIcon, SearchIcon } from "@/components/ui/icons";
import { useLanguage } from "@/lib/i18n/language-context";
import { withLangPrefix } from "@/lib/i18n/routing";
import type { Lang } from "@/lib/i18n/translations";
import {
  type TopicItem,
  getHealthTopicsList,
  HEALTH_TOPICS_LIST,
  getHealthTopicGridDictionary,
  TOOL_LABELS_BY_SLUG,
} from "@/lib/i18n/health-information-topics";
import { TopicMetaBadge } from "./TopicMetaBadge";
import { openSmartSearch } from "@/components/search/smart-search-events";
import { getSmartSearchCopy } from "@/lib/i18n/smart-search-copy";
import { SAVED_GUIDES_EVENT, readSavedGuides, type SavedGuide } from "@/lib/pwa/saved-guides";

export type { TopicItem };
export { getHealthTopicsList, HEALTH_TOPICS_LIST };

export interface HealthInformationTopicGridProps {
  /** Legacy filter prop kept optional for compatibility; all 8 guides and tools are shown. */
  initialCategory?: string;
  className?: string;
  onOpenDictionary?: () => void;
}

const LIBRARY_COPY: Record<
  Lang,
  {
    dictionary: string;
    title: string;
    firstStepLabel: string;
    defaultToolLabel: string;
    /** Heading of the list of tools: the second half of the page name, "Learn and test yourself". */
    toolsHeading: string;
    /** Heading of the guide cards. */
    guidesHeading: string;
    /** Heading of the guides kept on this phone; the save button's message names it word for word. */
    savedHeading: string;
  }
> = {
  ru: {
    dictionary: "Словарь",
    title: "Путеводители и самопроверка",
    firstStepLabel: "Первый практический шаг",
    defaultToolLabel: "Открыть инструмент",
    toolsHeading: "Проверь себя",
    guidesHeading: "Памятки",
    savedHeading: "Сохранено на телефоне",
  },
  ro: {
    dictionary: "Dicționar medical",
    title: "Ghiduri și exerciții practice",
    firstStepLabel: "Primul pas practic",
    defaultToolLabel: "Deschide exercițiul",
    toolsHeading: "Testează-te",
    guidesHeading: "Ghiduri",
    savedHeading: "Salvate pe telefon",
  },
  en: {
    dictionary: "Medical dictionary",
    title: "Guides and interactive tools",
    firstStepLabel: "Practical first step",
    defaultToolLabel: "Open interactive tool",
    toolsHeading: "Test yourself",
    guidesHeading: "Guides",
    savedHeading: "Saved on this phone",
  },
  sq: {
    dictionary: "Fjalori mjekësor",
    title: "Udhëzues dhe ushtrime",
    firstStepLabel: "Hapi i parë praktik",
    defaultToolLabel: "Hap mjetin praktik",
    toolsHeading: "Testo veten",
    guidesHeading: "Udhëzues",
    savedHeading: "Ruajtur në telefon",
  },
  it: {
    dictionary: "Dizionario medico",
    title: "Guide e strumenti pratici",
    firstStepLabel: "Primo passo pratico",
    defaultToolLabel: "Apri strumento pratico",
    toolsHeading: "Mettiti alla prova",
    guidesHeading: "Guide",
    savedHeading: "Salvate sul telefono",
  },
  hr: {
    dictionary: "Medicinski rječnik",
    title: "Vodiči i praktični alati",
    firstStepLabel: "Prvi praktični korak",
    defaultToolLabel: "Otvori praktični alat",
    toolsHeading: "Testiraj se",
    guidesHeading: "Vodiči",
    savedHeading: "Spremljeno na mobitelu",
  },
  rom: {
    dictionary: "Doktorengo lavustik",
    title: "Sikavimata thaj praktikane buća",
    firstStepLabel: "Angluno praktikano paso",
    defaultToolLabel: "Putar o instrumenti",
    toolsHeading: "Proba tu",
    guidesHeading: "Gidurya",
    savedHeading: "Garavde po telefono",
  },
};

const LIST_HEADING_CLASS = "text-section font-semibold text-foreground text-balance";
const LIST_ROW_LINK_CLASS =
  "press-row group -mx-3 flex min-h-12 items-center justify-between gap-3 rounded-xl px-3 py-3 text-foreground transition-colors duration-(--dur-fast) ease-(--ease-out-calm) motion-reduce:transition-none hover:bg-sapphire-soft/45 hover:text-sapphire focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset dark:hover:bg-white/[0.05] dark:hover:text-sapphire-border";

/** Guides kept on this phone, newest first. Renders nothing until at least one is saved. */
function SavedGuidesList({ heading }: { heading: string }) {
  const [saved, setSaved] = useState<SavedGuide[]>([]);

  useEffect(() => {
    let cancelled = false;
    const load = () => {
      void readSavedGuides().then((list) => {
        if (!cancelled) setSaved(list);
      });
    };
    load();
    window.addEventListener(SAVED_GUIDES_EVENT, load);
    return () => {
      cancelled = true;
      window.removeEventListener(SAVED_GUIDES_EVENT, load);
    };
  }, []);

  if (saved.length === 0) return null;

  return (
    <section aria-labelledby="health-saved-title" className="mt-8">
      <h2 id="health-saved-title" className={LIST_HEADING_CLASS}>
        {heading}
      </h2>
      <ul className="mt-3 grid grid-cols-1 border-t border-border sm:grid-cols-2 sm:gap-x-8">
        {saved.map((item) => (
          <li key={item.path} className="border-b border-border">
            {/* A plain link, not a router link: without internet the browser must ask the page
                itself, which the service worker answers from the saved copy. */}
            <a href={item.path} className={LIST_ROW_LINK_CLASS}>
              <span lang={item.lang} className="min-w-0 text-body font-semibold text-pretty">
                {item.title}
              </span>
              <ArrowRightIcon className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function HealthInformationTopicGrid({
  className = "",
  onOpenDictionary,
}: HealthInformationTopicGridProps) {
  const { lang, t } = useLanguage();
  const gridCopy =
    t?.healthInfoPage?.topicGrid ?? getHealthTopicGridDictionary(lang);
  const topics = useMemo(() => getHealthTopicsList(lang), [lang]);
  const searchCopy = getSmartSearchCopy(lang);
  const lib = LIBRARY_COPY[lang] ?? LIBRARY_COPY.ro;

  const cardData = (topic: TopicItem) => ({
    topic,
    href: withLangPrefix(`/health-information/${topic.slug}`, lang),
    readMinutes: topic.readMinutes,
    audioMinutes: topic.audioMinutes,
    firstStepLabel: lib.firstStepLabel,
    toolLabel: TOOL_LABELS_BY_SLUG[topic.slug]?.[lang] ?? lib.defaultToolLabel,
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
            onClick={onOpenDictionary}
            className="press-row -mr-3 inline-flex min-h-11 items-center gap-2 whitespace-nowrap rounded-xl px-3 text-body font-semibold text-sapphire transition-colors duration-(--dur-fast) ease-(--ease-out-calm) motion-reduce:transition-none hover:bg-sapphire-soft/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:mr-0"
          >
            <BookIcon className="h-4.5 w-4.5" aria-hidden="true" />
            <span>{lib.dictionary}</span>
          </button>
        </div>
      )}

      <SavedGuidesList heading={lib.savedHeading} />

      {/* The tools first, as plain rows: the page holds things to do, not only things to read. */}
      <section aria-labelledby="health-tools-title" className={onOpenDictionary ? "mt-4" : "mt-8"}>
        <h2 id="health-tools-title" className={LIST_HEADING_CLASS}>
          {lib.toolsHeading}
        </h2>
        <ul className="mt-3 grid grid-cols-1 border-t border-border sm:grid-cols-2 sm:gap-x-8">
          {topics.map((topic) => {
            const card = cardData(topic);
            return (
              <li key={topic.slug} className="border-b border-border">
                <Link href={`${card.href}#section-explainer`} className={LIST_ROW_LINK_CLASS}>
                  <span className="min-w-0">
                    <span className="block text-body font-semibold text-pretty">{card.toolLabel}</span>
                    <span className="mt-0.5 block text-meta text-muted-foreground">{topic.title}</span>
                  </span>
                  <ArrowRightIcon
                    className="arrow-travel h-4 w-4 shrink-0 text-muted-foreground transition-colors duration-(--dur-fast) ease-(--ease-out-calm) group-hover:text-sapphire motion-reduce:transition-none dark:group-hover:text-sapphire-border"
                    aria-hidden="true"
                  />
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <h2 id="health-guides-title" className={`mt-10 ${LIST_HEADING_CLASS}`}>
        {lib.guidesHeading}
      </h2>
      <ul
        aria-labelledby="health-guides-title"
        className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-4"
      >
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
  toolLabel: string;
  actionLabel: string;
  lang: Lang;
};

const cardShellClass =
  "card-interactive flex w-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-(--shadow-card-rest) motion-reduce:transition-none";

/*
 * On a phone the card is a row: a small photo beside the title, so eight guides fit in a few
 * screens and cost little data. From `sm` it is the stacked card with the wide photo.
 */
const cardMainLinkClass =
  "press-row group flex flex-1 flex-row items-start gap-4 p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset sm:flex-col sm:items-stretch sm:gap-0 sm:p-0";

const photoFrameClass =
  "relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-surface-subtle sm:aspect-[16/10] sm:h-auto sm:w-full sm:rounded-none";

const photoClass =
  "object-cover transition-[opacity,transform] duration-(--dur-slow) ease-(--ease-out-calm) sm:group-hover:scale-[1.03] motion-reduce:transform-none motion-reduce:transition-none";

function CardFooter({ readMinutes, audioMinutes, lang, actionLabel }: Pick<TopicCardProps, "readMinutes" | "audioMinutes" | "lang" | "actionLabel">) {
  return (
    <div className="mt-auto pt-2 sm:pt-4">
      <TopicMetaBadge readMinutes={readMinutes} audioMinutes={audioMinutes} compact bordered={false} lang={lang} />
      <span className="sr-only">{actionLabel}</span>
    </div>
  );
}

function TopicCard(props: TopicCardProps & { priority?: boolean }) {
  const { topic, href, priority = false } = props;
  return (
    <article className={cardShellClass}>
      <Link href={href} className={cardMainLinkClass}>
        <div className={photoFrameClass}>
          <Image
            src={topic.image}
            alt=""
            fill
            priority={priority}
            sizes="(max-width: 639px) 80px, (max-width: 1024px) 50vw, 25vw"
            className={photoClass}
          />
        </div>

        <div className="flex min-w-0 flex-1 flex-col sm:p-6">
          <h3 className="text-title font-semibold leading-snug text-foreground text-balance transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] group-hover:text-sapphire motion-reduce:transition-none">
            {topic.title}
          </h3>
          <p className="mt-1.5 text-body text-muted-foreground text-pretty sm:mt-2">{topic.description}</p>

          <CardFooter {...props} />
        </div>
      </Link>
    </article>
  );
}
