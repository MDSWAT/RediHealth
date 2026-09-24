"use client";

import { useId, useMemo, useState } from "react";
import { AlertCircleIcon, CloseIcon, MailIcon } from "@/components/ui/icons";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/lib/i18n/language-context";

type Copy = {
  trigger: string;
  modalTitle: string;
  modalBody: string;
  emailLabel: string;
  emailPlaceholder: string;
  messageLabel: string;
  messagePlaceholder: string;
  cancel: string;
  sending: string;
  send: string;
  success: string;
  genericError: string;
};

const reportIssueCopy: Record<"en" | "ro" | "sq" | "it", Copy> = {
  en: {
    trigger: "Report an issue",
    modalTitle: "Report an issue",
    modalBody: "Tell us what happened and we will investigate.",
    emailLabel: "Your email (optional)",
    emailPlaceholder: "you@example.com",
    messageLabel: "What happened?",
    messagePlaceholder: "Describe the issue, what you expected, and what happened instead.",
    cancel: "Cancel",
    sending: "Sending...",
    send: "Send report",
    success: "Thanks. Your report has been sent.",
    genericError: "We could not send your report. Please try again.",
  },
  ro: {
    trigger: "Raportează o problemă",
    modalTitle: "Raportează o problemă",
    modalBody: "Spune-ne ce s-a întâmplat și vom investiga.",
    emailLabel: "Emailul tău (opțional)",
    emailPlaceholder: "tu@exemplu.com",
    messageLabel: "Ce s-a întâmplat?",
    messagePlaceholder: "Descrie problema, ce te așteptai să se întâmple și ce s-a întâmplat de fapt.",
    cancel: "Anulează",
    sending: "Se trimite...",
    send: "Trimite raportul",
    success: "Mulțumim. Raportul a fost trimis.",
    genericError: "Nu am putut trimite raportul. Te rugăm să încerci din nou.",
  },
  sq: {
    trigger: "Raporto një problem",
    modalTitle: "Raporto një problem",
    modalBody: "Na tregoni çfarë ndodhi dhe ne do ta hetojmë.",
    emailLabel: "Emaili juaj (opsional)",
    emailPlaceholder: "ju@shembull.com",
    messageLabel: "Çfarë ndodhi?",
    messagePlaceholder: "Përshkruani problemin, çfarë prisnit dhe çfarë ndodhi në vend të kësaj.",
    cancel: "Anulo",
    sending: "Duke u dërguar...",
    send: "Dërgo raportin",
    success: "Faleminderit. Raporti juaj u dërgua.",
    genericError: "Nuk mundëm ta dërgojmë raportin. Ju lutemi provoni përsëri.",
  },
  it: {
    trigger: "Segnala un problema",
    modalTitle: "Segnala un problema",
    modalBody: "Raccontaci cosa è successo e verificheremo.",
    emailLabel: "La tua email (opzionale)",
    emailPlaceholder: "tu@esempio.com",
    messageLabel: "Cosa è successo?",
    messagePlaceholder: "Descrivi il problema, cosa ti aspettavi e cosa è successo invece.",
    cancel: "Annulla",
    sending: "Invio in corso...",
    send: "Invia segnalazione",
    success: "Grazie. La segnalazione è stata inviata.",
    genericError: "Non siamo riusciti a inviare la segnalazione. Riprova.",
  },
};

export function ReportIssueWidget() {
  const { lang } = useLanguage();
  const t = useMemo(() => reportIssueCopy[lang], [lang]);

  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dialogTitleId = useId();

  async function submitReport(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (message.trim().length < 10) {
      setError("Please add a bit more detail so we can investigate.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/report-issue", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          message: message.trim(),
          pageUrl: window.location.href,
          userAgent: navigator.userAgent,
        }),
      });

      const data = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) {
        setError(data.error || t.genericError);
        return;
      }

      setSuccess(t.success);
      setMessage("");
      setEmail("");
    } catch {
      setError(t.genericError);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          setError(null);
          setSuccess(null);
        }}
        className="fixed bottom-4 right-4 z-40 inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/30 transition-all hover:-translate-y-0.5 hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <AlertCircleIcon className="h-4 w-4" />
        <span>{t.trigger}</span>
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 backdrop-blur-xs sm:items-center sm:p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={dialogTitleId}
            className="relative flex w-full max-w-xl flex-col rounded-t-3xl border-t border-border bg-card p-5 shadow-2xl sm:rounded-2xl sm:border"
          >
            <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-border sm:hidden" />
            <div className="mb-4 flex items-start justify-between gap-3 border-b border-border pb-4 sm:items-center">
              <div className="min-w-0">
                <h2 id={dialogTitleId} className="text-base font-bold text-foreground sm:text-lg">
                  {t.modalTitle}
                </h2>
                <p className="text-sm text-muted-foreground">{t.modalBody}</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={t.cancel}
                className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={submitReport} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold text-foreground">{t.emailLabel}</label>
                <div className="relative">
                  <MailIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder={t.emailPlaceholder}
                    className="w-full rounded-xl border border-border bg-background py-2 pl-9 pr-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-foreground">{t.messageLabel}</label>
                <textarea
                  required
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder={t.messagePlaceholder}
                  minLength={10}
                  rows={6}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>

              {error ? (
                <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
              ) : null}
              {success ? (
                <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                  {success}
                </p>
              ) : null}

              <div className="flex items-center justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                  {t.cancel}
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? t.sending : t.send}
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
