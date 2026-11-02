import { ReportIssuePageContent } from "@/components/report-issue/ReportIssuePageContent";
import { createPageMetadata } from "@/lib/i18n/page-metadata";

export const generateMetadata = createPageMetadata(
  "report-issue",
  "Report an issue - RediHealth",
  "Report a website issue to the RediHealth team.",
);

export default function ReportIssuePage() {
  return <ReportIssuePageContent />;
}
