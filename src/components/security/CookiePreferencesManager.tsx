"use client";

import { Button } from "@/components/ui/Button";
import { cookieConsentCopy } from "@/components/security/cookie-consent-copy";
import { useLanguage } from "@/lib/i18n/language-context";
import { openCookiePreferences } from "@/lib/privacy/cookie-consent";

/** Inline cookie summary and details modal trigger for /cookies and /privacy. */
export function CookiePreferencesManager({ inline = true }: { inline?: boolean }) {
  const { lang } = useLanguage();
  const copy = cookieConsentCopy[lang] ?? cookieConsentCopy.ro;

  if (!inline) {
    return (
      <div className="mt-4">
        <Button type="button" variant="outline" size="md" onClick={openCookiePreferences}>
          {copy.openSettings}
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-5 rounded-xl border border-border bg-card p-5 sm:p-6">
      <p className="text-meta font-semibold text-foreground">{copy.currentStatusLabel}</p>
      <p className="mt-1 text-body text-muted-foreground">{copy.currentStatusActive}</p>
      <div className="mt-4">
        <Button type="button" variant="outline" size="md" onClick={openCookiePreferences}>
          {copy.openSettings}
        </Button>
      </div>
    </div>
  );
}
