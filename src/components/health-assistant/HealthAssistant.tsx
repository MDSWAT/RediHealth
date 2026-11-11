"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AlertCircleIcon, PhoneIcon } from "@/components/ui/icons";
import { AssistantNavigation } from "@/components/health-assistant/AssistantNavigation";
import { TriageStateMachine } from "@/components/health-assistant/TriageStateMachine";
import { Container } from "@/components/ui/Container";
import { parseTriageUrlParams } from "@/lib/triage-url-params";
import { useLanguage } from "@/lib/i18n/language-context";
import { DEFAULT_LANG } from "@/lib/i18n/routing";
import type { Lang } from "@/lib/i18n/translations";

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
  en: {
    title: "Health assistant",
    subtitle: "Answer a few short questions. We point you to information, a doctor or a health mediator.",
    emergencyNotice:
      "For severe chest pain, trouble breathing, sudden stroke symptoms, heavy bleeding or immediate danger, call",
    emergencyDisclaimer: "The app does not call for you.",
    call112: "Call 112",
    loading: "Loading the health assistant…",
  },
  ro: {
    title: "Asistent medical",
    subtitle: "Răspunde la câteva întrebări scurte. Te trimitem spre informații, un medic sau un mediator sanitar.",
    emergencyNotice:
      "Pentru durere puternică în piept, respirație grea, semne de AVC, sângerare abundentă sau pericol imediat, sună la",
    emergencyDisclaimer: "Aplicația nu sună în locul tău.",
    call112: "Sună la 112",
    loading: "Se încarcă asistentul medical…",
  },
  sq: {
    title: "Asistenti mjekësor",
    subtitle: "Përgjigju disa pyetjeve të shkurtra. Të drejtojmë te informacioni, një mjek ose një mediator shëndetësor.",
    emergencyNotice:
      "Për dhimbje të fortë në gjoks, vështirësi në frymëmarrje, shenja të goditjes në tru, gjakderdhje të madhe ose rrezik të menjëhershëm, telefono",
    emergencyDisclaimer: "Aplikacioni nuk telefonon për ty.",
    call112: "Telefono 112",
    loading: "Po ngarkohet asistenti mjekësor…",
  },
  it: {
    title: "Assistente medico",
    subtitle: "Rispondi a qualche breve domanda. Ti indichiamo informazioni, un medico o un mediatore sanitario.",
    emergencyNotice:
      "Per dolore forte al petto, difficoltà a respirare, segni di ictus, sanguinamento abbondante o pericolo immediato, chiama il",
    emergencyDisclaimer: "L'app non chiama al posto tuo.",
    call112: "Chiama il 112",
    loading: "Caricamento dell'assistente medico…",
  },
  hr: {
    title: "Zdravstveni asistent",
    subtitle: "Odgovori na nekoliko kratkih pitanja. Usmjerit ćemo te na informacije, liječnika ili zdravstvenog medijatora.",
    emergencyNotice:
      "Kod jake boli u prsima, otežanog disanja, naglih znakova moždanog udara, jakog krvarenja ili neposredne opasnosti nazovi",
    emergencyDisclaimer: "Aplikacija ne poziva umjesto tebe.",
    call112: "Nazovi 112",
    loading: "Učitavanje zdravstvenog asistenta…",
  },
  rom: {
    title: "Sastipnasko azhutitori",
    subtitle: "De anglalipe pe nesave skurte phuchimata. Ingaras tut ki informacia, ko doktori vaj ko sastipnasko mediatori.",
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
    // Under the title: the questions on the left and, from lg, the 112 box in a column beside them.
    <main id="main-content" className="flex-1 pt-0.5 pb-10 sm:pt-2 sm:pb-14">
      <Container>
        <AssistantNavigation />

        <header className="max-w-3xl">
          <h1 className="text-3xl font-semibold tracking-[-0.025em] text-foreground text-balance sm:text-4xl">
            {t.title}
          </h1>
          <p className="mt-2.5 max-w-[62ch] text-base leading-relaxed text-muted-foreground sm:text-lg">
            {t.subtitle}
          </p>
        </header>

        <div className="mt-6 grid gap-6 sm:mt-8 lg:grid-cols-[minmax(0,1fr)_19rem] lg:items-start lg:gap-10">
          {/* Links across the site point at /health-assistant#triage. */}
          <div id="triage" className="min-w-0">
            <Suspense
              fallback={
                <div className="rounded-2xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
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
            className="rounded-2xl border border-primary/25 bg-primary-soft/55 p-5 lg:sticky lg:top-[calc(var(--chrome-h,0px)+1.5rem)]"
          >
            <p className="flex items-start gap-2.5 text-sm leading-relaxed text-foreground">
              <AlertCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
              <span>
                {t.emergencyNotice} <strong className="font-semibold">112</strong>. {t.emergencyDisclaimer}
              </span>
            </p>
            <a
              href="tel:112"
              className="mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-[15px] font-semibold text-white shadow-2xs transition-[background-color,transform] duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-primary-hover motion-safe:active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:w-auto lg:w-full"
            >
              <PhoneIcon className="h-4 w-4" aria-hidden="true" />
              <span>{t.call112}</span>
            </a>
          </aside>
        </div>
      </Container>
    </main>
  );
}
