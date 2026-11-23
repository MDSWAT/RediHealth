"use client";

import { PanelLink as Link, usePanelRuntime } from "./PanelRuntime";
import { useMemo, useState, type Dispatch, type SetStateAction } from "react";
import { UsersIcon } from "@/components/ui/icons";
import { useLanguage } from "@/lib/i18n/language-context";
import { panelDesignTranslations } from "@/lib/i18n/panel-design-translations";
import type { PatientItem, PatientPriority, PatientStatus } from "@/lib/types/patient";
import { getFollowupState } from "@/lib/patient-helpers";
import { withLangPrefix } from "@/lib/i18n/routing";
import { patientsTableTranslations } from "@/lib/i18n/panel-component-translations";
import { CreatePatientModal } from "./CreatePatientModal";
import { PatientsFilterBar } from "./PatientsFilterBar";
import { crmTranslations } from "@/lib/i18n/crm-translations";
import { localDateKey } from "@/lib/panel-dates";
import { csvTimestamp, downloadCsv } from "./panel-csv";
import { createPatientModalTranslations } from "@/lib/i18n/panel-component-translations";
import { PatientAvatar } from "./PatientMedia";
import "./patient-workspace.css";

interface PatientsTableProps {
  initialPatients: PatientItem[];
  onPatientsChange: Dispatch<SetStateAction<PatientItem[]>>;
  isAdmin?: boolean;
  isRomania: boolean;
  onRefresh?: () => Promise<void>;
  isRefreshing?: boolean;
}

type UrgencyFilter = "all" | "overdue" | "today" | "upcoming" | "none" | "completed";

function toIsoDate(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) {
    return "";
  }
  return d.toISOString().slice(0, 10);
}

export function PatientsTable({
  initialPatients,
  onPatientsChange,
  isAdmin = false,
  isRomania,
  onRefresh,
  isRefreshing = false,
}: PatientsTableProps) {
  const { lang } = useLanguage();
  const { request: fetch } = usePanelRuntime();
  const t = patientsTableTranslations[lang];
  const copy = panelDesignTranslations[lang];
  const patients = initialPatients;
  const setPatients = onPatientsChange;
  const crm = crmTranslations[lang];
  const fields = createPatientModalTranslations[lang];
  const [searchQuery, setSearchQuery] = useState("");
  const [activeStatusFilter, setActiveStatusFilter] = useState<PatientStatus | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<PatientPriority | "all">("all");
  const [urgencyFilter, setUrgencyFilter] = useState<UrgencyFilter>("all");
  const [createdFrom, setCreatedFrom] = useState("");
  const [createdTo, setCreatedTo] = useState("");
  const [editingPatient, setEditingPatient] = useState<PatientItem | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [closingPatientId, setClosingPatientId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const filteredPatients = useMemo(() => {
    return patients.filter((patient) => {
      if (activeStatusFilter !== "all" && patient.status !== activeStatusFilter) {
        return false;
      }

      if (priorityFilter !== "all" && patient.priority !== priorityFilter) {
        return false;
      }

      if (urgencyFilter !== "all") {
        const followupState = getFollowupState(patient.followups).state;
        if (followupState !== urgencyFilter) {
          return false;
        }
      }

      const createdDate = toIsoDate(patient.created_at);
      if (createdFrom && createdDate && createdDate < createdFrom) {
        return false;
      }
      if (createdTo && createdDate && createdDate > createdTo) {
        return false;
      }

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const nameMatch = patient.full_name.toLowerCase().includes(query);
        const emailMatch = patient.email.toLowerCase().includes(query);
        const phoneMatch = patient.phone.includes(query);
        const notesMatch = patient.condition_notes?.toLowerCase().includes(query);
        const addressMatch = patient.address?.toLowerCase().includes(query);
        const assignedWorkersMatch = patient.assigned_worker_names?.some((name) =>
          name.toLowerCase().includes(query),
        ) || patient.assigned_worker_name?.toLowerCase().includes(query);

        return nameMatch || emailMatch || phoneMatch || notesMatch || addressMatch || assignedWorkersMatch;
      }

      return true;
    });
  }, [patients, activeStatusFilter, priorityFilter, urgencyFilter, createdFrom, createdTo, searchQuery]);

  async function handleDelete(id: string) {
    setDeletingId(id);
    setErrorMessage(null);

    try {
      const response = await fetch(`/api/patients?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });

      const data = (await response.json()) as { error?: string; success?: boolean };

      if (!response.ok) {
        setErrorMessage(data.error || t.errDelete);
        return;
      }

      setPatients((prev) => prev.filter((p) => p.id !== id));
      setConfirmingDeleteId(null);
    } catch {
      setErrorMessage(t.errDeleteUnexpected);
    } finally {
      setDeletingId(null);
    }
  }

  async function handleClosePatient(patient: PatientItem) {
    if (!window.confirm(t.closePatientConfirm)) return;
    setClosingPatientId(patient.id);
    setErrorMessage(null);
    try {
      const response = await fetch("/api/patients", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: patient.id, status: "archived" }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        setErrorMessage(data.error || t.errUpdateStatus);
        return;
      }
      setPatients((current) => current.map((item) =>
        item.id === patient.id ? { ...item, status: "archived" } : item,
      ));
    } catch {
      setErrorMessage(t.errUpdateStatus);
    } finally {
      setClosingPatientId(null);
    }
  }

  function handleExportCSV() {
    if (filteredPatients.length === 0) return;
    const header = [crm.csvId, crm.csvName, crm.csvPhone, crm.csvEmail, crm.csvDob, crm.csvGender, crm.csvAddress, crm.status, crm.condition, crm.medicalHistory, crm.csvCreated];
    downloadCsv(`redihealth-patients-${localDateKey()}.csv`, header, filteredPatients.map((p) => [
      p.id, p.full_name, p.phone, p.email, p.date_of_birth || "", p.gender || "", p.address || "",
      p.status, p.condition_notes || "", p.medical_history || "", csvTimestamp(p.created_at),
    ]));
  }


  function resetFilters() {
    setSearchQuery("");
    setActiveStatusFilter("all");
    setPriorityFilter("all");
    setUrgencyFilter("all");
    setCreatedFrom("");
    setCreatedTo("");
  }

  const hasActiveFilters =
    searchQuery.trim().length > 0 ||
    activeStatusFilter !== "all" ||
    priorityFilter !== "all" ||
    urgencyFilter !== "all" ||
    createdFrom.length > 0 ||
    createdTo.length > 0;

  return (
    <section className="patient-directory">
      <PatientsFilterBar
        searchQuery={searchQuery}
        onChangeSearchQuery={setSearchQuery}
        activeStatusFilter={activeStatusFilter}
        onChangeStatusFilter={setActiveStatusFilter}
        priorityFilter={priorityFilter}
        onChangePriorityFilter={setPriorityFilter}
        urgencyFilter={urgencyFilter}
        onChangeUrgencyFilter={setUrgencyFilter}
        createdFrom={createdFrom}
        onChangeCreatedFrom={setCreatedFrom}
        createdTo={createdTo}
        onChangeCreatedTo={setCreatedTo}
        onResetFilters={resetFilters}
        hasActiveFilters={hasActiveFilters}
        onAddPatient={() => setShowCreateModal(true)}
        onExportCSV={handleExportCSV}
        exportDisabled={filteredPatients.length === 0}
        onRefresh={onRefresh}
        isRefreshing={isRefreshing}
      />

      {errorMessage ? (
        <div
          role="alert"
          className="mx-4 mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-medium text-[#b91c1c] dark:text-[#ffb4b4]"
        >
          <span>{errorMessage}</span>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="inline-flex min-h-11 items-center whitespace-nowrap font-semibold underline underline-offset-2 hover:no-underline"
          >
            {t.dismiss}
          </button>
        </div>
      ) : null}

      <div className="flex items-center justify-between border-y border-[var(--panel-line)] bg-[var(--panel-subtle)] px-4 py-2.5 text-xs text-[var(--panel-muted)]">
        <p className="font-medium tabular-nums [font-feature-settings:'zero'_0]">
          {t.showing(filteredPatients.length, patients.length)}
        </p>
      </div>

      {filteredPatients.length === 0 ? (
        <div className="px-6 py-12 text-center">
          <div className="mx-auto max-w-sm">
            <UsersIcon aria-hidden="true" className="mx-auto h-7 w-7 text-[var(--panel-muted)]" />
            <h3 className="mt-3 text-base font-semibold text-[var(--panel-ink)]">{t.noneTitle}</h3>
            <p className="mt-1 text-sm text-[var(--panel-muted)]">
              {t.noneHint}
            </p>
            {hasActiveFilters ? (
              <button
                type="button"
                onClick={resetFilters}
                className="crm-button mt-4 whitespace-nowrap border-[var(--color-border-control,#8a94a6)] bg-[var(--panel-surface)] text-[var(--panel-ink)] hover:bg-[var(--panel-selection)]"
              >
                {copy.reset}
              </button>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="divide-y divide-[var(--panel-line)]">
          {filteredPatients.map((patient) => (
            <article key={patient.id} className="patient-directory-row">
              <div className="flex min-w-0 flex-1 items-center gap-3.5">
                <PatientAvatar name={patient.full_name} src={patient.profile_photo} />
                <div className="min-w-0">
                  <Link
                    href={withLangPrefix(`/panel/patients/${patient.id}`, lang)}
                    className="block truncate text-base font-semibold text-[var(--panel-ink)] hover:text-primary dark:hover:text-[#bad7fa]"
                  >
                    {patient.full_name}
                  </Link>
                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-[var(--panel-muted)]">
                    <a
                      href={`tel:${patient.phone}`}
                      className="tabular-nums [font-feature-settings:'zero'_0] hover:text-[var(--panel-ink)] hover:underline"
                    >
                      {patient.phone}
                    </a>
                    <a
                      className="break-all hover:text-[var(--panel-ink)] hover:underline"
                      href={`mailto:${patient.email}`}
                    >
                      {patient.email}
                    </a>
                  </div>
                  <p className="mt-1 line-clamp-1 text-xs text-[var(--panel-muted)]">
                    {patient.condition_notes || t.noNotes}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs">
                <span className={patient.status === "active" ? "font-medium text-[var(--panel-ink)]" : "text-[var(--panel-muted)]"}>
                  {patient.status === "active" ? t.activeCare : patient.status === "inactive" ? t.inactive : t.archived}
                </span>
                <span
                  className={
                    patient.priority === "critical"
                      ? "font-medium text-[#b91c1c] dark:text-[#ffb4b4]"
                      : patient.priority === "high"
                      ? "font-medium text-[#9a4d0b] dark:text-[#f5c58e]"
                      : "text-[var(--panel-muted)]"
                  }
                >
                  {patient.priority === "critical"
                    ? fields.pCritical
                    : patient.priority === "high"
                    ? fields.pHigh
                    : patient.priority === "low"
                    ? fields.pLow
                    : fields.pModerate}
                </span>
                <Link
                  className="crm-button whitespace-nowrap border-[var(--color-border-control,#8a94a6)] bg-[var(--panel-surface)] text-[var(--panel-ink)] hover:bg-[var(--panel-selection)]"
                  href={withLangPrefix(`/panel/patients/${patient.id}`, lang)}
                >
                  {crm.openPatient}
                </Link>
                <details className="crm-menu">
                  <summary className="crm-button whitespace-nowrap border-[var(--color-border-control,#8a94a6)] bg-[var(--panel-surface)] text-[var(--panel-ink)] hover:bg-[var(--panel-selection)]">
                    {crm.more}
                  </summary>
                  <div>
                    <button
                      type="button"
                      className="min-h-11 whitespace-nowrap"
                      onClick={(event) => {
                        event.currentTarget.closest("details")?.removeAttribute("open");
                        setEditingPatient(patient);
                      }}
                    >
                      {crm.edit}
                    </button>
                    {patient.status !== "archived" ? (
                      <button
                        type="button"
                        className="min-h-11 whitespace-nowrap"
                        disabled={closingPatientId === patient.id}
                        onClick={(event) => {
                          event.currentTarget.closest("details")?.removeAttribute("open");
                          void handleClosePatient(patient);
                        }}
                      >
                        {closingPatientId === patient.id ? t.closingPatient : t.closePatient}
                      </button>
                    ) : null}
                    <button
                      type="button"
                      className="min-h-11 whitespace-nowrap text-[#b91c1c] dark:text-[#ffb4b4]"
                      onClick={(event) => {
                        event.currentTarget.closest("details")?.removeAttribute("open");
                        setConfirmingDeleteId(patient.id);
                      }}
                    >
                      {crm.delete}
                    </button>
                  </div>
                </details>
              </div>
              {confirmingDeleteId === patient.id ? (
                <div className="flex basis-full flex-wrap items-center justify-between gap-3 border-t border-[var(--panel-line)] pt-3">
                  <span className="text-sm font-medium text-[#b91c1c] dark:text-[#ffb4b4]">
                    {t.deleteQ}
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      className="crm-button whitespace-nowrap border-[#b91c1c] bg-[#b91c1c] text-white hover:bg-[#991b1b] disabled:border-[var(--panel-line)] disabled:bg-[var(--panel-subtle)] disabled:text-[var(--panel-muted)]"
                      disabled={deletingId === patient.id}
                      onClick={() => void handleDelete(patient.id)}
                    >
                      {t.yesDelete}
                    </button>
                    <button
                      type="button"
                      className="crm-button whitespace-nowrap border-[var(--color-border-control,#8a94a6)] bg-[var(--panel-surface)] text-[var(--panel-ink)] hover:bg-[var(--panel-selection)]"
                      onClick={() => setConfirmingDeleteId(null)}
                    >
                      {t.cancel}
                    </button>
                  </div>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      )}

      {showCreateModal || editingPatient ? (
        <CreatePatientModal
          isAdmin={isAdmin}
          isRomania={isRomania}
          patient={editingPatient || undefined}
          onClose={() => {
            setShowCreateModal(false);
            setEditingPatient(null);
          }}
          onSuccess={(saved) => {
            if (editingPatient) {
              setPatients((prev) =>
                prev.map((p) => (p.id === saved.id ? saved : p)),
              );
            } else {
              setPatients((prev) => [saved, ...prev]);
            }
          }}
        />
      ) : null}
    </section>
  );
}
