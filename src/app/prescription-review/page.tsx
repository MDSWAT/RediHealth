import { PrescriptionReview } from "@/components/health-assistant/PrescriptionReview";
import { createPageMetadata } from "@/lib/i18n/page-metadata";

export const generateMetadata = createPageMetadata(
  "prescription-review",
  "Prescription Review - RediHealth",
  "Upload a prescription image for AI-assisted transcription.",
);

export default function PrescriptionReviewPage() {
  return <PrescriptionReview />;
}