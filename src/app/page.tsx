import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { Hero } from "@/components/landing/Hero";
import { RegionalHealthRibbon } from "@/components/news/RegionalHealthRibbon";
import { HealthTopics } from "@/components/landing/HealthTopics";
import { MediatorsSection } from "@/components/landing/MediatorsSection";
import { OnlineDoctorSection } from "@/components/landing/OnlineDoctorSection";
import { StackedSections, StackLayer } from "@/components/landing/StackedSections";
import { TrustSection } from "@/components/landing/TrustSection";
import { DEFAULT_LANG } from "@/lib/i18n/routing";
import { getRequestLang, withLangPrefix } from "@/lib/i18n/server-routing";
import { getHealthTopicsList } from "@/lib/i18n/health-information-topics";
import { siteMetadata } from "@/lib/i18n/site-metadata";
import type { Lang } from "@/lib/i18n/translations";

const TrueFalseQuizSection = dynamic(
  () => import("@/components/landing/TrueFalseQuizSection").then((m) => m.TrueFalseQuizSection),
  { ssr: true },
);

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
  const lang = await getRequestLang();
  // The phone hero's wheel names these when its icons are out (a tap on the chakra).
  const wheelTopics = getHealthTopicsList(lang).map(({ slug, title, description }) => ({ slug, title, description }));
  return (
    <main id="main-content" className="flex-1">
      {/* The homepage as a business card, one idea per sheet: the way in (hero), the online doctor,
          the health guides, the mediators, the myth quiz, and who stands behind the platform.
          Sections as sheets: on desktop each slides up over the one before as the page scrolls;
          on phones and tablets they keep plain scrolling and only carry the rounded sheet edge. */}
      <StackedSections>
        <StackLayer className="bg-ink-950">
          <Hero wheelTopics={wheelTopics} />
          <RegionalHealthRibbon />
        </StackLayer>
        <StackLayer>
          <OnlineDoctorSection />
        </StackLayer>
        <StackLayer>
          <HealthTopics />
        </StackLayer>
        <StackLayer>
          <MediatorsSection />
        </StackLayer>
        <StackLayer>
          <TrueFalseQuizSection />
        </StackLayer>
        <StackLayer>
          <TrustSection />
        </StackLayer>
      </StackedSections>
    </main>
  );
}
