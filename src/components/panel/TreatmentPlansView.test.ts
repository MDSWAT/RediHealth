import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
vi.mock("@/lib/i18n/language-context", () => ({ useLanguage: () => ({ lang: "en" }) }));
import { TreatmentPlansView } from "./TreatmentPlansView";
import { treatmentTranslations } from "@/lib/i18n/treatment-translations";
import { formatDateKey } from "@/lib/panel-dates";

const t = treatmentTranslations.en;

describe("portal and printable treatment plans", () => {
  it("renders every course with its own dates, details and attachments", () => {
    const html = renderToStaticMarkup(createElement(TreatmentPlansView, {
      plan: { entries: [
        { id: "a", title: "First course", start_date: "2026-10-01", end_date: "2026-10-10", medications: "Therapy A", photos: [{ id: "photo", name: "Prescription A", date: "2026-10-01", data_url: "data:image/png;base64,AAAA" }] },
        { id: "b", title: "Second course", start_date: "2026-10-05", end_date: "2026-10-15", medications: "Therapy B" },
      ] },
    }));
    expect(html.match(/<article /g)).toHaveLength(2);
    expect(html).toContain("First course");
    expect(html).toContain("Second course");
    // Dates print in the reader's language, not as raw ISO keys.
    expect(html).not.toContain("2026-10-01 - 2026-10-10");
    expect(html).toContain(`${formatDateKey("2026-10-01", "en-US")} – ${formatDateKey("2026-10-10", "en-US")}`);
    expect(html).toContain(`${formatDateKey("2026-10-05", "en-US")} – ${formatDateKey("2026-10-15", "en-US")}`);
    expect(html).toContain("Therapy A");
    expect(html).toContain("Therapy B");
    expect(html).toContain("Prescription A");
  });

  it("still renders legacy clinical details and distinguishes an empty collection", () => {
    const legacy = renderToStaticMarkup(createElement(TreatmentPlansView, { plan: { diagnosis: "Original diagnosis", goals: "Original goal" } }));
    expect(legacy).toContain(t.legacy);
    expect(legacy).toContain(t.undated);
    expect(legacy).toContain("Original diagnosis");
    expect(legacy).toContain("Original goal");
    expect(renderToStaticMarkup(createElement(TreatmentPlansView, { plan: { entries: [] } }))).toContain(t.empty);
  });
});
