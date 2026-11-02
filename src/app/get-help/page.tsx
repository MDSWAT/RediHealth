import { headers } from "next/headers";
import { GetHelpPageContent } from "@/components/get-help/GetHelpPageContent";
import { COUNTRY_INFO, parseCountry } from "@/lib/countries";
import { configuredCountries } from "@/lib/database";
import { getRequestLang } from "@/lib/i18n/server-routing";
import { countryFromHeaders } from "@/lib/medical-institutes";
import { createPageMetadata } from "@/lib/i18n/page-metadata";

export const generateMetadata = createPageMetadata(
  "get-help",
  "Request Medical Help - RediHealth",
  "Request help arranging medical care. Share your phone number, email, and a brief description of what's wrong, and a support worker will get in touch.",
);

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
