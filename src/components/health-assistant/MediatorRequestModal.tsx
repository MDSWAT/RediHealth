"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CheckCircleIcon, HandHelpingIcon, XIcon } from "@/components/ui/icons";
import { useRecaptcha } from "@/components/security/RecaptchaProvider";
import { useLanguage } from "@/lib/i18n/language-context";
import { DEFAULT_LANG, withLangPrefix } from "@/lib/i18n/routing";
import { ROMANIAN_COUNTIES } from "@/lib/romanian-counties";

interface MediatorRequestModalProps {
  /** Scenario title sent to the mediator inbox (mediators read it in Romanian). */
  defaultScenario?: string;
  className?: string;
}

const dict = {
  en: {
    trigger: "Request a health mediator",
    title: "Request a community health mediator",
    subtitle:
      "A health mediator is someone from your community who helps you, free of charge, with doctors, papers and hospital visits.",
    nameLabel: "Your name or initials",
    namePlaceholder: "For example: Maria I.",
    phoneLabel: "Phone number",
    phonePlaceholder: "For example: 07xx xxx xxx",
    countyLabel: "County",
    countyPlaceholder: "Choose your county",
    locationLabel: "Town or village (optional)",
    locationPlaceholder: "For example: Florești",
    consent: "I have read and agree to the",
    privacyLink: "Privacy Policy",
    required: "required",
    submitButton: "Send request",
    submitting: "Sending…",
    cancel: "Cancel",
    phoneError: "Please enter a phone number we can call you on (at least 10 digits).",
    countyError: "Please choose your county.",
    consentError: "Please confirm that you agree to the Privacy Policy.",
    sendError: "We could not send your request. Please try again in a few minutes.",
    rateLimitError: "Too many requests were sent from this device. Please try again a little later.",
    successTitle: "Your request has been sent",
    successMessage:
      "A health mediator from your area will call you as soon as possible, usually within 24 hours.",
    close: "Close",
  },
  ro: {
    trigger: "Cere ajutorul unui mediator sanitar",
    title: "Cere ajutorul unui mediator sanitar",
    subtitle:
      "Mediatorul sanitar este o persoană din comunitate care te ajută gratuit cu medicii, actele și drumurile la spital.",
    nameLabel: "Numele sau inițialele tale",
    namePlaceholder: "De exemplu: Maria I.",
    phoneLabel: "Număr de telefon",
    phonePlaceholder: "De exemplu: 07xx xxx xxx",
    countyLabel: "Județ",
    countyPlaceholder: "Alege județul",
    locationLabel: "Localitate (opțional)",
    locationPlaceholder: "De exemplu: Florești",
    consent: "Am citit și sunt de acord cu",
    privacyLink: "Politica de confidențialitate",
    required: "obligatoriu",
    submitButton: "Trimite cererea",
    submitting: "Se trimite…",
    cancel: "Anulează",
    phoneError: "Introdu un număr de telefon la care te putem suna (minimum 10 cifre).",
    countyError: "Alege județul în care te afli.",
    consentError: "Confirmă că ești de acord cu Politica de confidențialitate.",
    sendError: "Nu am putut trimite cererea. Încearcă din nou peste câteva minute.",
    rateLimitError: "Ai trimis prea multe cereri de pe acest dispozitiv. Încearcă din nou mai târziu.",
    successTitle: "Cererea a fost trimisă",
    successMessage:
      "Un mediator sanitar din zona ta te va suna cât mai curând, de obicei în 24 de ore.",
    close: "Închide",
  },
  sq: {
    trigger: "Kërko një mediator shëndetësor",
    title: "Kërko një mediator shëndetësor nga komuniteti",
    subtitle:
      "Mediatori shëndetësor është një person nga komuniteti që të ndihmon falas me mjekët, dokumentet dhe vizitat në spital.",
    nameLabel: "Emri ose inicialet e tua",
    namePlaceholder: "Për shembull: Maria I.",
    phoneLabel: "Numri i telefonit",
    phonePlaceholder: "Për shembull: 07xx xxx xxx",
    countyLabel: "Qarku (județ)",
    countyPlaceholder: "Zgjidh qarkun",
    locationLabel: "Qyteti ose fshati (sipas dëshirës)",
    locationPlaceholder: "Për shembull: Florești",
    consent: "E kam lexuar dhe pranoj",
    privacyLink: "Politikën e Privatësisë",
    required: "e detyrueshme",
    submitButton: "Dërgo kërkesën",
    submitting: "Po dërgohet…",
    cancel: "Anulo",
    phoneError: "Shkruaj një numër telefoni ku mund të të telefonojmë (të paktën 10 shifra).",
    countyError: "Zgjidh qarkun ku ndodhesh.",
    consentError: "Konfirmo që pranon Politikën e Privatësisë.",
    sendError: "Nuk mundëm ta dërgojmë kërkesën. Provo përsëri pas pak minutash.",
    rateLimitError: "Nga kjo pajisje janë dërguar shumë kërkesa. Provo përsëri pak më vonë.",
    successTitle: "Kërkesa jote u dërgua",
    successMessage:
      "Një mediator shëndetësor nga zona jote do të të telefonojë sa më shpejt, zakonisht brenda 24 orëve.",
    close: "Mbyll",
  },
  it: {
    trigger: "Chiedi un mediatore sanitario",
    title: "Chiedi un mediatore sanitario di comunità",
    subtitle:
      "Il mediatore sanitario è una persona della comunità che ti aiuta gratuitamente con medici, documenti e visite in ospedale.",
    nameLabel: "Nome o iniziali",
    namePlaceholder: "Ad esempio: Maria I.",
    phoneLabel: "Numero di telefono",
    phonePlaceholder: "Ad esempio: 07xx xxx xxx",
    countyLabel: "Provincia (județ)",
    countyPlaceholder: "Scegli la provincia",
    locationLabel: "Comune o località (facoltativo)",
    locationPlaceholder: "Ad esempio: Florești",
    consent: "Ho letto e accetto la",
    privacyLink: "Informativa sulla privacy",
    required: "obbligatorio",
    submitButton: "Invia la richiesta",
    submitting: "Invio in corso…",
    cancel: "Annulla",
    phoneError: "Inserisci un numero a cui possiamo chiamarti (almeno 10 cifre).",
    countyError: "Scegli la provincia in cui ti trovi.",
    consentError: "Conferma di accettare l'Informativa sulla privacy.",
    sendError: "Non è stato possibile inviare la richiesta. Riprova tra qualche minuto.",
    rateLimitError: "Da questo dispositivo sono state inviate troppe richieste. Riprova un po' più tardi.",
    successTitle: "La tua richiesta è stata inviata",
    successMessage:
      "Un mediatore sanitario della tua zona ti chiamerà il prima possibile, di solito entro 24 ore.",
    close: "Chiudi",
  },
};

export function MediatorRequestModal({ defaultScenario, className = "" }: MediatorRequestModalProps) {
  const { lang } = useLanguage();
  const executeCaptcha = useRecaptcha();
  const t = dict[lang as keyof typeof dict] || dict[DEFAULT_LANG];
  const ids = useId();

  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [county, setCounty] = useState("");
  const [location, setLocation] = useState("");
  const [consent, setConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const triggerRef = useRef<HTMLButtonElement>(null);
  const firstFieldRef = useRef<HTMLInputElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  function handleClose() {
    setIsOpen(false);
    setSubmitted(false);
    setName("");
    setPhone("");
    setCounty("");
    setLocation("");
    setConsent(false);
    setErrorMessage("");
    triggerRef.current?.focus();
  }

  useEffect(() => {
    if (!isOpen) return;
    firstFieldRef.current?.focus();
    // Capture phase + preventDefault: Escape closes the dialog without also stepping the triage back.
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        setIsOpen(false);
        triggerRef.current?.focus();
        return;
      }
      // Keep Tab inside the dialog while it is open.
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        "button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled])",
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", handleKeyDown, true);
    return () => document.removeEventListener("keydown", handleKeyDown, true);
  }, [isOpen]);

  useEffect(() => {
    if (submitted) closeRef.current?.focus();
  }, [submitted]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setErrorMessage("");

    const cleanedPhone = phone.replace(/[^0-9+]/g, "");
    if (cleanedPhone.length < 10) return setErrorMessage(t.phoneError);
    if (!county) return setErrorMessage(t.countyError);
    if (!consent) return setErrorMessage(t.consentError);

    setIsSubmitting(true);
    try {
      const captchaToken = await executeCaptcha("help_request");
      const response = await fetch("/api/medical-help-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim() || "Anonim",
          phone: cleanedPhone,
          description: `Cerere mediator sanitar din triaj (Scenariu: ${defaultScenario || "nedefinit"}, Localitate: ${location.trim() || "nespecificată"})`,
          country: "RO",
          county,
          privacyConsent: true,
          captchaToken,
        }),
      });
      if (!response.ok) {
        setErrorMessage(response.status === 429 ? t.rateLimitError : t.sendError);
        return;
      }
      setSubmitted(true);
    } catch {
      setErrorMessage(t.sendError);
    } finally {
      setIsSubmitting(false);
    }
  }

  const inputClass =
    "min-h-[44px] w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire";

  return (
    <div className={className}>
      <button
        ref={triggerRef}
        type="button"
        data-mediator-trigger
        onClick={() => setIsOpen(true)}
        className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg border border-amber-care bg-card px-4 py-2.5 text-center text-sm font-semibold text-amber-care transition-colors duration-[var(--dur-fast)] hover:bg-amber-care-soft/40 sm:w-auto"
      >
        <HandHelpingIcon className="h-4 w-4 shrink-0" />
        <span>{t.trigger}</span>
      </button>

      {/* Portal: the triage step wrapper animates transform, which would trap a fixed overlay inside the card. */}
      {isOpen &&
        createPortal(
          <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 sm:items-center sm:p-4">
            <div
              ref={dialogRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby={`${ids}-title`}
              className="assistant-step-in relative max-h-[100dvh] w-full max-w-lg overflow-y-auto rounded-t-xl border border-border bg-card p-6 shadow-xl sm:rounded-xl sm:p-7"
            >
              <button
                type="button"
                onClick={handleClose}
                className="absolute right-3 top-3 inline-flex h-11 w-11 items-center justify-center rounded-lg text-muted-foreground transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-muted hover:text-foreground"
                aria-label={t.close}
              >
                <XIcon className="h-5 w-5" />
              </button>

              {!submitted ? (
                <form onSubmit={handleSubmit} noValidate>
                  <h2 id={`${ids}-title`} className="pr-10 text-lg font-semibold text-foreground">
                    {t.title}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t.subtitle}</p>

                  <div className="mt-5 space-y-4">
                    <div>
                      <label htmlFor={`${ids}-name`} className="mb-1 block text-sm font-semibold text-foreground">
                        {t.nameLabel}
                      </label>
                      <input
                        ref={firstFieldRef}
                        id={`${ids}-name`}
                        type="text"
                        autoComplete="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={t.namePlaceholder}
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label htmlFor={`${ids}-phone`} className="mb-1 block text-sm font-semibold text-foreground">
                        {t.phoneLabel} <span className="text-primary" aria-hidden="true">*</span>
                        <span className="sr-only"> ({t.required})</span>
                      </label>
                      <input
                        id={`${ids}-phone`}
                        type="tel"
                        inputMode="tel"
                        autoComplete="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder={t.phonePlaceholder}
                        className={inputClass}
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label htmlFor={`${ids}-county`} className="mb-1 block text-sm font-semibold text-foreground">
                          {t.countyLabel} <span className="text-primary" aria-hidden="true">*</span>
                          <span className="sr-only"> ({t.required})</span>
                        </label>
                        <select
                          id={`${ids}-county`}
                          required
                          value={county}
                          onChange={(e) => setCounty(e.target.value)}
                          className={inputClass}
                        >
                          <option value="">{t.countyPlaceholder}</option>
                          {ROMANIAN_COUNTIES.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label htmlFor={`${ids}-location`} className="mb-1 block text-sm font-semibold text-foreground">
                          {t.locationLabel}
                        </label>
                        <input
                          id={`${ids}-location`}
                          type="text"
                          autoComplete="address-level2"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          placeholder={t.locationPlaceholder}
                          className={inputClass}
                        />
                      </div>
                    </div>

                    <label className="flex items-start gap-2.5 text-sm leading-relaxed text-foreground">
                      <input
                        type="checkbox"
                        required
                        checked={consent}
                        onChange={(e) => setConsent(e.target.checked)}
                        className="mt-1 h-4 w-4 shrink-0 accent-[var(--color-sapphire)]"
                      />
                      <span>
                        {t.consent}{" "}
                        <a
                          href={withLangPrefix("/privacy", lang)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-sapphire underline underline-offset-2 dark:text-sapphire-border"
                        >
                          {t.privacyLink}
                        </a>
                        .
                      </span>
                    </label>
                  </div>

                  {errorMessage && (
                    <p role="alert" className="mt-4 text-sm font-medium text-red-700 dark:text-red-300">
                      {errorMessage}
                    </p>
                  )}

                  <div className="mt-6 flex flex-col-reverse items-stretch justify-end gap-3 sm:flex-row sm:items-center">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="inline-flex min-h-[44px] items-center justify-center rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-muted"
                    >
                      {t.cancel}
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      aria-busy={isSubmitting}
                      className="inline-flex min-h-[44px] items-center justify-center rounded-lg bg-sapphire px-5 py-2 text-sm font-semibold text-white transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-sapphire-light disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
                    >
                      {isSubmitting ? t.submitting : t.submitButton}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="py-2" role="status">
                  <CheckCircleIcon className="h-7 w-7 text-sapphire dark:text-sapphire-border" />
                  <h2 id={`${ids}-title`} className="mt-3 text-lg font-semibold text-foreground">
                    {t.successTitle}
                  </h2>
                  <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">{t.successMessage}</p>
                  <button
                    ref={closeRef}
                    type="button"
                    onClick={handleClose}
                    className="mt-6 inline-flex min-h-[44px] items-center justify-center rounded-lg bg-sapphire px-6 py-2.5 text-sm font-semibold text-white transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-sapphire-light"
                  >
                    {t.close}
                  </button>
                </div>
              )}
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
