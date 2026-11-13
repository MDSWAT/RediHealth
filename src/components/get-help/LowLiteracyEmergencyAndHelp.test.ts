import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import {
  QUICK_HELP_TOPICS,
  buildRequestDescription,
  normalizeHelpPhone,
} from "@/components/get-help/RequestHelpForm";
import { signsAudioCopy } from "@/components/emergency/EmergencySignsModal";
import NotFound from "@/app/not-found";
import type { Lang } from "@/lib/i18n/translations";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/",
}));

const LANGS: Lang[] = ["ro", "en", "sq", "it", "hr", "rom", "ru"];
const root = join(__dirname, "..", "..");
const read = (p: string) => readFileSync(join(root, p), "utf8");

function startsUpper(s: string) {
  const first = s.charAt(0);
  return first === first.toUpperCase();
}

describe("Scenario 4: emergency signs modal", () => {
  it("has localized sentence-case listen and stop labels", () => {
    for (const lang of LANGS) {
      const c = signsAudioCopy[lang];
      expect(c.listen.length).toBeGreaterThan(2);
      expect(c.stop.length).toBeGreaterThan(2);
      expect(c.listen).not.toContain("&");
      expect(startsUpper(c.listen)).toBe(true);
      expect(startsUpper(c.stop)).toBe(true);
    }
    expect(signsAudioCopy.sq.listen).toBe("Dëgjo shenjat");
  });

  it("uses large touch targets, number badges and no pills", () => {
    const modal = read("components/emergency/EmergencySignsModal.tsx");
    const gate = read("components/emergency/EmergencyDialerGate.tsx");
    expect(modal).toContain("useReadAloud");
    expect(modal).toContain("h-11 w-11");
    expect(modal).not.toContain("h-10 w-10");
    expect(modal).toContain("min-h-14");
    expect(modal).toContain("tabular-nums");
    expect(modal).not.toContain("rounded-full");
    expect(gate).toContain("h-11 w-11");
    expect(gate).not.toContain("h-10 w-10");
    expect(gate).toContain("min-h-12 whitespace-nowrap");
    expect(gate).not.toContain("rounded-full");
  });
});

describe("Scenario 5: callback request without free text", () => {
  it("offers five quick topics per language, each valid for the API", () => {
    for (const lang of LANGS) {
      const topics = QUICK_HELP_TOPICS[lang];
      expect(topics).toHaveLength(5);
      for (const topic of topics) {
        expect(topic.text.length).toBeGreaterThanOrEqual(20);
        expect(topic.label).not.toContain("&");
        expect(startsUpper(topic.label)).toBe(true);
      }
    }
  });

  it("pads short descriptions so the server accepts them", () => {
    for (const lang of LANGS) {
      expect(buildRequestDescription("febra", lang).length).toBeGreaterThanOrEqual(10);
      expect(buildRequestDescription("  durere  ", lang)).toContain("durere");
    }
    expect(buildRequestDescription("  durere mare de cap  ", "ro")).toBe("durere mare de cap");
  });

  it("normalizes phone numbers", () => {
    expect(normalizeHelpPhone(" (0721) 000.000 ")).toBe("0721000000");
    expect(normalizeHelpPhone("+40 721-000-000")).toBe("+40721000000");
  });

  it("page content has square step badges and a 112 button", () => {
    const page = read("components/get-help/GetHelpPageContent.tsx");
    expect(page).not.toContain("rounded-full");
    expect(page).toContain("EmergencyDialerGate");
    expect(page).toContain("tabular-nums");
    const form = read("components/get-help/RequestHelpForm.tsx");
    expect(form).toContain("useReadAloud");
    expect(form).not.toContain("rounded-full");
  });
});

describe("Scenario 6: 404 rescue actions", () => {
  it("renders search, assistant, doctor and find-help actions", () => {
    const html = renderToStaticMarkup(createElement(NotFound));
    expect(html).toContain("/health-assistant");
    expect(html).toContain("/medic-online");
    expect(html).toContain("/find-help");
    expect(html).toContain("<button");
    expect(html).not.toContain("&amp;");
  });

  it("source keeps rescue contracts", () => {
    const src = read("app/not-found.tsx");
    expect(src).toContain("openSmartSearch");
    expect(src).toContain("min-h-12 whitespace-nowrap");
    for (const lang of LANGS) expect(src).toContain(`${lang}: {`);
    expect(src).not.toContain("ndërmjetës");
  });
});
