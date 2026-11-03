import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { demoPanelHref, PanelLink, PanelRuntimeProvider } from "./PanelRuntime";

describe("demo panel routing", () => {
  it("maps only panel URLs, including localized deep links and filters", () => {
    expect(demoPanelHref("/ro/panel/patients/7")).toBe("/ro/demo/patients/7");
    expect(demoPanelHref("/panel?folder=pending")).toBe("/demo?folder=pending");
    expect(demoPanelHref("/panel/patients/7/meet/2")).toBe("/demo/patients/7/meet/2");
    expect(demoPanelHref("/ro/about")).toBe("/ro/about");
    expect(demoPanelHref("/panel-other")).toBe("/panel-other");
  });

  it("preserves live links and isolates demo links through the provider", () => {
    const link = createElement(PanelLink, { href: "/ro/panel/patients/7" }, "Patient");
    expect(renderToStaticMarkup(link)).toContain('href="/ro/panel/patients/7"');
    const props = { value: { demo: true, request: vi.fn(), navigate: vi.fn() }, children: link };
    expect(renderToStaticMarkup(createElement(PanelRuntimeProvider, props))).toContain('href="/ro/demo/patients/7"');
  });
});
