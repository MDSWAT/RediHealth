import { describe, expect, it } from "vitest";
import { getHealthCheckTranslations } from "@/lib/i18n/health-check-translations";
import type { Lang } from "@/lib/i18n/translations";
import { getTopicForSymptom } from "./SymptomToTopicMapper";
import { COPY } from "./health-check-copy";
import { PAIN_DIAGRAM_COPY, buildPainAreaDiagramSvg } from "./pain-area-diagram";
import { predictSymptomsForSelection } from "./symptom-prediction";
import {
  buildTriageReproductionUrl,
  parseTriageReproductionSearch,
} from "./triage-permalink";

const LANGUAGES: Lang[] = ["ro", "en", "sq", "it", "hr", "rom"];

describe("Health Check triage improvements", () => {
  it("predicts neck and throat symptoms for neck sub-regions instead of cranial headache or migraine", () => {
    for (const lang of LANGUAGES) {
      const dict = getHealthCheckTranslations(lang);
      const headSymptoms = dict.symptoms.head;
      const isRedFlag = (s: { id: string; isRedFlag: boolean }) =>
        s.isRedFlag || s.id === "head_neck_red_flag";

      const neckPartition = predictSymptomsForSelection(
        "head",
        "neck",
        headSymptoms,
        isRedFlag,
      );
      const neckIds = neckPartition.primary.map((s) => s.id);

      expect(neckIds).toContain("head_neck_stiff");
      expect(neckIds).toContain("head_throat_swallow");
      expect(neckIds).toContain("head_neck_red_flag");
      expect(neckIds).not.toContain("head_migraine");
      expect(neckIds).not.toContain("head_tension");

      const cervicalPartition = predictSymptomsForSelection(
        "head",
        "cervical_spine",
        headSymptoms,
        isRedFlag,
      );
      const cervicalIds = cervicalPartition.primary.map((s) => s.id);
      expect(cervicalIds[0]).toBe("head_neck_stiff");
      expect(cervicalIds).not.toContain("head_migraine");
    }
  });

  it("routes neck pain to back/neck physical-activity guidance rather than tension headaches", () => {
    for (const lang of LANGUAGES) {
      const neckTopic = getTopicForSymptom("head", "head_neck_stiff", lang, "neck");
      expect(neckTopic?.slug).toBe("physical-activity");

      const subRegionFallback = getTopicForSymptom("head", undefined, lang, "cervical_spine");
      expect(subRegionFallback?.slug).toBe("physical-activity");

      const throatTopic = getTopicForSymptom("head", "head_throat_swallow", lang, "neck");
      expect(throatTopic?.slug).toBe("preventive-screening");
    }
  });

  it("round-trips triage result state through the QR reproduction URL", () => {
    const url = buildTriageReproductionUrl("https://redihealth.org", "ro", {
      part: "head",
      subRegion: "neck",
      side: "Left",
      symptomId: "head_neck_stiff",
      extraSymptomIds: ["head_throat_swallow"],
      severity: "moderate",
      duration: "days",
      forWhom: "child",
      bodyProfile: "female",
    });

    const parsedUrl = new URL(url);
    expect(parsedUrl.pathname).toBe("/ro/health-check");

    const restored = parseTriageReproductionSearch(parsedUrl.search, "ro");
    expect(restored).toEqual({
      fromQr: true,
      part: "head",
      subRegion: "neck",
      side: "Left",
      symptomId: "head_neck_stiff",
      extraSymptomIds: ["head_throat_swallow"],
      severity: "moderate",
      duration: "days",
      forWhom: "child",
      bodyProfile: "female",
    });
  });

  it("renders distinct anatomical coordinates for neck vs head and left vs right sides in the pain SVG", () => {
    const neckSvg = buildPainAreaDiagramSvg({
      part: "head",
      subRegion: "neck",
      side: "Center",
      lang: "ro",
    });
    const headSvg = buildPainAreaDiagramSvg({
      part: "head",
      subRegion: "head_face",
      side: "Center",
      lang: "ro",
    });
    expect(neckSvg).not.toBe(headSvg);
    expect(neckSvg).toContain("<svg");

    const leftArmSvg = buildPainAreaDiagramSvg({
      part: "arm",
      subRegion: "deltoid",
      side: "Left",
      lang: "en",
    });
    const rightArmSvg = buildPainAreaDiagramSvg({
      part: "arm",
      subRegion: "deltoid",
      side: "Right",
      lang: "en",
    });
    expect(leftArmSvg).not.toBe(rightArmSvg);
  });

  it("keeps zero ampersands across all localized copy and pain diagram labels", () => {
    for (const lang of LANGUAGES) {
      for (const value of Object.values(COPY[lang])) {
        expect(value).not.toContain("&");
      }
      for (const value of Object.values(PAIN_DIAGRAM_COPY[lang])) {
        expect(value).not.toContain("&");
      }
    }
  });
});
