import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { hasDatabaseConnectionConfig } from "@/lib/database";
import { WorkerDashboard } from "@/components/panel/WorkerDashboard";
import { loadRequestInbox, type InboxPage } from "@/lib/data/request-inbox";
import { getUserWorkerContext } from "@/lib/worker-auth";
import { withRequestLangPrefix } from "@/lib/i18n/server-routing";

export const metadata: Metadata = {
  title: "Worker Panel Dashboard - RediHealth",
};

export default async function PanelPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const session = await auth();
  if (!session?.user) redirect(await withRequestLangPrefix("/sign-in"));
  const userEmail = session.user.email || "staff account";
  const workerContext = await getUserWorkerContext(userEmail);
  if (!workerContext.workerId && !workerContext.lookupFailed) redirect(await withRequestLangPrefix("/sign-in"));
  let databaseAvailable = hasDatabaseConnectionConfig() && !workerContext.lookupFailed;
  let inbox: InboxPage = { requests: [], counts: { attention: 0, all: 0, pending: 0, in_progress: 0, resolved: 0, archived: 0 }, page: 1, hasMore: false, total: 0 };
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(await searchParams)) if (typeof value === "string") params.set(key, value);
  if (!params.has("folder")) params.set("folder", "attention");
  params.set("limit", "50");
  params.delete("page");
  if (databaseAvailable) {
    try { inbox = await loadRequestInbox(params, String(workerContext.workerId), workerContext.isAdmin); }
    catch (error) { console.error("Failed to load request inbox", error); databaseAvailable = false; }
  }
  return <WorkerDashboard initialInbox={inbox} userEmail={userEmail} userRole={workerContext.role} isAdmin={workerContext.isAdmin} databaseAvailable={databaseAvailable} />;
}
