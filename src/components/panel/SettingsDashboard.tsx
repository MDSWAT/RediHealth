"use client";

import { useState, type FormEvent } from "react";
import { AdminShell } from "@/components/panel/AdminShell";
import { Container } from "@/components/ui/Container";
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
      <main id="main-content" className="min-h-screen py-8 sm:py-10">
        <Container>
          <div className="mb-6 border-b border-border pb-6">
            <p className="text-xs font-bold text-primary">{t.eyebrow}</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{t.title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{t.subtitle}</p>
          </div>

          {!databaseAvailable ? (
            <p className="rounded-xl border border-primary/20 bg-primary-soft p-6 text-sm leading-relaxed text-foreground">
              {t.noDatabase}
            </p>
          ) : (
            <form onSubmit={save} className="max-w-xl rounded-xl border border-border bg-card p-6">
              <h2 className="text-lg font-semibold text-foreground">{t.alertSectionTitle}</h2>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{t.alertSectionHelp}</p>

              <fieldset className="mt-5">
                <legend className="block text-sm font-medium text-foreground">{t.alertEmailLabel}</legend>
                <div className="mt-1.5 flex flex-col gap-2">
                  {alertEmails.map((email, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="email"
                        value={email}
                        onChange={(event) =>
                          setAlertEmails((current) => current.map((item, i) => (i === index ? event.target.value : item)))
                        }
                        placeholder={t.alertEmailPlaceholder}
                        aria-label={`${t.alertEmailLabel} ${index + 1}`}
                        maxLength={320}
                        autoComplete="off"
                        className="block min-h-11 w-full min-w-0 flex-1 rounded-lg border border-border bg-white px-3.5 text-base outline-none focus:border-ring"
                      />
                      {alertEmails.length > 1 ? (
                        <button
                          type="button"
                          onClick={() => setAlertEmails((current) => current.filter((_, i) => i !== index))}
                          aria-label={`${t.removeEmail} ${index + 1}`}
                          title={t.removeEmail}
                          className="flex h-11 w-11 flex-none items-center justify-center rounded-lg border border-border text-lg leading-none text-muted-foreground hover:text-foreground"
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
                    className="mt-3 min-h-10 whitespace-nowrap rounded-lg border border-border px-4 text-sm font-semibold text-foreground"
                  >
                    {t.addEmail}
                  </button>
                ) : null}
              </fieldset>
              <p className="mt-2 text-xs text-muted-foreground">{sourceText}</p>

              {message ? (
                <p
                  role={message.kind === "error" ? "alert" : "status"}
                  className={`mt-4 text-sm ${message.kind === "error" ? "text-primary" : "text-foreground"}`}
                >
                  {message.text}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={saving}
                className="mt-5 min-h-10 whitespace-nowrap rounded-lg bg-primary px-5 text-sm font-semibold text-white disabled:bg-muted disabled:text-muted-foreground"
              >
                {saving ? t.saving : t.save}
              </button>
            </form>
          )}
        </Container>
      </main>
    </AdminShell>
  );
}
