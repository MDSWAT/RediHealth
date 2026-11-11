import { Suspense } from "react";
import type { Metadata } from "next";
import { TriageNoteView } from "@/components/health-check/TriageNoteView";

export const metadata: Metadata = {
  title: "Clinical note for the doctor - RediHealth",
  robots: {
    index: false,
    follow: false,
  },
};

export default function HealthCheckNotePage() {
  return (
    <Suspense fallback={<main id="main-content" className="flex-1 pt-2 pb-12 sm:pt-4 sm:pb-16" />}>
      <TriageNoteView />
    </Suspense>
  );
}
