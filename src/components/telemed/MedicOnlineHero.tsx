"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ListenButton } from "@/components/ui/ListenButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { useReadAloud } from "@/components/health-check/readingTools";
import { PinIcon, VolumeIcon } from "@/components/ui/icons";
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
  onDuty: string;
  offDutyTitle: string;
  offDuty: string;
  offDutyAction: string;
};

export const heroCopy: Record<Lang, HeroFeatureCopy> = {
  ru: {
    soundTest: "Проверить звук",
    soundOk: "Звук работает",
    onDuty: `Доступно сейчас, каждый день, ${DUTY_HOURS}`,
    offDutyTitle: "Зал ожидания открывается в 08:00",
    offDuty: "Открыт каждый день до 20:00.",
    offDutyAction: "Что подготовить",
  },

  ro: {
    soundTest: "Testează sunetul",
    soundOk: "Sunetul funcționează",
    onDuty: `Disponibil acum, zilnic, ${DUTY_HOURS}`,
    offDutyTitle: "Sala de așteptare se deschide la 08:00",
    offDuty: "Deschisă zilnic până la 20:00.",
    offDutyAction: "Vezi ce să pregătești",
  },
  en: {
    soundTest: "Test your sound",
    soundOk: "Sound works",
    onDuty: `Available now, every day, ${DUTY_HOURS}`,
    offDutyTitle: "The waiting room opens at 08:00",
    offDuty: "Open every day until 20:00.",
    offDutyAction: "See what to get ready",
  },
  sq: {
    soundTest: "Provo zërin",
    soundOk: "Zëri punon",
    onDuty: `Në dispozicion tani, çdo ditë, ${DUTY_HOURS}`,
    offDutyTitle: "Dhoma e pritjes hapet në 08:00",
    offDuty: "Hapur çdo ditë deri në 20:00.",
    offDutyAction: "Çfarë të përgatitësh",
  },
  it: {
    soundTest: "Prova l'audio",
    soundOk: "L'audio funziona",
    onDuty: `Disponibile ora, tutti i giorni, ${DUTY_HOURS}`,
    offDutyTitle: "La sala d'attesa apre alle 08:00",
    offDuty: "Aperta ogni giorno fino alle 20:00.",
    offDutyAction: "Vedi cosa preparare",
  },
  hr: {
    soundTest: "Isprobaj zvuk",
    soundOk: "Zvuk radi",
    onDuty: `Dostupno sada, svaki dan, ${DUTY_HOURS}`,
    offDutyTitle: "Čekaonica se otvara u 08:00",
    offDuty: "Otvorena svaki dan do 20:00.",
    offDutyAction: "Pogledaj što pripremiti",
  },
  rom: {
    soundTest: "Zumav o avazi",
    soundOk: "O avazi kerel buchi",
    onDuty: `Kathe akana, sako dives, ${DUTY_HOURS}`,
    offDutyTitle: "E azhukeripnaski soba putrel pes ko 08:00",
    offDuty: "Putardi sako dives zhi ko 20:00.",
    offDutyAction: "Dikh so te getosares",
  },
};

/**
 * Doctor online: the two ways to talk to a doctor on one surface, then the pharmacy as a
 * single quiet line below the card.
 */
export function MedicOnlineHero() {
  const { lang, t } = useSafeLanguage();
  const mp = t.medicOnlinePage;
  const c = heroCopy[lang] ?? heroCopy.ro;
  const findHelp = findHelpLinks(lang);
  const [soundChecked, setSoundChecked] = useState(false);
  const voice = useReadAloud(lang);
  // Outside duty hours the booking is the useful action, so it takes the primary style.
  const { isOnDuty } = useOnCallStatus();

  return (
    <section className="border-b border-border bg-background pb-10 sm:pb-14">
      <Container>
        <PageHeader
          title={mp.heroTitle}
          lead={mp.heroSubtitle}
          actions={
            voice.available ? (
              <ListenButton
                uiLang={lang}
                autoRead
                isPlaying={voice.speaking}
                onToggle={() => {
                  if (voice.speaking) {
                    voice.stop();
                  } else {
                    voice.speak([mp.heroTitle, mp.heroSubtitle]);
                  }
                }}
              />
            ) : undefined
          }
        />

        {/* The two ways in share one surface, split by a hairline: no row of look-alike cards. */}
        {/* The page's one lit surface: a soft pointer light and top-edge highlight on fine pointers. */}
        <div className="mt-8 divide-y divide-border rounded-xl border border-border bg-card shadow-(--shadow-card-rest)">
          <div className="grid grid-cols-1 divide-y divide-border md:grid-cols-2 md:divide-x md:divide-y-0">
            <div className="flex flex-col p-6">
              {isOnDuty && (
                <p role="status" className="mb-3 text-body font-semibold text-foreground tabular-nums">
                  {c.onDuty}
                </p>
              )}
              <h2 className="text-balance text-section font-semibold text-foreground tabular-nums">
                {isOnDuty ? mp.cardOnCallTitle : c.offDutyTitle}
              </h2>
              <p className="mt-2 text-body text-muted-foreground tabular-nums">{isOnDuty ? mp.cardOnCallSubtitle : c.offDuty}</p>
              <div className="mt-auto flex flex-col items-center gap-2 pt-6 sm:items-start">
                <div className="flex w-full flex-nowrap items-center">
                  <Button
                    href={withLangPrefix("/medic-online/asteptare", lang)}
                    variant={isOnDuty ? "action" : "outline"}
                    size="lg"
                    className="w-full sm:w-auto"
                  >
                    {isOnDuty ? mp.cardOnCallAction : c.offDutyAction}
                  </Button>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    playSoundCheck();
                    setSoundChecked(true);
                  }}
                  className="press-row inline-flex min-h-11 items-center gap-2 whitespace-nowrap rounded-sm text-body font-medium text-sapphire underline decoration-sapphire/40 underline-offset-4 transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:text-sapphire-light motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:text-sapphire-border dark:decoration-sapphire-border/40"
                >
                  <VolumeIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span aria-live="polite">{soundChecked ? c.soundOk : c.soundTest}</span>
                </button>
              </div>
            </div>

            <div className="flex flex-col p-6">
              <h2 className="text-balance text-section font-semibold text-foreground">
                {mp.cardBookingTitle}
              </h2>
              <p className="mt-2 text-body text-muted-foreground">{mp.cardBookingSubtitle}</p>
              <div className="mt-auto pt-6">
                <Button
                  href={withLangPrefix("/medic-online/programare", lang)}
                  variant={isOnDuty ? "outline" : "action"}
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  {mp.cardBookingAction}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Many questions do not need a doctor: the pharmacy, as a single quiet line below the card. */}
        <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="text-body text-muted-foreground">{findHelp.noDoctorNeeded}</span>
          <Link
            href={withLangPrefix(findHelpHref("pharmacy"), lang)}
            className="inline-flex min-h-11 items-center gap-1.5 whitespace-nowrap rounded-sm text-body font-medium text-sapphire underline decoration-sapphire/40 underline-offset-4 transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:text-sapphire-light motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:text-sapphire-border dark:decoration-sapphire-border/40"
          >
            <PinIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{findHelp.nearestPharmacy}</span>
          </Link>
        </div>
      </Container>
    </section>
  );
}
