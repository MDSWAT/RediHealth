import type { Lang } from "@/lib/i18n/translations";

/**
 * Accessible names for the site chrome (landmarks and the home link).
 * Screen readers announce these, so they follow the page language like visible text does.
 */
export type ChromeCopy = {
  /** Name of the main navigation landmark (desktop bar and phone menu; only one is shown at a time). */
  primaryNav: string;
  /** Name of the footer navigation landmark. */
  footerNav: string;
  /** Accessible name of the logo link; starts with the visible brand name. */
  homeLink: string;
  /**
   * Phone-width 112 bar: a two-word question that reads as one line with the call button
   * next to it ("Urgență? · Sună la 112"). From 768px up the bar shows the full sentence.
   */
  emergencyQuestion: string;
};

export const chromeCopy: Record<Lang, ChromeCopy> = {
  ru: {
    primaryNav: "Основная навигация",
    footerNav: "Навигация в нижнем колонтитуле",
    homeLink: "RediHealth, домашняя страница",
    emergencyQuestion: "Чрезвычайная ситуация?",
  },

  ro: {
    primaryNav: "Navigare principală",
    footerNav: "Navigare în subsolul paginii",
    homeLink: "RediHealth, pagina principală",
    emergencyQuestion: "Urgență?",
  },
  en: {
    primaryNav: "Main navigation",
    footerNav: "Footer navigation",
    homeLink: "RediHealth, home page",
    emergencyQuestion: "Emergency?",
  },
  sq: {
    primaryNav: "Navigimi kryesor",
    footerNav: "Navigimi në fund të faqes",
    homeLink: "RediHealth, faqja kryesore",
    emergencyQuestion: "Urgjencë?",
  },
  it: {
    primaryNav: "Navigazione principale",
    footerNav: "Navigazione a piè di pagina",
    homeLink: "RediHealth, pagina iniziale",
    emergencyQuestion: "Emergenza?",
  },
  hr: {
    primaryNav: "Glavna navigacija",
    footerNav: "Navigacija u podnožju stranice",
    homeLink: "RediHealth, početna stranica",
    emergencyQuestion: "Hitno?",
  },
  rom: {
    primaryNav: "Sherutno drom",
    footerNav: "Telutno drom e rigako",
    homeLink: "RediHealth, angluni rig",
    emergencyQuestion: "Sigardiari?",
  },
};

export function getChromeCopy(lang: Lang | string | null | undefined): ChromeCopy {
  return chromeCopy[(lang as Lang) ?? "ro"] ?? chromeCopy.ro;
}
