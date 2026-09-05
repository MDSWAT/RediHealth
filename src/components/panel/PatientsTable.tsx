"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { EditIcon, TrashIcon, UsersIcon } from "@/components/ui/icons";
import { useLanguage } from "@/lib/i18n/language-context";
import type { PatientItem, PatientPriority, PatientStatus } from "@/lib/types/patient";
import { getPriorityMeta } from "@/lib/patient-helpers";
import { withLangPrefix } from "@/lib/i18n/routing";
import { CreatePatientModal } from "./CreatePatientModal";
import { PatientsFilterBar } from "./PatientsFilterBar";

interface PatientsTableProps {
  initialPatients: PatientItem[];
  onRefresh?: () => Promise<void>;
  isRefreshing?: boolean;
}

export function PatientsTable({
  initialPatients,
  onRefresh,
  isRefreshing = false,
}: PatientsTableProps) {
  const { lang } = useLanguage();
  const t = {
    en: {
      errDelete: "Failed to delete patient.",
      errDeleteUnexpected: "An error occurred while deleting patient.",
      errUpdateStatus: "Failed to update patient status.",
      dismiss: "Dismiss",
      showing: (v: number, total: number) => `Showing ${v} of ${total} patient profiles`,
      noneTitle: "No patient records found",
      noneHint: "Create a patient profile or convert a request to start building patient profiles.",
      worker: "Worker",
      unassigned: "Unassigned",
      activeCare: "Active Care",
      inactive: "Inactive",
      archived: "Archived",
      noNotes: "No condition notes recorded.",
      dobMissing: "DOB not provided",
      genderMissing: "Gender not specified",
      deleteQ: "Delete this patient?",
      yesDelete: "Yes, delete",
      cancel: "Cancel",
      deletePatient: "Delete Patient",
      editProfile: "Edit Profile",
      viewDetails: "View Details",
    },
    ro: {
      errDelete: "Stergerea pacientului a esuat.",
      errDeleteUnexpected: "A aparut o eroare la stergerea pacientului.",
      errUpdateStatus: "Actualizarea statusului pacientului a esuat.",
      dismiss: "Inchide",
      showing: (v: number, total: number) => `Se afiseaza ${v} din ${total} profiluri`,
      noneTitle: "Nu exista dosare pacient",
      noneHint: "Creeaza un profil pacient sau converteste o cerere pentru a incepe.",
      worker: "Lucrator",
      unassigned: "Nealocat",
      activeCare: "Ingrijire activa",
      inactive: "Inactiv",
      archived: "Arhivat",
      noNotes: "Nu exista notite clinice.",
      dobMissing: "Data nasterii nespecificata",
      genderMissing: "Gen nespecificat",
      deleteQ: "Stergi acest pacient?",
      yesDelete: "Da, sterge",
      cancel: "Anuleaza",
      deletePatient: "Sterge pacient",
      editProfile: "Editeaza profil",
      viewDetails: "Vezi detalii",
    },
    sq: {
      errDelete: "Deshtoi fshirja e pacientit.",
      errDeleteUnexpected: "Ndodhi nje gabim gjate fshirjes se pacientit.",
      errUpdateStatus: "Deshtoi perditesimi i statusit te pacientit.",
      dismiss: "Mbyll",
      showing: (v: number, total: number) => `Shfaqen ${v} nga ${total} profile pacientesh`,
      noneTitle: "Nuk u gjeten dosje pacientesh",
      noneHint: "Krijo nje profil pacienti ose konverto nje kerkese per te filluar.",
      worker: "Punonjes",
      unassigned: "Pacaktuar",
      activeCare: "Kujdes aktiv",
      inactive: "Joaktiv",
      archived: "Arkivuar",
      noNotes: "Nuk ka shenime mbi gjendjen.",
      dobMissing: "Datelindja nuk eshte dhene",
      genderMissing: "Gjinia nuk eshte specifikuar",
      deleteQ: "Ta fshijme kete pacient?",
      yesDelete: "Po, fshije",
      cancel: "Anulo",
      deletePatient: "Fshij pacientin",
      editProfile: "Ndrysho profilin",
      viewDetails: "Shiko detaje",
    },
    it: {
      errDelete: "Eliminazione paziente non riuscita.",
      errDeleteUnexpected: "Si e verificato un errore durante l'eliminazione del paziente.",
      errUpdateStatus: "Aggiornamento stato paziente non riuscito.",
      dismiss: "Chiudi",
      showing: (v: number, total: number) => `Mostrati ${v} di ${total} profili paziente`,
      noneTitle: "Nessuna scheda paziente trovata",
      noneHint: "Crea un profilo paziente o converti una richiesta per iniziare.",
      worker: "Operatore",
      unassigned: "Non assegnato",
      activeCare: "Cura attiva",
      inactive: "Inattivo",
      archived: "Archiviato",
      noNotes: "Nessuna nota clinica registrata.",
      dobMissing: "Data di nascita non indicata",
      genderMissing: "Genere non specificato",
      deleteQ: "Eliminare questo paziente?",
      yesDelete: "Si, elimina",
      cancel: "Annulla",
      deletePatient: "Elimina paziente",
      editProfile: "Modifica profilo",
      viewDetails: "Vedi dettagli",
    },
  }[lang];
  const [patients, setPatients] = useState<PatientItem[]>(initialPatients);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeStatusFilter, setActiveStatusFilter] = useState<PatientStatus | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<PatientPriority | "all">("all");
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

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const nameMatch = patient.full_name.toLowerCase().includes(query);
        const emailMatch = patient.email.toLowerCase().includes(query);
        const phoneMatch = patient.phone.includes(query);
        const notesMatch = patient.condition_notes?.toLowerCase().includes(query);
        const addressMatch = patient.address?.toLowerCase().includes(query);

        return nameMatch || emailMatch || phoneMatch || notesMatch || addressMatch;
      }

      return true;
    });
  }, [patients, activeStatusFilter, priorityFilter, searchQuery]);

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

  return (
    <div>
      <PatientsFilterBar
        searchQuery={searchQuery}
        onChangeSearchQuery={setSearchQuery}
        activeStatusFilter={activeStatusFilter}
        onChangeStatusFilter={setActiveStatusFilter}
        priorityFilter={priorityFilter}
        onChangePriorityFilter={setPriorityFilter}
        onAddPatient={() => setShowCreateModal(true)}
        onExportCSV={handleExportCSV}
        exportDisabled={filteredPatients.length === 0}
        onRefresh={onRefresh}
        isRefreshing={isRefreshing}
      />

      {errorMessage ? (
        <div
          role="alert"
          className="mb-4 rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-600 dark:text-red-400 flex items-center justify-between"
        >
          <span>{errorMessage}</span>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-xs font-semibold underline hover:no-underline ml-4"
          >
            {t.dismiss}
          </button>
        </div>
      ) : null}

      <div className="flex items-center justify-between mb-4 px-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {t.showing(filteredPatients.length, patients.length)}
        </p>
      </div>

      {filteredPatients.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-12 text-center">
          <UsersIcon className="mx-auto h-8 w-8 text-muted-foreground" />
          <h3 className="mt-3 text-base font-semibold text-foreground">{t.noneTitle}</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {t.noneHint}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredPatients.map((patient) => {
            const isDeleting = deletingId === patient.id;
            const isConfirmingDelete = confirmingDeleteId === patient.id;
            const priorityMeta = getPriorityMeta(patient.priority);

            return (
              <article key={patient.id} className="rounded-lg border border-border bg-card p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link
                      href={withLangPrefix(`/panel/patients/${patient.id}`, lang)}
                      className="block truncate text-sm font-semibold text-foreground hover:text-primary transition-colors"
                    >
                      {patient.full_name}
                    </Link>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      ID #{patient.id} {patient.request_id ? `(Req #${patient.request_id})` : ""}
                    </p>
                    <p className="mt-0.5 text-xs font-semibold text-primary">
                      {t.worker}: {patient.assigned_worker_name || t.unassigned}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1.5">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[0.65rem] font-semibold ${priorityMeta.badgeClass}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${priorityMeta.dotClass}`} />
                      {priorityMeta.label}
                    </span>
                    <select
                      value={patient.status}
                      onChange={(e) => handleUpdateStatus(patient.id, e.target.value as PatientStatus)}
                      className={`rounded-full border-0 px-2.5 py-1 text-[0.65rem] font-semibold capitalize cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                        patient.status === "active"
                          ? "bg-emerald-100 text-emerald-950 dark:bg-emerald-500/10 dark:text-emerald-400"
                          : patient.status === "inactive"
                          ? "bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-400"
                          : "bg-slate-100 text-slate-700 dark:bg-gray-500/10 dark:text-gray-400"
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

                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">{patient.phone}</span>
                  <span className="max-w-[220px] truncate">{patient.email}</span>
                  <span>{patient.date_of_birth || t.dobMissing}</span>
                  <span>{patient.gender || t.genderMissing}</span>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                  {isConfirmingDelete ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-red-600 dark:text-red-400">{t.deleteQ}</span>
                      <button
                        type="button"
                        disabled={isDeleting}
                        onClick={() => handleDelete(patient.id)}
                        className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                      >
                        {isDeleting ? "..." : t.yesDelete}
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmingDeleteId(null)}
                        className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted"
                      >
                        {t.cancel}
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmingDeleteId(patient.id)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-red-600 hover:bg-red-500/10 dark:text-red-400"
                      title={t.deletePatient}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  )}

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingPatient(patient)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
                      title={t.editProfile}
                    >
                      <EditIcon className="h-4 w-4" />
                    </button>
                    <Link
                      href={withLangPrefix(`/panel/patients/${patient.id}`, lang)}
                      className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white hover:bg-primary-hover transition-colors"
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
    </div>
  );
}
