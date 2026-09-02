"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { EditIcon, TrashIcon, UsersIcon } from "@/components/ui/icons";
import type { PatientItem, PatientPriority, PatientStatus } from "@/lib/types/patient";
import { getPriorityMeta } from "@/lib/patient-helpers";
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
        setErrorMessage(data.error || "Failed to delete patient.");
        return;
      }

      setPatients((prev) => prev.filter((p) => p.id !== id));
      setConfirmingDeleteId(null);
    } catch {
      setErrorMessage("An error occurred while deleting patient.");
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
      setErrorMessage("Failed to update patient status.");
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
            Dismiss
          </button>
        </div>
      ) : null}

      <div className="flex items-center justify-between mb-4 px-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Showing {filteredPatients.length} of {patients.length} patient profiles
        </p>
      </div>

      {filteredPatients.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-12 text-center">
          <UsersIcon className="mx-auto h-8 w-8 text-muted-foreground" />
          <h3 className="mt-3 text-base font-semibold text-foreground">No patient records found</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Create a patient profile or convert a request to start building patient profiles.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-sm">
          <table className="w-full min-w-[800px] text-left">
            <thead className="border-b border-border bg-muted/60 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <tr>
                <th scope="col" className="px-5 py-3.5">Patient Name</th>
                <th scope="col" className="px-5 py-3.5">Priority & Status</th>
                <th scope="col" className="px-5 py-3.5">Contact</th>
                <th scope="col" className="px-5 py-3.5">Demographics</th>
                <th scope="col" className="px-5 py-3.5">Condition Summary</th>
                <th scope="col" className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredPatients.map((patient) => {
                const isDeleting = deletingId === patient.id;
                const isConfirmingDelete = confirmingDeleteId === patient.id;

                return (
                  <tr
                    key={patient.id}
                    className="align-top hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <Link
                        href={`/panel/patients/${patient.id}`}
                        className="font-bold text-sm text-foreground hover:text-primary transition-colors focus-visible:underline block"
                      >
                        {patient.full_name}
                      </Link>
                      <span className="text-[11px] text-muted-foreground block">
                        ID #{patient.id}{" "}
                        {patient.request_id ? `(Req #${patient.request_id})` : ""}
                      </span>
                      <span className="text-[11px] text-primary font-semibold block mt-0.5">
                        Worker: {patient.assigned_worker_name || "Unassigned"}
                      </span>
                    </td>

                    <td className="whitespace-nowrap px-5 py-4">
                      <div className="flex flex-col gap-1 items-start">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                            getPriorityMeta(patient.priority).badgeClass
                          }`}
                        >
                          <span
                            className={`h-2 w-2 rounded-full ${
                              getPriorityMeta(patient.priority).dotClass
                            }`}
                          />
                          <span>{getPriorityMeta(patient.priority).label}</span>
                        </span>
                        <select
                          value={patient.status}
                          onChange={(e) =>
                            handleUpdateStatus(patient.id, e.target.value as PatientStatus)
                          }
                          className={`mt-1 rounded-full px-2 py-0.5 text-[11px] font-bold capitalize border-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                            patient.status === "active"
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                              : patient.status === "inactive"
                              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                              : "bg-gray-500/10 text-gray-600 dark:text-gray-400"
                          }`}
                        >
                          <option value="active">Active Care</option>
                          <option value="inactive">Inactive</option>
                          <option value="archived">Archived</option>
                        </select>
                      </div>
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-xs text-muted-foreground">
                      <p className="font-medium text-foreground">{patient.phone}</p>
                      <p className="truncate max-w-[160px]">{patient.email}</p>
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-xs text-muted-foreground">
                      <p>{patient.date_of_birth || "DOB not provided"}</p>
                      <p>{patient.gender || "Gender not specified"}</p>
                    </td>

                    <td className="max-w-xs px-5 py-4 text-xs leading-relaxed text-muted-foreground">
                      <p className="line-clamp-2">
                        {patient.condition_notes || "No condition notes recorded."}
                      </p>
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
                            onClick={() => handleDelete(patient.id)}
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
                          <Link
                            href={`/panel/patients/${patient.id}`}
                            className="rounded-lg bg-primary/10 px-3 py-1.5 font-semibold text-primary hover:bg-primary/20 transition-colors"
                          >
                            View Details
                          </Link>
                          <button
                            type="button"
                            onClick={() => setEditingPatient(patient)}
                            className="rounded-lg border border-border bg-card p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                            title="Edit Profile"
                          >
                            <EditIcon className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmingDeleteId(patient.id)}
                            className="rounded-lg p-1.5 text-red-600 dark:text-red-400 hover:bg-red-500/10"
                            title="Delete Patient"
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
