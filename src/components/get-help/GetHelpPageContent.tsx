"use client";

import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { RequestHelpForm } from "@/components/get-help/RequestHelpForm";
import { HandHelpingIcon, PhoneIcon } from "@/components/ui/icons";
import { useLanguage } from "@/lib/i18n/language-context";

export function GetHelpPageContent() {
  const { t } = useLanguage();
  const page = t.getHelpPage;

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
          <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr] lg:gap-16">
            <Reveal>
              <RequestHelpForm />
            </Reveal>

            <Reveal delay={150} className="lg:pt-2">
              <aside>
                <div className="hover-lift rounded-xl border border-primary/20 bg-primary-soft p-6">
                  <div className="flex items-start gap-3">
                    <span className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-primary text-white">
                      <PhoneIcon className="h-6 w-6" />
                    </span>
                    <div>
                      <h2 className="text-base font-semibold text-foreground">
                        {page.sidebar.emergencyTitle}
                      </h2>
                      <p className="mt-1 text-sm leading-relaxed text-foreground/80">
                        {page.sidebar.emergencyBody}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="hover-lift mt-6 rounded-xl border border-border bg-card p-6">
                  <h2 className="text-base font-semibold text-foreground">
                    {page.sidebar.whatsNextTitle}
                  </h2>
                  <ol className="mt-4 space-y-4">
                    {page.sidebar.steps.map((step, index) => (
                      <li key={step} className="flex items-start gap-3">
                        <span className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-primary-soft text-sm font-semibold text-primary">
                          {index + 1}
                        </span>
                        <span className="text-sm leading-relaxed text-muted-foreground">
                          {step}
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>
              </aside>
            </Reveal>
          </div>
        </Container>
      </section>
    </main>
  );
}
