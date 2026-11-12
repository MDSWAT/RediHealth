import type { Lang } from "./translations";

// The additional article library has its own translation coverage ledger.
// Enabling a site language must not imply that its medical articles were translated.
export type HealthContentLang = "en" | "ro" | "sq" | "it" | "ru";
export function healthContentLanguage(lang: Lang): HealthContentLang;
export function healthContentLanguage(lang: Lang, available: readonly string[]): Lang;
export function healthContentLanguage(lang: Lang, available?: readonly string[]): Lang {
  if (available) return available.includes(lang) ? lang : "en";
  return lang === "hr" || lang === "rom" ? "en" : lang;
}
export function healthContentLanguageNotice(lang: Lang, contentLanguage: Lang = healthContentLanguage(lang)): string | undefined {
  if (lang === contentLanguage) return;
  if (lang === "hr") return "Ovaj prikaz sadrži tekst na engleskom ondje gdje prijevod još nije dostupan.";
  if (lang === "rom") return "Kada sikavimos si les informaciye pe anglikani chib kaj o nakhavimos pe kadi chib inke naj gata.";
}
