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
import { crmTranslations } from "@/lib/i18n/crm-translations";
import { localDateKey } from "@/lib/panel-dates";
import { csvTimestamp, downloadCsv } from "./panel-csv";

interface WorkersTableProps {
  initialWorkers: WorkerItem[];
  patients: PatientItem[];
  isRomania: boolean;
  onRefresh?: () => Promise<void>;
  isRefreshing?: boolean;
  onUpdatePatients?: (updatedPatients: PatientItem[]) => void;
}

export function WorkersTable({
  initialWorkers,
  patients,
  isRomania,
  onRefresh,
  isRefreshing = false,
  onUpdatePatients,
}: WorkersTableProps) {
  const { lang } = useLanguage();
  const t = {
    en: {
      errDelete: "Could not delete.",
      errDeleteUnexpected: "Could not delete. Try again.",
      errUpdate: "Could not change the status.",
      dismiss: "Close",
      showing: (v: number, total: number) => `${v} of ${total} staff`,
      noneTitle: "No staff yet",
      noneHint: "Add a health worker or an administrator.",
      staffId: "Staff no.",
      general: "General",
      statusToggle: "Change status",
      assigned: (count: number) => `${count} assigned patient${count === 1 ? "" : "s"}`,
      deleteQ: "Delete this staff member?",
      yesDelete: "Yes, delete",
      cancel: "Cancel",
      deleteWorker: "Delete",
      editWorker: "Edit",
      assignPatients: "Assign patients",
    },
    ro: {
      errDelete: "Nu s-a putut șterge.",
      errDeleteUnexpected: "Nu s-a putut șterge. Încearcă din nou.",
      errUpdate: "Statusul nu a putut fi schimbat.",
      dismiss: "Închide",
      showing: (v: number, total: number) => `${v} din ${total} persoane`,
      noneTitle: "Nu există personal încă",
      noneHint: "Adaugă personal medical sau un administrator.",
      staffId: "Nr.",
      general: "General",
      statusToggle: "Schimbă statusul",
      assigned: (count: number) => `${count} ${count === 1 ? "pacient alocat" : "pacienți alocați"}`,
      deleteQ: "Ștergi această persoană?",
      yesDelete: "Da, șterge",
      cancel: "Anulează",
      deleteWorker: "Șterge",
      editWorker: "Editează",
      assignPatients: "Alocă pacienți",
    },
    sq: {
      errDelete: "Nuk u fshi.",
      errDeleteUnexpected: "Nuk u fshi. Provo përsëri.",
      errUpdate: "Statusi nuk u ndryshua.",
      dismiss: "Mbyll",
      showing: (v: number, total: number) => `${v} nga ${total} punonjës`,
      noneTitle: "Ende pa staf",
      noneHint: "Shto një punonjës shëndetësor ose një administrator.",
      staffId: "Nr.",
      general: "I përgjithshëm",
      statusToggle: "Ndrysho statusin",
      assigned: (count: number) => `${count} ${count === 1 ? "pacient i caktuar" : "pacientë të caktuar"}`,
      deleteQ: "Ta fshish këtë punonjës?",
      yesDelete: "Po, fshije",
      cancel: "Anulo",
      deleteWorker: "Fshi",
      editWorker: "Ndrysho",
      assignPatients: "Cakto pacientë",
    },
    it: {
      errDelete: "Impossibile eliminare.",
      errDeleteUnexpected: "Impossibile eliminare. Riprova.",
      errUpdate: "Impossibile cambiare lo stato.",
      dismiss: "Chiudi",
      showing: (v: number, total: number) => `${v} di ${total} operatori`,
      noneTitle: "Ancora nessun operatore",
      noneHint: "Aggiungi un operatore sanitario o un amministratore.",
      staffId: "N.",
      general: "Generale",
      statusToggle: "Cambia stato",
      assigned: (count: number) => `${count} ${count === 1 ? "paziente assegnato" : "pazienti assegnati"}`,
      deleteQ: "Eliminare questo operatore?",
      yesDelete: "Sì, elimina",
      cancel: "Annulla",
      deleteWorker: "Elimina",
      editWorker: "Modifica",
      assignPatients: "Assegna pazienti",
    },
    hr: {
      errDelete: "Brisanje nije uspjelo.",
      errDeleteUnexpected: "Brisanje nije uspjelo. Pokušaj ponovno.",
      errUpdate: "Promjena statusa nije uspjela.",
      dismiss: "Zatvori",
      showing: (v: number, total: number) => `${v} od ${total} članova osoblja`,
      noneTitle: "Još nema osoblja",
      noneHint: "Dodaj zdravstvenog radnika ili administratora.",
      staffId: "Br.",
      general: "Opće",
      statusToggle: "Promijeni status",
      assigned: (count: number) => `${count} ${count === 1 ? "dodijeljeni pacijent" : "dodijeljenih pacijenata"}`,
      deleteQ: "Izbrisati ovog člana osoblja?",
      yesDelete: "Da, izbriši",
      cancel: "Odustani",
      deleteWorker: "Izbriši",
      editWorker: "Uredi",
      assignPatients: "Dodijeli pacijente",
    },
    rom: {
      errDelete: "Nashti kosto.",
      errDeleteUnexpected: "Nashti kosto. Zumav pale.",
      errUpdate: "Nashti paruvdilo o statuso.",
      dismiss: "Phandav",
      showing: (v: number, total: number) => `${v} katar ${total} manusha`,
      noneTitle: "Inke nay ekipa",
      noneHint: "Tho ekh sastipnasko bukyarno vay administratoro.",
      staffId: "Nr.",
      general: "Generalno",
      statusToggle: "Paruv o statuso",
      assigned: (count: number) => `${count} ${count === 1 ? "dindo paciento" : "dine pacienturya"}`,
      deleteQ: "Koses kadale manushes?",
      yesDelete: "Va, kos",
      cancel: "Mekh",
      deleteWorker: "Kos",
      editWorker: "Paruv",
      assignPatients: "De pacienturya",
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
    const crm = crmTranslations[lang];
    const header = [crm.csvId, crm.csvName, crm.csvEmail, crm.csvPhone, crm.csvRole, crm.csvDepartment, crm.status, crm.csvAssignedPatients, crm.csvCreated];
    downloadCsv(`redihealth-workers-${localDateKey()}.csv`, header, filteredWorkers.map((w) => [
      w.id, w.full_name, w.email, w.phone || "", w.role, w.department || "", w.status, w.assigned_patients_count || 0, csvTimestamp(w.created_at),
    ]));
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
        <p className="text-xs font-semibold text-muted-foreground">
          {t.showing(filteredWorkers.length, workers.length)}
        </p>
      </div>

      {filteredWorkers.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
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
              <article key={`${worker.id}-${worker.email}`} className="rounded-xl border border-border bg-card p-5 shadow-xs transition-colors hover:border-border hover:shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-base font-bold text-foreground">{worker.full_name}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{t.staffId} #{worker.id}</p>
                    <p className="mt-1 text-xs">
                      <span className="font-semibold text-primary">{worker.role}</span>
                      <span className="text-muted-foreground"> · {worker.department || t.general}</span>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(worker)}
                    className={`shrink-0 rounded-lg border px-2.5 py-1 text-xs font-bold capitalize cursor-pointer transition-colors ${
                      worker.status === "active"
                        ? "border-emerald-200 bg-emerald-50/80 text-emerald-800"
                        : "border-slate-200 bg-slate-100 text-slate-700"
                    }`}
                    title={t.statusToggle}
                  >
                    {worker.status}
                  </button>
                </div>

                <div className="mt-3.5 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
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
                    className="inline-flex items-center gap-1.5 rounded-md border border-primary/20 bg-primary-soft px-2.5 py-0.5 font-semibold text-primary hover:bg-primary-soft/80 transition-colors"
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
                        className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:bg-muted disabled:text-muted-foreground transition-colors"
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
                      onClick={() => setConfirmingDeleteId(worker.id)}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                      title={t.deleteWorker}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  )}

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingWorker(worker)}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                      title={t.editWorker}
                    >
                      <EditIcon className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setAssigningWorker(worker)}
                      className="inline-flex items-center justify-center min-h-10 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-white hover:bg-primary-hover shadow-2xs transition-colors"
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
          isRomania={isRomania}
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
