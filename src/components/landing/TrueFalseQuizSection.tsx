"use client";

import { useCallback, useMemo, useState, useSyncExternalStore } from "react";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { useLanguage } from "@/lib/i18n/language-context";
import type { Lang } from "@/lib/i18n/translations";
import {
  getHealthMyths,
  getMythCategories,
  type HealthMyth,
} from "@/lib/i18n/health-myths";
import { MythCategoryFilter } from "./MythCategoryFilter";
import { MythCardCarousel, type MythResult } from "./MythCardCarousel";
import { QuizFeedbackCard } from "./QuizFeedbackCard";
import { InlineAudioNarratorButton } from "@/components/health-information/InlineAudioNarratorButton";
import { CheckIcon, CloseIcon, RefreshIcon } from "@/components/ui/icons";

const ANSWERS_STORAGE_KEY = "redihealth_myth_answers_v1";

const extraCopy: Record<
  Lang,
  {
    score: (correct: number, answered: number) => string;
    doneTitle: (correct: number, total: number) => string;
    doneBody: string;
    restart: string;
  }
> = {
  ro: {
    score: (c, a) => `${c} din ${a} corecte`,
    doneTitle: (c, t) => `Ai răspuns corect la ${c} din ${t}`,
    doneBody: "Răspunsurile tale sunt salvate pe acest dispozitiv.",
    restart: "Începe din nou",
  },
  en: {
    score: (c, a) => `${c} of ${a} correct`,
    doneTitle: (c, t) => `You got ${c} of ${t} right`,
    doneBody: "Your answers are saved on this device.",
    restart: "Start over",
  },
  sq: {
    score: (c, a) => `${c} nga ${a} të sakta`,
    doneTitle: (c, t) => `Iu përgjigje saktë ${c} nga ${t}`,
    doneBody: "Përgjigjet e tua ruhen në këtë pajisje.",
    restart: "Fillo nga e para",
  },
  it: {
    score: (c, a) => `${c} su ${a} corrette`,
    doneTitle: (c, t) => `Hai risposto bene a ${c} su ${t}`,
    doneBody: "Le tue risposte sono salvate su questo dispositivo.",
    restart: "Ricomincia",
  },
  hr: {
    score: (c, a) => `${c} od ${a} točnih`,
    doneTitle: (c, t) => `Točno si odgovorio ili odgovorila na ${c} od ${t}`,
    doneBody: "Tvoji su odgovori spremljeni na ovom uređaju.",
    restart: "Kreni ispočetka",
  },
  rom: {
    score: (c, a) => `${c} katar ${a} chache`,
    doneTitle: (c, t) => `Djan chacho anglalipe pe ${c} katar ${t}`,
    doneBody: "Chire anglalipnata si arakhle pe kadava aparati.",
    restart: "Nachav katar o shirdipen",
  },
};

/**
 * Keyboard answers, active only while focus is inside the quiz: the first
 * letter of each language's word for "true" / "false", or 1 / 2. Announced
 * through aria-keyshortcuts on the answer buttons and shown as quiet keycaps.
 */
const ANSWER_KEYS: Record<Lang, { true: string[]; false: string[] }> = {
  ro: { true: ["a", "1"], false: ["f", "2"] }, // adevărat / fals
  en: { true: ["t", "1"], false: ["f", "2"] }, // true / false
  sq: { true: ["v", "1"], false: ["r", "2"] }, // e vërtetë / e rreme
  it: { true: ["v", "1"], false: ["f", "2"] }, // vero / falso
  hr: { true: ["t", "i", "1"], false: ["n", "l", "2"] }, // točno / netočno (istina / laž)
  rom: { true: ["c", "1"], false: ["n", "x", "2"] }, // chacho / na-i chacho (xoxamno)
};
const keyShortcuts = (keys: string[]) => keys.map((key) => key.toUpperCase()).join(" ");

/** Quotation marks around the myth, in each language's own typographic style. */
const QUOTES: Record<Lang, [string, string]> = {
  ro: ["„", "”"],
  en: ["“", "”"],
  sq: ["«", "»"],
  it: ["«", "»"],
  hr: ["„", "”"],
  rom: ["“", "”"],
};

const SPEECH_LANG: Record<Lang, string> = {
  ro: "ro-RO",
  en: "en-US",
  sq: "sq-AL",
  it: "it-IT",
  hr: "hr-HR",
  rom: "ro-RO",
};

type Answers = Record<string, boolean>;
const EMPTY_ANSWERS: Answers = {};

/**
 * Answers live in localStorage so progress survives reloads. A tiny external
 * store keeps every quiz instance in sync and renders empty on the server.
 */
const answerStore = (() => {
  let cache: Answers | null = null;
  const listeners = new Set<() => void>();
  const read = (): Answers => {
    if (cache) return cache;
    try {
      const parsed: unknown = JSON.parse(
        localStorage.getItem(ANSWERS_STORAGE_KEY) ?? "{}",
      );
      const clean: Answers = {};
      if (parsed && typeof parsed === "object") {
        for (const [id, v] of Object.entries(
          parsed as Record<string, unknown>,
        )) {
          if (typeof v === "boolean") clean[id] = v;
        }
      }
      cache = clean;
    } catch {
      cache = {};
    }
    return cache;
  };
  return {
    get: read,
    getServer: () => EMPTY_ANSWERS,
    set(next: Answers) {
      cache = next;
      try {
        localStorage.setItem(ANSWERS_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Storage unavailable: answers still work for this visit.
      }
      listeners.forEach((l) => l());
    },
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
})();

export interface TrueFalseQuizSectionProps {
  className?: string;
  initialCategory?: string;
}

export function TrueFalseQuizSection({
  className = "",
  initialCategory = "toate",
}: TrueFalseQuizSectionProps) {
  const { lang, t } = useLanguage();
  const q = t.quiz;
  const extra = extraCopy[lang as Lang] ?? extraCopy.ro;
  const answerKeys = ANSWER_KEYS[lang as Lang] ?? ANSWER_KEYS.ro;
  const allMyths = useMemo(() => getHealthMyths(lang), [lang]);
  const categories = getMythCategories(lang);

  const [selectedCategory, setSelectedCategory] =
    useState<string>(initialCategory);
  const [currentIndex, setIndexState] = useState<number>(0);
  // The myth answered just now: its verdict takes focus, since the answer buttons unmount.
  // Cleared on any navigation, so revisiting an answered myth never moves focus.
  const [justAnsweredId, setJustAnsweredId] = useState<string | null>(null);
  const setCurrentIndex = useCallback((next: number | ((current: number) => number)) => {
    setJustAnsweredId(null);
    setIndexState(next);
  }, []);
  const userAnswers = useSyncExternalStore(
    answerStore.subscribe,
    answerStore.get,
    answerStore.getServer,
  );

  const filteredMyths = useMemo(
    () =>
      selectedCategory === "toate"
        ? allMyths
        : allMyths.filter((m) => m.categorySlug === selectedCategory),
    [allMyths, selectedCategory],
  );

  const results = useMemo(() => {
    const map: Record<string, MythResult> = {};
    for (const m of allMyths) {
      const a = userAnswers[m.id];
      if (a !== undefined) map[m.id] = a === m.isTrue ? "correct" : "wrong";
    }
    return map;
  }, [allMyths, userAnswers]);

  const categoryProgress = useMemo(() => {
    const out: Record<string, { total: number; answered: number }> = {};
    for (const cat of categories) {
      const pool =
        cat.slug === "toate"
          ? allMyths
          : allMyths.filter((m) => m.categorySlug === cat.slug);
      out[cat.slug] = {
        total: pool.length,
        answered: pool.filter((m) => results[m.id]).length,
      };
    }
    return out;
  }, [categories, allMyths, results]);

  const answeredInView = filteredMyths.filter((m) => results[m.id]).length;
  const correctInView = filteredMyths.filter(
    (m) => results[m.id] === "correct",
  ).length;
  const allAnsweredInView =
    filteredMyths.length > 0 && answeredInView === filteredMyths.length;

  const currentMyth: HealthMyth | undefined =
    filteredMyths[currentIndex] || filteredMyths[0];

  const handleCategorySelect = (categorySlug: string) => {
    setSelectedCategory(categorySlug);
    setCurrentIndex(0);
  };

  const handleAnswer = useCallback(
    (answer: boolean) => {
      if (!currentMyth) return;
      const prev = answerStore.get();
      if (prev[currentMyth.id] !== undefined) return;
      setJustAnsweredId(currentMyth.id);
      answerStore.set({ ...prev, [currentMyth.id]: answer });
    },
    [currentMyth],
  );

  const handleRestart = () => {
    const next = { ...answerStore.get() };
    for (const m of filteredMyths) delete next[m.id];
    answerStore.set(next);
    setCurrentIndex(0);
  };

  // Key bindings apply only while focus is inside the quiz, never page-wide.
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const target = e.target as HTMLElement;
    if (target.closest("input, textarea, select, [contenteditable='true']"))
      return;
    const key = e.key.toLowerCase();
    if (e.key === "ArrowRight" && currentIndex < filteredMyths.length - 1) {
      e.preventDefault();
      setCurrentIndex((i) => i + 1);
    } else if (e.key === "ArrowLeft" && currentIndex > 0) {
      e.preventDefault();
      setCurrentIndex((i) => i - 1);
    } else if (answerKeys.true.includes(key)) {
      handleAnswer(true);
    } else if (answerKeys.false.includes(key)) {
      handleAnswer(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < filteredMyths.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  if (!currentMyth) return null;

  const currentAnswer = userAnswers[currentMyth.id];
  const hasAnswered = currentAnswer !== undefined;
  const quotes = QUOTES[lang as Lang] ?? QUOTES.ro;

  return (
    <section
      id="mituri-sanatate"
      aria-labelledby="quiz-section-heading"
      className={`border-b border-border bg-background py-16 sm:py-24 ${className}`}
    >
      <Container>
        <Reveal>
          <div className="mx-auto max-w-3xl text-center">
            <SectionHeading
              as="h2"
              title={<span id="quiz-section-heading">{q.sectionTitle}</span>}
              subtitle={q.sectionSubtitle}
              align="center"
            />
          </div>

          {/* The filter band shares the quiz card's column, so both start on one edge. */}
          <div className="mx-auto mt-8 max-w-2xl">
            <MythCategoryFilter
              categories={categories}
              activeCategory={selectedCategory}
              onSelect={handleCategorySelect}
              progress={categoryProgress}
            />
          </div>

          <div className="mx-auto mt-6 max-w-2xl" onKeyDown={handleKeyDown}>
            {allAnsweredInView && (
              <div
                role="status"
                className="mb-5 flex flex-col gap-3 rounded-xl border border-sapphire-border/80 bg-sapphire-soft/55 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">
                    {extra.doneTitle(correctInView, filteredMyths.length)}
                  </p>
                  <p className="mt-0.5 text-sm text-muted-foreground">{extra.doneBody}</p>
                </div>
                <button
                  type="button"
                  onClick={handleRestart}
                  className="inline-flex min-h-[44px] shrink-0 items-center justify-center gap-1.5 self-start rounded-lg border border-border bg-card px-4 text-sm font-semibold text-foreground shadow-(--shadow-card-rest) transition-[background-color,border-color,box-shadow] duration-(--dur-fast) ease-(--ease-out-calm) hover:border-sapphire/40 hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire motion-reduce:transition-none sm:self-auto"
                >
                  <RefreshIcon className="h-4 w-4 text-sapphire" />
                  <span>{extra.restart}</span>
                </button>
              </div>
            )}

            <MythCardCarousel
              myths={filteredMyths}
              currentIndex={currentIndex}
              onIndexChange={(idx) => setCurrentIndex(idx)}
              results={results}
              aside={
                answeredInView > 0 ? (
                  <span className="rounded-md bg-sapphire-soft px-2 py-0.5 text-xs font-semibold tabular-nums text-sapphire">
                    {extra.score(correctInView, answeredInView)}
                  </span>
                ) : null
              }
            >
              {/* Warm-paper clinical specimen framing */}
              <div className="relative overflow-hidden rounded-xl border border-border bg-paper p-6 shadow-(--shadow-card-rest) sm:p-8 dark:bg-card">
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-linear-to-r from-sapphire/55 via-sapphire/25 to-transparent"
                />

                {/* Statement with outdented sapphire hang-quote */}
                <div className="flex items-start justify-between gap-4">
                  <h3 className="relative pl-5 text-pretty text-xl font-semibold leading-snug tracking-[-0.015em] text-foreground sm:pl-6 sm:text-2xl">
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute left-0 -top-0.5 select-none font-serif text-2xl font-bold leading-none text-sapphire sm:text-3xl"
                    >
                      {quotes[0]}
                    </span>
                    {currentMyth.statement}
                    <span aria-hidden="true" className="ml-0.5 select-none font-serif text-sapphire/75">
                      {quotes[1]}
                    </span>
                  </h3>
                  <InlineAudioNarratorButton
                    textToSpeak={`${currentMyth.statement} ${currentMyth.explanation}`}
                    label={q.audioNarratorLabel}
                    lang={SPEECH_LANG[lang as Lang] ?? SPEECH_LANG.ro}
                    className="shrink-0"
                  />
                </div>

                {!hasAnswered ? (
                  <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {[true, false].map((value) => {
                      const primaryKey = (
                        value ? answerKeys.true[0] : answerKeys.false[0]
                      ).toUpperCase();
                      return (
                        <button
                          key={String(value)}
                          type="button"
                          onClick={() => handleAnswer(value)}
                          aria-keyshortcuts={keyShortcuts(value ? answerKeys.true : answerKeys.false)}
                          className="group inline-flex min-h-[52px] items-center justify-between gap-3 rounded-lg border border-border bg-card px-4 py-3 text-base font-semibold text-foreground shadow-(--shadow-card-rest) transition-[background-color,border-color,box-shadow] duration-(--dur-fast) ease-(--ease-out-calm) hover:border-sapphire/50 hover:bg-muted/40 hover:shadow-(--shadow-card-hover) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire motion-reduce:transition-none"
                        >
                          <span className="inline-flex items-center gap-2.5">
                            {value ? (
                              <CheckIcon className="h-5 w-5 shrink-0 text-sapphire" />
                            ) : (
                              <CloseIcon className="h-5 w-5 shrink-0 text-stone-500" />
                            )}
                            <span>{value ? q.trueButton : q.falseButton}</span>
                          </span>
                          <kbd
                            aria-hidden="true"
                            className="hidden rounded-md border border-border bg-muted/75 px-1.5 py-0.5 font-mono text-xs font-medium text-muted-foreground transition-colors duration-(--dur-fast) ease-(--ease-out-calm) group-hover:border-sapphire/35 group-hover:text-sapphire motion-reduce:transition-none sm:inline-block"
                          >
                            {primaryKey}
                          </kbd>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <QuizFeedbackCard
                    key={currentMyth.id}
                    myth={currentMyth}
                    userAnswer={currentAnswer}
                    onNext={handleNext}
                    isLastMyth={currentIndex === filteredMyths.length - 1}
                    focusOnMount={justAnsweredId === currentMyth.id}
                  />
                )}
              </div>
            </MythCardCarousel>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
