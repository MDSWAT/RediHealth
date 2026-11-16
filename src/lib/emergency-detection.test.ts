import { describe, expect, it } from "vitest";
import { detectEmergencyText } from "@/lib/emergency-detection";
import { classifyIntentToPathway } from "@/lib/triage-state";

// Every phrase here must reach the emergency path. Add a case for each new term.
const EMERGENCIES: Record<string, string[]> = {
  ro: [
    "nu pot respira", "Nu mai pot respira de azi", "respir greu", "mă sufoc", "durere în piept",
    "ma doare pieptul tare", "atac cerebral", "cred ca e AVC", "a leșinat", "convulsii la copil",
    "vreau să mă sinucid", "a luat prea multe pastile", "m-am ars", "sângerare puternică", "infarct",
    "gura strâmbă și nu poate vorbi",
  ],
  en: [
    "chest pain", "I can't breathe", "short of breath", "heart attack", "stroke", "she passed out",
    "seizure", "overdose", "I took too many pills", "swallowed bleach", "I want to kill myself",
    "suicidal thoughts", "bleeding heavily",
  ],
  sq: ["dhimbje gjoksi", "nuk marr frymë", "vështirësi në frymëmarrje", "i ra të fikët", "helmim", "dua të vdes"],
  it: ["dolore al petto", "non riesco a respirare", "ictus", "è svenuto", "crisi epilettica", "voglio morire"],
  hr: ["bol u prsima", "ne mogu disati", "moždani udar", "izgubio svijest", "predoziranje"],
  rom: ["dukh ando kolin", "nashti phurdav"],
  ru: ["боль в груди", "не могу дышать", "инсульт", "потерял сознание", "хочу умереть"],
};

const NOT_EMERGENCIES = [
  "am tuse de o saptamana",
  "status card de sanatate",
  "medicul nu raspunde la telefon",
  "cum ma inscriu la medicul de familie",
  "reteta compensata",
  "how do I get a health card",
  "I have a mild headache",
  "inceput de raceala",
];

describe("emergency detection", () => {
  for (const [lang, phrases] of Object.entries(EMERGENCIES)) {
    it.each(phrases)(`flags the ${lang} emergency "%s"`, (phrase) => {
      expect(detectEmergencyText(phrase)).toBe(true);
    });
  }

  it.each(NOT_EMERGENCIES)('does not flag "%s"', (phrase) => {
    expect(detectEmergencyText(phrase)).toBe(false);
  });

  it("ignores empty input", () => {
    expect(detectEmergencyText("")).toBe(false);
    expect(detectEmergencyText("   ")).toBe(false);
    expect(detectEmergencyText(null)).toBe(false);
  });
});

describe("triage routing of emergencies", () => {
  it.each(["nu pot respira", "atac cerebral", "vreau sa ma sinucid", "lesin", "intoxicatie", "overdose"])(
    'sends "%s" to the symptoms pathway, never to information pages',
    (phrase) => {
      expect(classifyIntentToPathway(phrase)).toBe("symptoms");
    },
  );

  it('no longer reads "tus" inside "status" as a cough', () => {
    expect(classifyIntentToPathway("status card")).toBe("navigation");
  });
});
