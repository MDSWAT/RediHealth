import { afterEach, describe, expect, it, vi } from "vitest";
import { POST as requestEmailCode } from "@/app/api/auth/email-code/request/route";
import { POST as verifyEmailCode } from "@/app/api/auth/email-code/verify/route";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("email code request route", () => {
  it("returns 400 for invalid JSON payload", async () => {
    const response = await requestEmailCode(
      new Request("http://localhost/api/auth/email-code/request", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-forwarded-for": "198.51.100.10",
        },
        body: "{",
      }),
    );

    expect(response.status).toBe(400);
  });

  it("returns 429 when IP request limit is exceeded", async () => {
    vi.stubEnv("REDIHEALTH_TRUST_PROXY_HEADERS", "true");

    let response = await requestEmailCode(
      new Request("http://localhost/api/auth/email-code/request", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-forwarded-for": "198.51.100.11",
        },
        body: JSON.stringify({ email: "user@example.com" }),
      }),
    );

    for (let i = 0; i < 8; i += 1) {
      response = await requestEmailCode(
        new Request("http://localhost/api/auth/email-code/request", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "x-forwarded-for": "198.51.100.11",
          },
          body: JSON.stringify({ email: "user@example.com" }),
        }),
      );
    }

    expect(response.status).toBe(429);
  });
});

describe("email code verify route", () => {
  it("returns 400 for invalid JSON payload", async () => {
    const response = await verifyEmailCode(
      new Request("http://localhost/api/auth/email-code/verify", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-forwarded-for": "198.51.100.12",
        },
        body: "{",
      }),
    );

    expect(response.status).toBe(400);
  });

  it("returns 429 when IP verify limit is exceeded", async () => {
    vi.stubEnv("REDIHEALTH_TRUST_PROXY_HEADERS", "true");

    let response = await verifyEmailCode(
      new Request("http://localhost/api/auth/email-code/verify", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-forwarded-for": "198.51.100.13",
        },
        body: "{",
      }),
    );

    for (let i = 0; i < 12; i += 1) {
      response = await verifyEmailCode(
        new Request("http://localhost/api/auth/email-code/verify", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "x-forwarded-for": "198.51.100.13",
          },
          body: "{",
        }),
      );
    }

    expect(response.status).toBe(429);
  });
});
