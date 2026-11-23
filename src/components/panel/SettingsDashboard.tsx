"use client";

import { useState, type FormEvent } from "react";
import { AdminShell } from "@/components/panel/AdminShell";
import { useLanguage } from "@/lib/i18n/language-context";
import { settingsTranslations } from "@/lib/i18n/settings-translations";
import { isValidEmail } from "@/lib/text";

const MAX_ALERT_RECIPIENTS = 10;

type AlertRecipientSource = "panel" | "env" | "none";

type SettingsDashboardProps = {
  userEmail: string;
  userRole?: string;
  databaseAvailable: boolean;
  initialAlertEmails: string[];
  initialSource: AlertRecipientSource;
};

export function SettingsDashboard({
  userEmail,
  userRole,
  databaseAvailable,
  initialAlertEmails,
  initialSource,
}: SettingsDashboardProps) {
  const { lang } = useLanguage();
  const t = settingsTranslations[lang];
  // Always show at least one field; addresses from the server setting are not copied into the form.
  const [alertEmails, setAlertEmails] = useState<string[]>(
    initialSource === "panel" && initialAlertEmails.length > 0 ? initialAlertEmails : [""],
  );
  const [source, setSource] = useState<AlertRecipientSource>(initialSource);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  const sourceText = source === "panel" ? t.sourcePanel : source === "env" ? t.sourceEnv : t.sourceNone;

  async function save(event: FormEvent) {
    event.preventDefault();
    const values = [...new Set(alertEmails.map((email) => email.trim().toLowerCase()).filter(Boolean))];
    if (values.some((email) => !isValidEmail(email))) {
      setMessage({ kind: "error", text: t.invalidEmail });
      return;
    }
    if (values.length > MAX_ALERT_RECIPIENTS) {
      setMessage({ kind: "error", text: t.tooManyEmails });
      return;
    }

    setSaving(true);
    setMessage(null);
    try {
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alertEmails: values }),
      });
      const result = (await response.json()) as { source?: AlertRecipientSource; error?: string };
      if (!response.ok) {
        setMessage({ kind: "error", text: result.error || t.saveFailed });
        return;
      }
      setSource(result.source || "none");
      setAlertEmails(values.length > 0 ? values : [""]);
      setMessage({ kind: "ok", text: t.saved });
    } catch {
      setMessage({ kind: "error", text: t.saveFailed });
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminShell userEmail={userEmail} userRole={userRole} isAdmin>
      <main
        id="main-content"
        className="min-h-dvh bg-[var(--panel-surface)] px-4 py-6 pb-24 text-[var(--panel-ink)] sm:px-6 lg:px-8"
      >
        <div className="mx-auto w-full max-w-[1440px]">
          <header className="border-b border-[var(--panel-line)] pb-5">
            <h1 className="text-2xl font-bold leading-[1.2] tracking-[-0.025em] text-[var(--panel-ink)] sm:text-[1.875rem]">
              {t.title}
            </h1>
            <p className="mt-1.5 max-w-[65ch] text-sm leading-relaxed text-[var(--panel-muted)]">
              {t.subtitle}
            </p>
          </header>

          {!databaseAvailable ? (
            <p
              role="status"
              className="mt-6 max-w-2xl rounded-lg border border-[var(--panel-line)] bg-[var(--panel-subtle)] p-5 text-sm leading-relaxed text-[var(--panel-ink)]"
            >
              {t.noDatabase}
            </p>
          ) : (
            <form onSubmit={save} className="mt-6 max-w-2xl">
              <h2 className="text-lg font-semibold leading-snug text-[var(--panel-ink)]">
                {t.alertSectionTitle}
              </h2>
              <p className="mt-1.5 max-w-[65ch] text-sm leading-relaxed text-[var(--panel-muted)]">
                {t.alertSectionHelp}
              </p>

              <fieldset className="mt-6">
                <legend className="block text-sm font-medium text-[var(--panel-ink)]">
                  {t.alertEmailLabel}
                </legend>
                <div className="mt-2 flex flex-col gap-2.5">
                  {alertEmails.map((email, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="email"
                        value={email}
                        onChange={(event) =>
                          setAlertEmails((current) =>
                            current.map((item, i) => (i === index ? event.target.value : item)),
                          )
                        }
                        placeholder={t.alertEmailPlaceholder}
                        aria-label={`${t.alertEmailLabel} ${index + 1}`}
                        maxLength={320}
                        autoComplete="off"
                        className="block min-h-11 w-full min-w-0 flex-1 rounded-lg border border-[var(--color-border-control)] dark:border-[var(--panel-line)] bg-[var(--panel-surface)] px-3.5 text-sm text-[var(--panel-ink)] placeholder:text-[var(--panel-muted)] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-sapphire)] dark:focus-visible:outline-[#bad7fa]"
                      />
                      {alertEmails.length > 1 ? (
                        <button
                          type="button"
                          onClick={() =>
                            setAlertEmails((current) => current.filter((_, i) => i !== index))
                          }
                          aria-label={`${t.removeEmail} ${index + 1}`}
                          title={t.removeEmail}
                          className="inline-flex h-11 w-11 min-h-11 min-w-11 shrink-0 items-center justify-center rounded-lg border border-[var(--color-border-control)] dark:border-[var(--panel-line)] bg-[var(--panel-surface)] text-lg leading-none text-[var(--panel-muted)] transition-colors hover:border-[#b91c1c]/40 hover:bg-[#fef2f2] hover:text-[#b91c1c] dark:hover:bg-[#3f1d24] dark:hover:text-[#ffb4b4]"
                        >
                          <span aria-hidden="true">×</span>
                        </button>
                      ) : null}
                    </div>
                  ))}
                </div>
                {alertEmails.length < MAX_ALERT_RECIPIENTS ? (
                  <button
                    type="button"
                    onClick={() => setAlertEmails((current) => [...current, ""])}
                    className="mt-3 inline-flex min-h-11 shrink-0 items-center justify-center whitespace-nowrap rounded-lg border border-[var(--color-border-control)] dark:border-[var(--panel-line)] bg-[var(--panel-surface)] px-4 text-sm font-medium text-[var(--panel-ink)] transition-colors hover:bg-[var(--panel-selection)]"
                  >
                    {t.addEmail}
                  </button>
                ) : null}
              </fieldset>

              <p className="mt-3 text-xs text-[var(--panel-muted)]">{sourceText}</p>

              {message ? (
                <p
                  role={message.kind === "error" ? "alert" : "status"}
                  className={`mt-4 rounded-lg border px-4 py-3 text-sm ${
                    message.kind === "error"
                      ? "border-[#b91c1c]/30 bg-[#fef2f2] text-[#991b1b] dark:border-[#ffb4b4]/35 dark:bg-[#2c1519] dark:text-[#ffb4b4]"
                      : "border-[var(--panel-line)] bg-[var(--panel-selection)] text-[var(--panel-ink)]"
                  }`}
                >
                  {message.text}
                </p>
              ) : null}

              <div className="mt-6 border-t border-[var(--panel-line)] pt-5">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex min-h-11 shrink-0 items-center justify-center whitespace-nowrap rounded-lg bg-[var(--color-sapphire)] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#28476f] disabled:cursor-default disabled:bg-[var(--panel-subtle)] disabled:text-[var(--panel-muted)]"
                >
                  {saving ? t.saving : t.save}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </AdminShell>
  );
}
