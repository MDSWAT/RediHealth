import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock("@/lib/i18n/language-context", () => ({ useLanguage: () => ({ lang: "ro" }) }));

import { CreatePatientModal } from "./CreatePatientModal";
import type { PatientItem } from "@/lib/types/patient";
import { patientWizardTranslations } from "@/lib/i18n/patient-wizard-translations";
import { patientIntakeTranslations } from "@/lib/i18n/patient-intake-translations";
import { crmTranslations } from "@/lib/i18n/crm-translations";

// Copy is asserted through the translation files so wording edits do not break layout tests.
const wizard = patientWizardTranslations.ro;
const intake = patientIntakeTranslations.ro;

describe("patient intake form layout", () => {
  it("starts creation at contact details, keeps later steps mounted but hidden and uses Continue before saving", () => {
    const html = renderToStaticMarkup(createElement(CreatePatientModal, { isRomania: true, onClose: vi.fn() }));
    expect(html).toContain(`aria-label="${wizard.progress}"`);
    expect(html).toContain('aria-current="step"');
    expect(html).toContain(wizard.steps[1]);
    expect(html).toContain(wizard.steps[2]);
    expect(html).toContain(wizard.next);
    expect(html).toContain("noValidate");
    expect(html).toContain('data-patient-contact="true"');
    expect(html).toContain('hidden="" class="space-y-5"');
  });

  it("uses a full-height mobile dialog and keeps submit associated with its scrollable form", () => {
    const html = renderToStaticMarkup(createElement(CreatePatientModal, { isRomania: true, onClose: vi.fn() }));
    const formId = /<form id="([^"]+)"/.exec(html)?.[1];
    expect(formId).toBeTruthy();
    expect(html).toContain(`form="${formId}"`);
    expect(html).toContain("h-dvh");
    expect(html).toContain("overflow-y-auto overscroll-contain");
    expect(html).toContain(intake.hasDocuments);
    expect(html).toContain(intake.useGps);
    expect(html).not.toContain('type="file"');
  });

  it("restores existing document declarations, uploads and coordinates when editing", () => {
    const patient: PatientItem = {
      id: "7", full_name: "Test", email: "test@example.test", phone: "123",
      status: "active", priority: "moderate", created_at: "2026-01-01",
      intake: { has_documents: true, documents: [{ id: "doc", name: "identity.pdf", category: "identity", data_url: "data:application/pdf;base64,JVBERi0=" }], location: { latitude: 0, longitude: 0, accuracy: 10 } },
    };
    const html = renderToStaticMarkup(createElement(CreatePatientModal, { patient, isRomania: true, onClose: vi.fn() }));
    expect(html).toContain('type="file"');
    expect(html).toContain("identity.pdf");
    expect(html).toContain(intake.identity);
    expect(html).toContain("0.000000");
    expect(html).toContain(intake.accuracy);
    expect(html).not.toContain(`aria-label="${wizard.progress}"`);
    expect(html).not.toContain("noValidate");
  });

  it("preserves admin assignment controls and request-prefilled contact values in the guided flow", () => {
    const request = {
      id: "4", full_name: "Synthetic request", phone: "000123", email: "request@example.test",
      description: "Synthetic care need", county: "Cluj", status: "pending" as const,
      priority: "normal" as const, internal_notes: null, created_at: "2026-01-01",
    };
    const html = renderToStaticMarkup(createElement(CreatePatientModal, {
      request, isRomania: true, isAdmin: true, onClose: vi.fn(),
      workers: [{ id: "2", full_name: "Synthetic Doctor", email: "doctor@example.test", role: "Doctor", status: "active", created_at: "2026-01-01" }],
    }));
    expect(html).toContain('value="Synthetic request"');
    expect(html).toContain('value="request@example.test"');
    expect(html).toContain("Synthetic care need");
    expect(html).toContain("Synthetic Doctor");
    expect(html).toContain('type="search"');
    expect(html).toContain(wizard.team);
    expect(html).toContain(wizard.personal);
    expect(html).toContain(wizard.care);
    expect(html).not.toContain("<details");
    expect(html).not.toContain("Selectează vizibili");
    expect(html).not.toContain("Arată doar selectați");
    expect(html).toContain(wizard.next);
  });

  it("shows every selected team member with an accessible remove action and keeps assignments admin-only", () => {
    const workers = Array.from({ length: 7 }, (_, index) => ({
      id: String(index + 1), full_name: `Synthetic Doctor ${index + 1}`, email: `doctor${index + 1}@example.test`,
      role: "Doctor", status: "active" as const, county: "Cluj", created_at: "2026-01-01",
    }));
    const patient: PatientItem = {
      id: "7", full_name: "Test", email: "test@example.test", phone: "123",
      status: "active", priority: "moderate", created_at: "2026-01-01",
      assigned_worker_ids: workers.map((worker) => worker.id),
    };
    const props = { patient, workers, isRomania: true, onClose: vi.fn() };
    const html = renderToStaticMarkup(createElement(CreatePatientModal, { ...props, isAdmin: true }));
    for (const worker of workers) {
      expect(html).toContain(`aria-label="${crmTranslations.ro.removeSelection}: ${worker.full_name}"`);
    }
    expect(html).toContain("Doctor · Cluj");
    expect(html).toContain('aria-live="polite"');
    const staffHtml = renderToStaticMarkup(createElement(CreatePatientModal, props));
    expect(staffHtml).not.toContain('type="search"');
    expect(staffHtml).not.toContain(wizard.team);
  });
});
