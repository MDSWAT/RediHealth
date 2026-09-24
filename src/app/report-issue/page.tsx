import type { Metadata } from "next";
import { ReportIssuePageContent } from "@/components/report-issue/ReportIssuePageContent";

export const metadata: Metadata = {
  title: "Report an issue - RediHealth",
  description: "Report a website issue to the RediHealth team.",
};

export default function ReportIssuePage() {
  return <ReportIssuePageContent />;
}
