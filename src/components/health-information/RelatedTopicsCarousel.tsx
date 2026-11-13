"use client";

import { useLanguage } from "@/lib/i18n/language-context";
import { withLangPrefix } from "@/lib/i18n/routing";
import type { HealthTopicContent } from "@/lib/i18n/health-information-topics";
import type { Lang } from "@/lib/i18n/translations";
import { HEALTH_DETAIL_SHARED_STRINGS } from "@/lib/i18n/health-myths";
import { HealthArticleRelatedList } from "./HealthArticleShell";

export interface RelatedTopicsCarouselProps {
  topics: HealthTopicContent[];
  className?: string;
  lang?: Lang;
}

function useSafeLanguageContext(): { lang: Lang } {
  try {
    return useLanguage();
  } catch {
    return { lang: "ro" };
  }
}

function pickLocale(
  entry: Record<"ro", string> & Partial<Record<Lang, string>>,
  lang: Lang,
): string {
  return entry[lang] ?? entry.ro;
}

export function RelatedTopicsCarousel({
  topics,
  className = "",
  lang,
}: RelatedTopicsCarouselProps) {
  const { lang: ctxLang } = useSafeLanguageContext();
  const currentLang: Lang = lang ?? ctxLang ?? "ro";
  const s = HEALTH_DETAIL_SHARED_STRINGS.relatedTopics;

  if (topics.length === 0) return null;

  return (
    <HealthArticleRelatedList
      heading={pickLocale(s.heading, currentLang)}
      headingId="related-topics-heading"
      items={topics.map((topic) => ({
        key: topic.slug,
        href: withLangPrefix(`/health-information/${topic.slug}`, currentLang),
        title: topic.title,
        meta: topic.description,
      }))}
      className={className}
    />
  );
}
