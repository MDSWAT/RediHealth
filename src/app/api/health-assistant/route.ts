import { NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const urgentPattern = /chest pain|difficulty breathing|shortness of breath|unconscious|fainting|seizure|stroke|face droop|severe bleeding|suicid|overdose/i;

type AssistantRequest = {
  symptoms?: unknown;
  history?: unknown;
  prescriptionContext?: unknown;
  prescription?: { mimeType?: unknown; data?: unknown };
};

type AssistantResponse = {
  urgency: "emergency" | "routine";
  careLevel: "emergency" | "urgent" | "soon" | "routine";
  possibleCause: string;
  message: string;
  questions: string[];
  prescriptionText?: string;
};

const systemInstruction = `You are RediHealth's patient-intake assistant. Give a useful preliminary assessment, but never state a diagnosis as fact, prescribe, recommend medication changes, or state that a medicine is safe. For every response, identify one most plausible possible cause using wording such as "This could be consistent with...". If the information is too limited, say what information is needed rather than inventing a cause. Set careLevel to "emergency", "urgent", "soon", or "routine". Emergency means call 112 or visit emergency care immediately; urgent means same-day clinical assessment; soon means contact a clinician within 24-48 hours; routine means monitor and arrange non-urgent care if symptoms continue. Identify possible emergency red flags and tell the patient to call 112 or visit emergency care immediately. Use calm, plain language. If an image is supplied, transcribe only legible prescription text. Mark uncertain words with [unclear]. Never infer missing medicine names, strengths, or directions. Return only valid JSON with urgency ("emergency" or "routine"), careLevel, possibleCause, message, questions (array), and prescriptionText (string, optional).`;

export async function POST(request: Request) {
  const rateLimit = checkRateLimit(`health-assistant:${getClientIp(request)}`, { limit: 10, windowMs: 60_000 });
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment and try again." },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } },
    );
  }

  const body = await request.json() as AssistantRequest;
  const symptoms = typeof body.symptoms === "string" ? body.symptoms.trim() : "";
  const history = Array.isArray(body.history)
    ? body.history.slice(-12).flatMap((item) => {
        if (!item || typeof item !== "object") return [];
        const message = item as { role?: unknown; content?: unknown };
        return (message.role === "assistant" || message.role === "user") && typeof message.content === "string"
          ? [`${message.role}: ${message.content.slice(0, 1_000)}`]
          : [];
      })
    : [];
  const prescriptionContext = typeof body.prescriptionContext === "string" ? body.prescriptionContext.trim() : "";
  const imageData = typeof body.prescription?.data === "string" ? body.prescription.data : "";
  const imageMimeType = typeof body.prescription?.mimeType === "string" ? body.prescription.mimeType : "";

  if (imageData && (!/^image\/(jpeg|png|webp)$/.test(imageMimeType) || imageData.length > 11_200_000)) {
    return NextResponse.json({ error: "Choose a JPEG, PNG, or WebP image smaller than 8 MB." }, { status: 400 });
  }

  if (!symptoms && !imageData) {
    return NextResponse.json({ error: "Please describe symptoms or upload a prescription image." }, { status: 400 });
  }

  if (symptoms.length > 4_000 || prescriptionContext.length > 4_000) {
    return NextResponse.json({ error: "Please shorten your message." }, { status: 400 });
  }

  if (urgentPattern.test(symptoms)) {
    return NextResponse.json({
      urgency: "emergency",
      careLevel: "emergency",
      possibleCause: "These symptoms can be caused by serious conditions that need emergency assessment.",
      message: "Your symptoms may need emergency assessment. Call 112 now or go to the nearest emergency department. Do not wait for an online response.",
      questions: [],
    });
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "The AI assistant is not configured yet. Add OPENROUTER_API_KEY to .env.local." }, { status: 503 });
  }

  const content: Array<{ type: "text"; text: string } | { type: "image_url"; image_url: { url: string } }> = [{
    type: "text",
    text: `Current message: ${symptoms || "Not provided"}\nConversation history:\n${history.join("\n") || "Not provided"}\nWhy the prescription was given: ${prescriptionContext || "Not provided"}`,
  }];
  if (imageData) {
    content.push({ type: "image_url", image_url: { url: `data:${imageMimeType};base64,${imageData}` } });
  }

  const model = process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini";
  const openRouterResponse = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.AUTH_URL || "http://localhost:3000",
        "X-Title": "RediHealth",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemInstruction },
          { role: "user", content },
        ],
        response_format: { type: "json_object" },
        temperature: 0.2,
        max_tokens: 600,
      }),
    },
  );

  if (!openRouterResponse.ok) {
    const errorBody = await openRouterResponse.text().catch(() => "");
    console.error("OpenRouter health assistant request failed", openRouterResponse.status, errorBody.slice(0, 500));
    if (openRouterResponse.status === 429) {
      return NextResponse.json({ error: "The AI assistant has reached its request limit. Please try again in a few minutes." }, { status: 429 });
    }
    if (openRouterResponse.status === 401 || openRouterResponse.status === 403) {
      return NextResponse.json({ error: "The AI assistant is misconfigured. Please contact support." }, { status: 503 });
    }
    return NextResponse.json({ error: "The AI assistant is temporarily unavailable. Please try again shortly." }, { status: 502 });
  }

  const openRouterData = await openRouterResponse.json() as { choices?: Array<{ message?: { content?: string } }> };
  const generatedText = openRouterData.choices?.[0]?.message?.content;
  if (!generatedText) {
    return NextResponse.json({ error: "The AI assistant did not return a response. Please try again." }, { status: 502 });
  }

  try {
    const generated = JSON.parse(generatedText) as Partial<AssistantResponse>;
    const response: AssistantResponse = {
      urgency: generated.urgency === "emergency" ? "emergency" : "routine",
      careLevel: generated.careLevel === "emergency" || generated.careLevel === "urgent" || generated.careLevel === "soon" ? generated.careLevel : "routine",
      possibleCause: typeof generated.possibleCause === "string" ? generated.possibleCause : "There is not enough information yet to suggest a possible cause.",
      message: typeof generated.message === "string" ? generated.message : "Please share this information with a healthcare professional.",
      questions: Array.isArray(generated.questions) ? generated.questions.filter((question): question is string => typeof question === "string").slice(0, 3) : [],
      prescriptionText: typeof generated.prescriptionText === "string" ? generated.prescriptionText : undefined,
    };
    return NextResponse.json(response);
  } catch {
    return NextResponse.json({ error: "The AI assistant returned an unreadable response. Please try again." }, { status: 502 });
  }
}