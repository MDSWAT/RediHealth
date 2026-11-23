"use client";

import { useMemo, useRef, useState } from "react";
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

  async function save() {
    if (!onSave || links.length === 0) return;
    setSaveState("saving");
    const ok = await onSave(links.map(({ platform, fields }) => ({ ...fields, label: platformLabel(platform) })));
    setSaveState(ok ? "saved" : "error");
  }

  function toggle(id: string) {
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

  const inputClass =
    "mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";
  const labelClass = "block text-sm font-medium text-foreground";
  const toggleClass = (on: boolean) =>
    `inline-flex items-center whitespace-nowrap rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
      on ? "border-primary bg-primary text-white" : "border-border bg-white text-foreground hover:bg-muted"
    }`;

  return (
    <section className="mt-8 rounded-xl border border-border bg-card p-5 sm:p-6" aria-labelledby="campaign-links-title">
      <h2 id="campaign-links-title" className="text-lg font-semibold text-foreground">
        {t.campaignTitle}
      </h2>
      <p className="mt-1 max-w-3xl text-sm leading-relaxed text-muted-foreground">{t.campaignHelp}</p>

      <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <label className="lg:col-span-2">
          <span className={labelClass}>{t.campaignName}</span>
          <input
            type="text"
            value={campaignInput}
            onChange={(event) => setCampaignInput(event.target.value)}
            placeholder={t.campaignPlaceholder}
            maxLength={80}
            className={inputClass}
          />
          {campaign && campaign !== campaignInput ? (
            <span className="mt-1 block text-xs text-muted-foreground">
              {t.savedAs} <code className="font-mono">{campaign}</code>
            </span>
          ) : null}
        </label>
        <label>
          <span className={labelClass}>{t.landingPage}</span>
          <select value={path} onChange={(event) => setPath(event.target.value as LandingPage)} className={inputClass}>
            {LANDING_PAGES.map((page) => (
              <option key={page} value={page}>
                {page === "/" ? t.home : page}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className={labelClass}>{t.linkLanguage}</span>
          <select value={linkLang} onChange={(event) => setLinkLang(event.target.value as Lang)} className={inputClass}>
            {languages.map((item) => (
              <option key={item.code} value={item.code}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <fieldset className="lg:col-span-2">
          <legend className={labelClass}>{t.adType}</legend>
          <div className="mt-1 flex flex-wrap gap-2">
            {(["paid", "free"] as const).map((type) => (
              <button key={type} type="button" aria-pressed={adType === type} onClick={() => setAdType(type)} className={toggleClass(adType === type)}>
                {type === "paid" ? t.paid : t.free}
              </button>
            ))}
          </div>
        </fieldset>
        <label className="lg:col-span-2">
          <span className={labelClass}>{t.variant}</span>
          <input
            type="text"
            value={contentInput}
            onChange={(event) => setContentInput(event.target.value)}
            placeholder={t.variantPlaceholder}
            maxLength={60}
            className={inputClass}
          />
        </label>
      </div>

      <fieldset className="mt-5">
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
        <div className="mt-3 flex flex-wrap items-end gap-2">
          <label className="min-w-[200px] flex-1 sm:max-w-xs">
            <span className="block text-xs font-medium text-muted-foreground">{t.customSource}</span>
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
              className={inputClass}
            />
          </label>
          <button type="button" onClick={addCustom} disabled={!slugify(customInput)} className="crm-button whitespace-nowrap disabled:opacity-50">
            {t.add}
          </button>
        </div>
      </fieldset>

      <div className="mt-6 border-t border-border pt-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-base font-semibold text-foreground">{t.links}</h3>
          <div className="flex flex-wrap gap-2">
            {links.length > 1 ? (
              <button
                type="button"
                onClick={() => copy(links.map((link) => `${platformLabel(link.platform)}: ${link.url}`).join("\n"), "__all")}
                className="crm-button whitespace-nowrap"
              >
                {copied === "__all" ? t.copied : t.copyAll}
              </button>
            ) : null}
            {onSave && links.length > 0 ? (
              <button type="button" onClick={save} disabled={saveState === "saving"} className="crm-button crm-primary whitespace-nowrap disabled:opacity-60">
                {t.saveLinks}
              </button>
            ) : null}
          </div>
        </div>
        {saveState === "saved" || saveState === "error" ? (
          <p role="status" className={`mt-2 text-sm ${saveState === "error" ? "text-red-700" : "text-muted-foreground"}`}>
            {saveState === "saved" ? t.savedNote : t.saveError}
          </p>
        ) : null}
        {!campaign ? (
          <p className="mt-3 text-sm text-muted-foreground">{t.needCampaign}</p>
        ) : links.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">{t.needPlatform}</p>
        ) : (
          <ul className="mt-3 divide-y divide-border/70">
            {links.map(({ platform, url }) => (
              <li key={platform.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3">
                <span className="w-28 shrink-0 text-sm font-semibold text-foreground">{platformLabel(platform)}</span>
                <code className="min-w-0 flex-1 break-all rounded-lg bg-muted px-3 py-2 font-mono text-xs text-foreground">{url}</code>
                <button type="button" onClick={() => copy(url, platform.id)} className="crm-button whitespace-nowrap">
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
