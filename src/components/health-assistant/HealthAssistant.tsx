"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  ASSISTANT_NAV_COPY,
  AssistantNavigation,
  AssistantOtherTools,
} from "@/components/health-assistant/AssistantNavigation";
import { Button } from "@/components/ui/Button";
import { ActivityIcon } from "@/components/ui/icons";
import { TriageStateMachine } from "@/components/health-assistant/TriageStateMachine";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { PageListenAction } from "@/components/ui/PageListenAction";
import { parseTriageUrlParams } from "@/lib/triage-url-params";
import { useLanguage } from "@/lib/i18n/language-context";
import { DEFAULT_LANG, withLangPrefix } from "@/lib/i18n/routing";
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

export const HEALTH_ASSISTANT_COPY: Record<
  Lang,
  {
    title: string;
    subtitle: string;
    loading: string;
  }
> = {
  ru: {
    title: "Помощник по здоровью",
    subtitle: "Ответьте на несколько коротких вопросов. Подскажем следующий шаг: памятку, врача или медицинского посредника.",
    loading: "Загрузка помощника по здоровью…",
  },
  en: {
    title: "Health assistant",
    subtitle: "Answer a few short questions. We show you the right next step: a guide, a doctor or a health mediator.",
    loading: "Loading the health assistant…",
  },
  ro: {
    title: "Asistent virtual de sănătate",
    subtitle: "Răspunde la câteva întrebări scurte. Îți arătăm pasul potrivit: un ghid, un medic sau un mediator sanitar.",
    loading: "Se încarcă asistentul virtual…",
  },
  sq: {
    title: "Asistent shëndetësor",
    subtitle: "Përgjigju disa pyetjeve të shkurtra. Të tregojmë hapin e duhur: një udhëzues, një mjek ose një mediator shëndetësor.",
    loading: "Po ngarkohet asistenti shëndetësor…",
  },
  it: {
    title: "Assistente sanitario",
    subtitle: "Rispondi a qualche breve domanda. Ti mostriamo il passo giusto: una guida, un medico o un mediatore sanitario.",
    loading: "Caricamento dell'assistente sanitario…",
  },
  hr: {
    title: "Zdravstveni asistent",
    subtitle: "Odgovori na nekoliko kratkih pitanja. Pokazat ćemo ti pravi sljedeći korak: vodič, liječnika ili zdravstvenog medijatora.",
    loading: "Učitavanje zdravstvenog asistenta…",
  },
  rom: {
    title: "Sastipnasko azhutitori",
    subtitle: "De anglalipe pe nesave skurte phuchimata. Sikavas tuke o chacho pash may dur: ekh gid, ekh doktori vaj ekh sastipnasko mediatori.",
    loading: "Pharel pe o sastipnasko azhutitori…",
  },
};

export function HealthAssistant() {
  const { lang } = useLanguage();
  const t = HEALTH_ASSISTANT_COPY[lang] || HEALTH_ASSISTANT_COPY[DEFAULT_LANG];
  const nav = ASSISTANT_NAV_COPY[lang] || ASSISTANT_NAV_COPY[DEFAULT_LANG];

  return (
    // Same shell as /health-check: tabs span the site container (no jump when switching tabs).
    // No 112 panel here: the site-wide top bar already offers the 112 call on every page.
    <main id="main-content" className="flex-1 pt-2 pb-10 sm:pt-3 sm:pb-14">
      <Container>
        <AssistantNavigation />

        <PageHeader
          title={t.title}
          lead={t.subtitle}
          actions={
            <>
              {/* Straight into the 3D body symptom tool; on phones the tool tabs above are hidden. */}
              <Button href={withLangPrefix("/health-check", lang)} variant="action" size="md">
                <ActivityIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{nav.symptoms}</span>
              </Button>
              <PageListenAction lang={lang} segments={[t.title, t.subtitle]} />
            </>
          }
        />

        {/* Links across the site point at /health-assistant#triage. */}
        <div id="triage" className="mt-5 max-w-4xl min-w-0 sm:mt-6">
          <Suspense
            fallback={
              <div className="rounded-2xl border border-border bg-card p-8 text-center text-meta text-muted-foreground shadow-(--shadow-card-rest) dark:border-ink-800">
                {t.loading}
              </div>
            }
          >
            <TriageStateMachineWithParams />
          </Suspense>
        </div>

        <AssistantOtherTools />
      </Container>
    </main>
  );
}
