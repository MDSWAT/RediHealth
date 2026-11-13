"use client";

import { useState } from "react";
import Link from "next/link";
import {
  UsersIcon,
  VideoIcon,
  ShieldIcon,
  XIcon,
} from "@/components/ui/icons";
import { HomeVisitsList, type ScheduledHomeVisit } from "./HomeVisitsList";
import { HardwareKitTelemetryPanel } from "@/components/telemed/HardwareKitTelemetryPanel";
import { ProxyPatientIntakeWizard } from "./ProxyPatientIntakeWizard";
import { MediatorDoctorHandoverProtocol } from "./MediatorDoctorHandoverProtocol";
import { useLanguage } from "@/lib/i18n/language-context";
import { translations, type Lang } from "@/lib/i18n/translations";

function useSafeLanguage() {
  try {
    return useLanguage();
  } catch {
    return { lang: "ro" as Lang, t: translations.ro, setLang: () => {} };
  }
}

const dashboardCopy = {
  ru: {
    morning: "Доброе утро",
    afternoon: "Добрый день",
    evening: "Добрый вечер",
    synced: "Все синхронизировано",
    syncedShort: "Онлайн",
    savedOffline: (n: number) => (n === 1 ? "1 change saved offline" : `${n} изменения сохранены офлайн`),
    savedOfflineShort: (n: number) => `${n} оффлайн`,
    quickActions: "Быстрые действия",
    intakeBadge: "Открыть",
    intakeTitle: "Новый визит на дом",
    intakeText: "Данные пациента и фотография документа, удостоверяющего личность.",
    videoBadge: "Видеозвонок",
    videoTitle: "Видеоконсультация с врачом",
    videoText: "Отправьте данные и поговорите с дежурным врачом.",
    kitBadge: "Полевой комплект",
    kitTitle: "Замеры с комплектом",
    kitText: "Артериальное давление, SpO2, уровень сахара в крови и температура по Bluetooth или вручную.",
    close: "Закрыть",
    closeAria: "Закройте открытый инструмент",
    demoAge: "68 лет",
    casesTitle: "Отслеженные дела",
    casesText: "Ваши пациенты по группам: матери, хронические заболевания, без удостоверения личности.",
    casesLink: "Посмотреть дела",
  },

  ro: {
    morning: "Bună dimineața",
    afternoon: "Bună ziua",
    evening: "Bună seara",
    synced: "Totul e sincronizat",
    syncedShort: "Online",
    savedOffline: (n: number) => (n === 1 ? "1 modificare salvată offline" : `${n} modificări salvate offline`),
    savedOfflineShort: (n: number) => `${n} offline`,
    quickActions: "Acțiuni rapide",
    intakeBadge: "Deschide",
    intakeTitle: "Vizită nouă la domiciliu",
    intakeText: "Datele pacientului și poza actului de identitate.",
    videoBadge: "Apel video",
    videoTitle: "Consultație video cu medicul",
    videoText: "Trimite datele și vorbește cu medicul de gardă.",
    kitBadge: "Kit de teren",
    kitTitle: "Măsurători cu kitul",
    kitText: "Tensiune, SpO2, glicemie și temperatură, prin Bluetooth sau manual.",
    close: "Închide",
    closeAria: "Închide instrumentul deschis",
    demoAge: "68 ani",
    casesTitle: "Cazuri urmărite",
    casesText: "Pacienții tăi pe categorii: mame, boli cronice, fără acte.",
    casesLink: "Vezi cazurile",
  },
  en: {
    morning: "Good morning",
    afternoon: "Good afternoon",
    evening: "Good evening",
    synced: "All synced",
    syncedShort: "Online",
    savedOffline: (n: number) => (n === 1 ? "1 change saved offline" : `${n} changes saved offline`),
    savedOfflineShort: (n: number) => `${n} offline`,
    quickActions: "Quick actions",
    intakeBadge: "Open",
    intakeTitle: "New home visit",
    intakeText: "Patient details and a photo of the ID document.",
    videoBadge: "Video call",
    videoTitle: "Video consultation with the doctor",
    videoText: "Send the details and talk to the doctor on call.",
    kitBadge: "Field kit",
    kitTitle: "Measurements with the kit",
    kitText: "Blood pressure, SpO2, blood sugar and temperature, by Bluetooth or by hand.",
    close: "Close",
    closeAria: "Close the open tool",
    demoAge: "68 years",
    casesTitle: "Tracked cases",
    casesText: "Your patients by group: mothers, chronic illness, no ID.",
    casesLink: "View cases",
  },
  sq: {
    morning: "Mirëmëngjes",
    afternoon: "Mirëdita",
    evening: "Mirëmbrëma",
    synced: "Gjithçka është sinkronizuar",
    syncedShort: "Online",
    savedOffline: (n: number) => (n === 1 ? "1 ndryshim i ruajtur offline" : `${n} ndryshime të ruajtura offline`),
    savedOfflineShort: (n: number) => `${n} offline`,
    quickActions: "Veprime të shpejta",
    intakeBadge: "Hap",
    intakeTitle: "Vizitë e re në shtëpi",
    intakeText: "Të dhënat e pacientit dhe foto e dokumentit të identitetit.",
    videoBadge: "Thirrje video",
    videoTitle: "Konsultë video me mjekun",
    videoText: "Dërgo të dhënat dhe fol me mjekun e turnit.",
    kitBadge: "Kiti në terren",
    kitTitle: "Matje me kitin",
    kitText: "Tensioni, SpO2, sheqeri në gjak dhe temperatura, me Bluetooth ose me dorë.",
    close: "Mbyll",
    closeAria: "Mbyll mjetin e hapur",
    demoAge: "68 vjeç",
    casesTitle: "Rastet që ndjek",
    casesText: "Pacientët e tu sipas grupit: nëna, sëmundje kronike, pa dokumente.",
    casesLink: "Shiko rastet",
  },
  it: {
    morning: "Buongiorno",
    afternoon: "Buon pomeriggio",
    evening: "Buonasera",
    synced: "Tutto sincronizzato",
    syncedShort: "Online",
    savedOffline: (n: number) => (n === 1 ? "1 modifica salvata offline" : `${n} modifiche salvate offline`),
    savedOfflineShort: (n: number) => `${n} offline`,
    quickActions: "Azioni rapide",
    intakeBadge: "Apri",
    intakeTitle: "Nuova visita a domicilio",
    intakeText: "Dati del paziente e foto del documento d'identità.",
    videoBadge: "Videochiamata",
    videoTitle: "Visita video con il medico",
    videoText: "Invia i dati e parla con il medico di turno.",
    kitBadge: "Kit sul campo",
    kitTitle: "Misurazioni con il kit",
    kitText: "Pressione, SpO2, glicemia e temperatura, via Bluetooth o a mano.",
    close: "Chiudi",
    closeAria: "Chiudi lo strumento aperto",
    demoAge: "68 anni",
    casesTitle: "Casi seguiti",
    casesText: "I tuoi pazienti per gruppo: mamme, malattie croniche, senza documenti.",
    casesLink: "Vedi i casi",
  },
  hr: {
    morning: "Dobro jutro",
    afternoon: "Dobar dan",
    evening: "Dobra večer",
    synced: "Sve je sinkronizirano",
    syncedShort: "Na mreži",
    savedOffline: (n: number) => (n === 1 ? "1 izmjena spremljena izvan mreže" : `${n} izmjena spremljeno izvan mreže`),
    savedOfflineShort: (n: number) => `${n} izvan mreže`,
    quickActions: "Brze radnje",
    intakeBadge: "Otvori",
    intakeTitle: "Novi kućni posjet",
    intakeText: "Podatci o pacijentu i fotografija osobnog dokumenta.",
    videoBadge: "Videopoziv",
    videoTitle: "Videokonzultacija s liječnikom",
    videoText: "Pošaljite podatke i razgovarajte s dežurnim liječnikom.",
    kitBadge: "Terenski komplet",
    kitTitle: "Mjerenja kompletom",
    kitText: "Krvni tlak, SpO2, glukoza u krvi i tjelesna temperatura, putem Bluetootha ili ručno.",
    close: "Zatvori",
    closeAria: "Zatvori otvoreni alat",
    demoAge: "68 god.",
    casesTitle: "Praćeni slučajevi",
    casesText: "Vaši pacijenti po skupinama: majke, kronične bolesti, bez dokumenata.",
    casesLink: "Pogledaj slučajeve",
  },
  rom: {
    morning: "Lachi tosara",
    afternoon: "Lacho dives",
    evening: "Lachi rjat",
    synced: "Sa si sinkronizisardo",
    syncedShort: "Online",
    savedOffline: (n: number) => (n === 1 ? "1 paruvipe arakhado bi-internetesko" : `${n} paruvimata arakhade bi-internetesko`),
    savedOfflineShort: (n: number) => `${n} bi-internetesko`,
    quickActions: "Sige buchya",
    intakeBadge: "Putar",
    intakeTitle: "Nevi vizita khere",
    intakeText: "Date e pacienteske thaj poza katar o identitetesko lil.",
    videoBadge: "Video-svato",
    videoTitle: "Video-svato e doktoresa",
    videoText: "Bichhal e date thaj de svato e doktoresa kay si pe buchi.",
    kitBadge: "Terensko kito",
    kitTitle: "Merimata e kitosa",
    kitText: "Phurdimos e ratesko (tensiyona), SpO2, zaharo and-o rat thaj tatipen, katar Bluetooth vay vastesa.",
    close: "Phand",
    closeAria: "Phand o putardo instrumento",
    demoAge: "68 borsha",
    casesTitle: "Dikhle kazurya",
    casesText: "Che pacienturya pe grupe: daya, kronikane nasvalimata, bi lilengo.",
    casesLink: "Dikh e kazurya",
  },
};

interface MobileFieldMediatorDashboardProps {
  mediatorName?: string;
  communityName?: string;
  county?: string;
}

export function MobileFieldMediatorDashboard({
  mediatorName = "Elena Rădulescu",
  communityName = "Toflea",
  county = "Galați",
}: MobileFieldMediatorDashboardProps) {
  const { lang } = useSafeLanguage();
  const copy = dashboardCopy[lang] ?? dashboardCopy.ro;

  // Active tool overlay: null = dashboard, "intake" | "handover" | "telemetry"
  const [activeModal, setActiveModal] = useState<"intake" | "handover" | "telemetry" | null>(null);
  const [selectedVisitForTool, setSelectedVisitForTool] = useState<ScheduledHomeVisit | null>(null);
  const [offlineSyncCount, setOfflineSyncCount] = useState<number>(0);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return copy.morning;
    if (hour < 18) return copy.afternoon;
    return copy.evening;
  };

  return (
    <div className="min-h-screen bg-background dark:bg-obsidian-navy pb-24">
      {/* Sticky Mobile/Tablet Header */}
      <header className="sticky top-0 z-30 border-b border-border bg-card px-4 py-3">
        <div className="mx-auto max-w-5xl flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="truncate text-sm font-semibold text-foreground sm:text-base">
              {getGreeting()}, {mediatorName} · {communityName}, {county}
            </h1>
          </div>

          {/* Persistent Offline Sync Status Badge */}
          <div className="flex items-center gap-1.5 rounded-md border border-border bg-muted/60 px-2.5 py-1 text-xs font-semibold shrink-0">
            <span className="h-2 w-2 rounded-full bg-live-sage" />
            <span className="hidden sm:inline">
              {offlineSyncCount === 0 ? copy.synced : copy.savedOffline(offlineSyncCount)}
            </span>
            <span className="sm:hidden">
              {offlineSyncCount === 0 ? copy.syncedShort : copy.savedOfflineShort(offlineSyncCount)}
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 sm:px-6 py-6 space-y-6">
        {/* 3 Prominent Floating Action Tiles (min 100px height, 48px envelopes) */}
        <section aria-label={copy.quickActions} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Tile 1: Intake */}
          <button
            type="button"
            onClick={() => {
              setSelectedVisitForTool(null);
              setActiveModal("intake");
            }}
            className="flex min-h-[105px] flex-col justify-between rounded-lg border border-border bg-card p-4 text-left transition-colors duration-[var(--dur-fast)] hover:border-sapphire/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire"
          >
            <div className="flex items-center justify-between">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-sapphire/10 text-sapphire">
                <UsersIcon className="h-5 w-5" />
              </span>
              <span className="text-xs font-semibold text-sapphire">
                {copy.intakeBadge}
              </span>
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">
                {copy.intakeTitle}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {copy.intakeText}
              </p>
            </div>
          </button>

          {/* Tile 2: Video consultation handover */}
          <button
            type="button"
            onClick={() => {
              setSelectedVisitForTool(null);
              setActiveModal("handover");
            }}
            className="flex min-h-[105px] flex-col justify-between rounded-lg border border-border bg-card p-4 text-left transition-colors duration-[var(--dur-fast)] hover:border-sapphire/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire"
          >
            <div className="flex items-center justify-between">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-sapphire-soft text-sapphire">
                <VideoIcon className="h-5 w-5" />
              </span>
              <span className="text-xs font-semibold text-sapphire">
                {copy.videoBadge}
              </span>
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">
                {copy.videoTitle}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {copy.videoText}
              </p>
            </div>
          </button>

          {/* Tile 3: Telemetry kit panel */}
          <button
            type="button"
            onClick={() => {
              setSelectedVisitForTool(null);
              setActiveModal("telemetry");
            }}
            className="flex min-h-[105px] flex-col justify-between rounded-lg border border-border bg-card p-4 text-left transition-colors duration-[var(--dur-fast)] hover:border-sapphire/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire"
          >
            <div className="flex items-center justify-between">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-sapphire-soft text-sapphire">
                <ShieldIcon className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="text-xs font-semibold text-muted-foreground">
                {copy.kitBadge}
              </span>
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">
                {copy.kitTitle}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {copy.kitText}
              </p>
            </div>
          </button>
        </section>

        {/* Modal/Tool Overlay when triggered */}
        {activeModal && (
          <div className="fhs-enter relative rounded-xl border border-border bg-card p-4 shadow-sm sm:p-6">
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 inline-flex min-h-11 items-center whitespace-nowrap rounded-md border border-border px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label={copy.closeAria}
            >
              <span className="inline-flex items-center gap-1">
                <XIcon className="h-3.5 w-3.5" aria-hidden="true" />
                {copy.close}
              </span>
            </button>

            {activeModal === "intake" && (
              <ProxyPatientIntakeWizard
                onSuccess={() => {
                  setOfflineSyncCount((c) => c + 1);
                }}
                onCancel={() => setActiveModal(null)}
              />
            )}

            {activeModal === "telemetry" && (
              <HardwareKitTelemetryPanel
                patientId={selectedVisitForTool?.id}
                onSaved={() => {
                  setOfflineSyncCount((c) => c + 1);
                }}
              />
            )}

            {activeModal === "handover" && (
              <MediatorDoctorHandoverProtocol
                initialPatientName={selectedVisitForTool?.patientName || "Maria Căldăraru"}
                initialAge={selectedVisitForTool?.patientAge || copy.demoAge}
              />
            )}
          </div>
        )}

        {/* Daily Home Visits Agenda (Change 72) */}
        <HomeVisitsList
          onLaunchHandover={(visit) => {
            setSelectedVisitForTool(visit);
            setActiveModal("handover");
          }}
          onLaunchTelemetry={(visit) => {
            setSelectedVisitForTool(visit);
            setActiveModal("telemetry");
          }}
        />

        {/* Link to longitudinal case tracking cohort (Change 73) */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-lg border border-border bg-card p-5 shadow-xs">
          <div>
            <h3 className="text-sm font-bold text-foreground">
              {copy.casesTitle}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {copy.casesText}
            </p>
          </div>

          <Link
            href="/panel/mediator/cazuri"
            className="inline-flex min-h-[44px] items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-sapphire px-4 py-2 text-xs font-semibold text-white hover:bg-sapphire-light shrink-0"
          >
            {copy.casesLink}
          </Link>
        </div>
      </main>
    </div>
  );
}
