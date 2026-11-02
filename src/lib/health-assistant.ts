import type { Lang } from "@/lib/i18n/translations";

export type AssistantResponse = {
  urgency: "emergency" | "routine";
  careLevel: "emergency" | "urgent" | "soon" | "routine";
  possibleCause: string;
  message: string;
  questions: string[];
  prescriptionText?: string;
};

export const urgentPattern =
  /chest pain|difficulty breathing|shortness of breath|unconscious|fainting|seizure|stroke|face droop|severe bleeding|suicid|overdose/i;

const responseLanguageLabel: Record<Lang, string> = {
  en: "English",
  ro: "Romanian",
  sq: "Albanian",
  it: "Italian",
};

const emergencyResponseByLang: Record<Lang, { possibleCause: string; message: string }> = {
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
};

const defaultPossibleCauseByLang: Record<Lang, string> = {
  en: "There is not enough information yet to suggest a possible cause.",
  ro: "Nu exista inca suficiente informatii pentru a sugera o cauza posibila.",
  sq: "Nuk ka ende informacion te mjaftueshem per te sugjeruar nje shkak te mundshem.",
  it: "Non ci sono ancora informazioni sufficienti per suggerire una possibile causa.",
};

const defaultMessageByLang: Record<Lang, string> = {
  en: "Please share this information with a healthcare professional.",
  ro: "Te rugam sa impartasesti aceste informatii cu un profesionist medical.",
  sq: "Te lutem ndaj kete informacion me nje profesionist shendetesor.",
  it: "Condividi queste informazioni con un professionista sanitario.",
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
  return `You are RediHealth's patient-intake assistant. Give a useful preliminary assessment, but never state a diagnosis as fact, prescribe, recommend medication changes, or state that a medicine is safe. For every response, identify one most plausible possible cause using wording such as "This could be consistent with...". If the information is too limited, say what information is needed rather than inventing a cause. Set careLevel to "emergency", "urgent", "soon", or "routine". Emergency means call 112 or visit emergency care immediately; urgent means same-day clinical assessment; soon means contact a clinician within 24-48 hours; routine means monitor and arrange non-urgent care if symptoms continue. Identify possible emergency red flags and tell the patient to call 112 or visit emergency care immediately. Use calm, plain language. If an image is supplied, transcribe only legible prescription text. Mark uncertain words with [unclear]. Never infer missing medicine names, strengths, or directions. IMPORTANT: Write all patient-facing text fields (possibleCause, message, and questions) in ${responseLanguageLabel[lang]}. Return only valid JSON with urgency ("emergency" or "routine"), careLevel, possibleCause, message, questions (array), and prescriptionText (string, optional).`;
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

/** Parses the model output into a safe response, throwing when it is not JSON at all. */
export function parseAssistantReply(raw: string, lang: Lang): AssistantResponse {
  const generated = JSON.parse(normalizeJsonPayload(raw)) as Partial<AssistantResponse>;

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
  };
}
