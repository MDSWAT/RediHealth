import type { Lang } from "@/lib/i18n/translations";
import enExcerpts from "@/content/health-articles/search-excerpts/en.json";
import hrExcerpts from "@/content/health-articles/search-excerpts/hr.json";
import itExcerpts from "@/content/health-articles/search-excerpts/it.json";
import roExcerpts from "@/content/health-articles/search-excerpts/ro.json";
import romExcerpts from "@/content/health-articles/search-excerpts/rom.json";
import ruExcerpts from "@/content/health-articles/search-excerpts/ru.json";
import sqExcerpts from "@/content/health-articles/search-excerpts/sq.json";

const EXCERPTS_BY_LANG: Record<Lang, Record<string, string>> = {
  ro: roExcerpts,
  en: enExcerpts,
  sq: sqExcerpts,
  it: itExcerpts,
  hr: hrExcerpts,
  rom: romExcerpts,
  ru: ruExcerpts,
};

/**
 * Returns a localized, concise plain-text intro excerpt for an indexed health article
 * in the caller's selected language (no cross-language fallback).
 */
export function getHealthArticleExcerpt(lang: Lang, id: string): string | undefined {
  return EXCERPTS_BY_LANG[lang]?.[id];
}
