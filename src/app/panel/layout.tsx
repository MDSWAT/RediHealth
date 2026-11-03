import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PersistentPanelShell } from "@/components/panel/AdminShell";
import { getUserWorkerContext } from "@/lib/worker-auth";
import { withRequestLangPrefix } from "@/lib/i18n/server-routing";

export default async function PanelLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect(await withRequestLangPrefix("/sign-in"));
  const userEmail = session.user.email || "staff account";
  const context = await getUserWorkerContext(userEmail);
  if (!context.workerId && !context.lookupFailed) redirect(await withRequestLangPrefix("/sign-in"));

  return <PersistentPanelShell userEmail={userEmail} userRole={context.role} isAdmin={context.isAdmin}>
    {children}
  </PersistentPanelShell>;
}
