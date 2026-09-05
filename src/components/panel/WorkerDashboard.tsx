"use client";

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
  overdueFollowupsCount?: number;
}

export function WorkerDashboard({
  initialRequests,
  userEmail,
  userRole,
  isAdmin,
  databaseAvailable,
  overdueFollowupsCount = 0,
}: WorkerDashboardProps) {
  const { lang } = useLanguage();
  const t = panelTranslations[lang].workerDashboard;
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
      overdueCount={overdueFollowupsCount}
    >
      <main id="main-content" className="min-h-screen py-5 sm:py-8 lg:py-10">
        <Container>
          <div className="mb-6 flex flex-col gap-2 border-b border-border pb-5 sm:mb-8 sm:pb-6">
            <div>
              <p className="text-xs font-bold uppercase text-primary">{t.eyebrow}</p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{t.title}</h1>
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
            <div className="space-y-6 sm:space-y-8">
              <DashboardOverview
                metrics={metrics}
                activeStatusFilter={activeStatusFilter}
                onSelectStatusFilter={setActiveStatusFilter}
              />

              <section aria-labelledby="requests-heading">
                <h2 id="requests-heading" className="text-xl font-bold text-foreground mb-4">
                  {t.queueTitle}
                </h2>
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
