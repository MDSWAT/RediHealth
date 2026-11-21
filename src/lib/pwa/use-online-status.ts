import { useSyncExternalStore } from "react";

let swDetectedOffline = false;
let listenersInitialized = false;
const listeners = new Set<() => void>();

function notifyListeners(): void {
  for (const listener of listeners) {
    listener();
  }
}

function setSwOfflineState(nextOffline: boolean): void {
  if (swDetectedOffline === nextOffline) return;
  swDetectedOffline = nextOffline;
  notifyListeners();
}

function queryWorkerOfflineStatus(worker: ServiceWorker | null | undefined): void {
  if (!worker || typeof MessageChannel === "undefined") return;
  try {
    const channel = new MessageChannel();
    const timer = window.setTimeout(() => {
      channel.port1.onmessage = null;
      channel.port1.close();
    }, 1500);
    channel.port1.onmessage = (event: MessageEvent<{ offline?: boolean }>) => {
      window.clearTimeout(timer);
      channel.port1.onmessage = null;
      channel.port1.close();
      if (typeof event.data?.offline === "boolean") {
        setSwOfflineState(event.data.offline);
      }
    };
    worker.postMessage({ type: "GET_OFFLINE_STATUS" }, [channel.port2]);
  } catch {
    // Ignore message channel failures when the worker is unavailable
  }
}

function syncInitialSwOfflineStatus(): void {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
  const controller = navigator.serviceWorker.controller;
  if (controller) {
    queryWorkerOfflineStatus(controller);
    return;
  }
  if (typeof navigator.serviceWorker.getRegistration === "function") {
    navigator.serviceWorker
      .getRegistration()
      .then((registration) => {
        queryWorkerOfflineStatus(registration?.active);
      })
      .catch(() => {});
  }
}

function ensureConnectivityListeners(): void {
  if (listenersInitialized || typeof window === "undefined") return;
  listenersInitialized = true;

  window.addEventListener("online", () => {
    swDetectedOffline = false;
    notifyListeners();
  });
  window.addEventListener("offline", () => {
    notifyListeners();
  });

  if (typeof navigator !== "undefined" && "serviceWorker" in navigator) {
    const swContainer = navigator.serviceWorker;
    if (typeof swContainer.addEventListener === "function") {
      swContainer.addEventListener("message", (event: MessageEvent) => {
        const data = event.data as { type?: string; offline?: boolean } | null;
        if (data?.type === "OFFLINE_STATUS" && typeof data.offline === "boolean") {
          setSwOfflineState(data.offline);
        }
      });
      swContainer.addEventListener("controllerchange", () => {
        queryWorkerOfflineStatus(swContainer.controller);
      });
    }
    syncInitialSwOfflineStatus();
  }
}

export function isBrowserOffline(): boolean {
  return (typeof navigator !== "undefined" && navigator.onLine === false) || swDetectedOffline;
}

function subscribeOnlineStatus(listener: () => void): () => void {
  if (typeof window === "undefined" || typeof window.addEventListener !== "function") {
    return () => {};
  }
  ensureConnectivityListeners();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getClientOnlineSnapshot(): boolean {
  return !isBrowserOffline();
}

function getServerOnlineSnapshot(): boolean {
  return true;
}

/**
 * Tracks browser connectivity safely across SSR and hydration (`true` on server and when online).
 */
export function useOnlineStatus(): boolean {
  return useSyncExternalStore(
    subscribeOnlineStatus,
    getClientOnlineSnapshot,
    getServerOnlineSnapshot,
  );
}
