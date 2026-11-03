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

  it("renders a large red mobile-only button with a localized accessible label", () => {
    const html = renderShell("Mediator");
    expect(html).toContain(`aria-label="${createPatientModalTranslations.ro.titleCreate}"`);
    expect(html).toMatch(/class="[^"]*h-16 w-16[^"]*bg-red-600[^"]*lg:hidden"/);
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
