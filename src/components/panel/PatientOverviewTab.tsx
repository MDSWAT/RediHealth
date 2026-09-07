/* eslint-disable @next/next/no-img-element */
"use client";

import { useMemo, useState } from "react";

import {
  CheckCircleIcon,
  EditIcon,
  MailIcon,
  PhoneIcon,
  PlusIcon,
} from "@/components/ui/icons";
import { useLanguage } from "@/lib/i18n/language-context";
import type {
  PatientItem,
  PatientPriority,
  PatientStatus,
  TreatmentPlan,
} from "@/lib/types/patient";

interface PatientOverviewTabProps {
  patient: PatientItem;
  status: PatientStatus;
  priority: PatientPriority;
  assignedWorkerIds: string[];
  workersList: { id: string; full_name: string; role: string }[];
  isUpdatingStatus: boolean;
  isUpdatingPriority: boolean;
  isUpdatingWorker: boolean;
  treatmentPlan: TreatmentPlan;
  hasTreatmentPlan: boolean;
  onStatusChange: (status: PatientStatus) => void;
  onPriorityChange: (priority: PatientPriority) => void;
  onWorkerChange: (workerIds: string[]) => void;
  onGoToTreatmentTab: () => void;
}

export function PatientOverviewTab({
  patient,
  status,
  priority,
  assignedWorkerIds,
  workersList,
  isUpdatingStatus,
  isUpdatingPriority,
  isUpdatingWorker,
  treatmentPlan,
  hasTreatmentPlan,
  onStatusChange,
  onPriorityChange,
  onWorkerChange,
  onGoToTreatmentTab,
}: PatientOverviewTabProps) {
  const { lang } = useLanguage();
  const t = {
    en: {
      phone: "Phone Contact",
      email: "Email Contact",
      dob: "Date of Birth",
      gender: "Gender",
      address: "Address / Location",
      notProvided: "Not provided",
      notSpecified: "Not specified",
      updateStatus: "Update Care Status",
      active: "Active Care",
      inactive: "Inactive Care",
      archived: "Archived Record",
      updatePriority: "Update Urgency Priority Level",
      worker: "Assigned Healthcare Worker",
      selected: "selected",
      unassigned: "Unassigned",
      selectVisible: "Select visible",
      clear: "Clear",
      searchWorker: "Search doctor or role...",
      noMatches: "No matches for this search.",
      summary: "Condition & Symptoms Summary",
      noCondition: "No condition notes recorded.",
      history: "Medical History Notes",
      noHistory: "No medical history recorded.",
      treatmentTitle: "Current Active Treatment Plan",
      editTreatment: "Edit Treatment Plan",
      setupTreatment: "Set Up Treatment Plan",
      diagnosis: "Primary Diagnosis & Findings",
      goals: "Care Goals & Objectives",
      meds: "Prescribed Medications & Therapies",
      instructions: "Care Instructions",
      treatmentPhotos: "Treatment Plan Photos & Documents",
    },
    ro: {
      phone: "Telefon contact",
      email: "Email contact",
      dob: "Data nasterii",
      gender: "Gen",
      address: "Adresa / Locatie",
      notProvided: "Nespecificat",
      notSpecified: "Nespecificat",
      updateStatus: "Actualizeaza statusul ingrijirii",
      active: "Ingrijire activa",
      inactive: "Ingrijire inactiva",
      archived: "Dosar arhivat",
      updatePriority: "Actualizeaza prioritatea urgentei",
      worker: "Lucrator medical alocat",
      selected: "selectati",
      unassigned: "Nealocat",
      selectVisible: "Selecteaza vizibile",
      clear: "Curata",
      searchWorker: "Cauta doctor sau rol...",
      noMatches: "Nicio potrivire pentru aceasta cautare.",
      summary: "Rezumat afectiuni si simptome",
      noCondition: "Nu exista notite clinice.",
      history: "Notite istoric medical",
      noHistory: "Nu exista istoric medical.",
      treatmentTitle: "Plan de tratament activ",
      editTreatment: "Editeaza planul",
      setupTreatment: "Configureaza planul",
      diagnosis: "Diagnostic principal si constatari",
      goals: "Obiective de ingrijire",
      meds: "Medicamente si terapii prescrise",
      instructions: "Instructiuni de ingrijire",
      treatmentPhotos: "Poze si documente plan tratament",
    },
    sq: {
      phone: "Kontakt telefoni",
      email: "Kontakt email",
      dob: "Datelindja",
      gender: "Gjinia",
      address: "Adresa / Vendndodhja",
      notProvided: "Nuk eshte dhene",
      notSpecified: "Nuk eshte specifikuar",
      updateStatus: "Perditeso statusin e kujdesit",
      active: "Kujdes aktiv",
      inactive: "Kujdes joaktiv",
      archived: "Dosje e arkivuar",
      updatePriority: "Perditeso nivelin e urgjences",
      worker: "Punonjesi shendetesor i caktuar",
      selected: "te zgjedhur",
      unassigned: "Pacaktuar",
      selectVisible: "Zgjidh te dukshmit",
      clear: "Pastro",
      searchWorker: "Kerko doktor ose rol...",
      noMatches: "Asnje rezultat per kete kerkime.",
      summary: "Permbledhje e gjendjes dhe simptomave",
      noCondition: "Nuk ka shenime mbi gjendjen.",
      history: "Shenime te historikut mjekesor",
      noHistory: "Nuk ka histori mjekesore.",
      treatmentTitle: "Plani aktiv i trajtimit",
      editTreatment: "Ndrysho planin",
      setupTreatment: "Konfiguro planin",
      diagnosis: "Diagnoza kryesore dhe gjetjet",
      goals: "Qellimet e kujdesit",
      meds: "Medikamente dhe terapi te pershkruara",
      instructions: "Udhezime kujdesi",
      treatmentPhotos: "Foto dhe dokumente te planit",
    },
    it: {
      phone: "Contatto telefonico",
      email: "Contatto email",
      dob: "Data di nascita",
      gender: "Genere",
      address: "Indirizzo / Localita",
      notProvided: "Non indicato",
      notSpecified: "Non specificato",
      updateStatus: "Aggiorna stato assistenza",
      active: "Assistenza attiva",
      inactive: "Assistenza inattiva",
      archived: "Scheda archiviata",
      updatePriority: "Aggiorna livello priorita",
      worker: "Operatore sanitario assegnato",
      selected: "selezionati",
      unassigned: "Non assegnato",
      selectVisible: "Seleziona visibili",
      clear: "Svuota",
      searchWorker: "Cerca medico o ruolo...",
      noMatches: "Nessun risultato per questa ricerca.",
      summary: "Riepilogo condizione e sintomi",
      noCondition: "Nessuna nota clinica registrata.",
      history: "Note storia clinica",
      noHistory: "Nessuna storia clinica registrata.",
      treatmentTitle: "Piano di trattamento attivo",
      editTreatment: "Modifica piano",
      setupTreatment: "Configura piano",
      diagnosis: "Diagnosi principale e riscontri",
      goals: "Obiettivi di cura",
      meds: "Farmaci e terapie prescritti",
      instructions: "Istruzioni di cura",
      treatmentPhotos: "Foto e documenti piano cura",
    },
  }[lang];
  const [workerSearchQuery, setWorkerSearchQuery] = useState("");

  const filteredWorkers = useMemo(() => {
    const query = workerSearchQuery.trim().toLowerCase();
    if (!query) {
      return workersList;
    }
    return workersList.filter((worker) => {
      const haystack = `${worker.full_name} ${worker.role}`.toLowerCase();
      return haystack.includes(query);
    });
  }, [workersList, workerSearchQuery]);

  function selectAllVisibleWorkers() {
    if (filteredWorkers.length === 0) {
      return;
    }
    const next = new Set(assignedWorkerIds);
    for (const worker of filteredWorkers) {
      next.add(worker.id);
    }
    onWorkerChange([...next]);
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-2xl border border-border bg-card p-5">
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            {t.phone}
          </p>
          <a
            href={`tel:${patient.phone}`}
            className="mt-1 inline-flex items-center gap-2 text-base font-semibold text-primary hover:underline"
          >
            <PhoneIcon className="h-4 w-4" />
            <span>{patient.phone}</span>
          </a>
        </div>

        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            {t.email}
          </p>
          <a
            href={`mailto:${patient.email}`}
            className="mt-1 inline-flex items-center gap-2 text-base font-semibold text-primary hover:underline"
          >
            <MailIcon className="h-4 w-4" />
            <span>{patient.email}</span>
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 rounded-2xl border border-border bg-card p-5">
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            {t.dob}
          </p>
          <p className="mt-1 text-sm font-medium text-foreground">
            {patient.date_of_birth || t.notProvided}
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            {t.gender}
          </p>
          <p className="mt-1 text-sm font-medium text-foreground">
            {patient.gender || t.notSpecified}
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            {t.address}
          </p>
          <p className="mt-1 text-sm font-medium text-foreground">
            {patient.address || t.notProvided}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="text-xs font-semibold text-foreground mb-1.5 block">
            {t.updateStatus}
          </label>
          <select
            value={status}
            disabled={isUpdatingStatus}
            onChange={(e) => onStatusChange(e.target.value as PatientStatus)}
            className="w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
          >
            <option value="active">{t.active}</option>
            <option value="inactive">{t.inactive}</option>
            <option value="archived">{t.archived}</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-foreground mb-1.5 block">
            {t.updatePriority}
          </label>
          <select
            value={priority}
            disabled={isUpdatingPriority}
            onChange={(e) => onPriorityChange(e.target.value as PatientPriority)}
            className="w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm font-bold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
          >
            <option value="critical">🔴 Critical Priority (Follow-up &lt; 24h)</option>
            <option value="high">🟠 High Priority (Follow-up &lt; 3 days)</option>
            <option value="moderate">🟡 Moderate Priority (Follow-up &lt; 7 days)</option>
            <option value="low">🟢 Low Priority (Follow-up &lt; 14 days)</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-foreground mb-1.5 block">
            {t.worker}
          </label>
          <div className="rounded-xl border border-border bg-card p-2.5">
            <div className="mb-2 flex items-center justify-between gap-2 text-xs">
              <span className="font-semibold text-foreground">
                {assignedWorkerIds.length > 0 ? `${assignedWorkerIds.length} ${t.selected}` : t.unassigned}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={isUpdatingWorker || filteredWorkers.length === 0}
                  onClick={selectAllVisibleWorkers}
                  className="text-primary hover:underline disabled:opacity-50"
                >
                  {t.selectVisible}
                </button>
                <button
                  type="button"
                  disabled={isUpdatingWorker || assignedWorkerIds.length === 0}
                  onClick={() => onWorkerChange([])}
                  className="text-primary hover:underline disabled:opacity-50"
                >
                  {t.clear}
                </button>
              </div>
            </div>
            <input
              type="text"
              value={workerSearchQuery}
              onChange={(event) => setWorkerSearchQuery(event.target.value)}
              placeholder={t.searchWorker}
              className="mb-2 w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              disabled={isUpdatingWorker}
            />
            <div className="max-h-36 space-y-1 overflow-y-auto">
              {filteredWorkers.map((w) => {
              const selected = assignedWorkerIds.includes(w.id);
              return (
                <label
                  key={w.id}
                  className={`flex cursor-pointer items-start gap-2 rounded-md px-2 py-1.5 text-xs transition-colors ${
                    selected ? "bg-primary-soft text-foreground" : "text-foreground hover:bg-muted"
                  } ${isUpdatingWorker ? "opacity-50" : ""}`}
                >
                  <input
                    type="checkbox"
                    disabled={isUpdatingWorker}
                    checked={selected}
                    onChange={() => {
                      const next = selected
                        ? assignedWorkerIds.filter((id) => id !== w.id)
                        : [...assignedWorkerIds, w.id];
                      onWorkerChange(next);
                    }}
                    className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-ring"
                  />
                  <span>{w.full_name} ({w.role})</span>
                </label>
              );
              })}
              {filteredWorkers.length === 0 ? (
                <p className="px-2 py-1.5 text-xs text-muted-foreground">{t.noMatches}</p>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-1.5">
          <EditIcon className="h-4 w-4 text-primary" />
          <span>{t.summary}</span>
        </h3>
        <div className="rounded-2xl border border-border bg-card p-5 text-sm leading-relaxed text-foreground whitespace-pre-wrap">
          {patient.condition_notes || t.noCondition}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-1.5">
          <CheckCircleIcon className="h-4 w-4 text-primary" />
          <span>{t.history}</span>
        </h3>
        <div className="rounded-2xl border border-border bg-card p-5 text-sm leading-relaxed text-foreground whitespace-pre-wrap">
          {patient.medical_history || t.noHistory}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
            <EditIcon className="h-4 w-4 text-primary" />
            <span>{t.treatmentTitle}</span>
          </h3>
          <button
            type="button"
            onClick={onGoToTreatmentTab}
            className="text-xs font-semibold text-primary hover:underline"
          >
            {hasTreatmentPlan ? t.editTreatment : t.setupTreatment}
          </button>
        </div>

        {hasTreatmentPlan ? (
          <div className="rounded-2xl border border-primary/20 bg-primary-soft/30 p-5 space-y-4">
            {treatmentPlan.diagnosis ? (
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                  {t.diagnosis}
                </p>
                <p className="mt-1 text-sm text-foreground whitespace-pre-wrap font-medium">
                  {treatmentPlan.diagnosis}
                </p>
              </div>
            ) : null}

            {treatmentPlan.goals ? (
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                  {t.goals}
                </p>
                <p className="mt-1 text-sm text-foreground whitespace-pre-wrap">
                  {treatmentPlan.goals}
                </p>
              </div>
            ) : null}

            {treatmentPlan.medications ? (
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                  {t.meds}
                </p>
                <p className="mt-1 text-sm text-foreground whitespace-pre-wrap">
                  {treatmentPlan.medications}
                </p>
              </div>
            ) : null}

            {treatmentPlan.care_instructions ? (
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                  {t.instructions}
                </p>
                <p className="mt-1 text-sm text-foreground whitespace-pre-wrap">
                  {treatmentPlan.care_instructions}
                </p>
              </div>
            ) : null}

            {treatmentPlan.photos && treatmentPlan.photos.length > 0 ? (
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">
                  {t.treatmentPhotos} ({treatmentPlan.photos.length})
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {treatmentPlan.photos.map((photo) => (
                    <div
                      key={photo.id}
                      className="rounded-xl border border-border bg-card p-2 text-xs"
                    >
                      <img
                        src={photo.data_url}
                        alt={photo.name}
                        className="h-20 w-full object-cover rounded-lg border border-border mb-1"
                      />
                      <p className="font-semibold text-foreground truncate" title={photo.name}>
                        {photo.name}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-card p-6 text-center text-xs text-muted-foreground">
            <span>
              No treatment plan set up yet. Click below to add diagnosis, medications, care instructions, and photos.
            </span>
            <div className="mt-3">
              <button
                type="button"
                onClick={onGoToTreatmentTab}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-3.5 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20"
              >
                <PlusIcon className="h-4 w-4" />
                <span>Set Up Treatment Plan</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
