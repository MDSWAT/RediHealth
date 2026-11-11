"use client";

import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useId, useRef, useState, type FormEvent, type MouseEvent } from "react";
import { usePathname } from "next/navigation";
import { captchaErrorMessage, useRecaptcha } from "@/components/security/RecaptchaProvider";
import { Button } from "@/components/ui/Button";
import {
  AlertCircleIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  CloseIcon,
  MessageDotsIcon,
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

const INVITE_DELAY_MS = 10_000;
const DISMISS_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000; // 7 days after explicit dismissal
const VISIT_START_SESSION_KEY = "redihealth:visit-started-at:v1";
const DISMISSED_AT_STORAGE_KEY = "redihealth:feedback-dismissed-at:v1";
const SUBMITTED_STORAGE_KEY = "redihealth:feedback-submitted:v1";
const OPEN_FEEDBACK_EVENT = "redi:feedback-open";

type StepIndex = 0 | 1 | 2;

type RatingsState = Record<RatingKey, number | null>;

const INITIAL_RATINGS: RatingsState = {
  rating_usefulness: null,
  rating_ease_of_use: null,
  rating_visual_design: null,
  rating_content_clarity: null,
  rating_future_use: null,
};

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
  const [openAnswer, setOpenAnswer] = useState("");
  const [gender, setGender] = useState<FeedbackGender | "">("");
  const [ageGroup, setAgeGroup] = useState<FeedbackAgeGroup | "">("");
  const [maritalStatus, setMaritalStatus] = useState<FeedbackMaritalStatus | "">("");
  const [locality, setLocality] = useState("");
  const [occupation, setOccupation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const subtitleId = useId();
  const openQuestionId = useId();
  const ageGroupId = useId();
  const maritalStatusId = useId();
  const localityId = useId();
  const occupationId = useId();
  const errorId = useId();

  const openModal = useCallback((prefillUsefulness?: number) => {
    setInviteVisible(false);
    setError(null);
    if (prefillUsefulness && prefillUsefulness >= 1 && prefillUsefulness <= 5) {
      setRatings((prev) => ({ ...prev, rating_usefulness: prefillUsefulness }));
    }
    setStep(0);
    setStepDir(1);
    setModalOpen(true);
  }, []);

  const dismissInvite = useCallback(() => {
    setInviteVisible(false);
    try {
      window.localStorage.setItem(DISMISSED_AT_STORAGE_KEY, String(Date.now()));
    } catch {
      // Storage may be unavailable in strict private browsing; dismissal still holds in memory.
    }
  }, []);

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

  // 10-second website visit timer across page transitions
  useEffect(() => {
    if (modalOpen || submitted) return;

    const barePath = stripLangFromPathname(pathname);
    // Do not interrupt active symptom triage or video consultation rooms with a popup
    if (barePath.startsWith("/medic-online/meet") || barePath.startsWith("/patient-portal")) {
      return;
    }

    let remainingMs = INVITE_DELAY_MS;
    try {
      if (window.localStorage.getItem(SUBMITTED_STORAGE_KEY) === "1") {
        return;
      }
      const dismissedAt = Number(window.localStorage.getItem(DISMISSED_AT_STORAGE_KEY) || "0");
      if (dismissedAt > 0 && Date.now() - dismissedAt < DISMISS_COOLDOWN_MS) {
        return;
      }

      const now = Date.now();
      const existingStart = Number(window.sessionStorage.getItem(VISIT_START_SESSION_KEY) || "0");
      const startedAt = existingStart > 0 ? existingStart : now;
      if (!existingStart) {
        window.sessionStorage.setItem(VISIT_START_SESSION_KEY, String(startedAt));
      }
      remainingMs = Math.max(0, INVITE_DELAY_MS - (now - startedAt));
    } catch {
      remainingMs = INVITE_DELAY_MS;
    }

    let retryTimer: number | undefined;
    const scheduleShow = (delay: number) => {
      retryTimer = window.setTimeout(() => {
        // Defer cleanly if another native modal dialog (e.g. 112 gate or report issue) is open
        if (document.querySelector("dialog[open]")) {
          scheduleShow(2_500);
          return;
        }
        setInviteVisible(true);
      }, delay);
    };

    scheduleShow(remainingMs);
    return () => {
      if (retryTimer !== undefined) window.clearTimeout(retryTimer);
    };
  }, [pathname, modalOpen, submitted]);

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
      setModalOpen(false);
    }
  }

  const allRatingsComplete = RATING_KEYS.every((key) => ratings[key] !== null);
  const answeredRatingsCount = RATING_KEYS.filter((key) => ratings[key] !== null).length;

  function goNextStep() {
    setError(null);
    if (step === 0) {
      if (!allRatingsComplete) {
        setError(t.validationMissingRatings);
        return;
      }
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
      setError(t.validationMissingRatings);
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

      try {
        window.localStorage.setItem(SUBMITTED_STORAGE_KEY, "1");
      } catch {
        // Ignore storage write errors
      }
      setSubmitted(true);
    } catch (caught) {
      setError(captchaErrorMessage(caught, t.errorGeneric));
    } finally {
      setIsSubmitting(false);
    }
  }

  const inputBaseClass =
    "min-h-11 w-full rounded-(--radius-control) border border-border-control bg-background px-3.5 py-2 text-base text-foreground placeholder:text-muted-foreground/80 transition-colors duration-(--dur-fast) ease-(--ease-out-calm) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:text-sm";

  return (
    <>
      {/* Permanent floating button stacked above "Report a problem" (bottom-3 right-3 -> bottom-15 right-3):
          an icon with its label to its left on hover or keyboard focus, like the button below it. */}
      <button
        type="button"
        onClick={() => {
          setSubmitted(false);
          openModal();
        }}
        aria-label={t.footerLink}
        aria-haspopup="dialog"
        className="feedback-trigger group fixed bottom-15 right-3 z-30 hidden h-10 w-10 items-center justify-center rounded-lg border border-border bg-card text-sapphire shadow-xs transition-colors duration-(--dur-fast) ease-(--ease-out-calm) lg:flex hover:border-sapphire/40 hover:bg-sapphire-soft/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <MessageDotsIcon className="h-[18px] w-[18px]" aria-hidden="true" />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute right-full mr-2 whitespace-nowrap rounded-md bg-ink-950 px-2.5 py-1.5 text-xs font-medium text-white opacity-0 shadow-xs transition-opacity duration-(--dur-fast) group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none"
        >
          {t.footerLink}
        </span>
      </button>

      {/* 10-second floating invitation card anchored cleanly above the permanent bottom-right action dock */}
      <AnimatePresence>
        {inviteVisible && !modalOpen ? (
          <motion.aside
            role="region"
            aria-label={t.inviteOpenCta}
            initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
            transition={reducedMotion ? { duration: 0 } : CLINICAL_SETTLE_SPRING}
            className="feedback-invite-card fixed inset-x-3 bottom-[calc(0.75rem+env(safe-area-inset-bottom))] z-30 mx-auto max-w-md rounded-(--radius-surface) border border-white/14 bg-ink-950 p-4 text-paper shadow-[0_18px_42px_-12px_rgba(10,18,38,0.52)] sm:inset-x-auto sm:right-3 sm:bottom-4 sm:mx-0 sm:w-[23.5rem] sm:p-5 lg:bottom-28"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0">
                <span
                  aria-hidden="true"
                  className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sapphire-light/35 text-on-sapphire-muted"
                >
                  <MessageDotsIcon className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <h2 className="text-[1.02rem] font-semibold leading-snug text-paper">
                    {t.inviteTitle}
                  </h2>
                  <p className="mt-1 text-sm leading-relaxed text-on-sapphire-muted">
                    {t.inviteBody}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={dismissInvite}
                aria-label={t.inviteCloseAria}
                className="hero-focus -mr-1.5 -mt-1.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-mist press-on-dark transition-colors duration-(--dur-fast) hover:bg-white/10 hover:text-paper"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Instant 1–5 usefulness tap strip that jumps straight into the modal */}
            <div className="mt-3.5 rounded-xl bg-ink-900/90 p-3">
              <p className="text-xs font-medium text-on-sapphire-muted">
                {t.inviteQuickScaleHint}
              </p>
              <div className="mt-2 grid grid-cols-5 gap-1.5" role="group" aria-label={t.questions.rating_usefulness.question}>
                {[1, 2, 3, 4, 5].map((score, idx) => (
                  <button
                    key={score}
                    type="button"
                    onClick={() => openModal(score)}
                    aria-label={t.scaleValueLabels[idx]}
                    className="hero-focus flex min-h-11 items-center justify-center rounded-lg border border-white/16 bg-ink-800/80 text-sm font-semibold tabular-nums text-paper press-on-dark transition-colors duration-(--dur-fast) hover:border-sapphire-border hover:bg-sapphire"
                  >
                    {score}
                  </button>
                ))}
              </div>
              <div className="mt-1.5 flex items-center justify-between text-[11px] text-mist">
                <span>{t.scaleLow}</span>
                <span>{t.scaleHigh}</span>
              </div>
            </div>

            <div className="mt-3.5 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={dismissInvite}
                className="hero-focus inline-flex min-h-11 items-center rounded-lg px-3 text-sm font-medium text-on-sapphire-muted press-on-dark transition-colors duration-(--dur-fast) hover:bg-white/10 hover:text-paper"
              >
                {t.inviteLaterCta}
              </button>
              <button
                type="button"
                onClick={() => openModal()}
                className="hero-focus inline-flex min-h-11 items-center gap-2 rounded-lg bg-paper px-4 text-sm font-semibold text-ink-950 press-solid transition-colors duration-(--dur-fast) hover:bg-white"
              >
                <span>{t.inviteOpenCta}</span>
                <ArrowRightIcon className="h-4 w-4" />
              </button>
            </div>
          </motion.aside>
        ) : null}
      </AnimatePresence>

      {/* Dedicated Feedback Modal */}
      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        aria-describedby={subtitleId}
        onClose={() => setModalOpen(false)}
        onClick={handleBackdropClick}
        className={[
          "m-0 mt-auto w-full max-w-none overflow-visible bg-transparent p-0 text-foreground",
          "sm:m-auto sm:w-[calc(100%-2rem)] sm:max-w-2xl",
          "backdrop:bg-ink-950/55 backdrop:backdrop-blur-[2px]",
          "transition-[opacity,translate] duration-(--dur-base) ease-(--ease-out-calm)",
          "starting:open:translate-y-2 starting:open:opacity-0",
        ].join(" ")}
      >
        {/* One fixed size for every step, so the window does not jump as the reader moves through it. */}
        <div className="flex h-[min(40rem,92dvh)] flex-col overflow-hidden rounded-t-2xl bg-card shadow-[0_24px_64px_-16px_rgba(11,19,43,0.34)] sm:rounded-2xl">
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
                onClick={() => setModalOpen(false)}
                disabled={isSubmitting}
                aria-label={t.closeAria}
                className="-mr-1.5 -mt-1 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors duration-(--dur-fast) hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>

            {/* 3-Step Segmented Progress Bar */}
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
                <div className="mt-2 grid grid-cols-3 gap-1.5" aria-hidden="true">
                  {[0, 1, 2].map((idx) => (
                    <span
                      key={idx}
                      className={`h-1.5 rounded-full transition-colors duration-(--dur-base) ${
                        idx <= step ? "bg-sapphire" : "bg-border"
                      }`}
                    />
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          {/* Modal Body */}
          {submitted ? (
            <div className="space-y-5 p-6 sm:p-8">
              <div className="flex items-start gap-3.5 rounded-xl bg-sapphire-soft p-4 text-sapphire">
                <CheckCircleIcon className="mt-0.5 h-6 w-6 shrink-0" />
                <div className="space-y-1 text-sm leading-relaxed">
                  <p className="font-semibold text-foreground">{t.thankYouBody}</p>
                  <p className="text-muted-foreground">{t.privacyNote}</p>
                </div>
              </div>
              <div className="flex justify-end">
                <Button type="button" variant="action" onClick={() => setModalOpen(false)}>
                  {t.doneCloseCta}
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="flex min-h-0 flex-1 flex-col">
              <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
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
                          return (
                            <fieldset
                              key={key}
                              className="border-b border-border/70 py-2.5 last:border-b-0"
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
                                          setRatings((prev) => ({ ...prev, [key]: value }));
                                          if (error) setError(null);
                                        }}
                                        className={`flex min-h-11 items-center justify-center rounded-lg border text-sm font-semibold tabular-nums transition-colors duration-(--dur-fast) ease-(--ease-out-calm) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                                          active
                                            ? "border-sapphire bg-sapphire text-white"
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
                          {/* Each choice keeps its label on one line: the buttons size to their words and wrap as whole buttons. */}
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
                  <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
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
