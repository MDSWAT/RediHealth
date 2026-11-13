"use client";

import { captchaErrorMessage, useRecaptcha } from "@/components/security/RecaptchaProvider";

import { useEffect, useId, useRef, useState, type FormEvent, type MouseEvent } from "react";
import { AlertCircleIcon, CloseIcon, MailIcon } from "@/components/ui/icons";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/lib/i18n/language-context";
import type { Lang } from "@/lib/i18n/translations";

export type ReportIssueCopy = {
  trigger: string;
  modalTitle: string;
  modalBody: string;
  close: string;
  emailLabel: string;
  emailPlaceholder: string;
  messageLabel: string;
  messagePlaceholder: string;
  cancel: string;
  sending: string;
  send: string;
  success: string;
  tooShort: string;
  invalidEmail: string;
  invalidRequest: string;
  tooMany: string;
  captchaFailed: string;
  unavailable: string;
  genericError: string;
};

export const reportIssueCopy: Record<Lang, ReportIssueCopy> = {
  ru: {
    trigger: "Сообщить о проблеме",
    modalTitle: "Сообщить о проблеме",
    modalBody: "Расскажите нам, что пошло не так. Мы посмотрим на это.",
    close: "Закрыть",
    emailLabel: "Ваш адрес электронной почты (необязательно)",
    emailPlaceholder: "you@example.com",
    messageLabel: "Что случилось?",
    messagePlaceholder: "Что вы хотели сделать, и что произошло вместо этого?",
    cancel: "Отмена",
    sending: "Отправка…",
    send: "Отправить отчет",
    success: "Спасибо. Ваш отчет отправлен.",
    tooShort: "Напишите еще немного, хотя бы 10 символов, чтобы мы могли проверить.",
    invalidEmail: "Этот адрес электронной почты выглядит неправильно. Отметьте его или оставьте пустым.",
    invalidRequest: "Мы не смогли прочитать отчет. Проверьте электронную почту и текст, затем повторите попытку.",
    tooMany: "Вы отправили несколько отчетов за короткое время. Повторите попытку через несколько минут.",
    captchaFailed: "Проверка безопасности не удалась. Попробуйте еще раз.",
    unavailable: "Отчеты не могут быть отправлены прямо сейчас. Повторите попытку позже.",
    genericError: "Отчет не был отправлен. Попробуйте еще раз.",
  },

  en: {
    trigger: "Report a problem",
    modalTitle: "Report a problem",
    modalBody: "Tell us what went wrong. We will look at it.",
    close: "Close",
    emailLabel: "Your email (optional)",
    emailPlaceholder: "you@example.com",
    messageLabel: "What happened?",
    messagePlaceholder: "What did you want to do, and what happened instead?",
    cancel: "Cancel",
    sending: "Sending…",
    send: "Send report",
    success: "Thank you. Your report has been sent.",
    tooShort: "Write a bit more, at least 10 characters, so we can check it.",
    invalidEmail: "This email address looks wrong. Check it or leave it empty.",
    invalidRequest: "We could not read the report. Check the email and the text, then try again.",
    tooMany: "You sent several reports in a short time. Try again in a few minutes.",
    captchaFailed: "The security check failed. Try again.",
    unavailable: "Reports cannot be sent right now. Try again later.",
    genericError: "The report was not sent. Try again.",
  },
  ro: {
    trigger: "Raportează o problemă",
    modalTitle: "Raportează o problemă",
    modalBody: "Spune-ne ce n-a mers și ne uităm.",
    close: "Închide",
    emailLabel: "Emailul tău (opțional)",
    emailPlaceholder: "tu@exemplu.ro",
    messageLabel: "Ce s-a întâmplat?",
    messagePlaceholder: "Ce voiai să faci și ce s-a întâmplat de fapt?",
    cancel: "Anulează",
    sending: "Se trimite…",
    send: "Trimite raportul",
    success: "Mulțumim. Raportul a fost trimis.",
    tooShort: "Scrie puțin mai mult, cel puțin 10 caractere, ca să putem verifica.",
    invalidEmail: "Adresa de email pare greșită. Verific-o sau lasă câmpul gol.",
    invalidRequest: "Nu am putut citi raportul. Verifică emailul și textul, apoi încearcă din nou.",
    tooMany: "Ai trimis mai multe rapoarte într-un timp scurt. Încearcă din nou peste câteva minute.",
    captchaFailed: "Verificarea de securitate n-a mers. Încearcă din nou.",
    unavailable: "Acum nu poți trimite rapoarte. Încearcă mai târziu.",
    genericError: "Raportul nu s-a trimis. Încearcă din nou.",
  },
  sq: {
    trigger: "Raporto një problem",
    modalTitle: "Raporto një problem",
    modalBody: "Na trego çfarë nuk funksionoi. Do ta shohim.",
    close: "Mbyll",
    emailLabel: "Emaili yt (nuk është i detyrueshëm)",
    emailPlaceholder: "ti@shembull.com",
    messageLabel: "Çfarë ndodhi?",
    messagePlaceholder: "Çfarë doje të bëje dhe çfarë ndodhi në fakt?",
    cancel: "Anulo",
    sending: "Po dërgohet…",
    send: "Dërgo raportin",
    success: "Faleminderit. Raporti u dërgua.",
    tooShort: "Shkruaj pak më shumë, të paktën 10 karaktere, që ta kontrollojmë.",
    invalidEmail: "Kjo adresë emaili duket e gabuar. Kontrolloje ose lëre bosh.",
    invalidRequest: "Nuk arritëm ta lexojmë raportin. Kontrollo emailin dhe tekstin, pastaj provo përsëri.",
    tooMany: "Dërgove disa raporte brenda pak kohe. Provo përsëri pas disa minutash.",
    captchaFailed: "Kontrolli i sigurisë nuk kaloi. Provo përsëri.",
    unavailable: "Tani nuk mund të dërgosh raporte. Provo më vonë.",
    genericError: "Raporti nuk u dërgua. Provo përsëri.",
  },
  it: {
    trigger: "Segnala un problema",
    modalTitle: "Segnala un problema",
    modalBody: "Dicci cosa non ha funzionato. Lo controlliamo.",
    close: "Chiudi",
    emailLabel: "La tua email (facoltativa)",
    emailPlaceholder: "tu@esempio.it",
    messageLabel: "Cosa è successo?",
    messagePlaceholder: "Cosa volevi fare e cosa è successo invece?",
    cancel: "Annulla",
    sending: "Invio in corso…",
    send: "Invia segnalazione",
    success: "Grazie. La segnalazione è stata inviata.",
    tooShort: "Scrivi un po' di più, almeno 10 caratteri, così possiamo controllare.",
    invalidEmail: "L'indirizzo email sembra sbagliato. Controllalo o lascia il campo vuoto.",
    invalidRequest: "Non riusciamo a leggere la segnalazione. Controlla l'email e il testo, poi riprova.",
    tooMany: "Hai inviato diverse segnalazioni in poco tempo. Riprova tra qualche minuto.",
    captchaFailed: "Il controllo di sicurezza non è riuscito. Riprova.",
    unavailable: "Ora non puoi inviare segnalazioni. Riprova più tardi.",
    genericError: "La segnalazione non è stata inviata. Riprova.",
  },
  hr: {
    trigger: "Prijavi problem",
    modalTitle: "Prijavi problem",
    modalBody: "Reci nam što nije radilo. Provjerit ćemo.",
    close: "Zatvori",
    emailLabel: "Tvoj email (nije obavezno)",
    emailPlaceholder: "ti@primjer.hr",
    messageLabel: "Što se dogodilo?",
    messagePlaceholder: "Što si htio ili htjela učiniti, a što se zapravo dogodilo?",
    cancel: "Odustani",
    sending: "Šalje se…",
    send: "Pošalji prijavu",
    success: "Hvala ti. Tvoja prijava je poslana.",
    tooShort: "Napiši malo više, barem 10 znakova, kako bismo mogli provjeriti.",
    invalidEmail: "Ova email adresa izgleda pogrešno. Provjeri je ili ostavi polje prazno.",
    invalidRequest: "Nismo uspjeli pročitati prijavu. Provjeri email i tekst pa pokušaj ponovno.",
    tooMany: "Poslao ili poslala si više prijava u kratkom vremenu. Pokušaj ponovno za nekoliko minuta.",
    captchaFailed: "Sigurnosna provjera nije uspjela. Pokušaj ponovno.",
    unavailable: "Trenutno nije moguće slati prijave. Pokušaj kasnije.",
    genericError: "Prijava nije poslana. Pokušaj ponovno.",
  },
  rom: {
    trigger: "Phen jekh problema",
    modalTitle: "Phen jekh problema",
    modalBody: "Phen amenge so na kerdjas buchi. Ame dikhasa les.",
    close: "Phandav",
    emailLabel: "Chiro emailo (te manges)",
    emailPlaceholder: "tu@misal.org",
    messageLabel: "So kerdilo?",
    messagePlaceholder: "So mangljan te keres thaj so kerdilo chachimasa?",
    cancel: "Mekh",
    sending: "Bichavel pe…",
    send: "Bichav o raporto",
    success: "Nais tuke. Chiro raporto sas bichaldo.",
    tooShort: "Ramov maj but, barem 10 znakoja, kaste shaj dikhas les.",
    invalidEmail: "Kadava emailo dikljol doshalo. Dikh les pale vaj mekh o than chuch.",
    invalidRequest: "Nashti ginadas o raporto. Dikh o emailo thaj o teksto, pala kodoja zumav pale.",
    tooMany: "Bichaldjan maj but raportoja and-o skurto vrama. Zumav pale pala nesave minutia.",
    captchaFailed: "I kontrola vash arakhimos na nakhlja. Zumav pale.",
    unavailable: "Akana nashti bichaven pe raportoja. Zumav maj palal.",
    genericError: "O raporto na sas bichaldo. Zumav pale.",
  },
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const OPEN_EVENT = "redi:report-issue-open";

/**
 * Opens the report form from anywhere in the chrome (the footer link on phones and tablets,
 * where the floating button is hidden so it never sits on page text or a bottom action bar).
 * Returns false when the widget is not mounted, so the caller can fall back to its link.
 */
export function openReportIssue(): boolean {
  if (typeof window === "undefined") return false;
  const event = new Event(OPEN_EVENT, { cancelable: true });
  // The mounted widget cancels the event to say it handled it.
  return !window.dispatchEvent(event);
}

/** The server answers in English; show the visitor's own language instead, chosen by status and code. */
function errorForResponse(status: number, code: string | undefined, t: ReportIssueCopy): string {
  if (status === 429) return t.tooMany;
  if (code === "captcha_invalid") return t.captchaFailed;
  if (status === 400) return t.invalidRequest;
  if (status === 503) return t.unavailable;
  return t.genericError;
}

/**
 * Floating "report an issue" button and its form, in a native modal dialog
 * (focus stays inside, Escape closes, the page behind is inert). Every message,
 * including server errors, is shown in the page language.
 */
export function ReportIssueWidget() {
  const { lang } = useLanguage();
  const executeCaptcha = useRecaptcha();
  const t = reportIssueCopy[lang] ?? reportIssueCopy.ro;

  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<{ text: string; field?: "email" | "message" } | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const dialogTitleId = useId();
  const dialogBodyId = useId();
  const emailId = useId();
  const messageId = useId();
  const errorId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      const root = document.documentElement;
      const previous = root.style.overflow;
      root.style.overflow = "hidden";
      return () => {
        root.style.overflow = previous;
      };
    }
    if (!open && dialog.open) dialog.close();
  }, [open]);

  function openDialog() {
    setError(null);
    setSuccess(null);
    setOpen(true);
  }

  useEffect(() => {
    const handleOpen = (event: Event) => {
      event.preventDefault();
      setError(null);
      setSuccess(null);
      setOpen(true);
    };
    window.addEventListener(OPEN_EVENT, handleOpen);
    return () => window.removeEventListener(OPEN_EVENT, handleOpen);
  }, []);

  function handleBackdropClick(event: MouseEvent<HTMLDialogElement>) {
    // Clicks on the dimmed area land on the <dialog> itself; clicks inside land on its children.
    if (event.target === event.currentTarget) setOpen(false);
  }

  async function submitReport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const trimmedEmail = email.trim();
    if (trimmedEmail && !EMAIL_PATTERN.test(trimmedEmail)) {
      setError({ text: t.invalidEmail, field: "email" });
      return;
    }
    if (message.trim().length < 10) {
      setError({ text: t.tooShort, field: "message" });
      return;
    }

    setIsSubmitting(true);
    try {
      const captchaToken = await executeCaptcha("issue_report");
      const response = await fetch("/api/report-issue", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: trimmedEmail,
          message: message.trim(),
          pageUrl: window.location.href,
          userAgent: navigator.userAgent,
          captchaToken,
        }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as { code?: string };
        setError({ text: errorForResponse(response.status, data.code, t) });
        return;
      }

      setSuccess(t.success);
      setMessage("");
      setEmail("");
    } catch (caught) {
      setError({ text: captchaErrorMessage(caught, t.genericError) });
    } finally {
      setIsSubmitting(false);
    }
  }

  const fieldClass =
    "w-full rounded-lg border bg-background text-base text-foreground placeholder:text-muted-foreground/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:text-sm";

  return (
    <>
      {/* From 1024px only: on phones and tablets it covered body text and the topic action bar; the footer link opens the same form there. */}
      <button
        type="button"
        onClick={openDialog}
        aria-label={t.trigger}
        aria-haspopup="dialog"
        className="report-issue-trigger group fixed bottom-3 right-3 z-30 hidden h-10 w-10 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground shadow-xs transition-colors duration-(--dur-fast) ease-(--ease-out-calm) lg:flex hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <AlertCircleIcon className="h-[18px] w-[18px]" aria-hidden="true" />
        {/* Label on hover or keyboard focus only, above the icon so adjacent bottom-right controls stay clear. */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute right-0 bottom-full mb-2 whitespace-nowrap rounded-md bg-ink-950 px-2.5 py-1.5 text-xs font-medium text-white opacity-0 shadow-xs transition-opacity duration-(--dur-fast) group-hover:opacity-100 group-focus-visible:opacity-100"
        >
          {t.trigger}
        </span>
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby={dialogTitleId}
        aria-describedby={dialogBodyId}
        onClose={() => setOpen(false)}
        onClick={handleBackdropClick}
        className={[
          "m-0 mt-auto w-full max-w-none overflow-visible bg-transparent p-0 text-foreground",
          "sm:m-auto sm:w-[calc(100%-2rem)] sm:max-w-xl",
          "backdrop:bg-ink-950/45",
          "transition-[opacity,translate] duration-(--dur-base) ease-(--ease-out-calm)",
          "starting:open:translate-y-2 starting:open:opacity-0",
        ].join(" ")}
      >
        <div className="flex max-h-[90dvh] flex-col overflow-y-auto rounded-t-xl border-t border-border bg-card p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-xl sm:rounded-xl sm:border sm:pb-5">
          <div className="mb-4 flex items-start justify-between gap-3 border-b border-border pb-4">
            <div className="min-w-0">
              <h2 id={dialogTitleId} className="text-lg font-semibold text-foreground">
                {t.modalTitle}
              </h2>
              <p id={dialogBodyId} className="mt-0.5 text-sm text-muted-foreground">
                {t.modalBody}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label={t.close}
              className="-mr-1.5 -mt-1 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors duration-(--dur-fast) hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <CloseIcon className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={submitReport} noValidate className="space-y-4">
            <div>
              <label htmlFor={emailId} className="mb-1.5 block text-sm font-medium text-foreground">
                {t.emailLabel}
              </label>
              <div className="relative">
                <MailIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id={emailId}
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder={t.emailPlaceholder}
                  aria-invalid={error?.field === "email" || undefined}
                  aria-describedby={error?.field === "email" ? errorId : undefined}
                  className={`${fieldClass} min-h-11 py-2 pl-9 pr-3 ${error?.field === "email" ? "border-primary" : "border-border-control"}`}
                />
              </div>
            </div>

            <div>
              <label htmlFor={messageId} className="mb-1.5 block text-sm font-medium text-foreground">
                {t.messageLabel}
              </label>
              <textarea
                id={messageId}
                required
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder={t.messagePlaceholder}
                rows={5}
                aria-invalid={error?.field === "message" || undefined}
                aria-describedby={error?.field === "message" ? errorId : undefined}
                className={`${fieldClass} px-3 py-2 ${error?.field === "message" ? "border-primary" : "border-border-control"}`}
              />
            </div>

            {error ? (
              <p id={errorId} role="alert" className="flex items-start gap-2 rounded-lg border border-primary/30 bg-primary-soft/50 px-3 py-2 text-sm text-primary-active">
                <AlertCircleIcon className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error.text}</span>
              </p>
            ) : null}
            {success ? (
              <p role="status" className="rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm font-medium text-foreground">
                {success}
              </p>
            ) : null}

            <div className="flex items-center justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                {t.cancel}
              </Button>
              <Button type="submit" variant="secondary" disabled={isSubmitting}>
                {isSubmitting ? t.sending : t.send}
              </Button>
            </div>
          </form>
        </div>
      </dialog>
    </>
  );
}
