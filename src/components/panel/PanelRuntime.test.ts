import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { demoPanelHref, offlinePanelHref, PanelLink, PanelRuntimeProvider } from "./PanelRuntime";

describe("demo and offline panel routing", () => {
  it("maps only panel URLs across all 7 locales, including localized deep links and filters", () => {
    expect(demoPanelHref("/ro/panel/patients/7")).toBe("/ro/demo/patients/7");
    expect(demoPanelHref("/hr/panel/patients/7")).toBe("/hr/demo/patients/7");
    expect(demoPanelHref("/rom/panel/patients/7")).toBe("/rom/demo/patients/7");
    expect(demoPanelHref("/panel?folder=pending")).toBe("/demo?folder=pending");
    expect(demoPanelHref("/panel/patients/7/meet/2")).toBe("/demo/patients/7/meet/2");
    expect(demoPanelHref("/ro/about")).toBe("/ro/about");
    expect(demoPanelHref("/panel-other")).toBe("/panel-other");

    expect(offlinePanelHref("/ro/panel/patients/7")).toBe("/ro/offline/patients/7");
    expect(offlinePanelHref("/hr/panel/patients/7")).toBe("/hr/offline/patients/7");
    expect(offlinePanelHref("/rom/panel/patients/7")).toBe("/rom/offline/patients/7");
  });

  it("preserves live links and isolates demo and offline links through the provider", () => {
    const link = createElement(PanelLink, { href: "/ro/panel/patients/7" }, "Patient");
    expect(renderToStaticMarkup(link)).toContain('href="/ro/panel/patients/7"');
    const props = { value: { demo: true, request: vi.fn(), navigate: vi.fn() }, children: link };
    expect(renderToStaticMarkup(createElement(PanelRuntimeProvider, props))).toContain('href="/ro/demo/patients/7"');

    const offlineLink = createElement(PanelLink, { href: "/hr/panel/patients/7" }, "Patient");
    const offlineProps = { value: { demo: false, offline: true, request: vi.fn(), navigate: vi.fn() }, children: offlineLink };
    expect(renderToStaticMarkup(createElement(PanelRuntimeProvider, offlineProps))).toContain('href="/hr/offline/patients/7"');
  });
});
