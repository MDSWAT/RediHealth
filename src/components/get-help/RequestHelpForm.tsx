"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { CheckCircleIcon, LockIcon } from "@/components/ui/icons";
import { useLanguage } from "@/lib/i18n/language-context";
import type { Translations } from "@/lib/i18n/translations";
import { isValidEmail } from "@/lib/text";
import { COUNTRY_LABELS, type CountryCode } from "@/lib/countries";
import { ROMANIAN_COUNTIES } from "@/lib/romanian-counties";
import { withLangPrefix } from "@/lib/i18n/routing";
import { captchaErrorMessage, useRecaptcha } from "@/components/security/RecaptchaProvider";

type Fields = {
  name: string;
  phone: string;
  email: string;
  description: string;
};

type Errors = Partial<Record<keyof Fields, string>>;

const inputClass =
  "mt-1.5 block w-full rounded-lg border border-border bg-card px-3.5 text-base text-foreground " +
  "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 " +
  "focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background " +
  "aria-[invalid=true]:border-primary";

function validate(values: Fields, t: Translations["getHelpPage"]["form"]): Errors {
  const errors: Errors = {};

  if (!values.phone.trim()) {
    errors.phone = t.errorPhone;
  }

  if (values.email.trim() && !isValidEmail(values.email.trim())) {
    errors.email = t.errorEmailInvalid;
  }

  if (values.description.trim().length < 10) {
    errors.description = t.errorDescription;
  }

  return errors;
}

const countryLabel = { en: "Country", ro: "Țara", sq: "Shteti", it: "Paese" } as const;

export function RequestHelpForm({
  countries,
  initialCountry,
}: {
  countries: CountryCode[];
  initialCountry: CountryCode | null;
}) {
  const { t, lang } = useLanguage();
  const executeCaptcha = useRecaptcha();
  const form = t.getHelpPage.form;

  const [country, setCountry] = useState<CountryCode | "">(initialCountry ?? "");
  const [county, setCounty] = useState("");
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [countyError, setCountyError] = useState(false);
  const [consentAttempted, setConsentAttempted] = useState(false);
  const [values, setValues] = useState<Fields>({
    name: "",
    phone: "",
    email: "",
    description: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);
  const [submissionError, setSubmissionError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const successHeadingRef = useRef<HTMLHeadingElement>(null);

  // After sending, move focus to the confirmation so it is announced and in view.
  useEffect(() => {
    if (submitted) successHeadingRef.current?.focus();
  }, [submitted]);

  function update<K extends keyof Fields>(key: K, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setSubmissionError("");
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validate(values, form);
    setErrors(nextErrors);
    const missingCounty = country === "RO" && !county;
    setCountyError(missingCounty);
    setConsentAttempted(true);
    if (Object.keys(nextErrors).length !== 0 || missingCounty || !privacyConsent) {
      // Take the reader to the first field that needs attention, in form order.
      const firstInvalid = missingCounty
        ? "county"
        : (["phone", "email", "description"] as const).find((key) => nextErrors[key]) ?? "privacyConsent";
      formRef.current?.querySelector<HTMLElement>(`[name="${firstInvalid}"]`)?.focus();
      return;
    }

    setSubmissionError("");
    setIsSubmitting(true);
    try {
      const captchaToken = await executeCaptcha("help_request");
      const response = await fetch("/api/medical-help-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, country, county, privacyConsent, captchaToken }),
      });
      if (response.ok) {
        setSubmitted(true);
      } else {
        // The API answers in English; the fields were already checked here, so show the
        // reader's own-language message rather than leaking server text.
        setSubmissionError(form.genericError);
      }
    } catch (error) {
      setSubmissionError(captchaErrorMessage(error, form.genericError));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="fhs-enter rounded-xl border border-border bg-card p-6 sm:p-10">
        <CheckCircleIcon className="h-7 w-7 text-live-sage" aria-hidden="true" />
        <h2
          ref={successHeadingRef}
          tabIndex={-1}
          className="mt-4 text-2xl font-semibold tracking-tight text-foreground focus:outline-none"
        >
          {form.successTitle}
        </h2>
        <p className="mt-3 text-base leading-relaxed text-muted-foreground">
          {form.successBody}
        </p>
        <p className="mt-4 rounded-lg bg-muted px-4 py-3 text-sm leading-relaxed text-muted-foreground">
          {form.successNotice}
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button href={withLangPrefix("/", lang)} variant="secondary">{form.backHome}</Button>
          <Button
            variant="outline"
            onClick={() => {
              setValues({ name: "", phone: "", email: "", description: "" });
              setCounty("");
              setCountyError(false);
              setPrivacyConsent(false);
              setConsentAttempted(false);
              setSubmitted(false);
            }}
          >
            {form.submitAnother}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      noValidate
      onSubmit={handleSubmit}
      className="rounded-xl border border-border bg-card p-5 sm:p-10"
    >
      {submissionError ? (
        <p
          role="alert"
          className="fhs-fade mb-6 rounded-lg border border-primary/20 bg-primary-soft px-4 py-3 text-sm leading-relaxed text-foreground"
        >
          {submissionError}
        </p>
      ) : null}
      <div className="grid gap-6">
        {countries.length > 1 ? (
          <div>
            <label htmlFor="country" className="text-sm font-semibold text-foreground">
              {countryLabel[lang]}
            </label>
            <select
              id="country"
              name="country"
              value={country}
              onChange={(event) => {
                setCountry(event.target.value as CountryCode);
                setCounty("");
                setCountyError(false);
              }}
              className={`${inputClass} h-11`}
            >
              {countries.map((code) => (
                <option key={code} value={code}>
                  {COUNTRY_LABELS[code][lang]}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        {country === "RO" ? (
          <div>
            <label htmlFor="county" className="text-sm font-semibold text-foreground">
              {form.countyLabel}
            </label>
            <select
              id="county"
              name="county"
              required
              value={county}
              onChange={(event) => {
                setCounty(event.target.value);
                setCountyError(false);
              }}
              className={`${inputClass} h-11`}
              aria-invalid={countyError}
              aria-describedby={countyError ? "county-error" : undefined}
            >
              <option value="">{form.selectCounty}</option>
              {ROMANIAN_COUNTIES.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
            {countyError ? (
              <p id="county-error" className="mt-1.5 text-sm text-primary">{form.errorCounty}</p>
            ) : null}
          </div>
        ) : null}

        <div>
          <label htmlFor="name" className="text-sm font-semibold text-foreground">
            {form.fullNameLabel}{" "}
            <span className="font-normal text-muted-foreground">{form.fullNameOptional}</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            value={values.name}
            onChange={(event) => update("name", event.target.value)}
            className={`${inputClass} h-11`}
            placeholder={form.fullNamePlaceholder}
          />
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label
              htmlFor="phone"
              className="text-sm font-semibold text-foreground"
            >
              {form.phoneLabel}
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              required
              value={values.phone}
              onChange={(event) => update("phone", event.target.value)}
              aria-invalid={Boolean(errors.phone)}
              aria-describedby={errors.phone ? "phone-error" : undefined}
              className={`${inputClass} h-11`}
              placeholder={form.phonePlaceholder}
            />
            {errors.phone ? (
              <p id="phone-error" className="mt-1.5 text-sm text-primary">
                {errors.phone}
              </p>
            ) : null}
          </div>

          <div>
            <label
              htmlFor="email"
              className="text-sm font-semibold text-foreground"
            >
              {form.emailLabel}{" "}
              <span className="font-normal text-muted-foreground">{form.fullNameOptional}</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              value={values.email}
              onChange={(event) => update("email", event.target.value)}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? "email-error" : undefined}
              className={`${inputClass} h-11`}
              placeholder={form.emailPlaceholder}
            />
            {errors.email ? (
              <p id="email-error" className="mt-1.5 text-sm text-primary">
                {errors.email}
              </p>
            ) : null}
          </div>
        </div>

        <div>
          <label
            htmlFor="description"
            className="text-sm font-semibold text-foreground"
          >
            {form.descriptionLabel}
          </label>
          <textarea
            id="description"
            name="description"
            required
            rows={5}
            value={values.description}
            onChange={(event) => update("description", event.target.value)}
            aria-invalid={Boolean(errors.description)}
            aria-describedby={
              errors.description ? "description-error" : "description-hint"
            }
            className={`${inputClass} py-2.5`}
            placeholder={form.descriptionPlaceholder}
          />
          {errors.description ? (
            <p id="description-error" className="mt-1.5 text-sm text-primary">
              {errors.description}
            </p>
          ) : (
            <p id="description-hint" className="mt-1.5 text-sm text-muted-foreground">
              {form.descriptionHint}
            </p>
          )}
        </div>

        <div className="flex items-start gap-2.5 border-t border-border pt-5">
          <LockIcon className="mt-0.5 h-4 w-4 flex-none text-muted-foreground" aria-hidden="true" />
          <p className="text-sm leading-relaxed text-muted-foreground">
            {form.privacyNote}
          </p>
        </div>

        <div>
          <label className="flex items-start gap-2.5 text-sm leading-relaxed text-foreground">
            <input
              type="checkbox"
              name="privacyConsent"
              required
              checked={privacyConsent}
              onChange={(event) => setPrivacyConsent(event.target.checked)}
              aria-invalid={consentAttempted && !privacyConsent}
              aria-describedby={consentAttempted && !privacyConsent ? "consent-error" : undefined}
              className="mt-0.5 h-5 w-5 flex-none rounded border-border accent-sapphire"
            />
            <span>
              {form.privacyConsent}{" "}
              <a href={withLangPrefix("/privacy", lang)} className="font-semibold text-sapphire underline decoration-sapphire/40 underline-offset-4 transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:text-sapphire-light hover:decoration-sapphire">
                {form.privacyPolicyLabel}
              </a>.
            </span>
          </label>
          {consentAttempted && !privacyConsent ? (
            <p id="consent-error" className="mt-1.5 text-sm text-primary">{form.privacyConsentRequired}</p>
          ) : null}
        </div>

        <div>
          <Button type="submit" size="lg" variant="secondary" disabled={isSubmitting} className="disabled:bg-muted disabled:text-muted-foreground">
            {isSubmitting ? form.submitting : form.submit}
          </Button>
        </div>
      </div>
    </form>
  );
}
