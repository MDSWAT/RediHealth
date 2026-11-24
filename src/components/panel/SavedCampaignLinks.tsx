"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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

const COPY_BUTTON_CLASS =
  "inline-flex min-h-11 items-center justify-center whitespace-nowrap rounded-lg border border-[var(--color-border-control)] bg-[var(--panel-surface)] px-3.5 text-sm font-medium text-[var(--panel-ink)] transition-colors duration-(--dur-fast) hover:bg-[var(--panel-selection)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-sapphire)] dark:border-[#62768c] dark:focus-visible:outline-[#bad7fa]";

const DELETE_BUTTON_CLASS =
  "inline-flex min-h-11 items-center justify-center whitespace-nowrap rounded-lg border border-[var(--color-border-control)] bg-[var(--panel-surface)] px-3.5 text-sm font-medium text-[var(--panel-muted)] transition-colors duration-(--dur-fast) hover:border-clinical-ruby/50 hover:bg-clinical-ruby-soft hover:text-clinical-ruby focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-sapphire)] dark:border-[#62768c] dark:hover:border-ruby-300/50 dark:hover:bg-clinical-ruby/20 dark:hover:text-ruby-300 dark:focus-visible:outline-[#bad7fa] disabled:cursor-not-allowed disabled:border-[var(--color-border-control)] disabled:bg-[var(--panel-subtle)] disabled:text-[var(--panel-muted)] dark:disabled:border-[#62768c]";

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
    <section className="mt-10 min-w-0 border-t border-[var(--panel-line)] pt-8" aria-labelledby="saved-links-title">
      <h2 id="saved-links-title" className="text-base font-semibold tracking-[-0.015em] text-[var(--panel-ink)]">
        {t.savedLinks}
      </h2>
      <p className="mt-1 max-w-2xl text-xs leading-relaxed text-[var(--panel-muted)]">{t.savedLinksHelp}</p>

      {links.length === 0 ? (
        <p className="mt-4 text-sm text-[var(--panel-muted)]">{t.noSavedLinks}</p>
      ) : (
        <div className="mt-6 space-y-8">
          {campaigns.map(([campaign, campaignLinks]) => (
            <div key={campaign} className="min-w-0">
              <h3 className="text-sm font-semibold text-[var(--panel-ink)]">
                {t.campaign}: <span className="font-mono font-medium">{campaign}</span>
              </h3>
              <ul className="mt-3 divide-y divide-[var(--panel-line)] border-t border-[var(--panel-line)]">
                {campaignLinks.map((link) => (
                  <SavedLinkRow
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

type SavedLinkRowProps = {
  link: SavedCampaignLink;
  t: AnalyticsCopy;
  number: Intl.NumberFormat;
  countryName: (code: string | null) => string;
  onDelete: (id: number) => Promise<boolean>;
};

function SavedLinkRow({ link, t, number, countryName, onDelete }: SavedLinkRowProps) {
  const [state, setState] = useState<"idle" | "busy" | "error" | "copied">("idle");
  const copiedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { stats } = link;
  const languageLabel = languages.find((item) => item.code === link.lang)?.label ?? link.lang;

  useEffect(() => {
    return () => {
      if (copiedTimer.current) clearTimeout(copiedTimer.current);
    };
  }, []);

  async function remove() {
    if (!window.confirm(t.deleteConfirm)) return;
    setState("busy");
    if (!(await onDelete(link.id))) setState("error");
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(link.url);
      setState("copied");
      if (copiedTimer.current) clearTimeout(copiedTimer.current);
      copiedTimer.current = setTimeout(() => setState((prev) => (prev === "copied" ? "idle" : prev)), 2000);
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
    <li className="min-w-0 py-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[var(--panel-ink)]">
            {link.label}
            {link.content ? (
              <span className="font-normal text-[var(--panel-muted)]">
                {" "}
                — {t.variantShort}: {link.content}
              </span>
            ) : null}
          </p>
          <p className="mt-0.5 text-xs text-[var(--panel-muted)]">
            {link.path === "/" ? t.home : link.path}, {languageLabel}, {link.medium}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={copy} className={COPY_BUTTON_CLASS}>
            {state === "copied" ? t.copied : t.copy}
          </button>
          <button type="button" onClick={remove} disabled={state === "busy"} className={DELETE_BUTTON_CLASS}>
            {t.delete}
          </button>
        </div>
      </div>

      <code className="mt-3 block select-all break-all rounded-lg border border-[var(--panel-line)] bg-[var(--panel-subtle)] px-3 py-2 font-mono text-xs text-[var(--panel-ink)]">
        {link.url}
      </code>
      {state === "error" ? <p className="mt-2 text-xs text-clinical-ruby dark:text-ruby-300">{t.deleteError}</p> : null}

      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3 lg:grid-cols-6">
        {measured.map(([label, value]) => (
          <div key={label} className="min-w-0">
            <dt className="text-xs text-[var(--panel-muted)]">{label}</dt>
            <dd className="mt-0.5 font-display text-base font-bold tabular-nums text-[var(--panel-ink)]">{value}</dd>
          </div>
        ))}
      </dl>

      <p className="mt-3 text-xs text-[var(--panel-muted)]">
        <span className="font-semibold text-[var(--panel-ink)]">{t.countries}:</span>{" "}
        {stats.countries.length === 0
          ? "–"
          : stats.countries.map((entry) => `${countryName(entry.code)} ${number.format(entry.visitors)}`).join(", ")}
      </p>
    </li>
  );
}
