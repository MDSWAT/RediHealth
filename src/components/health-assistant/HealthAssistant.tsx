"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AlertCircleIcon, PhoneIcon, VideoIcon } from "@/components/ui/icons";
import { AssistantNavigation } from "@/components/health-assistant/AssistantNavigation";
import { TriageStateMachine } from "@/components/health-assistant/TriageStateMachine";
import { Container } from "@/components/ui/Container";
import { parseTriageUrlParams } from "@/lib/triage-url-params";
import { useLanguage } from "@/lib/i18n/language-context";
import { DEFAULT_LANG, withLangPrefix } from "@/lib/i18n/routing";

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
    actionsAria: "Quick actions",
    speakToDoctor: "Talk to a doctor",
    emergency112: "Call 112",
  },
  ro: {
    title: "Asistent medical",
    subtitle: "Răspunde la câteva întrebări scurte. Te trimitem spre informații, un medic sau un mediator sanitar.",
    emergencyNotice:
      "Pentru durere puternică în piept, respirație grea, semne de AVC, sângerare abundentă sau pericol imediat, sună la",
    emergencyDisclaimer: "Aplicația nu sună în locul tău.",
    loading: "Se încarcă asistentul medical…",
    actionsAria: "Acțiuni rapide",
    speakToDoctor: "Vorbește cu un medic",
    emergency112: "Sună la 112",
  },
  sq: {
    title: "Asistenti mjekësor",
    subtitle: "Përgjigju disa pyetjeve të shkurtra. Të drejtojmë te informacioni, një mjek ose një ndërmjetës shëndetësor.",
    emergencyNotice:
      "Për dhimbje të fortë në gjoks, vështirësi në frymëmarrje, shenja të goditjes në tru, gjakderdhje të madhe ose rrezik të menjëhershëm, telefono",
    emergencyDisclaimer: "Aplikacioni nuk telefonon për ty.",
    loading: "Po ngarkohet asistenti mjekësor…",
    actionsAria: "Veprime të shpejta",
    speakToDoctor: "Fol me një mjek",
    emergency112: "Telefono 112",
  },
  it: {
    title: "Assistente medico",
    subtitle: "Rispondi a qualche breve domanda. Ti indichiamo informazioni, un medico o un mediatore sanitario.",
    emergencyNotice:
      "Per dolore forte al petto, difficoltà a respirare, segni di ictus, sanguinamento abbondante o pericolo immediato, chiama il",
    emergencyDisclaimer: "L'app non chiama al posto tuo.",
    loading: "Caricamento dell'assistente medico…",
    actionsAria: "Azioni rapide",
    speakToDoctor: "Parla con un medico",
    emergency112: "Chiama il 112",
  },
};

export function HealthAssistant() {
  const { lang } = useLanguage();
  const t = dict[lang as keyof typeof dict] || dict[DEFAULT_LANG];

  return (
    <>
      <main id="main-content" className="flex-1 bg-muted/40 py-6 pb-28 sm:py-10 sm:pb-12">
        <Container>
          <div className="mx-auto max-w-4xl">
            <AssistantNavigation />

            <header className="mx-auto mt-6 max-w-2xl sm:mt-8">
              <h1 className="text-3xl font-semibold tracking-tight text-foreground text-balance sm:text-4xl">
                {t.title}
              </h1>
              <p className="mt-2 max-w-prose text-base leading-relaxed text-muted-foreground sm:text-lg">
                {t.subtitle}
              </p>
            </header>

            {/* Links across the site point at /health-assistant#triage. */}
            <div id="triage" className="mt-6 sm:mt-8">
              <Suspense
                fallback={
                  <div className="mx-auto max-w-2xl rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
                    {t.loading}
                  </div>
                }
              >
                <TriageStateMachineWithParams />
              </Suspense>
            </div>

            <p className="mx-auto mt-6 flex max-w-2xl items-start gap-2 rounded-lg border border-red-200/90 bg-red-50/70 p-4 text-sm leading-relaxed text-[#991b1b] dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-200">
              <AlertCircleIcon className="mt-0.5 h-4 w-4 flex-none" />
              <span>
                {t.emergencyNotice} <strong className="font-semibold">112</strong>. {t.emergencyDisclaimer}
              </span>
            </p>
          </div>
        </Container>
      </main>

      {/* Phones: doctor and 112 stay within thumb reach while the person scrolls through a pathway. */}
      <aside
        aria-label={t.actionsAria}
        data-bottom-bar
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card px-3 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] sm:hidden"
      >
        <div className="mx-auto flex max-w-md items-center gap-3">
          <Link
            href={withLangPrefix("/medic-online?source=triage_mobile", lang)}
            className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-lg bg-sapphire px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-[var(--dur-fast)] hover:bg-sapphire/90"
          >
            <VideoIcon className="h-4 w-4" />
            <span>{t.speakToDoctor}</span>
          </Link>
          <a
            href="tel:112"
            className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-lg border border-red-200/90 bg-red-50/80 px-3.5 py-2.5 text-sm font-semibold text-[#991b1b] transition-colors duration-[var(--dur-fast)] hover:bg-red-100 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200"
          >
            <PhoneIcon className="h-4 w-4" />
            <span>{t.emergency112}</span>
          </a>
        </div>
      </aside>
    </>
  );
}
