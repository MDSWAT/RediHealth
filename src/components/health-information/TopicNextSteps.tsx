"use client";

import { Button } from "@/components/ui/Button";
import { UsersIcon } from "@/components/ui/icons";
import { withLangPrefix } from "@/lib/i18n/routing";
import type { Lang } from "@/lib/i18n/translations";
import { MedicalSafetyDisclaimer } from "./MedicalSafetyDisclaimer";

export interface TopicNextStepsProps {
  lang: Lang;
  topicSlug?: string;
  topicTitle?: string;
  className?: string;
}

const MEDIATOR_NEXT_STEP_COPY: Record<
  Lang,
  { title: string; description: string; buttonText: string }
> = {
  ro: {
    title: "Ai nevoie de sprijin în comunitate?",
    description:
      "Un mediator sanitar te poate ajuta gratuit cu programări, formulare și pași administrativi.",
    buttonText: "Întreabă un mediator",
  },
  en: {
    title: "Need support finding care?",
    description:
      "A health mediator can help for free with appointments, paperwork, and practical guidance.",
    buttonText: "Ask a health mediator",
  },
  sq: {
    title: "Ke nevojë për mbështetje në komunitet?",
    description:
      "Një mediator shëndetësor mund të të ndihmojë falas me takimet, dokumentet dhe orientimin praktik.",
    buttonText: "Pyet një mediator",
  },
  it: {
    title: "Hai bisogno di orientamento?",
    description:
      "Un mediatore sanitario può aiutarti gratuitamente con appuntamenti, documenti e orientamento pratico.",
    buttonText: "Chiedi a un mediatore",
  },
  hr: {
    title: "Trebate pomoć pri snalaženju?",
    description:
      "Zdravstveni medijator može ti besplatno pomoći s naručivanjem, dokumentima i praktičnim koracima.",
    buttonText: "Pitaj medijatora",
  },
  rom: {
    title: "Kamlipe tut ažutipen ando gav?",
    description:
      "Jekh sastipnasko mediatori šaj te ažutil tut bi-lovengo te kerel programime thaj lila.",
    buttonText: "Puč jekh mediatori",
  },
  ru: {
    title: "Нужна помощь с обращением к врачу?",
    description:
      "Медицинский посредник бесплатно поможет с записью, документами и практическими шагами.",
    buttonText: "Спросить посредника",
  },
};

/**
 * Calm closing surface at the end of a health guide: one optional link to a community
 * health mediator plus the safety disclaimer, without pushing visitors across diagnostic pages.
 */
export function TopicNextSteps({ lang, className = "" }: TopicNextStepsProps) {
  const copy = MEDIATOR_NEXT_STEP_COPY[lang] ?? MEDIATOR_NEXT_STEP_COPY.ro;

  return (
    <section
      aria-labelledby="next-steps-heading"
      className={`divide-y divide-border rounded-xl border border-border bg-card print:divide-y-0 print:border-0 ${className}`}
    >
      <div className="flex flex-col gap-5 p-6 sm:p-8 md:flex-row md:items-center md:justify-between print:hidden">
        <div className="max-w-xl">
          <h2 id="next-steps-heading" className="text-section font-semibold text-foreground text-balance">
            {copy.title}
          </h2>
          <p className="mt-1.5 text-body text-muted-foreground">{copy.description}</p>
        </div>
        <Button
          href={withLangPrefix("/mediatori#solicita", lang)}
          variant="outline"
          size="lg"
          className="shrink-0 whitespace-nowrap"
        >
          <UsersIcon className="h-4 w-4 shrink-0 text-sapphire dark:text-sapphire-border" aria-hidden="true" />
          <span className="min-w-0 truncate">{copy.buttonText}</span>
        </Button>
      </div>

      <div className="px-6 py-4 sm:px-8 print:px-0" data-print-guide-section>
        <MedicalSafetyDisclaimer lang={lang} variant="plain" />
      </div>
    </section>
  );
}
