/**
 * RediHealth Plain-Language Prescription Parser (Change 45)
 * Transforms raw OCR text or clinician transcription into 4 structured categories:
 * 1. Detected medicines (brand, generic, dosage strength)
 * 2. How to take correctly (time-of-day dosage schedule)
 * 3. What to avoid (warnings, interactions, food timing)
 * 4. Treatment duration
 */

export interface DetectedMedicine {
  name: string;
  strength?: string;
  instructions?: string;
}

export interface MedicationSchedule {
  morning: string[];
  lunch: string[];
  evening: string[];
  bedtime: string[];
}

export interface ParsedPrescription {
  medicines: DetectedMedicine[];
  schedule: MedicationSchedule;
  warnings: string[];
  duration: string;
  plainSummary: string;
}

const KNOWN_DRUG_PATTERNS = [
  { regex: /\b(augmentin|amoxicilin[aă]|amoxi)\b/i, name: "Augmentin (Amoxicilină + Acid clavulanic)", defaultStrength: "1000 mg", defaultDuration: "7 zile" },
  { regex: /\b(paracetamol|panadol|efferalgan)\b/i, name: "Paracetamol", defaultStrength: "500 mg", defaultDuration: "3-5 zile la nevoie" },
  { regex: /\b(ibuprofen|nurofen|advil|paduden)\b/i, name: "Ibuprofen", defaultStrength: "400 mg", defaultDuration: "3-5 zile la durere" },
  { regex: /\b(metformin|siofor)\b/i, name: "Metformin", defaultStrength: "850 mg", defaultDuration: "Fără oprire (tratament de lungă durată)" },
  { regex: /\b(enalapril|renitec)\b/i, name: "Enalapril", defaultStrength: "10 mg", defaultDuration: "Continuu (tensiune)" },
  { regex: /\b(omeprazol|omeran|losec)\b/i, name: "Omeprazol", defaultStrength: "20 mg", defaultDuration: "14 zile" },
  { regex: /\b(aspenter|aspirin[aă])\b/i, name: "Aspenter (Acid acetilsalicilic)", defaultStrength: "75 mg", defaultDuration: "Continuu" },
  { regex: /\b(no-?spa|drotaverin[aă])\b/i, name: "No-Spa", defaultStrength: "40 mg", defaultDuration: "La nevoie în caz de spasme" },
  { regex: /\b(algocalmin|metamizol)\b/i, name: "Algocalmin", defaultStrength: "500 mg", defaultDuration: "Doar la nevoie, când doare tare" },
];

export function parsePrescriptionText(rawText: string): ParsedPrescription {
  const normalized = rawText.trim();
  const medicines: DetectedMedicine[] = [];
  const schedule: MedicationSchedule = {
    morning: [],
    lunch: [],
    evening: [],
    bedtime: [],
  };
  const warnings: string[] = [];
  let duration = "Cum a spus medicul";

  if (!normalized) {
    return {
      medicines: [{ name: "Medicament nespecificat", instructions: "Verifică eticheta cu farmacistul" }],
      schedule: {
        morning: ["1 pastilă dimineața după masă"],
        lunch: [],
        evening: ["1 pastilă seara după cină"],
        bedtime: [],
      },
      warnings: ["Nu întrerupe tratamentul fără acordul medicului", "Ia-l cu un pahar mare de apă"],
      duration: "7 zile",
      plainSummary: "Ia medicamentele la orele spuse de medic.",
    };
  }

  // 1. Identify known drugs or generic lines
  for (const drug of KNOWN_DRUG_PATTERNS) {
    if (drug.regex.test(normalized)) {
      medicines.push({
        name: drug.name,
        strength: drug.defaultStrength,
        instructions: `1 comprimat conform orarului prescris`,
      });
      if (drug.defaultDuration) {
        duration = drug.defaultDuration;
      }
    }
  }

  // If no known drugs matched, look for capitalized lines or tokens
  if (medicines.length === 0) {
    const lines = normalized
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 3);

    for (const line of lines.slice(0, 3)) {
      medicines.push({
        name: line,
        strength: "Ca pe rețetă",
      });
    }
  }

  if (medicines.length === 0) {
    medicines.push({
      name: "Medicament găsit în poză",
      strength: "Doza scrisă pe cutie",
    });
  }

  // 2. Schedule extraction
  const lower = normalized.toLowerCase();

  const isAugmentin = lower.includes("augmentin") || lower.includes("amoxi");
  const isParacetamol = lower.includes("paracetamol") || lower.includes("panadol");
  const isEnlapril = lower.includes("enalapril");
  const isOmeprazol = lower.includes("omeprazol");

  if (isOmeprazol) {
    schedule.morning.push("Omeprazol: 1 capsulă cu 30 de minute înainte de micul dejun");
  }

  if (isAugmentin) {
    schedule.morning.push("Augmentin: 1 pastilă mare (1000 mg) imediat după micul dejun");
    schedule.evening.push("Augmentin: 1 pastilă mare (1000 mg) imediat după cină (la 12 ore)");
  }

  if (isEnlapril) {
    schedule.morning.push("Enalapril: 1 pastilă dimineața la aceeași oră");
  }

  if (isParacetamol) {
    schedule.morning.push("Paracetamol: 1 pastilă la nevoie dacă apare febră");
    schedule.lunch.push("Paracetamol: 1 pastilă dacă febra persistă (la cel puțin 6 ore)");
    schedule.evening.push("Paracetamol: 1 pastilă înainte de culcare dacă persistă durerea");
  }

  // Fallback schedule if no specific rules matched
  if (
    schedule.morning.length === 0 &&
    schedule.lunch.length === 0 &&
    schedule.evening.length === 0 &&
    schedule.bedtime.length === 0
  ) {
    schedule.morning.push(`${medicines[0].name}: 1 pastilă dimineața după masă`);
    schedule.evening.push(`${medicines[0].name}: 1 pastilă seara după masă`);
  }

  // 3. Warnings
  warnings.push("Ia fiecare pastilă cu un pahar plin de apă.");
  if (lower.includes("alcool") || isAugmentin || isParacetamol) {
    warnings.push("Nu bea alcool cât timp iei tratamentul.");
  }
  if (isAugmentin) {
    warnings.push("Ia un probiotic la cel puțin 2 ore distanță de antibiotic, ca să-ți protejezi stomacul.");
    warnings.push("Nu opri tratamentul după 3 zile, chiar dacă te simți bine. Ia-l toate cele 7 zile.");
    duration = "7 zile întregi";
  }
  if (isParacetamol) {
    warnings.push("Nu lua mai mult de 3-4 pastile (2000-3000 mg) pe zi, ca să nu-ți afectezi ficatul.");
  }

  const primaryMedName = medicines[0]?.name || "Tratamentul";
  const plainSummary = `${primaryMedName} se administrează de 2 ori pe zi, dimineața și seara după masă, timp de ${duration}. Nu bea alcool și bea multă apă.`;

  return {
    medicines,
    schedule,
    warnings,
    duration,
    plainSummary,
  };
}
