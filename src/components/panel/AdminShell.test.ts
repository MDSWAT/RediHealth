import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({ usePathname: () => "/ro/panel" }));
vi.mock("next-auth/react", () => ({ signOut: vi.fn() }));
vi.mock("@/lib/i18n/language-context", () => ({
  useLanguage: () => ({ lang: "ro" }),
}));
vi.mock("./CountrySwitcher", () => ({ CountrySwitcher: () => null }));
vi.mock("./CreatePatientModal", () => ({ CreatePatientModal: () => null }));

import { AdminShell, PersistentPanelShell } from "./AdminShell";
import { PanelRuntimeProvider } from "./PanelRuntime";
import PanelLoading from "./PanelLoading";
import { createPatientModalTranslations } from "@/lib/i18n/panel-component-translations";

function renderShell(userRole: string, isAdmin = false, creationAvailable = true) {
  const props = {
    children: "Panel content",
    userEmail: "staff@example.test",
    userRole,
    isAdmin,
    mobilePatientCreation: creationAvailable ? { isRomania: true } : undefined,
  };
  return renderToStaticMarkup(createElement(AdminShell, props));
}

describe("mediator mobile patient creation", () => {
  it("renders one real menu around nested page shells and content-only loading", () => {
    const pageProps = { userEmail: "staff@example.test", userRole: "Mediator", isAdmin: false, children: "Patient content" };
    for (const children of [
      createElement(AdminShell, pageProps),
      createElement(PanelLoading),
    ]) {
      const props = { userEmail: "staff@example.test", userRole: "Mediator", isAdmin: false, children };
      const html = renderToStaticMarkup(createElement(PersistentPanelShell, props));
      expect(html.match(/class="care-panel min-h-screen/g)).toHaveLength(1);
      expect(html).toContain('href="/ro/panel/patients"');
      expect(html).not.toContain('href="/ro/panel/workers"');
    }
  });

  it("renders a large mobile-only add button (not emergency red) with a localized accessible label", () => {
    const html = renderShell("Mediator");
    expect(html).toContain(`aria-label="${createPatientModalTranslations.ro.titleCreate}"`);
    expect(html).toMatch(/class="[^"]*h-16 w-16[^"]*bg-primary[^"]*lg:hidden"/);
    // Red is reserved for 112 and emergency actions.
    expect(html).not.toMatch(/class="[^"]*h-16 w-16[^"]*bg-red-/);
    expect(html).toMatch(/class="[^"]*fixed right-5/);
    expect(html).toContain('class="h-8 w-8 shrink-0"');
    expect(html).not.toContain("-translate-x-1/2");
    expect(html).toContain("safe-area-inset-bottom");
  });

  it("does not offer the action to other roles, administrators, or unavailable databases", () => {
    for (const html of [
      renderShell("Doctor"),
      renderShell("Mediator", true),
      renderShell("Mediator", false, false),
    ]) {
      expect(html).not.toContain(`aria-label="${createPatientModalTranslations.ro.titleCreate}"`);
    }
  });
});

describe("role navigation", () => {
  it("hides menu items the runtime cannot open for the active role", () => {
    const runtime = { request: fetch, demo: true, navigate: () => {}, canOpen: (href: string) => !["/panel/calendar", "/panel/meet"].includes(href) };
    const shellProps = { userEmail: "mediator@example.test", userRole: "Mediator", isAdmin: false, children: "Content" };
    const providerProps = { value: runtime, children: createElement(AdminShell, shellProps) };
    const html = renderToStaticMarkup(createElement(PanelRuntimeProvider, providerProps));
    expect(html).toContain('href="/ro/demo/patients"');
    expect(html).not.toContain('href="/ro/demo/calendar"');
    expect(html).not.toContain('href="/ro/demo/meet"');
  });

  it("keeps every item when no runtime limits access", () => {
    const html = renderShell("Mediator");
    expect(html).toContain('href="/ro/panel/calendar"');
    expect(html).toContain('href="/ro/panel/meet"');
  });
});
