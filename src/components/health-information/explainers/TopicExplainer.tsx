"use client";

import type { Lang } from "@/lib/i18n/translations";
import { getTopicExplainer } from "./registry";

export interface TopicExplainerProps {
  slug: string;
  lang: Lang;
  className?: string;
}

/** Renders a topic's interactive explainer in the active language, or nothing for an unknown slug. */
export function TopicExplainer({ slug, lang, className }: TopicExplainerProps) {
  const entry = getTopicExplainer(slug);
  if (!entry) return null;
  const Explainer = entry.Custom;
  return <Explainer lang={lang} className={className} />;
}
