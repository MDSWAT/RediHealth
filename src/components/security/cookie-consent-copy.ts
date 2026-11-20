import type { Lang } from "@/lib/i18n/languages";

export type CookieConsentCopy = {
  bannerRegionLabel: string;
  bannerTitle: string;
  bannerBody: string;
  necessaryOnly: string;
  acceptAll: string;
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
  marketingTitle: string;
  marketingStatusOn: string;
  marketingStatusOff: string;
  marketingBody: string;
  marketingToggleAria: string;
  saveChoices: string;
  savedStatus: string;
  currentStatusLabel: string;
  currentStatusAll: string;
  currentStatusNecessary: string;
  currentStatusUnset: string;
};

export const cookieConsentCopy: Record<Lang, CookieConsentCopy> = {
  ro: {
    bannerRegionLabel: "Preferințe cookie-uri",
    bannerTitle: "Cookie-uri și confidențialitate",
    bannerBody:
      "Folosim cookie-uri strict necesare ca aplicația să funcționeze. Doar cu acordul tău activăm Meta Pixel pe paginile publice de informare, pentru a măsura impactul campaniilor. Nu trimitem niciodată date de sănătate.",
    necessaryOnly: "Doar necesare",
    acceptAll: "Acceptă toate",
    openSettings: "Setări cookie-uri",
    policyLinkLabel: "Politica de cookie-uri",
    privacyLinkLabel: "Politica de confidențialitate",
    footerSettingsLink: "Setări cookie-uri",
    dialogTitle: "Setări cookie-uri",
    dialogIntro:
      "Poți alege ce cookie-uri opționale permiți și îți poți schimba decizia oricând. Fără cookie-uri opționale poți folosi toate funcțiile RediHealth.",
    closeLabel: "Închide setările",
    necessaryTitle: "Cookie-uri strict necesare",
    necessaryStatus: "Mereu active",
    necessaryBody:
      "Păstrează limba aleasă, autentificarea sigură, preferințele de accesibilitate și protecția anti-roboți pe formularele publice.",
    marketingTitle: "Măsurare campanii (Meta Pixel)",
    marketingStatusOn: "Activat",
    marketingStatusOff: "Dezactivat",
    marketingBody:
      "Meta Platforms Ireland Ltd. (Pixel ID 2195130208072639). Se încarcă doar cu acordul tău și doar pe pagini publice generale. Nu rulează pe paginile de simptome, rețete, asistent, apel cu medicul sau contul tău.",
    marketingToggleAria: "Permite cookie-urile opționale de măsurare campanii (Meta Pixel)",
    saveChoices: "Salvează",
    savedStatus: "Preferințele tale au fost salvate.",
    currentStatusLabel: "Stare actuală",
    currentStatusAll: "Cookie-uri necesare și măsurare campanii (Meta Pixel) active.",
    currentStatusNecessary: "Doar cookie-uri strict necesare active.",
    currentStatusUnset: "Nu ai ales încă preferințele. Cookie-urile opționale sunt oprite.",
  },
  en: {
    bannerRegionLabel: "Cookie preferences",
    bannerTitle: "Cookies and privacy",
    bannerBody:
      "We use strictly necessary cookies so RediHealth works reliably. Only with your consent do we load Meta Pixel on public information pages to measure campaign reach. We never send health data.",
    necessaryOnly: "Necessary only",
    acceptAll: "Accept all",
    openSettings: "Cookie settings",
    policyLinkLabel: "Cookie policy",
    privacyLinkLabel: "Privacy policy",
    footerSettingsLink: "Cookie settings",
    dialogTitle: "Cookie settings",
    dialogIntro:
      "Choose which optional cookies you allow. You can change or withdraw your consent at any time. All RediHealth features work without optional cookies.",
    closeLabel: "Close settings",
    necessaryTitle: "Strictly necessary cookies",
    necessaryStatus: "Always active",
    necessaryBody:
      "Keep your language choice, secure sign-in session, accessibility preferences and bot protection on public forms.",
    marketingTitle: "Campaign measurement (Meta Pixel)",
    marketingStatusOn: "Active",
    marketingStatusOff: "Off",
    marketingBody:
      "Meta Platforms Ireland Ltd. (Pixel ID 2195130208072639). Loads only with your consent and only on general public pages. Never runs on symptom check, prescription review, assistant, doctor call or account pages.",
    marketingToggleAria: "Allow optional campaign measurement cookies (Meta Pixel)",
    saveChoices: "Save choices",
    savedStatus: "Your cookie preferences have been saved.",
    currentStatusLabel: "Current setting",
    currentStatusAll: "Necessary cookies and campaign measurement (Meta Pixel) are active.",
    currentStatusNecessary: "Only strictly necessary cookies are active.",
    currentStatusUnset: "No choice saved yet. Optional cookies are off.",
  },
  sq: {
    bannerRegionLabel: "Preferencat e cookie-ve",
    bannerTitle: "Cookie-t dhe privatësia",
    bannerBody:
      "Përdorim cookie të domosdoshme që aplikacioni të funksionojë. Vetëm me pëlqimin tënd aktivizojmë Meta Pixel në faqet publike informative. Nuk dërgojmë kurrë të dhëna shëndetësore.",
    necessaryOnly: "Vetëm të nevojshme",
    acceptAll: "Prano të gjitha",
    openSettings: "Cilësimet e cookie-ve",
    policyLinkLabel: "Politika e cookie-ve",
    privacyLinkLabel: "Politika e privatësisë",
    footerSettingsLink: "Cilësimet e cookie-ve",
    dialogTitle: "Cilësimet e cookie-ve",
    dialogIntro:
      "Zgjidh cilat cookie opsionale lejon. Mund ta ndryshosh vendimin kurdoherë. Të gjitha funksionet e RediHealth punojnë pa cookie opsionale.",
    closeLabel: "Mbyll cilësimet",
    necessaryTitle: "Cookie të domosdoshme",
    necessaryStatus: "Gjithmonë aktive",
    necessaryBody:
      "Ruajnë gjuhën e zgjedhur, hyrjen e sigurt, preferencat e aksesueshmërisë dhe mbrojtjen nga robotët në formularët publikë.",
    marketingTitle: "Matja e fushatave (Meta Pixel)",
    marketingStatusOn: "Aktiv",
    marketingStatusOff: "Joaktiv",
    marketingBody:
      "Meta Platforms Ireland Ltd. (Pixel ID 2195130208072639). Ngarkohet vetëm me pëlqimin tënd në faqe publike të përgjithshme. Nuk aktivizohet në faqet e simptomave, recetave, asistentit, thirrjes me mjekun apo llogarisë.",
    marketingToggleAria: "Lejo cookie-t opsionale për matjen e fushatave (Meta Pixel)",
    saveChoices: "Ruaj zgjedhjet",
    savedStatus: "Preferencat e tua u ruajtën.",
    currentStatusLabel: "Gjendja aktuale",
    currentStatusAll: "Cookie-t e domosdoshme dhe matja e fushatave (Meta Pixel) janë aktive.",
    currentStatusNecessary: "Vetëm cookie-t e domosdoshme janë aktive.",
    currentStatusUnset: "Nuk ke zgjedhur ende. Cookie-t opsionale janë fikur.",
  },
  it: {
    bannerRegionLabel: "Preferenze sui cookie",
    bannerTitle: "Cookie e privacy",
    bannerBody:
      "Usiamo cookie strettamente necessari per far funzionare RediHealth. Solo con il tuo consenso attiviamo Meta Pixel sulle pagine informative pubbliche per misurare le campagne. Non inviamo mai dati sanitari.",
    necessaryOnly: "Solo necessari",
    acceptAll: "Accetta tutti",
    openSettings: "Impostazioni cookie",
    policyLinkLabel: "Politica sui cookie",
    privacyLinkLabel: "Informativa sulla privacy",
    footerSettingsLink: "Impostazioni cookie",
    dialogTitle: "Impostazioni cookie",
    dialogIntro:
      "Scegli quali cookie facoltativi consentire. Puoi cambiare o revocare il consenso in qualsiasi momento. Tutte le funzioni di RediHealth funzionano senza cookie facoltativi.",
    closeLabel: "Chiudi impostazioni",
    necessaryTitle: "Cookie strettamente necessari",
    necessaryStatus: "Sempre attivi",
    necessaryBody:
      "Mantengono la lingua scelta, l'accesso sicuro, le preferenze di accessibilità e la protezione anti-bot sui moduli pubblici.",
    marketingTitle: "Misurazione campagne (Meta Pixel)",
    marketingStatusOn: "Attivo",
    marketingStatusOff: "Disattivato",
    marketingBody:
      "Meta Platforms Ireland Ltd. (Pixel ID 2195130208072639). Si carica solo con il tuo consenso e solo su pagine pubbliche generali. Non si attiva su controllo sintomi, ricette, assistente, chiamate con il medico o account.",
    marketingToggleAria: "Consenti i cookie facoltativi di misurazione campagne (Meta Pixel)",
    saveChoices: "Salva scelte",
    savedStatus: "Le tue preferenze sui cookie sono state salvate.",
    currentStatusLabel: "Stato attuale",
    currentStatusAll: "Cookie necessari e misurazione campagne (Meta Pixel) attivi.",
    currentStatusNecessary: "Solo cookie strettamente necessari attivi.",
    currentStatusUnset: "Nessuna scelta salvata. I cookie facoltativi sono disattivati.",
  },
  hr: {
    bannerRegionLabel: "Postavke kolačića",
    bannerTitle: "Kolačići i privatnost",
    bannerBody:
      "Koristimo nužne kolačiće kako bi RediHealth ispravno radio. Samo uz tvoju privolu učitavamo Meta Pixel na javnim informativnim stranicama radi mjerenja kampanja. Nikada ne šaljemo zdravstvene podatke.",
    necessaryOnly: "Samo nužni",
    acceptAll: "Prihvati sve",
    openSettings: "Postavke kolačića",
    policyLinkLabel: "Politika kolačića",
    privacyLinkLabel: "Pravila privatnosti",
    footerSettingsLink: "Postavke kolačića",
    dialogTitle: "Postavke kolačića",
    dialogIntro:
      "Odaberi koje neobavezne kolačiće dopuštaš. Odluku možeš promijeniti ili povući u bilo kojem trenutku. Sve funkcije RediHealtha rade bez neobaveznih kolačića.",
    closeLabel: "Zatvori postavke",
    necessaryTitle: "Nužni kolačići",
    necessaryStatus: "Uvijek aktivni",
    necessaryBody:
      "Čuvaju odabrani jezik, sigurnu prijavu, postavke pristupačnosti i zaštitu od botova na javnim obrascima.",
    marketingTitle: "Mjerenje kampanja (Meta Pixel)",
    marketingStatusOn: "Uključeno",
    marketingStatusOff: "Isključeno",
    marketingBody:
      "Meta Platforms Ireland Ltd. (Pixel ID 2195130208072639). Učitava se samo uz tvoju privolu na općim javnim stranicama. Nikada se ne pokreće na provjeri simptoma, receptima, asistentu, pozivu s liječnikom ili računu.",
    marketingToggleAria: "Dopusti neobavezne kolačiće za mjerenje kampanja (Meta Pixel)",
    saveChoices: "Spremi odabir",
    savedStatus: "Tvoje postavke kolačića su spremljene.",
    currentStatusLabel: "Trenutno stanje",
    currentStatusAll: "Nužni kolačići i mjerenje kampanja (Meta Pixel) su uključeni.",
    currentStatusNecessary: "Uključeni su samo nužni kolačići.",
    currentStatusUnset: "Odabir još nije spremljen. Neobavezni kolačići su isključeni.",
  },
  rom: {
    bannerRegionLabel: "Cookie lasharimata",
    bannerTitle: "Cookie thaj garavipe",
    bannerBody:
      "Labaras cookie kay trubul te kerel buchi o RediHealth. Numay te des cho mangipe putras Meta Pixel pe putarde informaciyake riga. Shukar na bichhalas sastipnaske podatke.",
    necessaryOnly: "Numay trubul",
    acceptAll: "Kames savore",
    openSettings: "Cookie lasharimata",
    policyLinkLabel: "Cookie pravila",
    privacyLinkLabel: "Garavipnaske pravila",
    footerSettingsLink: "Cookie lasharimata",
    dialogTitle: "Cookie lasharimata",
    dialogIntro:
      "Alosar save aver cookie kames. Shay te paruves cho mangipe kana kames. Savori buchi ko RediHealth kerel buchi vi bi aver cookie-ngo.",
    closeLabel: "Phand lasharimata",
    necessaryTitle: "Cookie kay trubul",
    necessaryStatus: "Sako drom putarde",
    necessaryBody:
      "Inkren chi chhib, o chacho dinipe andre, e lasharimata te labares thaj o arakhipe katar e roboturya.",
    marketingTitle: "Kampaniyako dikhipe (Meta Pixel)",
    marketingStatusOn: "Putardo",
    marketingStatusOff: "Phando",
    marketingBody:
      "Meta Platforms Ireland Ltd. (Pixel ID 2195130208072639). Putrel pes numay che mangipesa pe putarde riga. Na kerel buchi pe simptome, recepte, asistento, svato e doktoreya vay cho konto.",
    marketingToggleAria: "De drom e cookie-nge vash kampaniyako dikhipe (Meta Pixel)",
    saveChoices: "Garav alosaripe",
    savedStatus: "Che lasharimata sine garavde.",
    currentStatusLabel: "Akana",
    currentStatusAll: "Cookie kay trubul thaj Meta Pixel si putarde.",
    currentStatusNecessary: "Numay e cookie kay trubul si putarde.",
    currentStatusUnset: "Inka na alosardyan. E aver cookie si phande.",
  },
  ru: {
    bannerRegionLabel: "Настройки файлов cookie",
    bannerTitle: "Файлы cookie и конфиденциальность",
    bannerBody:
      "Мы используем строго необходимые файлы cookie для работы RediHealth. Только с вашего согласия мы загружаем Meta Pixel на общедоступных информационных страницах для оценки охвата кампаний. Данные о здоровье никогда не передаются.",
    necessaryOnly: "Только нужные",
    acceptAll: "Принять все",
    openSettings: "Настройки cookie",
    policyLinkLabel: "Политика cookie",
    privacyLinkLabel: "Политика конфиденциальности",
    footerSettingsLink: "Настройки cookie",
    dialogTitle: "Настройки cookie",
    dialogIntro:
      "Выберите, какие необязательные файлы cookie вы разрешаете. Вы можете изменить или отозвать согласие в любое время. Все функции RediHealth работают и без них.",
    closeLabel: "Закрыть настройки",
    necessaryTitle: "Строго необходимые cookie",
    necessaryStatus: "Всегда включены",
    necessaryBody:
      "Сохраняют выбранный язык, безопасный вход, настройки доступности и защиту от ботов в публичных формах.",
    marketingTitle: "Оценка кампаний (Meta Pixel)",
    marketingStatusOn: "Включено",
    marketingStatusOff: "Отключено",
    marketingBody:
      "Meta Platforms Ireland Ltd. (Pixel ID 2195130208072639). Загружается только с вашего согласия на общих публичных страницах. Никогда не работает на страницах проверки симптомов, рецептов, помощника, звонков врачу или личного кабинета.",
    marketingToggleAria: "Разрешить необязательные cookie для оценки кампаний (Meta Pixel)",
    saveChoices: "Сохранить выбор",
    savedStatus: "Ваши настройки cookie сохранены.",
    currentStatusLabel: "Текущий статус",
    currentStatusAll: "Включены необходимые cookie и оценка кампаний (Meta Pixel).",
    currentStatusNecessary: "Включены только строго необходимые cookie.",
    currentStatusUnset: "Выбор ещё не сделан. Необязательные cookie отключены.",
  },
};
