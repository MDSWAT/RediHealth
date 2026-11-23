"use client";

import { useMemo, useState } from "react";
import type { PatientItem } from "@/lib/types/patient";
import type { WorkerItem } from "@/lib/types/worker";
import { AdminShell } from "./AdminShell";
import { WorkersTable } from "./WorkersTable";
import { useLanguage } from "@/lib/i18n/language-context";
import { langToLocale, panelTranslations } from "@/lib/i18n/panel-translations";
import { normalizePatientsFromApi, normalizeWorkersFromApi } from "@/lib/api-normalizers";

interface WorkersDashboardProps {
  initialWorkers: WorkerItem[];
  initialPatients: PatientItem[];
  userEmail: string;
  userRole?: string;
  isAdmin?: boolean;
  isRomania: boolean;
  databaseAvailable: boolean;
  pendingRequestsCount?: number;
}

export function WorkersDashboard({
  initialWorkers,
  initialPatients,
  userEmail,
  userRole,
  isAdmin,
  isRomania,
  databaseAvailable,
  pendingRequestsCount = 0,
}: WorkersDashboardProps) {
  const { lang } = useLanguage();
  const locale = langToLocale[lang];
  const t = panelTranslations[lang].workersDashboard;
  const [workers, setWorkers] = useState<WorkerItem[]>(initialWorkers);
  const [patients, setPatients] = useState<PatientItem[]>(initialPatients);
  const [isRefreshing, setIsRefreshing] = useState(false);

  async function handleRefresh() {
    setIsRefreshing(true);
    try {
      const [wRes, pRes] = await Promise.all([
        fetch("/api/workers"),
        fetch("/api/patients?view=assignment&limit=100"),
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

  const summaryItems = [
    { label: t.totalStaffWorkers, value: metrics.totalWorkers },
    { label: t.activeStaff, value: metrics.activeWorkers },
    { label: t.assignedPatients, value: metrics.assignedPatients },
    { label: t.unassignedPatients, value: metrics.unassignedPatients },
  ];

  return (
    <AdminShell
      userEmail={userEmail}
      userRole={userRole}
      isAdmin={isAdmin}
      pendingCount={pendingRequestsCount}
    >
      <main
        id="main-content"
        className="min-h-dvh bg-[var(--panel-surface)] px-4 py-6 pb-24 text-[var(--panel-ink)] sm:px-6 lg:px-8"
      >
        <div className="mx-auto w-full max-w-[1440px]">
          {isRefreshing ? (
            <div
              role="progressbar"
              aria-label={t.title}
              className="mb-4 h-0.5 w-full overflow-hidden bg-[var(--panel-line)]"
            >
              <div className="panel-indeterminate-bar h-full bg-[var(--color-sapphire)] dark:bg-[#bad7fa]" />
            </div>
          ) : null}

          <header className="border-b border-[var(--panel-line)] pb-5">
            <h1 className="text-2xl font-bold leading-[1.2] tracking-[-0.025em] text-[var(--panel-ink)] sm:text-[1.875rem]">
              {t.title}
            </h1>
            {databaseAvailable ? (
              <dl className="mt-3 flex flex-wrap items-baseline gap-x-6 gap-y-1.5 text-sm">
                {summaryItems.map((item) => (
                  <div key={item.label} className="flex items-baseline gap-1.5">
                    <dd className="font-semibold tabular-nums text-[var(--panel-ink)]">
                      {item.value.toLocaleString(locale)}
                    </dd>
                    <dt className="text-[var(--panel-muted)]">{item.label}</dt>
                  </div>
                ))}
              </dl>
            ) : null}
          </header>

          {!databaseAvailable ? (
            <p
              role="status"
              className="mt-6 rounded-lg border border-[var(--panel-line)] bg-[var(--panel-subtle)] p-5 text-sm leading-relaxed text-[var(--panel-ink)]"
            >
              {t.noDatabase}
            </p>
          ) : (
            <WorkersTable
              isRomania={isRomania}
              initialWorkers={workers}
              onWorkersChange={setWorkers}
              patients={patients}
              onRefresh={handleRefresh}
              isRefreshing={isRefreshing}
              onUpdatePatients={(updatedPatients) => setPatients(updatedPatients)}
            />
          )}
        </div>
      </main>
    </AdminShell>
  );
}
