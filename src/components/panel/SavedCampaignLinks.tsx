"use client";

import { useMemo, useState } from "react";
import type { AnalyticsCopy } from "@/lib/i18n/analytics-translations";
import type { SavedCampaignLink } from "@/lib/data/campaign-links";
import { languages } from "@/lib/i18n/languages";

/** Saved ad links grouped by campaign, each with what it brought to the site (measured by us). */
type SavedCampaignLinksProps = {
  t: AnalyticsCopy;
  locale: string;
  links: SavedCampaignLink[];
  onDelete: (id: number) => Promise<boolean>;
};

export function formatDuration(seconds: number | null): string {
  if (seconds === null || !Number.isFinite(seconds)) return "–";
  const total = Math.max(0, Math.round(seconds));
  const minutes = Math.floor(total / 60);
  return `${minutes}:${String(total % 60).padStart(2, "0")}`;
}

function percent(part: number, whole: number, number: Intl.NumberFormat): string {
  if (whole <= 0) return "–";
  return `${number.format(Math.round((part / whole) * 1000) / 10)}%`;
}

export function SavedCampaignLinks({ t, locale, links, onDelete }: SavedCampaignLinksProps) {
  const number = useMemo(() => new Intl.NumberFormat(locale), [locale]);
  const regionNames = useMemo(() => {
    try {
      return new Intl.DisplayNames([locale, "en"], { type: "region" });
    } catch {
      return null;
    }
  }, [locale]);
  const campaigns = useMemo(() => {
    const groups = new Map<string, SavedCampaignLink[]>();
    for (const link of links) {
      if (!groups.has(link.campaign)) groups.set(link.campaign, []);
      groups.get(link.campaign)!.push(link);
    }
    return [...groups.entries()];
  }, [links]);

  return (
    <section className="mt-8 rounded-xl border border-border bg-card p-5 sm:p-6" aria-labelledby="saved-links-title">
      <h2 id="saved-links-title" className="text-lg font-semibold text-foreground">
        {t.savedLinks}
      </h2>
      <p className="mt-1 max-w-3xl text-sm leading-relaxed text-muted-foreground">{t.savedLinksHelp}</p>

      {links.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">{t.noSavedLinks}</p>
      ) : (
        <div className="mt-5 space-y-8">
          {campaigns.map(([campaign, campaignLinks]) => (
            <div key={campaign}>
              <h3 className="text-base font-semibold text-foreground">
                {t.campaign}: <span className="font-mono">{campaign}</span>
              </h3>
              <ul className="mt-3 space-y-4">
                {campaignLinks.map((link) => (
                  <SavedLinkCard
                    key={link.id}
                    link={link}
                    t={t}
                    number={number}
                    countryName={(code) => (code ? (regionNames?.of(code) ?? code) : t.unknown)}
                    onDelete={onDelete}
                  />
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

type SavedLinkCardProps = {
  link: SavedCampaignLink;
  t: AnalyticsCopy;
  number: Intl.NumberFormat;
  countryName: (code: string | null) => string;
  onDelete: (id: number) => Promise<boolean>;
};

function SavedLinkCard({ link, t, number, countryName, onDelete }: SavedLinkCardProps) {
  const [state, setState] = useState<"idle" | "busy" | "error" | "copied">("idle");
  const { stats } = link;
  const languageLabel = languages.find((item) => item.code === link.lang)?.label ?? link.lang;

  async function remove() {
    if (!window.confirm(t.deleteConfirm)) return;
    setState("busy");
    if (!(await onDelete(link.id))) setState("error");
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(link.url);
      setState("copied");
    } catch {
      // Clipboard blocked: the link stays visible and can be selected by hand.
    }
  }

  const measured: [string, string][] = [
    [t.landingViews, number.format(stats.landingViews)],
    [t.visitors, number.format(stats.visitors)],
    [t.pagesPerVisitor, stats.visitors > 0 ? number.format(Math.round((stats.pageviews / stats.visitors) * 10) / 10) : "–"],
    [t.bounceRate, percent(stats.bounces, stats.visitors, number)],
    [t.avgTime, formatDuration(stats.avgSeconds)],
    [t.conversions, number.format(stats.conversions)],
  ];

  return (
    <li className="rounded-xl border border-border p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground">
            {link.label}
            {link.content ? <span className="font-normal text-muted-foreground"> · {t.variantShort}: {link.content}</span> : null}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {link.path === "/" ? t.home : link.path} · {languageLabel} · {link.medium}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={copy} className="crm-button whitespace-nowrap">
            {state === "copied" ? t.copied : t.copy}
          </button>
          <button type="button" onClick={remove} disabled={state === "busy"} className="crm-button whitespace-nowrap disabled:opacity-60">
            {t.delete}
          </button>
        </div>
      </div>
      <code className="mt-2 block break-all rounded-lg bg-muted px-3 py-2 font-mono text-xs text-foreground">{link.url}</code>
      {state === "error" ? <p className="mt-2 text-xs text-red-700">{t.deleteError}</p> : null}

      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3 lg:grid-cols-6">
        {measured.map(([label, value]) => (
          <div key={label}>
            <dt className="text-xs text-muted-foreground">{label}</dt>
            <dd className="text-base font-semibold tabular-nums text-foreground">{value}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-3 text-xs text-muted-foreground">
        <span className="font-semibold text-foreground">{t.countries}:</span>{" "}
        {stats.countries.length === 0
          ? "–"
          : stats.countries.map((entry) => `${countryName(entry.code)} ${number.format(entry.visitors)}`).join(", ")}
      </p>
    </li>
  );
}
