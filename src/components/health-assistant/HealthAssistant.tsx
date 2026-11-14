"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { PhoneIcon } from "@/components/ui/icons";
import { AssistantNavigation } from "@/components/health-assistant/AssistantNavigation";
import { TriageStateMachine } from "@/components/health-assistant/TriageStateMachine";
import { Container } from "@/components/ui/Container";
import { parseTriageUrlParams } from "@/lib/triage-url-params";
import { useLanguage } from "@/lib/i18n/language-context";
import { PLAIN_ALARM_SIGNS } from "@/lib/i18n/emergency-signs";
import { DEFAULT_LANG } from "@/lib/i18n/routing";
import type { Lang } from "@/lib/i18n/translations";
import { emergencyButton } from "@/components/health-assistant/step-ui";

function TriageStateMachineWithParams() {
  const searchParams = useSearchParams();
  const parsed = parseTriageUrlParams(searchParams);

  return (
    <TriageStateMachine
      initialPathway={parsed.pathway}
      initialCampaign={parsed.campaign}
      initialEntry={parsed.entry}
    />
  );
}

const dict: Record<
  Lang,
  {
    title: string;
    subtitle: string;
    emergencyHeading: string;
    emergencyDisclaimer: string;
    call112: string;
    loading: string;
  }
> = {
  ru: {
    title: "Помощник по здоровью",
    subtitle: "Ответьте на несколько коротких вопросов. Подскажем следующий шаг: памятку, врача или медицинского посредника.",
    emergencyHeading: "Звоните 112, если у вас:",
    emergencyDisclaimer: "Вы должны позвонить 112 сами.",
    call112: "Позвонить 112",
    loading: "Загрузка помощника по здоровью…",
  },
  en: {
    title: "Health assistant",
    subtitle: "Answer a few short questions. We show you the right next step: a guide, a doctor or a health mediator.",
    emergencyHeading: "Call 112 if you have:",
    emergencyDisclaimer: "You must call 112 yourself.",
    call112: "Call 112",
    loading: "Loading the health assistant…",
  },
  ro: {
    title: "Asistent medical",
    subtitle: "Răspunde la câteva întrebări scurte. Îți arătăm pasul potrivit: un ghid, un medic sau un mediator sanitar.",
    emergencyHeading: "Sună la 112 dacă ai:",
    emergencyDisclaimer: "Trebuie să suni tu la 112.",
    call112: "Sună la 112",
    loading: "Se încarcă asistentul medical…",
  },
  sq: {
    title: "Asistenti mjekësor",
    subtitle: "Përgjigju disa pyetjeve të shkurtra. Të tregojmë hapin e duhur: një udhëzues, një mjek ose një mediator shëndetësor.",
    emergencyHeading: "Telefono 112 nëse ke:",
    emergencyDisclaimer: "Duhet të telefonosh vetë 112.",
    call112: "Telefono 112",
    loading: "Po ngarkohet asistenti mjekësor…",
  },
  it: {
    title: "Assistente medico",
    subtitle: "Rispondi a qualche breve domanda. Ti mostriamo il passo giusto: una guida, un medico o un mediatore sanitario.",
    emergencyHeading: "Chiama il 112 se hai:",
    emergencyDisclaimer: "Devi chiamare tu il 112.",
    call112: "Chiama il 112",
    loading: "Caricamento dell'assistente medico…",
  },
  hr: {
    title: "Zdravstveni asistent",
    subtitle: "Odgovori na nekoliko kratkih pitanja. Pokazat ćemo ti pravi sljedeći korak: vodič, liječnika ili zdravstvenog medijatora.",
    emergencyHeading: "Nazovi 112 ako imaš:",
    emergencyDisclaimer: "Moraš sam ili sama nazvati 112.",
    call112: "Nazovi 112",
    loading: "Učitavanje zdravstvenog asistenta…",
  },
  rom: {
    title: "Sastipnasko azhutitori",
    subtitle: "De anglalipe pe nesave skurte phuchimata. Sikavas tuke o chacho pash may dur: ekh gid, ekh doktori vaj ekh sastipnasko mediatori.",
    emergencyHeading: "Akhar 112 te si tut:",
    emergencyDisclaimer: "Trubul korkori te akhares 112.",
    call112: "Akhar 112",
    loading: "Pharel pe o sastipnasko azhutitori…",
  },
};

export function HealthAssistant() {
  const { lang } = useLanguage();
  const t = dict[lang] || dict[DEFAULT_LANG];
  const alarmSigns = PLAIN_ALARM_SIGNS[lang] || PLAIN_ALARM_SIGNS[DEFAULT_LANG];

  return (
    // Same shell as /health-check: tabs span the site container (no jump when switching tabs).
    // Under the title: the assistant instrument on the left and the 112 safety notice beside it on desktop.
    <main id="main-content" className="flex-1 pt-2 pb-10 sm:pt-3 sm:pb-14">
      <Container>
        <AssistantNavigation />

        <header className="max-w-3xl">
          <h1 className="text-2xl font-semibold tracking-[-0.025em] text-foreground text-balance sm:text-3xl">
            {t.title}
          </h1>
          <p className="mt-1.5 max-w-[62ch] text-base leading-relaxed text-muted-foreground">
            {t.subtitle}
          </p>
        </header>

        <div className="mt-5 grid gap-6 sm:mt-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start lg:gap-6 xl:grid-cols-[minmax(0,1fr)_22.5rem] xl:gap-8 2xl:grid-cols-[minmax(0,1fr)_24rem]">
          {/* Links across the site point at /health-assistant#triage. */}
          <div id="triage" className="min-w-0">
            <Suspense
              fallback={
                <div className="rounded-2xl border border-stone-200/90 bg-card p-8 text-center text-sm text-muted-foreground shadow-(--shadow-card-rest) dark:border-stone-800">
                  {t.loading}
                </div>
              }
            >
              <TriageStateMachineWithParams />
            </Suspense>
          </div>

          {/* Danger signs stay in view on desktop while the person answers; on phones they follow the questions. */}
          <aside
            aria-labelledby="assistant-emergency-heading"
            className="min-w-0 rounded-2xl border border-primary/25 bg-primary-soft/50 p-5 shadow-2xs lg:sticky lg:top-[calc(var(--site-header-h,4rem)+1.5rem)]"
          >
            <h2
              id="assistant-emergency-heading"
              className="border-l-2 border-primary pl-3 text-base font-semibold tracking-[-0.01em] text-foreground"
            >
              {t.emergencyHeading}
            </h2>
            <ul className="mt-3 space-y-1.5 pl-5 text-sm leading-relaxed text-foreground">
              {alarmSigns.map((sign) => (
                <li key={sign} className="list-disc marker:text-primary">
                  {sign}
                </li>
              ))}
            </ul>
            <a
              href="tel:112"
              className={`mt-4 w-full whitespace-nowrap sm:w-auto lg:w-full ${emergencyButton}`}
            >
              <PhoneIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{t.call112}</span>
            </a>
            <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">{t.emergencyDisclaimer}</p>
          </aside>
        </div>
      </Container>
    </main>
  );
}
