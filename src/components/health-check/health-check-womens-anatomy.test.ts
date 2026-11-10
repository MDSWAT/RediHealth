import { describe, expect, it } from "vitest";
import {
  FEMALE_ONLY_SUB_REGIONS,
  QUICK_SPOTS_BY_MACRO,
  SUB_REGIONS_BY_MACRO,
  SUB_REGION_INFO,
  getLocalizedSubRegion,
  type SubRegionId,
} from "@/components/health-check/anatomy-3d-data";
import { getCareLevel, isAcuteSurgicalOrEmergency } from "@/components/health-check/HealthCheckExplorer";
import { getTopicForSymptom } from "@/components/health-check/SymptomToTopicMapper";
import { COPY } from "@/components/health-check/health-check-copy";
import { getHealthCheckTranslations, type BodyPartId } from "@/lib/i18n/health-check-translations";
import { getHealthTopicBySlug } from "@/lib/i18n/health-information-topics";
import type { Lang } from "@/lib/i18n/translations";

const LOCALES: readonly Lang[] = ["ro", "en", "sq", "it", "hr", "rom"] as const;
const BODY_PARTS: readonly BodyPartId[] = [
  "head",
  "chest",
  "stomach",
  "pelvis",
  "back",
  "arm",
  "leg",
] as const;

const NEW_SUB_REGIONS: readonly SubRegionId[] = [
  "jaw_ear",
  "breast",
  "axilla",
  "rib_cage",
  "uterus_ovaries",
  "bladder",
  "pelvic_floor",
  "hip_groin",
  "sacroiliac_coccyx",
  "hands_fingers",
  "feet_soles",
] as const;

describe("Expanded 3D body pain regions and women's health triage safety", () => {
  it("exposes all 46 3D sub-regions localized across all 6 languages without ampersands", () => {
    const ids = Object.keys(SUB_REGION_INFO) as SubRegionId[];
    expect(ids.length).toBe(46);

    for (const sub of NEW_SUB_REGIONS) {
      expect(SUB_REGION_INFO[sub]).toBeDefined();
    }
    expect(FEMALE_ONLY_SUB_REGIONS.has("breast")).toBe(true);
    expect(FEMALE_ONLY_SUB_REGIONS.has("uterus_ovaries")).toBe(true);
    expect(FEMALE_ONLY_SUB_REGIONS.has("bladder")).toBe(false);

    for (const lang of LOCALES) {
      for (const id of ids) {
        const loc = getLocalizedSubRegion(id, lang);
        expect(loc.label.length).toBeGreaterThan(1);
        expect(loc.summary.length).toBeGreaterThan(8);
        expect(loc.tissueLabel.length).toBeGreaterThan(1);
        expect(loc.commonConditions.length).toBeGreaterThan(0);
        expect(loc.label).not.toContain("&");
        expect(loc.summary).not.toContain("&");
      }
    }
  });

  it("maps every macro body part to valid 3D sub-regions and quick-spot options", () => {
    for (const part of BODY_PARTS) {
      expect(SUB_REGIONS_BY_MACRO[part].length).toBeGreaterThan(0);
      expect(QUICK_SPOTS_BY_MACRO[part].length).toBeGreaterThan(0);
      for (const sub of QUICK_SPOTS_BY_MACRO[part]) {
        expect(SUB_REGION_INFO[sub].macroPart).toBe(part);
      }
    }
  });

  it("enforces clinical safety floors and emergency flags for women's health symptoms", () => {
    // Mild, today-only breast lump or urinary burning must NEVER resolve to low/home-care
    expect(getCareLevel("mild", "today", ["chest_breast_lump"], "self")).toBe("medium");
    expect(getCareLevel("mild", "today", ["pelvis_urinary_burning"], "self")).toBe("medium");
    expect(getCareLevel("mild", "today", ["pelvis_one_sided"], "self")).toBe("medium");
    expect(getCareLevel("mild", "today", ["pelvis_pressure_floor"], "self")).toBe("medium");
    // Mild menstrual cramps today can safely show gentle home care + doctor guidance
    expect(getCareLevel("mild", "today", ["pelvis_period_cramps"], "self")).toBe("low");

    for (const lang of LOCALES) {
      const dict = getHealthCheckTranslations(lang);
      const copy = COPY[lang];
      expect(copy.bodyFemale.length).toBeGreaterThan(2);
      expect(copy.exactSpot).not.toContain("&");

      const chestIds = dict.symptoms.chest.map((s) => s.id);
      expect(chestIds).toContain("chest_breast_pain");
      expect(chestIds).toContain("chest_breast_lump");

      const pelvisSymptoms = dict.symptoms.pelvis;
      expect(pelvisSymptoms).toHaveLength(5);
      const emergency = pelvisSymptoms.find((s) => s.id === "pelvis_pregnancy_bleeding") ?? null;
      expect(isAcuteSurgicalOrEmergency(emergency)).toBe(true);

      for (const part of BODY_PARTS) {
        expect(dict.bodyParts[part].title).not.toContain("&");
        expect(dict.bodyParts[part].subtitle).not.toContain("&");
        for (const sym of dict.symptoms[part]) {
          expect(sym.title).not.toContain("&");
          expect(sym.description).not.toContain("&");
        }
      }
    }
  });

  it("links every symptom topic recommendation to an existing health-information guide slug", () => {
    for (const lang of LOCALES) {
      const lumpTopic = getTopicForSymptom("chest", "chest_breast_lump", lang);
      expect(lumpTopic.slug).toBe("preventive-screening");
      expect(getHealthTopicBySlug(lang, lumpTopic.slug)).toBeDefined();

      const breastPainTopic = getTopicForSymptom("chest", "chest_breast_pain", lang);
      expect(breastPainTopic.slug).toBe("womens-health");
      expect(getHealthTopicBySlug(lang, breastPainTopic.slug)).toBeDefined();

      for (const part of BODY_PARTS) {
        const topic = getTopicForSymptom(part, undefined, lang);
        expect(getHealthTopicBySlug(lang, topic.slug)).toBeDefined();
        expect(topic.title).not.toContain("&");
        expect(topic.recommendation).not.toContain("&");
      }
    }
  });
});
