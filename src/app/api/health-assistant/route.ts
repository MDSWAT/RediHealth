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

type ResponsesApiResponse = {
  output_text?: string;
  output?: Array<{ content?: Array<{ type?: string; text?: string }> }>;
};

type ChatCompletionsApiResponse = {
  choices?: Array<{ message?: { content?: string } }>;
};

type AnthropicMessagesApiResponse = {
  content?: Array<{ type?: string; text?: string }>;
};

type RelayErrorResponse = {
  error?: {
    code?: string;
    message?: string;
    type?: string;
  };
  type?: string;
};

function extractGeneratedText(payload: ResponsesApiResponse): string | undefined {
  if (typeof payload.output_text === "string" && payload.output_text.trim()) {
    return payload.output_text;
  }

  for (const outputItem of payload.output ?? []) {
    for (const contentItem of outputItem.content ?? []) {
      if (typeof contentItem.text === "string" && contentItem.text.trim()) {
        return contentItem.text;
      }
    }
  }

  return undefined;
}

function parseRelayError(raw: string): { code?: string; message?: string } {
  try {
    const parsed = JSON.parse(raw) as RelayErrorResponse;
    return {
      code: parsed.error?.code,
      message: parsed.error?.message,
    };
  } catch {
    return {};
  }
}

function normalizeJsonPayload(raw: string): string {
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

const systemInstruction = `You are RediHealth's patient-intake assistant. Give a useful preliminary assessment, but never state a diagnosis as fact, prescribe, recommend medication changes, or state that a medicine is safe. For every response, identify one most plausible possible cause using wording such as "This could be consistent with...". If the information is too limited, say what information is needed rather than inventing a cause. Set careLevel to "emergency", "urgent", "soon", or "routine". Emergency means call 112 or visit emergency care immediately; urgent means same-day clinical assessment; soon means contact a clinician within 24-48 hours; routine means monitor and arrange non-urgent care if symptoms continue. Identify possible emergency red flags and tell the patient to call 112 or visit emergency care immediately. Use calm, plain language. If an image is supplied, transcribe only legible prescription text. Mark uncertain words with [unclear]. Never infer missing medicine names, strengths, or directions. Return only valid JSON with urgency ("emergency" or "routine"), careLevel, possibleCause, message, questions (array), and prescriptionText (string, optional).`;

export async function POST(request: Request) {
  const rateLimit = checkRateLimit(`health-assistant:${getClientIp(request)}`, { limit: 10, windowMs: 60_000 });
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment and try again." },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } },
    );
  }

  let body: AssistantRequest;
  try {
    body = await request.json() as AssistantRequest;
  } catch {
    return NextResponse.json({ error: "Invalid request body. Please send valid JSON." }, { status: 400 });
  }
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

  const apiKey =
    process.env.ANTHROPIC_API_KEY?.trim().replace(/^["']|["']$/g, "")
    || process.env.LLMSRELAY_API_KEY?.trim().replace(/^["']|["']$/g, "");
  if (!apiKey) {
    return NextResponse.json({ error: "The AI assistant is not configured yet. Add ANTHROPIC_API_KEY or LLMSRELAY_API_KEY to .env.local." }, { status: 503 });
  }

  const content: Array<{ type: "input_text"; text: string } | { type: "input_image"; image_url: string }> = [{
    type: "input_text",
    text: `Current message: ${symptoms || "Not provided"}\nConversation history:\n${history.join("\n") || "Not provided"}\nWhy the prescription was given: ${prescriptionContext || "Not provided"}`,
  }];
  if (imageData) {
    content.push({ type: "input_image", image_url: `data:${imageMimeType};base64,${imageData}` });
  }

  const chatCompletionsContent: Array<{ type: "text"; text: string } | { type: "image_url"; image_url: { url: string } }> = [{
    type: "text",
    text: `Current message: ${symptoms || "Not provided"}\nConversation history:\n${history.join("\n") || "Not provided"}\nWhy the prescription was given: ${prescriptionContext || "Not provided"}`,
  }];
  if (imageData) {
    chatCompletionsContent.push({ type: "image_url", image_url: { url: `data:${imageMimeType};base64,${imageData}` } });
  }

  const model = process.env.LLMSRELAY_MODEL?.trim().replace(/^["']|["']$/g, "")
    || process.env.ANTHROPIC_MODEL?.trim().replace(/^["']|["']$/g, "")
    || "claude-haiku-4.5";
  const anthropicBaseUrl = process.env.ANTHROPIC_BASE_URL?.trim().replace(/\/$/, "") || "https://api.llmsrelay.com";

  const requestText = `Current message: ${symptoms || "Not provided"}\nConversation history:\n${history.join("\n") || "Not provided"}\nWhy the prescription was given: ${prescriptionContext || "Not provided"}`;
  let generatedText: string | undefined;

  if (model.startsWith("claude-")) {
    const anthropicContent: Array<
      { type: "text"; text: string }
      | { type: "image"; source: { type: "base64"; media_type: string; data: string } }
    > = [{ type: "text", text: requestText }];
    if (imageData) {
      anthropicContent.push({
        type: "image",
        source: {
          type: "base64",
          media_type: imageMimeType,
          data: imageData,
        },
      });
    }

    const anthropicResponse = await fetch(
      `${anthropicBaseUrl}/v1/messages`,
      {
        method: "POST",
        headers: {
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          max_tokens: 600,
          temperature: 0.2,
          system: systemInstruction,
          messages: [{ role: "user", content: anthropicContent }],
        }),
      },
    );

    if (!anthropicResponse.ok) {
      const errorBody = await anthropicResponse.text().catch(() => "");
      const relayError = parseRelayError(errorBody);
      console.error("LLMsRelay Claude messages request failed", anthropicResponse.status, errorBody.slice(0, 500));
      if (anthropicResponse.status === 429) {
        return NextResponse.json({ error: "The AI assistant has reached its request limit. Please try again in a few minutes." }, { status: 429 });
      }
      if (anthropicResponse.status === 401 || anthropicResponse.status === 403) {
        return NextResponse.json({ error: "The AI assistant is misconfigured. Please contact support." }, { status: 503 });
      }
      if (anthropicResponse.status === 400 && /temporarily unavailable/i.test(relayError.message || "")) {
        return NextResponse.json({ error: "The AI provider is temporarily unavailable. Please try again shortly." }, { status: 503 });
      }
      return NextResponse.json({ error: "The AI assistant is temporarily unavailable. Please try again shortly." }, { status: 502 });
    } else {
      const anthropicData = await anthropicResponse.json() as AnthropicMessagesApiResponse;
      generatedText = anthropicData.content?.find((item) => item.type === "text" && typeof item.text === "string")?.text;
    }
  }

  if (!generatedText && !model.startsWith("claude-")) {
    const relayResponse = await fetch(
      "https://api.llmsrelay.com/v1/responses",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          input: [
            {
              role: "system",
              content: [{ type: "input_text", text: systemInstruction }],
            },
            {
              role: "user",
              content,
            },
          ],
          text: { format: { type: "json_object" } },
          temperature: 0.2,
          max_output_tokens: 600,
        }),
      },
    );

    if (relayResponse.ok) {
      const relayData = await relayResponse.json() as ResponsesApiResponse;
      generatedText = extractGeneratedText(relayData);
    } else if (relayResponse.status === 404) {
      const errorBody = await relayResponse.text().catch(() => "");
      console.warn("LLMsRelay /v1/responses unavailable, retrying with /v1/chat/completions", errorBody.slice(0, 500));

      const fallbackResponse = await fetch(
        "https://api.llmsrelay.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: "system", content: systemInstruction },
              { role: "user", content: chatCompletionsContent },
            ],
            response_format: { type: "json_object" },
            temperature: 0.2,
            max_tokens: 600,
          }),
        },
      );

      if (!fallbackResponse.ok) {
        const fallbackErrorBody = await fallbackResponse.text().catch(() => "");
        console.error("LLMsRelay health assistant fallback failed", fallbackResponse.status, fallbackErrorBody.slice(0, 500));
        if (fallbackResponse.status === 429) {
          return NextResponse.json({ error: "The AI assistant has reached its request limit. Please try again in a few minutes." }, { status: 429 });
        }
        if (fallbackResponse.status === 401 || fallbackResponse.status === 403) {
          return NextResponse.json({ error: "The AI assistant is misconfigured. Please contact support." }, { status: 503 });
        }
        return NextResponse.json({ error: "The AI assistant is temporarily unavailable. Please try again shortly." }, { status: 502 });
      }

      const fallbackData = await fallbackResponse.json() as ChatCompletionsApiResponse;
      generatedText = fallbackData.choices?.[0]?.message?.content;
    } else {
      const errorBody = await relayResponse.text().catch(() => "");
      const relayError = parseRelayError(errorBody);
      console.error("LLMsRelay health assistant request failed", relayResponse.status, errorBody.slice(0, 500));
      if (relayResponse.status === 429) {
        return NextResponse.json({ error: "The AI assistant has reached its request limit. Please try again in a few minutes." }, { status: 429 });
      }
      if (relayResponse.status === 401 || relayResponse.status === 403) {
        return NextResponse.json({ error: "The AI assistant is misconfigured. Please contact support." }, { status: 503 });
      }
      if (relayResponse.status === 400 && /temporarily unavailable/i.test(relayError.message || "")) {
        return NextResponse.json({ error: "The AI provider is temporarily unavailable. Please try again shortly." }, { status: 503 });
      }
      return NextResponse.json({ error: "The AI assistant is temporarily unavailable. Please try again shortly." }, { status: 502 });
    }
  }

  if (!generatedText) {
    return NextResponse.json({ error: "The AI assistant did not return a response. Please try again." }, { status: 502 });
  }

  try {
    const generated = JSON.parse(normalizeJsonPayload(generatedText)) as Partial<AssistantResponse>;
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