import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { ChevronRightIcon } from "@/components/ui/icons";
import { MediatorServices } from "@/components/landing/MediatorServices";
import { homeSectionsCopy } from "@/lib/i18n/home-sections-copy";
import { getRequestLang, withLangPrefix } from "@/lib/i18n/server-routing";

/**
 * The health mediators, brought forward from /mediatori: the people behind the platform.
 * On the ink ground, with amber (the mediators' colour everywhere on the site) as the only accent.
 * - Top: a two-sentence heading (the second quieter) beside the lead and the two ways in:
 *   ask for a mediator (paper button) and read how they help (amber text link, as in the hero).
 * - Below: what a mediator does (MediatorServices): three columns under an amber rule, and on
 *   phones three rows that grow open and shrink shut, the first open.
 * - Last: three plain facts with hairlines between them, no icons.
 */
export async function MediatorsSection() {
  const lang = await getRequestLang();
  const copy = homeSectionsCopy[lang].mediators;

  return (
    <Section tone="ink" aria-labelledby="home-mediators-title" className="relative isolate overflow-hidden">
      {/* A low warm light from the top right: the only decoration, behind everything. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 -top-64 -z-10 h-112 w-112 rounded-full bg-amber-care-border/10 blur-3xl sm:-right-48 sm:-top-56 sm:h-144 sm:w-144 sm:bg-amber-care/25"
      />

      <Container>
        <Reveal>
          <div className="grid gap-8 lg:grid-cols-12 lg:items-end lg:gap-14">
            <h2 id="home-mediators-title" className="text-balance text-page text-paper lg:col-span-7">
              {copy.title} <span className="text-mist">{copy.titleQuiet}</span>
            </h2>
            <div className="lg:col-span-5">
              <p className="max-w-(--measure-lead) text-pretty text-lead text-mist">{copy.lead}</p>
              <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
                <Button
                  href={withLangPrefix("/get-help?mode=mediator", lang)}
                  variant="action"
                  size="lg"
                  className="hero-focus bg-paper! text-ink-950! hover:bg-paper/90! active:bg-paper/80!"
                >
                  {copy.ask}
                </Button>
                <Link
                  href={withLangPrefix("/mediatori", lang)}
                  className="hero-focus group inline-flex min-h-11 items-center gap-1 whitespace-nowrap rounded-xl px-1 text-body font-semibold text-amber-care-border transition-colors duration-(--dur-fast) ease-(--ease-out-calm) hover:text-paper motion-reduce:transition-none"
                >
                  {copy.more}
                  <ChevronRightIcon className="h-4 w-4 shrink-0 transition-transform duration-(--dur-fast) ease-(--ease-out-calm) group-hover:translate-x-0.5 motion-reduce:transition-none" />
                </Link>
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal>
          <MediatorServices services={copy.services} />
        </Reveal>

        <div className="mt-7 overflow-hidden sm:mt-12 sm:border-t sm:border-paper/12 sm:pt-6 lg:mt-14">
          <ul className="flex flex-col gap-y-2 text-body font-semibold text-paper sm:-ml-3.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-y-2.5">
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
