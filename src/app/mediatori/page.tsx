import type { Metadata } from "next";
import Link from "next/link";
import { MediatorAccompanimentTimeline } from "@/components/mediator/MediatorAccompanimentTimeline";
import { MediatorCallbackStarter } from "@/components/mediator/MediatorCallbackStarter";
import { MediatorPublicHero } from "@/components/mediator/MediatorPublicHero";
import {
  mediatorPageCopy,
  mediatorPageDescriptions,
  mediatorStaffStripCopy,
} from "@/components/mediator/mediator-page-copy";
import { Container } from "@/components/ui/Container";
import type { CountryCode } from "@/lib/countries";
import { configuredCountries } from "@/lib/database";
import { localizedPageTitle } from "@/lib/i18n/page-metadata";
import { getRequestLang, withLangPrefix } from "@/lib/i18n/server-routing";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getRequestLang();

  return {
    title: localizedPageTitle(lang, "mediatori", "Community health mediators - RediHealth"),
    description: mediatorPageDescriptions[lang] ?? mediatorPageDescriptions.en,
  };
}

export default async function MediatoriPublicPage() {
  const lang = await getRequestLang();
  const pageCopy = mediatorPageCopy[lang] ?? mediatorPageCopy.en;
  const staffStrip = mediatorStaffStripCopy[lang] ?? mediatorStaffStripCopy.ro;
  const availableCountries = configuredCountries();
  const initialCountry: CountryCode =
    availableCountries.length === 0 || availableCountries.includes("RO") ? "RO" : availableCountries[0];

  return (
    <main id="main-content" className="flex-1 bg-background">
      <MediatorPublicHero lang={lang} />

      <MediatorAccompanimentTimeline lang={lang} />

      <section className="border-t border-border py-10 sm:py-16">
        <Container>
          <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
            <div className="max-w-2xl">
              <h2 className="text-section font-semibold text-foreground">{pageCopy.whoIsTitle}</h2>
              <p className="mt-3 max-w-(--measure-reading) text-body text-muted-foreground">{pageCopy.whoIsDesc}</p>
            </div>
            {/* Plain hairline-separated rows instead of decorative check marks. */}
            <div className="lg:pt-12">
              <ul className="divide-y divide-border border-y border-border text-body text-foreground">
                {pageCopy.bullets.map((bullet) => (
                  <li key={bullet} className="py-3.5">
                    {bullet}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Container>
      </section>

      <section
        id="solicita"
        aria-labelledby="solicita-heading"
        className="scroll-mt-20 border-t border-border bg-muted/35 py-10 sm:py-16"
      >
        <Container>
          <MediatorCallbackStarter lang={lang} country={initialCountry} />
        </Container>
      </section>

      <section className="border-t border-border bg-background py-6" aria-label={staffStrip.regionLabel}>
        <Container>
          <div className="flex flex-wrap items-center justify-between gap-3 text-body text-muted-foreground">
            <p>{staffStrip.prompt}</p>
            <Link
              href={withLangPrefix("/sign-in", lang)}
              className="inline-flex min-h-11 items-center whitespace-nowrap rounded-sm font-medium text-sapphire underline decoration-sapphire/40 underline-offset-4 transition-colors duration-(--dur-fast) ease-(--ease-out-calm) hover:text-sapphire-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:text-sapphire-border dark:decoration-sapphire-border/40"
            >
              {staffStrip.signIn}
            </Link>
          </div>
        </Container>
      </section>
    </main>
  );
}
