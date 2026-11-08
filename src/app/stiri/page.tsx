import type { Metadata } from "next";
import { NewsHub } from "@/components/news/NewsHub";
import { getRequestLang } from "@/lib/i18n/server-routing";
import { localizedPageTitle } from "@/lib/i18n/page-metadata";
import type { Lang } from "@/lib/i18n/translations";

const descriptions: Record<Lang, string> = {
  ro: "Alerte de sănătate, caravane medicale și campanii de vaccinare din județul tău.",
  en: "Health alerts, mobile clinics and vaccination campaigns near you.",
  sq: "Njoftime shëndetësore, karvane mjekësore dhe fushata vaksinimi pranë teje.",
  it: "Avvisi sanitari, ambulatori mobili e campagne di vaccinazione vicino a te.",
};

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getRequestLang();
  return {
    title: localizedPageTitle(lang, "stiri", "Medical news and alerts - RediHealth"),
    description: descriptions[lang] ?? descriptions.en,
  };
}

export default function NewsHubPage() {
  return <NewsHub />;
}
