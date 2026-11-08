"use client";

import type { Lang } from "@/lib/i18n/translations";
import { ExplainerStage } from "./ExplainerStage";
import { EXPLAINER_CONTENT, EXPLAINER_UI_COPY, SPEECH_LANG } from "./explainer-copy";
import { getTopicExplainer } from "./registry";
import { isTopicSlug } from "./types";

export interface TopicExplainerProps {
  slug: string;
  lang: Lang;
  className?: string;
}

/** Renders a topic's explainer in the active language, or nothing if it has none yet. */
export function TopicExplainer({ slug, lang, className }: TopicExplainerProps) {
  const entry = getTopicExplainer(slug);
  if (!entry) return null;

  if (entry.Custom) {
    const CustomExplainer = entry.Custom;
    return <CustomExplainer lang={lang} className={className} />;
  }

  const content = isTopicSlug(slug) ? EXPLAINER_CONTENT[slug] : undefined;
  if (!content) return null;

  const localized = content[lang] ?? content.ro;

  return (
    <ExplainerStage
      title={localized.title}
      steps={localized.steps}
      Scene={entry.Scene}
      credit={entry.credit}
      ui={EXPLAINER_UI_COPY[lang] ?? EXPLAINER_UI_COPY.ro}
      speechLang={SPEECH_LANG[lang] ?? SPEECH_LANG.ro}
      lang={lang}
      className={className}
    />
  );
}

