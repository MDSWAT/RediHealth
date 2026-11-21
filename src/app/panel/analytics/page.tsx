import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AnalyticsDashboard } from "@/components/panel/AnalyticsDashboard";
import { getAnalyticsSummary, parseRange } from "@/lib/data/analytics";
import { listCampaignLinks, type SavedCampaignLink } from "@/lib/data/campaign-links";
import { withRequestLangPrefix } from "@/lib/i18n/server-routing";
import { createPageMetadata } from "@/lib/i18n/page-metadata";
import { getUserWorkerContext } from "@/lib/worker-auth";

export const generateMetadata = createPageMetadata("analytics", "Analytics - RediHealth Panel", "");

export default async function AnalyticsPage({ searchParams }: PageProps<"/panel/analytics">) {
  const session = await auth();

  if (!session?.user) {
    redirect(await withRequestLangPrefix("/sign-in"));
  }

  const userEmail = session.user.email || "staff account";
  const workerContext = await getUserWorkerContext(userEmail);

  // Campaign results are for the people who run the platform, not for every staff member.
  if (!workerContext.isAdmin) {
    redirect(await withRequestLangPrefix("/panel"));
  }

  const range = parseRange((await searchParams).range);
  const [result, savedLinks] = await Promise.all([
    getAnalyticsSummary(range),
    loadSavedLinks(),
  ]);

  return (
    <AnalyticsDashboard userEmail={userEmail} userRole={workerContext.role} range={range} result={result} savedLinks={savedLinks} />
  );
}

/** Saved ad links, or none when the table does not exist yet (the summary then explains why). */
async function loadSavedLinks(): Promise<SavedCampaignLink[]> {
  try {
    return await listCampaignLinks();
  } catch {
    return [];
  }
}
