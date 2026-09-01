"use client";

import { useMemo, useState } from "react";
import type { PatientItem } from "@/lib/types/patient";
import type { WorkerItem, WorkerStatus } from "@/lib/types/worker";
import { AdminShell } from "./AdminShell";
import { WorkersTable } from "./WorkersTable";
import { Container } from "@/components/ui/Container";
import { StethoscopeIcon, UserIcon, UsersIcon } from "@/components/ui/icons";

interface WorkersDashboardProps {
  initialWorkers: WorkerItem[];
  initialPatients: PatientItem[];
  userEmail: string;
  userRole?: string;
  isAdmin?: boolean;
  databaseAvailable: boolean;
  pendingRequestsCount?: number;
  overdueFollowupsCount?: number;
}

export function WorkersDashboard({
  initialWorkers,
  initialPatients,
  userEmail,
  userRole,
  isAdmin,
  databaseAvailable,
  pendingRequestsCount = 0,
  overdueFollowupsCount = 0,
}: WorkersDashboardProps) {
  const [workers, setWorkers] = useState<WorkerItem[]>(initialWorkers);
  const [patients, setPatients] = useState<PatientItem[]>(initialPatients);
  const [isRefreshing, setIsRefreshing] = useState(false);

  async function handleRefresh() {
    setIsRefreshing(true);
    try {
      const [wRes, pRes] = await Promise.all([
        fetch("/api/workers"),
        fetch("/api/patients"),
      ]);

      if (wRes.ok) {
        const wData = (await wRes.json()) as { workers?: Record<string, unknown>[] };
        if (Array.isArray(wData.workers)) {
          const formatted: WorkerItem[] = wData.workers.map((w) => ({
            id: String(w.id),
            full_name: String(w.full_name || ""),
            email: String(w.email || ""),
            phone: typeof w.phone === "string" ? w.phone : null,
            role: String(w.role || "Healthcare Worker"),
            department: typeof w.department === "string" ? w.department : null,
            status: (w.status as WorkerStatus) || "active",
            assigned_patients_count: Number(w.assigned_patients_count || 0),
            created_at: typeof w.created_at === "string" ? w.created_at : new Date().toISOString(),
          }));
          setWorkers(formatted);
        }
      }

      if (pRes.ok) {
        const pData = (await pRes.json()) as { patients?: Record<string, unknown>[] };
        if (Array.isArray(pData.patients)) {
          const formatted: PatientItem[] = pData.patients.map((p) => ({
            id: String(p.id),
            request_id: p.request_id ? String(p.request_id) : null,
            assigned_worker_id: p.assigned_worker_id ? String(p.assigned_worker_id) : null,
            assigned_worker_name: typeof p.assigned_worker_name === "string" ? p.assigned_worker_name : null,
            full_name: String(p.full_name || ""),
            phone: String(p.phone || ""),
            email: String(p.email || ""),
            date_of_birth: typeof p.date_of_birth === "string" ? p.date_of_birth : null,
            gender: typeof p.gender === "string" ? p.gender : null,
            address: typeof p.address === "string" ? p.address : null,
            condition_notes: typeof p.condition_notes === "string" ? p.condition_notes : null,
            medical_history: typeof p.medical_history === "string" ? p.medical_history : null,
            treatment_plan: typeof p.treatment_plan === "object" ? (p.treatment_plan as PatientItem["treatment_plan"]) : null,
            followups: Array.isArray(p.followups) ? (p.followups as PatientItem["followups"]) : [],
            photos: Array.isArray(p.photos) ? (p.photos as PatientItem["photos"]) : [],
            status: (p.status as PatientItem["status"]) || "active",
            priority: (p.priority as PatientItem["priority"]) || "moderate",
            created_at: typeof p.created_at === "string" ? p.created_at : new Date().toISOString(),
          }));
          setPatients(formatted);
        }
      }
    } catch (err) {
      console.error("Failed to refresh workers data", err);
    } finally {
      setIsRefreshing(false);
    }
  }

  const metrics = useMemo(() => {
    let activeWorkers = 0;
    let assignedPatients = 0;
    let unassignedPatients = 0;

    for (const w of workers) {
      if (w.status === "active") activeWorkers++;
    }

    for (const p of patients) {
      if (p.assigned_worker_id) assignedPatients++;
      else unassignedPatients++;
    }

    return {
      totalWorkers: workers.length,
      activeWorkers,
      assignedPatients,
      unassignedPatients,
    };
  }, [workers, patients]);

  return (
    <AdminShell
      userEmail={userEmail}
      userRole={userRole}
      isAdmin={isAdmin}
      pendingCount={pendingRequestsCount}
      overdueCount={overdueFollowupsCount}
    >
      <main id="main-content" className="min-h-screen py-8 sm:py-10">
        <Container>
          <div className="mb-8 flex flex-col gap-2 border-b border-border pb-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase text-primary">
                Staff Management
              </p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Healthcare Workers & Staff
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Manage staff profiles, assign clients/patients to workers, and track active staff directory.
              </p>
            </div>
          </div>

          {!databaseAvailable ? (
            <p className="rounded-xl border border-primary/20 bg-primary-soft p-6 text-sm leading-relaxed text-foreground">
              Connect MySQL and apply migration 006 to manage healthcare workers.
            </p>
          ) : (
            <div className="space-y-8">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="flex flex-col justify-between rounded-xl border border-border bg-card p-5">
                  <div className="flex items-center justify-between">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-soft text-primary">
                      <StethoscopeIcon className="h-5 w-5" />
                    </span>
                  </div>
                  <div className="mt-4">
                    <p className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                      {metrics.totalWorkers}
                    </p>
                    <p className="mt-1 text-xs font-medium text-muted-foreground">
                      Total Staff Workers
                    </p>
                  </div>
                </div>

                <div className="flex flex-col justify-between rounded-xl border border-border bg-card p-5">
                  <div className="flex items-center justify-between">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      <StethoscopeIcon className="h-5 w-5" />
                    </span>
                  </div>
                  <div className="mt-4">
                    <p className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                      {metrics.activeWorkers}
                    </p>
                    <p className="mt-1 text-xs font-medium text-muted-foreground">
                      Active Staff
                    </p>
                  </div>
                </div>

                <div className="flex flex-col justify-between rounded-xl border border-border bg-card p-5">
                  <div className="flex items-center justify-between">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                      <UsersIcon className="h-5 w-5" />
                    </span>
                  </div>
                  <div className="mt-4">
                    <p className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                      {metrics.assignedPatients}
                    </p>
                    <p className="mt-1 text-xs font-medium text-muted-foreground">
                      Assigned Patients
                    </p>
                  </div>
                </div>

                <div className="flex flex-col justify-between rounded-xl border border-border bg-card p-5">
                  <div className="flex items-center justify-between">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                      <UserIcon className="h-5 w-5" />
                    </span>
                  </div>
                  <div className="mt-4">
                    <p className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                      {metrics.unassignedPatients}
                    </p>
                    <p className="mt-1 text-xs font-medium text-muted-foreground">
                      Unassigned Patients
                    </p>
                  </div>
                </div>
              </div>

              <WorkersTable
                initialWorkers={workers}
                patients={patients}
                onRefresh={handleRefresh}
                isRefreshing={isRefreshing}
                onUpdatePatients={(updatedPatients) => setPatients(updatedPatients)}
              />
            </div>
          )}
        </Container>
      </main>
    </AdminShell>
  );
}
