import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LlmError, generateText } from "@/lib/llm";

const fetchMock = vi.fn();

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}

async function failure(promise: Promise<unknown>) {
  return promise.then(
    () => {
      throw new Error("expected the request to fail");
    },
    (error: unknown) => error as LlmError,
  );
}

describe("generateText", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
    vi.stubEnv("LLMSRELAY_API_KEY", "relay-key");
    vi.stubEnv("ANTHROPIC_API_KEY", "");
    vi.stubEnv("LLMSRELAY_MODEL", "");
    vi.stubEnv("ANTHROPIC_MODEL", "");
    vi.stubEnv("ANTHROPIC_BASE_URL", "");
    vi.stubEnv("LLMSRELAY_BASE_URL", "");
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("uses the Claude messages endpoint by default and passes the image along", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ content: [{ type: "text", text: "{\"ok\":true}" }] }));

    const result = await generateText({
      system: "system prompt",
      text: "hello",
      image: { mimeType: "image/png", data: "AAAA" },
    });

    expect(result).toEqual({ text: "{\"ok\":true}", model: "claude-haiku-4.5" });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://api.llmsrelay.com/v1/messages");
    expect(init.headers).toMatchObject({ Authorization: "Bearer relay-key", "anthropic-version": "2023-06-01" });
    expect(init.signal).toBeInstanceOf(AbortSignal);
    const payload = JSON.parse(init.body);
    expect(payload.system).toBe("system prompt");
    expect(payload.messages[0].content[1]).toMatchObject({ type: "image", source: { media_type: "image/png" } });
  });

  it("authenticates with x-api-key on a custom Anthropic endpoint", async () => {
    vi.stubEnv("ANTHROPIC_BASE_URL", "https://anthropic.example.com/");
    vi.stubEnv("ANTHROPIC_API_KEY", "anthropic-key");
    fetchMock.mockResolvedValue(jsonResponse({ content: [{ type: "text", text: "hi" }] }));

    await generateText({ system: "s", text: "t" });

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://anthropic.example.com/v1/messages");
    expect(init.headers).toMatchObject({ "x-api-key": "anthropic-key" });
    expect(init.headers).not.toHaveProperty("Authorization");
  });

  it("falls back to chat completions when a relay model has no responses endpoint", async () => {
    vi.stubEnv("LLMSRELAY_MODEL", "gpt-4o-mini");
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ error: { message: "not found" } }, 404))
      .mockResolvedValueOnce(jsonResponse({ choices: [{ message: { content: "answer" } }] }));

    const result = await generateText({ system: "s", text: "t" });

    expect(result.text).toBe("answer");
    expect(fetchMock.mock.calls[0][0]).toBe("https://api.llmsrelay.com/v1/responses");
    expect(fetchMock.mock.calls[1][0]).toBe("https://api.llmsrelay.com/v1/chat/completions");
  });

  it("reports missing credentials without calling the provider", async () => {
    vi.stubEnv("LLMSRELAY_API_KEY", "");
    const error = await failure(generateText({ system: "s", text: "t" }));
    expect(error).toMatchObject({ kind: "not-configured" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("maps provider status codes to failure kinds", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ error: { code: "rate_limit", message: "slow down" } }, 429));
    expect(await failure(generateText({ system: "s", text: "t" }))).toMatchObject({
      kind: "rate-limited",
      status: 429,
      providerCode: "rate_limit",
    });

    fetchMock.mockResolvedValueOnce(jsonResponse({}, 401));
    expect(await failure(generateText({ system: "s", text: "t" }))).toMatchObject({ kind: "unauthorized" });

    fetchMock.mockResolvedValueOnce(jsonResponse({}, 500));
    expect(await failure(generateText({ system: "s", text: "t" }))).toMatchObject({ kind: "unavailable", status: 500 });
  });

  it("treats a network failure or timeout as the provider being unavailable", async () => {
    fetchMock.mockRejectedValueOnce(new DOMException("timed out", "TimeoutError"));
    expect(await failure(generateText({ system: "s", text: "t" }))).toMatchObject({ kind: "unavailable" });
  });

  it("rejects a reply without any text", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ content: [] }));
    expect(await failure(generateText({ system: "s", text: "t" }))).toMatchObject({ kind: "bad-response" });
  });
});
