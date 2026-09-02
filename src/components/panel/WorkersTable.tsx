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
  const [workers, setWorkers] = useState<WorkerItem[]>(initialWorkers);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<WorkerStatus | "all">("all");

  const [editingWorker, setEditingWorker] = useState<WorkerItem | null>(null);
  const [assigningWorker, setAssigningWorker] = useState<WorkerItem | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

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
        setErrorMessage(data.error || "Failed to delete worker.");
        return;
      }

      setWorkers((prev) => prev.filter((w) => w.id !== id));
      setConfirmingDeleteId(null);
    } catch {
      setErrorMessage("An error occurred while deleting worker.");
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
      setErrorMessage("Failed to update status.");
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
            Dismiss
          </button>
        </div>
      ) : null}

      <div className="flex items-center justify-between mb-4 px-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Showing {filteredWorkers.length} of {workers.length} staff workers
        </p>
      </div>

      {filteredWorkers.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-12 text-center">
          <StethoscopeIcon className="mx-auto h-8 w-8 text-muted-foreground" />
          <h3 className="mt-3 text-base font-semibold text-foreground">No staff workers found</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Click &quot;Add Staff Worker&quot; to register a healthcare worker or administrator.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-sm">
          <table className="w-full min-w-[800px] text-left">
            <thead className="border-b border-border bg-muted/60 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <tr>
                <th scope="col" className="px-5 py-3.5">Worker / Staff</th>
                <th scope="col" className="px-5 py-3.5">Role & Department</th>
                <th scope="col" className="px-5 py-3.5">Contact</th>
                <th scope="col" className="px-5 py-3.5">Assigned Patients</th>
                <th scope="col" className="px-5 py-3.5">Status</th>
                <th scope="col" className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredWorkers.map((worker) => {
                const isDeleting = deletingId === worker.id;
                const isConfirmingDelete = confirmingDeleteId === worker.id;

                const assignedCount = patients.filter(
                  (p) => p.assigned_worker_id === worker.id,
                ).length;

                return (
                  <tr
                    key={worker.id}
                    className="align-top hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <p className="font-bold text-sm text-foreground">
                        {worker.full_name}
                      </p>
                      <span className="text-[11px] text-muted-foreground">
                        Staff ID #{worker.id}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-xs font-semibold text-foreground whitespace-nowrap">
                      <span className="block font-bold text-primary">{worker.role}</span>
                      <span className="text-[11px] text-muted-foreground block">
                        {worker.department || "General Staff"}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-xs text-muted-foreground whitespace-nowrap">
                      <a
                        href={`mailto:${worker.email}`}
                        className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
                      >
                        <MailIcon className="h-3.5 w-3.5" />
                        {worker.email}
                      </a>
                      {worker.phone ? (
                        <a
                          href={`tel:${worker.phone}`}
                          className="mt-1 block hover:text-foreground"
                        >
                          <PhoneIcon className="h-3.5 w-3.5 inline mr-1" />
                          {worker.phone}
                        </a>
                      ) : null}
                    </td>

                    <td className="px-5 py-4 text-xs whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => setAssigningWorker(worker)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary hover:bg-primary/20 transition-colors"
                      >
                        <UserIcon className="h-3.5 w-3.5" />
                        <span>{assignedCount} Assigned Patients</span>
                      </button>
                    </td>

                    <td className="whitespace-nowrap px-5 py-4">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(worker)}
                        className={`rounded-full px-2.5 py-1 text-xs font-bold capitalize border-0 cursor-pointer ${
                          worker.status === "active"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "bg-gray-500/10 text-gray-600 dark:text-gray-400"
                        }`}
                        title="Click to toggle status"
                      >
                        {worker.status}
                      </button>
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-right text-xs">
                      {isConfirmingDelete ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <span className="text-red-600 dark:text-red-400 font-semibold">
                            Delete?
                          </span>
                          <button
                            type="button"
                            disabled={isDeleting}
                            onClick={() => handleDelete(worker.id)}
                            className="rounded-md bg-red-600 px-2.5 py-1 font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                          >
                            {isDeleting ? "..." : "Yes"}
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmingDeleteId(null)}
                            className="rounded-md border border-border bg-card px-2 py-1 font-semibold text-foreground hover:bg-muted"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setAssigningWorker(worker)}
                            className="rounded-lg bg-primary px-3 py-1.5 font-semibold text-white hover:bg-primary-hover transition-colors"
                          >
                            Assign Patients
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingWorker(worker)}
                            className="rounded-lg border border-border bg-card p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                            title="Edit Worker Profile"
                          >
                            <EditIcon className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmingDeleteId(worker.id)}
                            className="rounded-lg p-1.5 text-red-600 dark:text-red-400 hover:bg-red-500/10"
                            title="Delete Worker"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
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
          onClose={() => {
            setShowCreateModal(false);
            setEditingWorker(null);
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
