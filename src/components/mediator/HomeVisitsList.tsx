"use client";

import { useState } from "react";
import { ClockIcon, PhoneIcon, PinIcon } from "@/components/ui/icons";
import { useLanguage } from "@/lib/i18n/language-context";
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
  ro: {
    title: (n: number) => `Vizitele de azi (${n})`,
    subtitle: "În ordinea orei.",
    progress: (done: number, total: number) => `${done} din ${total} încheiate`,
    urgent: "Urgent",
    completed: "Încheiată",
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
    subtitle: "Sorted by time.",
    progress: (done: number, total: number) => `${done} of ${total} done`,
    urgent: "Urgent",
    completed: "Done",
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
    subtitle: "Sipas orës.",
    progress: (done: number, total: number) => `${done} nga ${total} të mbyllura`,
    urgent: "Urgjent",
    completed: "E mbyllur",
    purpose: "Arsyeja:",
    openMap: "Hap hartën",
    callPatient: "Telefono pacientin",
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
    subtitle: "In ordine di orario.",
    progress: (done: number, total: number) => `${done} di ${total} concluse`,
    urgent: "Urgente",
    completed: "Conclusa",
    purpose: "Motivo:",
    openMap: "Apri la mappa",
    callPatient: "Chiama il paziente",
    arrived: "Sono sul posto",
    addMeasurements: "Aggiungi misurazioni",
    connectDoctor: "Collega il medico",
    endVisit: "Chiudi la visita",
    seed: {
      "visit-1": { patientAge: "68 anni", purpose: "Misurazione della pressione e controllo della ricetta" },
      "visit-2": { patientAge: "74 anni", purpose: "Controllo della glicemia e videochiamata con il medico" },
      "visit-3": { patientAge: "24 anni, incinta al 7° mese", purpose: "Iscrizione ai controlli prenatali e pratica CNAS" },
      "visit-4": { patientAge: "5 anni, con la mamma", purpose: "Controllo della febbre e aiuto per la visita dal pediatra" },
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

const DEFAULT_TODAY_VISITS: ScheduledHomeVisit[] = [
  {
    id: "visit-1",
    time: "09:30",
    patientName: "Maria Căldăraru",
    patientAge: "68 ani",
    address: "Strada Livezilor nr. 14, Toflea",
    phone: "0721 112 233",
    purpose: "Măsurarea tensiunii și verificarea rețetei",
    urgency: "moderate",
    status: "completed",
  },
  {
    id: "visit-2",
    time: "11:00",
    patientName: "Ion Stănescu",
    patientAge: "74 ani",
    address: "Ulița Mare nr. 8, Toflea",
    phone: "0732 445 566",
    purpose: "Control glicemie și apel video cu medicul",
    urgency: "high",
    status: "arrived",
  },
  {
    id: "visit-3",
    time: "13:30",
    patientName: "Elena Mihai",
    patientAge: "24 ani, însărcinată în luna a 7-a",
    address: "Strada Dealului nr. 22, Ghidigeni",
    phone: "0745 778 899",
    purpose: "Înscriere la controale prenatale și dosar CNAS",
    urgency: "moderate",
    status: "scheduled",
  },
  {
    id: "visit-4",
    time: "15:00",
    patientName: "Vasile Radu",
    patientAge: "5 ani, cu mama",
    address: "Cătunul Nou nr. 3, Brăhășești",
    phone: "0766 001 122",
    purpose: "Verificare febră și programare la pediatru",
    urgency: "high",
    status: "scheduled",
  },
];

export function HomeVisitsList({
  onLaunchHandover,
  onLaunchTelemetry,
}: {
  onLaunchHandover?: (visit: ScheduledHomeVisit) => void;
  onLaunchTelemetry?: (visit: ScheduledHomeVisit) => void;
}) {
  const { lang } = useSafeLanguage();
  const copy = visitsCopy[lang] ?? visitsCopy.ro;
  const [baseVisits, setVisits] = useState<ScheduledHomeVisit[]>(DEFAULT_TODAY_VISITS);
  // Demo seed text (age, purpose) is shown in the active language.
  const visits = baseVisits.map((v) => ({ ...v, ...(copy.seed[v.id] ?? {}) }));

  const updateStatus = (id: string, status: "scheduled" | "arrived" | "completed") => {
    setVisits((prev) =>
      prev.map((v) => (v.id === id ? { ...v, status } : v))
    );
  };

  const completedCount = visits.filter((v) => v.status === "completed").length;

  return (
    <div className="rounded-lg border border-border bg-card p-5 shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <ClockIcon className="h-4 w-4 text-sapphire" />
            <h2 className="text-base font-bold text-foreground">
              {copy.title(visits.length)}
            </h2>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {copy.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-md border border-border bg-muted/60 px-2.5 py-1 text-xs font-semibold text-foreground">
            {copy.progress(completedCount, visits.length)}
          </span>
        </div>
      </div>

      {/* Visits list */}
      <div className="mt-4 space-y-4">
        {visits.map((visit) => {
          const isArrived = visit.status === "arrived";
          const isCompleted = visit.status === "completed";

          return (
            <div
              key={visit.id}
              className={`rounded-lg border p-4 transition-all ${
                isCompleted
                  ? "border-border bg-muted/40 opacity-80"
                  : isArrived
                  ? "border-sapphire bg-sapphire/5 shadow-xs"
                  : "border-border bg-background"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-12 shrink-0 items-center justify-center rounded-md border border-border bg-muted/60 font-mono text-xs font-bold text-foreground">
                    {visit.time}
                  </span>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-bold text-foreground">
                        {visit.patientName}
                      </h3>
                      <span className="text-xs text-muted-foreground">
                        ({visit.patientAge})
                      </span>
                      {visit.urgency === "high" && (
                        <span className="rounded-md border border-red-500/30 bg-red-500/10 px-2 py-0.5 text-[11px] font-semibold text-red-600">
                          {copy.urgent}
                        </span>
                      )}
                      {isCompleted && (
                        <span className="rounded-md border border-border bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
                          {copy.completed}
                        </span>
                      )}
                    </div>

                    <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                      <PinIcon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                      {visit.address}
                    </p>
                    <p className="mt-0.5 text-xs font-medium text-foreground">
                      {copy.purpose} {visit.purpose}
                    </p>
                  </div>
                </div>

                {/* Map navigation button */}
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(visit.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-md border border-border bg-muted/40 px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted shrink-0"
                >
                  {copy.openMap}
                </a>
              </div>

              {/* Action row on card */}
              <div className="mt-4 pt-3 border-t border-border flex flex-wrap items-center gap-2">
                <a
                  href={`tel:${visit.phone.replace(/\s+/g, "")}`}
                  className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted"
                >
                  <PhoneIcon className="h-3.5 w-3.5 text-sapphire" />
                  {copy.callPatient}
                </a>

                {!isCompleted && !isArrived && (
                  <button
                    type="button"
                    onClick={() => updateStatus(visit.id, "arrived")}
                    className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted"
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
                        className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-md border border-sapphire/30 bg-sapphire/10 px-3 py-1.5 text-xs font-semibold text-sapphire"
                      >
                        {copy.addMeasurements}
                      </button>
                    )}

                    {onLaunchHandover && (
                      <button
                        type="button"
                        onClick={() => onLaunchHandover(visit)}
                        className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-md bg-sapphire px-3 py-1.5 text-xs font-semibold text-white hover:bg-sapphire-light"
                      >
                        {copy.connectDoctor}
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => updateStatus(visit.id, "completed")}
                      className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-hover"
                    >
                      {copy.endVisit}
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
