"use client";

import { useMemo, useState } from "react";
import type { PatientItem } from "@/lib/types/patient";
import { getFollowupState } from "@/lib/patient-helpers";
import { AdminShell } from "./AdminShell";
import { PatientsTable } from "./PatientsTable";
import { Container } from "@/components/ui/Container";
import { useLanguage } from "@/lib/i18n/language-context";
import { panelTranslations } from "@/lib/i18n/panel-translations";

interface PatientsDashboardProps {
  initialPatients: PatientItem[];
  userEmail: string;
  userRole?: string;
  isAdmin?: boolean;
  databaseAvailable: boolean;
  pendingRequestsCount?: number;
}

export function PatientsDashboard({
  initialPatients,
  userEmail,
  userRole,
  isAdmin,
  databaseAvailable,
  pendingRequestsCount = 0,
}: PatientsDashboardProps) {
  const { lang } = useLanguage();
  const t = panelTranslations[lang].patientsDashboard;
  const [patients, setPatients] = useState<PatientItem[]>(initialPatients);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const overdueCount = useMemo(() => {
    let count = 0;
    for (const p of patients) {
      if (getFollowupState(p.followups).state === "overdue") {
        count++;
      }
    }
    return count;
  }, [patients]);

  async function handleRefresh() {
    setIsRefreshing(true);
    try {
      const response = await fetch("/api/patients");
      if (response.ok) {
        const data = (await response.json()) as { patients?: Record<string, unknown>[] };
        if (Array.isArray(data.patients)) {
          const formatted: PatientItem[] = data.patients.map((p) => ({
            id: String(p.id),
            request_id: p.request_id ? String(p.request_id) : null,
            full_name: String(p.full_name || ""),
            phone: String(p.phone || ""),
            email: String(p.email || ""),
            date_of_birth: typeof p.date_of_birth === "string" ? p.date_of_birth : null,
            gender: typeof p.gender === "string" ? p.gender : null,
            address: typeof p.address === "string" ? p.address : null,
            condition_notes: typeof p.condition_notes === "string" ? p.condition_notes : null,
            medical_history: typeof p.medical_history === "string" ? p.medical_history : null,
            status: (p.status as PatientItem["status"]) || "active",
            priority: (p.priority as PatientItem["priority"]) || "moderate",
            created_at:
              typeof p.created_at === "string"
                ? p.created_at
                : new Date().toISOString(),
            updated_at: typeof p.updated_at === "string" ? p.updated_at : undefined,
          }));
          setPatients(formatted);
        }
      }
    } catch (err) {
      console.error("Failed to refresh patients", err);
    } finally {
      setIsRefreshing(false);
    }
  }

  return (
    <AdminShell
      userEmail={userEmail}
      userRole={userRole}
      isAdmin={isAdmin}
      pendingCount={pendingRequestsCount}
      overdueCount={overdueCount}
    >
      <main id="main-content" className="min-h-screen py-8 sm:py-10">
        <Container>
          <div className="mb-8 flex flex-col gap-2 border-b border-border pb-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase text-primary">{t.eyebrow}</p>
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
            <PatientsTable
              initialPatients={patients}
              onRefresh={handleRefresh}
              isRefreshing={isRefreshing}
            />
          )}
        </Container>
      </main>
    </AdminShell>
  );
}
