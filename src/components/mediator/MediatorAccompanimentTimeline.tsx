import { Container } from "@/components/ui/Container";
import { mediatorTimelineCopy } from "@/components/mediator/mediator-page-copy";
import type { Lang } from "@/lib/i18n/translations";

/**
 * Three-step accompaniment timeline showing how a community health mediator walks with the patient.
 */
export function MediatorAccompanimentTimeline({ lang }: { lang: Lang }) {
  const copy = mediatorTimelineCopy[lang] ?? mediatorTimelineCopy.ro;

  return (
    <section className="py-10 sm:py-14" aria-labelledby="accompaniment-timeline-heading">
      <Container>
        <div className="border-t border-border pt-6 sm:pt-8">
          <h2 id="accompaniment-timeline-heading" className="text-balance text-section font-semibold text-foreground">
            {copy.title}
          </h2>
          <p className="mt-2 max-w-(--measure-reading) text-body text-muted-foreground">
            {copy.lead}
          </p>

          <ol className="mt-6 grid gap-6 border-t border-border pt-6 md:grid-cols-3 md:gap-8">
            {copy.steps.map((step, index) => (
              <li key={step.title} className="min-w-0">
                <p aria-hidden="true" className="text-meta font-semibold tabular-nums text-amber-care dark:text-amber-care-border">
                  {index + 1}.
                </p>
                <h3 className="mt-1.5 text-balance text-title font-semibold text-foreground">{step.title}</h3>
                <p className="mt-1.5 text-pretty text-body text-muted-foreground">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </Container>
    </section>
  );
}
