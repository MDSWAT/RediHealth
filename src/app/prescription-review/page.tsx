import type { Metadata } from "next";
import { PrescriptionReview } from "@/components/health-assistant/PrescriptionReview";
import { localizedPageTitle } from "@/lib/i18n/page-metadata";
import { getRequestLang } from "@/lib/i18n/server-routing";
import type { Lang } from "@/lib/i18n/translations";

const descriptions: Record<Lang, string> = {
  ru: "Сфотографируйте свой рецепт. Ассистент читает текст и объясняет его простыми словами.",

  ro: "Fă o poză rețetei. Asistentul citește textul și ți-l explică pe înțeles.",
  en: "Take a photo of your prescription. The assistant reads the text and explains it clearly.",
  sq: "Bëj një foto të recetës. Asistenti e lexon tekstin dhe ta shpjegon qartë.",
  it: "Fai una foto alla ricetta. L'assistente legge il testo e te lo spiega con chiarezza.",
  hr: "Fotografiraj recept. Asistent čita tekst i jasno ti ga objašnjava.",
  rom: "Ker poza che receptake. O asistento ginavel o lekhipen thaj ashkarel les chaches.",
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
