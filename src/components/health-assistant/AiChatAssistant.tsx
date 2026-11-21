"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import {
  AI_CHAT_CHROME_COPY,
  AI_CHAT_COPY,
  AI_CHAT_MAX_LENGTH,
} from "@/components/health-assistant/ai-chat-copy";
import { dangerPanel } from "@/components/health-assistant/step-ui";
import { useReadAloud } from "@/components/health-check/readingTools";
import { captchaErrorMessage, RecaptchaNotice, useRecaptcha } from "@/components/security/RecaptchaProvider";
import { Button } from "@/components/ui/Button";
import {
  AiAssistantIcon,
  ArrowRightIcon,
  RefreshIcon,
  VolumeIcon,
  VolumeMuteIcon,
} from "@/components/ui/icons";
import { speechEngine } from "@/lib/audio/speech-engine";
import { useLanguage } from "@/lib/i18n/language-context";
import { getOfflineUiCopy } from "@/lib/i18n/offline-copy";
import { DEFAULT_LANG, withLangPrefix } from "@/lib/i18n/routing";
import type { Lang } from "@/lib/i18n/translations";
import type { AssistantResponse } from "@/lib/health-assistant";
import { isBrowserOffline, useOnlineStatus } from "@/lib/pwa/use-online-status";

type CareLevel = AssistantResponse["careLevel"];

type ChatMessage = {
  id: number;
  role: "user" | "assistant";
  content: string;
  time: string;
  outOfScope?: boolean;
  responseKind?: AssistantResponse["responseKind"];
  careLevel?: CareLevel;
  possibleCause?: string;
  questions?: string[];
};

type BrowserSpeechRecognition = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: { results: ArrayLike<{ isFinal?: boolean; 0?: { transcript?: string } }> }) => void) | null;
  onerror: ((event: { error?: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

type SpeechRecognitionCtor = new () => BrowserSpeechRecognition;

const HISTORY_ITEMS = 6;
const HISTORY_ITEM_LENGTH = 500;
const VOICE_PREF_KEY = "redihealth_ai_voice_v1";

const SPEECH_RECOGNITION_LANG: Record<Lang, string> = {
  ro: "ro-RO",
  en: "en-GB",
  sq: "sq-AL",
  it: "it-IT",
  hr: "hr-HR",
  rom: "ro-RO",
  ru: "ru-RU",
};

function formatTime(): string {
  try {
    return new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit" }).format(new Date());
  } catch {
    return "";
  }
}

function MicIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <rect x="9" y="2" width="6" height="12" rx="3" />
      <path d="M5 10a7 7 0 0 0 14 0" />
      <line x1="12" y1="17" x2="12" y2="22" />
      <line x1="8" y1="22" x2="16" y2="22" />
    </svg>
  );
}

function HelpCircleIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9.25a2.5 2.5 0 0 1 4.8.9c0 1.6-2.3 2-2.3 3.35" />
      <circle cx="12" cy="17" r="0.6" fill="currentColor" />
    </svg>
  );
}

function InfoCircleIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <circle cx="12" cy="12" r="9" />
      <line x1="12" y1="11" x2="12" y2="16.5" />
      <circle cx="12" cy="7.5" r="0.6" fill="currentColor" />
    </svg>
  );
}

function ExpandIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <polyline points="15 3 21 3 21 9" />
      <polyline points="9 21 3 21 3 15" />
      <line x1="21" y1="3" x2="14" y2="10" />
      <line x1="3" y1="21" x2="10" y2="14" />
    </svg>
  );
}

function MinimizeIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <polyline points="4 14 10 14 10 20" />
      <polyline points="20 10 14 10 14 4" />
      <line x1="14" y1="10" x2="21" y2="3" />
      <line x1="3" y1="21" x2="10" y2="14" />
    </svg>
  );
}

const voicePrefListeners = new Set<() => void>();

function subscribeVoicePref(cb: () => void): () => void {
  voicePrefListeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === VOICE_PREF_KEY) cb();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    voicePrefListeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

function getVoicePrefSnapshot(): boolean {
  try {
    return window.localStorage.getItem(VOICE_PREF_KEY) !== "0";
  } catch {
    return true;
  }
}

function getVoicePrefServerSnapshot(): boolean {
  return true;
}

function writeVoicePref(enabled: boolean) {
  try {
    window.localStorage.setItem(VOICE_PREF_KEY, enabled ? "1" : "0");
  } catch {
    // Ignore storage errors in restricted contexts.
  }
  for (const listener of voicePrefListeners) listener();
}

/**
 * Clean, distraction-free WhatsApp/Claude-style AI health chat:
 * - Voice replies ON by default with synchronous gesture audio-unlock so replies always play reliably.
 * - Tap microphone to speak and auto-send on pause, with clear localized error feedback.
 * - Common questions (Întrebări frecvente) and AI safety/privacy info tucked behind clean header buttons.
 * - 1-tap full-screen mode.
 */
export function AiChatAssistant() {
  const { lang } = useLanguage();
  const isOnline = useOnlineStatus();
  const offlineCopy = getOfflineUiCopy(lang);
  const t = AI_CHAT_COPY[lang] ?? AI_CHAT_COPY[DEFAULT_LANG];
  const chrome = AI_CHAT_CHROME_COPY[lang] ?? AI_CHAT_CHROME_COPY[DEFAULT_LANG];
  const executeCaptcha = useRecaptcha();
  const voice = useReadAloud(lang);

  // Voice replies ON by default; user can turn them off with 1 tap.
  const voiceRepliesEnabled = useSyncExternalStore(
    subscribeVoicePref,
    getVoicePrefSnapshot,
    getVoicePrefServerSnapshot,
  );

  const [speakingMessageId, setSpeakingMessageId] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [openPopover, setOpenPopover] = useState<"faq" | "info" | null>(null);

  const nextId = useRef(1);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<{ stop: () => void } | null>(null);
  const transcriptRef = useRef("");
  const cancelledMicRef = useRef(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const faqPopoverRef = useRef<HTMLDivElement>(null);
  const sendRef = useRef<(explicitText?: string) => Promise<void>>(async () => {});

  useEffect(() => {
    if (messages.length === 0) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    endRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "end" });
  }, [messages, isSubmitting]);

  useEffect(() => {
    if (!isFullscreen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") setIsFullscreen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isFullscreen]);

  useEffect(() => {
    if (!openPopover) return;
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!popoverRef.current?.contains(target) && !faqPopoverRef.current?.contains(target)) {
        setOpenPopover(null);
      }
    };
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") setOpenPopover(null);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [openPopover]);

  useEffect(() => {
    return () => {
      cancelledMicRef.current = true;
      recognitionRef.current?.stop();
      voice.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const speakAssistantReply = useCallback(
    (msg: {
      id: number;
      content: string;
      outOfScope?: boolean;
      careLevel?: CareLevel;
      possibleCause?: string;
      questions?: string[];
    }) => {
      if (!voice.available) return;
      const parts = msg.outOfScope
        ? [msg.content]
        : [
            msg.content,
            msg.careLevel ? `${t.careLevelLabel}: ${t.careLevels[msg.careLevel]}` : "",
            msg.possibleCause ? `${t.possibleCause}: ${msg.possibleCause}` : "",
            msg.questions && msg.questions.length > 0 ? `${t.questionsHeading}: ${msg.questions.join(". ")}` : "",
          ].filter(Boolean);
      setSpeakingMessageId(msg.id);
      voice.speak(parts);
    },
    [t, voice],
  );

  function toggleVoiceDefault() {
    const next = !voiceRepliesEnabled;
    if (next) {
      speechEngine.unlockFromGesture();
    } else {
      voice.stop();
      setSpeakingMessageId(null);
    }
    writeVoicePref(next);
  }

  function stopMicrophone(cancelAutoSend = false) {
    cancelledMicRef.current = cancelAutoSend;
    try {
      recognitionRef.current?.stop();
    } catch {
      // Ignore stop errors if already ended.
    }
    setIsListening(false);
  }

  function toggleMicrophone() {
    if (isListening) {
      stopMicrophone(false);
      return;
    }

    const win = window as Window & {
      SpeechRecognition?: SpeechRecognitionCtor;
      webkitSpeechRecognition?: SpeechRecognitionCtor;
    };
    const Ctor = win.SpeechRecognition || win.webkitSpeechRecognition;
    if (!Ctor) {
      setError(chrome.micUnsupported);
      return;
    }

    // Unlock audio output right on the user's tap so the AI's voice reply plays cleanly after fetch.
    speechEngine.unlockFromGesture();
    voice.stop();
    setSpeakingMessageId(null);
    setError("");
    setOpenPopover(null);
    transcriptRef.current = "";
    cancelledMicRef.current = false;

    const recognition = new Ctor();
    recognition.lang = SPEECH_RECOGNITION_LANG[lang] ?? "ro-RO";
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.onresult = (event) => {
      const transcript = Array.from({ length: event.results.length }, (_, i) => event.results[i]?.[0]?.transcript ?? "")
        .join(" ")
        .trim();
      transcriptRef.current = transcript;
      if (transcript) setDraft(transcript);
    };
    recognition.onerror = (event) => {
      cancelledMicRef.current = true;
      setIsListening(false);
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        setError(chrome.micDenied);
      } else if (event.error === "no-speech") {
        setError(chrome.micNoSpeech);
      } else if (event.error && event.error !== "aborted") {
        setError(t.errors.generic);
      }
    };
    recognition.onend = () => {
      setIsListening(false);
      const spoken = transcriptRef.current.trim();
      transcriptRef.current = "";
      if (spoken && !cancelledMicRef.current) {
        void sendRef.current(spoken);
      } else {
        inputRef.current?.focus();
      }
    };
    recognitionRef.current = recognition;
    setIsListening(true);
    try {
      recognition.start();
    } catch {
      setIsListening(false);
      setError(chrome.micDenied);
    }
  }

  const send = useCallback(
    async (explicitText?: string) => {
      const text = (explicitText ?? draft).trim();
      if (!text || isSubmitting) return;
      if (text.length > AI_CHAT_MAX_LENGTH) {
        setError(t.tooLong);
        return;
      }
      if (isBrowserOffline()) {
        setError(offlineCopy.aiOfflineTitle);
        return;
      }

      // Synchronously unlock audio during the user's click/Enter gesture so the AI's voice reply
      // can play automatically once /api/health-assistant resolves.
      if (voiceRepliesEnabled && voice.available) {
        speechEngine.unlockFromGesture();
      }

      if (isListening) {
        cancelledMicRef.current = true;
        try {
          recognitionRef.current?.stop();
        } catch {
          // Ignore.
        }
        setIsListening(false);
      }
      voice.stop();
      setSpeakingMessageId(null);
      setOpenPopover(null);

      const history = messages
        .slice(-HISTORY_ITEMS)
        .map(({ role, content }) => ({ role, content: content.slice(0, HISTORY_ITEM_LENGTH) }));

      setError("");
      setIsSubmitting(true);
      setMessages((current) => [
        ...current,
        { id: nextId.current++, role: "user", content: text, time: formatTime() },
      ]);
      setDraft("");

      try {
        const captchaToken = await executeCaptcha("health_assistant");
        const response = await fetch("/api/health-assistant", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ symptoms: text, history, lang, captchaToken }),
        });
        if (!response.ok) {
          setError(
            response.status === 429
              ? t.errors.busy
              : response.status === 503
                ? t.errors.unavailable
                : t.errors.generic,
          );
          return;
        }
        const data = (await response.json()) as AssistantResponse;
        const replyId = nextId.current++;
        const isOutOfScope = Boolean(data.outOfScope || data.responseKind === "out_of_scope");
        const isInfoOnly =
          !isOutOfScope &&
          (data.responseKind === "medical_info" || data.responseKind === "platform_info") &&
          data.careLevel === "routine" &&
          !data.possibleCause;
        const replyMsg: ChatMessage = {
          id: replyId,
          role: "assistant",
          content: data.message,
          time: formatTime(),
          outOfScope: isOutOfScope,
          responseKind: data.responseKind,
          careLevel: isOutOfScope || isInfoOnly ? undefined : data.careLevel,
          possibleCause: isOutOfScope ? undefined : data.possibleCause,
          questions: isOutOfScope ? [] : Array.isArray(data.questions) ? data.questions.filter(Boolean) : [],
        };
        setMessages((current) => [...current, replyMsg]);

        if (voiceRepliesEnabled && voice.available) {
          speakAssistantReply(replyMsg);
        }
      } catch (caught) {
        setError(isBrowserOffline() ? offlineCopy.aiOfflineTitle : captchaErrorMessage(caught, lang) ?? t.errors.generic);
      } finally {
        setIsSubmitting(false);
        inputRef.current?.focus();
      }
    },
    [draft, executeCaptcha, isListening, isSubmitting, lang, messages, offlineCopy.aiOfflineTitle, speakAssistantReply, t, voice, voiceRepliesEnabled],
  );

  useEffect(() => {
    sendRef.current = send;
  }, [send]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void send();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      void send();
    }
  }

  function resetChat() {
    stopMicrophone(true);
    voice.stop();
    setSpeakingMessageId(null);
    setMessages([]);
    setDraft("");
    setError("");
    setOpenPopover(null);
    inputRef.current?.focus();
  }

  const liveStatus = isListening
    ? t.micListening
    : isSubmitting
      ? t.thinking
      : voice.speaking
        ? t.voiceSpeaking
        : t.statusReady;

  const showFaqInComposer = messages.length === 0 && draft.trim().length <= 5;

  const chatShell = (
    <section
      aria-label={t.title}
      className={
        isFullscreen
          ? "fixed inset-0 z-[70] flex h-dvh w-screen flex-col overflow-hidden bg-card"
          : "mx-auto flex h-[min(78dvh,46rem)] min-h-[30rem] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-(--shadow-card-hover) dark:border-ink-800 lg:h-[calc(100dvh-var(--site-header-h))] lg:min-h-[32rem] lg:max-w-none lg:rounded-none lg:border-0 lg:shadow-none"
      }
    >
      {/* Single-row compact chat header (never wraps on mobile; aligns with site navbar on desktop) */}
      <header
        ref={popoverRef}
        className="shrink-0 border-b border-border bg-card dark:border-ink-800"
      >
        <div
          className={
            isFullscreen
              ? "relative mx-auto flex w-full max-w-5xl items-center justify-between gap-2 px-3.5 py-3 sm:px-6"
              : "relative mx-auto flex w-full items-center justify-between gap-2 px-3.5 py-3 sm:px-5 lg:max-w-[80rem] lg:px-8 2xl:max-w-[96rem] 2xl:px-5"
          }
        >
        <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
          <div
            aria-hidden="true"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-rose-border/80 bg-rose-tint text-rose-ink"
          >
            <AiAssistantIcon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-body font-semibold leading-tight text-foreground sm:text-title">
              {t.navLabel}
            </h1>
            <p className="truncate text-meta text-muted-foreground">{liveStatus}</p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1 sm:gap-1.5">
          {/* Default-on voice reply toggle */}
          {voice.available && (
            <button
              type="button"
              onClick={toggleVoiceDefault}
              aria-pressed={voiceRepliesEnabled}
              aria-label={voiceRepliesEnabled ? t.voiceOn : t.voiceOff}
              title={voiceRepliesEnabled ? t.voiceOn : t.voiceOff}
              className={`press-row inline-flex h-10 min-h-10 items-center gap-1.5 whitespace-nowrap rounded-xl border px-2.5 text-meta font-semibold transition-colors duration-(--dur-fast) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:px-3 ${
                voiceRepliesEnabled
                  ? "border-rose-border bg-rose-tint text-rose-ink shadow-2xs"
                  : "border-border-control bg-background text-muted-foreground hover:border-rose-border/75 hover:text-foreground"
              }`}
            >
              {voiceRepliesEnabled ? (
                <VolumeIcon className="h-4 w-4 shrink-0 text-rose-ink" aria-hidden="true" />
              ) : (
                <VolumeMuteIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
              )}
              <span className="hidden sm:inline">{voiceRepliesEnabled ? t.voiceOn : t.voiceOff}</span>
            </button>
          )}

          {/* Info & safety disclaimer button */}
          <button
            type="button"
            onClick={() => setOpenPopover((prev) => (prev === "info" ? null : "info"))}
            aria-expanded={openPopover === "info"}
            aria-label={chrome.infoButton}
            title={chrome.infoButton}
            className={`press-row inline-flex h-10 w-10 min-h-10 min-w-10 items-center justify-center rounded-xl border transition-colors duration-(--dur-fast) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              openPopover === "info"
                ? "border-rose-border bg-rose-tint text-rose-ink shadow-2xs"
                : "border-border-control bg-background text-muted-foreground hover:border-rose-border/75 hover:bg-muted hover:text-foreground"
            }`}
          >
            <InfoCircleIcon className="h-4.5 w-4.5" />
          </button>

          {/* Fullscreen toggle */}
          <button
            type="button"
            onClick={() => setIsFullscreen((prev) => !prev)}
            aria-pressed={isFullscreen}
            aria-label={isFullscreen ? chrome.fullscreenExit : chrome.fullscreenEnter}
            title={isFullscreen ? chrome.fullscreenExit : chrome.fullscreenEnter}
            className="press-row inline-flex h-10 w-10 min-h-10 min-w-10 items-center justify-center rounded-xl border border-border-control bg-background text-muted-foreground transition-colors duration-(--dur-fast) hover:border-foreground/40 hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {isFullscreen ? <MinimizeIcon className="h-4 w-4" /> : <ExpandIcon className="h-4 w-4" />}
          </button>

          {/* Reset conversation */}
          {messages.length > 0 && (
            <button
              type="button"
              onClick={resetChat}
              disabled={isSubmitting}
              aria-label={t.newChat}
              title={t.newChat}
              className="press-row inline-flex h-10 w-10 min-h-10 min-w-10 items-center justify-center rounded-xl border border-border-control bg-background text-muted-foreground transition-colors duration-(--dur-fast) hover:border-foreground/40 hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <RefreshIcon className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>

        {/* Popover: Info & Safety */}
        {openPopover === "info" && (
          <div className="fhs-enter absolute right-3.5 top-full z-30 mt-2 w-[min(calc(100vw-2rem),22rem)] rounded-2xl border border-border bg-card p-4 shadow-xl shadow-ink-950/15 sm:right-5 lg:right-8 2xl:right-5 dark:border-white/12 dark:bg-ink-900">
            <p className="text-body font-semibold text-foreground">{chrome.infoButton}</p>
            <p className="mt-2 text-meta leading-relaxed text-muted-foreground">{t.disclaimer}</p>
            <p className="mt-2.5 rounded-xl border border-primary/25 bg-primary-soft px-3 py-2.5 text-meta font-medium leading-relaxed text-foreground">
              {t.emergencyNote}
            </p>
            <div className="mt-3">
              <Button href="tel:112" variant="primary" size="md" className="w-full justify-center">
                {t.call112}
              </Button>
            </div>
          </div>
        )}
        </div>
      </header>

      {/* Pure scrollable WhatsApp-like message canvas */}
      <div
        role="log"
        aria-live="polite"
        aria-relevant="additions"
        className="flex-1 overflow-y-auto bg-surface-subtle/45 dark:bg-ink-950/40"
      >
        <div
          className={
            isFullscreen
              ? "mx-auto flex w-full max-w-4xl flex-col space-y-4 px-4 py-6 sm:px-6 lg:py-8"
              : "mx-auto flex w-full flex-col space-y-4 px-4 py-5 sm:px-6 lg:max-w-4xl lg:px-8 lg:py-8"
          }
        >
        {/* Welcome bubble */}
        <div className="flex justify-start">
          <div className="max-w-[88%] rounded-2xl rounded-tl-sm border border-border bg-card px-4 py-3.5 text-body text-foreground shadow-2xs sm:max-w-[78%] dark:border-ink-800 dark:bg-ink-900">
            <p className="leading-relaxed">{t.welcome}</p>
            {voice.available && (
              <div className="mt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    if (voice.speaking && speakingMessageId === 0) {
                      voice.stop();
                      setSpeakingMessageId(null);
                    } else {
                      speechEngine.unlockFromGesture();
                      setSpeakingMessageId(0);
                      voice.speak([t.welcome]);
                    }
                  }}
                  className="inline-flex min-h-9 items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-1 text-meta font-semibold text-muted-foreground transition-colors duration-(--dur-fast) hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <VolumeIcon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  <span>{voice.speaking && speakingMessageId === 0 ? t.stopVoice : t.listenReply}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {!isOnline && (
          <div
            role="status"
            aria-live="polite"
            className="rounded-2xl border border-border bg-card p-4 text-body text-foreground shadow-2xs sm:p-5 dark:border-ink-800 dark:bg-ink-900"
          >
            <p className="font-semibold text-foreground">{offlineCopy.aiOfflineTitle}</p>
            <p className="mt-1.5 text-meta leading-relaxed text-muted-foreground">
              {offlineCopy.aiOfflineBody}
            </p>
            <div className="mt-3.5 flex flex-wrap items-center gap-2.5">
              <Button href={withLangPrefix("/health-check", lang)} variant="action" size="md">
                {offlineCopy.openSymptomCheck}
              </Button>
              <Button href={withLangPrefix("/health-information", lang)} variant="outline" size="md">
                {offlineCopy.openGuides}
              </Button>
            </div>
          </div>
        )}

        {/* Message bubbles */}
        {messages.map((message) =>
          message.role === "user" ? (
            <div key={message.id} className="flex justify-end">
              <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-ink-950 px-4 py-3 text-body text-paper shadow-2xs sm:max-w-[76%] dark:bg-paper dark:text-ink-950">
                <span className="sr-only">{t.you}: </span>
                <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                <p className="mt-1 text-right text-meta tabular-nums opacity-70">{message.time}</p>
              </div>
            </div>
          ) : (
            <div key={message.id} className="flex justify-start">
              <div className="max-w-[90%] space-y-3 sm:max-w-[82%]">
                <div
                  className={
                    message.outOfScope
                      ? "rounded-2xl rounded-tl-sm border border-rose-border bg-rose-tint/45 px-4 py-3.5 text-body text-foreground shadow-2xs"
                      : "rounded-2xl rounded-tl-sm border border-border bg-card px-4 py-3.5 text-body text-foreground shadow-2xs dark:border-ink-800 dark:bg-ink-900"
                  }
                >
                  <span className="sr-only">{t.assistant}: </span>
                  <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>

                  {!message.outOfScope && message.careLevel && (
                    <div
                      className={
                        message.careLevel === "emergency"
                          ? `${dangerPanel} mt-3.5`
                          : "mt-3.5 rounded-xl border border-border bg-surface-subtle/60 p-3.5 sm:p-4 dark:border-ink-800 dark:bg-ink-950/60"
                      }
                    >
                      <p className="text-meta font-medium text-muted-foreground">{t.careLevelLabel}</p>
                      <p className="mt-0.5 text-body font-semibold text-foreground">
                        {t.careLevels[message.careLevel]}
                      </p>
                      {message.possibleCause && (
                        <>
                          <p className="mt-3 text-meta font-medium text-muted-foreground">{t.possibleCause}</p>
                          <p className="mt-0.5 text-body text-foreground">{message.possibleCause}</p>
                        </>
                      )}
                      {message.questions && message.questions.length > 0 && (
                        <>
                          <p className="mt-3 text-meta font-medium text-muted-foreground">{t.questionsHeading}</p>
                          <ul className="mt-1 list-disc space-y-1 pl-5 text-body text-foreground">
                            {message.questions.map((question) => (
                              <li key={question}>{question}</li>
                            ))}
                          </ul>
                        </>
                      )}
                      {message.careLevel === "emergency" && (
                        <div className="mt-3.5">
                          <Button href="tel:112" variant="primary" size="lg">
                            <span className="whitespace-nowrap">{t.call112}</span>
                          </Button>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="mt-2.5 flex items-center justify-between gap-3">
                    <span className="text-meta tabular-nums text-muted-foreground">{message.time}</span>
                    {voice.available && (
                      <button
                        type="button"
                        onClick={() => {
                          if (voice.speaking && speakingMessageId === message.id) {
                            voice.stop();
                            setSpeakingMessageId(null);
                          } else {
                            speechEngine.unlockFromGesture();
                            speakAssistantReply(message);
                          }
                        }}
                        className="inline-flex min-h-9 items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-1 text-meta font-semibold text-muted-foreground transition-colors duration-(--dur-fast) hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <VolumeIcon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                        <span>{voice.speaking && speakingMessageId === message.id ? t.stopVoice : t.listenReply}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ),
        )}

        {isSubmitting && (
          <div className="flex justify-start">
            <div
              role="status"
              className="rounded-2xl rounded-tl-sm border border-border bg-card px-4 py-3 text-body text-muted-foreground shadow-2xs dark:border-ink-800 dark:bg-ink-900"
            >
              {t.thinking}
            </div>
          </div>
        )}

        <div ref={endRef} />
        </div>
      </div>

      {/* Active Claude-style voice strip when speaking or listening */}
      {(voice.speaking || isListening) && (
        <div className="shrink-0 border-t border-border bg-ink-950 text-paper">
          <div
            className={
              isFullscreen
                ? "mx-auto flex w-full max-w-4xl items-center justify-between gap-3 px-4 py-2.5 sm:px-6"
                : "mx-auto flex w-full items-center justify-between gap-3 px-4 py-2.5 sm:px-5 lg:max-w-4xl lg:px-8"
            }
          >
            <div className="flex min-w-0 items-center gap-2.5">
              {isListening ? (
                <MicIcon className="h-4 w-4 shrink-0 text-amber-care-border" />
              ) : (
                <VolumeIcon className="h-4 w-4 shrink-0 text-amber-care-border" aria-hidden="true" />
              )}
              <span className="truncate text-meta font-medium">
                {isListening ? chrome.micHint : t.voiceSpeaking}
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                if (isListening) {
                  stopMicrophone(true);
                } else {
                  voice.stop();
                  setSpeakingMessageId(null);
                }
              }}
              className="inline-flex min-h-9 shrink-0 items-center whitespace-nowrap rounded-lg border border-paper/20 bg-paper/10 px-3 py-1 text-meta font-semibold text-paper transition-colors duration-(--dur-fast) hover:bg-paper/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-paper"
            >
              {t.stopVoice}
            </button>
          </div>
        </div>
      )}

      {/* Clean bottom chat composer (no disclaimer wall) */}
      <form
        onSubmit={handleSubmit}
        className="shrink-0 border-t border-border bg-card p-3 sm:p-4 lg:px-8 lg:py-5 dark:border-ink-800"
      >
        <div className={isFullscreen ? "mx-auto w-full max-w-4xl" : "mx-auto w-full lg:max-w-4xl"}>
        {error && (
          <p
            role="alert"
            className="mb-2.5 rounded-xl border border-primary/25 bg-primary-soft px-3.5 py-2 text-meta font-medium text-foreground"
          >
            {error}
          </p>
        )}

        <div
          ref={faqPopoverRef}
          className="relative flex flex-col rounded-2xl border border-border-control bg-background transition-[border-color,box-shadow] duration-(--dur-fast) focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/30"
        >
          {/* Upward FAQ popover anchored right above the chatbox */}
          {openPopover === "faq" && showFaqInComposer && (
            <div className="fhs-enter absolute inset-x-0 bottom-full z-30 mb-2 max-w-[26rem] rounded-2xl border border-border bg-card p-3 shadow-xl shadow-ink-950/15 dark:border-white/12 dark:bg-ink-900">
              <p className="px-2 pb-2 text-meta font-semibold text-muted-foreground">{chrome.faqButton}</p>
              <div className="space-y-1.5">
                {[...t.quickPrompts, ...chrome.extraPrompts].map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => void send(prompt)}
                    className="press-row flex w-full items-center justify-between gap-2.5 rounded-xl border border-border bg-background px-3.5 py-2.5 text-left text-meta font-medium text-foreground transition-colors duration-(--dur-fast) hover:border-rose-border hover:bg-rose-tint/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <span>{prompt}</span>
                    <ArrowRightIcon className="h-3.5 w-3.5 shrink-0 opacity-50" aria-hidden="true" />
                  </button>
                ))}
              </div>
            </div>
          )}

          <label htmlFor="ai-chat-input" className="sr-only">
            {t.inputLabel}
          </label>
          <textarea
            id="ai-chat-input"
            ref={inputRef}
            rows={1}
            value={draft}
            maxLength={AI_CHAT_MAX_LENGTH}
            onChange={(event) => {
              const next = event.target.value;
              setDraft(next);
              if (next.trim().length > 5 && openPopover === "faq") setOpenPopover(null);
            }}
            onKeyDown={handleKeyDown}
            placeholder={t.placeholder}
            className="max-h-40 min-h-12 w-full resize-none bg-transparent px-3.5 pt-3 pb-1.5 text-body leading-snug text-foreground [field-sizing:content] placeholder:text-muted-foreground focus:outline-none! focus-visible:outline-none! lg:px-4 lg:pt-3.5 lg:pb-2"
          />

          <div className="flex items-center justify-between gap-2 px-1.5 pt-0.5 pb-1.5 lg:px-2 lg:pb-2">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={toggleMicrophone}
                disabled={isSubmitting || !isOnline}
                aria-label={isListening ? t.micStop : t.micStart}
                title={isListening ? t.micStop : t.micStart}
                aria-pressed={isListening}
                className={`inline-flex h-11 w-11 min-h-11 min-w-11 shrink-0 items-center justify-center rounded-xl transition-colors duration-(--dur-fast) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  isListening
                    ? "bg-rose-tint text-rose-ink ring-1 ring-rose-border"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <MicIcon className="h-5 w-5" />
              </button>

              {/* Common questions icon button lives inside the chatbox until a message is sent or >5 chars are typed */}
              {showFaqInComposer && (
                <div className="group relative shrink-0">
                  <button
                    type="button"
                    onClick={() => setOpenPopover((prev) => (prev === "faq" ? null : "faq"))}
                    aria-expanded={openPopover === "faq"}
                    aria-label={chrome.faqButton}
                    title={chrome.faqButton}
                    className={`press-row inline-flex h-11 w-11 min-h-11 min-w-11 items-center justify-center rounded-xl border transition-colors duration-(--dur-fast) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                      openPopover === "faq"
                        ? "border-rose-border bg-rose-tint text-rose-ink shadow-2xs"
                        : "border-transparent text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <HelpCircleIcon className="h-5 w-5 shrink-0" />
                  </button>
                  {openPopover !== "faq" && (
                    <span
                      role="tooltip"
                      className="pointer-events-none absolute left-0 bottom-full z-20 mb-2 whitespace-nowrap rounded-lg bg-ink-950 px-2.5 py-1 text-meta font-medium text-paper opacity-0 shadow-md transition-opacity duration-(--dur-fast) group-hover:opacity-100 group-focus-within:opacity-100 dark:bg-paper dark:text-ink-950"
                    >
                      {chrome.faqButton}
                    </span>
                  )}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !isOnline || !draft.trim()}
              aria-label={t.send}
              title={t.send}
              className="press-solid inline-flex h-11 min-h-11 shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl bg-ink-950 px-4 text-body font-semibold text-paper transition-colors duration-(--dur-fast) hover:bg-ink-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:bg-muted disabled:text-muted-foreground dark:bg-paper dark:text-ink-950"
            >
              <span className="hidden sm:inline">{t.send}</span>
              <ArrowRightIcon className="h-4.5 w-4.5 shrink-0" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="text-center empty:hidden [&_p]:mt-2 [&_p]:text-meta">
          <RecaptchaNotice />
        </div>
        </div>
      </form>
    </section>
  );

  return (
    <main id="main-content" className="flex flex-1 flex-col bg-background py-4 sm:py-6 lg:bg-card lg:py-0">
      <div className="mx-auto flex w-full max-w-[80rem] flex-1 flex-col px-5 sm:px-6 lg:max-w-none lg:px-0">
        {chatShell}
      </div>
    </main>
  );
}
