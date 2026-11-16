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
        <div className="rounded-xl border border-amber-care-border bg-amber-care-soft/55 p-6 dark:border-amber-care/40 dark:bg-amber-care/10 sm:p-8">
          <h2 id="accompaniment-timeline-heading" className="text-balance text-section font-semibold text-foreground">
            {copy.title}
          </h2>
          <p className="mt-2 max-w-(--measure-reading) text-body text-muted-foreground">
            {copy.lead}
          </p>

          <ol className="mt-6 grid gap-6 border-t border-amber-care-border/70 pt-6 dark:border-amber-care/30 md:grid-cols-3 md:gap-8">
            {copy.steps.map((step, index) => (
              <li key={step.title} className="min-w-0">
                <div className="flex items-center gap-3">
                  <span
                    aria-hidden="true"
                    className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-care text-meta font-bold tabular-nums text-white"
                  >
                    {index + 1}
                  </span>
                  {index < copy.steps.length - 1 ? (
                    <span
                      aria-hidden="true"
                      className="hidden h-px flex-1 bg-amber-care/30 dark:bg-amber-care-border/30 md:block"
                    />
                  ) : null}
                </div>
                <h3 className="mt-3 text-balance text-title font-semibold text-foreground">{step.title}</h3>
                <p className="mt-1.5 text-pretty text-body text-muted-foreground">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </Container>
    </section>
  );
}
