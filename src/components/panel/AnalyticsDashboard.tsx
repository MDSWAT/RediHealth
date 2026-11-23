"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AdminShell } from "@/components/panel/AdminShell";
import { CampaignLinkBuilder } from "@/components/panel/CampaignLinkBuilder";
import { SavedCampaignLinks, formatDuration } from "@/components/panel/SavedCampaignLinks";
import type { CampaignLinkInput } from "@/lib/campaign-links";
import type { SavedCampaignLink } from "@/lib/data/campaign-links";
import { Container } from "@/components/ui/Container";
import { useLanguage } from "@/lib/i18n/language-context";
import { languages } from "@/lib/i18n/languages";
import { analyticsTranslations, type AnalyticsCopy } from "@/lib/i18n/analytics-translations";
import { ANALYTICS_RANGES, isAnalyticsEvent, type AnalyticsRange } from "@/lib/analytics";
import type { AnalyticsResult, AnalyticsSummary, CountRow, DailyPoint } from "@/lib/data/analytics";

type AnalyticsDashboardProps = {
  userEmail: string;
  userRole?: string;
  range: AnalyticsRange;
  result: AnalyticsResult;
  savedLinks: SavedCampaignLink[];
};

const LINKS_API = "/api/admin/campaign-links";

/** Calls the saved-links API; every answer carries the full, refreshed list. */
async function callLinksApi(method: "POST" | "DELETE", body: unknown): Promise<SavedCampaignLink[] | null> {
  try {
    const response = await fetch(LINKS_API, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (!response.ok) return null;
    const data = (await response.json()) as { links?: SavedCampaignLink[] };
    return Array.isArray(data.links) ? data.links : null;
  } catch {
    return null;
  }
}

export function AnalyticsDashboard({ userEmail, userRole, range, result, savedLinks: initialLinks }: AnalyticsDashboardProps) {
  const [savedLinks, setSavedLinks] = useState(initialLinks);
  const apply = (links: SavedCampaignLink[] | null) => {
    if (links) setSavedLinks(links);
    return links !== null;
  };
  const saveLinks = async (links: CampaignLinkInput[]) => apply(await callLinksApi("POST", { links }));
  const deleteLink = async (id: number) => apply(await callLinksApi("DELETE", { id }));
  const { lang } = useLanguage();
  const t = analyticsTranslations[lang];
  const locale = lang === "rom" ? "ro" : lang;
  const number = useMemo(() => new Intl.NumberFormat(locale), [locale]);

  const message =
    result.status === "no-database" ? t.noDatabase : result.status === "not-migrated" ? t.notMigrated : result.status === "error" ? t.loadError : null;

  return (
    <AdminShell userEmail={userEmail} userRole={userRole} isAdmin>
      <main id="main-content" className="min-h-screen py-8 sm:py-10">
        <Container>
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
            <div className="min-w-0">
              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{t.title}</h1>
              <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{t.subtitle}</p>
            </div>
            <nav aria-label={t.period} className="flex flex-wrap gap-2">
              {ANALYTICS_RANGES.map((days) => (
                <Link
                  key={days}
                  href={{ query: { range: days } }}
                  scroll={false}
                  aria-current={days === range ? "page" : undefined}
                  className={`inline-flex items-center whitespace-nowrap rounded-lg border px-3 py-1.5 text-sm font-semibold ${
                    days === range ? "border-primary bg-primary text-white" : "border-border bg-card text-foreground hover:bg-muted"
                  }`}
                >
                  {days === 365 ? t.lastYear : t.lastDays.replace("{n}", String(days))}
                </Link>
              ))}
            </nav>
          </div>

          {message ? (
            <p className="max-w-2xl rounded-xl border border-border bg-card p-6 text-sm leading-relaxed text-foreground">{message}</p>
          ) : result.status === "ok" ? (
            <Summary summary={result.summary} t={t} number={number} locale={locale} />
          ) : null}

          <CampaignLinkBuilder t={t} lang={lang} onSave={result.status === "ok" ? saveLinks : undefined} />
          {result.status === "ok" ? (
            <SavedCampaignLinks t={t} locale={locale} links={savedLinks} onDelete={deleteLink} />
          ) : null}
          <p className="mt-4 max-w-2xl text-xs leading-relaxed text-muted-foreground">{t.privacyNote}</p>
        </Container>
      </main>
    </AdminShell>
  );
}

type SummaryProps = {
  summary: AnalyticsSummary;
  t: AnalyticsCopy;
  number: Intl.NumberFormat;
  locale: string;
};

function Summary({ summary, t, number, locale }: SummaryProps) {
  const { totals } = summary;
  const regionNames = useMemo(() => {
    try {
      return new Intl.DisplayNames([locale, "en"], { type: "region" });
    } catch {
      return null;
    }
  }, [locale]);
  const countryName = (code: string | null) => (code ? (regionNames?.of(code) ?? code) : t.unknown);
  const languageName = (code: string | null) => languages.find((item) => item.code === code)?.label ?? t.unknown;
  const deviceName = (code: string | null) => (code && code in t.deviceNames ? t.deviceNames[code as keyof typeof t.deviceNames] : t.unknown);
  const pagesPerVisitor = totals.visitors > 0 ? (totals.pageviews / totals.visitors).toFixed(1) : "0";

  if (totals.visitors === 0 && totals.events === 0) {
    return <p className="max-w-2xl rounded-xl border border-border bg-card p-6 text-sm leading-relaxed text-foreground">{t.empty}</p>;
  }

  return (
    <div className="space-y-6">
      <section aria-label={t.title} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label={t.visitors} value={number.format(totals.visitors)} />
        <Stat label={t.pageviews} value={number.format(totals.pageviews)} />
        <Stat label={t.pagesPerVisitor} value={pagesPerVisitor} />
        <Stat
          label={t.stayRate}
          value={
            totals.visitors > 0
              ? `${number.format(Math.round((summary.behaviour.engagedVisitors / totals.visitors) * 1000) / 10)}%`
              : "–"
          }
        />
        <Stat
          label={t.bounceRate}
          value={totals.visitors > 0 ? `${number.format(Math.round((summary.behaviour.bounces / totals.visitors) * 1000) / 10)}%` : "–"}
        />
        <Stat
          label={t.avgPageTime}
          value={formatDuration(summary.behaviour.avgPageSeconds ?? summary.behaviour.avgSeconds)}
        />
        <Stat
          label={t.avgScrollDepth}
          value={
            summary.behaviour.avgScrollDepth !== null
              ? `${number.format(summary.behaviour.avgScrollDepth)}%`
              : "–"
          }
        />
        <Stat label={t.conversions} value={number.format(totals.events)} />
      </section>
      <p className="-mt-2 text-xs text-muted-foreground">{t.visitorsNote}</p>

      <DailyChart daily={summary.daily} t={t} number={number} locale={locale} />

      <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-foreground">{t.journeysTitle}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t.journeysSubtitle}</p>
        </div>
        {summary.journeys.transitions.length === 0 && summary.journeys.paths.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t.noJourneys}</p>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            <div>
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="text-sm font-semibold text-foreground">{t.topTransitions}</h3>
                <span className="text-xs text-muted-foreground">{t.colVisitors}</span>
              </div>
              {summary.journeys.transitions.length === 0 ? (
                <p className="mt-3 text-sm text-muted-foreground">{t.noJourneys}</p>
              ) : (
                <ul className="mt-3 space-y-2.5">
                  {(() => {
                    const maxTrans = Math.max(1, ...summary.journeys.transitions.map((r) => r.visitors));
                    return summary.journeys.transitions.map((row) => (
                      <li key={`${row.fromPath}->${row.toPath}`} className="space-y-1">
                        <div className="flex items-baseline justify-between gap-3 text-xs">
                          <span className="min-w-0 truncate font-mono text-foreground" title={`${row.fromPath} → ${row.toPath}`}>
                            {row.fromPath} <span className="text-muted-foreground">→</span> {row.toPath}
                          </span>
                          <span className="shrink-0 font-semibold tabular-nums text-foreground">
                            {number.format(row.visitors)}
                          </span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded bg-muted" aria-hidden="true">
                          <div className="h-full rounded bg-primary/70" style={{ width: `${(row.visitors / maxTrans) * 100}%` }} />
                        </div>
                      </li>
                    ));
                  })()}
                </ul>
              )}
            </div>

            <div>
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="text-sm font-semibold text-foreground">{t.topPaths}</h3>
                <span className="text-xs text-muted-foreground">{t.colVisitors}</span>
              </div>
              {summary.journeys.paths.length === 0 ? (
                <p className="mt-3 text-sm text-muted-foreground">{t.noJourneys}</p>
              ) : (
                <ul className="mt-3 space-y-2.5">
                  {summary.journeys.paths.map((row, index) => (
                    <li
                      key={`${row.steps.join("->")}-${index}`}
                      className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-background/50 px-3 py-2"
                    >
                      <div className="flex min-w-0 flex-wrap items-center gap-1.5 font-mono text-xs text-foreground">
                        {row.steps.map((stepPath, stepIdx) => (
                          <span key={`${stepPath}-${stepIdx}`} className="inline-flex items-center gap-1.5">
                            {stepIdx > 0 ? <span className="text-muted-foreground">→</span> : null}
                            <span className="rounded bg-muted px-1.5 py-0.5">{stepPath}</span>
                          </span>
                        ))}
                      </div>
                      <span className="shrink-0 text-sm font-semibold tabular-nums text-foreground">
                        {number.format(row.visitors)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </section>

      <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-foreground">{t.clicksTitle}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t.clicksSubtitle}</p>
        {summary.clicks.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">{t.noClicks}</p>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[540px] text-left text-sm">
              <thead className="text-xs text-muted-foreground">
                <tr className="border-b border-border">
                  <th className="py-2 pr-3 font-medium">{t.colElement}</th>
                  <th className="py-2 pr-3 font-medium">{t.colPage}</th>
                  <th className="py-2 pr-3 text-right font-medium">{t.colClicks}</th>
                  <th className="py-2 text-right font-medium">{t.colVisitors}</th>
                </tr>
              </thead>
              <tbody>
                {summary.clicks.map((row) => (
                  <tr key={`${row.targetKey}|${row.path}`} className="border-b border-border/60 last:border-b-0">
                    <td className="py-2 pr-3 text-foreground">
                      <span className="font-medium">{row.targetLabel}</span>
                      <span className="ml-2 inline-flex rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">
                        {row.targetKind}
                      </span>
                    </td>
                    <td className="py-2 pr-3 font-mono text-xs text-muted-foreground">{row.path}</td>
                    <td className="py-2 pr-3 text-right tabular-nums text-foreground">{number.format(row.clicks)}</td>
                    <td className="py-2 text-right tabular-nums text-foreground">{number.format(row.visitors)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-foreground">{t.feedbackFunnelTitle}</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label={t.feedbackInitialShown} value={number.format(summary.feedbackFunnel.initialShown)} />
          <Stat label={t.feedbackFollowupShown} value={number.format(summary.feedbackFunnel.followupShown)} />
          <Stat label={t.feedbackDismissed} value={number.format(summary.feedbackFunnel.dismissed)} />
          <Stat label={t.feedbackCompleted} value={number.format(summary.feedbackFunnel.submitted)} />
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-foreground">{t.campaigns}</h2>
        {summary.campaigns.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">{t.noCampaigns}</p>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[620px] text-left text-sm">
              <thead className="text-xs text-muted-foreground">
                <tr className="border-b border-border">
                  <th className="py-2 pr-3 font-medium">{t.campaign}</th>
                  <th className="py-2 pr-3 font-medium">{t.source}</th>
                  <th className="py-2 pr-3 font-medium">{t.medium}</th>
                  <th className="py-2 pr-3 font-medium">{t.variantShort}</th>
                  <th className="py-2 pr-3 text-right font-medium">{t.colVisitors}</th>
                  <th className="py-2 text-right font-medium">{t.conversions}</th>
                </tr>
              </thead>
              <tbody>
                {summary.campaigns.map((row, index) => (
                  <tr key={index} className="border-b border-border/60 last:border-b-0">
                    <td className="py-2 pr-3 font-medium text-foreground">{row.campaign ?? "–"}</td>
                    <td className="py-2 pr-3 text-foreground">{row.source ?? "–"}</td>
                    <td className="py-2 pr-3 text-foreground">{row.medium ?? "–"}</td>
                    <td className="py-2 pr-3 text-foreground">{row.content ?? "–"}</td>
                    <td className="py-2 pr-3 text-right tabular-nums text-foreground">{number.format(row.visitors)}</td>
                    <td className="py-2 text-right tabular-nums text-foreground">{number.format(row.conversions)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-border bg-card p-5 sm:p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold text-foreground">{t.topPages}</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead className="text-xs text-muted-foreground">
                <tr className="border-b border-border">
                  <th className="py-2 pr-3 font-medium">{t.topPages}</th>
                  <th className="py-2 pr-3 text-right font-medium">{t.colViews}</th>
                  <th className="py-2 pr-3 text-right font-medium">{t.colVisitors}</th>
                  <th className="py-2 pr-3 text-right font-medium">{t.colAvgTime}</th>
                  <th className="py-2 text-right font-medium">{t.colScroll}</th>
                </tr>
              </thead>
              <tbody>
                {summary.pages.map((row) => (
                  <tr key={row.path} className="border-b border-border/60 last:border-b-0">
                    <td className="max-w-0 truncate py-2 pr-3 font-mono text-xs text-foreground" title={row.path}>
                      {row.path}
                    </td>
                    <td className="py-2 pr-3 text-right tabular-nums text-foreground">{number.format(row.views)}</td>
                    <td className="py-2 pr-3 text-right tabular-nums text-foreground">{number.format(row.visitors)}</td>
                    <td className="py-2 pr-3 text-right tabular-nums text-foreground">
                      {formatDuration(row.avgSeconds)}
                    </td>
                    <td className="py-2 text-right tabular-nums text-foreground">
                      {row.avgScrollDepth !== null ? `${number.format(row.avgScrollDepth)}%` : "–"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <Breakdown title={t.landingPages} rows={summary.landingPages} label={(path) => path ?? t.unknown} t={t} number={number} mono />
        <Breakdown title={t.exitPages} rows={summary.journeys.exits} label={(path) => path ?? t.unknown} t={t} number={number} mono />
        <Breakdown title={t.sources} rows={summary.sources} label={(source) => source ?? t.direct} t={t} number={number} />
        <Breakdown title={t.countries} rows={summary.countries} label={countryName} t={t} number={number} />
        <Breakdown title={t.devices} rows={summary.devices} label={deviceName} t={t} number={number} />
        <Breakdown title={t.languages} rows={summary.languages} label={languageName} t={t} number={number} />
      </div>

      <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-foreground">{t.events}</h2>
        {summary.events.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">{t.empty}</p>
        ) : (
          <table className="mt-3 w-full text-left text-sm">
            <thead className="text-xs text-muted-foreground">
              <tr className="border-b border-border">
                <th className="py-2 pr-3 font-medium">{t.events}</th>
                <th className="py-2 pr-3 text-right font-medium">{t.colCount}</th>
                <th className="py-2 text-right font-medium">{t.colVisitors}</th>
              </tr>
            </thead>
            <tbody>
              {summary.events.map((row) => (
                <tr key={row.name} className="border-b border-border/60 last:border-b-0">
                  <td className="py-2 pr-3 text-foreground">{isAnalyticsEvent(row.name) ? t.eventNames[row.name] : row.name}</td>
                  <td className="py-2 pr-3 text-right tabular-nums text-foreground">{number.format(row.count)}</td>
                  <td className="py-2 text-right tabular-nums text-foreground">{number.format(row.visitors)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-2 text-3xl font-bold tabular-nums text-foreground">{value}</p>
    </div>
  );
}

type BreakdownProps = {
  title: string;
  rows: CountRow[];
  label: (value: string | null) => string;
  t: AnalyticsCopy;
  number: Intl.NumberFormat;
  mono?: boolean;
};

/** A ranked list with a proportional bar behind each count (one measure, one colour). */
function Breakdown({ title, rows, label, t, number, mono }: BreakdownProps) {
  const max = Math.max(1, ...rows.map((row) => row.visitors));
  return (
    <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        <span className="text-xs text-muted-foreground">{t.colVisitors}</span>
      </div>
      {rows.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">{t.empty}</p>
      ) : (
        <ul className="mt-3 space-y-2.5">
          {rows.map((row) => (
            <li key={row.label ?? "__none"} className="space-y-1">
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className={`min-w-0 truncate text-foreground ${mono ? "font-mono text-xs" : ""}`} title={label(row.label)}>
                  {label(row.label)}
                </span>
                <span className="shrink-0 font-semibold tabular-nums text-foreground">{number.format(row.visitors)}</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded bg-muted" aria-hidden="true">
                <div className="h-full rounded bg-primary/70" style={{ width: `${(row.visitors / max) * 100}%` }} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

type DailyChartProps = {
  daily: DailyPoint[];
  t: AnalyticsCopy;
  number: Intl.NumberFormat;
  locale: string;
};

/** Visitors per day: one series, bars anchored to the baseline, with a hover readout. */
function DailyChart({ daily, t, number, locale }: DailyChartProps) {
  const [active, setActive] = useState<number | null>(null);
  const max = Math.max(1, ...daily.map((point) => point.visitors));
  const dateFormat = useMemo(() => new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", timeZone: "UTC" }), [locale]);
  const formatDay = (day: string) => dateFormat.format(new Date(`${day}T00:00:00Z`));
  // Without hover, the readout shows the most recent day.
  const shown = daily[active ?? daily.length - 1];
  const height = 160;
  const gap = daily.length > 120 ? 0 : 2;

  return (
    <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="text-lg font-semibold text-foreground">{t.dailyTitle}</h2>
        <p className="text-sm tabular-nums text-muted-foreground" aria-live="polite">
          {shown
            ? `${formatDay(shown.day)}: ${t.visitors} ${number.format(shown.visitors)} · ${t.colViews} ${number.format(shown.pageviews)}`
            : null}
        </p>
      </div>
      <div
        className="mt-4 flex items-end border-b border-border"
        style={{ height, gap }}
        role="img"
        aria-label={`${t.dailyTitle}: ${daily.map((point) => `${formatDay(point.day)} ${point.visitors}`).join(", ")}`}
        onMouseLeave={() => setActive(null)}
      >
        {daily.map((point, index) => (
          <div
            key={point.day}
            className="flex h-full min-w-0 flex-1 cursor-default items-end"
            onMouseEnter={() => setActive(index)}
          >
            <div
              className={`w-full rounded-t ${active === index ? "bg-primary" : "bg-primary/70"}`}
              style={{ height: point.visitors > 0 ? `${Math.max(2, (point.visitors / max) * height)}px` : 0 }}
            />
          </div>
        ))}
      </div>
      <div className="mt-2 flex justify-between text-xs tabular-nums text-muted-foreground">
        <span>{daily[0] ? formatDay(daily[0].day) : ""}</span>
        <span>{daily.at(-1) ? formatDay(daily.at(-1)!.day) : ""}</span>
      </div>
    </section>
  );
}
