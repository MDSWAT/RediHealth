"use client";

import { useMemo, useState } from "react";
import {
  EditIcon,
  MailIcon,
  PhoneIcon,
  StethoscopeIcon,
  TrashIcon,
  UserIcon,
} from "@/components/ui/icons";
import { useLanguage } from "@/lib/i18n/language-context";
import type { PatientItem } from "@/lib/types/patient";
import type { WorkerItem, WorkerStatus } from "@/lib/types/worker";
import { CreateWorkerModal } from "./CreateWorkerModal";
import { AssignPatientsModal } from "./AssignPatientsModal";
import { WorkersFilterBar } from "./WorkersFilterBar";

interface WorkersTableProps {
  initialWorkers: WorkerItem[];
  patients: PatientItem[];
  onRefresh?: () => Promise<void>;
  isRefreshing?: boolean;
  onUpdatePatients?: (updatedPatients: PatientItem[]) => void;
}

export function WorkersTable({
  initialWorkers,
  patients,
  onRefresh,
  isRefreshing = false,
  onUpdatePatients,
}: WorkersTableProps) {
  const { lang } = useLanguage();
  const t = {
    en: {
      errDelete: "Failed to delete worker.",
      errDeleteUnexpected: "An error occurred while deleting worker.",
      errUpdate: "Failed to update status.",
      dismiss: "Dismiss",
      showing: (v: number, total: number) => `Showing ${v} of ${total} staff workers`,
      noneTitle: "No staff workers found",
      noneHint: "Click \"Add Staff Worker\" to register a healthcare worker or administrator.",
      staffId: "Staff ID",
      general: "General Staff",
      statusToggle: "Click to toggle status",
      assigned: (count: number) => `${count} assigned patient${count === 1 ? "" : "s"}`,
      deleteQ: "Delete this worker?",
      yesDelete: "Yes, delete",
      cancel: "Cancel",
      deleteWorker: "Delete Worker",
      editWorker: "Edit Worker Profile",
      assignPatients: "Assign Patients",
    },
    ro: {
      errDelete: "Stergerea lucratorului a esuat.",
      errDeleteUnexpected: "A aparut o eroare la stergerea lucratorului.",
      errUpdate: "Actualizarea statusului a esuat.",
      dismiss: "Inchide",
      showing: (v: number, total: number) => `Se afiseaza ${v} din ${total} lucratori`,
      noneTitle: "Nu exista lucratori",
      noneHint: "Apasa \"Adauga lucrator\" pentru a inregistra personal medical sau administrator.",
      staffId: "ID personal",
      general: "Personal general",
      statusToggle: "Apasa pentru schimbarea statusului",
      assigned: (count: number) => `${count} pacient${count === 1 ? "" : "i"} alocat`,
      deleteQ: "Stergi acest lucrator?",
      yesDelete: "Da, sterge",
      cancel: "Anuleaza",
      deleteWorker: "Sterge lucrator",
      editWorker: "Editeaza profil lucrator",
      assignPatients: "Aloca pacienti",
    },
    sq: {
      errDelete: "Deshtoi fshirja e punonjesit.",
      errDeleteUnexpected: "Ndodhi nje gabim gjate fshirjes se punonjesit.",
      errUpdate: "Deshtoi perditesimi i statusit.",
      dismiss: "Mbyll",
      showing: (v: number, total: number) => `Shfaqen ${v} nga ${total} punonjes`,
      noneTitle: "Nuk u gjet staf",
      noneHint: "Kliko \"Shto punonjes\" per te regjistruar nje punonjes shendetesor ose administrator.",
      staffId: "ID stafi",
      general: "Staf i pergjithshem",
      statusToggle: "Kliko per te ndryshuar statusin",
      assigned: (count: number) => `${count} pacient${count === 1 ? "" : "e"} i caktuar`,
      deleteQ: "Ta fshijme kete punonjes?",
      yesDelete: "Po, fshije",
      cancel: "Anulo",
      deleteWorker: "Fshij punonjesin",
      editWorker: "Ndrysho profilin",
      assignPatients: "Cakto paciente",
    },
    it: {
      errDelete: "Eliminazione operatore non riuscita.",
      errDeleteUnexpected: "Si e verificato un errore durante l'eliminazione dell'operatore.",
      errUpdate: "Aggiornamento stato non riuscito.",
      dismiss: "Chiudi",
      showing: (v: number, total: number) => `Mostrati ${v} di ${total} operatori`,
      noneTitle: "Nessun operatore trovato",
      noneHint: "Clicca \"Aggiungi operatore\" per registrare personale sanitario o amministratore.",
      staffId: "ID staff",
      general: "Staff generale",
      statusToggle: "Clicca per cambiare stato",
      assigned: (count: number) => `${count} paziente${count === 1 ? "" : "i"} assegnato`,
      deleteQ: "Eliminare questo operatore?",
      yesDelete: "Si, elimina",
      cancel: "Annulla",
      deleteWorker: "Elimina operatore",
      editWorker: "Modifica profilo operatore",
      assignPatients: "Assegna pazienti",
    },
  }[lang];
  const [workers, setWorkers] = useState<WorkerItem[]>(initialWorkers);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<WorkerStatus | "all">("all");

  const [editingWorker, setEditingWorker] = useState<WorkerItem | null>(null);
  const [assigningWorker, setAssigningWorker] = useState<WorkerItem | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createRoleTemplate, setCreateRoleTemplate] = useState<string | null>(null);

  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const filteredWorkers = useMemo(() => {
    return workers.filter((worker) => {
      if (statusFilter !== "all" && worker.status !== statusFilter) {
        return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const nameMatch = worker.full_name.toLowerCase().includes(q);
        const emailMatch = worker.email.toLowerCase().includes(q);
        const phoneMatch = worker.phone?.includes(q) || false;
        const roleMatch = worker.role.toLowerCase().includes(q);
        const deptMatch = worker.department?.toLowerCase().includes(q) || false;

        return nameMatch || emailMatch || phoneMatch || roleMatch || deptMatch;
      }

      return true;
    });
  }, [workers, statusFilter, searchQuery]);

  async function handleDelete(id: string) {
    setDeletingId(id);
    setErrorMessage(null);

    try {
      const response = await fetch(`/api/workers?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        setErrorMessage(data.error || t.errDelete);
        return;
      }

      setWorkers((prev) => prev.filter((w) => w.id !== id));
      setConfirmingDeleteId(null);
    } catch {
      setErrorMessage(t.errDeleteUnexpected);
    } finally {
      setDeletingId(null);
    }
  }

  async function handleToggleStatus(worker: WorkerItem) {
    const newStatus: WorkerStatus =
      worker.status === "active" ? "inactive" : "active";

    try {
      const response = await fetch("/api/workers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: worker.id, status: newStatus }),
      });

      if (response.ok) {
        setWorkers((prev) =>
          prev.map((w) => (w.id === worker.id ? { ...w, status: newStatus } : w)),
        );
      }
    } catch {
      setErrorMessage(t.errUpdate);
    }
  }

  function handleExportCSV() {
    if (filteredWorkers.length === 0) return;

    const headers = [
      "Worker ID",
      "Full Name",
      "Email",
      "Phone",
      "Role",
      "Department",
      "Status",
      "Assigned Patients Count",
      "Created At",
    ];

    const rows = filteredWorkers.map((w) => [
      w.id,
      `"${w.full_name.replace(/"/g, '""')}"`,
      `"${w.email.replace(/"/g, '""')}"`,
      `"${(w.phone || "").replace(/"/g, '""')}"`,
      `"${w.role.replace(/"/g, '""')}"`,
      `"${(w.department || "").replace(/"/g, '""')}"`,
      w.status,
      w.assigned_patients_count || 0,
      new Date(w.created_at).toISOString(),
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `redihealth-workers-${new Date().toISOString().slice(0, 10)}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div>
      <WorkersFilterBar
        searchQuery={searchQuery}
        onChangeSearchQuery={setSearchQuery}
        statusFilter={statusFilter}
        onChangeStatusFilter={setStatusFilter}
        onAddWorker={() => setShowCreateModal(true)}
        onAddMediator={() => {
          setCreateRoleTemplate("Mediator");
          setShowCreateModal(true);
        }}
        onExportCSV={handleExportCSV}
        exportDisabled={filteredWorkers.length === 0}
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
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-xs font-semibold underline hover:no-underline ml-4"
          >
            {t.dismiss}
          </button>
        </div>
      ) : null}

      <div className="flex items-center justify-between mb-4 px-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {t.showing(filteredWorkers.length, workers.length)}
        </p>
      </div>

      {filteredWorkers.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-12 text-center">
          <StethoscopeIcon className="mx-auto h-8 w-8 text-muted-foreground" />
          <h3 className="mt-3 text-base font-semibold text-foreground">{t.noneTitle}</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {t.noneHint}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredWorkers.map((worker) => {
            const isDeleting = deletingId === worker.id;
            const isConfirmingDelete = confirmingDeleteId === worker.id;
            const assignedCount = patients.filter((p) => p.assigned_worker_id === worker.id).length;

            return (
              <article key={worker.id} className="rounded-lg border border-border bg-card p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">{worker.full_name}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{t.staffId} #{worker.id}</p>
                    <p className="mt-0.5 text-xs">
                      <span className="font-semibold text-primary">{worker.role}</span>
                      <span className="text-muted-foreground"> · {worker.department || t.general}</span>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(worker)}
                    className={`shrink-0 rounded-full border-0 px-2.5 py-1 text-[0.65rem] font-semibold capitalize cursor-pointer ${
                      worker.status === "active"
                        ? "bg-emerald-100 text-emerald-950 dark:bg-emerald-500/10 dark:text-emerald-400"
                        : "bg-slate-100 text-slate-700 dark:bg-gray-500/10 dark:text-gray-400"
                    }`}
                    title={t.statusToggle}
                  >
                    {worker.status}
                  </button>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
                  <a href={`mailto:${worker.email}`} className="inline-flex items-center gap-1 font-semibold text-primary hover:underline">
                    <MailIcon className="h-3.5 w-3.5" />
                    {worker.email}
                  </a>
                  {worker.phone ? (
                    <a href={`tel:${worker.phone}`} className="inline-flex items-center gap-1 hover:text-foreground">
                      <PhoneIcon className="h-3.5 w-3.5" />
                      {worker.phone}
                    </a>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => setAssigningWorker(worker)}
                    className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-2.5 py-0.5 font-semibold text-primary hover:bg-primary/20 transition-colors"
                  >
                    <UserIcon className="h-3.5 w-3.5" />
                    {t.assigned(assignedCount)}
                  </button>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                  {isConfirmingDelete ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-red-600 dark:text-red-400">{t.deleteQ}</span>
                      <button
                        type="button"
                        disabled={isDeleting}
                        onClick={() => handleDelete(worker.id)}
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
                      onClick={() => setConfirmingDeleteId(worker.id)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-red-600 hover:bg-red-500/10 dark:text-red-400"
                      title={t.deleteWorker}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  )}

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingWorker(worker)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
                      title={t.editWorker}
                    >
                      <EditIcon className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setAssigningWorker(worker)}
                      className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white hover:bg-primary-hover transition-colors"
                    >
                      {t.assignPatients}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {assigningWorker ? (
        <AssignPatientsModal
          worker={assigningWorker}
          patients={patients}
          onClose={() => setAssigningWorker(null)}
          onSuccess={(updatedPatients) => {
            if (onUpdatePatients) {
              onUpdatePatients(updatedPatients);
            }
          }}
        />
      ) : null}

      {showCreateModal || editingWorker ? (
        <CreateWorkerModal
          worker={editingWorker || undefined}
          defaultRole={createRoleTemplate || undefined}
          defaultDepartment={createRoleTemplate === "Mediator" ? "Mediation" : undefined}
          onClose={() => {
            setShowCreateModal(false);
            setEditingWorker(null);
            setCreateRoleTemplate(null);
          }}
          onSuccess={(saved) => {
            if (editingWorker) {
              setWorkers((prev) =>
                prev.map((w) => (w.id === saved.id ? saved : w)),
              );
            } else {
              setWorkers((prev) => [saved, ...prev]);
            }
          }}
        />
      ) : null}
    </div>
  );
}
