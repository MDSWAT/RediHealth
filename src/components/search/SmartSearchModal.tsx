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
import { m } from "motion/react";
import { Button } from "@/components/ui/Button";
import {
  ActivityIcon,
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
import type { Lang } from "@/lib/i18n/translations";
import { useReadingLevel } from "@/lib/comfort-preferences";
import { DURATION, ENTRANCE_OFFSET_PX, useCalmReducedMotion } from "@/lib/motion/tokens";
import { toSentences, useSpeech } from "@/components/landing/hero/use-speech";
import { isVoiceEnabled } from "@/lib/audio/voice-availability";
import { scrollExpandedIntoModalView, useSheetDialog } from "@/components/news/use-sheet-dialog";
import { getChromeCopy } from "@/components/layout/chrome-copy";
import {
  SMART_SEARCH_OPEN_EVENT,
  SMART_SEARCH_WARM_EVENT,
  getSmartSearchTriggerCopy,
  type SmartSearchOpenDetail,
} from "@/components/search/smart-search-events";
import { errorTranslations } from "@/lib/i18n/error-translations";
import { isBrowserOffline } from "@/lib/pwa/use-online-status";
import type {
  GuidedJourneyId,
  SmartSearchCategory,
  SmartSearchCopy,
} from "@/lib/i18n/smart-search-copy";
import type {
  ContextualSuggestionBundle,
  SmartSearchResponse,
  SmartSearchResult,
} from "@/lib/search/smart-search-engine";

type SmartSearchCopyModule = typeof import("@/lib/i18n/smart-search-copy");
type SmartSearchEngineModule = typeof import("@/lib/search/smart-search-engine");

let loadedCopyModule: SmartSearchCopyModule | null = null;
let copyModulePromise: Promise<SmartSearchCopyModule> | null = null;
let loadedEngineModule: SmartSearchEngineModule | null = null;
let engineModulePromise: Promise<SmartSearchEngineModule> | null = null;

function loadSmartSearchCopyModule(): Promise<SmartSearchCopyModule> {
  if (loadedCopyModule) {
    return Promise.resolve(loadedCopyModule);
  }
  if (!copyModulePromise) {
    copyModulePromise = import("@/lib/i18n/smart-search-copy")
      .then((mod) => {
        loadedCopyModule = mod;
        return mod;
      })
      .catch((error) => {
        copyModulePromise = null;
        throw error;
      });
  }
  return copyModulePromise;
}

function loadSmartSearchEngineModule(): Promise<SmartSearchEngineModule> {
  if (loadedEngineModule) {
    return Promise.resolve(loadedEngineModule);
  }
  if (!engineModulePromise) {
    engineModulePromise = import("@/lib/search/smart-search-engine")
      .then((mod) => {
        loadedEngineModule = mod;
        return mod;
      })
      .catch((error) => {
        engineModulePromise = null;
        throw error;
      });
  }
  return engineModulePromise;
}

async function resolveSmartSearchLocal(options: {
  query: string;
  lang: Lang;
  pathname: string;
  readingLevel: "standard" | "simple";
  category: SmartSearchCategory;
  includeContextual: boolean;
}): Promise<SmartSearchGetPayload> {
  const engine = await loadSmartSearchEngineModule();
  const hasSearchable = /[\p{L}\p{N}]/u.test(options.query.trim());
  const contextual =
    options.includeContextual || !hasSearchable
      ? engine.getContextualSuggestions(options.pathname, options.lang)
      : undefined;
  const allCatalog = hasSearchable
    ? engine.searchSmartCatalog(options.query, {
        lang: options.lang,
        category: "all",
        readingLevel: options.readingLevel,
        pathname: options.pathname,
        limit: 8,
      })
    : undefined;
  const categoryCatalog =
    hasSearchable && options.category !== "all"
      ? engine.searchSmartCatalog(options.query, {
          lang: options.lang,
          category: options.category,
          readingLevel: options.readingLevel,
          pathname: options.pathname,
          limit: 8,
        })
      : undefined;
  return { contextual, allCatalog, categoryCatalog };
}

const MAX_CLIENT_CACHE = 40;
const contextualCache = new Map<string, ContextualSuggestionBundle>();
const catalogAllCache = new Map<string, SmartSearchResponse>();
const catalogCategoryCache = new Map<string, SmartSearchResponse>();

function setBoundedCache<V>(cache: Map<string, V>, key: string, value: V): void {
  if (cache.has(key)) {
    cache.delete(key);
  } else if (cache.size >= MAX_CLIENT_CACHE) {
    const oldest = cache.keys().next().value;
    if (oldest !== undefined) cache.delete(oldest);
  }
  cache.set(key, value);
}

type SmartSearchGetPayload = {
  contextual?: ContextualSuggestionBundle;
  allCatalog?: SmartSearchResponse;
  categoryCatalog?: SmartSearchResponse;
};

async function fetchSmartSearchGet(
  params: URLSearchParams,
  signal?: AbortSignal,
): Promise<SmartSearchGetPayload | null> {
  const res = await fetch(`/api/smart-search?${params.toString()}`, {
    method: "GET",
    credentials: "same-origin",
    signal,
  });
  if (!res.ok) return null;
  return (await res.json()) as SmartSearchGetPayload;
}

/** Wait for a short pause in typing before asking the server, so each keystroke is not a request. */
const CATALOG_DEBOUNCE_MS = 250;
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

const EMPTY_GROUPED_COUNTS: Record<SmartSearchCategory, number> = {
  all: 0,
  tools: 0,
  guides: 0,
  glossary: 0,
  myths: 0,
  articles: 0,
  news: 0,
};

const EMPTY_CONTEXTUAL_SUGGESTIONS: ContextualSuggestionBundle = {
  contextLabel: "",
  chips: [],
  topResults: [],
};

const EMPTY_SEARCH_RESPONSE: SmartSearchResponse = {
  results: [],
  groupedCounts: EMPTY_GROUPED_COUNTS,
  didYouMean: null,
  ghostCompletion: null,
  predictions: [],
  isEmergency: false,
  suggestedFollowups: [],
  intentSummary: null,
  guidedOverview: null,
  relatedQuestions: [],
};

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

function hasSearchableText(value: string): boolean {
  return /[\p{L}\p{N}]/u.test(value);
}

function recentSearchesStorageKey(lang: Lang): string {
  return `${RECENT_SEARCHES_KEY}:${lang}`;
}

function isEditableElement(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
}

function readRecentSearches(lang: Lang): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(recentSearchesStorageKey(lang));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item): item is string => typeof item === "string" && hasSearchableText(item))
      .slice(0, MAX_RECENT_SEARCHES);
  } catch {
    return [];
  }
}

function writeRecentSearches(lang: Lang, items: string[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      recentSearchesStorageKey(lang),
      JSON.stringify(items.slice(0, MAX_RECENT_SEARCHES)),
    );
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
  const [copyModule, setCopyModule] = useState<SmartSearchCopyModule | null>(() => loadedCopyModule);
  const copy: SmartSearchCopy | null = useMemo(
    () => (copyModule ? copyModule.getSmartSearchCopy(lang) : null),
    [copyModule, lang],
  );
  const voiceEnabled = isVoiceEnabled(lang);
  const { available: canSpeak, speaking, speak, stop } = useSpeech(lang);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<SmartSearchCategory>("all");
  const [activeIndex, setActiveIndex] = useState(0);
  const [recentByLang, setRecentByLang] = useState<Partial<Record<Lang, string[]>>>({});
  const recentSearches = useMemo(() => recentByLang[lang] ?? [], [recentByLang, lang]);
  const [expandedJourneyId, setExpandedJourneyId] = useState<GuidedJourneyId | null>(null);
  const [expandedOverview, setExpandedOverview] = useState(false);
  const [expandedResultId, setExpandedResultId] = useState<string | null>(null);
  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(null);
  const [speakingResultId, setSpeakingResultId] = useState<string | null>(null);
  const [aiState, setAiState] = useState<AiAnswerState>({ query: "", answer: null });
  const [contextualState, setContextualState] = useState<{
    key: string;
    bundle: ContextualSuggestionBundle;
  } | null>(null);
  const [catalogState, setCatalogState] = useState<{
    resolvedAllKey: string;
    allCatalog: SmartSearchResponse;
    resolvedCatKey: string;
    categoryCatalog: SmartSearchResponse;
  }>({
    resolvedAllKey: "",
    allCatalog: EMPTY_SEARCH_RESPONSE,
    resolvedCatKey: "",
    categoryCatalog: EMPTY_SEARCH_RESPONSE,
  });
  // The sheet's own copy is a lazy chunk; when it cannot be fetched the sheet says so instead of staying shut.
  const [copyLoadFailed, setCopyLoadFailed] = useState(false);
  // Cache key of the search whose request failed, so the sheet can say so and offer another try.
  const [failedCatalogKey, setFailedCatalogKey] = useState("");
  const [retryNonce, setRetryNonce] = useState(0);

  const warmSearchAssets = useCallback(() => {
    void loadSmartSearchCopyModule()
      .then((mod) => {
        setCopyModule((prev) => prev ?? mod);
        setCopyLoadFailed(false);
      })
      .catch(() => setCopyLoadFailed(true));
    void loadSmartSearchEngineModule().catch(() => {});

    const ctxKey = `${lang}|${pathname}`;
    if (!contextualCache.has(ctxKey)) {
      const params = new URLSearchParams({
        lang,
        pathname,
        includeContextual: "1",
      });
      const resolveContextual = isBrowserOffline()
        ? resolveSmartSearchLocal({
            query: "",
            lang,
            pathname,
            readingLevel: "standard",
            category: "all",
            includeContextual: true,
          })
        : fetchSmartSearchGet(params)
            .then((data) =>
              data?.contextual
                ? data
                : resolveSmartSearchLocal({
                    query: "",
                    lang,
                    pathname,
                    readingLevel: "standard",
                    category: "all",
                    includeContextual: true,
                  }),
            )
            .catch(() =>
              resolveSmartSearchLocal({
                query: "",
                lang,
                pathname,
                readingLevel: "standard",
                category: "all",
                includeContextual: true,
              }),
            );
      void resolveContextual
        .then((data) => {
          if (data?.contextual) {
            setBoundedCache(contextualCache, ctxKey, data.contextual);
            setContextualState({ key: ctxKey, bundle: data.contextual });
          }
        })
        .catch(() => {});
    }
  }, [lang, pathname]);

  const panelRef = useRef<HTMLDivElement>(null);
  const scrollBodyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const shouldRestoreFocusRef = useRef(true);
  const keyboardMoveRef = useRef(false);
  // True once the reader has moved through the list with the arrow keys for the current query.
  const arrowPickedRef = useRef(false);
  const lastExpandedControlIdRef = useRef<string | null>(null);
  const dialogTitleId = useId();
  const baseId = useId();

  const saveRecentSearch = useCallback(
    (value: string) => {
      const cleaned = value.trim();
      if (!hasSearchableText(cleaned) || cleaned.length < 2) return;
      setRecentByLang((prev) => {
        const current = prev[lang] ?? readRecentSearches(lang);
        const next = [
          cleaned,
          ...current.filter((item) => item.toLowerCase() !== cleaned.toLowerCase()),
        ].slice(0, MAX_RECENT_SEARCHES);
        writeRecentSearches(lang, next);
        return { ...prev, [lang]: next };
      });
    },
    [lang],
  );

  const clearRecentSearches = useCallback(() => {
    setRecentByLang((prev) => ({ ...prev, [lang]: [] }));
    writeRecentSearches(lang, []);
  }, [lang]);

  const applyQuery = useCallback(
    (nextQuery: string, resetCategory = true) => {
      if (speaking) stop();
      setSpeakingResultId(null);
      arrowPickedRef.current = false;
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

  const handleOpen = useCallback(
    (initialQuery?: string) => {
      warmSearchAssets();
      shouldRestoreFocusRef.current = true;
      setRecentByLang((prev) => ({ ...prev, [lang]: readRecentSearches(lang) }));
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
    },
    [lang, warmSearchAssets],
  );

  const handleClose = useCallback(() => {
    if (speaking) stop();
    setSpeakingResultId(null);
    setOpen(false);
  }, [speaking, stop]);

  useSheetDialog(open, panelRef, handleClose, inputRef, shouldRestoreFocusRef);

  useEffect(() => {
    const onWarmEvent = () => {
      warmSearchAssets();
    };
    window.addEventListener(SMART_SEARCH_WARM_EVENT, onWarmEvent);
    return () => {
      window.removeEventListener(SMART_SEARCH_WARM_EVENT, onWarmEvent);
    };
  }, [warmSearchAssets]);

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
        event.stopPropagation();
        handleOpen("");
      }
    };

    window.addEventListener(SMART_SEARCH_OPEN_EVENT, onOpenEvent);
    window.addEventListener("keydown", onGlobalKeyDown, true);
    return () => {
      window.removeEventListener(SMART_SEARCH_OPEN_EVENT, onOpenEvent);
      window.removeEventListener("keydown", onGlobalKeyDown, true);
    };
  }, [open, handleOpen, handleClose]);

  const trimmedQuery = query.trim();
  const hasSearchableQuery = hasSearchableText(trimmedQuery);
  const contextualKey = `${lang}|${pathname}`;
  const cachedContextual = contextualCache.get(contextualKey);

  const contextual = useMemo(
    () =>
      cachedContextual ??
      (contextualState?.key === contextualKey
        ? contextualState.bundle
        : EMPTY_CONTEXTUAL_SUGGESTIONS),
    [cachedContextual, contextualState, contextualKey],
  );

  const allCacheKey = hasSearchableQuery
    ? `${lang}|${readingLevel}|${pathname}|${query}`
    : "";
  const cachedAllCatalog = allCacheKey ? catalogAllCache.get(allCacheKey) : undefined;

  const allCatalogResponse = useMemo(
    () =>
      !hasSearchableQuery
        ? EMPTY_SEARCH_RESPONSE
        : cachedAllCatalog ?? catalogState.allCatalog,
    [hasSearchableQuery, cachedAllCatalog, catalogState.allCatalog],
  );

  useEffect(() => {
    if (!open || cachedContextual) return;
    const controller = new AbortController();
    const params = new URLSearchParams({
      lang,
      pathname,
      includeContextual: "1",
    });
    const load = isBrowserOffline()
      ? resolveSmartSearchLocal({
          query: "",
          lang,
          pathname,
          readingLevel,
          category: "all",
          includeContextual: true,
        })
      : fetchSmartSearchGet(params, controller.signal)
          .then((data) => {
            if (controller.signal.aborted || data?.contextual) return data;
            return resolveSmartSearchLocal({
              query: "",
              lang,
              pathname,
              readingLevel,
              category: "all",
              includeContextual: true,
            });
          })
          .catch(() => {
            if (controller.signal.aborted) return null;
            return resolveSmartSearchLocal({
              query: "",
              lang,
              pathname,
              readingLevel,
              category: "all",
              includeContextual: true,
            });
          });
    load
      .then((data) => {
        if (controller.signal.aborted || !data?.contextual) return;
        setBoundedCache(contextualCache, contextualKey, data.contextual);
        setContextualState({ key: contextualKey, bundle: data.contextual });
      })
      .catch(() => {});

    return () => {
      controller.abort();
    };
  }, [open, cachedContextual, contextualKey, lang, pathname, readingLevel]);

  useEffect(() => {
    if (!open || !hasSearchableQuery || trimmedQuery.length < 3 || isBrowserOffline()) return;
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
  }, [open, hasSearchableQuery, trimmedQuery, lang, pathname, readingLevel]);

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

    for (const popular of copy?.popularQueries ?? []) {
      if (rows.length >= 5) break;
      const key = popular.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        rows.push({ query: popular, isRecent: false });
      }
    }

    return rows.slice(0, 5);
  }, [recentSearches, contextual.chips, copy]);

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

  const catCacheKey =
    hasSearchableQuery && effectiveCategory !== "all"
      ? `${lang}|${readingLevel}|${pathname}|${effectiveCategory}|${query}`
      : "";
  const cachedCategoryCatalog = catCacheKey ? catalogCategoryCache.get(catCacheKey) : undefined;

  useEffect(() => {
    if (!open || !hasSearchableQuery) return;
    if (cachedAllCatalog && (effectiveCategory === "all" || cachedCategoryCatalog)) return;

    const controller = new AbortController();
    const params = new URLSearchParams({
      q: query,
      lang,
      pathname,
      readingLevel,
      category: effectiveCategory,
    });

    const timer = window.setTimeout(() => {
      const loadCatalog = isBrowserOffline()
        ? resolveSmartSearchLocal({
            query,
            lang,
            pathname,
            readingLevel,
            category: effectiveCategory,
            includeContextual: false,
          })
        : fetchSmartSearchGet(params, controller.signal)
            .then((data) => {
              if (controller.signal.aborted || data?.allCatalog) return data;
              return resolveSmartSearchLocal({
                query,
                lang,
                pathname,
                readingLevel,
                category: effectiveCategory,
                includeContextual: false,
              });
            })
            .catch(() => {
              if (controller.signal.aborted) return null;
              return resolveSmartSearchLocal({
                query,
                lang,
                pathname,
                readingLevel,
                category: effectiveCategory,
                includeContextual: false,
              });
            });

      loadCatalog
        .then((data) => {
          if (controller.signal.aborted) return;
          if (!data?.allCatalog) {
            setFailedCatalogKey(allCacheKey);
            return;
          }
          setBoundedCache(catalogAllCache, allCacheKey, data.allCatalog);
          if (effectiveCategory !== "all" && data.categoryCatalog && catCacheKey) {
            setBoundedCache(catalogCategoryCache, catCacheKey, data.categoryCatalog);
          }
          setCatalogState({
            resolvedAllKey: allCacheKey,
            allCatalog: data.allCatalog,
            resolvedCatKey: catCacheKey,
            categoryCatalog: data.categoryCatalog ?? data.allCatalog,
          });
        })
        .catch(() => {
          if (!controller.signal.aborted) setFailedCatalogKey(allCacheKey);
        });
    }, CATALOG_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [
    open,
    hasSearchableQuery,
    cachedAllCatalog,
    cachedCategoryCatalog,
    allCacheKey,
    catCacheKey,
    query,
    lang,
    pathname,
    readingLevel,
    effectiveCategory,
    retryNonce,
  ]);

  const isWaitingForCatalog = Boolean(
    hasSearchableQuery &&
      !cachedAllCatalog &&
      catalogState.resolvedAllKey !== allCacheKey,
  );
  // The request for exactly this search failed (no internet, server error): say so, do not stay blank.
  const catalogFailed = isWaitingForCatalog && failedCatalogKey === allCacheKey;

  const catalogResponse = useMemo(
    () =>
      !hasSearchableQuery
        ? EMPTY_SEARCH_RESPONSE
        : effectiveCategory === "all"
          ? allCatalogResponse
          : cachedCategoryCatalog ??
            (catalogState.resolvedCatKey === catCacheKey
              ? catalogState.categoryCatalog
              : allCatalogResponse),
    [
      hasSearchableQuery,
      effectiveCategory,
      allCatalogResponse,
      cachedCategoryCatalog,
      catalogState.resolvedCatKey,
      catalogState.categoryCatalog,
      catCacheKey,
    ],
  );

  const showCategoryTabs =
    hasSearchableQuery && populatedCategories.length >= 1;

  const visibleTabs = useMemo<SmartSearchCategory[]>(
    () => ["all", ...populatedCategories],
    [populatedCategories],
  );

  const results = catalogResponse.results;
  const ghostSuffix = useMemo(() => {
    if (!hasSearchableQuery || !catalogResponse.ghostCompletion) return "";
    if (catalogResponse.ghostCompletion.startsWith(query)) {
      return catalogResponse.ghostCompletion.slice(query.length);
    }
    if (catalogResponse.ghostCompletion.toLowerCase().startsWith(query.toLowerCase())) {
      return catalogResponse.ghostCompletion.slice(query.length);
    }
    return "";
  }, [hasSearchableQuery, catalogResponse.ghostCompletion, query]);

  const livePredictions = useMemo(
    () =>
      hasSearchableQuery && trimmedQuery.length >= 2
        ? allCatalogResponse.predictions.slice(0, 3)
        : [],
    [hasSearchableQuery, trimmedQuery, allCatalogResponse.predictions],
  );

  const activeAiAnswer =
    hasSearchableQuery && aiState.query === trimmedQuery ? aiState.answer : null;
  const overview = hasSearchableQuery ? catalogResponse.guidedOverview : null;
  const hasDistinctRemoteAnswer = Boolean(
    activeAiAnswer && activeAiAnswer !== overview?.lead,
  );
  const overviewBody = activeAiAnswer || overview?.lead || "";
  const hasOverviewDetails =
    Boolean(overview?.steps.length) || hasDistinctRemoteAnswer;

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
      arrowPickedRef.current = true;
      setActiveIndex((prev) => (prev + 1) % listCount);
      return;
    }

    if (event.key === "ArrowUp" && listCount > 0) {
      event.preventDefault();
      keyboardMoveRef.current = true;
      arrowPickedRef.current = true;
      setActiveIndex((prev) => (prev - 1 + listCount) % listCount);
      return;
    }

    if (event.key === "Tab" && !event.shiftKey) {
      if (ghostSuffix) {
        event.preventDefault();
        applyQuery(`${query}${ghostSuffix}`, true);
        return;
      }
      if (livePredictions[0]) {
        event.preventDefault();
        applyQuery(livePredictions[0], true);
        return;
      }
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
      if (trimmedQuery) {
        // A touch keyboard's search key only puts the keyboard away so the list shows: it must not
        // open a page the reader did not choose. Enter opens a result after the arrow keys picked
        // one, or (with a mouse and keyboard, as before) the first result.
        const touchKeyboard =
          typeof window.matchMedia === "function" && window.matchMedia("(pointer: coarse)").matches;
        if (touchKeyboard && !arrowPickedRef.current) {
          event.preventDefault();
          event.currentTarget.blur();
          return;
        }
        if (results[activeIndex]) {
          event.preventDefault();
          navigateToResult(results[activeIndex]);
        }
      }
    }
  };

  if (!open || typeof document === "undefined") return null;

  // These few strings are in the main bundle, so the sheet can open before its own copy has loaded.
  const triggerCopy = getSmartSearchTriggerCopy(lang);
  const modalLabel = copy?.modalLabel ?? triggerCopy.triggerLabel;
  const inputPlaceholder = copy?.inputPlaceholder ?? triggerCopy.triggerPlaceholder;
  const closeLabel = copy?.closeLabel ?? getChromeCopy(lang).closeWord;
  const retryLabel = (errorTranslations[lang] ?? errorTranslations.ro).retry;

  const handleRetry = () => {
    setFailedCatalogKey("");
    setRetryNonce((value) => value + 1);
    warmSearchAssets();
  };

  const liveAnnouncement = !copy
    ? copyLoadFailed
      ? triggerCopy.failed
      : trimmedQuery
        ? triggerCopy.searching
        : ""
    : !trimmedQuery
      ? copy.journeysHeading
      : catalogFailed
        ? triggerCopy.failed
        : isWaitingForCatalog && results.length === 0
          ? triggerCopy.searching
          : results.length === 0
            ? copy.emptyTitle
            : `${results.length} ${results.length === 1 ? copy.resultsSingular : copy.resultsPlural}`;

  // Plain words and one way forward when the search (or the sheet's own copy) could not be loaded.
  const failureNotice = (
    <div className="swap-in rounded-xl border border-ink-900/10 px-5 py-7 text-center dark:border-paper/10">
      <p className="mx-auto max-w-md text-body text-foreground dark:text-paper">{triggerCopy.failed}</p>
      <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
        <Button type="button" variant="outline" size="md" onClick={handleRetry}>
          {retryLabel}
        </Button>
      </div>
    </div>
  );

  const assistantHref = withLangPrefix(
    hasSearchableQuery ? `/health-assistant?q=${encodeURIComponent(trimmedQuery)}` : "/health-assistant",
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
        className="scrim-in fixed inset-0 -z-10 bg-ink-950/45"
      />

      <m.div
        ref={panelRef}
        tabIndex={-1}
        initial={reducedMotion ? false : { opacity: 0, y: ENTRANCE_OFFSET_PX }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reducedMotion ? 0 : DURATION.slow, ease: [0.16, 1, 0.3, 1] }}
        className="mx-auto flex max-h-[92%] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl border border-transparent bg-white text-foreground shadow-[0_28px_72px_-18px_rgba(12,24,48,0.38)] md:max-h-[80vh] md:rounded-2xl dark:border-paper/15 dark:bg-ink-950 dark:text-paper"
      >
        <h2 id={dialogTitleId} className="sr-only">
          {modalLabel}
        </h2>

        <div aria-live="polite" className="sr-only">
          {liveAnnouncement}
        </div>

        {/* Google-like search header bar */}
        {/* Focus shows as a sapphire rule along the bar's own edge, not a second box drawn inside the panel. */}
        <div className="shrink-0 border-b border-ink-900/10 px-4 py-2 transition-shadow duration-(--dur-fast) ease-(--ease-out-calm) has-[input:focus-visible]:shadow-[inset_0_-2px_0_var(--color-sapphire)] motion-reduce:transition-none dark:border-paper/10 dark:has-[input:focus-visible]:shadow-[inset_0_-2px_0_var(--color-sapphire-border)] sm:px-5">
          <div className="flex min-h-[52px] items-center gap-3 pl-1.5">
            <SearchIcon
              className="h-5 w-5 shrink-0 text-sapphire dark:text-sapphire-border"
              aria-hidden="true"
            />

            <div className="relative flex min-w-0 flex-1 items-center">
              {ghostSuffix ? (
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 flex items-center overflow-hidden pr-1 whitespace-pre text-body font-normal"
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
                  arrowPickedRef.current = false;
                  setQuery(nextVal);
                  setCategory("all");
                  setActiveIndex(0);
                  setExpandedOverview(false);
                  setExpandedResultId(null);
                  setExpandedQuestionId(null);
                }}
                onKeyDown={handleInputKeyDown}
                placeholder={inputPlaceholder}
                aria-label={modalLabel}
                enterKeyHint="search"
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
                style={{ outline: "none" }}
                className="relative z-10 min-h-[44px] w-full bg-transparent pr-1 text-body font-normal text-foreground caret-sapphire placeholder:text-muted-foreground focus:outline-none focus-visible:outline-none dark:text-paper dark:caret-sapphire-border dark:placeholder:text-mist [&::-webkit-search-cancel-button]:hidden"
              />
            </div>

            {query.length > 0 && copy ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    applyQuery("", true);
                    inputRef.current?.focus();
                  }}
                  className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-lg px-2.5 text-body font-medium whitespace-nowrap text-muted-foreground transition-colors hover:bg-ink-900/[0.05] hover:text-foreground dark:text-mist dark:hover:bg-paper/[0.08] dark:hover:text-paper"
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
              aria-label={closeLabel}
              // The red disc every sheet closes with (text size, the chooser), easy to find.
              className="sheet-close ml-1"
            >
              <CloseIcon className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        {copy ? (
          <>
            {/* Progressive underline category filter bar (active whenever any category matches) */}
            {showCategoryTabs ? (
              <div
                role="tablist"
                aria-label={copy.modalLabel}
                className="flex shrink-0 items-center overflow-x-auto border-b border-ink-900/10 px-4 [scrollbar-width:none] dark:border-paper/10 sm:px-6 [&::-webkit-scrollbar]:hidden"
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
                        "tab-ink inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-md px-3 text-body font-medium whitespace-nowrap transition-colors duration-(--dur-fast) ease-(--ease-out-calm) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring motion-reduce:transition-none",
                        isSelected
                          ? "text-sapphire dark:text-sapphire-border"
                          : "text-muted-foreground hover:text-foreground dark:text-mist dark:hover:text-paper",
                      )}
                    >
                      <span>{copy.categories[cat]}</span>
                      <span className="text-meta font-normal tabular-nums text-muted-foreground dark:text-mist">
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
                      <p className="text-meta font-medium text-muted-foreground dark:text-mist">
                        {recentSearches.length > 0 ? copy.recentSearchesLabel : contextual.contextLabel}
                      </p>
                      {recentSearches.length > 0 ? (
                        <button
                          type="button"
                          onClick={clearRecentSearches}
                          className="inline-flex min-h-11 items-center rounded-lg px-2 text-body font-medium whitespace-nowrap text-muted-foreground transition-colors hover:bg-ink-900/[0.04] hover:text-foreground dark:text-mist dark:hover:bg-paper/[0.06] dark:hover:text-paper"
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
                                className="h-4 w-4 shrink-0 text-muted-foreground dark:text-mist"
                                aria-hidden="true"
                              />
                              <span className="min-w-0 flex-1 text-body leading-snug text-foreground dark:text-paper">
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
                      className="px-2 pb-1.5 text-meta font-medium text-muted-foreground dark:text-mist"
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
                                <span className="min-w-0 text-body leading-snug font-medium text-foreground dark:text-paper">
                                  {journey.title}
                                </span>
                              </span>
                              <ChevronDownIcon
                                className={cn(
                                  "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-(--dur-base) ease-(--ease-out-calm) motion-reduce:transition-none dark:text-mist",
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
                                <div className="space-y-3 px-2.5 pt-0.5 pb-3.5 sm:pl-9">
                                  <p className="text-body text-muted-foreground dark:text-mist">
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
                                        className="inline-flex min-h-11 items-center rounded-lg bg-ink-900/[0.04] px-2.5 text-body font-medium whitespace-nowrap text-foreground transition-colors hover:bg-ink-900/[0.08] sm:px-3 dark:bg-paper/[0.06] dark:text-paper dark:hover:bg-paper/[0.12]"
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
                                          className="group inline-flex min-h-11 items-center text-body font-semibold whitespace-nowrap text-sapphire dark:text-sapphire-border"
                                        >
                                          <span>{action.label}</span>
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
              ) : catalogFailed ? (
                failureNotice
              ) : (
                <div className="space-y-4">
                  {/* Immediate urgent 112 notice when serious symptoms detected */}
                  {catalogResponse.isEmergency ? (
                    <div
                      role="alert"
                      className="rounded-xl border border-primary/35 bg-primary-soft p-4 dark:border-ruby-300/40 dark:bg-primary/15"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="space-y-1">
                          <p className="text-body font-semibold text-foreground dark:text-paper">
                            {copy.emergencyTitle}
                          </p>
                          <p className="text-body text-foreground dark:text-paper">
                            {copy.emergencyBody}
                          </p>
                        </div>
                        <Button
                          href="tel:112"
                          variant="primary"
                          size="md"
                          className="shrink-0"
                        >
                          <PhoneIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
                          <span>{copy.emergencyCallLabel}</span>
                        </Button>
                      </div>
                    </div>
                  ) : null}

                  {/* Live predictive query completions while typing */}
                  {livePredictions.length > 0 ? (
                    <div
                      role="group"
                      aria-label={copy.popularQueriesLabel}
                      className="-mx-4 flex items-center gap-2 overflow-x-auto px-4 pb-0.5 [scrollbar-width:none] sm:-mx-6 sm:px-6 [&::-webkit-scrollbar]:hidden"
                    >
                      {livePredictions.map((prediction) => (
                        <button
                          key={prediction}
                          type="button"
                          onClick={() => {
                            applyQuery(prediction, true);
                            inputRef.current?.focus();
                          }}
                          className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-lg border border-ink-900/12 bg-ink-900/[0.025] px-3 py-1.5 text-body font-medium whitespace-nowrap text-foreground transition-colors duration-(--dur-fast) ease-(--ease-out-calm) hover:border-sapphire/35 hover:bg-sapphire-soft/55 hover:text-sapphire motion-reduce:transition-none dark:border-paper/14 dark:bg-paper/[0.05] dark:text-paper dark:hover:border-sapphire-border/45 dark:hover:bg-paper/[0.1]"
                        >
                          <SearchIcon
                            className="h-3.5 w-3.5 shrink-0 text-sapphire dark:text-sapphire-border"
                            aria-hidden="true"
                          />
                          <span>{prediction}</span>
                        </button>
                      ))}
                    </div>
                  ) : null}

                  {/* Did you mean correction */}
                  {catalogResponse.didYouMean ? (
                    <p className="px-1 text-body text-muted-foreground dark:text-mist">
                      <span>{copy.didYouMeanPrefix} </span>
                      <button
                        type="button"
                        onClick={() => {
                          applyQuery(catalogResponse.didYouMean!, true);
                          inputRef.current?.focus();
                        }}
                        className="group inline-flex min-h-11 items-center font-semibold whitespace-nowrap text-sapphire transition-colors duration-(--dur-fast) ease-(--ease-out-calm) hover:text-sapphire-light motion-reduce:transition-none dark:text-sapphire-border"
                      >
                        <span>{catalogResponse.didYouMean}</span>
                      </button>
                    </p>
                  ) : null}

                  {/* Grounded Guidance Synthesis */}
                  {overview && overviewBody ? (
                    <section
                      aria-label={copy.aiAnswerTitle}
                      className="rounded-(--radius-surface) border border-sapphire/18 bg-sapphire-soft/75 p-4 shadow-(--shadow-card-rest) sm:p-5 dark:border-sapphire-border/22 dark:bg-white/[0.05]"
                    >
                      <p className="mb-1.5 text-meta font-semibold text-sapphire dark:text-sapphire-border">
                        {copy.aiAnswerTitle}
                      </p>

                      {/* Keyed: when a fuller remote answer replaces the catalogue synthesis, it settles in instead of snapping. */}
                      <p
                        key={hasDistinctRemoteAnswer ? "answer" : "lead"}
                        className={cn(
                          "text-body leading-relaxed text-foreground dark:text-paper",
                          hasDistinctRemoteAnswer && "swap-in",
                        )}
                      >
                        {overviewBody}
                      </p>

                      <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2">
                        <Link
                          href={overview.primaryAction.href}
                          onClick={() => handleFollowLink(overview.primaryAction.href, true)}
                          className="group inline-flex min-h-11 items-center rounded-lg border border-sapphire/25 bg-white/85 px-3 py-1.5 text-body font-semibold whitespace-nowrap text-sapphire transition-colors duration-(--dur-fast) ease-(--ease-out-calm) hover:border-sapphire/50 hover:bg-white motion-reduce:transition-none dark:border-sapphire-border/35 dark:bg-ink-900/70 dark:text-sapphire-border dark:hover:bg-ink-900"
                        >
                          <span>{overview.primaryAction.label}</span>
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
                            className="inline-flex min-h-11 items-center gap-1.5 rounded-lg px-2.5 text-body font-medium whitespace-nowrap text-muted-foreground transition-colors hover:bg-ink-900/[0.04] hover:text-foreground dark:text-mist dark:hover:bg-paper/[0.06] dark:hover:text-paper"
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
                            <div className="mt-2.5 space-y-2.5 border-t border-sapphire/12 pt-3 dark:border-sapphire-border/15">
                              {overview.steps.length > 0 ? (
                                <ol className="list-decimal space-y-1.5 pl-5 text-body text-foreground dark:text-paper">
                                  {overview.steps.map((step) => (
                                    <li key={step}>{step}</li>
                                  ))}
                                </ol>
                              ) : null}

                              {hasDistinctRemoteAnswer ? (
                                <p className="text-meta text-muted-foreground dark:text-mist">
                                  {copy.aiAnswerDisclaimer}
                                </p>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      ) : null}

                      {catalogResponse.suggestedFollowups.length > 0 ? (
                        <div className="mt-2.5 flex flex-wrap items-center gap-2 border-t border-sapphire/12 pt-2.5 dark:border-sapphire-border/15">
                          {catalogResponse.suggestedFollowups.map((follow) => (
                            <button
                              key={follow}
                              type="button"
                              onClick={() => {
                                applyQuery(follow, true);
                                inputRef.current?.focus();
                              }}
                              className="group inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-sapphire/16 bg-white/90 px-3 py-1.5 text-meta font-medium whitespace-nowrap text-sapphire shadow-[0_1px_2px_rgba(12,18,32,0.04)] transition-colors duration-(--dur-fast) ease-(--ease-out-calm) hover:border-sapphire/35 hover:bg-white hover:text-sapphire-light motion-reduce:transition-none dark:border-sapphire-border/22 dark:bg-ink-900/75 dark:text-sapphire-border dark:hover:bg-ink-900"
                            >
                              <SearchIcon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                              <span>{follow}</span>
                            </button>
                          ))}
                        </div>
                      ) : null}
                    </section>
                  ) : null}

                  {/* Clean single-column Google result rows */}
                  {isWaitingForCatalog && results.length === 0 ? (
                    <p className="px-1 text-body text-muted-foreground dark:text-mist">{triggerCopy.searching}</p>
                  ) : results.length === 0 ? (
                    <div className="swap-in rounded-xl border border-ink-900/10 px-5 py-7 text-center dark:border-paper/10">
                      <p className="text-body font-semibold text-foreground dark:text-paper">
                        {copy.emptyTitle}
                      </p>
                      <p className="mx-auto mt-1.5 max-w-md text-body text-muted-foreground dark:text-mist">
                        {copy.noResultsHint}
                      </p>
                      {/* Three searches that do return something, so a failed search still has a next step. */}
                      <div className="mx-auto mt-4 max-w-md text-left">
                        <p className="px-2.5 text-meta font-medium text-muted-foreground dark:text-mist">
                          {copy.popularQueriesLabel}
                        </p>
                        <ul className="mt-1 space-y-0.5">
                          {copy.popularQueries.slice(0, 3).map((popular) => (
                            <li key={popular}>
                              <button
                                type="button"
                                onClick={() => {
                                  applyQuery(popular, true);
                                  inputRef.current?.focus();
                                }}
                                className="flex min-h-11 w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-ink-900/[0.04] dark:hover:bg-paper/[0.05]"
                              >
                                <SearchIcon
                                  className="h-4 w-4 shrink-0 text-muted-foreground dark:text-mist"
                                  aria-hidden="true"
                                />
                                <span className="min-w-0 flex-1 text-body leading-snug text-foreground dark:text-paper">
                                  {popular}
                                </span>
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                        <Button
                          href={assistantHref}
                          variant="action"
                          size="md"
                          onClick={() => handleFollowLink(assistantHref, false)}
                        >
                          <span>{copy.askAssistantLabel}</span>
                        </Button>
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
                              "list-in rounded-lg px-3 py-3.5 transition-colors duration-(--dur-fast) ease-(--ease-out-calm) motion-reduce:transition-none",
                              isHighlighted && "bg-ink-900/[0.035] dark:bg-paper/[0.05]",
                            )}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <Link
                                href={result.href}
                                onClick={() => handleFollowLink(result.href, true)}
                                className="group min-w-0 flex-1 py-0.5"
                              >
                                <h3 className="text-body leading-snug font-semibold text-sapphire transition-colors duration-(--dur-fast) ease-(--ease-out-calm) group-hover:text-sapphire-light motion-reduce:transition-none dark:text-sapphire-border">
                                  {result.title}
                                </h3>
                                <p className="mt-1 text-body text-muted-foreground dark:text-mist">
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
                                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-ink-900/[0.05] hover:text-foreground dark:text-mist dark:hover:bg-paper/[0.08] dark:hover:text-paper"
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
                                    <p className="text-body text-foreground dark:text-paper">
                                      {result.summary}
                                    </p>
                                  ) : null}

                                  {result.nextSteps.length > 0 ? (
                                    <ul className="list-disc space-y-1 pl-5 text-body text-foreground dark:text-paper">
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
                                        className="inline-flex min-h-11 items-center gap-1.5 text-body font-medium whitespace-nowrap text-muted-foreground transition-colors hover:text-foreground dark:text-mist dark:hover:text-paper"
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
                                      className="group inline-flex min-h-11 items-center text-body font-semibold whitespace-nowrap text-sapphire transition-colors duration-(--dur-fast) ease-(--ease-out-calm) hover:text-sapphire-light motion-reduce:transition-none dark:text-sapphire-border"
                                    >
                                      <span>{copy.openPageLabel}</span>
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
                      className="rounded-(--radius-surface) border border-ink-900/10 bg-muted/35 p-3 sm:p-4 dark:border-paper/10 dark:bg-white/[0.03]"
                    >
                      <p
                        id={`${baseId}-related`}
                        className="px-2 pb-1.5 text-meta font-medium text-muted-foreground dark:text-mist"
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
                                <span className="min-w-0 flex-1 text-body leading-snug font-medium text-foreground dark:text-paper">
                                  {rq.question}
                                </span>
                                <ChevronDownIcon
                                  className={cn(
                                    "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-(--dur-base) ease-(--ease-out-calm) motion-reduce:transition-none dark:text-mist",
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
                                    <p className="text-body text-muted-foreground dark:text-mist">
                                      {rq.answer}
                                    </p>
                                    {rq.href ? (
                                      <Link
                                        href={rq.href}
                                        onClick={() => handleFollowLink(rq.href!, true)}
                                        className="group inline-flex min-h-11 items-center text-body font-semibold whitespace-nowrap text-sapphire transition-colors duration-(--dur-fast) ease-(--ease-out-calm) hover:text-sapphire-light motion-reduce:transition-none dark:text-sapphire-border"
                                      >
                                        <span>{rq.linkLabel ?? copy.openPageLabel}</span>
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
          </>
        ) : (
          // The sheet's own copy is still on its way (slow connection) or could not be fetched.
          <div
            data-modal-scroller="true"
            className="min-h-40 flex-1 overflow-y-auto overscroll-contain px-4 py-4 pb-[calc(1.25rem+env(safe-area-inset-bottom))] sm:px-6"
          >
            {copyLoadFailed ? (
              failureNotice
            ) : trimmedQuery ? (
              <p className="px-1 text-body text-muted-foreground dark:text-mist">{triggerCopy.searching}</p>
            ) : null}
          </div>
        )}
      </m.div>
    </div>
  );

  return createPortal(dialog, document.body);
}
