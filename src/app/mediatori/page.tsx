import type { Metadata } from "next";
import Link from "next/link";
import { MediatorCallbackStarter } from "@/components/mediator/MediatorCallbackStarter";
import { MediatorPublicHero } from "@/components/mediator/MediatorPublicHero";
import {
  mediatorPageCopy,
  mediatorPageDescriptions,
  mediatorStaffStripCopy,
} from "@/components/mediator/mediator-page-copy";
import { Container } from "@/components/ui/Container";
import { ArrowRightIcon, FileTextIcon, LockIcon, ShieldIcon, UsersIcon } from "@/components/ui/icons";
import { Reveal } from "@/components/ui/Reveal";
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

      <section
        id="solicita"
        aria-labelledby="solicita-heading"
        className="scroll-mt-20 border-b border-border bg-muted/35 py-10 sm:py-16"
      >
        <Container>
          <MediatorCallbackStarter lang={lang} country={initialCountry} />
        </Container>
      </section>

      <section className="border-t border-border bg-background py-12 sm:py-16">
        <Container>
          <div className="grid items-start gap-8 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-5">
              <span aria-hidden="true" className="block h-0.5 w-10 bg-ink-950 dark:bg-paper" />
              <h2 className="mt-4 text-balance text-section font-semibold text-foreground">{pageCopy.whoIsTitle}</h2>
              <p className="mt-3 max-w-(--measure-reading) text-pretty text-body leading-relaxed text-muted-foreground">
                {pageCopy.whoIsDesc}
              </p>
            </div>

            <div className="lg:col-span-7">
              <Reveal as="ul" stagger="ui" className="grid gap-4 sm:grid-cols-2">
                {pageCopy.bullets.map((bullet, index) => {
                  const icons = [LockIcon, ShieldIcon, FileTextIcon, UsersIcon];
                  const Icon = icons[index % icons.length];
                  return (
                    <li
                      key={bullet}
                      className="flex flex-col gap-3.5 rounded-2xl border border-border bg-card p-5 shadow-2xs sm:p-6 dark:border-white/10 dark:bg-ink-900"
                    >
                      <span
                        aria-hidden="true"
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-surface-subtle text-foreground dark:border-white/12 dark:bg-white/[0.06] dark:text-paper"
                      >
                        <Icon className="h-4.5 w-4.5" />
                      </span>
                      <p className="text-pretty text-body font-medium leading-snug text-foreground dark:text-paper">
                        {bullet}
                      </p>
                    </li>
                  );
                })}
              </Reveal>
            </div>
          </div>
        </Container>
      </section>

      <section className="border-t border-border bg-muted/30 py-8 sm:py-10" aria-label={staffStrip.regionLabel}>
        <Container>
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card px-5 py-4 shadow-2xs sm:px-7 sm:py-5 dark:border-white/10 dark:bg-ink-900">
            <p className="text-body font-medium text-foreground dark:text-paper">{staffStrip.prompt}</p>
            <Link
              href={withLangPrefix("/sign-in", lang)}
              className="press-row group inline-flex min-h-11 items-center gap-2 whitespace-nowrap rounded-xl border border-border-control bg-background px-4 py-2 text-body font-semibold text-foreground transition-colors duration-(--dur-fast) ease-(--ease-out-calm) hover:border-foreground/40 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:border-white/16 dark:bg-white/[0.06] dark:text-paper dark:hover:bg-white/[0.12]"
            >
              <span>{staffStrip.signIn}</span>
              <ArrowRightIcon className="arrow-travel h-4 w-4 shrink-0" aria-hidden="true" />
            </Link>
          </div>
        </Container>
      </section>
    </main>
  );
}
