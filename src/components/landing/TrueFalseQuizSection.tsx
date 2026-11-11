"use client";

import { useCallback, useMemo, useState, useSyncExternalStore } from "react";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { cn } from "@/lib/cn";
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
    restart: string;
  }
> = {
  ro: {
    score: (c, a) => `${c}/${a} corecte`,
    restart: "Începe din nou",
  },
  en: {
    score: (c, a) => `${c}/${a} correct`,
    restart: "Start over",
  },
  sq: {
    score: (c, a) => `${c}/${a} të sakta`,
    restart: "Rinis",
  },
  it: {
    score: (c, a) => `${c}/${a} corrette`,
    restart: "Ricomincia",
  },
  hr: {
    score: (c, a) => `${c}/${a} točnih`,
    restart: "Kreni ispočetka",
  },
  rom: {
    score: (c, a) => `${c}/${a} chache`,
    restart: "Shird pale",
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
const keyShortcuts = (keys: string[]) =>
  keys.map((key) => key.toUpperCase()).join(" ");

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

const ANSWER_VALUES = [true, false] as const;

// Horizontal control row on every screen size so answers read as tactile choices, never tall mobile bricks.
const ANSWER_SHELL =
  "flex min-h-12 min-w-0 flex-row items-center gap-2.5 rounded-(--radius-control) px-3.5 py-2.5 text-left text-[15px] sm:px-4 sm:text-base";

function AnswerMark({
  value,
  tone,
}: {
  value: boolean;
  tone: "idle" | "selected-right" | "selected-wrong" | "hint-right" | "muted";
}) {
  const Icon = value ? CheckIcon : CloseIcon;
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition-colors duration-(--dur-fast) ease-(--ease-out-calm)",
        tone === "selected-right" && "bg-white/20 text-white",
        tone === "selected-wrong" &&
          "bg-paper/20 text-paper dark:bg-ink-950/15 dark:text-ink-950",
        tone === "hint-right" && "bg-sapphire text-white",
        tone === "idle" &&
          (value
            ? "border border-sapphire/35 bg-sapphire-soft text-sapphire dark:border-sapphire-border/40 dark:bg-white/10 dark:text-sapphire-border"
            : "border border-border-control bg-muted text-foreground dark:border-white/30 dark:bg-white/10 dark:text-paper"),
        tone === "muted" &&
          "border border-border text-muted-foreground/70 dark:border-white/15 dark:text-mist/70",
      )}
    >
      <Icon className="h-3.5 w-3.5" />
    </span>
  );
}

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

/**
 * Editorial myth quiz on a sapphire-soft ground: full-width category strip so labels never
 * choke in a narrow column, followed by a framed statement card with crisp horizontal controls
 * and a single clean verdict below.
 */
export function TrueFalseQuizSection({
  className,
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
  const [justAnsweredId, setJustAnsweredId] = useState<string | null>(null);
  const setCurrentIndex = useCallback(
    (next: number | ((current: number) => number)) => {
      setJustAnsweredId(null);
      setIndexState(next);
    },
    [],
  );
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
  const isMatch = currentAnswer === currentMyth.isTrue;
  const quotes = QUOTES[lang as Lang] ?? QUOTES.ro;

  return (
    <Section
      id="mituri-sanatate"
      aria-labelledby="quiz-section-heading"
      tone="sapphire-soft"
      className={className}
    >
      <Container>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            as="h2"
            title={<span id="quiz-section-heading">{q.sectionTitle}</span>}
            subtitle={q.sectionSubtitle}
          />
          {answeredInView > 0 && (
            <div
              role="status"
              className="flex shrink-0 items-center gap-3 text-meta tabular-nums text-muted-foreground dark:text-mist"
            >
              <span className="font-medium text-foreground dark:text-paper">
                {extra.score(correctInView, filteredMyths.length)}
              </span>
              <span
                aria-hidden="true"
                className="text-sapphire-border dark:text-white/20"
              >
                ·
              </span>
              <button
                type="button"
                onClick={handleRestart}
                className="press-row -mx-2 inline-flex min-h-11 items-center gap-1.5 rounded-(--radius-control) px-2 font-medium text-sapphire underline decoration-sapphire/35 underline-offset-4 transition-colors duration-(--dur-fast) ease-(--ease-out-calm) hover:text-sapphire-light hover:decoration-sapphire focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none dark:text-sapphire-border dark:hover:text-paper"
              >
                <RefreshIcon className="h-3.5 w-3.5 shrink-0" />
                <span>{extra.restart}</span>
              </button>
            </div>
          )}
        </div>

        {/* From lg: the categories as a list on the left, the myth quiz on the right.
            Below lg: the categories as one row above the quiz. */}
        <div className="mt-6 lg:mt-8 lg:grid lg:grid-cols-12 lg:items-start lg:gap-12">
          <MythCategoryFilter
            className="lg:col-span-4"
            categories={categories}
            activeCategory={selectedCategory}
            onSelect={handleCategorySelect}
            progress={categoryProgress}
          />

          <div
            className="mt-7 max-w-3xl lg:col-span-8 lg:mt-0"
            onKeyDown={handleKeyDown}
          >
            <MythCardCarousel
              myths={filteredMyths}
              currentIndex={currentIndex}
              onIndexChange={(idx) => setCurrentIndex(idx)}
              results={results}
            >
              <div className="rounded-(--radius-surface) border border-sapphire-border/80 bg-card p-5 shadow-(--shadow-card-rest) sm:p-8 dark:border-white/10 dark:bg-ink-800">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="max-w-[28ch] text-pretty text-xl/[1.3] font-bold tracking-[-0.02em] sm:text-2xl/[1.25] lg:text-[1.75rem]/[1.2]">
                    <span
                      aria-hidden="true"
                      className="select-none text-sapphire dark:text-sapphire-border"
                    >
                      {quotes[0]}
                    </span>
                    {currentMyth.statement}
                    <span
                      aria-hidden="true"
                      className="select-none text-sapphire dark:text-sapphire-border"
                    >
                      {quotes[1]}
                    </span>
                  </h3>
                  <InlineAudioNarratorButton
                    variant="ghost"
                    textToSpeak={`${currentMyth.statement} ${currentMyth.explanation}`}
                    label={q.audioNarratorLabel}
                    lang={SPEECH_LANG[lang as Lang] ?? SPEECH_LANG.ro}
                    className="-mr-2 -mt-1 shrink-0"
                  />
                </div>

                {/* Once answered the row shows the chosen option alongside the true answer, with no muddy fills. */}
                <div
                  className="mt-5 grid grid-cols-2 gap-2.5 sm:gap-3"
                  aria-hidden={hasAnswered || undefined}
                >
                  {ANSWER_VALUES.map((value) => {
                    const label = (
                      <span className="min-w-0 wrap-break-word">
                        {value ? q.trueButton : q.falseButton}
                      </span>
                    );
                    if (hasAnswered) {
                      const chosen = currentAnswer === value;
                      const isRightOption = value === currentMyth.isTrue;
                      const tone = chosen
                        ? isMatch
                          ? "selected-right"
                          : "selected-wrong"
                        : isRightOption
                          ? "hint-right"
                          : "muted";
                      return (
                        <p
                          key={String(value)}
                          className={cn(
                            ANSWER_SHELL,
                            chosen &&
                              isMatch &&
                              "border border-sapphire bg-sapphire font-semibold text-white",
                            chosen &&
                              !isMatch &&
                              "border border-ink-950 bg-ink-950 font-semibold text-paper dark:border-paper dark:bg-paper dark:text-ink-950",
                            !chosen &&
                              isRightOption &&
                              "border border-sapphire/45 bg-sapphire-soft/75 font-semibold text-sapphire dark:border-sapphire-border/45 dark:bg-white/10 dark:text-sapphire-border",
                            !chosen &&
                              !isRightOption &&
                              "border border-border bg-card text-muted-foreground dark:border-white/10 dark:bg-ink-900 dark:text-mist",
                          )}
                        >
                          <AnswerMark value={value} tone={tone} />
                          {label}
                        </p>
                      );
                    }
                    const keys = value ? answerKeys.true : answerKeys.false;
                    return (
                      <button
                        key={String(value)}
                        type="button"
                        onClick={() => handleAnswer(value)}
                        aria-keyshortcuts={keyShortcuts(keys)}
                        className={cn(
                          ANSWER_SHELL,
                          "press-row border border-border-control bg-card font-semibold text-foreground transition-colors duration-(--dur-fast) ease-(--ease-out-calm) hover:border-sapphire hover:bg-sapphire-soft/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none dark:border-white/30 dark:bg-ink-900 dark:text-paper dark:hover:bg-white/10 dark:focus-visible:ring-paper",
                        )}
                      >
                        <AnswerMark value={value} tone="idle" />
                        {label}
                        <kbd
                          aria-hidden="true"
                          className="ml-auto hidden rounded-md border border-border bg-muted px-1.5 py-0.5 text-meta font-normal text-muted-foreground sm:inline-block dark:border-white/10 dark:bg-white/10 dark:text-mist"
                        >
                          {keys[0].toUpperCase()}
                        </kbd>
                      </button>
                    );
                  })}
                </div>

                {hasAnswered && (
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
        </div>
      </Container>
    </Section>
  );
}
