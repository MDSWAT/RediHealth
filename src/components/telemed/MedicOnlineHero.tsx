"use client";

import { useState } from "react";
import Link from "next/link";
import { useReadAloud } from "@/components/health-check/readingTools";
import { CheckIcon, PinIcon, VolumeIcon } from "@/components/ui/icons";
import { Container } from "@/components/ui/Container";
import { DUTY_HOURS, useOnCallStatus } from "./OnCallStatusBanner";
import { findHelpHref, findHelpLinks } from "@/lib/i18n/find-help-links";
import { playSoundCheck } from "./sound-check";
import { useLanguage } from "@/lib/i18n/language-context";
import { withLangPrefix } from "@/lib/i18n/routing";
import { HEALTH_DETAIL_SHARED_STRINGS } from "@/lib/i18n/health-myths";
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

export const heroCopy: Record<Lang, HeroFeatureCopy> = {
  ru: {
    soundTest: "Проверить звук",
    soundOk: "Звук работает",
    freeTitle: "Бесплатно для всех",
    freeDesc: "Без полиса, аккаунта и оплаты.",
    browserTitle: "Открывается в браузере",
    browserDesc: "Работает в браузере на любом телефоне",
    smsTitle: "Подтверждение по SMS",
    smsDesc: "Ссылка на звонок и советы придут по SMS",
    free: "Бесплатно для всех",
    browser: "Открывается в браузере телефона. Приложение и аккаунт не нужны.",
    sms: "Подтверждение и ссылка придут в SMS.",
    onDuty: `Доступно сейчас, каждый день, ${DUTY_HOURS}`,
    offDutyTitle: "Зал ожидания открывается в 08:00",
    offDuty: "Открыт каждый день до 20:00.",
    offDutyAction: "Что подготовить",
  },

  ro: {
    soundTest: "Testează sunetul",
    soundOk: "Sunetul funcționează",
    freeTitle: "Gratuit pentru oricine",
    freeDesc: "Fără card de sănătate, cont sau plată",
    browserTitle: "Se deschide în browser",
    browserDesc: "Funcționează în browser, pe orice telefon",
    smsTitle: "Confirmare prin SMS",
    smsDesc: "Primești linkul de apel și sfaturile prin SMS",
    free: "Gratuit, pentru oricine",
    browser: "Se deschide în browserul telefonului. Nu ai nevoie de cont sau aplicație.",
    sms: "Primești prin SMS confirmarea și linkul",
    onDuty: `Disponibil acum, zilnic, ${DUTY_HOURS}`,
    offDutyTitle: "Sala de așteptare se deschide la 08:00",
    offDuty: "Deschisă zilnic până la 20:00.",
    offDutyAction: "Vezi ce să pregătești",
  },
  en: {
    soundTest: "Test sound",
    soundOk: "Sound works",
    freeTitle: "Free for anyone",
    freeDesc: "No card, account or payment needed",
    browserTitle: "Opens in your browser",
    browserDesc: "Works in the browser on any phone",
    smsTitle: "Text message confirmation",
    smsDesc: "Get your call link and advice by SMS",
    free: "Free, for anyone",
    browser: "Opens in your phone's browser. No account or app needed.",
    sms: "You get the confirmation and the link by text message",
    onDuty: `Available now, every day, ${DUTY_HOURS}`,
    offDutyTitle: "The waiting room opens at 08:00",
    offDuty: "Open every day until 20:00.",
    offDutyAction: "See what to get ready",
  },
  sq: {
    soundTest: "Provo zërin",
    soundOk: "Zëri punon",
    freeTitle: "Falas për këdo",
    freeDesc: "Pa pagesë, kartë shëndetësore apo llogari",
    browserTitle: "Hapet në shfletues",
    browserDesc: "Punon në shfletues në çdo telefon",
    smsTitle: "Konfirmim me SMS",
    smsDesc: "Lidhjen e thirrjes dhe këshillat i merr me SMS",
    free: "Falas, për këdo",
    browser: "Hapet në shfletuesin e telefonit. Nuk të duhet llogari apo aplikacion.",
    sms: "Konfirmimin dhe lidhjen i merr me SMS",
    onDuty: `Në dispozicion tani, çdo ditë, ${DUTY_HOURS}`,
    offDutyTitle: "Dhoma e pritjes hapet në 08:00",
    offDuty: "Hapur çdo ditë deri në 20:00.",
    offDutyAction: "Çfarë të përgatitësh",
  },
  it: {
    soundTest: "Prova l'audio",
    soundOk: "L'audio funziona",
    freeTitle: "Gratuito per tutti",
    freeDesc: "Senza costi, tessera sanitaria né account",
    browserTitle: "Si apre nel browser",
    browserDesc: "Funziona nel browser su qualsiasi telefono",
    smsTitle: "Conferma via SMS",
    smsDesc: "Ricevi link della visita e consigli via SMS",
    free: "Gratis, per tutti",
    browser: "Si apre nel browser del telefono. Non ti servono account o app.",
    sms: "Ricevi conferma e link via SMS",
    onDuty: `Disponibile ora, tutti i giorni, ${DUTY_HOURS}`,
    offDutyTitle: "La sala d'attesa apre alle 08:00",
    offDuty: "Aperta ogni giorno fino alle 20:00.",
    offDutyAction: "Vedi cosa preparare",
  },
  hr: {
    soundTest: "Isprobaj zvuk",
    soundOk: "Zvuk radi",
    freeTitle: "Besplatno za svakoga",
    freeDesc: "Bez zdravstvene iskaznice HZZO, računa ili plaćanja",
    browserTitle: "Otvara se u pregledniku",
    browserDesc: "Radi u pregledniku na svakom telefonu",
    smsTitle: "Potvrda putem SMS poruke",
    smsDesc: "Poveznicu za poziv i upute primaš SMS porukom",
    free: "Besplatno, za svakoga",
    browser: "Otvara se u pregledniku telefona. Ne trebaš račun ni aplikaciju.",
    sms: "Potvrdu i poveznicu primaš SMS porukom",
    onDuty: `Dostupno sada, svaki dan, ${DUTY_HOURS}`,
    offDutyTitle: "Čekaonica se otvara u 08:00",
    offDuty: "Otvorena svaki dan do 20:00.",
    offDutyAction: "Pogledaj što pripremiti",
  },
  rom: {
    soundTest: "Zumav o avazi",
    soundOk: "O avazi kerel buchi",
    freeTitle: "Bi lovesko vash sakon",
    freeDesc: "Bi sastipnaske kartako, kontosko vay platinipnasko",
    browserTitle: "Putrel pes and-o brauzero",
    browserDesc: "Kerel buchi and-o brauzero pe sako telefono",
    smsTitle: "Chacharipe katar SMS",
    smsDesc: "O linko vash o svato thaj e sikavimata aven katar SMS",
    free: "Bi lovesko, vash sakon",
    browser: "Putrel pes and-o brauzero e telefonesko. Na trebul konto vay aplikacia.",
    sms: "Lel o chacharipe thaj o linko katar SMS",
    onDuty: `Kathe akana, sako dives, ${DUTY_HOURS}`,
    offDutyTitle: "E azhukeripnaski soba putrel pes ko 08:00",
    offDuty: "Putardi sako dives zhi ko 20:00.",
    offDutyAction: "Dikh so te getosares",
  },
};

const primaryLink =
  "inline-flex min-h-12 max-w-full items-center justify-center gap-2 whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:px-5 sm:text-[0.9375rem]";

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
  const voice = useReadAloud(lang);
  const voiceStrings = HEALTH_DETAIL_SHARED_STRINGS.topicHero;
  const listenLabel = voiceStrings.listenGuide[lang] ?? voiceStrings.listenGuide.ro;
  const stopLabel = voiceStrings.stopAudio[lang] ?? voiceStrings.stopAudio.ro;
  // Outside duty hours the booking is the useful action, so it takes the primary style.
  const { isOnDuty } = useOnCallStatus();
  const primaryStyle = "press-solid motion-reduce:transition-none bg-sapphire text-white hover:bg-sapphire-light";
  const secondaryStyle = "press-row motion-reduce:transition-none border border-border-control bg-background text-foreground hover:bg-muted";

  return (
    <section className="border-b border-border bg-background py-10 sm:py-16">
      <Container>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-3xl">
            <h1 className="text-balance text-page text-foreground">{mp.heroTitle}</h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">{mp.heroSubtitle}</p>
          </div>
          {voice.available && (
            <button
              type="button"
              aria-pressed={voice.speaking}
              onClick={() => {
                if (voice.speaking) {
                  voice.stop();
                } else {
                  voice.speak([mp.heroTitle, mp.heroSubtitle]);
                }
              }}
              className={`press-row inline-flex min-h-11 max-w-full shrink-0 items-center gap-2 self-start whitespace-nowrap rounded-xl border px-3.5 py-2 text-sm font-semibold transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:self-end ${
                voice.speaking
                  ? "border-sapphire bg-sapphire text-white shadow-2xs"
                  : "border-sapphire/30 bg-sapphire-soft/65 text-sapphire hover:border-sapphire hover:bg-sapphire-soft"
              }`}
            >
              {voice.speaking ? (
                <span aria-hidden="true" className="block h-3 w-3 rounded-xs bg-current" />
              ) : (
                <VolumeIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
              )}
              <span className="min-w-0 truncate">{voice.speaking ? stopLabel : listenLabel}</span>
            </button>
          )}
        </div>

        {/* The two ways in share one surface, split by a hairline: no row of look-alike cards. */}
        {/* The page's one lit surface: a soft pointer light and top-edge highlight on fine pointers. */}
        <div className="mt-8 divide-y divide-border rounded-xl border border-border bg-card shadow-(--shadow-card-rest)">
          <div className="grid grid-cols-1 divide-y divide-border md:grid-cols-2 md:divide-x md:divide-y-0">
            <div className="flex flex-col p-6">
              {isOnDuty && (
                <p role="status" className="mb-3 border-l-2 border-live-sage pl-2.5 text-sm font-medium text-foreground tabular-nums">
                  {c.onDuty}
                </p>
              )}
              <h2 className="text-balance text-xl font-semibold tracking-tight text-foreground tabular-nums">
                {isOnDuty ? mp.cardOnCallTitle : c.offDutyTitle}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground tabular-nums">{isOnDuty ? mp.cardOnCallSubtitle : c.offDuty}</p>
              <div className="mt-auto flex flex-nowrap items-center gap-2.5 pt-6">
                <Link href={withLangPrefix("/medic-online/asteptare", lang)} className={`${primaryLink} min-w-0 flex-1 sm:flex-initial ${isOnDuty ? primaryStyle : secondaryStyle}`}>
                  {isOnDuty ? mp.cardOnCallAction : c.offDutyAction}
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    playSoundCheck();
                    setSoundChecked(true);
                  }}
                  aria-label={soundChecked ? c.soundOk : c.soundTest}
                  title={soundChecked ? c.soundOk : c.soundTest}
                  className={`press-row inline-flex h-12 w-12 min-h-12 min-w-12 shrink-0 items-center justify-center whitespace-nowrap rounded-lg border transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                    soundChecked
                      ? "border-sapphire bg-sapphire-soft text-sapphire dark:text-sapphire-border"
                      : "border-border-control bg-background text-foreground hover:border-sapphire/50 hover:bg-sapphire-soft/35 hover:text-sapphire"
                  }`}
                >
                  {/* The icon is the control; after the test it eases into its played state instead of snapping. */}
                  <span key={soundChecked ? "ok" : "test"} className={soundChecked ? "swap-in inline-flex" : "inline-flex"}>
                    {soundChecked ? <CheckIcon className="h-4.5 w-4.5 shrink-0" /> : <VolumeIcon className="h-4.5 w-4.5 shrink-0" />}
                  </span>
                  <span className="sr-only" aria-live="polite">
                    {soundChecked ? c.soundOk : c.soundTest}
                  </span>
                </button>
              </div>
            </div>

            <div className="flex flex-col p-6">
              <h2 className="text-balance text-xl font-semibold tracking-tight text-foreground">
                {mp.cardBookingTitle}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{mp.cardBookingSubtitle}</p>
              <div className="mt-auto pt-6">
                <Link
                  href={withLangPrefix("/medic-online/programare", lang)}
                  className={`${primaryLink} w-full sm:w-auto ${isOnDuty ? secondaryStyle : primaryStyle}`}
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
              className="group -mx-2 inline-flex min-h-[44px] max-w-full shrink-0 items-center gap-2 self-start whitespace-nowrap rounded-lg px-2 text-sm font-semibold text-sapphire transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:text-sapphire-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:text-sapphire-border sm:self-auto"
            >
              <PinIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span className="min-w-0 truncate">{findHelp.nearestPharmacy}</span>
            </Link>
          </div>
        </div>

        <ul className="mt-8 grid grid-cols-1 gap-6 border-t border-border pt-6 sm:grid-cols-3 sm:gap-8">
          <li>
            <p className="text-sm font-semibold text-foreground sm:text-base">{c.freeTitle}</p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{c.freeDesc}</p>
          </li>
          <li>
            <p className="text-sm font-semibold text-foreground sm:text-base">{c.browserTitle}</p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{c.browserDesc}</p>
          </li>
          <li>
            <p className="text-sm font-semibold text-foreground sm:text-base">{c.smsTitle}</p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{c.smsDesc}</p>
          </li>
        </ul>
      </Container>
    </section>
  );
}
