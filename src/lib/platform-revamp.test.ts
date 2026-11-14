import { describe, expect, it } from "vitest";
import { isVoiceEnabled } from "@/lib/audio/voice-availability";
import { formatSpeechText, speechEngine } from "@/lib/audio/speech-engine";
import { getHealthCheckTranslations } from "@/lib/i18n/health-check-translations";
import { getLocalizedSubRegion, SUB_REGION_INFO } from "@/components/health-check/anatomy-3d-data";
import { getHealthTopicsList } from "@/lib/i18n/health-information-topics";
import { getHealthMyths } from "@/lib/i18n/health-myths";
import { evaluateBloodPressure } from "@/lib/simulators/blood-pressure-types";
import { parsePrescriptionText } from "@/lib/prescription-parser";
import { NEWS_ARTICLES, getLocalizedArticle } from "@/lib/data/news";
import type { Lang } from "@/lib/i18n/translations";

const LOCALES: Lang[] = ["ro", "en", "sq", "it", "hr", "rom"];

describe("Platform core capabilities and multi-locale contracts", () => {
  it("enables voice read-aloud for ro, en, sq, it, hr, and ru (6/7 = 85.7%) while strictly blocking rom", () => {
    expect(isVoiceEnabled("ro")).toBe(true);
    expect(isVoiceEnabled("en")).toBe(true);
    expect(isVoiceEnabled("sq")).toBe(true);
    expect(isVoiceEnabled("it")).toBe(true);
    expect(isVoiceEnabled("hr")).toBe(true);
    expect(isVoiceEnabled("ru")).toBe(true);
    expect(isVoiceEnabled("sq-AL" as Lang)).toBe(true);
    expect(isVoiceEnabled("rom")).toBe(false);
    expect(isVoiceEnabled("rom-RO" as Lang)).toBe(false);
    const enabledCount = (["ro", "en", "sq", "it", "hr", "ru", "rom"] as Lang[]).filter((lang) =>
      isVoiceEnabled(lang)
    ).length;
    expect(enabledCount).toBe(6);
  });

  it("normalizes clinical units, numeric ranges, URLs, and 112 for natural speech across all 6 voiced languages", () => {
    expect(formatSpeechText("Tensiunea crește cu 10–15 mmHg. Sună la 112.", "ro-RO")).toContain(
      "10 până la 15 milimetri coloană de mercur"
    );
    expect(formatSpeechText("Sună la 112.", "ro-RO")).toContain("unu unu doi");
    expect(formatSpeechText("Walk 10–15 minutes. Call 112.", "en-US")).toContain("10 to 15");
    expect(formatSpeechText("Cammina 10–15 minuti. Chiama il 112.", "it-IT")).toContain("da 10 a 15");
    expect(formatSpeechText("Tlak raste za 10–15 mmHg. Nazovi 112.", "hr-HR")).toContain(
      "od 10 do 15 milimetara živinog stupca"
    );
    expect(formatSpeechText("Nazovi 112.", "hr-HR")).toContain("jedan jedan dva");
    const ruSpoken = formatSpeechText("Давление 10–15 mmHg. Звоните 112.", "ru-RU");
    expect(ruSpoken).toContain("от 10 до 15 миллиметров ртутного столба");
    expect(ruSpoken).toContain("один один два");
    const sqSpoken = formatSpeechText("Tensioni rritet me 10–15 mmHg. Telefononi 112.", "sq-AL");
    expect(sqSpoken).toContain("nga 10 deri në 15 milimetra shtyllë zhive");
    expect(sqSpoken).toContain("një një dy");
    const strippedUrl = formatSpeechText(
      "Vezi detalii la https://redihealth.ro/ro/find-help?q=1 și sună la 112.",
      "ro-RO"
    );
    expect(strippedUrl).not.toContain("https://");
    expect(strippedUrl).not.toContain("redihealth.ro");
    expect(strippedUrl).toContain("unu unu doi");
    expect(speechEngine.isSpeaking()).toBe(false);
  });

  it("keeps health-check translations and acute red-flag flags aligned across all 6 locales", () => {
    for (const lang of LOCALES) {
      const dict = getHealthCheckTranslations(lang);
      expect(Object.keys(dict.bodyParts)).toHaveLength(7);
      const sharpLowerAbdomen = dict.symptomsByRegion.stomach.find(
        (s) => s.id === "stomach_lower_sharp"
      );
      expect(sharpLowerAbdomen?.isRedFlag).toBe(true);
      const pelvicEmergency = dict.symptomsByRegion.pelvis.find(
        (s) => s.id === "pelvis_pregnancy_bleeding"
      );
      expect(pelvicEmergency?.isRedFlag).toBe(true);
    }
  });

  it("localizes 3D anatomical subregions across ro, en, sq, and it without missing labels", () => {
    expect(Object.keys(SUB_REGION_INFO).length).toBeGreaterThanOrEqual(30);
    for (const lang of LOCALES) {
      const heart = getLocalizedSubRegion("heart", lang);
      expect(heart.label.length).toBeGreaterThan(2);
      expect(heart.summary.length).toBeGreaterThan(5);
    }
  });

  it("provides all 8 health information guides and localized myths across ro, en, sq, and it", () => {
    for (const lang of LOCALES) {
      const topics = getHealthTopicsList(lang);
      expect(topics).toHaveLength(8);
      for (const topic of topics) {
        expect(topic.title.length).toBeGreaterThan(2);
        expect(topic.description.length).toBeGreaterThan(5);
      }
      const myths = getHealthMyths(lang);
      expect(myths.length).toBeGreaterThanOrEqual(6);
    }
  });

  it("classifies blood pressure readings accurately across clinical ESC/ESH tiers", () => {
    expect(evaluateBloodPressure(115, 75).tier).toBe("optimal");
    expect(evaluateBloodPressure(135, 86).tier).toBe("high_normal");
    expect(evaluateBloodPressure(150, 95).tier).toBe("grade_1_hypertension");
    expect(evaluateBloodPressure(185, 122).tier).toBe("grade_3_hypertension");
  });

  it("parses structured medication schedules from prescription text", () => {
    const parsed = parsePrescriptionText("Metformin 500mg 1x2 pe zi după masă timp de 30 zile");
    expect(parsed.medicines.length).toBeGreaterThanOrEqual(1);
    expect(parsed.medicines[0].name.toLowerCase()).toContain("metformin");
  });

  it("provides localized regional health news articles across all 4 locales", () => {
    expect(NEWS_ARTICLES.length).toBeGreaterThan(0);
    const sample = NEWS_ARTICLES[0];
    for (const lang of LOCALES) {
      const localized = getLocalizedArticle(sample, lang);
      expect(localized.title.length).toBeGreaterThan(5);
      expect(localized.summary.length).toBeGreaterThan(10);
    }
  });
});
