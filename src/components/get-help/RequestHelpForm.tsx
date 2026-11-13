"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { CheckCircleIcon, LockIcon, VolumeIcon } from "@/components/ui/icons";
import { useReadAloud } from "@/components/health-check/readingTools";
import { useLanguage } from "@/lib/i18n/language-context";
import type { Lang, Translations } from "@/lib/i18n/translations";
import { isValidEmail } from "@/lib/text";
import { COUNTRY_LABELS, type CountryCode } from "@/lib/countries";
import { ROMANIAN_COUNTIES } from "@/lib/romanian-counties";
import { REQUEST_LANG_HEADER, withLangPrefix } from "@/lib/i18n/routing";
import { captchaErrorMessage, useRecaptcha } from "@/components/security/RecaptchaProvider";

type Fields = {
  name: string;
  phone: string;
  email: string;
  description: string;
};

type Errors = Partial<Record<keyof Fields, string>>;

const inputClass =
  "mt-1.5 block w-full min-h-12 rounded-lg border border-border bg-card px-3.5 text-base text-foreground " +
  "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 " +
  "focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background " +
  "aria-[invalid=true]:border-primary";

export const QUICK_HELP_TOPICS: Record<Lang, { id: string; label: string; text: string }[]> = {
  ro: [
    { id: "pain", label: "Durere sau febră", text: "Am durere sau febră și am nevoie de ajutor." },
    { id: "child", label: "Copil bolnav", text: "Copilul meu este bolnav și am nevoie de ajutor." },
    { id: "pills", label: "Rețetă sau pastile", text: "Am nevoie de o rețetă sau de pastilele mele." },
    { id: "noid", label: "Fără buletin sau asigurare", text: "Nu am buletin sau asigurare și am nevoie de un medic." },
    { id: "family", label: "Caut medic de familie", text: "Caut un medic de familie și am nevoie de ajutor." },
  ],
  en: [
    { id: "pain", label: "Pain or fever", text: "I have pain or a fever and need help." },
    { id: "child", label: "Sick child", text: "My child is sick and I need help." },
    { id: "pills", label: "Prescription or pills", text: "I need a prescription or my pills." },
    { id: "noid", label: "No ID or insurance", text: "I have no ID or insurance and need a doctor." },
    { id: "family", label: "Need family doctor", text: "I need a family doctor and want help finding one." },
  ],
  sq: [
    { id: "pain", label: "Dhimbje ose ethe", text: "Kam dhimbje ose ethe dhe kam nevojë për ndihmë." },
    { id: "child", label: "Fëmijë i sëmurë", text: "Fëmija im është i sëmurë dhe kam nevojë për ndihmë." },
    { id: "pills", label: "Recetë ose ilaçe", text: "Kam nevojë për një recetë ose për ilaçet e mia." },
    { id: "noid", label: "Pa letërnjoftim ose sigurim", text: "Nuk kam letërnjoftim ose sigurim dhe kam nevojë për mjek." },
    { id: "family", label: "Dua mjek familjeje", text: "Kërkoj një mjek familjeje dhe kam nevojë për ndihmë." },
  ],
  it: [
    { id: "pain", label: "Dolore o febbre", text: "Ho dolore o febbre e ho bisogno di aiuto." },
    { id: "child", label: "Bambino malato", text: "Mio figlio è malato e ho bisogno di aiuto." },
    { id: "pills", label: "Ricetta o medicine", text: "Ho bisogno di una ricetta o delle mie medicine." },
    { id: "noid", label: "Senza documento o assicurazione", text: "Non ho documento o assicurazione e ho bisogno di un medico." },
    { id: "family", label: "Cerco un medico di famiglia", text: "Cerco un medico di famiglia e ho bisogno di aiuto." },
  ],
  hr: [
    { id: "pain", label: "Bol ili vrućica", text: "Imam bol ili vrućicu i trebam pomoć." },
    { id: "child", label: "Bolesno dijete", text: "Moje dijete je bolesno i trebam pomoć." },
    { id: "pills", label: "Recept ili tablete", text: "Trebam recept ili svoje tablete." },
    { id: "noid", label: "Bez osobne ili osiguranja", text: "Nemam osobnu ili osiguranje i trebam liječnika." },
    { id: "family", label: "Trebam obiteljskog liječnika", text: "Trebam obiteljskog liječnika i pomoć da ga nađem." },
  ],
  rom: [
    { id: "pain", label: "Dukh vay tatipen", text: "Si ma dukh vay tatipen thaj trubul ma zhutimos." },
    { id: "child", label: "Nasvalo chhavoro", text: "Murro chhavoro si nasvalo thaj trubul ma zhutimos." },
    { id: "pills", label: "Receto vay draba", text: "Trubul ma receto vay murre draba." },
    { id: "noid", label: "Bi buletinosko vay asigurimosko", text: "Nane ma buletino vay asigurimo thaj trubul ma doktori." },
    { id: "family", label: "Familiako doktori", text: "Rodav familiako doktori thaj trubul ma zhutimos." },
  ],
  ru: [
    { id: "pain", label: "Боль или температура", text: "У меня боль или температура, мне нужна помощь." },
    { id: "child", label: "Болен ребёнок", text: "Мой ребёнок болен, мне нужна помощь." },
    { id: "pills", label: "Рецепт или таблетки", text: "Мне нужен рецепт или мои таблетки." },
    { id: "noid", label: "Нет документа или страховки", text: "У меня нет документа или страховки, нужен врач." },
    { id: "family", label: "Нужен семейный врач", text: "Мне нужен семейный врач, помогите его найти." },
  ],
};

const DESCRIPTION_PREFIX: Record<Lang, string> = {
  ro: "Solicitare telefonică: ",
  en: "Callback request: ",
  sq: "Kërkesë me telefon: ",
  it: "Richiesta telefonica: ",
  hr: "Zahtjev za poziv: ",
  rom: "Mangipe telefonosa: ",
  ru: "Запрос звонка: ",
};

const LISTEN_COPY: Record<Lang, { listen: string; stop: string }> = {
  ro: { listen: "Ascultă", stop: "Oprește" },
  en: { listen: "Listen", stop: "Stop" },
  sq: { listen: "Dëgjo", stop: "Ndalo" },
  it: { listen: "Ascolta", stop: "Ferma" },
  hr: { listen: "Poslušaj", stop: "Zaustavi" },
  rom: { listen: "Ashun", stop: "Achav" },
  ru: { listen: "Прослушать", stop: "Остановить" },
};

const QUICK_TOPICS_TITLE: Record<Lang, string> = {
  ro: "Atinge ce ți se potrivește",
  en: "Tap what fits",
  sq: "Prek atë që të përshtatet",
  it: "Tocca ciò che ti serve",
  hr: "Dodirni što ti odgovara",
  rom: "Alosar so mishtol tuke",
  ru: "Нажмите, что подходит",
};

export function normalizeHelpPhone(raw: string): string {
  return raw.trim().replace(/[\s().-]+/g, "");
}

export function buildRequestDescription(raw: string, lang: Lang): string {
  const trimmed = raw.trim();
  if (trimmed.length >= 10) return trimmed;
  return `${DESCRIPTION_PREFIX[lang]}${trimmed}`;
}

function validate(values: Fields, t: Translations["getHelpPage"]["form"]): Errors {
  const errors: Errors = {};

  if (!normalizeHelpPhone(values.phone)) {
    errors.phone = t.errorPhone;
  }

  if (values.email.trim() && !isValidEmail(values.email.trim())) {
    errors.email = t.errorEmailInvalid;
  }

  if (values.description.trim().length < 3) {
    errors.description = t.errorDescription;
  }

  return errors;
}

const countryLabel = {
ru: "Страна",

  en: "Country",
  ro: "Țara",
  sq: "Shteti",
  it: "Paese",
  hr: "Država",
  rom: "Them",
} as const;

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
  const voice = useReadAloud(lang);
  const listenCopy = LISTEN_COPY[lang];

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
        headers: { "Content-Type": "application/json", [REQUEST_LANG_HEADER]: lang },
        body: JSON.stringify({
          ...values,
          phone: normalizeHelpPhone(values.phone),
          description: buildRequestDescription(values.description, lang),
          country,
          county,
          privacyConsent,
          captchaToken,
        }),
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
        {voice.available ? (
          <div>
            <button
              type="button"
              aria-pressed={voice.speaking}
              onClick={() =>
                voice.speaking
                  ? voice.stop()
                  : voice.speak([
                      form.phoneLabel,
                      form.descriptionLabel,
                      form.descriptionHint,
                      form.privacyNote,
                    ])
              }
              className="inline-flex min-h-11 items-center gap-2 whitespace-nowrap rounded-lg border border-border-control bg-card px-3.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <VolumeIcon className="h-4 w-4" aria-hidden="true" />
              <span>{voice.speaking ? listenCopy.stop : listenCopy.listen}</span>
            </button>
          </div>
        ) : null}
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
              className={`${inputClass} h-12`}
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
              className={`${inputClass} h-12`}
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
            className={`${inputClass} h-12`}
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
              className={`${inputClass} h-12`}
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
              className={`${inputClass} h-12`}
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
          <p className="mt-2 text-sm font-semibold text-foreground">{QUICK_TOPICS_TITLE[lang]}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {QUICK_HELP_TOPICS[lang].map((topic) => {
              const active = values.description === topic.text;
              return (
                <button
                  key={topic.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => update("description", topic.text)}
                  className={`press-row inline-flex min-h-11 max-w-full items-center whitespace-nowrap rounded-lg border px-3 text-xs font-semibold transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:px-3.5 sm:text-sm ${
                    active
                      ? "border-sapphire bg-sapphire-soft text-sapphire dark:border-sapphire-border dark:bg-sapphire/20 dark:text-paper"
                      : "border-border-control bg-card text-foreground hover:bg-muted"
                  }`}
                >
                  <span className="min-w-0 truncate">{topic.label}</span>
                </button>
              );
            })}
          </div>
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
          <label className="-mx-2 flex min-h-11 items-start gap-2.5 rounded-lg border border-transparent px-2 py-1.5 text-sm leading-relaxed text-foreground transition-colors duration-[var(--dur-fast)] hover:bg-muted/40 focus-within:ring-2 focus-within:ring-ring motion-reduce:transition-none">
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
          <Button type="submit" size="lg" variant="secondary" disabled={isSubmitting} className="min-h-13 whitespace-nowrap text-sm disabled:bg-muted disabled:text-muted-foreground sm:text-[0.9375rem]">
            {isSubmitting ? form.submitting : form.submit}
          </Button>
        </div>
      </div>
    </form>
  );
}
