"use client";

import {
  type ComponentType,
  type KeyboardEvent as ReactKeyboardEvent,
  type CSSProperties,
  type SVGProps,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "motion/react";
import {
  ActivityIcon,
  ArrowRightIcon,
  ChevronDownIcon,
  ClockIcon,
  CloseIcon,
  HandHelpingIcon,
  PhoneIcon,
  PinIcon,
  PrescriptionIcon,
  SearchIcon,
  VolumeIcon,
  VolumeMuteIcon,
} from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import { useLanguage } from "@/lib/i18n/language-context";
import { withLangPrefix } from "@/lib/i18n/routing";
import { useReadingLevel } from "@/lib/comfort-preferences";
import { DURATION, ENTRANCE_OFFSET_PX, useCalmReducedMotion } from "@/lib/motion/tokens";
import { toSentences, useSpeech } from "@/components/landing/hero/use-speech";
import { isVoiceEnabled } from "@/lib/audio/voice-availability";
import { scrollExpandedIntoModalView, useSheetDialog } from "@/components/news/use-sheet-dialog";
import {
  SMART_SEARCH_OPEN_EVENT,
  type SmartSearchOpenDetail,
} from "@/components/search/smart-search-events";
import {
  getSmartSearchCopy,
  type GuidedJourneyId,
  type SmartSearchCategory,
} from "@/lib/i18n/smart-search-copy";
import {
  getContextualSuggestions,
  searchSmartCatalog,
  type SmartSearchResult,
} from "@/lib/search/smart-search-engine";

const RECENT_SEARCHES_KEY = "redihealth-smart-search-recent";
const MAX_RECENT_SEARCHES = 5;
const CATEGORY_ORDER: SmartSearchCategory[] = [
  "all",
  "tools",
  "guides",
  "glossary",
  "myths",
  "articles",
  "news",
];

const JOURNEY_ICONS: Record<GuidedJourneyId, ComponentType<SVGProps<SVGSVGElement>>> = {
  symptoms: ActivityIcon,
  care: PinIcon,
  meds: PrescriptionIcon,
  rights: HandHelpingIcon,
};

interface AiAnswerState {
  query: string;
  answer: string | null;
}

function isEditableElement(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
}

function readRecentSearches(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(RECENT_SEARCHES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item): item is string => typeof item === "string" && item.trim().length > 0)
      .slice(0, MAX_RECENT_SEARCHES);
  } catch {
    return [];
  }
}

function writeRecentSearches(items: string[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(items.slice(0, MAX_RECENT_SEARCHES)));
  } catch {
    // Ignore storage quota or private browsing errors
  }
}

export function SmartSearchModal() {
  const { lang } = useLanguage();
  const [rawReadingLevel] = useReadingLevel();
  const readingLevel = rawReadingLevel === "simple" ? "simple" : "standard";
  const reducedMotion = useCalmReducedMotion();
  const pathname = usePathname() || "/";
  const router = useRouter();
  const copy = useMemo(() => getSmartSearchCopy(lang), [lang]);
  const voiceEnabled = isVoiceEnabled(lang);
  const { available: canSpeak, speaking, speak, stop } = useSpeech(lang);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<SmartSearchCategory>("all");
  const [activeIndex, setActiveIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [expandedJourneyId, setExpandedJourneyId] = useState<GuidedJourneyId | null>(null);
  const [expandedOverview, setExpandedOverview] = useState(false);
  const [expandedResultId, setExpandedResultId] = useState<string | null>(null);
  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(null);
  const [speakingResultId, setSpeakingResultId] = useState<string | null>(null);
  const [aiState, setAiState] = useState<AiAnswerState>({ query: "", answer: null });

  const panelRef = useRef<HTMLDivElement>(null);
  const scrollBodyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const shouldRestoreFocusRef = useRef(true);
  const keyboardMoveRef = useRef(false);
  const lastExpandedControlIdRef = useRef<string | null>(null);
  const dialogTitleId = useId();
  const baseId = useId();

  const saveRecentSearch = useCallback((value: string) => {
    const cleaned = value.trim();
    if (cleaned.length < 2) return;
    setRecentSearches((prev) => {
      const next = [
        cleaned,
        ...prev.filter((item) => item.toLowerCase() !== cleaned.toLowerCase()),
      ].slice(0, MAX_RECENT_SEARCHES);
      writeRecentSearches(next);
      return next;
    });
  }, []);

  const clearRecentSearches = useCallback(() => {
    setRecentSearches([]);
    writeRecentSearches([]);
  }, []);

  const applyQuery = useCallback(
    (nextQuery: string, resetCategory = true) => {
      if (speaking) stop();
      setSpeakingResultId(null);
      setQuery(nextQuery);
      if (resetCategory) {
        setCategory("all");
      }
      setActiveIndex(0);
      setExpandedOverview(false);
      setExpandedResultId(null);
      setExpandedQuestionId(null);
    },
    [speaking, stop],
  );

  const handleOpen = useCallback((initialQuery?: string) => {
    shouldRestoreFocusRef.current = true;
    setRecentSearches(readRecentSearches());
    setExpandedJourneyId(null);
    setExpandedOverview(false);
    setExpandedResultId(null);
    setExpandedQuestionId(null);
    setActiveIndex(0);
    setCategory("all");
    if (typeof initialQuery === "string") {
      setQuery(initialQuery);
    }
    setOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    if (speaking) stop();
    setSpeakingResultId(null);
    setOpen(false);
  }, [speaking, stop]);

  useSheetDialog(open, panelRef, handleClose, inputRef, shouldRestoreFocusRef);

  useEffect(() => {
    const onOpenEvent = (event: Event) => {
      const customEvent = event as CustomEvent<SmartSearchOpenDetail>;
      handleOpen(customEvent.detail?.query);
    };

    const onGlobalKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        if (open) {
          handleClose();
        } else {
          handleOpen();
        }
        return;
      }

      if (
        !open &&
        event.key === "/" &&
        !event.metaKey &&
        !event.ctrlKey &&
        !event.altKey &&
        !event.shiftKey
      ) {
        const activeEl = document.activeElement;
        if (isEditableElement(activeEl)) return;
        if (activeEl?.closest('[role="dialog"][aria-modal="true"]')) return;
        event.preventDefault();
        handleOpen();
      }
    };

    window.addEventListener(SMART_SEARCH_OPEN_EVENT, onOpenEvent);
    window.addEventListener("keydown", onGlobalKeyDown);
    return () => {
      window.removeEventListener(SMART_SEARCH_OPEN_EVENT, onOpenEvent);
      window.removeEventListener("keydown", onGlobalKeyDown);
    };
  }, [open, handleOpen, handleClose]);

  const trimmedQuery = query.trim();

  const contextual = useMemo(
    () => getContextualSuggestions(pathname, lang),
    [pathname, lang],
  );

  const allCatalogResponse = useMemo(
    () =>
      searchSmartCatalog(query, {
        lang,
        category: "all",
        readingLevel,
        pathname,
        limit: 8,
      }),
    [query, lang, readingLevel, pathname],
  );

  useEffect(() => {
    if (!open || trimmedQuery.length < 3) return;
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      fetch("/api/smart-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          query: trimmedQuery,
          lang,
          pathname,
          readingLevel,
        }),
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data: { answer?: string | null } | null) => {
          if (controller.signal.aborted) return;
          setAiState({
            query: trimmedQuery,
            answer: typeof data?.answer === "string" && data.answer.trim() ? data.answer.trim() : null,
          });
        })
        .catch(() => {
          // Silently rely on deterministic catalog overview if remote AI summary fails
        });
    }, 320);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [open, trimmedQuery, lang, pathname, readingLevel]);

  // Flat Google-style autocomplete rows (recents first, then contextual/popular suggestions)
  const autocompleteRows = useMemo(() => {
    const rows: { query: string; isRecent: boolean }[] = [];
    const seen = new Set<string>();

    for (const item of recentSearches.slice(0, 2)) {
      const key = item.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        rows.push({ query: item, isRecent: true });
      }
    }

    for (const chip of contextual.chips) {
      if (rows.length >= 5) break;
      const key = chip.query.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        rows.push({ query: chip.query, isRecent: false });
      }
    }

    for (const popular of copy.popularQueries) {
      if (rows.length >= 5) break;
      const key = popular.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        rows.push({ query: popular, isRecent: false });
      }
    }

    return rows.slice(0, 5);
  }, [recentSearches, contextual.chips, copy.popularQueries]);

  const populatedCategories = useMemo(
    () =>
      CATEGORY_ORDER.filter(
        (cat) => cat !== "all" && (allCatalogResponse.groupedCounts[cat] ?? 0) > 0,
      ),
    [allCatalogResponse.groupedCounts],
  );

  const effectiveCategory: SmartSearchCategory =
    category !== "all" && (allCatalogResponse.groupedCounts[category] ?? 0) > 0
      ? category
      : "all";

  const catalogResponse = useMemo(
    () =>
      effectiveCategory === "all"
        ? allCatalogResponse
        : searchSmartCatalog(query, {
            lang,
            category: effectiveCategory,
            readingLevel,
            pathname,
            limit: 8,
          }),
    [effectiveCategory, allCatalogResponse, query, lang, readingLevel, pathname],
  );

  const showCategoryTabs =
    trimmedQuery.length > 0 && populatedCategories.length >= 1;

  const visibleTabs = useMemo<SmartSearchCategory[]>(
    () => ["all", ...populatedCategories],
    [populatedCategories],
  );

  const results = catalogResponse.results;
  const ghostSuffix = useMemo(() => {
    if (!trimmedQuery || !catalogResponse.ghostCompletion) return "";
    if (catalogResponse.ghostCompletion.toLowerCase().startsWith(query.toLowerCase())) {
      return catalogResponse.ghostCompletion.slice(query.length);
    }
    return "";
  }, [trimmedQuery, catalogResponse.ghostCompletion, query]);

  const activeAiAnswer =
    trimmedQuery.length > 0 && aiState.query === trimmedQuery ? aiState.answer : null;
  const overview = trimmedQuery.length > 0 ? catalogResponse.guidedOverview : null;
  const overviewBody = activeAiAnswer || overview?.lead || "";
  const hasOverviewDetails =
    Boolean(overview?.steps.length) ||
    Boolean(activeAiAnswer) ||
    catalogResponse.suggestedFollowups.length > 0;

  useEffect(() => {
    if (!open) return;
    scrollBodyRef.current?.scrollTo({ top: 0 });
  }, [open, trimmedQuery, effectiveCategory]);

  useEffect(() => {
    if (!open || !keyboardMoveRef.current) return;
    keyboardMoveRef.current = false;
    scrollBodyRef.current
      ?.querySelector<HTMLElement>(`[data-search-row="${activeIndex}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [open, activeIndex, trimmedQuery]);

  useEffect(() => {
    if (
      !open ||
      (!expandedJourneyId && !expandedOverview && !expandedResultId && !expandedQuestionId)
    ) {
      return;
    }
    const panel = panelRef.current;
    if (!panel) return;
    const controlId = lastExpandedControlIdRef.current;
    const targeted = controlId
      ? panel.querySelector<HTMLElement>(`[aria-controls="${controlId}"][aria-expanded="true"]`)
      : null;
    const fallbackTriggers = panel.querySelectorAll<HTMLElement>('[aria-expanded="true"]');
    const trigger = targeted ?? fallbackTriggers[fallbackTriggers.length - 1];
    if (!trigger) return;
    return scrollExpandedIntoModalView(trigger, panel);
  }, [open, expandedJourneyId, expandedOverview, expandedResultId, expandedQuestionId]);

  const unlockDocumentScroll = useCallback(() => {
    document.documentElement.style.overflow = "";
    document.documentElement.style.overscrollBehavior = "";
    document.body.style.overflow = "";
    document.body.style.overscrollBehavior = "";
  }, []);

  const handleFollowLink = useCallback(
    (href: string, shouldSaveQuery = false) => {
      if (shouldSaveQuery && trimmedQuery) {
        saveRecentSearch(trimmedQuery);
      }
      shouldRestoreFocusRef.current = false;
      unlockDocumentScroll();
      handleClose();
      const hashIdx = href.indexOf("#");
      if (hashIdx !== -1) {
        const targetId = href.slice(hashIdx + 1);
        window.requestAnimationFrame(() => {
          const targetEl = targetId ? document.getElementById(targetId) : null;
          targetEl?.scrollIntoView({
            behavior: reducedMotion ? "auto" : "smooth",
            block: "start",
          });
        });
      }
    },
    [trimmedQuery, saveRecentSearch, unlockDocumentScroll, handleClose, reducedMotion],
  );

  const navigateToResult = useCallback(
    (result: SmartSearchResult) => {
      handleFollowLink(result.href, true);
      router.push(result.href);
    },
    [handleFollowLink, router],
  );

  const handleToggleSpeech = useCallback(
    (result: SmartSearchResult) => {
      if (!canSpeak) return;
      if (speaking && speakingResultId === result.id) {
        stop();
        setSpeakingResultId(null);
        return;
      }
      if (speaking) stop();
      setSpeakingResultId(result.id);
      speak(toSentences([result.title, result.summary, ...result.nextSteps]));
    },
    [canSpeak, speaking, speakingResultId, stop, speak],
  );

  const handleInputKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    const listCount = trimmedQuery ? results.length : autocompleteRows.length;

    if (event.key === "ArrowDown" && listCount > 0) {
      event.preventDefault();
      keyboardMoveRef.current = true;
      setActiveIndex((prev) => (prev + 1) % listCount);
      return;
    }

    if (event.key === "ArrowUp" && listCount > 0) {
      event.preventDefault();
      keyboardMoveRef.current = true;
      setActiveIndex((prev) => (prev - 1 + listCount) % listCount);
      return;
    }

    if (event.key === "Tab" && ghostSuffix && !event.shiftKey) {
      event.preventDefault();
      applyQuery(`${query}${ghostSuffix}`, true);
      return;
    }

    if (
      event.key === "ArrowRight" &&
      ghostSuffix &&
      event.currentTarget.selectionStart === query.length &&
      event.currentTarget.selectionEnd === query.length
    ) {
      event.preventDefault();
      applyQuery(`${query}${ghostSuffix}`, true);
      return;
    }

    if (event.key === "Enter") {
      if (!trimmedQuery && autocompleteRows[activeIndex]) {
        event.preventDefault();
        applyQuery(autocompleteRows[activeIndex].query, true);
        return;
      }
      if (trimmedQuery && results[activeIndex]) {
        event.preventDefault();
        navigateToResult(results[activeIndex]);
      }
    }
  };

  if (!open || typeof document === "undefined") return null;

  const liveAnnouncement = !trimmedQuery
    ? copy.journeysHeading
    : results.length === 0
      ? copy.emptyTitle
      : `${results.length} ${results.length === 1 ? copy.resultsSingular : copy.resultsPlural}`;

  const assistantHref = withLangPrefix(
    trimmedQuery ? `/health-assistant?q=${encodeURIComponent(trimmedQuery)}` : "/health-assistant",
    lang,
  );

  const transitionClass = reducedMotion
    ? "transition-none"
    : "transition-[grid-template-rows,opacity] duration-[var(--dur-base)] ease-[var(--ease-out-calm)] motion-reduce:transition-none";

  const dialog = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={dialogTitleId}
      className="fixed inset-x-0 top-(--sheet-vv-top,0px) z-[90] flex h-(--sheet-vv-height,100dvh) items-end justify-center md:inset-0 md:h-auto md:items-start md:px-6 md:pt-14 lg:pt-18"
    >
      <div
        aria-hidden="true"
        onClick={handleClose}
        className="scrim-in fixed inset-0 -z-10 bg-ink-950/35"
      />

      <motion.div
        ref={panelRef}
        tabIndex={-1}
        initial={reducedMotion ? false : { opacity: 0, y: ENTRANCE_OFFSET_PX }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reducedMotion ? 0 : DURATION.slow, ease: [0.16, 1, 0.3, 1] }}
        className="mx-auto flex max-h-[92%] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl border border-ink-900/12 bg-white text-foreground shadow-[0_24px_64px_-16px_rgba(12,24,48,0.22)] md:max-h-[80vh] md:rounded-2xl dark:border-paper/15 dark:bg-ink-950 dark:text-paper"
      >
        <h2 id={dialogTitleId} className="sr-only">
          {copy.modalLabel}
        </h2>

        <div aria-live="polite" className="sr-only">
          {liveAnnouncement}
        </div>

        {/* Google-like search header bar */}
        <div className="shrink-0 border-b border-ink-900/10 px-4 py-2.5 dark:border-paper/10 sm:px-5">
          <div className="flex min-h-[48px] items-center gap-2.5 rounded-xl px-2.5 has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-2 has-[input:focus-visible]:outline-ring">
            <SearchIcon
              className="h-5 w-5 shrink-0 text-sapphire dark:text-sapphire-border"
              aria-hidden="true"
            />

            <div className="relative flex min-w-0 flex-1 items-center">
              {ghostSuffix ? (
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 flex items-center overflow-hidden pr-1 whitespace-pre text-[16px] leading-normal font-normal tracking-normal"
                >
                  <span className="invisible">{query}</span>
                  <span className="text-ink-900/35 dark:text-paper/35">{ghostSuffix}</span>
                </div>
              ) : null}

              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={(event) => {
                  const nextVal = event.target.value;
                  if (speaking) stop();
                  setSpeakingResultId(null);
                  setQuery(nextVal);
                  setCategory("all");
                  setActiveIndex(0);
                  setExpandedOverview(false);
                  setExpandedResultId(null);
                  setExpandedQuestionId(null);
                }}
                onKeyDown={handleInputKeyDown}
                placeholder={copy.inputPlaceholder}
                aria-label={copy.modalLabel}
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
                style={{ outline: "none" }}
                className="relative z-10 min-h-[44px] w-full bg-transparent pr-1 text-[16px] leading-normal font-normal tracking-normal text-foreground placeholder:text-ink-900/45 focus:outline-none focus-visible:outline-none dark:text-paper dark:placeholder:text-paper/45 [&::-webkit-search-cancel-button]:hidden"
              />
            </div>

            {query.length > 0 ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    applyQuery("", true);
                    inputRef.current?.focus();
                  }}
                  className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-lg px-2.5 text-xs font-medium whitespace-nowrap text-ink-900/60 transition-colors hover:bg-ink-900/[0.05] hover:text-foreground dark:text-paper/65 dark:hover:bg-paper/[0.08] dark:hover:text-paper"
                >
                  {copy.clearLabel}
                </button>
                <span
                  aria-hidden="true"
                  className="h-4 w-px shrink-0 bg-ink-900/12 dark:bg-paper/15"
                />
              </>
            ) : null}

            <button
              type="button"
              onClick={handleClose}
              aria-label={copy.closeLabel}
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-ink-900/60 transition-colors hover:bg-ink-900/[0.05] hover:text-foreground dark:text-paper/65 dark:hover:bg-paper/[0.08] dark:hover:text-paper"
            >
              <CloseIcon className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Progressive underline category filter bar (active whenever any category matches) */}
        {showCategoryTabs ? (
          <div
            role="tablist"
            aria-label={copy.modalLabel}
            className="flex shrink-0 items-center overflow-x-auto border-b border-ink-900/10 px-2 [scrollbar-width:none] dark:border-paper/10 sm:px-3 [&::-webkit-scrollbar]:hidden"
          >
            {visibleTabs.map((cat) => {
              const isSelected = effectiveCategory === cat;
              const count = allCatalogResponse.groupedCounts[cat] ?? 0;
              return (
                <button
                  key={cat}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => {
                    setCategory(cat);
                    setActiveIndex(0);
                    setExpandedOverview(false);
                    setExpandedResultId(null);
                    setExpandedQuestionId(null);
                  }}
                  className={cn(
                    // tab-ink: the marker under the chosen tab draws out from its centre; the label sits
                    // exactly over it (px-3 matches the marker's 0.75rem inset).
                    "tab-ink inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-md px-3 text-[13.5px] font-medium whitespace-nowrap transition-colors duration-(--dur-fast) ease-(--ease-out-calm) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring motion-reduce:transition-none",
                    isSelected
                      ? "text-sapphire dark:text-sapphire-border"
                      : "text-ink-900/60 hover:text-foreground dark:text-paper/65 dark:hover:text-paper",
                  )}
                >
                  <span>{copy.categories[cat]}</span>
                  <span className="text-xs font-normal tabular-nums text-ink-900/45 dark:text-paper/45">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        ) : null}

        {/* Single-column scrollable body */}
        <div
          ref={scrollBodyRef}
          data-modal-scroller="true"
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 pb-[calc(1.25rem+env(safe-area-inset-bottom))] sm:px-6"
        >
          {trimmedQuery.length === 0 ? (
            <div className="space-y-4">
              {/* Zero-keystroke Google autocomplete suggestions */}
              <section aria-label={contextual.contextLabel}>
                <div className="mb-1 flex min-h-[32px] items-center justify-between gap-2 px-2">
                  <p className="text-xs font-medium text-ink-900/55 dark:text-paper/55">
                    {recentSearches.length > 0 ? copy.recentSearchesLabel : contextual.contextLabel}
                  </p>
                  {recentSearches.length > 0 ? (
                    <button
                      type="button"
                      onClick={clearRecentSearches}
                      className="inline-flex min-h-11 items-center rounded-lg px-2 text-xs font-medium whitespace-nowrap text-ink-900/55 transition-colors hover:bg-ink-900/[0.04] hover:text-foreground dark:text-paper/60 dark:hover:bg-paper/[0.06] dark:hover:text-paper"
                    >
                      {copy.clearRecentLabel}
                    </button>
                  ) : null}
                </div>

                <ul className="space-y-0.5">
                  {autocompleteRows.map((row, idx) => {
                    const isHighlighted = activeIndex === idx;
                    const RowIcon = row.isRecent ? ClockIcon : SearchIcon;
                    return (
                      <li
                        key={`${row.isRecent ? "recent" : "suggest"}-${row.query}`}
                        className="list-in"
                        style={{ "--i": idx } as CSSProperties}
                      >
                        <button
                          type="button"
                          data-search-row={idx}
                          onMouseEnter={() => setActiveIndex(idx)}
                          onClick={() => {
                            applyQuery(row.query, true);
                            inputRef.current?.focus();
                          }}
                          className={cn(
                            "flex min-h-11 w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors",
                            isHighlighted
                              ? "bg-ink-900/[0.05] dark:bg-paper/[0.07]"
                              : "hover:bg-ink-900/[0.04] dark:hover:bg-paper/[0.05]",
                          )}
                        >
                          <RowIcon
                            className="h-4 w-4 shrink-0 text-ink-900/45 dark:text-paper/45"
                            aria-hidden="true"
                          />
                          <span className="min-w-0 flex-1 text-[15px] leading-snug text-foreground dark:text-paper">
                            {row.query}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </section>

              {/* Powered expandable Guided Pathways */}
              <section
                aria-labelledby={`${baseId}-journeys`}
                className="border-t border-ink-900/10 pt-3.5 dark:border-paper/10"
              >
                <p
                  id={`${baseId}-journeys`}
                  className="px-2 pb-1.5 text-xs font-medium text-ink-900/55 dark:text-paper/55"
                >
                  {copy.journeysHeading}
                </p>

                <div className="divide-y divide-ink-900/8 dark:divide-paper/10">
                  {copy.guidedJourneys.map((journey, journeyIdx) => {
                    const isExpanded = expandedJourneyId === journey.id;
                    const JourneyIcon = JOURNEY_ICONS[journey.id];
                    const panelId = `${baseId}-journey-${journey.id}`;

                    return (
                      <div
                        key={journey.id}
                        className="list-in"
                        style={{ "--i": autocompleteRows.length + journeyIdx } as CSSProperties}
                      >
                        <button
                          type="button"
                          aria-expanded={isExpanded}
                          aria-controls={panelId}
                          onClick={() => {
                            lastExpandedControlIdRef.current = panelId;
                            setExpandedJourneyId((prev) =>
                              prev === journey.id ? null : journey.id,
                            );
                          }}
                          className="flex min-h-[48px] w-full items-center justify-between gap-3 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-ink-900/[0.03] dark:hover:bg-paper/[0.05]"
                        >
                          <span className="flex min-w-0 flex-1 items-center gap-2.5">
                            <JourneyIcon
                              className="h-4 w-4 shrink-0 text-sapphire dark:text-sapphire-border"
                              aria-hidden="true"
                            />
                            <span className="min-w-0 text-[15px] leading-snug font-medium text-foreground dark:text-paper">
                              {journey.title}
                            </span>
                          </span>
                          <ChevronDownIcon
                            className={cn(
                              "h-4 w-4 shrink-0 text-ink-900/45 transition-transform duration-(--dur-base) ease-(--ease-out-calm) motion-reduce:transition-none dark:text-paper/45",
                              isExpanded && "rotate-180",
                            )}
                            aria-hidden="true"
                          />
                        </button>

                        <div
                          id={panelId}
                          className={cn(
                            "grid",
                            transitionClass,
                            isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                          )}
                        >
                          <div className="overflow-hidden" inert={!isExpanded}>
                            <div className="space-y-3 px-2.5 pt-0.5 pb-3.5 pl-9">
                              <p className="text-[14px] leading-relaxed text-ink-900/70 dark:text-paper/70">
                                {journey.summary}
                              </p>

                              <div className="flex flex-wrap gap-2">
                                {journey.queries.map((qItem) => (
                                  <button
                                    key={qItem.query}
                                    type="button"
                                    onClick={() => {
                                      applyQuery(qItem.query, true);
                                      inputRef.current?.focus();
                                    }}
                                    className="inline-flex min-h-11 items-center rounded-lg bg-ink-900/[0.04] px-3 text-[13.5px] font-medium whitespace-nowrap text-foreground transition-colors hover:bg-ink-900/[0.08] dark:bg-paper/[0.06] dark:text-paper dark:hover:bg-paper/[0.12]"
                                  >
                                    {qItem.label}
                                  </button>
                                ))}
                              </div>

                              <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
                                {journey.actions.map((action) => {
                                  const actionHref = withLangPrefix(action.href, lang);
                                  return (
                                    <Link
                                      key={action.href}
                                      href={actionHref}
                                      onClick={() => handleFollowLink(actionHref, false)}
                                      className="group inline-flex min-h-11 items-center gap-1.5 text-[13.5px] font-semibold whitespace-nowrap text-sapphire dark:text-sapphire-border"
                                    >
                                      <span className="link-draw">{action.label}</span>
                                      <ArrowRightIcon className="arrow-travel h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                                    </Link>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Immediate urgent 112 notice when serious symptoms detected */}
              {catalogResponse.isEmergency ? (
                <div
                  role="alert"
                  className="rounded-xl border border-rose-300 bg-rose-50/95 p-4 dark:border-rose-700/60 dark:bg-rose-950/45"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                      <p className="text-[15px] font-semibold text-rose-900 dark:text-rose-100">
                        {copy.emergencyTitle}
                      </p>
                      <p className="text-[13.5px] leading-relaxed text-rose-900/85 dark:text-rose-100/85">
                        {copy.emergencyBody}
                      </p>
                    </div>
                    <a
                      href="tel:112"
                      className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-rose-700 px-4 text-[14px] font-semibold whitespace-nowrap text-white transition-colors hover:bg-rose-800"
                    >
                      <PhoneIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
                      <span>{copy.emergencyCallLabel}</span>
                    </a>
                  </div>
                </div>
              ) : null}

              {/* Did you mean correction */}
              {catalogResponse.didYouMean ? (
                <p className="px-1 text-[14px] text-ink-900/70 dark:text-paper/70">
                  <span>{copy.didYouMeanPrefix} </span>
                  <button
                    type="button"
                    onClick={() => {
                      applyQuery(catalogResponse.didYouMean!, true);
                      inputRef.current?.focus();
                    }}
                    className="group inline-flex min-h-11 items-center font-semibold whitespace-nowrap text-sapphire dark:text-sapphire-border"
                  >
                    <span className="link-draw">{catalogResponse.didYouMean}</span>
                  </button>
                </p>
              ) : null}

              {/* Expandable Guidance Overview */}
              {overview && overviewBody ? (
                <section
                  aria-label={copy.aiAnswerTitle}
                  className="rounded-xl border border-sapphire/15 bg-sapphire/[0.03] px-4 py-3.5 dark:border-sapphire-border/20 dark:bg-sapphire/[0.08]"
                >
                  {/* Keyed: when the fuller answer replaces the catalogue lead, it settles in instead of snapping. */}
                  <p
                    key={activeAiAnswer ? "answer" : "lead"}
                    className={cn(
                      "text-[14.5px] leading-relaxed text-foreground dark:text-paper",
                      activeAiAnswer && "swap-in",
                    )}
                  >
                    {overviewBody}
                  </p>

                  <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                    <Link
                      href={overview.primaryAction.href}
                      onClick={() => handleFollowLink(overview.primaryAction.href, true)}
                      className="group inline-flex min-h-11 items-center gap-1.5 text-[13.5px] font-semibold whitespace-nowrap text-sapphire dark:text-sapphire-border"
                    >
                      <span className="link-draw">{overview.primaryAction.label}</span>
                      <ArrowRightIcon className="arrow-travel h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    </Link>

                    {hasOverviewDetails ? (
                      <button
                        type="button"
                        aria-expanded={expandedOverview}
                        aria-controls={`${baseId}-overview-steps`}
                        onClick={() => {
                          lastExpandedControlIdRef.current = `${baseId}-overview-steps`;
                          setExpandedOverview((prev) => !prev);
                        }}
                        className="inline-flex min-h-11 items-center gap-1.5 rounded-lg px-2 text-[13.5px] font-medium whitespace-nowrap text-ink-900/70 transition-colors hover:bg-ink-900/[0.04] hover:text-foreground dark:text-paper/75 dark:hover:bg-paper/[0.06] dark:hover:text-paper"
                      >
                        <span>
                          {expandedOverview
                            ? copy.collapseDetailsLabel
                            : copy.expandOverviewStepsLabel}
                        </span>
                        <ChevronDownIcon
                          className={cn(
                            "h-4 w-4 shrink-0 transition-transform duration-(--dur-base) ease-(--ease-out-calm) motion-reduce:transition-none",
                            expandedOverview && "rotate-180",
                          )}
                          aria-hidden="true"
                        />
                      </button>
                    ) : null}
                  </div>

                  {hasOverviewDetails ? (
                    <div
                      id={`${baseId}-overview-steps`}
                      className={cn(
                        "grid",
                        transitionClass,
                        expandedOverview ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                      )}
                    >
                      <div className="overflow-hidden" inert={!expandedOverview}>
                        <div className="mt-2 space-y-2.5 border-t border-sapphire/12 pt-3 dark:border-sapphire-border/15">
                          {overview.steps.length > 0 ? (
                            <ol className="list-decimal space-y-1.5 pl-5 text-[13.5px] leading-relaxed text-ink-900/80 dark:text-paper/80">
                              {overview.steps.map((step) => (
                                <li key={step}>{step}</li>
                              ))}
                            </ol>
                          ) : null}

                          {activeAiAnswer ? (
                            <p className="text-[12.5px] text-ink-900/55 dark:text-paper/55">
                              {copy.aiAnswerDisclaimer}
                            </p>
                          ) : null}

                          {catalogResponse.suggestedFollowups.length > 0 ? (
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-0.5">
                              {catalogResponse.suggestedFollowups.map((follow) => (
                                <button
                                  key={follow}
                                  type="button"
                                  onClick={() => {
                                    applyQuery(follow, true);
                                    inputRef.current?.focus();
                                  }}
                                  className="group inline-flex min-h-11 items-center gap-1.5 text-[13px] font-medium whitespace-nowrap text-sapphire dark:text-sapphire-border"
                                >
                                  <SearchIcon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                                  <span className="link-draw">{follow}</span>
                                </button>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  ) : null}
                </section>
              ) : null}

              {/* Clean single-column Google result rows */}
              {results.length === 0 ? (
                <div className="swap-in rounded-xl border border-ink-900/10 px-5 py-7 text-center dark:border-paper/10">
                  <p className="text-[16px] font-semibold text-foreground dark:text-paper">
                    {copy.emptyTitle}
                  </p>
                  <p className="mx-auto mt-1.5 max-w-md text-[14px] leading-relaxed text-ink-900/70 dark:text-paper/70">
                    {copy.emptyBody}
                  </p>
                  <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        applyQuery("", true);
                        inputRef.current?.focus();
                      }}
                      className="inline-flex min-h-11 items-center rounded-lg border border-ink-900/15 px-4 text-[14px] font-medium whitespace-nowrap text-foreground transition-colors hover:bg-ink-900/[0.04] dark:border-paper/15 dark:text-paper dark:hover:bg-paper/[0.06]"
                    >
                      {copy.emptyFallbackAction}
                    </button>
                    <Link
                      href={assistantHref}
                      onClick={() => handleFollowLink(assistantHref, false)}
                      className="group press-solid inline-flex min-h-11 items-center gap-1.5 rounded-lg bg-sapphire px-4 text-[14px] font-semibold whitespace-nowrap text-white transition-colors duration-(--dur-fast) ease-(--ease-out-calm) hover:bg-sapphire/90 motion-reduce:transition-none"
                    >
                      <span>{copy.askAssistantLabel}</span>
                      <ArrowRightIcon className="arrow-travel h-4 w-4 shrink-0" aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              ) : (
                // Keyed by tab: a tab switch replays the ordered entrance; while typing only new rows arrive.
                <div key={effectiveCategory} className="divide-y divide-ink-900/8 dark:divide-paper/10">
                  {results.map((result, idx) => {
                    const isHighlighted = activeIndex === idx;
                    const isExpanded = expandedResultId === result.id;
                    const isThisSpeaking = speaking && speakingResultId === result.id;
                    const detailsId = `${baseId}-result-${idx}`;

                    return (
                      <article
                        key={result.id}
                        data-search-row={idx}
                        onMouseEnter={() => setActiveIndex(idx)}
                        style={{ "--i": idx } as CSSProperties}
                        className={cn(
                          "list-in rounded-lg px-2 py-2.5 transition-colors duration-(--dur-fast) ease-(--ease-out-calm) motion-reduce:transition-none",
                          isHighlighted && "bg-ink-900/[0.025] dark:bg-paper/[0.04]",
                        )}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <Link
                            href={result.href}
                            onClick={() => handleFollowLink(result.href, true)}
                            className="group min-w-0 flex-1 py-0.5"
                          >
                            <h3 className="text-[16px] leading-snug font-semibold text-sapphire dark:text-sapphire-border">
                              <span className="link-draw [box-decoration-break:clone]">{result.title}</span>
                            </h3>
                            <p className="mt-0.5 text-[14px] leading-relaxed text-ink-900/75 dark:text-paper/75">
                              {result.summary}
                            </p>
                          </Link>

                          <button
                            type="button"
                            aria-expanded={isExpanded}
                            aria-controls={detailsId}
                            aria-label={`${isExpanded ? copy.collapseDetailsLabel : copy.expandDetailsLabel}: ${result.title}`}
                            onClick={() => {
                              lastExpandedControlIdRef.current = detailsId;
                              setExpandedResultId((prev) =>
                                prev === result.id ? null : result.id,
                              );
                            }}
                            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-ink-900/50 transition-colors hover:bg-ink-900/[0.05] hover:text-foreground dark:text-paper/55 dark:hover:bg-paper/[0.08] dark:hover:text-paper"
                          >
                            <ChevronDownIcon
                              className={cn(
                                "h-4 w-4 transition-transform duration-(--dur-base) ease-(--ease-out-calm) motion-reduce:transition-none",
                                isExpanded && "rotate-180",
                              )}
                              aria-hidden="true"
                            />
                          </button>
                        </div>

                        <div
                          id={detailsId}
                          className={cn(
                            "grid",
                            transitionClass,
                            isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                          )}
                        >
                          <div className="overflow-hidden" inert={!isExpanded}>
                            <div className="mt-2 space-y-2.5 border-t border-ink-900/8 pt-2.5 pb-1 dark:border-paper/10">
                              {result.summary.length > 110 || result.nextSteps.length === 0 ? (
                                <p className="text-[14px] leading-relaxed text-ink-900/80 dark:text-paper/80">
                                  {result.summary}
                                </p>
                              ) : null}

                              {result.nextSteps.length > 0 ? (
                                <ul className="list-disc space-y-1 pl-5 text-[13.5px] leading-relaxed text-ink-900/75 dark:text-paper/75">
                                  {result.nextSteps.map((step) => (
                                    <li key={step}>{step}</li>
                                  ))}
                                </ul>
                              ) : null}

                              <div className="flex flex-wrap items-center gap-4">
                                {voiceEnabled && canSpeak ? (
                                  <button
                                    type="button"
                                    onClick={() => handleToggleSpeech(result)}
                                    className="inline-flex min-h-11 items-center gap-1.5 text-[13.5px] font-medium whitespace-nowrap text-ink-900/75 transition-colors hover:text-foreground dark:text-paper/75 dark:hover:text-paper"
                                  >
                                    {isThisSpeaking ? (
                                      <VolumeMuteIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
                                    ) : (
                                      <VolumeIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
                                    )}
                                    <span>
                                      {isThisSpeaking ? copy.stopReadingLabel : copy.readAloudLabel}
                                    </span>
                                  </button>
                                ) : null}

                                <Link
                                  href={result.href}
                                  onClick={() => handleFollowLink(result.href, true)}
                                  className="group inline-flex min-h-11 items-center gap-1.5 text-[13.5px] font-semibold whitespace-nowrap text-sapphire dark:text-sapphire-border"
                                >
                                  <span className="link-draw">{copy.openPageLabel}</span>
                                  <ArrowRightIcon className="arrow-travel h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}

              {/* Powered Related Questions ("People also ask") accordion */}
              {catalogResponse.relatedQuestions.length > 0 ? (
                <section
                  aria-labelledby={`${baseId}-related`}
                  className="border-t border-ink-900/10 pt-3.5 dark:border-paper/10"
                >
                  <p
                    id={`${baseId}-related`}
                    className="px-2 pb-1 text-xs font-medium text-ink-900/55 dark:text-paper/55"
                  >
                    {copy.relatedQuestionsHeading}
                  </p>

                  <div className="divide-y divide-ink-900/8 dark:divide-paper/10">
                    {catalogResponse.relatedQuestions.map((rq, idx) => {
                      const isExpanded = expandedQuestionId === rq.id;
                      const panelId = `${baseId}-rq-${idx}`;
                      return (
                        <div key={rq.id}>
                          <button
                            type="button"
                            aria-expanded={isExpanded}
                            aria-controls={panelId}
                            onClick={() => {
                              lastExpandedControlIdRef.current = panelId;
                              setExpandedQuestionId((prev) => (prev === rq.id ? null : rq.id));
                            }}
                            className="flex min-h-11 w-full items-center justify-between gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-ink-900/[0.03] dark:hover:bg-paper/[0.05]"
                          >
                            <span className="min-w-0 flex-1 text-[14.5px] leading-snug font-medium text-foreground dark:text-paper">
                              {rq.question}
                            </span>
                            <ChevronDownIcon
                              className={cn(
                                "h-4 w-4 shrink-0 text-ink-900/45 transition-transform duration-(--dur-base) ease-(--ease-out-calm) motion-reduce:transition-none dark:text-paper/45",
                                isExpanded && "rotate-180",
                              )}
                              aria-hidden="true"
                            />
                          </button>

                          <div
                            id={panelId}
                            className={cn(
                              "grid",
                              transitionClass,
                              isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                            )}
                          >
                            <div className="overflow-hidden" inert={!isExpanded}>
                              <div className="space-y-2 px-2 pt-0.5 pb-3.5">
                                <p className="text-[13.5px] leading-relaxed text-ink-900/75 dark:text-paper/75">
                                  {rq.answer}
                                </p>
                                {rq.href ? (
                                  <Link
                                    href={rq.href}
                                    onClick={() => handleFollowLink(rq.href!, true)}
                                    className="group inline-flex min-h-11 items-center gap-1.5 text-[13.5px] font-semibold whitespace-nowrap text-sapphire dark:text-sapphire-border"
                                  >
                                    <span className="link-draw">{rq.linkLabel ?? copy.openPageLabel}</span>
                                    <ArrowRightIcon
                                      className="arrow-travel h-3.5 w-3.5 shrink-0"
                                      aria-hidden="true"
                                    />
                                  </Link>
                                ) : null}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              ) : null}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );

  return createPortal(dialog, document.body);
}
