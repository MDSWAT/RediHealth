import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({ pathname: "/ro/panel/workers", lang: "ro" }));
vi.mock("next/navigation", () => ({ usePathname: () => state.pathname }));
vi.mock("@/lib/i18n/language-context", () => ({ useLanguage: () => ({ lang: state.lang }) }));
import PanelLoading from "./PanelLoading";
import { panelTranslations } from "@/lib/i18n/panel-translations";

describe("panel route loading", () => {
  it("announces loading and shows the destination title without loading account or patient data", () => {
    state.pathname = "/ro/panel/workers";
    const html = renderToStaticMarkup(createElement(PanelLoading));
    expect(html).toContain(panelTranslations.ro.adminShell.workers);
    expect(html).toContain('aria-busy="true"');
    expect(html).toContain('role="status"');
    expect(html).toContain("Se încarcă datele paginii");
    expect(html).toContain("motion-safe:animate-pulse");
    expect(html).not.toContain("<a ");
    expect(html).not.toContain("<aside");
    expect(html).not.toContain("<nav");
  });

  it("uses a calendar grid and patient-detail placeholders for localized and demo routes", () => {
    state.pathname = "/en/panel/calendar";
    state.lang = "en";
    expect(renderToStaticMarkup(createElement(PanelLoading))).toContain("grid-cols-7");
    state.pathname = "/ro/demo/patients/1";
    state.lang = "ro";
    const html = renderToStaticMarkup(createElement(PanelLoading));
    expect(html).toContain("md:grid-cols-2");
    expect(html).toContain(panelTranslations.ro.adminShell.patients);
  });
});
