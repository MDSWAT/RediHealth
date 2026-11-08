"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { UniversalEmergencyBanner } from "@/components/layout/UniversalEmergencyBanner";
import { ReportIssueWidget } from "@/components/layout/ReportIssueWidget";
import { LanguageProvider } from "@/lib/i18n/language-context";
import { stripLangFromPathname } from "@/lib/i18n/routing";
import { RecaptchaProvider, RecaptchaNotice } from "@/components/security/RecaptchaProvider";

type SiteChromeProps = {
  children: ReactNode;
  nonce?: string;
  captchaEnabled: boolean;
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

export function SiteChrome({ children, nonce, captchaEnabled }: SiteChromeProps) {
  const pathname = usePathname();
  const path = stripLangFromPathname(pathname);
  const isWorkerPanel = path.startsWith("/panel") || path === "/demo" || path.startsWith("/demo/") || path === "/offline" || path.startsWith("/offline/");
  useSkipLinkTarget(pathname);

  return (
    <LanguageProvider>
      <RecaptchaProvider nonce={nonce} enabled={captchaEnabled && !isWorkerPanel}>
        {path === "/" || isWorkerPanel ? null : <UniversalEmergencyBanner />}
        {isWorkerPanel ? null : <Header />}
        {children}
        {isWorkerPanel ? null : <ReportIssueWidget />}
        {isWorkerPanel ? null : <div className="px-4 pb-4 text-center empty:hidden"><RecaptchaNotice /></div>}
        {isWorkerPanel ? null : <Footer />}
      </RecaptchaProvider>
    </LanguageProvider>
  );
}
