import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock("@/lib/i18n/language-context", () => ({ useLanguage: () => ({ lang: "ro" }) }));

import { CreatePatientModal } from "./CreatePatientModal";
import type { PatientItem } from "@/lib/types/patient";

describe("patient intake form layout", () => {
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
  });
});
