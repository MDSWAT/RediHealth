import type { Metadata } from "next";
import { HealthInformationPageContent } from "@/components/health-information/HealthInformationPageContent";
import { learnHubPropsFromSearchParams } from "@/lib/learn-hub-params";
import { getRequestLang } from "@/lib/i18n/server-routing";
import { translations } from "@/lib/i18n/translations";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getRequestLang();
  const page = translations[lang].healthInfoPage;
  return {
    title: `${page.heroTitle} - RediHealth`,
    description: page.heroSubtitle,
  };
}

export default async function HealthInformationPage({
  searchParams,
}: PageProps<"/health-information">) {
  // The tab is read here so the page is drawn on the right tab from the start: a reader coming
  // back from an article lands on "All topics" without first seeing (and downloading) the guide photos.
  const hubProps = learnHubPropsFromSearchParams(await searchParams);
  const key = [
    hubProps.initialTab,
    hubProps.initialDictionarySub,
    hubProps.initialDictionaryQuery,
    hubProps.initialTopicCategory,
  ].join("|");
  return <HealthInformationPageContent key={key} {...hubProps} />;
}
