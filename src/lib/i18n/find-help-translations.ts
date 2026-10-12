import type { Lang } from "@/lib/i18n/translations";
import type { CountryCode, InstituteCategory } from "@/lib/medical-institutes";

export type FindHelpCopy = {
  countries: Record<CountryCode, string>;
  categories: Record<InstituteCategory, string>;
  allCategories: string;
  countryLabel: string;
  categoryLabel: string;
  searchPlaceholder: string;
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
  kmAway: (km: string) => string;
  open24h: string;
  emergency: string;
  directions: string;
  website: string;
  youAreHere: string;
  resultsCount: (count: number) => string;
};

export const findHelpTranslations: Record<Lang, FindHelpCopy> = {
  en: {
    countries: { RO: "Romania", AL: "Albania", IT: "Italy" },
    categories: {
      hospital: "Hospital",
      clinic: "Clinic",
      gp: "GP / Doctor",
      dentist: "Dentist",
      pharmacy: "Pharmacy",
      other: "Other",
    },
    allCategories: "All",
    countryLabel: "Country",
    categoryLabel: "Type",
    searchPlaceholder: "Search by name, city or address",
    searchButton: "Search",
    useMyLocation: "Use my location",
    locating: "Finding your location…",
    locationActive: "Showing places closest to you",
    locationDenied: "Location access is off. Showing places in the selected country.",
    showingCountry: (country) => `Showing places in ${country}`,
    searchThisArea: "Search this area",
    loading: "Loading medical institutes…",
    loadError: "We could not load medical institutes right now.",
    retry: "Try again",
    noResults: "No medical institutes match your search.",
    kmAway: (km) => `${km} km away`,
    open24h: "Open 24 hours",
    emergency: "Emergency",
    directions: "Directions",
    website: "Website",
    youAreHere: "You are here",
    resultsCount: (count) => `${count} places`,
  },
  ro: {
    countries: { RO: "România", AL: "Albania", IT: "Italia" },
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
    searchButton: "Caută",
    useMyLocation: "Folosește locația mea",
    locating: "Se caută locația ta…",
    locationActive: "Se afișează locurile cele mai apropiate de tine",
    locationDenied: "Accesul la locație este dezactivat. Se afișează locurile din țara selectată.",
    showingCountry: (country) => `Se afișează locuri din ${country}`,
    searchThisArea: "Caută în această zonă",
    loading: "Se încarcă instituțiile medicale…",
    loadError: "Nu am putut încărca instituțiile medicale acum.",
    retry: "Încearcă din nou",
    noResults: "Nicio instituție medicală nu corespunde căutării.",
    kmAway: (km) => `la ${km} km`,
    open24h: "Deschis non-stop",
    emergency: "Urgențe",
    directions: "Indicații",
    website: "Site web",
    youAreHere: "Ești aici",
    resultsCount: (count) => `${count} locuri`,
  },
  sq: {
    countries: { RO: "Rumania", AL: "Shqipëria", IT: "Italia" },
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
    searchButton: "Kërko",
    useMyLocation: "Përdor vendndodhjen time",
    locating: "Duke gjetur vendndodhjen tënde…",
    locationActive: "Po shfaqen vendet më të afërta me ty",
    locationDenied: "Qasja në vendndodhje është e çaktivizuar. Po shfaqen vendet në shtetin e zgjedhur.",
    showingCountry: (country) => `Po shfaqen vende në ${country}`,
    searchThisArea: "Kërko në këtë zonë",
    loading: "Duke ngarkuar institucionet shëndetësore…",
    loadError: "Nuk mundëm të ngarkojmë institucionet shëndetësore tani.",
    retry: "Provo përsëri",
    noResults: "Asnjë institucion shëndetësor nuk përputhet me kërkimin.",
    kmAway: (km) => `${km} km larg`,
    open24h: "Hapur 24 orë",
    emergency: "Urgjencë",
    directions: "Udhëzime",
    website: "Faqja web",
    youAreHere: "Ti je këtu",
    resultsCount: (count) => `${count} vende`,
  },
  it: {
    countries: { RO: "Romania", AL: "Albania", IT: "Italia" },
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
    searchButton: "Cerca",
    useMyLocation: "Usa la mia posizione",
    locating: "Ricerca della tua posizione…",
    locationActive: "Ecco le strutture più vicine a te",
    locationDenied: "L'accesso alla posizione è disattivato. Mostriamo le strutture del paese selezionato.",
    showingCountry: (country) => `Strutture in ${country}`,
    searchThisArea: "Cerca in quest'area",
    loading: "Caricamento delle strutture sanitarie…",
    loadError: "Non è stato possibile caricare le strutture sanitarie.",
    retry: "Riprova",
    noResults: "Nessuna struttura sanitaria corrisponde alla ricerca.",
    kmAway: (km) => `a ${km} km`,
    open24h: "Aperto 24 ore su 24",
    emergency: "Pronto soccorso",
    directions: "Indicazioni",
    website: "Sito web",
    youAreHere: "Sei qui",
    resultsCount: (count) => `${count} strutture`,
  },
};

export function formatOpeningHours(hours: string | null, copy: FindHelpCopy) {
  if (!hours) return null;
  return /^\s*24\/7\s*$/.test(hours) ? copy.open24h : hours;
}
