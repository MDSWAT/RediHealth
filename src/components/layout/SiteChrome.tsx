"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { LanguageProvider } from "@/lib/i18n/language-context";
import { stripLangFromPathname } from "@/lib/i18n/routing";

type SiteChromeProps = {
  children: ReactNode;
};

export function SiteChrome({ children }: SiteChromeProps) {
  const pathname = usePathname();
  const isWorkerPanel = stripLangFromPathname(pathname).startsWith("/panel");

  return (
    <LanguageProvider>
      {isWorkerPanel ? null : <Header />}
      {children}
      {isWorkerPanel ? null : <Footer />}
    </LanguageProvider>
  );
}
