import type { Lang } from "@/lib/i18n/translations";
import type { CountryCode, InstituteCategory } from "@/lib/medical-institutes";

export type CityPreset = {
  name: string;
  lat: number;
  lng: number;
};

export type FindHelpCopy = {
  countries: Record<CountryCode, string>;
  categories: Record<InstituteCategory, string>;
  allCategories: string;
  countryLabel: string;
  locationLabel: string;
  myLocation: string;
  mapArea: string;
  categoryLabel: string;
  /** Public (state) or private filter: its label and the three choices, then the word on a result. */
  ownershipLabel: string;
  ownershipAll: string;
  ownershipPublicOnly: string;
  ownershipPrivateOnly: string;
  ownershipPublicHint: string;
  ownershipPrivateHint: string;
  ownership: { public: string; private: string };
  searchPlaceholder: string;
  /** Short placeholder that fits a 375px phone; the label keeps the full searchPlaceholder. */
  searchHint: string;
  searchButton: string;
  useMyLocation: string;
  locating: string;
  locationActive: string;
  locationDenied: string;
  /** Phones: the list starts from a guessed city because the place is unknown. */
  guessedPlaceHint: (city: string) => string;
  /** A refresh failed with no connection and the earlier list stays on screen. */
  offlineKeptList: string;
  /** The typed address was not found and no place matches it by name either. */
  addressNotFound: string;
  /** Above a list restored from the phone when nothing could be loaded. */
  savedListNotice: (date: string) => string;
  hoursUnknown: string;
  callBeforeGoing: string;
  /** "Show more" when the next rows still have to be fetched, so their number is not known. */
  showMorePlaces: string;
  placesInArea: string;
  changeCountry: string;
  distantLocationNotice: (country: string) => string;
  showingCountry: (country: string) => string;
  nearCity: (city: string) => string;
  nearPlace: (place: string) => string;
  allPlaces: string;
  change: string;
  filtersTitle: string;
  showPlaces: (count: number) => string;
  fromCentre: (distance: string, city: string) => string;
  suggestedByLanguage: (city: string, country: string) => string;
  suggestedByRegion: (city: string, country: string) => string;
  quickSuggestionsLabel: string;
  wholeCountryOption: (country: string) => string;
  searchThisArea: string;
  loading: string;
  loadError: string;
  retry: string;
  noResults: string;
  clearFilters: string;
  kmAway: (km: string) => string;
  metersWalkAway: (meters: number, minutes: number) => string;
  open24h: string;
  openNowLive: string;
  closedNowLive: string;
  openNowFilter: string;
  emergencyWalkInFilter: string;
  emergencyRightsCallout: string;
  listen: string;
  stopListening: string;
  largeText: string;
  spokenIntro: string;
  cityQuickJumpLabel: string;
  viewModeLabel: string;
  viewMap: string;
  viewList: string;
  closePreview: string;
  emergency: string;
  callAction: string;
  callNumber: (phone: string) => string;
  directions: string;
  website: string;
  youAreHere: string;
  /** Accessible name of the two-item key under the map. */
  mapLegendLabel: string;
  legendPlace: string;
  legendEmergency: string;
  legendCluster: string;
  resultsCount: (count: number) => string;
  showMore: (remaining: number) => string;
  /** OpenStreetMap opening_hours day codes (Mo…Su, PH) and "off", in this language. */
  hoursTokens: Record<"Mo" | "Tu" | "We" | "Th" | "Fr" | "Sa" | "Su" | "PH" | "off", string>;
  /** Page-level copy so /find-help works across every supported locale even when global translations lag. */
  page: {
    heroParagraph: string;
    listTitle: string;
    listSubtitle: string;
    loadingMap: string;
    mapAttribution: string;
    ctaTitle: string;
    ctaBody: string;
    ctaButton: string;
    mediatorTag: string;
    mediatorTitle: string;
    mediatorBody: string;
    mediatorButton: string;
  };
};

export const REGIONAL_CITY_PRESETS: Record<CountryCode, CityPreset[]> = {
  RO: [
    { name: "București", lat: 44.4268, lng: 26.1025 },
    { name: "Cluj-Napoca", lat: 46.7712, lng: 23.6236 },
    { name: "Timișoara", lat: 45.7489, lng: 21.2087 },
    { name: "Iași", lat: 47.1585, lng: 27.6014 },
    { name: "Constanța", lat: 44.1598, lng: 28.6348 },
    { name: "Craiova", lat: 44.3302, lng: 23.7949 },
    { name: "Brașov", lat: 45.6427, lng: 25.5887 },
  ],
  AL: [
    { name: "Tiranë", lat: 41.3275, lng: 19.8187 },
    { name: "Durrës", lat: 41.3246, lng: 19.4565 },
    { name: "Vlorë", lat: 40.4661, lng: 19.4914 },
    { name: "Shkodër", lat: 42.0693, lng: 19.5126 },
    { name: "Elbasan", lat: 41.1125, lng: 20.0822 },
    { name: "Korçë", lat: 40.6186, lng: 20.7808 },
  ],
  IT: [
    { name: "Roma", lat: 41.9028, lng: 12.4964 },
    { name: "Milano", lat: 45.4642, lng: 9.19 },
    { name: "Torino", lat: 45.0703, lng: 7.6869 },
    { name: "Napoli", lat: 40.8518, lng: 14.2681 },
    { name: "Bologna", lat: 44.4949, lng: 11.3426 },
    { name: "Bari", lat: 41.1171, lng: 16.8719 },
  ],
  MD: [
    { name: "Chișinău", lat: 47.0105, lng: 28.8638 },
    { name: "Bălți", lat: 47.7617, lng: 27.9289 },
    { name: "Cahul", lat: 45.9075, lng: 28.1944 },
    { name: "Orhei", lat: 47.3847, lng: 28.8244 },
  ],
  HR: [
    { name: "Zagreb", lat: 45.815, lng: 15.9819 },
    { name: "Split", lat: 43.5081, lng: 16.4402 },
    { name: "Rijeka", lat: 45.3271, lng: 14.4422 },
    { name: "Osijek", lat: 45.555, lng: 18.6955 },
    { name: "Zadar", lat: 44.1194, lng: 15.2313 },
    { name: "Varaždin", lat: 46.3044, lng: 16.3378 },
    { name: "Čakovec", lat: 46.3844, lng: 16.4339 },
  ],
};

function croatianPlural(count: number, one: string, few: string, many: string): string {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return `${count} ${one}`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${count} ${few}`;
  return `${count} ${many}`;
}

function russianPlaceCount(count: number): string {
  const form = new Intl.PluralRules("ru").select(count);
  const noun = form === "one" ? "место" : form === "few" ? "места" : "мест";
  return `${count} ${noun}`;
}

export const findHelpTranslations: Record<Lang, FindHelpCopy> = {
  ru: {
    callAction: "Позвонить",
    callNumber: (phone) => `Позвонить ${phone}`,
"metersWalkAway": (meters, minutes) => `В ${meters} м (около ${minutes} мин пешком)`,
"closedNowLive": "Сейчас закрыто",
"listen": "Слушать",
"stopListening": "Стоп",
"largeText": "Крупнее",
"spokenIntro": "Выберите аптеку, больницу, семейного врача, клинику или стоматолога. Можно включить фильтр отделений неотложной помощи.",
"showMore": (remaining) => `Показать ещё ${russianPlaceCount(remaining)}`,

"locationLabel": "Где",
"myLocation": "Моё местоположение",
"mapArea": "Область карты",
"placesInArea": "Места в этой области",
"changeCountry": "Изменить страну",
"distantLocationNotice": (country) => `Вы находитесь далеко от выбранной страны: ${country}.`,
"showingCountry": (country) => `Показаны места: ${country}`,
"nearCity": (city) => `Рядом с городом ${city}`,
"nearPlace": (place) => `Рядом: ${place}`,
"allPlaces": "все места",
"change": "Изменить",
"filtersTitle": "Фильтры",
"showPlaces": (count) => `Показать ${russianPlaceCount(count)}`,
"fromCentre": (distance, city) => `примерно в ${distance} от центра города ${city}`,
"suggestedByLanguage": (city, country) => `Предложено по языку: ${city}, ${country}`,
"suggestedByRegion": (city, country) => `Предложено для вашего региона: ${city}, ${country}`,
"quickSuggestionsLabel": "Быстрый выбор места",
"wholeCountryOption": (country) => `Вся страна: ${country}`,
"mapLegendLabel": "Обозначения карты",
"legendPlace": "Медицинское учреждение",
"legendEmergency": "Отделение неотложной помощи",
"legendCluster": "Несколько мест: нажмите, чтобы приблизить",





"openNowLive": "Сейчас открыто",
"openNowFilter": "Открыто сейчас",
"emergencyWalkInFilter": "Неотложная помощь",
"emergencyRightsCallout": "В экстренной ситуации обратитесь в отделение неотложной помощи, даже без страховки или удостоверения личности. Уточните местные условия помощи.",
"cityQuickJumpLabel": "Перейти к городу",
"viewModeLabel": "Режим мобильного просмотра",

"viewMap": "Карта",
"viewList": "Список",
"closePreview": "Закрыть",
"page": {"heroParagraph":"Медицинские службы рядом с вами на карте. Выберите место, чтобы увидеть адрес и телефон.","listTitle":"Аптеки и клиники","listSubtitle":"Введите адрес, улицу или город, чтобы увидеть ближайшие места по расстоянию.","loadingMap":"Загрузка карты…","mapAttribution":"Данные карты © участники OpenStreetMap.","ctaTitle":"Не знаете, куда обратиться?","ctaBody":"Мы поможем выбрать врача или службу. В экстренной ситуации сразу звоните 112.","ctaButton":"Попросить помощь","mediatorTag":"Медицинский посредник сообщества","mediatorTitle":"Нужна помощь с регистрацией или разговором в приемной?","mediatorBody":"Посредник объяснит, какие документы нужны, поможет зарегистрироваться у семейного врача и поддержит при отказе.","mediatorButton":"Найти посредника"},

    countries: {


"HR": "Хорватия",
 RO: "Румыния", AL: "Албания", IT: "Италия", MD: "Молдова" },
    categories: {
      hospital: "Больница",
      clinic: "Клиника",
      gp: "Семейный врач",
      dentist: "Стоматолог",
      pharmacy: "Аптека",
      other: "Другое",
    },
    allCategories: "Все",
    countryLabel: "Страна",
    categoryLabel: "Тип",
    ownershipLabel: "Государственные или частные",
    ownershipAll: "Государственные и частные",
    ownershipPublicOnly: "Только государственные",
    ownershipPrivateOnly: "Только частные",
    ownershipPublicHint: "Бесплатно по страховке или при экстренных случаях; ожидание может быть дольше или нужно направление.",
    ownershipPrivateHint: "Запись быстрее, но часто дороже — обычно оплачивается из своего кармана и редко принимает тяжёлые экстренные случаи.",
    ownership: { public: "Государственное", private: "Частное" },
    searchPlaceholder: "Введите адрес, улицу, город или название",
    searchHint: "ул. или город",
    searchButton: "Поиск",
    useMyLocation: "Использовать мое местоположение",
    locating: "Поиск вашего местоположения…",
    locationActive: "Ближайшие к вам места",
    locationDenied: "Не удалось определить ваше местоположение. Введите свой город или улицу.",
    guessedPlaceHint: (city) =>
      `Мы не знаем, где вы находитесь, поэтому список начинается с города ${city}. Введите свой город или улицу либо используйте своё местоположение.`,
    offlineKeptList: "Нет интернета. Это последний загруженный список.",
    addressNotFound: "Мы не нашли такой адрес или название. Попробуйте ввести только название города.",
    savedListNotice: (date) => `Список сохранён ${date}. Он может быть устаревшим.`,
    hoursUnknown: "Часы работы не указаны.",
    callBeforeGoing: "Позвоните перед визитом.",
    showMorePlaces: "Показать ещё места",

    searchThisArea: "Искать в этой области",
    loading: "Загрузка мест…",
    loadError: "Не удалось загрузить медицинские учреждения. Попробуйте ещё раз.",
    retry: "Попробуйте еще раз",
    noResults: "Ничего не найдено. Измените поисковый запрос или тип учреждения.",
    clearFilters: "Очистить поиск",
    kmAway: (km) => `${km} км`,
    open24h: "Открыто 24 часа",
    emergency: "Неотложная помощь",
    directions: "Маршрут",
    website: "Веб-сайт",
    youAreHere: "Вы здесь",




    resultsCount: (count) => russianPlaceCount(count),
    hoursTokens: { Mo: "Пн", Tu: "Вт", We: "Ср", Th: "Чт", Fr: "Пт", Sa: "Сб", Su: "Вс", PH: "Праздничные дни", off: "закрыто" },
  },

  en: {
    countries: { RO: "Romania", AL: "Albania", IT: "Italy", MD: "Moldova", HR: "Croatia" },
    categories: {
      hospital: "Hospital",
      clinic: "Clinic",
      gp: "Family doctor",
      dentist: "Dentist",
      pharmacy: "Pharmacy",
      other: "Other",
    },
    allCategories: "All",
    countryLabel: "Country",
    locationLabel: "Where",
    myLocation: "My location",
    mapArea: "Map area",
    categoryLabel: "Type",
    ownershipLabel: "Public or private",
    ownershipAll: "Public and private",
    ownershipPublicOnly: "Public only",
    ownershipPrivateOnly: "Private only",
    ownershipPublicHint: "Free with public insurance or for emergencies; wait times can be longer and some visits need a referral.",
    ownershipPrivateHint: "Faster appointments, but often more expensive — usually paid out of pocket and rarely handles major emergencies.",
    ownership: { public: "Public", private: "Private" },
    searchPlaceholder: "Enter address, street, town or clinic name",
    searchHint: "Street or town",
    searchButton: "Search",
    useMyLocation: "Use my location",
    locating: "Finding your location…",
    locationActive: "Places closest to you",
    locationDenied: "We could not get your location. Type your town or street.",
    guessedPlaceHint: (city) =>
      `We do not know where you are, so this list starts from ${city}. Type your town or street, or use your location.`,
    offlineKeptList: "You are offline. This is the last list that loaded.",
    addressNotFound: "We did not find that address or name. Try only the name of the town.",
    savedListNotice: (date) => `Saved list from ${date}. It may be out of date.`,
    hoursUnknown: "Opening hours not listed.",
    callBeforeGoing: "Call before you go.",
    showMorePlaces: "Show more places",
    placesInArea: "Places in this area",
    changeCountry: "Change country",
    distantLocationNotice: (country) =>
      `There are no health services near you. Showing places in ${country}.`,
    showingCountry: (country) => `Places in ${country}`,
    nearCity: (city) => `Near ${city}`,
    suggestedByLanguage: (city, country) => `Suggested for this language: ${city}, ${country}`,
    suggestedByRegion: (city, country) => `Suggested for your region: ${city}, ${country}`,
    quickSuggestionsLabel: "Quick location switch",
    wholeCountryOption: (country) => `All of ${country}`,
    searchThisArea: "Search this area",
    loading: "Loading places…",
    loadError: "The places did not load. Try again.",
    retry: "Try again",
    noResults: "No places found. Try another word or type.",
    clearFilters: "Clear search",
    kmAway: (km) => `${km} km away`,
    metersWalkAway: (meters, minutes) => `${meters} m away (~${minutes} min walk)`,
    open24h: "Open 24 hours",
    openNowLive: "Open now",
    closedNowLive: "Closed now",
    openNowFilter: "Open now",
    emergencyWalkInFilter: "Emergency care",
    emergencyRightsCallout:
      "By law, hospital emergency departments assess urgent cases free of charge, even without health insurance or an identity card.",
    listen: "Listen",
    stopListening: "Stop",
    largeText: "Larger text",
    spokenIntro:
      "Pick a symbol below for pharmacy, hospital, family doctor, clinic or dentist. You can also filter for emergency reception without a health card.",
    cityQuickJumpLabel: "Pick a city",
    viewModeLabel: "Show as",
    viewMap: "Map",
    viewList: "List",
    closePreview: "Close",
    emergency: "Emergency",
    callAction: "Call",
    callNumber: (phone) => `Call ${phone}`,
    directions: "Directions",
    website: "Website",
    youAreHere: "You are here",
    mapLegendLabel: "Map key",
    legendPlace: "Health facility",
    legendEmergency: "Emergency department",
    legendCluster: "Several places: tap to zoom in",
    showMore: (remaining) => (remaining === 1 ? "Show 1 more place" : `Show ${remaining} more places`),
    resultsCount: (count) => (count === 1 ? "1 place" : `${count} places`),
    nearPlace: (place) => `Near ${place}`,
    allPlaces: "all places",
    change: "Change",
    filtersTitle: "Filters",
    showPlaces: (count) => (count === 1 ? "Show 1 place" : `Show ${count} places`),
    fromCentre: (distance, city) => `about ${distance} from ${city} centre`,
    hoursTokens: { Mo: "Mon", Tu: "Tue", We: "Wed", Th: "Thu", Fr: "Fri", Sa: "Sat", Su: "Sun", PH: "Public holidays", off: "closed" },
    page: {
      heroParagraph: "See health services near you on the map. Tap a place to see its address and phone number.",
      listTitle: "Pharmacies and clinics",
      listSubtitle: "Enter an address, street or town to see the nearest places listed by distance.",
      loadingMap: "Loading map…",
      mapAttribution: "Map data © OpenStreetMap contributors.",
      ctaTitle: "Not sure where to go?",
      ctaBody: "If you don't know which doctor to see or where to go, we can guide you. In an emergency, call 112 right away.",
      ctaButton: "Ask a person",
      mediatorTag: "Community health mediator",
      mediatorTitle: "Need help registering or speaking at reception?",
      mediatorBody:
        "A community health mediator can explain which documents you need, help you register with a family doctor, and support you if you are turned away.",
      mediatorButton: "Find a mediator",
    },
  },
  ro: {
    countries: { RO: "România", AL: "Albania", IT: "Italia", MD: "Republica Moldova", HR: "Croația" },
    categories: {
      hospital: "Spital",
      clinic: "Clinică",
      gp: "Medic de familie",
      dentist: "Stomatologie",
      pharmacy: "Farmacie",
      other: "Altele",
    },
    allCategories: "Toate",
    countryLabel: "Țară",
    locationLabel: "Unde",
    myLocation: "Locația mea",
    mapArea: "Zona de pe hartă",
    categoryLabel: "Tip",
    ownershipLabel: "De stat sau private",
    ownershipAll: "De stat și private",
    ownershipPublicOnly: "Doar de stat",
    ownershipPrivateOnly: "Doar private",
    ownershipPublicHint: "Gratuit cu asigurare CNAS sau la urgențe; uneori aștepți mai mult sau ai nevoie de trimitere.",
    ownershipPrivateHint: "Programări mai rapide, dar adesea mai scump — plătești din buzunar fără contract CNAS și rar preia urgențe grave.",
    ownership: { public: "De stat", private: "Privat" },
    searchPlaceholder: "Scrie adresa, strada, orașul sau numele",
    searchHint: "Stradă sau oraș",
    searchButton: "Caută",
    useMyLocation: "Folosește locația mea",
    locating: "Căutăm unde ești…",
    locationActive: "Locurile cele mai apropiate de tine",
    locationDenied: "Nu am putut afla unde ești. Scrie orașul sau strada ta.",
    guessedPlaceHint: (city) =>
      `Nu știm unde ești, așa că lista pornește din ${city}. Scrie orașul sau strada ta ori folosește locația ta.`,
    offlineKeptList: "Nu ai internet. Aceasta este ultima listă încărcată.",
    addressNotFound: "Nu am găsit adresa sau numele. Încearcă doar numele orașului.",
    savedListNotice: (date) => `Listă salvată din ${date}. Poate fi veche.`,
    hoursUnknown: "Programul nu este trecut.",
    callBeforeGoing: "Sună înainte să mergi.",
    showMorePlaces: "Arată mai multe locuri",
    placesInArea: "Locurile din zonă",
    changeCountry: "Schimbă țara",
    distantLocationNotice: (country) =>
      `Nu sunt servicii medicale lângă tine. Îți arătăm locuri din ${country}.`,
    showingCountry: (country) => `Locuri din ${country}`,
    nearCity: (city) => `Lângă ${city}`,
    suggestedByLanguage: (city, country) => `Sugerat după limbă: ${city}, ${country}`,
    suggestedByRegion: (city, country) => `Sugerat pentru zona ta: ${city}, ${country}`,
    quickSuggestionsLabel: "Schimbă rapid zona",
    wholeCountryOption: (country) => `Toată țara: ${country}`,
    searchThisArea: "Caută în această zonă",
    loading: "Se încarcă locurile…",
    loadError: "Locurile nu s-au încărcat. Încearcă din nou.",
    retry: "Încearcă din nou",
    noResults: "Nu am găsit niciun loc. Încearcă alt cuvânt sau alt tip.",
    clearFilters: "Șterge căutarea",
    kmAway: (km) => `la ${km} km`,
    metersWalkAway: (meters, minutes) => `la ${meters} m (~${minutes} min pe jos)`,
    open24h: "Deschis non-stop",
    openNowLive: "Deschis acum",
    closedNowLive: "Închis acum",
    openNowFilter: "Deschis acum",
    emergencyWalkInFilter: "Primiri urgențe",
    emergencyRightsCallout:
      "Prin lege, unitățile de primiri urgențe evaluează gratuit cazurile urgente, chiar dacă nu ai asigurare CNAS sau act de identitate la tine.",
    listen: "Ascultă",
    stopListening: "Oprește",
    largeText: "Text mai mare",
    spokenIntro:
      "Alege mai jos simbolul pentru farmacie, spital, medic de familie, clinică sau stomatologie. Poți filtra și unitățile de primiri urgențe fără card de sănătate.",
    cityQuickJumpLabel: "Alege un oraș",
    viewModeLabel: "Arată ca",
    viewMap: "Hartă",
    viewList: "Listă",
    closePreview: "Închide",
    emergency: "Urgențe",
    callAction: "Sună",
    callNumber: (phone) => `Sună la ${phone}`,
    directions: "Traseu",
    website: "Site web",
    youAreHere: "Ești aici",
    mapLegendLabel: "Legenda hărții",
    legendPlace: "Unitate medicală",
    legendEmergency: "Primiri urgențe",
    legendCluster: "Mai multe locuri: apasă ca să mărești",
    showMore: (remaining) =>
      remaining === 1
        ? "Arată încă un loc"
        : remaining % 100 === 0 || remaining % 100 >= 20
          ? `Arată încă ${remaining} de locuri`
          : `Arată încă ${remaining} locuri`,
    // Romanian plural: 0 locuri, 1 loc, 2–19 locuri, 20+ (and non-zero x00) „de locuri”.
    resultsCount: (count) =>
      count === 0
        ? "0 locuri"
        : count === 1
          ? "1 loc"
          : count % 100 === 0 || count % 100 >= 20
            ? `${count} de locuri`
            : `${count} locuri`,
    nearPlace: (place) => `Lângă ${place}`,
    allPlaces: "toate locurile",
    change: "Schimbă",
    filtersTitle: "Filtre",
    showPlaces: (count) =>
      count === 0
        ? "Arată 0 locuri"
        : count === 1
          ? "Arată 1 loc"
          : count % 100 === 0 || count % 100 >= 20
            ? `Arată ${count} de locuri`
            : `Arată ${count} locuri`,
    fromCentre: (distance, city) => `la circa ${distance} de centrul orașului ${city}`,
    hoursTokens: { Mo: "Lu", Tu: "Ma", We: "Mi", Th: "Jo", Fr: "Vi", Sa: "Sâ", Su: "Du", PH: "Sărbători legale", off: "închis" },
    page: {
      heroParagraph: "Vezi pe hartă unitățile medicale din apropiere. Apasă pe un loc ca să vezi adresa și telefonul.",
      listTitle: "Farmacii și clinici",
      listSubtitle: "Introdu adresa, strada sau orașul ca să vezi cele mai apropiate locuri ordonate după distanță.",
      loadingMap: "Se încarcă harta…",
      mapAttribution: "Date hartă © contribuitori OpenStreetMap.",
      ctaTitle: "Nu știi unde să mergi?",
      ctaBody: "Dacă nu știi la ce medic sau unde să mergi, te putem îndruma noi. Pentru o urgență, sună imediat la 112.",
      ctaButton: "Cere ajutor",
      mediatorTag: "Mediator sanitar comunitar",
      mediatorTitle: "Ai nevoie de sprijin la înscriere sau la ghișeu?",
      mediatorBody:
        "Un mediator sanitar îți explică ce acte îți trebuie, te ajută să te înscrii la medicul de familie și îți apără drepturile dacă ești refuzat.",
      mediatorButton: "Caută mediator",
    },
  },
  sq: {
    countries: { RO: "Rumania", AL: "Shqipëria", IT: "Italia", MD: "Moldavia", HR: "Kroacia" },
    categories: {
      hospital: "Spital",
      clinic: "Klinikë",
      gp: "Mjek familjeje",
      dentist: "Dentist",
      pharmacy: "Farmaci",
      other: "Të tjera",
    },
    allCategories: "Të gjitha",
    countryLabel: "Shteti",
    locationLabel: "Ku",
    myLocation: "Vendndodhja ime",
    mapArea: "Zona në hartë",
    categoryLabel: "Lloji",
    ownershipLabel: "Publike apo private",
    ownershipAll: "Publike dhe private",
    ownershipPublicOnly: "Vetëm publike",
    ownershipPrivateOnly: "Vetëm private",
    ownershipPublicHint: "Falas me sigurim shëndetësor ose për urgjenca; pritja mund të jetë më e gjatë ose duhet rekomandim.",
    ownershipPrivateHint: "Takime më të shpejta, por shpesh më e shtrenjtë — zakonisht paguhet vetë dhe rrallë trajton urgjenca të rënda.",
    ownership: { public: "Publik", private: "Privat" },
    searchPlaceholder: "Shkruaj adresën, rrugën, qytetin ose emrin",
    searchHint: "Rrugë ose qytet",
    searchButton: "Kërko",
    useMyLocation: "Përdor vendndodhjen time",
    locating: "Po kërkojmë ku je…",
    locationActive: "Vendet më afër teje",
    locationDenied: "Nuk mundëm ta gjejmë vendndodhjen tënde. Shkruaj qytetin ose rrugën tënde.",
    guessedPlaceHint: (city) =>
      `Nuk e dimë ku je, prandaj lista fillon nga ${city}. Shkruaj qytetin ose rrugën tënde, ose përdor vendndodhjen tënde.`,
    offlineKeptList: "Nuk ke internet. Kjo është lista e fundit që u ngarkua.",
    addressNotFound: "Nuk e gjetëm këtë adresë ose emër. Provo vetëm emrin e qytetit.",
    savedListNotice: (date) => `Listë e ruajtur më ${date}. Mund të jetë e vjetër.`,
    hoursUnknown: "Orari nuk është shënuar.",
    callBeforeGoing: "Telefono para se të shkosh.",
    showMorePlaces: "Shfaq më shumë vende",
    placesInArea: "Vendet në këtë zonë",
    changeCountry: "Ndrysho shtetin",
    distantLocationNotice: (country) =>
      `Nuk ka shërbime shëndetësore pranë teje. Po të tregojmë vende në ${country}.`,
    showingCountry: (country) => `Vende në ${country}`,
    nearCity: (city) => `Pranë ${city}`,
    suggestedByLanguage: (city, country) => `Sugjeruar sipas gjuhës: ${city}, ${country}`,
    suggestedByRegion: (city, country) => `Sugjeruar për zonën tënde: ${city}, ${country}`,
    quickSuggestionsLabel: "Ndrysho shpejt zonën",
    wholeCountryOption: (country) => `Gjithë shteti: ${country}`,
    searchThisArea: "Kërko në këtë zonë",
    loading: "Po ngarkohen vendet…",
    loadError: "Vendet nuk u ngarkuan. Provo përsëri.",
    retry: "Provo përsëri",
    noResults: "Nuk u gjet asnjë vend. Provo një fjalë ose lloj tjetër.",
    clearFilters: "Pastro kërkimin",
    kmAway: (km) => `${km} km larg`,
    metersWalkAway: (meters, minutes) => `${meters} m larg (~${minutes} min në këmbë)`,
    open24h: "Hapur 24 orë",
    openNowLive: "Hapur tani",
    closedNowLive: "Mbyllur tani",
    openNowFilter: "Hapur tani",
    emergencyWalkInFilter: "Urgjenca",
    emergencyRightsCallout:
      "Me ligj, shërbimet e urgjencës spitalore trajtojnë rastet urgjente falas, edhe pa sigurim shëndetësor ose pa dokument identiteti.",
    listen: "Dëgjo",
    stopListening: "Ndalo",
    largeText: "Tekst më i madh",
    spokenIntro:
      "Zgjidh më poshtë simbolin për farmaci, spital, mjek familjeje, klinikë ose dentist. Mund të filtrosh edhe urgjencën spitalore pa kartë shëndeti.",
    cityQuickJumpLabel: "Zgjidh një qytet",
    viewModeLabel: "Shfaq si",
    viewMap: "Hartë",
    viewList: "Listë",
    closePreview: "Mbyll",
    emergency: "Urgjencë",
    callAction: "Telefono",
    callNumber: (phone) => `Telefono ${phone}`,
    directions: "Udhëzime",
    website: "Faqja web",
    youAreHere: "Ti je këtu",
    mapLegendLabel: "Legjenda e hartës",
    legendPlace: "Institucion shëndetësor",
    legendEmergency: "Urgjenca",
    legendCluster: "Disa vende: prek për ta zmadhuar",
    showMore: (remaining) => (remaining === 1 ? "Shfaq edhe 1 vend" : `Shfaq edhe ${remaining} vende`),
    resultsCount: (count) => (count === 1 ? "1 vend" : `${count} vende`),
    nearPlace: (place) => `Pranë ${place}`,
    allPlaces: "të gjitha vendet",
    change: "Ndrysho",
    filtersTitle: "Filtra",
    showPlaces: (count) => (count === 1 ? "Shfaq 1 vend" : `Shfaq ${count} vende`),
    fromCentre: (distance, city) => `rreth ${distance} nga qendra e qytetit ${city}`,
    hoursTokens: { Mo: "Hën", Tu: "Mar", We: "Mër", Th: "Enj", Fr: "Pre", Sa: "Sht", Su: "Die", PH: "Festat zyrtare", off: "mbyllur" },
    page: {
      heroParagraph: "Shiko në hartë shërbimet shëndetësore pranë teje. Prek një vend për të parë adresën dhe telefonin.",
      listTitle: "Farmaci dhe klinika",
      listSubtitle: "Shkruaj një adresë, rrugë ose qytet për të parë vendet më të afërta sipas largësisë.",
      loadingMap: "Duke ngarkuar hartën…",
      mapAttribution: "Të dhënat e hartës © kontribuesit e OpenStreetMap.",
      ctaTitle: "Nuk di ku të shkosh?",
      ctaBody: "Nëse nuk di te cili mjek të shkosh, të udhëzojmë ne. Për një urgjencë, telefono menjëherë 112.",
      ctaButton: "Kërko ndihmë",
      mediatorTag: "Mediator shëndetësor në komunitet",
      mediatorTitle: "Të duhet ndihmë për regjistrim ose në sportel?",
      mediatorBody:
        "Një mediator shëndetësor të shpjegon dokumentet që të duhen, të ndihmon të regjistrohesh te mjeku i familjes dhe të mbron nëse të refuzojnë.",
      mediatorButton: "Gjej mediator",
    },
  },
  it: {
    countries: { RO: "Romania", AL: "Albania", IT: "Italia", MD: "Moldavia", HR: "Croazia" },
    categories: {
      hospital: "Ospedale",
      clinic: "Clinica",
      gp: "Medico di base",
      dentist: "Dentista",
      pharmacy: "Farmacia",
      other: "Altro",
    },
    allCategories: "Tutti",
    countryLabel: "Paese",
    locationLabel: "Dove",
    myLocation: "La mia posizione",
    mapArea: "Zona della mappa",
    categoryLabel: "Tipo",
    ownershipLabel: "Pubblico o privato",
    ownershipAll: "Pubblici e privati",
    ownershipPublicOnly: "Solo pubblici",
    ownershipPrivateOnly: "Solo privati",
    ownershipPublicHint: "Gratuito o con ticket tramite SSN e per urgenze; i tempi di attesa possono essere più lunghi.",
    ownershipPrivateHint: "Visite più rapide, ma spesso più costoso — si paga di tasca propria e raramente gestisce urgenze gravi.",
    ownership: { public: "Pubblico", private: "Privato" },
    searchPlaceholder: "Inserisci indirizzo, via, città o nome",
    searchHint: "Via o città",
    searchButton: "Cerca",
    useMyLocation: "Usa la mia posizione",
    locating: "Cerchiamo dove sei…",
    locationActive: "I posti più vicini a te",
    locationDenied: "Non siamo riusciti a trovare la tua posizione. Scrivi la tua città o la tua via.",
    guessedPlaceHint: (city) =>
      `Non sappiamo dove sei, quindi l'elenco parte da ${city}. Scrivi la tua città o la tua via, oppure usa la tua posizione.`,
    offlineKeptList: "Sei senza internet. Questo è l'ultimo elenco caricato.",
    addressNotFound: "Non abbiamo trovato questo indirizzo o nome. Prova solo con il nome della città.",
    savedListNotice: (date) => `Elenco salvato il ${date}. Potrebbe non essere aggiornato.`,
    hoursUnknown: "Orari non indicati.",
    callBeforeGoing: "Chiama prima di andare.",
    showMorePlaces: "Mostra altri posti",
    placesInArea: "Posti nella zona",
    changeCountry: "Cambia paese",
    distantLocationNotice: (country) =>
      `Non ci sono servizi sanitari vicino a te. Ti mostriamo i posti in ${country}.`,
    showingCountry: (country) => `Posti in ${country}`,
    nearCity: (city) => `Vicino a ${city}`,
    suggestedByLanguage: (city, country) => `Suggerito per la lingua: ${city}, ${country}`,
    suggestedByRegion: (city, country) => `Suggerito per la tua zona: ${city}, ${country}`,
    quickSuggestionsLabel: "Cambia zona rapidamente",
    wholeCountryOption: (country) => `Tutto il paese: ${country}`,
    searchThisArea: "Cerca in quest'area",
    loading: "Caricamento dei posti…",
    loadError: "I posti non si sono caricati. Riprova.",
    retry: "Riprova",
    noResults: "Nessun posto trovato. Prova un'altra parola o un altro tipo.",
    clearFilters: "Cancella la ricerca",
    kmAway: (km) => `a ${km} km`,
    metersWalkAway: (meters, minutes) => `a ${meters} m (~${minutes} min a piedi)`,
    open24h: "Aperto 24 ore su 24",
    openNowLive: "Aperto ora",
    closedNowLive: "Chiuso ora",
    openNowFilter: "Aperto ora",
    emergencyWalkInFilter: "Pronto soccorso",
    emergencyRightsCallout:
      "Per legge, il pronto soccorso ospedaliero assiste gratuitamente i casi urgenti, anche senza tessera sanitaria o documento d'identità.",
    listen: "Ascolta",
    stopListening: "Ferma",
    largeText: "Testo più grande",
    spokenIntro:
      "Scegli qui sotto il simbolo per farmacia, ospedale, medico di base, clinica o dentista. Puoi anche filtrare il pronto soccorso senza tessera sanitaria.",
    cityQuickJumpLabel: "Scegli una città",
    viewModeLabel: "Mostra come",
    viewMap: "Mappa",
    viewList: "Elenco",
    closePreview: "Chiudi",
    emergency: "Pronto soccorso",
    callAction: "Chiama",
    callNumber: (phone) => `Chiama ${phone}`,
    directions: "Indicazioni",
    website: "Sito web",
    youAreHere: "Sei qui",
    mapLegendLabel: "Legenda della mappa",
    legendPlace: "Struttura sanitaria",
    legendEmergency: "Pronto soccorso",
    legendCluster: "Più posti: tocca per ingrandire",
    showMore: (remaining) => (remaining === 1 ? "Mostra un altro posto" : `Mostra altri ${remaining} posti`),
    resultsCount: (count) => (count === 1 ? "1 posto" : `${count} posti`),
    nearPlace: (place) => `Vicino a ${place}`,
    allPlaces: "tutti i luoghi",
    change: "Cambia",
    filtersTitle: "Filtri",
    showPlaces: (count) => (count === 1 ? "Mostra 1 posto" : `Mostra ${count} posti`),
    fromCentre: (distance, city) => `a circa ${distance} dal centro di ${city}`,
    hoursTokens: { Mo: "Lun", Tu: "Mar", We: "Mer", Th: "Gio", Fr: "Ven", Sa: "Sab", Su: "Dom", PH: "Festivi", off: "chiuso" },
    page: {
      heroParagraph: "Guarda sulla mappa i servizi sanitari vicino a te. Tocca un luogo per vedere indirizzo e telefono.",
      listTitle: "Farmacie e ambulatori",
      listSubtitle: "Inserisci un indirizzo, una via o un comune per vedere i posti più vicini in ordine di distanza.",
      loadingMap: "Caricamento mappa…",
      mapAttribution: "Dati mappa © collaboratori di OpenStreetMap.",
      ctaTitle: "Non sai dove andare?",
      ctaBody: "Se non sai da quale medico andare, ti aiutiamo noi. In caso di emergenza, chiama subito il 112.",
      ctaButton: "Chiedi aiuto",
      mediatorTag: "Mediatore sanitario di comunità",
      mediatorTitle: "Ti serve aiuto per l'iscrizione o allo sportello?",
      mediatorBody:
        "Un mediatore sanitario ti spiega quali documenti servono, ti aiuta a iscriverti dal medico di base e ti sostiene se vieni respinto.",
      mediatorButton: "Trova mediatore",
    },
  },
  hr: {
    countries: { RO: "Rumunjska", AL: "Albanija", IT: "Italija", MD: "Moldavija", HR: "Hrvatska" },
    categories: {
      hospital: "Bolnica",
      clinic: "Klinika",
      gp: "Obiteljski liječnik",
      dentist: "Stomatolog",
      pharmacy: "Ljekarna",
      other: "Ostalo",
    },
    allCategories: "Sve",
    countryLabel: "Država",
    locationLabel: "Gdje",
    myLocation: "Moja lokacija",
    mapArea: "Područje karte",
    categoryLabel: "Vrsta",
    ownershipLabel: "Javno ili privatno",
    ownershipAll: "Javne i privatne",
    ownershipPublicOnly: "Samo javne",
    ownershipPrivateOnly: "Samo privatne",
    ownershipPublicHint: "Besplatno uz zdravstveno osiguranje ili za hitne slučajeve; čekanje može biti dulje ili treba uputnica.",
    ownershipPrivateHint: "Brži termini, ali često skuplje — plaća se iz vlastitog džepa i rijetko prima teške hitne slučajeve.",
    ownership: { public: "Javno", private: "Privatno" },
    searchPlaceholder: "Upiši adresu, ulicu, grad ili naziv ustanove",
    searchHint: "Ulica ili grad",
    searchButton: "Traži",
    useMyLocation: "Koristi moju lokaciju",
    locating: "Tražimo tvoju lokaciju…",
    locationActive: "Mjesta najbliža tebi",
    locationDenied: "Nismo uspjeli pronaći tvoju lokaciju. Upiši svoj grad ili ulicu.",
    guessedPlaceHint: (city) =>
      `Ne znamo gdje si, pa popis počinje od mjesta ${city}. Upiši svoj grad ili ulicu ili koristi svoju lokaciju.`,
    offlineKeptList: "Nemaš internet. Ovo je zadnji učitani popis.",
    addressNotFound: "Nismo pronašli tu adresu ni naziv. Pokušaj samo s nazivom grada.",
    savedListNotice: (date) => `Popis spremljen ${date}. Možda je zastario.`,
    hoursUnknown: "Radno vrijeme nije navedeno.",
    callBeforeGoing: "Nazovi prije dolaska.",
    showMorePlaces: "Prikaži još mjesta",
    placesInArea: "Mjesta u ovom području",
    changeCountry: "Promijeni državu",
    distantLocationNotice: (country) =>
      `U tvojoj blizini nema zdravstvenih usluga. Prikazujemo mjesta u državi: ${country}.`,
    showingCountry: (country) => `Mjesta u državi: ${country}`,
    nearCity: (city) => `U blizini: ${city}`,
    suggestedByLanguage: (city, country) => `Predloženo prema jeziku: ${city}, ${country}`,
    suggestedByRegion: (city, country) => `Predloženo za tvoju regiju: ${city}, ${country}`,
    quickSuggestionsLabel: "Brza promjena područja",
    wholeCountryOption: (country) => `Cijela država: ${country}`,
    searchThisArea: "Pretraži ovo područje",
    loading: "Učitavanje mjesta…",
    loadError: "Mjesta se nisu učitala. Pokušaj ponovno.",
    retry: "Pokušaj ponovno",
    noResults: "Nije pronađeno nijedno mjesto. Pokušaj s drugom riječi ili vrstom.",
    clearFilters: "Obriši pretragu",
    kmAway: (km) => `${km} km udaljeno`,
    metersWalkAway: (meters, minutes) => `${meters} m udaljeno (~${minutes} min pješice)`,
    open24h: "Otvoreno 0–24",
    openNowLive: "Otvoreno sada",
    closedNowLive: "Zatvoreno sada",
    openNowFilter: "Otvoreno sada",
    emergencyWalkInFilter: "Hitni prijem",
    emergencyRightsCallout:
      "Prema zakonu, hitni bolnički prijemi besplatno zbrinjavaju hitna stanja, čak i bez zdravstvenog osiguranja ili osobne iskaznice.",
    listen: "Poslušaj",
    stopListening: "Zaustavi",
    largeText: "Veći tekst",
    spokenIntro:
      "Odaberi simbol ispod za ljekarnu, bolnicu, obiteljskog liječnika, kliniku ili stomatologa. Možeš filtrirati i hitni prijem bez zdravstvene iskaznice.",
    cityQuickJumpLabel: "Odaberi grad",
    viewModeLabel: "Prikaži kao",
    viewMap: "Karta",
    viewList: "Popis",
    closePreview: "Zatvori",
    emergency: "Hitni prijem",
    callAction: "Nazovi",
    callNumber: (phone) => `Nazovi ${phone}`,
    directions: "Upute",
    website: "Web stranica",
    youAreHere: "Ovdje si",
    mapLegendLabel: "Legenda karte",
    legendPlace: "Zdravstvena ustanova",
    legendEmergency: "Hitni prijem",
    legendCluster: "Više mjesta: dodirni za povećanje",
    showMore: (remaining) => `Prikaži još ${croatianPlural(remaining, "mjesto", "mjesta", "mjesta")}`,
    resultsCount: (count) => croatianPlural(count, "mjesto", "mjesta", "mjesta"),
    nearPlace: (place) => `Blizu: ${place}`,
    allPlaces: "sva mjesta",
    change: "Promijeni",
    filtersTitle: "Filteri",
    showPlaces: (count) => `Prikaži ${croatianPlural(count, "mjesto", "mjesta", "mjesta")}`,
    fromCentre: (distance, city) => `oko ${distance} od centra grada ${city}`,
    hoursTokens: { Mo: "Pon", Tu: "Uto", We: "Sri", Th: "Čet", Fr: "Pet", Sa: "Sub", Su: "Ned", PH: "Praznici", off: "zatvoreno" },
    page: {
      heroParagraph: "Pogledaj zdravstvene ustanove u blizini na karti. Dodirni mjesto za adresu i broj telefona.",
      listTitle: "Ljekarne i klinike",
      listSubtitle: "Upiši adresu, ulicu ili grad kako bi vidio najbliža mjesta poredana po udaljenosti.",
      loadingMap: "Učitavanje karte…",
      mapAttribution: "Podaci karte © OpenStreetMap suradnici.",
      ctaTitle: "Ne znaš kamo otići?",
      ctaBody: "Ako ne znaš kojem se liječniku obratiti ili kamo otići, možemo te uputiti. U hitnom slučaju odmah nazovi 112.",
      ctaButton: "Zatraži pomoć",
      mediatorTag: "Zdravstveni medijator u zajednici",
      mediatorTitle: "Trebaš pomoć pri upisu ili na šalteru?",
      mediatorBody:
        "Zdravstveni medijator objašnjava potrebne dokumente, pomaže pri upisu kod obiteljskog liječnika i štiti tvoja prava ako naiđeš na prepreke.",
      mediatorButton: "Nađi medijatora",
    },
  },
  rom: {
    countries: { RO: "Rumuniya", AL: "Albaniya", IT: "Italiya", MD: "Moldova", HR: "Kroatiya" },
    categories: {
      hospital: "Spitalo",
      clinic: "Klinika",
      gp: "Familiyako doktori",
      dentist: "Dentisto",
      pharmacy: "Farmaciya",
      other: "Aver",
    },
    allCategories: "Sa",
    countryLabel: "Them",
    locationLabel: "Kaj",
    myLocation: "Kaj sem me",
    mapArea: "Zona pi mapa",
    categoryLabel: "Felo",
    ownershipLabel: "Themeske vaj privatno",
    ownershipAll: "Themeske thaj privatno",
    ownershipPublicOnly: "Numa themeske",
    ownershipPrivateOnly: "Numa privatno",
    ownershipPublicHint: "Bi lovesko siguranciyasa vay vaš sigardiari; butivar trubul te azhukeres may but vay trimiteri.",
    ownershipPrivateHint: "May sigo programime, numa butivar may kuch — pokines katar cho džepo thaj čače na lel bare sigardiari.",
    ownership: { public: "Themesko", private: "Privatno" },
    searchPlaceholder: "Ramov i adresa, o drom, o foro vaj o anav",
    searchHint: "Drom vaj foro",
    searchButton: "Rod",
    useMyLocation: "Le miro than",
    locating: "Rodas kai san…",
    locationActive: "E thana maj pashe tuke",
    locationDenied: "Nashti arakhlam kai san. Ramov tiro foro vaj drom.",
    guessedPlaceHint: (city) =>
      `Na zhanas kai san, anda kodo i lista shirdel katar ${city}. Ramov tiro foro vaj drom, vaj le tiro than.`,
    offlineKeptList: "Naj tut interneto. Kadi si i palutni lista so pherdili.",
    addressNotFound: "Na arakhlam kadi adresa vaj anav. Rod numa o anav le forosko.",
    savedListNotice: (date) => `Lista garavdi katar ${date}. Shay te avel purani.`,
    hoursUnknown: "O programo naj ramome.",
    callBeforeGoing: "Akhar angla so te zhas.",
    showMorePlaces: "Sikav maj but thana",
    placesInArea: "Thana ande kadi zona",
    changeCountry: "Paruv o them",
    distantLocationNotice: (country) =>
      `Nane sastipaske thana pashe tute. Sikavas tuke thana ando ${country}.`,
    showingCountry: (country) => `Thana ando ${country}`,
    nearCity: (city) => `Pashe ${city}`,
    suggestedByLanguage: (city, country) => `Sikavdo pala chhib: ${city}, ${country}`,
    suggestedByRegion: (city, country) => `Sikavdo vash cho than: ${city}, ${country}`,
    quickSuggestionsLabel: "Paruv sigo o than",
    wholeCountryOption: (country) => `Sasto them: ${country}`,
    searchThisArea: "Rod ande kado than",
    loading: "Pharen pes e thana…",
    loadError: "E thana na pherdile. Ker maj jekh data.",
    retry: "Ker maj jekh data",
    noResults: "Na arakhlam khanchi. Rod aver lafi vaj aver felo.",
    clearFilters: "Kos o rodimos",
    kmAway: (km) => `pe ${km} km`,
    metersWalkAway: (meters, minutes) => `pe ${meters} m (~${minutes} min pe punre)`,
    open24h: "Putardo 24 chasa",
    openNowLive: "Putardo akana",
    closedNowLive: "Phanglo akana",
    openNowFilter: "Putardo akana",
    emergencyWalkInFilter: "Urgenciya",
    emergencyRightsCallout:
      "Pala o zakono, e urgenciyake thana ande spitale dikhen bi lovengo sakone manushes ande urgenciya, vi bi asigurimasko vaj bi buletinesko.",
    listen: "Ashun",
    stopListening: "Achav",
    largeText: "Maj baro teksto",
    spokenIntro:
      "Alosar tele o znako vash farmaciya, spitalo, familiyako doktori, klinika vaj dentisto. Shay te rodes vi urgenciya bi sastipaske kartako.",
    cityQuickJumpLabel: "Alosar jekh foro",
    viewModeLabel: "Sikav sar",
    viewMap: "Mapa",
    viewList: "Lista",
    closePreview: "Phandav",
    emergency: "Urgenciya",
    callAction: "Akhar",
    callNumber: (phone) => `Akhar ${phone}`,
    directions: "Drom",
    website: "Web rig",
    youAreHere: "Kathe san",
    mapLegendLabel: "Znaki la mapake",
    legendPlace: "Sastipasko than",
    legendEmergency: "Urgenciya",
    legendCluster: "But thana: azba te bares la mapa",
    showMore: (remaining) => (remaining === 1 ? "Sikav maj 1 than" : `Sikav maj ${remaining} thana`),
    resultsCount: (count) => (count === 1 ? "1 than" : `${count} thana`),
    nearPlace: (place) => `Paše ${place}`,
    allPlaces: "sa le thana",
    change: "Paruv",
    filtersTitle: "Filterura",
    showPlaces: (count) => (count === 1 ? "Sikav 1 than" : `Sikav ${count} thana`),
    fromCentre: (distance, city) => `paše ${distance} katar o centro le forosko ${city}`,
    hoursTokens: { Mo: "Luy", Tu: "Mar", We: "Tet", Th: "Zho", Fr: "Par", Sa: "Sav", Su: "Kur", PH: "Bare divesa", off: "phanglo" },
    page: {
      heroParagraph: "Dikh pe mapa e sastipaske thana pashe tuke. Azba jekh than te dikhes i adresa thaj o telefono.",
      listTitle: "Farmaciye thaj klinike",
      listSubtitle: "Ramov i adresa, o drom vaj o foro te dikhes le maj pashe thana.",
      loadingMap: "Pharel pes i mapa…",
      mapAttribution: "Mapa © OpenStreetMap.",
      ctaTitle: "Na zhanes kai te zhas?",
      ctaBody: "Te na zhanes kaste doktori vaj kai te zhas, shay sikavas tuke o drom. Ande urgenciya, akhar sigo pe 112.",
      ctaButton: "Mang zhutimos",
      mediatorTag: "Sastipnasko mediatori",
      mediatorTitle: "Trebul tuke azhutimos ko ramovimos vaj ko ghishevo?",
      mediatorBody:
        "Jekh sastipnasko mediatori sikavel tuke save lila trebun, azhutinel tut te ramos tut ko familiyako doktori thaj arakhel tire chachimata.",
      mediatorButton: "Arakh mediatori",
    },
  },
};

const DAY = "Mo|Tu|We|Th|Fr|Sa|Su";
const DAY_CODES = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"] as const;
type DayCode = (typeof DAY_CODES)[number];

/**
 * Evaluates whether an OpenStreetMap `opening_hours` string is currently open.
 */
export function isInstituteOpenNow(hours: string | null | undefined, now: Date = new Date()): boolean {
  if (!hours) return false;
  const raw = hours.trim();
  if (!raw) return false;
  if (/24\s*\/\s*7|00:00\s*[-–]\s*24:00|non[\s-]?stop/i.test(raw)) return true;

  // JS getDay(): 0 = Su, 1 = Mo ... 6 = Sa -> map to index in DAY_CODES (Mo=0 .. Su=6)
  const todayIdx = (now.getDay() + 6) % 7;
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const clauses = raw.split(";").map((part) => part.trim()).filter(Boolean);
  let matchedOpen = false;

  for (const clause of clauses) {
    const dayPrefixMatch = clause.match(/^((?:(?:Mo|Tu|We|Th|Fr|Sa|Su)(?:\s*[-,]\s*(?:Mo|Tu|We|Th|Fr|Sa|Su))*))\s+(.+)$/);
    let appliesToday = false;
    let timePart = clause;

    if (dayPrefixMatch) {
      const dayExpr = dayPrefixMatch[1];
      timePart = dayPrefixMatch[2].trim();
      for (const token of dayExpr.split(",").map((s) => s.trim())) {
        const range = token.split("-").map((s) => s.trim()) as DayCode[];
        if (range.length === 2) {
          const start = DAY_CODES.indexOf(range[0]);
          const end = DAY_CODES.indexOf(range[1]);
          if (start !== -1 && end !== -1) {
            if (start <= end ? todayIdx >= start && todayIdx <= end : todayIdx >= start || todayIdx <= end) {
              appliesToday = true;
            }
          }
        } else if (range.length === 1) {
          if (DAY_CODES.indexOf(range[0]) === todayIdx) appliesToday = true;
        }
      }
    } else if (/^\d{1,2}:\d{2}\s*[-–]\s*\d{1,2}:\d{2}/.test(clause)) {
      appliesToday = true;
    }

    if (!appliesToday) continue;
    if (/\boff\b|\bclosed\b/i.test(timePart)) {
      matchedOpen = false;
      continue;
    }

    const intervals = timePart.matchAll(/(\d{1,2}):(\d{2})\s*[-–]\s*(\d{1,2}):(\d{2})/g);
    for (const m of intervals) {
      const startMin = Number(m[1]) * 60 + Number(m[2]);
      const endMin = Number(m[3]) * 60 + Number(m[4]);
      if (startMin === 0 && endMin === 1440) {
        matchedOpen = true;
      } else if (endMin > startMin) {
        if (currentMinutes >= startMin && currentMinutes < endMin) matchedOpen = true;
      } else if (endMin < startMin) {
        if (currentMinutes >= startMin || currentMinutes < endMin) matchedOpen = true;
      }
    }
  }

  return matchedOpen;
}

/**
 * Turns an OpenStreetMap opening_hours value ("Mo-Fr 08:00-21:00; Sa,Su off") into the
 * reader's language ("Lu–Vi 08:00–21:00; Sâ, Du închis"). Anything it does not recognise
 * is left as written.
 */
export function formatOpeningHours(hours: string | null, copy: FindHelpCopy) {
  if (!hours) return null;
  if (/^\s*24\/7\s*$/.test(hours)) return copy.open24h;
  const tokens = copy.hoursTokens;
  return hours
    .trim()
    .replace(/(\d{1,2}:\d{2})-(\d{1,2}:\d{2})/g, "$1–$2")
    .replace(new RegExp(`\\b(${DAY})-(?=(?:${DAY})\\b)`, "g"), "$1–")
    .replace(new RegExp(`\\b(${DAY}|PH|off)\\b`, "g"), (token) => tokens[token as keyof typeof tokens])
    .replace(/\s*;\s*/g, "; ")
    .replace(/,(?=\S)/g, ", ");
}

/**
 * True when an OSM `opening_hours` string carries concrete hours or 24/7 / closed rules
 * so we can distinguish "Closed now" from freeform notes like "by appointment".
 */
export function hasRecognizedHoursSchedule(hours: string | null | undefined): boolean {
  if (!hours) return false;
  return /\d{1,2}:\d{2}|24\s*\/\s*7|non[\s-]?stop|\boff\b|\bclosed\b/i.test(hours);
}

/**
 * Human-friendly distance formatter for facility cards:
 * - `< 1 km`: rounded meters + calm walking estimate (`~75 m/min`), e.g. `la 450 m (~6 min pe jos)`.
 * - `1 .. 80 km`: localized 1-decimal km, e.g. `la 2,4 km`.
 * - `> 80 km`: omitted unless the user explicitly searched near a city (`allowOver80Km`).
 */
export function formatHumanDistance(
  distanceKm: number | null | undefined,
  copy: FindHelpCopy,
  numberLocale: string,
  options?: { allowOver80Km?: boolean; centerCity?: string | null },
): string | null {
  if (distanceKm == null || !Number.isFinite(distanceKm) || distanceKm < 0) return null;
  if (distanceKm > 80 && !options?.allowOver80Km) return null;

  const isRussian = numberLocale === "ru";

  if (distanceKm < 1) {
    const roundedMeters = Math.max(10, Math.round((distanceKm * 1000) / 10) * 10);
    if (roundedMeters < 1000) {
      if (options?.centerCity) {
        return copy.fromCentre(`${roundedMeters} ${isRussian ? "м" : "m"}`, options.centerCity);
      }
      const walkMinutes = Math.max(1, Math.round(roundedMeters / 75));
      return copy.metersWalkAway(roundedMeters, walkMinutes);
    }
  }

  const formattedKm = distanceKm.toLocaleString(numberLocale, {
    minimumFractionDigits: distanceKm < 10 ? 1 : 0,
    maximumFractionDigits: 1,
  });
  if (options?.centerCity) {
    return copy.fromCentre(`${formattedKm} ${isRussian ? "км" : "km"}`, options.centerCity);
  }
  return copy.kmAway(formattedKm);
}
