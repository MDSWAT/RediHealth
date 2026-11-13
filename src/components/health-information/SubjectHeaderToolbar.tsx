"use client";

import { useState } from "react";
import { ArticleListenButton } from "./ArticleListenButton";
import { ReadingLevelSwitcher } from "./ReadingLevelSwitcher";
import { HEALTH_DETAIL_SHARED_STRINGS } from "@/lib/i18n/health-myths";
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
  const [level, setLevel] = useState<"simple" | "complete">("simple");
  const s = HEALTH_DETAIL_SHARED_STRINGS.topicHero;
  const resolvedListen = s.listenGuide[uiLang] ?? s.listenGuide.ro;
  const resolvedStop = s.stopAudio[uiLang] ?? s.stopAudio.ro;

  return (
    <div className="w-full space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <ArticleListenButton
          uiLang={uiLang}
          contentLang={contentLang}
          textToSpeak={textToSpeak}
          listenLabel={resolvedListen}
          stopLabel={resolvedStop}
        />
        <ReadingLevelSwitcher level={level} onChange={setLevel} />
      </div>
      {level === "simple" && simpleTakeaway ? (
        <p
          role="note"
          className="rounded-r-lg border-l-2 border-sapphire bg-surface-subtle/70 py-2.5 pl-4 pr-3 text-base leading-relaxed text-foreground"
        >
          <span className="font-semibold text-sapphire">{TAKEAWAY_LABEL[uiLang] ?? TAKEAWAY_LABEL.ro}: </span>
          <span>{simpleTakeaway}</span>
        </p>
      ) : null}
    </div>
  );
}
