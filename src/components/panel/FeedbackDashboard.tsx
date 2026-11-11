"use client";

import { useMemo, useState } from "react";
import { AdminShell } from "@/components/panel/AdminShell";
import { usePanelRuntime } from "@/components/panel/PanelRuntime";
import { csvTimestamp, downloadCsv } from "@/components/panel/panel-csv";
import { Container } from "@/components/ui/Container";
import { DownloadIcon, RefreshIcon, ShieldIcon, TrashIcon } from "@/components/ui/icons";
import { feedbackAdminCopy, feedbackWidgetCopy } from "@/lib/i18n/feedback-translations";
import { useLanguage } from "@/lib/i18n/language-context";
import { langToLocale } from "@/lib/i18n/panel-translations";
import { formatPanelDate } from "@/lib/panel-dates";
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

const SUPPORTED_FILTER_LANGS = ["ro", "en", "sq", "it", "hr", "rom"] as const;

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

  const [items, setItems] = useState<PlatformFeedbackItem[]>(initialItems);
  const [search, setSearch] = useState("");
  const [langFilter, setLangFilter] = useState<string>("");
  const [ageFilter, setAgeFilter] = useState<FeedbackAgeGroup | "">("");
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredItems = useMemo(() => {
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

  const summary = useMemo(() => computeFeedbackSummary(filteredItems), [filteredItems]);

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

    const rows = filteredItems.map((entry) => [
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
              <div className="inline-flex items-center gap-2 rounded-lg border border-border bg-white px-3 py-1.5 text-xs font-medium text-slate-700">
                <ShieldIcon className="h-4 w-4 text-primary" />
                <span>{t.privacyBadge}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleExportCsv}
                disabled={filteredItems.length === 0}
                className="crm-button"
              >
                <DownloadIcon className="h-4 w-4" />
                <span>{t.exportCsv}</span>
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
                          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                            <div
                              className="h-full rounded-full bg-primary transition-[width] duration-(--dur-base) ease-(--ease-out-calm)"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] tabular-nums text-muted-foreground">
                            {[1, 2, 3, 4, 5].map((score, idx) => (
                              <span key={score}>
                                {score}★: <strong className="font-semibold text-slate-700">{dim.distribution[idx]}</strong>
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
                    {/* Gender & Age Group */}
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
                                <span className="truncate text-slate-700">{formatGender(bucket.key)}</span>
                                <span className="shrink-0 font-semibold tabular-nums text-slate-900">
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
                                <span className="truncate text-slate-700">{formatAge(bucket.key)}</span>
                                <span className="shrink-0 font-semibold tabular-nums text-slate-900">
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
                              <span className="truncate text-slate-700">{formatMarital(bucket.key)}</span>
                              <span className="shrink-0 font-semibold tabular-nums text-slate-900">
                                {bucket.count} ({bucket.sharePct}%)
                              </span>
                            </li>
                          ))
                        )}
                      </ul>
                    </div>

                    {/* Top Localities & Occupations */}
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
                                className="inline-flex items-center gap-1 rounded-md border border-border bg-slate-50 px-2 py-1 text-xs text-slate-700"
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
                                className="inline-flex items-center gap-1 rounded-md border border-border bg-slate-50 px-2 py-1 text-xs text-slate-700"
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

              {/* Filter Toolbar & Responses Table */}
              <section className="rounded-xl border border-border bg-card">
                <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                  <h2 className="text-lg font-semibold text-foreground">{t.responsesHeading}</h2>

                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="search"
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder={t.searchPlaceholder}
                      className="min-h-10 w-full rounded-lg border border-border bg-white px-3 text-sm outline-none focus:border-ring sm:w-64"
                    />
                    <select
                      value={langFilter}
                      onChange={(event) => setLangFilter(event.target.value)}
                      aria-label={t.allLanguages}
                      className="min-h-10 rounded-lg border border-border bg-white px-3 text-sm outline-none focus:border-ring"
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
                      className="min-h-10 rounded-lg border border-border bg-white px-3 text-sm outline-none focus:border-ring"
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

                {filteredItems.length === 0 ? (
                  <p className="p-6 text-sm text-muted-foreground">{t.emptyState}</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                      <thead className="border-b border-border bg-slate-50 text-xs font-semibold text-slate-600">
                        <tr>
                          <th className="px-4 py-3">{t.tableWhen}</th>
                          <th className="px-4 py-3">{t.tableScores}</th>
                          <th className="px-4 py-3">{t.tableOpenAnswer}</th>
                          <th className="px-4 py-3">{t.tableDemographics}</th>
                          <th className="px-4 py-3 text-right">{t.tableActions}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredItems.map((entry) => (
                          <tr key={entry.id} className="border-b border-border/70 align-top last:border-b-0">
                            <td className="whitespace-nowrap px-4 py-3.5 text-xs text-slate-600">
                              <p className="font-medium text-slate-800">
                                {formatPanelDate(entry.created_at, locale, "dateTime")}
                              </p>
                              <p className="mt-0.5 text-[11px] text-slate-500">
                                {entry.country_code} · {entry.lang.toUpperCase()}
                                {entry.page_path ? ` · ${entry.page_path}` : ""}
                              </p>
                            </td>

                            <td className="px-4 py-3.5">
                              <div className="inline-flex items-center gap-1.5 rounded-md bg-primary-soft px-2 py-0.5 text-xs font-bold tabular-nums text-primary">
                                <span>{entry.average_rating.toFixed(1)} / 5</span>
                              </div>
                              <dl className="mt-2 grid grid-cols-1 gap-0.5 text-xs text-slate-600">
                                {RATING_KEYS.map((key) => (
                                  <div key={key} className="flex items-center justify-between gap-3">
                                    <dt className="truncate text-slate-500">
                                      {widgetCopy.questions[key].label}
                                    </dt>
                                    <dd className="font-semibold tabular-nums text-slate-800">
                                      {entry[key]}
                                    </dd>
                                  </div>
                                ))}
                              </dl>
                            </td>

                            <td className="max-w-md px-4 py-3.5 text-sm leading-relaxed text-slate-800">
                              {entry.open_feedback ? (
                                <p className="whitespace-pre-wrap break-words">{entry.open_feedback}</p>
                              ) : (
                                <p className="text-xs text-slate-400">{t.noOpenAnswer}</p>
                              )}
                              {entry.anonymized_redactions > 0 ? (
                                <span className="mt-1.5 inline-block rounded-md border border-border bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                                  {t.redactedTag} ({entry.anonymized_redactions})
                                </span>
                              ) : null}
                            </td>

                            <td className="px-4 py-3.5 text-xs leading-relaxed text-slate-700">
                              <ul className="space-y-0.5">
                                {entry.gender ? (
                                  <li>
                                    <span className="text-slate-500">{widgetCopy.genderLabel}:</span>{" "}
                                    <span className="font-medium">{formatGender(entry.gender)}</span>
                                  </li>
                                ) : null}
                                {entry.age_group ? (
                                  <li>
                                    <span className="text-slate-500">{widgetCopy.ageGroupLabel}:</span>{" "}
                                    <span className="font-medium">{formatAge(entry.age_group)}</span>
                                  </li>
                                ) : null}
                                {entry.marital_status ? (
                                  <li>
                                    <span className="text-slate-500">{widgetCopy.maritalStatusLabel}:</span>{" "}
                                    <span className="font-medium">{formatMarital(entry.marital_status)}</span>
                                  </li>
                                ) : null}
                                {entry.locality ? (
                                  <li>
                                    <span className="text-slate-500">{widgetCopy.localityLabel}:</span>{" "}
                                    <span className="font-medium">{entry.locality}</span>
                                  </li>
                                ) : null}
                                {entry.occupation ? (
                                  <li>
                                    <span className="text-slate-500">{widgetCopy.occupationLabel}:</span>{" "}
                                    <span className="font-medium">{entry.occupation}</span>
                                  </li>
                                ) : null}
                                {!entry.gender &&
                                !entry.age_group &&
                                !entry.marital_status &&
                                !entry.locality &&
                                !entry.occupation ? (
                                  <li className="text-slate-400">{t.unspecified}</li>
                                ) : null}
                              </ul>
                            </td>

                            <td className="whitespace-nowrap px-4 py-3.5 text-right">
                              <button
                                type="button"
                                onClick={() => handleDelete(entry.id)}
                                disabled={deletingId === entry.id}
                                aria-label={`${t.deleteEntry} #${entry.id}`}
                                className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-border bg-white px-2.5 text-xs font-medium text-slate-600 transition-colors hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
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
