/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { useMemo, useState, type Dispatch, type SetStateAction } from "react";
import { UsersIcon } from "@/components/ui/icons";
import { useLanguage } from "@/lib/i18n/language-context";
import type { PatientItem, PatientPriority, PatientStatus } from "@/lib/types/patient";
import { getFollowupState } from "@/lib/patient-helpers";
import { withLangPrefix } from "@/lib/i18n/routing";
import { patientsTableTranslations } from "@/lib/i18n/panel-component-translations";
import { CreatePatientModal } from "./CreatePatientModal";
import { PatientsFilterBar } from "./PatientsFilterBar";
import { crmTranslations } from "@/lib/i18n/crm-translations";
import { createPatientModalTranslations } from "@/lib/i18n/panel-component-translations";

interface PatientsTableProps {
  initialPatients: PatientItem[];
  onPatientsChange: Dispatch<SetStateAction<PatientItem[]>>;
  isAdmin?: boolean;
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
  onRefresh,
  isRefreshing = false,
}: PatientsTableProps) {
  const { lang } = useLanguage();
  const t = patientsTableTranslations[lang];
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

  function handleExportCSV() {
    if (filteredPatients.length === 0) return;

    const headers = [
      "ID",
      "Full Name",
      "Phone",
      "Email",
      "DOB",
      "Gender",
      "Address",
      "Status",
      "Condition Notes",
      "Medical History",
      "Created At",
    ];

    const rows = filteredPatients.map((p) => [
      p.id,
      `"${p.full_name.replace(/"/g, '""')}"`,
      `"${p.phone.replace(/"/g, '""')}"`,
      `"${p.email.replace(/"/g, '""')}"`,
      `"${(p.date_of_birth || "").replace(/"/g, '""')}"`,
      `"${(p.gender || "").replace(/"/g, '""')}"`,
      `"${(p.address || "").replace(/"/g, '""')}"`,
      p.status,
      `"${(p.condition_notes || "").replace(/"/g, '""')}"`,
      `"${(p.medical_history || "").replace(/"/g, '""')}"`,
      new Date(p.created_at).toISOString(),
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `redihealth-patients-${new Date().toISOString().slice(0, 10)}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
    <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-xs">
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
          className="mx-4 mb-4 flex items-center justify-between rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs font-medium text-red-600 dark:text-red-400"
        >
          <span>{errorMessage}</span>
          <button
            onClick={() => setErrorMessage(null)}
            className="ml-4 font-bold underline hover:no-underline"
          >
            {t.dismiss}
          </button>
        </div>
      ) : null}

      <div className="flex items-center justify-between border-y border-border bg-muted/40 px-4 py-2.5 text-xs text-muted-foreground">
        <p className="font-medium">
          {t.showing(filteredPatients.length, patients.length)}
        </p>
      </div>

      {filteredPatients.length === 0 ? (
        <div className="px-6 py-12 text-center">
          <div className="mx-auto max-w-sm">
            <UsersIcon className="mx-auto h-8 w-8 text-muted-foreground" />
            <h3 className="mt-3 text-base font-semibold text-foreground">{t.noneTitle}</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              {t.noneHint}
            </p>
          </div>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {filteredPatients.map((patient) => <article key={patient.id} className="flex flex-col justify-between gap-3 p-4 hover:bg-muted/20 sm:flex-row sm:items-center">
            <div className="flex min-w-0 flex-1 items-center gap-3"><div className="flex h-11 w-11 flex-none items-center justify-center overflow-hidden rounded-full bg-primary-soft text-sm font-semibold text-primary">{patient.profile_photo ? <img src={patient.profile_photo} alt="" className="h-full w-full object-cover" /> : patient.full_name.trim().charAt(0).toUpperCase()}</div><div className="min-w-0"><Link href={withLangPrefix(`/panel/patients/${patient.id}`, lang)} className="block text-base font-medium hover:text-primary">{patient.full_name}</Link><div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground"><a href={`tel:${patient.phone}`}>{patient.phone}</a><a className="break-all" href={`mailto:${patient.email}`}>{patient.email}</a></div><p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{patient.condition_notes || t.noNotes}</p></div></div>
            <div className="flex flex-wrap items-center gap-3 text-xs"><span className="text-muted-foreground">{patient.status === "active" ? t.activeCare : patient.status === "inactive" ? t.inactive : t.archived}</span><span className={patient.priority === "critical" || patient.priority === "high" ? "text-red-700" : "text-muted-foreground"}>{patient.priority === "critical" ? fields.pCritical : patient.priority === "high" ? fields.pHigh : patient.priority === "low" ? fields.pLow : fields.pModerate}</span><Link className="crm-button" href={withLangPrefix(`/panel/patients/${patient.id}`, lang)}>{crm.openPatient}</Link><details className="crm-menu"><summary className="crm-button">{crm.more}</summary><div><button onClick={() => setEditingPatient(patient)}>{crm.edit}</button><button onClick={() => setConfirmingDeleteId(patient.id)}>{crm.delete}</button></div></details></div>
            {confirmingDeleteId === patient.id && <div className="flex flex-wrap items-center gap-2"><span className="text-xs text-red-700">{t.deleteQ}</span><button className="crm-button" disabled={deletingId === patient.id} onClick={() => handleDelete(patient.id)}>{t.yesDelete}</button><button className="crm-button" onClick={() => setConfirmingDeleteId(null)}>{t.cancel}</button></div>}
          </article>)}
        </div>
      )}

      {showCreateModal || editingPatient ? (
        <CreatePatientModal
          isAdmin={isAdmin}
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
