const ANTHROPIC_URL = "https://api.anthropic.com";
const DEFAULT_MODEL = "claude-haiku-4-5-20251001";
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
  api: "anthropic";
  baseUrl: string;
  apiKey: string;
  usesRelayAuth: false;
};

function readEnv(name: string): string {
  return process.env[name]?.trim().replace(/^["']|["']$/g, "") || "";
}

export function resolveLlmConfig(): LlmConfig {
  const model = readEnv("ANTHROPIC_MODEL") || DEFAULT_MODEL;
  const apiKey = readEnv("ANTHROPIC_API_KEY");
  if (!apiKey) throw new LlmError("not-configured", "ANTHROPIC_API_KEY is missing.");
  if (!model.startsWith("claude-")) throw new LlmError("not-configured", "ANTHROPIC_MODEL must be a Claude model ID.");
  // Legacy relay variables must never redirect an Anthropic key or assistant request.
  return { model, api: "anthropic", baseUrl: ANTHROPIC_URL, apiKey, usesRelayAuth: false };
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
      "x-api-key": config.apiKey,
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

/** Sends one prompt to the configured model and returns its text. Always rejects with an LlmError. */
export async function generateText(request: LlmRequest): Promise<{ text: string; model: string }> {
  const config = resolveLlmConfig();
  let text: string | undefined;
  try {
    text = await requestAnthropic(config, request);
  } catch (error) {
    if (error instanceof LlmError) throw error;
    throw new LlmError("bad-response", "The AI provider returned an unreadable response.");
  }

  if (!text) {
    throw new LlmError("bad-response", "The AI provider returned no text.");
  }
  return { text, model: config.model };
}
