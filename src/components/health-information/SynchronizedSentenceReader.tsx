"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { speechEngine, formatSpeechText, splitSpeechSentences } from "@/lib/audio/speech-engine";
import { isVoiceEnabled, useVoiceEnabled } from "@/lib/audio/voice-availability";
import { useLanguage } from "@/lib/i18n/language-context";
import { prefersCalmOrReducedMotion } from "@/lib/comfort-preferences";
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
function tokenizeSentence(
  sentence: string,
  linkTerms: boolean,
): { text: string; term?: RomanesGlossaryTerm }[] {
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

type LocalizedRomanesTerm = RomanesGlossaryTerm & {
  explanationByLang?: Partial<Record<Lang, string>>;
  termByLang?: Partial<Record<Lang, string>>;
};

function pickLocale(
  entry: Record<"ro", string> & Partial<Record<Lang, string>>,
  lang: Lang,
): string {
  return entry[lang] ?? entry.ro;
}

function pickSpeechLang(lang: Lang): string {
  return (
    (SPEECH_LANG_BY_LOCALE as Partial<Record<Lang, string>>)[lang] ??
    (lang === "hr" ? "hr-HR" : "ro-RO")
  );
}

/*
 * The sentence being read takes a soft tint and a 2px sapphire rule that draws from the start of
 * the line (a sized background, so it follows wrapped lines), and lets go the same way. Under
 * reduced motion it simply appears.
 */
const SENTENCE_CLASS =
  "box-decoration-clone rounded-xs bg-[linear-gradient(var(--color-sapphire),var(--color-sapphire))] bg-no-repeat bg-position-[0_100%] transition-[background-color,background-size] duration-[var(--dur-slow)] ease-[var(--ease-out-calm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none";

export function SynchronizedSentenceReader({
  paragraphs,
  activeSentenceIndex = null,
  onSentenceClick,
  className = "",
  lang,
}: SynchronizedSentenceReaderProps) {
  const { lang: ctxLang } = useSafeLanguageContext();
  const currentLang: Lang = lang ?? ctxLang ?? "ro";
  const speechLang = pickSpeechLang(currentLang);
  const str = HEALTH_DETAIL_SHARED_STRINGS.synchronizedReader;

  const ctxVoice = useVoiceEnabled();
  const voiceEnabled =
    lang !== undefined ? isVoiceEnabled(lang) : ctxVoice && isVoiceEnabled(currentLang);
  const romaniVoiceEnabled = isVoiceEnabled("rom");
  // Sentences are interactive only when a handler exists or they can be read aloud.
  const sentencesClickable = Boolean(onSentenceClick) || voiceEnabled;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [activePopoverTerm, setActivePopoverTerm] =
    useState<RomanesGlossaryTerm | null>(null);
  const [anchorStyle, setAnchorStyle] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const [isPlayingTermAudio, setIsPlayingTermAudio] = useState(false);

  const anchorElRef = useRef<HTMLElement | null>(null);
  const popoverRef = useRef<HTMLDivElement | null>(null);
  const popoverCloseRef = useRef<HTMLButtonElement | null>(null);

  const updateAnchorPosition = useCallback(() => {
    const el = anchorElRef.current;
    if (!el || typeof window === "undefined") return;
    const rect = el.getBoundingClientRect();
    const cardWidth = Math.min(384, window.innerWidth - 32);
    const cardHeight = 260;
    const clampedLeft = Math.max(
      16,
      Math.min(window.innerWidth - cardWidth - 16, rect.left),
    );
    const fitsBelow = rect.bottom + 10 + cardHeight < window.innerHeight - 16;
    const top = fitsBelow
      ? rect.bottom + 8
      : Math.max(16, rect.top - cardHeight - 8);
    setAnchorStyle({ top, left: clampedLeft });
  }, []);

  // Popover: focus trap + Escape closes + rAF anchored position on desktop + focus returns to word
  useEffect(() => {
    if (!activePopoverTerm) return;
    const opener = anchorElRef.current;
    popoverCloseRef.current?.focus();

    let rafId: number | null = requestAnimationFrame(updateAnchorPosition);
    const scheduleReposition = () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updateAnchorPosition);
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setActivePopoverTerm(null);
        return;
      }
      if (e.key === "Tab" && popoverRef.current) {
        const focusable = Array.from(
          popoverRef.current.querySelectorAll<HTMLElement>(
            'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
          ),
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener("keydown", onKey);
    window.addEventListener("scroll", scheduleReposition, { passive: true });
    window.addEventListener("resize", scheduleReposition);

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", scheduleReposition);
      window.removeEventListener("resize", scheduleReposition);
      opener?.focus?.();
    };
  }, [activePopoverTerm, updateAnchorPosition]);

  // Split all paragraphs into sentences while preserving paragraph grouping
  let globalSentenceCounter = 0;
  const parsedParagraphs = paragraphs.map((para) => {
    const spans = splitSpeechSentences(para);
    const sentences = spans.length > 0 ? spans.map((span) => span.text) : [para];
    return sentences.map((sent) => {
      const idx = globalSentenceCounter++;
      return {
        text: sent,
        index: idx,
        segments: tokenizeSentence(sent, currentLang === "ro"),
      };
    });
  });

  // Autoscroll active sentence into view
  useEffect(() => {
    if (activeSentenceIndex === null || activeSentenceIndex === undefined)
      return;
    if (!containerRef.current) return;

    const activeEl = containerRef.current.querySelector(
      `[data-sentence-id="${activeSentenceIndex}"]`,
    );
    if (activeEl) {
      const reduce = prefersCalmOrReducedMotion();
      activeEl.scrollIntoView({
        behavior: reduce ? "auto" : "smooth",
        block: "center",
      });
    }
  }, [activeSentenceIndex]);

  const handleSentenceClick = (sentence: string, index: number) => {
    if (onSentenceClick) {
      onSentenceClick(sentence, index);
    } else if (voiceEnabled) {
      speechEngine.speak(formatSpeechText(sentence, speechLang), {
        lang: speechLang,
      });
    }
  };

  const openTermCard = (term: RomanesGlossaryTerm, target: HTMLElement) => {
    anchorElRef.current = target;
    setActivePopoverTerm(term);
  };

  const handleSpeakPopoverTerm = () => {
    if (!activePopoverTerm || !romaniVoiceEnabled) return;
    setIsPlayingTermAudio(true);
    speechEngine.speak(
      formatSpeechText(activePopoverTerm.audioPronunciationText, "rom"),
      {
        lang: "rom",
        rate: 1.0,
        onEnd: () => setIsPlayingTermAudio(false),
        onError: () => setIsPlayingTermAudio(false),
      },
    );
  };

  return (
    <>
      <div
        ref={containerRef}
        className={`space-y-5 max-w-[65ch] text-[1.125rem] leading-[1.75] text-foreground ${className}`}
      >
        {parsedParagraphs.map((paraSentences, pIdx) => (
          <p key={pIdx}>
            {paraSentences.map(({ text, index, segments }) => {
              const isActive = activeSentenceIndex === index;
              return (
                <span
                  key={index}
                  data-sentence-id={index}
                  role={sentencesClickable ? "button" : undefined}
                  tabIndex={sentencesClickable ? 0 : undefined}
                  aria-current={isActive ? "true" : undefined}
                  onClick={
                    sentencesClickable
                      ? () => handleSentenceClick(text, index)
                      : undefined
                  }
                  onKeyDown={
                    sentencesClickable
                      ? (e) => {
                          if (e.target !== e.currentTarget) return;
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            handleSentenceClick(text, index);
                          }
                        }
                      : undefined
                  }
                  className={`${SENTENCE_CLASS} ${
                    sentencesClickable ? "cursor-pointer" : ""
                  } ${
                    isActive
                      ? "bg-sapphire-soft bg-size-[100%_2px] text-foreground"
                      : sentencesClickable
                        ? "bg-size-[0%_2px] hover:bg-muted/60"
                        : "bg-size-[0%_2px]"
                  }`}
                  title={
                    sentencesClickable
                      ? pickLocale(str.sentenceClickTitle, currentLang)
                      : undefined
                  }
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
                        aria-haspopup="dialog"
                        onClick={(e) => {
                          e.stopPropagation();
                          openTermCard(seg.term!, e.currentTarget);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.stopPropagation();
                            e.preventDefault();
                            openTermCard(seg.term!, e.currentTarget);
                          }
                        }}
                        className="box-decoration-clone cursor-pointer rounded-xs border-b border-dashed border-sapphire font-medium text-sapphire transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] motion-reduce:transition-none hover:bg-sapphire-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        title={pickLocale(
                          str.termTitleTemplate,
                          currentLang,
                        ).replace("{term}", seg.term.romanesTerm)}
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

      {/* Contextual Romani term card: bottom sheet on mobile, anchored non-scrim card on desktop */}
      {activePopoverTerm && (
        <>
          <div
            className="hh-fade fixed inset-0 z-40 bg-black/40 sm:bg-transparent"
            onClick={() => setActivePopoverTerm(null)}
            aria-hidden="true"
          />

          <div
            ref={popoverRef}
            role="dialog"
            aria-modal="true"
            aria-label={pickLocale(str.popoverAria, currentLang)}
            style={
              anchorStyle
                ? ({
                    "--term-top": `${anchorStyle.top}px`,
                    "--term-left": `${anchorStyle.left}px`,
                  } as React.CSSProperties)
                : undefined
            }
            className="hh-dialog fixed inset-x-4 bottom-20 z-50 mx-auto max-w-sm rounded-xl border border-border bg-card p-5 shadow-xl sm:inset-x-auto sm:bottom-auto sm:mx-0 sm:w-96 sm:top-[var(--term-top,30%)] sm:left-[var(--term-left,30%)]"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-3 border-b border-border/60 pb-3">
              <div>
                <span className="block text-sm font-semibold text-sapphire">
                  {pickLocale(str.popoverBadge, currentLang)}
                </span>
                <h2 className="mt-1.5 text-xl font-semibold text-foreground">
                  {activePopoverTerm.romanesTerm}
                </h2>
                <p className="mt-1 text-base text-muted-foreground">
                  {pickLocale(str.romanianLabel, currentLang)}{" "}
                  <strong className="text-foreground">
                    {(activePopoverTerm as LocalizedRomanesTerm).termByLang?.[
                      currentLang
                    ] ?? activePopoverTerm.romanianTerm}
                  </strong>
                </p>
              </div>

              <button
                ref={popoverCloseRef}
                type="button"
                onClick={() => setActivePopoverTerm(null)}
                className="press-row -mr-2 -mt-1 flex min-h-11 min-w-11 shrink-0 items-center justify-center whitespace-nowrap rounded-lg text-muted-foreground transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] motion-reduce:transition-none hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label={pickLocale(str.closeAria, currentLang)}
              >
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  aria-hidden="true"
                >
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>

            {/* Phonetic guide and audio pronunciation trigger */}
            <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/60 bg-surface-subtle p-3">
              <div>
                <span className="block text-sm font-medium text-muted-foreground">
                  {pickLocale(str.phoneticGuide, currentLang)}
                </span>
                <span className="text-base font-semibold text-sapphire">
                  [{activePopoverTerm.phoneticPronunciation}]
                </span>
              </div>

              {romaniVoiceEnabled && (
                <button
                  type="button"
                  onClick={handleSpeakPopoverTerm}
                  aria-label={pickLocale(
                    str.listenPronunciationAria,
                    currentLang,
                  )}
                  className="press-solid inline-flex min-h-12 items-center gap-2 whitespace-nowrap rounded-lg bg-sapphire px-4 py-2 text-base font-semibold text-white transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] motion-reduce:transition-none hover:bg-sapphire-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
                  <span>
                    {pickLocale(str.listenPronunciationButton, currentLang)}
                  </span>
                </button>
              )}
            </div>

            {/* Meaning and plain explanation */}
            <p className="mt-3 text-base leading-relaxed text-foreground">
              {(activePopoverTerm as LocalizedRomanesTerm).explanationByLang?.[
                currentLang
              ] ?? activePopoverTerm.explanation}
            </p>

            <div className="mt-4 flex justify-end border-t border-border/50 pt-3">
              <button
                type="button"
                onClick={() => setActivePopoverTerm(null)}
                className="press-row inline-flex min-h-12 items-center justify-center whitespace-nowrap rounded-lg border border-border-control bg-card px-4 py-2 text-base font-semibold text-foreground transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] motion-reduce:transition-none hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {pickLocale(str.dismissButton, currentLang)}
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
