"use client";

import { useMemo, type CSSProperties } from "react";
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
} from "@/lib/i18n/health-information-topics";
import { TopicMetaBadge } from "./TopicMetaBadge";
import { openSmartSearch } from "@/components/search/smart-search-events";
import { getSmartSearchCopy } from "@/lib/i18n/smart-search-copy";

export type { TopicItem };
export { getHealthTopicsList, HEALTH_TOPICS_LIST };

export interface HealthInformationTopicGridProps {
  /** Legacy filter prop kept optional for compatibility; all 8 guides and tools are shown. */
  initialCategory?: string;
  className?: string;
  onOpenDictionary?: () => void;
}

const TOOL_LABELS_BY_SLUG: Record<string, Record<Lang, string>> = {
  "heart-health": {
    ro: "Simulator tensiune arterială",
    en: "Blood pressure check",
    sq: "Kontrolli i tensionit",
    it: "Controllo della pressione",
    hr: "Provjera krvnog tlaka",
    rom: "Dikhiben e ratesko presia",
    ru: "Проверка давления",
  },
  diabetes: {
    ro: "Calculator glicemie și farfurie",
    en: "Glucose and plate check",
    sq: "Kontrolli i glicemisë dhe pjatës",
    it: "Controllo glicemia e piatto",
    hr: "Provjera glukoze i tanjura",
    rom: "Dikhiben e guglimasko",
    ru: "Глюкоза и тарелка",
  },
  "healthy-eating": {
    ro: "Calculator de sare",
    en: "Salt calculator",
    sq: "Llogaritësi i kripës",
    it: "Calcolatore del sale",
    hr: "Kalkulator soli",
    rom: "Kalkulatoro e lonesko",
    ru: "Калькулятор соли",
  },
  "physical-activity": {
    ro: "Planificator de mișcare",
    en: "Activity planner",
    sq: "Planifikuesi i lëvizjes",
    it: "Pianificatore di movimento",
    hr: "Planer kretanja",
    rom: "Plano e miškipnasko",
    ru: "План движения",
  },
  "mental-wellbeing": {
    ro: "Exercițiu de respirație",
    en: "Breathing pacer",
    sq: "Ushtrimi i frymëmarrjes",
    it: "Guida alla respirazione",
    hr: "Vodič disanja",
    rom: "Phurdipen thaj relaksacia",
    ru: "Дыхательное упражнение",
  },
  smoking: {
    ro: "Calculator renunțare la fumat",
    en: "Smoking coach",
    sq: "Mbështetje për lënien e duhanit",
    it: "Supporto per smettere di fumare",
    hr: "Podrška za prestanak pušenja",
    rom: "Ažutipen te mekes o duvano",
    ru: "Помощник отказа от курения",
  },
  "preventive-screening": {
    ro: "Selector analize preventive",
    en: "Screening selector",
    sq: "Zgjedhësi i kontrolleve",
    it: "Selettore screening",
    hr: "Odabir preventivnih pregleda",
    rom: "Alosaripen e kontrolengo",
    ru: "Выбор обследований",
  },
  "womens-health": {
    ro: "Ghid interactiv sănătatea femeii",
    en: "Women's health check",
    sq: "Kontrolli i shëndetit të gruas",
    it: "Controllo salute della donna",
    hr: "Provjera zdravlja žena",
    rom: "Dikhiben sastipen e džuvljengo",
    ru: "Женское здоровье",
  },
};

const LIBRARY_COPY: Record<
  Lang,
  {
    dictionary: string;
    title: string;
    firstStepLabel: string;
    defaultToolLabel: string;
  }
> = {
  ru: {
    dictionary: "Словарь",
    title: "Путеводители и самопроверка",
    firstStepLabel: "Первый практический шаг",
    defaultToolLabel: "Открыть инструмент",
  },
  ro: {
    dictionary: "Dicționar medical",
    title: "Ghiduri și exerciții practice",
    firstStepLabel: "Primul pas practic",
    defaultToolLabel: "Deschide exercițiul",
  },
  en: {
    dictionary: "Medical dictionary",
    title: "Guides and interactive tools",
    firstStepLabel: "Practical first step",
    defaultToolLabel: "Open interactive tool",
  },
  sq: {
    dictionary: "Fjalori mjekësor",
    title: "Udhëzues dhe ushtrime",
    firstStepLabel: "Hapi i parë praktik",
    defaultToolLabel: "Hap mjetin praktik",
  },
  it: {
    dictionary: "Dizionario medico",
    title: "Guide e strumenti pratici",
    firstStepLabel: "Primo passo pratico",
    defaultToolLabel: "Apri strumento pratico",
  },
  hr: {
    dictionary: "Medicinski rječnik",
    title: "Vodiči i praktični alati",
    firstStepLabel: "Prvi praktični korak",
    defaultToolLabel: "Otvori praktični alat",
  },
  rom: {
    dictionary: "Doktorengo lavustik",
    title: "Sikavimata thaj praktikane buća",
    firstStepLabel: "Angluno praktikano paso",
    defaultToolLabel: "Putar o instrumenti",
  },
};

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
  toolLabel: string;
  actionLabel: string;
  lang: Lang;
};

const cardShellClass =
  "card-interactive flex w-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-(--shadow-card-rest) motion-reduce:transition-none";

const cardMainLinkClass =
  "press-row group flex flex-1 flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset";

const photoClass =
  "object-cover transition-opacity duration-(--dur-base) ease-(--ease-out-calm) motion-reduce:transition-none";

function CardFooter({ readMinutes, audioMinutes, lang, actionLabel }: Pick<TopicCardProps, "readMinutes" | "audioMinutes" | "lang" | "actionLabel">) {
  return (
    <div className="mt-auto pt-4">
      <TopicMetaBadge readMinutes={readMinutes} audioMinutes={audioMinutes} compact bordered={false} lang={lang} />
      <span className="sr-only">{actionLabel}</span>
    </div>
  );
}

function TopicCard(props: TopicCardProps & { priority?: boolean }) {
  const { topic, href, toolLabel, priority = false } = props;
  return (
    <article className={cardShellClass}>
      <Link href={href} className={cardMainLinkClass}>
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-surface-subtle">
          <Image
            src={topic.image}
            alt=""
            fill
            priority={priority}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
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

      <div className="border-t border-border/80 bg-surface-subtle/50 px-5 py-2.5 sm:px-6">
        <Link
          href={`${href}#section-explainer`}
          className="press-row inline-flex min-h-11 w-full items-center justify-between gap-2 text-body font-semibold text-sapphire transition-colors duration-(--dur-fast) ease-(--ease-out-calm) motion-reduce:transition-none hover:text-sapphire-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:text-sapphire-border"
        >
          <span className="min-w-0 text-pretty">{toolLabel}</span>
          <ArrowRightIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
