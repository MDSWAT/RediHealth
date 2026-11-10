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
    urgentDot?: boolean;
  }> = [
    { key: "all", label: copy.cohortAll, hint: copy.cohortAllHint, count: counts.all },
    { key: "active", label: copy.cohortActive, hint: copy.cohortActiveHint, count: counts.active },
    {
      key: "due",
      label: copy.cohortDue,
      hint: copy.cohortDueHint,
      count: counts.due,
      urgentDot: counts.due > 0,
    },
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
      <main id="main-content" className="crm-page">
        <section className="mx-auto w-full max-w-7xl">
          {isRefreshing ? (
            <div
              role="progressbar"
              aria-label={copy.refreshingList}
              className="mb-4 h-1 w-full overflow-hidden rounded-xs bg-muted"
            >
              <div className="panel-indeterminate-bar h-full bg-sapphire" />
            </div>
          ) : null}

          <header className="mb-6 flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0 space-y-1.5">
              <div className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-2.5 py-1 text-xs font-medium text-muted-foreground">
                <span className="h-2 w-2 shrink-0 rounded-full bg-live-sage" aria-hidden="true" />
                <span>{copy.syncedLabel}</span>
                {syncedTimeLabel ? (
                  <span className="tabular-nums font-semibold text-foreground">{syncedTimeLabel}</span>
                ) : null}
              </div>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-[28px]">
                {copy.patientTitle}
              </h1>
              <p className="max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
                {copy.patientSubtitle}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {databaseAvailable ? (
                <button
                  type="button"
                  onClick={() => void handleRefresh()}
                  disabled={isRefreshing}
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-border bg-card px-3.5 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span>{isRefreshing ? copy.refreshingList : copy.refreshList}</span>
                  <kbd className="hidden rounded-md border border-border bg-muted px-1.5 py-0.5 font-mono text-[11px] font-medium text-muted-foreground sm:inline-block">
                    Shift+R
                  </kbd>
                </button>
              ) : null}

              {canOpenOfflineVault ? (
                <a
                  href={withLangPrefix("/offline", lang)}
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-sapphire/25 bg-sapphire-soft px-3.5 py-2 text-sm font-semibold text-sapphire transition-colors hover:bg-sapphire hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <ShieldIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>{copy.offlineVaultCta}</span>
                </a>
              ) : null}
            </div>
          </header>

          {!databaseAvailable ? (
            <p className="rounded-xl border border-primary/20 bg-primary-soft p-6 text-sm leading-relaxed text-foreground">
              {t.noDatabase}
            </p>
          ) : (
            <>
              <div
                role="group"
                aria-label={copy.cohortAria}
                className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4"
              >
                {cohortItems.map((item) => {
                  const active = cohort === item.key;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setCohort(item.key)}
                      className={`group flex min-h-[44px] flex-col justify-between rounded-xl border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:p-5 ${
                        active
                          ? "border-sapphire bg-sapphire-soft/75 shadow-xs"
                          : "border-border bg-card hover:border-sapphire/40 hover:bg-muted/40"
                      }`}
                    >
                      <div className="flex w-full items-center justify-between gap-2">
                        <span
                          className={`text-sm font-semibold ${
                            active ? "text-sapphire" : "text-foreground"
                          }`}
                        >
                          {item.label}
                        </span>
                        {item.urgentDot ? (
                          <span
                            className="h-2 w-2 shrink-0 rounded-full bg-amber-care"
                            aria-hidden="true"
                          />
                        ) : null}
                      </div>
                      <div className="mt-3 flex items-baseline justify-between gap-2">
                        <span className="tabular-nums text-2xl font-bold tracking-tight text-foreground sm:text-[28px]">
                          {item.count}
                        </span>
                        <span className="line-clamp-1 text-xs text-muted-foreground">
                          {item.hint}
                        </span>
                      </div>
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
