"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/Button";
import { HandHelpingIcon, XIcon } from "@/components/ui/icons";
import { useRecaptcha } from "@/components/security/RecaptchaProvider";
import { useLanguage } from "@/lib/i18n/language-context";
import { getOfflineUiCopy } from "@/lib/i18n/offline-copy";
import { DEFAULT_LANG, withLangPrefix } from "@/lib/i18n/routing";
import type { Lang } from "@/lib/i18n/translations";
import { isBrowserOffline } from "@/lib/pwa/use-online-status";
import { ROMANIAN_COUNTIES } from "@/lib/romanian-counties";
import {
  callbackStarterCopy,
  isValidCallbackPhone,
  normalizeCallbackPhone,
} from "@/components/mediator/MediatorCallbackStarter";
import { textInput } from "@/components/health-assistant/step-ui";

interface MediatorRequestModalProps {
  /** Scenario title sent to the mediator inbox (mediators read it in Romanian). */
  defaultScenario?: string;
  className?: string;
}

const dict = {
  ru: {
    trigger: "Помощь медиатора",
    title: "Запросить медиатора по вопросам общественного здравоохранения",
    subtitle:
      "Медиатор по вопросам здравоохранения – это человек из вашего сообщества, который бесплатно помогает вам с врачами, документами и посещениями больниц.",
    nameLabel: "Ваше имя или инициалы",
    namePlaceholder: "Например: Мария И.",
    phoneLabel: "Номер телефона",
    phonePlaceholder: "Например: 07xx xxx xxx",
    countyLabel: "Округ",
    countyPlaceholder: "Выберите свой округ",
    locationLabel: "Город или деревня (по желанию)",
    locationPlaceholder: "Например: Флорешты",
    consent: "Я прочитал и согласен с",
    privacyLink: "Политика конфиденциальности",
    required: "требуется",
    submitButton: "Отправить запрос",
    submitting: "Отправка…",
    cancel: "Отмена",
    phoneError: "Пожалуйста, введите номер телефона, по которому мы можем вам позвонить (минимум 8 цифр).",
    countyError: "Пожалуйста, выберите свой округ.",
    consentError: "Пожалуйста, подтвердите, что вы согласны с Политикой конфиденциальности.",
    sendError: "Нам не удалось отправить ваш запрос. Пожалуйста, повторите попытку через несколько минут.",
    rateLimitError: "С этого устройства было отправлено слишком много запросов. Пожалуйста, повторите попытку немного позже.",
    successTitle: "Ваш запрос отправлен",
    successMessage:
      "Посредник по вопросам здравоохранения из вашего региона позвонит вам как можно скорее, обычно в течение 24 часов.",
    close: "Закрыть",
  },

  en: {
    trigger: "Ask a health mediator",
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
    phoneError: "Please enter a phone number we can call you on (at least 8 digits).",
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
    trigger: "Cere un mediator sanitar",
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
    phoneError: "Introdu un număr de telefon la care te putem suna (minimum 8 cifre).",
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
    trigger: "Kërko mediator shëndeti",
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
    phoneError: "Shkruaj një numër telefoni ku mund të të telefonojmë (të paktën 8 shifra).",
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
    trigger: "Chiedi un mediatore",
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
    phoneError: "Inserisci un numero a cui possiamo chiamarti (almeno 8 cifre).",
    countyError: "Scegli la provincia in cui ti trovi.",
    consentError: "Conferma di accettare l'Informativa sulla privacy.",
    sendError: "Non è stato possibile inviare la richiesta. Riprova tra qualche minuto.",
    rateLimitError: "Da questo dispositivo sono state inviate troppe richieste. Riprova un po' più tardi.",
    successTitle: "La tua richiesta è stata inviata",
    successMessage:
      "Un mediatore sanitario della tua zona ti chiamerà il prima possibile, di solito entro 24 ore.",
    close: "Chiudi",
  },
  hr: {
    trigger: "Zatraži medijatora",
    title: "Zatraži zdravstvenog medijatora iz zajednice",
    subtitle:
      "Zdravstveni medijator je osoba iz tvoje zajednice koja ti besplatno pomaže s liječnicima, dokumentima i odlascima u bolnicu.",
    nameLabel: "Tvoje ime ili inicijali",
    namePlaceholder: "Na primjer: Marija I.",
    phoneLabel: "Broj telefona",
    phonePlaceholder: "Na primjer: 07xx xxx xxx",
    countyLabel: "Županija ili okrug (județ)",
    countyPlaceholder: "Odaberi područje",
    locationLabel: "Mjesto ili naselje (nije obavezno)",
    locationPlaceholder: "Na primjer: Florești",
    consent: "Pročitao ili pročitala sam i prihvaćam",
    privacyLink: "Pravila privatnosti",
    required: "obavezno",
    submitButton: "Pošalji zahtjev",
    submitting: "Šalje se…",
    cancel: "Odustani",
    phoneError: "Unesi broj telefona na koji te možemo nazvati (najmanje 8 znamenki).",
    countyError: "Odaberi područje u kojem se nalaziš.",
    consentError: "Potvrdi da prihvaćaš Pravila privatnosti.",
    sendError: "Nismo uspjeli poslati zahtjev. Pokušaj ponovno za nekoliko minuta.",
    rateLimitError: "S ovog je uređaja poslano previše zahtjeva. Pokušaj ponovno malo kasnije.",
    successTitle: "Tvoj zahtjev je poslan",
    successMessage:
      "Zdravstveni medijator iz tvog područja nazvat će te što prije, obično u roku od 24 sata.",
    close: "Zatvori",
  },
  rom: {
    trigger: "Mang jekhe mediatores",
    title: "Mang jekhe sastipnaske mediatores katar i komuniteta",
    subtitle:
      "O sastipnasko mediatori si jekh manush katar i komuniteta so azhutinel tut bi lovengo le doktorensa, le lilensa thaj ki bolnitsa.",
    nameLabel: "Chiro anav vaj anglune litere",
    namePlaceholder: "Misal: Maria I.",
    phoneLabel: "Telefonesko numero",
    phonePlaceholder: "Misal: 07xx xxx xxx",
    countyLabel: "Judetso",
    countyPlaceholder: "Alosar o judetso",
    locationLabel: "Foro vaj gav (te manges)",
    locationPlaceholder: "Misal: Florești",
    consent: "Ginadem thaj kabulisarav",
    privacyLink: "Politika vash garavimos",
    required: "musaj",
    submitButton: "Bichav o mangimos",
    submitting: "Bichavel pe…",
    cancel: "Mekh",
    phoneError: "Ramov jekh telefonesko numero kaj shaj akharas tut (barem 8 cifre).",
    countyError: "Alosar o judetso kaj san.",
    consentError: "Phen kaj kabulisares i Politika vash garavimos.",
    sendError: "Nashti bichaldas o mangimos. Zumav pale pala nesave minutia.",
    rateLimitError: "But mangimata sas bichalde katar kadava aparati. Zumav pale maj palal.",
    successTitle: "Chiro mangimos sas bichaldo",
    successMessage:
      "Jekh sastipnasko mediatori katar chiro than ka akharel tut sigo, maj butivar ande 24 chasura.",
    close: "Phandav",
  },
} satisfies Record<Lang, Record<string, string>>;

export function MediatorRequestModal({ defaultScenario, className = "" }: MediatorRequestModalProps) {
  const { lang } = useLanguage();
  const executeCaptcha = useRecaptcha();
  const t = dict[lang] || dict[DEFAULT_LANG];
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
  /** Each message sits under its own field, so it is seen with the keyboard open. */
  const [errors, setErrors] = useState<{ phone?: string; county?: string; consent?: string }>({});
  const optionalTag = (callbackStarterCopy[lang] ?? callbackStarterCopy[DEFAULT_LANG]).optionalTag;

  const triggerRef = useRef<HTMLButtonElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
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
    setErrors({});
    triggerRef.current?.focus();
  }

  useEffect(() => {
    if (!isOpen) return;
    // The title, not a field: the keyboard stays down until the person has read what this is.
    titleRef.current?.focus();
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

    const nextErrors = {
      phone: isValidCallbackPhone(phone) ? undefined : t.phoneError,
      county: county ? undefined : t.countyError,
      consent: consent ? undefined : t.consentError,
    };
    setErrors(nextErrors);
    const firstInvalid = (["phone", "county", "consent"] as const).find((key) => nextErrors[key]);
    if (firstInvalid) {
      document.getElementById(`${ids}-${firstInvalid}`)?.focus();
      return;
    }
    const cleanedPhone = normalizeCallbackPhone(phone);
    if (isBrowserOffline()) {
      setErrorMessage(getOfflineUiCopy(lang).formOfflineError);
      return;
    }

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

  const inputClass = textInput;
  const fieldErrorClass = "swap-in mt-1.5 text-body font-medium text-primary dark:text-ruby-300";

  return (
    <div className={className}>
      <Button
        ref={triggerRef}
        type="button"
        variant="outline"
        size="lg"
        data-mediator-trigger
        onClick={() => setIsOpen(true)}
        className="w-full border-amber-care text-amber-care hover:border-amber-care hover:bg-amber-care-soft/40 sm:w-auto sm:px-5"
      >
        <HandHelpingIcon className="h-4 w-4 shrink-0" />
        <span className="min-w-0 truncate">{t.trigger}</span>
      </Button>

      {/* Portal: the triage step wrapper animates transform, which would trap a fixed overlay inside the card. */}
      {isOpen &&
        createPortal(
          <div className="scrim-in fixed inset-0 z-[60] flex items-end justify-center bg-black/50 sm:items-center sm:p-4">
            <div
              ref={dialogRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby={`${ids}-title`}
              className="dialog-in relative max-h-[100dvh] w-full max-w-lg overflow-y-auto rounded-t-2xl border border-border bg-card p-6 shadow-xl sm:rounded-2xl sm:p-7"
            >
              <button
                type="button"
                onClick={handleClose}
                className="press-row absolute right-3 top-3 inline-flex h-11 w-11 items-center justify-center rounded-xl text-muted-foreground transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label={t.close}
              >
                <XIcon className="h-5 w-5" />
              </button>

              {!submitted ? (
                <form onSubmit={handleSubmit} noValidate>
                  <h2
                    ref={titleRef}
                    tabIndex={-1}
                    id={`${ids}-title`}
                    className="pr-10 text-title font-semibold text-foreground focus:outline-none"
                  >
                    {t.title}
                  </h2>
                  <p className="mt-2 text-body text-muted-foreground">{t.subtitle}</p>

                  {/* What is needed comes first; what can be left empty says so in words, not with a star. */}
                  <div className="mt-5 space-y-4">
                    <div>
                      <label htmlFor={`${ids}-phone`} className="mb-1 block text-body font-semibold text-foreground">
                        {t.phoneLabel}
                      </label>
                      <input
                        id={`${ids}-phone`}
                        type="tel"
                        inputMode="tel"
                        autoComplete="tel"
                        required
                        value={phone}
                        onChange={(e) => {
                          setPhone(e.target.value);
                          if (errors.phone) setErrors((prev) => ({ ...prev, phone: undefined }));
                        }}
                        aria-invalid={Boolean(errors.phone)}
                        aria-describedby={errors.phone ? `${ids}-phone-error` : undefined}
                        placeholder={t.phonePlaceholder}
                        className={inputClass}
                      />
                      {errors.phone ? (
                        <p id={`${ids}-phone-error`} role="alert" className={fieldErrorClass}>
                          {errors.phone}
                        </p>
                      ) : null}
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label htmlFor={`${ids}-county`} className="mb-1 block text-body font-semibold text-foreground">
                          {t.countyLabel}
                        </label>
                        <select
                          id={`${ids}-county`}
                          required
                          value={county}
                          onChange={(e) => {
                            setCounty(e.target.value);
                            if (errors.county) setErrors((prev) => ({ ...prev, county: undefined }));
                          }}
                          aria-invalid={Boolean(errors.county)}
                          aria-describedby={errors.county ? `${ids}-county-error` : undefined}
                          className={inputClass}
                        >
                          <option value="">{t.countyPlaceholder}</option>
                          {ROMANIAN_COUNTIES.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                        {errors.county ? (
                          <p id={`${ids}-county-error`} role="alert" className={fieldErrorClass}>
                            {errors.county}
                          </p>
                        ) : null}
                      </div>
                      <div>
                        <label htmlFor={`${ids}-location`} className="mb-1 block text-body font-semibold text-foreground">
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

                    <div>
                      <label htmlFor={`${ids}-name`} className="mb-1 block text-body font-semibold text-foreground">
                        {t.nameLabel} <span className="font-normal text-muted-foreground">{optionalTag}</span>
                      </label>
                      <input
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
                    <label className="flex min-h-11 items-start gap-2.5 text-body text-foreground">
                      <input
                        id={`${ids}-consent`}
                        type="checkbox"
                        required
                        checked={consent}
                        onChange={(e) => {
                          setConsent(e.target.checked);
                          if (errors.consent) setErrors((prev) => ({ ...prev, consent: undefined }));
                        }}
                        aria-invalid={Boolean(errors.consent)}
                        aria-describedby={errors.consent ? `${ids}-consent-error` : undefined}
                        className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--color-sapphire)]"
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
                    {errors.consent ? (
                      <p id={`${ids}-consent-error`} role="alert" className={fieldErrorClass}>
                        {errors.consent}
                      </p>
                    ) : null}
                    </div>
                  </div>

                  {errorMessage && (
                    <p role="alert" className="mt-4 text-body font-medium text-primary dark:text-ruby-300">
                      {errorMessage}
                    </p>
                  )}

                  <div className="mt-6 flex flex-col-reverse items-stretch justify-end gap-3 sm:flex-row sm:items-center">
                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      onClick={handleClose}
                    >
                      {t.cancel}
                    </Button>
                    <Button
                      type="submit"
                      variant="action"
                      size="lg"
                      disabled={isSubmitting}
                      aria-busy={isSubmitting}
                    >
                      {isSubmitting ? t.submitting : t.submitButton}
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="swap-in py-2" role="status">
                  <h2 id={`${ids}-title`} className="text-title font-semibold text-foreground">
                    {t.successTitle}
                  </h2>
                  <p className="mt-2 max-w-sm text-body text-muted-foreground">{t.successMessage}</p>
                  <Button
                    ref={closeRef}
                    type="button"
                    variant="action"
                    size="lg"
                    onClick={handleClose}
                    className="mt-6"
                  >
                    {t.close}
                  </Button>
                </div>
              )}
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
