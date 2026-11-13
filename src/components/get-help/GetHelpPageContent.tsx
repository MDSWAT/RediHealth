"use client";

import { useState, type CSSProperties } from "react";
import { EmergencyDialerGate } from "@/components/emergency/EmergencyDialerGate";
import { Container } from "@/components/ui/Container";
import { RequestHelpForm } from "@/components/get-help/RequestHelpForm";
import { PhoneIcon } from "@/components/ui/icons";
import { useLanguage } from "@/lib/i18n/language-context";
import type { Lang } from "@/lib/i18n/translations";
import type { CountryCode } from "@/lib/countries";

const CALL_112: Record<Lang, string> = {
  ro: "Sună la 112",
  en: "Call 112",
  sq: "Telefono 112",
  it: "Chiama il 112",
  hr: "Nazovi 112",
  rom: "Akhar ko 112",
  ru: "Позвонить на 112",
};

export function GetHelpPageContent({
  countries,
  initialCountry,
}: {
  countries: CountryCode[];
  initialCountry: CountryCode | null;
}) {
  const { t, lang } = useLanguage();
  const [dialerOpen, setDialerOpen] = useState(false);
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
                  <button
                    type="button"
                    onClick={() => setDialerOpen(true)}
                    className="press-solid mt-3 inline-flex min-h-11 max-w-full items-center justify-center whitespace-nowrap rounded-lg bg-primary px-4 text-sm font-semibold text-white transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] motion-reduce:transition-none hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <span className="min-w-0 truncate">{CALL_112[lang]}</span>
                  </button>
                </div>
              </div>

              <div>
                <h2 className="text-base font-semibold text-foreground">{page.sidebar.whatsNextTitle}</h2>
                {/* The steps read as one path: a hairline joins the numbers, and the steps arrive in order. */}
                <ol className="mt-4">
                  {page.sidebar.steps.map((step, index) => (
                    <li
                      key={step}
                      className="list-in relative flex items-start gap-3 pb-4 text-sm leading-relaxed text-muted-foreground last:pb-0"
                      style={{ "--i": index } as CSSProperties}
                    >
                      {index < page.sidebar.steps.length - 1 ? (
                        <span aria-hidden="true" className="absolute bottom-0 left-3 top-7 w-px bg-border" />
                      ) : null}
                      <span
                        aria-hidden="true"
                        className="relative inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-sapphire-soft text-xs font-semibold tabular-nums text-sapphire"
                      >
                        {index + 1}
                      </span>
                      <span className="pt-px">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </aside>
          </div>
        </Container>
      </section>
      <EmergencyDialerGate open={dialerOpen} onOpenChange={setDialerOpen} />
    </main>
  );
}
