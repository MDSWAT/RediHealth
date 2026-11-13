"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { PhoneIcon } from "@/components/ui/icons";
import { AssistantNavigation } from "@/components/health-assistant/AssistantNavigation";
import { TriageStateMachine } from "@/components/health-assistant/TriageStateMachine";
import { Container } from "@/components/ui/Container";
import { parseTriageUrlParams } from "@/lib/triage-url-params";
import { useLanguage } from "@/lib/i18n/language-context";
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
    emergencyNotice: string;
    emergencyDisclaimer: string;
    call112: string;
    loading: string;
  }
> = {
  ru: {
    title: "Помощник по здоровью",
    subtitle: "Ответьте на несколько коротких вопросов. Подскажем следующий шаг: памятку, врача или медицинского посредника.",
    emergencyNotice:
      "При сильной боли в груди, одышке, признаках инсульта, сильном кровотечении или угрозе жизни звоните",
    emergencyDisclaimer: "Приложение не вызывает 112 вместо вас.",
    call112: "Позвонить 112",
    loading: "Загрузка помощника по здоровью…",
  },
  en: {
    title: "Health assistant",
    subtitle: "Answer a few short questions. We show you the right next step: a guide, a doctor or a health mediator.",
    emergencyNotice:
      "For severe chest pain, trouble breathing, sudden stroke symptoms, heavy bleeding or immediate danger, call",
    emergencyDisclaimer: "The app does not call for you.",
    call112: "Call 112",
    loading: "Loading the health assistant…",
  },
  ro: {
    title: "Asistent medical",
    subtitle: "Răspunde la câteva întrebări scurte. Îți arătăm pasul potrivit: un ghid, un medic sau un mediator sanitar.",
    emergencyNotice:
      "Pentru durere puternică în piept, respirație grea, semne de AVC, sângerare abundentă sau pericol imediat, sună la",
    emergencyDisclaimer: "Aplicația nu sună în locul tău.",
    call112: "Sună la 112",
    loading: "Se încarcă asistentul medical…",
  },
  sq: {
    title: "Asistenti mjekësor",
    subtitle: "Përgjigju disa pyetjeve të shkurtra. Të tregojmë hapin e duhur: një udhëzues, një mjek ose një mediator shëndetësor.",
    emergencyNotice:
      "Për dhimbje të fortë në gjoks, vështirësi në frymëmarrje, shenja të goditjes në tru, gjakderdhje të madhe ose rrezik të menjëhershëm, telefono",
    emergencyDisclaimer: "Aplikacioni nuk telefonon për ty.",
    call112: "Telefono 112",
    loading: "Po ngarkohet asistenti mjekësor…",
  },
  it: {
    title: "Assistente medico",
    subtitle: "Rispondi a qualche breve domanda. Ti mostriamo il passo giusto: una guida, un medico o un mediatore sanitario.",
    emergencyNotice:
      "Per dolore forte al petto, difficoltà a respirare, segni di ictus, sanguinamento abbondante o pericolo immediato, chiama il",
    emergencyDisclaimer: "L'app non chiama al posto tuo.",
    call112: "Chiama il 112",
    loading: "Caricamento dell'assistente medico…",
  },
  hr: {
    title: "Zdravstveni asistent",
    subtitle: "Odgovori na nekoliko kratkih pitanja. Pokazat ćemo ti pravi sljedeći korak: vodič, liječnika ili zdravstvenog medijatora.",
    emergencyNotice:
      "Kod jake boli u prsima, otežanog disanja, naglih znakova moždanog udara, jakog krvarenja ili neposredne opasnosti nazovi",
    emergencyDisclaimer: "Aplikacija ne poziva umjesto tebe.",
    call112: "Nazovi 112",
    loading: "Učitavanje zdravstvenog asistenta…",
  },
  rom: {
    title: "Sastipnasko azhutitori",
    subtitle: "De anglalipe pe nesave skurte phuchimata. Sikavas tuke o chacho pash may dur: ekh gid, ekh doktori vaj ekh sastipnasko mediatori.",
    emergencyNotice:
      "Vash bari dukh and-o kolin, phari phurdinimos, znakoja katar dab and-i godji, baro rat vaj sigo dar, akhar",
    emergencyDisclaimer: "I aplikacia na akharel vash tute.",
    call112: "Akhar 112",
    loading: "Pharel pe o sastipnasko azhutitori…",
  },
};

export function HealthAssistant() {
  const { lang } = useLanguage();
  const t = dict[lang] || dict[DEFAULT_LANG];

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
            aria-label={t.call112}
            className="min-w-0 rounded-2xl border border-primary/25 bg-primary-soft/50 p-5 shadow-2xs lg:sticky lg:top-[calc(var(--site-header-h,4rem)+1.5rem)]"
          >
            <p className="border-l-2 border-primary pl-3 text-base font-semibold tracking-[-0.01em] text-foreground">
              {t.call112}
            </p>
            <p className="mt-3 break-words text-sm leading-relaxed text-foreground">
              {t.emergencyNotice} <strong className="font-semibold">112</strong>.
            </p>
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{t.emergencyDisclaimer}</p>
            <a
              href="tel:112"
              className={`mt-4 w-full whitespace-nowrap sm:w-auto lg:w-full ${emergencyButton}`}
            >
              <PhoneIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{t.call112}</span>
            </a>
          </aside>
        </div>
      </Container>
    </main>
  );
}
