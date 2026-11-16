"use client";

import Link from "next/link";
import { useContext, useEffect, useId, useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { LockIcon, PhoneIcon } from "@/components/ui/icons";
import { captchaErrorMessage, useRecaptcha } from "@/components/security/RecaptchaProvider";
import type { CountryCode } from "@/lib/countries";
import { LanguageContext } from "@/lib/i18n/language-context";
import { DEFAULT_LANG, REQUEST_LANG_HEADER, withLangPrefix } from "@/lib/i18n/routing";
import type { Lang } from "@/lib/i18n/translations";
import { isRomanianCounty, ROMANIAN_COUNTIES } from "@/lib/romanian-counties";
import type { CaptchaAction } from "@/lib/security/recaptcha";

export type CallbackStarterCopy = {
  title: string;
  lead: string;
  reassurance: string;
  fullFormPrompt: string;
  fullFormLink: string;
  countyLabel: string;
  countyPlaceholder: string;
  countyError: string;
  phoneLabel: string;
  phonePlaceholder: string;
  phoneHint: string;
  phoneError: string;
  nameLabel: string;
  optionalTag: string;
  namePlaceholder: string;
  privacyConsent: string;
  privacyPolicyLabel: string;
  privacyConsentError: string;
  submit: string;
  submitting: string;
  genericError: string;
  rateLimitError: string;
  successTitle: string;
  successBody: (county: string, phone: string) => string;
  successNotice: string;
  sendAnother: string;
};

export const callbackStarterCopy: Record<Lang, CallbackStarterCopy> = {
  ro: {
    title: "Cere să fii sunat de un mediator",
    lead: "Lasă județul și numărul tău de telefon. Un mediator sanitar din zona ta te sună înapoi, fără plată și fără programare.",
    reassurance: "Datele tale rămân confidențiale și sunt folosite doar ca să te contactăm.",
    fullFormPrompt: "Vrei să descrii mai pe larg situația ta?",
    fullFormLink: "Deschide formularul lung",
    countyLabel: "Județ",
    countyPlaceholder: "Alege județul",
    countyError: "Alege județul în care te afli.",
    phoneLabel: "Număr de telefon",
    phonePlaceholder: "0721 000 000",
    phoneHint: "Scrie numărul la care te putem suna.",
    phoneError: "Scrie un număr de telefon valid, cu cel puțin 8 cifre.",
    nameLabel: "Numele sau inițialele tale",
    optionalTag: "(opțional)",
    namePlaceholder: "De exemplu: Maria I.",
    privacyConsent: "Am citit și sunt de acord cu",
    privacyPolicyLabel: "politica de confidențialitate",
    privacyConsentError: "Bifează acordul cu politica de confidențialitate.",
    submit: "Cere să fii sunat",
    submitting: "Se trimite…",
    genericError: "Cererea nu s-a putut trimite. Încearcă din nou.",
    rateLimitError: "Ai trimis prea multe cereri de pe acest dispozitiv. Încearcă din nou mai târziu.",
    successTitle: "Cererea ta de apel a fost trimisă",
    successBody: (county, phone) =>
      `Un mediator sanitar din județul ${county} va suna la numărul ${phone} cât mai curând, de obicei în 24 de ore.`,
    successNotice: "Acest serviciu nu este pentru urgențe. Dacă este o urgență medicală, sună imediat la 112.",
    sendAnother: "Trimite alt număr",
  },
  en: {
    title: "Request a mediator callback",
    lead: "Leave your county and phone number. A community health mediator from your area calls you back free of charge.",
    reassurance: "Your details stay confidential and are used only to call you back.",
    fullFormPrompt: "Need to explain more details about what you need?",
    fullFormLink: "Open the full form",
    countyLabel: "County",
    countyPlaceholder: "Choose your county",
    countyError: "Choose your county.",
    phoneLabel: "Phone number",
    phonePlaceholder: "0721 000 000",
    phoneHint: "Enter a number where we can reach you.",
    phoneError: "Enter a valid phone number with at least 8 digits.",
    nameLabel: "Your name or initials",
    optionalTag: "(optional)",
    namePlaceholder: "For example: Maria I.",
    privacyConsent: "I have read and agree to the",
    privacyPolicyLabel: "privacy policy",
    privacyConsentError: "Tick the box to agree to the privacy policy.",
    submit: "Request a callback",
    submitting: "Sending…",
    genericError: "Your request could not be sent. Try again.",
    rateLimitError: "Too many requests were sent from this device. Please try again later.",
    successTitle: "Your callback request was sent",
    successBody: (county, phone) =>
      `A community health mediator in ${county} will call ${phone} as soon as possible, usually within 24 hours.`,
    successNotice: "This service is not for emergencies. If it is a medical emergency, call 112 right away.",
    sendAnother: "Send another number",
  },
  sq: {
    title: "Kërko të të telefonojë një mediator",
    lead: "Lë qarkun dhe numrin tënd të telefonit. Një mediator shëndetësor nga zona jote të merr në telefon falas.",
    reassurance: "Të dhënat e tua mbeten konfidenciale dhe përdoren vetëm për të të telefonuar.",
    fullFormPrompt: "Do të shkruash më shumë hollësi për atë që të duhet?",
    fullFormLink: "Hap formularin e plotë",
    countyLabel: "Qarku",
    countyPlaceholder: "Zgjidh qarkun",
    countyError: "Zgjidh qarkun ku ndodhesh.",
    phoneLabel: "Numri i telefonit",
    phonePlaceholder: "0721 000 000",
    phoneHint: "Shkruaj numrin ku mund të të gjejmë.",
    phoneError: "Shkruaj një numër telefoni të vlefshëm me të paktën 8 shifra.",
    nameLabel: "Emri ose inicialet e tua",
    optionalTag: "(sipas dëshirës)",
    namePlaceholder: "Për shembull: Maria I.",
    privacyConsent: "E kam lexuar dhe pranoj",
    privacyPolicyLabel: "politikën e privatësisë",
    privacyConsentError: "Shëno kutinë që pranon politikën e privatësisë.",
    submit: "Kërko një telefonatë",
    submitting: "Po dërgohet…",
    genericError: "Kërkesa nuk u dërgua dot. Provo përsëri.",
    rateLimitError: "Janë dërguar shumë kërkesa nga kjo pajisje. Provo përsëri më vonë.",
    successTitle: "Kërkesa jote për telefonatë u dërgua",
    successBody: (county, phone) =>
      `Një mediator shëndetësor në ${county} do të telefonojë në ${phone} sa më shpejt, zakonisht brenda 24 orëve.`,
    successNotice: "Ky shërbim nuk është për urgjenca. Nëse është urgjencë mjekësore, telefono menjëherë 112.",
    sendAnother: "Dërgo numër tjetër",
  },
  it: {
    title: "Chiedi di essere richiamato da un mediatore",
    lead: "Lascia la tua provincia e il numero di telefono. Un mediatore sanitario della tua zona ti richiama gratuitamente.",
    reassurance: "I tuoi dati restano riservati e servono solo per richiamarti.",
    fullFormPrompt: "Vuoi aggiungere più dettagli su ciò di cui hai bisogno?",
    fullFormLink: "Apri il modulo completo",
    countyLabel: "Provincia",
    countyPlaceholder: "Scegli la provincia",
    countyError: "Scegli la provincia in cui ti trovi.",
    phoneLabel: "Numero di telefono",
    phonePlaceholder: "0721 000 000",
    phoneHint: "Scrivi il numero a cui possiamo trovarti.",
    phoneError: "Inserisci un numero di telefono valido con almeno 8 cifre.",
    nameLabel: "Nome o iniziali",
    optionalTag: "(facoltativo)",
    namePlaceholder: "Ad esempio: Maria I.",
    privacyConsent: "Ho letto e accetto",
    privacyPolicyLabel: "l'informativa sulla privacy",
    privacyConsentError: "Spunta la casella per accettare l'informativa sulla privacy.",
    submit: "Chiedi di richiamarti",
    submitting: "Invio in corso…",
    genericError: "La richiesta non è partita. Riprova.",
    rateLimitError: "Sono state inviate troppe richieste da questo dispositivo. Riprova più tardi.",
    successTitle: "La tua richiesta di chiamata è stata inviata",
    successBody: (county, phone) =>
      `Un mediatore sanitario della provincia di ${county} chiamerà il numero ${phone} il prima possibile, di solito entro 24 ore.`,
    successNotice: "Questo servizio non è per le emergenze. Se è un'emergenza medica, chiama subito il 112.",
    sendAnother: "Invia un altro numero",
  },
  hr: {
    title: "Zatraži povratni poziv medijatora",
    lead: "Ostavi svoje područje i broj telefona. Zdravstveni medijator iz tvog kraja nazvat će te besplatno.",
    reassurance: "Tvoji podaci ostaju povjerljivi i koriste se samo za povratni poziv.",
    fullFormPrompt: "Želiš napisati više pojedinosti o tome što ti treba?",
    fullFormLink: "Otvori puni obrazac",
    countyLabel: "Okrug",
    countyPlaceholder: "Odaberi okrug",
    countyError: "Odaberi okrug u kojem se nalaziš.",
    phoneLabel: "Broj telefona",
    phonePlaceholder: "0721 000 000",
    phoneHint: "Upiši broj na koji te možemo nazvati.",
    phoneError: "Upiši valjani broj telefona s najmanje 8 znamenki.",
    nameLabel: "Tvoje ime ili inicijali",
    optionalTag: "(nije obavezno)",
    namePlaceholder: "Na primjer: Marija I.",
    privacyConsent: "Pročitao sam i prihvaćam",
    privacyPolicyLabel: "pravila privatnosti",
    privacyConsentError: "Označi kućicu da prihvaćaš pravila privatnosti.",
    submit: "Zatraži povratni poziv",
    submitting: "Slanje…",
    genericError: "Zahtjev nije poslan. Pokušaj ponovno.",
    rateLimitError: "S ovog je uređaja poslano previše zahtjeva. Pokušaj ponovno kasnije.",
    successTitle: "Tvoj zahtjev za poziv je poslan",
    successBody: (county, phone) =>
      `Zdravstveni medijator za područje ${county} nazvat će broj ${phone} što prije, obično u roku od 24 sata.`,
    successNotice: "Ova usluga nije za hitne slučajeve. Ako je hitan medicinski slučaj, odmah nazovi 112.",
    sendAnother: "Pošalji drugi broj",
  },
  rom: {
    title: "Mang te akharel tut ekh mediatori",
    lead: "Mukh chi rig thaj cho telefonesko gin. Ekh sastipnasko mediatori katar cho than ka akharel tut bi lovesko.",
    reassurance: "Che date achhen garavde thaj labaren pes numay te akharas tut palpale.",
    fullFormPrompt: "Kames te lekhaves may but vash so trubul tut?",
    fullFormLink: "Putar o baro formularo",
    countyLabel: "Rig",
    countyPlaceholder: "Alosar chi rig",
    countyError: "Alosar chi rig kay san.",
    phoneLabel: "Telefonesko gin",
    phonePlaceholder: "0721 000 000",
    phoneHint: "Lekhav o gin kay shaj akharas tut.",
    phoneError: "Lekhav ekh chacho telefonesko gin, barem 8 cifrenca.",
    nameLabel: "Cho anav vay anglune litere",
    optionalTag: "(te kames)",
    namePlaceholder: "Misal: Maria I.",
    privacyConsent: "Gindem thaj kamav e",
    privacyPolicyLabel: "garavipnaske pravila",
    privacyConsentError: "Chiv semno ando kvadrato te kames e garavipnaske pravila.",
    submit: "Mang te akharel tut",
    submitting: "Bichhalel pes…",
    genericError: "O mangipe na bichhaldilo. Zumav palem.",
    rateLimitError: "But mangimata sas bichalde katar kadava aparati. Zumav palem may palal.",
    successTitle: "Cho mangipe vash akharipe bichhaldilo",
    successBody: (county, phone) =>
      `Ekh sastipnasko mediatori katar ${county} ka akharel o gin ${phone} sigo, may butivar ande 24 ore.`,
    successNotice: "Kadava servisi nane vash i sigardiari. Te si sastipnaski sigardiari, akhar sigo ko 112.",
    sendAnother: "Bichhal aver gin",
  },
  ru: {
    title: "Закажите обратный звонок медиатора",
    lead: "Оставьте ваш округ и номер телефона. Медицинский медиатор из вашего района перезвонит вам бесплатно.",
    reassurance: "Ваши данные остаются конфиденциальными и нужны только для обратного звонка.",
    fullFormPrompt: "Хотите подробнее описать свою ситуацию?",
    fullFormLink: "Открыть полную форму",
    countyLabel: "Округ",
    countyPlaceholder: "Выберите округ",
    countyError: "Выберите ваш округ.",
    phoneLabel: "Номер телефона",
    phonePlaceholder: "0721 000 000",
    phoneHint: "Укажите номер, на который мы можем позвонить.",
    phoneError: "Введите корректный номер телефона (минимум 8 цифр).",
    nameLabel: "Ваше имя или инициалы",
    optionalTag: "(необязательно)",
    namePlaceholder: "Например: Мария И.",
    privacyConsent: "Я прочитал и согласен с",
    privacyPolicyLabel: "политикой конфиденциальности",
    privacyConsentError: "Отметьте согласие с политикой конфиденциальности.",
    submit: "Заказать обратный звонок",
    submitting: "Отправка…",
    genericError: "Не удалось отправить запрос. Попробуйте ещё раз.",
    rateLimitError: "С этого устройства отправлено слишком много запросов. Попробуйте позже.",
    successTitle: "Запрос на обратный звонок отправлен",
    successBody: (county, phone) =>
      `Медицинский медиатор в округе ${county} позвонит на номер ${phone} как можно скорее, обычно в течение 24 часов.`,
    successNotice: "Эта служба не для экстренных случаев. При неотложной ситуации немедленно звоните 112.",
    sendAnother: "Отправить другой номер",
  },
};

export type CallbackStarterErrors = {
  county?: string;
  phone?: string;
  privacyConsent?: string;
};

export type CallbackPayload = {
  name: string;
  phone: string;
  description: string;
  country: CountryCode;
  county: string;
  privacyConsent: true;
  captchaToken: string;
};

const inputClass =
  "field-focus mt-1.5 block w-full min-h-12 rounded-lg border border-border-control bg-card px-3.5 py-2.5 text-body text-foreground " +
  "placeholder:text-muted-foreground aria-[invalid=true]:border-primary";

const fieldErrorClass = "swap-in mt-1.5 text-body font-medium text-primary";

export function normalizeCallbackPhone(raw: string): string {
  return raw.trim().replace(/[\s().-]+/g, "");
}

export function isValidCallbackPhone(raw: string): boolean {
  const normalized = normalizeCallbackPhone(raw);
  if (!normalized || normalized.length > 50) return false;
  const digits = normalized.replace(/\D/g, "");
  return digits.length >= 8 && digits.length <= 15 && /^\+?\d+$/.test(normalized);
}

export function validateCallbackStarter(
  values: {
    county: string;
    phone: string;
    privacyConsent: boolean;
    country: CountryCode;
  },
  copy: CallbackStarterCopy,
): CallbackStarterErrors {
  const errors: CallbackStarterErrors = {};
  if (values.country === "RO" && !isRomanianCounty(values.county.trim())) {
    errors.county = copy.countyError;
  }
  if (!isValidCallbackPhone(values.phone)) {
    errors.phone = copy.phoneError;
  }
  if (!values.privacyConsent) {
    errors.privacyConsent = copy.privacyConsentError;
  }
  return errors;
}

export function buildCallbackPayload({
  name,
  phone,
  county,
  country,
  lang,
  captchaToken,
}: {
  name: string;
  phone: string;
  county: string;
  country: CountryCode;
  lang: Lang;
  captchaToken: string;
}): CallbackPayload {
  const trimmedCounty = country === "RO" ? county.trim() : "";
  const normalizedPhone = normalizeCallbackPhone(phone);
  const areaLabel = trimmedCounty || country;
  return {
    name: name.trim(),
    phone: normalizedPhone,
    description: `Solicitare apel mediator sanitar din /mediatori#solicita (Zona: ${areaLabel}, limba: ${lang})`,
    country,
    county: trimmedCounty,
    privacyConsent: true,
    captchaToken,
  };
}

export async function submitCallbackStarter({
  name,
  phone,
  county,
  country,
  lang,
  executeCaptcha,
  fetchImpl = fetch,
}: {
  name: string;
  phone: string;
  county: string;
  country: CountryCode;
  lang: Lang;
  executeCaptcha: (action: CaptchaAction) => Promise<string>;
  fetchImpl?: typeof fetch;
}): Promise<{ ok: true } | { ok: false; kind: "rate_limit" | "error"; error?: unknown }> {
  try {
    const captchaToken = await executeCaptcha("help_request");
    const payload = buildCallbackPayload({
      name,
      phone,
      county,
      country,
      lang,
      captchaToken,
    });
    const response = await fetchImpl("/api/medical-help-requests", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        [REQUEST_LANG_HEADER]: lang,
      },
      body: JSON.stringify(payload),
    });
    if (response.ok) {
      return { ok: true };
    }
    if (response.status === 429) {
      return { ok: false, kind: "rate_limit" };
    }
    return { ok: false, kind: "error" };
  } catch (error) {
    return { ok: false, kind: "error", error };
  }
}

export function MediatorCallbackStarter({
  lang: langProp,
  country = "RO",
}: {
  lang?: Lang;
  country?: CountryCode;
}) {
  const languageContext = useContext(LanguageContext);
  const lang: Lang = langProp ?? languageContext?.lang ?? DEFAULT_LANG;
  const copy = callbackStarterCopy[lang] ?? callbackStarterCopy.ro;
  const executeCaptcha = useRecaptcha();
  const baseId = useId();

  const countyId = `${baseId}-county`;
  const countyErrorId = `${baseId}-county-error`;
  const phoneId = `${baseId}-phone`;
  const phoneHintId = `${baseId}-phone-hint`;
  const phoneErrorId = `${baseId}-phone-error`;
  const nameId = `${baseId}-name`;
  const consentId = `${baseId}-consent`;
  const consentErrorId = `${baseId}-consent-error`;

  const [county, setCounty] = useState("");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [errors, setErrors] = useState<CallbackStarterErrors>({});
  const [submissionError, setSubmissionError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedDetails, setSubmittedDetails] = useState<{ county: string; phone: string }>({
    county: "",
    phone: "",
  });

  const formRef = useRef<HTMLFormElement>(null);
  const successHeadingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (submitted) {
      successHeadingRef.current?.focus();
    }
  }, [submitted]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;

    const nextErrors = validateCallbackStarter(
      { county, phone, privacyConsent, country },
      copy,
    );
    setErrors(nextErrors);
    setSubmissionError("");

    if (Object.keys(nextErrors).length > 0) {
      const firstInvalid = (["county", "phone", "privacyConsent"] as const).find(
        (key) => Boolean(nextErrors[key]),
      );
      if (firstInvalid) {
        formRef.current?.querySelector<HTMLElement>(`[name="${firstInvalid}"]`)?.focus();
      }
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await submitCallbackStarter({
        name,
        phone,
        county,
        country,
        lang,
        executeCaptcha,
      });

      if (result.ok) {
        setSubmittedDetails({
          county: country === "RO" ? county.trim() : country,
          phone: normalizeCallbackPhone(phone),
        });
        setSubmitted(true);
        return;
      }

      if (result.kind === "rate_limit") {
        setSubmissionError(copy.rateLimitError);
        return;
      }

      setSubmissionError(captchaErrorMessage(result.error, copy.genericError));
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleReset() {
    setCounty("");
    setPhone("");
    setName("");
    setPrivacyConsent(false);
    setErrors({});
    setSubmissionError("");
    setSubmitted(false);
  }

  if (submitted) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="swap-in rounded-xl border border-border bg-card p-6 shadow-(--shadow-card-rest) sm:p-8"
      >
        <h2
          ref={successHeadingRef}
          tabIndex={-1}
          id="solicita-heading"
          className="text-balance text-section font-semibold text-foreground focus:outline-none"
        >
          {copy.successTitle}
        </h2>
        <p className="mt-3 max-w-(--measure-reading) text-body text-foreground">
          {copy.successBody(submittedDetails.county, submittedDetails.phone)}
        </p>
        <p className="mt-3 max-w-(--measure-reading) text-body text-muted-foreground">
          {copy.successNotice}
        </p>
        <div className="mt-6">
          <Button type="button" variant="outline" size="lg" onClick={handleReset}>
            {copy.sendAnother}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-(--shadow-card-rest) sm:p-8">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:items-start lg:gap-12">
        <div className="min-w-0">
          <h2 id="solicita-heading" className="text-balance text-section font-semibold text-foreground">
            {copy.title}
          </h2>
          <p className="mt-3 max-w-(--measure-reading) text-body text-muted-foreground">
            {copy.lead}
          </p>

          <div className="mt-6 flex items-start gap-2.5 border-t border-border pt-5">
            <LockIcon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <p className="text-body text-muted-foreground">{copy.reassurance}</p>
          </div>

          <div className="mt-4 text-body text-muted-foreground">
            <p>{copy.fullFormPrompt}</p>
            <Link
              href={withLangPrefix("/get-help?mode=mediator", lang)}
              className="mt-1 inline-flex min-h-11 items-center whitespace-nowrap rounded-sm font-semibold text-sapphire underline decoration-sapphire/40 underline-offset-4 transition-colors duration-(--dur-fast) ease-(--ease-out-calm) hover:text-sapphire-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:text-sapphire-border dark:decoration-sapphire-border/40"
            >
              {copy.fullFormLink}
            </Link>
          </div>
        </div>

        <form ref={formRef} noValidate onSubmit={handleSubmit} className="min-w-0">
          {submissionError ? (
            <p
              role="alert"
              className="swap-in mb-5 rounded-lg border border-primary/25 bg-primary-soft px-4 py-3 text-body font-medium text-foreground"
            >
              {submissionError}
            </p>
          ) : null}

          <div className="grid gap-5">
            {country === "RO" ? (
              <div>
                <label htmlFor={countyId} className="text-body font-semibold text-foreground">
                  {copy.countyLabel}
                </label>
                <select
                  id={countyId}
                  name="county"
                  required
                  value={county}
                  onChange={(event) => {
                    setCounty(event.target.value);
                    setSubmissionError("");
                    if (errors.county) {
                      setErrors((prev) => ({ ...prev, county: undefined }));
                    }
                  }}
                  aria-invalid={Boolean(errors.county)}
                  aria-describedby={errors.county ? countyErrorId : undefined}
                  className={inputClass}
                >
                  <option value="">{copy.countyPlaceholder}</option>
                  {ROMANIAN_COUNTIES.map((countyName) => (
                    <option key={countyName} value={countyName}>
                      {countyName}
                    </option>
                  ))}
                </select>
                {errors.county ? (
                  <p id={countyErrorId} role="alert" className={fieldErrorClass}>
                    {errors.county}
                  </p>
                ) : null}
              </div>
            ) : null}

            <div>
              <label htmlFor={phoneId} className="text-body font-semibold text-foreground">
                {copy.phoneLabel}
              </label>
              <input
                id={phoneId}
                name="phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                maxLength={50}
                required
                value={phone}
                onChange={(event) => {
                  setPhone(event.target.value);
                  setSubmissionError("");
                  if (errors.phone) {
                    setErrors((prev) => ({ ...prev, phone: undefined }));
                  }
                }}
                aria-invalid={Boolean(errors.phone)}
                aria-describedby={errors.phone ? phoneErrorId : phoneHintId}
                placeholder={copy.phonePlaceholder}
                className={inputClass}
              />
              {errors.phone ? (
                <p id={phoneErrorId} role="alert" className={fieldErrorClass}>
                  {errors.phone}
                </p>
              ) : (
                <p id={phoneHintId} className="mt-1.5 text-body text-muted-foreground">
                  {copy.phoneHint}
                </p>
              )}
            </div>

            <div>
              <label htmlFor={nameId} className="text-body font-semibold text-foreground">
                {copy.nameLabel}{" "}
                <span className="font-normal text-muted-foreground">{copy.optionalTag}</span>
              </label>
              <input
                id={nameId}
                name="name"
                type="text"
                autoComplete="name"
                maxLength={200}
                value={name}
                onChange={(event) => {
                  setName(event.target.value);
                  setSubmissionError("");
                }}
                placeholder={copy.namePlaceholder}
                className={inputClass}
              />
            </div>

            <div>
              <label
                htmlFor={consentId}
                className="-mx-2 flex min-h-11 items-start gap-2.5 rounded-lg border border-transparent px-2 py-1.5 text-body text-foreground transition-colors duration-(--dur-fast) hover:bg-muted/40 focus-within:ring-2 focus-within:ring-ring motion-reduce:transition-none"
              >
                <input
                  id={consentId}
                  type="checkbox"
                  name="privacyConsent"
                  required
                  checked={privacyConsent}
                  onChange={(event) => {
                    setPrivacyConsent(event.target.checked);
                    setSubmissionError("");
                    if (errors.privacyConsent) {
                      setErrors((prev) => ({ ...prev, privacyConsent: undefined }));
                    }
                  }}
                  aria-invalid={Boolean(errors.privacyConsent)}
                  aria-describedby={errors.privacyConsent ? consentErrorId : undefined}
                  className="mt-0.5 h-5 w-5 shrink-0 rounded border-border-control accent-sapphire"
                />
                <span>
                  {copy.privacyConsent}{" "}
                  <Link
                    href={withLangPrefix("/privacy", lang)}
                    className="font-semibold text-sapphire underline decoration-sapphire/40 underline-offset-4 transition-colors duration-(--dur-fast) ease-(--ease-out-calm) hover:text-sapphire-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:text-sapphire-border dark:decoration-sapphire-border/40"
                  >
                    {copy.privacyPolicyLabel}
                  </Link>
                  .
                </span>
              </label>
              {errors.privacyConsent ? (
                <p id={consentErrorId} role="alert" className={fieldErrorClass}>
                  {errors.privacyConsent}
                </p>
              ) : null}
            </div>

            <div>
              <Button
                type="submit"
                variant="action"
                size="lg"
                disabled={isSubmitting}
                aria-busy={isSubmitting}
                className="w-full sm:w-auto sm:px-6"
              >
                <PhoneIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{isSubmitting ? copy.submitting : copy.submit}</span>
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
