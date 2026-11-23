"use client";

import { useMemo, useRef, useState } from "react";
import { AdminShell } from "@/components/panel/AdminShell";
import { usePanelRuntime } from "@/components/panel/PanelRuntime";
import { csvTimestamp, downloadCsv } from "@/components/panel/panel-csv";
import { Container } from "@/components/ui/Container";
import { CloseIcon, DownloadIcon, RefreshIcon, TrashIcon } from "@/components/ui/icons";
import { feedbackAnalyticsCopy } from "@/lib/i18n/feedback-analytics-translations";
import { feedbackAdminCopy, feedbackWidgetCopy } from "@/lib/i18n/feedback-translations";
import { useLanguage } from "@/lib/i18n/language-context";
import { languages } from "@/lib/i18n/languages";
import { langToLocale } from "@/lib/i18n/panel-translations";
import { formatPanelDate } from "@/lib/panel-dates";
import {
  computeFeedbackBreakdowns,
  computeFeedbackTrends,
  extractFeedbackKeywords,
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

const OUTLINE_BUTTON_CLASS =
  "inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-[var(--color-border-control)] bg-[var(--panel-surface)] px-3.5 text-sm font-medium text-[var(--panel-ink)] transition-colors duration-(--dur-fast) hover:bg-[var(--panel-selection)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-sapphire)] dark:border-[#62768c] dark:focus-visible:outline-[#bad7fa] disabled:cursor-not-allowed disabled:border-[var(--color-border-control)] disabled:bg-[var(--panel-subtle)] disabled:text-[var(--panel-muted)] dark:disabled:border-[#62768c]";

const PRIMARY_BUTTON_CLASS =
  "inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-[var(--color-sapphire)] bg-[var(--color-sapphire)] px-4 text-sm font-semibold text-white transition-colors duration-(--dur-fast) hover:bg-[#28476f] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-sapphire)] dark:focus-visible:outline-[#bad7fa] disabled:cursor-not-allowed disabled:border-[var(--color-border-control)] disabled:bg-[var(--panel-subtle)] disabled:text-[var(--panel-muted)] dark:disabled:border-[#62768c]";

const CONTROL_INPUT_CLASS =
  "min-h-11 rounded-lg border border-[var(--color-border-control)] bg-[var(--panel-surface)] px-3 text-sm text-[var(--panel-ink)] placeholder:text-[var(--panel-muted)] focus-visible:border-[var(--color-sapphire)] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--color-sapphire)] dark:border-[#62768c] dark:focus-visible:border-[#bad7fa] dark:focus-visible:outline-[#bad7fa]";

function ratingToneClass(score: number): string {
  if (score >= 4.0) return "text-wellness dark:text-wellness-border";
  if (score >= 3.0) return "text-amber-care dark:text-[#f5c58e]";
  return "text-clinical-ruby dark:text-ruby-300";
}

function languageLabel(code: string): string {
  return languages.find((item) => item.code === code)?.label ?? code.toUpperCase();
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
      <main id="main-content" className="min-h-dvh min-w-0 bg-[var(--panel-surface)] text-[var(--panel-ink)] py-6 sm:py-8">
        <Container className="min-w-0">
          {/* Header */}
          <header className="flex flex-col gap-4 border-b border-[var(--panel-line)] pb-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <h1 className="font-display text-2xl font-bold tracking-[-0.025em] text-[var(--panel-ink)] sm:text-[1.875rem]">
                {t.title}
              </h1>
              <p className="mt-1.5 max-w-2xl text-xs leading-relaxed text-[var(--panel-muted)]">
                {t.privacyBadge}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleExportCsv}
                disabled={displayedItems.length === 0}
                className={OUTLINE_BUTTON_CLASS}
              >
                <DownloadIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
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
                className={PRIMARY_BUTTON_CLASS}
              >
                <RefreshIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{loading ? t.refreshing : t.refresh}</span>
              </button>
            </div>
          </header>

          {!databaseAvailable ? (
            <p className="mt-6 max-w-2xl text-sm leading-relaxed text-[var(--panel-muted)]">{t.noDatabase}</p>
          ) : (
            <div className="min-w-0 space-y-8">
              {/* Editorial Summary Ledger */}
              <section aria-label={t.overallScore} className="min-w-0">
                <dl className="grid grid-cols-2 gap-px border-b border-[var(--panel-line)] bg-[var(--panel-line)] lg:grid-cols-4">
                  <div className="min-w-0 bg-[var(--panel-surface)] px-4 py-3.5 max-lg:pl-0 sm:px-5 sm:py-4 lg:pl-0">
                    <dt className="text-xs font-medium text-[var(--panel-muted)]">{t.totalResponses}</dt>
                    <dd className="mt-1 font-display text-2xl font-bold tracking-[-0.02em] tabular-nums text-[var(--panel-ink)] sm:text-[1.625rem]">
                      {summary.totalResponses}
                    </dd>
                  </div>

                  <div className="min-w-0 bg-[var(--panel-surface)] px-4 py-3.5 max-lg:pr-0 sm:px-5 sm:py-4">
                    <dt className="text-xs font-medium text-[var(--panel-muted)]">{t.overallScore}</dt>
                    <dd className="mt-1 flex flex-wrap items-baseline gap-1.5">
                      <span className="font-display text-2xl font-bold tracking-[-0.02em] tabular-nums text-[var(--color-sapphire)] dark:text-[#bad7fa] sm:text-[1.625rem]">
                        {summary.overallAverage.toFixed(2)}
                      </span>
                      <span className="text-xs text-[var(--panel-muted)]">{t.outOfFive}</span>
                    </dd>
                  </div>

                  <div className="min-w-0 bg-[var(--panel-surface)] px-4 py-3.5 max-lg:pl-0 sm:px-5 sm:py-4">
                    <dt className="text-xs font-medium text-[var(--panel-muted)]">{t.openAnswersCount}</dt>
                    <dd className="mt-1 font-display text-2xl font-bold tracking-[-0.02em] tabular-nums text-[var(--panel-ink)] sm:text-[1.625rem]">
                      {summary.withOpenFeedbackCount}
                    </dd>
                  </div>

                  <div className="min-w-0 bg-[var(--panel-surface)] px-4 py-3.5 max-lg:pr-0 sm:px-5 sm:py-4 lg:pr-0">
                    <dt className="text-xs font-medium text-[var(--panel-muted)]">{t.anonymizedCount}</dt>
                    <dd className="mt-1 font-display text-2xl font-bold tracking-[-0.02em] tabular-nums text-[var(--panel-ink)] sm:text-[1.625rem]">
                      {summary.anonymizedCount}
                    </dd>
                  </div>
                </dl>
              </section>

              {/* Satisfaction Tiers */}
              <section aria-labelledby="satisfaction-tiers-heading" className="min-w-0">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h2 id="satisfaction-tiers-heading" className="text-base font-semibold tracking-[-0.015em] text-[var(--panel-ink)]">
                    {analyticsCopy.satisfactionHeading}
                  </h2>
                  {breakdowns.total > 0 ? (
                    <span className="text-xs font-medium tabular-nums text-[var(--panel-muted)]">
                      {analyticsCopy.responsesCountShort(breakdowns.total)}
                    </span>
                  ) : null}
                </div>

                {breakdowns.total === 0 ? (
                  <p className="mt-3 text-sm text-[var(--panel-muted)]">{analyticsCopy.tierEmpty}</p>
                ) : (
                  <div className="mt-4 space-y-4">
                    <div
                      className="flex h-2 w-full overflow-hidden rounded-xs bg-[var(--panel-subtle)]"
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

                    <dl className="grid gap-4 border-t border-[var(--panel-line)] pt-4 sm:grid-cols-3">
                      <div className="flex items-baseline justify-between gap-3 sm:block">
                        <dt className="text-xs font-medium text-wellness dark:text-wellness-border">
                          {analyticsCopy.tierPositive}
                        </dt>
                        <dd className="flex items-baseline gap-2 sm:mt-1">
                          <span className="font-display text-xl font-bold tabular-nums text-[var(--panel-ink)]">
                            {breakdowns.tiers.positive.count}
                          </span>
                          <span className="text-xs font-medium tabular-nums text-[var(--panel-muted)]">
                            {breakdowns.tiers.positive.sharePct}%
                          </span>
                        </dd>
                      </div>

                      <div className="flex items-baseline justify-between gap-3 sm:block">
                        <dt className="text-xs font-medium text-amber-care dark:text-[#f5c58e]">
                          {analyticsCopy.tierNeutral}
                        </dt>
                        <dd className="flex items-baseline gap-2 sm:mt-1">
                          <span className="font-display text-xl font-bold tabular-nums text-[var(--panel-ink)]">
                            {breakdowns.tiers.neutral.count}
                          </span>
                          <span className="text-xs font-medium tabular-nums text-[var(--panel-muted)]">
                            {breakdowns.tiers.neutral.sharePct}%
                          </span>
                        </dd>
                      </div>

                      <div className="flex items-baseline justify-between gap-3 sm:block">
                        <dt className="text-xs font-medium text-clinical-ruby dark:text-ruby-300">
                          {analyticsCopy.tierNeedsAttention}
                        </dt>
                        <dd className="flex items-baseline gap-2 sm:mt-1">
                          <span className="font-display text-xl font-bold tabular-nums text-[var(--panel-ink)]">
                            {breakdowns.tiers.needsAttention.count}
                          </span>
                          <span className="text-xs font-medium tabular-nums text-[var(--panel-muted)]">
                            {breakdowns.tiers.needsAttention.sharePct}%
                          </span>
                        </dd>
                      </div>
                    </dl>
                  </div>
                )}
              </section>

              {/* Trends Over Time + Recurring Themes */}
              <div className="grid min-w-0 gap-x-10 gap-y-8 border-t border-[var(--panel-line)] pt-7 lg:grid-cols-[1.15fr_0.85fr]">
                {/* Responses and average rating over time */}
                <section aria-labelledby="feedback-trends-heading" className="min-w-0">
                  <div className="flex flex-wrap items-baseline justify-between gap-3">
                    <div>
                      <h2 id="feedback-trends-heading" className="text-base font-semibold tracking-[-0.015em] text-[var(--panel-ink)]">
                        {analyticsCopy.trendsHeading}
                      </h2>
                      <p className="mt-0.5 text-xs text-[var(--panel-muted)]">
                        {analyticsCopy.trendsResponsesLabel} · {analyticsCopy.trendsAvgRatingLabel}
                      </p>
                    </div>

                    {trends.buckets.length > 0 ? (
                      <span className="text-xs font-medium text-[var(--panel-muted)]">
                        {trends.granularity === "day"
                          ? analyticsCopy.trendsDailyLabel
                          : analyticsCopy.trendsWeeklyLabel}
                      </span>
                    ) : null}
                  </div>

                  {trends.buckets.length === 0 ? (
                    <p className="mt-3 text-sm text-[var(--panel-muted)]">{analyticsCopy.trendsEmpty}</p>
                  ) : (
                    <div className="mt-4 space-y-3">
                      {activeTrendBucket ? (
                        <div
                          aria-live="polite"
                          className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[var(--panel-line)] pb-2.5 text-xs"
                        >
                          <span className="font-medium text-[var(--panel-ink)]">
                            {analyticsCopy.trendsBucketSummary(
                              activeTrendBucket.label,
                              activeTrendBucket.count,
                              activeTrendBucket.avgRating.toFixed(2),
                            )}
                          </span>
                          <span className={`font-semibold tabular-nums ${ratingToneClass(activeTrendBucket.avgRating)}`}>
                            {activeTrendBucket.avgRating.toFixed(2)} / 5
                          </span>
                        </div>
                      ) : null}

                      <div className="min-w-0 w-full overflow-x-auto pb-1">
                        <div className="flex min-w-full items-end gap-1.5 border-b border-[var(--panel-line)] pt-2">
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
                                className={`group flex min-h-11 min-w-[48px] flex-1 flex-col items-center whitespace-nowrap rounded-t-sm px-1 pt-1.5 pb-2 text-center transition-colors duration-(--dur-fast) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-sapphire)] dark:focus-visible:outline-[#bad7fa] ${
                                  isActive ? "bg-[var(--panel-selection)]" : "hover:bg-[var(--panel-subtle)]"
                                }`}
                              >
                                <span className={`whitespace-nowrap text-xs font-semibold tabular-nums ${ratingToneClass(bucket.avgRating)}`}>
                                  {bucket.avgRating.toFixed(1)}
                                </span>
                                <span className="mt-0.5 whitespace-nowrap text-[11px] tabular-nums text-[var(--panel-muted)]">
                                  {bucket.count}
                                </span>
                                <div className="mt-1.5 flex h-24 w-full items-end justify-center">
                                  <span
                                    className={`w-full max-w-[26px] rounded-t-[2px] transition-colors duration-(--dur-fast) ${
                                      isActive
                                        ? "bg-[var(--color-sapphire)] dark:bg-[#bad7fa]"
                                        : "bg-[var(--color-sapphire)]/65 group-hover:bg-[var(--color-sapphire)]/90 dark:bg-[#bad7fa]/55 dark:group-hover:bg-[#bad7fa]/85"
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
                              className="min-w-[48px] flex-1 truncate whitespace-nowrap text-center text-[11px] tabular-nums text-[var(--panel-muted)]"
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

                {/* Recurring themes (interactive keyword filters) */}
                <section aria-labelledby="feedback-keywords-heading" className="min-w-0">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h2 id="feedback-keywords-heading" className="text-base font-semibold tracking-[-0.015em] text-[var(--panel-ink)]">
                      {analyticsCopy.keywordCloudHeading}
                    </h2>
                    {activeKeyword ? (
                      <button
                        type="button"
                        onClick={() => setSelectedKeyword(null)}
                        className={OUTLINE_BUTTON_CLASS}
                      >
                        <CloseIcon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                        <span>{analyticsCopy.keywordClear}</span>
                      </button>
                    ) : null}
                  </div>

                  {keywords.length === 0 ? (
                    <p className="mt-3 text-sm text-[var(--panel-muted)]">{analyticsCopy.keywordCloudEmpty}</p>
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
                            className={`inline-flex min-h-11 items-center gap-1.5 whitespace-nowrap rounded-lg border px-3 text-sm font-medium transition-colors duration-(--dur-fast) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-sapphire)] dark:focus-visible:outline-[#bad7fa] ${
                              isSelected
                                ? "border-[var(--color-sapphire)] bg-[var(--color-sapphire)] font-semibold text-white hover:bg-[#28476f]"
                                : "border-[var(--color-border-control)] bg-[var(--panel-surface)] text-[var(--panel-ink)] hover:bg-[var(--panel-selection)] dark:border-[#62768c]"
                            }`}
                          >
                            <span>{kw.term}</span>
                            <span
                              className={`tabular-nums text-xs ${
                                isSelected ? "text-white/85" : "text-[var(--panel-muted)]"
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
              <section aria-labelledby="feedback-breakdowns-heading" className="min-w-0 border-t border-[var(--panel-line)] pt-7">
                <h2 id="feedback-breakdowns-heading" className="text-base font-semibold tracking-[-0.015em] text-[var(--panel-ink)]">
                  {analyticsCopy.breakdownsHeading}
                </h2>

                <div className="mt-4 grid min-w-0 gap-x-10 gap-y-6 md:grid-cols-2">
                  {/* Top pages */}
                  <div className="min-w-0">
                    <h3 className="border-b border-[var(--panel-line)] pb-2 text-xs font-semibold text-[var(--panel-muted)]">
                      {analyticsCopy.byPageHeading}
                    </h3>
                    {breakdowns.byPage.length === 0 ? (
                      <p className="mt-3 text-sm text-[var(--panel-muted)]">{analyticsCopy.noBreakdownData}</p>
                    ) : (
                      <ul className="mt-3 space-y-3">
                        {breakdowns.byPage.map((row) => {
                          const widthPct = Math.max(6, Math.round((row.count / maxPageCount) * 100));
                          return (
                            <li key={row.pagePath} className="min-w-0 space-y-1">
                              <div className="flex items-baseline justify-between gap-3 text-xs">
                                <span
                                  className="min-w-0 truncate font-mono text-[var(--panel-ink)]"
                                  title={row.pagePath}
                                >
                                  {row.pagePath}
                                </span>
                                <span className="shrink-0 tabular-nums">
                                  <strong className={`font-semibold ${ratingToneClass(row.avgRating)}`}>
                                    {row.avgRating.toFixed(2)}
                                  </strong>
                                  <span className="text-[var(--panel-muted)]"> · {row.count}</span>
                                </span>
                              </div>
                              <div className="h-1 w-full overflow-hidden rounded-xs bg-[var(--panel-subtle)]" aria-hidden="true">
                                <div
                                  className="h-full rounded-xs bg-[var(--color-sapphire)]/80 dark:bg-[#bad7fa]/80"
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
                  <div className="min-w-0">
                    <h3 className="border-b border-[var(--panel-line)] pb-2 text-xs font-semibold text-[var(--panel-muted)]">
                      {analyticsCopy.byLanguageHeading}
                    </h3>
                    {breakdowns.byLanguage.length === 0 ? (
                      <p className="mt-3 text-sm text-[var(--panel-muted)]">{analyticsCopy.noBreakdownData}</p>
                    ) : (
                      <ul className="mt-3 space-y-3">
                        {breakdowns.byLanguage.map((row) => {
                          const widthPct = Math.max(6, Math.round((row.count / maxLangCount) * 100));
                          return (
                            <li key={row.lang} className="min-w-0 space-y-1">
                              <div className="flex items-baseline justify-between gap-3 text-xs">
                                <span className="min-w-0 truncate">
                                  <span className="font-medium text-[var(--panel-ink)]">{languageLabel(row.lang)}</span>
                                  <span className="ml-2 tabular-nums text-[var(--panel-muted)]">
                                    · {analyticsCopy.responsesCountShort(row.count)}
                                  </span>
                                </span>
                                <strong className={`shrink-0 font-semibold tabular-nums ${ratingToneClass(row.avgRating)}`}>
                                  {row.avgRating.toFixed(2)} / 5
                                </strong>
                              </div>
                              <div className="h-1 w-full overflow-hidden rounded-xs bg-[var(--panel-subtle)]" aria-hidden="true">
                                <div
                                  className="h-full rounded-xs bg-[var(--color-sapphire)]/80 dark:bg-[#bad7fa]/80"
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

              {/* 5 Evaluation Criteria + Demographics */}
              <div className="grid min-w-0 gap-x-10 gap-y-8 border-t border-[var(--panel-line)] pt-7 lg:grid-cols-[1.15fr_0.85fr]">
                <section className="min-w-0">
                  <h2 className="text-base font-semibold tracking-[-0.015em] text-[var(--panel-ink)]">
                    {t.evaluationHeading}
                  </h2>
                  <div className="mt-4 divide-y divide-[var(--panel-line)] border-t border-[var(--panel-line)]">
                    {summary.dimensions.map((dim) => {
                      const q = widgetCopy.questions[dim.key];
                      const pct = Math.min(100, Math.max(0, (dim.average / 5) * 100));
                      return (
                        <div key={dim.key} className="space-y-2 py-3.5">
                          <div className="flex items-baseline justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-[var(--panel-ink)]">{q.label}</p>
                              <p className="text-xs text-[var(--panel-muted)]">{q.question}</p>
                            </div>
                            <span className="shrink-0 font-display text-base font-bold tabular-nums text-[var(--color-sapphire)] dark:text-[#bad7fa]">
                              {dim.average.toFixed(2)} / 5
                            </span>
                          </div>
                          <div className="h-1.5 w-full overflow-hidden rounded-xs bg-[var(--panel-subtle)]" aria-hidden="true">
                            <div
                              className="h-full rounded-xs bg-[var(--color-sapphire)] transition-[width] duration-(--dur-base) ease-(--ease-out-calm) dark:bg-[#bad7fa]"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs tabular-nums text-[var(--panel-muted)]">
                            {[1, 2, 3, 4, 5].map((score, idx) => (
                              <span key={score}>
                                {score}/5:{" "}
                                <strong className="font-display font-semibold tabular-nums text-[var(--panel-ink)]">
                                  {dim.distribution[idx]}
                                </strong>
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>

                <section className="min-w-0">
                  <h2 className="text-base font-semibold tracking-[-0.015em] text-[var(--panel-ink)]">
                    {t.demographicsHeading}
                  </h2>
                  <div className="mt-4 space-y-5 border-t border-[var(--panel-line)] pt-4 text-sm">
                    {/* Gender and Age Group */}
                    <div className="grid gap-6 sm:grid-cols-2">
                      <div className="min-w-0">
                        <h3 className="text-xs font-semibold text-[var(--panel-muted)]">{widgetCopy.genderLabel}</h3>
                        <ul className="mt-2 space-y-1.5">
                          {summary.demographics.gender.length === 0 ? (
                            <li className="text-xs text-[var(--panel-muted)]">{t.unspecified}</li>
                          ) : (
                            summary.demographics.gender.map((bucket) => (
                              <li key={bucket.key} className="flex items-baseline justify-between gap-2 text-xs">
                                <span className="truncate text-[var(--panel-muted)]">{formatGender(bucket.key)}</span>
                                <span className="shrink-0 font-semibold tabular-nums text-[var(--panel-ink)]">
                                  {bucket.count} ({bucket.sharePct}%)
                                </span>
                              </li>
                            ))
                          )}
                        </ul>
                      </div>

                      <div className="min-w-0">
                        <h3 className="text-xs font-semibold text-[var(--panel-muted)]">{widgetCopy.ageGroupLabel}</h3>
                        <ul className="mt-2 space-y-1.5">
                          {summary.demographics.ageGroup.length === 0 ? (
                            <li className="text-xs text-[var(--panel-muted)]">{t.unspecified}</li>
                          ) : (
                            summary.demographics.ageGroup.map((bucket) => (
                              <li key={bucket.key} className="flex items-baseline justify-between gap-2 text-xs">
                                <span className="truncate text-[var(--panel-muted)]">{formatAge(bucket.key)}</span>
                                <span className="shrink-0 font-semibold tabular-nums text-[var(--panel-ink)]">
                                  {bucket.count} ({bucket.sharePct}%)
                                </span>
                              </li>
                            ))
                          )}
                        </ul>
                      </div>
                    </div>

                    {/* Marital Status */}
                    <div className="border-t border-[var(--panel-line)] pt-4">
                      <h3 className="text-xs font-semibold text-[var(--panel-muted)]">{widgetCopy.maritalStatusLabel}</h3>
                      <ul className="mt-2 grid gap-x-6 gap-y-1.5 sm:grid-cols-2">
                        {summary.demographics.maritalStatus.length === 0 ? (
                          <li className="text-xs text-[var(--panel-muted)]">{t.unspecified}</li>
                        ) : (
                          summary.demographics.maritalStatus.map((bucket) => (
                            <li key={bucket.key} className="flex items-baseline justify-between gap-2 text-xs">
                              <span className="truncate text-[var(--panel-muted)]">{formatMarital(bucket.key)}</span>
                              <span className="shrink-0 font-semibold tabular-nums text-[var(--panel-ink)]">
                                {bucket.count} ({bucket.sharePct}%)
                              </span>
                            </li>
                          ))
                        )}
                      </ul>
                    </div>

                    {/* Top Localities and Occupations */}
                    <div className="grid gap-6 border-t border-[var(--panel-line)] pt-4 sm:grid-cols-2">
                      <div className="min-w-0">
                        <h3 className="text-xs font-semibold text-[var(--panel-muted)]">{t.topLocalities}</h3>
                        <ul className="mt-2 space-y-1.5">
                          {summary.demographics.topLocalities.length === 0 ? (
                            <li className="text-xs text-[var(--panel-muted)]">{t.unspecified}</li>
                          ) : (
                            summary.demographics.topLocalities.map((bucket) => (
                              <li key={bucket.key} className="flex items-baseline justify-between gap-2 text-xs">
                                <span className="truncate text-[var(--panel-ink)]">{bucket.key}</span>
                                <span className="shrink-0 font-semibold tabular-nums text-[var(--color-sapphire)] dark:text-[#bad7fa]">
                                  {bucket.count}
                                </span>
                              </li>
                            ))
                          )}
                        </ul>
                      </div>

                      <div className="min-w-0">
                        <h3 className="text-xs font-semibold text-[var(--panel-muted)]">{t.topOccupations}</h3>
                        <ul className="mt-2 space-y-1.5">
                          {summary.demographics.topOccupations.length === 0 ? (
                            <li className="text-xs text-[var(--panel-muted)]">{t.unspecified}</li>
                          ) : (
                            summary.demographics.topOccupations.map((bucket) => (
                              <li key={bucket.key} className="flex items-baseline justify-between gap-2 text-xs">
                                <span className="truncate text-[var(--panel-ink)]">{bucket.key}</span>
                                <span className="shrink-0 font-semibold tabular-nums text-[var(--color-sapphire)] dark:text-[#bad7fa]">
                                  {bucket.count}
                                </span>
                              </li>
                            ))
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>
                </section>
              </div>

              {/* Filter Toolbar and Responses Table */}
              <section ref={responsesSectionRef} className="min-w-0 border-t border-[var(--panel-line)] pt-7">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-wrap items-baseline gap-2.5">
                    <h2 className="text-base font-semibold tracking-[-0.015em] text-[var(--panel-ink)]">
                      {t.responsesHeading}
                    </h2>
                    {isFiltered ? (
                      <span className="text-xs font-medium tabular-nums text-[var(--panel-muted)]">
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
                      aria-label={t.searchPlaceholder}
                      className={`${CONTROL_INPUT_CLASS} w-full sm:w-64`}
                    />
                    <select
                      value={langFilter}
                      onChange={(event) => setLangFilter(event.target.value)}
                      aria-label={t.allLanguages}
                      className={`${CONTROL_INPUT_CLASS} min-w-0 max-w-full flex-1 whitespace-nowrap sm:flex-none`}
                    >
                      <option value="">{t.allLanguages}</option>
                      {SUPPORTED_FILTER_LANGS.map((code) => (
                        <option key={code} value={code}>
                          {languageLabel(code)}
                        </option>
                      ))}
                    </select>
                    <select
                      value={ageFilter}
                      onChange={(event) => setAgeFilter(event.target.value as FeedbackAgeGroup | "")}
                      aria-label={t.allAgeGroups}
                      className={`${CONTROL_INPUT_CLASS} min-w-0 max-w-full flex-1 whitespace-nowrap sm:flex-none`}
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
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-y border-[var(--panel-line)] bg-[var(--panel-selection)] px-3 py-2">
                    <span className="text-xs font-medium tabular-nums text-[var(--panel-ink)]">
                      {analyticsCopy.keywordActiveFilter(activeKeyword.term, displayedItems.length)}
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedKeyword(null)}
                      className={OUTLINE_BUTTON_CLASS}
                    >
                      <CloseIcon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                      <span>{analyticsCopy.keywordClear}</span>
                    </button>
                  </div>
                ) : null}

                {displayedItems.length === 0 ? (
                  <p className="mt-4 text-sm text-[var(--panel-muted)]">{t.emptyState}</p>
                ) : (
                  <div className="mt-4 min-w-0 w-full overflow-x-auto">
                    <table className="min-w-[720px] w-full border-collapse text-left text-sm">
                      <thead className="border-y border-[var(--panel-line)] bg-[var(--panel-subtle)] text-xs font-semibold text-[var(--panel-muted)]">
                        <tr>
                          <th className="py-2.5 pr-4 pl-2 font-medium">{t.tableWhen}</th>
                          <th className="py-2.5 pr-4 font-medium">{t.tableScores}</th>
                          <th className="py-2.5 pr-4 font-medium">{t.tableOpenAnswer}</th>
                          <th className="py-2.5 pr-4 font-medium">{t.tableDemographics}</th>
                          <th className="py-2.5 pr-2 text-right font-medium">{t.tableActions}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--panel-line)]">
                        {displayedItems.map((entry) => (
                          <tr
                            key={entry.id}
                            className={`align-top transition-colors duration-(--dur-fast) hover:bg-[var(--panel-subtle)] ${
                              activeKeyword ? "bg-[var(--panel-selection)]/40" : ""
                            }`}
                          >
                            <td className="whitespace-nowrap py-3.5 pr-4 pl-2 text-xs text-[var(--panel-muted)]">
                              <p className="font-medium tabular-nums text-[var(--panel-ink)]">
                                {formatPanelDate(entry.created_at, locale, "dateTime")}
                              </p>
                              <p className="mt-0.5 text-xs text-[var(--panel-muted)]">
                                {entry.country_code} · {languageLabel(entry.lang)}
                                {entry.page_path ? ` · ${entry.page_path}` : ""}
                              </p>
                            </td>

                            <td className="py-3.5 pr-4">
                              <p className={`font-display text-sm font-bold tabular-nums ${ratingToneClass(entry.average_rating)}`}>
                                {entry.average_rating.toFixed(1)} / 5
                              </p>
                              <dl className="mt-1.5 grid grid-cols-1 gap-0.5 text-xs text-[var(--panel-muted)]">
                                {RATING_KEYS.map((key) => (
                                  <div key={key} className="flex items-baseline justify-between gap-3">
                                    <dt className="truncate text-[var(--panel-muted)]">
                                      {widgetCopy.questions[key].label}
                                    </dt>
                                    <dd className="font-semibold tabular-nums text-[var(--panel-ink)]">
                                      {entry[key]}
                                    </dd>
                                  </div>
                                ))}
                              </dl>
                            </td>

                            <td className="max-w-md py-3.5 pr-4 text-sm leading-relaxed text-[var(--panel-ink)]">
                              {entry.open_feedback ? (
                                <p className="whitespace-pre-wrap break-words">{entry.open_feedback}</p>
                              ) : (
                                <p className="text-xs text-[var(--panel-muted)]">{t.noOpenAnswer}</p>
                              )}
                              {entry.anonymized_redactions > 0 ? (
                                <p className="mt-1.5 text-xs tabular-nums text-[var(--panel-muted)]">
                                  {t.redactedTag} ({entry.anonymized_redactions})
                                </p>
                              ) : null}
                            </td>

                            <td className="py-3.5 pr-4 text-xs leading-relaxed text-[var(--panel-ink)]">
                              <ul className="space-y-0.5">
                                {entry.gender ? (
                                  <li>
                                    <span className="text-[var(--panel-muted)]">{widgetCopy.genderLabel}:</span>{" "}
                                    <span className="font-medium">{formatGender(entry.gender)}</span>
                                  </li>
                                ) : null}
                                {entry.age_group ? (
                                  <li>
                                    <span className="text-[var(--panel-muted)]">{widgetCopy.ageGroupLabel}:</span>{" "}
                                    <span className="font-medium">{formatAge(entry.age_group)}</span>
                                  </li>
                                ) : null}
                                {entry.marital_status ? (
                                  <li>
                                    <span className="text-[var(--panel-muted)]">{widgetCopy.maritalStatusLabel}:</span>{" "}
                                    <span className="font-medium">{formatMarital(entry.marital_status)}</span>
                                  </li>
                                ) : null}
                                {entry.locality ? (
                                  <li>
                                    <span className="text-[var(--panel-muted)]">{widgetCopy.localityLabel}:</span>{" "}
                                    <span className="font-medium">{entry.locality}</span>
                                  </li>
                                ) : null}
                                {entry.occupation ? (
                                  <li>
                                    <span className="text-[var(--panel-muted)]">{widgetCopy.occupationLabel}:</span>{" "}
                                    <span className="font-medium">{entry.occupation}</span>
                                  </li>
                                ) : null}
                                {!entry.gender &&
                                !entry.age_group &&
                                !entry.marital_status &&
                                !entry.locality &&
                                !entry.occupation ? (
                                  <li className="text-[var(--panel-muted)]">{t.unspecified}</li>
                                ) : null}
                              </ul>
                            </td>

                            <td className="whitespace-nowrap py-3.5 pr-2 text-right">
                              <button
                                type="button"
                                onClick={() => handleDelete(entry.id)}
                                disabled={deletingId === entry.id}
                                aria-label={`${t.deleteEntry} #${entry.id}`}
                                className="inline-flex min-h-11 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border border-[var(--color-border-control)] bg-[var(--panel-surface)] px-3 text-xs font-medium text-[var(--panel-muted)] transition-colors duration-(--dur-fast) hover:border-clinical-ruby/50 hover:bg-clinical-ruby-soft hover:text-clinical-ruby focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-sapphire)] dark:border-[#62768c] dark:hover:border-ruby-300/50 dark:hover:bg-clinical-ruby/20 dark:hover:text-ruby-300 dark:focus-visible:outline-[#bad7fa] disabled:cursor-not-allowed disabled:border-[var(--color-border-control)] disabled:bg-[var(--panel-subtle)] disabled:text-[var(--panel-muted)] dark:disabled:border-[#62768c]"
                              >
                                <TrashIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
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
