import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { ArrowRightIcon } from "@/components/ui/icons";
import { MediatorServices } from "@/components/landing/MediatorServices";
import { homeSectionsCopy } from "@/lib/i18n/home-sections-copy";
import { getRequestLang, withLangPrefix } from "@/lib/i18n/server-routing";

/**
 * The health mediators section on the ink ground, using amber-care as its accent.
 * Renders one calm primary CTA straight to the mediator contact form (/mediatori#solicita),
 * three elevated service cards, and three plain facts separated by hairlines.
 */
export async function MediatorsSection() {
  const lang = await getRequestLang();
  const copy = homeSectionsCopy[lang].mediators;

  return (
    <Section tone="ink" aria-labelledby="home-mediators-title" className="relative isolate overflow-hidden">
      <Container>
        <Reveal>
          <div className="grid gap-8 lg:grid-cols-12 lg:items-start lg:gap-14">
            <h2 id="home-mediators-title" className="text-balance text-page text-paper lg:col-span-7">
              {copy.title} <span className="text-mist">{copy.titleQuiet}</span>
            </h2>
            <div className="lg:col-span-5">
              <p className="max-w-(--measure-lead) text-pretty text-lead text-mist">{copy.lead}</p>
              <div className="mt-6">
                <Button
                  href={withLangPrefix("/mediatori#solicita", lang)}
                  variant="action"
                  size="lg"
                  className="hero-focus bg-paper! text-ink-950! hover:bg-paper/90! active:bg-paper/80!"
                >
                  <span>{copy.ask}</span>
                  <ArrowRightIcon className="arrow-travel h-5 w-5 shrink-0" />
                </Button>
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal>
          <MediatorServices services={copy.services} />
        </Reveal>

        <div className="mt-6 overflow-hidden border-t border-paper/12 pt-4 sm:mt-12 sm:pt-6 lg:mt-14">
          <ul className="flex flex-col gap-y-1.5 text-meta font-semibold text-paper/90 sm:-ml-3.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-y-2.5 sm:text-body sm:text-paper">
            {copy.facts.map((fact) => (
              <li key={fact} className="sm:whitespace-nowrap sm:border-l sm:border-paper/25 sm:px-3.5">
                {fact}
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </Section>
  );
}
