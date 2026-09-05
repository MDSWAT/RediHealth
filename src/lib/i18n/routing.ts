import { languages, type Lang } from "@/lib/i18n/translations";

export const DEFAULT_LANG: Lang = "en";
export const LOCALE_COOKIE = "redihealth-lang";

const supportedLangSet = new Set<Lang>(languages.map((item) => item.code));

export function isSupportedLang(value: string): value is Lang {
  return supportedLangSet.has(value as Lang);
}

export function getLangFromPathname(pathname: string): Lang | null {
  const firstSegment = pathname.split("/").filter(Boolean)[0];
  if (!firstSegment) return null;
  return isSupportedLang(firstSegment) ? firstSegment : null;
}

export function stripLangFromPathname(pathname: string): string {
  const locale = getLangFromPathname(pathname);
  if (!locale) return pathname;

  const withoutLocale = pathname.slice(locale.length + 1);
  return withoutLocale || "/";
}

export function withLangPrefix(pathname: string, lang: Lang): string {
  const cleanPath = stripLangFromPathname(pathname || "/");
  if (cleanPath === "/") return `/${lang}`;
  return `/${lang}${cleanPath.startsWith("/") ? cleanPath : `/${cleanPath}`}`;
}
