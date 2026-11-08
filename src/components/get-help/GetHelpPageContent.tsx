"use client";

import { Container } from "@/components/ui/Container";
import { RequestHelpForm } from "@/components/get-help/RequestHelpForm";
import { PhoneIcon } from "@/components/ui/icons";
import { useLanguage } from "@/lib/i18n/language-context";
import type { CountryCode } from "@/lib/countries";

export function GetHelpPageContent({
  countries,
  initialCountry,
}: {
  countries: CountryCode[];
  initialCountry: CountryCode | null;
}) {
  const { t } = useLanguage();
  const page = t.getHelpPage;

  return (
    <main id="main-content" className="flex-1">
      <section className="border-b border-border bg-muted/40 py-10 sm:py-14">
        <Container>
          <div className="max-w-2xl">
            <h1 className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {page.heroTitle}
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{page.heroParagraph}</p>
          </div>
        </Container>
      </section>

      <section className="py-10 sm:py-14">
        <Container>
          <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr] lg:gap-14">
            <RequestHelpForm countries={countries} initialCountry={initialCountry} />

            {/* Shorter than the form, so it stays in view on desktop instead of leaving an empty column. */}
            <aside className="space-y-8 lg:sticky lg:top-[calc(var(--chrome-h,0px)+1.5rem)] lg:self-start lg:pt-2">
              <div className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary-soft p-5">
                <PhoneIcon className="mt-0.5 h-5 w-5 flex-none text-primary" aria-hidden="true" />
                <div>
                  <h2 className="text-base font-semibold text-foreground">{page.sidebar.emergencyTitle}</h2>
                  <p className="mt-1 text-sm leading-relaxed text-foreground/80">{page.sidebar.emergencyBody}</p>
                </div>
              </div>

              <div>
                <h2 className="text-base font-semibold text-foreground">{page.sidebar.whatsNextTitle}</h2>
                <ol className="mt-4 space-y-3 border-l border-border pl-5">
                  {page.sidebar.steps.map((step) => (
                    <li key={step} className="relative text-sm leading-relaxed text-muted-foreground">
                      <span
                        aria-hidden="true"
                        className="absolute -left-[1.5625rem] top-[0.45rem] h-2 w-2 rounded-full bg-border ring-4 ring-background"
                      />
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            </aside>
          </div>
        </Container>
      </section>
    </main>
  );
}
