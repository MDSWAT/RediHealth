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
    <div className="w-full">
      <div className="btn-row flex w-full flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        <ArticleListenButton
          uiLang={uiLang}
          contentLang={contentLang}
          textToSpeak={textToSpeak}
          className="w-full justify-center border-sapphire/35! bg-sapphire-soft/45! text-sapphire! hover:border-sapphire/55! hover:bg-sapphire-soft/75! sm:w-auto dark:border-sapphire-border/40! dark:bg-sapphire/20! dark:text-sapphire-border!"
        />
        <GuideOfflinePrintActions lang={uiLang} title={saveTitle} saveText={textToSpeak} />
      </div>
    </div>
  );
}
