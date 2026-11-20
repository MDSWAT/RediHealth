import type { Metadata } from "next";
import { Hero } from "@/components/landing/Hero";
import { HealthTopics } from "@/components/landing/HealthTopics";
import { MediatorsSection } from "@/components/landing/MediatorsSection";
import { TrustSection } from "@/components/landing/TrustSection";
import { DEFAULT_LANG } from "@/lib/i18n/routing";
import { getRequestLang, withLangPrefix } from "@/lib/i18n/server-routing";
import { siteMetadata } from "@/lib/i18n/site-metadata";
import type { Lang } from "@/lib/i18n/translations";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getRequestLang();
  const languages = Object.fromEntries(
    (Object.keys(siteMetadata) as Lang[]).map((locale) => [locale, withLangPrefix("/", locale)]),
  );

  return {
    alternates: {
      canonical: withLangPrefix("/", lang),
      languages: {
        ...languages,
        "x-default": withLangPrefix("/", DEFAULT_LANG),
      },
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
  };
}

export default async function Home() {
  return (
    <main id="main-content" className="flex-1">
      <Hero />
      <HealthTopics />
      <MediatorsSection />
      <TrustSection />
    </main>
  );
}
