"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { FeedbackWidget } from "@/components/layout/FeedbackWidget";
import { ReportIssueWidget } from "@/components/layout/ReportIssueWidget";
import { LanguageProvider } from "@/lib/i18n/language-context";
import { stripLangFromPathname } from "@/lib/i18n/routing";
import { RecaptchaProvider, RecaptchaNotice } from "@/components/security/RecaptchaProvider";
import { initClientNoiseFilter } from "@/lib/client-noise-filter";
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

export function SiteChrome({ children, nonce, captchaEnabled, lang }: SiteChromeProps) {
  const pathname = usePathname();
  const path = stripLangFromPathname(pathname);
  const isWorkerPanel = path.startsWith("/panel") || path === "/demo" || path.startsWith("/demo/") || path === "/offline" || path.startsWith("/offline/");
  const isChromelessSurface = isWorkerPanel || path === "/health-check/note";
  // Symptom check and prescription review are interactive tasks: they end at their action button, with no footer after them.
  const hideFooter = isChromelessSurface || path === "/health-check" || path === "/prescription-review";
  useSkipLinkTarget(pathname);

  return (
    <LanguageProvider requestLang={lang}>
      <RecaptchaProvider nonce={nonce} enabled={captchaEnabled && !isChromelessSurface}>
        {isChromelessSurface ? null : <Header />}
        {children}
        {isChromelessSurface ? null : <FeedbackWidget />}
        {isChromelessSurface ? null : <ReportIssueWidget />}
        {isChromelessSurface ? null : <div className="px-4 pb-4 text-center empty:hidden"><RecaptchaNotice /></div>}
        {hideFooter ? null : <Footer />}
      </RecaptchaProvider>
    </LanguageProvider>
  );
}
