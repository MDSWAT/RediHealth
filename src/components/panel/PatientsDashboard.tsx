"use client";

import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { panelDesignTranslations } from "@/lib/i18n/panel-design-translations";
import type { PatientItem } from "@/lib/types/patient";
import { AdminShell } from "./AdminShell";
import { PatientsTable } from "./PatientsTable";
import { useLanguage } from "@/lib/i18n/language-context";
import { langToLocale, panelTranslations } from "@/lib/i18n/panel-translations";
import { normalizePatientsFromApi } from "@/lib/api-normalizers";
import { getFollowupState } from "@/lib/patient-helpers";
import { withLangPrefix } from "@/lib/i18n/routing";
import { ShieldIcon } from "@/components/ui/icons";
import { usePanelRuntime } from "./PanelRuntime";

interface PatientsDashboardProps {
  initialPatients: PatientItem[];
  userEmail: string;
  userRole?: string;
  isAdmin?: boolean;
  isRomania: boolean;
  databaseAvailable: boolean;
  pendingRequestsCount?: number;
}

type CohortKey = "all" | "active" | "due" | "archived";

function isEditableElement(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
}

function isDueFollowup(patient: PatientItem): boolean {
  const { state } = getFollowupState(patient.followups);
  return state === "overdue" || state === "today";
}

export function PatientsDashboard({
  initialPatients,
  userEmail,
  userRole,
  isAdmin,
  isRomania,
  databaseAvailable,
  pendingRequestsCount = 0,
}: PatientsDashboardProps) {
  const { lang } = useLanguage();
  const { request: fetch, demo, offline } = usePanelRuntime();
  const t = panelTranslations[lang].patientsDashboard;
  const copy = panelDesignTranslations[lang];
  const [patients, setPatients] = useState<PatientItem[]>(initialPatients);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [cohort, setCohort] = useState<CohortKey>("all");
  const [syncedAt, setSyncedAt] = useState<Date>(() => new Date());
  const isHydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const formatSyncClock = useCallback(
    (date: Date) =>
      new Intl.DateTimeFormat(langToLocale[lang], {
        hour: "2-digit",
        minute: "2-digit",
      }).format(date),
    [lang],
  );

  const syncedTimeLabel = isHydrated ? formatSyncClock(syncedAt) : "";

  const handleRefresh = useCallback(async () => {
    if (!databaseAvailable) return;
    setIsRefreshing(true);
    try {
      const response = await fetch("/api/patients");
      if (response.ok) {
        const data = (await response.json()) as { patients?: unknown };
        setPatients(normalizePatientsFromApi(data.patients));
        setSyncedAt(new Date());
      }
    } catch (err) {
      console.error("Failed to refresh patients", err);
    } finally {
      setIsRefreshing(false);
    }
  }, [databaseAvailable, fetch]);

  useEffect(() => {
    if (!databaseAvailable) return;
    function onKeyDown(event: KeyboardEvent) {
      if (isEditableElement(event.target)) return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (event.shiftKey && event.key.toLowerCase() === "r") {
        event.preventDefault();
        void handleRefresh();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [databaseAvailable, handleRefresh]);

  const counts = useMemo(() => {
    let active = 0;
    let due = 0;
    let archived = 0;
    for (const patient of patients) {
      if (patient.status === "active") active += 1;
      if (patient.status === "archived") archived += 1;
      if (isDueFollowup(patient)) due += 1;
    }
    return {
      all: patients.length,
      active,
      due,
      archived,
    };
  }, [patients]);

  const cohortPatients = useMemo(() => {
    switch (cohort) {
      case "active":
        return patients.filter((p) => p.status === "active");
      case "due":
        return patients.filter(isDueFollowup);
      case "archived":
        return patients.filter((p) => p.status === "archived");
      default:
        return patients;
    }
  }, [patients, cohort]);

  const cohortItems: Array<{
    key: CohortKey;
    label: string;
    hint: string;
    count: number;
  }> = [
    { key: "all", label: copy.cohortAll, hint: copy.cohortAllHint, count: counts.all },
    { key: "active", label: copy.cohortActive, hint: copy.cohortActiveHint, count: counts.active },
    { key: "due", label: copy.cohortDue, hint: copy.cohortDueHint, count: counts.due },
    { key: "archived", label: copy.cohortArchived, hint: copy.cohortArchivedHint, count: counts.archived },
  ];

  const normalizedRole = (userRole ?? "").trim().toLowerCase();
  const canOpenOfflineVault = !demo && !offline && ["doctor", "mediator"].includes(normalizedRole);

  return (
    <AdminShell
      userEmail={userEmail}
      userRole={userRole}
      isAdmin={isAdmin}
      pendingCount={pendingRequestsCount}
      mobilePatientCreation={databaseAvailable ? { isRomania } : undefined}
    >
      <main id="main-content" className="crm-page patient-directory-page">
        <section className="mx-auto w-full max-w-7xl">
          {isRefreshing ? (
            <div
              role="progressbar"
              aria-label={copy.refreshingList}
              className="mb-4 h-1 w-full overflow-hidden rounded-xs bg-[var(--panel-line)]"
            >
              <div className="panel-indeterminate-bar h-full bg-sapphire" />
            </div>
          ) : null}

          <header className="patient-directory-header mb-5!">
            <div className="min-w-0 space-y-1">
              <h1 className="text-2xl font-bold tracking-tight text-[var(--panel-ink)] sm:text-[1.875rem]">
                {copy.patientTitle}
              </h1>
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
                <p className="text-[15px] leading-relaxed text-[var(--panel-muted)]">
                  {copy.patientSubtitle}
                </p>
                {syncedTimeLabel ? (
                  <p className="patient-directory-sync font-display tabular-nums sm:border-l sm:border-[var(--panel-line)] sm:pl-3">
                    {copy.syncedLabel} {syncedTimeLabel}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {databaseAvailable ? (
                <button
                  type="button"
                  onClick={() => void handleRefresh()}
                  disabled={isRefreshing}
                  aria-keyshortcuts="Shift+R"
                  className="crm-button whitespace-nowrap border-[var(--color-border-control,#8a94a6)] bg-[var(--panel-surface)] text-[var(--panel-ink)] hover:bg-[var(--panel-selection)] disabled:border-[var(--panel-line)] disabled:bg-[var(--panel-subtle)] disabled:text-[var(--panel-muted)]"
                >
                  {isRefreshing ? copy.refreshingList : copy.refreshList}
                </button>
              ) : null}

              {canOpenOfflineVault ? (
                <a
                  href={withLangPrefix("/offline", lang)}
                  className="crm-button whitespace-nowrap border-[var(--color-border-control,#8a94a6)] bg-[var(--panel-surface)] text-[var(--color-sapphire)] hover:bg-[var(--panel-selection)] dark:text-[#bad7fa]"
                >
                  <ShieldIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>{copy.offlineVaultCta}</span>
                </a>
              ) : null}
            </div>
          </header>

          {!databaseAvailable ? (
            <p className="rounded-2xl border border-[var(--panel-line)] bg-[var(--panel-surface)] p-6 text-sm leading-relaxed text-[var(--panel-ink)]">
              {t.noDatabase}
            </p>
          ) : (
            <>
              <div
                role="group"
                aria-label={copy.cohortAria}
                className="patient-cohorts"
              >
                {cohortItems.map((item) => {
                  const active = cohort === item.key;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setCohort(item.key)}
                      title={item.hint}
                      className={`patient-cohort whitespace-nowrap transition-colors ${
                        active
                          ? "text-[var(--color-sapphire)] dark:text-[#bad7fa]"
                          : "hover:text-[var(--panel-ink)]"
                      }`}
                    >
                      <span className="text-sm font-medium">{item.label}</span>
                      <span className="text-[0.8125rem] font-normal font-display tabular-nums">
                        {item.count}
                      </span>
                    </button>
                  );
                })}
              </div>

              <PatientsTable
                isAdmin={isAdmin}
                isRomania={isRomania}
                initialPatients={cohortPatients}
                onPatientsChange={setPatients}
                onRefresh={handleRefresh}
                isRefreshing={isRefreshing}
              />
            </>
          )}
        </section>
      </main>
    </AdminShell>
  );
}
