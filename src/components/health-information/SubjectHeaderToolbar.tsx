"use client";

import { ArticleListenButton } from "./ArticleListenButton";
import { GuideOfflinePrintActions } from "./GuideOfflinePrintActions";
import type { Lang } from "@/lib/i18n/translations";

export interface SubjectHeaderToolbarProps {
  uiLang: Lang;
  contentLang?: Lang | string;
  textToSpeak: string;
  saveTitle?: string;
}

/** Reading action bar shared across topic summaries and detailed health articles: voice narration, print/PDF, and offline save. */
export function SubjectHeaderToolbar({
  uiLang,
  contentLang,
  textToSpeak,
  saveTitle,
}: SubjectHeaderToolbarProps) {
  return (
    <div className="btn-row flex w-full flex-wrap items-start gap-2.5">
      <ArticleListenButton
        uiLang={uiLang}
        contentLang={contentLang}
        textToSpeak={textToSpeak}
      />
      <GuideOfflinePrintActions lang={uiLang} title={saveTitle} saveText={textToSpeak} />
    </div>
  );
}
