import type { Metadata } from "next";
import { HealthAssistant } from "@/components/health-assistant/HealthAssistant";
import { localizedPageTitle } from "@/lib/i18n/page-metadata";
import { getRequestLang } from "@/lib/i18n/server-routing";
import type { Lang } from "@/lib/i18n/translations";

const descriptions: Record<Lang, string> = {
  ru: "Ответьте на несколько коротких вопросов. Мы направим вас к информации, к врачу или медицинскому посреднику.",

  ro: "Răspunde la câteva întrebări scurte. Te trimitem spre informații, un medic sau un mediator sanitar.",
  en: "Answer a few short questions. We point you to information, a doctor or a health mediator.",
  sq: "Përgjigju disa pyetjeve të shkurtra. Të tregojmë ku gjen informacion, një mjek ose një mediator shëndetësor.",
  it: "Rispondi a qualche breve domanda. Ti indichiamo informazioni, un medico o un mediatore sanitario.",
  hr: "Odgovori na nekoliko kratkih pitanja. Uputit ćemo te na informacije, liječnika ili zdravstvenog medijatora.",
  rom: "De palpale pe zalag xarne pučhimata. Sikavas tuke informaciye, doktori vay sastipnasko mediatori.",
};

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getRequestLang();
  return {
    title: localizedPageTitle(lang, "health-assistant", "Health assistant - RediHealth"),
    description: descriptions[lang] ?? descriptions.en,
  };
}

export default function HealthAssistantPage() {
  return <HealthAssistant />;
}
