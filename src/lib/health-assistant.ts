import type { Lang } from "@/lib/i18n/translations";

export type PrescribedMedicineItem = {
  name: string;
  strength?: string;
  purpose?: string;
  morning?: string;
  midday?: string;
  evening?: string;
  bedtime?: string;
  foodTiming?: "before_meal" | "with_meal" | "after_meal" | "any";
  duration?: string;
  warnings?: string[];
  unclear?: boolean;
};

export type AssistantResponse = {
  urgency: "emergency" | "routine";
  careLevel: "emergency" | "urgent" | "soon" | "routine";
  possibleCause: string;
  message: string;
  questions: string[];
  prescriptionText?: string;
  medicines?: PrescribedMedicineItem[];
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

function clampOptionalString(value: unknown, maxLength: number): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim().slice(0, maxLength).trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function isValidFoodTiming(value: unknown): value is NonNullable<PrescribedMedicineItem["foodTiming"]> {
  return value === "before_meal" || value === "with_meal" || value === "after_meal" || value === "any";
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
    const unclear = typeof record.unclear === "boolean" ? record.unclear : undefined;

    parsed.push({
      name,
      ...(strength ? { strength } : {}),
      ...(purpose ? { purpose } : {}),
      ...(morning ? { morning } : {}),
      ...(midday ? { midday } : {}),
      ...(evening ? { evening } : {}),
      ...(bedtime ? { bedtime } : {}),
      ...(foodTiming ? { foodTiming } : {}),
      ...(duration ? { duration } : {}),
      ...(warnings && warnings.length > 0 ? { warnings } : {}),
      ...(unclear !== undefined ? { unclear } : {}),
    });
  }

  return parsed.length > 0 ? parsed : undefined;
}

/** Parses the model output into a safe response, throwing when it is not JSON at all. */
export function parseAssistantReply(raw: string, lang: Lang): AssistantResponse {
  const generated = JSON.parse(normalizeJsonPayload(raw)) as Partial<AssistantResponse> & {
    medicines?: unknown;
  };
  const medicines = sanitizePrescribedMedicines(generated.medicines);

  return {
    urgency: generated.urgency === "emergency" ? "emergency" : "routine",
    careLevel:
      generated.careLevel === "emergency" || generated.careLevel === "urgent" || generated.careLevel === "soon"
        ? generated.careLevel
        : "routine",
    possibleCause: typeof generated.possibleCause === "string" ? generated.possibleCause : defaultPossibleCauseByLang[lang],
    message: typeof generated.message === "string" ? generated.message : defaultMessageByLang[lang],
    questions: Array.isArray(generated.questions)
      ? generated.questions.filter((question): question is string => typeof question === "string").slice(0, 3)
      : [],
    prescriptionText: typeof generated.prescriptionText === "string" ? generated.prescriptionText : undefined,
    ...(medicines ? { medicines } : {}),
  };
}
