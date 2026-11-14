"use client";

import { useReadingLevel } from "@/lib/comfort-preferences";
import { ArticleListenButton } from "./ArticleListenButton";
import { ReadingLevelSwitcher } from "./ReadingLevelSwitcher";
import type { Lang } from "@/lib/i18n/translations";

export interface SubjectHeaderToolbarProps {
  uiLang: Lang;
  contentLang?: Lang | string;
  textToSpeak: string;
  /** Optional concise lead displayed as a key-takeaway callout when reading level is set to simple. */
  simpleTakeaway?: string;
}

const TAKEAWAY_LABEL: Record<Lang, string> = {
  ro: "Pe scurt",
  en: "Key takeaway",
  sq: "Përmbledhje e shkurtër",
  it: "In breve",
  hr: "Ukratko",
  rom: "Skurto",
  ru: "Коротко",
};

/**
 * Harmonized reading action bar shared across topic summaries and detailed health articles:
 * 1-tap voice narration alongside the reading-level toggle, matching topic guides.
 */
export function SubjectHeaderToolbar({
  uiLang,
  contentLang,
  textToSpeak,
  simpleTakeaway,
}: SubjectHeaderToolbarProps) {
  const [level, setLevel] = useReadingLevel();

  return (
    <div className="w-full space-y-3">
      <div className="btn-row flex flex-wrap items-center justify-between gap-3">
        <ArticleListenButton
          uiLang={uiLang}
          contentLang={contentLang}
          textToSpeak={textToSpeak}
        />
        <ReadingLevelSwitcher level={level} onChange={setLevel} />
      </div>
      {level === "simple" && simpleTakeaway ? (
        <p
          role="note"
          className="max-w-(--measure-reading) text-lead text-foreground"
        >
          <span className="font-semibold text-foreground">{TAKEAWAY_LABEL[uiLang] ?? TAKEAWAY_LABEL.ro}: </span>
          <span>{simpleTakeaway}</span>
        </p>
      ) : null}
    </div>
  );
}
