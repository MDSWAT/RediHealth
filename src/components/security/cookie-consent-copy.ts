import type { Lang } from "@/lib/i18n/languages";

export type CookieConsentCopy = {
  bannerRegionLabel: string;
  bannerTitle: string;
  bannerBody: string;
  acknowledge: string;
  openSettings: string;
  policyLinkLabel: string;
  privacyLinkLabel: string;
  footerSettingsLink: string;
  dialogTitle: string;
  dialogIntro: string;
  closeLabel: string;
  necessaryTitle: string;
  necessaryStatus: string;
  necessaryBody: string;
  securityTitle: string;
  securityStatus: string;
  securityBody: string;
  adsTitle: string;
  adsStatus: string;
  adsBody: string;
  currentStatusLabel: string;
  currentStatusActive: string;
};

export const cookieConsentCopy: Record<Lang, CookieConsentCopy> = {
  ro: {
    bannerRegionLabel: "Informare cookie-uri",
    bannerTitle: "Cookie-uri și confidențialitate",
    bannerBody:
      "Folosim doar cookie-uri strict necesare ca aplicația să funcționeze și protecție anti-roboți pe formularele publice. Nu folosim cookie-uri de publicitate sau urmărire comercială.",
    acknowledge: "Am înțeles",
    openSettings: "Detalii cookie-uri",
    policyLinkLabel: "Politica de cookie-uri",
    privacyLinkLabel: "Politica de confidențialitate",
    footerSettingsLink: "Setări cookie-uri",
    dialogTitle: "Cookie-uri în RediHealth",
    dialogIntro:
      "RediHealth folosește exclusiv cookie-uri esențiale și protecție de securitate. Nu folosim instrumente de publicitate și nu vindem datele tale.",
    closeLabel: "Închide fereastra",
    necessaryTitle: "Cookie-uri strict necesare",
    necessaryStatus: "Mereu active",
    necessaryBody:
      "Păstrează limba aleasă, județul selectat, autentificarea sigură și preferințele de accesibilitate.",
    securityTitle: "Protecție anti-roboți (Google reCAPTCHA)",
    securityStatus: "Pe formulare publice",
    securityBody:
      "Protejează formularele publice împotriva abuzurilor automate. Verifică doar semnale tehnice din browser și nu primește niciodată date de sănătate.",
    adsTitle: "Publicitate și urmărire comercială",
    adsStatus: "Nu se folosesc",
    adsBody:
      "RediHealth nu încarcă cookie-uri de marketing, publicitate sau urmărire comercială.",
    currentStatusLabel: "Stare actuală",
    currentStatusActive:
      "Sunt active doar cookie-urile strict necesare. Nu există cookie-uri de publicitate sau urmărire comercială.",
  },
  en: {
    bannerRegionLabel: "Cookie notice",
    bannerTitle: "Cookies and privacy",
    bannerBody:
      "We use only strictly necessary cookies so RediHealth works reliably, plus bot protection on public forms. We do not use advertising or commercial tracking cookies.",
    acknowledge: "Understood",
    openSettings: "Cookie details",
    policyLinkLabel: "Cookie policy",
    privacyLinkLabel: "Privacy policy",
    footerSettingsLink: "Cookie settings",
    dialogTitle: "Cookies on RediHealth",
    dialogIntro:
      "RediHealth uses only essential cookies and security protection. We do not run advertising trackers and never sell your data.",
    closeLabel: "Close dialog",
    necessaryTitle: "Strictly necessary cookies",
    necessaryStatus: "Always active",
    necessaryBody:
      "Keep your chosen language, selected area, secure sign-in session and accessibility preferences.",
    securityTitle: "Bot protection (Google reCAPTCHA)",
    securityStatus: "On public forms",
    securityBody:
      "Protects public forms against automated abuse. Checks technical browser signals only and never receives health data.",
    adsTitle: "Advertising and commercial tracking",
    adsStatus: "Not used",
    adsBody:
      "RediHealth does not load marketing, advertising or commercial tracking cookies.",
    currentStatusLabel: "Current setting",
    currentStatusActive:
      "Only strictly necessary cookies are active. No advertising or commercial tracking cookies are used.",
  },
  sq: {
    bannerRegionLabel: "Njoftimi për cookie-t",
    bannerTitle: "Cookie-t dhe privatësia",
    bannerBody:
      "Përdorim vetëm cookie të domosdoshme që aplikacioni të funksionojë dhe mbrojtje kundër robotëve në formularët publikë. Nuk përdorim cookie reklamimi apo gjurmimi tregtar.",
    acknowledge: "E kuptova",
    openSettings: "Detajet e cookie-ve",
    policyLinkLabel: "Politika e cookie-ve",
    privacyLinkLabel: "Politika e privatësisë",
    footerSettingsLink: "Cilësimet e cookie-ve",
    dialogTitle: "Cookie-t në RediHealth",
    dialogIntro:
      "RediHealth përdor vetëm cookie thelbësore dhe mbrojtje sigurie. Nuk përdorim gjurmues reklamimi dhe nuk i shesim të dhënat e tua.",
    closeLabel: "Mbyll dritaren",
    necessaryTitle: "Cookie të domosdoshme",
    necessaryStatus: "Gjithmonë aktive",
    necessaryBody:
      "Ruajnë gjuhën e zgjedhur, zonën, hyrjen e sigurt dhe preferencat e aksesueshmërisë.",
    securityTitle: "Mbrojtja nga robotët (Google reCAPTCHA)",
    securityStatus: "Në formularë publikë",
    securityBody:
      "Mbron formularët publikë nga abuzimet automatike. Kontrollon vetëm sinjale teknike të shfletuesit dhe nuk merr kurrë të dhëna shëndetësore.",
    adsTitle: "Reklamim dhe gjurmim tregtar",
    adsStatus: "Nuk përdoren",
    adsBody:
      "RediHealth nuk ngarkon cookie marketingu, reklamimi apo gjurmimi tregtar.",
    currentStatusLabel: "Gjendja aktuale",
    currentStatusActive:
      "Janë aktive vetëm cookie-t e domosdoshme. Nuk përdoren cookie reklamimi.",
  },
  it: {
    bannerRegionLabel: "Informativa sui cookie",
    bannerTitle: "Cookie e privacy",
    bannerBody:
      "Usiamo solo cookie strettamente necessari al funzionamento di RediHealth e protezione anti-bot sui moduli pubblici. Non usiamo cookie pubblicitari o di tracciamento commerciale.",
    acknowledge: "Ho capito",
    openSettings: "Dettagli cookie",
    policyLinkLabel: "Politica sui cookie",
    privacyLinkLabel: "Informativa sulla privacy",
    footerSettingsLink: "Impostazioni cookie",
    dialogTitle: "Cookie su RediHealth",
    dialogIntro:
      "RediHealth utilizza esclusivamente cookie essenziali e protezione di sicurezza. Non usiamo tracker pubblicitari e non vendiamo i tuoi dati.",
    closeLabel: "Chiudi finestra",
    necessaryTitle: "Cookie strettamente necessari",
    necessaryStatus: "Sempre attivi",
    necessaryBody:
      "Mantengono la lingua scelta, l'area selezionata, l'accesso sicuro e le preferenze di accessibilità.",
    securityTitle: "Protezione anti-bot (Google reCAPTCHA)",
    securityStatus: "Sui moduli pubblici",
    securityBody:
      "Protegge i moduli pubblici dagli abusi automatici. Controlla solo segnali tecnici del browser e non riceve mai dati sanitari.",
    adsTitle: "Pubblicità e tracciamento commerciale",
    adsStatus: "Non utilizzati",
    adsBody:
      "RediHealth non carica cookie di marketing, pubblicità o tracciamento commerciale.",
    currentStatusLabel: "Stato attuale",
    currentStatusActive:
      "Sono attivi solo i cookie strettamente necessari. Nessun cookie pubblicitario è in uso.",
  },
  hr: {
    bannerRegionLabel: "Obavijest o kolačićima",
    bannerTitle: "Kolačići i privatnost",
    bannerBody:
      "Koristimo samo nužne kolačiće za ispravan rad platforme RediHealth i zaštitu od botova na javnim obrascima. Ne koristimo oglašivačke ni komercijalne kolačiće za praćenje.",
    acknowledge: "Razumijem",
    openSettings: "Detalji kolačića",
    policyLinkLabel: "Politika kolačića",
    privacyLinkLabel: "Pravila privatnosti",
    footerSettingsLink: "Postavke kolačića",
    dialogTitle: "Kolačići na RediHealthu",
    dialogIntro:
      "RediHealth koristi isključivo nužne kolačiće i sigurnosnu zaštitu. Ne koristimo oglašivačke alate za praćenje i ne prodajemo tvoje podatke.",
    closeLabel: "Zatvori prozor",
    necessaryTitle: "Nužni kolačići",
    necessaryStatus: "Uvijek aktivni",
    necessaryBody:
      "Čuvaju odabrani jezik, područje, sigurnu prijavu i postavke pristupačnosti.",
    securityTitle: "Zaštita od botova (Google reCAPTCHA)",
    securityStatus: "Na javnim obrascima",
    securityBody:
      "Štiti javne obrasce od automatizirane zlouporabe. Provjerava samo tehničke signale preglednika i nikada ne prima zdravstvene podatke.",
    adsTitle: "Oglašavanje i komercijalno praćenje",
    adsStatus: "Ne koriste se",
    adsBody:
      "RediHealth ne učitava marketinške ni oglašivačke kolačiće za praćenje.",
    currentStatusLabel: "Trenutno stanje",
    currentStatusActive:
      "Aktivni su samo nužni kolačići. Oglašivački kolačići se ne koriste.",
  },
  rom: {
    bannerRegionLabel: "Cookie informaciya",
    bannerTitle: "Cookie thaj garavipe",
    bannerBody:
      "Labaras numay cookie kay trubul te kerel buchi o RediHealth thaj arakhipe katar e roboturya. Na labaras cookie vash reklame.",
    acknowledge: "Xatyardem",
    openSettings: "Cookie detalya",
    policyLinkLabel: "Cookie pravila",
    privacyLinkLabel: "Garavipnaske pravila",
    footerSettingsLink: "Cookie lasharimata",
    dialogTitle: "Cookie ko RediHealth",
    dialogIntro:
      "RediHealth labarel numay cookie kay trubul thaj arakhipe. Na labaras reklame thaj na bikinas che podatke.",
    closeLabel: "Phand",
    necessaryTitle: "Cookie kay trubul",
    necessaryStatus: "Sako drom putarde",
    necessaryBody:
      "Inkren chi chhib, o than, o chacho dinipe andre thaj e lasharimata te labares.",
    securityTitle: "Arakhipe katar e roboturya (Google reCAPTCHA)",
    securityStatus: "Pe putarde formularya",
    securityBody:
      "Arakhel e putarde formularya. Dikhel numay tehnikane podatke thaj shukar na lel sastipnaske podatke.",
    adsTitle: "Reklame",
    adsStatus: "Na labaren pes",
    adsBody:
      "RediHealth na labarel cookie vash reklame vay bizeripe.",
    currentStatusLabel: "Akana",
    currentStatusActive:
      "Numay e cookie kay trubul si putarde. Nay reklame cookie.",
  },
  ru: {
    bannerRegionLabel: "Уведомление о файлах cookie",
    bannerTitle: "Файлы cookie и конфиденциальность",
    bannerBody:
      "Мы используем только строго необходимые файлы cookie для работы RediHealth и защиту от ботов в публичных формах. Мы не используем рекламные или коммерческие трекеры.",
    acknowledge: "Понятно",
    openSettings: "Подробнее о cookie",
    policyLinkLabel: "Политика cookie",
    privacyLinkLabel: "Политика конфиденциальности",
    footerSettingsLink: "Настройки cookie",
    dialogTitle: "Файлы cookie в RediHealth",
    dialogIntro:
      "RediHealth использует только необходимые файлы cookie и средства безопасности. Мы не используем рекламные трекеры и не продаём ваши данные.",
    closeLabel: "Закрыть окно",
    necessaryTitle: "Строго необходимые cookie",
    necessaryStatus: "Всегда включены",
    necessaryBody:
      "Сохраняют выбранный язык, регион, безопасный вход и настройки доступности.",
    securityTitle: "Защита от ботов (Google reCAPTCHA)",
    securityStatus: "В публичных формах",
    securityBody:
      "Защищает публичные формы от автоматических злоупотреблений. Проверяет только технические сигналы браузера и никогда не получает данные о здоровье.",
    adsTitle: "Реклама и коммерческое отслеживание",
    adsStatus: "Не используются",
    adsBody:
      "RediHealth не загружает маркетинговые, рекламные или коммерческие файлы cookie.",
    currentStatusLabel: "Текущий статус",
    currentStatusActive:
      "Активны только строго необходимые файлы cookie. Рекламные cookie не используются.",
  },
};
