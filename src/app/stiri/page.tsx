import type { Metadata } from "next";
import { NewsHub } from "@/components/news/NewsHub";
import { newsPageDescriptions } from "@/components/news/news-format";
import { getRequestLang } from "@/lib/i18n/server-routing";
import { localizedPageTitle } from "@/lib/i18n/page-metadata";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getRequestLang();
  return {
    title: localizedPageTitle(lang, "stiri", "Medical news and alerts - RediHealth"),
    description: newsPageDescriptions[lang] ?? newsPageDescriptions.en,
  };
}

export default function NewsHubPage() {
  return <NewsHub />;
}
