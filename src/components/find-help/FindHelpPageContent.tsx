"use client";

import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { FindHelpExplorer } from "@/components/find-help/FindHelpExplorer";
import { HandHelpingIcon, PhoneIcon } from "@/components/ui/icons";
import { useLanguage } from "@/lib/i18n/language-context";

export function FindHelpPageContent() {
  const { t } = useLanguage();
  const page = t.findHelpPage;

  return (
    <main id="main-content" className="flex-1">
      <section className="border-b border-border bg-muted/40 py-16 sm:py-20">
        <Container>
          <Reveal className="max-w-2xl">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-soft text-primary">
              <HandHelpingIcon className="h-6 w-6" />
            </span>
            <h1 className="mt-5 text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              {page.heroTitle}
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
              {page.heroParagraph}
            </p>
          </Reveal>
        </Container>
      </section>

      <section className="py-16 sm:py-20">
        <Container>
          <FindHelpExplorer />
        </Container>
      </section>

      <section className="border-t border-border bg-primary-soft py-12">
        <Container>
          <Reveal className="flex flex-col items-start gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <span className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-primary text-white">
                <PhoneIcon className="h-6 w-6" />
              </span>
              <div>
                <h2 className="text-base font-semibold text-foreground">
                  {page.ctaTitle}
                </h2>
                <p className="mt-1 max-w-xl text-base leading-relaxed text-foreground/80">
                  {page.ctaBody}
                </p>
              </div>
            </div>
            <Button href="/get-help" size="lg">
              {page.ctaButton}
            </Button>
          </Reveal>
        </Container>
      </section>
    </main>
  );
}
