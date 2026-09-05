"use client";

import { useMemo, useState } from "react";
import {
  CheckCircleIcon,
  CloseIcon,
  SearchIcon,
  StethoscopeIcon,
  UserIcon,
} from "@/components/ui/icons";
import { useLanguage } from "@/lib/i18n/language-context";
import type { PatientItem } from "@/lib/types/patient";
import type { WorkerItem } from "@/lib/types/worker";

interface AssignPatientsModalProps {
  worker: WorkerItem;
  patients: PatientItem[];
  onClose: () => void;
  onSuccess: (updatedPatients: PatientItem[]) => void;
}

export function AssignPatientsModal({
  worker,
  patients,
  onClose,
  onSuccess,
}: AssignPatientsModalProps) {
  const { lang } = useLanguage();
  const t = {
    en: {
      errSave: "Failed to save assignments.",
      errUnexpected: "An error occurred while saving assignments.",
      title: "Assign Patients to Worker",
      assignedCount: (count: number) => `${count} patient(s) assigned`,
      success: "Assignments saved successfully!",
      search: "Search patients to assign...",
      none: "No matching patients found.",
      assignedTo: "Assigned to",
      otherWorker: "other worker",
      assigned: "Assigned",
      unassigned: "Unassigned",
      selectedCount: (count: number) => `${count} patient(s) selected`,
      cancel: "Cancel",
      saving: "Saving...",
      save: "Save Assignments",
    },
    ro: {
      errSave: "Salvarea alocarilor a esuat.",
      errUnexpected: "A aparut o eroare la salvarea alocarilor.",
      title: "Aloca pacienti lucratorului",
      assignedCount: (count: number) => `${count} pacient(i) alocat(i)`,
      success: "Alocarile au fost salvate!",
      search: "Cauta pacienti pentru alocare...",
      none: "Nu exista pacienti care corespund cautarii.",
      assignedTo: "Alocat la",
      otherWorker: "alt lucrator",
      assigned: "Alocat",
      unassigned: "Nealocat",
      selectedCount: (count: number) => `${count} pacient(i) selectat(i)`,
      cancel: "Anuleaza",
      saving: "Se salveaza...",
      save: "Salveaza alocarile",
    },
    sq: {
      errSave: "Ruajtja e caktimeve deshtoi.",
      errUnexpected: "Ndodhi nje gabim gjate ruajtjes se caktimeve.",
      title: "Cakto pacientet te punonjesi",
      assignedCount: (count: number) => `${count} pacient(e) te caktuar`,
      success: "Caktimet u ruajten me sukses!",
      search: "Kerko paciente per caktim...",
      none: "Nuk u gjeten paciente qe perputhen.",
      assignedTo: "I caktuar te",
      otherWorker: "punonjes tjeter",
      assigned: "I caktuar",
      unassigned: "Pacaktuar",
      selectedCount: (count: number) => `${count} pacient(e) te zgjedhur`,
      cancel: "Anulo",
      saving: "Duke ruajtur...",
      save: "Ruaj caktimet",
    },
    it: {
      errSave: "Salvataggio assegnazioni non riuscito.",
      errUnexpected: "Si e verificato un errore durante il salvataggio delle assegnazioni.",
      title: "Assegna pazienti all'operatore",
      assignedCount: (count: number) => `${count} paziente(i) assegnato(i)`,
      success: "Assegnazioni salvate con successo!",
      search: "Cerca pazienti da assegnare...",
      none: "Nessun paziente corrispondente trovato.",
      assignedTo: "Assegnato a",
      otherWorker: "altro operatore",
      assigned: "Assegnato",
      unassigned: "Non assegnato",
      selectedCount: (count: number) => `${count} paziente(i) selezionato(i)`,
      cancel: "Annulla",
      saving: "Salvataggio...",
      save: "Salva assegnazioni",
    },
  }[lang];

  const [patientList] = useState<PatientItem[]>(patients);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [assignedIds, setAssignedIds] = useState<Set<string>>(() => {
    const set = new Set<string>();
    for (const p of patients) {
      if (p.assigned_worker_id === worker.id) {
        set.add(p.id);
      }
    }
    return set;
  });

  const filteredPatients = useMemo(() => {
    if (!searchQuery.trim()) return patientList;
    const q = searchQuery.toLowerCase();
    return patientList.filter(
      (p) =>
        p.full_name.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q) ||
        p.phone.includes(q),
    );
  }, [patientList, searchQuery]);

  function togglePatientAssignment(patientId: string) {
    setAssignedIds((prev) => {
      const next = new Set(prev);
      if (next.has(patientId)) {
        next.delete(patientId);
      } else {
        next.add(patientId);
      }
      return next;
    });
  }

  async function handleSaveAssignments() {
    setIsSaving(true);
    setErrorMessage(null);
    setSaveSuccess(false);

    const toAssign: string[] = [];
    const toUnassign: string[] = [];

    for (const p of patientList) {
      const isCurrentlyAssigned = p.assigned_worker_id === worker.id;
      const isSelectedInModal = assignedIds.has(p.id);

      if (!isCurrentlyAssigned && isSelectedInModal) {
        toAssign.push(p.id);
      } else if (isCurrentlyAssigned && !isSelectedInModal) {
        toUnassign.push(p.id);
      }
    }

    try {
      const response = await fetch("/api/workers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: worker.id,
          assign_patient_ids: toAssign,
          unassign_patient_ids: toUnassign,
        }),
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        setErrorMessage(data.error || t.errSave);
        return;
      }

      setSaveSuccess(true);

      const updatedPatients = patientList.map((p) => {
        if (toAssign.includes(p.id)) {
          return {
            ...p,
            assigned_worker_id: worker.id,
            assigned_worker_name: worker.full_name,
          };
        }
        if (toUnassign.includes(p.id)) {
          return {
            ...p,
            assigned_worker_id: null,
            assigned_worker_name: null,
          };
        }
        return p;
      });

      onSuccess(updatedPatients);

      setTimeout(() => {
        onClose();
      }, 1000);
    } catch {
      setErrorMessage(t.errUnexpected);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-xl rounded-2xl border border-border bg-card p-6 shadow-xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-soft text-primary">
              <StethoscopeIcon className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-foreground">
                {t.title}
              </h2>
              <p className="text-xs text-muted-foreground">
                {worker.full_name} ({worker.role}) &bull; {t.assignedCount(assignedIds.size)}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        {errorMessage ? (
          <div className="mt-4 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-600 dark:text-red-400">
            {errorMessage}
          </div>
        ) : null}

        {saveSuccess ? (
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs text-emerald-600 dark:text-emerald-400">
            <CheckCircleIcon className="h-4 w-4" />
            <span>{t.success}</span>
          </div>
        ) : null}

        <div className="mt-4 relative">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.search}
            className="w-full rounded-xl border border-border bg-background pl-9 pr-4 py-2 text-xs text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        <div className="mt-4 flex-1 overflow-y-auto space-y-2 border border-border rounded-xl p-3 bg-muted/20 min-h-[220px] max-h-[360px]">
          {filteredPatients.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted-foreground">
              <UserIcon className="mx-auto h-6 w-6 text-muted-foreground mb-2" />
              <span>{t.none}</span>
            </div>
          ) : (
            filteredPatients.map((patient) => {
              const isChecked = assignedIds.has(patient.id);
              const isAssignedToOther =
                patient.assigned_worker_id &&
                patient.assigned_worker_id !== worker.id;

              return (
                <label
                  key={patient.id}
                  className={`flex items-center justify-between gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                    isChecked
                      ? "bg-primary-soft/50 border-primary/40 text-foreground"
                      : "bg-card border-border hover:bg-muted/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => togglePatientAssignment(patient.id)}
                      className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                    />
                    <div>
                      <p className="text-xs font-bold text-foreground">
                        {patient.full_name}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {patient.phone} &bull; {patient.email}
                      </p>
                    </div>
                  </div>

                  {isAssignedToOther ? (
                    <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                      {t.assignedTo} {patient.assigned_worker_name || t.otherWorker}
                    </span>
                  ) : isChecked ? (
                    <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                      {t.assigned}
                    </span>
                  ) : (
                    <span className="text-[10px] text-muted-foreground">{t.unassigned}</span>
                  )}
                </label>
              );
            })
          )}
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
          <span className="text-xs font-medium text-muted-foreground">
            {t.selectedCount(assignedIds.size)}
          </span>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted"
            >
              {t.cancel}
            </button>
            <button
              type="button"
              disabled={isSaving}
              onClick={handleSaveAssignments}
              className="rounded-lg bg-primary px-5 py-2 text-xs font-semibold text-white hover:bg-primary-hover disabled:opacity-60"
            >
              {isSaving ? t.saving : t.save}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
