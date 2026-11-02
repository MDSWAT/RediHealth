const DEFAULT_RELAY_URL = "https://api.llmsrelay.com";
const DEFAULT_MODEL = "claude-haiku-4.5";
const REQUEST_TIMEOUT_MS = 30_000;

export type LlmFailureKind = "not-configured" | "rate-limited" | "unauthorized" | "unavailable" | "bad-response";

export class LlmError extends Error {
  readonly kind: LlmFailureKind;
  readonly status?: number;
  readonly providerCode?: string;
  readonly providerMessage?: string;

  constructor(
    kind: LlmFailureKind,
    message: string,
    details: { status?: number; providerCode?: string; providerMessage?: string } = {},
  ) {
    super(message);
    this.name = "LlmError";
    this.kind = kind;
    this.status = details.status;
    this.providerCode = details.providerCode;
    this.providerMessage = details.providerMessage;
  }
}

export type LlmRequest = {
  system: string;
  text: string;
  image?: { mimeType: string; data: string };
  maxTokens?: number;
};

type LlmConfig = {
  model: string;
  /** Anthropic Messages API (Claude models) or the relay's OpenAI-style endpoints. */
  api: "anthropic" | "relay";
  baseUrl: string;
  apiKey: string;
  usesRelayAuth: boolean;
};

function readEnv(name: string): string {
  return process.env[name]?.trim().replace(/^["']|["']$/g, "") || "";
}

export function resolveLlmConfig(): LlmConfig {
  const model = readEnv("LLMSRELAY_MODEL") || readEnv("ANTHROPIC_MODEL") || DEFAULT_MODEL;
  const relayKey = readEnv("LLMSRELAY_API_KEY");
  const anthropicKey = readEnv("ANTHROPIC_API_KEY");

  if (model.startsWith("claude-")) {
    const baseUrl = (readEnv("ANTHROPIC_BASE_URL") || DEFAULT_RELAY_URL).replace(/\/$/, "");
    let hostname: string;
    try {
      hostname = new URL(baseUrl).hostname.toLowerCase();
    } catch {
      throw new LlmError("not-configured", "ANTHROPIC_BASE_URL is not a valid URL.");
    }

    const usesRelayAuth = hostname === new URL(DEFAULT_RELAY_URL).hostname;
    const apiKey = usesRelayAuth ? relayKey : anthropicKey;
    if (!apiKey) {
      throw new LlmError("not-configured", usesRelayAuth ? "LLMSRELAY_API_KEY is missing." : "ANTHROPIC_API_KEY is missing.");
    }
    return { model, api: "anthropic", baseUrl, apiKey, usesRelayAuth };
  }

  const apiKey = relayKey || anthropicKey;
  if (!apiKey) {
    throw new LlmError("not-configured", "LLMSRELAY_API_KEY is missing.");
  }
  return {
    model,
    api: "relay",
    baseUrl: (readEnv("LLMSRELAY_BASE_URL") || DEFAULT_RELAY_URL).replace(/\/$/, ""),
    apiKey,
    usesRelayAuth: true,
  };
}

async function failureFromResponse(response: Response): Promise<LlmError> {
  const body = await response.text().catch(() => "");
  let providerCode: string | undefined;
  let providerMessage: string | undefined;
  try {
    const parsed = JSON.parse(body) as { error?: { code?: string; message?: string } };
    providerCode = parsed.error?.code;
    providerMessage = parsed.error?.message?.slice(0, 240);
  } catch {
    // Not a JSON error body; the status code alone has to do.
  }

  const details = { status: response.status, providerCode, providerMessage };
  if (response.status === 429) return new LlmError("rate-limited", "The AI provider rate limit was reached.", details);
  if (response.status === 401 || response.status === 403) {
    return new LlmError("unauthorized", "The AI provider rejected the credentials.", details);
  }
  return new LlmError("unavailable", `The AI provider returned ${response.status}.`, details);
}

async function post(url: string, headers: Record<string, string>, payload: unknown): Promise<Response> {
  try {
    return await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (error) {
    const timedOut = error instanceof DOMException && error.name === "TimeoutError";
    throw new LlmError("unavailable", timedOut ? "The AI provider timed out." : "The AI provider could not be reached.");
  }
}

async function requestAnthropic(config: LlmConfig, request: LlmRequest): Promise<string | undefined> {
  const content: unknown[] = [{ type: "text", text: request.text }];
  if (request.image) {
    content.push({
      type: "image",
      source: { type: "base64", media_type: request.image.mimeType, data: request.image.data },
    });
  }

  const response = await post(
    `${config.baseUrl}/v1/messages`,
    {
      ...(config.usesRelayAuth ? { Authorization: `Bearer ${config.apiKey}` } : { "x-api-key": config.apiKey }),
      "anthropic-version": "2023-06-01",
    },
    {
      model: config.model,
      max_tokens: request.maxTokens ?? 600,
      temperature: 0.2,
      system: request.system,
      messages: [{ role: "user", content }],
    },
  );
  if (!response.ok) throw await failureFromResponse(response);

  const data = (await response.json()) as { content?: Array<{ type?: string; text?: string }> };
  return data.content?.find((item) => item.type === "text" && typeof item.text === "string")?.text;
}

function textFromResponsesPayload(payload: {
  output_text?: string;
  output?: Array<{ content?: Array<{ text?: string }> }>;
}): string | undefined {
  if (typeof payload.output_text === "string" && payload.output_text.trim()) {
    return payload.output_text;
  }
  for (const item of payload.output ?? []) {
    for (const part of item.content ?? []) {
      if (typeof part.text === "string" && part.text.trim()) return part.text;
    }
  }
  return undefined;
}

async function requestRelay(config: LlmConfig, request: LlmRequest): Promise<string | undefined> {
  const headers = { Authorization: `Bearer ${config.apiKey}` };
  const imageUrl = request.image ? `data:${request.image.mimeType};base64,${request.image.data}` : null;
  const maxTokens = request.maxTokens ?? 600;

  const response = await post(`${config.baseUrl}/v1/responses`, headers, {
    model: config.model,
    input: [
      { role: "system", content: [{ type: "input_text", text: request.system }] },
      {
        role: "user",
        content: [
          { type: "input_text", text: request.text },
          ...(imageUrl ? [{ type: "input_image", image_url: imageUrl }] : []),
        ],
      },
    ],
    text: { format: { type: "json_object" } },
    temperature: 0.2,
    max_output_tokens: maxTokens,
  });

  if (response.ok) {
    return textFromResponsesPayload((await response.json()) as Parameters<typeof textFromResponsesPayload>[0]);
  }
  if (response.status !== 404) throw await failureFromResponse(response);

  // Some relay models only expose the chat completions endpoint.
  const fallback = await post(`${config.baseUrl}/v1/chat/completions`, headers, {
    model: config.model,
    messages: [
      { role: "system", content: request.system },
      {
        role: "user",
        content: [
          { type: "text", text: request.text },
          ...(imageUrl ? [{ type: "image_url", image_url: { url: imageUrl } }] : []),
        ],
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.2,
    max_tokens: maxTokens,
  });
  if (!fallback.ok) throw await failureFromResponse(fallback);

  const data = (await fallback.json()) as { choices?: Array<{ message?: { content?: string } }> };
  return data.choices?.[0]?.message?.content;
}

/** Sends one prompt to the configured model and returns its text. Always rejects with an LlmError. */
export async function generateText(request: LlmRequest): Promise<{ text: string; model: string }> {
  const config = resolveLlmConfig();
  let text: string | undefined;
  try {
    text = config.api === "anthropic" ? await requestAnthropic(config, request) : await requestRelay(config, request);
  } catch (error) {
    if (error instanceof LlmError) throw error;
    throw new LlmError("bad-response", "The AI provider returned an unreadable response.");
  }

  if (!text) {
    throw new LlmError("bad-response", "The AI provider returned no text.");
  }
  return { text, model: config.model };
}
