"use client";
import { useCallback, useState } from "react";
import { AdminShell } from "./AdminShell";
import { RequestsInbox } from "./RequestsInbox";
import { PanelOverview } from "./PanelOverview";
import type { InboxPage } from "@/lib/request-inbox";
import { useLanguage } from "@/lib/i18n/language-context";
import { panelTranslations } from "@/lib/i18n/panel-translations";

export function WorkerDashboard({ initialInbox, userEmail, userRole, isAdmin, isRomania, databaseAvailable }: {
  initialInbox: InboxPage; userEmail: string; userRole?: string; isAdmin?: boolean; isRomania: boolean; databaseAvailable: boolean;
}) {
  const { lang } = useLanguage();
  // The menu count matches the inbox's first folder ("Needs attention": pending + in progress).
  const [livePending, setLivePending] = useState<{ base: number; value: number } | null>(null);
  const pending = livePending?.base === initialInbox.counts.attention ? livePending.value : initialInbox.counts.attention;
  const handlePendingChange = useCallback(
    (count: number) => setLivePending({ base: initialInbox.counts.attention, value: count }),
    [initialInbox.counts.attention],
  );
  const createPatient = <PanelOverview isAdmin={Boolean(isAdmin)} isRomania={isRomania} databaseAvailable={databaseAvailable} />;
  return (
    <AdminShell
      userEmail={userEmail}
      userRole={userRole}
      isAdmin={isAdmin}
      pendingCount={pending}
      mobilePatientCreation={databaseAvailable ? { isRomania } : undefined}
    >
      <main id="main-content" className="crm-workspace panel-home">
        <h1 className="sr-only">{panelTranslations[lang].adminShell.requests}</h1>
        {databaseAvailable ? (
          <RequestsInbox
            isAdmin={isAdmin}
            isRomania={isRomania}
            initialInbox={initialInbox}
            onPendingChange={handlePendingChange}
            actions={createPatient}
          />
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-end border-b border-[var(--panel-line)] pb-4">
              {createPatient}
            </div>
            <p
              role="alert"
              className="crm-error max-w-[65ch] dark:!border-[#ffb4b4]/30 dark:!bg-[#b91c1c]/15 dark:!text-[#ffb4b4]"
            >
              {panelTranslations[lang].workerDashboard.noDatabase}
            </p>
          </div>
        )}
      </main>
    </AdminShell>
  );
}
