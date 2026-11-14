import { ALBANIA_WIDE, CROATIA_WIDE, ITALY_WIDE, MOLDOVA_WIDE } from "@/lib/data/news";
import type { Lang } from "@/lib/i18n/translations";

/** The value that means "no county chosen": national news, every hub in Romania. */
export const ALL_ROMANIA = "Toate județele";

/** Country-wide sentinel values matching `src/lib/data/news.ts`. */
export const ALL_ITALY = ITALY_WIDE;
export const ALL_MOLDOVA = MOLDOVA_WIDE;
export const ALL_CROATIA = CROATIA_WIDE;
export const ALL_ALBANIA = ALBANIA_WIDE;

export type MapCountry = "ro" | "md" | "it" | "hr" | "al";

export type ExtraMapCopy = {
  moldova: string;
  croatia: string;
  albania: string;
  allMoldova: string;
  allCroatia: string;
  allAlbania: string;
  moldovaTitle: string;
  moldovaSubtitle: string;
  moldovaMapAriaLabel: string;
  croatiaTitle: string;
  croatiaSubtitle: string;
  croatiaMapAriaLabel: string;
  albaniaTitle: string;
  albaniaSubtitle: string;
  albaniaMapAriaLabel: string;
  selectedRaionPrefix: string;
  selectedZupanijaPrefix: string;
  selectedQarkPrefix: string;
  placePrefix: string;
  recentRaioaneLabel: string;
  recentZupanijeLabel: string;
  recentQarqeLabel: string;
  pickMoldovaLabel: string;
  pickCroatiaLabel: string;
  pickItalyLabel: string;
  pickAlbaniaLabel: string;
};

export const EXTRA_MAP_COPY: Record<Lang, ExtraMapCopy> = {
  ru: {
    albania: "Албания",
    allAlbania: "Вся Албания",
    albaniaTitle: "Выберите регион Албании",
    albaniaSubtitle: "Выберите место на карте или в списке для медицинских новостей и выездных клиник.",
    albaniaMapAriaLabel: "Карта регионов Албании",
    selectedQarkPrefix: "Выбранный регион:",
    recentQarqeLabel: "Регионы с местными новостями",
    pickAlbaniaLabel: "Или выберите регион из списка",
    moldova: "Молдова",
    croatia: "Хорватия",
    allMoldova: "Вся Молдова",
    allCroatia: "Вся Хорватия",
    moldovaTitle: "Выберите район Молдовы",
    moldovaSubtitle: "Выберите место на карте или в списке для местных медицинских новостей и выездных клиник.",
    moldovaMapAriaLabel: "Карта районов и муниципиев Молдовы",
    croatiaTitle: "Выберите жупанию Хорватии",
    croatiaSubtitle: "Выберите место на карте или в списке для медицинских новостей и выездных клиник.",
    croatiaMapAriaLabel: "Карта жупаний Хорватии",
    selectedRaionPrefix: "Выбранный район:",
    selectedZupanijaPrefix: "Выбранная жупания:",
    placePrefix: "Выбранное место:",
    recentRaioaneLabel: "Районы с местными новостями",
    recentZupanijeLabel: "Жупании с местными новостями",
    pickMoldovaLabel: "Или выберите район из списка",
    pickCroatiaLabel: "Или выберите жупанию из списка",
    pickItalyLabel: "Или выберите регион из списка",
  },
  ro: {
    moldova: "Moldova",
    croatia: "Croația",
    albania: "Albania",
    allMoldova: "Toată Moldova",
    allCroatia: "Toată Croația",
    allAlbania: "Toată Albania",
    moldovaTitle: "Alege un raion din Moldova",
    moldovaSubtitle: "Apasă pe hartă sau alege din listă pentru știri și caravane locale.",
    moldovaMapAriaLabel: "Harta raioanelor și municipiilor din Republica Moldova",
    croatiaTitle: "Alege un comitat din Croația",
    croatiaSubtitle: "Apasă pe hartă sau alege din listă pentru alerte și clinici mobile.",
    croatiaMapAriaLabel: "Harta comitatelor din Croația",
    albaniaTitle: "Alege o regiune din Albania",
    albaniaSubtitle: "Apasă pe hartă sau alege din listă pentru alerte și caravane medicale.",
    albaniaMapAriaLabel: "Harta regiunilor din Albania",
    selectedRaionPrefix: "Raionul ales:",
    selectedZupanijaPrefix: "Comitatul ales:",
    selectedQarkPrefix: "Regiunea aleasă:",
    placePrefix: "Locul ales:",
    recentRaioaneLabel: "Raioane cu știri locale",
    recentZupanijeLabel: "Comitate cu știri locale",
    recentQarqeLabel: "Regiuni cu știri locale",
    pickMoldovaLabel: "Sau alege un raion din listă",
    pickCroatiaLabel: "Sau alege un comitat din listă",
    pickItalyLabel: "Sau alege o regiune din listă",
    pickAlbaniaLabel: "Sau alege o regiune din listă",
  },
  en: {
    moldova: "Moldova",
    croatia: "Croatia",
    albania: "Albania",
    allMoldova: "All of Moldova",
    allCroatia: "All of Croatia",
    allAlbania: "All of Albania",
    moldovaTitle: "Choose a district in Moldova",
    moldovaSubtitle: "Tap the map or pick from the list for local health alerts and mobile clinics.",
    moldovaMapAriaLabel: "Map of districts and municipalities of Moldova",
    croatiaTitle: "Choose a county in Croatia",
    croatiaSubtitle: "Tap the map or pick from the list for local health alerts and mobile clinics.",
    croatiaMapAriaLabel: "Map of counties of Croatia",
    albaniaTitle: "Choose a county in Albania",
    albaniaSubtitle: "Tap the map or pick from the list for local health alerts and mobile clinics.",
    albaniaMapAriaLabel: "Map of the 12 counties of Albania",
    selectedRaionPrefix: "Chosen district:",
    selectedZupanijaPrefix: "Chosen county:",
    selectedQarkPrefix: "Chosen county:",
    placePrefix: "Chosen place:",
    recentRaioaneLabel: "Districts with local news",
    recentZupanijeLabel: "Counties with local news",
    recentQarqeLabel: "Counties with local news",
    pickMoldovaLabel: "Or pick a district from the list",
    pickCroatiaLabel: "Or pick a county from the list",
    pickItalyLabel: "Or pick a region from the list",
    pickAlbaniaLabel: "Or pick a county from the list",
  },
  sq: {
    moldova: "Moldavia",
    croatia: "Kroacia",
    albania: "Shqipëria",
    allMoldova: "Gjithë Moldavia",
    allCroatia: "Gjithë Kroacia",
    allAlbania: "Gjithë Shqipëria",
    moldovaTitle: "Zgjidh një rajon në Moldavi",
    moldovaSubtitle: "Prek hartën ose zgjidh nga lista për njoftime dhe karvane mjekësore.",
    moldovaMapAriaLabel: "Harta e rajoneve të Moldavisë",
    croatiaTitle: "Zgjidh një qark në Kroaci",
    croatiaSubtitle: "Prek hartën ose zgjidh nga lista për njoftime dhe klinika lëvizëse.",
    croatiaMapAriaLabel: "Harta e qarqeve të Kroacisë",
    albaniaTitle: "Harta e qarqeve të Shqipërisë",
    albaniaSubtitle: "Prek një qark në hartë ose zgjidh nga lista për njoftimet dhe karvanet mjekësore pranë teje.",
    albaniaMapAriaLabel: "Harta e 12 qarqeve të Shqipërisë",
    selectedRaionPrefix: "Rajoni i zgjedhur:",
    selectedZupanijaPrefix: "Qarku i zgjedhur:",
    selectedQarkPrefix: "Qarku i zgjedhur:",
    placePrefix: "Vendi i zgjedhur:",
    recentRaioaneLabel: "Rajone me lajme lokale",
    recentZupanijeLabel: "Qarqe me lajme lokale",
    recentQarqeLabel: "Qarqe me njoftime lokale",
    pickMoldovaLabel: "Ose zgjidh një rajon nga lista",
    pickCroatiaLabel: "Ose zgjidh një qark nga lista",
    pickItalyLabel: "Ose zgjidh një rajon nga lista",
    pickAlbaniaLabel: "Ose zgjidh një qark nga lista",
  },
  it: {
    moldova: "Moldavia",
    croatia: "Croazia",
    albania: "Albania",
    allMoldova: "Tutta la Moldavia",
    allCroatia: "Tutta la Croazia",
    allAlbania: "Tutta l'Albania",
    moldovaTitle: "Scegli un distretto della Moldavia",
    moldovaSubtitle: "Tocca la mappa o scegli dall'elenco per avvisi e ambulatori mobili.",
    moldovaMapAriaLabel: "Mappa dei distretti della Moldavia",
    croatiaTitle: "Scegli una regione della Croazia",
    croatiaSubtitle: "Tocca la mappa o scegli dall'elenco per avvisi e ambulatori mobili.",
    croatiaMapAriaLabel: "Mappa delle regioni della Croazia",
    albaniaTitle: "Scegli una prefettura dell'Albania",
    albaniaSubtitle: "Tocca la mappa o scegli dall'elenco per avvisi e ambulatori mobili.",
    albaniaMapAriaLabel: "Mappa delle prefetture dell'Albania",
    selectedRaionPrefix: "Distretto scelto:",
    selectedZupanijaPrefix: "Regione scelta:",
    selectedQarkPrefix: "Prefettura scelta:",
    placePrefix: "Luogo scelto:",
    recentRaioaneLabel: "Distretti con notizie locali",
    recentZupanijeLabel: "Regioni con notizie locali",
    recentQarqeLabel: "Prefetture con notizie locali",
    pickMoldovaLabel: "Oppure scegli un distretto dall'elenco",
    pickCroatiaLabel: "Oppure scegli una regione dall'elenco",
    pickItalyLabel: "Oppure scegli una regione dall'elenco",
    pickAlbaniaLabel: "Oppure scegli una prefettura dall'elenco",
  },
  hr: {
    moldova: "Moldavija",
    croatia: "Hrvatska",
    albania: "Albanija",
    allMoldova: "Cijela Moldavija",
    allCroatia: "Sve županije",
    allAlbania: "Cijela Albanija",
    moldovaTitle: "Odaberi rajon u Moldaviji",
    moldovaSubtitle: "Dodirni kartu ili odaberi s popisa za lokalne zdravstvene obavijesti.",
    moldovaMapAriaLabel: "Karta rajona i općina u Moldaviji",
    croatiaTitle: "Odaberi svoju županiju",
    croatiaSubtitle: "Dodirni županiju na karti ili je odaberi s popisa za lokalne obavijesti i mobilne ambulante.",
    croatiaMapAriaLabel: "Karta hrvatskih županija",
    albaniaTitle: "Odaberi okrug u Albaniji",
    albaniaSubtitle: "Dodirni kartu ili odaberi s popisa za lokalne zdravstvene obavijesti.",
    albaniaMapAriaLabel: "Karta okruga u Albaniji",
    selectedRaionPrefix: "Odabrani rajon:",
    selectedZupanijaPrefix: "Odabrana županija:",
    selectedQarkPrefix: "Odabrani okrug:",
    placePrefix: "Odabrano mjesto:",
    recentRaioaneLabel: "Rajoni s lokalnim vijestima",
    recentZupanijeLabel: "Županije s lokalnim vijestima",
    recentQarqeLabel: "Okruzi s lokalnim vijestima",
    pickMoldovaLabel: "Ili odaberi rajon s popisa",
    pickCroatiaLabel: "Ili odaberi županiju s popisa",
    pickItalyLabel: "Ili odaberi regiju s popisa",
    pickAlbaniaLabel: "Ili odaberi okrug s popisa",
  },
  rom: {
    moldova: "Moldova",
    croatia: "Kroatiya",
    albania: "Shchiperiya",
    allMoldova: "Sasti Moldova",
    allCroatia: "Sasti Kroatiya",
    allAlbania: "Sasti Shchiperiya",
    moldovaTitle: "Alosar yekh rayono and-i Moldova",
    moldovaSubtitle: "Thov o nay pe harta vay alosar katar i lista vash lokalne sastipnaske nevimata.",
    moldovaMapAriaLabel: "I harta e rayonengi and-i Moldova",
    croatiaTitle: "Alosar yekh zhupaniya and-i Kroatiya",
    croatiaSubtitle: "Thov o nay pe harta vay alosar katar i lista vash lokalne nevimata thaj mobilne klinike.",
    croatiaMapAriaLabel: "I harta e zhupaniyengi and-i Kroatiya",
    albaniaTitle: "Alosar yekh qarko and-i Shchiperiya",
    albaniaSubtitle: "Thov o nay pe harta vay alosar katar i lista vash lokalne nevimata thaj mobilne klinike.",
    albaniaMapAriaLabel: "I harta e qarkongi and-i Shchiperiya",
    selectedRaionPrefix: "Alosardo rayono:",
    selectedZupanijaPrefix: "Alosardi zhupaniya:",
    selectedQarkPrefix: "Alosardo qarko:",
    placePrefix: "Alosardo than:",
    recentRaioaneLabel: "Rayonurya lokalne nevimatenca",
    recentZupanijeLabel: "Zhupaniye lokalne nevimatenca",
    recentQarqeLabel: "Qarkurya lokalne nevimatenca",
    pickMoldovaLabel: "Vay alosar yekh rayono katar i lista",
    pickCroatiaLabel: "Vay alosar yekh zhupaniya katar i lista",
    pickItalyLabel: "Vay alosar yekh regiyona katar i lista",
    pickAlbaniaLabel: "Vay alosar yekh qarko katar i lista",
  },
};

/** Conditional map display rule by active UI language: `it` -> Italy, `hr` -> Croatia, `sq` -> Albania, others -> Romania + Moldova. */
export function mapCountriesForLang(lang: Lang): MapCountry[] {
  if (lang === "it") return ["it"];
  if (lang === "hr") return ["hr"];
  if (lang === "sq") return ["al"];
  return ["ro", "md"];
}

export function countryAllValue(country: MapCountry): string {
  if (country === "it") return ALL_ITALY;
  if (country === "md") return ALL_MOLDOVA;
  if (country === "hr") return ALL_CROATIA;
  if (country === "al") return ALL_ALBANIA;
  return ALL_ROMANIA;
}

export type RomaniaCountyMapProps = {
  selectedCounty: string;
  onSelectCounty: (county: string, country: MapCountry) => void;
  /** Areas with recent news or a mediator hub; drawn darker and listed under the map. */
  activeHubs?: string[];
  /** Which country maps to offer. With more than one, an underline switch appears above the map. */
  countries?: MapCountry[];
  /** Optional controlled/synced map country when parent coordinates feed and map together. */
  activeCountry?: MapCountry;
  onCountryChange?: (country: MapCountry) => void;
  className?: string;
};
