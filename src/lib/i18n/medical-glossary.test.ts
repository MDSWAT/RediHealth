import { describe, expect, it } from "vitest";
import {
  ROMANIAN_MEDICAL_GLOSSARY,
  getLocalizedGlossaryEntry,
} from "@/lib/i18n/romanian-medical-glossary";
import {
  ROMANES_GLOSSARY_TERMS,
  type NonRoLang,
} from "@/lib/i18n/romanes-glossary";
import type { Lang } from "@/lib/i18n/translations";

const ALL_LANGS: Lang[] = ["ro", "en", "sq", "it", "hr", "rom"];
const NON_RO_LANGS: NonRoLang[] = ["en", "sq", "it", "hr", "rom"];

describe("Medical dictionary clinical and multilingual integrity", () => {
  it("provides complete 6-language localized entries for all dual-register terms with zero ampersands", () => {
    expect(ROMANIAN_MEDICAL_GLOSSARY.length).toBeGreaterThanOrEqual(23);

    for (const entry of ROMANIAN_MEDICAL_GLOSSARY) {
      for (const lang of ALL_LANGS) {
        const localized = getLocalizedGlossaryEntry(entry, lang);
        expect(localized.formalTerm.trim().length).toBeGreaterThan(2);
        expect(localized.plainTerm.trim().length).toBeGreaterThan(2);
        expect(localized.layExplanation.trim().length).toBeGreaterThan(15);
        expect(localized.clinicalSignificance.trim().length).toBeGreaterThan(10);
        expect(localized.speechText.trim().length).toBeGreaterThan(10);

        const combined = [
          localized.formalTerm,
          localized.plainTerm,
          localized.layExplanation,
          localized.clinicalSignificance,
        ].join(" ");
        expect(combined).not.toContain("&");
      }
    }
  });

  it("frames glucometer and glycemia entries around blood glucose concentration rather than 'seeing sugar'", () => {
    const glucometer = ROMANIAN_MEDICAL_GLOSSARY.find(
      (entry) => entry.id === "glucometru"
    );
    expect(glucometer).toBeDefined();

    const bannedGlucosePhrases = [
      "vezi zahărul",
      "aparat de măsurat zahărul",
      "see sugar",
      "blood sugar meter",
      "sheh sheqerin",
      "vedi lo zucchero",
      "dikhes o zahari",
    ];

    for (const lang of ALL_LANGS) {
      const localized = getLocalizedGlossaryEntry(glucometer!, lang);
      const hay = `${localized.plainTerm} ${localized.layExplanation} ${localized.speechText}`.toLowerCase();
      for (const banned of bannedGlucosePhrases) {
        expect(hay).not.toContain(banned);
      }
    }

    expect(
      getLocalizedGlossaryEntry(glucometer!, "ro").layExplanation.toLowerCase()
    ).toContain("concentrația de glucoză");
    expect(
      getLocalizedGlossaryEntry(glucometer!, "en").layExplanation.toLowerCase()
    ).toContain("concentration");
    expect(
      getLocalizedGlossaryEntry(glucometer!, "it").layExplanation.toLowerCase()
    ).toContain("concentrazione di glucosio");
  });

  it("defines vaccines accurately as preventive immunization rather than a 'small sting' or 'o chikat'", () => {
    const dualVaccine = ROMANIAN_MEDICAL_GLOSSARY.find(
      (entry) => entry.id === "vaccin-imunizare"
    );
    expect(dualVaccine).toBeDefined();

    const romanesVaccine = ROMANES_GLOSSARY_TERMS.find(
      (term) => term.id === "vaccin"
    );
    expect(romanesVaccine).toBeDefined();
    expect(romanesVaccine!.romanesTerm).toBe("I vakcina (arakhipnasko drab)");

    const bannedVaccinePhrases = [
      "înțepătură mică",
      "small sting",
      "small prick",
      "small injection",
      "piccola puntura",
      "gjilpërë e vogël",
      "mala injekcija",
      "chikat",
      "cioranengo",
    ];

    for (const lang of ALL_LANGS) {
      const localized = getLocalizedGlossaryEntry(dualVaccine!, lang);
      const dualHay = `${localized.formalTerm} ${localized.plainTerm} ${localized.layExplanation} ${localized.speechText}`.toLowerCase();
      for (const banned of bannedVaccinePhrases) {
        expect(dualHay).not.toContain(banned);
      }
    }

    const romanesHay = [
      romanesVaccine!.romanesTerm,
      romanesVaccine!.romanianTerm,
      romanesVaccine!.explanation,
      romanesVaccine!.phoneticPronunciation,
      romanesVaccine!.audioPronunciationText,
      ...NON_RO_LANGS.map((l) => romanesVaccine!.termByLang?.[l] ?? ""),
      ...NON_RO_LANGS.map((l) => romanesVaccine!.explanationByLang?.[l] ?? ""),
    ]
      .join(" ")
      .toLowerCase();

    for (const banned of bannedVaccinePhrases) {
      expect(romanesHay).not.toContain(banned);
    }
  });

  it("maintains complete 6-language parity and authentic Romani medical forms across all 15 Romanes terms", () => {
    expect(ROMANES_GLOSSARY_TERMS).toHaveLength(15);

    for (const term of ROMANES_GLOSSARY_TERMS) {
      expect(term.romanesTerm).not.toMatch(/chikat|cioranengo|barvali sigardiari|rengro/i);
      expect(term.explanation).not.toContain("&");

      for (const lang of NON_RO_LANGS) {
        expect(term.termByLang?.[lang]?.trim().length).toBeGreaterThan(1);
        expect(term.categoryLabelByLang?.[lang]?.trim().length).toBeGreaterThan(1);
        expect(term.explanationByLang?.[lang]?.trim().length).toBeGreaterThan(15);
        expect(term.explanationByLang?.[lang]).not.toContain("&");
      }
    }
  });
});
