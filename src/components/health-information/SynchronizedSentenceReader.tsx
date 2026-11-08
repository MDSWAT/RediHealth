"use client";

import { useRef, useEffect, useState } from "react";
import { speechEngine, formatSpeechText } from "@/lib/audio/speech-engine";
import { useVoiceEnabled } from "@/lib/audio/voice-availability";
import { useLanguage } from "@/lib/i18n/language-context";
import { type Lang } from "@/lib/i18n/translations";
import {
  SPEECH_LANG_BY_LOCALE,
  HEALTH_DETAIL_SHARED_STRINGS,
} from "@/lib/i18n/health-myths";
import {
  ROMANES_GLOSSARY_TERMS,
  type RomanesGlossaryTerm,
} from "@/lib/i18n/romanes-glossary";

export interface SynchronizedSentenceReaderProps {
  paragraphs: string[];
  activeSentenceIndex?: number | null;
  onSentenceClick?: (sentence: string, index: number) => void;
  className?: string;
  lang?: Lang;
}

const GLOSSARY_MAP: Record<string, RomanesGlossaryTerm> = {};
ROMANES_GLOSSARY_TERMS.forEach((term) => {
  GLOSSARY_MAP[term.id] = term;
});

const TERM_MATCHERS: { regex: RegExp; termId: string }[] = [
  { regex: /\b(tensiune(?:a|i)?\s+arterial[aă]|hipertensiun(?:e|ea|ii)|tensiun(?:e|ea|ii))\b/i, termId: "tensiune-arteriala" },
  { regex: /\b(inim[aă]|inimii)\b/i, termId: "inima" },
  { regex: /\b(s[aâ]nge(?:le|lui)?)\b/i, termId: "sange" },
  { regex: /\b(diabet(?:ul|ului)?|glicemi(?:e|a|ei))\b/i, termId: "diabet" },
  { regex: /\b(durer(?:e|ea|i|ile))\b/i, termId: "durere" },
  { regex: /\b(febr[aă]|febril[aă])\b/i, termId: "febra" },
  { regex: /\b(medicament(?:e|ul|elor)?|pastil[aă]|pastile(?:le)?)\b/i, termId: "medicament" },
  { regex: /\b(medic(?:ul|ului|i|ilor)?|doctor(?:ul|ului|i)?)\b/i, termId: "medic" },
  { regex: /\b(spital(?:ul|ului|e)?)\b/i, termId: "spital" },
  { regex: /\b(respira[tț]i(?:e|a|ei)|lips[aă]\s+de\s+aer)\b/i, termId: "respiratie-greoaie" },
  { regex: /\b(ame[tț]eal[aă]|ame[tț]eli(?:le)?)\b/i, termId: "ametela" },
  { regex: /\b(analiz(?:e|ele)\s+de\s+s[aâ]nge)\b/i, termId: "analize-sange" },
  { regex: /\b(sarcin[aă]|[iî]ns[aă]rcinat[aă])\b/i, termId: "sarcina" },
  { regex: /\b(vaccin(?:ul|ului|uri|urile)?|imunizar(?:e|ea))\b/i, termId: "vaccin" },
  { regex: /\b(urgen[tț][aă]|urgen[tț]e(?:le)?)\b/i, termId: "urgenta" },
];

/**
 * The matchers are Romanian word forms mapped to the Romanes glossary, so terms are only
 * linked on Romanian text; other locales show plain text (no false matches such as
 * English "doctor" or Albanian "spital").
 */
function tokenizeSentence(sentence: string, linkTerms: boolean): { text: string; term?: RomanesGlossaryTerm }[] {
  if (!linkTerms) return [{ text: sentence }];
  interface MatchPos {
    start: number;
    end: number;
    term: RomanesGlossaryTerm;
  }

  const matches: MatchPos[] = [];
  for (const matcher of TERM_MATCHERS) {
    const term = GLOSSARY_MAP[matcher.termId];
    if (!term) continue;

    const regex = new RegExp(matcher.regex.source, "gi");
    let match: RegExpExecArray | null;
    while ((match = regex.exec(sentence)) !== null) {
      const start = match.index;
      const end = start + match[0].length;

      const overlaps = matches.some((m) => !(end <= m.start || start >= m.end));
      if (!overlaps) {
        matches.push({ start, end, term });
      }
    }
  }

  if (matches.length === 0) {
    return [{ text: sentence }];
  }

  matches.sort((a, b) => a.start - b.start);

  const segments: { text: string; term?: RomanesGlossaryTerm }[] = [];
  let cursor = 0;

  for (const m of matches) {
    if (m.start > cursor) {
      segments.push({ text: sentence.slice(cursor, m.start) });
    }
    segments.push({
      text: sentence.slice(m.start, m.end),
      term: m.term,
    });
    cursor = m.end;
  }

  if (cursor < sentence.length) {
    segments.push({ text: sentence.slice(cursor) });
  }

  return segments;
}

function useSafeLanguageContext(): { lang: Lang } {
  try {
    return useLanguage();
  } catch {
    return { lang: "ro" };
  }
}

export function SynchronizedSentenceReader({
  paragraphs,
  activeSentenceIndex = null,
  onSentenceClick,
  className = "",
  lang,
}: SynchronizedSentenceReaderProps) {
  const { lang: ctxLang } = useSafeLanguageContext();
  const currentLang: Lang = lang ?? ctxLang ?? "ro";
  const speechLang = SPEECH_LANG_BY_LOCALE[currentLang] ?? "ro-RO";
  const str = HEALTH_DETAIL_SHARED_STRINGS.synchronizedReader;

  const voiceEnabled = useVoiceEnabled();
  // Sentences are clickable only when a handler exists or they can be read aloud.
  const sentencesClickable = Boolean(onSentenceClick) || voiceEnabled;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [activePopoverTerm, setActivePopoverTerm] = useState<RomanesGlossaryTerm | null>(null);
  const [isPlayingTermAudio, setIsPlayingTermAudio] = useState(false);
  const popoverCloseRef = useRef<HTMLButtonElement | null>(null);

  // Popover: focus moves into it, Escape closes it, focus returns to the word.
  useEffect(() => {
    if (!activePopoverTerm) return;
    const opener = document.activeElement as HTMLElement | null;
    popoverCloseRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActivePopoverTerm(null);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      opener?.focus?.();
    };
  }, [activePopoverTerm]);

  // Split all paragraphs into sentences while preserving paragraph grouping
  let globalSentenceCounter = 0;
  const parsedParagraphs = paragraphs.map((para) => {
    // Regex splits sentences ending with . ! ? followed by space or end
    const sentences = para.match(/[^.!?]+[.!?]+(\s|$)|[^.!?]+$/g) || [para];
    return sentences.map((sent) => {
      const idx = globalSentenceCounter++;
      return { text: sent, index: idx, segments: tokenizeSentence(sent, currentLang === "ro") };
    });
  });

  // Autoscroll active sentence into view
  useEffect(() => {
    if (activeSentenceIndex === null || activeSentenceIndex === undefined) return;
    if (!containerRef.current) return;

    const activeEl = containerRef.current.querySelector(
      `[data-sentence-id="${activeSentenceIndex}"]`
    );
    if (activeEl) {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      activeEl.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
    }
  }, [activeSentenceIndex]);

  const handleSentenceClick = (sentence: string, index: number) => {
    if (onSentenceClick) {
      onSentenceClick(sentence, index);
    } else if (voiceEnabled) {
      speechEngine.speak(formatSpeechText(sentence, speechLang), { lang: speechLang });
    }
  };

  const handleSpeakPopoverTerm = () => {
    if (!activePopoverTerm || !voiceEnabled) return;
    setIsPlayingTermAudio(true);
    speechEngine.speak(formatSpeechText(activePopoverTerm.audioPronunciationText, speechLang), {
      lang: speechLang,
      rate: 0.9,
      onEnd: () => setIsPlayingTermAudio(false),
      onError: () => setIsPlayingTermAudio(false),
    });
  };

  return (
    <>
      <div
        ref={containerRef}
        className={`space-y-4 text-base leading-relaxed text-foreground sm:text-lg ${className}`}
      >
        {parsedParagraphs.map((paraSentences, pIdx) => (
          <p key={pIdx}>
            {paraSentences.map(({ text, index, segments }) => {
              const isActive = activeSentenceIndex === index;
              return (
                <span
                  key={index}
                  data-sentence-id={index}
                  onClick={sentencesClickable ? () => handleSentenceClick(text, index) : undefined}
                  className={`rounded-md transition-colors duration-[var(--dur-base)] ease-[var(--ease-out-calm)] motion-reduce:transition-none ${
                    sentencesClickable ? "cursor-pointer" : ""
                  } ${
                    isActive
                      ? "bg-sapphire-soft text-foreground"
                      : sentencesClickable
                        ? "hover:bg-muted/50"
                        : ""
                  }`}
                  title={sentencesClickable ? str.sentenceClickTitle[currentLang] : undefined}
                >
                  {segments.map((seg, sIdx) => {
                    if (!seg.term) {
                      return <span key={sIdx}>{seg.text}</span>;
                    }

                    return (
                      <span
                        key={sIdx}
                        role="button"
                        tabIndex={0}
                        onClick={(e) => {
                          e.stopPropagation();
                          setActivePopoverTerm(seg.term!);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.stopPropagation();
                            e.preventDefault();
                            setActivePopoverTerm(seg.term!);
                          }
                        }}
                        className="relative inline-block cursor-pointer rounded-xs border-b border-dashed border-sapphire px-0.5 font-medium text-sapphire transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-sapphire-soft"
                        title={str.termTitleTemplate[currentLang].replace("{term}", seg.term.romanesTerm)}
                      >
                        {seg.text}
                      </span>
                    );
                  })}
                </span>
              );
            })}
          </p>
        ))}
      </div>

      {/* Floating Bilingual Romanes Translation Popover */}
      {activePopoverTerm && (
        <>
          <div
            className="hh-scrim fixed inset-0 z-40 bg-black/40"
            onClick={() => setActivePopoverTerm(null)}
            aria-hidden="true"
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-label={str.popoverAria[currentLang]}
            className="hh-fade fixed inset-x-4 bottom-20 z-50 mx-auto max-w-md rounded-lg border border-border bg-card p-5 shadow-xl sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2"
          >
            {/* Popover Header */}
            <div className="flex items-start justify-between gap-3 border-b border-border/50 pb-3">
              <div>
                <h2 className="text-xl font-semibold text-foreground">
                  {activePopoverTerm.romanesTerm}
                </h2>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {str.popoverBadge[currentLang]} · {str.romanianLabel[currentLang]}{" "}
                  <strong className="text-foreground">
                    {activePopoverTerm.romanianTerm}
                  </strong>
                </p>
              </div>

              <button
                ref={popoverCloseRef}
                type="button"
                onClick={() => setActivePopoverTerm(null)}
                className="-mr-2 -mt-2 flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire"
                aria-label={str.closeAria[currentLang]}
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>

            {/* Phonetic guide & audio pronunciation trigger */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/40 bg-surface-subtle p-3">
              <div>
                <span className="block text-xs font-medium text-muted-foreground">
                  {str.phoneticGuide[currentLang]}
                </span>
                <span className="text-sm font-semibold text-sapphire">
                  [{activePopoverTerm.phoneticPronunciation}]
                </span>
              </div>

              {voiceEnabled && (
                <button
                  type="button"
                  onClick={handleSpeakPopoverTerm}
                  aria-label={str.listenPronunciationAria[currentLang]}
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-sapphire px-3.5 py-2 text-sm font-semibold text-white transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-sapphire-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire"
                >
                  {isPlayingTermAudio ? (
                    <svg
                      className="h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <rect x="6" y="4" width="4" height="16" />
                      <rect x="14" y="4" width="4" height="16" />
                    </svg>
                  ) : (
                    <svg
                      className="h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                    </svg>
                  )}
                  <span>{str.listenPronunciationButton[currentLang]}</span>
                </button>
              )}
            </div>

            {/* Meaning & plain explanation */}
            <p className="mt-3.5 text-sm leading-relaxed text-muted-foreground">
              {activePopoverTerm.explanation}
            </p>

            <div className="mt-4 flex justify-end border-t border-border/40 pt-3">
              <button
                type="button"
                onClick={() => setActivePopoverTerm(null)}
                className="inline-flex min-h-[44px] items-center justify-center rounded-lg border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire"
              >
                {str.dismissButton[currentLang]}
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
