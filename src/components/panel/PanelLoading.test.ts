import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({ pathname: "/ro/panel/workers", lang: "ro" }));
vi.mock("next/navigation", () => ({ usePathname: () => state.pathname }));
vi.mock("@/lib/i18n/language-context", () => ({ useLanguage: () => ({ lang: state.lang }) }));
import PanelLoading from "./PanelLoading";

describe("panel route loading", () => {
  it("announces loading without depending on the server router or loading private data", () => {
    state.pathname = "/ro/panel/workers";
    const html = renderToStaticMarkup(createElement(PanelLoading));
    expect(html).toContain('aria-busy="true"');
    expect(html).toContain('role="status"');
    expect(html).toContain("Se încarcă…");
    // Quiet skeleton: no infinite pulse; a single delayed fade-in instead.
    expect(html).toContain("panel-skeleton");
    expect(html).not.toContain("animate-pulse");
    expect(html).not.toContain("<a ");
    expect(html).not.toContain("<aside");
    expect(html).not.toContain("<nav");
  });

  it("renders the same initial skeleton for localized and demo routes", () => {
    state.pathname = "/en/panel/calendar";
    state.lang = "en";
    const calendar = renderToStaticMarkup(createElement(PanelLoading));
    state.pathname = "/ro/demo/patients/1";
    const html = renderToStaticMarkup(createElement(PanelLoading));
    expect(html).toBe(calendar);
    expect(html).toContain("Loading…");
    expect(html).not.toContain("grid-cols-7");
  });
});
