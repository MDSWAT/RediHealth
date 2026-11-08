import type { Metadata } from "next";
import { headers } from "next/headers";
import { GetHelpPageContent } from "@/components/get-help/GetHelpPageContent";
import { COUNTRY_INFO, parseCountry } from "@/lib/countries";
import { configuredCountries } from "@/lib/database";
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

export default async function GetHelpPage() {
  const countries = configuredCountries();
  const lang = await getRequestLang();
  const visitorCountry = parseCountry(countryFromHeaders(await headers()));
  const initialCountry =
    (visitorCountry && countries.includes(visitorCountry) ? visitorCountry : null) ??
    countries.find((country) => COUNTRY_INFO[country].lang === lang) ??
    countries[0] ??
    null;

  return <GetHelpPageContent countries={countries} initialCountry={initialCountry} />;
}
