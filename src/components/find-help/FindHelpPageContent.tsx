"use client";

import { ArrowRightIcon } from "@/components/ui/icons";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { AssistantNavigation, AssistantOtherTools } from "@/components/health-assistant/AssistantNavigation";
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
        <Container className="max-sm:px-3.5">
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {/* Community Health Mediator Guidance Card (amber-care) */}
            <div className="flex flex-col justify-between gap-5 rounded-xl border border-amber-care-border bg-amber-care-soft/55 p-4 dark:border-amber-care/40 dark:bg-amber-care/10 sm:p-7">
              <div>
                <h2 className="text-balance text-section font-semibold text-foreground">
                  {basePage.mediatorTitle}
                </h2>
                <p className="mt-1.5 text-body text-muted-foreground">
                  {basePage.mediatorBody}
                </p>
              </div>
              <div>
                <Button
                  href={withLangPrefix("/mediatori", lang)}
                  variant="outline"
                  size="lg"
                  className="border-amber-care/35 hover:bg-amber-care-soft dark:hover:bg-amber-care/20"
                >
                  <span>{basePage.mediatorButton}</span>
                  <ArrowRightIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
                </Button>
              </div>
            </div>

            {/* General Care Navigation CTA */}
            <div className="flex flex-col justify-between gap-5 rounded-xl border border-border bg-card p-4 sm:p-7">
              <div>
                <h2 className="text-balance text-section font-semibold text-foreground">{page.ctaTitle}</h2>
                <p className="mt-1.5 text-body text-muted-foreground">
                  {page.ctaBody}
                </p>
              </div>
              <div>
                <Button
                  href={withLangPrefix("/get-help", lang)}
                  variant="outline"
                  size="lg"
                >
                  <span>{page.ctaButton}</span>
                  <ArrowRightIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
                </Button>
              </div>
            </div>
          </div>

          <AssistantOtherTools />
        </Container>
      </section>
    </main>
  );
}
