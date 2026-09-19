"use client";

import Link from "next/link";
import { ArrowRightIcon, CalendarIcon, UsersIcon } from "@/components/ui/icons";
import { withLangPrefix } from "@/lib/i18n/routing";
import { panelDesignTranslations } from "@/lib/i18n/panel-design-translations";
import { useMemo, useState } from "react";
import type { DashboardMetrics, MedicalHelpRequestItem, RequestStatus } from "@/lib/types/medical-request";
import { AdminShell } from "./AdminShell";
import { DashboardOverview } from "./DashboardOverview";
import { RequestsTable } from "./RequestsTable";
import { Container } from "@/components/ui/Container";
import { useLanguage } from "@/lib/i18n/language-context";
import { panelTranslations } from "@/lib/i18n/panel-translations";

interface WorkerDashboardProps {
  initialRequests: MedicalHelpRequestItem[];
  userEmail: string;
  userRole?: string;
  isAdmin?: boolean;
  databaseAvailable: boolean;
}

export function WorkerDashboard({
  initialRequests,
  userEmail,
  userRole,
  isAdmin,
  databaseAvailable,
}: WorkerDashboardProps) {
  const { lang } = useLanguage();
  const t = panelTranslations[lang].workerDashboard;
  const copy = panelDesignTranslations[lang];
  const nav = panelTranslations[lang].adminShell;
  const [requests, setRequests] = useState<MedicalHelpRequestItem[]>(initialRequests);
  const [activeStatusFilter, setActiveStatusFilter] = useState<RequestStatus | "all">("all");
  const [isRefreshing, setIsRefreshing] = useState(false);

  async function handleRefresh() {
    setIsRefreshing(true);
    try {
      const response = await fetch("/api/medical-help-requests");
      if (response.ok) {
        const data = (await response.json()) as { requests?: Record<string, unknown>[] };
        if (Array.isArray(data.requests)) {
          const formatted: MedicalHelpRequestItem[] = data.requests.map((r) => ({
            id: String(r.id),
            full_name: typeof r.full_name === "string" ? r.full_name : null,
            phone: String(r.phone || ""),
            email: String(r.email || ""),
            description: String(r.description || ""),
            status: (r.status as RequestStatus) || "pending",
            status_updated_by_name:
              typeof r.status_updated_by_name === "string" ? r.status_updated_by_name : null,
            status_updated_by_email:
              typeof r.status_updated_by_email === "string" ? r.status_updated_by_email : null,
            status_updated_at:
              typeof r.status_updated_at === "string" ? r.status_updated_at : undefined,
            priority: (r.priority as MedicalHelpRequestItem["priority"]) || "normal",
            internal_notes: typeof r.internal_notes === "string" ? r.internal_notes : null,
            created_at:
              typeof r.created_at === "string"
                ? r.created_at
                : new Date().toISOString(),
            updated_at: typeof r.updated_at === "string" ? r.updated_at : undefined,
          }));
          setRequests(formatted);
        }
      }
    } catch (err) {
      console.error("Failed to refresh requests", err);
    } finally {
      setIsRefreshing(false);
    }
  }

  const metrics: DashboardMetrics = useMemo(() => {
    const todayStr = new Date().toISOString().slice(0, 10);

    let pending = 0;
    let inProgress = 0;
    let resolved = 0;
    let todayCount = 0;

    for (const req of requests) {
      if (req.status === "pending") pending++;
      else if (req.status === "in_progress") inProgress++;
      else if (req.status === "resolved") resolved++;

      const reqDateStr = new Date(req.created_at).toISOString().slice(0, 10);
      if (reqDateStr === todayStr) todayCount++;
    }

    return {
      total: requests.length,
      pending,
      inProgress,
      resolved,
      todayCount,
    };
  }, [requests]);

  return (
    <AdminShell
      userEmail={userEmail}
      userRole={userRole}
      isAdmin={isAdmin}
      pendingCount={metrics.pending}
    >
      <main id="main-content" className="min-h-screen py-5 sm:py-8 lg:py-10">
        <Container>
          <div className="mb-6 flex flex-col gap-2 border-b border-border pb-5 sm:mb-8 sm:pb-6">
            <div>
              <p className="text-sm font-medium text-primary">{copy.workspace}</p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{copy.title}</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {copy.subtitle}
              </p>
            </div>
          </div>

          {!databaseAvailable ? (
            <p className="rounded-2xl border border-primary/20 bg-primary-soft p-6 text-sm leading-relaxed text-foreground">
              {t.noDatabase}
            </p>
          ) : (
            <div className="space-y-6 sm:space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link
                  href={withLangPrefix("/panel/patients", lang)}
                  className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-xs transition-all hover:border-primary/40 hover:shadow-sm"
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
                    <UsersIcon className="h-6 w-6" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
                      {nav.patients}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
                      {copy.patientsHint}
                    </p>
                  </div>
                  <ArrowRightIcon className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                </Link>
                {userRole?.trim().toLowerCase() !== "mediator" || isAdmin ? (
                  <Link
                    href={withLangPrefix("/panel/calendar", lang)}
                    className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-xs transition-all hover:border-primary/40 hover:shadow-sm"
                  >
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-700">
                      <CalendarIcon className="h-6 w-6" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
                        {nav.calendar}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
                        {copy.calendarHint}
                      </p>
                    </div>
                    <ArrowRightIcon className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                  </Link>
                ) : null}
              </div>
              <DashboardOverview metrics={metrics} />

              <section aria-labelledby="requests-heading">
                <div className="mb-4 flex items-center justify-between">
                  <h2 id="requests-heading" className="text-xl font-bold tracking-tight text-foreground">
                    {copy.requests}
                  </h2>
                </div>
                <RequestsTable
                  requests={requests}
                  setRequests={setRequests}
                  activeStatusFilter={activeStatusFilter}
                  onSelectStatusFilter={setActiveStatusFilter}
                  onRefresh={handleRefresh}
                  isRefreshing={isRefreshing}
                />
              </section>
            </div>
          )}
        </Container>
      </main>
    </AdminShell>
  );
}
