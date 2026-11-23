/**
 * Pure scheduling rules for the RediHealth smart feedback popup:
 * - First prompt after 30 seconds of active browsing on the platform (initial message).
 * - If discarded once, returns after 2 more minutes with a different, warmer follow-up message.
 * - If discarded a second time, backs off to 24 hours (then 7 days) so visitors are never nagged.
 * - Never auto-prompts again once submitted.
 */

export const FEEDBACK_INITIAL_PROMPT_MS = 30_000;
export const FEEDBACK_FOLLOWUP_SNOOZE_MS = 2 * 60 * 1000;
export const FEEDBACK_PAGE_SETTLE_GRACE_MS = 2_000;
export const FEEDBACK_SCROLL_PAUSE_MS = 1_800;
export const FEEDBACK_INTERACTION_RECHECK_MS = 1_000;
export const FEEDBACK_VISIT_RESET_IDLE_MS = 6 * 60 * 60 * 1000;

export const FEEDBACK_SNOOZE_STEPS_MS = [
  FEEDBACK_FOLLOWUP_SNOOZE_MS, // 1st discard: return after 2 minutes with a warmer follow-up message
  24 * 60 * 60 * 1000, // 2nd discard: wait 24 hours
  7 * 24 * 60 * 60 * 1000, // 3rd+ discard: wait 7 days (footer & menu links stay available)
] as const;

export type FeedbackPromptVariant = "initial" | "followup";

export type StoredFeedbackSchedule = {
  activeMs: number;
  lastSeenAt: number;
  snoozedUntil: number;
  dismissCount: number;
  submitted: boolean;
};

const EXCLUDED_AUTO_PROMPT_PREFIXES = [
  "/medic-online/meet",
  "/patient-portal",
  "/contul-meu",
  "/sign-in",
  "/panel",
  "/offline",
  "/health-check/note",
];

export function isSmartFeedbackAllowedPath(barePath: string): boolean {
  if (!barePath) return false;
  return !EXCLUDED_AUTO_PROMPT_PREFIXES.some(
    (prefix) => barePath === prefix || barePath.startsWith(`${prefix}/`),
  );
}

export function defaultFeedbackSchedule(now: number): StoredFeedbackSchedule {
  return {
    activeMs: 0,
    lastSeenAt: now,
    snoozedUntil: 0,
    dismissCount: 0,
    submitted: false,
  };
}

export function computeNextFeedbackSnoozeMs(dismissCount: number): number {
  const idx = Math.min(Math.max(0, dismissCount), FEEDBACK_SNOOZE_STEPS_MS.length - 1);
  return FEEDBACK_SNOOZE_STEPS_MS[idx];
}

export function applyFeedbackDismissal(
  current: StoredFeedbackSchedule,
  now: number,
): StoredFeedbackSchedule {
  const snoozeDuration = computeNextFeedbackSnoozeMs(current.dismissCount);
  return {
    ...current,
    lastSeenAt: now,
    snoozedUntil: now + snoozeDuration,
    dismissCount: current.dismissCount + 1,
  };
}

export type FeedbackPromptSkipReason =
  | "submitted"
  | "excluded_path"
  | "page_settling"
  | "blocked_by_ui"
  | "snoozed"
  | "insufficient_active_time"
  | "user_interacting";

export type FeedbackPromptDecision = {
  show: boolean;
  shouldOpen: boolean;
  variant: FeedbackPromptVariant;
  reason: "ready" | FeedbackPromptSkipReason;
  nextCheckMs: number | null;
};

export function evaluateSmartFeedbackPrompt(
  schedule: StoredFeedbackSchedule,
  now: number,
  options: {
    allowedPath: boolean;
    pageSettled: boolean;
    blockedByUi: boolean;
    userInteracting?: boolean;
    lastScrollAt?: number | null;
  },
): FeedbackPromptDecision {
  const variant: FeedbackPromptVariant = schedule.dismissCount >= 1 ? "followup" : "initial";
  if (schedule.submitted) {
    return { show: false, shouldOpen: false, variant, reason: "submitted", nextCheckMs: null };
  }
  if (!options.allowedPath) {
    return { show: false, shouldOpen: false, variant, reason: "excluded_path", nextCheckMs: null };
  }
  if (!options.pageSettled) {
    return {
      show: false,
      shouldOpen: false,
      variant,
      reason: "page_settling",
      nextCheckMs: FEEDBACK_PAGE_SETTLE_GRACE_MS,
    };
  }
  if (options.blockedByUi) {
    return {
      show: false,
      shouldOpen: false,
      variant,
      reason: "blocked_by_ui",
      nextCheckMs: FEEDBACK_INTERACTION_RECHECK_MS,
    };
  }
  if (schedule.snoozedUntil > now) {
    return {
      show: false,
      shouldOpen: false,
      variant,
      reason: "snoozed",
      nextCheckMs: schedule.snoozedUntil - now,
    };
  }
  if (schedule.activeMs < FEEDBACK_INITIAL_PROMPT_MS) {
    return {
      show: false,
      shouldOpen: false,
      variant,
      reason: "insufficient_active_time",
      nextCheckMs: FEEDBACK_INITIAL_PROMPT_MS - schedule.activeMs,
    };
  }

  const scrollAgeMs =
    typeof options.lastScrollAt === "number" && options.lastScrollAt > 0
      ? Math.max(0, now - options.lastScrollAt)
      : null;
  const scrollingRecently = scrollAgeMs !== null && scrollAgeMs < FEEDBACK_SCROLL_PAUSE_MS;

  if (options.userInteracting || scrollingRecently) {
    const scrollRemainingMs = scrollingRecently
      ? Math.max(1, FEEDBACK_SCROLL_PAUSE_MS - scrollAgeMs)
      : 0;
    const nextCheckMs = options.userInteracting
      ? Math.max(FEEDBACK_INTERACTION_RECHECK_MS, scrollRemainingMs)
      : scrollRemainingMs;
    return {
      show: false,
      shouldOpen: false,
      variant,
      reason: "user_interacting",
      nextCheckMs,
    };
  }

  return { show: true, shouldOpen: true, variant, reason: "ready", nextCheckMs: null };
}
