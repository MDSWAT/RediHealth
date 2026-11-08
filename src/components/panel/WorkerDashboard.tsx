"use client";
import { useState } from "react";
import { AdminShell } from "./AdminShell";
import { RequestsInbox } from "./RequestsInbox";
import type { InboxPage } from "@/lib/data/request-inbox";
import { useLanguage } from "@/lib/i18n/language-context";
import { panelTranslations } from "@/lib/i18n/panel-translations";
export function WorkerDashboard({ initialInbox, userEmail, userRole, isAdmin, isRomania, databaseAvailable }: {
  initialInbox: InboxPage; userEmail: string; userRole?: string; isAdmin?: boolean; isRomania: boolean; databaseAvailable: boolean;
}) {
  const { lang } = useLanguage();
  // The menu badge counts the same set as the inbox's first folder ("Needs attention": pending + in progress).
  const [pending, setPending] = useState(initialInbox.counts.attention);
  return <AdminShell userEmail={userEmail} userRole={userRole} isAdmin={isAdmin} pendingCount={pending} mobilePatientCreation={databaseAvailable ? { isRomania } : undefined}>
    <main id="main-content" className="crm-workspace">
      {databaseAvailable ? <RequestsInbox isAdmin={isAdmin} isRomania={isRomania} initialInbox={initialInbox} onPendingChange={setPending} /> : <p role="alert" className="crm-error m-6">{panelTranslations[lang].workerDashboard.noDatabase}</p>}
    </main>
  </AdminShell>;
}
