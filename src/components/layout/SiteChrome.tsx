"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { ReportIssueWidget } from "@/components/layout/ReportIssueWidget";
import { LanguageProvider } from "@/lib/i18n/language-context";
import { stripLangFromPathname } from "@/lib/i18n/routing";
import { RecaptchaProvider, RecaptchaNotice } from "@/components/security/RecaptchaProvider";

type SiteChromeProps = {
  children: ReactNode;
  nonce?: string;
  captchaEnabled: boolean;
};

export function SiteChrome({ children, nonce, captchaEnabled }: SiteChromeProps) {
  const pathname = usePathname();
  const path = stripLangFromPathname(pathname);
  const isWorkerPanel = path.startsWith("/panel") || path === "/demo" || path.startsWith("/demo/");

  return (
    <LanguageProvider>
      <RecaptchaProvider nonce={nonce} enabled={captchaEnabled && !isWorkerPanel}>
        {isWorkerPanel ? null : <Header />}
        {children}
        {isWorkerPanel ? null : <ReportIssueWidget />}
        {isWorkerPanel ? null : <div className="px-4 pb-4 text-center"><RecaptchaNotice /></div>}
        {isWorkerPanel ? null : <Footer />}
      </RecaptchaProvider>
    </LanguageProvider>
  );
}
