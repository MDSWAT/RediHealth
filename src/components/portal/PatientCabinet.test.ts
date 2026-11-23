import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { PatientItem } from "@/lib/types/patient";

vi.mock("@/lib/i18n/language-context", () => ({ useLanguage: () => ({ lang: "en" }) }));
import { PatientPortalView } from "./PatientPortalView";
import { RecaptchaProvider } from "@/components/security/RecaptchaProvider";

const patient: PatientItem = {
  id: "demo", full_name: "Example Patient", phone: "000", email: "demo@example.test", status: "active", priority: "low", created_at: "2026-01-01",
  assigned_worker_names: ["First Caregiver", "Second Caregiver"],
  followups: [{ id: "visit", title: "Example review", date: "2026-12-01", status: "scheduled" }],
  treatment_plan: { entries: [{ id: "plan", title: "Example treatment", care_instructions: "Example instructions" }] },
};

function renderCabinet(value: PatientItem) {
  return renderToStaticMarkup(createElement(RecaptchaProvider, { enabled: false } as ComponentProps<typeof RecaptchaProvider>, createElement(PatientPortalView, { initialPatient: value, token: "private-token", country: "RO" })));
}

describe("patient cabinet overview", () => {
  it("surfaces real care information and both assigned caregivers before a patient opens a section", () => {
    const html = renderCabinet(patient);
    for (const text of ["Example review", "Example treatment", "Example instructions", "First Caregiver", "Second Caregiver"]) expect(html).toContain(text);
    expect(html).toContain('aria-label="Your health page"');
    expect(html).toContain('aria-current="page"');
    expect(html).not.toContain("private-token");
    expect(html.match(/<h1\b/g)).toHaveLength(1);
  });

  it("provides truthful empty states instead of sample visits or treatments", () => {
    const html = renderCabinet({ ...patient, followups: [], treatment_plan: null });
    expect(html).toContain("No follow-up planned");
    expect(html).toContain("There is no treatment plan yet.");
    expect(html).not.toContain("Example review");
    expect(html).not.toContain("Example treatment");
  });
});
import { createElement, type ComponentProps } from "react";
