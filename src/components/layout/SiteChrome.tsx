"use client";

import { useEffect, type ReactNode } from "react";
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
import { initPwaRuntime } from "@/lib/pwa/pwa-state";
import { useComfortDomSync } from "@/lib/comfort-preferences";
import { useCalmReducedMotion } from "@/lib/motion/tokens";
import type { Lang } from "@/lib/i18n/translations";

if (typeof window !== "undefined") {
  initClientNoiseFilter();
}

type SiteChromeProps = {
  children: ReactNode;
  nonce?: string;
  captchaEnabled: boolean;
  /** Locale resolved on the server for this request; see LanguageProvider. */
  lang: Lang;
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

export function SiteChrome({ children, nonce, captchaEnabled, lang, emergencyDismissed = false }: SiteChromeProps) {
  const pathname = usePathname();
  const path = stripLangFromPathname(pathname);
  const isWorkerPanel = path.startsWith("/panel") || path === "/demo" || path.startsWith("/demo/") || path === "/offline" || path.startsWith("/offline/");
  const isChromelessSurface = isWorkerPanel || path === "/health-check/note";
  // Symptom check and prescription review are interactive tasks: they end at their action button, with no footer after them.
  const hideFooter = isChromelessSurface || path === "/health-check" || path === "/prescription-review";
  useSkipLinkTarget(pathname);
  useComfortDomSync();
  useEffect(() => {
    initPwaRuntime();
  }, []);
  const calmMotion = useCalmReducedMotion();

  return (
    <MotionConfig reducedMotion={calmMotion ? "always" : "user"}>
      <LazyMotion features={loadMotionFeatures}>
        <LanguageProvider requestLang={lang}>
          <RecaptchaProvider nonce={nonce} enabled={captchaEnabled && !isChromelessSurface}>
            {isChromelessSurface ? null : <Header emergencyDismissed={emergencyDismissed} />}
            {isChromelessSurface ? null : <SmartSearchModal />}
            {isChromelessSurface ? null : <PwaExperience />}
            {children}
            {isChromelessSurface ? null : <FeedbackWidget />}
            {isChromelessSurface ? null : <ReportIssueWidget />}
            {isChromelessSurface ? null : <div className="px-4 pb-4 text-center empty:hidden"><RecaptchaNotice /></div>}
            {hideFooter ? null : <Footer />}
          </RecaptchaProvider>
        </LanguageProvider>
      </LazyMotion>
    </MotionConfig>
  );
}
