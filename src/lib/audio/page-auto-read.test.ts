import { readFileSync } from "node:fs";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { isPageAutoReadAllowedRoute } from "@/lib/audio/page-auto-read";
import { HealthSpeechEngine } from "@/lib/audio/speech-engine";

function makeVoice(opts: {
  name: string;
  lang: string;
  localService?: boolean;
}): SpeechSynthesisVoice {
  return {
    name: opts.name,
    lang: opts.lang,
    localService: opts.localService ?? false,
    voiceURI: opts.name,
    default: false,
  } as SpeechSynthesisVoice;
}

function readRepoFile(relPath: string): string {
  return readFileSync(path.resolve(process.cwd(), relPath), "utf8");
}

function createEventWindowMock() {
  const listeners = new Map<string, Set<EventListenerOrEventListenerObject>>();
  const addEventListener = vi.fn(
    (type: string, handler: EventListenerOrEventListenerObject) => {
      if (!listeners.has(type)) listeners.set(type, new Set());
      listeners.get(type)?.add(handler);
    },
  );
  const removeEventListener = vi.fn(
    (type: string, handler: EventListenerOrEventListenerObject) => {
      listeners.get(type)?.delete(handler);
    },
  );
  const dispatch = (type: string) => {
    const event = { type } as Event;
    for (const handler of Array.from(listeners.get(type) ?? [])) {
      if (typeof handler === "function") {
        handler(event);
      } else {
        handler.handleEvent(event);
      }
    }
  };
  return { listeners, addEventListener, removeEventListener, dispatch };
}

describe("isPageAutoReadAllowedRoute", () => {
  it("allows public pages across locales", () => {
    const allowedRoutes = [
      "/",
      "/ro",
      "/en",
      "/ro/find-help",
      "/en/health-information",
      "/it/health-information/fever",
      "/sq/medic-online",
      "/hr/health-assistant",
      "/ru/health-check",
      "/ro/prescription-review",
      "/en/mediatori",
      "/ro/about",
      "/en/accessibility",
      "/it/privacy",
      "/hr/terms",
      "/sq/contact",
      "/ru/report-issue",
      "/ro/stiri",
    ];

    for (const route of allowedRoutes) {
      expect(isPageAutoReadAllowedRoute(route), route).toBe(true);
    }
  });

  it("blocks clinical panels, auth, demo, offline, live calls, and health-check note", () => {
    const blockedRoutes = [
      "/panel",
      "/ro/panel",
      "/en/panel/patients",
      "/demo",
      "/ro/demo",
      "/en/demo/triage",
      "/offline",
      "/ro/offline",
      "/medic-online/meet",
      "/ro/medic-online/meet/room-42",
      "/sign-in",
      "/en/sign-in",
      "/patient-portal",
      "/ro/patient-portal/abc",
      "/contul-meu",
      "/ro/contul-meu",
      "/health-check/note",
      "/ro/health-check/note",
    ];

    for (const route of blockedRoutes) {
      expect(isPageAutoReadAllowedRoute(route), route).toBe(false);
    }
  });
});

describe("HealthSpeechEngine resolveVoices and WebSpeech voice readiness", () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    globalThis.fetch = originalFetch;
    HealthSpeechEngine.getInstance().resetForTests();
  });

  it("resolves immediately when speechSynthesis.getVoices() already has voices", async () => {
    const voices = [makeVoice({ name: "Ioana", lang: "ro-RO", localService: true })];
    vi.stubGlobal("window", {
      speechSynthesis: {
        getVoices: () => voices,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        speak: vi.fn(),
        cancel: vi.fn(),
      },
    });

    const engine = HealthSpeechEngine.getInstance();
    engine.resetForTests();
    await expect(engine.resolveVoices(800)).resolves.toEqual(voices);
  });

  it("awaits voiceschanged when getVoices() is initially empty and speaks once voices arrive", async () => {
    let availableVoices: SpeechSynthesisVoice[] = [];
    const voiceListeners = new Set<() => void>();
    const spokenTexts: string[] = [];

    class MockUtterance {
      lang = "";
      rate = 1;
      pitch = 1;
      voice: SpeechSynthesisVoice | null = null;
      onstart: (() => void) | null = null;
      onboundary: ((e: unknown) => void) | null = null;
      onend: (() => void) | null = null;
      onerror: ((e: unknown) => void) | null = null;
      text: string;
      constructor(text: string) {
        this.text = text;
      }
    }

    const synthMock = {
      getVoices: vi.fn(() => availableVoices),
      addEventListener: vi.fn((type: string, cb: () => void) => {
        if (type === "voiceschanged") voiceListeners.add(cb);
      }),
      removeEventListener: vi.fn((type: string, cb: () => void) => {
        if (type === "voiceschanged") voiceListeners.delete(cb);
      }),
      speak: vi.fn((u: MockUtterance) => {
        spokenTexts.push(u.text);
      }),
      cancel: vi.fn(),
    };

    vi.stubGlobal("window", { speechSynthesis: synthMock });
    vi.stubGlobal("SpeechSynthesisUtterance", MockUtterance);
    globalThis.fetch = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({ configured: false }), { status: 200 }),
    );

    const engine = HealthSpeechEngine.getInstance();
    engine.resetForTests();
    await engine.probeNeuralServer();

    engine.speak("Salutări din RediHealth.", { lang: "ro-RO" });
    expect(spokenTexts).toHaveLength(0);
    expect(engine.isSpeaking()).toBe(true);

    availableVoices = [makeVoice({ name: "Ioana", lang: "ro-RO", localService: true })];
    for (const listener of Array.from(voiceListeners)) {
      listener();
    }

    await vi.waitFor(() => {
      expect(spokenTexts).toEqual(["Salutări din RediHealth."]);
    });
  });

  it("polls every 100ms if voiceschanged never fires and cancels cleanly if stop() happens mid-wait", async () => {
    let availableVoices: SpeechSynthesisVoice[] = [];
    const spokenTexts: string[] = [];

    class MockUtterance {
      lang = "";
      rate = 1;
      pitch = 1;
      voice: SpeechSynthesisVoice | null = null;
      onstart: (() => void) | null = null;
      onboundary: ((e: unknown) => void) | null = null;
      onend: (() => void) | null = null;
      onerror: ((e: unknown) => void) | null = null;
      text: string;
      constructor(text: string) {
        this.text = text;
      }
    }

    const synthMock = {
      getVoices: vi.fn(() => availableVoices),
      speak: vi.fn((u: MockUtterance) => {
        spokenTexts.push(u.text);
      }),
      cancel: vi.fn(),
    };

    vi.stubGlobal("window", { speechSynthesis: synthMock });
    vi.stubGlobal("SpeechSynthesisUtterance", MockUtterance);
    globalThis.fetch = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({ configured: false }), { status: 200 }),
    );

    const engine = HealthSpeechEngine.getInstance();
    engine.resetForTests();
    await engine.probeNeuralServer();

    const voicesPromise = engine.resolveVoices(800);
    await vi.advanceTimersByTimeAsync(150);
    availableVoices = [makeVoice({ name: "Daniel", lang: "en-GB", localService: true })];
    await vi.advanceTimersByTimeAsync(100);
    await expect(voicesPromise).resolves.toHaveLength(1);

    // Reset back to empty voices and stop before voices arrive
    availableVoices = [];
    engine.speak("Do not speak after stop.", { lang: "en-GB" });
    engine.stop();
    availableVoices = [makeVoice({ name: "Daniel", lang: "en-GB", localService: true })];
    await vi.advanceTimersByTimeAsync(850);
    expect(spokenTexts).toHaveLength(0);
    expect(engine.isSpeaking()).toBe(false);
  });
});

describe("HealthSpeechEngine unlockFromGesture and isAudioUnlocked", () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    vi.unstubAllGlobals();
    globalThis.fetch = originalFetch;
    HealthSpeechEngine.getInstance().resetForTests();
  });

  it("unlocks shared Audio element on gesture/custom event, restores mute state, removes user gesture listeners, and reuses unlocked audio", async () => {
    const audioInstances: Array<{
      src: string;
      preload: string;
      muted: boolean;
      currentTime: number;
      playbackRate: number;
      onplay: (() => void) | null;
      ontimeupdate: (() => void) | null;
      onended: (() => void) | null;
      onerror: (() => void) | null;
      pause: ReturnType<typeof vi.fn>;
      play: ReturnType<typeof vi.fn>;
      removeAttribute: ReturnType<typeof vi.fn>;
    }> = [];

    class MockAudio {
      src = "";
      preload = "";
      muted = false;
      currentTime = 0;
      playbackRate = 1;
      onplay: (() => void) | null = null;
      ontimeupdate: (() => void) | null = null;
      onended: (() => void) | null = null;
      onerror: (() => void) | null = null;
      pause = vi.fn();
      removeAttribute = vi.fn(() => {
        this.src = "";
      });
      play = vi.fn(async () => {
        this.onplay?.();
      });
      constructor() {
        audioInstances.push(this);
      }
    }

    const winMock = createEventWindowMock();
    const getVoicesMock = vi.fn(() => []);

    vi.stubGlobal("window", {
      addEventListener: winMock.addEventListener,
      removeEventListener: winMock.removeEventListener,
      speechSynthesis: {
        getVoices: getVoicesMock,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      },
    });
    vi.stubGlobal("Audio", MockAudio);

    const fakeMp3 = Uint8Array.from([0xff, 0xfb, 0x90, 0x64, 0x11, 0x22]);
    globalThis.fetch = vi.fn<typeof fetch>(async (input, init) => {
      const url = typeof input === "string" ? input : input instanceof Request ? input.url : String(input);
      const method = (init?.method ?? "GET").toUpperCase();
      if (url.endsWith("/api/tts") && method === "GET") {
        return new Response(JSON.stringify({ configured: true }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
      return new Response(fakeMp3, {
        status: 200,
        headers: { "Content-Type": "audio/mpeg" },
      });
    });

    const engine = HealthSpeechEngine.getInstance();
    engine.resetForTests();
    expect(engine.isAudioUnlocked()).toBe(false);

    await engine.probeNeuralServer();
    expect(winMock.listeners.get("click")?.size).toBe(1);
    expect(winMock.listeners.get("touchend")?.size).toBe(1);
    expect(winMock.listeners.get("keydown")?.size).toBe(1);
    expect(winMock.listeners.get("redihealth:unlock-audio")?.size).toBe(1);

    winMock.dispatch("redihealth:unlock-audio");

    await vi.waitFor(() => {
      expect(engine.isAudioUnlocked()).toBe(true);
    });

    expect(getVoicesMock).toHaveBeenCalled();
    expect(audioInstances).toHaveLength(1);
    expect(audioInstances[0]?.pause).toHaveBeenCalledTimes(1);
    expect(audioInstances[0]?.removeAttribute).toHaveBeenCalledWith("src");
    expect(audioInstances[0]?.muted).toBe(false);
    expect(winMock.listeners.get("click")?.size).toBe(0);
    expect(winMock.listeners.get("touchend")?.size).toBe(0);
    expect(winMock.listeners.get("keydown")?.size).toBe(0);
    expect(winMock.listeners.get("redihealth:unlock-audio")?.size).toBe(1);

    engine.speak("Text de test.", { lang: "ro-RO" });
    await vi.waitFor(() => {
      expect(audioInstances[0]?.play).toHaveBeenCalledTimes(2);
    });
    expect(audioInstances).toHaveLength(1);
    expect(audioInstances[0]?.muted).toBe(false);
  });

  it("keeps audioUnlocked false and preserves gesture listeners if unlock play() rejects", async () => {
    class RejectingAudio {
      src = "";
      preload = "";
      muted = false;
      currentTime = 0;
      pause = vi.fn();
      removeAttribute = vi.fn(() => {
        this.src = "";
      });
      play = vi.fn(async () => {
        throw new Error("NotAllowedError");
      });
    }

    const winMock = createEventWindowMock();
    vi.stubGlobal("window", {
      addEventListener: winMock.addEventListener,
      removeEventListener: winMock.removeEventListener,
    });
    vi.stubGlobal("Audio", RejectingAudio);
    globalThis.fetch = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({ configured: true }), { status: 200 }),
    );

    const engine = HealthSpeechEngine.getInstance();
    engine.resetForTests();
    await engine.probeNeuralServer();

    winMock.dispatch("click");
    await new Promise((r) => setTimeout(r, 0));

    expect(engine.isAudioUnlocked()).toBe(false);
    expect(winMock.listeners.get("click")?.size).toBe(1);
  });
});

describe("Auto-read source invariants across page-auto-read, ListenButton, SiteChrome, and readingTools", () => {
  it("uses usePathname, checks lastAutoReadSignature inside attemptStart, guards hidden/inert anchors, and watches #mobile-menu:not([inert]) and dialog[open]", () => {
    const autoReadSrc = readRepoFile("src/lib/audio/page-auto-read.ts");
    expect(autoReadSrc).toContain('import { usePathname } from "next/navigation";');
    expect(autoReadSrc).toContain("usePathname()");
    expect(autoReadSrc).toContain("[autoRead, enabled, voiceAllowed, uiLang, effectiveContentLang, contentKey, pathname]");
    expect(autoReadSrc).toContain("dialog[open], #mobile-menu:not([inert])");
    expect(autoReadSrc).toContain('closest?.("[inert], [aria-hidden=\'true\']")');
    expect(autoReadSrc).toContain("document.body?.getClientRects?.()");
    expect(autoReadSrc).toContain("el.getClientRects().length === 0");
    expect(autoReadSrc).toContain("new MutationObserver");
    expect(autoReadSrc).toContain('attributeFilter: ["open", "inert", "aria-hidden"]');
    expect(autoReadSrc).toContain("scheduleAttempt(220)");
    expect(autoReadSrc).toContain("speechEngine.unlockFromGesture()");
    expect(autoReadSrc).toContain('window.addEventListener("click", onFirstGesture');
    expect(autoReadSrc).toContain('window.addEventListener("touchend", onFirstGesture');
    expect(autoReadSrc).toContain('window.addEventListener("keydown", onFirstGesture');
    expect(autoReadSrc).not.toContain("pointerdown");
    expect(autoReadSrc).toContain('a[href], button[aria-pressed], dialog[open]');

    const signatureIndex = autoReadSrc.indexOf("const signature =");
    const attemptStartIndex = autoReadSrc.indexOf("function attemptStart()");
    const signatureCheckIndex = autoReadSrc.indexOf("if (lastAutoReadSignature === signature) return;");
    expect(signatureIndex).toBeGreaterThan(-1);
    expect(attemptStartIndex).toBeGreaterThan(signatureIndex);
    expect(signatureCheckIndex).toBeGreaterThan(attemptStartIndex);

    const gestureFnStart = autoReadSrc.indexOf("function onFirstGesture");
    const closestCheckIndex = autoReadSrc.indexOf('a[href], button[aria-pressed], dialog[open]', gestureFnStart);
    const cleanupCallIndex = autoReadSrc.indexOf("cleanupUnlockListeners();", closestCheckIndex);
    expect(closestCheckIndex).toBeGreaterThan(gestureFnStart);
    expect(cleanupCallIndex).toBeGreaterThan(closestCheckIndex);
  });

  it("passes buttonRef as anchorRef from ListenButton into usePageAutoRead", () => {
    const listenSrc = readRepoFile("src/components/ui/ListenButton.tsx");
    expect(listenSrc).toContain("useRef<HTMLButtonElement | null>(null)");
    expect(listenSrc).toContain("anchorRef: buttonRef");
    expect(listenSrc).toContain("ref={buttonRef}");
  });

  it("tracks routeKey in SiteChrome without breaking PwaExperience invariants", () => {
    const chromeSrc = readRepoFile("src/components/layout/SiteChrome.tsx");
    expect(chromeSrc).toContain("prevRouteKeyRef");
    expect(chromeSrc).toContain("prevRouteKeyRef.current !== null && prevRouteKeyRef.current !== routeKey");
    expect(chromeSrc).not.toContain("rounded-full");
    expect(chromeSrc).not.toContain("transition-all");
    expect(chromeSrc).not.toContain("focus-visible:ring-sapphire");
  });

  it("primes OS voices and schedules 250ms/800ms timers in readingTools.subscribeVoices", () => {
    const readingToolsSrc = readRepoFile("src/components/health-check/readingTools.ts");
    expect(readingToolsSrc).toContain("synth.getVoices?.()");
    expect(readingToolsSrc).toContain("setTimeout(listener, 250)");
    expect(readingToolsSrc).toContain("setTimeout(listener, 800)");
    expect(readingToolsSrc).toContain("clearTimeout(id)");
  });
});
