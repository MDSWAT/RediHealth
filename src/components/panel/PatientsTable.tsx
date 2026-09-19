"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { EditIcon, TrashIcon, UsersIcon } from "@/components/ui/icons";
import { useLanguage } from "@/lib/i18n/language-context";
import type { PatientItem, PatientPriority, PatientStatus } from "@/lib/types/patient";
import { getFollowupState, getPriorityMeta } from "@/lib/patient-helpers";
import { withLangPrefix } from "@/lib/i18n/routing";
import { patientsTableTranslations } from "@/lib/i18n/panel-component-translations";
import { CreatePatientModal } from "./CreatePatientModal";
import { PatientsFilterBar } from "./PatientsFilterBar";

interface PatientsTableProps {
  initialPatients: PatientItem[];
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
  onRefresh,
  isRefreshing = false,
}: PatientsTableProps) {
  const { lang } = useLanguage();
  const t = patientsTableTranslations[lang];
  const [patients, setPatients] = useState<PatientItem[]>(initialPatients);
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

  async function handleUpdateStatus(id: string, newStatus: PatientStatus) {
    try {
      const response = await fetch("/api/patients", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });

      if (response.ok) {
        setPatients((prev) =>
          prev.map((p) => (p.id === id ? { ...p, status: newStatus } : p)),
        );
      }
    } catch {
      setErrorMessage(t.errUpdateStatus);
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
          {filteredPatients.map((patient) => {
            const isDeleting = deletingId === patient.id;
            const isConfirmingDelete = confirmingDeleteId === patient.id;
            const priorityMeta = getPriorityMeta(patient.priority);
            const assignedWorkersLabel =
              patient.assigned_worker_names && patient.assigned_worker_names.length > 0
                ? patient.assigned_worker_names.join(", ")
                : patient.assigned_worker_name || t.unassigned;

            return (
              <article key={patient.id} className="p-4 sm:p-5 transition-colors hover:bg-muted/20">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <Link
                      href={withLangPrefix(`/panel/patients/${patient.id}`, lang)}
                      className="block truncate text-base font-bold text-foreground hover:text-primary transition-colors"
                    >
                      {patient.full_name}
                    </Link>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      ID #{patient.id} {patient.request_id ? `(Req #${patient.request_id})` : ""}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-primary">
                      {t.worker}: {assignedWorkersLabel}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2 self-start sm:self-auto">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold ${priorityMeta.badgeClass}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${priorityMeta.dotClass}`} />
                      {priorityMeta.label}
                    </span>
                    <select
                      value={patient.status}
                      onChange={(e) => handleUpdateStatus(patient.id, e.target.value as PatientStatus)}
                      className={`rounded-xl border px-2.5 py-1 text-xs font-bold capitalize cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                        patient.status === "active"
                          ? "border-emerald-200 bg-emerald-50/80 text-emerald-800"
                          : patient.status === "inactive"
                          ? "border-amber-200 bg-amber-50/80 text-amber-800"
                          : "border-slate-200 bg-slate-100 text-slate-700"
                      }`}
                    >
                      <option value="active">{t.activeCare}</option>
                      <option value="inactive">{t.inactive}</option>
                      <option value="archived">{t.archived}</option>
                    </select>
                  </div>
                </div>

                <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                  {patient.condition_notes || t.noNotes}
                </p>

                <div className="mt-3.5 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
                  <a
                    href={`tel:${patient.phone}`}
                    className="font-semibold text-primary hover:underline"
                  >
                    {patient.phone}
                  </a>
                  <a
                    href={`mailto:${patient.email}`}
                    className="max-w-[220px] truncate text-muted-foreground hover:text-foreground"
                  >
                    {patient.email}
                  </a>
                  <span className="text-muted-foreground">{patient.date_of_birth || t.dobMissing}</span>
                  <span className="text-muted-foreground">{patient.gender || t.genderMissing}</span>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                  {isConfirmingDelete ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-red-600 dark:text-red-400">{t.deleteQ}</span>
                      <button
                        type="button"
                        disabled={isDeleting}
                        onClick={() => handleDelete(patient.id)}
                        className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
                      >
                        {isDeleting ? "..." : t.yesDelete}
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmingDeleteId(null)}
                        className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
                      >
                        {t.cancel}
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmingDeleteId(patient.id)}
                      aria-label={`${t.deletePatient}: ${patient.full_name}`}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-red-600 hover:bg-red-50 transition-colors"
                      title={t.deletePatient}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  )}

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingPatient(patient)}
                      aria-label={`${t.editProfile}: ${patient.full_name}`}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                      title={t.editProfile}
                    >
                      <EditIcon className="h-4 w-4" />
                    </button>
                    <Link
                      href={withLangPrefix(`/panel/patients/${patient.id}`, lang)}
                      className="inline-flex items-center justify-center min-h-10 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white hover:bg-primary-hover shadow-2xs transition-colors"
                    >
                      {t.viewDetails}
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {showCreateModal || editingPatient ? (
        <CreatePatientModal
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
