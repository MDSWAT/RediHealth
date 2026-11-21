"use client";

import { Component, useEffect, useRef, useState, type ComponentType, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { LazyMotion, MotionConfig, type FeatureBundle } from "motion/react";

const loadMotionFeatures = () =>
  import("@/lib/motion/dom-features")
    .then((mod) => mod.domAnimation)
    .catch(() => ({}) as FeatureBundle);

const EmptyWidget = () => null;

function loadOptionalWidget<K extends string>(
  load: () => Promise<Record<K, ComponentType>>,
  exportName: K,
): () => Promise<{ default: ComponentType }> {
  return () =>
    load()
      .then((mod) => ({ default: mod[exportName] }))
      .catch(async () => {
        if (isBrowserOffline()) {
          return { default: EmptyWidget };
        }
        try {
          const mod = await load();
          return { default: mod[exportName] };
        } catch {
          return { default: EmptyWidget };
        }
      });
}

class OptionalWidgetBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch() {
    // Optional chrome widgets degrade silently instead of crashing the page.
  }

  render() {
    return this.state.hasError ? null : this.props.children;
  }
}

import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { SmartSearchModal } from "@/components/search/SmartSearchModal";
import { OfflineStatusBar } from "@/components/pwa/OfflineStatusBar";
import { PwaExperience } from "@/components/pwa/PwaExperience";

const FeedbackWidget = dynamic(
  loadOptionalWidget(() => import("@/components/layout/FeedbackWidget"), "FeedbackWidget"),
  { ssr: false },
);
const ReportIssueWidget = dynamic(
  loadOptionalWidget(() => import("@/components/layout/ReportIssueWidget"), "ReportIssueWidget"),
  { ssr: false },
);
import { LanguageProvider } from "@/lib/i18n/language-context";
import { stripLangFromPathname } from "@/lib/i18n/routing";
import { RecaptchaProvider, RecaptchaNotice } from "@/components/security/RecaptchaProvider";
import { CookieConsentBanner } from "@/components/security/CookieConsentBanner";
import { initClientNoiseFilter } from "@/lib/client-noise-filter";
import {
  MOUNT_CHROME_WIDGETS_EVENT,
  setChromeWidgetsAvailable,
} from "@/components/layout/chrome-widget-events";
import {
  cacheVisitedPublicPage,
  initPwaRuntime,
  warmOfflineAppForLocale,
} from "@/lib/pwa/pwa-state";
import { clearPageAutoReadSession } from "@/lib/audio/page-auto-read";
import { speechEngine } from "@/lib/audio/speech-engine";
import { useComfortDomSync } from "@/lib/comfort-preferences";
import { ReadingGuide } from "@/components/layout/ReadingGuide";
import { useCalmReducedMotion } from "@/lib/motion/tokens";
import { isBrowserOffline } from "@/lib/pwa/use-online-status";
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
  const isAiAssistant = path === "/ai-assistant" || path.startsWith("/ai-assistant/");
  // Symptom check, prescription review, and AI assistant are interactive workspaces with no footer after them.
  const hideFooter = isChromelessSurface || path === "/health-check" || path === "/prescription-review" || isAiAssistant;
  const showStandaloneRecaptchaNotice = hideFooter && !isChromelessSurface && !isAiAssistant;
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
    if (isChromelessSurface) return;
    return warmOfflineAppForLocale(lang);
  }, [isChromelessSurface, lang]);
  useEffect(() => {
    if (isChromelessSurface) return;
    return cacheVisitedPublicPage(pathname);
  }, [isChromelessSurface, pathname]);
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
      if (!cancelled && !isBrowserOffline()) setWidgetsReady(true);
    };

    const onWake = () => mountWidgets();
    window.addEventListener(MOUNT_CHROME_WIDGETS_EVENT, onWake, { once: true });
    window.addEventListener("online", mountWidgets);

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
      window.removeEventListener("online", mountWidgets);
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
            {isChromelessSurface ? null : <OfflineStatusBar />}
            {isChromelessSurface ? null : <Header emergencyDismissed={emergencyDismissed} />}
            {isChromelessSurface ? null : <SmartSearchModal />}
            {isChromelessSurface ? null : <PwaExperience />}
            {children}
            {isChromelessSurface || !widgetsReady ? null : (
              <OptionalWidgetBoundary>
                <FeedbackWidget />
                <ReportIssueWidget />
              </OptionalWidgetBoundary>
            )}
            {showStandaloneRecaptchaNotice ? (
              <div className="px-4 pb-6 pt-1 text-center empty:hidden">
                <RecaptchaNotice className="mt-0" />
              </div>
            ) : null}
            {hideFooter ? null : <Footer />}
            {isChromelessSurface ? null : <CookieConsentBanner />}
            <ReadingGuide />
          </RecaptchaProvider>
        </LanguageProvider>
      </LazyMotion>
    </MotionConfig>
  );
}
