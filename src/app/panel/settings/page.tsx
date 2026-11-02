import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { SettingsDashboard } from "@/components/panel/SettingsDashboard";
import { hasControlDatabase } from "@/lib/database";
import { withRequestLangPrefix } from "@/lib/i18n/server-routing";
import { getAlertRecipient } from "@/lib/settings";
import { getUserWorkerContext } from "@/lib/worker-auth";
import { createPageMetadata } from "@/lib/i18n/page-metadata";

export const generateMetadata = createPageMetadata("settings", "Settings - RediHealth Panel", "");

export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect(await withRequestLangPrefix("/sign-in"));
  }

  const userEmail = session.user.email || "staff account";
  const workerContext = await getUserWorkerContext(userEmail);

  if (!workerContext.isSuperAdmin) {
    redirect(await withRequestLangPrefix("/panel"));
  }

  const recipient = await getAlertRecipient();

  return (
    <SettingsDashboard
      userEmail={userEmail}
      userRole={workerContext.role}
      databaseAvailable={hasControlDatabase()}
      initialAlertEmail={recipient.email || ""}
      initialSource={recipient.source}
    />
  );
}
