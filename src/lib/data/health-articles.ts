import { healthContentLanguage } from "@/lib/i18n/health-content-language";
import type { Lang } from "@/lib/i18n/translations";
import { healthArticleIndex } from "./health-article-index";
import additionalSources from "@/content/health-articles/additional-sources.json";

export type HealthArticleText = { title: string; intro: string; sections: { heading: string; paragraphs: string[] }[]; examples: { title: string; text: string }[]; questions: string[] };
export async function getHealthArticle(lang: Lang, id: string) {
  const entry = healthArticleIndex.find(item => item.id === id);
  if (!entry) return undefined;
  const contentLanguage = healthContentLanguage(lang, entry.availableLanguages);
  // The manifest is the allowlist: never interpolate an unvalidated route parameter.
  const loaded = await import(`../../content/health-articles/${contentLanguage}/${entry.id}.json`);
  const article = (loaded.default ?? loaded) as HealthArticleText;
  return { ...article, ...entry, contentLanguage, sources: [
    { label: "InformedHealth.org (IQWiG)", url: entry.sourceUrl },
    ...(id === "dust-mite-allergies" ? [
      { label: "NHS — Allergic rhinitis", url: "https://www.nhs.uk/conditions/allergic-rhinitis/" },
      { label: "ACAAI — Dust allergy", url: "https://acaai.org/allergies/allergic-conditions/dust-allergies/" },
    ] : []),
    ...(id === "abdominal-aortic-aneurysm" ? [{ label: "NHS — Abdominal aortic aneurysm", url: "https://www.nhs.uk/conditions/abdominal-aortic-aneurysm/" }] : []),
    ...((additionalSources as Record<string, { label: string; url: string }[]>)[id] ?? []),
  ] };
}
