import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock("@/lib/i18n/language-context", () => ({ useLanguage: () => ({ lang: "ro" }) }));

import { CreatePatientModal } from "./CreatePatientModal";
import type { PatientItem } from "@/lib/types/patient";

describe("patient intake form layout", () => {
  it("starts creation at contact details, keeps later steps mounted but hidden and uses Continue before saving", () => {
    const html = renderToStaticMarkup(createElement(CreatePatientModal, { isRomania: true, onClose: vi.fn() }));
    expect(html).toContain('aria-label="Progresul adăugării pacientului"');
    expect(html).toContain('aria-current="step"');
    expect(html).toContain("Îngrijire și documente");
    expect(html).toContain("Verificare");
    expect(html).toContain("Continuă");
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
    expect(html).toContain("Pacientul are documente");
    expect(html).toContain("Folosește locația curentă");
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
    expect(html).toContain("Document de identitate");
    expect(html).toContain("0.000000");
    expect(html).toContain("Precizie");
    expect(html).not.toContain('aria-label="Progresul adăugării pacientului"');
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
    expect(html).toContain("Synthetic Doctor (Doctor)");
    expect(html).toContain("Continuă");
  });
});
