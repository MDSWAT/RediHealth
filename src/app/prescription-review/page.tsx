import type { Metadata } from "next";
import { PrescriptionReview } from "@/components/health-assistant/PrescriptionReview";
import { localizedPageTitle } from "@/lib/i18n/page-metadata";
import { getRequestLang } from "@/lib/i18n/server-routing";
import type { Lang } from "@/lib/i18n/translations";

const descriptions: Record<Lang, string> = {
  ro: "Fă o poză rețetei. Primești textul pe înțeles și un orar pentru fiecare zi.",
  en: "Take a photo of your prescription. Get it in plain words, with a schedule for each day.",
  sq: "Bëj një foto të recetës. Merr tekstin me fjalë të thjeshta dhe një orar për çdo ditë.",
  it: "Fai una foto alla ricetta. Ricevi il testo in parole semplici e un orario per ogni giorno.",
};

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getRequestLang();
  return {
    title: localizedPageTitle(lang, "prescription-review", "Prescription review - RediHealth"),
    description: descriptions[lang] ?? descriptions.en,
  };
}

export default function PrescriptionReviewPage() {
  return <PrescriptionReview />;
}
