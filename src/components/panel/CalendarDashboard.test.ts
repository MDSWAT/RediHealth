import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({ usePathname: () => "/en/panel/calendar" }));
vi.mock("@/lib/i18n/language-context", () => ({ useLanguage: () => ({ lang: "en" }) }));
vi.mock("./AdminShell", () => ({ AdminShell: ({ children }: { children: React.ReactNode }) => children }));
import { CalendarDashboard } from "./CalendarDashboard";
import { createDemoData } from "@/lib/demo-panel";
import { crmTranslations } from "@/lib/i18n/crm-translations";

describe("calendar quick completion", () => {
  it("offers a direct, individually labeled completion button for each scheduled follow-up", () => {
    const data = createDemoData();
    const html = renderToStaticMarkup(createElement(CalendarDashboard, {
      initialPatients: data.patients, userEmail: "doctor@example.test", databaseAvailable: true,
    }));
    const labels = html.match(new RegExp(`aria-label="${crmTranslations.en.markComplete}:[^"]*"`, "gi")) || [];
    expect(labels).toHaveLength(6);
    expect(html).toContain(`${crmTranslations.en.markComplete}: Follow-up consultation · Maria Demo`);
    expect(html).not.toContain(`${crmTranslations.en.markComplete}: Initial assessment`);
  });
});
