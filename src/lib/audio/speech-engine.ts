/**
 * RediHealth Production Speech Engine
 * Tier 1: Server Neural TTS via /api/tts (Azure AI Speech + SHA-256 cache) played via HTMLAudioElement
 * Tier 2: Native Web Speech API (strict matching-language natural voice ranking, 240-char chunking, GC retention)
 * Tier 2b: Static MP3 stream fallback when explicitly supplied
 * Tier 3: Enhanced visual transcript fallback (zero cross-language English fallback)
 */

import { isVoiceEnabled } from "@/lib/audio/voice-availability";

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
  neuralServerAvailable: boolean | null;
}

interface TextSegment {
  text: string;
  offset: number;
  prefetchedUrl?: string;
}

type Mp3FetchResult =
  | { kind: "ok"; url: string }
  | { kind: "unconfigured" }
  | { kind: "fallback" }
  | { kind: "aborted" };

/** Natural / cloud / enhanced voice indicators (Chrome, Edge, Safari, Apple Siri). */
const NATURAL_HINTS = /(natural|neural|online|premium|enhanced|wavenet|studio|siri)/i;
const GOOGLE_HINTS = /google/i;
/** Known natural Romanian, English, Albanian, Croatian, Italian, and Russian voice names. */
const KNOWN_GOOD =
  /\b(ioana|alina|emil|andrei|carmen|elena|sonia|ryan|libby|daniel|samantha|ava|andrew|emma|brian|jenny|aria|guy|karen|moira|tessa|rishi|serena|kate|oliver|elsa|isabella|diego|giuseppe|fabiola|alice|federica|luca|paola|gabrijela|srecko|lana|milena|yuri|katya|irina|pavel|svetlana|dmitry|dariya|anila|ilir)\b/i;
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
  sq: ["sq-al", "sq-xk", "sq"],
  hr: ["hr-hr", "hr"],
  it: ["it-it", "it-ch", "it"],
};

const MAX_NEURAL_SEGMENT_CHARS = 4000;

type SpeechPrefix = "ro" | "en" | "sq" | "it" | "hr" | "ru";
type InflectableUnit = "mg" | "mcg" | "ml" | "kg" | "g" | "celsius" | "percent";

interface LocaleSpeechRules {
  range: (a: string, b: string) => string;
  emergency112: string;
  bpConnector: string;
  twentyFourSeven: string;
  slashConjunction?: { pattern: RegExp; replacement: string };
  atLeast: string;
  atMost: string;
  mmHg: string;
  mgDl: string;
  mmolL: string;
  kmH: string;
  formatUnit: (rawNum: string, unit: InflectableUnit) => string;
}

function slavicPluralCategory(rawNum: string): "one" | "few" | "many" {
  if (/[.,]/.test(rawNum)) return "few";
  const n = Number.parseInt(rawNum, 10);
  const mod100 = n % 100;
  const mod10 = n % 10;
  if (mod10 === 1 && mod100 !== 11) return "one";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return "few";
  return "many";
}

function makeSimpleFormatter(
  forms: Record<InflectableUnit, [singular: string, plural: string]>,
): (rawNum: string, unit: InflectableUnit) => string {
  return (rawNum, unit) => {
    const [singular, plural] = forms[unit];
    return rawNum === "1" ? singular : plural;
  };
}

function formatRomanianUnit(rawNum: string, unit: InflectableUnit): string {
  if (unit === "percent") return "la sută";
  const roUnits: Record<Exclude<InflectableUnit, "percent">, [string, string]> = {
    mg: ["miligram", "miligrame"],
    mcg: ["microgram", "micrograme"],
    ml: ["mililitru", "mililitri"],
    kg: ["kilogram", "kilograme"],
    g: ["gram", "grame"],
    celsius: ["grad Celsius", "grade Celsius"],
  };
  const [singular, plural] = roUnits[unit];
  if (rawNum === "1") return singular;
  if (/[.,]/.test(rawNum)) return plural;
  const n = Number.parseInt(rawNum, 10);
  if (n >= 20 && (n % 100 === 0 || n % 100 >= 20)) {
    return `de ${plural}`;
  }
  return plural;
}

function makeSlavicFormatter(
  forms: Record<InflectableUnit, { one: string; few: string; many: string }>,
): (rawNum: string, unit: InflectableUnit) => string {
  return (rawNum, unit) => forms[unit][slavicPluralCategory(rawNum)];
}

const LOCALE_SPEECH_RULES: Record<SpeechPrefix, LocaleSpeechRules> = {
  ro: {
    range: (a, b) => `${a} până la ${b}`,
    emergency112: "unu unu doi",
    bpConnector: "cu",
    twentyFourSeven: "24 din 24, 7 zile din 7",
    slashConjunction: {
      pattern: /(?<![\p{L}\d])și\/sau(?![\p{L}\d])/giu,
      replacement: "și sau",
    },
    atLeast: "cel puțin ",
    atMost: "cel mult ",
    mmHg: "milimetri coloană de mercur",
    mgDl: "miligrame pe decilitru",
    mmolL: "milimoli pe litru",
    kmH: "kilometri pe oră",
    formatUnit: formatRomanianUnit,
  },
  en: {
    range: (a, b) => `${a} to ${b}`,
    emergency112: "one one two",
    bpConnector: "over",
    twentyFourSeven: "twenty-four seven",
    slashConjunction: { pattern: /\band\/or\b/gi, replacement: "and or" },
    atLeast: "at least ",
    atMost: "at most ",
    mmHg: "millimeters of mercury",
    mgDl: "milligrams per deciliter",
    mmolL: "millimoles per liter",
    kmH: "kilometers per hour",
    formatUnit: makeSimpleFormatter({
      mg: ["milligram", "milligrams"],
      mcg: ["microgram", "micrograms"],
      ml: ["milliliter", "milliliters"],
      kg: ["kilogram", "kilograms"],
      g: ["gram", "grams"],
      celsius: ["degree Celsius", "degrees Celsius"],
      percent: ["percent", "percent"],
    }),
  },
  sq: {
    range: (a, b) => `nga ${a} deri në ${b}`,
    emergency112: "një një dy",
    bpConnector: "me",
    twentyFourSeven: "24 orë në ditë, 7 ditë në javë",
    slashConjunction: {
      pattern: /(?<![\p{L}\d])dhe\/ose(?![\p{L}\d])/giu,
      replacement: "dhe ose",
    },
    atLeast: "të paktën ",
    atMost: "të shumtën ",
    mmHg: "milimetra shtyllë zhive",
    mgDl: "miligramë për decilitër",
    mmolL: "milimole për litër",
    kmH: "kilometra në orë",
    formatUnit: makeSimpleFormatter({
      mg: ["miligram", "miligramë"],
      mcg: ["mikrogram", "mikrogramë"],
      ml: ["mililitër", "mililitra"],
      kg: ["kilogram", "kilogramë"],
      g: ["gram", "gramë"],
      celsius: ["gradë Celsius", "gradë Celsius"],
      percent: ["përqind", "përqind"],
    }),
  },
  it: {
    range: (a, b) => `da ${a} a ${b}`,
    emergency112: "uno uno due",
    bpConnector: "su",
    twentyFourSeven: "24 ore su 24, 7 giorni su 7",
    slashConjunction: { pattern: /\be\/o\b/gi, replacement: "e o" },
    atLeast: "almeno ",
    atMost: "al massimo ",
    mmHg: "millimetri di mercurio",
    mgDl: "milligrammi per decilitro",
    mmolL: "millimoli per litro",
    kmH: "chilometri all'ora",
    formatUnit: makeSimpleFormatter({
      mg: ["milligrammo", "milligrammi"],
      mcg: ["microgrammo", "microgrammi"],
      ml: ["millilitro", "millilitri"],
      kg: ["chilogrammo", "chilogrammi"],
      g: ["grammo", "grammi"],
      celsius: ["grado Celsius", "gradi Celsius"],
      percent: ["percento", "percento"],
    }),
  },
  hr: {
    range: (a, b) => `od ${a} do ${b}`,
    emergency112: "jedan jedan dva",
    bpConnector: "sa",
    twentyFourSeven: "24 sata dnevno, 7 dana u tjednu",
    slashConjunction: { pattern: /\bi\/ili\b/gi, replacement: "i ili" },
    atLeast: "najmanje ",
    atMost: "najviše ",
    mmHg: "milimetara živinog stupca",
    mgDl: "miligrama po decilitru",
    mmolL: "milimola po litri",
    kmH: "kilometara na sat",
    formatUnit: makeSlavicFormatter({
      mg: { one: "miligram", few: "miligrama", many: "miligrama" },
      mcg: { one: "mikrogram", few: "mikrograma", many: "mikrograma" },
      ml: { one: "mililitar", few: "mililitra", many: "mililitara" },
      kg: { one: "kilogram", few: "kilograma", many: "kilograma" },
      g: { one: "gram", few: "grama", many: "grama" },
      celsius: { one: "stupanj Celzija", few: "stupnja Celzija", many: "stupnjeva Celzija" },
      percent: { one: "posto", few: "posto", many: "posto" },
    }),
  },
  ru: {
    range: (a, b) => `от ${a} до ${b}`,
    emergency112: "один один два",
    bpConnector: "на",
    twentyFourSeven: "круглосуточно, 7 дней в неделю",
    slashConjunction: {
      pattern: /(?<![\p{L}\d])и\/или(?![\p{L}\d])/giu,
      replacement: "и или",
    },
    atLeast: "не менее ",
    atMost: "не более ",
    mmHg: "миллиметров ртутного столба",
    mgDl: "миллиграммов на децилитр",
    mmolL: "миллимолей на литр",
    kmH: "километров в час",
    formatUnit: makeSlavicFormatter({
      mg: { one: "миллиграмм", few: "миллиграмма", many: "миллиграммов" },
      mcg: { one: "микрограмм", few: "микрограмма", many: "микрограммов" },
      ml: { one: "миллилитр", few: "миллилитра", many: "миллилитров" },
      kg: { one: "килограмм", few: "килограмма", many: "килограммов" },
      g: { one: "грамм", few: "грамма", many: "граммов" },
      celsius: { one: "градус Цельсия", few: "градуса Цельсия", many: "градусов Цельсия" },
      percent: { one: "процент", few: "процента", many: "процентов" },
    }),
  },
};

function mapUnitToken(rawToken: string): InflectableUnit {
  const lower = rawToken.toLowerCase();
  if (lower === "µg" || lower === "mcg") return "mcg";
  if (lower === "mg" || lower === "ml" || lower === "kg" || lower === "g") return lower;
  return "g";
}

/**
 * Normalizes clinical numbers, ranges, URLs, comparisons, blood pressure ratios, temperatures,
 * percentages, and units into natural spoken words for Romanian, English, Albanian, Croatian,
 * Italian, and Russian so speech engines read them like a human clinician. Idempotent per locale.
 */
export function formatSpeechText(text: string, lang = "ro-RO"): string {
  if (!text) return "";
  const prefix = lang.replace("_", "-").toLowerCase().split("-")[0] as SpeechPrefix;
  let out = text
    .replace(/https?:\/\/\S+/gi, " ")
    .replace(/[«»„“”"]/g, "")
    .replace(/\s*·\s*/g, ". ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/(?<!\.)\.\.(?!\.)/g, ".")
    .replace(/(?:\.\s+)+\.+/g, ".")
    .replace(/([?!])(?:\s*\.+)+/g, "$1");

  const rules = LOCALE_SPEECH_RULES[prefix];
  if (!rules) {
    return out.replace(/\s+/g, " ").trim();
  }

  // Normalize decimals per locale while leaving dd.mm.yyyy dates and 1,000-style separators intact.
  if (prefix === "en") {
    out = out.replace(/(?<![\d,])(\d+),(\d{1,2})(?!\d|,\d)/g, "$1.$2");
  } else {
    out = out.replace(/(?<![\d.])(\d+)\.(\d+)(?!\d|\.\d)/g, "$1,$2");
  }

  // Expand ranges while protecting ISO dates (2026-11-14) and hyphenated phone numbers (0800-800-200).
  out = out
    .replace(
      /(?<![\d.,])(\d+(?:[.,]\d+)?)\s*[–—]\s*(\d+(?:[.,]\d+)?)(?![\d.,])/g,
      (_m, a: string, b: string) => rules.range(a, b),
    )
    .replace(
      /(?<![+\d.,-])(0|[1-9]\d{0,2})\s*-\s*([1-9]\d{0,2})(?![\d.,-])/g,
      (_m, a: string, b: string) => rules.range(a, b),
    );

  // Blood pressure ratios before mmHg (must run before mmHg and 24/7 replacements).
  out = out
    .replace(/\b(\d{2,3})\/(\d{2,3})(?=\s*mmHg\b)/g, `$1 ${rules.bpConnector} $2`)
    .replace(/\b24\/7\b/g, rules.twentyFourSeven);

  if (rules.slashConjunction) {
    out = out.replace(rules.slashConjunction.pattern, rules.slashConjunction.replacement);
  }

  out = out
    .replace(/≥\s*(?=\d)/g, rules.atLeast)
    .replace(/≤\s*(?=\d)/g, rules.atMost)
    .replace(/\b112\b/g, rules.emergency112)
    .replace(/\bmmHg\b/g, rules.mmHg)
    .replace(/\bmg\/dL\b/gi, rules.mgDl)
    .replace(/\bmmol\/L\b/gi, rules.mmolL)
    .replace(/\bkm\/h\b/gi, rules.kmH)
    .replace(
      /(?<![\p{L}\d.,])(\d+(?:[.,]\d+)?)\s*°\s*C\b/giu,
      (_m, num: string) => `${num} ${rules.formatUnit(num, "celsius")}`,
    )
    .replace(
      /(?<![\p{L}\d.,])(\d+(?:[.,]\d+)?)\s*%/gu,
      (_m, num: string) => `${num} ${rules.formatUnit(num, "percent")}`,
    )
    .replace(
      /(?<![\p{L}\d.,])(\d+(?:[.,]\d+)?)\s*(mg|mcg|µg|ml|kg|g)\b/giu,
      (_m, num: string, unit: string) => `${num} ${rules.formatUnit(num, mapUnitToken(unit))}`,
    );

  return out.replace(/\s+/g, " ").trim();
}

export interface ParsedSentenceSpan {
  startChar: number;
  endChar: number;
  text: string;
}

const SENTENCE_SPAN_REGEX =
  /(?:[^.!?]|[.!?](?!\s|$))+[.!?]+(?:\s+|$)|(?:[^.!?]|[.!?](?!\s|$))+$/g;

/**
 * Splits narration or paragraph text into sentence spans while keeping decimal
 * points inside numbers (for example "38.5 °C") attached to their sentence.
 */
export function splitSpeechSentences(text: string): ParsedSentenceSpan[] {
  const spans: ParsedSentenceSpan[] = [];
  SENTENCE_SPAN_REGEX.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = SENTENCE_SPAN_REGEX.exec(text)) !== null) {
    const raw = match[0];
    if (raw.trim().length > 0) {
      spans.push({
        startChar: match.index,
        endChar: match.index + raw.length,
        text: raw,
      });
    }
  }
  if (spans.length === 0 && text.length > 0) {
    spans.push({ startChar: 0, endChar: text.length, text });
  }
  return spans;
}

/**
 * Splits text into grammatical sentence-length chunks (<240 chars) to prevent
 * Chromium's ~15s speech watchdog cutoff and ensure smooth sequential narration.
 */
export function chunkTextIntoSentences(text: string, maxChunkLength = 240): string[] {
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

function computeChunkOffsets(fullText: string, chunks: string[], baseOffset = 0): number[] {
  const offsets: number[] = [];
  let searchStart = 0;
  for (const chunk of chunks) {
    const found = fullText.indexOf(chunk, searchStart);
    if (found !== -1) {
      offsets.push(baseOffset + found);
      searchStart = found + chunk.length;
    } else {
      offsets.push(baseOffset + searchStart);
      searchStart += chunk.length;
    }
  }
  return offsets;
}

function splitLongUnit(text: string, maxLen: number): string[] {
  if (text.length <= maxLen) return [text];
  const words = text.split(/\s+/).filter(Boolean);
  const out: string[] = [];
  let buffer = "";

  for (const word of words) {
    if (word.length > maxLen) {
      if (buffer) {
        out.push(buffer);
        buffer = "";
      }
      for (let i = 0; i < word.length; i += maxLen) {
        out.push(word.slice(i, i + maxLen));
      }
      continue;
    }
    if (!buffer) {
      buffer = word;
    } else if (buffer.length + 1 + word.length <= maxLen) {
      buffer += " " + word;
    } else {
      out.push(buffer);
      buffer = word;
    }
  }
  if (buffer) out.push(buffer);
  return out;
}

function splitTextIntoTtsSegments(fullText: string, maxLen = MAX_NEURAL_SEGMENT_CHARS): TextSegment[] {
  const trimmed = fullText.trim();
  if (!trimmed) return [];
  if (trimmed.length <= maxLen) {
    return [{ text: trimmed, offset: 0 }];
  }

  const sentences = chunkTextIntoSentences(trimmed, maxLen).flatMap((unit) =>
    splitLongUnit(unit, maxLen),
  );

  const grouped: string[] = [];
  let buffer = "";
  for (const sentence of sentences) {
    if (!buffer) {
      buffer = sentence;
    } else if (buffer.length + 1 + sentence.length <= maxLen) {
      buffer += " " + sentence;
    } else {
      grouped.push(buffer);
      buffer = sentence;
    }
  }
  if (buffer) {
    grouped.push(buffer);
  }

  const offsets = computeChunkOffsets(trimmed, grouped);
  return grouped.map((text, idx) => ({
    text,
    offset: offsets[idx] ?? 0,
  }));
}

/**
 * Discovers and ranks the best voice for the target language.
 * Never falls back to another language (such as English) when no matching voice is installed.
 */
export function findBestVoice(
  voices: SpeechSynthesisVoice[],
  targetLang = "ro-RO"
): { voice: SpeechSynthesisVoice | null; isFallback: boolean } {
  if (!voices || voices.length === 0) {
    return { voice: null, isFallback: true };
  }

  const langTag = targetLang.replace("_", "-").toLowerCase();
  const langPrefix = langTag.split("-")[0];
  const preferredRegional = PREFERRED_REGIONAL_TAGS[langPrefix] || [langTag];

  // Candidates matching target language or dialect
  const candidates = voices.filter((v) => {
    const vTag = (v.lang || "").replace("_", "-").toLowerCase();
    return vTag === langTag || vTag.startsWith(`${langPrefix}-`) || vTag === langPrefix;
  });

  let best: SpeechSynthesisVoice | null = null;
  let bestScore = -Infinity;

  for (const v of candidates) {
    const name = v.name || "";
    const uri = v.voiceURI || "";
    if (NOVELTY.test(name)) continue;

    let score = 0;
    const vTag = (v.lang || "").replace("_", "-").toLowerCase();
    const regionRank = preferredRegional.indexOf(vTag);

    if (vTag === langTag) {
      score += 20;
    } else if (regionRank !== -1) {
      score += (preferredRegional.length - regionRank) * 4;
    }

    if (NATURAL_HINTS.test(name) || NATURAL_HINTS.test(uri)) score += 28;
    if (GOOGLE_HINTS.test(name) || GOOGLE_HINTS.test(uri)) score += 18;
    if (!v.localService) score += 8;
    if (KNOWN_GOOD.test(name)) score += 10;
    if (ROBOTIC.test(name)) score -= 40;

    if (score > bestScore) {
      bestScore = score;
      best = v;
    }
  }

  if (!best) {
    return { voice: null, isFallback: true };
  }

  return { voice: best, isFallback: false };
}

export class HealthSpeechEngine {
  private static instance: HealthSpeechEngine | null = null;

  // Active utterance GC retention shield: prevents V8 from collecting in-flight utterances
  private activeUtterances: Set<SpeechSynthesisUtterance> = new Set();
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private currentAudioElement: HTMLAudioElement | null = null;
  private playbackAbortController: AbortController | null = null;

  private activeTier: SpeechTier = "webspeech";
  private isSpeakingState = false;
  private isPausedState = false;
  private playbackRate = 1.0;
  private isFallbackVoiceState = false;
  private neuralServerAvailable: boolean | null = null;
  private probePromise: Promise<boolean> | null = null;

  private currentChunks: string[] = [];
  private chunkCharOffsets: number[] = [];
  private currentChunkIndex = 0;
  private pausedChunkIndex = 0;
  private runId = 0;
  private lastEndReason: "completed" | "stopped" = "completed";

  private mp3Session: {
    run: number;
    fullText: string;
    lang: string;
    segments: TextSegment[];
    sentenceOffsets: number[];
    lastEmittedSentence: number;
    allowWebSpeechFallback: boolean;
    nextPrefetchPromise: Promise<Mp3FetchResult> | null;
    nextPrefetchIndex: number;
  } | null = null;

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

  public isNeuralServerAvailable(): boolean | null {
    return this.neuralServerAvailable;
  }

  public getRate(): number {
    return this.playbackRate;
  }

  public getLastEndReason(): "completed" | "stopped" {
    return this.lastEndReason;
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

  public async probeNeuralServer(): Promise<boolean> {
    if (typeof window === "undefined") {
      return false;
    }
    if (this.neuralServerAvailable !== null) {
      return this.neuralServerAvailable;
    }
    if (this.probePromise) {
      return this.probePromise;
    }

    this.probePromise = (async () => {
      try {
        if (typeof fetch !== "function") {
          this.neuralServerAvailable = false;
          this.notifyState();
          return false;
        }
        const res = await fetch("/api/tts", { method: "GET" });
        const data = res.ok ? ((await res.json()) as { configured?: boolean }) : null;
        this.neuralServerAvailable = Boolean(res.ok && data?.configured);
      } catch {
        this.neuralServerAvailable = false;
      } finally {
        this.probePromise = null;
        this.notifyState();
      }
      return Boolean(this.neuralServerAvailable);
    })();

    return this.probePromise;
  }

  public resetForTests(): void {
    this.listeners = {};
    this.stop();
    this.neuralServerAvailable = null;
    this.probePromise = null;
    this.playbackRate = 1.0;
    this.activeTier = "webspeech";
    this.isSpeakingState = false;
    this.isPausedState = false;
    this.isFallbackVoiceState = false;
    this.currentChunks = [];
    this.chunkCharOffsets = [];
    this.currentChunkIndex = 0;
    this.pausedChunkIndex = 0;
    this.mp3Session = null;
    this.lastEndReason = "completed";
    this.playerCloseHandlers.clear();
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
      neuralServerAvailable: this.neuralServerAvailable,
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

  private clearAudioHandlers(audio: HTMLAudioElement): void {
    audio.onplay = null;
    audio.ontimeupdate = null;
    audio.onended = null;
    audio.onerror = null;
  }

  public stop(): void {
    this.runId += 1;

    if (this.playbackAbortController) {
      this.playbackAbortController.abort();
      this.playbackAbortController = null;
    }

    this.mp3Session = null;

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
          this.clearAudioHandlers(this.currentAudioElement);
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
      this.lastEndReason = "stopped";
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
    } else if (this.activeTier === "mp3") {
      if (this.playbackAbortController) {
        this.playbackAbortController.abort();
        this.playbackAbortController = null;
      }
      if (this.mp3Session) {
        this.mp3Session.nextPrefetchPromise = null;
        this.mp3Session.nextPrefetchIndex = -1;
      }
      this.pausedChunkIndex = this.currentChunkIndex;
      if (this.currentAudioElement) {
        this.currentAudioElement.pause();
      }
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
    } else if (this.activeTier === "mp3") {
      if (this.currentAudioElement) {
        this.currentAudioElement.playbackRate = this.playbackRate;
        this.isPausedState = false;
        this.isSpeakingState = true;
        this.notifyState();

        const session = this.mp3Session;
        if (
          session &&
          this.currentChunkIndex + 1 < session.segments.length &&
          !session.segments[this.currentChunkIndex + 1].prefetchedUrl
        ) {
          this.playbackAbortController = new AbortController();
          const nextIdx = this.currentChunkIndex + 1;
          session.nextPrefetchIndex = nextIdx;
          session.nextPrefetchPromise = this.fetchNeuralTtsUrl(
            session.segments[nextIdx].text,
            session.lang,
            this.playbackAbortController.signal,
            session.run,
          );
        }

        this.currentAudioElement.play().catch(() => {
          this.fallbackToTranscript();
        });
      } else if (this.mp3Session) {
        this.isPausedState = false;
        this.isSpeakingState = true;
        this.notifyState();
        void this.playMp3SegmentAt(this.pausedChunkIndex, null);
      }
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
    if (!isVoiceEnabled(lang)) {
      options.onEnd?.();
      return;
    }

    const normalized = formatSpeechText(trimmed, lang);
    if (!normalized) {
      options.onEnd?.();
      return;
    }

    const rate = options.rate !== undefined ? options.rate : this.playbackRate;
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

    const currentRun = ++this.runId;

    // (a) Explicit MP3 URL takes precedence, falling back to Web Speech if audio fails
    if (options.mp3FallbackUrl) {
      this.playStaticMp3Queue(normalized, lang, options.mp3FallbackUrl, currentRun);
      return;
    }

    // (b) Neural server TTS when available or not yet probed
    if (this.neuralServerAvailable !== false) {
      void this.speakWithNeuralServer(normalized, lang, currentRun);
      return;
    }

    // (c) Matching Web Speech API voice (never cross-language fallback) or transcript mode
    this.fallbackFromNeuralToWebSpeech(normalized, lang);
  }

  private playStaticMp3Queue(
    fullText: string,
    lang: string,
    mp3Url: string,
    currentRun: number,
  ): void {
    const sentenceChunks = chunkTextIntoSentences(fullText, 240);
    const sentenceOffsets = computeChunkOffsets(fullText, sentenceChunks);

    this.activeTier = "mp3";
    this.notifyTierChange("mp3");
    this.currentChunks = [fullText];
    this.chunkCharOffsets = [0];
    this.currentChunkIndex = 0;
    this.pausedChunkIndex = 0;
    this.isFallbackVoiceState = false;
    this.mp3Session = {
      run: currentRun,
      fullText,
      lang,
      segments: [{ text: fullText, offset: 0, prefetchedUrl: mp3Url }],
      sentenceOffsets,
      lastEmittedSentence: -1,
      allowWebSpeechFallback: true,
      nextPrefetchPromise: null,
      nextPrefetchIndex: -1,
    };
    this.isSpeakingState = true;
    this.isPausedState = false;
    this.notifyState();

    void this.playMp3SegmentAt(0, null);
  }

  private async speakWithNeuralServer(
    fullText: string,
    lang: string,
    currentRun: number,
  ): Promise<void> {
    this.activeTier = "mp3";
    this.isSpeakingState = true;
    this.isPausedState = false;
    this.isFallbackVoiceState = false;
    this.currentChunks = [fullText];
    this.chunkCharOffsets = [0];
    this.currentChunkIndex = 0;
    this.pausedChunkIndex = 0;
    this.notifyState();

    if (this.neuralServerAvailable === null) {
      const ok = await this.probeNeuralServer();
      if (this.runId !== currentRun) return;
      if (!ok) {
        this.fallbackFromNeuralToWebSpeech(fullText, lang);
        return;
      }
    }

    const segments = splitTextIntoTtsSegments(fullText, MAX_NEURAL_SEGMENT_CHARS);
    if (segments.length === 0) {
      this.isSpeakingState = false;
      this.notifyState();
      const done = this.listeners.onEnd;
      this.listeners = {};
      this.lastEndReason = "completed";
      done?.();
      return;
    }

    const sentenceChunks = chunkTextIntoSentences(fullText, 240);
    const sentenceOffsets = computeChunkOffsets(fullText, sentenceChunks);

    this.activeTier = "mp3";
    this.notifyTierChange("mp3");
    this.currentChunks = segments.map((s) => s.text);
    this.chunkCharOffsets = segments.map((s) => s.offset);
    this.currentChunkIndex = 0;
    this.pausedChunkIndex = 0;
    this.mp3Session = {
      run: currentRun,
      fullText,
      lang,
      segments,
      sentenceOffsets,
      lastEmittedSentence: -1,
      allowWebSpeechFallback: true,
      nextPrefetchPromise: null,
      nextPrefetchIndex: -1,
    };

    if (this.isPausedState) {
      this.notifyState();
      return;
    }

    this.notifyState();
    await this.playMp3SegmentAt(0, null);
  }

  private async fetchNeuralTtsUrl(
    segmentText: string,
    lang: string,
    signal: AbortSignal,
    expectedRun: number,
  ): Promise<Mp3FetchResult> {
    try {
      if (typeof fetch !== "function") {
        return { kind: "fallback" };
      }
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: segmentText, lang }),
        signal,
      });

      if (signal.aborted || this.runId !== expectedRun) {
        return { kind: "aborted" };
      }
      if (res.status === 503) {
        return { kind: "unconfigured" };
      }
      if (res.status === 429 || !res.ok) {
        return { kind: "fallback" };
      }

      const data = (await res.json()) as { url?: string };
      if (!data?.url) {
        return { kind: "fallback" };
      }
      return { kind: "ok", url: data.url };
    } catch (err) {
      if (signal.aborted || (err as { name?: string })?.name === "AbortError") {
        return { kind: "aborted" };
      }
      return { kind: "fallback" };
    }
  }

  private async playMp3SegmentAt(
    index: number,
    prefetchedPromise: Promise<Mp3FetchResult> | null,
  ): Promise<void> {
    const session = this.mp3Session;
    if (!session || this.runId !== session.run) return;

    if (index >= session.segments.length) {
      this.mp3Session = null;
      this.currentAudioElement = null;
      this.playbackAbortController = null;
      this.isSpeakingState = false;
      this.isPausedState = false;
      this.notifyState();
      const done = this.listeners.onEnd;
      this.listeners = {};
      this.lastEndReason = "completed";
      done?.();
      return;
    }

    this.currentChunkIndex = index;
    this.pausedChunkIndex = index;
    const seg = session.segments[index];

    let url = seg.prefetchedUrl;
    if (!url) {
      if (!this.playbackAbortController || this.playbackAbortController.signal.aborted) {
        this.playbackAbortController = new AbortController();
      }
      const signal = this.playbackAbortController.signal;
      const fetchPromise =
        prefetchedPromise ??
        this.fetchNeuralTtsUrl(seg.text, session.lang, signal, session.run);

      const res = await fetchPromise;
      if (!this.mp3Session || this.mp3Session.run !== session.run || this.runId !== session.run) {
        return;
      }
      if (this.isPausedState) {
        return;
      }
      if (res.kind === "aborted") {
        return;
      }
      if (res.kind === "unconfigured") {
        this.neuralServerAvailable = false;
        this.notifyState();
        this.fallbackFromNeuralToWebSpeech(
          session.fullText.slice(seg.offset),
          session.lang,
          seg.offset,
        );
        return;
      }
      if (res.kind === "fallback") {
        this.fallbackFromNeuralToWebSpeech(
          session.fullText.slice(seg.offset),
          session.lang,
          seg.offset,
        );
        return;
      }

      url = res.url;
      seg.prefetchedUrl = url;
    }

    // Pre-fetch segment i+1 while segment i plays
    if (index + 1 < session.segments.length && !session.segments[index + 1].prefetchedUrl) {
      if (!this.playbackAbortController || this.playbackAbortController.signal.aborted) {
        this.playbackAbortController = new AbortController();
      }
      session.nextPrefetchIndex = index + 1;
      session.nextPrefetchPromise = this.fetchNeuralTtsUrl(
        session.segments[index + 1].text,
        session.lang,
        this.playbackAbortController.signal,
        session.run,
      );
    } else {
      session.nextPrefetchIndex = -1;
      session.nextPrefetchPromise = null;
    }

    const emitProgress = (ratio: number) => {
      if (this.runId !== session.run) return;
      const clamped = Math.min(1, Math.max(0, ratio));
      const charInSeg = Math.floor(clamped * seg.text.length);
      const absChar = seg.offset + charInSeg;
      this.listeners.onBoundary?.(absChar);
      if (this.listeners.onSentenceChange && session.sentenceOffsets.length > 0) {
        let sIdx = 0;
        for (let k = session.sentenceOffsets.length - 1; k >= 0; k -= 1) {
          if (absChar >= session.sentenceOffsets[k]) {
            sIdx = k;
            break;
          }
        }
        if (sIdx !== session.lastEmittedSentence) {
          session.lastEmittedSentence = sIdx;
          this.listeners.onSentenceChange(sIdx);
        }
      }
    };

    try {
      if (typeof Audio === "undefined") {
        throw new Error("Audio constructor unavailable");
      }
      const audio = new Audio(url);
      this.currentAudioElement = audio;
      audio.playbackRate = this.playbackRate;

      audio.onplay = () => {
        if (this.runId !== session.run) return;
        this.isSpeakingState = true;
        this.isPausedState = false;
        this.notifyState();
        const dur = Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration : 0;
        emitProgress(dur > 0 ? audio.currentTime / dur : 0);
      };

      audio.ontimeupdate = () => {
        if (this.runId !== session.run) return;
        const dur = Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration : 0;
        const ratio = dur > 0 ? audio.currentTime / dur : 0;
        emitProgress(ratio);
      };

      audio.onended = () => {
        if (this.runId !== session.run) return;
        this.clearAudioHandlers(audio);
        this.currentAudioElement = null;
        const nextPromise =
          session.nextPrefetchIndex === index + 1 ? session.nextPrefetchPromise : null;
        void this.playMp3SegmentAt(index + 1, nextPromise);
      };

      audio.onerror = () => {
        if (this.runId !== session.run) return;
        this.clearAudioHandlers(audio);
        this.currentAudioElement = null;
        this.playbackAbortController?.abort();
        this.playbackAbortController = null;
        if (session.allowWebSpeechFallback) {
          this.fallbackFromNeuralToWebSpeech(
            session.fullText.slice(seg.offset),
            session.lang,
            seg.offset,
          );
        } else {
          this.mp3Session = null;
          this.fallbackToTranscript();
        }
      };

      await audio.play();
    } catch {
      if (this.runId !== session.run || this.isPausedState) return;
      if (this.currentAudioElement) {
        this.clearAudioHandlers(this.currentAudioElement);
        this.currentAudioElement = null;
      }
      this.playbackAbortController?.abort();
      this.playbackAbortController = null;
      if (session.allowWebSpeechFallback) {
        this.fallbackFromNeuralToWebSpeech(
          session.fullText.slice(seg.offset),
          session.lang,
          seg.offset,
        );
      } else {
        this.mp3Session = null;
        this.fallbackToTranscript();
      }
    }
  }

  private fallbackFromNeuralToWebSpeech(
    remainingText: string,
    lang: string,
    baseOffset = 0,
  ): void {
    this.mp3Session = null;
    this.currentAudioElement = null;
    this.playbackAbortController = null;

    if (typeof window !== "undefined" && "speechSynthesis" in window && window.speechSynthesis) {
      try {
        this.speakWithWebSpeechChunks(remainingText, lang, undefined, baseOffset);
        return;
      } catch (err) {
        console.warn("Web Speech API execution failed, falling back to transcript:", err);
      }
    }

    this.fallbackToTranscript();
  }

  private speakWithWebSpeechChunks(
    fullText: string,
    lang: string,
    mp3FallbackUrl?: string,
    baseOffset = 0,
  ): void {
    if (typeof window === "undefined" || !("speechSynthesis" in window) || !window.speechSynthesis) {
      this.fallbackToTranscript();
      return;
    }

    // Discover matching voice; never fall back to a wrong-language voice
    const voices = window.speechSynthesis.getVoices();
    const { voice, isFallback } = findBestVoice(voices, lang);
    this.isFallbackVoiceState = isFallback;

    if (!voice || isFallback) {
      this.fallbackToTranscript();
      return;
    }

    this.activeTier = "webspeech";
    this.notifyTierChange("webspeech");

    const chunks = chunkTextIntoSentences(fullText, 240);
    this.currentChunks = chunks;
    this.currentChunkIndex = 0;
    this.pausedChunkIndex = 0;
    this.chunkCharOffsets = computeChunkOffsets(fullText, chunks, baseOffset);

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
          this.lastEndReason = "completed";
          done();
        }
      }
      return;
    }

    const index = this.currentChunkIndex;
    const chunkText = this.currentChunks[index];
    const chunkOffset = this.chunkCharOffsets[index] ?? 0;

    const targetLang = this.listeners.lang || "ro-RO";
    const resolvedVoice =
      voice ??
      (typeof window !== "undefined" && window.speechSynthesis
        ? findBestVoice(window.speechSynthesis.getVoices(), targetLang).voice
        : null);

    if (!resolvedVoice) {
      this.isFallbackVoiceState = true;
      this.fallbackToTranscript();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(chunkText);
    this.currentUtterance = utterance;
    // Retain in persistent Set so V8 cannot garbage-collect during playback
    this.activeUtterances.add(utterance);

    utterance.lang = resolvedVoice.lang || targetLang;
    utterance.rate = this.playbackRate;
    utterance.pitch = 1.0;
    utterance.voice = resolvedVoice;

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
      this.speakChunkQueue(currentRun, resolvedVoice, mp3FallbackUrl);
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
        this.playStaticMp3Queue(this.currentChunks.join(" "), targetLang, mp3FallbackUrl, currentRun);
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
        this.playStaticMp3Queue(this.currentChunks.join(" "), targetLang, mp3FallbackUrl, currentRun);
      } else {
        this.fallbackToTranscript();
      }
    }
  }

  private fallbackToTranscript(): void {
    this.activeTier = "transcript";
    this.isSpeakingState = false;
    this.isPausedState = false;
    this.notifyTierChange("transcript");
    this.notifyState();

    const onError = this.listeners.onError;
    this.listeners = {};
    if (onError) {
      onError(new Error("Audio playback unavailable, activated visual transcript mode."));
    }
  }

  private notifyTierChange(tier: SpeechTier): void {
    if (this.listeners.onTierChange) {
      this.listeners.onTierChange(tier);
    }
  }
}

export const speechEngine = HealthSpeechEngine.getInstance();
