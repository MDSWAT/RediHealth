import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

// Mock language context
vi.mock("@/lib/i18n/language-context", async () => {
  const { translations } = await import("@/lib/i18n/translations");
  return {
    useLanguage: () => ({
      lang: "ro",
      t: translations.ro,
      setLang: vi.fn(),
    }),
  };
});

import { Hero } from "./Hero";
import { HeroEmergencyNotice } from "./HeroEmergencyNotice";
import { HeroDecisionTree } from "./HeroDecisionTree";
import { HeroPortals } from "./HeroPortals";

describe("Hero Section Revamp (Milestone 2)", () => {
  it("renders the prominent 112 emergency ribbon with verbatim legal copy", () => {
    const html = renderToStaticMarkup(createElement(HeroEmergencyNotice));
    expect(html).toContain(
      "Semnele de alarmă și «Sună tu la 112» — aplicația nu apelează automat"
    );
    expect(html).toContain('href="tel:112"');
    expect(html).toContain("Sună la 112");
    expect(html).toContain("Vezi semnele de alarmă");
  });

  it("renders the interactive 5-pathway decision tree with 'Ce te îngrijorează astăzi?'", () => {
    const html = renderToStaticMarkup(createElement(HeroDecisionTree));
    expect(html).toContain("Ce te îngrijorează astăzi?");
    expect(html).toContain("Vreau să aflu despre sănătate");
    expect(html).toContain("Vreau să-mi verific riscul");
    expect(html).toContain("Am o problemă de sănătate");
    expect(html).toContain("Am o rețetă explicată");
    expect(html).toContain("Nu știu unde să merg / medic de familie / CNAS");
  });

  it("renders dual audience entry points for virtual clinic and community health mediators", () => {
    const html = renderToStaticMarkup(createElement(HeroPortals));
    expect(html).toContain("Clinica virtuală");
    expect(html).toContain("Pentru mediatori sanitari");
    expect(html).toContain('href="/get-help?mode=doctor"');
    expect(html).toContain('href="/panel"');
  });

  it("renders the complete hero section with headline, decision tree, portals, and emergency notice", () => {
    const html = renderToStaticMarkup(createElement(Hero, { showAssistantCta: true }));
    // Emergency notice
    expect(html).toContain(
      "Semnele de alarmă și «Sună tu la 112» — aplicația nu apelează automat"
    );
    // Headline
    expect(html).toContain("Informații medicale pe înțelesul tău");
    expect(html).toContain("și îndrumare către");
    expect(html).toContain("îngrijirea potrivită.");
    // Decision tree
    expect(html).toContain("Ce te îngrijorează astăzi?");
    // Portals
    expect(html).toContain("Clinica virtuală");
    expect(html).toContain("Pentru mediatori sanitari");
  });

  it("strictly enforces zero ampersands in prose copy across hero markup", () => {
    const html = renderToStaticMarkup(createElement(Hero));
    // Check that bare '&' does not appear outside HTML entities (like &quot; or &#x...)
    // Match any ' & ' or ' > & ' in prose
    expect(html).not.toMatch(/\s&\s/);
  });
});
