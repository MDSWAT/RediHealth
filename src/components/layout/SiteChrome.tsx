"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { LazyMotion, MotionConfig } from "motion/react";

const loadMotionFeatures = () => import("@/lib/motion/dom-features").then((mod) => mod.domAnimation);
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { SmartSearchModal } from "@/components/search/SmartSearchModal";
import { PwaExperience } from "@/components/pwa/PwaExperience";

const FeedbackWidget = dynamic(
  () => import("@/components/layout/FeedbackWidget").then((mod) => mod.FeedbackWidget),
  { ssr: false },
);
const ReportIssueWidget = dynamic(
  () => import("@/components/layout/ReportIssueWidget").then((mod) => mod.ReportIssueWidget),
  { ssr: false },
);
import { LanguageProvider } from "@/lib/i18n/language-context";
import { stripLangFromPathname } from "@/lib/i18n/routing";
import { RecaptchaProvider, RecaptchaNotice } from "@/components/security/RecaptchaProvider";
import { initClientNoiseFilter } from "@/lib/client-noise-filter";
import {
  MOUNT_CHROME_WIDGETS_EVENT,
  setChromeWidgetsAvailable,
} from "@/components/layout/chrome-widget-events";
import { initPwaRuntime } from "@/lib/pwa/pwa-state";
import { clearPageAutoReadSession } from "@/lib/audio/page-auto-read";
import { speechEngine } from "@/lib/audio/speech-engine";
import { useComfortDomSync } from "@/lib/comfort-preferences";
import { useCalmReducedMotion } from "@/lib/motion/tokens";
import type { Lang, SerializableTranslations } from "@/lib/i18n/languages";
import type { Translations } from "@/lib/i18n/translations";

if (typeof window !== "undefined") {
  initClientNoiseFilter();
}

type SiteChromeProps = {
  children: ReactNode;
  nonce?: string;
  captchaEnabled: boolean;
  /** Locale resolved on the server for this request; see LanguageProvider. */
  lang: Lang;
  /** Active locale translations passed from the server layout so client chrome doesn't bundle all 7 locales. */
  initialTranslations?: Translations | SerializableTranslations;
  /** The reader closed the 112 bar on this device (a cookie), so the header leaves it out. */
  emergencyDismissed?: boolean;
};

/**
 * The "Skip to main content" link (root layout) points at #main-content. Most pages give
 * their <main> that id; for any page that does not, lend it to the first <main> (or the
 * first element after the header) so the skip link always lands on the page content.
 */
function useSkipLinkTarget(pathname: string) {
  useEffect(() => {
    if (document.getElementById("main-content")) return;
    const header = document.querySelector("header.site-header");
    const target =
      document.querySelector("main") ??
      (header?.nextElementSibling instanceof HTMLElement ? header.nextElementSibling : null);
    if (!target) return;
    target.id = "main-content";
    if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
    return () => {
      if (target.id === "main-content") target.removeAttribute("id");
    };
  }, [pathname]);
}

export function SiteChrome({ children, nonce, captchaEnabled, lang, initialTranslations, emergencyDismissed = false }: SiteChromeProps) {
  const pathname = usePathname();
  const path = stripLangFromPathname(pathname);
  const isWorkerPanel = path.startsWith("/panel") || path === "/demo" || path.startsWith("/demo/") || path === "/offline" || path.startsWith("/offline/");
  const isChromelessSurface = isWorkerPanel || path === "/health-check/note";
  // Symptom check and prescription review are interactive tasks: they end at their action button, with no footer after them.
  const hideFooter = isChromelessSurface || path === "/health-check" || path === "/prescription-review";
  const [widgetsReady, setWidgetsReady] = useState(false);
  useSkipLinkTarget(pathname);
  useComfortDomSync();
  const routeKey = `${pathname ?? ""}|${lang}`;
  const prevRouteKeyRef = useRef<string | null>(null);
  useEffect(() => {
    if (prevRouteKeyRef.current !== null && prevRouteKeyRef.current !== routeKey) {
      clearPageAutoReadSession();
      speechEngine.stop();
      speechEngine.requestClose();
    }
    prevRouteKeyRef.current = routeKey;
  }, [routeKey]);

  useEffect(() => {
    return () => {
      clearPageAutoReadSession();
      speechEngine.stop();
      speechEngine.requestClose();
    };
  }, []);
  useEffect(() => {
    initPwaRuntime();
  }, []);
  useEffect(() => {
    setChromeWidgetsAvailable(!isChromelessSurface);
    return () => setChromeWidgetsAvailable(false);
  }, [isChromelessSurface]);
  useEffect(() => {
    if (isChromelessSurface) return;
    let cancelled = false;
    let idleId = 0;
    let timerId = 0;

    const mountWidgets = () => {
      if (!cancelled) setWidgetsReady(true);
    };

    const onWake = () => mountWidgets();
    window.addEventListener(MOUNT_CHROME_WIDGETS_EVENT, onWake, { once: true });

    let hasFeedbackParam = false;
    try {
      hasFeedbackParam = new URLSearchParams(window.location.search).get("feedback") === "1";
    } catch {
      hasFeedbackParam = false;
    }

    if (hasFeedbackParam) {
      timerId = window.setTimeout(mountWidgets, 0);
    } else {
      const win = window as Window & {
        requestIdleCallback?: (cb: () => void, opts?: { timeout?: number }) => number;
        cancelIdleCallback?: (id: number) => void;
      };
      if (typeof win.requestIdleCallback === "function") {
        idleId = win.requestIdleCallback(mountWidgets, { timeout: 1000 });
      } else {
        timerId = window.setTimeout(mountWidgets, 1000);
      }
    }

    return () => {
      cancelled = true;
      window.removeEventListener(MOUNT_CHROME_WIDGETS_EVENT, onWake);
      if (idleId) {
        (window as Window & { cancelIdleCallback?: (id: number) => void }).cancelIdleCallback?.(idleId);
      }
      if (timerId) window.clearTimeout(timerId);
    };
  }, [isChromelessSurface]);
  const calmMotion = useCalmReducedMotion();

  return (
    <MotionConfig reducedMotion={calmMotion ? "always" : "user"}>
      <LazyMotion features={loadMotionFeatures}>
        <LanguageProvider requestLang={lang} initialTranslations={initialTranslations}>
          <RecaptchaProvider nonce={nonce} enabled={captchaEnabled && !isChromelessSurface}>
            {isChromelessSurface ? null : <Header emergencyDismissed={emergencyDismissed} />}
            {isChromelessSurface ? null : <SmartSearchModal />}
            {isChromelessSurface ? null : <PwaExperience />}
            {children}
            {isChromelessSurface || !widgetsReady ? null : <FeedbackWidget />}
            {isChromelessSurface || !widgetsReady ? null : <ReportIssueWidget />}
            {isChromelessSurface ? null : <div className="px-4 pb-4 text-center empty:hidden"><RecaptchaNotice /></div>}
            {hideFooter ? null : <Footer />}
          </RecaptchaProvider>
        </LanguageProvider>
      </LazyMotion>
    </MotionConfig>
  );
}
