"use client";

import { useState } from "react";
import Link from "next/link";
import { CalendarIcon, CheckIcon, PhoneIcon, ShieldIcon, VideoIcon, VolumeIcon } from "@/components/ui/icons";
import { Container } from "@/components/ui/Container";
import { OnCallStatusBanner } from "./OnCallStatusBanner";
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

const heroCopy: Record<Lang, { soundTest: string; soundOk: string; free: string; browser: string; sms: string }> = {
  ro: {
    soundTest: "Testează sunetul",
    soundOk: "Sunetul funcționează",
    free: "Gratuit, pentru oricine",
    browser: "Se deschide în browserul telefonului. Nu ai nevoie de cont sau aplicație.",
    sms: "Primești prin SMS confirmarea și linkul",
  },
  en: {
    soundTest: "Test sound",
    soundOk: "Sound works",
    free: "Free, for anyone",
    browser: "Opens in your phone's browser. No account or app needed.",
    sms: "You get the confirmation and the link by text message",
  },
  sq: {
    soundTest: "Provo zërin",
    soundOk: "Zëri punon",
    free: "Falas, për këdo",
    browser: "Hapet në shfletuesin e telefonit. Nuk të duhet llogari apo aplikacion.",
    sms: "Konfirmimin dhe lidhjen i merr me SMS",
  },
  it: {
    soundTest: "Prova l'audio",
    soundOk: "L'audio funziona",
    free: "Gratis, per tutti",
    browser: "Si apre nel browser del telefono. Non ti servono account o app.",
    sms: "Ricevi conferma e link via SMS",
  },
};

const primaryLink =
  "inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

/** Doctor online: the two ways to talk to a doctor, the on-call status, and what to expect. */
export function MedicOnlineHero() {
  const { lang, t } = useSafeLanguage();
  const mp = t.medicOnlinePage;
  const c = heroCopy[lang] ?? heroCopy.ro;
  const [soundChecked, setSoundChecked] = useState(false);

  return (
    <section className="border-b border-border bg-background py-10 sm:py-16">
      <Container>
        <div className="max-w-3xl">
          <h1 className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl">{mp.heroTitle}</h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">{mp.heroSubtitle}</p>
        </div>

        <div className="mt-8">
          <OnCallStatusBanner />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="flex flex-col rounded-xl border border-border bg-card p-6">
            <h2 className="flex items-center gap-2.5 text-lg font-semibold text-foreground">
              <VideoIcon className="h-5 w-5 shrink-0 text-sapphire" />
              {mp.cardOnCallTitle}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{mp.cardOnCallSubtitle}</p>
            <div className="mt-auto flex flex-wrap items-center gap-3 pt-6">
              <Link href={withLangPrefix("/medic-online/asteptare", lang)} className={`${primaryLink} flex-1 bg-sapphire text-white hover:bg-sapphire-light`}>
                {mp.cardOnCallAction}
              </Link>
              <button
                type="button"
                onClick={() => {
                  playSoundCheck();
                  setSoundChecked(true);
                }}
                className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-muted-foreground transition-colors duration-[var(--dur-fast)] hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {soundChecked ? <CheckIcon className="h-4 w-4 text-sapphire" /> : <VolumeIcon className="h-4 w-4" />}
                <span aria-live="polite">{soundChecked ? c.soundOk : c.soundTest}</span>
              </button>
            </div>
          </div>

          <div className="flex flex-col rounded-xl border border-border bg-card p-6">
            <h2 className="flex items-center gap-2.5 text-lg font-semibold text-foreground">
              <CalendarIcon className="h-5 w-5 shrink-0 text-muted-foreground" />
              {mp.cardBookingTitle}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{mp.cardBookingSubtitle}</p>
            <div className="mt-auto pt-6">
              <Link
                href={withLangPrefix("/medic-online/programare", lang)}
                className={`${primaryLink} w-full border border-border bg-card text-foreground hover:bg-muted`}
              >
                {mp.cardBookingAction}
              </Link>
            </div>
          </div>
        </div>

        <ul className="mt-8 grid grid-cols-1 gap-3 border-t border-border pt-6 text-sm text-muted-foreground sm:grid-cols-3 sm:gap-4">
          <li className="flex items-start gap-2.5">
            <ShieldIcon className="mt-0.5 h-4 w-4 shrink-0 text-sapphire" />
            <span>{c.free}</span>
          </li>
          <li className="flex items-start gap-2.5">
            <VideoIcon className="mt-0.5 h-4 w-4 shrink-0 text-sapphire" />
            <span>{c.browser}</span>
          </li>
          <li className="flex items-start gap-2.5">
            <PhoneIcon className="mt-0.5 h-4 w-4 shrink-0 text-sapphire" />
            <span>{c.sms}</span>
          </li>
        </ul>
      </Container>
    </section>
  );
}
