"use client";

import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { FindHelpExplorer } from "@/components/find-help/FindHelpExplorer";
import { useLanguage } from "@/lib/i18n/language-context";
import { withLangPrefix } from "@/lib/i18n/routing";
import type { CountryCode, InstituteCategory } from "@/lib/medical-institutes";

export function FindHelpPageContent({
  initialCountry,
  initialCategory = null,
}: {
  initialCountry: CountryCode;
  initialCategory?: InstituteCategory | null;
}) {
  const { lang, t } = useLanguage();
  const page = t.findHelpPage;

  return (
    <main id="main-content" className="flex-1">
      <section className="py-10 sm:py-16">
        <Container>
          <FindHelpExplorer initialCountry={initialCountry} initialCategory={initialCategory} />
        </Container>
      </section>

      <section className="border-t border-border bg-muted/40 py-10 sm:py-12">
        <Container>
          <div className="flex flex-col items-start gap-5 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
            <div className="max-w-2xl">
              <h2 className="text-lg font-semibold text-foreground">{page.ctaTitle}</h2>
              <p className="mt-1 text-base leading-relaxed text-muted-foreground">{page.ctaBody}</p>
            </div>
            <Button href={withLangPrefix("/get-help", lang)} size="lg" className="shrink-0">
              {page.ctaButton}
            </Button>
          </div>
        </Container>
      </section>
    </main>
  );
}
