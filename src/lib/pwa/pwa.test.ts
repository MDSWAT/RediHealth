import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import vm from "node:vm";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PWA_COPY, getPwaCopy, type PwaCopy } from "@/lib/i18n/pwa-copy";
import { OFFLINE_UI_COPY, getOfflineUiCopy, type OfflineUiCopy } from "@/lib/i18n/offline-copy";
import type { Lang } from "@/lib/i18n/translations";
import {
  _resetPwaRuntimeForTest,
  applyPwaUpdate,
  closePwaInstallDialog,
  detectInstallPlatform,
  dismissPwaBanner,
  dismissPwaUpdate,
  initPwaRuntime,
  openPwaInstall,
  usePwaSnapshot,
} from "./pwa-state";
import {
  GUIDE_OFFLINE_PRINT_COPY,
  GuideOfflinePrintActions,
} from "@/components/health-information/GuideOfflinePrintActions";

const ALL_LANGS: Lang[] = ["ro", "en", "sq", "it", "hr", "rom", "ru"];
const ALLOWED_MID_SENTENCE_CAPS = new Set([
  "RediHealth",
  "Safari",
  "Chrome",
  "iPhone",
  "iPad",
  "Android",
  "Mac",
]);

const BUTTON_KEYS: (keyof PwaCopy)[] = [
  "installButton",
  "refreshApp",
  "refreshingApp",
  "notNow",
  "closeLabel",
  "updateNow",
  "copyLink",
  "copiedLink",
  "doneButton",
];

function collectStrings(copy: PwaCopy): Array<[string, string]> {
  const out: Array<[string, string]> = [];
  for (const [key, value] of Object.entries(copy)) {
    if (typeof value === "string") {
      out.push([key, value]);
    } else if (Array.isArray(value)) {
      value.forEach((item, index) => out.push([`${key}[${index}]`, item]));
    }
  }
  return out;
}

describe("detectInstallPlatform", () => {
  it("detects Chromium prompt when beforeinstallprompt is present", () => {
    expect(
      detectInstallPlatform({
        userAgent:
          "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36",
        hasBeforeInstallPrompt: true,
      }),
    ).toBe("chromium-prompt");
  });

  it("detects Android manual browsers when prompt is unavailable", () => {
    expect(
      detectInstallPlatform({
        userAgent:
          "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36",
      }),
    ).toBe("android-manual");

    expect(
      detectInstallPlatform({
        userAgent: "Mozilla/5.0 (Android 14; Mobile; rv:128.0) Gecko/128.0 Firefox/128.0",
      }),
    ).toBe("android-manual");
  });

  it("detects iPhone Safari and iPadOS desktop-mode Safari", () => {
    expect(
      detectInstallPlatform({
        userAgent:
          "Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Mobile/15E148 Safari/604.1",
        platform: "iPhone",
        maxTouchPoints: 5,
      }),
    ).toBe("ios-safari");

    expect(
      detectInstallPlatform({
        userAgent:
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Safari/605.1.15",
        platform: "MacIntel",
        maxTouchPoints: 5,
      }),
    ).toBe("ios-safari");
  });

  it("detects non-Safari iOS browsers as ios-other", () => {
    expect(
      detectInstallPlatform({
        userAgent:
          "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/128.0.6613.98 Mobile/15E148 Safari/604.1",
        platform: "iPhone",
        maxTouchPoints: 5,
      }),
    ).toBe("ios-other");

    expect(
      detectInstallPlatform({
        userAgent:
          "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) FxiOS/129.0 Mobile/15E148 Safari/605.1.15",
        platform: "iPhone",
        maxTouchPoints: 5,
      }),
    ).toBe("ios-other");
  });

  it("prioritizes mobile in-app browsers over other detections", () => {
    expect(
      detectInstallPlatform({
        userAgent:
          "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Instagram 342.0.0",
        platform: "iPhone",
        maxTouchPoints: 5,
      }),
    ).toBe("in-app-browser");

    expect(
      detectInstallPlatform({
        userAgent:
          "Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 WhatsApp/2.24.16.76",
        hasBeforeInstallPrompt: true,
      }),
    ).toBe("in-app-browser");

    expect(
      detectInstallPlatform({
        userAgent:
          "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) [FBAN/FBIOS;FBAV/475.0]",
      }),
    ).toBe("in-app-browser");
  });

  it("distinguishes macOS Safari from desktop Chromium/Firefox", () => {
    expect(
      detectInstallPlatform({
        userAgent:
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Safari/605.1.15",
        platform: "MacIntel",
        maxTouchPoints: 0,
      }),
    ).toBe("macos-safari");

    expect(
      detectInstallPlatform({
        userAgent:
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
        platform: "MacIntel",
        maxTouchPoints: 0,
      }),
    ).toBe("desktop-manual");
  });
});

describe("PWA_COPY 7-locale invariants", () => {
  it("provides complete translations for all 7 locales with safe fallback", () => {
    for (const lang of ALL_LANGS) {
      const copy = getPwaCopy(lang);
      expect(copy).toBe(PWA_COPY[lang]);
      expect(copy.iosSafariSteps).toHaveLength(3);
      expect(copy.iosOtherSteps).toHaveLength(3);
      expect(copy.inAppSteps).toHaveLength(2);
      expect(copy.androidManualSteps).toHaveLength(3);
      expect(copy.macosSafariSteps).toHaveLength(2);
      expect(copy.desktopManualSteps).toHaveLength(2);
    }

    expect(getPwaCopy(undefined)).toBe(PWA_COPY.en);
    expect(getPwaCopy(null)).toBe(PWA_COPY.en);
    expect(getPwaCopy("fr")).toBe(PWA_COPY.en);
    expect(getPwaCopy("toString")).toBe(PWA_COPY.en);
  });

  it("enforces strict sentence case, zero &, zero middle dots, and <= 26-char buttons across all 7 locales", () => {
    for (const lang of ALL_LANGS) {
      const copy = PWA_COPY[lang];

      for (const buttonKey of BUTTON_KEYS) {
        const label = copy[buttonKey];
        expect(typeof label).toBe("string");
        expect(
          (label as string).length,
          `${lang}.${buttonKey} exceeds 26 chars: "${label}"`,
        ).toBeLessThanOrEqual(26);
      }

      for (const [key, text] of collectStrings(copy)) {
        expect(text.trim(), `${lang}.${key} is empty`).not.toBe("");
        expect(text, `${lang}.${key} contains &: "${text}"`).not.toContain("&");
        expect(text, `${lang}.${key} contains middle dot: "${text}"`).not.toContain("\u00b7");
        expect(/^\p{Lu}/u.test(text), `${lang}.${key} must start uppercase: "${text}"`).toBe(true);

        const allCapsWords = text.match(/\b[\p{Lu}]{2,}\b/gu) ?? [];
        expect(
          allCapsWords,
          `${lang}.${key} has unexpected ALL-CAPS words in "${text}"`,
        ).toEqual([]);

        const tokens = text.split(/\s+/);
        tokens.forEach((token, idx) => {
          if (idx === 0) return;
          const prev = tokens[idx - 1];
          const afterSentenceEnd = /[.?!:]$/.test(prev);
          const clean = token.replace(/^[^\p{L}]+|[^\p{L}]+$/gu, "");
          if (!clean || ALLOWED_MID_SENTENCE_CAPS.has(clean) || afterSentenceEnd) return;
          expect(
            /^\p{Lu}/u.test(clean),
            `${lang}.${key} has unexpected mid-sentence capitalization "${clean}" in "${text}"`,
          ).toBe(false);
        });
      }
    }
  });
});

describe("public/offline-worker.js", () => {
  const swSource = readFileSync(resolve(process.cwd(), "public/offline-worker.js"), "utf8");

  it("declares v2 caches, 7 locales, lifecycle hooks, and zero-PHI exclusion rules", () => {
    expect(swSource).toContain('SHELL_CACHE = "redihealth-offline-shell-v2"');
    expect(swSource).toContain('STATIC_CACHE = "redihealth-static-v2"');
    expect(swSource).toContain('type === "SKIP_WAITING"');
    expect(swSource).toContain('type !== "PREPARE_OFFLINE"');
    expect(swSource).toContain("!self.registration.active");
    expect(swSource).toContain('key.startsWith("redihealth-")');
    expect(swSource).toContain("self.clients.claim()");
    expect(swSource).toContain("/api/");
    expect(swSource).toContain("/pwa/");
    expect(swSource).toContain("/panel");
    expect(swSource).toContain("/patient-portal");
    expect(swSource).toContain("/sign-in");
    expect(swSource).toContain("/health-check/note");
    expect(swSource).toContain("no-store");
    expect(swSource).toContain("private");
    expect(swSource).toContain("#fcfbf9");
    expect(swSource).toContain("#0a1226");
    expect(swSource).toContain("#c62f3c");
    expect(swSource).toContain("viewport-fit=cover");
    expect(swSource).toContain("tel:112");
    for (const lang of ALL_LANGS) {
      expect(swSource).toContain(`"${lang}"`);
      expect(swSource).toContain(`${lang}:`);
    }
  });

  function createSwHarness(options?: {
    activeWorker?: object | null;
    existingCaches?: Record<string, Record<string, Response>>;
    fetchImpl?: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
  }) {
    const cacheMap = new Map<string, Map<string, Response>>();
    for (const [name, entries] of Object.entries(options?.existingCaches ?? {})) {
      cacheMap.set(name, new Map(Object.entries(entries)));
    }

    const listeners = new Map<string, Array<(event: unknown) => void>>();
    const skipWaiting = vi.fn().mockResolvedValue(undefined);
    const claim = vi.fn().mockResolvedValue(undefined);
    const fetchMock = vi.fn(
      options?.fetchImpl ??
        (async () => new Response("ok", { status: 200, headers: { "Content-Type": "text/plain" } })),
    );

    const cachesMock = {
      async open(name: string) {
        let store = cacheMap.get(name);
        if (!store) {
          store = new Map<string, Response>();
          cacheMap.set(name, store);
        }
        return {
          async match(req: Request | string, options?: { ignoreSearch?: boolean }) {
            const key = typeof req === "string" ? req : req.url;
            const parsed = new URL(key, "https://redihealth.example");
            const pathname = parsed.pathname;
            const direct = store!.get(key) ?? store!.get(pathname);
            if (direct) return direct;
            if (options?.ignoreSearch) {
              const cleanUrl = `${parsed.origin}${pathname}`;
              for (const [storedKey, res] of store!.entries()) {
                const storedUrl = new URL(storedKey, "https://redihealth.example");
                if (`${storedUrl.origin}${storedUrl.pathname}` === cleanUrl) return res;
              }
            }
            return undefined;
          },
          async put(req: Request | string, res: Response) {
            const key = typeof req === "string" ? req : req.url;
            store!.set(key, res);
          },
          async delete(req: Request | string, options?: { ignoreSearch?: boolean }) {
            const target = new URL(typeof req === "string" ? req : req.url, "https://redihealth.example");
            let deleted = false;
            for (const key of store!.keys()) {
              const url = new URL(key, "https://redihealth.example");
              if (url.origin === target.origin && url.pathname === target.pathname && (options?.ignoreSearch || url.search === target.search)) {
                deleted = store!.delete(key) || deleted;
              }
            }
            return deleted;
          },
        };
      },
      async keys() {
        return Array.from(cacheMap.keys());
      },
      async delete(name: string) {
        return cacheMap.delete(name);
      },
      async match(req: Request | string) {
        const key = typeof req === "string" ? req : req.url;
        for (const store of cacheMap.values()) {
          const hit = store.get(key);
          if (hit) return hit;
        }
        return undefined;
      },
    };

    const selfMock = {
      location: { origin: "https://redihealth.example" },
      registration: { active: options?.activeWorker ?? null },
      skipWaiting,
      clients: { claim },
      addEventListener(type: string, fn: (event: unknown) => void) {
        const list = listeners.get(type) ?? [];
        list.push(fn);
        listeners.set(type, list);
      },
    };

    const context = {
      self: selfMock,
      caches: cachesMock,
      fetch: fetchMock,
      URL,
      Response,
      Request,
      Headers,
      Set,
      Promise,
    };
    vm.runInNewContext(swSource, context);

    return {
      selfMock,
      cacheMap,
      fetchMock,
      skipWaiting,
      claim,
      async dispatchWaitable(type: string, event: Record<string, unknown>) {
        const promises: Promise<unknown>[] = [];
        const fullEvent = {
          ...event,
          waitUntil(p: Promise<unknown>) {
            promises.push(Promise.resolve(p));
          },
        };
        for (const fn of listeners.get(type) ?? []) fn(fullEvent);
        await Promise.all(promises);
      },
      async dispatchFetch(request: {
        url: string;
        method?: string;
        mode?: string;
        cache?: RequestCache;
        headers?: Record<string, string>;
      }) {
        let responsePromise: Promise<Response> | undefined;
        const backgroundPromises: Promise<unknown>[] = [];
        const fullEvent = {
          request: {
            url: request.url,
            method: request.method ?? "GET",
            mode: request.mode ?? "cors",
            cache: request.cache ?? "default",
            ...(request.headers ? { headers: new Headers(request.headers) } : {}),
          },
          respondWith(p: Promise<Response> | Response) {
            responsePromise = Promise.resolve(p);
          },
          waitUntil(p: Promise<unknown>) {
            backgroundPromises.push(Promise.resolve(p));
          },
        };
        for (const fn of listeners.get("fetch") ?? []) fn(fullEvent);
        const res = responsePromise ? await responsePromise : null;
        await Promise.all(backgroundPromises);
        return res;
      },
    };
  }

  it("bypasses a damaged cached chunk on an explicit reload and replaces query variants", async () => {
    const path = "/_next/static/immutable/chunks/app.js";
    const origin = "https://redihealth.example";
    const harness = createSwHarness({
      existingCaches: { "redihealth-static-v2": {
        [origin + path]: new Response("(()=>{"),
        [origin + path + "?dpl=old"]: new Response("(()=>{"),
      } },
      fetchImpl: async () => new Response("(()=>{})()", { headers: { "Content-Type": "application/javascript" } }),
    });
    const normal = await harness.dispatchFetch({ url: origin + path });
    expect(await normal?.clone().text()).toBe("(()=>{");
    expect(harness.fetchMock).not.toHaveBeenCalled();
    const repaired = await harness.dispatchFetch({ url: origin + path, cache: "reload" });
    expect(await repaired?.text()).toBe("(()=>{})()");
    expect(harness.fetchMock).toHaveBeenCalledTimes(1);
    const next = await harness.dispatchFetch({ url: origin + path + "?dpl=old" });
    expect(await next?.text()).toBe("(()=>{})()");
  });

  it("does not replace an offline copy with an interrupted reload response", async () => {
    const url = "https://redihealth.example/_next/static/chunks/app.js";
    const harness = createSwHarness({
      existingCaches: { "redihealth-static-v2": { [url]: new Response("app()") } },
      fetchImpl: async () => new Response(new ReadableStream({ start(controller) { controller.error(new Error("connection interrupted")); } })),
    });
    expect((await harness.dispatchFetch({ url, cache: "reload" }))?.status).toBe(504);
    const cached = await harness.dispatchFetch({ url });
    expect(await cached?.text()).toBe("app()");
  });

  it("calls skipWaiting on first install only, prunes stale caches on activate, and handles SKIP_WAITING", async () => {
    const firstInstall = createSwHarness({ activeWorker: null });
    await firstInstall.dispatchWaitable("install", {});
    expect(firstInstall.skipWaiting).toHaveBeenCalledTimes(1);

    const updateInstall = createSwHarness({
      activeWorker: { state: "activated" },
      existingCaches: {
        "redihealth-offline-shell-v1": {},
        "redihealth-offline-shell-v2": {},
        "redihealth-static-v2": {},
        "redihealth-pages-v1": {},
        "redihealth-media-v1": {},
        "unrelated-cache": {},
      },
    });
    await updateInstall.dispatchWaitable("install", {});
    expect(updateInstall.skipWaiting).not.toHaveBeenCalled();

    await updateInstall.dispatchWaitable("activate", {});
    expect(updateInstall.cacheMap.has("redihealth-offline-shell-v1")).toBe(false);
    expect(updateInstall.cacheMap.has("redihealth-offline-shell-v2")).toBe(true);
    expect(updateInstall.cacheMap.has("redihealth-static-v2")).toBe(true);
    expect(updateInstall.cacheMap.has("redihealth-pages-v1")).toBe(true);
    expect(updateInstall.cacheMap.has("redihealth-media-v1")).toBe(true);
    expect(updateInstall.cacheMap.has("unrelated-cache")).toBe(true);
    expect(updateInstall.claim).toHaveBeenCalledTimes(1);

    await updateInstall.dispatchWaitable("message", { data: { type: "SKIP_WAITING" } });
    expect(updateInstall.skipWaiting).toHaveBeenCalledTimes(1);
  });

  it("prepares offline shell for all 7 locales and serves zero-PHI localized offline fallback", async () => {
    const harness = createSwHarness({
      fetchImpl: async (input) => {
        const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
        if (url.endsWith("/hr/offline")) {
          return new Response(
            '<html><script src="/_next/static/chunks/app.js"></script></html>',
            { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } },
          );
        }
        if (url.includes("/_next/static/")) {
          return new Response("console.log('ok')", {
            status: 200,
            headers: { "Content-Type": "application/javascript" },
          });
        }
        throw new TypeError("Offline");
      },
    });

    const messages: unknown[] = [];
    await harness.dispatchWaitable("message", {
      data: { type: "PREPARE_OFFLINE", lang: "hr", assets: [] },
      ports: [{ postMessage: (msg: unknown) => messages.push(msg) }],
    });
    expect(messages).toEqual([{ ok: true }]);
    expect(harness.cacheMap.get("redihealth-offline-shell-v2")?.has("/hr/offline")).toBe(true);
    expect(
      harness.cacheMap
        .get("redihealth-static-v2")
        ?.has("https://redihealth.example/_next/static/chunks/app.js"),
    ).toBe(true);

    const panelFallback = await harness.dispatchFetch({
      url: "https://redihealth.example/hr/panel",
      mode: "navigate",
    });
    expect(panelFallback?.status).toBe(200);
    expect(await panelFallback?.text()).toContain("/_next/static/chunks/app.js");

    const publicFallback = await harness.dispatchFetch({
      url: "https://redihealth.example/ro/health-check",
      mode: "navigate",
    });
    expect(publicFallback?.status).toBe(503);
    expect(publicFallback?.headers.get("content-type")).toContain("text/html");
    const html = await publicFallback!.text();
    expect(html).toContain('lang="ro"');
    expect(html).toContain("Ești offline");
    expect(html).toContain('href="tel:112"');
    expect(html).not.toContain("&amp;");
    expect(html).not.toContain("\u00b7");
  });

  it("never intercepts or caches /api/*, /patient-portal/*, /sign-in*, /health-check/note*, or no-store responses", async () => {
    const harness = createSwHarness({
      fetchImpl: async () =>
        new Response("icon", {
          status: 200,
          headers: { "Content-Type": "image/png", "Cache-Control": "private, no-store" },
        }),
    });

    expect(
      await harness.dispatchFetch({
        url: "https://redihealth.example/api/patients",
        mode: "cors",
      }),
    ).toBeNull();
    expect(
      await harness.dispatchFetch({
        url: "https://redihealth.example/en/patient-portal",
        mode: "cors",
      }),
    ).toBeNull();
    expect(
      await harness.dispatchFetch({
        url: "https://redihealth.example/ro/sign-in",
        mode: "cors",
      }),
    ).toBeNull();
    expect(
      await harness.dispatchFetch({
        url: "https://redihealth.example/en/health-check/note",
        mode: "cors",
      }),
    ).toBeNull();

    const iconRes = await harness.dispatchFetch({
      url: "https://redihealth.example/pwa/pwa-192x192.png",
      mode: "no-cors",
    });
    expect(iconRes?.status).toBe(200);
    expect(harness.cacheMap.get("redihealth-static-v2")?.size ?? 0).toBe(0);
  });

  it("caches /pwa/* assets in STATIC_CACHE when response is cacheable", async () => {
    const harness = createSwHarness({
      fetchImpl: async () =>
        new Response("png-bytes", {
          status: 200,
          headers: { "Content-Type": "image/png", "Cache-Control": "public, max-age=86400" },
        }),
    });

    const iconRes = await harness.dispatchFetch({
      url: "https://redihealth.example/pwa/pwa-192x192.png",
      mode: "no-cors",
    });
    expect(iconRes?.status).toBe(200);
    expect(
      harness.cacheMap
        .get("redihealth-static-v2")
        ?.has("https://redihealth.example/pwa/pwa-192x192.png"),
    ).toBe(true);
  });

  it("classifies public non-PHI routes vs sensitive PHI routes cleanly", () => {
    const sandbox: {
      isOfflinePublicPath?: (p: string) => boolean;
      isSensitivePath?: (p: string) => boolean;
    } = {};
    vm.runInNewContext(
      swSource.slice(swSource.indexOf("const SUPPORTED_LOCALES"), swSource.indexOf("function buildOfflineFallbackResponse")),
      sandbox,
    );

    for (const publicPath of [
      "/ro",
      "/en",
      "/ro/health-check",
      "/en/find-help",
      "/ro/stiri",
      "/ro/stiri/1",
      "/en/demo",
      "/ro/health-assistant",
      "/ro/about",
      "/ro/ai-assistant",
      "/ro/prescription-review",
      "/ro/medic-online",
      "/hr/health-information/heart-health",
    ]) {
      expect(sandbox.isOfflinePublicPath?.(publicPath), publicPath).toBe(true);
      expect(sandbox.isSensitivePath?.(publicPath), publicPath).toBe(false);
    }

    for (const sensitivePath of [
      "/api/patients",
      "/ro/panel",
      "/en/panel/patients",
      "/en/patient-portal/abc",
      "/ro/sign-in",
      "/en/health-check/note",
      "/ro/medic-online/meet/123",
      "/ro/medic-online/asteptare/tok",
    ]) {
      expect(sandbox.isOfflinePublicPath?.(sensitivePath), sensitivePath).toBe(false);
      expect(sandbox.isSensitivePath?.(sensitivePath), sensitivePath).toBe(true);
    }
  });

  it("warms public pages, handles CACHE_PUBLIC_PAGE, RSC fallback, /_next/image fallback, and /models cache", async () => {
    let online = true;
    const harness = createSwHarness({
      fetchImpl: async (input, init) => {
        if (!online) throw new TypeError("Offline");
        const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
        const pathname = new URL(url, "https://redihealth.example").pathname;
        if (pathname.startsWith("/_next/static/")) {
          if (pathname === "/_next/static/chunks/main.js") {
            return new Response('Promise.all(["static/chunks/lazy-3d.js"].map(e=>e.l(e)))', {
              status: 200,
              headers: { "Content-Type": "application/javascript", "Cache-Control": "public, max-age=31536000" },
            });
          }
          if (pathname === "/_next/static/chunks/lazy-3d.js") {
            return new Response('Promise.all(["static/chunks/lazy-sub.js"].map(e=>e.l(e)))', {
              status: 200,
              headers: { "Content-Type": "application/javascript", "Cache-Control": "public, max-age=31536000" },
            });
          }
          if (pathname === "/_next/static/chunks/lazy-sub.js") {
            return new Response("subChunk()", {
              status: 200,
              headers: { "Content-Type": "application/javascript", "Cache-Control": "public, max-age=31536000" },
            });
          }
          return new Response("chunk()", {
            status: 200,
            headers: { "Content-Type": "application/javascript", "Cache-Control": "public, max-age=31536000" },
          });
        }
        if (pathname === "/images/hero-care.jpg") {
          return new Response("jpg-bytes", {
            status: 200,
            headers: { "Content-Type": "image/jpeg", "Cache-Control": "public, max-age=31536000" },
          });
        }
        if (pathname === "/models/human-atlas-layers.bin") {
          return new Response("bin-bytes", {
            status: 200,
            headers: { "Content-Type": "application/octet-stream", "Cache-Control": "public, max-age=86400" },
          });
        }
        if (pathname.startsWith("/ro")) {
          if (typeof input === "string") {
            expect(init?.credentials).toBe("omit");
          }
          return new Response(
            '<!doctype html><html><head><title>Page</title><script src="/_next/static/chunks/main.js"></script></head><body>ok</body></html>',
            {
              status: 200,
              headers: {
                "Content-Type": "text/html; charset=utf-8",
                "Set-Cookie": "secret=123",
                "Content-Security-Policy": "script-src 'nonce-abc'",
              },
            },
          );
        }
        return new Response("not found", { status: 404, headers: { "Content-Type": "text/plain" } });
      },
    });

    const warmMessages: Array<{ ok?: boolean; cachedCount?: number }> = [];
    await harness.dispatchWaitable("message", {
      data: { type: "WARM_OFFLINE_APP", lang: "ro", includeGuides: true, includeModels: false, assets: [] },
      ports: [{ postMessage: (msg: { ok?: boolean; cachedCount?: number }) => warmMessages.push(msg) }],
    });
    expect(warmMessages[0]?.ok).toBe(true);
    expect(warmMessages[0]?.cachedCount).toBeGreaterThan(0);

    const cachedHome = harness.cacheMap.get("redihealth-pages-v1")?.get("/ro");
    expect(cachedHome).toBeDefined();
    expect(cachedHome?.headers.get("set-cookie")).toBeNull();
    expect(cachedHome?.headers.get("content-security-policy")).toBe("script-src 'nonce-abc'");

    const cachePageMessages: Array<{ ok?: boolean }> = [];
    await harness.dispatchWaitable("message", {
      data: { type: "CACHE_PUBLIC_PAGE", url: "/ro/stiri/1", assets: [] },
      ports: [{ postMessage: (msg: { ok?: boolean }) => cachePageMessages.push(msg) }],
    });
    expect(cachePageMessages).toEqual([{ ok: true, path: "/ro/stiri/1" }]);

    // Warm /models binary while online
    const modelOnline = await harness.dispatchFetch({
      url: "https://redihealth.example/models/human-atlas-layers.bin",
    });
    expect(modelOnline?.status).toBe(200);

    // Switch offline
    const broadcastMessages: unknown[] = [];
    (harness.selfMock.clients as { claim: unknown; matchAll?: unknown }).matchAll = vi
      .fn()
      .mockResolvedValue([{ postMessage: (msg: unknown) => broadcastMessages.push(msg) }]);
    online = false;

    // Unprefixed root and shortcut resolve via LAST_LOCALE_KEY ("ro")
    const offlineRoot = await harness.dispatchFetch({
      url: "https://redihealth.example/",
      mode: "navigate",
    });
    expect(offlineRoot?.status).toBe(200);

    const offlineShortcut = await harness.dispatchFetch({
      url: "https://redihealth.example/health-check",
      mode: "navigate",
    });
    expect(offlineShortcut?.status).toBe(200);

    // RSC request on offline public path returns 503 for clean MPA fallback
    const offlineRsc = await harness.dispatchFetch({
      url: "https://redihealth.example/ro/health-check?_rsc=xyz",
      mode: "cors",
      headers: { RSC: "1" },
    });
    expect(offlineRsc?.status).toBe(503);

    // /_next/image falls back offline to cached /images/hero-care.jpg
    const offlineNextImage = await harness.dispatchFetch({
      url: "https://redihealth.example/_next/image?url=%2Fimages%2Fhero-care.jpg&w=640&q=75",
    });
    expect(offlineNextImage?.status).toBe(200);
    expect(await offlineNextImage?.text()).toBe("jpg-bytes");

    // /models binary serves from MEDIA_CACHE offline
    const offlineModel = await harness.dispatchFetch({
      url: "https://redihealth.example/models/human-atlas-layers.bin",
    });
    expect(offlineModel?.status).toBe(200);
    expect(await offlineModel?.text()).toBe("bin-bytes");

    // Transitive dynamic /_next/static chunks discovered from main.js serve from STATIC_CACHE offline
    const offlineLazy3d = await harness.dispatchFetch({
      url: "https://redihealth.example/_next/static/chunks/lazy-3d.js",
    });
    expect(offlineLazy3d?.status).toBe(200);
    expect(await offlineLazy3d?.text()).toContain("lazy-sub.js");

    const offlineLazySub = await harness.dispatchFetch({
      url: "https://redihealth.example/_next/static/chunks/lazy-sub.js",
    });
    expect(offlineLazySub?.status).toBe(200);
    expect(await offlineLazySub?.text()).toBe("subChunk()");

    // SW reports offline status and recovers cleanly when online navigation succeeds
    const offlineStatusReplies: unknown[] = [];
    await harness.dispatchWaitable("message", {
      data: { type: "GET_OFFLINE_STATUS" },
      ports: [{ postMessage: (msg: unknown) => offlineStatusReplies.push(msg) }],
    });
    expect(offlineStatusReplies).toEqual([{ offline: true }]);
    expect(broadcastMessages).toEqual([{ type: "OFFLINE_STATUS", offline: true }]);

    online = true;
    const onlineRecover = await harness.dispatchFetch({
      url: "https://redihealth.example/ro/health-check",
      mode: "navigate",
    });
    expect(onlineRecover?.status).toBe(200);

    const onlineStatusReplies: unknown[] = [];
    await harness.dispatchWaitable("message", {
      data: { type: "GET_OFFLINE_STATUS" },
      ports: [{ postMessage: (msg: unknown) => onlineStatusReplies.push(msg) }],
    });
    expect(onlineStatusReplies).toEqual([{ offline: false }]);
    expect(broadcastMessages).toEqual([
      { type: "OFFLINE_STATUS", offline: true },
      { type: "OFFLINE_STATUS", offline: false },
    ]);
  });

  it("caches transitive static/immutable/chunks and handles query params and uncached chunks offline safely", async () => {
    let online = true;
    const harness = createSwHarness({
      fetchImpl: async (input) => {
        if (!online) throw new TypeError("Offline");
        const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
        const pathname = new URL(url, "https://redihealth.example").pathname;
        if (pathname === "/ro") {
          return new Response(
            '<!doctype html><html><head><script src="/_next/static/immutable/chunks/entry.js?dpl=abc"></script></head><body>ok</body></html>',
            { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } },
          );
        }
        if (pathname === "/_next/static/immutable/chunks/entry.js") {
          return new Response(
            'Promise.all(["static/immutable/chunks/nested/mod-15181.js","static/immutable/media/font.woff2"].map(e=>e.l(e)))',
            { status: 200, headers: { "Content-Type": "application/javascript", "Cache-Control": "public, max-age=31536000" } },
          );
        }
        if (pathname === "/_next/static/immutable/chunks/nested/mod-15181.js") {
          return new Response("widgetChunk()", {
            status: 200,
            headers: { "Content-Type": "application/javascript", "Cache-Control": "public, max-age=31536000" },
          });
        }
        if (pathname === "/_next/static/immutable/media/font.woff2") {
          return new Response("woff2-bytes", {
            status: 200,
            headers: { "Content-Type": "font/woff2", "Cache-Control": "public, max-age=31536000" },
          });
        }
        return new Response("not found", { status: 404, headers: { "Content-Type": "text/plain" } });
      },
    });

    const warmMessages: Array<{ ok?: boolean }> = [];
    await harness.dispatchWaitable("message", {
      data: { type: "WARM_OFFLINE_APP", lang: "ro", includeGuides: false, includeModels: false, assets: [] },
      ports: [{ postMessage: (msg: { ok?: boolean }) => warmMessages.push(msg) }],
    });
    expect(warmMessages[0]?.ok).toBe(true);

    online = false;

    const cachedNested = await harness.dispatchFetch({
      url: "https://redihealth.example/_next/static/immutable/chunks/nested/mod-15181.js?dpl=other",
    });
    expect(cachedNested?.status).toBe(200);
    expect(await cachedNested?.text()).toBe("widgetChunk()");

    const cachedMedia = await harness.dispatchFetch({
      url: "https://redihealth.example/_next/static/immutable/media/font.woff2",
    });
    expect(cachedMedia?.status).toBe(200);

    const missingChunk = await harness.dispatchFetch({
      url: "https://redihealth.example/_next/static/immutable/chunks/missing.js",
    });
    expect(missingChunk?.status).toBe(504);
  });
});

describe("pwa-state runtime and SSR safety", () => {
  afterEach(() => {
    _resetPwaRuntimeForTest();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it("renders safely during SSR via useSyncExternalStore server snapshot", () => {
    function Probe() {
      const snap = usePwaSnapshot();
      return createElement("span", null, `${snap.hydrated}:${snap.platform}:${snap.isStandalone}`);
    }
    const html = renderToStaticMarkup(createElement(Probe));
    expect(html).toBe("<span>false:desktop-manual:false</span>");
  });

  it("keeps OfflineWorkspace SW registration options resilient to staged updates", () => {
    const offlineWorkspace = readFileSync(
      resolve(process.cwd(), "src/components/offline/OfflineWorkspace.tsx"),
      "utf8",
    );
    expect(offlineWorkspace).toContain('updateViaCache: "none"');
    expect(offlineWorkspace).toContain(
      "registration.active ?? registration.waiting ?? registration.installing",
    );
    expect(offlineWorkspace).toContain("press-row");
  });

  it("handles beforeinstallprompt, snooze, and SKIP_WAITING update flow in browser environment", async () => {
    vi.useFakeTimers();

    const winListeners = new Map<string, Array<(e: unknown) => void>>();
    const docListeners = new Map<string, Array<(e: unknown) => void>>();
    const swListeners = new Map<string, Array<(e: unknown) => void>>();
    const storage = new Map<string, string>();
    const waitingPostMessage = vi.fn();
    const reload = vi.fn();
    const updateMock = vi.fn().mockResolvedValue(undefined);

    const mockRegistration = {
      waiting: { postMessage: waitingPostMessage },
      installing: null,
      update: updateMock,
      addEventListener: vi.fn(),
    };

    const windowMock = {
      isSecureContext: true,
      location: { reload },
      localStorage: {
        getItem: (k: string) => storage.get(k) ?? null,
        setItem: (k: string, v: string) => storage.set(k, v),
        removeItem: (k: string) => storage.delete(k),
      },
      matchMedia: () => ({ matches: false, addEventListener: vi.fn() }),
      addEventListener: (type: string, fn: (e: unknown) => void) => {
        const list = winListeners.get(type) ?? [];
        list.push(fn);
        winListeners.set(type, list);
      },
      setTimeout: globalThis.setTimeout.bind(globalThis),
      clearTimeout: globalThis.clearTimeout.bind(globalThis),
      setInterval: globalThis.setInterval.bind(globalThis),
      clearInterval: globalThis.clearInterval.bind(globalThis),
    };

    const navigatorMock = {
      userAgent:
        "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Chrome/126.0.0.0 Mobile Safari/537.36",
      platform: "Linux armv8l",
      maxTouchPoints: 5,
      serviceWorker: {
        controller: { state: "activated" },
        register: vi.fn().mockResolvedValue(mockRegistration),
        getRegistration: vi.fn().mockResolvedValue(mockRegistration),
        addEventListener: (type: string, fn: (e: unknown) => void) => {
          const list = swListeners.get(type) ?? [];
          list.push(fn);
          swListeners.set(type, list);
        },
      },
    };

    const documentMock = {
      referrer: "",
      visibilityState: "visible",
      addEventListener: (type: string, fn: (e: unknown) => void) => {
        const list = docListeners.get(type) ?? [];
        list.push(fn);
        docListeners.set(type, list);
      },
    };

    vi.stubGlobal("window", windowMock);
    vi.stubGlobal("navigator", navigatorMock);
    vi.stubGlobal("document", documentMock);

    initPwaRuntime();
    await Promise.resolve();
    await Promise.resolve();

    expect(navigatorMock.serviceWorker.register).toHaveBeenCalledWith("/offline-worker.js", {
      scope: "/",
      updateViaCache: "none",
    });

    const promptFn = vi.fn().mockResolvedValue(undefined);
    for (const fn of winListeners.get("beforeinstallprompt") ?? []) {
      fn({
        preventDefault: vi.fn(),
        prompt: promptFn,
        userChoice: Promise.resolve({ outcome: "accepted" }),
      });
    }

    const result = await openPwaInstall();
    expect(result).toBe("accepted");
    expect(promptFn).toHaveBeenCalledTimes(1);
    expect(storage.get("redihealth:pwa-installed:v1")).toBe("1");

    const fallbackDialog = await openPwaInstall();
    expect(fallbackDialog).toBe("dialog");
    closePwaInstallDialog();
    dismissPwaBanner();
    expect(storage.has("redihealth:pwa-snooze:v1")).toBe(true);
    dismissPwaUpdate();

    const updatePromise = applyPwaUpdate();
    await Promise.resolve();
    expect(waitingPostMessage).toHaveBeenCalledWith({ type: "SKIP_WAITING" });
    for (const fn of swListeners.get("controllerchange") ?? []) {
      fn({});
    }
    await updatePromise;
    expect(reload).toHaveBeenCalledTimes(1);
  });

  it("isolates redihealth-guides-v1 strictly to non-PHI /health-information routes and provides 7-locale print/offline actions", () => {
    const swSrc = readFileSync(resolve(process.cwd(), "public/offline-worker.js"), "utf8");
    expect(swSrc).toContain('GUIDES_CACHE = "redihealth-guides-v1"');
    expect(swSrc).toContain("isHealthGuidePath");
    expect(swSrc).toContain("CACHE_GUIDE");

    const fnStart = swSrc.indexOf("function isHealthGuidePath");
    const sandbox: { isHealthGuidePath?: (p: string) => boolean } = {};
    vm.runInNewContext(
      swSrc.slice(swSrc.indexOf("const SUPPORTED_LOCALES"), swSrc.indexOf("function buildOfflineFallbackResponse")),
      sandbox,
    );
    expect(fnStart).toBeGreaterThan(-1);
    expect(sandbox.isHealthGuidePath?.("/ro/health-information/heart-health")).toBe(true);
    expect(sandbox.isHealthGuidePath?.("/en/health-information/articles/flu")).toBe(true);
    expect(sandbox.isHealthGuidePath?.("/ro/health-information")).toBe(true);
    for (const sensitivePath of [
      "/ro/panel",
      "/ro/panel/patient-1",
      "/en/patient-portal",
      "/ro/sign-in",
      "/en/health-check/note",
      "/api/tts",
      "/ro/mediatori",
    ]) {
      expect(sandbox.isHealthGuidePath?.(sensitivePath), sensitivePath).toBe(false);
    }

    const actionsSrc = readFileSync(
      resolve(process.cwd(), "src/components/health-information/GuideOfflinePrintActions.tsx"),
      "utf8",
    );
    expect(actionsSrc).toContain("window.print()");
    expect(actionsSrc).toContain("redihealth-guides-v1");
    expect(actionsSrc).not.toContain("rounded-full");

    for (const loc of ALL_LANGS) {
      const copy = GUIDE_OFFLINE_PRINT_COPY[loc];
      expect(copy.printLabel.trim().length).toBeGreaterThan(0);
      expect(copy.saveLabel.trim().length).toBeGreaterThan(0);
      expect(copy.savedStatus.trim().length).toBeGreaterThan(0);
      expect(copy.printLabel).not.toContain("&");
      expect(copy.saveLabel).not.toContain("&");
      const html = renderToStaticMarkup(createElement(GuideOfflinePrintActions, { lang: loc, title: "Test" }));
      expect(html).toContain("min-h-11");
      expect(html).toContain("whitespace-nowrap");
      expect(html).toContain(copy.printLabel);
      expect(html).toContain(copy.saveLabel);
    }
  });

  it("validates OFFLINE_UI_COPY across all 7 locales with sentence case and <= 26-char buttons", () => {
    const buttonFields: (keyof OfflineUiCopy)[] = [
      "dismissLabel",
      "openSymptomCheck",
      "openGuides",
    ];
    for (const lang of ALL_LANGS) {
      const copy = getOfflineUiCopy(lang);
      expect(copy).toBe(OFFLINE_UI_COPY[lang]);

      for (const btnKey of buttonFields) {
        expect(copy[btnKey].length, `${lang}.${btnKey}`).toBeLessThanOrEqual(26);
      }

      for (const [key, value] of Object.entries(copy)) {
        expect(value.trim(), `${lang}.${key}`).not.toBe("");
        expect(value, `${lang}.${key} &`).not.toContain("&");
        expect(value, `${lang}.${key} ·`).not.toContain("\u00b7");
        expect(/^\p{Lu}/u.test(value), `${lang}.${key} uppercase start`).toBe(true);
        const allCaps = value.match(/\b[\p{Lu}]{2,}\b/gu) ?? [];
        expect(allCaps, `${lang}.${key} ALL CAPS`).toEqual([]);
      }
    }
    expect(getOfflineUiCopy("fr")).toBe(OFFLINE_UI_COPY.en);
  });
});
