import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const authMocks = vi.hoisted(() => ({
  auth: vi.fn(),
  getUserWorkerContext: vi.fn(),
}));

vi.mock("@/auth", () => ({ auth: authMocks.auth }));
vi.mock("@/lib/worker-auth", () => ({ getUserWorkerContext: authMocks.getUserWorkerContext }));

import { POST } from "@/app/api/meetings/transcribe/route";
import { _resetRateLimitMemoryForTest } from "@/lib/rate-limit";

describe("POST /api/meetings/transcribe security validation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    _resetRateLimitMemoryForTest();
    authMocks.auth.mockResolvedValue({ user: { email: "doctor@redihealth.org" } });
    authMocks.getUserWorkerContext.mockResolvedValue({ workerId: 7, country: "RO" });
    vi.stubEnv("LLMSRELAY_API_KEY", "test-relay-key");
    vi.stubEnv("LLMSRELAY_BASE_URL", "https://api.llmsrelay.com");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("rejects disallowed non-audio MIME types with 400", async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);

    for (const mime of ["text/html", "image/svg+xml", "application/octet-stream"]) {
      const form = new FormData();
      form.append("audio", new File([new Uint8Array([1, 2, 3])], "evil.html", { type: mime }));
      const res = await POST(new Request("https://redihealth.org/api/meetings/transcribe", { method: "POST", body: form }));
      expect(res?.status, mime).toBe(400);
    }
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("rejects non-HTTPS LLMSRELAY_BASE_URL in production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("LLMSRELAY_BASE_URL", "http://localhost:8080");
    vi.spyOn(console, "error").mockImplementation(() => undefined);

    const form = new FormData();
    form.append("audio", new File([new Uint8Array([1, 2, 3])], "note.webm", { type: "audio/webm" }));
    const res = await POST(new Request("https://redihealth.org/api/meetings/transcribe", { method: "POST", body: form }));
    expect(res?.status).toBe(503);
  });

  it("replaces client-supplied filenames with a fixed safe filename matching the validated audio MIME", async () => {
    let forwardedFilename = "";
    vi.stubGlobal(
      "fetch",
      vi.fn(async (_url: string | URL | Request, init?: RequestInit) => {
        const body = init?.body as FormData;
        const forwardedFile = body.get("file") as File | null;
        forwardedFilename = forwardedFile?.name ?? "";
        return new Response(JSON.stringify({ text: "Patient feels better." }), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      }),
    );

    const form = new FormData();
    form.append("audio", new File([new Uint8Array([1, 2, 3, 4])], "../../evil.php.exe", { type: "audio/webm;codecs=opus" }));
    const res = await POST(new Request("https://redihealth.org/api/meetings/transcribe", { method: "POST", body: form }));
    expect(res?.status).toBe(200);
    expect(await res?.json()).toEqual({ text: "Patient feels better." });
    expect(forwardedFilename).toBe("recording.webm");
  });
});
