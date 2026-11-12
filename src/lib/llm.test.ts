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
    vi.stubEnv("ANTHROPIC_API_KEY", "anthropic-key");
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

    expect(result).toEqual({ text: "{\"ok\":true}", model: "claude-haiku-4-5-20251001" });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://api.anthropic.com/v1/messages");
    expect(init.headers).toMatchObject({ "x-api-key": "anthropic-key", "anthropic-version": "2023-06-01" });
    expect(init.headers).not.toHaveProperty("Authorization");
    expect(init.signal).toBeInstanceOf(AbortSignal);
    const payload = JSON.parse(init.body);
    expect(payload.system).toBe("system prompt");
    expect(payload.messages[0].content[1]).toMatchObject({ type: "image", source: { media_type: "image/png" } });
  });

  it("ignores stale relay routing and uses the selected direct Claude model", async () => {
    vi.stubEnv("ANTHROPIC_BASE_URL", "https://api.llmsrelay.com/");
    vi.stubEnv("LLMSRELAY_MODEL", "gpt-4o-mini");
    vi.stubEnv("ANTHROPIC_MODEL", "claude-sonnet-4-6");
    fetchMock.mockResolvedValue(jsonResponse({ content: [{ type: "text", text: "hi" }] }));

    const result = await generateText({ system: "s", text: "t" });

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://api.anthropic.com/v1/messages");
    expect(result.model).toBe("claude-sonnet-4-6");
    expect(JSON.parse(init.body).model).toBe("claude-sonnet-4-6");
    expect(init.headers).toMatchObject({ "x-api-key": "anthropic-key" });
    expect(init.headers).not.toHaveProperty("Authorization");
  });

  it("rejects a non-Claude model without sending the key anywhere", async () => {
    vi.stubEnv("ANTHROPIC_MODEL", "gpt-4o-mini");
    expect(await failure(generateText({ system: "s", text: "t" }))).toMatchObject({ kind: "not-configured" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("reports missing credentials without calling the provider", async () => {
    vi.stubEnv("ANTHROPIC_API_KEY", "");
    const error = await failure(generateText({ system: "s", text: "t" }));
    expect(error).toMatchObject({ kind: "not-configured" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("does not retry a failed Claude request through a relay", async () => {
    fetchMock.mockResolvedValue(jsonResponse({}, 404));
    expect(await failure(generateText({ system: "s", text: "t" }))).toMatchObject({ kind: "unavailable", status: 404 });
    expect(fetchMock).toHaveBeenCalledTimes(1);
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
