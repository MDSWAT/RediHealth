import type { Metadata } from "next";
import { headers } from "next/headers";
import { FindHelpPageContent } from "@/components/find-help/FindHelpPageContent";
import { getRequestLang } from "@/lib/i18n/server-routing";
import { countryForLang, countryFromHeaders, isSupportedCountry } from "@/lib/medical-institutes";

export const metadata: Metadata = {
  title: "Find Medical Help - RediHealth",
  description:
    "Find medical institutes near you. Browse hospitals, clinics, GP practices, pharmacies, and more with addresses and an interactive map.",
};

export default async function FindHelpPage() {
  const ipCountry = countryFromHeaders(await headers());
  const initialCountry = isSupportedCountry(ipCountry)
    ? ipCountry
    : countryForLang(await getRequestLang());

  return <FindHelpPageContent initialCountry={initialCountry} />;
}
