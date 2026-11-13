"use client";

import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRightIcon, CheckIcon, ClockIcon, CloseIcon, PinIcon, StethoscopeIcon } from "@/components/ui/icons";
import {
  ALL_ALBANIA,
  ALL_CROATIA,
  ALL_ITALY,
  ALL_MOLDOVA,
  EXTRA_MAP_COPY,
  isAlbanianCounty,
  isCroatianCounty,
  isItalianRegion,
  isMoldovanOnlyRegion,
} from "@/components/ui/RomaniaCountyMap";
import { countyLabel, formatNewsDate, placeName, resolveNewsBasePath } from "@/components/news/news-format";
import { useSheetDialog } from "@/components/news/use-sheet-dialog";
import { cn } from "@/lib/cn";
import {
  ALBANIA_WIDE,
  CROATIA_WIDE,
  ITALY_WIDE,
  MOLDOVA_WIDE,
  articleCountry,
  isCountryWide,
  isNationalCounty,
  type NewsArticle,
  type NewsCategory,
  type NewsCountry,
} from "@/lib/data/news";
import { useLanguage } from "@/lib/i18n/language-context";
import { withLangPrefix } from "@/lib/i18n/routing";
import { translations, type Lang } from "@/lib/i18n/translations";

function useSafeLanguage() {
  try {
    return useLanguage();
  } catch {
    return { lang: "ro" as Lang, t: translations.ro, setLang: () => {} };
  }
}

const COPY: Record<Lang, {
  close: string;
  tabsLabel: string;
  local: string;
  national: string;
  count: (n: number) => string;
  noLocal: (place: string) => string;
  highAlert: string;
  seasonalAlert: string;
  measures: string;
  readGuide: string;
  freeServices: string;
  readTime: string;
  read: string;
  where: string;
  when: string;
}> = {
  ru: {
    close: "Закрыть",
    tabsLabel: "Типы новостей",
    local: "Местный",
    national: "Вся страна",
    count: (n) => (n === 1 ? "1 news item" : `${n} новости`),
    noLocal: (p) => `Нет новостей для ${p} еще. Ниже новости по всей стране.`,
    highAlert: "Оповещение о здоровье",
    seasonalAlert: "Сезонное предупреждение",
    measures: "Как защитить себя:",
    readGuide: "Подробнее",
    freeServices: "Бесплатные услуги:",
    readTime: "минута чтения",
    read: "Читать",
    where: "Где",
    when: "Часы",
  },

  ro: {
    close: "Închide",
    tabsLabel: "Tipuri de știri",
    local: "Local",
    national: "Din toată țara",
    count: (n) => (n === 1 ? "1 știre" : n % 100 === 0 || n % 100 >= 20 ? `${n} de știri` : `${n} știri`),
    noLocal: (p) => `Încă nu avem știri pentru ${p}. Mai jos sunt știrile din toată țara.`,
    highAlert: "Alertă de sănătate",
    seasonalAlert: "Avertizare de sezon",
    measures: "Cum te protejezi:",
    readGuide: "Citește tot",
    freeServices: "Servicii gratuite:",
    readTime: "min lectură",
    read: "Citește",
    where: "Unde",
    when: "Program",
  },
  en: {
    close: "Close",
    tabsLabel: "Types of news",
    local: "Local",
    national: "Whole country",
    count: (n) => (n === 1 ? "1 news item" : `${n} news items`),
    noLocal: (p) => `No news for ${p} yet. Below is news for the whole country.`,
    highAlert: "Health alert",
    seasonalAlert: "Seasonal warning",
    measures: "How to protect yourself:",
    readGuide: "Read more",
    freeServices: "Free services:",
    readTime: "min read",
    read: "Read",
    where: "Where",
    when: "Hours",
  },
  sq: {
    close: "Mbyll",
    tabsLabel: "Llojet e lajmeve",
    local: "Lokale",
    national: "Gjithë vendi",
    count: (n) => (n === 1 ? "1 lajm" : `${n} lajme`),
    noLocal: (p) => `Ende nuk ka lajme për ${p}. Më poshtë janë lajmet për gjithë vendin.`,
    highAlert: "Alarm shëndetësor",
    seasonalAlert: "Paralajmërim stinor",
    measures: "Si të mbrohesh:",
    readGuide: "Lexo më shumë",
    freeServices: "Shërbime falas:",
    readTime: "min lexim",
    read: "Lexo",
    where: "Ku",
    when: "Orari",
  },
  it: {
    close: "Chiudi",
    tabsLabel: "Tipi di notizie",
    local: "Locali",
    national: "Tutto il paese",
    count: (n) => (n === 1 ? "1 notizia" : `${n} notizie`),
    noLocal: (p) => `Non ci sono ancora notizie per ${p}. Qui sotto trovi quelle di tutto il paese.`,
    highAlert: "Allerta sanitaria",
    seasonalAlert: "Avviso di stagione",
    measures: "Come proteggerti:",
    readGuide: "Leggi tutto",
    freeServices: "Servizi gratuiti:",
    readTime: "min di lettura",
    read: "Leggi",
    where: "Dove",
    when: "Orario",
  },
  hr: {
    close: "Zatvori",
    tabsLabel: "Vrste vijesti",
    local: "Lokalno",
    national: "Cijela zemlja",
    count: (n) => (n % 10 === 1 && n % 100 !== 11 ? `${n} obavijest` : `${n} obavijesti`),
    noLocal: (p) => `Trenutačno nema posebnih lokalnih vijesti za područje ${p}. U nastavku su obavijesti za cijelu zemlju.`,
    highAlert: "Zdravstveno upozorenje",
    seasonalAlert: "Sezonsko upozorenje",
    measures: "Kako se zaštititi:",
    readGuide: "Pročitaj više",
    freeServices: "Besplatne usluge:",
    readTime: "min čitanja",
    read: "Pročitaj",
    where: "Gdje",
    when: "Radno vrijeme",
  },
  rom: {
    close: "Phandav",
    tabsLabel: "Tipurya nevimatenge",
    local: "Lokalno",
    national: "And-o sasto them",
    count: (n) => (n === 1 ? "1 nevimos" : `${n} nevimata`),
    noLocal: (p) => `Inke na si amen lokalne nevimata vash ${p}. Tele si e nevimata vash o sasto them.`,
    highAlert: "Sastipnaski alerta",
    seasonalAlert: "Sezonosko phenimos",
    measures: "Sar te arakhes tut:",
    readGuide: "Ginav may but",
    freeServices: "Bi lovengo serviciye:",
    readTime: "min ginavimos",
    read: "Ginav",
    where: "Kaj",
    when: "Chasurya",
  },
};

type TabKey = "all" | NewsCategory;

const isAlert = (a: NewsArticle) => a.category === "Alerte locale" && Boolean(a.epidemicSeverity);
/** Alerts first, then the rest in their original order. */
const alertsFirst = (list: NewsArticle[]) => [...list.filter(isAlert), ...list.filter((a) => !isAlert(a))];

export type PlaceNewsModalProps = {
  /** The chosen place: a county, raion, županija, region, or country-wide sentinel. Null keeps it closed. */
  place: string | null;
  /** Optional explicit country context (disambiguates shared names such as "Călărași"). */
  countryHint?: NewsCountry;
  /** Articles already localized for the active language. */
  articles: NewsArticle[];
  onClose: () => void;
};

/** The country a chosen place belongs to. */
export function placeCountry(place: string, countryHint?: NewsCountry): NewsCountry {
  if (countryHint) return countryHint;
  if (place === ALL_ITALY || isItalianRegion(place)) return "it";
  if (place === ALL_CROATIA || isCroatianCounty(place)) return "hr";
  if (place === ALL_ALBANIA || isAlbanianCounty(place)) return "al";
  if (place === ALL_MOLDOVA || isMoldovanOnlyRegion(place)) return "md";
  return "ro";
}

/** True when the place is a whole country (all of Romania, Moldova, Albania, Croatia, or Italy). */
export function isWholeCountry(place: string): boolean {
  return (
    place === ALL_ITALY ||
    place === ALL_MOLDOVA ||
    place === ALL_CROATIA ||
    place === ALL_ALBANIA ||
    isNationalCounty(place)
  );
}

/**
 * What a place's news is: its own items first, then that country's nationwide items, each once.
 * Items from other countries never appear.
 */
export function newsForPlace(place: string, articles: NewsArticle[], countryHint?: NewsCountry) {
  const targetCountry = placeCountry(place, countryHint);
  const pool = articles.filter((a) => articleCountry(a) === targetCountry);
  if (isWholeCountry(place)) return { local: alertsFirst(pool), national: [] as NewsArticle[] };
  return {
    local: alertsFirst(pool.filter((a) => a.county === place)),
    national: alertsFirst(pool.filter(isCountryWide)),
  };
}

/**
 * PlaceNewsModal: the news for one county, raion, županija, region, or the whole country.
 * Category tabs with counts (empty ones hidden), alerts first, then articles.
 */
export function PlaceNewsModal({ place, countryHint, articles, onClose }: PlaceNewsModalProps) {
  const { lang, t } = useSafeLanguage();
  const pathname = usePathname();
  const basePath = resolveNewsBasePath(pathname);
  const np = t.newsPage;
  const c = COPY[lang] ?? COPY.ro;
  const extra = EXTRA_MAP_COPY[lang] ?? EXTRA_MAP_COPY.ro;
  const open = place !== null;
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [tab, setTab] = useState<TabKey>("all");
  const [tabPlace, setTabPlace] = useState(place);
  if (tabPlace !== place) {
    setTabPlace(place);
    setTab("all");
  }

  const categoryLabels: Record<NewsCategory, string> = {
    "Alerte locale": np.categories.epidemics,
    "Caravane medicale": np.categories.caravan,
    "Campanii de vaccinare": np.categories.vaccinationCampaigns,
    "Sfaturi de sezon": np.categories.seasonalAdvice,
  };

  const groups = useMemo(
    () => (place ? newsForPlace(place, articles, countryHint) : { local: [], national: [] }),
    [place, articles, countryHint],
  );
  const all = useMemo(() => [...groups.local, ...groups.national], [groups]);
  const tabs = useMemo(() => {
    const order: NewsCategory[] = ["Alerte locale", "Caravane medicale", "Campanii de vaccinare", "Sfaturi de sezon"];
    return [
      { key: "all" as TabKey, label: np.categories.all, count: all.length },
      ...order
        .map((cat) => ({ key: cat as TabKey, label: categoryLabels[cat], count: all.filter((a) => a.category === cat).length }))
        .filter((x) => x.count > 0),
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [all, np]);

  useSheetDialog(open, panelRef, onClose);

  useEffect(() => {
    listRef.current?.scrollTo({ top: 0 });
  }, [tab]);

  if (!place || typeof document === "undefined") return null;

  const targetCountry = placeCountry(place, countryHint);
  const title = isNationalCounty(place)
    ? np.allCounties
    : place === ALL_ITALY
      ? (t.countyMap?.allItaly ?? place)
      : place === ALL_MOLDOVA
        ? extra.allMoldova
        : place === ALL_CROATIA
          ? extra.allCroatia
          : place === ALL_ALBANIA
            ? extra.allAlbania
            : countyLabel(place, lang, targetCountry);

  const noteName =
    place === ALL_ITALY
      ? (t.countyMap?.italy ?? place)
      : place === ALL_MOLDOVA
        ? extra.moldova
        : place === ALL_CROATIA
          ? extra.croatia
          : place === ALL_ALBANIA
            ? extra.albania
            : placeName(place, lang);

  const inTab = (list: NewsArticle[]) => (tab === "all" ? list : list.filter((a) => a.category === tab));
  const local = inTab(groups.local);
  const national = inTab(groups.national);
  const showHeadings = groups.local.length > 0 && groups.national.length > 0 && local.length > 0 && national.length > 0;
  const tabId = (key: TabKey) => `${titleId}-tab-${key.replace(/\s+/g, "-")}`;
  const panelId = `${titleId}-panel`;

  function onTabKeyDown(event: React.KeyboardEvent<HTMLButtonElement>, index: number) {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    event.preventDefault();
    const next = (index + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length;
    setTab(tabs[next].key);
    document.getElementById(tabId(tabs[next].key))?.focus();
  }

  const placeIsNational = isWholeCountry(place);
  const allItalyLabel = t.countyMap?.allItaly ?? ITALY_WIDE;
  const itemProps = {
    labels: categoryLabels,
    c,
    lang,
    np,
    basePath,
    allItalyLabel,
    allMoldovaLabel: extra.allMoldova,
    allCroatiaLabel: extra.allCroatia,
    allAlbaniaLabel: extra.allAlbania,
    showCategory: tab === "all",
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="fixed inset-x-0 top-(--sheet-vv-top,0px) z-[80] flex h-(--sheet-vv-height,100dvh) items-end justify-center sm:inset-0 sm:h-auto sm:items-center sm:p-4"
    >
      <div className="news-sheet-backdrop fixed inset-0 -z-10 bg-slate-950/55" onClick={onClose} aria-hidden="true" />

      <div
        ref={panelRef}
        tabIndex={-1}
        className="news-sheet relative flex max-h-[min(92dvh,calc(var(--sheet-vv-height,100dvh)-0.75rem))] w-full max-w-2xl flex-col overflow-hidden rounded-t-xl bg-card text-foreground shadow-[0_24px_48px_-12px_rgb(15_23_42/0.25)] sm:max-h-[min(85dvh,calc(var(--sheet-vv-height,100dvh)-2rem))] sm:rounded-xl focus:outline-none"
      >
        <div className="shrink-0 border-b border-border px-5 pt-5 sm:px-7 sm:pt-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h2 id={titleId} className="text-xl font-semibold tracking-tight text-balance">
                {title}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground tabular-nums">{c.count(all.length)}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label={c.close}
              className="-mr-2 -mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors duration-[var(--dur-fast)] hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <CloseIcon className="h-5 w-5" />
            </button>
          </div>

          {all.length > 0 && (
            <div role="tablist" aria-label={c.tabsLabel} className="-mx-5 mt-4 flex gap-6 overflow-x-auto px-5 no-scrollbar sm:-mx-7 sm:px-7">
              {tabs.map((x, i) => {
                const selected = tab === x.key;
                return (
                  <button
                    key={x.key}
                    id={tabId(x.key)}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    aria-controls={panelId}
                    tabIndex={selected ? 0 : -1}
                    onClick={() => setTab(x.key)}
                    onKeyDown={(e) => onTabKeyDown(e, i)}
                    className={cn(
                      "relative flex min-h-[44px] shrink-0 items-center gap-1.5 whitespace-nowrap text-sm font-medium transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm",
                      selected ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {x.label}
                    <span
                      className={cn(
                        "text-xs tabular-nums transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)]",
                        selected ? "font-semibold text-foreground/75" : "text-muted-foreground/80",
                      )}
                    >
                      {x.count}
                    </span>
                    {selected && <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-0.5 bg-foreground" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div
          ref={listRef}
          id={panelId}
          role={all.length > 0 ? "tabpanel" : undefined}
          aria-labelledby={all.length > 0 ? tabId(tab) : undefined}
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-6 pt-2 sm:px-7"
        >
          {all.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-base font-semibold">{np.emptyTitle}</p>
              <p className="mt-1 text-sm text-muted-foreground">{np.emptySubtitle}</p>
            </div>
          ) : (
            <>
              {groups.local.length === 0 && tab === "all" && (
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{c.noLocal(noteName)}</p>
              )}
              {local.length > 0 && (
                <NewsList heading={showHeadings ? c.local : undefined} items={local} showRegion={placeIsNational} {...itemProps} />
              )}
              {national.length > 0 && (
                <NewsList heading={showHeadings ? c.national : undefined} items={national} showRegion={false} {...itemProps} />
              )}
            </>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}

type ItemProps = {
  labels: Record<NewsCategory, string>;
  c: (typeof COPY)[Lang];
  lang: Lang;
  np: (typeof translations)["ro"]["newsPage"];
  basePath: "/news" | "/stiri";
  showCategory: boolean;
  showRegion: boolean;
  allItalyLabel: string;
  allMoldovaLabel: string;
  allCroatiaLabel: string;
  allAlbaniaLabel: string;
};

function NewsList({ heading, items, ...rest }: ItemProps & { heading?: string; items: NewsArticle[] }) {
  return (
    <section className="mt-5 first:mt-3">
      {heading && (
        <h3 className="mb-1 flex items-baseline gap-2 text-[13px] font-semibold text-foreground">
          {heading}
          <span className="font-normal text-muted-foreground tabular-nums">{items.length}</span>
        </h3>
      )}
      <ul className="space-y-1">
        {items.map((a) => (
          <li key={a.id}>{isAlert(a) ? <AlertItem article={a} {...rest} /> : <ArticleItem article={a} {...rest} />}</li>
        ))}
      </ul>
    </section>
  );
}

function Meta({
  article: a,
  labels,
  c,
  lang,
  np,
  showCategory,
  showRegion,
  allItalyLabel,
  allMoldovaLabel,
  allCroatiaLabel,
  allAlbaniaLabel,
  lead,
}: ItemProps & { article: NewsArticle; lead?: React.ReactNode }) {
  const date = formatNewsDate(a.date, lang, { short: true, year: false });
  const ac = articleCountry(a);
  const region =
    a.county === ITALY_WIDE && ac === "it"
      ? allItalyLabel
      : a.county === MOLDOVA_WIDE && ac === "md"
        ? allMoldovaLabel
        : a.county === CROATIA_WIDE && ac === "hr"
          ? allCroatiaLabel
          : a.county === ALBANIA_WIDE && ac === "al"
            ? allAlbaniaLabel
            : isNationalCounty(a.county)
              ? np.allCounties
              : placeName(a.county, lang);
  return (
    <p className="flex flex-wrap items-center gap-x-1.5 text-xs text-muted-foreground tabular-nums">
      {lead ?? (showCategory && <span className="font-semibold text-foreground/80">{labels[a.category] ?? a.category}</span>)}
      {(lead || showCategory) && <span aria-hidden="true" className="inline-block h-3 w-px bg-border" />}
      {showRegion && (
        <>
          <span>{region}</span>
          <span aria-hidden="true" className="inline-block h-3 w-px bg-border" />
        </>
      )}
      <time dateTime={a.date}>{date}</time>
      <span aria-hidden="true" className="inline-block h-3 w-px bg-border" />
      <span>
        {a.readTimeMinutes} {c.readTime}
      </span>
    </p>
  );
}

function ArticleItem(props: ItemProps & { article: NewsArticle }) {
  const { article: a, c, lang, basePath } = props;
  const caravan = a.category === "Caravane medicale" ? a.caravanDetails : undefined;
  return (
    <article className="group relative -mx-3 rounded-xl px-3 py-3.5 transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-muted/50 has-[a:focus-visible]:bg-muted/50">
      <Meta {...props} />
      <h4 lang={a.language} className="mt-1.5 text-base font-semibold leading-snug tracking-tight text-pretty">
        <Link
          href={withLangPrefix(`${basePath}/${a.slug}`, lang)}
          className="outline-none after:absolute after:inset-0 after:rounded-xl focus-visible:after:ring-2 focus-visible:after:ring-ring"
        >
          {a.title}
        </Link>
      </h4>
      <p lang={a.language} className="mt-1 text-sm leading-relaxed text-muted-foreground text-pretty">{a.summary}</p>

      {caravan && (
        <dl lang={a.language} className="mt-2.5 space-y-1 text-sm text-foreground">
          <div className="flex items-start gap-2">
            <dt className="sr-only">{c.where}</dt>
            <PinIcon aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <dd>
              <span className="font-medium">{caravan.village}</span>
              <span className="text-muted-foreground">, {caravan.landmark}</span>
            </dd>
          </div>
          <div className="flex items-start gap-2">
            <dt className="sr-only">{c.when}</dt>
            <ClockIcon aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <dd className="tabular-nums">{caravan.hours}</dd>
          </div>
          {caravan.freeServices.length > 0 && (
            <div className="text-muted-foreground">
              <dt className="inline">{c.freeServices}</dt> <dd className="inline">{caravan.freeServices.join(", ")}</dd>
            </div>
          )}
        </dl>
      )}

      <div className="mt-3 flex justify-end text-xs">
        <span aria-hidden="true" className="inline-flex shrink-0 items-center gap-1 font-semibold text-sapphire dark:text-sapphire-border">
          {c.read}
          <ArrowRightIcon className="h-3.5 w-3.5 transition-transform duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] group-hover:translate-x-0.5 motion-reduce:transition-none" />
        </span>
      </div>
    </article>
  );
}

function AlertItem(props: ItemProps & { article: NewsArticle }) {
  const { article: a, c, lang, np, basePath } = props;
  const high = a.epidemicSeverity === "high";
  const href = withLangPrefix(`${basePath}/${a.slug}`, lang);
  const tone = high
    ? { surface: "bg-amber-care-soft/70 dark:bg-amber-care/10", label: "text-amber-care dark:text-amber-care-border", icon: "text-amber-care dark:text-amber-care-border", rule: "border-amber-care/20" }
    : { surface: "bg-muted/60", label: "text-foreground", icon: "text-sapphire dark:text-sapphire-border", rule: "border-border" };

  return (
    <article className={cn("my-2 rounded-xl p-4 sm:p-5", tone.surface)}>
      <Meta
        {...props}
        lead={
          <span className={cn("font-semibold", tone.label)}>
            {high ? c.highAlert : c.seasonalAlert}
          </span>
        }
      />
      <h4 lang={a.language} className="mt-2 text-[17px] font-semibold leading-snug tracking-tight text-foreground text-pretty">
        <Link href={href} className="rounded-sm underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          {a.title}
        </Link>
      </h4>
      <p lang={a.language} className="mt-1 text-sm leading-relaxed text-foreground/80 text-pretty">{a.summary}</p>

      {a.preventiveSteps && a.preventiveSteps.length > 0 && (
        <>
          <p className="mt-4 text-xs font-semibold text-foreground">{c.measures}</p>
          <ul lang={a.language} className="mt-2 space-y-1.5 text-sm text-foreground">
            {a.preventiveSteps.map((step, i) => (
              <li key={i} className="flex items-start gap-2">
                <CheckIcon aria-hidden="true" className={cn("mt-0.5 h-4 w-4 shrink-0", tone.icon)} />
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </>
      )}

      <div className={cn("mt-4 border-t pt-3", tone.rule)}>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={withLangPrefix("/medic-online", lang)}
            className="inline-flex min-h-[44px] items-center gap-1.5 whitespace-nowrap rounded-lg bg-card px-3 text-xs font-semibold text-sapphire shadow-[0_1px_2px_rgb(15_23_42/0.08)] transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-sapphire-soft dark:text-sapphire-border dark:hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <StethoscopeIcon aria-hidden="true" className="h-4 w-4 shrink-0" />
            {np.handoverTelemed}
          </Link>
          <Link
            href={href}
            className="group inline-flex min-h-[44px] items-center gap-1 whitespace-nowrap rounded-lg px-2 text-xs font-semibold text-foreground transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:text-sapphire dark:hover:text-sapphire-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {c.readGuide}
            <ArrowRightIcon aria-hidden="true" className="h-3.5 w-3.5 shrink-0 transition-transform duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] group-hover:translate-x-0.5 motion-reduce:transition-none" />
          </Link>
        </div>
      </div>
    </article>
  );
}
