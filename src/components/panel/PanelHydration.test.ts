// @vitest-environment jsdom

import { act, createElement } from "react";
import { hydrateRoot, type Root } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LanguageProvider } from "@/lib/i18n/language-context";
import { serializeTranslations } from "@/lib/i18n/languages";
import { translations } from "@/lib/i18n/translations";
import { MedicalInstitutesDashboard } from "./MedicalInstitutesDashboard";
import { PersistentPanelShell } from "./AdminShell";
import PanelLoading from "./PanelLoading";

const route = vi.hoisted(() => ({ pathname: "/panel/institutes" }));
vi.mock("next/navigation", () => ({ usePathname: () => route.pathname }));
vi.mock("next-auth/react", () => ({ signOut: vi.fn() }));
vi.mock("./CountrySwitcher", () => ({ CountrySwitcher: () => null }));
vi.mock("./CreatePatientModal", () => ({ CreatePatientModal: () => null }));

let root: Root | undefined;

beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  document.cookie = "redihealth-lang-manual=1; path=/";
});

afterEach(async () => {
  if (root) await act(() => root?.unmount());
  root = undefined;
  document.body.innerHTML = "";
  vi.unstubAllGlobals();
});

async function hydratePanel(children: React.ReactNode, serverPath: string, browserPath: string) {
  const tree = () => {
    const shellProps = {
      userEmail: "staff@example.test", userRole: "Super admin", isAdmin: true, children,
    };
    const languageProps = {
      requestLang: "en" as const,
      initialTranslations: serializeTranslations(translations.en),
      children: createElement(PersistentPanelShell, shellProps),
    };
    return createElement(LanguageProvider, languageProps);
  };
  route.pathname = serverPath;
  const container = document.createElement("div");
  container.innerHTML = renderToString(tree());
  document.body.append(container);
  route.pathname = browserPath;
  const errors: unknown[] = [];
  await act(async () => {
    root = hydrateRoot(container, tree(), { onRecoverableError: (error) => errors.push(error) });
  });
  return {
    container,
    errors,
    async navigate(pathname: string) {
      route.pathname = pathname;
      await act(() => root?.render(tree()));
    },
  };
}

describe("institutes panel hydration", () => {
  it("hydrates institute data across the locale rewrite", async () => {
    const { container, errors } = await hydratePanel(createElement(MedicalInstitutesDashboard, {
      initialData: {
        institutes: [{
          id: "1", name: "Test clinic", category: "clinic", country_code: "RO", ownership: null,
          address: "Test street", city: "Test city", phone: "", website: null, hours: null,
          emergency: false, lat: 44.4, lng: 26.1, distance_km: null, is_active: true,
          source: "manual", osm_ref: null, manually_edited: true, updated_at: "2026-11-23T06:00:00.000Z",
        }],
        total: 1, page: 1, pageSize: 50, stats: [{ country_code: "RO", active: 1, total: 1 }],
      },
      userEmail: "staff@example.test", userRole: "Super admin", databaseAvailable: true, workingCountry: "RO",
    }), "/panel/institutes", "/en/panel/institutes");
    expect(errors).toEqual([]);
    expect(container.querySelector("h1")?.textContent).toBe("Medical institutes");
    expect(container.textContent).toContain("Test clinic");
  });

  it("hydrates the loading boundary when the server router still exposes the parent path", async () => {
    const { container, errors } = await hydratePanel(createElement(PanelLoading), "/panel", "/en/panel/institutes");
    expect(errors).toEqual([]);
    expect(container.querySelector("h1")?.textContent).toBe("Medical institutes");
    expect(container.querySelector('a[href="/en/panel/institutes"][aria-current="page"]')).not.toBeNull();
    expect(container.querySelector('a[href="/en/panel"][aria-current="page"]')).toBeNull();
  });

  it.each([
    ["/en/panel/calendar", "Calendar", "grid-cols-7"],
    ["/en/demo/patients/1", "Patients", "md:grid-cols-2"],
  ])("shows the destination skeleton after hydrating %s", async (path, title, grid) => {
    const { container, errors } = await hydratePanel(createElement(PanelLoading), "/panel", path);
    expect(errors).toEqual([]);
    expect(container.querySelector("h1")?.textContent).toBe(title);
    expect(container.innerHTML).toContain(grid);
  });

  it("updates the title, skeleton and active link on subsequent client navigation", async () => {
    const { container, errors, navigate } = await hydratePanel(createElement(PanelLoading), "/panel/institutes", "/en/panel/institutes");
    await navigate("/en/panel/calendar");
    expect(container.querySelector("h1")?.textContent).toBe("Calendar");
    expect(container.innerHTML).toContain("grid-cols-7");
    expect(container.querySelector('a[href="/en/panel/calendar"][aria-current="page"]')).not.toBeNull();
    expect(container.querySelector('a[href="/en/panel/institutes"][aria-current="page"]')).toBeNull();
    expect(errors).toEqual([]);
  });
});
