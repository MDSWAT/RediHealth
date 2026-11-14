"use client";

import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useId, useRef, useState, type FormEvent, type MouseEvent } from "react";
import { usePathname } from "next/navigation";
import styles from "@/components/layout/ChromeDialogs.module.css";
import { captchaErrorMessage, useRecaptcha } from "@/components/security/RecaptchaProvider";
import { Button } from "@/components/ui/Button";
import {
  AlertCircleIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  CloseIcon,
  ShieldIcon,
} from "@/components/ui/icons";
import { feedbackWidgetCopy, type FeedbackWidgetCopy } from "@/lib/i18n/feedback-translations";
import { useLanguage } from "@/lib/i18n/language-context";
import { stripLangFromPathname } from "@/lib/i18n/routing";
import { CLINICAL_SETTLE_SPRING, DURATION, EASE_OUT, useCalmReducedMotion } from "@/lib/motion/tokens";
import {
  AGE_GROUP_OPTIONS,
  GENDER_OPTIONS,
  MARITAL_STATUS_OPTIONS,
  RATING_KEYS,
  type FeedbackAgeGroup,
  type FeedbackGender,
  type FeedbackMaritalStatus,
  type RatingKey,
} from "@/lib/platform-feedback-shared";

/** Wait 2.5 minutes of active browsing so visitors can explore the platform first. */
const INITIAL_EXPLORE_MS = 150_000;
/** Never show the floating invite in the first 12 seconds after a page load or refresh. */
const PAGE_SETTLE_GRACE_MS = 12_000;
/** Heartbeat interval while the tab is visible. */
const HEARTBEAT_INTERVAL_MS = 4_000;
/** Treat a return after 6+ hours away as a fresh browsing session. */
const VISIT_RESET_IDLE_MS = 6 * 60 * 60 * 1000;
/** Progressive snooze intervals when the visitor taps "Later" or closes the invite/modal. */
const SNOOZE_STEPS_MS = [
  3 * 60 * 1000, // 1st close: remind gently after 3 minutes
  8 * 60 * 1000, // 2nd close: remind after 8 minutes
  24 * 60 * 60 * 1000, // 3rd+ close: pause auto-popup for 24 hours (side button stays visible)
] as const;

const SCHEDULE_STORAGE_KEY = "redihealth:feedback-schedule:v2";
const DRAFT_SESSION_KEY = "redihealth:feedback-draft:v2";
const OPEN_FEEDBACK_EVENT = "redi:feedback-open";

const AUTO_INVITE_PATHS = new Set(["/", "/health-information", "/about"]);

function isGuideDetailPath(barePath: string): boolean {
  return barePath.startsWith("/health-information/") && barePath !== "/health-information";
}

function hasReachedGuideEnd(): boolean {
  if (typeof window === "undefined") return false;
  const target =
    document.querySelector("article") ??
    document.querySelector("main") ??
    document.documentElement;
  return target.getBoundingClientRect().bottom <= window.innerHeight + 160;
}

function isAutoInviteAllowedPath(barePath: string): boolean {
  if (AUTO_INVITE_PATHS.has(barePath)) return true;
  if (isGuideDetailPath(barePath)) return hasReachedGuideEnd();
  return false;
}

type StepIndex = 0 | 1 | 2;

type RatingsState = Record<RatingKey, number | null>;

type StoredSchedule = {
  activeMs: number;
  lastSeenAt: number;
  snoozedUntil: number;
  dismissCount: number;
  submitted: boolean;
};

type StoredDraft = {
  step: StepIndex;
  ratings: RatingsState;
  openAnswer: string;
  gender: FeedbackGender | "";
  ageGroup: FeedbackAgeGroup | "";
  maritalStatus: FeedbackMaritalStatus | "";
  locality: string;
  occupation: string;
};

const INITIAL_RATINGS: RatingsState = {
  rating_usefulness: null,
  rating_ease_of_use: null,
  rating_visual_design: null,
  rating_content_clarity: null,
  rating_future_use: null,
};

function defaultSchedule(now: number): StoredSchedule {
  return {
    activeMs: 0,
    lastSeenAt: now,
    snoozedUntil: 0,
    dismissCount: 0,
    submitted: false,
  };
}

function readSchedule(now = Date.now()): StoredSchedule {
  try {
    const raw = window.localStorage.getItem(SCHEDULE_STORAGE_KEY);
    if (!raw) return defaultSchedule(now);
    const parsed = JSON.parse(raw) as Partial<StoredSchedule>;
    const lastSeenAt = typeof parsed.lastSeenAt === "number" ? parsed.lastSeenAt : now;
    const isStaleVisit = now - lastSeenAt > VISIT_RESET_IDLE_MS;
    return {
      activeMs: isStaleVisit ? 0 : Math.max(0, Number(parsed.activeMs) || 0),
      lastSeenAt: now,
      snoozedUntil: Math.max(0, Number(parsed.snoozedUntil) || 0),
      dismissCount: isStaleVisit ? 0 : Math.max(0, Number(parsed.dismissCount) || 0),
      submitted: Boolean(parsed.submitted),
    };
  } catch {
    return defaultSchedule(now);
  }
}

function writeSchedule(next: StoredSchedule): void {
  try {
    window.localStorage.setItem(SCHEDULE_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Private browsing or quota full: in-memory state still governs this tab.
  }
}

function markScheduleSubmitted(): void {
  const now = Date.now();
  const current = readSchedule(now);
  writeSchedule({
    ...current,
    lastSeenAt: now,
    submitted: true,
  });
}

function readDraft(): StoredDraft | null {
  try {
    const raw = window.sessionStorage.getItem(DRAFT_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredDraft>;
    const step: StepIndex = parsed.step === 1 || parsed.step === 2 ? parsed.step : 0;
    const restoredRatings: RatingsState = { ...INITIAL_RATINGS };
    if (parsed.ratings && typeof parsed.ratings === "object") {
      for (const key of RATING_KEYS) {
        const val = parsed.ratings[key];
        if (typeof val === "number" && val >= 1 && val <= 5) {
          restoredRatings[key] = val;
        }
      }
    }
    return {
      step,
      ratings: restoredRatings,
      openAnswer: typeof parsed.openAnswer === "string" ? parsed.openAnswer.slice(0, 2000) : "",
      gender:
        typeof parsed.gender === "string" && (GENDER_OPTIONS as readonly string[]).includes(parsed.gender)
          ? (parsed.gender as FeedbackGender)
          : "",
      ageGroup:
        typeof parsed.ageGroup === "string" && (AGE_GROUP_OPTIONS as readonly string[]).includes(parsed.ageGroup)
          ? (parsed.ageGroup as FeedbackAgeGroup)
          : "",
      maritalStatus:
        typeof parsed.maritalStatus === "string" &&
        (MARITAL_STATUS_OPTIONS as readonly string[]).includes(parsed.maritalStatus)
          ? (parsed.maritalStatus as FeedbackMaritalStatus)
          : "",
      locality: typeof parsed.locality === "string" ? parsed.locality.slice(0, 120) : "",
      occupation: typeof parsed.occupation === "string" ? parsed.occupation.slice(0, 120) : "",
    };
  } catch {
    return null;
  }
}

function clearDraft(): void {
  try {
    window.sessionStorage.removeItem(DRAFT_SESSION_KEY);
  } catch {
    // Ignore sessionStorage errors
  }
}

/**
 * Opens the dedicated feedback modal from anywhere on the website (such as the footer link).
 * Returns false if the widget is not mounted on the current chromeless surface.
 */
export function openSiteFeedback(): boolean {
  if (typeof window === "undefined") return false;
  const event = new Event(OPEN_FEEDBACK_EVENT, { cancelable: true });
  return !window.dispatchEvent(event);
}

function errorForResponse(status: number, code: string | undefined, t: FeedbackWidgetCopy): string {
  if (status === 429 || code === "rate_limited") return t.errorTooMany;
  if (code === "captcha_invalid") return t.errorCaptcha;
  if (status === 503 || code === "unavailable") return t.errorUnavailable;
  return t.errorGeneric;
}

export function FeedbackWidget() {
  const { lang } = useLanguage();
  const pathname = usePathname();
  const executeCaptcha = useRecaptcha();
  const reducedMotion = useCalmReducedMotion();
  const t = feedbackWidgetCopy[lang] ?? feedbackWidgetCopy.ro;

  const [inviteVisible, setInviteVisible] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [step, setStep] = useState<StepIndex>(0);
  const [stepDir, setStepDir] = useState<1 | -1>(1);
  const [ratings, setRatings] = useState<RatingsState>(INITIAL_RATINGS);
  const [highlightMissing, setHighlightMissing] = useState(false);
  const [openAnswer, setOpenAnswer] = useState("");
  const [gender, setGender] = useState<FeedbackGender | "">("");
  const [ageGroup, setAgeGroup] = useState<FeedbackAgeGroup | "">("");
  const [maritalStatus, setMaritalStatus] = useState<FeedbackMaritalStatus | "">("");
  const [locality, setLocality] = useState("");
  const [occupation, setOccupation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [draftHydrated, setDraftHydrated] = useState(false);

  const dialogRef = useRef<HTMLDialogElement>(null);
  const questionRefs = useRef<Partial<Record<RatingKey, HTMLFieldSetElement | null>>>({});
  const pageMountedAtRef = useRef<number>(0);

  const titleId = useId();
  const subtitleId = useId();
  const openQuestionId = useId();
  const ageGroupId = useId();
  const maritalStatusId = useId();
  const localityId = useId();
  const occupationId = useId();
  const errorId = useId();

  const barePath = stripLangFromPathname(pathname);
  const isConsultationOrPortal =
    barePath.startsWith("/medic-online/meet") || barePath.startsWith("/patient-portal");

  // Hydrate any unfinished in-session draft so closing and reopening never loses progress
  useEffect(() => {
    pageMountedAtRef.current = Date.now();
    queueMicrotask(() => {
      const draft = readDraft();
      if (draft) {
        setStep(draft.step);
        setRatings(draft.ratings);
        setOpenAnswer(draft.openAnswer);
        setGender(draft.gender);
        setAgeGroup(draft.ageGroup);
        setMaritalStatus(draft.maritalStatus);
        setLocality(draft.locality);
        setOccupation(draft.occupation);
      }
      setDraftHydrated(true);
    });
  }, []);

  // Reset settle grace on route navigation and hide any open invite card on disallowed surfaces
  useEffect(() => {
    pageMountedAtRef.current = Date.now();
    if (!AUTO_INVITE_PATHS.has(barePath) && !isGuideDetailPath(barePath)) {
      queueMicrotask(() => setInviteVisible(false));
    }
  }, [pathname, barePath]);

  // Persist in-session draft automatically until submitted
  useEffect(() => {
    if (!draftHydrated || submitted) return;
    const hasAnyInput =
      RATING_KEYS.some((k) => ratings[k] !== null) ||
      openAnswer.trim().length > 0 ||
      gender !== "" ||
      ageGroup !== "" ||
      maritalStatus !== "" ||
      locality.trim().length > 0 ||
      occupation.trim().length > 0;
    if (!hasAnyInput) return;
    try {
      const payload: StoredDraft = {
        step,
        ratings,
        openAnswer,
        gender,
        ageGroup,
        maritalStatus,
        locality,
        occupation,
      };
      window.sessionStorage.setItem(DRAFT_SESSION_KEY, JSON.stringify(payload));
    } catch {
      // Ignore sessionStorage errors
    }
  }, [
    draftHydrated,
    submitted,
    step,
    ratings,
    openAnswer,
    gender,
    ageGroup,
    maritalStatus,
    locality,
    occupation,
  ]);

  const snoozeInvite = useCallback(() => {
    setInviteVisible(false);
    const now = Date.now();
    const current = readSchedule(now);
    const snoozeDuration =
      SNOOZE_STEPS_MS[Math.min(current.dismissCount, SNOOZE_STEPS_MS.length - 1)];
    writeSchedule({
      ...current,
      lastSeenAt: now,
      snoozedUntil: now + snoozeDuration,
      dismissCount: current.dismissCount + 1,
    });
  }, []);

  const openModal = useCallback((prefillUsefulness?: number) => {
    setInviteVisible(false);
    setError(null);
    setHighlightMissing(false);
    if (prefillUsefulness && prefillUsefulness >= 1 && prefillUsefulness <= 5) {
      setRatings((prev) => ({ ...prev, rating_usefulness: prefillUsefulness }));
      setStep(0);
    }
    setStepDir(1);
    setModalOpen(true);
  }, []);

  const closeModal = useCallback(
    (wasSubmitted: boolean) => {
      setModalOpen(false);
      if (!wasSubmitted) {
        // Snooze auto-invite so closing the modal never pops the card right back up
        snoozeInvite();
      }
    },
    [snoozeInvite],
  );

  // Support programmatic open via `openSiteFeedback()` and `?feedback=1` deep link
  useEffect(() => {
    const handleCustomOpen = (event: Event) => {
      event.preventDefault();
      setSubmitted(false);
      openModal();
    };
    window.addEventListener(OPEN_FEEDBACK_EVENT, handleCustomOpen);

    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get("feedback") === "1") {
        queueMicrotask(() => openModal());
      }
    } catch {
      // Ignore malformed URL edge cases
    }

    return () => window.removeEventListener(OPEN_FEEDBACK_EVENT, handleCustomOpen);
  }, [openModal]);

  // Active browsing timer (2.5m initial exploration + progressive snooze reminders)
  useEffect(() => {
    if (modalOpen || submitted || isConsultationOrPortal) {
      return;
    }

    let lastTick = Date.now();

    const evaluateAndTick = () => {
      const now = Date.now();
      const delta =
        document.visibilityState === "visible"
          ? Math.min(Math.max(0, now - lastTick), HEARTBEAT_INTERVAL_MS * 2)
          : 0;
      lastTick = now;

      const schedule = readSchedule(now);
      if (schedule.submitted) {
        return;
      }

      const nextActiveMs = schedule.activeMs + delta;
      writeSchedule({
        ...schedule,
        activeMs: nextActiveMs,
        lastSeenAt: now,
      });

      if (document.visibilityState !== "visible") return;
      if (!window.matchMedia("(min-width: 1024px)").matches) return;
      if (!isAutoInviteAllowedPath(barePath)) return;
      if (now - pageMountedAtRef.current < PAGE_SETTLE_GRACE_MS) return;
      if (nextActiveMs < INITIAL_EXPLORE_MS) return;
      if (schedule.snoozedUntil > now) return;
      if (document.querySelector("dialog[open], [data-bottom-bar], .hh-dialog")) return;

      setInviteVisible(true);
    };

    const intervalId = window.setInterval(evaluateAndTick, HEARTBEAT_INTERVAL_MS);
    const settleTimerId = window.setTimeout(evaluateAndTick, PAGE_SETTLE_GRACE_MS + 250);

    return () => {
      window.clearInterval(intervalId);
      window.clearTimeout(settleTimerId);
    };
  }, [modalOpen, submitted, isConsultationOrPortal, barePath, pathname]);

  // Native <dialog> synchronization (focus trap, Escape key, inert background)
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (modalOpen && !dialog.open) {
      dialog.showModal();
      const root = document.documentElement;
      const prevOverflow = root.style.overflow;
      root.style.overflow = "hidden";
      return () => {
        root.style.overflow = prevOverflow;
      };
    }
    if (!modalOpen && dialog.open) {
      dialog.close();
    }
  }, [modalOpen]);

  function handleBackdropClick(event: MouseEvent<HTMLDialogElement>) {
    if (event.target === event.currentTarget && !isSubmitting) {
      closeModal(submitted);
    }
  }

  const allRatingsComplete = RATING_KEYS.every((key) => ratings[key] !== null);
  const answeredRatingsCount = RATING_KEYS.filter((key) => ratings[key] !== null).length;

  function revealFirstMissingRating() {
    setHighlightMissing(true);
    setError(t.validationMissingRatings);
    const firstMissingKey = RATING_KEYS.find((key) => ratings[key] === null);
    if (firstMissingKey) {
      questionRefs.current[firstMissingKey]?.scrollIntoView({
        behavior: reducedMotion ? "auto" : "smooth",
        block: "nearest",
      });
    }
  }

  function jumpToStep(target: StepIndex) {
    if (target === step || isSubmitting) return;
    if (target > 0 && !allRatingsComplete) {
      revealFirstMissingRating();
      return;
    }
    setError(null);
    setStepDir(target > step ? 1 : -1);
    setStep(target);
  }

  function goNextStep() {
    setError(null);
    if (step === 0) {
      if (!allRatingsComplete) {
        revealFirstMissingRating();
        return;
      }
      setHighlightMissing(false);
      setStepDir(1);
      setStep(1);
      return;
    }
    if (step === 1) {
      setStepDir(1);
      setStep(2);
    }
  }

  function goPrevStep() {
    setError(null);
    if (step === 2) {
      setStepDir(-1);
      setStep(1);
    } else if (step === 1) {
      setStepDir(-1);
      setStep(0);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (step < 2) {
      goNextStep();
      return;
    }

    if (!allRatingsComplete) {
      setStepDir(-1);
      setStep(0);
      revealFirstMissingRating();
      return;
    }

    setIsSubmitting(true);
    try {
      const captchaToken = await executeCaptcha("platform_feedback");
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lang,
          page_path: window.location.pathname,
          rating_usefulness: ratings.rating_usefulness,
          rating_ease_of_use: ratings.rating_ease_of_use,
          rating_visual_design: ratings.rating_visual_design,
          rating_content_clarity: ratings.rating_content_clarity,
          rating_future_use: ratings.rating_future_use,
          open_feedback: openAnswer.trim() || undefined,
          gender: gender || undefined,
          age_group: ageGroup || undefined,
          marital_status: maritalStatus || undefined,
          locality: locality.trim() || undefined,
          occupation: occupation.trim() || undefined,
          captchaToken,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as { code?: string };
        setError(errorForResponse(response.status, payload.code, t));
        return;
      }

      markScheduleSubmitted();
      clearDraft();
      setRatings(INITIAL_RATINGS);
      setOpenAnswer("");
      setGender("");
      setAgeGroup("");
      setMaritalStatus("");
      setLocality("");
      setOccupation("");
      setStep(0);
      setSubmitted(true);
    } catch (caught) {
      setError(captchaErrorMessage(caught, t.errorGeneric));
    } finally {
      setIsSubmitting(false);
    }
  }

  const inputBaseClass =
    "min-h-11 w-full rounded-(--radius-control) border border-border-control bg-background px-3.5 py-2 text-base text-foreground placeholder:text-muted-foreground/80 field-focus sm:text-sm";

  return (
    <>
      {/* Calm, non-disruptive floating invitation card after 2.5 minutes of active browsing (desktop allow-list only) */}
      <AnimatePresence>
        {inviteVisible && !modalOpen ? (
          <motion.aside
            role="region"
            aria-label={t.inviteOpenCta}
            initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
            transition={reducedMotion ? { duration: 0 } : CLINICAL_SETTLE_SPRING}
            className="feedback-invite-card max-lg:hidden fixed bottom-4 right-4 z-30 w-[24rem] overflow-hidden rounded-2xl border border-sapphire/25 bg-card text-foreground shadow-[0_18px_42px_-12px_rgba(15,23,42,0.24)] dark:border-white/14 dark:bg-ink-950 dark:text-paper"
          >
            <div className="p-4">
              <div className="flex items-start justify-between gap-2.5">
                <div className="min-w-0">
                  <h2 className="text-body font-semibold leading-snug text-foreground dark:text-paper">
                    {t.inviteTitle}
                  </h2>
                  <p className="mt-1 text-body leading-relaxed text-muted-foreground dark:text-mist">
                    {t.inviteBody}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={snoozeInvite}
                  aria-label={t.inviteCloseAria}
                  className="-mr-2 -mt-2 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors duration-(--dur-fast) hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <CloseIcon className="h-4 w-4" />
                </button>
              </div>

              {/* Instant 1–5 usefulness tap strip that jumps straight into Step 1 */}
              <div className="mt-3">
                <p className="text-body font-medium text-muted-foreground dark:text-mist">
                  {t.inviteQuickScaleHint}
                </p>
                <div
                  className="mt-1.5 grid grid-cols-5 gap-1.5"
                  role="group"
                  aria-label={t.questions.rating_usefulness.question}
                >
                  {[1, 2, 3, 4, 5].map((score, idx) => (
                    <button
                      key={score}
                      type="button"
                      onClick={() => openModal(score)}
                      aria-label={t.scaleValueLabels[idx]}
                      className="press-solid flex min-h-11 items-center justify-center rounded-lg border border-border-control/80 bg-card text-base font-semibold tabular-nums text-foreground transition-colors duration-(--dur-fast) motion-reduce:transition-none hover:border-sapphire hover:bg-sapphire hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:border-white/15 dark:bg-ink-800 dark:text-paper"
                    >
                      {score}
                    </button>
                  ))}
                </div>
                <div className="mt-1.5 flex items-center justify-between gap-2 text-body text-muted-foreground dark:text-mist">
                  <span>{t.scaleLow}</span>
                  <span>{t.scaleHigh}</span>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={snoozeInvite}
                  className="inline-flex min-h-11 items-center rounded-lg px-2.5 text-sm font-medium whitespace-nowrap text-muted-foreground transition-colors duration-(--dur-fast) motion-reduce:transition-none hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {t.inviteLaterCta}
                </button>
                <button
                  type="button"
                  onClick={() => openModal()}
                  className="inline-flex min-h-11 items-center gap-1.5 rounded-lg bg-sapphire px-3.5 text-sm font-semibold whitespace-nowrap text-white transition-colors duration-(--dur-fast) motion-reduce:transition-none hover:bg-sapphire/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span>{t.inviteOpenCta}</span>
                  <ArrowRightIcon className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </motion.aside>
        ) : null}
      </AnimatePresence>

      {/* Dedicated Feedback Modal */}
      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        aria-describedby={subtitleId}
        onClose={() => closeModal(submitted)}
        onClick={handleBackdropClick}
        className={[
          "m-0 mt-auto w-full max-w-none overflow-visible bg-transparent p-0 text-foreground",
          "sm:m-auto sm:w-[calc(100%-2rem)] sm:max-w-2xl",
          "backdrop:bg-ink-950/55 backdrop:backdrop-blur-[2px]",
          styles.backdropFade,
          "transition-[opacity,translate] duration-(--dur-base) ease-(--ease-out-calm) motion-reduce:transition-none",
          "starting:open:translate-y-2 starting:open:opacity-0",
        ].join(" ")}
      >
        {/* One fixed size for every step, so the window does not jump as the reader moves through it. */}
        <div className="flex h-[min(41rem,92dvh)] flex-col overflow-hidden rounded-t-2xl bg-card shadow-[0_24px_64px_-16px_rgba(11,19,43,0.34)] sm:rounded-2xl">
          {/* Modal Header */}
          <div className="border-b border-border bg-surface-subtle/65 px-5 pt-5 pb-4 sm:px-6">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 id={titleId} className="text-xl font-bold tracking-tight text-foreground sm:text-[1.35rem]">
                  {submitted ? t.thankYouTitle : t.modalTitle}
                </h2>
                <p id={subtitleId} className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {submitted ? t.thankYouBody : t.modalSubtitle}
                </p>
              </div>
              <button
                type="button"
                onClick={() => closeModal(submitted)}
                disabled={isSubmitting}
                aria-label={t.closeAria}
                className="-mr-1.5 -mt-1 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors duration-(--dur-fast) hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>

            {/* 3-Step Interactive Segmented Progress Bar */}
            {!submitted ? (
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                  <span>
                    {step === 0
                      ? t.stepTitles.ratings
                      : step === 1
                        ? t.stepTitles.openQuestion
                        : t.stepTitles.demographics}
                  </span>
                  <span className="tabular-nums">{t.stepIndicator(step + 1, 3)}</span>
                </div>
                <div className="mt-2 grid grid-cols-3 gap-1.5">
                  {([0, 1, 2] as const).map((idx) => {
                    const stepLabel =
                      idx === 0
                        ? t.stepTitles.ratings
                        : idx === 1
                          ? t.stepTitles.openQuestion
                          : t.stepTitles.demographics;
                    return (
                      <button
                        key={idx}
                        type="button"
                        aria-label={`${t.stepIndicator(idx + 1, 3)}: ${stepLabel}`}
                        aria-current={step === idx ? "step" : undefined}
                        onClick={() => jumpToStep(idx)}
                        className="group py-1 focus-visible:outline-none"
                      >
                        {/* Each segment fills from the left as the reader reaches it, and empties the same way back. */}
                        <span
                          className={`relative block h-1.5 w-full overflow-hidden rounded-xs bg-border transition-colors duration-(--dur-fast) group-focus-visible:ring-2 group-focus-visible:ring-ring motion-reduce:transition-none ${
                            idx <= step ? "" : "group-hover:bg-sapphire/35"
                          }`}
                        >
                          <span
                            aria-hidden="true"
                            style={{ transform: idx <= step ? "none" : "scaleX(0)" }}
                            className="absolute inset-0 origin-left bg-sapphire transition-transform duration-(--dur-slow) ease-(--ease-out-calm) motion-reduce:transition-none"
                          />
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>

          {/* Modal Body */}
          {submitted ? (
            <div className="swap-in space-y-5 p-6 sm:p-8">
              <div className="rounded-xl bg-sapphire-soft p-4">
                <div className="space-y-1 text-sm leading-relaxed">
                  <p className="font-semibold text-foreground">{t.thankYouBody}</p>
                  <p className="text-muted-foreground">{t.privacyNote}</p>
                </div>
              </div>
              <div className="flex justify-end">
                <Button type="button" variant="action" onClick={() => closeModal(true)}>
                  {t.doneCloseCta}
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="flex min-h-0 flex-1 flex-col">
              <div className="flex-1 overflow-y-auto px-5 py-4 sm:px-6 sm:py-5">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={step}
                    initial={reducedMotion ? { opacity: 1 } : { opacity: 0, x: stepDir * 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={reducedMotion ? { opacity: 1 } : { opacity: 0, x: stepDir * -10 }}
                    transition={
                      reducedMotion
                        ? { duration: 0 }
                        : { duration: DURATION.base, ease: EASE_OUT }
                    }
                  >
                    {/* Step 1: the five ratings as one compact list, so all of them fit on one screen. */}
                    {step === 0 ? (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between rounded-xl bg-surface-subtle px-3.5 py-2 text-xs font-medium text-muted-foreground">
                          <span>{t.scaleLow}</span>
                          <span className="tabular-nums font-semibold text-sapphire">
                            {answeredRatingsCount} / {RATING_KEYS.length}
                          </span>
                          <span>{t.scaleHigh}</span>
                        </div>

                        {RATING_KEYS.map((key) => {
                          const itemCopy = t.questions[key];
                          const selected = ratings[key];
                          const isMissing = highlightMissing && selected === null;
                          return (
                            <fieldset
                              key={key}
                              ref={(node) => {
                                questionRefs.current[key] = node;
                              }}
                              className={`border-b border-border/70 py-2.5 transition-colors duration-(--dur-fast) last:border-b-0 ${
                                isMissing
                                  ? "my-1 -mx-2.5 rounded-xl border border-primary/35 bg-primary-soft/30 px-2.5"
                                  : ""
                              }`}
                            >
                              <legend className="sr-only">
                                {itemCopy.label}: {itemCopy.question}
                              </legend>
                              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div className="min-w-0 sm:max-w-[58%]">
                                  <p className="text-sm font-semibold text-foreground">
                                    {itemCopy.label}
                                  </p>
                                  <p className="mt-0.5 text-sm leading-snug text-muted-foreground">
                                    {itemCopy.question}
                                  </p>
                                </div>

                                <div
                                  role="radiogroup"
                                  aria-label={itemCopy.question}
                                  className="grid grid-cols-5 gap-1.5 sm:w-[232px] sm:shrink-0"
                                >
                                  {[1, 2, 3, 4, 5].map((value, idx) => {
                                    const active = selected === value;
                                    return (
                                      <button
                                        key={value}
                                        type="button"
                                        role="radio"
                                        aria-checked={active}
                                        aria-label={`${itemCopy.label}: ${t.scaleValueLabels[idx]}`}
                                        onClick={() => {
                                          setRatings((prev) => {
                                            const next = { ...prev, [key]: value };
                                            if (RATING_KEYS.every((k) => next[k] !== null)) {
                                              setHighlightMissing(false);
                                            }
                                            return next;
                                          });
                                          if (error) setError(null);
                                        }}
                                        className={`flex min-h-11 items-center justify-center rounded-lg border text-sm font-semibold tabular-nums transition-colors duration-(--dur-fast) ease-(--ease-out-calm) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                                          active
                                            ? "border-sapphire bg-sapphire text-white"
                                            : isMissing
                                              ? "border-primary/40 bg-card text-foreground press-row hover:border-sapphire/60 hover:bg-sapphire-soft/60"
                                              : "border-border-control/70 bg-card text-foreground press-row hover:border-sapphire/60 hover:bg-sapphire-soft/60"
                                        }`}
                                      >
                                        {value}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            </fieldset>
                          );
                        })}
                      </div>
                    ) : null}

                    {step === 1 ? (
                      <div className="space-y-3">
                        <label
                          htmlFor={openQuestionId}
                          className="block text-base font-semibold leading-snug text-foreground"
                        >
                          {t.openQuestionLabel}
                        </label>
                        <textarea
                          id={openQuestionId}
                          rows={6}
                          maxLength={2000}
                          value={openAnswer}
                          onChange={(event) => setOpenAnswer(event.target.value)}
                          placeholder={t.openQuestionPlaceholder}
                          className={`${inputBaseClass} resize-y leading-relaxed`}
                        />
                        <div className="flex items-start justify-between gap-3 text-xs text-muted-foreground">
                          <span>{t.openQuestionHint}</span>
                          <span className="shrink-0 tabular-nums">{openAnswer.length} / 2000</span>
                        </div>
                      </div>
                    ) : null}

                    {step === 2 ? (
                      <div className="space-y-4">
                        <p className="text-sm leading-relaxed text-muted-foreground">
                          {t.demographicsIntro}
                        </p>

                        {/* Gender */}
                        <fieldset>
                          <legend className="mb-2 block text-sm font-semibold text-foreground">
                            {t.genderLabel}
                          </legend>
                          <div className="flex flex-wrap gap-2">
                            {GENDER_OPTIONS.map((option) => {
                              const active = gender === option;
                              return (
                                <button
                                  key={option}
                                  type="button"
                                  role="radio"
                                  aria-checked={active}
                                  onClick={() => setGender(active ? "" : option)}
                                  className={`flex min-h-11 grow items-center justify-center whitespace-nowrap rounded-(--radius-control) border px-4 py-2 text-center text-sm font-medium transition-colors duration-(--dur-fast) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                                    active
                                      ? "border-sapphire bg-sapphire text-white font-semibold"
                                      : "border-border-control/75 bg-card text-foreground press-row hover:border-sapphire/60 hover:bg-sapphire-soft/50"
                                  }`}
                                >
                                  {t.genderOptions[option]}
                                </button>
                              );
                            })}
                          </div>
                        </fieldset>

                        {/* Age group + Marital status */}
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div>
                            <label htmlFor={ageGroupId} className="mb-1.5 block text-sm font-semibold text-foreground">
                              {t.ageGroupLabel}
                            </label>
                            <select
                              id={ageGroupId}
                              value={ageGroup}
                              onChange={(event) => setAgeGroup(event.target.value as FeedbackAgeGroup | "")}
                              className={inputBaseClass}
                            >
                              <option value="">{t.ageGroupPlaceholder}</option>
                              {AGE_GROUP_OPTIONS.map((opt) => (
                                <option key={opt} value={opt}>
                                  {t.ageGroupOptions[opt]}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label htmlFor={maritalStatusId} className="mb-1.5 block text-sm font-semibold text-foreground">
                              {t.maritalStatusLabel}
                            </label>
                            <select
                              id={maritalStatusId}
                              value={maritalStatus}
                              onChange={(event) => setMaritalStatus(event.target.value as FeedbackMaritalStatus | "")}
                              className={inputBaseClass}
                            >
                              <option value="">{t.maritalStatusPlaceholder}</option>
                              {MARITAL_STATUS_OPTIONS.map((opt) => (
                                <option key={opt} value={opt}>
                                  {t.maritalStatusOptions[opt]}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Locality + Occupation */}
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div>
                            <label htmlFor={localityId} className="mb-1.5 block text-sm font-semibold text-foreground">
                              {t.localityLabel}
                            </label>
                            <input
                              id={localityId}
                              type="text"
                              maxLength={120}
                              autoComplete="address-level2"
                              value={locality}
                              onChange={(event) => setLocality(event.target.value)}
                              placeholder={t.localityPlaceholder}
                              className={inputBaseClass}
                            />
                          </div>

                          <div>
                            <label htmlFor={occupationId} className="mb-1.5 block text-sm font-semibold text-foreground">
                              {t.occupationLabel}
                            </label>
                            <input
                              id={occupationId}
                              type="text"
                              maxLength={120}
                              autoComplete="organization-title"
                              value={occupation}
                              onChange={(event) => setOccupation(event.target.value)}
                              placeholder={t.occupationPlaceholder}
                              className={inputBaseClass}
                            />
                          </div>
                        </div>

                        {/* Explicit Anonymization Reassurance */}
                        <div className="flex items-start gap-2.5 rounded-xl bg-surface-subtle p-3.5 text-xs leading-relaxed text-muted-foreground">
                          <ShieldIcon className="mt-0.5 h-4 w-4 shrink-0 text-sapphire" />
                          <span>{t.privacyNote}</span>
                        </div>
                      </div>
                    ) : null}
                  </motion.div>
                </AnimatePresence>

                {error ? (
                  <p
                    id={errorId}
                    role="alert"
                    className="mt-4 flex items-start gap-2 rounded-lg border border-primary/30 bg-primary-soft/60 px-3.5 py-2.5 text-sm text-primary-active"
                  >
                    <AlertCircleIcon className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{error}</span>
                  </p>
                ) : null}
              </div>

              {/* Modal Sticky Footer */}
              <div className="flex items-center justify-between gap-3 border-t border-border bg-surface-subtle/50 px-5 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:px-6 sm:pb-4">
                {step > 0 ? (
                  <Button type="button" variant="outline" onClick={goPrevStep} disabled={isSubmitting}>
                    <ArrowLeftIcon className="h-4 w-4" />
                    <span>{t.backCta}</span>
                  </Button>
                ) : (
                  <Button type="button" variant="ghost" onClick={() => closeModal(false)}>
                    {t.inviteLaterCta}
                  </Button>
                )}

                {step < 2 ? (
                  <Button
                    key="next-step"
                    type="button"
                    variant="action"
                    onClick={(event) => {
                      event.preventDefault();
                      goNextStep();
                    }}
                  >
                    <span>{t.nextCta}</span>
                    <ArrowRightIcon className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button key="submit-feedback" type="submit" variant="action" disabled={isSubmitting}>
                    {isSubmitting ? t.submitting : t.submitCta}
                  </Button>
                )}
              </div>
            </form>
          )}
        </div>
      </dialog>
    </>
  );
}
