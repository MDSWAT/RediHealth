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
  messageHint: string;
  readyHint: string;
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
    messageHint: "Минимум 10 символов",
    readyHint: "Готово к отправке",
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
    messageHint: "At least 10 characters",
    readyHint: "Ready to send",
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
    messageHint: "Minim 10 caractere",
    readyHint: "Gata de trimis",
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
    messageHint: "Të paktën 10 karaktere",
    readyHint: "Gati për dërgim",
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
    messageHint: "Almeno 10 caratteri",
    readyHint: "Pronto per l'invio",
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
    messageHint: "Najmanje 10 znakova",
    readyHint: "Spremno za slanje",
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
    messageHint: "Naj-zalag 10 semnya",
    readyHint: "Gata te bichhalas",
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

  const trimmedLength = message.trim().length;
  /** The too-short message sits under the field it is about, and the field is marked invalid. */
  const detailInvalid = error === t.detailError && trimmedLength < 10;

  return (
    <main id="main-content" className="flex-1">
      <section className="border-b border-border bg-muted/40 py-10 sm:py-14">
        <Container>
          <SectionHeading as="h1" title={t.title} subtitle={t.subtitle} titleClassName="text-page" />
        </Container>
      </section>

      <section className="py-10 sm:py-14">
        <Container>
          <form onSubmit={onSubmit} className="max-w-2xl space-y-5 rounded-xl border border-border bg-card p-5 sm:p-6">
            <div>
              <label htmlFor="report-email" className="mb-1.5 block text-sm font-semibold text-foreground">{t.emailLabel}</label>
              <input
                id="report-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder={t.emailPlaceholder}
                className="field-focus min-h-12 w-full rounded-lg border border-border-control bg-background px-3.5 py-2 text-base text-foreground placeholder:text-muted-foreground sm:text-sm"
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
                aria-invalid={detailInvalid}
                aria-describedby={detailInvalid ? "report-message-error report-message-hint" : "report-message-hint"}
                placeholder={t.issuePlaceholder}
                className="field-focus w-full rounded-lg border border-border-control bg-background px-3.5 py-2.5 text-base text-foreground placeholder:text-muted-foreground sm:text-sm"
              />
              {/* A hairline under the field fills toward the 10-character minimum, so "how much more"
                  is visible without counting; the words beside it say the same thing. */}
              <span aria-hidden="true" className="mt-2 block h-0.5 overflow-hidden rounded-sm bg-border">
                <span
                  className={`block h-full origin-left transition-[transform,background-color] duration-[var(--dur-base)] ease-[var(--ease-out-calm)] motion-reduce:transition-none ${
                    trimmedLength >= 10 ? "bg-live-sage" : "bg-sapphire"
                  }`}
                  style={{ transform: `scaleX(${Math.min(trimmedLength, 10) / 10})` }}
                />
              </span>
              <p id="report-message-hint" className="mt-1.5 flex items-center justify-between gap-3 text-xs text-muted-foreground tabular-nums">
                <span>{t.messageHint}</span>
                <span key={trimmedLength >= 10 ? "ready" : "count"} className={trimmedLength >= 10 ? "swap-in font-semibold text-foreground" : undefined}>
                  {trimmedLength >= 10 ? t.readyHint : `${trimmedLength}/10`}
                </span>
              </p>
              {detailInvalid ? (
                <p id="report-message-error" role="alert" className="swap-in mt-1.5 text-sm font-medium text-primary">
                  {error}
                </p>
              ) : null}
            </div>

            {error && error !== t.detailError ? (
              <p role="alert" className="swap-in border-l-2 border-primary py-0.5 pl-3 text-sm font-medium leading-relaxed text-foreground">
                {error}
              </p>
            ) : null}
            {success ? (
              <p role="status" className="swap-in border-l-2 border-live-sage py-0.5 pl-3 text-sm font-medium leading-relaxed text-foreground">
                {success}
              </p>
            ) : null}

            <div className="flex justify-end">
              <Button type="submit" variant="action" disabled={isSubmitting} className="disabled:bg-muted disabled:text-muted-foreground">
                {isSubmitting ? t.sending : t.send}
              </Button>
            </div>
          </form>
        </Container>
      </section>
    </main>
  );
}
