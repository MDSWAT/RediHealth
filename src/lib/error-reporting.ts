import { AsyncLocalStorage } from "node:async_hooks";
import { createHash } from "node:crypto";
import { after } from "next/server";

/**
 * Sends every error the website hits to the alert addresses set in the panel (Settings).
 *
 * Three sources feed it: errors Next.js catches while handling a request, anything the server
 * writes with console.error, and errors reported by visitors' browsers. The same error is emailed
 * once per cooldown window, and there is an hourly ceiling, so a fault that repeats on every
 * request produces one message instead of thousands.
 */

export type ErrorReport = {
  source: "server" | "server-log" | "browser";
  message: string;
  stack?: string;
  /** Route or page the error belongs to. */
  where?: string;
  details?: Record<string, unknown>;
};

const SAME_ERROR_COOLDOWN_MS = 15 * 60_000;
const MAX_ERROR_EMAILS_PER_HOUR = 40;
const MAX_TRACKED_ERRORS = 500;

// True while a report is being sent, so failures of the alert pipeline itself are never re-reported.
const sending = new AsyncLocalStorage<boolean>();
const lastSentAt = new Map<string, number>();

export function isErrorReportingEnabled(): boolean {
  const setting = process.env.ERROR_ALERTS_ENABLED?.trim();
  if (setting === "true") return true;
  if (setting === "false") return false;
  return process.env.NODE_ENV === "production";
}

/** Error text can quote the data that caused it; mask what identifies a person before emailing it. */
export function redactErrorText(value: string): string {
  return value
    .replace(/[^\s@"'<>()]+@[^\s@"'<>()]+\.[^\s@"'<>()]+/g, "[email]")
    .replace(/(\/patient-portal\/)[A-Za-z0-9_-]{16,}/g, "$1[token]")
    .replace(/\+?\d[\d\s-]{7,}\d/g, "[number]");
}

/** Identical errors share a key even when ids, counts or timestamps inside the message differ. */
export function errorKey(message: string): string {
  const normalized = message
    .toLowerCase()
    .replace(/^[^a-z]+/, "")
    .replace(/[0-9a-f]{8,}/g, "#")
    .replace(/\d+/g, "#")
    .replace(/\s+/g, " ")
    .slice(0, 160);
  return createHash("sha256").update(normalized).digest("hex").slice(0, 24);
}

function recentlySent(key: string, now: number): boolean {
  const previous = lastSentAt.get(key);
  if (previous !== undefined && now - previous < SAME_ERROR_COOLDOWN_MS) return true;

  if (lastSentAt.size >= MAX_TRACKED_ERRORS) {
    for (const [trackedKey, sentAt] of lastSentAt) {
      if (now - sentAt >= SAME_ERROR_COOLDOWN_MS || lastSentAt.size >= MAX_TRACKED_ERRORS) lastSentAt.delete(trackedKey);
    }
  }
  lastSentAt.set(key, now);
  return false;
}

const SOURCE_LABEL: Record<ErrorReport["source"], string> = {
  server: "Server error",
  "server-log": "Server error (logged)",
  browser: "Browser error",
};

/** Emails one error to the alert addresses. Returns false when it was skipped or could not be sent. */
export async function reportError(report: ErrorReport): Promise<boolean> {
  if (sending.getStore() || !isErrorReportingEnabled()) return false;

  const message = redactErrorText(report.message).trim().slice(0, 2000);
  if (!message) return false;

  const key = errorKey(message);
  if (recentlySent(key, Date.now())) return false;

  return sending.run(true, async () => {
    try {
      const { notifyOperationalIssue } = await import("@/lib/operational-alerts");
      const firstLine = message.split("\n")[0].slice(0, 90);
      return await notifyOperationalIssue({
        key: `error:${key}`,
        title: `${SOURCE_LABEL[report.source]}: ${firstLine}`,
        summary: message,
        source: report.where || report.source,
        severity: report.source === "browser" ? "warning" : "critical",
        details: {
          ...report.details,
          stack: report.stack ? redactErrorText(report.stack).slice(0, 3000) : undefined,
        },
        cooldownMs: SAME_ERROR_COOLDOWN_MS,
        hourlyCap: { key: "errors", limit: MAX_ERROR_EMAILS_PER_HOUR },
      });
    } catch {
      // Reporting must never break the request that hit the error.
      return false;
    }
  });
}

function describeLogValue(value: unknown): string {
  if (typeof value === "string") return value;
  if (value instanceof Error) return `${value.name}: ${value.message}`;
  if (value === undefined || value === null) return "";
  try {
    return JSON.stringify(value)?.slice(0, 400) ?? "";
  } catch {
    return String(value).slice(0, 400);
  }
}

type GlobalWithErrorReporting = typeof globalThis & { redihealthConsoleErrorReporting?: boolean };

/**
 * Makes every server-side console.error also reach the alert addresses. Most failures in this
 * codebase are caught and logged that way (a failed query, an email that could not be sent), so
 * without this they would only ever appear in the hosting logs.
 */
export function installConsoleErrorReporting(): void {
  const scope = globalThis as GlobalWithErrorReporting;
  if (scope.redihealthConsoleErrorReporting || !isErrorReportingEnabled()) return;
  scope.redihealthConsoleErrorReporting = true;

  const original = console.error.bind(console);
  console.error = (...args: unknown[]) => {
    original(...args);
    try {
      if (sending.getStore()) return;
      const error = args.find((arg): arg is Error => arg instanceof Error);
      const message = args.map(describeLogValue).filter(Boolean).join(" ");
      if (!message) return;

      const send = () => reportError({ source: "server-log", message, stack: error?.stack });
      try {
        // Inside a request, keep the server alive until the email has gone out.
        after(send);
      } catch {
        // Outside a request (startup, background work) there is nothing to wait for.
        void send();
      }
    } catch {
      // Logging must never throw.
    }
  };
}
