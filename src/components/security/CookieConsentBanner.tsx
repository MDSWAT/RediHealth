"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { CloseIcon } from "@/components/ui/icons";
import { cookieConsentCopy } from "@/components/security/cookie-consent-copy";
import { useLanguage } from "@/lib/i18n/language-context";
import { withLangPrefix } from "@/lib/i18n/routing";
import {
  OPEN_COOKIE_PREFERENCES_EVENT,
  getCookieConsentSnapshot,
  subscribeCookieConsent,
  writeCookieConsent,
} from "@/lib/privacy/cookie-consent";

const SERVER_SNAPSHOT = undefined;

/**
 * GDPR cookie consent banner (first visit) and preferences dialog (re-openable from Footer,
 * /cookies and /privacy). Strictly follows CLAUDE.md UI rules: no pills/badges/status dots,
 * single-line button labels across all 7 locales, equal-weight accept and necessary-only actions.
 */
export function CookieConsentBanner() {
  const { lang } = useLanguage();
  const copy = cookieConsentCopy[lang] ?? cookieConsentCopy.ro;

  // undefined during SSR/hydration so the banner never flashes before reading stored consent.
  const consent = useSyncExternalStore(
    subscribeCookieConsent,
    getCookieConsentSnapshot,
    () => SERVER_SNAPSHOT,
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [draftMarketing, setDraftMarketing] = useState(false);
  const dialogPanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onOpen = () => {
      setDraftMarketing(Boolean(getCookieConsentSnapshot()?.marketing));
      setDialogOpen(true);
    };
    window.addEventListener(OPEN_COOKIE_PREFERENCES_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_COOKIE_PREFERENCES_EVENT, onOpen);
  }, []);

  useEffect(() => {
    if (!dialogOpen) return;
    dialogPanelRef.current?.focus({ preventScroll: true });
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDialogOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [dialogOpen]);

  function handleChoice(marketing: boolean) {
    writeCookieConsent(marketing);
    setDraftMarketing(marketing);
    setDialogOpen(false);
  }

  if (consent === undefined) return null;

  const showBanner = consent === null && !dialogOpen;

  return (
    <>
      {showBanner ? (
        <aside
          role="region"
          aria-label={copy.bannerRegionLabel}
          className="fixed inset-x-0 bottom-0 z-[70] border-t border-border bg-card/98 text-foreground shadow-lg backdrop-blur-md print:hidden"
        >
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:gap-8 lg:py-5">
            <div className="min-w-0 max-w-2xl space-y-1.5">
              <p className="text-body font-semibold text-foreground">{copy.bannerTitle}</p>
              <p className="text-meta leading-relaxed text-muted-foreground">
                {copy.bannerBody}{" "}
                <Link
                  href={withLangPrefix("/cookies", lang)}
                  className="rounded-sm text-sapphire underline decoration-sapphire/40 underline-offset-4 transition-colors duration-[var(--dur-fast)] hover:text-sapphire-light hover:decoration-sapphire focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:text-sapphire-border"
                >
                  {copy.policyLinkLabel}
                </Link>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 lg:shrink-0">
              <Button
                type="button"
                variant="ghost"
                size="md"
                onClick={() => {
                  setDraftMarketing(false);
                  setDialogOpen(true);
                }}
              >
                {copy.openSettings}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => handleChoice(false)}
              >
                {copy.necessaryOnly}
              </Button>
              <Button
                type="button"
                variant="action"
                size="md"
                onClick={() => handleChoice(true)}
              >
                {copy.acceptAll}
              </Button>
            </div>
          </div>
        </aside>
      ) : null}

      {dialogOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="cookie-settings-title"
          className="fixed inset-0 z-[105] flex items-end justify-center bg-ink-950/70 p-0 sm:items-center sm:p-4"
        >
          <div
            className="fixed inset-0 -z-10"
            onClick={() => setDialogOpen(false)}
            aria-hidden="true"
          />

          <div
            ref={dialogPanelRef}
            tabIndex={-1}
            className="relative flex max-h-[90dvh] w-full max-w-xl flex-col overflow-hidden rounded-t-xl border border-border bg-card text-foreground shadow-2xl focus:outline-none sm:rounded-xl"
          >
            <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4 sm:px-6 sm:py-5">
              <div className="min-w-0">
                <h2 id="cookie-settings-title" className="text-title font-semibold text-foreground">
                  {copy.dialogTitle}
                </h2>
                <p className="mt-1 text-meta text-muted-foreground">{copy.dialogIntro}</p>
              </div>

              <button
                type="button"
                onClick={() => setDialogOpen(false)}
                aria-label={copy.closeLabel}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors duration-[var(--dur-fast)] hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <CloseIcon className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <div className="min-h-0 flex-1 divide-y divide-border overflow-y-auto px-5 py-2 sm:px-6">
              <div className="py-4">
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="text-body font-semibold text-foreground">{copy.necessaryTitle}</h3>
                  <span className="shrink-0 text-meta font-medium text-muted-foreground">
                    {copy.necessaryStatus}
                  </span>
                </div>
                <p className="mt-1.5 text-meta leading-relaxed text-muted-foreground">
                  {copy.necessaryBody}
                </p>
              </div>

              <div className="py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="text-body font-semibold text-foreground">{copy.marketingTitle}</h3>
                    <p className="mt-0.5 text-meta text-muted-foreground">
                      {draftMarketing ? copy.marketingStatusOn : copy.marketingStatusOff}
                    </p>
                  </div>
                  <label className="inline-flex min-h-11 shrink-0 cursor-pointer items-center">
                    <input
                      type="checkbox"
                      checked={draftMarketing}
                      onChange={(event) => setDraftMarketing(event.target.checked)}
                      aria-label={copy.marketingToggleAria}
                      className="h-5 w-5 rounded border-border-control accent-sapphire focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </label>
                </div>
                <p className="mt-2 text-meta leading-relaxed text-muted-foreground">
                  {copy.marketingBody}
                </p>
              </div>

              <div className="flex flex-wrap gap-x-5 gap-y-2 py-4 text-meta">
                <Link
                  href={withLangPrefix("/cookies", lang)}
                  onClick={() => setDialogOpen(false)}
                  className="rounded-sm text-sapphire underline decoration-sapphire/40 underline-offset-4 hover:text-sapphire-light hover:decoration-sapphire focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:text-sapphire-border"
                >
                  {copy.policyLinkLabel}
                </Link>
                <Link
                  href={withLangPrefix("/privacy", lang)}
                  onClick={() => setDialogOpen(false)}
                  className="rounded-sm text-sapphire underline decoration-sapphire/40 underline-offset-4 hover:text-sapphire-light hover:decoration-sapphire focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:text-sapphire-border"
                >
                  {copy.privacyLinkLabel}
                </Link>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2.5 border-t border-border px-5 py-4 sm:px-6">
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => handleChoice(false)}
              >
                {copy.necessaryOnly}
              </Button>
              <Button
                type="button"
                variant="action"
                size="md"
                onClick={() => handleChoice(draftMarketing)}
              >
                {copy.saveChoices}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
