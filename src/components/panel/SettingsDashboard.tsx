"use client";

import { useState, type FormEvent } from "react";
import { AdminShell } from "@/components/panel/AdminShell";
import { Container } from "@/components/ui/Container";
import { useLanguage } from "@/lib/i18n/language-context";
import { settingsTranslations } from "@/lib/i18n/settings-translations";
import { isValidEmail } from "@/lib/text";

type AlertRecipientSource = "panel" | "env" | "none";

type SettingsDashboardProps = {
  userEmail: string;
  userRole?: string;
  databaseAvailable: boolean;
  initialAlertEmail: string;
  initialSource: AlertRecipientSource;
};

export function SettingsDashboard({
  userEmail,
  userRole,
  databaseAvailable,
  initialAlertEmail,
  initialSource,
}: SettingsDashboardProps) {
  const { lang } = useLanguage();
  const t = settingsTranslations[lang];
  const [alertEmail, setAlertEmail] = useState(initialSource === "panel" ? initialAlertEmail : "");
  const [source, setSource] = useState<AlertRecipientSource>(initialSource);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  const sourceText = source === "panel" ? t.sourcePanel : source === "env" ? t.sourceEnv : t.sourceNone;

  async function save(event: FormEvent) {
    event.preventDefault();
    const value = alertEmail.trim().toLowerCase();
    if (value && !isValidEmail(value)) {
      setMessage({ kind: "error", text: t.invalidEmail });
      return;
    }

    setSaving(true);
    setMessage(null);
    try {
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alertEmail: value }),
      });
      const result = (await response.json()) as { source?: AlertRecipientSource; error?: string };
      if (!response.ok) {
        setMessage({ kind: "error", text: result.error || t.saveFailed });
        return;
      }
      setSource(result.source || "none");
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

              <label htmlFor="alert-email" className="mt-5 block text-sm font-medium text-foreground">
                {t.alertEmailLabel}
              </label>
              <input
                id="alert-email"
                type="email"
                value={alertEmail}
                onChange={(event) => setAlertEmail(event.target.value)}
                placeholder={t.alertEmailPlaceholder}
                maxLength={320}
                autoComplete="off"
                className="mt-1.5 block min-h-11 w-full rounded-lg border border-border bg-white px-3.5 text-base outline-none focus:border-ring"
              />
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
                className="mt-5 min-h-10 rounded-lg bg-primary px-5 text-sm font-semibold text-white disabled:bg-muted disabled:text-muted-foreground"
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
