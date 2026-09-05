import { cookies } from "next/headers";
import { headers } from "next/headers";
import type { Lang } from "@/lib/i18n/translations";
import {
  DEFAULT_LANG,
  LOCALE_COOKIE,
  isSupportedLang,
  withLangPrefix,
} from "@/lib/i18n/routing";

export async function getRequestLang(): Promise<Lang> {
  const headerLang = (await headers()).get("x-redihealth-lang");
  if (headerLang && isSupportedLang(headerLang)) {
    return headerLang;
  }

  const value = (await cookies()).get(LOCALE_COOKIE)?.value;
  return value && isSupportedLang(value) ? value : DEFAULT_LANG;
}

export async function withRequestLangPrefix(pathname: string): Promise<string> {
  const lang = await getRequestLang();
  return withLangPrefix(pathname, lang);
}
