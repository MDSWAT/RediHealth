import { NextResponse } from "next/server";
import {
  buildEmergencyResponse,
  buildSystemInstruction,
  buildUserText,
  parseAssistantReply,
  urgentPattern,
} from "@/lib/health-assistant";
import { DEFAULT_LANG, isSupportedLang } from "@/lib/i18n/routing";
import { LlmError, generateText } from "@/lib/llm";
import { notifyOperationalIssue } from "@/lib/operational-alerts";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

type AssistantRequest = {
  symptoms?: unknown;
  history?: unknown;
  lang?: unknown;
  prescriptionContext?: unknown;
  prescription?: { mimeType?: unknown; data?: unknown };
};

const MAX_TEXT_LENGTH = 4_000;
const MAX_HISTORY_ITEMS = 12;
const MAX_HISTORY_ITEM_LENGTH = 1_000;
// Base64 of an 8 MB image.
const MAX_IMAGE_DATA_LENGTH = 11_200_000;

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
        { error: "The AI assistant has reached its request limit. Please try again in a few minutes." },
        { status: 429 },
      );
    case "not-configured":
    case "unauthorized":
      return NextResponse.json(
        { error: "The AI assistant is not available right now. Please contact support." },
        { status: 503 },
      );
    case "bad-response":
      return NextResponse.json(
        { error: "The AI assistant returned an unreadable response. Please try again." },
        { status: 502 },
      );
    default:
      return NextResponse.json(
        { error: "The AI assistant is temporarily unavailable. Please try again shortly." },
        { status: 502 },
      );
  }
}

export async function POST(request: Request) {
  const rateLimit = await checkRateLimit(`health-assistant:${getClientIp(request)}`, { limit: 10, windowMs: 60_000 });
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment and try again." },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } },
    );
  }

  let body: AssistantRequest;
  try {
    body = (await request.json()) as AssistantRequest;
  } catch {
    return NextResponse.json({ error: "Invalid request body. Please send valid JSON." }, { status: 400 });
  }

  const symptoms = typeof body.symptoms === "string" ? body.symptoms.trim() : "";
  const lang = typeof body.lang === "string" && isSupportedLang(body.lang) ? body.lang : DEFAULT_LANG;
  const prescriptionContext = typeof body.prescriptionContext === "string" ? body.prescriptionContext.trim() : "";
  const imageData = typeof body.prescription?.data === "string" ? body.prescription.data : "";
  const imageMimeType = typeof body.prescription?.mimeType === "string" ? body.prescription.mimeType : "";

  if (imageData && (!/^image\/(jpeg|png|webp)$/.test(imageMimeType) || imageData.length > MAX_IMAGE_DATA_LENGTH)) {
    return NextResponse.json({ error: "Choose a JPEG, PNG, or WebP image smaller than 8 MB." }, { status: 400 });
  }

  if (!symptoms && !imageData) {
    return NextResponse.json({ error: "Please describe symptoms or upload a prescription image." }, { status: 400 });
  }

  if (symptoms.length > MAX_TEXT_LENGTH || prescriptionContext.length > MAX_TEXT_LENGTH) {
    return NextResponse.json({ error: "Please shorten your message." }, { status: 400 });
  }

  if (urgentPattern.test(symptoms)) {
    return NextResponse.json(buildEmergencyResponse(lang));
  }

  let generated: { text: string; model: string };
  try {
    generated = await generateText({
      system: buildSystemInstruction(lang),
      text: buildUserText({ symptoms, history: parseHistory(body.history), prescriptionContext }),
      image: imageData ? { mimeType: imageMimeType, data: imageData } : undefined,
    });
  } catch (error) {
    if (!(error instanceof LlmError)) throw error;
    console.error("AI assistant request failed", error.kind, error.status ?? "", error.providerCode ?? "");
    alertProviderFailure(error);
    return failureResponse(error);
  }

  try {
    return NextResponse.json(parseAssistantReply(generated.text, lang));
  } catch {
    console.error("AI assistant returned a reply that is not valid JSON");
    alertProviderFailure(new LlmError("bad-response", "The AI provider returned a reply that could not be parsed."));
    return failureResponse(new LlmError("bad-response", "unreadable"));
  }
}
