import { notFound } from "next/navigation";
import { PatientPortalView } from "@/components/portal/PatientPortalView";
import { PortalLinkExpired } from "@/components/portal/PortalLinkExpired";
import { parseCountry } from "@/lib/countries";
import { findPatientByPortalToken, toPortalPatient } from "@/lib/data/portal";
import { configuredCountries } from "@/lib/database";
import { PORTAL_TOKEN_PATTERN } from "@/lib/security/portal-token";
import { createPageMetadata } from "@/lib/i18n/page-metadata";

export const generateMetadata = createPageMetadata(
  "patient-portal",
  "Patient Portal - RediHealth",
  "",
  { robots: { index: false, follow: false } },
);

interface PageProps {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ c?: string | string[] }>;
}

export default async function PatientPortalPage({ params, searchParams }: PageProps) {
  const token = (await params).token.trim();
  const { c } = await searchParams;

  if (!PORTAL_TOKEN_PATTERN.test(token) || configuredCountries().length === 0) {
    notFound();
  }

  const lookup = await findPatientByPortalToken(token, parseCountry(Array.isArray(c) ? c[0] : c));

  if (lookup.status === "expired") {
    return <PortalLinkExpired />;
  }
  if (lookup.status === "not-found") {
    notFound();
  }

  return <PatientPortalView initialPatient={toPortalPatient(lookup.row, lookup.country)} token={token} country={lookup.country} />;
}
