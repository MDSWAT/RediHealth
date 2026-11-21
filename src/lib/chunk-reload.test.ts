import { afterEach, describe, expect, it, vi } from "vitest";
import { isChunkLoadError, reloadForNewVersion } from "@/lib/chunk-reload";
import { isAuthActionPath } from "@/lib/auth-actions";

function fakeWindow() {
  const store = new Map<string, string>();
  const reload = vi.fn();
  vi.stubGlobal("window", {
    sessionStorage: {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => void store.set(key, value),
    },
    location: { reload },
  });
  return reload;
}

afterEach(() => vi.unstubAllGlobals());

describe("chunk load errors after a deployment", () => {
  it("recognises the chunk errors of Next.js and the browsers", () => {
    const named = new Error("Failed to load chunk /_next/static/immutable/chunks/34e2z8z8zzbcs.js from module 15181");
    named.name = "ChunkLoadError";
    expect(isChunkLoadError(named)).toBe(true);
    expect(isChunkLoadError("ChunkLoadError: Failed to load chunk /_next/static/chunks/a.js")).toBe(true);
    expect(isChunkLoadError(new TypeError("Failed to fetch dynamically imported module: https://redi.healthcare/_next/x.js"))).toBe(true);
    expect(isChunkLoadError(new Error("Loading chunk 123 failed."))).toBe(true);
    expect(isChunkLoadError(new Error("Cannot read properties of undefined"))).toBe(false);
    expect(isChunkLoadError(null)).toBe(false);
  });

  it("reloads once, then lets the error show if it happens again right away", () => {
    const reload = fakeWindow();
    const error = new Error("Failed to load chunk /_next/static/chunks/a.js");
    expect(reloadForNewVersion(error, 1_000_000)).toBe(true);
    expect(reloadForNewVersion(error, 1_010_000)).toBe(false);
    expect(reload).toHaveBeenCalledTimes(1);
    expect(reloadForNewVersion(error, 1_040_000)).toBe(true);
    expect(reload).toHaveBeenCalledTimes(2);
  });

  it("never reloads for other errors or when storage is blocked", () => {
    const reload = fakeWindow();
    expect(reloadForNewVersion(new Error("Something else"))).toBe(false);
    vi.stubGlobal("window", {
      sessionStorage: {
        getItem: () => {
          throw new Error("blocked");
        },
      },
      location: { reload },
    });
    expect(reloadForNewVersion(new Error("Failed to load chunk x"))).toBe(false);
    expect(reload).not.toHaveBeenCalled();
  });
});

describe("Auth.js addresses", () => {
  it("passes the addresses Auth.js understands", () => {
    for (const path of ["/api/auth/session", "/api/auth/csrf", "/api/auth/providers", "/api/auth/signin/google", "/api/auth/callback/google", "/api/auth/callback/credentials", "/api/auth/signout", "/api/auth/error"]) {
      expect(isAuthActionPath(path), path).toBe(true);
    }
  });

  it("answers 404 for anything else instead of an UnknownAction error", () => {
    for (const path of ["/api/auth", "/api/auth/", "/api/auth/_log", "/api/auth/wp-login.php", "/api/auth/session/extra", "/api/auth/signout/google", "/api/auth/callback/google/x", "/ro/api/auth/session"]) {
      expect(isAuthActionPath(path), path).toBe(false);
    }
  });
});
