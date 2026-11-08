"use client";

import React, { useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { CloseIcon, PhoneIcon } from "@/components/ui/icons";
import { Container } from "@/components/ui/Container";
import { EmergencySignsModal } from "@/components/emergency/EmergencySignsModal";
import { EmergencyDialerGate } from "@/components/emergency/EmergencyDialerGate";
import { stripLangFromPathname } from "@/lib/i18n/routing";
import { getChromeCopy } from "@/components/layout/chrome-copy";
import { useLanguage } from "@/lib/i18n/language-context";
import { translations } from "@/lib/i18n/translations";

function useSafeLanguage() {
  try {
    const ctx = useLanguage();
    const lang = ctx?.lang || "ro";
    const baseT = translations[lang] ?? translations.ro;
    const t = {
      ...baseT,
      ...(ctx?.t || {}),
      emergency: ctx?.t?.emergency ?? baseT.emergency,
    };
    return { lang, t };
  } catch {
    return { lang: "ro" as const, t: translations.ro };
  }
}

const DISMISS_KEY = "redi:emergency-bar-dismissed";
const listeners = new Set<() => void>();
let dismissedThisView = false;

function readDismissed() {
  try {
    return window.localStorage.getItem(DISMISS_KEY) === "1";
  } catch {
    return false;
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function dismiss() {
  try {
    window.localStorage.setItem(DISMISS_KEY, "1");
  } catch {
    // Storage blocked: the bar still hides for this page view.
  }
  dismissedThisView = true;
  listeners.forEach((listener) => listener());
}

/**
 * A quiet 112 reminder at the top of public pages. It scrolls away with the page
 * and can be closed; the choice is remembered on this device. The 112 number stays
 * reachable from the footer and from every tool's own emergency step.
 */
export function UniversalEmergencyBanner() {
  const pathname = usePathname();
  const path = stripLangFromPathname(pathname);
  const isWorkerPanel = path.startsWith("/panel");

  const { lang, t } = useSafeLanguage();
  const e = t.emergency;
  const chrome = getChromeCopy(lang);

  const [signsOpen, setSignsOpen] = useState(false);
  const [dialerOpen, setDialerOpen] = useState(false);
  const dismissed = useSyncExternalStore(
    subscribe,
    () => dismissedThisView || readDismissed(),
    () => false,
  );

  if (isWorkerPanel || dismissed) {
    return null;
  }

  return (
    <>
      <aside
        aria-label={e.bannerAriaLabel}
        className="emergency-banner w-full border-b border-border bg-muted/60 text-foreground"
      >
        {/* Phones: one line, "Emergency?" next to the call button. From 768px: the full sentence; the alarm-signs link joins from 1024px. */}
        <Container className="flex items-center gap-2 py-1 text-sm md:gap-3 md:py-1.5">
          <PhoneIcon className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />

          <p className="emergency-banner-text min-w-0 shrink-0 leading-snug text-foreground md:shrink md:flex-1 md:text-muted-foreground">
            <span className="md:hidden">{chrome.emergencyQuestion}</span>
            <span className="hidden md:inline">{e.bannerText}</span>
          </p>

          <div className="emergency-banner-actions flex min-w-0 flex-1 items-center gap-1 md:flex-none md:shrink-0 md:gap-2">
            <button
              type="button"
              onClick={() => setSignsOpen(true)}
              className="hidden min-h-9 items-center rounded-lg px-2 font-medium text-foreground underline decoration-foreground/30 underline-offset-4 transition-colors duration-(--dur-fast) ease-(--ease-out-calm) hover:decoration-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring lg:inline-flex"
            >
              {e.seeAlarmSigns}
            </button>

            <button
              type="button"
              onClick={() => setDialerOpen(true)}
              className="-ml-1 inline-flex min-h-10 items-center gap-1.5 whitespace-nowrap rounded-lg px-2 font-semibold text-primary md:ml-0 md:min-h-9 transition-colors duration-(--dur-fast) ease-(--ease-out-calm) hover:bg-primary-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              {e.call112}
            </button>

            <button
              type="button"
              onClick={dismiss}
              aria-label={e.dismissBannerAria}
              className="ml-auto inline-flex h-10 w-10 shrink-0 items-center md:h-9 md:w-9 justify-center rounded-lg text-muted-foreground transition-colors duration-(--dur-fast) ease-(--ease-out-calm) hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <CloseIcon className="h-4 w-4" />
            </button>
          </div>
        </Container>
      </aside>

      <EmergencySignsModal open={signsOpen} onOpenChange={setSignsOpen} />
      <EmergencyDialerGate open={dialerOpen} onOpenChange={setDialerOpen} />
    </>
  );
}
