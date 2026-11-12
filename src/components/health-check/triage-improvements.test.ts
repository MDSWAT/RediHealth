import { describe, expect, it } from "vitest";
import {
  getHealthCheckTranslations,
  type BodyPartId,
} from "@/lib/i18n/health-check-translations";
import { getHealthTopicBySlug } from "@/lib/i18n/health-information-topics";
import type { Lang } from "@/lib/i18n/translations";
import { SUB_REGION_INFO } from "./anatomy-3d-data";
import { getTopicForSymptom } from "./SymptomToTopicMapper";
import { encodeQrMatrix, renderClinicalQrSvgData } from "./clinical-qr-svg";
import { COPY } from "./health-check-copy";
import { PAIN_DIAGRAM_COPY, buildPainAreaDiagramSvg } from "./pain-area-diagram";
import { predictSymptomsForSelection } from "./symptom-prediction";
import { TRIAGE_NOTE_COPY } from "./TriageNoteView";
import { SUMMARY_COPY } from "./TriageSummaryCard";
import {
  buildFallbackTriageNoteUrl,
  buildTriageNoteUrl,
  buildTriageReproductionUrl,
  parseFallbackTriageNoteSearch,
  parseTriageNoteDate,
  parseTriageReproductionSearch,
} from "./triage-permalink";

const LANGUAGES: Lang[] = ["ro", "en", "sq", "it", "hr", "rom", "ru"];

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
      for (const value of Object.values(SUMMARY_COPY[lang])) {
        expect(value).not.toContain("&");
      }
      for (const value of Object.values(TRIAGE_NOTE_COPY[lang])) {
        expect(value).not.toContain("&");
      }
    }
  });

  it("builds a dedicated clinical note QR URL for iPhone and Android cameras instead of plain text", () => {
    const noteUrl = buildTriageNoteUrl(
      "https://redihealth.org",
      "en",
      {
        part: "head",
        subRegion: "neck",
        side: "Right",
        symptomId: "head_neck_stiff",
        severity: "moderate",
        duration: "days",
        forWhom: "self",
      },
      "2026-11-11",
    );

    const parsed = new URL(noteUrl);
    expect(parsed.protocol).toBe("https:");
    expect(parsed.pathname).toBe("/en/health-check/note");

    const restored = parseTriageReproductionSearch(parsed.search, "en");
    expect(restored?.part).toBe("head");
    expect(restored?.subRegion).toBe("neck");
    expect(restored?.side).toBe("Right");
    expect(restored?.symptomId).toBe("head_neck_stiff");

    const parsedDate = parseTriageNoteDate(parsed.search);
    expect(parsedDate?.getFullYear()).toBe(2026);
    expect(parsedDate?.getMonth()).toBe(10);
    expect(parsedDate?.getDate()).toBe(11);
  });

  it("encodes standalone fallback summaries as https note URLs and renders a 4-module ISO quiet zone", () => {
    const fallbackUrl = buildFallbackTriageNoteUrl("https://redihealth.org", "ro", {
      bodyArea: "Cap și gât",
      anatomicalStructure: "Ceafă, dreapta",
      symptoms: ["Durere de ceafă"],
      painLevel: "Moderată",
      duration: "De câteva zile",
      redFlagNoticed: false,
      recommendationDetail: "Recomandare: mergi la medicul de familie",
      dateIso: "2026-11-11",
    });

    const parsed = new URL(fallbackUrl);
    expect(parsed.pathname).toBe("/ro/health-check/note");

    const restoredFallback = parseFallbackTriageNoteSearch(parsed.search);
    expect(restoredFallback).toEqual({
      bodyArea: "Cap și gât",
      anatomicalStructure: "Ceafă, dreapta",
      symptoms: ["Durere de ceafă"],
      painLevel: "Moderată",
      duration: "De câteva zile",
      redFlagNoticed: false,
      recommendationDetail: "Recomandare: mergi la medicul de familie",
      dateIso: "2026-11-11",
    });

    const matrix = encodeQrMatrix(fallbackUrl);
    const svg = renderClinicalQrSvgData(fallbackUrl);
    expect(svg.size).toBe(matrix.length + 8);
  });

  it("strips mismatched sub-region query parameters when macro part does not own the sub-region", () => {
    const restored = parseTriageReproductionSearch(
      "?qr=1&p=leg&sr=neck&sy=leg_sprain",
      "ro",
    );
    expect(restored).not.toBeNull();
    expect(restored?.part).toBe("leg");
    expect(restored?.subRegion).toBeNull();
    expect(restored?.symptomId).toBe("leg_sprain");
  });

  it("maps dehydration and migraine symptoms to clinically coherent localized guides without ampersands", () => {
    const bodyParts: BodyPartId[] = [
      "head",
      "chest",
      "stomach",
      "pelvis",
      "back",
      "arm",
      "leg",
    ];

    for (const lang of LANGUAGES) {
      const dehydrationTopic = getTopicForSymptom("head", "head_dehydration", lang);
      expect(dehydrationTopic.slug).toBe("healthy-eating");
      expect(getHealthTopicBySlug(lang, dehydrationTopic.slug)).toBeDefined();

      const migraineTopic = getTopicForSymptom("head", "head_migraine", lang);
      const suddenSevereTopic = getTopicForSymptom("head", "head_sudden_severe", lang);
      const tensionTopic = getTopicForSymptom("head", "head_tension", lang);

      expect(migraineTopic.slug).toBe("mental-wellbeing");
      expect(suddenSevereTopic.slug).toBe("mental-wellbeing");
      expect(migraineTopic.title).not.toBe(tensionTopic.title);
      expect(migraineTopic.recommendation).not.toBe(tensionTopic.recommendation);
      expect(getHealthTopicBySlug(lang, migraineTopic.slug)).toBeDefined();

      const dict = getHealthCheckTranslations(lang);
      for (const part of bodyParts) {
        const fallbackTopic = getTopicForSymptom(part, undefined, lang);
        expect(getHealthTopicBySlug(lang, fallbackTopic.slug)).toBeDefined();
        expect(fallbackTopic.title).not.toContain("&");
        expect(fallbackTopic.recommendation).not.toContain("&");

        for (const symptom of dict.symptoms[part]) {
          const mapped = getTopicForSymptom(part, symptom.id, lang);
          expect(getHealthTopicBySlug(lang, mapped.slug)).toBeDefined();
          expect(mapped.title).not.toContain("&");
          expect(mapped.recommendation).not.toContain("&");
        }
      }
    }
  });

  it("enforces strict Romanian sentence casing across all 3D anatomy recommendedSpecialty values", () => {
    for (const entry of Object.values(SUB_REGION_INFO)) {
      const rest = entry.recommendedSpecialty.slice(1);
      const midSentenceTitleCase = rest.match(/[A-ZĂÂÎȘȚ][a-zăâîșț]+/g);
      expect(midSentenceTitleCase).toBeNull();

      const roLoc = entry.localized?.ro?.recommendedSpecialty;
      if (roLoc) {
        expect(roLoc.slice(1).match(/[A-ZĂÂÎȘȚ][a-zăâîșț]+/g)).toBeNull();
      }
    }
  });
});
