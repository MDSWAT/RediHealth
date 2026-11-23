"use client";

import { useMemo, useState, type Dispatch, type SetStateAction } from "react";
import { EditIcon, TrashIcon } from "@/components/ui/icons";
import { useLanguage } from "@/lib/i18n/language-context";
import type { Lang } from "@/lib/i18n/translations";
import type { PatientItem } from "@/lib/types/patient";
import type { WorkerItem, WorkerStatus } from "@/lib/types/worker";
import { CreateWorkerModal } from "./CreateWorkerModal";
import { AssignPatientsModal } from "./AssignPatientsModal";
import { WorkersFilterBar } from "./WorkersFilterBar";
import { crmTranslations } from "@/lib/i18n/crm-translations";
import { langToLocale } from "@/lib/i18n/panel-translations";
import { localDateKey } from "@/lib/panel-dates";
import { csvTimestamp, downloadCsv } from "./panel-csv";

interface WorkersTableProps {
  initialWorkers: WorkerItem[];
  onWorkersChange?: Dispatch<SetStateAction<WorkerItem[]>>;
  patients: PatientItem[];
  isRomania: boolean;
  onRefresh?: () => Promise<void>;
  isRefreshing?: boolean;
  onUpdatePatients?: (updatedPatients: PatientItem[]) => void;
}

const ROLE_LABELS: Record<Lang, Record<string, string>> = {
  ru: {
    doctor: "Врач",
    mediator: "Медиатор",
    nurse: "Медсестра",
    administrator: "Администратор",
    "healthcare worker": "Медицинский работник",
    "case worker": "Специалист по случаю",
    "general practitioner": "Семейный врач",
    "super admin": "Суперадминистратор",
    superadmin: "Суперадминистратор",
  },
  en: {
    doctor: "Doctor",
    mediator: "Mediator",
    nurse: "Nurse",
    administrator: "Administrator",
    "healthcare worker": "Health worker",
    "case worker": "Case worker",
    "general practitioner": "Family doctor",
    "super admin": "Super admin",
    superadmin: "Super admin",
  },
  ro: {
    doctor: "Medic",
    mediator: "Mediator",
    nurse: "Asistent medical",
    administrator: "Administrator",
    "healthcare worker": "Personal medical",
    "case worker": "Responsabil de caz",
    "general practitioner": "Medic de familie",
    "super admin": "Super administrator",
    superadmin: "Super administrator",
  },
  sq: {
    doctor: "Mjek",
    mediator: "Mediator",
    nurse: "Infermier",
    administrator: "Administrator",
    "healthcare worker": "Punonjës shëndetësor",
    "case worker": "Përgjegjës rasti",
    "general practitioner": "Mjek familje",
    "super admin": "Super administrator",
    superadmin: "Super administrator",
  },
  it: {
    doctor: "Medico",
    mediator: "Mediatore",
    nurse: "Infermiere",
    administrator: "Amministratore",
    "healthcare worker": "Operatore sanitario",
    "case worker": "Referente del caso",
    "general practitioner": "Medico di base",
    "super admin": "Super amministratore",
    superadmin: "Super amministratore",
  },
  hr: {
    doctor: "Liječnik",
    mediator: "Zdravstveni medijator",
    nurse: "Medicinska sestra",
    administrator: "Administrator",
    "healthcare worker": "Zdravstveni radnik",
    "case worker": "Voditelj slučaja",
    "general practitioner": "Obiteljski liječnik",
    "super admin": "Super administrator",
    superadmin: "Super administrator",
  },
  rom: {
    doctor: "Doktori",
    mediator: "Sastipnasko mediatori",
    nurse: "Sastipnaski phen",
    administrator: "Administratoro",
    "healthcare worker": "Sastipnasko bukyarno",
    "case worker": "Manush e kazosko",
    "general practitioner": "Familijako doktori",
    "super admin": "Super administratoro",
    superadmin: "Super administratoro",
  },
};

function formatRoleLabel(role: string, lang: Lang): string {
  const normalized = role.trim().toLowerCase();
  const mapped = ROLE_LABELS[lang][normalized];
  if (mapped) return mapped;
  if (!role.trim()) return "";
  const trimmed = role.trim();
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return parts
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

export function WorkersTable({
  initialWorkers,
  onWorkersChange,
  patients,
  isRomania,
  onRefresh,
  isRefreshing = false,
  onUpdatePatients,
}: WorkersTableProps) {
  const { lang } = useLanguage();
  const locale = langToLocale[lang];
  const t = {
    ru: {
      errDelete: "Не удалось удалить.",
      errDeleteUnexpected: "Не удалось удалить. Попробуйте еще раз.",
      errUpdate: "Не удалось изменить статус.",
      dismiss: "Закрыть",
      showing: (v: number, total: number) => `${v} из ${total} сотрудников`,
      noneTitle: "Персонала пока нет",
      noneHint: "Добавьте медицинского работника или администратора.",
      staffId: "№",
      general: "Общий профиль",
      activeStatus: "Активен",
      inactiveStatus: "Неактивен",
      activate: "Активировать",
      deactivate: "Отключить",
      statusToggle: "Изменить статус",
      assigned: (count: number) =>
        count === 1 ? "1 назначенный пациент" : `Назначено пациентов: ${count}`,
      deleteQ: "Удалить этого сотрудника?",
      yesDelete: "Да, удалить",
      cancel: "Отмена",
      deleteWorker: "Удалить",
      editWorker: "Редактировать",
      assignPatients: "Назначить пациентов",
      clearSearch: "Сбросить фильтры",
    },
    en: {
      errDelete: "Could not delete.",
      errDeleteUnexpected: "Could not delete. Try again.",
      errUpdate: "Could not change the status.",
      dismiss: "Close",
      showing: (v: number, total: number) => `${v} of ${total} staff`,
      noneTitle: "No staff yet",
      noneHint: "Add a health worker or an administrator.",
      staffId: "#",
      general: "General",
      activeStatus: "Active",
      inactiveStatus: "Inactive",
      activate: "Activate",
      deactivate: "Deactivate",
      statusToggle: "Change status",
      assigned: (count: number) => `${count} assigned patient${count === 1 ? "" : "s"}`,
      deleteQ: "Delete this staff member?",
      yesDelete: "Yes, delete",
      cancel: "Cancel",
      deleteWorker: "Delete",
      editWorker: "Edit",
      assignPatients: "Assign patients",
      clearSearch: "Clear filters",
    },
    ro: {
      errDelete: "Nu s-a putut șterge.",
      errDeleteUnexpected: "Nu s-a putut șterge. Încearcă din nou.",
      errUpdate: "Statusul nu a putut fi schimbat.",
      dismiss: "Închide",
      showing: (v: number, total: number) => `${v} din ${total} persoane`,
      noneTitle: "Nu există personal încă",
      noneHint: "Adaugă personal medical sau un administrator.",
      staffId: "#",
      general: "General",
      activeStatus: "Activ",
      inactiveStatus: "Inactiv",
      activate: "Activează",
      deactivate: "Dezactivează",
      statusToggle: "Schimbă statusul",
      assigned: (count: number) => `${count} ${count === 1 ? "pacient alocat" : "pacienți alocați"}`,
      deleteQ: "Ștergi această persoană?",
      yesDelete: "Da, șterge",
      cancel: "Anulează",
      deleteWorker: "Șterge",
      editWorker: "Editează",
      assignPatients: "Alocă pacienți",
      clearSearch: "Resetează filtrele",
    },
    sq: {
      errDelete: "Nuk u fshi.",
      errDeleteUnexpected: "Nuk u fshi. Provo përsëri.",
      errUpdate: "Statusi nuk u ndryshua.",
      dismiss: "Mbyll",
      showing: (v: number, total: number) => `${v} nga ${total} punonjës`,
      noneTitle: "Ende pa staf",
      noneHint: "Shto një punonjës shëndetësor ose një administrator.",
      staffId: "#",
      general: "I përgjithshëm",
      activeStatus: "Aktiv",
      inactiveStatus: "Joaktiv",
      activate: "Aktivizo",
      deactivate: "Çaktivizo",
      statusToggle: "Ndrysho statusin",
      assigned: (count: number) => `${count} ${count === 1 ? "pacient i caktuar" : "pacientë të caktuar"}`,
      deleteQ: "Ta fshish këtë punonjës?",
      yesDelete: "Po, fshije",
      cancel: "Anulo",
      deleteWorker: "Fshi",
      editWorker: "Ndrysho",
      assignPatients: "Cakto pacientë",
      clearSearch: "Pastro filtrat",
    },
    it: {
      errDelete: "Impossibile eliminare.",
      errDeleteUnexpected: "Impossibile eliminare. Riprova.",
      errUpdate: "Impossibile cambiare lo stato.",
      dismiss: "Chiudi",
      showing: (v: number, total: number) => `${v} di ${total} operatori`,
      noneTitle: "Ancora nessun operatore",
      noneHint: "Aggiungi un operatore sanitario o un amministratore.",
      staffId: "#",
      general: "Generale",
      activeStatus: "Attivo",
      inactiveStatus: "Inattivo",
      activate: "Attiva",
      deactivate: "Disattiva",
      statusToggle: "Cambia stato",
      assigned: (count: number) => `${count} ${count === 1 ? "paziente assegnato" : "pazienti assegnati"}`,
      deleteQ: "Eliminare questo operatore?",
      yesDelete: "Sì, elimina",
      cancel: "Annulla",
      deleteWorker: "Elimina",
      editWorker: "Modifica",
      assignPatients: "Assegna pazienti",
      clearSearch: "Ripristina filtri",
    },
    hr: {
      errDelete: "Brisanje nije uspjelo.",
      errDeleteUnexpected: "Brisanje nije uspjelo. Pokušaj ponovno.",
      errUpdate: "Promjena statusa nije uspjela.",
      dismiss: "Zatvori",
      showing: (v: number, total: number) => `${v} od ${total} članova osoblja`,
      noneTitle: "Još nema osoblja",
      noneHint: "Dodaj zdravstvenog radnika ili administratora.",
      staffId: "#",
      general: "Opće",
      activeStatus: "Aktivan",
      inactiveStatus: "Neaktivan",
      activate: "Aktiviraj",
      deactivate: "Deaktiviraj",
      statusToggle: "Promijeni status",
      assigned: (count: number) => `${count} ${count === 1 ? "dodijeljeni pacijent" : "dodijeljenih pacijenata"}`,
      deleteQ: "Izbrisati ovog člana osoblja?",
      yesDelete: "Da, izbriši",
      cancel: "Odustani",
      deleteWorker: "Izbriši",
      editWorker: "Uredi",
      assignPatients: "Dodijeli pacijente",
      clearSearch: "Očisti filtre",
    },
    rom: {
      errDelete: "Nashti kosto.",
      errDeleteUnexpected: "Nashti kosto. Zumav pale.",
      errUpdate: "Nashti paruvdilo o statuso.",
      dismiss: "Phandav",
      showing: (v: number, total: number) => `${v} katar ${total} manusha`,
      noneTitle: "Inke nay ekipa",
      noneHint: "Tho ekh sastipnasko bukyarno vay administratoro.",
      staffId: "#",
      general: "Generalno",
      activeStatus: "Aktivno",
      inactiveStatus: "Bi-aktivno",
      activate: "Aktivisar",
      deactivate: "Bi-aktivisar",
      statusToggle: "Paruv o statuso",
      assigned: (count: number) => `${count} ${count === 1 ? "dindo paciento" : "dine pacienturya"}`,
      deleteQ: "Koses kadale manushes?",
      yesDelete: "Va, kos",
      cancel: "Mekh",
      deleteWorker: "Kos",
      editWorker: "Paruv",
      assignPatients: "De pacienturya",
      clearSearch: "Khos le filtrurya",
    },
  }[lang];

  const [internalWorkers, setInternalWorkers] = useState<WorkerItem[]>(initialWorkers);
  const workers = onWorkersChange ? initialWorkers : internalWorkers;
  const setWorkers = onWorkersChange ?? setInternalWorkers;

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<WorkerStatus | "all">("all");

  const [editingWorker, setEditingWorker] = useState<WorkerItem | null>(null);
  const [assigningWorker, setAssigningWorker] = useState<WorkerItem | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createRoleTemplate, setCreateRoleTemplate] = useState<string | null>(null);

  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const statusCounts = useMemo(() => {
    let active = 0;
    let inactive = 0;
    for (const worker of workers) {
      if (worker.status === "active") active++;
      else inactive++;
    }
    return { all: workers.length, active, inactive };
  }, [workers]);

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
        const roleMatch =
          worker.role.toLowerCase().includes(q) ||
          formatRoleLabel(worker.role, lang).toLowerCase().includes(q);
        const deptMatch = worker.department?.toLowerCase().includes(q) || false;

        return nameMatch || emailMatch || phoneMatch || roleMatch || deptMatch;
      }

      return true;
    });
  }, [workers, statusFilter, searchQuery, lang]);

  const hasFilters = Boolean(searchQuery.trim() || statusFilter !== "all");

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

    setTogglingId(worker.id);
    setErrorMessage(null);

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
      } else {
        setErrorMessage(t.errUpdate);
      }
    } catch {
      setErrorMessage(t.errUpdate);
    } finally {
      setTogglingId(null);
    }
  }

  function handleExportCSV() {
    if (filteredWorkers.length === 0) return;
    const crm = crmTranslations[lang];
    const header = [
      crm.csvId,
      crm.csvName,
      crm.csvEmail,
      crm.csvPhone,
      crm.csvRole,
      crm.csvDepartment,
      crm.status,
      crm.csvAssignedPatients,
      crm.csvCreated,
    ];
    downloadCsv(
      `redihealth-workers-${localDateKey()}.csv`,
      header,
      filteredWorkers.map((w) => [
        w.id,
        w.full_name,
        w.email,
        w.phone || "",
        w.role,
        w.department || "",
        w.status,
        w.assigned_patients_count || 0,
        csvTimestamp(w.created_at),
      ]),
    );
  }

  const assignedCountByWorker = useMemo(() => {
    const map = new Map<string, number>();
    for (const patient of patients) {
      if (patient.assigned_worker_id) {
        map.set(
          patient.assigned_worker_id,
          (map.get(patient.assigned_worker_id) ?? 0) + 1,
        );
      }
    }
    return map;
  }, [patients]);

  return (
    <div>
      <WorkersFilterBar
        searchQuery={searchQuery}
        onChangeSearchQuery={setSearchQuery}
        statusFilter={statusFilter}
        onChangeStatusFilter={setStatusFilter}
        counts={statusCounts}
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
          className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#b91c1c]/30 bg-[#fef2f2] px-4 py-3 text-sm text-[#991b1b] dark:border-[#ffb4b4]/35 dark:bg-[#2c1519] dark:text-[#ffb4b4]"
        >
          <span>{errorMessage}</span>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="inline-flex min-h-11 shrink-0 items-center whitespace-nowrap rounded-lg px-3 text-sm font-medium underline underline-offset-3 hover:no-underline"
          >
            {t.dismiss}
          </button>
        </div>
      ) : null}

      {hasFilters ? (
        <div className="flex items-center justify-between py-3">
          <p className="text-xs font-medium tabular-nums text-[var(--panel-muted)]" aria-live="polite">
            {t.showing(filteredWorkers.length, workers.length)}
          </p>
        </div>
      ) : null}

      {filteredWorkers.length === 0 ? (
        <div className={`py-12 text-center ${hasFilters ? "border-t border-[var(--panel-line)]" : ""}`}>
          <h2 className="text-base font-semibold text-[var(--panel-ink)]">{t.noneTitle}</h2>
          <p className="mt-1 text-sm text-[var(--panel-muted)]">{t.noneHint}</p>
          {hasFilters ? (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("all");
              }}
              className="mt-4 inline-flex min-h-11 shrink-0 items-center justify-center whitespace-nowrap rounded-lg border border-[var(--color-border-control)] dark:border-[var(--panel-line)] bg-[var(--panel-surface)] px-4 text-sm font-medium text-[var(--panel-ink)] transition-colors hover:bg-[var(--panel-selection)]"
            >
              {t.clearSearch}
            </button>
          ) : null}
        </div>
      ) : (
        <div
          className={`divide-y divide-[var(--panel-line)] border-b border-[var(--panel-line)] ${
            hasFilters ? "border-t" : ""
          }`}
        >
          {filteredWorkers.map((worker) => {
            const isDeleting = deletingId === worker.id;
            const isToggling = togglingId === worker.id;
            const isConfirmingDelete = confirmingDeleteId === worker.id;
            const assignedCount = assignedCountByWorker.get(worker.id) ?? 0;
            const roleLabel = formatRoleLabel(worker.role, lang);
            const statusLabel = worker.status === "active" ? t.activeStatus : t.inactiveStatus;

            return (
              <article
                key={`${worker.id}-${worker.email}`}
                className="flex flex-col gap-3 py-4 transition-colors hover:bg-[var(--panel-subtle)] lg:flex-row lg:items-center lg:justify-between lg:gap-6 lg:px-2"
              >
                <div className="flex min-w-0 flex-1 items-start gap-3">
                  <span
                    aria-hidden="true"
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--panel-selection)] text-xs font-semibold text-[var(--color-sapphire)] dark:text-[#bad7fa]"
                  >
                    {getInitials(worker.full_name)}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
                      <h2 className="truncate text-sm font-semibold text-[var(--panel-ink)]">
                        {worker.full_name}
                      </h2>
                      <span
                        className={`text-xs font-medium ${
                          worker.status === "active"
                            ? "text-[var(--panel-ink)]"
                            : "text-[var(--panel-muted)]"
                        }`}
                      >
                        {statusLabel}
                      </span>
                      <span className="text-xs tabular-nums text-[var(--panel-muted)]">
                        {t.staffId}{worker.id}
                      </span>
                    </div>

                    <div className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-xs">
                      <span className="font-medium text-[var(--color-sapphire)] dark:text-[#bad7fa]">
                        {roleLabel}
                      </span>
                      <span className="text-[var(--panel-muted)]">
                        {worker.department || t.general}
                      </span>
                      {worker.county ? (
                        <span className="text-[var(--panel-muted)]">{worker.county}</span>
                      ) : null}
                      <span className="tabular-nums text-[var(--panel-muted)]">
                        {t.assigned(assignedCount).replace(
                          String(assignedCount),
                          assignedCount.toLocaleString(locale),
                        )}
                      </span>
                    </div>

                    <div className="mt-1.5 flex flex-wrap items-baseline gap-x-4 gap-y-1 text-xs">
                      <a
                        href={`mailto:${worker.email}`}
                        className="break-all font-medium text-[var(--color-sapphire)] underline decoration-current/35 underline-offset-3 hover:decoration-current dark:text-[#bad7fa]"
                      >
                        {worker.email}
                      </a>
                      {worker.phone ? (
                        <a
                          href={`tel:${worker.phone}`}
                          className="tabular-nums text-[var(--panel-muted)] underline decoration-current/30 underline-offset-3 hover:text-[var(--panel-ink)]"
                        >
                          {worker.phone}
                        </a>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 lg:shrink-0">
                  {isConfirmingDelete ? (
                    <>
                      <span className="text-xs font-medium text-[#b91c1c] dark:text-[#ffb4b4]">
                        {t.deleteQ}
                      </span>
                      <button
                        type="button"
                        disabled={isDeleting}
                        onClick={() => handleDelete(worker.id)}
                        className="inline-flex min-h-11 shrink-0 items-center justify-center whitespace-nowrap rounded-lg bg-[#c62f3c] px-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#a8242f] disabled:cursor-default disabled:bg-[var(--panel-subtle)] disabled:text-[var(--panel-muted)]"
                      >
                        {isDeleting ? "..." : t.yesDelete}
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmingDeleteId(null)}
                        className="inline-flex min-h-11 shrink-0 items-center justify-center whitespace-nowrap rounded-lg border border-[var(--color-border-control)] dark:border-[var(--panel-line)] bg-[var(--panel-surface)] px-3.5 text-sm font-medium text-[var(--panel-ink)] transition-colors hover:bg-[var(--panel-selection)]"
                      >
                        {t.cancel}
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => setAssigningWorker(worker)}
                        className="inline-flex min-h-11 shrink-0 items-center justify-center whitespace-nowrap rounded-lg border border-[var(--color-border-control)] dark:border-[var(--panel-line)] bg-[var(--panel-surface)] px-3 text-sm font-medium text-[var(--panel-ink)] transition-colors hover:bg-[var(--panel-selection)] sm:px-3.5"
                      >
                        {t.assignPatients}
                      </button>

                      <button
                        type="button"
                        disabled={isToggling}
                        onClick={() => handleToggleStatus(worker)}
                        title={t.statusToggle}
                        className="inline-flex min-h-11 shrink-0 items-center justify-center whitespace-nowrap rounded-lg px-2.5 text-sm font-medium text-[var(--panel-muted)] transition-colors hover:bg-[var(--panel-selection)] hover:text-[var(--panel-ink)] disabled:cursor-default disabled:opacity-60 sm:px-3"
                      >
                        {worker.status === "active" ? t.deactivate : t.activate}
                      </button>

                      <span className="inline-flex shrink-0 items-center gap-1.5 sm:gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingWorker(worker)}
                          aria-label={`${t.editWorker}: ${worker.full_name}`}
                          title={t.editWorker}
                          className="inline-flex h-11 w-11 min-h-11 min-w-11 shrink-0 items-center justify-center rounded-lg border border-[var(--color-border-control)] dark:border-[var(--panel-line)] bg-[var(--panel-surface)] text-[var(--panel-ink)] transition-colors hover:bg-[var(--panel-selection)]"
                        >
                          <EditIcon className="h-4 w-4" aria-hidden="true" />
                        </button>

                        <button
                          type="button"
                          onClick={() => setConfirmingDeleteId(worker.id)}
                          aria-label={`${t.deleteWorker}: ${worker.full_name}`}
                          title={t.deleteWorker}
                          className="inline-flex h-11 w-11 min-h-11 min-w-11 shrink-0 items-center justify-center rounded-lg text-[#b91c1c] transition-colors hover:bg-[#fef2f2] dark:text-[#ffb4b4] dark:hover:bg-[#3f1d24]"
                        >
                          <TrashIcon className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </span>
                    </>
                  )}
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
