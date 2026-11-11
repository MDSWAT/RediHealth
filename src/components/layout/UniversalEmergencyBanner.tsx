"use client";

import React, { useState, useSyncExternalStore } from "react";
import { CloseIcon, PhoneIcon } from "@/components/ui/icons";
import { Container } from "@/components/ui/Container";
import { EmergencyDialerGate } from "@/components/emergency/EmergencyDialerGate";
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
 * The 112 reminder: one slim line at the top of the sticky site header, so it stays in view on
 * every public page. A short question on phones, the full sentence from md, then "Call 112" and a
 * close button; closing is remembered on this device. `tone="dark"` is for the landing page,
 * where the header sits over the dark hero.
 */
export function UniversalEmergencyBanner({ tone = "light" }: { tone?: "light" | "dark" }) {
  const { lang, t } = useSafeLanguage();
  const e = t.emergency;
  const chrome = getChromeCopy(lang);

  const [dialerOpen, setDialerOpen] = useState(false);
  const dismissed = useSyncExternalStore(
    subscribe,
    () => dismissedThisView || readDismissed(),
    () => false,
  );

  if (dismissed) {
    return null;
  }

  const dark = tone === "dark";

  return (
    <>
      <aside
        aria-label={e.bannerAriaLabel}
        className={`emergency-banner border-b transition-colors duration-(--dur-base) ease-(--ease-out-calm) motion-reduce:transition-none ${
          dark ? "border-white/10 text-paper/75" : "border-border text-muted-foreground"
        }`}
      >
        <Container className="flex h-8 items-center gap-2 text-[13px] leading-none">
          <PhoneIcon className={`h-3 w-3 shrink-0 ${dark ? "text-paper/70" : "text-primary"}`} aria-hidden="true" />
          <p className="min-w-0 truncate">
            <span className="md:hidden">{chrome.emergencyQuestion}</span>
            <span className="hidden md:inline">{e.bannerText}</span>
          </p>
          <button
            type="button"
            onClick={() => setDialerOpen(true)}
            className={`inline-flex h-7 shrink-0 items-center rounded-md px-1.5 font-semibold underline underline-offset-4 transition-colors duration-(--dur-fast) ease-(--ease-out-calm) focus-visible:outline-2 focus-visible:outline-offset-1 motion-reduce:transition-none ${
              dark
                ? "text-paper decoration-paper/40 hover:decoration-paper focus-visible:outline-paper"
                : "text-primary decoration-primary/35 hover:decoration-primary focus-visible:outline-ring"
            }`}
          >
            {e.call112}
          </button>
          <button
            type="button"
            onClick={dismiss}
            aria-label={e.dismissBannerAria}
            className={`-mr-1.5 ml-auto inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition-colors duration-(--dur-fast) ease-(--ease-out-calm) focus-visible:outline-2 focus-visible:outline-offset-1 motion-reduce:transition-none ${
              dark
                ? "text-paper/60 hover:bg-white/10 hover:text-paper focus-visible:outline-paper"
                : "text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-ring"
            }`}
          >
            <CloseIcon className="h-3.5 w-3.5" />
          </button>
        </Container>
      </aside>

      <EmergencyDialerGate open={dialerOpen} onOpenChange={setDialerOpen} />
    </>
  );
}
