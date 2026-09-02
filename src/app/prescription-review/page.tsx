import type { Metadata } from "next";
import { PrescriptionReview } from "@/components/health-assistant/PrescriptionReview";

export const metadata: Metadata = {
  title: "Prescription Review — RediHealth",
  description: "Upload a prescription image for AI-assisted transcription.",
};

export default function PrescriptionReviewPage() {
  return <PrescriptionReview />;
}