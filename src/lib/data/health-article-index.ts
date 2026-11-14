import index from "@/content/health-articles/index.json";
import { healthArticleCopy } from "@/lib/i18n/health-article-translations";
import type { Lang } from "@/lib/i18n/translations";

export type HealthArticleIndexEntry = { id: string; areaIds: string[]; titles: Record<Lang, string>; sourceUrl: string; availableLanguages: Lang[] };
export const GERMAN_SERVICE_AREA_IDS = new Set([
  "health-care-in-germany",
  "individual-health-care-services-igel",
]);

export function isGermanServiceArticle(entry: Pick<HealthArticleIndexEntry, "areaIds">): boolean {
  return entry.areaIds.some((areaId) => GERMAN_SERVICE_AREA_IDS.has(areaId));
}

export function formatHealthArticleTitle(
  entry: Pick<HealthArticleIndexEntry, "areaIds" | "titles">,
  lang: Lang,
  titleOverride?: string,
): string {
  const title = titleOverride ?? entry.titles[lang] ?? entry.titles.en;
  if (!isGermanServiceArticle(entry)) return title;
  const prefix = healthArticleCopy[lang]?.inGermanyPrefix ?? healthArticleCopy.en.inGermanyPrefix;
  if (title.startsWith(prefix)) return title;
  return `${prefix} ${title}`;
}

export const healthArticleIndex: HealthArticleIndexEntry[] = index.map(item => ({...item,
  availableLanguages: item.availableLanguages as Lang[],
  titles: { ...item.titles, hr: item.titles.hr ?? item.titles.en, rom: item.titles.rom ?? item.titles.en } as Record<Lang, string> }));
export const healthArticlePath = (id: string) => `/health-information/articles/${encodeURIComponent(id)}`;
export function findHealthArticles(lang: Lang, query = "", areaId = "all") {
  const fold = (s: string) => s.toLocaleLowerCase(lang).normalize("NFD").replace(/\p{M}/gu, "");
  const term = fold(query.trim());
  return healthArticleIndex.filter(item => (areaId === "all" || item.areaIds.includes(areaId))
    && (!term || fold(`${item.titles[lang]} ${item.titles.en} ${item.id.replaceAll("-", " ")}`).includes(term)))
    .sort((a, b) => a.titles[lang].localeCompare(b.titles[lang], lang));
}
