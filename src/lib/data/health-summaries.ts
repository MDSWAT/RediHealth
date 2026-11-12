import { healthContentLanguage, type HealthContentLang } from "@/lib/i18n/health-content-language";
import type { Lang } from "@/lib/i18n/translations";
import en from "@/content/health-summaries/en.json";
import ro from "@/content/health-summaries/ro.json";
import sq from "@/content/health-summaries/sq.json";
import it from "@/content/health-summaries/it.json";
import ru from "@/content/health-summaries/ru.json";
import { informedHealthAreas, informedHealthSourceUrl } from "./informedhealth-directory";

export type HealthSummaryText = { intro: string; details: string; questions: string[] };
const summaries: Record<HealthContentLang, Record<string, HealthSummaryText>> = { en, ro, sq, it, ru };

export function getHealthSummary(lang: Lang, id: string) {
  const contentLanguage = healthContentLanguage(lang);
  const area = informedHealthAreas.find(candidate => candidate.id === id);
  if (!area || !Object.hasOwn(summaries[contentLanguage], id)) return undefined;
  return { ...summaries[contentLanguage][id], contentLanguage, id, title: area.titles[lang], sourceUrl: informedHealthSourceUrl(id)!, groups: area.groups };
}

export function getRelatedHealthSummaries(lang: Lang, id: string) {
  const area = informedHealthAreas.find(candidate => candidate.id === id);
  if (!area) return [];
  return informedHealthAreas.filter(candidate => candidate.id !== id && candidate.groups.some(group => area.groups.includes(group)))
    .slice(0, 3).map(candidate => ({ id: candidate.id, title: candidate.titles[lang] }));
}
