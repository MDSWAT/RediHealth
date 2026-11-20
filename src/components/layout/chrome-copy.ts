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
   * Phone-width 112 bar: a short question that reads as one line with the call button
   * next to it ("Urgență? Sună la 112"). From 768px up the bar shows the full sentence.
   */
  emergencyQuestion: string;
  /** Compact phone-width emergency call label so the 112 strip stays single-line up to 126% scale. */
  call112Short: string;
  /** Short visible label next to the header menu icon on phones/tablets. */
  menuWord: string;
  /** Short visible label shown when the phone/tablet menu is open. */
  closeWord: string;
  /** Short single-word Home label for compact mobile utility tiles. */
  homeShort: string;
  /** Featured live video doctor CTA inside the mobile menu. */
  liveDoctor: string;
  liveDoctorSub: string;
  /** Featured AI assistant CTA subtitle inside the mobile menu. */
  aiAssistantSub: string;
  /** Collapsible settings & account label inside the mobile menu. */
  moreOptions: string;
};

export const chromeCopy: Record<Lang, ChromeCopy> = {
  ru: {
    primaryNav: "Основная навигация",
    footerNav: "Навигация в нижнем колонтитуле",
    homeLink: "RediHealth, домашняя страница",
    emergencyQuestion: "Экстренно?",
    call112Short: "Вызов 112",
    menuWord: "Меню",
    closeWord: "Закрыть",
    homeShort: "Главная",
    liveDoctor: "Врач онлайн",
    liveDoctorSub: "Видеоконсультация",
    aiAssistantSub: "Чат и голос",
    moreOptions: "Настройки и аккаунт",
  },

  ro: {
    primaryNav: "Navigare principală",
    footerNav: "Navigare în subsolul paginii",
    homeLink: "RediHealth, pagina principală",
    emergencyQuestion: "Urgență?",
    call112Short: "Sună la 112",
    menuWord: "Meniu",
    closeWord: "Închide",
    homeShort: "Acasă",
    liveDoctor: "Medic online",
    liveDoctorSub: "Consultație video live",
    aiAssistantSub: "Chat cu voce",
    moreOptions: "Setări și cont",
  },
  en: {
    primaryNav: "Main navigation",
    footerNav: "Footer navigation",
    homeLink: "RediHealth, home page",
    emergencyQuestion: "Emergency?",
    call112Short: "Call 112",
    menuWord: "Menu",
    closeWord: "Close",
    homeShort: "Home",
    liveDoctor: "Live doctor",
    liveDoctorSub: "Video consultation",
    aiAssistantSub: "Chat with voice",
    moreOptions: "Settings and account",
  },
  sq: {
    primaryNav: "Navigimi kryesor",
    footerNav: "Navigimi në fund të faqes",
    homeLink: "RediHealth, faqja kryesore",
    emergencyQuestion: "Urgjencë?",
    call112Short: "Thirr 112",
    menuWord: "Menu",
    closeWord: "Mbyll",
    homeShort: "Kreu",
    liveDoctor: "Mjek online",
    liveDoctorSub: "Konsultë me video",
    aiAssistantSub: "Bisedë me zë",
    moreOptions: "Cilësimet dhe llogaria",
  },
  it: {
    primaryNav: "Navigazione principale",
    footerNav: "Navigazione a piè di pagina",
    homeLink: "RediHealth, pagina iniziale",
    emergencyQuestion: "Emergenza?",
    call112Short: "Chiama 112",
    menuWord: "Menu",
    closeWord: "Chiudi",
    homeShort: "Home",
    liveDoctor: "Medico online",
    liveDoctorSub: "Videochiamata live",
    aiAssistantSub: "Chat con voce",
    moreOptions: "Impostazioni e account",
  },
  hr: {
    primaryNav: "Glavna navigacija",
    footerNav: "Navigacija u podnožju stranice",
    homeLink: "RediHealth, početna stranica",
    emergencyQuestion: "Hitno?",
    call112Short: "Nazovi 112",
    menuWord: "Izbornik",
    closeWord: "Zatvori",
    homeShort: "Početna",
    liveDoctor: "Liječnik online",
    liveDoctorSub: "Video konzultacija",
    aiAssistantSub: "Razgovor i glas",
    moreOptions: "Postavke i račun",
  },
  rom: {
    primaryNav: "Sherutno drom",
    footerNav: "Telutno drom e rigako",
    homeLink: "RediHealth, angluni rig",
    emergencyQuestion: "Sigardiari?",
    call112Short: "Akhar 112",
    menuWord: "Meniu",
    closeWord: "Phandav",
    homeShort: "Kher",
    liveDoctor: "Doktoro online",
    liveDoctorSub: "Video akharipe",
    aiAssistantSub: "Vakeripe glasosa",
    moreOptions: "Setimata thaj konto",
  },
};

export function getChromeCopy(lang: Lang | string | null | undefined): ChromeCopy {
  return chromeCopy[(lang as Lang) ?? "ro"] ?? chromeCopy.ro;
}
