/**
 * RediHealth Production Speech Engine
 * Tier 1: Native Web Speech API (with sentence chunking, persistent GC retention, and ro-RO voice ranking)
 * Tier 2: Static MP3 stream fallback
 * Tier 3: Enhanced visual transcript fallback
 */

export type SpeechTier = "webspeech" | "mp3" | "transcript";

export interface SpeechOptions {
  lang?: string;
  rate?: number; // 0.8, 1.0, 1.2
  mp3FallbackUrl?: string;
  onBoundary?: (charIndex: number, wordLength?: number) => void;
  onEnd?: () => void;
  onError?: (error: unknown) => void;
  onTierChange?: (tier: SpeechTier) => void;
  onSentenceChange?: (sentenceIndex: number) => void;
}

export interface SpeechEngineState {
  isSpeaking: boolean;
  isPaused: boolean;
  activeTier: SpeechTier;
  playbackRate: number;
  currentChunkIndex: number;
  totalChunks: number;
  isFallbackVoice: boolean;
}

/** Engine naming conventions for natural, high-quality voices (Chrome, Edge, Safari, Apple Siri). */
const QUALITY_HINTS = /(natural|premium|enhanced|neural|online|google|siri|wavenet|studio)/i;
/** Known natural Romanian, English, Croatian, and Italian voice names across Apple, Microsoft, and Google engines. */
const KNOWN_GOOD =
  /\b(ioana|alina|emil|andrei|carmen|elena|sonia|ryan|libby|daniel|samantha|ava|andrew|emma|brian|jenny|aria|guy|karen|moira|tessa|rishi|serena|kate|oliver|elsa|isabella|diego|giuseppe|fabiola|alice|federica|luca|paola|gabrijela|srecko|lana)\b/i;
/** Novelty voices never acceptable for medical/health information. */
const NOVELTY =
  /^(albert|bad news|bahh|bells|boing|bubbles|cellos|good news|jester|organ|superstar|trinoids|whisper|wobble|zarvox|fred|junior|kathy|ralph)\b/i;
/** Older robotic voices. */
const ROBOTIC = /^(eddy|flo|grandma|grandpa|reed|rocko|sandy|shelley)\b/i;

/** Preferred regional locale tags when a 2-letter code is passed. */
const PREFERRED_REGIONAL_TAGS: Record<string, string[]> = {
  ru: ["ru-ru", "ru"],

  ro: ["ro-ro", "ro-md", "ro"],
  en: ["en-gb", "en-us", "en-ie", "en-au", "en"],
  hr: ["hr-hr", "hr"],
  it: ["it-it", "it-ch", "it"],
};

/**
 * Normalizes clinical numbers, ranges, and units into natural spoken words for
 * Romanian, English, Croatian, and Italian so speech engines read them like a human clinician.
 */
export function formatSpeechText(text: string, lang = "ro-RO"): string {
  if (!text) return "";
  const prefix = lang.replace("_", "-").toLowerCase().split("-")[0];
  let out = text
    .replace(/[«»„""]/g, "")
    .replace(/\s*·\s*/g, ". ")
    .replace(/\s+/g, " ")
    .trim();

  if (prefix === "ro") {
    out = out
      .replace(/(\d+)\s*[–—-]\s*(\d+)/g, "$1 până la $2")
      .replace(/\b112\b/g, "unu unu doi")
      .replace(/\bmmHg\b/g, "milimetri coloană de mercur")
      .replace(/\bmg\/dL\b/gi, "miligrame pe decilitru")
      .replace(/\bkm\/h\b/gi, "kilometri pe oră");
  } else if (prefix === "en") {
    out = out
      .replace(/(\d+)\s*[–—-]\s*(\d+)/g, "$1 to $2")
      .replace(/\b112\b/g, "one one two")
      .replace(/\bmmHg\b/g, "millimeters of mercury")
      .replace(/\bmg\/dL\b/gi, "milligrams per deciliter")
      .replace(/\bkm\/h\b/gi, "kilometers per hour");
  } else if (prefix === "hr") {
    out = out
      .replace(/(\d+)\s*[–—-]\s*(\d+)/g, "od $1 do $2")
      .replace(/\b112\b/g, "jedan jedan dva")
      .replace(/\bmmHg\b/g, "milimetara živinog stupca")
      .replace(/\bmg\/dL\b/gi, "miligrama po decilitru")
      .replace(/\bkm\/h\b/gi, "kilometara na sat");
  } else if (prefix === "it") {
    out = out
      .replace(/(\d+)\s*[–—-]\s*(\d+)/g, "da $1 a $2")
      .replace(/\b112\b/g, "uno uno due")
      .replace(/\bmmHg\b/g, "millimetri di mercurio")
      .replace(/\bmg\/dL\b/gi, "milligrammi per decilitro")
      .replace(/\bkm\/h\b/gi, "chilometri all'ora");
  }

  return out;
}

/**
 * Splits text into grammatical sentence-length chunks (<160 chars) to prevent
 * Chromium's ~15s speech watchdog cutoff and ensure smooth sequential narration.
 */
export function chunkTextIntoSentences(text: string, maxChunkLength = 160): string[] {
  if (!text || !text.trim()) return [];

  // Split on sentence-ending punctuation or newlines
  const rawParts = text
    .replace(/\r\n/g, "\n")
    .split(/(?<=[.?!;:…\n])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const chunks: string[] = [];

  for (const part of rawParts) {
    if (part.length <= maxChunkLength) {
      chunks.push(part);
    } else {
      // Split overly long clauses on comma or word boundaries
      const subParts = part.split(/(?<=[,])\s+/);
      let buffer = "";
      for (const sub of subParts) {
        if (!buffer) {
          buffer = sub;
        } else if (buffer.length + sub.length + 1 <= maxChunkLength) {
          buffer += " " + sub;
        } else {
          chunks.push(buffer);
          buffer = sub;
        }
      }
      if (buffer) {
        chunks.push(buffer);
      }
    }
  }

  return chunks.length > 0 ? chunks : [text.trim()];
}

/**
 * Discovers and ranks the best voice for the target language.
 * Falls back to the default system voice if no Romanian voice is installed.
 */
export function findBestVoice(
  voices: SpeechSynthesisVoice[],
  targetLang = "ro-RO"
): { voice: SpeechSynthesisVoice | null; isFallback: boolean } {
  if (!voices || voices.length === 0) {
    return { voice: null, isFallback: false };
  }

  const langTag = targetLang.replace("_", "-").toLowerCase();
  const langPrefix = langTag.split("-")[0];
  const preferredRegional = PREFERRED_REGIONAL_TAGS[langPrefix] || [langTag];

  // Candidates matching target language or dialect
  const candidates = voices.filter((v) => {
    const vTag = v.lang.replace("_", "-").toLowerCase();
    return vTag === langTag || vTag.startsWith(`${langPrefix}-`) || vTag === langPrefix;
  });

  if (candidates.length > 0) {
    let best = candidates[0];
    let bestScore = -100;

    for (const v of candidates) {
      if (NOVELTY.test(v.name)) continue;

      let score = 0;
      const vTag = v.lang.replace("_", "-").toLowerCase();
      const regionRank = preferredRegional.indexOf(vTag);

      if (vTag === langTag) {
        score += 20;
      } else if (regionRank !== -1) {
        score += (preferredRegional.length - regionRank) * 4;
      }

      if (QUALITY_HINTS.test(v.name) || QUALITY_HINTS.test(v.voiceURI || "")) score += 18;
      if (KNOWN_GOOD.test(v.name)) score += 10;
      if (ROBOTIC.test(v.name)) score -= 25;
      if (v.localService) score += 1;

      if (score >= bestScore) {
        bestScore = score;
        best = v;
      }
    }
    return { voice: best, isFallback: false };
  }

  // Graceful fallback to default system voice
  const fallback =
    voices.find((v) => v.default && !NOVELTY.test(v.name)) ||
    voices.find((v) => !NOVELTY.test(v.name) && !ROBOTIC.test(v.name)) ||
    voices.find((v) => !NOVELTY.test(v.name)) ||
    voices[0] ||
    null;

  return { voice: fallback, isFallback: true };
}

export class HealthSpeechEngine {
  private static instance: HealthSpeechEngine | null = null;

  // Active utterance GC retention shield: prevents V8 from collecting in-flight utterances
  private activeUtterances: Set<SpeechSynthesisUtterance> = new Set();
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private currentAudioElement: HTMLAudioElement | null = null;

  private activeTier: SpeechTier = "webspeech";
  private isSpeakingState = false;
  private isPausedState = false;
  private playbackRate = 1.0;
  private isFallbackVoiceState = false;

  private currentChunks: string[] = [];
  private chunkCharOffsets: number[] = [];
  private currentChunkIndex = 0;
  private pausedChunkIndex = 0;
  private runId = 0;

  private listeners: SpeechOptions = {};
  private playerCloseHandlers: Set<() => void> = new Set();
  private stateSubscribers: Set<(state: SpeechEngineState) => void> = new Set();

  private constructor() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.addEventListener?.("voiceschanged", () => {
        // Pre-warm voices list
        window.speechSynthesis.getVoices();
      });
    }
  }

  public static getInstance(): HealthSpeechEngine {
    if (!HealthSpeechEngine.instance) {
      HealthSpeechEngine.instance = new HealthSpeechEngine();
    }
    return HealthSpeechEngine.instance;
  }

  public getTier(): SpeechTier {
    return this.activeTier;
  }

  public isSpeaking(): boolean {
    return this.isSpeakingState;
  }

  public isPaused(): boolean {
    return this.isPausedState;
  }

  public isFallbackVoice(): boolean {
    return this.isFallbackVoiceState;
  }

  public getRate(): number {
    return this.playbackRate;
  }

  public setRate(rate: number): void {
    this.playbackRate = rate;
    if (this.currentUtterance) {
      this.currentUtterance.rate = rate;
    }
    if (this.currentAudioElement) {
      this.currentAudioElement.playbackRate = rate;
    }
    this.notifyState();
  }

  /**
   * Registers a player close handler so that controls outside the player
   * (e.g. TopicHeroSection's "Oprește audio") can dismiss/close the player.
   */
  public registerActivePlayer(closeFn: () => void): () => void {
    this.playerCloseHandlers.add(closeFn);
    return () => {
      this.playerCloseHandlers.delete(closeFn);
    };
  }

  /**
   * Triggers all registered player close handlers and halts playback.
   */
  public requestClose(): void {
    this.stop();
    for (const handler of Array.from(this.playerCloseHandlers)) {
      try {
        handler();
      } catch {
        // Safe execution
      }
    }
  }

  public subscribeState(listener: (state: SpeechEngineState) => void): () => void {
    this.stateSubscribers.add(listener);
    listener(this.getState());
    return () => {
      this.stateSubscribers.delete(listener);
    };
  }

  public getState(): SpeechEngineState {
    return {
      isSpeaking: this.isSpeakingState,
      isPaused: this.isPausedState,
      activeTier: this.activeTier,
      playbackRate: this.playbackRate,
      currentChunkIndex: this.currentChunkIndex,
      totalChunks: this.currentChunks.length,
      isFallbackVoice: this.isFallbackVoiceState,
    };
  }

  private notifyState(): void {
    const state = this.getState();
    for (const sub of Array.from(this.stateSubscribers)) {
      try {
        sub(state);
      } catch {
        // Safe delivery
      }
    }
  }

  public stop(): void {
    this.runId += 1;

    if (typeof window !== "undefined") {
      if (window.speechSynthesis) {
        try {
          window.speechSynthesis.cancel();
        } catch {
          // Ignore cancellation errors
        }
      }

      if (this.currentAudioElement) {
        try {
          this.currentAudioElement.pause();
          this.currentAudioElement.currentTime = 0;
        } catch {
          // Ignore audio element errors
        }
        this.currentAudioElement = null;
      }
    }

    this.activeUtterances.clear();
    this.currentUtterance = null;
    this.isSpeakingState = false;
    this.isPausedState = false;
    this.currentChunkIndex = 0;
    this.pausedChunkIndex = 0;

    this.notifyState();

    if (this.listeners.onEnd) {
      const endCallback = this.listeners.onEnd;
      this.listeners = {};
      endCallback();
    }
  }

  public pause(): void {
    if (typeof window === "undefined") return;

    if (this.activeTier === "webspeech" && window.speechSynthesis) {
      // Simulate pause by bookmarking current chunk index and cancelling engine
      // This completely avoids Chromium's broken native pause freeze bug
      this.pausedChunkIndex = this.currentChunkIndex;
      this.runId += 1;
      try {
        window.speechSynthesis.cancel();
      } catch {
        // Ignore cancel errors
      }
      this.activeUtterances.clear();
      this.currentUtterance = null;
      this.isSpeakingState = false;
      this.isPausedState = true;
      this.notifyState();
    } else if (this.activeTier === "mp3" && this.currentAudioElement) {
      this.currentAudioElement.pause();
      this.isSpeakingState = false;
      this.isPausedState = true;
      this.notifyState();
    }
  }

  public resume(): void {
    if (typeof window === "undefined" || !this.isPausedState) return;

    if (this.activeTier === "webspeech" && window.speechSynthesis) {
      this.isPausedState = false;
      this.isSpeakingState = true;
      this.currentChunkIndex = this.pausedChunkIndex;
      this.notifyState();
      this.speakChunkQueue(this.runId);
    } else if (this.activeTier === "mp3" && this.currentAudioElement) {
      this.currentAudioElement.play().catch(() => {
        this.fallbackToTranscript();
      });
      this.isPausedState = false;
      this.isSpeakingState = true;
      this.notifyState();
    }
  }

  public speak(text: string, options: SpeechOptions = {}): void {
    if (typeof window === "undefined") return;

    this.stop();

    const trimmed = text?.trim();
    if (!trimmed) {
      options.onEnd?.();
      return;
    }

    const lang = options.lang || "ro-RO";
    const rate = options.rate ?? this.playbackRate;
    this.playbackRate = rate;

    this.listeners = {
      lang,
      rate,
      mp3FallbackUrl: options.mp3FallbackUrl,
      onBoundary: options.onBoundary,
      onEnd: options.onEnd,
      onError: options.onError,
      onTierChange: options.onTierChange,
      onSentenceChange: options.onSentenceChange,
    };

    // Check if Web Speech API is supported
    if ("speechSynthesis" in window && window.speechSynthesis) {
      try {
        this.speakWithWebSpeechChunks(trimmed, lang, options.mp3FallbackUrl);
        return;
      } catch (err) {
        console.warn("Web Speech API execution failed, checking MP3 fallback:", err);
      }
    }

    // Tier 2: Static MP3 fallback
    if (options.mp3FallbackUrl) {
      this.speakWithMp3(options.mp3FallbackUrl);
    } else {
      // Tier 3: Transcript mode
      this.fallbackToTranscript();
    }
  }

  private speakWithWebSpeechChunks(
    fullText: string,
    lang: string,
    mp3FallbackUrl?: string
  ): void {
    this.activeTier = "webspeech";
    this.notifyTierChange("webspeech");

    const chunks = chunkTextIntoSentences(fullText);
    this.currentChunks = chunks;
    this.currentChunkIndex = 0;
    this.pausedChunkIndex = 0;

    // Calculate character offsets for accurate boundary reporting
    const offsets: number[] = [];
    let searchStart = 0;
    for (const chunk of chunks) {
      const found = fullText.indexOf(chunk, searchStart);
      if (found !== -1) {
        offsets.push(found);
        searchStart = found + chunk.length;
      } else {
        offsets.push(searchStart);
        searchStart += chunk.length;
      }
    }
    this.chunkCharOffsets = offsets;

    // Discover matching voice
    const voices = window.speechSynthesis.getVoices();
    const { voice, isFallback } = findBestVoice(voices, lang);
    this.isFallbackVoiceState = isFallback;

    const currentRun = ++this.runId;
    this.isSpeakingState = true;
    this.isPausedState = false;
    this.notifyState();

    this.speakChunkQueue(currentRun, voice, mp3FallbackUrl);
  }

  private speakChunkQueue(
    currentRun: number,
    voice?: SpeechSynthesisVoice | null,
    mp3FallbackUrl?: string
  ): void {
    if (this.runId !== currentRun || this.currentChunkIndex >= this.currentChunks.length) {
      if (this.runId === currentRun) {
        this.isSpeakingState = false;
        this.isPausedState = false;
        this.notifyState();
        if (this.listeners.onEnd) {
          const done = this.listeners.onEnd;
          this.listeners = {};
          done();
        }
      }
      return;
    }

    const index = this.currentChunkIndex;
    const chunkText = this.currentChunks[index];
    const chunkOffset = this.chunkCharOffsets[index] ?? 0;

    const utterance = new SpeechSynthesisUtterance(chunkText);
    this.currentUtterance = utterance;
    // Retain in persistent Set so V8 cannot garbage-collect during playback
    this.activeUtterances.add(utterance);

    const targetLang = this.listeners.lang || "ro-RO";
    const resolvedVoice =
      voice ??
      (typeof window !== "undefined" && window.speechSynthesis
        ? findBestVoice(window.speechSynthesis.getVoices(), targetLang).voice
        : null);

    utterance.lang = resolvedVoice && !this.isFallbackVoiceState ? resolvedVoice.lang || targetLang : targetLang;
    utterance.rate = this.playbackRate;
    utterance.pitch = 1.0;
    if (resolvedVoice) {
      utterance.voice = resolvedVoice;
    }

    utterance.onstart = () => {
      if (this.runId !== currentRun) return;
      this.isSpeakingState = true;
      this.isPausedState = false;
      this.notifyState();

      // Trigger boundary at start of chunk for Firefox/Android WebView
      if (this.listeners.onBoundary) {
        this.listeners.onBoundary(chunkOffset, chunkText.length);
      }
      if (this.listeners.onSentenceChange) {
        this.listeners.onSentenceChange(index);
      }
    };

    utterance.onboundary = (event) => {
      if (this.runId !== currentRun) return;
      const absChar = chunkOffset + event.charIndex;
      if (this.listeners.onBoundary) {
        this.listeners.onBoundary(absChar, event.charLength);
      }
    };

    utterance.onend = () => {
      this.activeUtterances.delete(utterance);
      if (this.runId !== currentRun) return;

      this.currentChunkIndex = index + 1;
      this.speakChunkQueue(currentRun, voice, mp3FallbackUrl);
    };

    utterance.onerror = (event) => {
      this.activeUtterances.delete(utterance);
      if (this.runId !== currentRun) return;

      // Intentional aborts (e.g. cancel, pause, navigation) must not emit fallback errors
      if (event.error === "canceled" || event.error === "interrupted") {
        return;
      }

      console.warn("SpeechSynthesis utterance error:", event.error);
      if (mp3FallbackUrl) {
        this.speakWithMp3(mp3FallbackUrl);
      } else {
        this.fallbackToTranscript();
      }
    };

    try {
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      this.activeUtterances.delete(utterance);
      console.warn("speechSynthesis.speak failed:", err);
      if (mp3FallbackUrl) {
        this.speakWithMp3(mp3FallbackUrl);
      } else {
        this.fallbackToTranscript();
      }
    }
  }

  private speakWithMp3(mp3Url: string): void {
    try {
      this.activeTier = "mp3";
      this.notifyTierChange("mp3");

      const audio = new Audio(mp3Url);
      this.currentAudioElement = audio;
      audio.playbackRate = this.playbackRate;

      audio.onplay = () => {
        this.isSpeakingState = true;
        this.isPausedState = false;
        this.notifyState();
      };

      audio.onended = () => {
        this.isSpeakingState = false;
        this.isPausedState = false;
        this.currentAudioElement = null;
        this.notifyState();
        if (this.listeners.onEnd) {
          const done = this.listeners.onEnd;
          this.listeners = {};
          done();
        }
      };

      audio.onerror = () => {
        this.fallbackToTranscript();
      };

      audio.play().catch(() => {
        this.fallbackToTranscript();
      });
    } catch {
      this.fallbackToTranscript();
    }
  }

  private fallbackToTranscript(): void {
    this.activeTier = "transcript";
    this.isSpeakingState = false;
    this.isPausedState = false;
    this.notifyTierChange("transcript");
    this.notifyState();

    if (this.listeners.onError) {
      this.listeners.onError(
        new Error("Audio playback unavailable, activated visual transcript mode.")
      );
    }
  }

  private notifyTierChange(tier: SpeechTier): void {
    if (this.listeners.onTierChange) {
      this.listeners.onTierChange(tier);
    }
  }
}

export const speechEngine = HealthSpeechEngine.getInstance();
