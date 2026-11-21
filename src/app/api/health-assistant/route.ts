import { NextResponse } from "next/server";
import {
  buildEmergencyResponse,
  buildMedicineLookupSystemInstruction,
  buildMedicineLookupUserText,
  buildOutOfScopeResponse,
  buildSystemInstruction,
  buildUserText,
  buildVisionSystemInstruction,
  buildVisionUserText,
  detectOffTopicRequest,
  parseAssistantReply,
} from "@/lib/health-assistant";
import { detectEmergencyText } from "@/lib/emergency-detection";
import { DEFAULT_LANG, isSupportedLang } from "@/lib/i18n/routing";
import { LlmError, estimateTokenCount, generateText } from "@/lib/llm";
import { notifyOperationalIssue } from "@/lib/operational-alerts";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import {
  getAiAccessStatus,
  recordAiAbuseEvent,
  recordAiTokenUsage,
  recordOffTopicStrike,
} from "@/lib/security/ai-assistant-guard";
import { evaluateAiMessageSafety } from "@/lib/security/ai-content-safety";
import { attachAiDeviceCookie, resolveAiDeviceIdentity } from "@/lib/security/device-id";
import { verifyRecaptcha } from "@/lib/security/recaptcha";

type AssistantRequest = {
  mode?: unknown;
  medicineName?: unknown;
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

export async function GET(request: Request) {
  const deviceIdentity = resolveAiDeviceIdentity(request);
  const ip = getClientIp(request);
  const status = await getAiAccessStatus({ deviceKeys: deviceIdentity.deviceKeys, ip });
  const response = NextResponse.json(
    {
      blocked: status.blocked,
      blockedUntil: status.blockedUntil,
      retryAfterSeconds: status.retryAfterSeconds,
      quota: status.quota,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
  return attachAiDeviceCookie(response, deviceIdentity);
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const rateLimit = await checkRateLimit(`health-assistant:${ip}`, { limit: 10, windowMs: 60_000 });
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

  const mode = body.mode === "medicine_lookup" ? "medicine_lookup" : undefined;
  const medicineName = typeof body.medicineName === "string" ? body.medicineName.trim() : "";
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

  const isMedicineLookup = mode === "medicine_lookup";

  if (isMedicineLookup && !medicineName) {
    return NextResponse.json({ error: "Enter the name of the medicine." }, { status: 400 });
  }

  if (!isMedicineLookup && !symptoms && !imageData) {
    return NextResponse.json({ error: "Describe the symptoms or add a photo of the prescription." }, { status: 400 });
  }

  if (
    medicineName.length > 240 ||
    symptoms.length > MAX_TEXT_LENGTH ||
    prescriptionContext.length > MAX_TEXT_LENGTH
  ) {
    return NextResponse.json({ error: "Make your message shorter." }, { status: 400 });
  }

  // Checked before the LLM and before lockouts in every language so emergency 112 guidance is never blocked.
  if (
    detectEmergencyText(medicineName) ||
    detectEmergencyText(symptoms) ||
    detectEmergencyText(prescriptionContext)
  ) {
    return NextResponse.json(buildEmergencyResponse(lang));
  }

  const deviceIdentity = resolveAiDeviceIdentity(request);
  const respondWithCookie = (response: NextResponse) => attachAiDeviceCookie(response, deviceIdentity);

  const accessStatus = await getAiAccessStatus({ deviceKeys: deviceIdentity.deviceKeys, ip });
  if (accessStatus.blocked) {
    return respondWithCookie(
      NextResponse.json(
        {
          error: "The AI assistant is disabled on this device for 72 hours due to abuse.",
          code: "device_blocked",
          blocked: true,
          blockedUntil: accessStatus.blockedUntil,
          retryAfterSeconds: accessStatus.retryAfterSeconds,
        },
        { status: 403, headers: { "Retry-After": String(accessStatus.retryAfterSeconds) } },
      ),
    );
  }

  const combinedText = [symptoms, medicineName, prescriptionContext].filter(Boolean).join("\n");
  const safety = evaluateAiMessageSafety(combinedText);
  if (safety.action === "block_immediately") {
    const abuseResult = await recordAiAbuseEvent({
      deviceKeys: deviceIdentity.deviceKeys,
      ip,
      immediateBlock: true,
      reason: safety.category,
    });
    return respondWithCookie(
      NextResponse.json(
        {
          error: "The AI assistant has been disabled on this device for 72 hours due to abusive content.",
          code: "device_blocked",
          interrupted: true,
          blocked: true,
          blockedUntil: abuseResult.blockedUntil,
          retryAfterSeconds: abuseResult.retryAfterSeconds,
        },
        { status: 403, headers: { "Retry-After": String(abuseResult.retryAfterSeconds) } },
      ),
    );
  }

  if (safety.action === "warn") {
    const abuseResult = await recordAiAbuseEvent({
      deviceKeys: deviceIdentity.deviceKeys,
      ip,
      immediateBlock: false,
      reason: safety.category,
    });
    if (abuseResult.blocked) {
      return respondWithCookie(
        NextResponse.json(
          {
            error: "The AI assistant has been disabled on this device for 72 hours due to repeated abuse.",
            code: "device_blocked",
            interrupted: true,
            blocked: true,
            blockedUntil: abuseResult.blockedUntil,
            retryAfterSeconds: abuseResult.retryAfterSeconds,
          },
          { status: 403, headers: { "Retry-After": String(abuseResult.retryAfterSeconds) } },
        ),
      );
    }
    return respondWithCookie(
      NextResponse.json(
        {
          error: "Please keep your message respectful and focused on health.",
          code: "abuse_warning",
          interrupted: true,
          strikesRemaining: abuseResult.strikesRemaining,
        },
        { status: 422 },
      ),
    );
  }

  if (accessStatus.quota.remaining <= 0) {
    return respondWithCookie(
      NextResponse.json(
        {
          error: "Daily AI assistant usage limit reached on this device.",
          code: "daily_token_limit",
          quota: accessStatus.quota,
          retryAfterSeconds: accessStatus.retryAfterSeconds,
        },
        { status: 429, headers: { "Retry-After": String(accessStatus.retryAfterSeconds) } },
      ),
    );
  }

  const hasImage = !isMedicineLookup && Boolean(imageData);

  // Deterministically block prompt injections and clearly off-topic chat requests before calling the LLM.
  if (!isMedicineLookup && !hasImage && detectOffTopicRequest(symptoms)) {
    const offTopicOutcome = await recordOffTopicStrike({ deviceKeys: deviceIdentity.deviceKeys, ip });
    if (offTopicOutcome.outcome === "blocked") {
      return respondWithCookie(
        NextResponse.json(
          {
            error: "The AI assistant has been disabled on this device for 72 hours due to repeated misuse.",
            code: "device_blocked",
            interrupted: true,
            blocked: true,
            blockedUntil: offTopicOutcome.blockedUntil,
            retryAfterSeconds: offTopicOutcome.retryAfterSeconds,
          },
          { status: 403, headers: { "Retry-After": String(offTopicOutcome.retryAfterSeconds) } },
        ),
      );
    }
    if (offTopicOutcome.outcome === "warn") {
      return respondWithCookie(
        NextResponse.json(
          {
            error: "Please keep your message focused on medical terms, symptoms, or RediHealth.",
            code: "abuse_warning",
            interrupted: true,
            strikesRemaining: offTopicOutcome.strikesRemaining,
          },
          { status: 422 },
        ),
      );
    }
    return respondWithCookie(NextResponse.json(buildOutOfScopeResponse(lang)));
  }

  const parsedHistory = parseHistory(body.history);
  const system = isMedicineLookup
    ? buildMedicineLookupSystemInstruction(lang)
    : hasImage
      ? buildVisionSystemInstruction(lang)
      : buildSystemInstruction(lang);
  const userText = isMedicineLookup
    ? buildMedicineLookupUserText({ medicineName, prescriptionContext })
    : hasImage
      ? buildVisionUserText({ symptoms, history: parsedHistory, prescriptionContext })
      : buildUserText({ symptoms, history: parsedHistory, prescriptionContext });

  let generated: { text: string; model: string; usage?: { inputTokens: number; outputTokens: number; totalTokens: number } };
  try {
    generated = await generateText({
      system,
      text: userText,
      image: hasImage ? { mimeType: imageMimeType, data: imageData } : undefined,
      maxTokens: hasImage || isMedicineLookup ? 2048 : 900,
    });
  } catch (error) {
    if (!(error instanceof LlmError)) throw error;
    console.error("AI assistant request failed", error.kind, error.status ?? "", error.providerCode ?? "");
    alertProviderFailure(error);
    return respondWithCookie(failureResponse(error));
  }

  const tokensUsed =
    generated.usage?.totalTokens ??
    estimateTokenCount(`${system}\n${userText}\n${generated.text}`, hasImage);
  const updatedQuota = await recordAiTokenUsage({
    deviceKeys: deviceIdentity.deviceKeys,
    ip,
    tokens: tokensUsed,
  });

  try {
    const parsed = parseAssistantReply(generated.text, lang, { hasImage, isMedicineLookup });
    if (parsed.outOfScope) {
      await recordOffTopicStrike({ deviceKeys: deviceIdentity.deviceKeys, ip });
    }
    return respondWithCookie(NextResponse.json({ ...parsed, quota: updatedQuota }));
  } catch {
    console.error("AI assistant returned a reply that is not valid JSON");
    alertProviderFailure(new LlmError("bad-response", "The AI provider returned a reply that could not be parsed."));
    return respondWithCookie(failureResponse(new LlmError("bad-response", "unreadable")));
  }
}
