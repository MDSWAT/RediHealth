import { useSyncExternalStore } from "react";
import { countryForLang } from "@/lib/medical-institutes";
import type { Lang } from "@/lib/i18n/translations";
import { warmCountryInstitutes } from "@/lib/pwa/offline-institutes";
import { isBrowserOffline } from "@/lib/pwa/use-online-status";

export type InstallPlatform =
  | "chromium-prompt"
  | "ios-safari"
  | "ios-other"
  | "in-app-browser"
  | "android-manual"
  | "macos-safari"
  | "desktop-manual";

export type PwaSnapshot = {
  hydrated: boolean;
  isStandalone: boolean;
  canInstallNatively: boolean;
  hasUpdate: boolean;
  isRefreshing: boolean;
  bannerVisible: boolean;
  installDialogOpen: boolean;
  platform: InstallPlatform;
};

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform?: string }>;
}

const INSTALLED_STORAGE_KEY = "redihealth:pwa-installed:v1";
const SNOOZE_STORAGE_KEY = "redihealth:pwa-snooze:v1";
const VISITS_STORAGE_KEY = "redihealth:pwa-visits:v1";
const VISIT_COUNTED_SESSION_KEY = "redihealth:pwa-visit-counted:v1";
const BANNER_DELAY_MS = 4_000;
const SNOOZE_DURATION_MS = 7 * 24 * 60 * 60 * 1_000;
const VISIBILITY_UPDATE_THROTTLE_MS = 60_000;
const PERIODIC_UPDATE_INTERVAL_MS = 30 * 60_000;

const IN_APP_BROWSER_RE =
  /FBAN|FBAV|Instagram|Line\/|MicroMessenger|TikTok|Snap|WhatsApp|LinkedInApp/i;
const IOS_DEVICE_RE = /iPhone|iPad|iPod/i;
const IOS_OTHER_BROWSER_RE = /CriOS|FxiOS|EdgiOS|OPiOS/i;
const MOBILE_BANNER_PLATFORMS = new Set<InstallPlatform>([
  "ios-safari",
  "ios-other",
  "in-app-browser",
  "android-manual",
]);

const SERVER_SNAPSHOT: PwaSnapshot = {
  hydrated: false,
  isStandalone: false,
  canInstallNatively: false,
  hasUpdate: false,
  isRefreshing: false,
  bannerVisible: false,
  installDialogOpen: false,
  platform: "desktop-manual",
};

let snapshot: PwaSnapshot = SERVER_SNAPSHOT;
const listeners = new Set<() => void>();

let initialized = false;
let deferredPrompt: BeforeInstallPromptEvent | null = null;
let swRegistration: ServiceWorkerRegistration | null = null;
let bannerTimer: number | null = null;
/**
 * The install banner sits over the bottom of the screen, where the home page's main action is.
 * It is held back on a first visit until the visitor has moved to a second page; on a later
 * visit it may show after the usual delay.
 */
let bannerEarned = false;
let updateInterval: number | null = null;
let lastUpdateCheckAt = 0;

function emit(): void {
  for (const listener of listeners) {
    listener();
  }
}

function setSnapshot(patch: Partial<PwaSnapshot>): void {
  const next: PwaSnapshot = { ...snapshot, ...patch };
  const changed = (Object.keys(next) as (keyof PwaSnapshot)[]).some(
    (key) => next[key] !== snapshot[key],
  );
  if (!changed) return;
  snapshot = next;
  emit();
}

function safeGetStorage(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSetStorage(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Ignore storage failures in private browsing or restricted WebViews.
  }
}

function safeRemoveStorage(key: string): void {
  try {
    window.localStorage.removeItem(key);
  } catch {
    // Ignore storage failures in private browsing or restricted WebViews.
  }
}

function isInstalledFlagSet(): boolean {
  return safeGetStorage(INSTALLED_STORAGE_KEY) === "1";
}

function isSnoozeExpired(): boolean {
  const raw = safeGetStorage(SNOOZE_STORAGE_KEY);
  if (!raw) return true;
  const snoozeUntil = Number(raw);
  if (!Number.isFinite(snoozeUntil)) return true;
  return Date.now() >= snoozeUntil;
}

/** Counts this browser session once and returns how many sessions this device has had. */
function countVisit(): number {
  if (typeof window === "undefined") return 0;
  const previous = Number(safeGetStorage(VISITS_STORAGE_KEY)) || 0;
  try {
    if (window.sessionStorage.getItem(VISIT_COUNTED_SESSION_KEY) === "1") return previous;
    window.sessionStorage.setItem(VISIT_COUNTED_SESSION_KEY, "1");
  } catch {
    // No session storage (private mode): treat every load as a first visit.
    return previous;
  }
  safeSetStorage(VISITS_STORAGE_KEY, String(previous + 1));
  return previous + 1;
}

/** Called when the visitor moves to another page: from then on the install banner may show. */
export function markPwaEngaged(): void {
  if (bannerEarned) return;
  bannerEarned = true;
  if (initialized) scheduleBanner();
}

function clearBannerTimer(): void {
  if (bannerTimer !== null && typeof window !== "undefined") {
    window.clearTimeout(bannerTimer);
    bannerTimer = null;
  }
}

function checkIsStandalone(): boolean {
  if (typeof window === "undefined") return false;
  try {
    if (window.matchMedia?.("(display-mode: standalone)")?.matches) return true;
    if (window.matchMedia?.("(display-mode: minimal-ui)")?.matches) return true;
  } catch {
    // Ignore unsupported matchMedia queries.
  }
  const nav = navigator as Navigator & { standalone?: boolean };
  if (nav.standalone === true) return true;
  if (typeof document !== "undefined" && document.referrer.startsWith("android-app://")) {
    return true;
  }
  return false;
}

/**
 * Classifies the visitor's browser/device environment into an install UX flow.
 */
export function detectInstallPlatform(input: {
  userAgent: string;
  platform?: string;
  maxTouchPoints?: number;
  referrer?: string;
  hasBeforeInstallPrompt?: boolean;
}): InstallPlatform {
  const ua = input.userAgent || "";
  if (IN_APP_BROWSER_RE.test(ua)) {
    return "in-app-browser";
  }
  if (input.hasBeforeInstallPrompt) {
    return "chromium-prompt";
  }
  const isIpadOs = input.platform === "MacIntel" && (input.maxTouchPoints ?? 0) > 1;
  if (IOS_DEVICE_RE.test(ua) || isIpadOs) {
    return IOS_OTHER_BROWSER_RE.test(ua) ? "ios-other" : "ios-safari";
  }
  if (/Android/i.test(ua)) {
    return "android-manual";
  }
  if (
    /Macintosh|Mac OS X/i.test(ua) &&
    /Safari/i.test(ua) &&
    !/Chrome|Chromium|Edg|OPR/i.test(ua)
  ) {
    return "macos-safari";
  }
  return "desktop-manual";
}

function computeCurrentPlatform(hasPrompt = Boolean(deferredPrompt)): InstallPlatform {
  if (typeof navigator === "undefined") return "desktop-manual";
  return detectInstallPlatform({
    userAgent: navigator.userAgent || "",
    platform: navigator.platform || "",
    maxTouchPoints: navigator.maxTouchPoints ?? 0,
    referrer: typeof document !== "undefined" ? document.referrer : "",
    hasBeforeInstallPrompt: hasPrompt,
  });
}

function scheduleBanner(): void {
  if (typeof window === "undefined") return;
  clearBannerTimer();
  if (
    !bannerEarned ||
    snapshot.isStandalone ||
    isInstalledFlagSet() ||
    !isSnoozeExpired() ||
    snapshot.installDialogOpen ||
    (!snapshot.canInstallNatively && !MOBILE_BANNER_PLATFORMS.has(snapshot.platform))
  ) {
    return;
  }

  bannerTimer = window.setTimeout(() => {
    bannerTimer = null;
    if (
      bannerEarned &&
      !snapshot.isStandalone &&
      !isInstalledFlagSet() &&
      isSnoozeExpired() &&
      !snapshot.installDialogOpen &&
      (snapshot.canInstallNatively || MOBILE_BANNER_PLATFORMS.has(snapshot.platform))
    ) {
      setSnapshot({ bannerVisible: true });
    }
  }, BANNER_DELAY_MS);
}

function checkForSwUpdate(throttleMs = 0): void {
  if (!swRegistration) return;
  const now = Date.now();
  if (throttleMs > 0 && now - lastUpdateCheckAt < throttleMs) return;
  lastUpdateCheckAt = now;
  void swRegistration.update().catch(() => {});
}

function attachRegistrationLifecycle(registration: ServiceWorkerRegistration): void {
  swRegistration = registration;

  if (registration.waiting && navigator.serviceWorker.controller) {
    setSnapshot({ hasUpdate: true });
  }

  registration.addEventListener("updatefound", () => {
    const installing = registration.installing;
    if (!installing) return;
    installing.addEventListener("statechange", () => {
      if (installing.state === "installed" && navigator.serviceWorker.controller) {
        setSnapshot({ hasUpdate: true });
      }
    });
  });
}

/**
 * Initializes PWA install detection, service worker registration, and update monitoring once per page load.
 */
export function initPwaRuntime(): void {
  if (typeof window === "undefined" || initialized) return;
  initialized = true;
  if (countVisit() >= 2) bannerEarned = true;

  const isStandalone = checkIsStandalone();
  const platform = computeCurrentPlatform(false);
  setSnapshot({
    hydrated: true,
    isStandalone,
    platform,
  });

  const syncStandaloneState = () => {
    const standalone = checkIsStandalone();
    if (standalone) {
      clearBannerTimer();
      setSnapshot({
        isStandalone: true,
        bannerVisible: false,
        installDialogOpen: false,
      });
    } else {
      setSnapshot({ isStandalone: false });
    }
  };

  try {
    window
      .matchMedia?.("(display-mode: standalone)")
      ?.addEventListener?.("change", syncStandaloneState);
    window
      .matchMedia?.("(display-mode: minimal-ui)")
      ?.addEventListener?.("change", syncStandaloneState);
  } catch {
    // Ignore unsupported MediaQueryList listeners.
  }

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredPrompt = event as BeforeInstallPromptEvent;
    safeRemoveStorage(INSTALLED_STORAGE_KEY);
    setSnapshot({
      canInstallNatively: true,
      platform: "chromium-prompt",
    });
    scheduleBanner();
  });

  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    clearBannerTimer();
    safeSetStorage(INSTALLED_STORAGE_KEY, "1");
    setSnapshot({
      canInstallNatively: false,
      bannerVisible: false,
      installDialogOpen: false,
      platform: computeCurrentPlatform(false),
    });
  });

  if (window.isSecureContext && "serviceWorker" in navigator) {
    lastUpdateCheckAt = Date.now();
    navigator.serviceWorker
      .register("/offline-worker.js", { scope: "/", updateViaCache: "none" })
      .then((registration) => {
        attachRegistrationLifecycle(registration);
      })
      .catch(() => {
        // Ignore service worker registration errors in restricted contexts.
      });

    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        checkForSwUpdate(VISIBILITY_UPDATE_THROTTLE_MS);
      }
    });

    window.addEventListener("online", () => {
      checkForSwUpdate(0);
    });

    updateInterval = window.setInterval(() => {
      checkForSwUpdate(0);
    }, PERIODIC_UPDATE_INTERVAL_MS);
  }

  scheduleBanner();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getClientSnapshot(): PwaSnapshot {
  return snapshot;
}

function getServerSnapshot(): PwaSnapshot {
  return SERVER_SNAPSHOT;
}

/**
 * Subscribes a React client component to the PWA runtime snapshot safely across SSR and hydration.
 */
export function usePwaSnapshot(): PwaSnapshot {
  return useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
}

/**
 * Triggers the native Chromium install prompt if available, or opens the guided install dialog.
 */
export async function openPwaInstall(): Promise<"accepted" | "dismissed" | "dialog"> {
  clearBannerTimer();
  const promptEvent = deferredPrompt;
  if (promptEvent) {
    deferredPrompt = null;
    try {
      await promptEvent.prompt();
      const choice = await promptEvent.userChoice;
      if (choice.outcome === "accepted") {
        safeSetStorage(INSTALLED_STORAGE_KEY, "1");
        setSnapshot({
          canInstallNatively: false,
          bannerVisible: false,
          installDialogOpen: false,
          platform: computeCurrentPlatform(false),
        });
        return "accepted";
      }
      safeSetStorage(SNOOZE_STORAGE_KEY, String(Date.now() + SNOOZE_DURATION_MS));
      setSnapshot({
        canInstallNatively: false,
        bannerVisible: false,
        platform: computeCurrentPlatform(false),
      });
      return "dismissed";
    } catch {
      // Fall through to the guided instructions dialog if prompt() cannot execute.
    }
  }

  setSnapshot({
    canInstallNatively: false,
    bannerVisible: false,
    installDialogOpen: true,
    platform: computeCurrentPlatform(false),
  });
  return "dialog";
}

export function closePwaInstallDialog(): void {
  setSnapshot({ installDialogOpen: false });
}

export function dismissPwaBanner(): void {
  clearBannerTimer();
  if (typeof window !== "undefined") {
    safeSetStorage(SNOOZE_STORAGE_KEY, String(Date.now() + SNOOZE_DURATION_MS));
  }
  setSnapshot({ bannerVisible: false });
}

export function dismissPwaUpdate(): void {
  setSnapshot({ hasUpdate: false });
}

function activateWaitingWorkerAndReload(waiting: ServiceWorker): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve();
      return;
    }
    let finished = false;
    const reloadOnce = () => {
      if (finished) return;
      finished = true;
      window.clearTimeout(fallbackTimer);
      window.location.reload();
      resolve();
    };
    const fallbackTimer = window.setTimeout(reloadOnce, 1_500);
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener("controllerchange", reloadOnce, { once: true });
    }
    try {
      waiting.postMessage({ type: "SKIP_WAITING" });
    } catch {
      reloadOnce();
    }
  });
}

/**
 * Activates a waiting service worker update if staged, otherwise checks for an update and reloads.
 */
export async function applyPwaUpdate(): Promise<void> {
  setSnapshot({ isRefreshing: true });
  if (typeof window === "undefined") return;

  const registration =
    swRegistration ??
    ("serviceWorker" in navigator
      ? await navigator.serviceWorker.getRegistration("/").catch(() => undefined)
      : undefined);

  if (registration?.waiting) {
    await activateWaitingWorkerAndReload(registration.waiting);
    return;
  }

  if (registration) {
    await registration.update().catch(() => {});
    if (registration.waiting) {
      await activateWaitingWorkerAndReload(registration.waiting);
      return;
    }
    if (registration.installing) {
      const installing = registration.installing;
      const becameWaiting = await new Promise<boolean>((resolve) => {
        const timeout = window.setTimeout(() => resolve(false), 1_500);
        installing.addEventListener("statechange", () => {
          if (installing.state === "installed") {
            window.clearTimeout(timeout);
            resolve(true);
          } else if (installing.state === "redundant") {
            window.clearTimeout(timeout);
            resolve(false);
          }
        });
      });
      if (becameWaiting && registration.waiting) {
        await activateWaitingWorkerAndReload(registration.waiting);
        return;
      }
    }
  }

  window.location.reload();
}

const OFFLINE_WARM_PREFIX = "redihealth:offline-warmed:v2:";
const OFFLINE_WARM_TTL_MS = 24 * 60 * 60 * 1_000;
const OFFLINE_WARM_TIMEOUT_MS = 60_000;
const OFFLINE_SUPPORTED_LOCALES = new Set<Lang>(["ro", "en", "sq", "it", "hr", "rom", "ru"]);
const warmedLocalesSession = new Set<string>();
const cachedRoutesSession = new Set<string>();

type NetworkInformationLike = { saveData?: boolean; effectiveType?: string };

function isDataSaverOrSlowConnection(): boolean {
  if (typeof navigator === "undefined") return false;
  const conn = (navigator as Navigator & { connection?: NetworkInformationLike }).connection;
  if (!conn) return false;
  if (conn.saveData) return true;
  return conn.effectiveType === "slow-2g" || conn.effectiveType === "2g";
}

function isFastConnection(): boolean {
  if (typeof navigator === "undefined") return false;
  const conn = (navigator as Navigator & { connection?: NetworkInformationLike }).connection;
  if (!conn) return true;
  if (conn.saveData) return false;
  return conn.effectiveType !== "slow-2g" && conn.effectiveType !== "2g" && conn.effectiveType !== "3g";
}

function collectLoadedNextAssets(): string[] {
  if (typeof window === "undefined" || typeof performance === "undefined") return [];
  if (typeof performance.getEntriesByType !== "function") return [];
  try {
    return performance
      .getEntriesByType("resource")
      .map((entry) => entry.name)
      .filter((name) => {
        try {
          const parsed = new URL(name, window.location.origin);
          return parsed.origin === window.location.origin && parsed.pathname.startsWith("/_next/static/");
        } catch {
          return false;
        }
      });
  } catch {
    return [];
  }
}

function isSensitiveClientPath(pathname: string): boolean {
  const bare = pathname.replace(/^\/(ro|en|sq|it|hr|rom|ru)(?=\/|$)/, "") || "/";
  return (
    bare === "/panel" ||
    bare.startsWith("/panel/") ||
    bare === "/offline" ||
    bare.startsWith("/offline/") ||
    bare === "/patient-portal" ||
    bare.startsWith("/patient-portal/") ||
    bare === "/sign-in" ||
    bare.startsWith("/sign-in/") ||
    bare === "/health-check/note" ||
    bare.startsWith("/health-check/note/") ||
    bare === "/medic-online/meet" ||
    bare.startsWith("/medic-online/meet/") ||
    bare === "/medic-online/asteptare" ||
    bare.startsWith("/medic-online/asteptare/")
  );
}

function scheduleIdle(callback: () => void, delayMs: number): () => void {
  if (typeof window === "undefined") return () => {};
  const win = window as Window & {
    requestIdleCallback?: (cb: () => void, opts?: { timeout?: number }) => number;
    cancelIdleCallback?: (id: number) => void;
  };
  let cancelled = false;
  let idleId = 0;
  let timerId = 0;

  const run = () => {
    if (!cancelled) callback();
  };

  if (typeof win.requestIdleCallback === "function") {
    timerId = window.setTimeout(() => {
      if (cancelled) return;
      idleId = win.requestIdleCallback(run, { timeout: 2_000 });
    }, delayMs);
  } else {
    timerId = window.setTimeout(run, delayMs);
  }

  return () => {
    cancelled = true;
    if (timerId) window.clearTimeout(timerId);
    if (idleId) win.cancelIdleCallback?.(idleId);
  };
}

function postWorkerMessage<T>(
  worker: ServiceWorker,
  message: Record<string, unknown>,
  timeoutMs: number,
): Promise<T | null> {
  return new Promise((resolve) => {
    if (typeof MessageChannel === "undefined") {
      resolve(null);
      return;
    }
    const channel = new MessageChannel();
    const timer = window.setTimeout(() => {
      try {
        channel.port1.close();
      } catch {
        // Ignore close failures.
      }
      resolve(null);
    }, timeoutMs);
    channel.port1.onmessage = (event) => {
      window.clearTimeout(timer);
      try {
        channel.port1.close();
      } catch {
        // Ignore close failures.
      }
      resolve((event.data as T) ?? null);
    };
    try {
      worker.postMessage(message, [channel.port2]);
    } catch {
      window.clearTimeout(timer);
      resolve(null);
    }
  });
}

async function resolveActiveServiceWorker(): Promise<ServiceWorker | null> {
  if (typeof window === "undefined" || !window.isSecureContext || !("serviceWorker" in navigator)) {
    return null;
  }
  try {
    const registration = await Promise.race([
      navigator.serviceWorker.ready,
      new Promise<null>((resolve) => window.setTimeout(() => resolve(null), 5_000)),
    ]);
    if (!registration) return null;
    return registration.active ?? registration.waiting ?? registration.installing ?? null;
  } catch {
    return null;
  }
}

/**
 * Quietly warms core non-PHI public routes, 8 guides, static chunks, search index, and clinics during idle time.
 */
export function warmOfflineAppForLocale(lang: string): () => void {
  const safeLang: Lang = OFFLINE_SUPPORTED_LOCALES.has(lang as Lang) ? (lang as Lang) : "ro";
  if (
    typeof window === "undefined" ||
    isBrowserOffline() ||
    isDataSaverOrSlowConnection() ||
    warmedLocalesSession.has(safeLang)
  ) {
    return () => {};
  }

  return scheduleIdle(() => {
    if (
      isBrowserOffline() ||
      isDataSaverOrSlowConnection() ||
      warmedLocalesSession.has(safeLang)
    ) {
      return;
    }
    warmedLocalesSession.add(safeLang);

    const lastWarmedRaw = safeGetStorage(`${OFFLINE_WARM_PREFIX}${safeLang}`);
    const lastWarmed = lastWarmedRaw ? Number(lastWarmedRaw) : 0;
    const alreadyWarmedToday =
      Number.isFinite(lastWarmed) && lastWarmed > 0 && Date.now() - lastWarmed < OFFLINE_WARM_TTL_MS;

    void (async () => {
      await Promise.allSettled([
        import("@/lib/i18n/smart-search-copy"),
        import("@/lib/search/smart-search-engine"),
        import("@/components/emergency/EmergencySignsModal"),
        import("@/components/emergency/EmergencyDialerGate"),
      ]);
      void warmCountryInstitutes(countryForLang(safeLang));

      let cacheReady = false;
      if (alreadyWarmedToday && "caches" in window) {
        try {
          const pagesCache = await window.caches.open("redihealth-pages-v1");
          cacheReady = Boolean(await pagesCache.match(`/${safeLang}`));
        } catch {
          cacheReady = false;
        }
      }
      if (alreadyWarmedToday && cacheReady) return;

      const worker = await resolveActiveServiceWorker();
      if (!worker || isBrowserOffline()) {
        warmedLocalesSession.delete(safeLang);
        return;
      }

      const reply = await postWorkerMessage<{ ok?: boolean }>(
        worker,
        {
          type: "WARM_OFFLINE_APP",
          lang: safeLang,
          assets: collectLoadedNextAssets(),
          includeGuides: true,
          includeModels: isFastConnection(),
        },
        OFFLINE_WARM_TIMEOUT_MS,
      );
      if (reply?.ok) {
        safeSetStorage(`${OFFLINE_WARM_PREFIX}${safeLang}`, String(Date.now()));
      } else {
        warmedLocalesSession.delete(safeLang);
      }
    })();
  }, 3_000);
}

/**
 * Ensures soft-navigated public pages and their client chunks are stored for offline revisit.
 */
export function cacheVisitedPublicPage(pathname: string | null | undefined): () => void {
  if (
    typeof window === "undefined" ||
    !pathname ||
    isBrowserOffline() ||
    isDataSaverOrSlowConnection() ||
    isSensitiveClientPath(pathname) ||
    cachedRoutesSession.has(pathname)
  ) {
    return () => {};
  }

  return scheduleIdle(() => {
    if (isBrowserOffline() || cachedRoutesSession.has(pathname)) return;
    cachedRoutesSession.add(pathname);
    void (async () => {
      const worker = await resolveActiveServiceWorker();
      if (!worker || isBrowserOffline()) {
        cachedRoutesSession.delete(pathname);
        return;
      }
      await postWorkerMessage(
        worker,
        {
          type: "CACHE_PUBLIC_PAGE",
          url: pathname,
          assets: collectLoadedNextAssets(),
        },
        15_000,
      );
    })();
  }, 1_200);
}

export function _resetPwaRuntimeForTest(): void {
  clearBannerTimer();
  if (updateInterval !== null && typeof window !== "undefined") {
    window.clearInterval(updateInterval);
  }
  updateInterval = null;
  initialized = false;
  bannerEarned = false;
  deferredPrompt = null;
  swRegistration = null;
  lastUpdateCheckAt = 0;
  warmedLocalesSession.clear();
  cachedRoutesSession.clear();
  snapshot = SERVER_SNAPSHOT;
  listeners.clear();
}
