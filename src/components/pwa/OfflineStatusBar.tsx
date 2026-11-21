"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { CloseIcon } from "@/components/ui/icons";
import { Container } from "@/components/ui/Container";
import { useLanguage } from "@/lib/i18n/language-context";
import { getOfflineUiCopy } from "@/lib/i18n/offline-copy";
import { stripLangFromPathname } from "@/lib/i18n/routing";
import { useOnlineStatus } from "@/lib/pwa/use-online-status";

/**
 * Calm, dismissible strip shown when the device has no network connection.
 * Placed above the site header so the home page's negative-margin hero never overlaps it.
 */
export function OfflineStatusBar() {
  const { lang } = useLanguage();
  const isOnline = useOnlineStatus();
  const pathname = usePathname() || "/";
  const barePath = stripLangFromPathname(pathname);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const onOnline = () => setDismissed(false);
    window.addEventListener("online", onOnline);
    return () => window.removeEventListener("online", onOnline);
  }, []);

  if (
    isOnline ||
    dismissed ||
    barePath === "/health-check/note" ||
    barePath.startsWith("/health-check/note/") ||
    barePath === "/offline" ||
    barePath.startsWith("/offline/")
  ) {
    return null;
  }

  const copy = getOfflineUiCopy(lang);

  return (
    <div
      role="status"
      aria-live="polite"
      className="relative z-50 border-b border-border bg-surface-subtle text-foreground print:hidden dark:border-white/12 dark:bg-ink-900 dark:text-paper"
    >
      <Container className="flex min-h-11 items-center justify-between gap-3 py-1.5">
        <p className="min-w-0 text-meta leading-snug text-foreground dark:text-paper">
          {copy.barMessage}
        </p>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label={copy.dismissLabel}
          className="press-row -mr-2 inline-flex h-11 w-11 min-h-11 min-w-11 shrink-0 items-center justify-center whitespace-nowrap rounded-lg text-muted-foreground transition-colors duration-(--dur-fast) ease-(--ease-out-calm) motion-reduce:transition-none hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:text-mist dark:hover:bg-white/10 dark:hover:text-paper"
        >
          <CloseIcon className="h-5 w-5" aria-hidden="true" />
        </button>
      </Container>
    </div>
  );
}
