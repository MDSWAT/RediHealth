"use client";

import { useMemo, useRef, useState } from "react";
import { AdminShell } from "@/components/panel/AdminShell";
import { usePanelRuntime } from "@/components/panel/PanelRuntime";
import { csvTimestamp, downloadCsv } from "@/components/panel/panel-csv";
import { Container } from "@/components/ui/Container";
import {
  CloseIcon,
  DownloadIcon,
  RefreshIcon,
  ShieldIcon,
  TagIcon,
  TrashIcon,
} from "@/components/ui/icons";
import { feedbackAnalyticsCopy } from "@/lib/i18n/feedback-analytics-translations";
import { feedbackAdminCopy, feedbackWidgetCopy } from "@/lib/i18n/feedback-translations";
import { useLanguage } from "@/lib/i18n/language-context";
import { langToLocale } from "@/lib/i18n/panel-translations";
import { formatPanelDate } from "@/lib/panel-dates";
import {
  computeFeedbackBreakdowns,
  computeFeedbackTrends,
  extractFeedbackKeywords,
  type FeedbackKeywordWeight,
} from "@/lib/platform-feedback-analytics";
import {
  AGE_GROUP_OPTIONS,
  computeFeedbackSummary,
  RATING_KEYS,
  type FeedbackAgeGroup,
  type PlatformFeedbackItem,
} from "@/lib/platform-feedback-shared";

type FeedbackDashboardProps = {
  initialItems: PlatformFeedbackItem[];
  userEmail: string;
  userRole?: string;
  isAdmin?: boolean;
  isSuperAdmin?: boolean;
  databaseAvailable: boolean;
};

const SUPPORTED_FILTER_LANGS = ["ro", "en", "sq", "it", "hr", "rom", "ru"] as const;

const KEYWORD_SIZE_CLASSES: Record<FeedbackKeywordWeight, string> = {
  1: "min-h-8 px-2.5 py-1.5 text-xs font-normal",
  2: "min-h-8 px-2.5 py-1.5 text-xs font-medium",
  3: "min-h-9 px-3 py-1.5 text-sm font-medium",
  4: "min-h-9 px-3 py-1.5 text-[15px] font-semibold",
  5: "min-h-9 px-3.5 py-1.5 text-base font-semibold",
};

const KEYWORD_TONE_CLASSES: Record<FeedbackKeywordWeight, string> = {
  1: "border-border bg-surface-subtle/60 text-muted-foreground hover:border-border-control hover:text-foreground",
  2: "border-border bg-surface-subtle text-foreground hover:border-border-control",
  3: "border-border bg-card text-foreground hover:border-sapphire-border hover:bg-sapphire-soft/50 dark:hover:bg-sapphire/20",
  4: "border-sapphire-border bg-sapphire-soft/60 text-sapphire hover:bg-sapphire-soft dark:border-sapphire-border/40 dark:bg-sapphire/25 dark:text-on-sapphire-muted",
  5: "border-sapphire bg-sapphire-soft text-sapphire hover:bg-sapphire-soft/85 dark:border-sapphire-border/70 dark:bg-sapphire/40 dark:text-white",
};

function ratingToneClass(score: number): string {
  if (score >= 4.0) return "text-wellness dark:text-wellness-border";
  if (score >= 3.0) return "text-amber-care dark:text-amber-care-border";
  return "text-clinical-ruby dark:text-ruby-300";
}

function ratingDotClass(score: number): string {
  if (score >= 4.0) return "bg-wellness";
  if (score >= 3.0) return "bg-amber-care";
  return "bg-clinical-ruby";
}

export function FeedbackDashboard({
  initialItems,
  userEmail,
  userRole,
  isAdmin,
  isSuperAdmin,
  databaseAvailable,
}: FeedbackDashboardProps) {
  const { lang } = useLanguage();
  const { request: panelFetch } = usePanelRuntime();
  const locale = langToLocale[lang];
  const t = feedbackAdminCopy[lang] ?? feedbackAdminCopy.ro;
  const widgetCopy = feedbackWidgetCopy[lang] ?? feedbackWidgetCopy.ro;
  const analyticsCopy = feedbackAnalyticsCopy[lang] ?? feedbackAnalyticsCopy.ro;

  const [items, setItems] = useState<PlatformFeedbackItem[]>(initialItems);
  const [search, setSearch] = useState("");
  const [langFilter, setLangFilter] = useState<string>("");
  const [ageFilter, setAgeFilter] = useState<FeedbackAgeGroup | "">("");
  const [selectedKeyword, setSelectedKeyword] = useState<string | null>(null);
  const [activeTrendKey, setActiveTrendKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const responsesSectionRef = useRef<HTMLElement | null>(null);

  const baseFilteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((item) => {
      if (langFilter && item.lang !== langFilter) return false;
      if (ageFilter && item.age_group !== ageFilter) return false;
      if (!q) return true;
      return [
        item.open_feedback || "",
        item.locality || "",
        item.occupation || "",
        item.page_path || "",
      ].some((field) => field.toLowerCase().includes(q));
    });
  }, [items, search, langFilter, ageFilter]);

  const summary = useMemo(() => computeFeedbackSummary(baseFilteredItems), [baseFilteredItems]);
  const keywords = useMemo(
    () => extractFeedbackKeywords(baseFilteredItems, { maxTerms: 24 }),
    [baseFilteredItems],
  );
  const trends = useMemo(
    () => computeFeedbackTrends(baseFilteredItems, locale),
    [baseFilteredItems, locale],
  );
  const breakdowns = useMemo(
    () => computeFeedbackBreakdowns(baseFilteredItems),
    [baseFilteredItems],
  );

  const activeKeyword = useMemo(
    () => keywords.find((kw) => kw.normalized === selectedKeyword) ?? null,
    [keywords, selectedKeyword],
  );

  const displayedItems = useMemo(() => {
    if (!activeKeyword) return baseFilteredItems;
    const matched = new Set(activeKeyword.matchedIds);
    return baseFilteredItems.filter((item) => matched.has(item.id));
  }, [baseFilteredItems, activeKeyword]);

  const activeTrendBucket = useMemo(() => {
    if (trends.buckets.length === 0) return null;
    if (activeTrendKey) {
      const found = trends.buckets.find((bucket) => bucket.key === activeTrendKey);
      if (found) return found;
    }
    return trends.buckets[trends.buckets.length - 1];
  }, [trends.buckets, activeTrendKey]);

  const maxTrendCount = useMemo(
    () => trends.buckets.reduce((max, bucket) => Math.max(max, bucket.count), 1),
    [trends.buckets],
  );
  const maxPageCount = useMemo(
    () => breakdowns.byPage.reduce((max, row) => Math.max(max, row.count), 1),
    [breakdowns.byPage],
  );
  const maxLangCount = useMemo(
    () => breakdowns.byLanguage.reduce((max, row) => Math.max(max, row.count), 1),
    [breakdowns.byLanguage],
  );

  const isFiltered = Boolean(search.trim() || langFilter || ageFilter || activeKeyword);

  function handleToggleKeyword(normalized: string) {
    if (activeKeyword?.normalized === normalized) {
      setSelectedKeyword(null);
      return;
    }
    setSelectedKeyword(normalized);
    if (typeof window !== "undefined" && responsesSectionRef.current) {
      const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
      responsesSectionRef.current.scrollIntoView({
        behavior: reducedMotion ? "auto" : "smooth",
        block: "nearest",
      });
    }
  }

  async function handleRefresh() {
    setLoading(true);
    try {
      const response = await panelFetch("/api/admin/feedback?limit=250");
      if (!response.ok) return;
      const data = (await response.json()) as { items?: PlatformFeedbackItem[] };
      if (Array.isArray(data.items)) {
        setItems(data.items);
      }
    } catch (error) {
      console.error("Failed to refresh platform feedback", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm(t.deleteConfirm)) return;
    setDeletingId(id);
    try {
      const response = await panelFetch(`/api/admin/feedback?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setItems((prev) => prev.filter((entry) => entry.id !== id));
      }
    } catch (error) {
      console.error("Failed to delete feedback item", error);
    } finally {
      setDeletingId(null);
    }
  }

  function handleExportCsv() {
    const headers = [
      "ID",
      t.tableWhen,
      "Country",
      "Lang",
      widgetCopy.questions.rating_usefulness.label,
      widgetCopy.questions.rating_ease_of_use.label,
      widgetCopy.questions.rating_visual_design.label,
      widgetCopy.questions.rating_content_clarity.label,
      widgetCopy.questions.rating_future_use.label,
      t.overallScore,
      t.tableOpenAnswer,
      widgetCopy.genderLabel,
      widgetCopy.ageGroupLabel,
      widgetCopy.maritalStatusLabel,
      widgetCopy.localityLabel,
      widgetCopy.occupationLabel,
    ];

    const rows = displayedItems.map((entry) => [
      entry.id,
      csvTimestamp(entry.created_at),
      entry.country_code,
      entry.lang,
      entry.rating_usefulness,
      entry.rating_ease_of_use,
      entry.rating_visual_design,
      entry.rating_content_clarity,
      entry.rating_future_use,
      entry.average_rating.toFixed(2),
      entry.open_feedback || "",
      entry.gender ? widgetCopy.genderOptions[entry.gender] : "",
      entry.age_group ? widgetCopy.ageGroupOptions[entry.age_group] : "",
      entry.marital_status ? widgetCopy.maritalStatusOptions[entry.marital_status] : "",
      entry.locality || "",
      entry.occupation || "",
    ]);

    downloadCsv(`redihealth-feedback-${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
  }

  function formatGender(key: string) {
    if (key in widgetCopy.genderOptions) {
      return widgetCopy.genderOptions[key as keyof typeof widgetCopy.genderOptions];
    }
    return t.unspecified;
  }

  function formatAge(key: string) {
    if (key in widgetCopy.ageGroupOptions) {
      return widgetCopy.ageGroupOptions[key as keyof typeof widgetCopy.ageGroupOptions];
    }
    return t.unspecified;
  }

  function formatMarital(key: string) {
    if (key in widgetCopy.maritalStatusOptions) {
      return widgetCopy.maritalStatusOptions[key as keyof typeof widgetCopy.maritalStatusOptions];
    }
    return t.unspecified;
  }

  return (
    <AdminShell userEmail={userEmail} userRole={userRole} isAdmin={isAdmin || isSuperAdmin}>
      <main id="main-content" className="min-h-screen py-8 sm:py-10">
        <Container>
          {/* Header */}
          <div className="mb-6 flex flex-col gap-4 border-b border-border pb-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                {t.title}
              </h1>
              <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
                {t.subtitle}
              </p>
              <div className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground">
                <ShieldIcon className="h-4 w-4 text-primary" />
                <span>{t.privacyBadge}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleExportCsv}
                disabled={displayedItems.length === 0}
                className="crm-button"
              >
                <DownloadIcon className="h-4 w-4" />
                <span className="tabular-nums">
                  {isFiltered && displayedItems.length > 0
                    ? `${t.exportCsv} (${displayedItems.length})`
                    : t.exportCsv}
                </span>
              </button>
              <button
                type="button"
                onClick={handleRefresh}
                disabled={loading || !databaseAvailable}
                className="crm-button crm-primary"
              >
                <RefreshIcon className="h-4 w-4" />
                <span>{loading ? t.refreshing : t.refresh}</span>
              </button>
            </div>
          </div>

          {!databaseAvailable ? (
            <p className="rounded-xl border border-border bg-card p-6 text-sm leading-relaxed text-foreground">
              {t.noDatabase}
            </p>
          ) : (
            <div className="space-y-6">
              {/* Summary Strip */}
              <section aria-label={t.overallScore} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border border-border bg-card p-5">
                  <p className="text-xs font-medium text-muted-foreground">{t.totalResponses}</p>
                  <p className="mt-2 text-3xl font-bold tabular-nums text-foreground">
                    {summary.totalResponses}
                  </p>
                </div>

                <div className="rounded-xl border border-border bg-card p-5">
                  <p className="text-xs font-medium text-muted-foreground">{t.overallScore}</p>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-3xl font-bold tabular-nums text-primary">
                      {summary.overallAverage.toFixed(2)}
                    </span>
                    <span className="text-xs text-muted-foreground">{t.outOfFive}</span>
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-card p-5">
                  <p className="text-xs font-medium text-muted-foreground">{t.openAnswersCount}</p>
                  <p className="mt-2 text-3xl font-bold tabular-nums text-foreground">
                    {summary.withOpenFeedbackCount}
                  </p>
                </div>

                <div className="rounded-xl border border-border bg-card p-5">
                  <p className="text-xs font-medium text-muted-foreground">{t.anonymizedCount}</p>
                  <p className="mt-2 text-3xl font-bold tabular-nums text-foreground">
                    {summary.anonymizedCount}
                  </p>
                </div>
              </section>

              {/* Satisfaction Tiers Summary Bar */}
              <section
                aria-labelledby="satisfaction-tiers-heading"
                className="rounded-xl border border-border bg-card p-5 sm:p-6"
              >
                <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                  <div>
                    <h2 id="satisfaction-tiers-heading" className="text-lg font-semibold text-foreground">
                      {analyticsCopy.satisfactionHeading}
                    </h2>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {analyticsCopy.satisfactionSubtitle}
                    </p>
                  </div>
                  {breakdowns.total > 0 ? (
                    <span className="text-xs font-medium tabular-nums text-muted-foreground">
                      {analyticsCopy.responsesCountShort(breakdowns.total)}
                    </span>
                  ) : null}
                </div>

                {breakdowns.total === 0 ? (
                  <p className="mt-4 text-sm text-muted-foreground">{analyticsCopy.tierEmpty}</p>
                ) : (
                  <div className="mt-4 space-y-4">
                    <div
                      className="flex h-2.5 w-full overflow-hidden rounded-full bg-surface-subtle"
                      role="img"
                      aria-label={`${analyticsCopy.tierPositive}: ${breakdowns.tiers.positive.sharePct}%, ${analyticsCopy.tierNeutral}: ${breakdowns.tiers.neutral.sharePct}%, ${analyticsCopy.tierNeedsAttention}: ${breakdowns.tiers.needsAttention.sharePct}%`}
                    >
                      {breakdowns.tiers.positive.count > 0 ? (
                        <div
                          className="h-full bg-wellness transition-[width] duration-(--dur-base) ease-(--ease-out-calm)"
                          style={{ width: `${(breakdowns.tiers.positive.count / breakdowns.total) * 100}%` }}
                        />
                      ) : null}
                      {breakdowns.tiers.neutral.count > 0 ? (
                        <div
                          className="h-full bg-amber-care transition-[width] duration-(--dur-base) ease-(--ease-out-calm)"
                          style={{ width: `${(breakdowns.tiers.neutral.count / breakdowns.total) * 100}%` }}
                        />
                      ) : null}
                      {breakdowns.tiers.needsAttention.count > 0 ? (
                        <div
                          className="h-full bg-clinical-ruby transition-[width] duration-(--dur-base) ease-(--ease-out-calm)"
                          style={{
                            width: `${(breakdowns.tiers.needsAttention.count / breakdowns.total) * 100}%`,
                          }}
                        />
                      ) : null}
                    </div>

                    <div className="grid gap-3 border-t border-border/60 pt-4 sm:grid-cols-3">
                      <div className="flex items-center justify-between gap-3 sm:block">
                        <div className="flex items-center gap-2">
                          <span className="h-2.5 w-2.5 shrink-0 rounded-sm bg-wellness" aria-hidden="true" />
                          <span className="text-xs font-medium text-muted-foreground">
                            {analyticsCopy.tierPositive}
                          </span>
                        </div>
                        <div className="flex items-baseline gap-2 sm:mt-1.5">
                          <span className="text-xl font-bold tabular-nums text-foreground">
                            {breakdowns.tiers.positive.count}
                          </span>
                          <span className="text-xs font-medium tabular-nums text-muted-foreground">
                            {breakdowns.tiers.positive.sharePct}%
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-3 sm:block">
                        <div className="flex items-center gap-2">
                          <span className="h-2.5 w-2.5 shrink-0 rounded-sm bg-amber-care" aria-hidden="true" />
                          <span className="text-xs font-medium text-muted-foreground">
                            {analyticsCopy.tierNeutral}
                          </span>
                        </div>
                        <div className="flex items-baseline gap-2 sm:mt-1.5">
                          <span className="text-xl font-bold tabular-nums text-foreground">
                            {breakdowns.tiers.neutral.count}
                          </span>
                          <span className="text-xs font-medium tabular-nums text-muted-foreground">
                            {breakdowns.tiers.neutral.sharePct}%
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-3 sm:block">
                        <div className="flex items-center gap-2">
                          <span className="h-2.5 w-2.5 shrink-0 rounded-sm bg-clinical-ruby" aria-hidden="true" />
                          <span className="text-xs font-medium text-muted-foreground">
                            {analyticsCopy.tierNeedsAttention}
                          </span>
                        </div>
                        <div className="flex items-baseline gap-2 sm:mt-1.5">
                          <span className="text-xl font-bold tabular-nums text-foreground">
                            {breakdowns.tiers.needsAttention.count}
                          </span>
                          <span className="text-xs font-medium tabular-nums text-muted-foreground">
                            {breakdowns.tiers.needsAttention.sharePct}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </section>

              {/* Trends Over Time + Interactive Keyword Cloud */}
              <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
                {/* Responses and average rating over time */}
                <section
                  aria-labelledby="feedback-trends-heading"
                  className="rounded-xl border border-border bg-card p-5 sm:p-6"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 id="feedback-trends-heading" className="text-lg font-semibold text-foreground">
                        {analyticsCopy.trendsHeading}
                      </h2>
                      <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1.5">
                          <span className="h-2.5 w-2.5 rounded-xs bg-sapphire/80 dark:bg-sapphire-border/80" aria-hidden="true" />
                          <span>{analyticsCopy.trendsResponsesLabel}</span>
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-wellness" aria-hidden="true" />
                          <span>{analyticsCopy.trendsAvgRatingLabel}</span>
                        </span>
                      </div>
                    </div>

                    {trends.buckets.length > 0 ? (
                      <span className="rounded-md border border-border bg-surface-subtle px-2.5 py-1 text-xs font-medium text-muted-foreground">
                        {trends.granularity === "day"
                          ? analyticsCopy.trendsDailyLabel
                          : analyticsCopy.trendsWeeklyLabel}
                      </span>
                    ) : null}
                  </div>

                  {trends.buckets.length === 0 ? (
                    <p className="mt-5 rounded-lg border border-dashed border-border bg-surface-subtle/50 p-4 text-sm text-muted-foreground">
                      {analyticsCopy.trendsEmpty}
                    </p>
                  ) : (
                    <div className="mt-4 space-y-3">
                      {activeTrendBucket ? (
                        <div
                          aria-live="polite"
                          className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/70 bg-surface-subtle/60 px-3 py-2 text-xs"
                        >
                          <span className="font-medium text-foreground">
                            {analyticsCopy.trendsBucketSummary(
                              activeTrendBucket.label,
                              activeTrendBucket.count,
                              activeTrendBucket.avgRating.toFixed(2),
                            )}
                          </span>
                          <span
                            className={`font-semibold tabular-nums ${ratingToneClass(activeTrendBucket.avgRating)}`}
                          >
                            {activeTrendBucket.avgRating.toFixed(2)} / 5
                          </span>
                        </div>
                      ) : null}

                      <div className="overflow-x-auto pb-1">
                        <div className="flex min-w-full items-end gap-1.5 border-b border-border pt-2">
                          {trends.buckets.map((bucket) => {
                            const barPct = Math.max(10, Math.round((bucket.count / maxTrendCount) * 100));
                            const isActive = activeTrendBucket?.key === bucket.key;
                            return (
                              <button
                                key={bucket.key}
                                type="button"
                                aria-pressed={isActive}
                                onMouseEnter={() => setActiveTrendKey(bucket.key)}
                                onFocus={() => setActiveTrendKey(bucket.key)}
                                onClick={() => setActiveTrendKey(bucket.key)}
                                aria-label={analyticsCopy.trendsBucketSummary(
                                  bucket.label,
                                  bucket.count,
                                  bucket.avgRating.toFixed(2),
                                )}
                                className={`group flex min-w-[46px] flex-1 flex-col items-center rounded-t-lg px-1 pt-1 pb-2 text-center transition-colors duration-(--dur-fast) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
                                  isActive ? "bg-surface-subtle/80" : "hover:bg-surface-subtle/40"
                                }`}
                              >
                                <span
                                  className={`inline-flex items-center gap-1 text-[11px] font-semibold tabular-nums ${ratingToneClass(bucket.avgRating)}`}
                                >
                                  <span
                                    className={`h-1.5 w-1.5 shrink-0 rounded-full ${ratingDotClass(bucket.avgRating)}`}
                                    aria-hidden="true"
                                  />
                                  <span>{bucket.avgRating.toFixed(1)}</span>
                                </span>
                                <span className="mt-0.5 text-[11px] tabular-nums text-muted-foreground">
                                  {bucket.count}
                                </span>
                                <div className="mt-1.5 flex h-24 w-full items-end justify-center">
                                  <span
                                    className={`w-full max-w-[26px] rounded-t-sm transition-colors duration-(--dur-fast) ${
                                      isActive
                                        ? "bg-sapphire dark:bg-sapphire-border"
                                        : "bg-sapphire/70 group-hover:bg-sapphire/90 dark:bg-sapphire-border/60 dark:group-hover:bg-sapphire-border"
                                    }`}
                                    style={{ height: `${barPct}%` }}
                                  />
                                </div>
                              </button>
                            );
                          })}
                        </div>
                        <div className="mt-1.5 flex min-w-full gap-1.5">
                          {trends.buckets.map((bucket) => (
                            <span
                              key={bucket.key}
                              className="min-w-[46px] flex-1 truncate text-center text-[11px] tabular-nums text-muted-foreground"
                              title={bucket.label}
                            >
                              {bucket.label}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </section>

                {/* Interactive keyword cloud */}
                <section
                  aria-labelledby="feedback-keywords-heading"
                  className="rounded-xl border border-border bg-card p-5 sm:p-6"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h2 id="feedback-keywords-heading" className="text-lg font-semibold text-foreground">
                        {analyticsCopy.keywordCloudHeading}
                      </h2>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {analyticsCopy.keywordCloudSubtitle}
                      </p>
                    </div>
                    {activeKeyword ? (
                      <button
                        type="button"
                        onClick={() => setSelectedKeyword(null)}
                        className="inline-flex min-h-9 items-center gap-1 rounded-lg border border-border bg-surface-subtle px-2.5 text-xs font-medium text-foreground transition-colors duration-(--dur-fast) hover:border-border-control focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                      >
                        <CloseIcon className="h-3.5 w-3.5" />
                        <span>{analyticsCopy.keywordClear}</span>
                      </button>
                    ) : null}
                  </div>

                  {keywords.length === 0 ? (
                    <p className="mt-5 rounded-lg border border-dashed border-border bg-surface-subtle/50 p-4 text-sm text-muted-foreground">
                      {analyticsCopy.keywordCloudEmpty}
                    </p>
                  ) : (
                    <div
                      role="group"
                      aria-label={analyticsCopy.keywordCloudHeading}
                      className="mt-4 flex flex-wrap items-center gap-2"
                    >
                      {keywords.map((kw) => {
                        const isSelected = activeKeyword?.normalized === kw.normalized;
                        return (
                          <button
                            key={kw.normalized}
                            type="button"
                            aria-pressed={isSelected}
                            aria-label={analyticsCopy.keywordMentionsAria(kw.term, kw.count, isSelected)}
                            onClick={() => handleToggleKeyword(kw.normalized)}
                            className={`inline-flex items-center gap-1.5 rounded-lg border leading-tight transition-colors duration-(--dur-fast) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
                              KEYWORD_SIZE_CLASSES[kw.weight]
                            } ${
                              isSelected
                                ? "border-primary bg-primary text-white hover:bg-primary-hover"
                                : KEYWORD_TONE_CLASSES[kw.weight]
                            }`}
                          >
                            <span>{kw.term}</span>
                            <span
                              className={`tabular-nums text-[11px] font-medium ${
                                isSelected ? "text-white/90" : "opacity-75"
                              }`}
                            >
                              {kw.count}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </section>
              </div>

              {/* Ratings by Page and Language */}
              <section
                aria-labelledby="feedback-breakdowns-heading"
                className="rounded-xl border border-border bg-card p-5 sm:p-6"
              >
                <h2 id="feedback-breakdowns-heading" className="text-lg font-semibold text-foreground">
                  {analyticsCopy.breakdownsHeading}
                </h2>

                <div className="mt-4 grid gap-6 md:grid-cols-2 md:divide-x md:divide-border">
                  {/* Top pages */}
                  <div>
                    <h3 className="text-xs font-semibold text-muted-foreground">
                      {analyticsCopy.byPageHeading}
                    </h3>
                    {breakdowns.byPage.length === 0 ? (
                      <p className="mt-3 text-xs text-muted-foreground">{analyticsCopy.noBreakdownData}</p>
                    ) : (
                      <ul className="mt-3 space-y-3">
                        {breakdowns.byPage.map((row) => {
                          const widthPct = Math.max(6, Math.round((row.count / maxPageCount) * 100));
                          return (
                            <li key={row.pagePath} className="space-y-1">
                              <div className="flex items-baseline justify-between gap-3 text-xs">
                                <span
                                  className="min-w-0 truncate font-mono text-foreground"
                                  title={row.pagePath}
                                >
                                  {row.pagePath}
                                </span>
                                <span className="shrink-0 tabular-nums">
                                  <strong className={`font-semibold ${ratingToneClass(row.avgRating)}`}>
                                    {row.avgRating.toFixed(2)}
                                  </strong>
                                  <span className="text-muted-foreground"> · {row.count}</span>
                                </span>
                              </div>
                              <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-subtle">
                                <div
                                  className="h-full rounded-full bg-sapphire/75 dark:bg-sapphire-border/75"
                                  style={{ width: `${widthPct}%` }}
                                />
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>

                  {/* By language */}
                  <div className="md:pl-6">
                    <h3 className="text-xs font-semibold text-muted-foreground">
                      {analyticsCopy.byLanguageHeading}
                    </h3>
                    {breakdowns.byLanguage.length === 0 ? (
                      <p className="mt-3 text-xs text-muted-foreground">{analyticsCopy.noBreakdownData}</p>
                    ) : (
                      <ul className="mt-3 space-y-3">
                        {breakdowns.byLanguage.map((row) => {
                          const widthPct = Math.max(6, Math.round((row.count / maxLangCount) * 100));
                          return (
                            <li key={row.lang} className="space-y-1">
                              <div className="flex items-center justify-between gap-3 text-xs">
                                <div className="flex items-center gap-2">
                                  <span className="inline-flex min-w-10 items-center justify-center rounded border border-border bg-surface-subtle px-1.5 py-0.5 text-[11px] font-semibold text-foreground">
                                    {row.lang.toUpperCase()}
                                  </span>
                                  <span className="tabular-nums text-muted-foreground">
                                    {analyticsCopy.responsesCountShort(row.count)}
                                  </span>
                                </div>
                                <strong className={`shrink-0 font-semibold tabular-nums ${ratingToneClass(row.avgRating)}`}>
                                  {row.avgRating.toFixed(2)} / 5
                                </strong>
                              </div>
                              <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-subtle">
                                <div
                                  className="h-full rounded-full bg-primary/75"
                                  style={{ width: `${widthPct}%` }}
                                />
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                </div>
              </section>

              {/* 5 Evaluation Criteria + Demographics Breakdown */}
              <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
                <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
                  <h2 className="text-lg font-semibold text-foreground">{t.evaluationHeading}</h2>
                  <div className="mt-4 space-y-4">
                    {summary.dimensions.map((dim) => {
                      const q = widgetCopy.questions[dim.key];
                      const pct = Math.min(100, Math.max(0, (dim.average / 5) * 100));
                      return (
                        <div key={dim.key} className="space-y-1.5 border-b border-border/60 pb-3.5 last:border-b-0 last:pb-0">
                          <div className="flex items-baseline justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-foreground">{q.label}</p>
                              <p className="text-xs text-muted-foreground">{q.question}</p>
                            </div>
                            <span className="shrink-0 text-base font-bold tabular-nums text-primary">
                              {dim.average.toFixed(2)} / 5
                            </span>
                          </div>
                          <div className="h-2 w-full overflow-hidden rounded-full bg-surface-subtle">
                            <div
                              className="h-full rounded-full bg-primary transition-[width] duration-(--dur-base) ease-(--ease-out-calm)"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] tabular-nums text-muted-foreground">
                            {[1, 2, 3, 4, 5].map((score, idx) => (
                              <span key={score}>
                                {score}★: <strong className="font-semibold text-foreground">{dim.distribution[idx]}</strong>
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>

                <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
                  <h2 className="text-lg font-semibold text-foreground">{t.demographicsHeading}</h2>
                  <div className="mt-4 space-y-5 text-sm">
                    {/* Gender and Age Group */}
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <h3 className="text-xs font-semibold text-muted-foreground">
                          {widgetCopy.genderLabel}
                        </h3>
                        <ul className="mt-2 space-y-1.5">
                          {summary.demographics.gender.length === 0 ? (
                            <li className="text-xs text-muted-foreground">{t.unspecified}</li>
                          ) : (
                            summary.demographics.gender.map((bucket) => (
                              <li key={bucket.key} className="flex items-center justify-between gap-2 text-xs">
                                <span className="truncate text-muted-foreground">{formatGender(bucket.key)}</span>
                                <span className="shrink-0 font-semibold tabular-nums text-foreground">
                                  {bucket.count} ({bucket.sharePct}%)
                                </span>
                              </li>
                            ))
                          )}
                        </ul>
                      </div>

                      <div>
                        <h3 className="text-xs font-semibold text-muted-foreground">
                          {widgetCopy.ageGroupLabel}
                        </h3>
                        <ul className="mt-2 space-y-1.5">
                          {summary.demographics.ageGroup.length === 0 ? (
                            <li className="text-xs text-muted-foreground">{t.unspecified}</li>
                          ) : (
                            summary.demographics.ageGroup.map((bucket) => (
                              <li key={bucket.key} className="flex items-center justify-between gap-2 text-xs">
                                <span className="truncate text-muted-foreground">{formatAge(bucket.key)}</span>
                                <span className="shrink-0 font-semibold tabular-nums text-foreground">
                                  {bucket.count} ({bucket.sharePct}%)
                                </span>
                              </li>
                            ))
                          )}
                        </ul>
                      </div>
                    </div>

                    {/* Marital Status */}
                    <div className="border-t border-border/70 pt-4">
                      <h3 className="text-xs font-semibold text-muted-foreground">
                        {widgetCopy.maritalStatusLabel}
                      </h3>
                      <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
                        {summary.demographics.maritalStatus.length === 0 ? (
                          <li className="text-xs text-muted-foreground">{t.unspecified}</li>
                        ) : (
                          summary.demographics.maritalStatus.map((bucket) => (
                            <li key={bucket.key} className="flex items-center justify-between gap-2 text-xs">
                              <span className="truncate text-muted-foreground">{formatMarital(bucket.key)}</span>
                              <span className="shrink-0 font-semibold tabular-nums text-foreground">
                                {bucket.count} ({bucket.sharePct}%)
                              </span>
                            </li>
                          ))
                        )}
                      </ul>
                    </div>

                    {/* Top Localities and Occupations */}
                    <div className="grid gap-4 border-t border-border/70 pt-4 sm:grid-cols-2">
                      <div>
                        <h3 className="text-xs font-semibold text-muted-foreground">
                          {t.topLocalities}
                        </h3>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {summary.demographics.topLocalities.length === 0 ? (
                            <span className="text-xs text-muted-foreground">{t.unspecified}</span>
                          ) : (
                            summary.demographics.topLocalities.map((bucket) => (
                              <span
                                key={bucket.key}
                                className="inline-flex items-center gap-1 rounded-md border border-border bg-surface-subtle px-2 py-1 text-xs text-foreground"
                              >
                                <span>{bucket.key}</span>
                                <strong className="tabular-nums text-primary">{bucket.count}</strong>
                              </span>
                            ))
                          )}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-xs font-semibold text-muted-foreground">
                          {t.topOccupations}
                        </h3>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {summary.demographics.topOccupations.length === 0 ? (
                            <span className="text-xs text-muted-foreground">{t.unspecified}</span>
                          ) : (
                            summary.demographics.topOccupations.map((bucket) => (
                              <span
                                key={bucket.key}
                                className="inline-flex items-center gap-1 rounded-md border border-border bg-surface-subtle px-2 py-1 text-xs text-foreground"
                              >
                                <span>{bucket.key}</span>
                                <strong className="tabular-nums text-primary">{bucket.count}</strong>
                              </span>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              </div>

              {/* Filter Toolbar and Responses Table */}
              <section ref={responsesSectionRef} className="rounded-xl border border-border bg-card">
                <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                  <div className="flex flex-wrap items-baseline gap-2.5">
                    <h2 className="text-lg font-semibold text-foreground">{t.responsesHeading}</h2>
                    {isFiltered ? (
                      <span className="text-xs font-medium tabular-nums text-muted-foreground">
                        {analyticsCopy.filteredCountSummary(displayedItems.length, items.length)}
                      </span>
                    ) : null}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="search"
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder={t.searchPlaceholder}
                      className="min-h-10 w-full rounded-lg border border-border bg-card px-3 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring sm:w-64"
                    />
                    <select
                      value={langFilter}
                      onChange={(event) => setLangFilter(event.target.value)}
                      aria-label={t.allLanguages}
                      className="min-h-10 rounded-lg border border-border bg-card px-3 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring"
                    >
                      <option value="">{t.allLanguages}</option>
                      {SUPPORTED_FILTER_LANGS.map((code) => (
                        <option key={code} value={code}>
                          {code.toUpperCase()}
                        </option>
                      ))}
                    </select>
                    <select
                      value={ageFilter}
                      onChange={(event) => setAgeFilter(event.target.value as FeedbackAgeGroup | "")}
                      aria-label={t.allAgeGroups}
                      className="min-h-10 rounded-lg border border-border bg-card px-3 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring"
                    >
                      <option value="">{t.allAgeGroups}</option>
                      {AGE_GROUP_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {widgetCopy.ageGroupOptions[opt]}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {activeKeyword ? (
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-sapphire-border bg-sapphire-soft/75 px-4 py-2.5 sm:px-5 dark:border-sapphire-border/40 dark:bg-sapphire/25">
                    <div className="inline-flex items-center gap-2 text-xs font-medium text-sapphire dark:text-on-sapphire-muted">
                      <TagIcon className="h-4 w-4 shrink-0" />
                      <span className="tabular-nums">
                        {analyticsCopy.keywordActiveFilter(activeKeyword.term, displayedItems.length)}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedKeyword(null)}
                      className="inline-flex min-h-9 items-center gap-1 rounded-lg border border-sapphire-border bg-card px-2.5 text-xs font-medium text-sapphire transition-colors duration-(--dur-fast) hover:bg-sapphire-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring dark:border-sapphire-border/50 dark:bg-sapphire/30 dark:text-on-sapphire-muted dark:hover:bg-sapphire/45"
                    >
                      <CloseIcon className="h-3.5 w-3.5" />
                      <span>{analyticsCopy.keywordClear}</span>
                    </button>
                  </div>
                ) : null}

                {displayedItems.length === 0 ? (
                  <p className="p-6 text-sm text-muted-foreground">{t.emptyState}</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                      <thead className="border-b border-border bg-surface-subtle text-xs font-semibold text-muted-foreground">
                        <tr>
                          <th className="px-4 py-3">{t.tableWhen}</th>
                          <th className="px-4 py-3">{t.tableScores}</th>
                          <th className="px-4 py-3">{t.tableOpenAnswer}</th>
                          <th className="px-4 py-3">{t.tableDemographics}</th>
                          <th className="px-4 py-3 text-right">{t.tableActions}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {displayedItems.map((entry) => (
                          <tr
                            key={entry.id}
                            className={`border-b border-border/70 align-top last:border-b-0 ${
                              activeKeyword ? "bg-sapphire-soft/20 dark:bg-sapphire/15" : ""
                            }`}
                          >
                            <td className="whitespace-nowrap px-4 py-3.5 text-xs text-muted-foreground">
                              <p className="font-medium text-foreground">
                                {formatPanelDate(entry.created_at, locale, "dateTime")}
                              </p>
                              <p className="mt-0.5 text-[11px] text-muted-foreground">
                                {entry.country_code} · {entry.lang.toUpperCase()}
                                {entry.page_path ? ` · ${entry.page_path}` : ""}
                              </p>
                            </td>

                            <td className="px-4 py-3.5">
                              <div className="inline-flex items-center gap-1.5 rounded-md bg-primary-soft px-2 py-0.5 text-xs font-bold tabular-nums text-primary dark:bg-primary/20">
                                <span>{entry.average_rating.toFixed(1)} / 5</span>
                              </div>
                              <dl className="mt-2 grid grid-cols-1 gap-0.5 text-xs text-muted-foreground">
                                {RATING_KEYS.map((key) => (
                                  <div key={key} className="flex items-center justify-between gap-3">
                                    <dt className="truncate text-muted-foreground">
                                      {widgetCopy.questions[key].label}
                                    </dt>
                                    <dd className="font-semibold tabular-nums text-foreground">
                                      {entry[key]}
                                    </dd>
                                  </div>
                                ))}
                              </dl>
                            </td>

                            <td className="max-w-md px-4 py-3.5 text-sm leading-relaxed text-foreground">
                              {entry.open_feedback ? (
                                <p className="whitespace-pre-wrap break-words">{entry.open_feedback}</p>
                              ) : (
                                <p className="text-xs text-muted-foreground">{t.noOpenAnswer}</p>
                              )}
                              {entry.anonymized_redactions > 0 ? (
                                <span className="mt-1.5 inline-block rounded-md border border-border bg-surface-subtle px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                                  {t.redactedTag} ({entry.anonymized_redactions})
                                </span>
                              ) : null}
                            </td>

                            <td className="px-4 py-3.5 text-xs leading-relaxed text-foreground">
                              <ul className="space-y-0.5">
                                {entry.gender ? (
                                  <li>
                                    <span className="text-muted-foreground">{widgetCopy.genderLabel}:</span>{" "}
                                    <span className="font-medium">{formatGender(entry.gender)}</span>
                                  </li>
                                ) : null}
                                {entry.age_group ? (
                                  <li>
                                    <span className="text-muted-foreground">{widgetCopy.ageGroupLabel}:</span>{" "}
                                    <span className="font-medium">{formatAge(entry.age_group)}</span>
                                  </li>
                                ) : null}
                                {entry.marital_status ? (
                                  <li>
                                    <span className="text-muted-foreground">{widgetCopy.maritalStatusLabel}:</span>{" "}
                                    <span className="font-medium">{formatMarital(entry.marital_status)}</span>
                                  </li>
                                ) : null}
                                {entry.locality ? (
                                  <li>
                                    <span className="text-muted-foreground">{widgetCopy.localityLabel}:</span>{" "}
                                    <span className="font-medium">{entry.locality}</span>
                                  </li>
                                ) : null}
                                {entry.occupation ? (
                                  <li>
                                    <span className="text-muted-foreground">{widgetCopy.occupationLabel}:</span>{" "}
                                    <span className="font-medium">{entry.occupation}</span>
                                  </li>
                                ) : null}
                                {!entry.gender &&
                                !entry.age_group &&
                                !entry.marital_status &&
                                !entry.locality &&
                                !entry.occupation ? (
                                  <li className="text-muted-foreground">{t.unspecified}</li>
                                ) : null}
                              </ul>
                            </td>

                            <td className="whitespace-nowrap px-4 py-3.5 text-right">
                              <button
                                type="button"
                                onClick={() => handleDelete(entry.id)}
                                disabled={deletingId === entry.id}
                                aria-label={`${t.deleteEntry} #${entry.id}`}
                                className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 text-xs font-medium text-muted-foreground transition-colors duration-(--dur-fast) hover:bg-primary-soft hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-50"
                              >
                                <TrashIcon className="h-4 w-4" />
                                <span>{t.deleteEntry}</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </div>
          )}
        </Container>
      </main>
    </AdminShell>
  );
}
