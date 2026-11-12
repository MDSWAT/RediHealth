import { resolveLlmConfig } from "../../src/lib/llm";

export class EditorialProviderError extends Error {
  constructor(readonly status: number, message: string) { super(message); }
}

// Offline editorial jobs can take longer than interactive assistant requests.
// Keep their timeout and model choice local to this CLI, not the live site.
export async function authorText(system: string, text: string, maxTokens: number) {
  const config = resolveLlmConfig();
  if (config.api !== "anthropic") throw new Error("The editorial CLI currently requires an Anthropic-compatible configured model.");
  const response = await fetch(`${config.baseUrl}/v1/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "anthropic-version": "2023-06-01",
      ...(config.usesRelayAuth ? { Authorization: `Bearer ${config.apiKey}` } : { "x-api-key": config.apiKey }) },
    body: JSON.stringify({ model: config.model, max_tokens: maxTokens, temperature: 0.2, system, messages: [{ role: "user", content: [{ type: "text", text }] }] }),
    signal: AbortSignal.timeout(100_000),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({})) as { error?: { code?: string; type?: string; message?: string } };
    const detail = error.error?.message?.replaceAll(config.apiKey, "[redacted]").slice(0, 180);
    throw new EditorialProviderError(response.status, `Editorial provider HTTP ${response.status}${detail ? `: ${detail}` : ""}`);
  }
  const result = await response.json() as { content?: { type: string; text?: string }[]; stop_reason?: string };
  if (result.stop_reason === "max_tokens") throw new Error("Editorial response truncated");
  const output = result.content?.find(item => item.type === "text")?.text;
  if (!output) throw new Error("Editorial response missing text");
  return output;
}
