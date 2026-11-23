import { describe, expect, it } from "vitest";
import {
  computeFeedbackSummary,
  normalizeAgeGroup,
  scrubPersonalIdentifiers,
  validateFeedbackPayload,
} from "./platform-feedback-shared";
import {
  applyFeedbackDismissal,
  defaultFeedbackSchedule,
  evaluateSmartFeedbackPrompt,
  FEEDBACK_FOLLOWUP_SNOOZE_MS,
  FEEDBACK_INITIAL_PROMPT_MS,
  FEEDBACK_INTERACTION_RECHECK_MS,
  FEEDBACK_SCROLL_PAUSE_MS,
  isSmartFeedbackAllowedPath,
} from "@/components/layout/feedback-schedule";
import { feedbackWidgetCopy } from "@/lib/i18n/feedback-translations";
import type { Lang } from "@/lib/i18n/translations";

describe("platform feedback anonymization and validation", () => {
  it("redacts emails, phone numbers, 13-digit national IDs, URLs, and street addresses", () => {
    const openRes = scrubPersonalIdentifiers(
      "Sunați-mă la +40 745 123 456 sau pe ana.popescu@exemplu.ro, CNP 2900512123456, detalii pe https://exemplu.ro/profil",
      { maxLength: 2000 },
    );
    expect(openRes.redactions).toBe(4);
    expect(openRes.cleaned).not.toContain("745");
    expect(openRes.cleaned).not.toContain("ana.popescu");
    expect(openRes.cleaned).not.toContain("2900512123456");
    expect(openRes.cleaned).not.toContain("https://");

    const locRes = scrubPersonalIdentifiers("Cluj-Napoca, str. Memorandumului nr. 14, ap. 3", {
      maxLength: 120,
      stripStreetDetails: true,
    });
    expect(locRes.cleaned).toBe("Cluj-Napoca");
    expect(locRes.redactions).toBeGreaterThanOrEqual(2);
  });

  it("normalizes exact numeric ages into k-anonymous age groups", () => {
    expect(normalizeAgeGroup("16")).toBe("under_18");
    expect(normalizeAgeGroup(22)).toBe("18_24");
    expect(normalizeAgeGroup("31")).toBe("25_34");
    expect(normalizeAgeGroup("68")).toBe("65_plus");
    expect(normalizeAgeGroup("35_44")).toBe("35_44");
    expect(normalizeAgeGroup("invalid")).toBeNull();
  });

  it("validates 1-5 evaluation scores and strips query tokens from page paths", () => {
    const valid = validateFeedbackPayload(
      {
        lang: "ro",
        page_path: "https://redihealth.org/ro/patient-portal/secret-token-abc?foo=bar",
        rating_usefulness: 5,
        rating_ease_of_use: 4,
        rating_visual_design: 5,
        rating_content_clarity: 5,
        rating_future_use: 4,
        open_feedback: "Mi-ar plăcea programare directă la medicul de familie.",
        gender: "female",
        age_group: "29",
        locality: "Brașov",
        occupation: "Asistentă",
        marital_status: "married_or_partnered",
      },
      "RO",
    );

    expect(valid.ok).toBe(true);
    if (valid.ok) {
      expect(valid.data.age_group).toBe("25_34");
      expect(valid.data.page_path).toBe("/ro/patient-portal/[token]");
      expect(valid.data.anonymized_redactions).toBe(0);
    }

    const outOfRange = validateFeedbackPayload({
      rating_usefulness: 6,
      rating_ease_of_use: 4,
      rating_visual_design: 5,
      rating_content_clarity: 5,
      rating_future_use: 4,
    });
    expect(outOfRange.ok).toBe(false);
  });

  it("computes dimension averages, 1-5 distributions, and demographic shares accurately", () => {
    const summary = computeFeedbackSummary([
      {
        id: "1",
        country_code: "RO",
        lang: "ro",
        page_path: "/",
        rating_usefulness: 5,
        rating_ease_of_use: 4,
        rating_visual_design: 5,
        rating_content_clarity: 4,
        rating_future_use: 5,
        average_rating: 4.6,
        open_feedback: "Foarte util",
        gender: "female",
        age_group: "25_34",
        locality: "Iași",
        occupation: "Medic",
        marital_status: "single",
        anonymized_redactions: 0,
        created_at: "2026-11-11T10:00:00Z",
      },
      {
        id: "2",
        country_code: "RO",
        lang: "ro",
        page_path: "/about",
        rating_usefulness: 3,
        rating_ease_of_use: 4,
        rating_visual_design: 5,
        rating_content_clarity: 4,
        rating_future_use: 3,
        average_rating: 3.8,
        open_feedback: null,
        gender: "male",
        age_group: "25_34",
        locality: "Iași",
        occupation: "Inginer",
        marital_status: "married_or_partnered",
        anonymized_redactions: 1,
        created_at: "2026-11-11T11:00:00Z",
      },
    ]);

    expect(summary.totalResponses).toBe(2);
    expect(summary.overallAverage).toBe(4.2);
    expect(summary.withOpenFeedbackCount).toBe(1);
    expect(summary.anonymizedCount).toBe(1);
    expect(summary.dimensions[0].average).toBe(4);
    expect(summary.dimensions[0].distribution).toEqual([0, 0, 1, 0, 1]);
    expect(summary.demographics.topLocalities[0]).toEqual({ key: "Iași", count: 2, sharePct: 100 });
  });

  it("opens the feedback form after 30s, snoozes for 2 minutes after 1st discard, and returns with a different lead", () => {
    const t0 = 1_700_000_000_000;
    const baseOpts = { allowedPath: true, pageSettled: true, blockedByUi: false };

    // Before 30s -> do not show
    const before30s = { ...defaultFeedbackSchedule(t0), activeMs: FEEDBACK_INITIAL_PROMPT_MS - 1 };
    expect(evaluateSmartFeedbackPrompt(before30s, t0 + 29_999, baseOpts)).toEqual({
      show: false,
      shouldOpen: false,
      variant: "initial",
      reason: "insufficient_active_time",
      nextCheckMs: 1,
    });

    // At 30s -> show initial lead
    const at30s = { ...defaultFeedbackSchedule(t0), activeMs: FEEDBACK_INITIAL_PROMPT_MS };
    expect(evaluateSmartFeedbackPrompt(at30s, t0 + 30_000, baseOpts)).toEqual({
      show: true,
      shouldOpen: true,
      variant: "initial",
      reason: "ready",
      nextCheckMs: null,
    });

    // Blocked when another modal/menu/floating prompt is open or on excluded routes
    expect(
      evaluateSmartFeedbackPrompt(at30s, t0 + 30_000, { ...baseOpts, blockedByUi: true }).show,
    ).toBe(false);
    expect(isSmartFeedbackAllowedPath("/")).toBe(true);
    expect(isSmartFeedbackAllowedPath("/health-check")).toBe(true);
    expect(isSmartFeedbackAllowedPath("/ai-assistant")).toBe(true);
    expect(isSmartFeedbackAllowedPath("/panel/analytics")).toBe(false);
    expect(isSmartFeedbackAllowedPath("/patient-portal/abc")).toBe(false);
    expect(isSmartFeedbackAllowedPath("/medic-online/meet/123")).toBe(false);

    // 1st discard -> snoozes for 2 minutes
    const afterFirstDiscard = applyFeedbackDismissal(at30s, t0 + 35_000);
    expect(afterFirstDiscard.dismissCount).toBe(1);
    expect(afterFirstDiscard.snoozedUntil).toBe(t0 + 35_000 + FEEDBACK_FOLLOWUP_SNOOZE_MS);

    // Still snoozed at 1m59s after discard
    expect(
      evaluateSmartFeedbackPrompt(afterFirstDiscard, t0 + 35_000 + FEEDBACK_FOLLOWUP_SNOOZE_MS - 1, baseOpts),
    ).toEqual({
      show: false,
      shouldOpen: false,
      variant: "followup",
      reason: "snoozed",
      nextCheckMs: 1,
    });

    // Returns at +2 minutes with the different "followup" lead
    expect(
      evaluateSmartFeedbackPrompt(afterFirstDiscard, t0 + 35_000 + FEEDBACK_FOLLOWUP_SNOOZE_MS, baseOpts),
    ).toEqual({
      show: true,
      shouldOpen: true,
      variant: "followup",
      reason: "ready",
      nextCheckMs: null,
    });

    // 2nd discard -> backs off to 24 hours
    const afterSecondDiscard = applyFeedbackDismissal(
      afterFirstDiscard,
      t0 + 35_000 + FEEDBACK_FOLLOWUP_SNOOZE_MS + 1_000,
    );
    expect(afterSecondDiscard.dismissCount).toBe(2);
    expect(
      evaluateSmartFeedbackPrompt(
        afterSecondDiscard,
        t0 + 35_000 + FEEDBACK_FOLLOWUP_SNOOZE_MS + 10 * 60 * 1000,
        baseOpts,
      ).show,
    ).toBe(false);

    // Once submitted -> never auto-opens again
    expect(
      evaluateSmartFeedbackPrompt({ ...at30s, submitted: true }, t0 + 500_000, baseOpts).show,
    ).toBe(false);
  });

  it("defers auto-opening while typing or scrolling and opens calmly once the user pauses", () => {
    const t0 = 1_700_000_000_000;
    const baseOpts = { allowedPath: true, pageSettled: true, blockedByUi: false };
    const at30s = { ...defaultFeedbackSchedule(t0), activeMs: FEEDBACK_INITIAL_PROMPT_MS };

    // Actively typing in an input/textarea/select/contenteditable -> defer
    const whileTyping = evaluateSmartFeedbackPrompt(at30s, t0 + 30_000, {
      ...baseOpts,
      userInteracting: true,
    });
    expect(whileTyping).toEqual({
      show: false,
      shouldOpen: false,
      variant: "initial",
      reason: "user_interacting",
      nextCheckMs: FEEDBACK_INTERACTION_RECHECK_MS,
    });

    // Once typing stops -> opens cleanly
    const afterTyping = evaluateSmartFeedbackPrompt(at30s, t0 + 31_000, {
      ...baseOpts,
      userInteracting: false,
    });
    expect(afterTyping).toEqual({
      show: true,
      shouldOpen: true,
      variant: "initial",
      reason: "ready",
      nextCheckMs: null,
    });

    // Mid-scroll (within 1800ms of last scroll) -> defer with exact remaining pause
    const scrollAt = t0 + 29_500;
    const whileScrolling = evaluateSmartFeedbackPrompt(at30s, t0 + 30_000, {
      ...baseOpts,
      userInteracting: false,
      lastScrollAt: scrollAt,
    });
    expect(whileScrolling).toEqual({
      show: false,
      shouldOpen: false,
      variant: "initial",
      reason: "user_interacting",
      nextCheckMs: FEEDBACK_SCROLL_PAUSE_MS - 500,
    });

    // Still scrolling 1ms before 1800ms pause completes
    expect(
      evaluateSmartFeedbackPrompt(at30s, scrollAt + FEEDBACK_SCROLL_PAUSE_MS - 1, {
        ...baseOpts,
        userInteracting: false,
        lastScrollAt: scrollAt,
      }),
    ).toEqual({
      show: false,
      shouldOpen: false,
      variant: "initial",
      reason: "user_interacting",
      nextCheckMs: 1,
    });

    // Scroll pause elapsed (>= 1800ms) -> opens cleanly
    expect(
      evaluateSmartFeedbackPrompt(at30s, scrollAt + FEEDBACK_SCROLL_PAUSE_MS, {
        ...baseOpts,
        userInteracting: false,
        lastScrollAt: scrollAt,
      }),
    ).toEqual({
      show: true,
      shouldOpen: true,
      variant: "initial",
      reason: "ready",
      nextCheckMs: null,
    });

    // Same pause guard applies on the +2m followup prompt
    const afterFirstDiscard = applyFeedbackDismissal(at30s, t0 + 35_000);
    const followupReadyAt = t0 + 35_000 + FEEDBACK_FOLLOWUP_SNOOZE_MS;
    expect(
      evaluateSmartFeedbackPrompt(afterFirstDiscard, followupReadyAt, {
        ...baseOpts,
        lastScrollAt: followupReadyAt - 300,
      }),
    ).toEqual({
      show: false,
      shouldOpen: false,
      variant: "followup",
      reason: "user_interacting",
      nextCheckMs: FEEDBACK_SCROLL_PAUSE_MS - 300,
    });
    expect(
      evaluateSmartFeedbackPrompt(afterFirstDiscard, followupReadyAt + FEEDBACK_SCROLL_PAUSE_MS, {
        ...baseOpts,
        lastScrollAt: followupReadyAt - 300,
      }),
    ).toEqual({
      show: true,
      shouldOpen: true,
      variant: "followup",
      reason: "ready",
      nextCheckMs: null,
    });
  });

  it("provides distinct sentence-case, ampersand-free initial, follow-up, and Step 1 quick-submit copy across all 7 languages", () => {
    const langs: Lang[] = ["ro", "en", "sq", "it", "hr", "rom", "ru"];
    for (const lang of langs) {
      const copy = feedbackWidgetCopy[lang];
      expect(copy.inviteReturnTitle.trim()).not.toBe("");
      expect(copy.inviteReturnBody.trim()).not.toBe("");
      expect(copy.sendRatingsNowCta.trim()).not.toBe("");
      expect(copy.inviteReturnTitle).not.toBe(copy.inviteTitle);
      expect(copy.inviteReturnBody).not.toBe(copy.inviteBody);

      // Strict sentence case check on sendRatingsNowCta (first letter uppercase, subsequent words lowercase, no ALL CAPS)
      const ctaWords = copy.sendRatingsNowCta.trim().split(/\s+/);
      expect(/^\p{Lu}/u.test(ctaWords[0]), `${lang}.sendRatingsNowCta starts uppercase`).toBe(true);
      expect(/\b\p{Lu}{2,}\b/u.test(copy.sendRatingsNowCta), `${lang}.sendRatingsNowCta has no ALL CAPS`).toBe(false);
      for (const word of ctaWords.slice(1)) {
        expect(/^\p{Lu}/u.test(word), `${lang}.sendRatingsNowCta is sentence case ("${word}")`).toBe(false);
      }

      for (const value of [
        copy.inviteTitle,
        copy.inviteBody,
        copy.inviteReturnTitle,
        copy.inviteReturnBody,
        copy.sendRatingsNowCta,
        copy.nextExploreHeading,
        copy.nextExploreSymptoms,
        copy.nextExploreAssistant,
        copy.nextExploreGuides,
      ]) {
        expect(value, `${lang} contains &`).not.toContain("&");
        expect(/^\p{Lu}/u.test(value), `${lang} starts uppercase: ${value}`).toBe(true);
      }
    }
  });
});
