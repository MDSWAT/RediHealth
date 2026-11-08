"use client";

import { captchaErrorMessage, useRecaptcha } from "@/components/security/RecaptchaProvider";

import { useMemo, useState } from "react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/lib/i18n/language-context";

type Copy = {
  title: string;
  subtitle: string;
  emailLabel: string;
  emailPlaceholder: string;
  issueLabel: string;
  issuePlaceholder: string;
  send: string;
  sending: string;
  success: string;
  genericError: string;
  detailError: string;
};

const copyByLang: Record<"en" | "ro" | "sq" | "it", Copy> = {
  en: {
    title: "Report a problem",
    subtitle: "Tell us what went wrong. Our team will look at it.",
    emailLabel: "Your email (optional)",
    emailPlaceholder: "you@example.com",
    issueLabel: "What happened?",
    issuePlaceholder: "What did you want to do, and what happened instead?",
    send: "Send report",
    sending: "Sending…",
    success: "Thank you. Your report has been sent.",
    genericError: "The report was not sent. Try again.",
    detailError: "Write at least 10 characters so we understand the problem.",
  },
  ro: {
    title: "Raportează o problemă",
    subtitle: "Spune-ne ce n-a mers. Echipa noastră se uită.",
    emailLabel: "Emailul tău (opțional)",
    emailPlaceholder: "tu@exemplu.com",
    issueLabel: "Ce s-a întâmplat?",
    issuePlaceholder: "Ce voiai să faci și ce s-a întâmplat de fapt?",
    send: "Trimite raportul",
    sending: "Se trimite…",
    success: "Mulțumim. Raportul tău a fost trimis.",
    genericError: "Raportul nu s-a trimis. Încearcă din nou.",
    detailError: "Scrie cel puțin 10 caractere, ca să înțelegem problema.",
  },
  sq: {
    title: "Raporto një problem",
    subtitle: "Na trego çfarë nuk funksionoi. Ekipi ynë do ta shohë.",
    emailLabel: "Emaili yt (nuk është i detyrueshëm)",
    emailPlaceholder: "ti@shembull.com",
    issueLabel: "Çfarë ndodhi?",
    issuePlaceholder: "Çfarë doje të bëje dhe çfarë ndodhi në fakt?",
    send: "Dërgo raportin",
    sending: "Po dërgohet…",
    success: "Faleminderit. Raporti yt u dërgua.",
    genericError: "Raporti nuk u dërgua. Provo përsëri.",
    detailError: "Shkruaj të paktën 10 shkronja, që ta kuptojmë problemin.",
  },
  it: {
    title: "Segnala un problema",
    subtitle: "Dicci cosa non ha funzionato. Il nostro team lo controlla.",
    emailLabel: "La tua email (facoltativa)",
    emailPlaceholder: "tu@esempio.com",
    issueLabel: "Cosa è successo?",
    issuePlaceholder: "Cosa volevi fare e cosa è successo invece?",
    send: "Invia segnalazione",
    sending: "Invio in corso…",
    success: "Grazie. La segnalazione è stata inviata.",
    genericError: "La segnalazione non è stata inviata. Riprova.",
    detailError: "Scrivi almeno 10 caratteri, così capiamo il problema.",
  },
};

export function ReportIssuePageContent() {
  const { lang } = useLanguage();
  const executeCaptcha = useRecaptcha();
  const t = useMemo(() => copyByLang[lang], [lang]);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (message.trim().length < 10) {
      setError(t.detailError);
      return;
    }

    setIsSubmitting(true);
    try {
      const captchaToken = await executeCaptcha("issue_report");
      const response = await fetch("/api/report-issue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          message: message.trim(),
          pageUrl: window.location.href,
          userAgent: navigator.userAgent,
          captchaToken,
        }),
      });

      if (!response.ok) {
        // Server messages are English-only; keep the reader's language.
        setError(t.genericError);
        return;
      }

      setEmail("");
      setMessage("");
      setSuccess(t.success);
    } catch (error) {
      setError(captchaErrorMessage(error, t.genericError));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main id="main-content" className="flex-1">
      <section className="border-b border-border bg-muted/40 py-10 sm:py-14">
        <Container>
          <SectionHeading as="h1" title={t.title} subtitle={t.subtitle} />
        </Container>
      </section>

      <section className="py-10 sm:py-14">
        <Container>
          <form onSubmit={onSubmit} className="mx-auto max-w-2xl space-y-5 rounded-2xl border border-border bg-card p-5 sm:p-6">
            <div>
              <label htmlFor="report-email" className="mb-1.5 block text-sm font-semibold text-foreground">{t.emailLabel}</label>
              <input
                id="report-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder={t.emailPlaceholder}
                className="min-h-11 w-full rounded-xl border border-border bg-background px-3 py-2 text-base text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="report-message" className="mb-1.5 block text-sm font-semibold text-foreground">{t.issueLabel}</label>
              <textarea
                id="report-message"
                required
                minLength={10}
                rows={8}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder={t.issuePlaceholder}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            {error ? (
              <p role="alert" className="fhs-fade rounded-xl border border-primary/20 bg-primary-soft px-3 py-2 text-sm text-foreground">
                {error}
              </p>
            ) : null}
            {success ? (
              <p role="status" className="fhs-fade rounded-xl border border-border bg-muted/60 px-3 py-2 text-sm text-foreground">
                {success}
              </p>
            ) : null}

            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? t.sending : t.send}
              </Button>
            </div>
          </form>
        </Container>
      </section>
    </main>
  );
}
