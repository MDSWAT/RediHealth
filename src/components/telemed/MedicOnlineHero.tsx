"use client";

import { useState } from "react";
import Link from "next/link";
import { CalendarIcon, CheckIcon, GlobeIcon, PhoneIcon, PinIcon, ShieldIcon, VolumeIcon } from "@/components/ui/icons";
import { Container } from "@/components/ui/Container";
import { DUTY_HOURS, useOnCallStatus } from "./OnCallStatusBanner";
import { findHelpHref, findHelpLinks } from "@/lib/i18n/find-help-links";
import { playSoundCheck } from "./sound-check";
import { useLanguage } from "@/lib/i18n/language-context";
import { withLangPrefix } from "@/lib/i18n/routing";
import { translations, type Lang } from "@/lib/i18n/translations";

function useSafeLanguage() {
  try {
    return useLanguage();
  } catch {
    return { lang: "ro" as Lang, t: translations.ro, setLang: () => {} };
  }
}

type HeroFeatureCopy = {
  soundTest: string;
  soundOk: string;
  freeTitle: string;
  freeDesc: string;
  browserTitle: string;
  browserDesc: string;
  smsTitle: string;
  smsDesc: string;
  free: string;
  browser: string;
  sms: string;
  onDuty: string;
  offDutyTitle: string;
  offDuty: string;
  offDutyAction: string;
};

const heroCopy: Record<Lang, HeroFeatureCopy> = {
  ro: {
    soundTest: "Testează sunetul",
    soundOk: "Sunetul funcționează",
    freeTitle: "Gratuit pentru oricine",
    freeDesc: "Fără card de sănătate, cont sau abonament",
    browserTitle: "Se deschide în browser",
    browserDesc: "Funcționează pe orice telefon, fără aplicație",
    smsTitle: "Confirmare prin SMS",
    smsDesc: "Primești linkul de consult și recomandările prin mesaj",
    free: "Gratuit, pentru oricine",
    browser: "Se deschide în browserul telefonului. Nu ai nevoie de cont sau aplicație.",
    sms: "Primești prin SMS confirmarea și linkul",
    onDuty: `Disponibil acum · zilnic, ${DUTY_HOURS}`,
    offDutyTitle: "Sala de așteptare se deschide la 08:00",
    offDuty: "Este deschisă în fiecare zi, până la 20:00.",
    offDutyAction: "Vezi ce să pregătești",
  },
  en: {
    soundTest: "Test sound",
    soundOk: "Sound works",
    freeTitle: "Free for anyone",
    freeDesc: "No card, account or insurance required",
    browserTitle: "Opens in your browser",
    browserDesc: "Works directly on any phone without an app",
    smsTitle: "Text message confirmation",
    smsDesc: "Receive your call link and advice by SMS",
    free: "Free, for anyone",
    browser: "Opens in your phone's browser. No account or app needed.",
    sms: "You get the confirmation and the link by text message",
    onDuty: `Available now · every day, ${DUTY_HOURS}`,
    offDutyTitle: "The waiting room opens at 08:00",
    offDuty: "It is open every day until 20:00.",
    offDutyAction: "See what to get ready",
  },
  sq: {
    soundTest: "Provo zërin",
    soundOk: "Zëri punon",
    freeTitle: "Falas për këdo",
    freeDesc: "Pa pagesë, kartë shëndetësore apo llogari",
    browserTitle: "Hapet në shfletues",
    browserDesc: "Punon në çdo telefon pa instaluar aplikacion",
    smsTitle: "Konfirmim me SMS",
    smsDesc: "Lidhjen e takimit dhe këshillat i merr me mesazh",
    free: "Falas, për këdo",
    browser: "Hapet në shfletuesin e telefonit. Nuk të duhet llogari apo aplikacion.",
    sms: "Konfirmimin dhe lidhjen i merr me SMS",
    onDuty: `Në dispozicion tani · çdo ditë, ${DUTY_HOURS}`,
    offDutyTitle: "Dhoma e pritjes hapet në 08:00",
    offDuty: "Është e hapur çdo ditë deri në 20:00.",
    offDutyAction: "Shiko çfarë të përgatitësh",
  },
  it: {
    soundTest: "Prova l'audio",
    soundOk: "L'audio funciona",
    freeTitle: "Gratuito per tutti",
    freeDesc: "Senza costi, tessera sanitaria né abbonamento",
    browserTitle: "Si apre nel browser",
    browserDesc: "Funziona su qualsiasi telefono senza app",
    smsTitle: "Conferma via SMS",
    smsDesc: "Ricevi il link della visita e il promemoria via messaggio",
    free: "Gratis, per tutti",
    browser: "Si apre nel browser del telefono. Non ti servono account o app.",
    sms: "Ricevi conferma e link via SMS",
    onDuty: `Disponibile ora · tutti i giorni, ${DUTY_HOURS}`,
    offDutyTitle: "La sala d'attesa apre alle 08:00",
    offDuty: "È aperta tutti i giorni fino alle 20:00.",
    offDutyAction: "Vedi cosa preparare",
  },
};

const primaryLink =
  "inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

/**
 * Doctor online: the two ways to talk to a doctor on one surface, then the pharmacy as a
 * hairline row of the same surface. The on-call status lives in the on-call cell itself
 * (a static dot and one line when on duty; off duty the cell title gives the opening time),
 * so no separate banner repeats it.
 */
export function MedicOnlineHero() {
  const { lang, t } = useSafeLanguage();
  const mp = t.medicOnlinePage;
  const c = heroCopy[lang] ?? heroCopy.ro;
  const findHelp = findHelpLinks(lang);
  const [soundChecked, setSoundChecked] = useState(false);
  // Outside duty hours the booking is the useful action, so it takes the primary style.
  const { isOnDuty } = useOnCallStatus();
  const primaryStyle = "bg-sapphire text-white hover:bg-sapphire-light";
  const secondaryStyle = "border border-border bg-background text-foreground hover:bg-muted";

  return (
    <section className="border-b border-border bg-background py-10 sm:py-16">
      <Container>
        <div className="max-w-3xl">
          <h1 className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl">{mp.heroTitle}</h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">{mp.heroSubtitle}</p>
        </div>

        {/* The two ways in share one surface, split by a hairline: no row of look-alike cards. */}
        <div className="mt-8 divide-y divide-border rounded-xl border border-border bg-card">
          <div className="grid grid-cols-1 divide-y divide-border md:grid-cols-2 md:divide-x md:divide-y-0">
            <div className="flex flex-col p-6">
              {isOnDuty && (
                <p role="status" className="mb-3 flex items-center gap-2 text-sm text-muted-foreground tabular-nums">
                  <span aria-hidden="true" className="inline-block h-2 w-2 shrink-0 rounded-full bg-live-sage" />
                  {c.onDuty}
                </p>
              )}
              <h2 className="flex items-center gap-2.5 text-lg font-semibold text-foreground tabular-nums">
                <PhoneIcon className="h-5 w-5 shrink-0 text-sapphire dark:text-sapphire-border" />
                {isOnDuty ? mp.cardOnCallTitle : c.offDutyTitle}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground tabular-nums">{isOnDuty ? mp.cardOnCallSubtitle : c.offDuty}</p>
              <div className="mt-auto flex flex-wrap items-center gap-3 pt-6">
                <Link href={withLangPrefix("/medic-online/asteptare", lang)} className={`${primaryLink} flex-1 ${isOnDuty ? primaryStyle : secondaryStyle}`}>
                  {isOnDuty ? mp.cardOnCallAction : c.offDutyAction}
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    playSoundCheck();
                    setSoundChecked(true);
                  }}
                  className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-muted-foreground transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {soundChecked ? <CheckIcon className="h-4 w-4 text-sapphire dark:text-sapphire-border" /> : <VolumeIcon className="h-4 w-4" />}
                  <span aria-live="polite">{soundChecked ? c.soundOk : c.soundTest}</span>
                </button>
              </div>
            </div>

            <div className="flex flex-col p-6">
              <h2 className="flex items-center gap-2.5 text-lg font-semibold text-foreground">
                <CalendarIcon className="h-5 w-5 shrink-0 text-sapphire dark:text-sapphire-border" />
                {mp.cardBookingTitle}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{mp.cardBookingSubtitle}</p>
              <div className="mt-auto pt-6">
                <Link
                  href={withLangPrefix("/medic-online/programare", lang)}
                  className={`${primaryLink} w-full ${isOnDuty ? secondaryStyle : primaryStyle}`}
                >
                  {mp.cardBookingAction}
                </Link>
              </div>
            </div>
          </div>

          {/* Many questions do not need a doctor: the pharmacy, as a quiet row of the same surface. */}
          <div className="flex flex-col gap-2 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-base font-semibold text-foreground">{findHelp.noDoctorNeeded}</p>
              <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">{findHelp.pharmacyFirstHint}</p>
            </div>
            <Link
              href={withLangPrefix(findHelpHref("pharmacy"), lang)}
              className="group -mx-2 inline-flex min-h-[44px] shrink-0 items-center gap-2 self-start rounded-lg px-2 text-sm font-semibold text-sapphire transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:text-sapphire-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:text-sapphire-border sm:self-auto"
            >
              <PinIcon className="h-4 w-4" aria-hidden="true" />
              <span className="underline-offset-4 group-hover:underline">{findHelp.nearestPharmacy}</span>
            </Link>
          </div>
        </div>

        <ul className="mt-8 grid grid-cols-1 gap-3.5 border-t border-border pt-6 sm:grid-cols-3 sm:gap-4">
          <li className="flex items-center gap-3.5 rounded-xl border border-border/70 bg-card p-3.5 shadow-2xs sm:p-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sapphire/10 text-sapphire dark:bg-sapphire-soft/10 dark:text-sapphire-border">
              <ShieldIcon className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold leading-tight text-foreground">{c.freeTitle}</p>
              <p className="mt-0.5 text-xs text-muted-foreground leading-normal text-pretty">{c.freeDesc}</p>
            </div>
          </li>
          <li className="flex items-center gap-3.5 rounded-xl border border-border/70 bg-card p-3.5 shadow-2xs sm:p-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sapphire/10 text-sapphire dark:bg-sapphire-soft/10 dark:text-sapphire-border">
              <GlobeIcon className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold leading-tight text-foreground">{c.browserTitle}</p>
              <p className="mt-0.5 text-xs text-muted-foreground leading-normal text-pretty">{c.browserDesc}</p>
            </div>
          </li>
          <li className="flex items-center gap-3.5 rounded-xl border border-border/70 bg-card p-3.5 shadow-2xs sm:p-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sapphire/10 text-sapphire dark:bg-sapphire-soft/10 dark:text-sapphire-border">
              <PhoneIcon className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold leading-tight text-foreground">{c.smsTitle}</p>
              <p className="mt-0.5 text-xs text-muted-foreground leading-normal text-pretty">{c.smsDesc}</p>
            </div>
          </li>
        </ul>
      </Container>
    </section>
  );
}
