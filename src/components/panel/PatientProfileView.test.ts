import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock("@/lib/i18n/language-context", () => ({ useLanguage: () => ({ lang: "en" }) }));

import { PatientProfileView } from "./PatientProfileView";
import type { PatientItem } from "@/lib/types/patient";

describe("patient profile contact layout", () => {
  it("places contact details below the name without duplicating them in the summary", () => {
    const patient: PatientItem = {
      id: "1", full_name: "Example Patient", email: "patient@example.test",
      phone: "0000000000", address: "12 Example Street", date_of_birth: "1980-01-02",
      status: "active", priority: "moderate", created_at: "2026-01-01",
      assigned_worker_names: ["Example Mediator"],
    };
    const html = renderToStaticMarkup(createElement(PatientProfileView, { initialPatient: patient, isRomania: true }));
    const header = /<header>([\s\S]*?)<\/header>/.exec(html)?.[1] || "";
    expect(header).toContain('href="tel:0000000000"');
    expect(header).toContain('href="mailto:patient@example.test"');
    expect(header).toContain("12 Example Street");
    expect(header).toContain("1980-01-02");
    expect(header.indexOf("</h1>")).toBeLessThan(header.indexOf('href="tel:'));
    expect(html.match(/href="tel:/g)).toHaveLength(1);
    expect(html.match(/href="mailto:/g)).toHaveLength(1);
    expect(html.slice(html.indexOf("</header>"))).not.toContain("12 Example Street");
    expect(html).toContain("Example Mediator");
  });

  it("shows individual assigned staff cards with initials and retains legacy assignments", () => {
    const patient: PatientItem = {
      id: "1", full_name: "Example Patient", email: "patient@example.test", phone: "000",
      status: "active", priority: "moderate", created_at: "2026-01-01",
      assigned_worker_names: ["Alex Demo", "Dr. Dana Demo"],
    };
    const render = (value: PatientItem) => renderToStaticMarkup(createElement(PatientProfileView, { initialPatient: value, isRomania: true }));
    const html = render(patient);
    const team = /<ul aria-label="Care team"([\s\S]*?)<\/ul>/i.exec(html)?.[1] || "";
    expect(team.match(/<li /g)).toHaveLength(2);
    expect(team).toContain("Alex Demo");
    expect(team).toContain("Dr. Dana Demo");
    expect(team).toContain(">AD</span>");
    expect(team).toContain(">DD</span>");
    expect(render({ ...patient, assigned_worker_names: [], assigned_worker_name: "Legacy Doctor" })).toContain("Legacy Doctor");
    expect(render({ ...patient, assigned_worker_names: [] })).toContain("Unassigned");
  });
});
