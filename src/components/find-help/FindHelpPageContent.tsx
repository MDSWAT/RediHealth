"use client";

import Link from "next/link";
import { ArrowRightIcon } from "@/components/ui/icons";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { AssistantNavigation } from "@/components/health-assistant/AssistantNavigation";
import { FindHelpExplorer } from "@/components/find-help/FindHelpExplorer";
import { findHelpTranslations } from "@/lib/i18n/find-help-translations";
import { useLanguage } from "@/lib/i18n/language-context";
import { withLangPrefix } from "@/lib/i18n/routing";
import type { CountryCode, InstituteCategory } from "@/lib/medical-institutes";

export function FindHelpPageContent({
  initialCountry,
  initialCategory = null,
  detectedIpCountry = null,
}: {
  initialCountry: CountryCode;
  initialCategory?: InstituteCategory | null;
  detectedIpCountry?: CountryCode | null;
}) {
  const { lang, t } = useLanguage();
  const basePage = findHelpTranslations[lang].page;
  const page = t?.findHelpPage ? { ...basePage, ...t.findHelpPage } : basePage;

  return (
    <main id="main-content" className="flex-1">
      <section className="pt-2 pb-6 sm:pt-3 sm:pb-10">
        <Container>
          <AssistantNavigation />
          <FindHelpExplorer
            initialCountry={initialCountry}
            initialCategory={initialCategory}
            detectedIpCountry={detectedIpCountry}
          />
        </Container>
      </section>

      <section className="border-t border-border bg-muted/40 py-10 sm:py-12">
        <Container>
          {/* Below the finder: the two next-step cards arrive one after the other as they scroll in. */}
          <Reveal stagger="editorial" className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {/* Community Health Mediator Guidance Card (amber-care) */}
            <div className="flex flex-col justify-between gap-5 rounded-xl border border-amber-care-border bg-amber-care-soft/55 p-6 dark:border-amber-care/40 dark:bg-amber-care/10 sm:p-7">
              <div>
                <h2 className="text-balance text-xl font-semibold tracking-tight text-foreground">
                  {basePage.mediatorTitle}
                </h2>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
                  {basePage.mediatorBody}
                </p>
              </div>
              <div>
                <Link
                  href={withLangPrefix("/mediatori", lang)}
                  className="group press-row inline-flex min-h-12 items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-amber-care/35 bg-card px-4 py-2.5 text-sm font-semibold text-foreground transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-amber-care-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 motion-reduce:transition-none dark:hover:bg-amber-care/20"
                >
                  <span>{basePage.mediatorButton}</span>
                  <ArrowRightIcon className="arrow-travel h-4 w-4 shrink-0" aria-hidden="true" />
                </Link>
              </div>
            </div>

            {/* General Care Navigation CTA */}
            <div className="flex flex-col justify-between gap-5 rounded-xl border border-border bg-card p-6 sm:p-7">
              <div>
                <h2 className="text-balance text-xl font-semibold tracking-tight text-foreground">{page.ctaTitle}</h2>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
                  {page.ctaBody}
                </p>
              </div>
              <div>
                <Link
                  href={withLangPrefix("/get-help", lang)}
                  className="group press-row inline-flex min-h-12 items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-border-control bg-card px-4 py-2.5 text-sm font-semibold text-foreground transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 motion-reduce:transition-none"
                >
                  <span>{page.ctaButton}</span>
                  <ArrowRightIcon className="arrow-travel h-4 w-4 shrink-0" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </Reveal>
        </Container>
      </section>
    </main>
  );
}
