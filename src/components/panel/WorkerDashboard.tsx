"use client";
import { useState } from "react";
import { AdminShell } from "./AdminShell";
import { RequestsInbox } from "./RequestsInbox";
import type { InboxPage } from "@/lib/data/request-inbox";
import { useLanguage } from "@/lib/i18n/language-context";
import { panelTranslations } from "@/lib/i18n/panel-translations";
export function WorkerDashboard({ initialInbox, userEmail, userRole, isAdmin, databaseAvailable }: {
  initialInbox: InboxPage; userEmail: string; userRole?: string; isAdmin?: boolean; databaseAvailable: boolean;
}) {
  const { lang } = useLanguage();
  const [pending, setPending] = useState(initialInbox.counts.pending);
  return <AdminShell userEmail={userEmail} userRole={userRole} isAdmin={isAdmin} pendingCount={pending}>
    <main id="main-content" className="crm-workspace">
      {databaseAvailable ? <RequestsInbox isAdmin={isAdmin} initialInbox={initialInbox} onPendingChange={setPending} /> : <p role="alert" className="crm-error m-6">{panelTranslations[lang].workerDashboard.noDatabase}</p>}
    </main>
  </AdminShell>;
}
