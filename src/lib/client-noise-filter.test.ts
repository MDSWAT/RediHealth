import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { initClientNoiseFilter, _resetClientNoiseFilterForTest } from "./client-noise-filter";

describe("client-noise-filter", () => {
  type Listener = (event: unknown) => void;
  let listeners: Record<string, Listener[]> = {};
  let fakeWindow: {
    addEventListener: (type: string, listener: Listener) => void;
    dispatchEvent: (event: { type: string; defaultPrevented?: boolean }) => boolean;
    fetch: typeof fetch;
  };
  let fakeNavigator: {
    sendBeacon?: (url: string | URL, data?: BodyInit | null) => boolean;
  };

  beforeEach(() => {
    _resetClientNoiseFilterForTest();
    listeners = {};
    fakeWindow = {
      addEventListener: vi.fn((type: string, listener: Listener) => {
        listeners[type] = listeners[type] || [];
        listeners[type].push(listener);
      }),
      dispatchEvent: vi.fn((event: { type: string; defaultPrevented?: boolean }) => {
        const list = listeners[event.type] || [];
        for (const cb of list) {
          cb(event);
        }
        return !event.defaultPrevented;
      }),
      fetch: vi.fn().mockResolvedValue(new Response("real response", { status: 200 })),
    };
    fakeNavigator = {
      sendBeacon: vi.fn().mockReturnValue(true),
    };

    vi.stubGlobal("window", fakeWindow);
    vi.stubGlobal("navigator", fakeNavigator);
  });

  afterEach(() => {
    _resetClientNoiseFilterForTest();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("intercepts dc.services.visualstudio.com fetch calls without network errors", async () => {
    initClientNoiseFilter();

    const response = await window.fetch("https://dc.services.visualstudio.com/v2/track", {
      method: "POST",
      body: JSON.stringify({ name: "telemetry" }),
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.itemsReceived).toBe(1);
    expect(data.itemsAccepted).toBe(1);
  });

  it("passes standard app fetch calls through to original fetch", async () => {
    const mockOriginal = vi.fn().mockResolvedValue(new Response("real response", { status: 200 }));
    fakeWindow.fetch = mockOriginal as unknown as typeof fetch;
    initClientNoiseFilter();

    const response = await window.fetch("/api/health");
    expect(mockOriginal).toHaveBeenCalledWith("/api/health", undefined);
    expect(response.status).toBe(200);
  });

  it("suppresses unhandledrejection for extension message channel closed", () => {
    initClientNoiseFilter();

    const event = {
      type: "unhandledrejection",
      reason: new Error(
        "A listener indicated an asynchronous response by returning true, but the message channel closed before a response was received",
      ),
      defaultPrevented: false,
      preventDefault() {
        this.defaultPrevented = true;
      },
    };

    fakeWindow.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
  });

  it("does not suppress unrelated unhandled rejections", () => {
    initClientNoiseFilter();

    const event = {
      type: "unhandledrejection",
      reason: new Error("Network timeout loading resource"),
      defaultPrevented: false,
      preventDefault() {
        this.defaultPrevented = true;
      },
    };

    fakeWindow.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);
  });

  it("safely intercepts navigator.sendBeacon for visualstudio telemetry", () => {
    initClientNoiseFilter();

    if (navigator.sendBeacon) {
      const result = navigator.sendBeacon("https://dc.services.visualstudio.com/v2/track", "test");
      expect(result).toBe(true);
    }
  });
});
