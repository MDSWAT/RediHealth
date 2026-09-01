"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";

type SiteChromeProps = {
  children: ReactNode;
};

export function SiteChrome({ children }: SiteChromeProps) {
  const pathname = usePathname();
  const isWorkerPanel = pathname.startsWith("/panel");

  return (
    <>
      {isWorkerPanel ? null : <Header />}
      {children}
      {isWorkerPanel ? null : <Footer />}
    </>
  );
}
