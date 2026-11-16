import { readFile } from "node:fs/promises";
import path from "node:path";
import { healthContentLanguage } from "@/lib/i18n/health-content-language";
import type { Lang } from "@/lib/i18n/languages";
import { healthArticleIndex } from "./health-article-index";
import additionalSources from "@/content/health-articles/additional-sources.json";

export type HealthArticleText = { title: string; intro: string; sections: { heading: string; paragraphs: string[] }[]; examples: { title: string; text: string }[]; questions: string[] };

const ARTICLES_ROOT = path.resolve(process.cwd(), "src", "content", "health-articles");
const ARTICLE_CACHE_LIMIT = 64;
const articleCache = new Map<string, HealthArticleText>();

async function loadArticleJson(contentLanguage: string, id: string): Promise<HealthArticleText> {
  const cacheKey = `${contentLanguage}:${id}`;
  const cached = articleCache.get(cacheKey);
  if (cached) {
    // Refresh recency while capping memory across 3,400+ localized JSON files.
    articleCache.delete(cacheKey);
    articleCache.set(cacheKey, cached);
    return cached;
  }

  const filePath = path.resolve(ARTICLES_ROOT, contentLanguage, `${id}.json`);
  if (!filePath.startsWith(`${ARTICLES_ROOT}${path.sep}`)) {
    throw new Error(`Invalid health article path for ${contentLanguage}/${id}`);
  }

  const raw = await readFile(filePath, "utf8");
  const article = JSON.parse(raw) as HealthArticleText;

  if (articleCache.size >= ARTICLE_CACHE_LIMIT) {
    const oldestKey = articleCache.keys().next().value;
    if (oldestKey !== undefined) {
      articleCache.delete(oldestKey);
    }
  }
  articleCache.set(cacheKey, article);
  return article;
}

export async function getHealthArticle(lang: Lang, id: string) {
  const entry = healthArticleIndex.find(item => item.id === id);
  if (!entry) return undefined;
  const contentLanguage = healthContentLanguage(lang, entry.availableLanguages);
  // The manifest is the allowlist: never interpolate an unvalidated route parameter.
  const article = await loadArticleJson(contentLanguage, entry.id);
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
