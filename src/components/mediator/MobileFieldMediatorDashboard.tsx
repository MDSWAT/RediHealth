"use client";

import { useState, useSyncExternalStore } from "react";
import { PanelLink as Link, usePanelRuntime } from "@/components/panel/PanelRuntime";
import { XIcon } from "@/components/ui/icons";
import { HomeVisitsList, type ScheduledHomeVisit } from "./HomeVisitsList";
import { HardwareKitTelemetryPanel } from "@/components/telemed/HardwareKitTelemetryPanel";
import { ProxyPatientIntakeWizard } from "./ProxyPatientIntakeWizard";
import { MediatorDoctorHandoverProtocol } from "./MediatorDoctorHandoverProtocol";
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

const subscribeNoop = () => () => {};

function useClientHour(): number | null {
  return useSyncExternalStore(
    subscribeNoop,
    () => new Date().getHours(),
    () => null,
  );
}

const dashboardCopy = {
  ru: {
    workspace: "Полевая работа",
    morning: "Доброе утро",
    afternoon: "Добрый день",
    evening: "Добрый вечер",
    synced: "Все синхронизировано",
    savedOffline: (n: number) =>
      n === 1 ? "1 изменение сохранено офлайн" : `${n} изменения сохранены офлайн`,
    quickActions: "Полевые инструменты",
    intakeAction: "Новый визит",
    intakeTitle: "Регистрация визита на дом",
    videoAction: "Передача врачу",
    videoTitle: "Видеоконсультация с врачом",
    kitAction: "Полевой комплект",
    kitTitle: "Замеры с комплектом",
    casesLink: "Отслеженные дела",
    close: "Закрыть",
    closeAria: "Закрыть открытый инструмент",
  },
  ro: {
    workspace: "Activitate în teren",
    morning: "Bună dimineața",
    afternoon: "Bună ziua",
    evening: "Bună seara",
    synced: "Totul e sincronizat",
    savedOffline: (n: number) =>
      n === 1 ? "1 modificare salvată offline" : `${n} modificări salvate offline`,
    quickActions: "Instrumente de teren",
    intakeAction: "Vizită nouă",
    intakeTitle: "Vizită nouă la domiciliu",
    videoAction: "Predare medic",
    videoTitle: "Consultație video cu medicul",
    kitAction: "Kit de teren",
    kitTitle: "Măsurători cu kitul",
    casesLink: "Cazuri urmărite",
    close: "Închide",
    closeAria: "Închide instrumentul deschis",
  },
  en: {
    workspace: "Field workspace",
    morning: "Good morning",
    afternoon: "Good afternoon",
    evening: "Good evening",
    synced: "All synced",
    savedOffline: (n: number) =>
      n === 1 ? "1 change saved offline" : `${n} changes saved offline`,
    quickActions: "Field tools",
    intakeAction: "New home visit",
    intakeTitle: "New home visit",
    videoAction: "Doctor handover",
    videoTitle: "Video consultation with the doctor",
    kitAction: "Field kit",
    kitTitle: "Measurements with the kit",
    casesLink: "Tracked cases",
    close: "Close",
    closeAria: "Close the open tool",
  },
  sq: {
    workspace: "Puna në terren",
    morning: "Mirëmëngjes",
    afternoon: "Mirëdita",
    evening: "Mirëmbrëma",
    synced: "Gjithçka e sinkronizuar",
    savedOffline: (n: number) =>
      n === 1 ? "1 ndryshim i ruajtur offline" : `${n} ndryshime të ruajtura offline`,
    quickActions: "Mjetet në terren",
    intakeAction: "Vizitë e re",
    intakeTitle: "Vizitë e re në shtëpi",
    videoAction: "Dorëzim te mjeku",
    videoTitle: "Konsultë video me mjekun",
    kitAction: "Kiti në terren",
    kitTitle: "Matje me kitin",
    casesLink: "Rastet që ndjek",
    close: "Mbyll",
    closeAria: "Mbyll mjetin e hapur",
  },
  it: {
    workspace: "Lavoro sul campo",
    morning: "Buongiorno",
    afternoon: "Buon pomeriggio",
    evening: "Buonasera",
    synced: "Tutto sincronizzato",
    savedOffline: (n: number) =>
      n === 1 ? "1 modifica salvata offline" : `${n} modifiche salvate offline`,
    quickActions: "Strumenti sul campo",
    intakeAction: "Nuova visita",
    intakeTitle: "Nuova visita a domicilio",
    videoAction: "Passaggio medico",
    videoTitle: "Visita video con il medico",
    kitAction: "Kit sul campo",
    kitTitle: "Misurazioni con il kit",
    casesLink: "Casi seguiti",
    close: "Chiudi",
    closeAria: "Chiudi lo strumento aperto",
  },
  hr: {
    workspace: "Terenski rad",
    morning: "Dobro jutro",
    afternoon: "Dobar dan",
    evening: "Dobra večer",
    synced: "Sve je sinkronizirano",
    savedOffline: (n: number) =>
      n === 1 ? "1 izmjena spremljena izvan mreže" : `${n} izmjena spremljeno izvan mreže`,
    quickActions: "Terenski alati",
    intakeAction: "Novi posjet",
    intakeTitle: "Novi kućni posjet",
    videoAction: "Predaja liječniku",
    videoTitle: "Videokonzultacija s liječnikom",
    kitAction: "Terenski komplet",
    kitTitle: "Mjerenja kompletom",
    casesLink: "Praćeni slučajevi",
    close: "Zatvori",
    closeAria: "Zatvori otvoreni alat",
  },
  rom: {
    workspace: "Buchi pe tereno",
    morning: "Lachi tosara",
    afternoon: "Lacho dives",
    evening: "Lachi rjat",
    synced: "Sa si sinkronizisardo",
    savedOffline: (n: number) =>
      n === 1 ? "1 paruvipe arakhado bi-internetesko" : `${n} paruvimata arakhade bi-internetesko`,
    quickActions: "Instrumenturya pe tereno",
    intakeAction: "Nevi vizita",
    intakeTitle: "Nevi vizita khere",
    videoAction: "Dinipe ko doktori",
    videoTitle: "Video-svato e doktoresa",
    kitAction: "Terensko kito",
    kitTitle: "Merimata e kitosa",
    casesLink: "Dikhle kazurya",
    close: "Phand",
    closeAria: "Phand o putardo instrumento",
  },
};

interface MobileFieldMediatorDashboardProps {
  mediatorName?: string;
  communityName?: string;
  county?: string;
}

type ActiveTool = "intake" | "handover" | "telemetry" | null;

const toolBtnBase =
  "inline-flex min-h-11 items-center justify-center whitespace-nowrap rounded-lg border px-3.5 py-2 text-sm font-medium transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sapphire dark:focus-visible:outline-[#bad7fa]";

export function MobileFieldMediatorDashboard({
  mediatorName,
  communityName,
  county,
}: MobileFieldMediatorDashboardProps) {
  const { lang } = useSafeLanguage();
  const { demo } = usePanelRuntime();
  const copy = dashboardCopy[lang] ?? dashboardCopy.ro;
  const clientHour = useClientHour();

  const [activeTool, setActiveTool] = useState<ActiveTool>(null);
  const [selectedVisitForTool, setSelectedVisitForTool] = useState<ScheduledHomeVisit | null>(null);
  const [offlineSyncCount, setOfflineSyncCount] = useState<number>(0);

  const greetingPrefix =
    clientHour === null
      ? null
      : clientHour < 12
        ? copy.morning
        : clientHour < 18
          ? copy.afternoon
          : copy.evening;

  const headingText = mediatorName
    ? greetingPrefix
      ? `${greetingPrefix}, ${mediatorName}`
      : mediatorName
    : copy.workspace;

  const locationLine = [communityName, county].filter(Boolean).join(", ");
  const syncLine =
    offlineSyncCount === 0 ? copy.synced : copy.savedOffline(offlineSyncCount);

  const activeToolTitle =
    activeTool === "intake"
      ? copy.intakeTitle
      : activeTool === "handover"
        ? copy.videoTitle
        : activeTool === "telemetry"
          ? copy.kitTitle
          : "";

  const toggleTool = (tool: Exclude<ActiveTool, null>) => {
    setSelectedVisitForTool(null);
    setActiveTool((current) => (current === tool ? null : tool));
  };

  return (
    <div
      id="main-content"
      className="min-h-dvh bg-[var(--panel-surface)] px-4 py-5 pb-24 text-[var(--panel-ink)] sm:px-6 sm:py-6"
    >
      <div className="mx-auto max-w-[1240px]">
        {/* Open-canvas header: real identity + plain sync state */}
        <header className="flex flex-col gap-3 border-b border-[var(--panel-line)] pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <h1 className="font-display text-2xl font-bold tracking-[-0.025em] text-[var(--panel-ink)] sm:text-[1.875rem] sm:leading-[1.2]">
              {headingText}
            </h1>
            <p className="mt-1 text-sm tabular-nums text-[var(--panel-muted)]">
              {locationLine ? `${locationLine} · ${syncLine}` : syncLine}
            </p>
          </div>

          <div
            role="toolbar"
            aria-label={copy.quickActions}
            className="flex flex-wrap items-center gap-2"
          >
            <button
              type="button"
              aria-pressed={activeTool === "intake"}
              onClick={() => toggleTool("intake")}
              className={`${toolBtnBase} border-sapphire bg-sapphire text-white hover:bg-[#28476f]`}
            >
              {copy.intakeAction}
            </button>

            <button
              type="button"
              aria-pressed={activeTool === "handover"}
              onClick={() => toggleTool("handover")}
              className={`${toolBtnBase} ${
                activeTool === "handover"
                  ? "border-sapphire bg-[var(--panel-selection)] text-sapphire dark:border-[#bad7fa] dark:text-[#bad7fa]"
                  : "border-[#8a94a6] bg-[var(--panel-surface)] text-[var(--panel-ink)] hover:bg-[var(--panel-selection)] dark:border-[var(--panel-line)]"
              }`}
            >
              {copy.videoAction}
            </button>

            <button
              type="button"
              aria-pressed={activeTool === "telemetry"}
              onClick={() => toggleTool("telemetry")}
              className={`${toolBtnBase} ${
                activeTool === "telemetry"
                  ? "border-sapphire bg-[var(--panel-selection)] text-sapphire dark:border-[#bad7fa] dark:text-[#bad7fa]"
                  : "border-[#8a94a6] bg-[var(--panel-surface)] text-[var(--panel-ink)] hover:bg-[var(--panel-selection)] dark:border-[var(--panel-line)]"
              }`}
            >
              {copy.kitAction}
            </button>

            <Link
              href={withLangPrefix("/panel/mediator/cazuri", lang)}
              className={`${toolBtnBase} border-[#8a94a6] bg-[var(--panel-surface)] text-[var(--panel-ink)] hover:bg-[var(--panel-selection)] dark:border-[var(--panel-line)]`}
            >
              {copy.casesLink}
            </Link>
          </div>
        </header>

        {/* Flat inline tool workspace (zero nested cards, zero colliding close button) */}
        {activeTool && (
          <section
            aria-label={activeToolTitle}
            className="border-b border-[var(--panel-line)] py-6"
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-[var(--panel-ink)]">
                {activeToolTitle}
              </h2>
              <button
                type="button"
                onClick={() => setActiveTool(null)}
                aria-label={copy.closeAria}
                className="inline-flex min-h-11 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border border-[#8a94a6] bg-[var(--panel-surface)] px-3 py-2 text-sm font-medium text-[var(--panel-ink)] transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-[var(--panel-selection)] motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sapphire dark:border-[var(--panel-line)] dark:focus-visible:outline-[#bad7fa]"
              >
                <XIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{copy.close}</span>
              </button>
            </div>

            {activeTool === "intake" && (
              <ProxyPatientIntakeWizard
                onSuccess={() => {
                  setOfflineSyncCount((c) => c + 1);
                }}
                onCancel={() => setActiveTool(null)}
              />
            )}

            {activeTool === "telemetry" && (
              <HardwareKitTelemetryPanel
                patientId={selectedVisitForTool?.id}
                onSaved={() => {
                  setOfflineSyncCount((c) => c + 1);
                }}
              />
            )}

            {activeTool === "handover" && (
              <MediatorDoctorHandoverProtocol
                initialPatientName={
                  selectedVisitForTool?.patientName ?? (demo ? "Maria Căldăraru" : "")
                }
                initialAge={selectedVisitForTool?.patientAge}
              />
            )}
          </section>
        )}

        {/* Daily Home Visits Agenda immediately above the fold */}
        <div className="pt-6">
          <HomeVisitsList
            onStartIntake={() => {
              setSelectedVisitForTool(null);
              setActiveTool("intake");
            }}
            onLaunchHandover={(visit) => {
              setSelectedVisitForTool(visit);
              setActiveTool("handover");
            }}
            onLaunchTelemetry={(visit) => {
              setSelectedVisitForTool(visit);
              setActiveTool("telemetry");
            }}
          />
        </div>
      </div>
    </div>
  );
}
