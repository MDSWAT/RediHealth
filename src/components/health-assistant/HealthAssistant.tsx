"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AlertCircleIcon } from "@/components/ui/icons";
import { AssistantNavigation } from "@/components/health-assistant/AssistantNavigation";
import { TriageStateMachine } from "@/components/health-assistant/TriageStateMachine";
import { Container } from "@/components/ui/Container";
import { parseTriageUrlParams } from "@/lib/triage-url-params";
import { useLanguage } from "@/lib/i18n/language-context";
import { DEFAULT_LANG } from "@/lib/i18n/routing";

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

const dict = {
  en: {
    title: "Health assistant",
    subtitle: "Answer a few short questions. We point you to information, a doctor or a health mediator.",
    emergencyNotice:
      "For severe chest pain, trouble breathing, sudden stroke symptoms, heavy bleeding or immediate danger, call",
    emergencyDisclaimer: "The app does not call for you.",
    loading: "Loading the health assistant…",
  },
  ro: {
    title: "Asistent medical",
    subtitle: "Răspunde la câteva întrebări scurte. Te trimitem spre informații, un medic sau un mediator sanitar.",
    emergencyNotice:
      "Pentru durere puternică în piept, respirație grea, semne de AVC, sângerare abundentă sau pericol imediat, sună la",
    emergencyDisclaimer: "Aplicația nu sună în locul tău.",
    loading: "Se încarcă asistentul medical…",
  },
  sq: {
    title: "Asistenti mjekësor",
    subtitle: "Përgjigju disa pyetjeve të shkurtra. Të drejtojmë te informacioni, një mjek ose një mediator shëndetësor.",
    emergencyNotice:
      "Për dhimbje të fortë në gjoks, vështirësi në frymëmarrje, shenja të goditjes në tru, gjakderdhje të madhe ose rrezik të menjëhershëm, telefono",
    emergencyDisclaimer: "Aplikacioni nuk telefonon për ty.",
    loading: "Po ngarkohet asistenti mjekësor…",
  },
  it: {
    title: "Assistente medico",
    subtitle: "Rispondi a qualche breve domanda. Ti indichiamo informazioni, un medico o un mediatore sanitario.",
    emergencyNotice:
      "Per dolore forte al petto, difficoltà a respirare, segni di ictus, sanguinamento abbondante o pericolo immediato, chiama il",
    emergencyDisclaimer: "L'app non chiama al posto tuo.",
    loading: "Caricamento dell'assistente medico…",
  },
};

export function HealthAssistant() {
  const { lang } = useLanguage();
  const t = dict[lang as keyof typeof dict] || dict[DEFAULT_LANG];

  return (
    // Same shell as /health-check: tabs span the site container (no jump when switching tabs),
    // and the page content sits in one max-w-2xl column under them.
    <main id="main-content" className="flex-1 pt-0.5 pb-10 sm:pt-2 sm:pb-14">
      <Container>
        <AssistantNavigation />

        <header className="max-w-2xl">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground text-balance sm:text-3xl">
            {t.title}
          </h1>
          <p className="mt-2 max-w-prose text-base leading-relaxed text-muted-foreground">
            {t.subtitle}
          </p>
        </header>

        {/* Links across the site point at /health-assistant#triage. */}
        <div id="triage" className="mt-6 sm:mt-8">
          <Suspense
            fallback={
              <div className="max-w-2xl rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
                {t.loading}
              </div>
            }
          >
            <TriageStateMachineWithParams />
          </Suspense>
        </div>

        <p className="mt-6 flex max-w-2xl items-start gap-2.5 rounded-xl border border-border bg-card p-4 text-sm leading-relaxed text-foreground">
          <AlertCircleIcon className="mt-0.5 h-4 w-4 flex-none text-red-700 dark:text-red-300" />
          <span>
            {t.emergencyNotice} <strong className="font-semibold">112</strong>. {t.emergencyDisclaimer}
          </span>
        </p>
      </Container>
    </main>
  );
}
