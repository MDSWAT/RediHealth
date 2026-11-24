"use client";
import { trackEvent } from "@/lib/analytics-events";

import { AnimatePresence, m } from "motion/react";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import styles from "@/components/layout/ChromeDialogs.module.css";
import { captchaErrorMessage, useRecaptcha } from "@/components/security/RecaptchaProvider";
import { Button } from "@/components/ui/Button";
import {
  ArrowLeftIcon,
  CheckIcon,
  CloseIcon,
  MessageDotsIcon,
} from "@/components/ui/icons";
import { feedbackWidgetCopy, type FeedbackWidgetCopy } from "@/lib/i18n/feedback-translations";
import { useLanguage } from "@/lib/i18n/language-context";
import { getOfflineUiCopy } from "@/lib/i18n/offline-copy";
import { stripLangFromPathname, withLangPrefix } from "@/lib/i18n/routing";
import { isBrowserOffline } from "@/lib/pwa/use-online-status";
import { DURATION, EASE_OUT, useCalmReducedMotion } from "@/lib/motion/tokens";
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
import {
  applyFeedbackDismissal,
  defaultFeedbackSchedule,
  evaluateSmartFeedbackPrompt,
  FEEDBACK_PAGE_SETTLE_GRACE_MS,
  FEEDBACK_VISIT_RESET_IDLE_MS,
  isSmartFeedbackAllowedPath,
  type FeedbackPromptVariant,
  type StoredFeedbackSchedule,
} from "@/components/layout/feedback-schedule";

/** Heartbeat interval while the tab is visible (1s precision for 30s initial + 2m follow-up triggers). */
const HEARTBEAT_INTERVAL_MS = 1_000;

const SCHEDULE_STORAGE_KEY = "redihealth:feedback-schedule:v3";
const DRAFT_SESSION_KEY = "redihealth:feedback-draft:v2";
/** Closing the side tab is remembered on this device for 30 days (the value is the time it may return). */
const EDGE_DISMISSED_KEY = "redihealth:feedback-edge-dismissed:v2";
const EDGE_DISMISS_MS = 30 * 24 * 60 * 60 * 1000;
/**
 * The invite card waits while any of these is on screen, so two floating prompts never stack:
 * dialogs, a page's bottom action bar, the audio player, the open phone menu, and other floating
 * prompts that mark themselves with `data-floating-prompt` (the install and update cards).
 */
const INVITE_BLOCKERS =
  'dialog[open], [data-bottom-bar], .hh-dialog, [data-audio-player-open="true"], #mobile-menu:not([inert]), [data-floating-prompt]';
import {
  consumePendingFeedbackOpen,
  OPEN_FEEDBACK_EVENT,
  openSiteFeedback,
} from "@/components/layout/chrome-widget-events";

export { openSiteFeedback };

type StepIndex = 0 | 1 | 2;

type RatingsState = Record<RatingKey, number | null>;

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

function readSchedule(now = Date.now()): StoredFeedbackSchedule {
  try {
    const raw = window.localStorage.getItem(SCHEDULE_STORAGE_KEY);
    if (!raw) return defaultFeedbackSchedule(now);
    const parsed = JSON.parse(raw) as Partial<StoredFeedbackSchedule>;
    const lastSeenAt = typeof parsed.lastSeenAt === "number" ? parsed.lastSeenAt : now;
    const isStaleVisit = now - lastSeenAt > FEEDBACK_VISIT_RESET_IDLE_MS;
    return {
      activeMs: isStaleVisit ? 0 : Math.max(0, Number(parsed.activeMs) || 0),
      lastSeenAt: now,
      snoozedUntil: Math.max(0, Number(parsed.snoozedUntil) || 0),
      dismissCount: isStaleVisit ? 0 : Math.max(0, Number(parsed.dismissCount) || 0),
      submitted: Boolean(parsed.submitted),
    };
  } catch {
    return defaultFeedbackSchedule(now);
  }
}

function writeSchedule(next: StoredFeedbackSchedule): void {
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

function errorForResponse(status: number, code: string | undefined, t: FeedbackWidgetCopy): string {
  if (status === 429 || code === "rate_limited") return t.errorTooMany;
  if (code === "captcha_invalid") return t.errorCaptcha;
  if (status === 503 || code === "unavailable") return t.errorUnavailable;
  return t.errorGeneric;
}

function isUserTypingInDocument(): boolean {
  const active = document.activeElement;
  if (!active || !(active instanceof HTMLElement)) return false;
  const tag = active.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") {
    return true;
  }
  if (active.isContentEditable || active.getAttribute("contenteditable") === "true") {
    return true;
  }
  return Boolean(active.closest('[contenteditable="true"]'));
}

function SubmittingSpinner() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className="h-4 w-4 shrink-0 animate-spin motion-reduce:animate-none"
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeOpacity="0.28"
        strokeWidth="2.5"
      />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function FeedbackWidget() {
  const { lang } = useLanguage();
  const pathname = usePathname();
  const executeCaptcha = useRecaptcha();
  const reducedMotion = useCalmReducedMotion();
  const t = feedbackWidgetCopy[lang] ?? feedbackWidgetCopy.ro;

  const [modalLeadSource, setModalLeadSource] = useState<"manual" | FeedbackPromptVariant>("manual");
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
  const bodyScrollerRef = useRef<HTMLDivElement>(null);
  const ratingsRef = useRef<RatingsState>(INITIAL_RATINGS);
  const questionRefs = useRef<Partial<Record<RatingKey, HTMLFieldSetElement | null>>>({});
  const pageMountedAtRef = useRef<number>(0);
  const lastScrollAtRef = useRef<number>(0);
  const pauseRecheckTimerRef = useRef<number | null>(null);
  const trackedPromptAppearanceRef = useRef<string | null>(null);

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
    barePath.startsWith("/medic-online/meet") ||
    barePath.startsWith("/patient-portal") ||
    barePath === "/contul-meu" ||
    barePath === "/sign-in";
  const isClinicalTaskSurface =
    barePath === "/health-check" || barePath === "/prescription-review";
  const [edgeDismissed, setEdgeDismissed] = useState(false);
  const [edgeDismissing, setEdgeDismissing] = useState(false);
  const [edgeDragX, setEdgeDragX] = useState(0);
  const [edgeDragging, setEdgeDragging] = useState(false);

  const edgeDragRef = useRef<{
    pointerId: number;
    startX: number;
    startTime: number;
    maxAbsDx: number;
    captured: boolean;
  } | null>(null);
  const suppressEdgeClickRef = useRef(false);
  const edgeDismissTimerRef = useRef<number | null>(null);
  const suppressEdgeClickTimerRef = useRef<number | null>(null);

  // Hydrate any unfinished in-session draft and edge-tab dismissal state
  useEffect(() => {
    pageMountedAtRef.current = Date.now();
    queueMicrotask(() => {
      try {
        const hiddenUntil = Number(window.localStorage.getItem(EDGE_DISMISSED_KEY));
        if (Number.isFinite(hiddenUntil) && hiddenUntil > Date.now()) {
          setEdgeDismissed(true);
        }
      } catch {
        // Ignore storage read errors
      }
      const draft = readDraft();
      if (draft) {
        setStep(draft.step);
        ratingsRef.current = draft.ratings;
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
    return () => {
      if (edgeDismissTimerRef.current !== null) {
        window.clearTimeout(edgeDismissTimerRef.current);
      }
      if (suppressEdgeClickTimerRef.current !== null) {
        window.clearTimeout(suppressEdgeClickTimerRef.current);
      }
    };
  }, []);

  // Reset settle grace on route navigation
  useEffect(() => {
    pageMountedAtRef.current = Date.now();
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

  const snoozeAutoPrompt = useCallback(
    (recordDismissalEvent = true) => {
      setError(null);
      setHighlightMissing(false);
      trackedPromptAppearanceRef.current = null;
      const now = Date.now();
      const current = readSchedule(now);
      writeSchedule(applyFeedbackDismissal(current, now));
      if (recordDismissalEvent && modalLeadSource !== "manual") {
        trackEvent("feedback_prompt_dismissed", { variant: modalLeadSource });
      }
    },
    [modalLeadSource],
  );

  const dismissEdgeTrigger = useCallback(() => {
    try {
      window.localStorage.setItem(EDGE_DISMISSED_KEY, String(Date.now() + EDGE_DISMISS_MS));
    } catch {
      // Ignore storage errors: the tab still hides for this page view
    }
    snoozeAutoPrompt(false);
    setEdgeDragging(false);
    if (reducedMotion) {
      setEdgeDismissed(true);
      setEdgeDismissing(false);
      setEdgeDragX(0);
      return;
    }
    setEdgeDismissing(true);
    if (edgeDismissTimerRef.current !== null) {
      window.clearTimeout(edgeDismissTimerRef.current);
    }
    edgeDismissTimerRef.current = window.setTimeout(() => {
      setEdgeDismissed(true);
      setEdgeDismissing(false);
      setEdgeDragX(0);
      edgeDismissTimerRef.current = null;
    }, 180);
  }, [reducedMotion, snoozeAutoPrompt]);

  const handleEdgePointerDown = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    edgeDragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startTime: performance.now(),
      maxAbsDx: 0,
      captured: false,
    };
  }, []);

  const handleEdgePointerMove = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = edgeDragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const dx = event.clientX - drag.startX;
    drag.maxAbsDx = Math.max(drag.maxAbsDx, Math.abs(dx));
    if (drag.maxAbsDx > 6) {
      if (!drag.captured) {
        drag.captured = true;
        try {
          event.currentTarget.setPointerCapture(event.pointerId);
        } catch {
          // Ignore pointer capture errors
        }
      }
      suppressEdgeClickRef.current = true;
      setEdgeDragging(true);
      setEdgeDragX(dx > 0 ? Math.min(dx, 96) : Math.max(-5, dx * 0.12));
    }
  }, []);

  const handleEdgePointerEnd = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const drag = edgeDragRef.current;
      if (!drag || drag.pointerId !== event.pointerId) return;
      edgeDragRef.current = null;
      if (drag.captured) {
        try {
          event.currentTarget.releasePointerCapture(event.pointerId);
        } catch {
          // Ignore release errors
        }
      }
      setEdgeDragging(false);

      const dx = event.clientX - drag.startX;
      const elapsed = Math.max(1, performance.now() - drag.startTime);
      const vx = dx / elapsed;

      if (drag.maxAbsDx > 6) {
        suppressEdgeClickRef.current = true;
        if (suppressEdgeClickTimerRef.current !== null) {
          window.clearTimeout(suppressEdgeClickTimerRef.current);
        }
        suppressEdgeClickTimerRef.current = window.setTimeout(() => {
          suppressEdgeClickRef.current = false;
          suppressEdgeClickTimerRef.current = null;
        }, 120);
      }

      if (event.type !== "pointercancel" && (dx >= 20 || vx >= 0.25)) {
        dismissEdgeTrigger();
      } else {
        setEdgeDragX(0);
      }
    },
    [dismissEdgeTrigger],
  );

  const handleEdgeKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLDivElement>) => {
      if (event.key === "ArrowRight" || event.key === "Delete" || event.key === "Backspace") {
        event.preventDefault();
        dismissEdgeTrigger();
      }
    },
    [dismissEdgeTrigger],
  );

  const openModal = useCallback(
    (leadSource: "manual" | FeedbackPromptVariant = "manual") => {
      setModalLeadSource(leadSource);
      setError(null);
      setHighlightMissing(false);
      setStep(0);
      setStepDir(1);
      setModalOpen(true);
    },
    [],
  );

  const closeModal = useCallback(
    (wasSubmitted: boolean) => {
      setModalOpen(false);
      if (!wasSubmitted) {
        // Snooze auto-prompt (2 min after 1st discard, 24h after 2nd, 7d after 3rd+)
        snoozeAutoPrompt(true);
      }
    },
    [snoozeAutoPrompt],
  );

  // Support programmatic open via `openSiteFeedback()` and `?feedback=1` deep link
  useEffect(() => {
    const handleCustomOpen = (event: Event) => {
      event.preventDefault();
      setSubmitted(false);
      openModal("manual");
    };
    window.addEventListener(OPEN_FEEDBACK_EVENT, handleCustomOpen);

    if (consumePendingFeedbackOpen()) {
      queueMicrotask(() => {
        setSubmitted(false);
        openModal("manual");
      });
    } else {
      try {
        const params = new URLSearchParams(window.location.search);
        if (params.get("feedback") === "1") {
          queueMicrotask(() => openModal("manual"));
        }
      } catch {
        // Ignore malformed URL edge cases
      }
    }

    return () => window.removeEventListener(OPEN_FEEDBACK_EVENT, handleCustomOpen);
  }, [openModal]);

  // Smart active browsing timer for the existing feedback form modal:
  // - 30s on the platform -> opens the current 5-question form with a friendly initial lead
  // - If discarded once -> re-opens after 2 more minutes with a different, warmer lead (5 questions visible)
  // - If discarded again -> backs off to 24h / 7d
  // - Pause-aware: never interrupts active typing or scrolling; waits until the user pauses.
  useEffect(() => {
    if (modalOpen || submitted || isConsultationOrPortal) {
      return;
    }

    let lastTick = Date.now();

    const clearPauseRecheck = () => {
      if (pauseRecheckTimerRef.current !== null) {
        window.clearTimeout(pauseRecheckTimerRef.current);
        pauseRecheckTimerRef.current = null;
      }
    };

    const handleScroll = () => {
      lastScrollAtRef.current = Date.now();
    };

    const evaluateAndTick = () => {
      const now = Date.now();
      const delta =
        document.visibilityState === "visible"
          ? Math.min(Math.max(0, now - lastTick), HEARTBEAT_INTERVAL_MS * 2)
          : 0;
      lastTick = now;

      const schedule = readSchedule(now);
      if (schedule.submitted) {
        clearPauseRecheck();
        return;
      }

      const nextSchedule: StoredFeedbackSchedule = {
        ...schedule,
        activeMs: schedule.activeMs + delta,
        lastSeenAt: now,
      };
      writeSchedule(nextSchedule);

      if (document.visibilityState !== "visible") return;

      const decision = evaluateSmartFeedbackPrompt(nextSchedule, now, {
        allowedPath: isSmartFeedbackAllowedPath(barePath),
        pageSettled: now - pageMountedAtRef.current >= FEEDBACK_PAGE_SETTLE_GRACE_MS,
        blockedByUi: Boolean(document.querySelector(INVITE_BLOCKERS)),
        userInteracting: isUserTypingInDocument(),
        lastScrollAt: lastScrollAtRef.current,
      });

      if (!decision.shouldOpen) {
        if (decision.reason === "user_interacting" && decision.nextCheckMs !== null) {
          clearPauseRecheck();
          pauseRecheckTimerRef.current = window.setTimeout(() => {
            pauseRecheckTimerRef.current = null;
            evaluateAndTick();
          }, decision.nextCheckMs + 50);
        }
        return;
      }

      clearPauseRecheck();
      openModal(decision.variant);

      const appearanceKey = `${decision.variant}:${nextSchedule.dismissCount}`;
      if (trackedPromptAppearanceRef.current !== appearanceKey) {
        trackedPromptAppearanceRef.current = appearanceKey;
        trackEvent("feedback_prompt_shown", { variant: decision.variant });
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    const intervalId = window.setInterval(evaluateAndTick, HEARTBEAT_INTERVAL_MS);
    const settleTimerId = window.setTimeout(evaluateAndTick, FEEDBACK_PAGE_SETTLE_GRACE_MS + 150);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.clearInterval(intervalId);
      window.clearTimeout(settleTimerId);
      clearPauseRecheck();
    };
  }, [modalOpen, submitted, isConsultationOrPortal, barePath, pathname, openModal]);

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

  useEffect(() => {
    if (!modalOpen) return;
    bodyScrollerRef.current?.scrollTo({ top: 0 });
  }, [step, modalOpen]);

  useEffect(() => {
    if (!modalOpen || !error) return;
    const scroller = bodyScrollerRef.current;
    if (scroller) {
      scroller.scrollTo({
        top: scroller.scrollHeight,
        behavior: reducedMotion ? "auto" : "smooth",
      });
    }
  }, [error, modalOpen, reducedMotion]);

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

  async function submitFeedback(options: { ratingsOnly?: boolean } = {}) {
    if (isSubmitting) return;
    setError(null);

    if (!allRatingsComplete) {
      setStepDir(-1);
      setStep(0);
      revealFirstMissingRating();
      return;
    }
    if (isBrowserOffline()) {
      setError(getOfflineUiCopy(lang).formOfflineError);
      return;
    }

    const ratingsOnly = Boolean(options.ratingsOnly);
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
          open_feedback: ratingsOnly ? undefined : openAnswer.trim() || undefined,
          gender: ratingsOnly ? undefined : gender || undefined,
          age_group: ratingsOnly ? undefined : ageGroup || undefined,
          marital_status: ratingsOnly ? undefined : maritalStatus || undefined,
          locality: ratingsOnly ? undefined : locality.trim() || undefined,
          occupation: ratingsOnly ? undefined : occupation.trim() || undefined,
          captchaToken,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as { code?: string };
        setError(errorForResponse(response.status, payload.code, t));
        return;
      }

      trackEvent("feedback_sent");
      markScheduleSubmitted();
      clearDraft();
      ratingsRef.current = INITIAL_RATINGS;
      setRatings(INITIAL_RATINGS);
      setOpenAnswer("");
      setGender("");
      setAgeGroup("");
      setMaritalStatus("");
      setLocality("");
      setOccupation("");
      setStep(0);
      setHighlightMissing(false);
      setSubmitted(true);
    } catch (caught) {
      setError(captchaErrorMessage(caught, t.errorGeneric));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (step < 2) {
      goNextStep();
      return;
    }

    await submitFeedback({ ratingsOnly: false });
  }

  async function handleQuickSubmitRatings() {
    await submitFeedback({ ratingsOnly: true });
  }

  const inputBaseClass =
    "min-h-11 w-full rounded-(--radius-control) border border-border-control bg-background px-3.5 py-2 text-body text-foreground placeholder:text-muted-foreground/80 field-focus";

  const modalHeaderTitle = submitted
    ? t.thankYouTitle
    : modalLeadSource === "followup"
      ? t.inviteReturnTitle
      : modalLeadSource === "initial"
        ? t.inviteTitle
        : t.modalTitle;

  const modalHeaderSubtitle = submitted
    ? t.thankYouBody
    : modalLeadSource === "followup"
      ? t.inviteReturnBody
      : modalLeadSource === "initial"
        ? t.inviteBody
        : t.modalSubtitle;

  return (
    <>
      {!isConsultationOrPortal &&
      !isClinicalTaskSurface &&
      !modalOpen &&
      (!edgeDismissed || edgeDismissing) ? (
        <div
          onPointerDown={handleEdgePointerDown}
          onPointerMove={handleEdgePointerMove}
          onPointerUp={handleEdgePointerEnd}
          onPointerCancel={handleEdgePointerEnd}
          onKeyDown={handleEdgeKeyDown}
          style={{
            transform: edgeDismissing
              ? "translate3d(115%, 0, 0)"
              : edgeDragX !== 0
                ? `translate3d(${edgeDragX}px, 0, 0)`
                : undefined,
            opacity: edgeDismissing
              ? 0
              : edgeDragX > 0
                ? Math.max(0.28, 1 - edgeDragX / 64)
                : undefined,
          }}
          className={[
            // Phones reach feedback from the menu and the footer, so the tab never sits on their page text.
            "feedback-edge-trigger fixed right-0 top-1/2 z-30 -translate-y-1/2 flex w-10 flex-col max-sm:hidden items-stretch rounded-l-xl border border-r-0 border-border bg-card/95 text-foreground shadow-[0_12px_28px_-10px_rgba(15,23,42,0.28)] backdrop-blur-md touch-pan-y select-none print:hidden dark:border-white/15 dark:bg-ink-950/95 dark:text-paper",
            edgeDragging || reducedMotion
              ? "transition-none"
              : "transition-[transform,opacity,border-color] duration-(--dur-fast) ease-(--ease-out-calm) motion-reduce:transition-none",
          ].join(" ")}
        >
          <button
            type="button"
            onClick={() => {
              if (suppressEdgeClickRef.current) {
                suppressEdgeClickRef.current = false;
                return;
              }
              dismissEdgeTrigger();
            }}
            aria-label={t.inviteCloseAria}
            title={t.inviteCloseAria}
            className="relative inline-flex h-8 w-full items-center justify-center rounded-tl-xl border-b border-border/60 text-muted-foreground transition-colors duration-(--dur-fast) hover:bg-muted/80 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring before:absolute before:-top-1.5 before:-left-2 before:right-0 before:bottom-0 dark:border-white/10 dark:text-mist dark:hover:bg-white/10 dark:hover:text-paper dark:focus-visible:ring-paper"
          >
            <CloseIcon className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => {
              if (suppressEdgeClickRef.current) {
                suppressEdgeClickRef.current = false;
                return;
              }
              openModal();
            }}
            aria-label={t.footerLink}
            title={t.footerLink}
            data-feedback-trigger=""
            className="press-solid group relative flex min-h-24 w-full flex-col items-center justify-center gap-2 rounded-bl-xl px-1.5 py-3 text-meta font-semibold text-foreground transition-colors duration-(--dur-fast) motion-reduce:transition-none hover:bg-sapphire hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring before:absolute before:inset-y-0 before:-left-2 before:right-0 dark:text-paper dark:hover:bg-sapphire dark:focus-visible:ring-paper"
          >
            <MessageDotsIcon className="h-4 w-4 shrink-0 text-sapphire transition-colors group-hover:text-current dark:text-sapphire-border" />
            <span className="[writing-mode:vertical-rl] rotate-180 whitespace-nowrap tracking-wide">
              {t.compactTriggerLabel}
            </span>
          </button>
        </div>
      ) : null}

      {/* Existing Feedback Form Modal (also auto-opened at 30s and after 2m discard with tailored lead copy) */}
      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        aria-describedby={subtitleId}
        data-prompt-variant={modalLeadSource}
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
        <div className="flex h-[min(45rem,92dvh)] flex-col overflow-hidden rounded-t-2xl bg-card shadow-[0_24px_64px_-16px_rgba(11,19,43,0.34)] sm:h-[min(42rem,90dvh)] sm:rounded-2xl">
          {/* Modal Header */}
          <div className="border-b border-border bg-surface-subtle/65 px-4 pt-3.5 pb-3 sm:px-6 sm:pt-5 sm:pb-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 id={titleId} className="text-title font-bold leading-snug text-foreground">
                  {modalHeaderTitle}
                </h2>
                <p
                  id={subtitleId}
                  className="mt-0.5 text-meta leading-snug text-muted-foreground sm:mt-1 sm:text-body"
                >
                  {modalHeaderSubtitle}
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
              <div className="mt-2.5 sm:mt-4">
                <div className="flex items-center justify-between text-meta font-medium text-muted-foreground">
                  <span>
                    {step === 0
                      ? t.stepTitles.ratings
                      : step === 1
                        ? t.stepTitles.openQuestion
                        : t.stepTitles.demographics}
                  </span>
                  <span className="tabular-nums">{t.stepIndicator(step + 1, 3)}</span>
                </div>
                <div className="mt-1.5 grid grid-cols-3 gap-1.5 sm:mt-2">
                  {([0, 1, 2] as const).map((idx) => {
                    const stepLabel =
                      idx === 0
                        ? t.stepTitles.ratings
                        : idx === 1
                          ? t.stepTitles.openQuestion
                          : t.stepTitles.demographics;
                    const lockedByMandatoryRatings = idx > 0 && !allRatingsComplete;
                    return (
                      <button
                        key={idx}
                        type="button"
                        disabled={lockedByMandatoryRatings || isSubmitting}
                        aria-label={`${t.stepIndicator(idx + 1, 3)}: ${stepLabel}`}
                        aria-current={step === idx ? "step" : undefined}
                        onClick={() => jumpToStep(idx)}
                        className="group py-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {/* Each segment fills from the left as the reader reaches it, and empties the same way back. */}
                        <span
                          className={`relative block h-1.5 w-full overflow-hidden rounded-xs bg-border transition-colors duration-(--dur-fast) group-focus-visible:ring-2 group-focus-visible:ring-ring motion-reduce:transition-none ${
                            idx <= step || lockedByMandatoryRatings ? "" : "group-hover:bg-sapphire/35"
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
                <div className="space-y-1 text-body">
                  <p className="font-semibold text-foreground">{t.thankYouBody}</p>
                  <p className="text-muted-foreground">{t.privacyNote}</p>
                </div>
              </div>
              <div className="rounded-xl border border-border/70 bg-surface-subtle/75 p-4">
                <p className="text-body font-semibold text-foreground">{t.nextExploreHeading}</p>
                <div className="mt-2.5 grid gap-2 sm:grid-cols-3">
                  <Link
                    href={withLangPrefix("/health-check", lang)}
                    onClick={() => closeModal(true)}
                    className="inline-flex min-h-11 items-center justify-center rounded-lg border border-border-control/75 bg-card px-3 py-2 text-center text-meta font-medium text-foreground transition-colors hover:border-sapphire hover:bg-sapphire-soft/60"
                  >
                    {t.nextExploreSymptoms}
                  </Link>
                  <Link
                    href={withLangPrefix("/ai-assistant", lang)}
                    onClick={() => closeModal(true)}
                    className="inline-flex min-h-11 items-center justify-center rounded-lg border border-border-control/75 bg-card px-3 py-2 text-center text-meta font-medium text-foreground transition-colors hover:border-sapphire hover:bg-sapphire-soft/60"
                  >
                    {t.nextExploreAssistant}
                  </Link>
                  <Link
                    href={withLangPrefix("/health-information", lang)}
                    onClick={() => closeModal(true)}
                    className="inline-flex min-h-11 items-center justify-center rounded-lg border border-border-control/75 bg-card px-3 py-2 text-center text-meta font-medium text-foreground transition-colors hover:border-sapphire hover:bg-sapphire-soft/60"
                  >
                    {t.nextExploreGuides}
                  </Link>
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
              <div
                ref={bodyScrollerRef}
                data-modal-scroller="true"
                className={`flex-1 overflow-y-auto overscroll-contain ${
                  step === 0
                    ? "px-4 pt-0 pb-4 sm:px-6 sm:pt-0 sm:pb-5"
                    : "px-4 pt-3 pb-4 sm:px-6 sm:py-5"
                }`}
              >
                <AnimatePresence mode="wait" initial={false}>
                  <m.div
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
                    {/* Step 1: five mandatory ratings with sticky scale cue and smooth auto-advance scroll. */}
                    {step === 0 ? (
                      <div className="space-y-0.5">
                        <div className="sticky top-0 z-10 -mx-4 mb-1 bg-card px-4 pt-2.5 pb-1.5 sm:-mx-6 sm:px-6 sm:pt-3.5 sm:pb-2">
                          <div className="flex items-center justify-between rounded-xl border border-border/60 bg-surface-subtle px-3 py-1.5 text-meta font-medium text-muted-foreground sm:px-3.5 sm:py-2">
                            <span>{t.scaleLow}</span>
                            <span className="tabular-nums font-semibold text-sapphire">
                              {answeredRatingsCount} / {RATING_KEYS.length}
                            </span>
                            <span>{t.scaleHigh}</span>
                          </div>
                        </div>

                        {RATING_KEYS.map((key, qIdx) => {
                          const itemCopy = t.questions[key];
                          const selected = ratings[key];
                          const isMissing = highlightMissing && selected === null;
                          return (
                            <fieldset
                              key={key}
                              disabled={isSubmitting}
                              ref={(node) => {
                                questionRefs.current[key] = node;
                              }}
                              className={`border-b border-border/70 py-2 transition-colors duration-(--dur-fast) last:border-b-0 sm:py-2.5 ${
                                isMissing
                                  ? "my-1 -mx-2 rounded-xl border border-primary/35 bg-primary-soft/30 px-2"
                                  : ""
                              }`}
                            >
                              <legend className="sr-only">
                                {itemCopy.label}: {itemCopy.question}
                              </legend>
                              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                                <div className="min-w-0 sm:max-w-[58%]">
                                  <p className="text-body font-medium leading-snug text-foreground">
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
                                          const nextRatings = {
                                            ...ratingsRef.current,
                                            [key]: value,
                                          };
                                          ratingsRef.current = nextRatings;
                                          const nextComplete = RATING_KEYS.every(
                                            (k) => nextRatings[k] !== null,
                                          );
                                          setRatings((prev) => ({ ...prev, [key]: value }));
                                          if (nextComplete) {
                                            setHighlightMissing(false);
                                          }
                                          if (error) setError(null);

                                          const nextUnansweredAfter = RATING_KEYS.slice(
                                            qIdx + 1,
                                          ).find((k) => nextRatings[k] === null);
                                          const nextUnansweredAny =
                                            nextUnansweredAfter ??
                                            RATING_KEYS.find((k) => nextRatings[k] === null);

                                          window.requestAnimationFrame(() => {
                                            if (nextUnansweredAny) {
                                              questionRefs.current[
                                                nextUnansweredAny
                                              ]?.scrollIntoView({
                                                behavior: reducedMotion ? "auto" : "smooth",
                                                block: "center",
                                              });
                                            } else {
                                              const scroller = bodyScrollerRef.current;
                                              if (scroller) {
                                                scroller.scrollTo({
                                                  top: scroller.scrollHeight,
                                                  behavior: reducedMotion ? "auto" : "smooth",
                                                });
                                              }
                                            }
                                          });
                                        }}
                                        className={`flex min-h-11 items-center justify-center rounded-lg border text-body font-semibold tabular-nums transition-colors duration-(--dur-fast) ease-(--ease-out-calm) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
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
                          className="block text-body font-semibold leading-snug text-foreground"
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
                        <div className="flex items-start justify-between gap-3 text-meta text-muted-foreground">
                          <span>{t.openQuestionHint}</span>
                          <span className="shrink-0 tabular-nums">{openAnswer.length} / 2000</span>
                        </div>
                      </div>
                    ) : null}

                    {step === 2 ? (
                      <div className="space-y-4">
                        <p className="text-body text-muted-foreground">
                          {t.demographicsIntro}
                        </p>

                        {/* Gender */}
                        <fieldset>
                          <legend className="mb-2 block text-body font-semibold text-foreground">
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
                                  className={`flex min-h-11 grow items-center justify-center whitespace-nowrap rounded-(--radius-control) border px-4 py-2 text-center text-body font-medium transition-colors duration-(--dur-fast) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
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
                            <label htmlFor={ageGroupId} className="mb-1.5 block text-body font-semibold text-foreground">
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
                            <label htmlFor={maritalStatusId} className="mb-1.5 block text-body font-semibold text-foreground">
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
                            <label htmlFor={localityId} className="mb-1.5 block text-body font-semibold text-foreground">
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
                            <label htmlFor={occupationId} className="mb-1.5 block text-body font-semibold text-foreground">
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
                        <p className="rounded-xl bg-surface-subtle p-3.5 text-meta text-muted-foreground">
                          {t.privacyNote}
                        </p>
                      </div>
                    ) : null}
                  </m.div>
                </AnimatePresence>

                {error ? (
                  <p
                    id={errorId}
                    role="alert"
                    className="mt-4 rounded-lg border border-primary/30 bg-primary-soft/60 px-3.5 py-2.5 text-body text-primary-active"
                  >
                    {error}
                  </p>
                ) : null}
              </div>

              {/* Modal Sticky Footer */}
              <fieldset
                disabled={isSubmitting}
                className="m-0 min-w-0 border-0 border-t border-border bg-surface-subtle/50 p-0"
              >
                <div
                  className={
                    step === 0 && allRatingsComplete
                      ? "grid grid-cols-[auto_1fr] items-center gap-2 px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] sm:flex sm:items-center sm:gap-2.5 sm:px-6 sm:py-4 sm:pb-4"
                      : "flex items-center justify-between gap-3 px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] sm:px-6 sm:py-4 sm:pb-4"
                  }
                >
                  {step > 0 ? (
                    <Button type="button" variant="outline" onClick={goPrevStep} disabled={isSubmitting}>
                      <ArrowLeftIcon className="h-4 w-4" />
                      <span>{t.backCta}</span>
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => closeModal(false)}
                      disabled={isSubmitting}
                      className={
                        allRatingsComplete
                          ? "col-start-1 row-start-2 justify-self-start sm:mr-auto"
                          : undefined
                      }
                    >
                      {t.inviteLaterCta}
                    </Button>
                  )}

                  {step === 0 && allRatingsComplete ? (
                    <Button
                      key="quick-submit-ratings"
                      type="button"
                      variant="outline"
                      disabled={isSubmitting}
                      aria-busy={isSubmitting}
                      onClick={handleQuickSubmitRatings}
                      className="col-span-2 row-start-1 w-full sm:w-auto"
                    >
                      {isSubmitting ? (
                        <SubmittingSpinner />
                      ) : (
                        <CheckIcon className="h-4 w-4 text-sapphire dark:text-sapphire-border" />
                      )}
                      <span>{isSubmitting ? t.submitting : t.sendRatingsNowCta}</span>
                    </Button>
                  ) : null}

                  {step < 2 ? (
                    <Button
                      key="next-step"
                      type="button"
                      variant="action"
                      disabled={step === 0 && !allRatingsComplete}
                      onClick={(event) => {
                        event.preventDefault();
                        if (isSubmitting) return;
                        goNextStep();
                      }}
                      className={
                        step === 0 && allRatingsComplete
                          ? "col-start-2 row-start-2 justify-self-end"
                          : undefined
                      }
                    >
                      <span>{t.nextCta}</span>
                      {step === 0 && !allRatingsComplete ? (
                        <span className="tabular-nums text-meta font-semibold opacity-85">
                          {" "}({answeredRatingsCount}/{RATING_KEYS.length})
                        </span>
                      ) : null}
                    </Button>
                  ) : (
                    <Button
                      key="submit-feedback"
                      type="submit"
                      variant="action"
                      disabled={isSubmitting}
                      aria-busy={isSubmitting}
                    >
                      {isSubmitting ? <SubmittingSpinner /> : null}
                      <span>{isSubmitting ? t.submitting : t.submitCta}</span>
                    </Button>
                  )}
                </div>
              </fieldset>
            </form>
          )}
        </div>
      </dialog>
    </>
  );
}
