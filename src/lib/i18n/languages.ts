import type { Translations } from "@/lib/i18n/translations";

export type Lang = "en" | "ro" | "sq" | "it" | "hr" | "rom" | "ru";

export const languages: { code: Lang; label: string }[] = [
  { code: "en", label: "English" },
  { code: "ro", label: "Română" },
  { code: "sq", label: "Shqip" },
  { code: "it", label: "Italiano" },
  { code: "hr", label: "Hrvatski" },
  { code: "rom", label: "Romani" },
  { code: "ru", label: "Русский" },
];

const CODE_SENT_EMAIL_TOKEN = "__REDI_EMAIL__";

export type SerializableTranslations = Omit<Translations, "signInPage"> & {
  signInPage: Omit<Translations["signInPage"], "form"> & {
    form: Omit<Translations["signInPage"]["form"], "codeSentBody"> & {
      codeSentBodyTemplate: string;
    };
  };
};

/**
 * Converts a `Translations` dictionary into a plain RSC-serializable payload by replacing the
 * single formatter function (`signInPage.form.codeSentBody`) with a placeholder template string.
 */
export function serializeTranslations(t: Translations): SerializableTranslations {
  const { codeSentBody, ...restForm } = t.signInPage.form;
  return {
    ...t,
    signInPage: {
      ...t.signInPage,
      form: {
        ...restForm,
        codeSentBodyTemplate: codeSentBody(CODE_SENT_EMAIL_TOKEN),
      },
    },
  };
}

/**
 * Rehydrates a serialized locale dictionary back into a runtime `Translations` object.
 */
export function hydrateTranslations(
  t?: Translations | SerializableTranslations,
): Translations | undefined {
  if (!t) return undefined;
  const form = t.signInPage.form as
    | Translations["signInPage"]["form"]
    | SerializableTranslations["signInPage"]["form"];
  if ("codeSentBody" in form && typeof form.codeSentBody === "function") {
    return t as Translations;
  }
  const { codeSentBodyTemplate, ...restForm } = form as SerializableTranslations["signInPage"]["form"];
  return {
    ...t,
    signInPage: {
      ...t.signInPage,
      form: {
        ...restForm,
        codeSentBody: (email: string) =>
          codeSentBodyTemplate.split(CODE_SENT_EMAIL_TOKEN).join(email),
      },
    },
  };
}
