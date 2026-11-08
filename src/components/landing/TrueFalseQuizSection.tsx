"use client";

import { useCallback, useMemo, useState, useSyncExternalStore } from "react";
import { Container } from "@/components/ui/Container";
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
import { CheckIcon, CloseIcon } from "@/components/ui/icons";

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
};

/**
 * Keyboard answers, active only while focus is inside the quiz: the first
 * letter of each language's word for "true" / "false", or 1 / 2. Announced
 * through aria-keyshortcuts on the answer buttons, not as visible text.
 */
const ANSWER_KEYS: Record<Lang, { true: string[]; false: string[] }> = {
  ro: { true: ["a", "1"], false: ["f", "2"] }, // adevărat / fals
  en: { true: ["t", "1"], false: ["f", "2"] }, // true / false
  sq: { true: ["v", "1"], false: ["r", "2"] }, // e vërtetë / e rreme
  it: { true: ["v", "1"], false: ["f", "2"] }, // vero / falso
};
const keyShortcuts = (keys: string[]) => keys.map((key) => key.toUpperCase()).join(" ");

/** Quotation marks around the myth, in each language's own typographic style. */
const QUOTES: Record<Lang, [string, string]> = {
  ro: ["„", "”"],
  en: ["“", "”"],
  sq: ["«", "»"],
  it: ["«", "»"],
};

const SPEECH_LANG: Record<Lang, string> = { ro: "ro-RO", en: "en-US", sq: "sq-AL", it: "it-IT" };

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

  // Shortcuts only while focus is inside the quiz, never page-wide.
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
      // Loop back or reset
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
      className={`border-b border-border bg-background py-16 sm:py-20 ${className}`}
    >
      <Container>
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
              className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {extra.doneTitle(correctInView, filteredMyths.length)}
                </p>
                <p className="mt-0.5 text-sm text-muted-foreground">{extra.doneBody}</p>
              </div>
              <button
                type="button"
                onClick={handleRestart}
                className="inline-flex min-h-[44px] shrink-0 items-center justify-center self-start rounded-lg border border-border bg-card px-4 text-sm font-semibold text-foreground transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:border-sapphire/40 sm:self-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire"
              >
                {extra.restart}
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
                <span className="text-sm tabular-nums text-muted-foreground">
                  <span aria-hidden="true">· </span>
                  {extra.score(correctInView, answeredInView)}
                </span>
              ) : null
            }
          >
            <div className="rounded-xl border border-border bg-card p-6 sm:p-8">
              {/* The statement leads; no category label above it (the filter above already names it). */}
              <div className="flex items-start justify-between gap-4">
                <h3 className="text-xl font-semibold leading-snug text-foreground sm:text-2xl">
                  {quotes[0]}
                  {currentMyth.statement}
                  {quotes[1]}
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
                  {[true, false].map((value) => (
                    <button
                      key={String(value)}
                      type="button"
                      onClick={() => handleAnswer(value)}
                      aria-keyshortcuts={keyShortcuts(value ? answerKeys.true : answerKeys.false)}
                      className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-lg border border-border bg-card px-5 py-3 text-base font-semibold text-foreground transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:border-sapphire/50 hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire motion-reduce:transition-none"
                    >
                      {value ? (
                        <CheckIcon className="h-5 w-5 text-sapphire" />
                      ) : (
                        <CloseIcon className="h-5 w-5 text-stone-500" />
                      )}
                      <span>{value ? q.trueButton : q.falseButton}</span>
                    </button>
                  ))}
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
      </Container>
    </section>
  );
}
