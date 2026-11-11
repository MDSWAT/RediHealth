import { describe, expect, it } from "vitest";
import {
  computeFeedbackSummary,
  normalizeAgeGroup,
  scrubPersonalIdentifiers,
  validateFeedbackPayload,
} from "./platform-feedback-shared";

describe("platform feedback anonymization and validation", () => {
  it("redacts emails, phone numbers, 13-digit national IDs, URLs, and street addresses", () => {
    const openRes = scrubPersonalIdentifiers(
      "Sunați-mă la +40 745 123 456 sau pe ana.popescu@exemplu.ro, CNP 2900512123456, detalii pe https://exemplu.ro/profil",
      { maxLength: 2000 },
    );
    expect(openRes.redactions).toBe(4);
    expect(openRes.cleaned).not.toContain("745");
    expect(openRes.cleaned).not.toContain("ana.popescu");
    expect(openRes.cleaned).not.toContain("2900512123456");
    expect(openRes.cleaned).not.toContain("https://");

    const locRes = scrubPersonalIdentifiers("Cluj-Napoca, str. Memorandumului nr. 14, ap. 3", {
      maxLength: 120,
      stripStreetDetails: true,
    });
    expect(locRes.cleaned).toBe("Cluj-Napoca");
    expect(locRes.redactions).toBeGreaterThanOrEqual(2);
  });

  it("normalizes exact numeric ages into k-anonymous age groups", () => {
    expect(normalizeAgeGroup("16")).toBe("under_18");
    expect(normalizeAgeGroup(22)).toBe("18_24");
    expect(normalizeAgeGroup("31")).toBe("25_34");
    expect(normalizeAgeGroup("68")).toBe("65_plus");
    expect(normalizeAgeGroup("35_44")).toBe("35_44");
    expect(normalizeAgeGroup("invalid")).toBeNull();
  });

  it("validates 1-5 evaluation scores and strips query tokens from page paths", () => {
    const valid = validateFeedbackPayload(
      {
        lang: "ro",
        page_path: "https://redihealth.org/ro/patient-portal/secret-token-abc?foo=bar",
        rating_usefulness: 5,
        rating_ease_of_use: 4,
        rating_visual_design: 5,
        rating_content_clarity: 5,
        rating_future_use: 4,
        open_feedback: "Mi-ar plăcea programare directă la medicul de familie.",
        gender: "female",
        age_group: "29",
        locality: "Brașov",
        occupation: "Asistentă",
        marital_status: "married_or_partnered",
      },
      "RO",
    );

    expect(valid.ok).toBe(true);
    if (valid.ok) {
      expect(valid.data.age_group).toBe("25_34");
      expect(valid.data.page_path).toBe("/ro/patient-portal/[token]");
      expect(valid.data.anonymized_redactions).toBe(0);
    }

    const outOfRange = validateFeedbackPayload({
      rating_usefulness: 6,
      rating_ease_of_use: 4,
      rating_visual_design: 5,
      rating_content_clarity: 5,
      rating_future_use: 4,
    });
    expect(outOfRange.ok).toBe(false);
  });

  it("computes dimension averages, 1-5 distributions, and demographic shares accurately", () => {
    const summary = computeFeedbackSummary([
      {
        id: "1",
        country_code: "RO",
        lang: "ro",
        page_path: "/",
        rating_usefulness: 5,
        rating_ease_of_use: 4,
        rating_visual_design: 5,
        rating_content_clarity: 4,
        rating_future_use: 5,
        average_rating: 4.6,
        open_feedback: "Foarte util",
        gender: "female",
        age_group: "25_34",
        locality: "Iași",
        occupation: "Medic",
        marital_status: "single",
        anonymized_redactions: 0,
        created_at: "2026-11-11T10:00:00Z",
      },
      {
        id: "2",
        country_code: "RO",
        lang: "ro",
        page_path: "/about",
        rating_usefulness: 3,
        rating_ease_of_use: 4,
        rating_visual_design: 5,
        rating_content_clarity: 4,
        rating_future_use: 3,
        average_rating: 3.8,
        open_feedback: null,
        gender: "male",
        age_group: "25_34",
        locality: "Iași",
        occupation: "Inginer",
        marital_status: "married_or_partnered",
        anonymized_redactions: 1,
        created_at: "2026-11-11T11:00:00Z",
      },
    ]);

    expect(summary.totalResponses).toBe(2);
    expect(summary.overallAverage).toBe(4.2);
    expect(summary.withOpenFeedbackCount).toBe(1);
    expect(summary.anonymizedCount).toBe(1);
    expect(summary.dimensions[0].average).toBe(4);
    expect(summary.dimensions[0].distribution).toEqual([0, 0, 1, 0, 1]);
    expect(summary.demographics.topLocalities[0]).toEqual({ key: "Iași", count: 2, sharePct: 100 });
  });
});
