import type { Metadata } from "next";
import { HealthInformationPageContent } from "@/components/health-information/HealthInformationPageContent";
import { getRequestLang } from "@/lib/i18n/server-routing";
import { translations } from "@/lib/i18n/translations";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getRequestLang();
  const page = translations[lang].healthInfoPage;
  return {
    title: `${page.eyebrow} - RediHealth`,
    description: page.heroSubtitle,
  };
}

export default function HealthInformationPage() {
  return <HealthInformationPageContent />;
}
