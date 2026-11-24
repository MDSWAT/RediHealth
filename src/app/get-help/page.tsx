import type { Metadata } from "next";
import { headers } from "next/headers";
import { GetHelpPageContent } from "@/components/get-help/GetHelpPageContent";
import { SUPPORTED_COUNTRIES, parseCountry } from "@/lib/countries";
import { defaultCountryForLang } from "@/lib/country-areas";
import { getRequestLang } from "@/lib/i18n/server-routing";
import { countryFromHeaders } from "@/lib/medical-institutes";
import { localizedPageTitle } from "@/lib/i18n/page-metadata";
import { translations } from "@/lib/i18n/translations";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getRequestLang();
  return {
    title: localizedPageTitle(lang, "get-help", "Request medical help - RediHealth"),
    description: translations[lang].getHelpPage.heroParagraph,
  };
}

export default async function GetHelpPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const countries = [...SUPPORTED_COUNTRIES];
  const lang = await getRequestLang();
  const visitorCountry = parseCountry(countryFromHeaders(await headers()));
  const initialCountry = visitorCountry ?? defaultCountryForLang(lang);
  const resolvedSearchParams = await searchParams;
  const mode = resolvedSearchParams?.mode === "mediator" ? "mediator" : undefined;

  return <GetHelpPageContent countries={countries} initialCountry={initialCountry} mode={mode} />;
}
