"use client";

import { useState } from "react";
import { PanelLink as Link, usePanelRuntime } from "@/components/panel/PanelRuntime";
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

type VisitSeedText = Record<string, { patientAge: string; purpose: string }>;

const visitsCopy = {
  ru: {
    title: (n: number) => `Сегодняшние визиты (${n})`,
    headingPlain: "Сегодняшние визиты",
    progress: (done: number, total: number) => `${done} из ${total} выполнено`,
    demoNotice: "Демонстрационные визиты для предпросмотра.",
    emptyTitle: "На сегодня домашних визитов не запланировано",
    emptyBody: "Зарегистрируйте новый визит на дом или откройте календарь, чтобы посмотреть запланированные приёмы.",
    newVisit: "Новый визит",
    openCalendar: "Открыть календарь",
    urgent: "Срочно",
    completed: "Выполнено",
    arrivedStatus: "На месте",
    purpose: "Причина:",
    openMap: "Открыть карту",
    callPatient: "Позвонить",
    arrived: "Я на месте",
    addMeasurements: "Добавить замеры",
    connectDoctor: "Подключить врача",
    endVisit: "Завершить визит",
    seed: {
      "visit-1": { patientAge: "68 лет", purpose: "Проверка артериального давления и рецепта" },
      "visit-2": { patientAge: "74 года", purpose: "Проверка уровня сахара в крови и видеозвонок с врачом" },
      "visit-3": { patientAge: "24 года, 7-й месяц беременности", purpose: "Запись на дородовые осмотры и оформление CNAS" },
      "visit-4": { patientAge: "5 лет, с мамой", purpose: "Проверка температуры и помощь с записью к педиатру" },
    } as VisitSeedText,
  },
  ro: {
    title: (n: number) => `Vizitele de azi (${n})`,
    headingPlain: "Vizitele de azi",
    progress: (done: number, total: number) => `${done} din ${total} încheiate`,
    demoNotice: "Vizite demonstrative pentru previzualizare.",
    emptyTitle: "Nu ai vizite programate pentru azi",
    emptyBody: "Înregistrează o vizită nouă la domiciliu sau deschide calendarul pentru controalele planificate.",
    newVisit: "Vizită nouă",
    openCalendar: "Deschide calendarul",
    urgent: "Urgent",
    completed: "Încheiată",
    arrivedStatus: "La adresă",
    purpose: "Motiv:",
    openMap: "Deschide harta",
    callPatient: "Sună pacientul",
    arrived: "Am ajuns",
    addMeasurements: "Adaugă măsurători",
    connectDoctor: "Conectează medicul",
    endVisit: "Încheie vizita",
    seed: {
      "visit-1": { patientAge: "68 ani", purpose: "Măsurarea tensiunii și verificarea rețetei" },
      "visit-2": { patientAge: "74 ani", purpose: "Control glicemie și apel video cu medicul" },
      "visit-3": { patientAge: "24 ani, însărcinată în luna a 7-a", purpose: "Înscriere la controale prenatale și dosar CNAS" },
      "visit-4": { patientAge: "5 ani, cu mama", purpose: "Verificare febră și programare la pediatru" },
    } as VisitSeedText,
  },
  en: {
    title: (n: number) => `Today's visits (${n})`,
    headingPlain: "Today's visits",
    progress: (done: number, total: number) => `${done} of ${total} done`,
    demoNotice: "Sample visits for demo preview.",
    emptyTitle: "No home visits scheduled for today",
    emptyBody: "Register a new home visit or open the calendar to check planned follow-ups.",
    newVisit: "New home visit",
    openCalendar: "Open calendar",
    urgent: "Urgent",
    completed: "Done",
    arrivedStatus: "On site",
    purpose: "Reason:",
    openMap: "Open map",
    callPatient: "Call patient",
    arrived: "I'm here",
    addMeasurements: "Add measurements",
    connectDoctor: "Connect doctor",
    endVisit: "End visit",
    seed: {
      "visit-1": { patientAge: "68 years", purpose: "Blood pressure check and prescription review" },
      "visit-2": { patientAge: "74 years", purpose: "Blood sugar check and video call with the doctor" },
      "visit-3": { patientAge: "24 years, 7 months pregnant", purpose: "Sign-up for prenatal check-ups and CNAS file" },
      "visit-4": { patientAge: "5 years, with his mother", purpose: "Fever check and help booking a paediatrician" },
    } as VisitSeedText,
  },
  sq: {
    title: (n: number) => `Vizitat e sotme (${n})`,
    headingPlain: "Vizitat e sotme",
    progress: (done: number, total: number) => `${done} nga ${total} të mbyllura`,
    demoNotice: "Vizita shembull për parashikimin demo.",
    emptyTitle: "Nuk ka vizita në shtëpi të planifikuara për sot",
    emptyBody: "Regjistro një vizitë të re në shtëpi ose hap kalendarin për kontrollet e planifikuara.",
    newVisit: "Vizitë e re",
    openCalendar: "Hap kalendarin",
    urgent: "Urgjent",
    completed: "E mbyllur",
    arrivedStatus: "Në adresë",
    purpose: "Arsyeja:",
    openMap: "Hap hartën",
    callPatient: "Telefono",
    arrived: "Mbërrita",
    addMeasurements: "Shto matjet",
    connectDoctor: "Lidh mjekun",
    endVisit: "Mbyll vizitën",
    seed: {
      "visit-1": { patientAge: "68 vjeç", purpose: "Matja e tensionit dhe kontrolli i recetës" },
      "visit-2": { patientAge: "74 vjeç", purpose: "Kontroll i sheqerit në gjak dhe telefonatë video me mjekun" },
      "visit-3": { patientAge: "24 vjeç, shtatzënë në muajin e 7-të", purpose: "Regjistrim për kontrollet para lindjes dhe dosja CNAS" },
      "visit-4": { patientAge: "5 vjeç, me nënën", purpose: "Kontroll për temperaturë dhe ndihmë për takim me pediatrin" },
    } as VisitSeedText,
  },
  it: {
    title: (n: number) => `Visite di oggi (${n})`,
    headingPlain: "Visite di oggi",
    progress: (done: number, total: number) => `${done} di ${total} concluse`,
    demoNotice: "Visite di esempio per l'anteprima demo.",
    emptyTitle: "Nessuna visita a domicilio prevista per oggi",
    emptyBody: "Registra una nuova visita a domicilio o apri il calendario per i controlli programmati.",
    newVisit: "Nuova visita",
    openCalendar: "Apri calendario",
    urgent: "Urgente",
    completed: "Conclusa",
    arrivedStatus: "Sul posto",
    purpose: "Motivo:",
    openMap: "Apri mappa",
    callPatient: "Chiama",
    arrived: "Sono sul posto",
    addMeasurements: "Aggiungi misure",
    connectDoctor: "Collega medico",
    endVisit: "Chiudi visita",
    seed: {
      "visit-1": { patientAge: "68 anni", purpose: "Misurazione della pressione e controllo della ricetta" },
      "visit-2": { patientAge: "74 anni", purpose: "Controllo della glicemia e videochiamata con il medico" },
      "visit-3": { patientAge: "24 anni, incinta al 7° mese", purpose: "Iscrizione ai controlli prenatali e pratica CNAS" },
      "visit-4": { patientAge: "5 anni, con la mamma", purpose: "Controllo della febbre e aiuto per la visita dal pediatra" },
    } as VisitSeedText,
  },
  hr: {
    title: (n: number) => `Današnji posjeti (${n})`,
    headingPlain: "Današnji posjeti",
    progress: (done: number, total: number) => `${done} od ${total} obavljeno`,
    demoNotice: "Ogledni posjeti za demo prikaz.",
    emptyTitle: "Danas nema zakazanih kućnih posjeta",
    emptyBody: "Upišite novi kućni posjet ili otvorite kalendar za zakazane kontrolne preglede.",
    newVisit: "Novi posjet",
    openCalendar: "Otvori kalendar",
    urgent: "Hitno",
    completed: "Obavljeno",
    arrivedStatus: "Na adresi",
    purpose: "Razlog:",
    openMap: "Otvori kartu",
    callPatient: "Nazovi",
    arrived: "Na adresi sam",
    addMeasurements: "Dodaj mjerenja",
    connectDoctor: "Spoji liječnika",
    endVisit: "Završi posjet",
    seed: {
      "visit-1": { patientAge: "68 god.", purpose: "Mjerenje krvnog tlaka i provjera recepta" },
      "visit-2": { patientAge: "74 god.", purpose: "Provjera glukoze u krvi i videokonzultacija s liječnikom" },
      "visit-3": { patientAge: "24 god., 7. mjesec trudnoće", purpose: "Prijava na prenatalne preglede i zdravstvena iskaznica" },
      "visit-4": { patientAge: "5 god., s majkom", purpose: "Provjera tjelesne temperature i naručivanje pedijatru" },
    } as VisitSeedText,
  },
  rom: {
    title: (n: number) => `Adyesutne vizite (${n})`,
    headingPlain: "Adyesutne vizite",
    progress: (done: number, total: number) => `${done} katar ${total} getosarde`,
    demoNotice: "Demo vizite vash dikhiben.",
    emptyTitle: "Nane khere vizite planisarde adyes",
    emptyBody: "Lekhav nevi vizita khere vay putar o kalendaro te dikhes le planisarde kontrole.",
    newVisit: "Nevi vizita",
    openCalendar: "Putar kalendaro",
    urgent: "Sigo",
    completed: "Getosardi",
    arrivedStatus: "Ko than",
    purpose: "Soske:",
    openMap: "Putar mapa",
    callPatient: "Mar telefono",
    arrived: "Reslyom",
    addMeasurements: "Tho merimata",
    connectDoctor: "Phand doktoresa",
    endVisit: "Phand vizita",
    seed: {
      "visit-1": { patientAge: "68 borsha", purpose: "Meripe vash phurdimos e ratesko thaj dikhlipe e receptako" },
      "visit-2": { patientAge: "74 borsha", purpose: "Kontrola vash zaharo and-o rat thaj video-svato e doktoresa" },
      "visit-3": { patientAge: "24 borsha, phari and-o 7-to chhon", purpose: "Lekhavipe vash kontrole angla bijandipe thaj dosaro CNAS" },
      "visit-4": { patientAge: "5 borsha, e dayasa", purpose: "Dikhlipe e tatipnasko thaj vrama ko chhavorengo doktori" },
    } as VisitSeedText,
  },
};

export interface ScheduledHomeVisit {
  id: string;
  time: string;
  patientName: string;
  patientAge: string;
  address: string;
  phone: string;
  purpose: string;
  urgency: "low" | "moderate" | "high";
  status: "scheduled" | "arrived" | "completed";
}

const DEMO_TODAY_VISITS: ScheduledHomeVisit[] = [
  {
    id: "visit-1",
    time: "09:30",
    patientName: "Maria Demo",
    patientAge: "68 ani",
    address: "Strada Livezilor nr. 14",
    phone: "0721 112 233",
    purpose: "Măsurarea tensiunii și verificarea rețetei",
    urgency: "moderate",
    status: "completed",
  },
  {
    id: "visit-2",
    time: "11:00",
    patientName: "Ion Demo",
    patientAge: "74 ani",
    address: "Ulița Mare nr. 8",
    phone: "0732 445 566",
    purpose: "Control glicemie și apel video cu medicul",
    urgency: "high",
    status: "arrived",
  },
  {
    id: "visit-3",
    time: "13:30",
    patientName: "Elena Demo",
    patientAge: "24 ani, însărcinată în luna a 7-a",
    address: "Strada Dealului nr. 22",
    phone: "0745 778 899",
    purpose: "Înscriere la controale prenatale și dosar CNAS",
    urgency: "moderate",
    status: "scheduled",
  },
  {
    id: "visit-4",
    time: "15:00",
    patientName: "Vasile Demo",
    patientAge: "5 ani, cu mama",
    address: "Strada Nouă nr. 3",
    phone: "0766 001 122",
    purpose: "Verificare febră și programare la pediatru",
    urgency: "high",
    status: "scheduled",
  },
];

const actionOutlineClass =
  "inline-flex min-h-11 items-center justify-center whitespace-nowrap rounded-lg border border-[#8a94a6] bg-[var(--panel-surface)] px-3 py-2 text-sm font-medium text-[var(--panel-ink)] transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-[var(--panel-selection)] motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sapphire dark:border-[var(--panel-line)] dark:focus-visible:outline-[#bad7fa]";

const actionPrimaryClass =
  "inline-flex min-h-11 items-center justify-center whitespace-nowrap rounded-lg border border-sapphire bg-sapphire px-3.5 py-2 text-sm font-medium text-white transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-[#28476f] motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sapphire dark:focus-visible:outline-[#bad7fa]";

export function HomeVisitsList({
  initialVisits,
  onStartIntake,
  onLaunchHandover,
  onLaunchTelemetry,
}: {
  initialVisits?: ScheduledHomeVisit[];
  onStartIntake?: () => void;
  onLaunchHandover?: (visit: ScheduledHomeVisit) => void;
  onLaunchTelemetry?: (visit: ScheduledHomeVisit) => void;
}) {
  const { lang } = useSafeLanguage();
  const { demo } = usePanelRuntime();
  const copy = visitsCopy[lang] ?? visitsCopy.ro;

  const isDemoPreview = !initialVisits && demo;
  const [baseVisits, setVisits] = useState<ScheduledHomeVisit[]>(
    () => initialVisits ?? (demo ? DEMO_TODAY_VISITS : []),
  );

  const visits = isDemoPreview
    ? baseVisits.map((v) => ({ ...v, ...(copy.seed[v.id] ?? {}) }))
    : baseVisits;

  const updateStatus = (id: string, status: "scheduled" | "arrived" | "completed") => {
    setVisits((prev) =>
      prev.map((v) => (v.id === id ? { ...v, status } : v)),
    );
  };

  const completedCount = visits.filter((v) => v.status === "completed").length;

  return (
    <section aria-labelledby="home-visits-heading">
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[var(--panel-line)] pb-3">
        <h2
          id="home-visits-heading"
          className="text-lg font-semibold text-[var(--panel-ink)] tabular-nums"
        >
          {visits.length > 0 ? copy.title(visits.length) : copy.headingPlain}
        </h2>

        {visits.length > 0 && (
          <p className="text-sm tabular-nums text-[var(--panel-muted)]">
            {copy.progress(completedCount, visits.length)}
          </p>
        )}
      </div>

      {isDemoPreview && (
        <p className="mt-2 text-xs text-[var(--panel-muted)]">
          {copy.demoNotice}
        </p>
      )}

      {visits.length === 0 ? (
        <div className="py-12">
          <h3 className="text-base font-semibold text-[var(--panel-ink)]">
            {copy.emptyTitle}
          </h3>
          <p className="mt-1.5 max-w-[54ch] text-sm leading-relaxed text-[var(--panel-muted)]">
            {copy.emptyBody}
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-2">
            {onStartIntake && (
              <button
                type="button"
                onClick={onStartIntake}
                className={actionPrimaryClass}
              >
                {copy.newVisit}
              </button>
            )}
            <Link
              href={withLangPrefix("/panel/calendar", lang)}
              className={actionOutlineClass}
            >
              {copy.openCalendar}
            </Link>
          </div>
        </div>
      ) : (
        <ul className="divide-y divide-[var(--panel-line)]">
          {visits.map((visit) => {
            const isArrived = visit.status === "arrived";
            const isCompleted = visit.status === "completed";

            return (
              <li
                key={visit.id}
                className={`py-4 transition-colors duration-[var(--dur-fast)] ${
                  isArrived
                    ? "-mx-4 bg-[var(--panel-selection)] px-4 sm:-mx-6 sm:px-6"
                    : isCompleted
                      ? "opacity-75"
                      : ""
                }`}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex min-w-0 items-baseline gap-4">
                    <span className="w-12 shrink-0 text-sm font-semibold tabular-nums text-[var(--panel-ink)]">
                      {visit.time}
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5">
                        <h3 className="text-base font-semibold text-[var(--panel-ink)]">
                          {visit.patientName}
                        </h3>
                        <span className="text-sm text-[var(--panel-muted)]">
                          {visit.patientAge}
                        </span>
                        {visit.urgency === "high" && !isCompleted && (
                          <span className="text-sm font-semibold text-[#b91c1c] dark:text-[#ffb4b4]">
                            {copy.urgent}
                          </span>
                        )}
                        {isArrived && (
                          <span className="text-sm font-semibold text-sapphire dark:text-[#bad7fa]">
                            {copy.arrivedStatus}
                          </span>
                        )}
                        {isCompleted && (
                          <span className="text-sm text-[var(--panel-muted)]">
                            {copy.completed}
                          </span>
                        )}
                      </div>

                      <p className="mt-1 text-sm text-[var(--panel-muted)]">
                        {visit.address}
                      </p>
                      <p className="mt-1 text-sm text-[var(--panel-ink)]">
                        <span className="text-[var(--panel-muted)]">{copy.purpose} </span>
                        {visit.purpose}
                      </p>
                    </div>
                  </div>
                </div>

                {/* One-handed wrapping action row */}
                <div className="mt-3 flex flex-wrap items-center gap-2 sm:pl-16">
                  <a
                    href={`tel:${visit.phone.replace(/\s+/g, "")}`}
                    className={actionOutlineClass}
                  >
                    {copy.callPatient}
                  </a>

                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(visit.address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={actionOutlineClass}
                  >
                    {copy.openMap}
                  </a>

                  {!isCompleted && !isArrived && (
                    <button
                      type="button"
                      onClick={() => updateStatus(visit.id, "arrived")}
                      className={actionPrimaryClass}
                    >
                      {copy.arrived}
                    </button>
                  )}

                  {isArrived && (
                    <>
                      {onLaunchTelemetry && (
                        <button
                          type="button"
                          onClick={() => onLaunchTelemetry(visit)}
                          className={actionOutlineClass}
                        >
                          {copy.addMeasurements}
                        </button>
                      )}

                      {onLaunchHandover && (
                        <button
                          type="button"
                          onClick={() => onLaunchHandover(visit)}
                          className={actionPrimaryClass}
                        >
                          {copy.connectDoctor}
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => updateStatus(visit.id, "completed")}
                        className={actionOutlineClass}
                      >
                        {copy.endVisit}
                      </button>
                    </>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
