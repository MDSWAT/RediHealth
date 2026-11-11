import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { FeedbackDashboard } from "@/components/panel/FeedbackDashboard";
import { hasControlDatabase } from "@/lib/database";
import { createPageMetadata } from "@/lib/i18n/page-metadata";
import { withRequestLangPrefix } from "@/lib/i18n/server-routing";
import { listPlatformFeedback, type PlatformFeedbackItem } from "@/lib/platform-feedback";
import { getUserWorkerContext } from "@/lib/worker-auth";

export const generateMetadata = createPageMetadata("feedback", "Platform feedback - RediHealth Panel", "");

export default async function PlatformFeedbackPage() {
  const session = await auth();
  if (!session?.user) {
    redirect(await withRequestLangPrefix("/sign-in"));
  }

  const userEmail = session.user.email || "staff account";
  const workerContext = await getUserWorkerContext(userEmail);

  if (!workerContext.isAdmin && !workerContext.isSuperAdmin) {
    redirect(await withRequestLangPrefix("/panel"));
  }

  let databaseAvailable = hasControlDatabase();
  let items: PlatformFeedbackItem[] = [];

  if (databaseAvailable) {
    try {
      const result = await listPlatformFeedback({ limit: 250 });
      items = result.items;
    } catch (error) {
      console.error("Failed to load platform feedback page", error);
      databaseAvailable = false;
    }
  }

  return (
    <FeedbackDashboard
      initialItems={items}
      userEmail={userEmail}
      userRole={workerContext.role}
      isAdmin={workerContext.isAdmin}
      isSuperAdmin={workerContext.isSuperAdmin}
      databaseAvailable={databaseAvailable}
    />
  );
}
