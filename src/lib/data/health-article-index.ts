import index from "@/content/health-articles/index.json";
import type { Lang } from "@/lib/i18n/translations";

export type HealthArticleIndexEntry = { id: string; areaIds: string[]; titles: Record<Lang, string>; sourceUrl: string; availableLanguages: Lang[] };
export const healthArticleIndex: HealthArticleIndexEntry[] = index.map(item => ({...item,
  availableLanguages: item.availableLanguages as Lang[],
  titles: {hr: item.titles.en, rom: item.titles.en, ...item.titles} as Record<Lang, string> }));
export const healthArticlePath = (id: string) => `/health-information/articles/${encodeURIComponent(id)}`;
export function findHealthArticles(lang: Lang, query = "", areaId = "all") {
  const fold = (s: string) => s.toLocaleLowerCase(lang).normalize("NFD").replace(/\p{M}/gu, "");
  const term = fold(query.trim());
  return healthArticleIndex.filter(item => (areaId === "all" || item.areaIds.includes(areaId))
    && (!term || fold(`${item.titles[lang]} ${item.titles.en} ${item.id.replaceAll("-", " ")}`).includes(term)))
    .sort((a, b) => a.titles[lang].localeCompare(b.titles[lang], lang));
}
