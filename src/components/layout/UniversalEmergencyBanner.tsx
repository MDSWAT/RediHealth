"use client";

import dynamic from "next/dynamic";
import React, { useEffect, useState, useSyncExternalStore } from "react";
import { CloseIcon, PhoneIcon } from "@/components/ui/icons";
import { Container, type ContainerSize } from "@/components/ui/Container";
import { getChromeCopy } from "@/components/layout/chrome-copy";
import { useLanguage } from "@/lib/i18n/language-context";
import { DURATION, useCalmReducedMotion } from "@/lib/motion/tokens";
import { EMERGENCY_DISMISS_COOKIE } from "@/lib/emergency-bar";

const EmergencyDialerGate = dynamic(
  () => import("@/components/emergency/EmergencyDialerGate").then((mod) => mod.EmergencyDialerGate),
  { ssr: false },
);

const FALLBACK_EMERGENCY_RO = {
  bannerAriaLabel: "Avertisment de urgență 112",
  bannerText: "Pentru o urgență medicală, sună la 112. Aplicația nu poate suna în locul tău.",
  dismissBannerAria: "Ascunde mesajul despre 112",
  call112: "Sună la 112",
};

function useSafeLanguage() {
  try {
    const ctx = useLanguage();
    const lang = ctx?.lang || "ro";
    const e = ctx?.t?.emergency;
    return { lang, e: e ?? FALLBACK_EMERGENCY_RO };
  } catch {
    return { lang: "ro" as const, e: FALLBACK_EMERGENCY_RO };
  }
}

const DISMISS_KEY = "redi:emergency-bar-dismissed";

function rememberForServer() {
  try {
    document.cookie = `${EMERGENCY_DISMISS_COOKIE}=1; Max-Age=31536000; Path=/; SameSite=Lax`;
  } catch {
    // Cookies blocked: local storage still hides the bar after the page has loaded.
  }
}
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
  rememberForServer();
  dismissedThisView = true;
  listeners.forEach((listener) => listener());
}

/**
 * The 112 reminder: one slim line at the top of the sticky site header, so it stays in view on
 * every public page. On phones one button holds the phone icon, a short question and "Call 112";
 * from md the full sentence stands before the button. Then a close button; closing is remembered on this device. `tone="dark"` is for the landing page,
 * where the header sits over the dark hero.
 */
export function UniversalEmergencyBanner({
  tone = "light",
  size = "default",
  initiallyDismissed = false,
}: {
  tone?: "light" | "dark";
  size?: ContainerSize;
  /** From the request's cookie: the reader closed the bar on this device, so render nothing. */
  initiallyDismissed?: boolean;
}) {
  const { lang, e } = useSafeLanguage();
  const chrome = getChromeCopy(lang);

  const [dialerOpen, setDialerOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const reducedMotion = useCalmReducedMotion();
  const dismissed = useSyncExternalStore(
    subscribe,
    () => initiallyDismissed || dismissedThisView || readDismissed(),
    () => initiallyDismissed,
  );

  // Closed before the cookie existed: write it now, so from the next visit the server leaves the bar out.
  useEffect(() => {
    if (!initiallyDismissed && readDismissed()) rememberForServer();
  }, [initiallyDismissed]);

  if (dismissed) {
    return null;
  }

  const dark = tone === "dark";

  // Closing folds the line away (height and opacity) before it is removed, so the header below
  // eases up instead of jumping by the strip's height. Instant under reduced or calm motion.
  const handleDismiss = () => {
    if (reducedMotion) {
      dismiss();
      return;
    }
    setClosing(true);
    window.setTimeout(dismiss, DURATION.base * 1000);
  };

  return (
    <>
      {/* The header measures `.emergency-banner` to publish its height, so it sits on the folding wrapper. */}
      <div className="emergency-banner calm-collapse" data-open={closing ? "false" : "true"}>
        <div className="calm-collapse-inner">
          <aside
            aria-label={e.bannerAriaLabel}
            className={`border-b transition-colors duration-(--dur-base) ease-(--ease-out-calm) motion-reduce:transition-none ${
              dark ? "border-white/10 text-paper/75" : "border-border text-muted-foreground"
            }`}
          >
            <Container size={size} className="flex min-h-11 items-center gap-4 text-body leading-snug max-md:h-11 max-md:gap-2 max-md:px-2.5 md:py-1">
              <div className="flex min-w-0 items-center gap-2 max-md:gap-1.5">
                {/* From md the full sentence stands beside the call button. */}
                <p className="hidden min-w-0 leading-snug md:block">{e.bannerText}</p>
                {/* The phone icon belongs to the control it marks. On phones the short question is part
                    of the same button, so the whole left of the strip opens the call, not two words. */}
                <button
                  type="button"
                  onClick={() => setDialerOpen(true)}
                  className={`${dark ? "press-on-dark" : "press-row"} group -ml-1.5 inline-flex min-h-11 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md px-1.5 text-body transition-colors duration-(--dur-fast) ease-(--ease-out-calm) focus-visible:outline-2 focus-visible:outline-offset-1 motion-reduce:transition-none md:ml-0 md:gap-2 md:px-3 ${
                    dark ? "focus-visible:outline-paper" : "focus-visible:outline-ring"
                  }`}
                >
                  <PhoneIcon className={`h-4 w-4 shrink-0 ${dark ? "text-paper/70" : "text-primary"}`} aria-hidden="true" />
                  <span className="md:hidden">{chrome.emergencyQuestion}</span>
                  <span
                    className={`font-semibold underline underline-offset-4 transition-colors duration-(--dur-fast) ease-(--ease-out-calm) motion-reduce:transition-none ${
                      dark
                        ? "text-paper decoration-paper/40 group-hover:decoration-paper"
                        : "text-primary decoration-primary/35 group-hover:decoration-primary"
                    }`}
                  >
                    <span className="md:hidden">{chrome.call112Short}</span>
                    <span className="hidden md:inline">{e.call112}</span>
                  </span>
                </button>
              </div>
              <button
                type="button"
                onClick={handleDismiss}
                aria-label={e.dismissBannerAria}
                className={`${dark ? "press-on-dark" : "press-row"} -mr-2 ml-auto inline-flex h-11 w-11 shrink-0 items-center justify-center whitespace-nowrap rounded-md transition-colors duration-(--dur-fast) ease-(--ease-out-calm) focus-visible:outline-2 focus-visible:outline-offset-1 motion-reduce:transition-none ${
                  dark
                    ? "text-paper/60 hover:bg-white/10 hover:text-paper focus-visible:outline-paper"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-ring"
                }`}
              >
                <CloseIcon className="h-4 w-4" />
              </button>
            </Container>
          </aside>
        </div>
      </div>

      {dialerOpen ? <EmergencyDialerGate open={dialerOpen} onOpenChange={setDialerOpen} /> : null}
    </>
  );
}
