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

import { AdminShell } from "./AdminShell";
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
  it("renders a large red mobile-only button with a localized accessible label", () => {
    const html = renderShell("Mediator");
    expect(html).toContain(`aria-label="${createPatientModalTranslations.ro.titleCreate}"`);
    expect(html).toMatch(/class="[^"]*h-16 w-16[^"]*bg-red-600[^"]*lg:hidden"/);
    expect(html).toContain('aria-hidden="true" class="text-5xl leading-none">+</span>');
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
