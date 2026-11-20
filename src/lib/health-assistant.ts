import type { Lang } from "@/lib/i18n/translations";

export type DocumentSourceKind = "prescription" | "medication_box" | "mixed" | "unreadable";

export type PrescribedMedicineItem = {
  name: string;
  activeIngredient?: string;
  form?: string;
  strength?: string;
  purpose?: string;
  morning?: string;
  midday?: string;
  evening?: string;
  bedtime?: string;
  foodTiming?: "before_meal" | "with_meal" | "after_meal" | "any";
  duration?: string;
  warnings?: string[];
  sideEffects?: string[];
  benefitTimeline?: string;
  stoppingGuidance?: string;
  unclear?: boolean;
  confidence?: number;
};

export type AssistantResponse = {
  urgency: "emergency" | "routine";
  careLevel: "emergency" | "urgent" | "soon" | "routine";
  possibleCause: string;
  message: string;
  questions: string[];
  sourceKind?: DocumentSourceKind;
  confidenceScore?: number;
  confidenceReason?: string;
  prescriptionText?: string;
  medicines?: PrescribedMedicineItem[];
  /**
   * Typed-name lookups only: false when the typed text could not be identified as a medicine.
   * Never trust a missing flag from the model: it is derived from whether a named medicine came back.
   */
  recognized?: boolean;
};

export const urgentPattern =
  /chest pain|difficulty breathing|shortness of breath|unconscious|fainting|seizure|stroke|face droop|severe bleeding|suicid|overdose|bol u prsima|pritisak u prsima|teško dišem|tesko disem|nedostatak zraka|zaduha|gušenje|gusenje|moždani udar|mozdani udar|bez svijesti|nesvjestica|jako krvarenje|napadaj|predoziranj|dukh and-o kolin|dukh ando kolin|dukh ko kolin|nashti phurdav|phari phurdinimos|perav tele|bi godjako|baro rat|rat thabdel|chest pain|difficulty breathing|shortness of breath|unconscious|fainting|seizure|stroke|face droop|severe bleeding|suicid|overdose|боль\s+в\s+груди|трудно\s+дышать|затрудн[её]нное\s+дыхание|одышка|без\s+сознания|обморок|судорог|инсульт|перекос\s+лица|сильное\s+кровотечение|суицид|передозиров/i;

const responseLanguageLabel: Record<Lang, string> = {
  ru: "Russian",

  en: "English",
  ro: "Romanian",
  sq: "Albanian",
  it: "Italian",
  hr: "Croatian",
  rom: "Common Romani (Romanes, Latin script)",
};

const emergencyResponseByLang: Record<Lang, { possibleCause: string; message: string }> = {
  ru: {
    possibleCause: "Эти симптомы могут быть вызваны серьезными состояниями, требующими неотложной оценки.",
    message: "Ваши симптомы могут потребовать неотложной оценки. Позвоните по номеру 112 прямо сейчас или обратитесь в ближайшее отделение неотложной помощи. Не ждите ответа онлайн.",
  },

  en: {
    possibleCause: "These symptoms can be caused by serious conditions that need emergency assessment.",
    message: "Your symptoms may need emergency assessment. Call 112 now or go to the nearest emergency department. Do not wait for an online response.",
  },
  ro: {
    possibleCause: "Aceste simptome pot fi cauzate de afectiuni grave care necesita evaluare de urgenta.",
    message: "Simptomele tale pot necesita evaluare de urgenta. Suna acum la 112 sau mergi la cel mai apropiat serviciu de urgente. Nu astepta un raspuns online.",
  },
  sq: {
    possibleCause: "Keto simptoma mund te shkaktohen nga gjendje serioze qe kerkojne vleresim urgjent.",
    message: "Simptomat e tua mund te kerkojne vleresim urgjent. Telefono 112 tani ose shko ne urgjencen me te afert. Mos prit per nje pergjigje online.",
  },
  it: {
    possibleCause: "Questi sintomi possono essere causati da condizioni gravi che richiedono una valutazione urgente.",
    message: "I tuoi sintomi potrebbero richiedere una valutazione urgente. Chiama subito il 112 o vai al pronto soccorso piu vicino. Non aspettare una risposta online.",
  },
  hr: {
    possibleCause: "Ovi simptomi mogu biti uzrokovani ozbiljnim stanjima koja zahtijevaju hitnu medicinsku procjenu.",
    message: "Tvoji simptomi mogu zahtijevati hitnu medicinsku procjenu. Odmah nazovi 112 ili otiđi na najbliži hitni bolnički prijem. Nemoj čekati odgovor putem interneta.",
  },
  rom: {
    possibleCause: "Kadala simptome shaj aven katar phare nasvalimata so mangen sigardiari kontrola.",
    message: "Chire simptome shaj mangen sigardiari kontrola. Akhar 112 akana vaj dja ko maj pashutno sigardiari ki bolnitsa. Ma azhuker online anglalipnaske.",
  },
};

const defaultPossibleCauseByLang: Record<Lang, string> = {
  ru: "Пока недостаточно информации, чтобы предположить возможную причину.",

  en: "There is not enough information yet to suggest a possible cause.",
  ro: "Nu exista inca suficiente informatii pentru a sugera o cauza posibila.",
  sq: "Nuk ka ende informacion te mjaftueshem per te sugjeruar nje shkak te mundshem.",
  it: "Non ci sono ancora informazioni sufficienti per suggerire una possibile causa.",
  hr: "Još nema dovoljno podataka za procjenu mogućeg uzroka.",
  rom: "Inke na-i dosta informacia te phenas soske shaj avel kadava.",
};

const defaultMessageByLang: Record<Lang, string> = {
  ru: "Пожалуйста, поделитесь этой информацией с медицинским работником.",

  en: "Please share this information with a healthcare professional.",
  ro: "Te rugam sa impartasesti aceste informatii cu un profesionist medical.",
  sq: "Te lutem ndaj kete informacion me nje profesionist shendetesor.",
  it: "Condividi queste informazioni con un professionista sanitario.",
  hr: "Podijeli ove informacije sa zdravstvenim radnikom.",
  rom: "Mangav tut, sikav kadaja informacia jekhe doktoreske vaj sastipnaske bucarneske.",
};

export function buildEmergencyResponse(lang: Lang): AssistantResponse {
  const copy = emergencyResponseByLang[lang];
  return {
    urgency: "emergency",
    careLevel: "emergency",
    possibleCause: copy.possibleCause,
    message: copy.message,
    questions: [],
  };
}

export function buildSystemInstruction(lang: Lang) {
  return `You are RediHealth's patient-intake assistant. Give a useful preliminary assessment, but never state a diagnosis as fact, prescribe, recommend medication changes, or state that a medicine is safe. For every response, identify one most plausible possible cause using wording such as "This could be consistent with...". If the information is too limited, say what information is needed rather than inventing a cause. Set careLevel to "emergency", "urgent", "soon", or "routine". Emergency means call 112 or visit emergency care immediately; urgent means same-day clinical assessment; soon means contact a clinician within 24-48 hours; routine means monitor and arrange non-urgent care if symptoms continue. Identify possible emergency red flags and tell the patient to call 112 or visit emergency care immediately. Use calm, plain language. If an image is supplied, transcribe only legible prescription text. Mark uncertain words with [unclear]. Never infer missing medicine names, strengths, or directions. When a prescription image is supplied, in addition to prescriptionText and plain-language message, populate medicines as an array of objects for each prescribed item with: name (string), optional strength (string, only if legible), optional purpose (short plain-language purpose in ${responseLanguageLabel[lang]}), optional morning, midday, evening, bedtime (short dose phrases in ${responseLanguageLabel[lang]} ONLY if explicitly written and legible on the prescription; omit morning, midday, evening, or bedtime whenever not clearly legible on the prescription and never invent or guess missing doses or times), optional foodTiming ("before_meal", "with_meal", "after_meal", or "any", only if written on the prescription), optional duration (only if written on the prescription), optional warnings (array of 1-2 short plain-language safety notes in ${responseLanguageLabel[lang]}), and optional unclear (true if any part of that medicine's name, strength, or dose was [unclear]). Always remind the patient to check with their pharmacist or doctor. IMPORTANT: Write all patient-facing text fields (possibleCause, message, questions, and medicines descriptions) in ${responseLanguageLabel[lang]}. Return only valid JSON with urgency ("emergency" or "routine"), careLevel, possibleCause, message, questions (array), prescriptionText (string, optional), and medicines (array, optional).`;
}

export function buildVisionSystemInstruction(lang: Lang) {
  const language = responseLanguageLabel[lang];
  return `You are RediHealth's medical prescription and medication packaging reader. You read photos of BOTH:
1. Medical prescriptions ("recipes", e-prescriptions, CNAS forms, pharmacy slips, and handwritten doctor notes with markings like Rp., DS, 1-0-1, 2x1/zi, compr., cps.) -> set sourceKind to "prescription".
2. Medication boxes, outer retail cartons, blister packs, bottle labels, and pharmacy stickers (recognizing common and psychiatric or contraceptive medicines such as Paracetamol/Panadol/Efferalgan, Ibuprofen/Nurofen/Paduden, Augmentin/Amoxicillin, Metformin/Siofor, Enalapril/Renitec, Omeprazol/Omeran, Aspenter/Aspirin, No-Spa/Drotaverine, Algocalmin/Metamizole, antidepressants/SSRIs such as Sertraline/Zoloft, Escitalopram/Cipralex, Fluoxetine, anxiolytics, antipsychotics, mood stabilizers, combined or progestogen-only contraceptive pills, emergency contraception, antibiotics, stomach medicines, blood pressure medicines, and cold syrups from the printed brand name, active ingredient/INN, dosage strength, and form) -> set sourceKind to "medication_box".
3. Combined photos showing both a prescription and medication boxes -> set sourceKind to "mixed".
4. Blurry, blank, cropped, or unrelated non-medical photos where no medicine or prescription text can be verified -> set sourceKind to "unreadable".

Safety and extraction rules:
- Never diagnose as fact, prescribe, recommend treatment changes, or guarantee safety. Always remind the patient to check with their pharmacist or doctor.
- Set urgency to "emergency" or "routine", and careLevel to "emergency", "urgent", "soon", or "routine". Use cautious wording in possibleCause if context was provided, or state briefly what the prescription or medicine box is commonly used for.
- In prescriptionText, transcribe legible text visible on the prescription or medicine packaging verbatim. Mark any illegible word with [unclear]. Never invent missing names, strengths, or personal dosing directions.
- Populate medicines as an array of objects for every recognized prescribed item or medication box with:
  - name (string: brand or generic name as written)
  - activeIngredient (optional string in ${language}: active substance / INN printed on the box or prescription, or the standard INN for an unambiguously identified brand box)
  - form (optional string in ${language}: pharmaceutical form if visible, such as tablets, capsules, oral suspension)
  - strength (optional string: ONLY if legible, e.g. "400 mg", "875 mg / 125 mg")
  - purpose (optional string in ${language}: short plain-language description of what this medicine is commonly used for)
  - morning, midday, evening, bedtime (optional short dose phrases in ${language}: ONLY include if explicitly written and legible on a prescription or on a personal pharmacy label stuck to the box; OMIT these fields for standard retail boxes without personal instructions and NEVER invent or guess doses)
  - foodTiming (optional: "before_meal", "with_meal", "after_meal", or "any", ONLY if written)
  - duration (optional string in ${language}: ONLY if written)
  - warnings (optional array of 1-2 short plain-language safety notes in ${language})
  - sideEffects (optional array of 1-3 short plain-language common side effects or urgent reactions to watch for in ${language})
  - benefitTimeline (optional string in ${language}: when the medicine usually starts helping, e.g. quickly for painkillers or 2 to 6 weeks of steady use for antidepressants)
  - stoppingGuidance (optional string in ${language}: safe rules for stopping or missed doses, especially warning never to stop antidepressants, anxiolytics, antipsychotics, mood stabilizers, blood pressure medicines, or insulin abruptly without talking to a doctor, plus safe handling of missed contraceptive pills)
  - unclear (optional boolean: true if any part of that medicine's name, strength, or dose was [unclear])
  - confidence (integer 0-100 for that specific item)
- Provide calibrated confidenceScore (integer 0-100) and confidenceReason (1 short plain-language sentence in ${language} explaining why reading accuracy is 100% or what lowered confidence, such as handwriting, glare, angle, or a box lacking personal prescription instructions):
  - 100 ONLY when every relevant character of medicine name, strength, and visible instructions is crisp, unobstructed, and completely unambiguous with zero [unclear] tokens.
  - 85-99 for clear printed prescriptions or sharp medicine boxes with minor glare, crop, or angle on secondary text.
  - 60-84 when angled, handwritten, or missing secondary details.
  - 25-59 when medicine name, strength, or dose contains [unclear].
  - 0-24 when unreadable or not a medical document or box.
- Write all patient-facing text fields (possibleCause, message, questions, confidenceReason, and medicines descriptions) in ${language} using calm plain language, sentence casing, and no "&" character.
- Return ONLY valid JSON with urgency, careLevel, possibleCause, message, questions (array), sourceKind, confidenceScore, confidenceReason, prescriptionText, and medicines (array).`;
}

export function buildMedicineLookupSystemInstruction(lang: Lang) {
  const language = responseLanguageLabel[lang];
  return `You are RediHealth's plain-language medicine information assistant. A patient typed the name of a medicine (by brand or active substance) and optional context why they take it. Give accurate, calm, non-judgmental patient education across general medicines, painkillers, antibiotics, chronic-condition treatments, psychiatric medicines (antidepressants such as SSRIs/SNRIs, anxiolytics, antipsychotics, mood stabilizers), and contraceptive medicines (daily pills, progestogen-only pills, emergency contraception, patches/rings).

Safety and output rules:
- Never diagnose as fact, prescribe, recommend starting or changing a personal dose, or state that a medicine is safe without medical review. Always remind the patient to check with their pharmacist or doctor before changing treatment.
- Never invent personal dosing schedules: OMIT morning, midday, evening, bedtime, and personal duration unless clearly standard general context (better to leave personal slot fields omitted because no written prescription was uploaded).
- Set urgency to "emergency" ONLY if the patient's message describes overdose, self-harm, severe allergic reaction, chest pain, or other emergency signs; otherwise set urgency to "routine" and careLevel to "routine".
- Set recognized (boolean). Set it to true only when you can identify the typed text, with confidence, as one real medicine (a brand name or an active substance). An obvious misspelling of exactly one known medicine still counts: set recognized to true and write the correct medicine name in name. If the typed text is not a medicine, is too vague, or could be several different medicines, set recognized to false, return medicines as an empty array, and use message to say in one short sentence that the name was not recognized. Never guess and never describe a different medicine than the one typed.
- When recognized is true, populate medicines with 1 object for the named medicine containing:
  - name (string: medicine name in clear capitalization)
  - activeIngredient (optional string in ${language}: active substance / INN)
  - form (optional string in ${language}: common form such as tablets or capsules)
  - purpose (string in ${language}: what this medicine is commonly used for, using plain non-stigmatizing words)
  - foodTiming (optional: "before_meal", "with_meal", "after_meal", or "any" if standard)
  - warnings (optional array of 1-3 short key safety warnings in ${language}, including urgent warning signs that require calling a doctor or 112)
  - sideEffects (optional array of 1-4 short plain-language common side effects in ${language}, e.g. mild nausea, drowsiness, dry mouth, headache, or irregular spotting for contraception)
  - benefitTimeline (string in ${language}: clear realistic timeline of when it usually starts to help — for example within an hour for pain relievers, 2 to 6 weeks of steady daily use for antidepressants, or when contraceptive protection begins)
  - stoppingGuidance (string in ${language}: essential guidance on stopping and missed doses — for psychiatric medicines such as antidepressants, anxiolytics, antipsychotics, and mood stabilizers, clearly explain NEVER to stop abruptly without talking to a doctor because sudden stopping can cause uncomfortable discontinuation symptoms or return of illness; for contraceptives, explain what to do if a pill is missed or if vomiting occurs and how to protect against unplanned pregnancy; for antibiotics, explain finishing the prescribed course)
- Write possibleCause and message in warm plain ${language} with sentence casing and no "&" character. Never claim photo reading or invent confidenceScore. Return ONLY valid JSON with urgency, careLevel, possibleCause, message, questions (array), recognized (boolean), and medicines (array).`;
}

export function buildMedicineLookupUserText({
  medicineName,
  prescriptionContext,
}: {
  medicineName: string;
  prescriptionContext: string;
}) {
  return `Task: Explain the typed medicine in plain patient language.\nMedicine name: ${medicineName || "Not provided"}\nReason selected or note: ${prescriptionContext || "Not provided"}`;
}

export function buildUserText({
  symptoms,
  history,
  prescriptionContext,
}: {
  symptoms: string;
  history: string[];
  prescriptionContext: string;
}) {
  return `Current message: ${symptoms || "Not provided"}\nConversation history:\n${history.join("\n") || "Not provided"}\nWhy the prescription was given: ${prescriptionContext || "Not provided"}`;
}

export function buildVisionUserText({
  symptoms,
  history,
  prescriptionContext,
}: {
  symptoms: string;
  history: string[];
  prescriptionContext: string;
}) {
  return `Task: Read the attached prescription or medication box photo.\nReason selected for this medicine or prescription: ${prescriptionContext || "Not provided"}\nPatient note: ${symptoms || "Not provided"}\nConversation history:\n${history.join("\n") || "Not provided"}`;
}

/** Models sometimes wrap the JSON in a code fence or add prose around it. */
export function normalizeJsonPayload(raw: string): string {
  const trimmed = raw.trim();
  const fencedMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fencedMatch?.[1]) {
    return fencedMatch[1].trim();
  }

  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    return trimmed.slice(firstBrace, lastBrace + 1);
  }

  return trimmed;
}

const UNCLEAR_TEXT_REGEX =
  /\[(?:unclear|illegible|unreadable|neclar|indescifrabil|illeggibile|non chiaro|e paqartë|paqartë|nečitko|nejasno|na uzi|неразборчиво|неясно|\?{2,})\]/i;

function clampOptionalString(value: unknown, maxLength: number): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim().slice(0, maxLength).trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function clampScore(value: unknown): number | undefined {
  if (typeof value !== "number" || !Number.isFinite(value)) return undefined;
  return Math.round(Math.min(100, Math.max(0, value)));
}

function parseSourceKind(value: unknown): DocumentSourceKind | undefined {
  if (value === "prescription" || value === "medication_box" || value === "mixed" || value === "unreadable") {
    return value;
  }
  return undefined;
}

function isValidFoodTiming(value: unknown): value is NonNullable<PrescribedMedicineItem["foodTiming"]> {
  return value === "before_meal" || value === "with_meal" || value === "after_meal" || value === "any";
}

function hasUnclearInMedicine(med: PrescribedMedicineItem): boolean {
  return Boolean(
    med.unclear ||
      UNCLEAR_TEXT_REGEX.test(med.name) ||
      (med.activeIngredient && UNCLEAR_TEXT_REGEX.test(med.activeIngredient)) ||
      (med.form && UNCLEAR_TEXT_REGEX.test(med.form)) ||
      (med.strength && UNCLEAR_TEXT_REGEX.test(med.strength)) ||
      (med.purpose && UNCLEAR_TEXT_REGEX.test(med.purpose)) ||
      (med.morning && UNCLEAR_TEXT_REGEX.test(med.morning)) ||
      (med.midday && UNCLEAR_TEXT_REGEX.test(med.midday)) ||
      (med.evening && UNCLEAR_TEXT_REGEX.test(med.evening)) ||
      (med.bedtime && UNCLEAR_TEXT_REGEX.test(med.bedtime)) ||
      (med.duration && UNCLEAR_TEXT_REGEX.test(med.duration)) ||
      med.warnings?.some((warning) => UNCLEAR_TEXT_REGEX.test(warning)) ||
      med.sideEffects?.some((effect) => UNCLEAR_TEXT_REGEX.test(effect)) ||
      (med.benefitTimeline && UNCLEAR_TEXT_REGEX.test(med.benefitTimeline)) ||
      (med.stoppingGuidance && UNCLEAR_TEXT_REGEX.test(med.stoppingGuidance)),
  );
}

function sanitizePrescribedMedicines(rawMedicines: unknown): PrescribedMedicineItem[] | undefined {
  if (!Array.isArray(rawMedicines)) return undefined;

  const parsed: PrescribedMedicineItem[] = [];
  for (const item of rawMedicines) {
    if (parsed.length >= 12) break;
    if (typeof item !== "object" || item === null) continue;

    const record = item as Record<string, unknown>;
    const name = clampOptionalString(record.name, 160);
    if (!name) continue;

    const activeIngredient = clampOptionalString(record.activeIngredient, 120);
    const form = clampOptionalString(record.form, 80);
    const strength = clampOptionalString(record.strength, 80);
    const purpose = clampOptionalString(record.purpose, 240);
    const morning = clampOptionalString(record.morning, 120);
    const midday = clampOptionalString(record.midday, 120);
    const evening = clampOptionalString(record.evening, 120);
    const bedtime = clampOptionalString(record.bedtime, 120);
    const foodTiming = isValidFoodTiming(record.foodTiming) ? record.foodTiming : undefined;
    const duration = clampOptionalString(record.duration, 120);
    const warnings = Array.isArray(record.warnings)
      ? record.warnings
          .map((warning) => clampOptionalString(warning, 200))
          .filter((warning): warning is string => Boolean(warning))
          .slice(0, 4)
      : undefined;
    const sideEffects = Array.isArray(record.sideEffects)
      ? record.sideEffects
          .map((effect) => clampOptionalString(effect, 160))
          .filter((effect): effect is string => Boolean(effect))
          .slice(0, 4)
      : undefined;
    const benefitTimeline = clampOptionalString(record.benefitTimeline, 240);
    const stoppingGuidance = clampOptionalString(record.stoppingGuidance, 320);
    const unclear = typeof record.unclear === "boolean" ? record.unclear : undefined;

    const candidate: PrescribedMedicineItem = {
      name,
      ...(activeIngredient ? { activeIngredient } : {}),
      ...(form ? { form } : {}),
      ...(strength ? { strength } : {}),
      ...(purpose ? { purpose } : {}),
      ...(morning ? { morning } : {}),
      ...(midday ? { midday } : {}),
      ...(evening ? { evening } : {}),
      ...(bedtime ? { bedtime } : {}),
      ...(foodTiming ? { foodTiming } : {}),
      ...(duration ? { duration } : {}),
      ...(warnings && warnings.length > 0 ? { warnings } : {}),
      ...(sideEffects && sideEffects.length > 0 ? { sideEffects } : {}),
      ...(benefitTimeline ? { benefitTimeline } : {}),
      ...(stoppingGuidance ? { stoppingGuidance } : {}),
      ...(unclear !== undefined ? { unclear } : {}),
    };

    const rawConfidence = clampScore(record.confidence);
    if (rawConfidence !== undefined) {
      candidate.confidence = hasUnclearInMedicine(candidate) ? Math.min(rawConfidence, 65) : rawConfidence;
    }

    parsed.push(candidate);
  }

  return parsed.length > 0 ? parsed : undefined;
}

/** Parses the model output into a safe response, throwing when it is not JSON at all. */
export function parseAssistantReply(
  raw: string,
  lang: Lang,
  options?: { hasImage?: boolean; isMedicineLookup?: boolean },
): AssistantResponse {
  const generated = JSON.parse(normalizeJsonPayload(raw)) as Omit<Partial<AssistantResponse>, "recognized"> & {
    medicines?: unknown;
    sourceKind?: unknown;
    confidenceScore?: unknown;
    confidenceReason?: unknown;
    recognized?: unknown;
  };
  const parsedMedicines = sanitizePrescribedMedicines(generated.medicines);
  // Typed-name lookups: an explicit "not recognized" wins, and a missing flag counts as recognized
  // only when a named medicine actually came back. A guess is never passed on as an answer.
  const recognized = options?.isMedicineLookup
    ? generated.recognized !== false && Boolean(parsedMedicines?.length)
    : undefined;
  const medicines = recognized === false ? undefined : parsedMedicines;
  const message = typeof generated.message === "string" ? generated.message : defaultMessageByLang[lang];
  const prescriptionText = typeof generated.prescriptionText === "string" ? generated.prescriptionText : undefined;
  const sourceKind = options?.isMedicineLookup ? undefined : parseSourceKind(generated.sourceKind);
  const confidenceReason = options?.isMedicineLookup ? undefined : clampOptionalString(generated.confidenceReason, 240);

  const anyUnclearText =
    Boolean(medicines?.some((med) => hasUnclearInMedicine(med))) ||
    UNCLEAR_TEXT_REGEX.test(prescriptionText ?? "") ||
    UNCLEAR_TEXT_REGEX.test(message);

  const rawConfidenceScore = clampScore(generated.confidenceScore);
  let confidenceScore: number | undefined;
  if (!options?.isMedicineLookup && (rawConfidenceScore !== undefined || options?.hasImage)) {
    let fallbackScore = 12;
    if (medicines && medicines.length > 0) {
      const itemScores = medicines
        .map((med) => med.confidence)
        .filter((score): score is number => typeof score === "number");
      fallbackScore =
        itemScores.length > 0
          ? Math.round(itemScores.reduce((sum, score) => sum + score, 0) / itemScores.length)
          : anyUnclearText
            ? 62
            : 90;
    } else if (prescriptionText && prescriptionText.trim().length > 0) {
      fallbackScore = anyUnclearText ? 38 : 45;
    }

    let calibrated = rawConfidenceScore ?? fallbackScore;
    if (
      sourceKind === "unreadable" ||
      (options?.hasImage && !medicines?.length && !(prescriptionText && prescriptionText.trim().length > 0))
    ) {
      calibrated = Math.min(calibrated, 20);
    } else if (anyUnclearText) {
      calibrated = Math.min(calibrated, 79);
    }
    confidenceScore = calibrated;
  }

  return {
    urgency: generated.urgency === "emergency" ? "emergency" : "routine",
    careLevel:
      generated.careLevel === "emergency" || generated.careLevel === "urgent" || generated.careLevel === "soon"
        ? generated.careLevel
        : "routine",
    possibleCause: typeof generated.possibleCause === "string" ? generated.possibleCause : defaultPossibleCauseByLang[lang],
    message,
    questions: Array.isArray(generated.questions)
      ? generated.questions.filter((question): question is string => typeof question === "string").slice(0, 3)
      : [],
    ...(sourceKind ? { sourceKind } : {}),
    ...(confidenceScore !== undefined ? { confidenceScore } : {}),
    ...(confidenceReason ? { confidenceReason } : {}),
    prescriptionText,
    ...(medicines ? { medicines } : {}),
    ...(recognized !== undefined ? { recognized } : {}),
  };
}
