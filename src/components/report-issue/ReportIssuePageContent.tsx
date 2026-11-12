"use client";

import { useMemo, useState } from "react";
import { captchaErrorMessage, useRecaptcha } from "@/components/security/RecaptchaProvider";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/lib/i18n/language-context";
import type { Lang } from "@/lib/i18n/translations";

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

export const copyByLang: Record<Lang, Copy> = {
ru: {
    title: "Сообщить о проблеме",
    subtitle: "Расскажите нам, что пошло не так. Наша команда рассмотрит это.",
    emailLabel: "Ваш адрес электронной почты (необязательно)",
    emailPlaceholder: "you@example.com",
    issueLabel: "Что случилось?",
    issuePlaceholder: "Что вы хотели сделать, и что произошло вместо этого?",
    send: "Отправить отчет",
    sending: "Отправка…",
    success: "Спасибо. Ваш отчет отправлен.",
    genericError: "Отчет не был отправлен. Попробуйте еще раз.",
    detailError: "Напишите не менее 10 символов, чтобы мы поняли проблему.",
  },

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
  hr: {
    title: "Prijavi poteškoću",
    subtitle: "Napiši nam što nije radilo. Naš tim će to provjeriti.",
    emailLabel: "Tvoja adresa e-pošte (nije obvezno)",
    emailPlaceholder: "ti@primjer.hr",
    issueLabel: "Što se dogodilo?",
    issuePlaceholder: "Što si htio učiniti i što se umjesto toga dogodilo?",
    send: "Pošalji prijavu",
    sending: "Slanje…",
    success: "Hvala. Tvoja prijava je poslana.",
    genericError: "Prijava nije poslana. Pokušaj ponovno.",
    detailError: "Upiši najmanje 10 znakova kako bismo razumjeli poteškoću.",
  },
  rom: {
    title: "Phen ekh pharipen",
    subtitle: "Phen amenge so na kerdili mishto. Amaro timo ka dikhel les.",
    emailLabel: "Cho emailo (nay musay)",
    emailPlaceholder: "tu@misal.com",
    issueLabel: "So kerdili?",
    issuePlaceholder: "So kamlyan te keres thaj so kerdili chaches?",
    send: "Bichhal o phenipe",
    sending: "Bichhalel pes…",
    success: "Nais tuke. Cho phenipe bichhaldilo.",
    genericError: "O phenipe na bichhaldilo. Zumav palem.",
    detailError: "Lekhav nay-zalag 10 semnya te achharas o pharipen.",
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
          <form onSubmit={onSubmit} className="mx-auto max-w-2xl space-y-5 rounded-xl border border-border bg-card p-5 sm:p-6">
            <div>
              <label htmlFor="report-email" className="mb-1.5 block text-sm font-semibold text-foreground">{t.emailLabel}</label>
              <input
                id="report-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder={t.emailPlaceholder}
                className="min-h-11 w-full rounded-lg border border-border bg-background px-3 py-2 text-base text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:text-sm"
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
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-base text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:text-sm"
              />
            </div>

            {error ? (
              <p role="alert" className="fhs-fade rounded-lg border border-primary/20 bg-primary-soft px-3 py-2 text-sm text-foreground">
                {error}
              </p>
            ) : null}
            {success ? (
              <p role="status" className="fhs-fade rounded-lg border border-border bg-muted/60 px-3 py-2 text-sm text-foreground">
                {success}
              </p>
            ) : null}

            <div className="flex justify-end">
              <Button type="submit" variant="secondary" disabled={isSubmitting} className="disabled:bg-muted disabled:text-muted-foreground">
                {isSubmitting ? t.sending : t.send}
              </Button>
            </div>
          </form>
        </Container>
      </section>
    </main>
  );
}
