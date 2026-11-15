import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import vm from "node:vm";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PWA_COPY, getPwaCopy, type PwaCopy } from "@/lib/i18n/pwa-copy";
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
          async match(req: Request | string) {
            const key = typeof req === "string" ? req : req.url;
            const pathname = new URL(key, "https://redihealth.example").pathname;
            return store!.get(key) ?? store!.get(pathname);
          },
          async put(req: Request | string, res: Response) {
            const key = typeof req === "string" ? req : req.url;
            store!.set(key, res);
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
      async dispatchFetch(request: { url: string; method?: string; mode?: string }) {
        let responsePromise: Promise<Response> | undefined;
        const backgroundPromises: Promise<unknown>[] = [];
        const fullEvent = {
          request: {
            url: request.url,
            method: request.method ?? "GET",
            mode: request.mode ?? "cors",
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
        "unrelated-cache": {},
      },
    });
    await updateInstall.dispatchWaitable("install", {});
    expect(updateInstall.skipWaiting).not.toHaveBeenCalled();

    await updateInstall.dispatchWaitable("activate", {});
    expect(updateInstall.cacheMap.has("redihealth-offline-shell-v1")).toBe(false);
    expect(updateInstall.cacheMap.has("redihealth-offline-shell-v2")).toBe(true);
    expect(updateInstall.cacheMap.has("redihealth-static-v2")).toBe(true);
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
});
