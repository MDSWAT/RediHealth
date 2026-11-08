import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getRequestLang } from "@/lib/i18n/server-routing";
import {
  getHealthInformationDictionary,
  getHealthTopicBySlug,
  healthTopicSlugs,
} from "@/lib/i18n/health-information-topics";
import { TopicDetailPageContent } from "@/components/health-information/TopicDetailPageContent";

export function generateStaticParams() {
  return healthTopicSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/health-information/[slug]">): Promise<Metadata> {
  const lang = await getRequestLang();
  const { slug } = await params;
  const topic = getHealthTopicBySlug(lang, slug);

  if (!topic) {
    return { title: `${getHealthInformationDictionary(lang).labels.allTopics} - RediHealth` };
  }

  return {
    title: topic.title + " - RediHealth",
    description: topic.description,
  };
}

export default async function HealthTopicPage({
  params,
}: PageProps<"/health-information/[slug]">) {
  const lang = await getRequestLang();
  const dictionary = getHealthInformationDictionary(lang);
  const { slug } = await params;
  const topic = getHealthTopicBySlug(lang, slug);

  if (!topic) {
    notFound();
  }

  const related = dictionary.topics
    .filter((item) => item.slug !== topic.slug)
    .slice(0, 3);

  return (
    <main id="main-content" className="flex-1">
      <TopicDetailPageContent
        topic={topic}
        relatedTopics={related}
      />
    </main>
  );
}
