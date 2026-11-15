import type { Lang } from "@/lib/i18n/languages";

export const OPEN_FEEDBACK_EVENT = "redi:feedback-open";
export const OPEN_REPORT_ISSUE_EVENT = "redi:report-issue-open";
export const MOUNT_CHROME_WIDGETS_EVENT = "redi:mount-chrome-widgets";

let chromeWidgetsAvailable = false;
let pendingFeedbackOpen = false;
let pendingReportIssueOpen = false;

export function setChromeWidgetsAvailable(available: boolean): void {
  chromeWidgetsAvailable = available;
  if (!available) {
    pendingFeedbackOpen = false;
    pendingReportIssueOpen = false;
  }
}

export function consumePendingFeedbackOpen(): boolean {
  const pending = pendingFeedbackOpen;
  pendingFeedbackOpen = false;
  return pending;
}

export function consumePendingReportIssueOpen(): boolean {
  const pending = pendingReportIssueOpen;
  pendingReportIssueOpen = false;
  return pending;
}

/**
 * Opens the dedicated feedback modal from anywhere on the website (such as the footer link).
 * Returns false if the widget is not mounted on the current chromeless surface.
 */
export function openSiteFeedback(): boolean {
  if (typeof window === "undefined") return false;
  const event = new Event(OPEN_FEEDBACK_EVENT, { cancelable: true });
  if (!window.dispatchEvent(event)) {
    return true;
  }
  if (!chromeWidgetsAvailable) {
    return false;
  }
  pendingFeedbackOpen = true;
  window.dispatchEvent(new Event(MOUNT_CHROME_WIDGETS_EVENT));
  return true;
}

/**
 * Opens the report form from anywhere in the chrome (the footer link on phones and tablets,
 * where the floating button is hidden so it never sits on page text or a bottom action bar).
 * Returns false when the widget is not mounted, so the caller can fall back to its link.
 */
export function openReportIssue(): boolean {
  if (typeof window === "undefined") return false;
  const event = new Event(OPEN_REPORT_ISSUE_EVENT, { cancelable: true });
  if (!window.dispatchEvent(event)) {
    return true;
  }
  if (!chromeWidgetsAvailable) {
    return false;
  }
  pendingReportIssueOpen = true;
  window.dispatchEvent(new Event(MOUNT_CHROME_WIDGETS_EVENT));
  return true;
}

export const feedbackTriggerCopy: Record<
  Lang,
  { compactTriggerLabel: string; footerLink: string; mobileDrawerSub: string }
> = {
  ru: {
    compactTriggerLabel: "Отзыв",
    footerLink: "Оставить отзыв",
    mobileDrawerSub: "Анонимно, занимает около минуты",
  },
  ro: {
    compactTriggerLabel: "Feedback",
    footerLink: "Lasă feedback",
    mobileDrawerSub: "Anonim, durează aproximativ un minut",
  },
  en: {
    compactTriggerLabel: "Feedback",
    footerLink: "Leave feedback",
    mobileDrawerSub: "Anonymous, takes about a minute",
  },
  sq: {
    compactTriggerLabel: "Përshtypje",
    footerLink: "Lër përshtypje",
    mobileDrawerSub: "Anonime, zgjat rreth një minutë",
  },
  it: {
    compactTriggerLabel: "Parere",
    footerLink: "Lascia un parere",
    mobileDrawerSub: "Anonimo, richiede circa un minuto",
  },
  hr: {
    compactTriggerLabel: "Povratna info",
    footerLink: "Ostavi povratnu informaciju",
    mobileDrawerSub: "Anonimno, traje oko minutu",
  },
  rom: {
    compactTriggerLabel: "Feedback",
    footerLink: "Mekh feedback",
    mobileDrawerSub: "Anonimno, lel karing jekh minuta",
  },
};

export const reportIssueTriggerCopy: Record<Lang, { trigger: string }> = {
  ru: { trigger: "Сообщить о проблеме" },
  en: { trigger: "Report a problem" },
  ro: { trigger: "Raportează o problemă" },
  sq: { trigger: "Raporto një problem" },
  it: { trigger: "Segnala un problema" },
  hr: { trigger: "Prijavi problem" },
  rom: { trigger: "Phen jekh problema" },
};
