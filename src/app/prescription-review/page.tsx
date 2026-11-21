import type { Metadata } from "next";
import { PrescriptionReview } from "@/components/health-assistant/PrescriptionReview";
import { localizedPageTitle } from "@/lib/i18n/page-metadata";
import { getRequestLang } from "@/lib/i18n/server-routing";
import { translations } from "@/lib/i18n/translations";

// The page is described as the menu describes it: type the medicine name first, a photo second.
export async function generateMetadata(): Promise<Metadata> {
  const lang = await getRequestLang();
  return {
    title: localizedPageTitle(lang, "prescription-review", "Medicine check - RediHealth"),
    description: translations[lang].header.navMedicineSub,
  };
}

export default function PrescriptionReviewPage() {
  return <PrescriptionReview />;
}
