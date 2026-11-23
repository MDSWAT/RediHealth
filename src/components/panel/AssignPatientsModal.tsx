"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { CloseIcon, SearchIcon } from "@/components/ui/icons";
import { useLanguage } from "@/lib/i18n/language-context";
import { langToLocale } from "@/lib/i18n/panel-translations";
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
  const locale = langToLocale[lang];
  const baseId = useId();
  const t = {
    ru: {
      errSave: "Не удалось сохранить.",
      errUnexpected: "Не удалось сохранить. Попробуйте еще раз.",
      title: "Назначить пациентов",
      assignedCount: (count: number) => `Назначено пациентов: ${count}`,
      success: "Сохранено.",
      search: "Поиск пациентов",
      none: "Пациенты не найдены.",
      assignedTo: "Назначено:",
      otherWorker: "другому сотруднику",
      assigned: "Назначен",
      unassigned: "Не назначен",
      selectedCount: (count: number) => `Выбрано: ${count}`,
      cancel: "Отмена",
      close: "Закрыть",
      saving: "Сохранение...",
      save: "Сохранить",
    },
    en: {
      errSave: "Could not save.",
      errUnexpected: "Could not save. Try again.",
      title: "Assign patients",
      assignedCount: (count: number) => `Assigned patients: ${count}`,
      success: "Saved.",
      search: "Search patients",
      none: "No patients found.",
      assignedTo: "Assigned to",
      otherWorker: "someone else",
      assigned: "Assigned",
      unassigned: "Unassigned",
      selectedCount: (count: number) => `Selected: ${count}`,
      cancel: "Cancel",
      close: "Close",
      saving: "Saving...",
      save: "Save",
    },
    ro: {
      errSave: "Nu s-a putut salva.",
      errUnexpected: "Nu s-a putut salva. Încearcă din nou.",
      title: "Alocă pacienți",
      assignedCount: (count: number) => `Pacienți alocați: ${count}`,
      success: "Salvat.",
      search: "Caută pacienți",
      none: "Nu am găsit pacienți.",
      assignedTo: "Alocat lui",
      otherWorker: "altcuiva",
      assigned: "Alocat",
      unassigned: "Nealocat",
      selectedCount: (count: number) => `Selectați: ${count}`,
      cancel: "Anulează",
      close: "Închide",
      saving: "Se salvează...",
      save: "Salvează",
    },
    sq: {
      errSave: "Nuk u ruajt.",
      errUnexpected: "Nuk u ruajt. Provo përsëri.",
      title: "Cakto pacientë",
      assignedCount: (count: number) => `Pacientë të caktuar: ${count}`,
      success: "U ruajt.",
      search: "Kërko pacientë",
      none: "Nuk u gjet asnjë pacient.",
      assignedTo: "I caktuar te",
      otherWorker: "dikush tjetër",
      assigned: "I caktuar",
      unassigned: "Pa caktim",
      selectedCount: (count: number) => `Të zgjedhur: ${count}`,
      cancel: "Anulo",
      close: "Mbyll",
      saving: "Duke ruajtur...",
      save: "Ruaj",
    },
    it: {
      errSave: "Impossibile salvare.",
      errUnexpected: "Impossibile salvare. Riprova.",
      title: "Assegna pazienti",
      assignedCount: (count: number) => `Pazienti assegnati: ${count}`,
      success: "Salvato.",
      search: "Cerca pazienti",
      none: "Nessun paziente trovato.",
      assignedTo: "Assegnato a",
      otherWorker: "un altro operatore",
      assigned: "Assegnato",
      unassigned: "Non assegnato",
      selectedCount: (count: number) => `Selezionati: ${count}`,
      cancel: "Annulla",
      close: "Chiudi",
      saving: "Salvataggio...",
      save: "Salva",
    },
    hr: {
      errSave: "Spremanje nije uspjelo.",
      errUnexpected: "Spremanje nije uspjelo. Pokušaj ponovno.",
      title: "Dodijeli pacijente",
      assignedCount: (count: number) => `Dodijeljeni pacijenti: ${count}`,
      success: "Spremljeno.",
      search: "Pretraži pacijente",
      none: "Nije pronađen nijedan pacijent.",
      assignedTo: "Dodijeljeno",
      otherWorker: "drugom članu osoblja",
      assigned: "Dodijeljen",
      unassigned: "Nedodijeljen",
      selectedCount: (count: number) => `Odabrano: ${count}`,
      cancel: "Odustani",
      close: "Zatvori",
      saving: "Spremanje...",
      save: "Spremi",
    },
    rom: {
      errSave: "Nashti arakhlo.",
      errUnexpected: "Nashti arakhlo. Zumav pale.",
      title: "De pacienturya",
      assignedCount: (count: number) => `Dine pacienturya: ${count}`,
      success: "Arakhlo.",
      search: "Rode pacienturen",
      none: "Na arakhlo paciento.",
      assignedTo: "Dindo ko",
      otherWorker: "aver manush",
      assigned: "Dindo",
      unassigned: "Bi-dindo",
      selectedCount: (count: number) => `Alosarde: ${count}`,
      cancel: "Mekh",
      close: "Phandav",
      saving: "Arakhel...",
      save: "Arakh",
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

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isSaving) {
        onClose();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isSaving, onClose]);

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
      }, 900);
    } catch {
      setErrorMessage(t.errUnexpected);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div
      className="panel-scrim fixed inset-0 z-50 flex items-end justify-center bg-[#0b132b]/60 p-0 sm:items-center sm:p-4"
      onClick={(event) => {
        if (event.target === event.currentTarget && !isSaving) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${baseId}-title`}
        className="app-sheet-slide-up relative flex max-h-[92dvh] w-full max-w-xl flex-col rounded-t-2xl border border-[var(--panel-line)] bg-[var(--panel-surface)] p-5 text-[var(--panel-ink)] shadow-[0_24px_80px_rgba(11,19,43,0.28)] sm:max-h-[90vh] sm:rounded-2xl sm:p-6 care-panel-bottom-bar"
      >
        <div className="flex items-start justify-between gap-3 border-b border-[var(--panel-line)] pb-4">
          <div className="min-w-0">
            <h2
              id={`${baseId}-title`}
              className="text-lg font-semibold leading-snug text-[var(--panel-ink)]"
            >
              {t.title}
            </h2>
            <p className="mt-0.5 text-xs tabular-nums text-[var(--panel-muted)]">
              {worker.full_name} — {t.assignedCount(assignedIds.size).replace(
                String(assignedIds.size),
                assignedIds.size.toLocaleString(locale),
              )}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.close}
            className="inline-flex h-11 w-11 min-h-11 min-w-11 shrink-0 items-center justify-center rounded-lg text-[var(--panel-muted)] transition-colors hover:bg-[var(--panel-selection)] hover:text-[var(--panel-ink)]"
          >
            <CloseIcon className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {errorMessage ? (
          <p
            role="alert"
            className="mt-4 rounded-lg border border-[#b91c1c]/30 bg-[#fef2f2] px-3.5 py-2.5 text-sm text-[#991b1b] dark:border-[#ffb4b4]/35 dark:bg-[#2c1519] dark:text-[#ffb4b4]"
          >
            {errorMessage}
          </p>
        ) : null}

        {saveSuccess ? (
          <p
            role="status"
            className="mt-4 rounded-lg border border-[var(--panel-line)] bg-[var(--panel-selection)] px-3.5 py-2.5 text-sm font-medium text-[var(--panel-ink)]"
          >
            {t.success}
          </p>
        ) : null}

        <label className="mt-4 flex min-h-11 items-center gap-2 rounded-lg border border-[var(--color-border-control)] dark:border-[var(--panel-line)] bg-[var(--panel-surface)] px-3 text-[var(--panel-muted)] focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[var(--color-sapphire)] dark:focus-within:outline-[#bad7fa]">
          <SearchIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label={t.search}
            placeholder={t.search}
            className="min-h-11 w-full min-w-0 bg-transparent text-sm text-[var(--panel-ink)] placeholder:text-[var(--panel-muted)] outline-none"
          />
        </label>

        <div className="mt-4 min-h-[200px] max-h-[360px] flex-1 divide-y divide-[var(--panel-line)] overflow-y-auto border-y border-[var(--panel-line)]">
          {filteredPatients.length === 0 ? (
            <p className="py-10 text-center text-sm text-[var(--panel-muted)]">{t.none}</p>
          ) : (
            filteredPatients.map((patient) => {
              const isChecked = assignedIds.has(patient.id);
              const isAssignedToOther =
                Boolean(patient.assigned_worker_id) &&
                patient.assigned_worker_id !== worker.id;

              return (
                <label
                  key={patient.id}
                  className={`flex min-h-14 cursor-pointer items-center justify-between gap-3 px-2 py-3 transition-colors ${
                    isChecked
                      ? "bg-[var(--panel-selection)]"
                      : "hover:bg-[var(--panel-subtle)]"
                  }`}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => togglePatientAssignment(patient.id)}
                      className="h-4 w-4 shrink-0 rounded border-[var(--color-border-control)] text-[var(--color-sapphire)]"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-[var(--panel-ink)]">
                        {patient.full_name}
                      </p>
                      <p className="truncate text-xs tabular-nums text-[var(--panel-muted)]">
                        {[patient.phone, patient.email].filter(Boolean).join(" — ")}
                      </p>
                    </div>
                  </div>

                  {isAssignedToOther ? (
                    <span className="shrink-0 text-right text-xs font-medium text-[#9a4d0b] dark:text-[#f5c58e]">
                      {t.assignedTo} {patient.assigned_worker_name || t.otherWorker}
                    </span>
                  ) : isChecked ? (
                    <span className="shrink-0 text-xs font-semibold text-[var(--color-sapphire)] dark:text-[#bad7fa]">
                      {t.assigned}
                    </span>
                  ) : (
                    <span className="shrink-0 text-xs text-[var(--panel-muted)]">
                      {t.unassigned}
                    </span>
                  )}
                </label>
              );
            })
          )}
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-2">
          <span className="text-xs font-medium tabular-nums text-[var(--panel-muted)]">
            {t.selectedCount(assignedIds.size).replace(
              String(assignedIds.size),
              assignedIds.size.toLocaleString(locale),
            )}
          </span>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex min-h-11 shrink-0 items-center justify-center whitespace-nowrap rounded-lg border border-[var(--color-border-control)] dark:border-[var(--panel-line)] bg-[var(--panel-surface)] px-4 text-sm font-medium text-[var(--panel-ink)] transition-colors hover:bg-[var(--panel-selection)]"
            >
              {t.cancel}
            </button>
            <button
              type="button"
              disabled={isSaving}
              onClick={handleSaveAssignments}
              className="inline-flex min-h-11 shrink-0 items-center justify-center whitespace-nowrap rounded-lg bg-[var(--color-sapphire)] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#28476f] disabled:cursor-default disabled:bg-[var(--panel-subtle)] disabled:text-[var(--panel-muted)]"
            >
              {isSaving ? t.saving : t.save}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
