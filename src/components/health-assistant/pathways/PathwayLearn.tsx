"use client";

import Link from "next/link";
import { ArrowRightIcon, BookIcon } from "@/components/ui/icons";
import { UniversalDoctorExit } from "@/components/health-assistant/UniversalDoctorExit";
import { type LearnTopicId, useAssistantCopy } from "@/components/health-assistant/assistant-copy";
import {
  optionArrow,
  optionDesc,
  optionIcon,
  optionRow,
  optionTitle,
  stepHeading,
  stepLead,
  subHeading,
  textLink,
  textLinkLabel,
} from "@/components/health-assistant/step-ui";
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
        <h2 className={stepHeading}>{learn.heading}</h2>
        <p className={stepLead}>{learn.lead}</p>

        <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {TOPICS.map(({ id }) => {
            const topic = learn.topics[id];
            return (
              <li key={id}>
                <button
                  type="button"
                  data-triage-option={id}
                  onClick={() => onSelectTopic(id)}
                  className={`h-full ${optionRow}`}
                >
                  <span aria-hidden="true" className={optionIcon}>
                    <BookIcon className="h-5 w-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className={optionTitle}>{topic.title}</span>
                    <span className={optionDesc}>{topic.subtitle}</span>
                  </span>
                  <ArrowRightIcon aria-hidden="true" className={optionArrow} />
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
      <h2 className={stepHeading}>{topic.title}</h2>

      <figure className="mt-5 rounded-2xl bg-muted/60 p-5">
        <figcaption className="text-sm text-muted-foreground">
          {learn.mythLabel}: <span className="font-semibold text-foreground">{learn.verdictFalse}</span>
        </figcaption>
        <blockquote className="mt-2 text-base leading-relaxed text-foreground">&ldquo;{topic.myth}&rdquo;</blockquote>
      </figure>

      <h3 className={`mt-6 ${subHeading}`}>{learn.doctorLabel}</h3>
      <p className="mt-1.5 max-w-prose text-base leading-relaxed text-foreground">
        {plainLanguage ? topic.plainDoctor : topic.doctor}
      </p>
      <p className="mt-2 text-sm text-muted-foreground">
        {learn.sourceLabel}: {topic.source}
      </p>

      <Link href={guideHref} className={`mt-3 max-w-full text-sm sm:text-[0.9375rem] ${textLink}`}>
        <span className={`min-w-0 truncate ${textLinkLabel}`}>{current.guideSlug ? learn.readGuide : learn.browseGuides}</span>
        <ArrowRightIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
      </Link>

      <UniversalDoctorExit pathway="learn" summary={learn.summary(topic.title)} />
    </div>
  );
}
