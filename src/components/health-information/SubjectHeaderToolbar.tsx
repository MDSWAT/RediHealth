"use client";

import { ArticleListenButton } from "./ArticleListenButton";
import type { Lang } from "@/lib/i18n/translations";

export interface SubjectHeaderToolbarProps {
  uiLang: Lang;
  contentLang?: Lang | string;
  textToSpeak: string;
}

/** Reading action bar shared across topic summaries and detailed health articles: 1-tap voice narration. */
export function SubjectHeaderToolbar({ uiLang, contentLang, textToSpeak }: SubjectHeaderToolbarProps) {
  return (
    <div className="w-full">
      <div className="btn-row flex flex-wrap items-center justify-between gap-3">
        <ArticleListenButton uiLang={uiLang} contentLang={contentLang} textToSpeak={textToSpeak} />
      </div>
    </div>
  );
}
