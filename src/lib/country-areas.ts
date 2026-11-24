import { SUPPORTED_COUNTRIES, type CountryCode } from "@/lib/countries";
import {
  AL_AREA_NAMES,
  HR_AREA_NAMES,
  IT_AREA_NAMES,
  MD_AREA_NAMES,
} from "@/lib/geo/area-names";
import type { Lang } from "@/lib/i18n/translations";
import { ROMANIAN_COUNTIES } from "@/lib/romanian-counties";

/** Administrative areas per supported country for mediator and help-request selection. */
export const COUNTRY_AREAS: Record<CountryCode, readonly string[]> = {
  RO: ROMANIAN_COUNTIES,
  AL: AL_AREA_NAMES,
  IT: IT_AREA_NAMES,
  MD: MD_AREA_NAMES,
  HR: HR_AREA_NAMES,
};

export function getAreasForCountry(country: CountryCode): readonly string[] {
  return COUNTRY_AREAS[country] ?? ROMANIAN_COUNTIES;
}

export function isValidAreaForCountry(country: CountryCode, area: string): boolean {
  return getAreasForCountry(country).includes(area);
}

export function defaultCountryForLang(lang: Lang): CountryCode {
  if (lang === "sq") return "AL";
  if (lang === "it") return "IT";
  if (lang === "hr") return "HR";
  if (lang === "ru") return "MD";
  return "RO";
}

export const COUNTRY_FIELD_LABELS: Record<Lang, string> = {
  ro: "Țara",
  en: "Country",
  sq: "Shteti",
  it: "Paese",
  hr: "Država",
  rom: "Them",
  ru: "Страна",
};

export const PHONE_PLACEHOLDERS: Record<CountryCode, string> = {
  RO: "0721 000 000",
  AL: "+355 69 000 0000",
  IT: "+39 320 000 0000",
  MD: "+373 60 000 000",
  HR: "+385 91 000 0000",
};

export type AreaFieldCopy = {
  label: string;
  placeholder: string;
  error: string;
};

const AREA_FIELD_COPY: Record<CountryCode, Record<Lang, AreaFieldCopy>> = {
  RO: {
    ro: { label: "Județ", placeholder: "Alege județul", error: "Alege județul în care te afli." },
    en: { label: "County", placeholder: "Choose county", error: "Choose your county." },
    sq: { label: "Qarku", placeholder: "Zgjidh qarkun", error: "Zgjidh qarkun ku ndodhesh." },
    it: { label: "Provincia", placeholder: "Scegli provincia", error: "Scegli la provincia in cui ti trovi." },
    hr: { label: "Okrug", placeholder: "Odaberi okrug", error: "Odaberi okrug u kojem se nalaziš." },
    rom: { label: "Judetso", placeholder: "Alosar o judetso", error: "Alosar o judetso kay san." },
    ru: { label: "Округ", placeholder: "Выберите округ", error: "Выберите ваш округ." },
  },
  AL: {
    ro: { label: "Regiune", placeholder: "Alege regiunea", error: "Alege regiunea în care te afli." },
    en: { label: "County", placeholder: "Choose county", error: "Choose your county." },
    sq: { label: "Qarku", placeholder: "Zgjidh qarkun", error: "Zgjidh qarkun ku ndodhesh." },
    it: { label: "Prefettura", placeholder: "Scegli prefettura", error: "Scegli la prefettura in cui ti trovi." },
    hr: { label: "Okrug", placeholder: "Odaberi okrug", error: "Odaberi okrug u kojem se nalaziš." },
    rom: { label: "Qarko", placeholder: "Alosar o qarko", error: "Alosar o qarko kay san." },
    ru: { label: "Округ", placeholder: "Выберите округ", error: "Выберите ваш округ." },
  },
  IT: {
    ro: { label: "Regiune", placeholder: "Alege regiunea", error: "Alege regiunea în care te afli." },
    en: { label: "Region", placeholder: "Choose region", error: "Choose your region." },
    sq: { label: "Rajoni", placeholder: "Zgjidh rajonin", error: "Zgjidh rajonin ku ndodhesh." },
    it: { label: "Regione", placeholder: "Scegli regione", error: "Scegli la regione in cui ti trovi." },
    hr: { label: "Regija", placeholder: "Odaberi regiju", error: "Odaberi regiju u kojoj se nalaziš." },
    rom: { label: "Regiyona", placeholder: "Alosar i regiyona", error: "Alosar i regiyona kay san." },
    ru: { label: "Регион", placeholder: "Выберите регион", error: "Выберите ваш регион." },
  },
  MD: {
    ro: { label: "Raion sau municipiu", placeholder: "Alege raionul", error: "Alege raionul în care te afli." },
    en: { label: "District", placeholder: "Choose district", error: "Choose your district." },
    sq: { label: "Rajoni", placeholder: "Zgjidh rajonin", error: "Zgjidh rajonin ku ndodhesh." },
    it: { label: "Distretto", placeholder: "Scegli distretto", error: "Scegli il distretto in cui ti trovi." },
    hr: { label: "Rajon", placeholder: "Odaberi rajon", error: "Odaberi rajon u kojem se nalaziš." },
    rom: { label: "Rayono", placeholder: "Alosar o rayono", error: "Alosar o rayono kay san." },
    ru: { label: "Район или муниципий", placeholder: "Выберите район", error: "Выберите ваш район." },
  },
  HR: {
    ro: { label: "Comitat", placeholder: "Alege comitatul", error: "Alege comitatul în care te afli." },
    en: { label: "County", placeholder: "Choose county", error: "Choose your county." },
    sq: { label: "Qarku", placeholder: "Zgjidh qarkun", error: "Zgjidh qarkun ku ndodhesh." },
    it: { label: "Regione", placeholder: "Scegli regione", error: "Scegli la regione in cui ti trovi." },
    hr: { label: "Županija", placeholder: "Odaberi županiju", error: "Odaberi županiju u kojoj se nalaziš." },
    rom: { label: "Zhupaniya", placeholder: "Alosar i zhupaniya", error: "Alosar i zhupaniya kay san." },
    ru: { label: "Жупания", placeholder: "Выберите жупанию", error: "Выберите вашу жупанию." },
  },
};

export function getAreaFieldCopy(country: CountryCode, lang: Lang): AreaFieldCopy {
  const byCountry = AREA_FIELD_COPY[country] ?? AREA_FIELD_COPY.RO;
  return byCountry[lang] ?? byCountry.ro;
}

export { SUPPORTED_COUNTRIES };
