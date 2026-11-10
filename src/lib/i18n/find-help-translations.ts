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
  categoryLabel: string;
  searchPlaceholder: string;
  /** Short placeholder that fits a 375px phone; the label keeps the full searchPlaceholder. */
  searchHint: string;
  searchButton: string;
  useMyLocation: string;
  locating: string;
  locationActive: string;
  locationDenied: string;
  showingCountry: (country: string) => string;
  searchThisArea: string;
  loading: string;
  loadError: string;
  retry: string;
  noResults: string;
  clearFilters: string;
  kmAway: (km: string) => string;
  open24h: string;
  openNowLive: string;
  openNowFilter: string;
  emergencyWalkInFilter: string;
  emergencyRightsCallout: string;
  cityQuickJumpLabel: string;
  viewModeLabel: string;
  viewSplit: string;
  viewMap: string;
  viewList: string;
  closePreview: string;
  emergency: string;
  directions: string;
  website: string;
  youAreHere: string;
  /** Accessible name of the two-item key under the map. */
  mapLegendLabel: string;
  legendPlace: string;
  legendEmergency: string;
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
  ],
};

function croatianPlural(count: number, one: string, few: string, many: string): string {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return `${count} ${one}`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${count} ${few}`;
  return `${count} ${many}`;
}

export const findHelpTranslations: Record<Lang, FindHelpCopy> = {
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
    categoryLabel: "Type",
    searchPlaceholder: "Search by name, city or address",
    searchHint: "Name, city or address",
    searchButton: "Search",
    useMyLocation: "Use my location",
    locating: "Finding your location…",
    locationActive: "Places closest to you",
    locationDenied: "Location is off. You see places in the country you chose.",
    showingCountry: (country) => `Places in ${country}`,
    searchThisArea: "Search this area",
    loading: "Loading places…",
    loadError: "The places did not load. Try again.",
    retry: "Try again",
    noResults: "No places found. Try another word or type.",
    clearFilters: "Clear search",
    kmAway: (km) => `${km} km away`,
    open24h: "Open 24 hours",
    openNowLive: "Open now",
    openNowFilter: "Open now / 24 hours",
    emergencyWalkInFilter: "Emergency reception (no health card needed)",
    emergencyRightsCallout:
      "By law, hospital emergency departments assess urgent cases free of charge, even without health insurance or an identity card.",
    cityQuickJumpLabel: "Jump to a city",
    viewModeLabel: "Mobile view mode",
    viewSplit: "Split",
    viewMap: "Map",
    viewList: "List",
    closePreview: "Close",
    emergency: "Emergency",
    directions: "Directions",
    website: "Website",
    youAreHere: "You are here",
    mapLegendLabel: "Map key",
    legendPlace: "Health facility",
    legendEmergency: "Has an emergency department",
    showMore: (remaining) => (remaining === 1 ? "Show 1 more place" : `Show ${remaining} more places`),
    resultsCount: (count) => (count === 1 ? "1 place" : `${count} places`),
    hoursTokens: { Mo: "Mon", Tu: "Tue", We: "Wed", Th: "Thu", Fr: "Fri", Sa: "Sat", Su: "Sun", PH: "Public holidays", off: "closed" },
    page: {
      heroParagraph: "See health services near you on the map. Tap a place to see its address and phone number.",
      listTitle: "Pharmacies, clinics and hospitals",
      listSubtitle: "Tap a place to see it on the map.",
      loadingMap: "Loading map…",
      mapAttribution: "Map data © OpenStreetMap contributors.",
      ctaTitle: "Not sure where to go?",
      ctaBody: "If you don't know which doctor to see or where to go, we can guide you. In an emergency, call 112 right away.",
      ctaButton: "Ask for help",
      mediatorTag: "Community health mediator",
      mediatorTitle: "Need help registering or speaking at reception?",
      mediatorBody:
        "A community health mediator can explain which documents you need, help you register with a family doctor, and support you if you are turned away.",
      mediatorButton: "Find a health mediator",
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
    categoryLabel: "Tip",
    searchPlaceholder: "Caută după nume, oraș sau adresă",
    searchHint: "Nume, oraș sau adresă",
    searchButton: "Caută",
    useMyLocation: "Folosește locația mea",
    locating: "Căutăm unde ești…",
    locationActive: "Locurile cele mai apropiate de tine",
    locationDenied: "Locația e oprită. Vezi locuri din țara aleasă.",
    showingCountry: (country) => `Locuri din ${country}`,
    searchThisArea: "Caută în această zonă",
    loading: "Se încarcă locurile…",
    loadError: "Locurile nu s-au încărcat. Încearcă din nou.",
    retry: "Încearcă din nou",
    noResults: "Nu am găsit niciun loc. Încearcă alt cuvânt sau alt tip.",
    clearFilters: "Șterge căutarea",
    kmAway: (km) => `la ${km} km`,
    open24h: "Deschis non-stop",
    openNowLive: "Deschis acum",
    openNowFilter: "Deschis acum / non-stop",
    emergencyWalkInFilter: "Primiri urgențe (fără card de sănătate)",
    emergencyRightsCallout:
      "Prin lege, unitățile de primiri urgențe evaluează gratuit cazurile urgente, chiar dacă nu ai asigurare CNAS sau act de identitate la tine.",
    cityQuickJumpLabel: "Sari la un oraș",
    viewModeLabel: "Mod de afișare",
    viewSplit: "Împărțit",
    viewMap: "Hartă",
    viewList: "Listă",
    closePreview: "Închide",
    emergency: "Urgențe",
    directions: "Traseu",
    website: "Site web",
    youAreHere: "Ești aici",
    mapLegendLabel: "Legenda hărții",
    legendPlace: "Unitate medicală",
    legendEmergency: "Are primiri urgențe",
    showMore: (remaining) =>
      remaining === 1
        ? "Arată încă un loc"
        : remaining % 100 === 0 || remaining % 100 >= 20
          ? `Arată încă ${remaining} de locuri`
          : `Arată încă ${remaining} locuri`,
    // Romanian plural: 1 loc, 2–19 locuri, 20+ (and x00) „de locuri”.
    resultsCount: (count) =>
      count === 1 ? "1 loc" : count % 100 === 0 || count % 100 >= 20 ? `${count} de locuri` : `${count} locuri`,
    hoursTokens: { Mo: "Lu", Tu: "Ma", We: "Mi", Th: "Jo", Fr: "Vi", Sa: "Sâ", Su: "Du", PH: "Sărbători legale", off: "închis" },
    page: {
      heroParagraph: "Vezi pe hartă unitățile medicale din apropiere. Apasă pe un loc ca să vezi adresa și telefonul.",
      listTitle: "Farmacii, clinici și spitale",
      listSubtitle: "Apasă pe un loc ca să-l vezi pe hartă.",
      loadingMap: "Se încarcă harta…",
      mapAttribution: "Date hartă © contribuitori OpenStreetMap.",
      ctaTitle: "Nu știi unde să mergi?",
      ctaBody: "Dacă nu știi la ce medic sau unde să mergi, te putem îndruma noi. Pentru o urgență, sună imediat la 112.",
      ctaButton: "Cere ajutor",
      mediatorTag: "Mediator sanitar comunitar",
      mediatorTitle: "Ai nevoie de sprijin la înscriere sau la ghișeu?",
      mediatorBody:
        "Un mediator sanitar îți explică ce acte îți trebuie, te ajută să te înscrii la medicul de familie și îți apără drepturile dacă ești refuzat.",
      mediatorButton: "Găsește un mediator sanitar",
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
    categoryLabel: "Lloji",
    searchPlaceholder: "Kërko sipas emrit, qytetit ose adresës",
    searchHint: "Emri, qyteti ose adresa",
    searchButton: "Kërko",
    useMyLocation: "Përdor vendndodhjen time",
    locating: "Po kërkojmë ku je…",
    locationActive: "Vendet më afër teje",
    locationDenied: "Vendndodhja është e fikur. Sheh vende në shtetin që zgjodhe.",
    showingCountry: (country) => `Vende në ${country}`,
    searchThisArea: "Kërko në këtë zonë",
    loading: "Po ngarkohen vendet…",
    loadError: "Vendet nuk u ngarkuan. Provo përsëri.",
    retry: "Provo përsëri",
    noResults: "Nuk u gjet asnjë vend. Provo një fjalë ose lloj tjetër.",
    clearFilters: "Pastro kërkimin",
    kmAway: (km) => `${km} km larg`,
    open24h: "Hapur 24 orë",
    openNowLive: "Hapur tani",
    openNowFilter: "Hapur tani / 24 orë",
    emergencyWalkInFilter: "Urgjencë spitalore (pa kartë shëndeti)",
    emergencyRightsCallout:
      "Me ligj, shërbimet e urgjencës spitalore trajtojnë rastet urgjente falas, edhe pa sigurim shëndetësor ose pa dokument identiteti.",
    cityQuickJumpLabel: "Kalo te një qytet",
    viewModeLabel: "Mënyra e shfaqjes",
    viewSplit: "Ndarë",
    viewMap: "Hartë",
    viewList: "Listë",
    closePreview: "Mbyll",
    emergency: "Urgjencë",
    directions: "Udhëzime",
    website: "Faqja web",
    youAreHere: "Ti je këtu",
    mapLegendLabel: "Legjenda e hartës",
    legendPlace: "Institucion shëndetësor",
    legendEmergency: "Ka shërbim urgjence",
    showMore: (remaining) => (remaining === 1 ? "Shfaq edhe 1 vend" : `Shfaq edhe ${remaining} vende`),
    resultsCount: (count) => (count === 1 ? "1 vend" : `${count} vende`),
    hoursTokens: { Mo: "Hën", Tu: "Mar", We: "Mër", Th: "Enj", Fr: "Pre", Sa: "Sht", Su: "Die", PH: "Festat zyrtare", off: "mbyllur" },
    page: {
      heroParagraph: "Shiko në hartë shërbimet shëndetësore pranë teje. Prek një vend për të parë adresën dhe telefonin.",
      listTitle: "Farmaci, klinika dhe spitale",
      listSubtitle: "Prek një vend për ta parë në hartë.",
      loadingMap: "Duke ngarkuar hartën…",
      mapAttribution: "Të dhënat e hartës © kontribuesit e OpenStreetMap.",
      ctaTitle: "Nuk di ku të shkosh?",
      ctaBody: "Nëse nuk di te cili mjek të shkosh, të udhëzojmë ne. Për një urgjencë, telefono menjëherë 112.",
      ctaButton: "Kërko ndihmë",
      mediatorTag: "Mediator shëndetësor në komunitet",
      mediatorTitle: "Të duhet ndihmë për regjistrim ose në sportel?",
      mediatorBody:
        "Një mediator shëndetësor të shpjegon dokumentet që të duhen, të ndihmon të regjistrohesh te mjeku i familjes dhe të mbron nëse të refuzojnë.",
      mediatorButton: "Gjej një mediator shëndetësor",
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
    categoryLabel: "Tipo",
    searchPlaceholder: "Cerca per nome, città o indirizzo",
    searchHint: "Nome, città o indirizzo",
    searchButton: "Cerca",
    useMyLocation: "Usa la mia posizione",
    locating: "Cerchiamo dove sei…",
    locationActive: "I posti più vicini a te",
    locationDenied: "La posizione è spenta. Vedi i posti nel paese che hai scelto.",
    showingCountry: (country) => `Posti in ${country}`,
    searchThisArea: "Cerca in quest'area",
    loading: "Caricamento dei posti…",
    loadError: "I posti non si sono caricati. Riprova.",
    retry: "Riprova",
    noResults: "Nessun posto trovato. Prova un'altra parola o un altro tipo.",
    clearFilters: "Cancella la ricerca",
    kmAway: (km) => `a ${km} km`,
    open24h: "Aperto 24 ore su 24",
    openNowLive: "Aperto ora",
    openNowFilter: "Aperto ora / 24 ore",
    emergencyWalkInFilter: "Pronto soccorso (senza tessera sanitaria)",
    emergencyRightsCallout:
      "Per legge, il pronto soccorso ospedaliero assiste gratuitamente i casi urgenti, anche senza tessera sanitaria o documento d'identità.",
    cityQuickJumpLabel: "Vai a una città",
    viewModeLabel: "Modalità di visualizzazione",
    viewSplit: "Divisa",
    viewMap: "Mappa",
    viewList: "Elenco",
    closePreview: "Chiudi",
    emergency: "Pronto soccorso",
    directions: "Indicazioni",
    website: "Sito web",
    youAreHere: "Sei qui",
    mapLegendLabel: "Legenda della mappa",
    legendPlace: "Struttura sanitaria",
    legendEmergency: "Con pronto soccorso",
    showMore: (remaining) => (remaining === 1 ? "Mostra un altro posto" : `Mostra altri ${remaining} posti`),
    resultsCount: (count) => (count === 1 ? "1 posto" : `${count} posti`),
    hoursTokens: { Mo: "Lun", Tu: "Mar", We: "Mer", Th: "Gio", Fr: "Ven", Sa: "Sab", Su: "Dom", PH: "Festivi", off: "chiuso" },
    page: {
      heroParagraph: "Guarda sulla mappa i servizi sanitari vicino a te. Tocca un luogo per vedere indirizzo e telefono.",
      listTitle: "Farmacie, ambulatori e ospedali",
      listSubtitle: "Tocca un luogo per vederlo sulla mappa.",
      loadingMap: "Caricamento mappa…",
      mapAttribution: "Dati mappa © collaboratori di OpenStreetMap.",
      ctaTitle: "Non sai dove andare?",
      ctaBody: "Se non sai da quale medico andare, ti aiutiamo noi. In caso di emergenza, chiama subito il 112.",
      ctaButton: "Chiedi aiuto",
      mediatorTag: "Mediatore sanitario di comunità",
      mediatorTitle: "Ti serve aiuto per l'iscrizione o allo sportello?",
      mediatorBody:
        "Un mediatore sanitario ti spiega quali documenti servono, ti aiuta a iscriverti dal medico di base e ti sostiene se vieni respinto.",
      mediatorButton: "Trova un mediatore sanitario",
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
    categoryLabel: "Vrsta",
    searchPlaceholder: "Pretraži po nazivu, gradu ili adresi",
    searchHint: "Naziv, grad ili adresa",
    searchButton: "Traži",
    useMyLocation: "Koristi moju lokaciju",
    locating: "Tražimo tvoju lokaciju…",
    locationActive: "Mjesta najbliža tebi",
    locationDenied: "Lokacija je isključena. Prikazuju se mjesta u odabranoj državi.",
    showingCountry: (country) => `Mjesta u državi: ${country}`,
    searchThisArea: "Pretraži ovo područje",
    loading: "Učitavanje mjesta…",
    loadError: "Mjesta se nisu učitala. Pokušaj ponovno.",
    retry: "Pokušaj ponovno",
    noResults: "Nije pronađeno nijedno mjesto. Pokušaj s drugom riječi ili vrstom.",
    clearFilters: "Obriši pretragu",
    kmAway: (km) => `${km} km udaljeno`,
    open24h: "Otvoreno 0–24",
    openNowLive: "Otvoreno sada",
    openNowFilter: "Otvoreno sada / 0–24",
    emergencyWalkInFilter: "Hitni prijem (bez zdravstvene iskaznice)",
    emergencyRightsCallout:
      "Prema zakonu, hitni bolnički prijemi besplatno zbrinjavaju hitna stanja, čak i bez zdravstvenog osiguranja ili osobne iskaznice.",
    cityQuickJumpLabel: "Brzi odabir grada",
    viewModeLabel: "Način prikaza",
    viewSplit: "Podijeljeno",
    viewMap: "Karta",
    viewList: "Popis",
    closePreview: "Zatvori",
    emergency: "Hitni prijem",
    directions: "Upute",
    website: "Web stranica",
    youAreHere: "Ovdje si",
    mapLegendLabel: "Legenda karte",
    legendPlace: "Zdravstvena ustanova",
    legendEmergency: "Ima hitni prijem",
    showMore: (remaining) => `Prikaži još ${croatianPlural(remaining, "mjesto", "mjesta", "mjesta")}`,
    resultsCount: (count) => croatianPlural(count, "mjesto", "mjesta", "mjesta"),
    hoursTokens: { Mo: "Pon", Tu: "Uto", We: "Sri", Th: "Čet", Fr: "Pet", Sa: "Sub", Su: "Ned", PH: "Praznici", off: "zatvoreno" },
    page: {
      heroParagraph: "Pogledaj zdravstvene ustanove u blizini na karti. Dodirni mjesto za adresu i broj telefona.",
      listTitle: "Ljekarne, klinike i bolnice",
      listSubtitle: "Dodirni mjesto za prikaz na karti.",
      loadingMap: "Učitavanje karte…",
      mapAttribution: "Podaci karte © OpenStreetMap suradnici.",
      ctaTitle: "Ne znaš kamo otići?",
      ctaBody: "Ako ne znaš kojem se liječniku obratiti ili kamo otići, možemo te uputiti. U hitnom slučaju odmah nazovi 112.",
      ctaButton: "Zatraži pomoć",
      mediatorTag: "Zdravstveni medijator u zajednici",
      mediatorTitle: "Trebaš pomoć pri upisu ili na šalteru?",
      mediatorBody:
        "Zdravstveni medijator objašnjava potrebne dokumente, pomaže pri upisu kod obiteljskog liječnika i štiti tvoja prava ako naiđeš na prepreke.",
      mediatorButton: "Pronađi zdravstvenog medijatora",
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
    categoryLabel: "Felo",
    searchPlaceholder: "Rod pala anav, foro vaj adresa",
    searchHint: "Anav, foro vaj adresa",
    searchButton: "Rod",
    useMyLocation: "Le miro than",
    locating: "Rodas kai san…",
    locationActive: "E thana maj pashe tuke",
    locationDenied: "O than si bandardo. Dikhes thana ando alosardo them.",
    showingCountry: (country) => `Thana ando ${country}`,
    searchThisArea: "Rod ande kado than",
    loading: "Pharen pes e thana…",
    loadError: "E thana na pherdile. Ker maj jekh data.",
    retry: "Ker maj jekh data",
    noResults: "Na arakhlam khanchi. Rod aver lafi vaj aver felo.",
    clearFilters: "Kos o rodimos",
    kmAway: (km) => `pe ${km} km`,
    open24h: "Putardo 24 chasa",
    openNowLive: "Putardo akana",
    openNowFilter: "Putardo akana / 24 chasa",
    emergencyWalkInFilter: "Urgenciya (bi sastipaske kartako)",
    emergencyRightsCallout:
      "Pala o zakono, e urgenciyake thana ande spitale dikhen bi lovengo sakone manushes ande urgenciya, vi bi asigurimasko vaj bi buletinesko.",
    cityQuickJumpLabel: "Dzha ko jekh foro",
    viewModeLabel: "Sar dikhljol",
    viewSplit: "Duj riga",
    viewMap: "Mapa",
    viewList: "Lista",
    closePreview: "Phandav",
    emergency: "Urgenciya",
    directions: "Drom",
    website: "Web rig",
    youAreHere: "Kathe san",
    mapLegendLabel: "Znaki la mapake",
    legendPlace: "Sastipasko than",
    legendEmergency: "Si les urgenciya",
    showMore: (remaining) => (remaining === 1 ? "Sikav maj 1 than" : `Sikav maj ${remaining} thana`),
    resultsCount: (count) => (count === 1 ? "1 than" : `${count} thana`),
    hoursTokens: { Mo: "Luy", Tu: "Mar", We: "Tet", Th: "Zho", Fr: "Par", Sa: "Sav", Su: "Kur", PH: "Bare divesa", off: "phanglo" },
    page: {
      heroParagraph: "Dikh pe mapa e sastipaske thana pashe tuke. Azba jekh than te dikhes i adresa thaj o telefono.",
      listTitle: "Farmaciye, klinike thaj spitale",
      listSubtitle: "Azba jekh than te dikhes les pe mapa.",
      loadingMap: "Pharel pes i mapa…",
      mapAttribution: "Mapa © OpenStreetMap.",
      ctaTitle: "Na zhanes kai te zhas?",
      ctaBody: "Te na zhanes kaste doktori vaj kai te zhas, shay sikavas tuke o drom. Ande urgenciya, akhar sigo pe 112.",
      ctaButton: "Mang azhutimos",
      mediatorTag: "Sastipnasko mediatori",
      mediatorTitle: "Trebul tuke azhutimos ko ramovimos vaj ko ghishevo?",
      mediatorBody:
        "Jekh sastipnasko mediatori sikavel tuke save lila trebun, azhutinel tut te ramos tut ko familiyako doktori thaj arakhel tire chachimata.",
      mediatorButton: "Arakh jekh sastipnasko mediatori",
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
