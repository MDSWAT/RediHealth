import type { Lang } from "@/lib/i18n/translations";
import type { CountryCode, InstituteCategory } from "@/lib/medical-institutes";

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
};

export const findHelpTranslations: Record<Lang, FindHelpCopy> = {
  en: {
    countries: { RO: "Romania", AL: "Albania", IT: "Italy", MD: "Moldova" },
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
  },
  ro: {
    countries: { RO: "România", AL: "Albania", IT: "Italia", MD: "Republica Moldova" },
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
  },
  sq: {
    countries: { RO: "Rumania", AL: "Shqipëria", IT: "Italia", MD: "Moldavia" },
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
  },
  it: {
    countries: { RO: "Romania", AL: "Albania", IT: "Italia", MD: "Moldavia" },
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
  },
};

const DAY = "Mo|Tu|We|Th|Fr|Sa|Su";

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
