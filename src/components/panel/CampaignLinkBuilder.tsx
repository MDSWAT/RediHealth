"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  LANDING_PAGES,
  PLATFORMS,
  buildCampaignLink,
  mediumFor,
  slugify,
  type AdType,
  type LandingPage,
  type CampaignLinkInput,
  type Platform,
} from "@/lib/campaign-links";
import { languages, type Lang } from "@/lib/i18n/languages";
import type { AnalyticsCopy } from "@/lib/i18n/analytics-translations";

/**
 * Builds tagged links (utm_source / utm_medium / utm_campaign / utm_content) for every place an ad
 * or post is published, so the Statistics page can tell where each visitor came from. Links can be
 * saved; saved links and their results are listed by SavedCampaignLinks.
 */
type CampaignLinkBuilderProps = {
  t: AnalyticsCopy;
  lang: Lang;
  /** Saves the links; resolves to false when saving failed. */
  onSave?: (links: CampaignLinkInput[]) => Promise<boolean>;
};

const OUTLINE_BUTTON_CLASS =
  "inline-flex min-h-11 items-center justify-center whitespace-nowrap rounded-lg border border-[var(--color-border-control)] bg-[var(--panel-surface)] px-3.5 text-sm font-medium text-[var(--panel-ink)] transition-colors duration-(--dur-fast) hover:bg-[var(--panel-selection)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-sapphire)] dark:border-[#62768c] dark:focus-visible:outline-[#bad7fa] disabled:cursor-not-allowed disabled:border-[var(--panel-line)] disabled:bg-[var(--panel-subtle)] disabled:text-[var(--panel-muted)]";

const PRIMARY_BUTTON_CLASS =
  "inline-flex min-h-11 items-center justify-center whitespace-nowrap rounded-lg border border-[var(--color-sapphire)] bg-[var(--color-sapphire)] px-4 text-sm font-semibold text-white transition-colors duration-(--dur-fast) hover:bg-[#28476f] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-sapphire)] dark:focus-visible:outline-[#bad7fa] disabled:cursor-not-allowed disabled:border-[var(--panel-line)] disabled:bg-[var(--panel-subtle)] disabled:text-[var(--panel-muted)]";

const INPUT_CLASS =
  "mt-1.5 min-h-11 w-full rounded-lg border border-[var(--color-border-control)] bg-[var(--panel-surface)] px-3 text-sm text-[var(--panel-ink)] placeholder:text-[var(--panel-muted)] focus-visible:border-[var(--color-sapphire)] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--color-sapphire)] dark:border-[#62768c] dark:focus-visible:border-[#bad7fa] dark:focus-visible:outline-[#bad7fa]";

export function CampaignLinkBuilder({ t, lang, onSave }: CampaignLinkBuilderProps) {
  const [campaignInput, setCampaignInput] = useState("");
  const [contentInput, setContentInput] = useState("");
  const [path, setPath] = useState<LandingPage>("/");
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [linkLang, setLinkLang] = useState<Lang>(lang);
  const [adType, setAdType] = useState<AdType>("paid");
  const [selected, setSelected] = useState<Set<string>>(() => new Set(["facebook", "instagram", "google"]));
  const [custom, setCustom] = useState<Platform[]>([]);
  const [customInput, setCustomInput] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const copiedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (copiedTimer.current) clearTimeout(copiedTimer.current);
    };
  }, []);

  const campaign = slugify(campaignInput);
  const content = slugify(contentInput);
  const platformLabel = (platform: Platform) =>
    platform.kind === "email" ? t.platformEmail : platform.kind === "sms" ? t.platformSms : platform.kind === "print" ? t.platformPrint : platform.label;

  const allPlatforms = useMemo(() => [...PLATFORMS, ...custom], [custom]);
  const links = useMemo(
    () =>
      campaign
        ? allPlatforms
            .filter((platform) => selected.has(platform.id))
            .map((platform) => {
              const fields = {
                lang: linkLang,
                path,
                source: platform.source,
                medium: mediumFor(platform.kind, adType),
                campaign,
                content: content || null,
              };
              return { platform, fields, url: buildCampaignLink(fields) };
            })
        : [],
    [allPlatforms, selected, campaign, content, linkLang, path, adType],
  );

  function markEdited() {
    if (saveState !== "idle") setSaveState("idle");
  }

  async function save() {
    if (!onSave || links.length === 0) return;
    setSaveState("saving");
    const ok = await onSave(links.map(({ platform, fields }) => ({ ...fields, label: platformLabel(platform) })));
    setSaveState(ok ? "saved" : "error");
  }

  function toggle(id: string) {
    markEdited();
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function addCustom() {
    const source = slugify(customInput);
    if (!source) return;
    markEdited();
    const id = `custom:${source}`;
    if (!allPlatforms.some((platform) => platform.id === id || platform.source === source)) {
      setCustom((current) => [...current, { id, label: source, source, kind: "custom" }]);
    }
    setSelected((current) => new Set(current).add(allPlatforms.find((platform) => platform.source === source)?.id ?? id));
    setCustomInput("");
  }

  async function copy(text: string, key: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      if (copiedTimer.current) clearTimeout(copiedTimer.current);
      copiedTimer.current = setTimeout(() => setCopied(null), 2000);
    } catch {
      // Clipboard blocked: the link stays visible and can be selected by hand.
    }
  }

  const labelClass = "block text-sm font-medium text-[var(--panel-ink)]";
  const toggleClass = (on: boolean) =>
    `inline-flex min-h-11 items-center justify-center whitespace-nowrap rounded-lg border px-3.5 text-sm font-medium transition-colors duration-(--dur-fast) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-sapphire)] dark:focus-visible:outline-[#bad7fa] ${
      on
        ? "border-[var(--color-sapphire)] bg-[var(--color-sapphire)] font-semibold text-white hover:bg-[#28476f]"
        : "border-[var(--color-border-control)] bg-[var(--panel-surface)] text-[var(--panel-ink)] hover:bg-[var(--panel-selection)] dark:border-[#62768c]"
    }`;

  return (
    <section className="mt-10 min-w-0 border-t border-[var(--panel-line)] pt-8" aria-labelledby="campaign-links-title">
      <h2 id="campaign-links-title" className="text-base font-semibold tracking-[-0.015em] text-[var(--panel-ink)]">
        {t.campaignTitle}
      </h2>
      <p className="mt-1 max-w-2xl text-xs leading-relaxed text-[var(--panel-muted)]">{t.campaignHelp}</p>

      <div className="mt-5 grid min-w-0 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <label className="min-w-0 lg:col-span-2">
          <span className={labelClass}>{t.campaignName}</span>
          <input
            type="text"
            value={campaignInput}
            onChange={(event) => {
              markEdited();
              setCampaignInput(event.target.value);
            }}
            placeholder={t.campaignPlaceholder}
            maxLength={80}
            className={INPUT_CLASS}
          />
          {campaign && campaign !== campaignInput ? (
            <span className="mt-1.5 block text-xs text-[var(--panel-muted)]">
              {t.savedAs} <code className="font-mono text-[var(--panel-ink)]">{campaign}</code>
            </span>
          ) : null}
        </label>
        <label className="min-w-0">
          <span className={labelClass}>{t.landingPage}</span>
          <select
            value={path}
            onChange={(event) => {
              markEdited();
              setPath(event.target.value as LandingPage);
            }}
            className={`${INPUT_CLASS} whitespace-nowrap`}
          >
            {LANDING_PAGES.map((page) => (
              <option key={page} value={page}>
                {page === "/" ? t.home : page}
              </option>
            ))}
          </select>
        </label>
        <label className="min-w-0">
          <span className={labelClass}>{t.linkLanguage}</span>
          <select
            value={linkLang}
            onChange={(event) => {
              markEdited();
              setLinkLang(event.target.value as Lang);
            }}
            className={`${INPUT_CLASS} whitespace-nowrap`}
          >
            {languages.map((item) => (
              <option key={item.code} value={item.code}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <fieldset className="min-w-0 lg:col-span-2">
          <legend className={labelClass}>{t.adType}</legend>
          <div className="mt-1.5 flex flex-wrap gap-2">
            {(["paid", "free"] as const).map((type) => (
              <button
                key={type}
                type="button"
                aria-pressed={adType === type}
                onClick={() => {
                  markEdited();
                  setAdType(type);
                }}
                className={toggleClass(adType === type)}
              >
                {type === "paid" ? t.paid : t.free}
              </button>
            ))}
          </div>
        </fieldset>
        <label className="min-w-0 lg:col-span-2">
          <span className={labelClass}>{t.variant}</span>
          <input
            type="text"
            value={contentInput}
            onChange={(event) => {
              markEdited();
              setContentInput(event.target.value);
            }}
            placeholder={t.variantPlaceholder}
            maxLength={60}
            className={INPUT_CLASS}
          />
        </label>
      </div>

      <fieldset className="mt-5 min-w-0">
        <legend className={labelClass}>{t.platforms}</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {allPlatforms.map((platform) => (
            <button
              key={platform.id}
              type="button"
              aria-pressed={selected.has(platform.id)}
              onClick={() => toggle(platform.id)}
              className={toggleClass(selected.has(platform.id))}
            >
              {platformLabel(platform)}
            </button>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap items-end gap-2">
          <label className="min-w-[180px] flex-1 sm:max-w-xs">
            <span className="block text-xs font-medium text-[var(--panel-muted)]">{t.customSource}</span>
            <input
              type="text"
              value={customInput}
              onChange={(event) => setCustomInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  addCustom();
                }
              }}
              placeholder={t.customPlaceholder}
              maxLength={40}
              className={INPUT_CLASS}
            />
          </label>
          <button type="button" onClick={addCustom} disabled={!slugify(customInput)} className={OUTLINE_BUTTON_CLASS}>
            {t.add}
          </button>
        </div>
      </fieldset>

      <div className="mt-6 border-t border-[var(--panel-line)] pt-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-[var(--panel-ink)]">{t.links}</h3>
          <div className="flex flex-wrap gap-2">
            {links.length > 1 ? (
              <button
                type="button"
                onClick={() => copy(links.map((link) => `${platformLabel(link.platform)}: ${link.url}`).join("\n"), "__all")}
                className={OUTLINE_BUTTON_CLASS}
              >
                {copied === "__all" ? t.copied : t.copyAll}
              </button>
            ) : null}
            {onSave && links.length > 0 ? (
              <button type="button" onClick={save} disabled={saveState === "saving"} className={PRIMARY_BUTTON_CLASS}>
                {t.saveLinks}
              </button>
            ) : null}
          </div>
        </div>
        {saveState === "saved" || saveState === "error" ? (
          <p
            role="status"
            className={`mt-2 text-sm ${
              saveState === "error" ? "text-clinical-ruby dark:text-ruby-300" : "text-[var(--panel-muted)]"
            }`}
          >
            {saveState === "saved" ? t.savedNote : t.saveError}
          </p>
        ) : null}
        {!campaign ? (
          <p className="mt-3 text-sm text-[var(--panel-muted)]">{t.needCampaign}</p>
        ) : links.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--panel-muted)]">{t.needPlatform}</p>
        ) : (
          <ul className="mt-3 divide-y divide-[var(--panel-line)]">
            {links.map(({ platform, url }) => (
              <li key={platform.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3">
                <span className="min-w-28 shrink-0 text-sm font-semibold text-[var(--panel-ink)] sm:w-36">
                  {platformLabel(platform)}
                </span>
                <code className="min-w-0 flex-1 select-all break-all rounded-lg border border-[var(--panel-line)] bg-[var(--panel-subtle)] px-3 py-2 font-mono text-xs text-[var(--panel-ink)]">
                  {url}
                </code>
                <button type="button" onClick={() => copy(url, platform.id)} className={OUTLINE_BUTTON_CLASS}>
                  {copied === platform.id ? t.copied : t.copy}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
