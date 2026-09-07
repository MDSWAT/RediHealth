"use client";

import { useMemo, useState } from "react";
import type { PatientItem } from "@/lib/types/patient";
import type { WorkerItem } from "@/lib/types/worker";
import { AdminShell } from "./AdminShell";
import { WorkersTable } from "./WorkersTable";
import { Container } from "@/components/ui/Container";
import { StethoscopeIcon, UserIcon, UsersIcon } from "@/components/ui/icons";
import { useLanguage } from "@/lib/i18n/language-context";
import { panelTranslations } from "@/lib/i18n/panel-translations";
import { normalizePatientsFromApi, normalizeWorkersFromApi } from "@/lib/api-normalizers";

interface WorkersDashboardProps {
  initialWorkers: WorkerItem[];
  initialPatients: PatientItem[];
  userEmail: string;
  userRole?: string;
  isAdmin?: boolean;
  databaseAvailable: boolean;
  pendingRequestsCount?: number;
}

export function WorkersDashboard({
  initialWorkers,
  initialPatients,
  userEmail,
  userRole,
  isAdmin,
  databaseAvailable,
  pendingRequestsCount = 0,
}: WorkersDashboardProps) {
  const { lang } = useLanguage();
  const t = panelTranslations[lang].workersDashboard;
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
        const wData = (await wRes.json()) as { workers?: unknown };
        setWorkers(normalizeWorkersFromApi(wData.workers));
      }

      if (pRes.ok) {
        const pData = (await pRes.json()) as { patients?: unknown };
        setPatients(normalizePatientsFromApi(pData.patients));
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
    >
      <main id="main-content" className="min-h-screen py-8 sm:py-10">
        <Container>
          <div className="mb-8 flex flex-col gap-2 border-b border-border pb-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase text-primary">
                {t.eyebrow}
              </p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                {t.title}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {t.subtitle}
              </p>
            </div>
          </div>

          {!databaseAvailable ? (
            <p className="rounded-xl border border-primary/20 bg-primary-soft p-6 text-sm leading-relaxed text-foreground">
              {t.noDatabase}
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
                      {t.totalStaffWorkers}
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
                      {t.activeStaff}
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
                      {t.assignedPatients}
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
                      {t.unassignedPatients}
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
