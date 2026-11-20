"use client";

import { useState, useSyncExternalStore } from "react";
import { Button } from "@/components/ui/Button";
import { cookieConsentCopy } from "@/components/security/cookie-consent-copy";
import { useLanguage } from "@/lib/i18n/language-context";
import {
  getCookieConsentSnapshot,
  openCookiePreferences,
  subscribeCookieConsent,
  writeCookieConsent,
} from "@/lib/privacy/cookie-consent";

const SERVER_SNAPSHOT = null;

/** Inline cookie status and quick controls for /cookies and /privacy. */
export function CookiePreferencesManager({ inline = true }: { inline?: boolean }) {
  const { lang } = useLanguage();
  const copy = cookieConsentCopy[lang] ?? cookieConsentCopy.ro;
  const consent = useSyncExternalStore(
    subscribeCookieConsent,
    getCookieConsentSnapshot,
    () => SERVER_SNAPSHOT,
  );
  const [savedNotice, setSavedNotice] = useState(false);

  if (!inline) {
    return (
      <div className="mt-4">
        <Button type="button" variant="outline" size="md" onClick={openCookiePreferences}>
          {copy.openSettings}
        </Button>
      </div>
    );
  }

  const statusText = !consent
    ? copy.currentStatusUnset
    : consent.marketing
      ? copy.currentStatusAll
      : copy.currentStatusNecessary;

  return (
    <div className="mt-5 rounded-xl border border-border bg-card p-5 sm:p-6">
      <p className="text-meta font-semibold text-foreground">{copy.currentStatusLabel}</p>
      <p className="mt-1 text-body text-muted-foreground">{statusText}</p>
      {savedNotice ? (
        <p role="status" className="mt-2 text-meta font-medium text-sapphire dark:text-sapphire-border">
          {copy.savedStatus}
        </p>
      ) : null}
      <div className="mt-4 flex flex-wrap items-center gap-2.5">
        <Button
          type="button"
          variant="outline"
          size="md"
          onClick={() => {
            writeCookieConsent(false);
            setSavedNotice(true);
          }}
        >
          {copy.necessaryOnly}
        </Button>
        <Button
          type="button"
          variant="action"
          size="md"
          onClick={() => {
            writeCookieConsent(true);
            setSavedNotice(true);
          }}
        >
          {copy.acceptAll}
        </Button>
        <Button type="button" variant="ghost" size="md" onClick={openCookiePreferences}>
          {copy.openSettings}
        </Button>
      </div>
    </div>
  );
}
