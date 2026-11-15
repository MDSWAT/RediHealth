"use client";

import { useState } from "react";
import { EmergencyDialerGate } from "@/components/emergency/EmergencyDialerGate";
import { useReadAloud } from "@/components/health-check/readingTools";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { ListenButton } from "@/components/ui/ListenButton";
import { PageHeader } from "@/components/ui/PageHeader";
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
  mode,
}: {
  countries: CountryCode[];
  initialCountry: CountryCode | null;
  mode?: "mediator";
}) {
  const { t, lang } = useLanguage();
  const [dialerOpen, setDialerOpen] = useState(false);
  const voice = useReadAloud(lang);
  const page = t.getHelpPage;
  const heroTitle = mode === "mediator" ? page.mediatorHeroTitle : page.heroTitle;
  const heroLead = mode === "mediator" ? page.mediatorHeroParagraph : page.heroParagraph;

  return (
    <main id="main-content" className="flex-1 pb-12 sm:pb-16">
      <Container>
        <PageHeader
          title={heroTitle}
          lead={heroLead}
          below={
            <p className="mt-3 max-w-(--measure-lead) text-pretty text-body text-foreground">
              {page.whatHappensSummary}
            </p>
          }
          actions={
            voice.available ? (
              <ListenButton
                uiLang={lang}
                isPlaying={voice.speaking}
                onToggle={() =>
                  voice.speaking
                    ? voice.stop()
                    : voice.speak([
                        heroTitle,
                        heroLead,
                        page.whatHappensSummary,
                        page.form.descriptionLabel,
                        page.form.descriptionHint,
                        page.form.phoneLabel,
                        page.form.privacyNote,
                      ])
                }
              />
            ) : undefined
          }
        />

        <div className="mt-5 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:gap-14">
          <div className="min-w-0">
            <RequestHelpForm countries={countries} initialCountry={initialCountry} />
          </div>

          {/* Shorter than the form, so it stays in view on desktop instead of leaving an empty column. */}
          <aside className="min-w-0 lg:sticky lg:top-[calc(var(--chrome-h,0px)+1.5rem)] lg:self-start lg:pt-2">
            <div className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary-soft p-5">
              <PhoneIcon className="mt-0.5 h-5 w-5 flex-none text-primary" aria-hidden="true" />
              <div>
                <h2 className="text-body font-semibold text-foreground">{page.sidebar.emergencyTitle}</h2>
                <p className="mt-1 text-body text-foreground/80">{page.sidebar.emergencyBody}</p>
                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  onClick={() => setDialerOpen(true)}
                  className="mt-3"
                >
                  <span className="tabular-nums">{CALL_112[lang]}</span>
                </Button>
              </div>
            </div>
          </aside>
        </div>
      </Container>

      <EmergencyDialerGate open={dialerOpen} onOpenChange={setDialerOpen} />
    </main>
  );
}
