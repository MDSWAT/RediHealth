import { NextResponse } from "next/server";
import {
  buildEmergencyResponse,
  buildSystemInstruction,
  buildUserText,
  buildVisionSystemInstruction,
  buildVisionUserText,
  parseAssistantReply,
} from "@/lib/health-assistant";
import { detectEmergencyText } from "@/lib/emergency-detection";
import { DEFAULT_LANG, isSupportedLang } from "@/lib/i18n/routing";
import { LlmError, generateText } from "@/lib/llm";
import { notifyOperationalIssue } from "@/lib/operational-alerts";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { verifyRecaptcha } from "@/lib/security/recaptcha";

type AssistantRequest = {
  symptoms?: unknown;
  history?: unknown;
  lang?: unknown;
  prescriptionContext?: unknown;
  prescription?: { mimeType?: unknown; data?: unknown };
  captchaToken?: unknown;
};

const MAX_TEXT_LENGTH = 4_000;
const MAX_HISTORY_ITEMS = 12;
const MAX_HISTORY_ITEM_LENGTH = 1_000;
// Base64 safely under Anthropic's 5 MB image cap and Vercel's 4.5 MB request body limit.
const MAX_IMAGE_DATA_LENGTH = 5_000_000;

function parseHistory(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  return value.slice(-MAX_HISTORY_ITEMS).flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const { role, content } = item as { role?: unknown; content?: unknown };
    return (role === "assistant" || role === "user") && typeof content === "string"
      ? [`${role}: ${content.slice(0, MAX_HISTORY_ITEM_LENGTH)}`]
      : [];
  });
}

function alertProviderFailure(error: LlmError) {
  const configurationProblem = error.kind === "not-configured" || error.kind === "unauthorized";
  void notifyOperationalIssue({
    key: `ai:${error.kind}:${error.status ?? ""}`,
    title: configurationProblem ? "AI assistant misconfigured" : "AI assistant provider error",
    summary: error.message,
    source: "/api/health-assistant",
    severity: configurationProblem || (error.status ?? 0) >= 500 ? "critical" : "warning",
    details: {
      kind: error.kind,
      status: error.status ?? "",
      providerCode: error.providerCode ?? "",
      providerMessage: error.providerMessage ?? "",
    },
    cooldownMs: 15 * 60_000,
  });
}

function failureResponse(error: LlmError) {
  switch (error.kind) {
    case "rate-limited":
      return NextResponse.json(
        { error: "The assistant is busy. Try again in a few minutes.", code: error.kind },
        { status: 429 },
      );
    case "not-configured":
    case "unauthorized":
      return NextResponse.json(
        { error: "The assistant is not available right now. Contact us if this keeps happening.", code: error.kind },
        { status: 503 },
      );
    case "bad-response":
      return NextResponse.json(
        { error: "The assistant gave an answer we could not read. Try again.", code: error.kind },
        { status: 502 },
      );
    default:
      return NextResponse.json(
        { error: "The assistant is not working right now. Try again in a few minutes.", code: error.kind },
        { status: 502 },
      );
  }
}

export async function POST(request: Request) {
  const rateLimit = await checkRateLimit(`health-assistant:${getClientIp(request)}`, { limit: 10, windowMs: 60_000 });
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Wait a moment and try again." },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } },
    );
  }

  let body: AssistantRequest;
  try {
    body = (await request.json()) as AssistantRequest;
  } catch {
    return NextResponse.json({ error: "Invalid request body. Please send valid JSON." }, { status: 400 });
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  const captchaError = await verifyRecaptcha(body.captchaToken, "health_assistant");
  if (captchaError) return captchaError;

  const symptoms = typeof body.symptoms === "string" ? body.symptoms.trim() : "";
  const lang = typeof body.lang === "string" && isSupportedLang(body.lang) ? body.lang : DEFAULT_LANG;
  const prescriptionContext = typeof body.prescriptionContext === "string" ? body.prescriptionContext.trim() : "";
  const imageData = typeof body.prescription?.data === "string" ? body.prescription.data : "";
  const imageMimeType = typeof body.prescription?.mimeType === "string" ? body.prescription.mimeType : "";

  if (imageData && (!/^image\/(jpeg|png|webp)$/.test(imageMimeType) || imageData.length > MAX_IMAGE_DATA_LENGTH)) {
    return NextResponse.json(
      { error: "Choose a clearer JPEG, PNG or WebP image under 4 MB.", code: "image-too-large" },
      { status: 400 },
    );
  }

  if (!symptoms && !imageData) {
    return NextResponse.json({ error: "Describe the symptoms or add a photo of the prescription." }, { status: 400 });
  }

  if (symptoms.length > MAX_TEXT_LENGTH || prescriptionContext.length > MAX_TEXT_LENGTH) {
    return NextResponse.json({ error: "Make your message shorter." }, { status: 400 });
  }

  // Checked before the LLM in every language, including text typed alongside a prescription photo.
  if (detectEmergencyText(symptoms) || detectEmergencyText(prescriptionContext)) {
    return NextResponse.json(buildEmergencyResponse(lang));
  }

  const hasImage = Boolean(imageData);
  const parsedHistory = parseHistory(body.history);

  let generated: { text: string; model: string };
  try {
    generated = await generateText({
      system: hasImage ? buildVisionSystemInstruction(lang) : buildSystemInstruction(lang),
      text: hasImage
        ? buildVisionUserText({ symptoms, history: parsedHistory, prescriptionContext })
        : buildUserText({ symptoms, history: parsedHistory, prescriptionContext }),
      image: hasImage ? { mimeType: imageMimeType, data: imageData } : undefined,
      maxTokens: hasImage ? 2048 : 900,
    });
  } catch (error) {
    if (!(error instanceof LlmError)) throw error;
    console.error("AI assistant request failed", error.kind, error.status ?? "", error.providerCode ?? "");
    alertProviderFailure(error);
    return failureResponse(error);
  }

  try {
    return NextResponse.json(parseAssistantReply(generated.text, lang, { hasImage }));
  } catch {
    console.error("AI assistant returned a reply that is not valid JSON");
    alertProviderFailure(new LlmError("bad-response", "The AI provider returned a reply that could not be parsed."));
    return failureResponse(new LlmError("bad-response", "unreadable"));
  }
}
