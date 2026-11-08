import type { Metadata } from "next";
import { headers } from "next/headers";
import { FindHelpPageContent } from "@/components/find-help/FindHelpPageContent";
import { getRequestLang } from "@/lib/i18n/server-routing";
import { countryForLang, countryFromHeaders, isInstituteCategory, isSupportedCountry } from "@/lib/medical-institutes";
import { localizedPageTitle } from "@/lib/i18n/page-metadata";
import { translations } from "@/lib/i18n/translations";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getRequestLang();
  return {
    title: localizedPageTitle(lang, "find-help", "Pharmacies and clinics - RediHealth"),
    description: translations[lang].findHelpPage.heroParagraph,
  };
}

export default async function FindHelpPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // Links from the symptom check, guides and medic-online open the map on one kind of place,
  // e.g. /find-help?category=pharmacy.
  const requested = (await searchParams).category;
  const initialCategory = isInstituteCategory(requested) ? requested : null;
  const ipCountry = countryFromHeaders(await headers());
  const initialCountry = isSupportedCountry(ipCountry)
    ? ipCountry
    : countryForLang(await getRequestLang());

  return <FindHelpPageContent initialCountry={initialCountry} initialCategory={initialCategory} />;
}
