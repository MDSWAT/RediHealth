"use client";

import Link from "next/link";
import { ArrowRightIcon, BookIcon } from "@/components/ui/icons";
import { UniversalDoctorExit } from "@/components/health-assistant/UniversalDoctorExit";
import { type LearnTopicId, useAssistantCopy } from "@/components/health-assistant/assistant-copy";
import { useLanguage } from "@/lib/i18n/language-context";
import { withLangPrefix } from "@/lib/i18n/routing";

interface PathwayLearnProps {
  step: 2 | 3;
  selectedTopicId?: string;
  onSelectTopic: (topicId: string) => void;
  plainLanguage: boolean;
}

/** Only topics with a published guide link to it; the others open the guides index. */
const TOPICS: { id: LearnTopicId; guideSlug?: string }[] = [
  { id: "vaccines" },
  { id: "heart", guideSlug: "heart-health" },
  { id: "child_fever" },
  { id: "antibiotics" },
];

export function PathwayLearn({ step, selectedTopicId, onSelectTopic, plainLanguage }: PathwayLearnProps) {
  const { lang } = useLanguage();
  const { learn } = useAssistantCopy();

  if (step === 2) {
    return (
      <div>
        <h2 className="text-lg font-semibold text-foreground">{learn.heading}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{learn.lead}</p>

        <ul className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {TOPICS.map(({ id }) => {
            const topic = learn.topics[id];
            return (
              <li key={id}>
                <button
                  type="button"
                  data-triage-option={id}
                  onClick={() => onSelectTopic(id)}
                  className="flex h-full min-h-[56px] w-full flex-col items-start rounded-lg border border-border bg-card p-4 text-left transition-colors duration-[var(--dur-fast)] hover:border-sapphire/40 hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <BookIcon className="h-4 w-4 shrink-0 text-sapphire dark:text-sapphire-border" />
                    {topic.title}
                  </span>
                  <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">{topic.subtitle}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }

  const current = TOPICS.find((t) => t.id === selectedTopicId) ?? TOPICS[0];
  const topic = learn.topics[current.id];
  const guideHref = withLangPrefix(
    current.guideSlug ? `/health-information/${current.guideSlug}` : "/health-information",
    lang,
  );

  return (
    <div>
      <h2 className="text-lg font-semibold text-foreground">{topic.title}</h2>

      <figure className="mt-4 rounded-lg bg-muted/50 p-4">
        <figcaption className="text-sm text-muted-foreground">
          {learn.mythLabel}: <span className="font-semibold text-foreground">{learn.verdictFalse}</span>
        </figcaption>
        <blockquote className="mt-1.5 text-base text-foreground">&ldquo;{topic.myth}&rdquo;</blockquote>
      </figure>

      <h3 className="mt-5 text-sm font-semibold text-foreground">{learn.doctorLabel}</h3>
      <p className="mt-1.5 max-w-prose text-base leading-relaxed text-foreground">
        {plainLanguage ? topic.plainDoctor : topic.doctor}
      </p>
      <p className="mt-2 text-sm text-muted-foreground">
        {learn.sourceLabel}: {topic.source}
      </p>

      <Link
        href={guideHref}
        className="mt-5 inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors duration-[var(--dur-fast)] hover:bg-primary/90"
      >
        {current.guideSlug ? learn.readGuide : learn.browseGuides}
        <ArrowRightIcon className="h-4 w-4" />
      </Link>

      <UniversalDoctorExit pathway="learn" summary={learn.summary(topic.title)} />
    </div>
  );
}
