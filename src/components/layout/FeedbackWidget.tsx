"use client";

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
import styles from "@/components/layout/ChromeDialogs.module.css";
import { captchaErrorMessage, useRecaptcha } from "@/components/security/RecaptchaProvider";
import { Button } from "@/components/ui/Button";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CloseIcon,
  MessageDotsIcon,
} from "@/components/ui/icons";
import { feedbackWidgetCopy, type FeedbackWidgetCopy } from "@/lib/i18n/feedback-translations";
import { useLanguage } from "@/lib/i18n/language-context";
import { getOfflineUiCopy } from "@/lib/i18n/offline-copy";
import { stripLangFromPathname } from "@/lib/i18n/routing";
import { isBrowserOffline } from "@/lib/pwa/use-online-status";
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

/** Wait 45 seconds of active browsing so visitors can explore the platform first, then gently invite feedback. */
const INITIAL_EXPLORE_MS = 45_000;
/** Allow earlier invite (after 20 seconds) when a reader finishes scrolling a health guide or article. */
const READ_COMPLETE_MIN_MS = 20_000;
/** Never show the floating invite in the first 10 seconds after a page load or route transition. */
const PAGE_SETTLE_GRACE_MS = 10_000;
/** Heartbeat interval while the tab is visible. */
const HEARTBEAT_INTERVAL_MS = 4_000;
/** Treat a return after 6+ hours away as a fresh browsing session. */
const VISIT_RESET_IDLE_MS = 6 * 60 * 60 * 1000;
/** Snooze intervals when the visitor taps "Later" or closes the invite/modal: "Later" never means minutes. */
const SNOOZE_STEPS_MS = [
  24 * 60 * 60 * 1000, // 1st close: ask again no sooner than tomorrow
  7 * 24 * 60 * 60 * 1000, // 2nd close: a week
  30 * 24 * 60 * 60 * 1000, // 3rd+ close: a month (the menu and footer links stay)
] as const;

const SCHEDULE_STORAGE_KEY = "redihealth:feedback-schedule:v2";
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

const AUTO_INVITE_PATHS = new Set([
  "/",
  "/health-information",
  "/stiri",
  "/find-help",
  "/medic-online",
  "/mediatori",
  "/about",
  "/get-help",
]);

function isReadingDetailPath(barePath: string): boolean {
  return (
    (barePath.startsWith("/health-information/") && barePath !== "/health-information") ||
    (barePath.startsWith("/stiri/") && barePath !== "/stiri")
  );
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
  return AUTO_INVITE_PATHS.has(barePath) || isReadingDetailPath(barePath);
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
  const bodyScrollerRef = useRef<HTMLDivElement>(null);
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
  const [inviteDrag, setInviteDrag] = useState({ x: 0, y: 0 });
  const [inviteDragging, setInviteDragging] = useState(false);

  const edgeDragRef = useRef<{
    pointerId: number;
    startX: number;
    startTime: number;
    maxAbsDx: number;
    captured: boolean;
  } | null>(null);
  const inviteDragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    startTime: number;
    maxDist: number;
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

  // Reset settle grace on route navigation and hide any open invite card on disallowed surfaces
  useEffect(() => {
    pageMountedAtRef.current = Date.now();
    if (!isAutoInviteAllowedPath(barePath)) {
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
    setInviteDragging(false);
    setInviteDrag({ x: 0, y: 0 });
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

  const dismissEdgeTrigger = useCallback(() => {
    try {
      window.localStorage.setItem(EDGE_DISMISSED_KEY, String(Date.now() + EDGE_DISMISS_MS));
    } catch {
      // Ignore storage errors: the tab still hides for this page view
    }
    snoozeInvite();
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
  }, [reducedMotion, snoozeInvite]);

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

  const handleInvitePointerDown = useCallback((event: ReactPointerEvent<HTMLElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    inviteDragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startTime: performance.now(),
      maxDist: 0,
      captured: false,
    };
  }, []);

  const handleInvitePointerMove = useCallback((event: ReactPointerEvent<HTMLElement>) => {
    const drag = inviteDragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const dx = Math.max(0, event.clientX - drag.startX);
    const dy = Math.max(0, event.clientY - drag.startY);
    drag.maxDist = Math.max(drag.maxDist, dx, dy);
    if (drag.maxDist > 8) {
      if (!drag.captured) {
        drag.captured = true;
        try {
          event.currentTarget.setPointerCapture(event.pointerId);
        } catch {
          // Ignore pointer capture errors
        }
      }
      setInviteDragging(true);
      setInviteDrag({ x: Math.min(dx, 160), y: Math.min(dy, 120) });
    }
  }, []);

  const handleInvitePointerEnd = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      const drag = inviteDragRef.current;
      if (!drag || drag.pointerId !== event.pointerId) return;
      inviteDragRef.current = null;
      if (drag.captured) {
        try {
          event.currentTarget.releasePointerCapture(event.pointerId);
        } catch {
          // Ignore release errors
        }
      }
      setInviteDragging(false);
      const dx = event.clientX - drag.startX;
      const dy = event.clientY - drag.startY;
      const elapsed = Math.max(1, performance.now() - drag.startTime);
      const vx = dx / elapsed;
      const vy = dy / elapsed;

      if (
        event.type !== "pointercancel" &&
        (dx >= 48 || dy >= 48 || vx >= 0.35 || vy >= 0.35)
      ) {
        snoozeInvite();
      } else {
        setInviteDrag({ x: 0, y: 0 });
      }
    },
    [snoozeInvite],
  );

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

    if (consumePendingFeedbackOpen()) {
      queueMicrotask(() => {
        setSubmitted(false);
        openModal();
      });
    } else {
      try {
        const params = new URLSearchParams(window.location.search);
        if (params.get("feedback") === "1") {
          queueMicrotask(() => openModal());
        }
      } catch {
        // Ignore malformed URL edge cases
      }
    }

    return () => window.removeEventListener(OPEN_FEEDBACK_EVENT, handleCustomOpen);
  }, [openModal]);

  // Active browsing timer (45s general exploration or 20s + reading completion, plus progressive snooze)
  useEffect(() => {
    if (modalOpen || submitted || isConsultationOrPortal || isClinicalTaskSurface) {
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
      if (!isAutoInviteAllowedPath(barePath)) return;
      if (now - pageMountedAtRef.current < PAGE_SETTLE_GRACE_MS) return;
      if (schedule.snoozedUntil > now) return;

      const isPhoneAtHeroTop =
        window.matchMedia("(max-width: 639px)").matches &&
        barePath === "/" &&
        window.scrollY < 160;
      if (isPhoneAtHeroTop) return;

      const reachedReadingCompletion =
        isReadingDetailPath(barePath) &&
        nextActiveMs >= READ_COMPLETE_MIN_MS &&
        hasReachedGuideEnd();
      if (nextActiveMs < INITIAL_EXPLORE_MS && !reachedReadingCompletion) return;

      if (document.querySelector(INVITE_BLOCKERS)) {
        return;
      }

      setInviteVisible(true);
    };

    const intervalId = window.setInterval(evaluateAndTick, HEARTBEAT_INTERVAL_MS);
    const settleTimerId = window.setTimeout(evaluateAndTick, PAGE_SETTLE_GRACE_MS + 250);
    window.addEventListener("scroll", evaluateAndTick, { passive: true });

    return () => {
      window.clearInterval(intervalId);
      window.clearTimeout(settleTimerId);
      window.removeEventListener("scroll", evaluateAndTick);
    };
  }, [modalOpen, submitted, isConsultationOrPortal, isClinicalTaskSurface, barePath, pathname]);

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
    if (isBrowserOffline()) {
      setError(getOfflineUiCopy(lang).formOfflineError);
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
    "min-h-11 w-full rounded-(--radius-control) border border-border-control bg-background px-3.5 py-2 text-body text-foreground placeholder:text-muted-foreground/80 field-focus";

  return (
    <>
      {!isConsultationOrPortal &&
      !isClinicalTaskSurface &&
      !inviteVisible &&
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

      {/* Calm, non-disruptive floating invitation card after 45 seconds of active browsing (or 20s after reading an article) */}
      <AnimatePresence>
        {inviteVisible && !modalOpen ? (
          <m.aside
            role="region"
            aria-label={t.inviteOpenCta}
            onPointerDown={handleInvitePointerDown}
            onPointerMove={handleInvitePointerMove}
            onPointerUp={handleInvitePointerEnd}
            onPointerCancel={handleInvitePointerEnd}
            initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
            animate={{
              opacity:
                inviteDrag.x > 0 || inviteDrag.y > 0
                  ? Math.max(0.35, 1 - Math.max(inviteDrag.x, inviteDrag.y) / 140)
                  : 1,
              x: inviteDrag.x,
              y: inviteDrag.y,
            }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
            transition={
              reducedMotion || inviteDragging ? { duration: 0 } : CLINICAL_SETTLE_SPRING
            }
            className="feedback-invite-card fixed inset-x-3 bottom-[calc(0.75rem+env(safe-area-inset-bottom))] z-30 mx-auto max-w-md overflow-hidden rounded-(--radius-surface) border border-border bg-card text-foreground shadow-[0_20px_48px_-14px_rgba(15,23,42,0.34)] touch-pan-y sm:inset-x-auto sm:right-4 sm:bottom-4 sm:mx-0 sm:w-[22rem] dark:border-white/14 dark:bg-ink-950 dark:text-paper"
          >
            <div className="p-4">
              <div className="flex items-start justify-between gap-2.5">
                <div className="min-w-0">
                  <h2 className="text-body font-semibold leading-snug text-balance text-foreground dark:text-paper">
                    {t.inviteTitle}
                  </h2>
                  <p className="mt-1 text-meta leading-relaxed text-muted-foreground dark:text-mist">
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
              <div className="mt-3.5">
                <p className="text-body font-medium text-foreground dark:text-paper">
                  {t.inviteQuickScaleHint}
                </p>
                <div
                  className="mt-2 grid grid-cols-5 gap-1.5"
                  role="group"
                  aria-label={t.questions.rating_usefulness.question}
                >
                  {[1, 2, 3, 4, 5].map((score, idx) => (
                    <button
                      key={score}
                      type="button"
                      onClick={() => openModal(score)}
                      aria-label={t.scaleValueLabels[idx]}
                      className="press-solid flex min-h-11 items-center justify-center rounded-lg border border-border-control/80 bg-card text-body font-semibold tabular-nums text-foreground transition-colors duration-(--dur-fast) motion-reduce:transition-none hover:border-sapphire hover:bg-sapphire hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:border-white/15 dark:bg-ink-800 dark:text-paper"
                    >
                      {score}
                    </button>
                  ))}
                </div>
                <div className="mt-1.5 flex items-center justify-between gap-2 text-meta text-muted-foreground dark:text-mist">
                  <span>{t.scaleLow}</span>
                  <span>{t.scaleHigh}</span>
                </div>
              </div>

              <div className="mt-3 -mb-1 flex flex-wrap items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={snoozeInvite}
                  className="inline-flex min-h-11 items-center rounded-lg px-2.5 text-body font-medium whitespace-nowrap text-muted-foreground transition-colors duration-(--dur-fast) motion-reduce:transition-none hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {t.inviteLaterCta}
                </button>
                <Button type="button" variant="action" size="md" onClick={() => openModal()}>
                  <span>{t.inviteOpenCta}</span>
                  <ArrowRightIcon className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </m.aside>
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
        <div className="flex h-[min(45rem,92dvh)] flex-col overflow-hidden rounded-t-2xl bg-card shadow-[0_24px_64px_-16px_rgba(11,19,43,0.34)] sm:h-[min(42rem,90dvh)] sm:rounded-2xl">
          {/* Modal Header */}
          <div className="border-b border-border bg-surface-subtle/65 px-4 pt-3.5 pb-3 sm:px-6 sm:pt-5 sm:pb-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 id={titleId} className="text-title font-bold leading-snug text-foreground">
                  {submitted ? t.thankYouTitle : t.modalTitle}
                </h2>
                <p
                  id={subtitleId}
                  className="mt-0.5 text-meta leading-snug text-muted-foreground sm:mt-1 sm:text-body"
                >
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
                        disabled={lockedByMandatoryRatings}
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
                className="flex-1 overflow-y-auto overscroll-contain px-4 pt-3 pb-4 sm:px-6 sm:py-5"
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
                        <div className="sticky top-0 z-10 -mx-4 -mt-3 mb-1 bg-card px-4 pt-2.5 pb-1.5 sm:-mx-6 sm:-mt-5 sm:px-6 sm:pt-3.5 sm:pb-2">
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
                                          const nextRatings = { ...ratings, [key]: value };
                                          const nextComplete = RATING_KEYS.every(
                                            (k) => nextRatings[k] !== null,
                                          );
                                          setRatings(nextRatings);
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
              <div className="flex items-center justify-between gap-3 border-t border-border bg-surface-subtle/50 px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] sm:px-6 sm:py-4 sm:pb-4">
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
                    disabled={step === 0 && !allRatingsComplete}
                    onClick={(event) => {
                      event.preventDefault();
                      goNextStep();
                    }}
                  >
                    <span>{t.nextCta}</span>
                    {step === 0 && !allRatingsComplete ? (
                      <span className="tabular-nums text-meta font-semibold opacity-85">
                        {" "}({answeredRatingsCount}/{RATING_KEYS.length})
                      </span>
                    ) : (
                      <ArrowRightIcon className="h-4 w-4" />
                    )}
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
