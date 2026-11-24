"use client";

import { useMemo, useRef, useState } from "react";
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
      <main id="main-content" className="min-h-dvh min-w-0 bg-[var(--panel-surface)] text-[var(--panel-ink)] py-6 sm:py-8">
        <Container className="min-w-0">
          <header className="flex flex-wrap items-end justify-between gap-4 border-b border-[var(--panel-line)] pb-5">
            <h1 className="font-display text-2xl font-bold tracking-[-0.025em] text-[var(--panel-ink)] sm:text-[1.875rem]">
              {t.title}
            </h1>
            <nav aria-label={t.period} className="flex flex-wrap gap-1.5 sm:gap-2">
              {ANALYTICS_RANGES.map((days) => (
                <Link
                  key={days}
                  href={{ query: { range: days } }}
                  scroll={false}
                  aria-current={days === range ? "page" : undefined}
                  className={`inline-flex min-h-11 items-center justify-center whitespace-nowrap rounded-lg border px-2.5 text-[13px] font-medium transition-colors duration-(--dur-fast) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-sapphire)] sm:px-3.5 sm:text-sm dark:focus-visible:outline-[#bad7fa] ${
                    days === range
                      ? "border-[var(--color-sapphire)] bg-[var(--color-sapphire)] font-semibold text-white hover:bg-[#28476f]"
                      : "border-[var(--color-border-control)] bg-[var(--panel-surface)] text-[var(--panel-ink)] hover:bg-[var(--panel-selection)] dark:border-[#62768c]"
                  }`}
                >
                  {days === 365 ? t.lastYear : t.lastDays.replace("{n}", String(days))}
                </Link>
              ))}
            </nav>
          </header>

          {message ? (
            <p className="mt-6 max-w-2xl text-sm leading-relaxed text-[var(--panel-muted)]">{message}</p>
          ) : result.status === "ok" ? (
            <Summary summary={result.summary} t={t} number={number} locale={locale} />
          ) : null}

          <CampaignLinkBuilder t={t} lang={lang} onSave={result.status === "ok" ? saveLinks : undefined} />
          {result.status === "ok" ? (
            <SavedCampaignLinks t={t} locale={locale} links={savedLinks} onDelete={deleteLink} />
          ) : null}

          <div className="mt-10 border-t border-[var(--panel-line)] pt-5">
            <p className="max-w-3xl text-xs leading-relaxed text-[var(--panel-muted)]">{t.privacyNote}</p>
          </div>
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
    return <p className="mt-6 max-w-2xl text-sm leading-relaxed text-[var(--panel-muted)]">{t.empty}</p>;
  }

  const primaryMetrics: [string, string][] = [
    [t.visitors, number.format(totals.visitors)],
    [t.pageviews, number.format(totals.pageviews)],
    [t.pagesPerVisitor, pagesPerVisitor],
    [
      t.stayRate,
      totals.visitors > 0
        ? `${number.format(Math.round((summary.behaviour.engagedVisitors / totals.visitors) * 1000) / 10)}%`
        : "–",
    ],
    [
      t.bounceRate,
      totals.visitors > 0 ? `${number.format(Math.round((summary.behaviour.bounces / totals.visitors) * 1000) / 10)}%` : "–",
    ],
    [t.avgPageTime, formatDuration(summary.behaviour.avgPageSeconds ?? summary.behaviour.avgSeconds)],
    [
      t.avgScrollDepth,
      summary.behaviour.avgScrollDepth !== null ? `${number.format(summary.behaviour.avgScrollDepth)}%` : "–",
    ],
    [t.conversions, number.format(totals.events)],
  ];

  const funnelMetrics: [string, string][] = [
    [t.feedbackInitialShown, number.format(summary.feedbackFunnel.initialShown)],
    [t.feedbackFollowupShown, number.format(summary.feedbackFunnel.followupShown)],
    [t.feedbackDismissed, number.format(summary.feedbackFunnel.dismissed)],
    [t.feedbackCompleted, number.format(summary.feedbackFunnel.submitted)],
  ];

  return (
    <div className="min-w-0 space-y-8">
      {/* Editorial KPI ledger */}
      <section aria-label={t.title} className="min-w-0">
        <dl className="grid grid-cols-2 gap-px border-b border-[var(--panel-line)] bg-[var(--panel-line)] lg:grid-cols-4">
          {primaryMetrics.map(([label, value]) => (
            <div
              key={label}
              className="min-w-0 bg-[var(--panel-surface)] px-4 py-3.5 max-lg:odd:pl-0 max-lg:even:pr-0 sm:px-5 sm:py-4 lg:[&:nth-child(4n+1)]:pl-0 lg:[&:nth-child(4n)]:pr-0"
            >
              <dt className="text-xs font-medium text-[var(--panel-muted)]">{label}</dt>
              <dd className="mt-1 font-display text-2xl font-bold tracking-[-0.02em] tabular-nums text-[var(--panel-ink)] sm:text-[1.625rem]">
                {value}
              </dd>
            </div>
          ))}
        </dl>
        <p className="mt-3 max-w-3xl text-xs leading-relaxed text-[var(--panel-muted)]">{t.visitorsNote}</p>
      </section>

      <DailyChart daily={summary.daily} t={t} number={number} locale={locale} />

      {/* Top pages */}
      <section className="min-w-0 border-t border-[var(--panel-line)] pt-7">
        <h2 className="text-base font-semibold tracking-[-0.015em] text-[var(--panel-ink)]">{t.topPages}</h2>
        {summary.pages.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--panel-muted)]">{t.empty}</p>
        ) : (
          <div className="mt-3 min-w-0 w-full overflow-x-auto">
            <table className="w-full min-w-[500px] border-collapse text-left text-sm">
              <thead className="border-b border-[var(--panel-line)] text-xs text-[var(--panel-muted)]">
                <tr>
                  <th className="py-2 pr-4 font-medium">{t.topPages}</th>
                  <th className="w-20 py-2 pr-4 text-right font-medium">{t.colViews}</th>
                  <th className="w-24 py-2 pr-4 text-right font-medium">{t.colVisitors}</th>
                  <th className="w-24 py-2 pr-4 text-right font-medium">{t.colAvgTime}</th>
                  <th className="w-20 py-2 text-right font-medium">{t.colScroll}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--panel-line)]">
                {summary.pages.map((row) => (
                  <tr key={row.path} className="hover:bg-[var(--panel-subtle)]">
                    <td className="max-w-[220px] truncate py-2.5 pr-4 font-mono text-xs text-[var(--panel-ink)] sm:max-w-none" title={row.path}>
                      {row.path}
                    </td>
                    <td className="py-2.5 pr-4 text-right tabular-nums text-[var(--panel-ink)]">{number.format(row.views)}</td>
                    <td className="py-2.5 pr-4 text-right tabular-nums text-[var(--panel-ink)]">{number.format(row.visitors)}</td>
                    <td className="py-2.5 pr-4 text-right tabular-nums text-[var(--panel-ink)]">{formatDuration(row.avgSeconds)}</td>
                    <td className="py-2.5 text-right tabular-nums text-[var(--panel-ink)]">
                      {row.avgScrollDepth !== null ? `${number.format(row.avgScrollDepth)}%` : "–"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Ranked breakdowns */}
      <div className="grid min-w-0 gap-x-10 gap-y-8 border-t border-[var(--panel-line)] pt-7 lg:grid-cols-2">
        <Breakdown title={t.landingPages} rows={summary.landingPages} label={(path) => path ?? t.unknown} t={t} number={number} mono />
        <Breakdown title={t.exitPages} rows={summary.journeys.exits} label={(path) => path ?? t.unknown} t={t} number={number} mono />
        <Breakdown title={t.sources} rows={summary.sources} label={(source) => source ?? t.direct} t={t} number={number} />
        <Breakdown title={t.countries} rows={summary.countries} label={countryName} t={t} number={number} />
        <Breakdown title={t.devices} rows={summary.devices} label={deviceName} t={t} number={number} />
        <Breakdown title={t.languages} rows={summary.languages} label={languageName} t={t} number={number} />
      </div>

      {/* User journeys */}
      <section className="min-w-0 border-t border-[var(--panel-line)] pt-7">
        <h2 className="text-base font-semibold tracking-[-0.015em] text-[var(--panel-ink)]">{t.journeysTitle}</h2>
        {summary.journeys.transitions.length === 0 && summary.journeys.paths.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--panel-muted)]">{t.noJourneys}</p>
        ) : (
          <div className="mt-4 grid min-w-0 gap-x-10 gap-y-6 lg:grid-cols-2">
            <div className="min-w-0">
              <div className="flex items-baseline justify-between gap-3 border-b border-[var(--panel-line)] pb-2">
                <h3 className="text-sm font-semibold text-[var(--panel-ink)]">{t.topTransitions}</h3>
                <span className="text-xs text-[var(--panel-muted)]">{t.colVisitors}</span>
              </div>
              {summary.journeys.transitions.length === 0 ? (
                <p className="mt-3 text-sm text-[var(--panel-muted)]">{t.noJourneys}</p>
              ) : (
                <ul className="mt-3 space-y-2.5">
                  {(() => {
                    const maxTrans = Math.max(1, ...summary.journeys.transitions.map((r) => r.visitors));
                    return summary.journeys.transitions.map((row) => (
                      <li key={`${row.fromPath}->${row.toPath}`} className="min-w-0 space-y-1">
                        <div className="flex items-baseline justify-between gap-3 text-xs">
                          <span className="min-w-0 truncate font-mono text-[var(--panel-ink)]" title={`${row.fromPath} → ${row.toPath}`}>
                            {row.fromPath} <span className="text-[var(--panel-muted)]">→</span> {row.toPath}
                          </span>
                          <span className="shrink-0 font-semibold tabular-nums text-[var(--panel-ink)]">
                            {number.format(row.visitors)}
                          </span>
                        </div>
                        <div className="h-1 w-full overflow-hidden rounded-xs bg-[var(--panel-subtle)]" aria-hidden="true">
                          <div
                            className="h-full rounded-xs bg-[var(--color-sapphire)]/80 dark:bg-[#bad7fa]/80"
                            style={{ width: `${(row.visitors / maxTrans) * 100}%` }}
                          />
                        </div>
                      </li>
                    ));
                  })()}
                </ul>
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-baseline justify-between gap-3 border-b border-[var(--panel-line)] pb-2">
                <h3 className="text-sm font-semibold text-[var(--panel-ink)]">{t.topPaths}</h3>
                <span className="text-xs text-[var(--panel-muted)]">{t.colVisitors}</span>
              </div>
              {summary.journeys.paths.length === 0 ? (
                <p className="mt-3 text-sm text-[var(--panel-muted)]">{t.noJourneys}</p>
              ) : (
                <ul className="divide-y divide-[var(--panel-line)]">
                  {summary.journeys.paths.map((row, index) => (
                    <li
                      key={`${row.steps.join("->")}-${index}`}
                      className="flex items-baseline justify-between gap-4 py-2.5"
                    >
                      <span className="min-w-0 break-words font-mono text-xs leading-relaxed text-[var(--panel-ink)]">
                        {row.steps.map((stepPath, stepIdx) => (
                          <span key={`${stepPath}-${stepIdx}`}>
                            {stepIdx > 0 ? <span className="mx-1.5 text-[var(--panel-muted)]">→</span> : null}
                            {stepPath}
                          </span>
                        ))}
                      </span>
                      <span className="shrink-0 text-sm font-semibold tabular-nums text-[var(--panel-ink)]">
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

      {/* Clicks */}
      <section className="min-w-0 border-t border-[var(--panel-line)] pt-7">
        <h2 className="text-base font-semibold tracking-[-0.015em] text-[var(--panel-ink)]">{t.clicksTitle}</h2>
        {summary.clicks.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--panel-muted)]">{t.noClicks}</p>
        ) : (
          <div className="mt-3 min-w-0 w-full overflow-x-auto">
            <table className="w-full min-w-[520px] border-collapse text-left text-sm">
              <thead className="border-b border-[var(--panel-line)] text-xs text-[var(--panel-muted)]">
                <tr>
                  <th className="py-2 pr-4 font-medium">{t.colElement}</th>
                  <th className="py-2 pr-4 font-medium">{t.colPage}</th>
                  <th className="w-24 py-2 pr-4 text-right font-medium">{t.colClicks}</th>
                  <th className="w-24 py-2 text-right font-medium">{t.colVisitors}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--panel-line)]">
                {summary.clicks.map((row) => (
                  <tr key={`${row.targetKey}|${row.path}`} className="hover:bg-[var(--panel-subtle)]">
                    <td className="py-2.5 pr-4 text-[var(--panel-ink)]">
                      <span className="font-medium">{row.targetLabel}</span>
                      {row.targetKind ? (
                        <span className="ml-2 text-xs text-[var(--panel-muted)]">({row.targetKind})</span>
                      ) : null}
                    </td>
                    <td className="py-2.5 pr-4 font-mono text-xs text-[var(--panel-muted)]">{row.path}</td>
                    <td className="py-2.5 pr-4 text-right tabular-nums text-[var(--panel-ink)]">{number.format(row.clicks)}</td>
                    <td className="py-2.5 text-right tabular-nums text-[var(--panel-ink)]">{number.format(row.visitors)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Feedback prompt funnel */}
      <section className="min-w-0 border-t border-[var(--panel-line)] pt-7">
        <h2 className="text-base font-semibold tracking-[-0.015em] text-[var(--panel-ink)]">{t.feedbackFunnelTitle}</h2>
        <dl className="mt-4 grid grid-cols-2 gap-px border-y border-[var(--panel-line)] bg-[var(--panel-line)] lg:grid-cols-4">
          {funnelMetrics.map(([label, value]) => (
            <div
              key={label}
              className="min-w-0 bg-[var(--panel-surface)] px-4 py-3.5 max-lg:odd:pl-0 max-lg:even:pr-0 sm:px-5 sm:py-4 lg:first:pl-0 lg:last:pr-0"
            >
              <dt className="text-xs font-medium text-[var(--panel-muted)]">{label}</dt>
              <dd className="mt-1 font-display text-2xl font-bold tracking-[-0.02em] tabular-nums text-[var(--panel-ink)]">
                {value}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Ad campaigns */}
      <section className="min-w-0 border-t border-[var(--panel-line)] pt-7">
        <h2 className="text-base font-semibold tracking-[-0.015em] text-[var(--panel-ink)]">{t.campaigns}</h2>
        {summary.campaigns.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--panel-muted)]">{t.noCampaigns}</p>
        ) : (
          <div className="mt-3 min-w-0 w-full overflow-x-auto">
            <table className="w-full min-w-[580px] border-collapse text-left text-sm">
              <thead className="border-b border-[var(--panel-line)] text-xs text-[var(--panel-muted)]">
                <tr>
                  <th className="py-2 pr-4 font-medium">{t.campaign}</th>
                  <th className="py-2 pr-4 font-medium">{t.source}</th>
                  <th className="py-2 pr-4 font-medium">{t.medium}</th>
                  <th className="py-2 pr-4 font-medium">{t.variantShort}</th>
                  <th className="w-24 py-2 pr-4 text-right font-medium">{t.colVisitors}</th>
                  <th className="w-28 py-2 text-right font-medium">{t.conversions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--panel-line)]">
                {summary.campaigns.map((row, index) => (
                  <tr key={index} className="hover:bg-[var(--panel-subtle)]">
                    <td className="py-2.5 pr-4 font-medium text-[var(--panel-ink)]">{row.campaign ?? "–"}</td>
                    <td className="py-2.5 pr-4 text-[var(--panel-ink)]">{row.source ?? "–"}</td>
                    <td className="py-2.5 pr-4 text-[var(--panel-ink)]">{row.medium ?? "–"}</td>
                    <td className="py-2.5 pr-4 text-[var(--panel-ink)]">{row.content ?? "–"}</td>
                    <td className="py-2.5 pr-4 text-right tabular-nums text-[var(--panel-ink)]">{number.format(row.visitors)}</td>
                    <td className="py-2.5 text-right tabular-nums text-[var(--panel-ink)]">{number.format(row.conversions)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Conversion events */}
      <section className="min-w-0 border-t border-[var(--panel-line)] pt-7">
        <h2 className="text-base font-semibold tracking-[-0.015em] text-[var(--panel-ink)]">{t.events}</h2>
        {summary.events.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--panel-muted)]">{t.empty}</p>
        ) : (
          <div className="mt-3 min-w-0 w-full overflow-x-auto">
            <table className="w-full min-w-[360px] border-collapse text-left text-sm">
              <thead className="border-b border-[var(--panel-line)] text-xs text-[var(--panel-muted)]">
                <tr>
                  <th className="py-2 pr-4 font-medium">{t.events}</th>
                  <th className="w-24 py-2 pr-4 text-right font-medium">{t.colCount}</th>
                  <th className="w-24 py-2 text-right font-medium">{t.colVisitors}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--panel-line)]">
                {summary.events.map((row) => (
                  <tr key={row.name} className="hover:bg-[var(--panel-subtle)]">
                    <td className="py-2.5 pr-4 text-[var(--panel-ink)]">
                      {isAnalyticsEvent(row.name) ? t.eventNames[row.name] : row.name}
                    </td>
                    <td className="py-2.5 pr-4 text-right tabular-nums text-[var(--panel-ink)]">{number.format(row.count)}</td>
                    <td className="py-2.5 text-right tabular-nums text-[var(--panel-ink)]">{number.format(row.visitors)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
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

/** A ranked list with a hairline proportional bar behind each count. */
function Breakdown({ title, rows, label, t, number, mono }: BreakdownProps) {
  const max = Math.max(1, ...rows.map((row) => row.visitors));
  return (
    <section className="min-w-0">
      <div className="flex items-baseline justify-between gap-3 border-b border-[var(--panel-line)] pb-2">
        <h2 className="text-sm font-semibold text-[var(--panel-ink)]">{title}</h2>
        <span className="text-xs text-[var(--panel-muted)]">{t.colVisitors}</span>
      </div>
      {rows.length === 0 ? (
        <p className="mt-3 text-sm text-[var(--panel-muted)]">{t.empty}</p>
      ) : (
        <ul className="mt-3 space-y-2.5">
          {rows.map((row) => (
            <li key={row.label ?? "__none"} className="min-w-0 space-y-1">
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className={`min-w-0 truncate text-[var(--panel-ink)] ${mono ? "font-mono text-xs" : ""}`} title={label(row.label)}>
                  {label(row.label)}
                </span>
                <span className="shrink-0 font-semibold tabular-nums text-[var(--panel-ink)]">{number.format(row.visitors)}</span>
              </div>
              <div className="h-1 w-full overflow-hidden rounded-xs bg-[var(--panel-subtle)]" aria-hidden="true">
                <div
                  className="h-full rounded-xs bg-[var(--color-sapphire)]/80 dark:bg-[#bad7fa]/80"
                  style={{ width: `${(row.visitors / max) * 100}%` }}
                />
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

/** Visitors per day: one series anchored to a hairline baseline, navigable by pointer, touch, and arrow keys. */
function DailyChart({ daily, t, number, locale }: DailyChartProps) {
  const [active, setActive] = useState<number | null>(null);
  const barRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const max = Math.max(1, ...daily.map((point) => point.visitors));
  const dateFormat = useMemo(() => new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", timeZone: "UTC" }), [locale]);
  const formatDay = (day: string) => dateFormat.format(new Date(`${day}T00:00:00Z`));
  const selectedIndex = active ?? (daily.length > 0 ? daily.length - 1 : -1);
  const shown = selectedIndex >= 0 ? daily[selectedIndex] : undefined;
  const height = 148;
  const gap = daily.length > 120 ? 0 : 2;

  function moveFocus(nextIndex: number) {
    if (daily.length === 0) return;
    const clamped = Math.max(0, Math.min(daily.length - 1, nextIndex));
    setActive(clamped);
    barRefs.current[clamped]?.focus();
  }

  return (
    <section className="min-w-0 border-t border-[var(--panel-line)] pt-7">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="text-base font-semibold tracking-[-0.015em] text-[var(--panel-ink)]">{t.dailyTitle}</h2>
        <p className="text-sm tabular-nums text-[var(--panel-muted)]" aria-live="polite">
          {shown
            ? `${formatDay(shown.day)}: ${t.visitors} ${number.format(shown.visitors)}, ${t.colViews} ${number.format(shown.pageviews)}`
            : null}
        </p>
      </div>
      <div className="relative mt-4">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-1/2 border-t border-[var(--panel-line)]/60"
        />
        <div
          className="relative flex items-end border-b border-[var(--panel-line)]"
          style={{ height, gap }}
          role="group"
          aria-label={t.dailyTitle}
          onMouseLeave={() => setActive(null)}
        >
          {daily.map((point, index) => {
            const isSelected = selectedIndex === index;
            const hasVisitors = point.visitors > 0;
            return (
              <button
                key={point.day}
                ref={(node) => {
                  barRefs.current[index] = node;
                }}
                type="button"
                tabIndex={isSelected ? 0 : -1}
                aria-pressed={active === index}
                aria-label={`${formatDay(point.day)}: ${t.visitors} ${number.format(point.visitors)}, ${t.colViews} ${number.format(point.pageviews)}`}
                className="flex h-full min-w-0 flex-1 cursor-pointer items-end whitespace-nowrap border-0 bg-transparent p-0 transition-colors duration-(--dur-fast) hover:bg-[var(--panel-subtle)] focus-visible:bg-[var(--panel-selection)] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--color-sapphire)] dark:focus-visible:outline-[#bad7fa]"
                onMouseEnter={() => setActive(index)}
                onFocus={() => setActive(index)}
                onClick={() => setActive(index)}
                onKeyDown={(event) => {
                  if (event.key === "ArrowLeft") {
                    event.preventDefault();
                    moveFocus(index - 1);
                  } else if (event.key === "ArrowRight") {
                    event.preventDefault();
                    moveFocus(index + 1);
                  } else if (event.key === "Home") {
                    event.preventDefault();
                    moveFocus(0);
                  } else if (event.key === "End") {
                    event.preventDefault();
                    moveFocus(daily.length - 1);
                  }
                }}
              >
                <span
                  className={`block w-full rounded-t-[2px] transition-colors duration-(--dur-fast) ${
                    hasVisitors
                      ? isSelected
                        ? "bg-[var(--color-sapphire)] dark:bg-[#bad7fa]"
                        : "bg-[var(--color-sapphire)]/70 dark:bg-[#bad7fa]/60"
                      : isSelected
                        ? "bg-[var(--color-sapphire)]/65 dark:bg-[#bad7fa]/65"
                        : "bg-[var(--panel-line)]"
                  }`}
                  style={{ height: hasVisitors ? `${Math.max(4, (point.visitors / max) * height)}px` : "2px" }}
                />
              </button>
            );
          })}
        </div>
      </div>
      <div className="mt-2 flex justify-between text-xs tabular-nums text-[var(--panel-muted)]">
        <span>{daily[0] ? formatDay(daily[0].day) : ""}</span>
        {daily.length >= 14 ? (
          <span className="hidden sm:inline">{formatDay(daily[Math.floor(daily.length / 2)].day)}</span>
        ) : null}
        <span>{daily.at(-1) ? formatDay(daily.at(-1)!.day) : ""}</span>
      </div>
    </section>
  );
}
