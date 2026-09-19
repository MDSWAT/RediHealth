"use client";

import { panelDesignTranslations } from "@/lib/i18n/panel-design-translations";
import { useState } from "react";
import type { PatientItem } from "@/lib/types/patient";
import { AdminShell } from "./AdminShell";
import { PatientsTable } from "./PatientsTable";
import { useLanguage } from "@/lib/i18n/language-context";
import { panelTranslations } from "@/lib/i18n/panel-translations";
import { normalizePatientsFromApi } from "@/lib/api-normalizers";

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
  const copy = panelDesignTranslations[lang];
  const [patients, setPatients] = useState<PatientItem[]>(initialPatients);
  const [isRefreshing, setIsRefreshing] = useState(false);

  async function handleRefresh() {
    setIsRefreshing(true);
    try {
      const response = await fetch("/api/patients");
      if (response.ok) {
        const data = (await response.json()) as { patients?: unknown };
        setPatients(normalizePatientsFromApi(data.patients));
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
    >
      <main id="main-content" className="min-h-screen px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <section className="mx-auto w-full max-w-7xl">
          <header className="mb-7">
            <p className="text-sm font-medium text-primary">{copy.workspace}</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight">{copy.patientTitle}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{copy.patientSubtitle}</p>
          </header>
          {!databaseAvailable ? (
            <p className="rounded-2xl border border-primary/20 bg-primary-soft p-6 text-sm leading-relaxed text-foreground">
              {t.noDatabase}
            </p>
          ) : (
            <PatientsTable
              initialPatients={patients}
              onRefresh={handleRefresh}
              isRefreshing={isRefreshing}
            />
          )}
        </section>
      </main>
    </AdminShell>
  );
}
