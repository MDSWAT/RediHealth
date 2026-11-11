import { NEWS_TRANSLATIONS_HR } from "./news-translations-hr";
import { NEWS_TRANSLATIONS_ROM } from "./news-translations-rom";
import {
  NEWS_TRANSLATIONS_EXTRA_EN,
  NEWS_TRANSLATIONS_EXTRA_IT,
  NEWS_TRANSLATIONS_EXTRA_SQ,
} from "./news-translations-extra";

export type NewsCategory =
  | "Alerte locale"
  | "Caravane medicale"
  | "Campanii de vaccinare"
  | "Sfaturi de sezon";

export type NewsCountry = "ro" | "md" | "it" | "hr" | "al";

/** The county value of an item about the whole of Italy (same value the county map uses for "all of Italy"). */
export const ITALY_WIDE = "Italia";

/** The county value of an item about the whole of Republic of Moldova. */
export const MOLDOVA_WIDE = "Moldova";

/** The county value of an item about the whole of Croatia. */
export const CROATIA_WIDE = "Hrvatska";

/** The county value of an item about the whole of Albania. */
export const ALBANIA_WIDE = "Shqipëria";

export type NewsArticle = {
  id: string;
  slug: string;
  title: string;
  category: NewsCategory;
  categoryLabel?: string;
  county: string; // Specific county/region or country-wide sentinel ("Toate județele", ITALY_WIDE, MOLDOVA_WIDE, CROATIA_WIDE)
  /** Which country the item is about; Romanian when omitted. Never shown in the other country's views. */
  country?: NewsCountry;
  /** The language the text is written in, when it is fixed (an Italy-only item is in Italian in every locale). */
  language?: "ro" | "en" | "sq" | "it" | "hr" | "rom";
  date: string;
  readTimeMinutes: number;
  summary: string;
  content: string[];
  verifiedDoctor: {
    name: string;
    specialty: string;
    verifiedDate: string;
  };
  tags: string[];
  audioNarrationDuration: string;
  epidemicSeverity?: "high" | "moderate";
  preventiveSteps?: string[];
  caravanDetails?: {
    village: string;
    landmark: string;
    hours: string;
    freeServices: string[];
  };
};

export const NEWS_ARTICLES: NewsArticle[] = [
  {
    id: "alert-rujeola-iasi",
    slug: "focar-rujeola-est-moldova",
    title: "Mai mulți copii bolnavi de rujeolă în județul Iași",
    category: "Alerte locale",
    county: "Iași",
    date: "2026-11-04",
    readTimeMinutes: 3,
    epidemicSeverity: "high",
    summary: "DSP Iași anunță cazuri de rujeolă la copii nevaccinați. Vaccinul ROR e gratuit la medicul de familie.",
    content: [
      "În ultimele 2 săptămâni, spitalele și cabinetele din județul Iași au văzut mai mulți copii cu rujeolă. Cei mai mulți sunt la grădiniță sau la școală.",
      "Rujeola (pojarul) e un virus care se ia foarte ușor. Poate duce la pneumonie sau la inflamația creierului (encefalită). Vaccinul ROR (rujeolă, oreion, rubeolă) protejează sigur și eficient, pe viață.",
      "Uită-te în carnetul de vaccinări al copilului. Sună la medicul de familie sau la mediatorul sanitar ca să faci programare.",
    ],
    verifiedDoctor: {
      name: "Dr. Elena Popescu",
      specialty: "Medic primar epidemiolog, DSP Iași",
      verifiedDate: "4 noiembrie 2026",
    },
    tags: ["Vaccinare ROR", "Pediatrie", "Sănătate publică", "Prevenție"],
    audioNarrationDuration: "2 min 10 sec",
    preventiveSteps: [
      "Întreabă medicul de familie ce vaccinuri îi lipsesc copilului",
      "Dacă copilul are febră și bubițe roșii pe piele, ține-l departe de locuri aglomerate",
      "Sună medicul sau mediatorul înainte să mergi cu el la dispensar",
    ],
  },
  {
    id: "caravana-galati-barcea",
    slug: "caravana-medicala-mobila-barcea",
    title: "Caravana medicală vine în Barcea și Ivești",
    category: "Caravane medicale",
    county: "Galați",
    date: "2026-11-09",
    readTimeMinutes: 2,
    summary: "Consultații gratuite, test de zahăr în sânge și EKG în sat. Nu ai nevoie de card de sănătate sau asigurare.",
    content: [
      "Medici și mediatori sanitari vin cu caravana în satele Barcea și Ivești. Te consultă gratuit.",
      "Totul e gratuit. Poți veni și dacă nu ai asigurare sau medic de familie. Adu buletinul tău sau certificatul de naștere al copilului.",
    ],
    verifiedDoctor: {
      name: "Dr. Mircea Dumitrescu",
      specialty: "Medic medicină de familie, Coordonator caravană",
      verifiedDate: "5 noiembrie 2026",
    },
    tags: ["Caravană", "Analize gratuite", "Comunitate", "Acces medical"],
    audioNarrationDuration: "1 min 45 sec",
    caravanDetails: {
      village: "Comuna Barcea",
      landmark: "În curtea căminului cultural, lângă școală",
      hours: "09:00 – 16:30",
      freeServices: [
        "Tensiunea",
        "Zahărul în sânge (glicemie)",
        "EKG",
        "Consultație pentru copii",
      ],
    },
  },
  {
    id: "campanie-antigripala-nationala",
    slug: "campanie-nationala-vaccinare-antigripala-2026",
    title: "Vaccinul antigripal se face acum în toate județele",
    category: "Campanii de vaccinare",
    county: "Toate județele",
    date: "2026-10-28",
    readTimeMinutes: 4,
    summary: "Dacă ai o boală cronică, ești însărcinată sau ai peste 65 de ani, vaccinul antigripal e compensat 100%.",
    content: [
      "Gripa poate fi grea dacă ai diabet, tensiune mare sau boli de plămâni ori de inimă.",
      "Medicul de familie îți dă rețeta compensată 100%. Te vaccinezi la cabinet sau într-o farmacie autorizată.",
      "Dacă nu ai medic de familie, mediatorul sanitar te ajută să te înscrii la un medic din zonă.",
    ],
    verifiedDoctor: {
      name: "Dr. Simona Ionescu",
      specialty: "Medic infecționist, Institutul Matei Balș",
      verifiedDate: "28 octombrie 2026",
    },
    tags: ["Gripă", "Vaccinare compensată", "Boli cronice", "Seniori"],
    audioNarrationDuration: "3 min 15 sec",
    preventiveSteps: [
      "Cere rețeta compensată de la medicul de familie",
      "Spală-te des pe mâini cu apă și săpun, 20 de secunde",
      "Deschide geamurile de cel puțin 3 ori pe zi",
    ],
  },
  {
    id: "sfat-sezon-raceli-copii",
    slug: "cum-deosebim-raceala-usoara-de-gripa-la-copii",
    title: "Răceală sau gripă la copii: cum le deosebești",
    category: "Sfaturi de sezon",
    county: "Toate județele",
    date: "2026-11-02",
    readTimeMinutes: 3,
    summary: "Febra mare care vine brusc și durerile de mușchi arată de obicei gripă, nu răceală.",
    content: [
      "Răceala vine încet: nasul se înfundă, copilul strănută și e puțin moale. Febra e mică sau lipsește.",
      "Gripa vine brusc, în câteva ore: febră mare (peste 38,5°C), dureri de cap, dureri de mușchi și oboseală mare.",
      "Dă-i copilului să bea mult: ceai călduț, apă, supă de legume. Nu-i da antibiotice fără rețetă. Antibioticele nu omoară virusurile.",
    ],
    verifiedDoctor: {
      name: "Dr. Radu Călin",
      specialty: "Medic specialist pediatrie",
      verifiedDate: "2 noiembrie 2026",
    },
    tags: ["Pediatrie", "Ghid părinți", "Tratament corect", "Fără antibiotice"],
    audioNarrationDuration: "2 min 40 sec",
    preventiveSteps: [
      "Dă-i copilului des de băut, lichide călduțe",
      "Dacă respiră repede, du-l urgent la medic",
      "Dă-i medicamente de febră doar cum ți-a spus medicul",
    ],
  },
  {
    id: "alerta-hepatita-cluj",
    slug: "masuri-igiena-hepatita-a-cluj",
    title: "Satele din Cluj: fierbe apa din fântână",
    category: "Alerte locale",
    county: "Cluj",
    date: "2026-10-30",
    readTimeMinutes: 3,
    epidemicSeverity: "moderate",
    summary: "După inundații, fierbe apa din fântânile care nu sunt verificate de DSP.",
    content: [
      "DSP Cluj cere oamenilor de la sat să bea și să gătească doar cu apă fiartă și răcită, dacă apa vine dintr-o fântână de suprafață.",
      "Hepatita A se ia din apă sau mâncare murdară și de pe mâini nespălate. Dacă te speli bine pe mâini, boala nu se mai răspândește.",
    ],
    verifiedDoctor: {
      name: "Dr. Cristina Stan",
      specialty: "Medic igienist DSP Cluj",
      verifiedDate: "30 octombrie 2026",
    },
    tags: ["Igienă", "Apă potabilă", "Hepatită A", "Prevenție"],
    audioNarrationDuration: "2 min 05 sec",
    preventiveSteps: [
      "Fierbe apa din fântână cel puțin 10 minute înainte s-o bei",
      "Spală fructele și legumele doar cu apă sigură",
      "Spală-te pe mâini înainte de masă și după toaletă",
    ],
  },
  {
    id: "caravana-stomatologica-bucuresti-ilfov",
    slug: "caravana-stomatologica-copii-bucuresti-ilfov",
    title: "Dentist gratuit pentru copii în București și Ilfov",
    category: "Caravane medicale",
    county: "București",
    date: "2026-11-06",
    readTimeMinutes: 3,
    summary: "Control la dinți, curățare și sfaturi de spălat pe dinți, gratuit, pentru copii și adulți fără asigurare.",
    content: [
      "Un cabinet de stomatologie pe roți vine în cartier. Dinții se verifică și se curăță gratuit.",
      "Copiii învață cum să se spele corect pe dinți și primesc un gel cu fluor. Dacă îi doare un dinte, primesc un tratament mic pe loc.",
      "E gratuit. Nu ai nevoie de asigurare sau card de sănătate. Părinții vin cu buletinul.",
    ],
    verifiedDoctor: {
      name: "Dr. Andrei Vasilescu",
      specialty: "Medic stomatolog pediatru, Voluntari pentru Sănătate",
      verifiedDate: "6 noiembrie 2026",
    },
    tags: ["Stomatologie", "Pediatrie", "Prevenție gratuită", "Comunitate"],
    audioNarrationDuration: "2 min 15 sec",
    caravanDetails: {
      village: "Sector 5 și Comuna Jilava",
      landmark: "Parcarea dispensarului comunitar, aleea principală",
      hours: "08:30 – 15:30",
      freeServices: [
        "Control la dinți",
        "Curățarea tartrului",
        "Fluor pentru copii",
        "Pastă și periuță de dinți",
      ],
    },
  },
  {
    id: "campanie-vaccinare-hpv-national",
    slug: "campanie-vaccinare-hpv-adolescenti-2026",
    title: "Vaccinul HPV e gratuit pentru fete și băieți din toată țara",
    category: "Campanii de vaccinare",
    county: "Toate județele",
    date: "2026-11-05",
    readTimeMinutes: 3,
    summary: "Copiii de 11–18 ani pot face gratuit vaccinul HPV. Îl ceri de la medicul de familie.",
    content: [
      "Vaccinul HPV previne peste 90% din cancerele de col uterin și alte leziuni care pot deveni cancer.",
      "E gratuit pentru fete și băieți până la 18 ani. Ceri vaccinul la medicul de familie.",
      "Dacă dispensarul e departe, mediatorul sanitar te ajută să faci cererea și programarea.",
    ],
    verifiedDoctor: {
      name: "Dr. Mirela Teodorescu",
      specialty: "Medic primar obstetrică-ginecologie și sănătate publică",
      verifiedDate: "5 noiembrie 2026",
    },
    tags: ["Vaccinare HPV", "Adolescenți", "Prevenție cancer", "Ghid părinți"],
    audioNarrationDuration: "2 min 30 sec",
    preventiveSteps: [
      "Cere vaccinul la medicul de familie",
      "Fă-ți programare pentru ambele doze, la datele spuse de medic",
      "Vorbește cu copilul despre ce îl protejează vaccinul",
    ],
  },
  {
    id: "sfat-calitate-aer-respirator-bucuresti",
    slug: "ghid-protectie-respiratorie-zile-smog-urban",
    title: "Zile cu smog în București: cum îți protejezi plămânii",
    category: "Sfaturi de sezon",
    county: "București",
    date: "2026-11-07",
    readTimeMinutes: 2,
    summary: "Sfaturi pentru cei cu astm, bronșită cronică sau boli de inimă, în zilele cu smog și ceață.",
    content: [
      "În diminețile reci de toamnă și iarnă, aerul murdar rămâne jos, aproape de pământ, în orașele mari.",
      "Dacă ai o boală de plămâni sau ai copii mici, nu face efort mare afară între 07:00 și 09:30 dimineața.",
      "În casă, nu fuma și nu arde gunoi în sobă. Ține aerul nici prea uscat, nici prea umed.",
    ],
    verifiedDoctor: {
      name: "Dr. Ioan Munteanu",
      specialty: "Medic primar pneumolog, Institutul Marius Nasta",
      verifiedDate: "7 noiembrie 2026",
    },
    tags: ["Pneumologie", "Poluare urbană", "Astm", "Sfaturi practice"],
    audioNarrationDuration: "1 min 50 sec",
    preventiveSteps: [
      "Nu face efort mare afară dimineața devreme",
      "Ține inhalatorul de la medic mereu la tine",
      "Sună medicul sau mediatorul dacă tușești și nu-ți trece",
    ],
  },
  // Italy-only items: written in Italian and shown only in the Italy views of the map.
  {
    id: "it-campagna-antinfluenzale",
    slug: "campagna-vaccinazione-antinfluenzale-italia-2026",
    title: "Vaccino antinfluenzale gratuito per over 60, donne in gravidanza e malati cronici",
    category: "Campanii de vaccinare",
    county: ITALY_WIDE,
    country: "it",
    language: "it",
    date: "2026-11-03",
    readTimeMinutes: 3,
    summary: "Il vaccino contro l'influenza 2026-2027 si fa in tutte le regioni. Per chi è più a rischio è gratis, dal medico di famiglia o in farmacia.",
    content: [
      "Il vaccino è gratis se hai 60 anni o più, se sei incinta, per i bambini piccoli e per chi ha malattie croniche come diabete, asma o problemi di cuore.",
      "Puoi vaccinarti dal tuo medico di famiglia, dal pediatra o nelle farmacie che partecipano. Se non hai ancora un medico, vai al distretto sanitario della tua ASL.",
      "In molte regioni puoi vaccinarti anche se sei un cittadino europeo senza iscrizione al servizio sanitario, con il codice ENI. Il mediatore sanitario ti aiuta a ottenerlo.",
    ],
    verifiedDoctor: {
      name: "Dott.ssa Giulia Ferri",
      specialty: "Medico di sanità pubblica",
      verifiedDate: "3 novembre 2026",
    },
    tags: ["Influenza", "Vaccino gratuito", "Malattie croniche", "Over 60"],
    audioNarrationDuration: "2 min 30 sec",
  },
  {
    id: "it-ambulatorio-mobile-roma",
    slug: "ambulatorio-mobile-roma-visite-gratuite",
    title: "Ambulatorio mobile a Roma con visite gratis e mediatori che parlano romeno",
    category: "Caravane medicale",
    county: "Lazio",
    country: "it",
    language: "it",
    date: "2026-11-07",
    readTimeMinutes: 2,
    summary: "Un camper con medici volontari e mediatori culturali si ferma nella periferia est di Roma. Non serve la tessera sanitaria.",
    content: [
      "I medici volontari ti visitano, misurano pressione e zucchero nel sangue e controllano le vaccinazioni dei bambini.",
      "Ci sono mediatori che parlano romeno e romanes. Ti spiegano i risultati e ti aiutano a prenotare altre visite, se servono.",
      "Non serve la tessera sanitaria. Porta un documento d'identità, se ce l'hai, e il libretto delle vaccinazioni dei bambini.",
    ],
    verifiedDoctor: {
      name: "Dott. Marco Bellini",
      specialty: "Medico di medicina generale, volontario",
      verifiedDate: "7 novembre 2026",
    },
    tags: ["Ambulatorio mobile", "Roma", "Mediatori culturali", "Gratuito"],
    audioNarrationDuration: "1 min 50 sec",
    caravanDetails: {
      village: "Roma, Tor Sapienza",
      landmark: "Piazzale del centro civico",
      hours: "09:30 – 15:30",
      freeServices: ["Visita generale", "Pressione e glicemia", "Controllo vaccinazioni dei bambini"],
    },
  },
  // Republic of Moldova items: shown in the Moldova views of the map and localized across all supported languages.
  {
    id: "md-caravana-soroca",
    slug: "caravana-medicala-soroca-consultatii-gratuite",
    title: "Caravana medicală ajunge la Soroca cu consultații și analize gratuite",
    category: "Caravane medicale",
    county: "Soroca",
    country: "md",
    date: "2026-11-08",
    readTimeMinutes: 3,
    summary: "Medici de familie și mediatori comunitari oferă control de tensiune, glicemie și EKG gratuit în Soroca, fără poliță CNAM.",
    content: [
      "Echipa mobilă de medici și mediatori comunitari vine la Soroca pentru controale preventive gratuite pentru adulți și copii.",
      "Nu ai nevoie de poliță de asigurare CNAM și nici de trimitere. Adu buletinul de identitate sau certificatul de naștere al copilului, dacă îl ai la îndemână.",
      "Mediatorul comunitar îți explică rezultatul pe loc și te ajută să te înscrii la medicul de familie din raion.",
    ],
    verifiedDoctor: {
      name: "Dr. Natalia Rusu",
      specialty: "Medic de familie, Centrul de Sănătate Soroca",
      verifiedDate: "8 noiembrie 2026",
    },
    tags: ["Caravană", "Analize gratuite", "Comunitate", "Acces medical"],
    audioNarrationDuration: "2 min 05 sec",
    caravanDetails: {
      village: "Municipiul Soroca, cartierul Dealul Sorocii",
      landmark: "Piața de lângă centrul comunitar",
      hours: "09:00 – 16:00",
      freeServices: [
        "Tensiunea arterială",
        "Zahărul în sânge (glicemie)",
        "EKG",
        "Control preventiv pentru copii",
      ],
    },
  },
  {
    id: "md-alerta-apa-cahul",
    slug: "apa-sigura-fantani-raionul-cahul",
    title: "Satele din raionul Cahul: fierbe apa din fântânile de suprafață",
    category: "Alerte locale",
    county: "Cahul",
    country: "md",
    date: "2026-11-05",
    readTimeMinutes: 3,
    epidemicSeverity: "moderate",
    summary: "După ploile de toamnă, sănătatea publică recomandă fierberea apei din fântâni pentru a preveni hepatita A și infecțiile digestive.",
    content: [
      "În mai multe localități rurale din raionul Cahul, apa din fântânile puțin adânci poate fi tulbure după ploi.",
      "Bea și gătește doar cu apă îmbuteliată sau cu apă fiartă cel puțin 10 minute și lăsată la răcit într-un vas curat.",
      "Dacă un copil are dureri de burtă, vărsături sau pielea îngălbenită, sună medicul de familie sau mediatorul comunitar din sat.",
    ],
    verifiedDoctor: {
      name: "Dr. Vasile Moraru",
      specialty: "Medic igienist, Centrul de Sănătate Publică Cahul",
      verifiedDate: "5 noiembrie 2026",
    },
    tags: ["Igienă", "Apă potabilă", "Hepatită A", "Prevenție"],
    audioNarrationDuration: "2 min 00 sec",
    preventiveSteps: [
      "Fierbe apa din fântână cel puțin 10 minute înainte de băut și gătit",
      "Spală fructele și legumele doar cu apă potabilă verificată",
      "Spală-te pe mâini cu apă și săpun înainte de masă și după toaletă",
    ],
  },
  {
    id: "md-vaccinare-gripala-national",
    slug: "vaccinare-antigripala-hpv-moldova-2026",
    title: "Vaccinarea antigripală și HPV gratuită în toate raioanele din Moldova",
    category: "Campanii de vaccinare",
    county: MOLDOVA_WIDE,
    country: "md",
    date: "2026-11-03",
    readTimeMinutes: 3,
    summary: "Cabinetele medicilor de familie din Republica Moldova oferă gratuit vaccinul antigripal pentru grupurile cu risc și vaccinul HPV pentru tineri.",
    content: [
      "Persoanele cu diabet, tensiune arterială crescută, boli de inimă sau de plămâni, femeile însărcinate și vârstnicii primesc gratuit vaccinul antigripal la medicul de familie.",
      "Tot la medicul de familie, fetele și băieții pot face gratuit vaccinul HPV conform calendarului național de imunizare.",
      "Dacă nu știi la ce centru de sănătate ești arondat, mediatorul comunitar te ajută să verifici înregistrarea și să faci programare.",
    ],
    verifiedDoctor: {
      name: "Dr. Mariana Cebotari",
      specialty: "Medic epidemiolog, Agenția Națională pentru Sănătate Publică",
      verifiedDate: "3 noiembrie 2026",
    },
    tags: ["Gripă", "Vaccinare HPV", "Boli cronice", "Prevenție"],
    audioNarrationDuration: "2 min 20 sec",
    preventiveSteps: [
      "Întreabă medicul de familie de vaccinul antigripal sau HPV",
      "Ia cu tine carnetul de vaccinări al copilului la control",
      "Aerisește camerele zilnic și spală-te des pe mâini",
    ],
  },
  {
    id: "md-sfat-sezon-chisinau",
    slug: "medicamente-compensate-sezon-rece-chisinau",
    title: "Chișinău: cum iei medicamentele compensate prin e-Rețeta în sezonul rece",
    category: "Sfaturi de sezon",
    county: "Chișinău",
    country: "md",
    date: "2026-11-09",
    readTimeMinutes: 2,
    summary: "Pacienții cu tensiune mare, diabet sau astm își pot ridica medicamentele compensate direct din farmacie cu buletinul.",
    content: [
      "În zilele reci și umede din Chișinău, tensiunea arterială și simptomele de astm se pot agrava dacă întrerupi tratamentul zilnic.",
      "Prin sistemul e-Rețeta CNAM, medicul de familie prescrie tratamentul electronic, iar tu ridici medicamentele compensate la farmacie doar cu buletinul de identitate.",
      "Nu opri pastilele de tensiune sau inhalatorul fără sfatul medicului, chiar dacă te simți bine câteva zile.",
    ],
    verifiedDoctor: {
      name: "Dr. Sergiu Lungu",
      specialty: "Medic internist, Asociația Medicală Teritorială Chișinău",
      verifiedDate: "9 noiembrie 2026",
    },
    tags: ["Boli cronice", "Tratament corect", "Astm", "Sfaturi practice"],
    audioNarrationDuration: "1 min 55 sec",
    preventiveSteps: [
      "Cere medicului de familie reînnoirea rețetei electronice înainte să termini cutia",
      "Ia tratamentul de tensiune sau diabet la aceeași oră în fiecare zi",
      "Poartă un fular peste gură și nas în diminețile cu ger sau ceață densă",
    ],
  },
  // Croatia items: shown in the Croatia views of the map and localized across all supported languages (native Croatian in `hr`).
  {
    id: "hr-mobilna-ambulanta-zagreb",
    slug: "mobilna-ambulanta-zagreb-besplatni-pregledi",
    title: "Clinica mobilă în Zagreb: control gratuit de tensiune și glicemie",
    category: "Caravane medicale",
    county: "Grad Zagreb",
    country: "hr",
    date: "2026-11-09",
    readTimeMinutes: 3,
    summary: "Medici și mediatori romi fac controale gratuite de tensiune, zahăr în sânge și EKG în estul Zagrebului, fără card HZZO.",
    content: [
      "Echipa medicală mobilă și mediatorii sanitari vin în cartierele Peščenica și Sesvete din Zagreb pentru controale preventive gratuite.",
      "Poți veni chiar dacă nu ai asigurare HZZO sau medic de familie ales. Adu un act de identitate dacă îl ai și documentele medicale mai vechi.",
      "Mediatorul îți explică valorile tensiunii și glicemiei pe înțelesul tău și te îndrumă către cel mai apropiat centru de sănătate (dom zdravlja).",
    ],
    verifiedDoctor: {
      name: "Dr. Ivana Horvat",
      specialty: "Medic specialist medicină de familie, Dom zdravlja Zagreb",
      verifiedDate: "9 noiembrie 2026",
    },
    tags: ["Caravană", "Analize gratuite", "Comunitate", "Acces medical"],
    audioNarrationDuration: "2 min 10 sec",
    caravanDetails: {
      village: "Grad Zagreb, Peščenica și Sesvete",
      landmark: "Curtea centrului comunitar local",
      hours: "09:00 – 15:30",
      freeServices: [
        "Măsurarea tensiunii arteriale",
        "Glicemie din deget",
        "EKG",
        "Consiliere cu mediator sanitar",
      ],
    },
  },
  {
    id: "hr-preventivni-pregledi-medimurje",
    slug: "zdravstvena-upozorenja-cijepljenje-medimurska",
    title: "Comitatul Međimurska: protecția copiilor împotriva tusei convulsive și rujeolei",
    category: "Alerte locale",
    county: "Međimurska",
    country: "hr",
    date: "2026-11-06",
    readTimeMinutes: 3,
    epidemicSeverity: "moderate",
    summary: "Institutul de sănătate publică din Međimurska invită părinții din Čakovec și satele vecine să verifice vaccinarea copiilor.",
    content: [
      "Odată cu răcirea vremii, cabinetele pediatrice din comitatul Međimurska văd mai multe infecții respiratorii și tuse prelungită la școlari și sugari.",
      "Vaccinurile din calendarul regulat pentru copii sunt gratuite la pediatru și la medicul școlar.",
      "Dacă un sugar tușește în reprize sau respiră greu, sună imediat pediatrul sau numărul de urgență 112.",
    ],
    verifiedDoctor: {
      name: "Dr. Marko Kovačević",
      specialty: "Medic epidemiolog, Zavod za javno zdravstvo Međimurske županije",
      verifiedDate: "6 noiembrie 2026",
    },
    tags: ["Pediatrie", "Sănătate publică", "Prevenție", "Ghid părinți"],
    audioNarrationDuration: "2 min 15 sec",
    preventiveSteps: [
      "Verifică carnetul de vaccinări al copilului împreună cu pediatrul sau mediatorul",
      "Ține copilul cu febră și tuse acasă și anunță telefonic cabinetul înainte de vizită",
      "Sună la 112 dacă un bebeluș are pauze de respirație sau buze vineții",
    ],
  },
  {
    id: "hr-cijepljenje-gripa-hrvatska",
    slug: "besplatno-cijepljenje-protiv-gripe-hpv-hrvatska-2026",
    title: "Vaccinare gratuită împotriva gripei și HPV în toată Croația",
    category: "Campanii de vaccinare",
    county: CROATIA_WIDE,
    country: "hr",
    date: "2026-11-04",
    readTimeMinutes: 3,
    summary: "HZJZ și cabinetele medicilor de familie oferă gratuit vaccinul antigripal pentru bolnavii cronici și vârstnici, precum și vaccinul HPV pentru tineri.",
    content: [
      "Vaccinul antigripal este gratuit în toată Croația pentru persoanele peste 65 de ani, gravide și pacienți cu boli cronice de inimă, plămâni sau diabet.",
      "Te poți vaccina la medicul tău de familie sau la institutele județene de sănătate publică (zavod za javno zdravstvo).",
      "Tinerii pot face gratuit și vaccinul împotriva HPV prin medicina școlară și cabinetele de prevenție.",
    ],
    verifiedDoctor: {
      name: "Dr. Ana Babić",
      specialty: "Medic specialist sănătate publică, HZJZ",
      verifiedDate: "4 noiembrie 2026",
    },
    tags: ["Gripă", "Vaccinare HPV", "Boli cronice", "Seniori"],
    audioNarrationDuration: "2 min 20 sec",
    preventiveSteps: [
      "Programează-te din timp la medicul de familie sau la institutul de sănătate publică",
      "Spală-te pe mâini cu apă și săpun după transportul public",
      "Aerisește locuința de mai multe ori pe zi",
    ],
  },
  {
    id: "hr-zimski-savjeti-split",
    slug: "zastita-disnih-putova-bura-vlaga-split",
    title: "Split și Dalmația: cum îți protejezi inima și plămânii pe vânt rece și umezeală",
    category: "Sfaturi de sezon",
    county: "Splitsko-dalmatinska",
    country: "hr",
    date: "2026-11-07",
    readTimeMinutes: 2,
    summary: "Schimbările bruște de temperatură, vântul rece (bura) și umezeala pot crește tensiunea arterială și pot declanșa crize de astm.",
    content: [
      "În comitatul Splitsko-dalmatinska, trecerea rapidă de la zile umede la vânt rece solicită inima și căile respiratorii.",
      "Dacă ai hipertensiune sau astm, măsoară-ți tensiunea dimineața și poartă mereu la tine inhalatorul prescris prin e-recept.",
      "Încălzește și aerisește camerele regulat pentru a preveni mucegaiul, care agravează tusea la copii și vârstnici.",
    ],
    verifiedDoctor: {
      name: "Dr. Luka Radić",
      specialty: "Medic specialist pneumologie, KBC Split",
      verifiedDate: "7 noiembrie 2026",
    },
    tags: ["Pneumologie", "Astm", "Boli cronice", "Sfaturi practice"],
    audioNarrationDuration: "1 min 50 sec",
    preventiveSteps: [
      "Respiră pe nas sau printr-un fular subțire când bate vântul rece",
      "Nu sări peste pastilele zilnice de tensiune arterială",
      "Aerisește scurt dimineața și la prânz ca să reduci umezeala din casă",
    ],
  },
  // --- Albania (12 qarqe + nationwide Shqipëria) ---
  {
    id: "al-karvana-tirane",
    slug: "klinika-levizese-tirane-kontrolle-falas",
    title: "Clinică mobilă în Tirana: control gratuit pentru tensiune și glucoza din sânge",
    category: "Caravane medicale",
    county: "Tiranë",
    country: "al",
    date: "2026-11-09",
    readTimeMinutes: 2,
    summary: "Medicii de familie și mediatorii sanitari oferă măsurarea gratuită a tensiunii arteriale, a concentrației de glucoză din sânge și EKG în Tirana, fără card FSDKSH.",
    content: [
      "Echipa medicală mobilă și mediatorii sanitari romi și egipteni ajung în cartierele Bregu i Lumit și Kombinat din Tirana pentru controale preventive gratuite.",
      "Poți veni chiar dacă nu ai asigurare FSDKSH sau medic de familie ales. Adu actul de identitate sau certificatul de naștere al copilului, dacă îl ai.",
      "Mediatorul îți explică pe loc valorile tensiunii și concentrației de glucoză din sânge și te ajută să te înscrii la centrul de sănătate din cartier.",
    ],
    verifiedDoctor: {
      name: "Dr. Arta Dervishi",
      specialty: "Medic specialist medicină de familie, Centrul de Sănătate nr. 6 Tirana",
      verifiedDate: "9 noiembrie 2026",
    },
    tags: ["Caravană mobilă", "Analize gratuite", "Comunitate", "Acces medical"],
    audioNarrationDuration: "1 min 45 sec",
    caravanDetails: {
      village: "Municipiul Tirana, Bregu i Lumit și Kombinat",
      landmark: "Piațeta de lângă dispensarul de cartier",
      hours: "09:00 - 15:30 (vineri și sâmbătă)",
      freeServices: [
        "Măsurare tensiune arterială",
        "Concentrația de glucoză din sânge",
        "EKG",
        "Orientare cu mediator sanitar",
      ],
    },
  },
  {
    id: "al-uje-i-pijshem-shkoder",
    slug: "fshatrat-shkoder-ujet-e-puseve",
    title: "Satele de câmpie din regiunea Shkodër: fierbe apa din fântânile de mică adâncime",
    category: "Alerte locale",
    county: "Shkodër",
    country: "al",
    date: "2026-11-06",
    readTimeMinutes: 2,
    summary: "După ploile abundente de toamnă de pe râurile Buna și Drin, sănătatea publică recomandă fierberea apei din fântâni pentru a preveni infecțiile digestive și hepatita A.",
    content: [
      "În satele joase din jurul orașului Shkodër, apa din fântânile private de mică adâncime se poate tulbura după ploi puternice.",
      "Folosește apă îmbuteliată sau fierbe apa din fântână cel puțin 10 minute și las-o la răcit într-un vas curat acoperit înainte de băut și gătit.",
      "Dacă un copil are crampe abdominale, vărsături sau îngălbenirea ochilor, mergi fără întârziere la medicul de familie sau la centrul de sănătate.",
    ],
    verifiedDoctor: {
      name: "Dr. Sokol Kola",
      specialty: "Medic epidemiolog, Unitatea Locală de Îngrijiri de Sănătate Shkodër",
      verifiedDate: "6 noiembrie 2026",
    },
    tags: ["Igienă", "Apă potabilă", "Hepatită A", "Prevenție"],
    audioNarrationDuration: "1 min 40 sec",
    epidemicSeverity: "moderate",
    preventiveSteps: [
      "Fierbe apa din fântânile de mică adâncime cel puțin 10 minute înainte de băut",
      "Spală fructele și legumele doar cu apă potabilă sigură",
      "Spală-te pe mâini cu apă și săpun înainte de masă și după toaletă",
    ],
  },
  {
    id: "al-vaksinim-grip-shqiperi",
    slug: "vaksinim-grip-kontroll-baze-shqiperi",
    title: "Vaccinare antigripală gratuită și control medical anual în toată Albania",
    category: "Campanii de vaccinare",
    county: ALBANIA_WIDE,
    country: "al",
    date: "2026-11-05",
    readTimeMinutes: 2,
    summary: "Centrele de sănătate din cele 12 regiuni ale Albaniei oferă gratuit vaccinul antigripal sezonier pentru grupele la risc și controlul preventiv anual.",
    content: [
      "Institutul de Sănătate Publică și centrele de sănătate primară din toată Albania oferă gratuit vaccinul antigripal pentru vârstnici, gravide și persoane cu boli cronice cardiace, pulmonare, renale sau diabet.",
      "Adulții între 35 și 70 de ani pot face gratuit și controlul medical preventiv de bază la centrul lor de sănătate.",
      "Dacă ai nevoie de ajutor ca să îți verifici înscrierea pe e-Albania sau să îți găsești medicul de familie, cere sprijinul mediatorului sanitar din comunitate.",
    ],
    verifiedDoctor: {
      name: "Dr. Lindita Basha",
      specialty: "Medic specialist sănătate publică, Institutul de Sănătate Publică (ISHP)",
      verifiedDate: "5 noiembrie 2026",
    },
    tags: ["Gripă", "Prevenție", "Boli cronice", "Sănătate publică"],
    audioNarrationDuration: "1 min 55 sec",
    preventiveSteps: [
      "Cere vaccinul antigripal sezonier la medicul de familie din centrul de sănătate",
      "Adu carnetul de vaccinare al copilului când mergi la pediatru",
      "Aerisește camerele zilnic și spală-te regulat pe mâini cu apă și săpun",
    ],
  },
  {
    id: "al-receta-elektronike-elbasan",
    slug: "rinovim-receta-rimbursim-elbasan",
    title: "Elbasan: reînnoirea la timp a rețetei compensate fără întreruperea tratamentului",
    category: "Sfaturi de sezon",
    county: "Elbasan",
    country: "al",
    date: "2026-11-08",
    readTimeMinutes: 2,
    summary: "Pacienții cu hipertensiune, diabet sau astm își pot reînnoi rețeta electronică compensată la medicul de familie înainte să se termine medicamentele.",
    content: [
      "Diminețile reci și fumul de la sobe în valea Elbasanului pot crește tensiunea arterială și pot declanșa tuse sau respirație șuierătoare.",
      "Medicul de familie eliberează rețeta electronică cu rambursare, iar medicamentele lunare sau inhalatorul se ridică din farmaciile partenere cu actul de identitate.",
      "Nu întrerupe singur pastilele pentru tensiune sau diabet, nici în zilele în care te simți bine.",
    ],
    verifiedDoctor: {
      name: "Dr. Ilir Hoxha",
      specialty: "Medic specialist medicină internă, Spitalul Regional Elbasan",
      verifiedDate: "8 noiembrie 2026",
    },
    tags: ["Boli cronice", "Astm", "Tratament corect", "Sfaturi practice"],
    audioNarrationDuration: "1 min 50 sec",
    preventiveSteps: [
      "Reînnoiește rețeta compensată cu 5 zile înainte să se termine cutia actuală",
      "Poartă cu tine inhalatorul prescris în diminețile reci sau cu fum",
      "Aerisește scurt locuința la prânz și nu arde lemn vopsit sau deșeuri din plastic",
    ],
  },
];

export const NEWS_CATEGORIES: NewsCategory[] = [
  "Alerte locale",
  "Caravane medicale",
  "Campanii de vaccinare",
  "Sfaturi de sezon",
];

export const NEWS_CATEGORY_LABELS: Record<string, Record<NewsCategory, string>> = {
  ro: {
    "Alerte locale": "Alerte locale",
    "Caravane medicale": "Caravane medicale",
    "Campanii de vaccinare": "Campanii de vaccinare",
    "Sfaturi de sezon": "Sfaturi de sezon",
  },
  en: {
    "Alerte locale": "Local alerts",
    "Caravane medicale": "Mobile clinics",
    "Campanii de vaccinare": "Vaccinations",
    "Sfaturi de sezon": "Seasonal advice",
  },
  sq: {
    "Alerte locale": "Alarme lokale",
    "Caravane medicale": "Karvanë mjekësorë",
    "Campanii de vaccinare": "Vaksinime",
    "Sfaturi de sezon": "Këshilla për stinën",
  },
  it: {
    "Alerte locale": "Avvisi locali",
    "Caravane medicale": "Ambulatori mobili",
    "Campanii de vaccinare": "Vaccinazioni",
    "Sfaturi de sezon": "Consigli di stagione",
  },
  hr: {
    "Alerte locale": "Lokalna upozorenja",
    "Caravane medicale": "Mobilne ambulante",
    "Campanii de vaccinare": "Cijepljenje",
    "Sfaturi de sezon": "Sezonski savjeti",
  },
  rom: {
    "Alerte locale": "Lokalne alerte",
    "Caravane medicale": "Mobilne klinike",
    "Campanii de vaccinare": "Vakcinaciya",
    "Sfaturi de sezon": "Sezonoske svatura",
  },
};

export const LOCALIZED_COUNTY_ALL: Record<string, string> = {
  ro: "Toate județele",
  en: "All counties",
  sq: "Të gjitha qarqet",
  it: "Tutte le province",
  hr: "Sve županije",
  rom: "Savore judetya",
};

/** The country an item is about (Romanian when not set). */
export function articleCountry(article: Pick<NewsArticle, "country">): NewsCountry {
  return article.country ?? "ro";
}

/** True for an item about a whole country: Romania, Moldova, Italy, Croatia, or Albania. */
export function isCountryWide(article: Pick<NewsArticle, "county" | "country">): boolean {
  const c = articleCountry(article);
  if (c === "it") return article.county === ITALY_WIDE;
  if (c === "md") return article.county === MOLDOVA_WIDE;
  if (c === "hr") return article.county === CROATIA_WIDE;
  if (c === "al") return article.county === ALBANIA_WIDE;
  return isNationalCounty(article.county);
}

export function isNationalCounty(county: string): boolean {
  return (
    county === "Toate județele" ||
    county === "All counties" ||
    county === "Të gjitha qarqet" ||
    county === "Tutte le province" ||
    county === "Sve županije" ||
    county === "Savore judetya"
  );
}

export type LocalizedArticleFields = {
  title: string;
  summary: string;
  content: string[];
  preventiveSteps?: string[];
  caravanLandmark?: string;
  caravanVillage?: string;
  freeServices?: string[];
  doctorSpecialty?: string;
  doctorVerifiedDate?: string;
  tags?: string[];
};

export const LOCALIZED_NEWS_DATA: Record<string, Record<string, LocalizedArticleFields>> = {
  en: {
    "alert-rujeola-iasi": {
      title: "More children with measles in Iași county",
      summary: "Iași public health office reports measles in unvaccinated children. The MMR vaccine is free at your family doctor.",
      content: [
        "In the last 2 weeks, clinics and hospitals in Iași county have seen more children with measles. Most go to nursery or school.",
        "Measles is a virus that spreads very easily. It can lead to pneumonia or swelling of the brain (encephalitis). The MMR vaccine (measles, mumps, rubella) protects safely and well, for life.",
        "Look at your child's vaccination booklet. Call your family doctor or health mediator to book a visit.",
      ],
      preventiveSteps: [
        "Ask your family doctor which vaccines your child is missing",
        "If your child has a fever and a red rash, keep them away from crowded places",
        "Call the doctor or mediator before you take them to the clinic",
      ],
      doctorSpecialty: "Senior epidemiologist, Iași Public Health Directorate",
      doctorVerifiedDate: "4 November 2026",
      tags: ["MMR vaccination", "Pediatrics", "Public health", "Prevention"],
    },
    "caravana-galati-barcea": {
      title: "Mobile clinic comes to Barcea and Ivești",
      summary: "Free check-ups, blood sugar tests and ECG in the village. You do not need a health card or insurance.",
      content: [
        "Doctors and health mediators bring the mobile clinic to the villages of Barcea and Ivești. They check you for free.",
        "Everything is free. You can come even without insurance or a family doctor. Bring your ID card or your child's birth certificate.",
      ],
      caravanLandmark: "Yard of the village hall, next to the school",
      caravanVillage: "Barcea commune",
      freeServices: [
        "Blood pressure",
        "Blood sugar test",
        "ECG",
        "Check-up for children",
      ],
      doctorSpecialty: "Family doctor, mobile clinic coordinator",
      doctorVerifiedDate: "5 November 2026",
      tags: ["Mobile clinic", "Free tests", "Community", "Healthcare access"],
    },
    "campanie-antigripala-nationala": {
      title: "Flu jabs are now given in every county",
      summary: "If you have a long-term illness, are pregnant or are over 65, the flu vaccine is 100% covered.",
      content: [
        "Flu can be serious if you have diabetes, high blood pressure, or lung or heart disease.",
        "Your family doctor gives you the 100% covered prescription. You get the jab at the doctor's office or at an approved pharmacy.",
        "If you have no family doctor, the health mediator helps you register with a doctor near you.",
      ],
      preventiveSteps: [
        "Ask your family doctor for the covered prescription",
        "Wash your hands often with soap and water, for 20 seconds",
        "Open the windows at least 3 times a day",
      ],
      doctorSpecialty: "Infectious disease specialist, Matei Balș Institute",
      doctorVerifiedDate: "28 October 2026",
      tags: ["Influenza", "Subsidized vaccine", "Chronic illness", "Seniors"],
    },
    "sfat-sezon-raceli-copii": {
      title: "Cold or flu in children: how to tell",
      summary: "A high fever that comes on suddenly, with aching muscles, usually means flu, not a cold.",
      content: [
        "A cold comes on slowly: a blocked nose, sneezing, feeling a bit unwell. Fever is low or there is none.",
        "Flu comes on suddenly, within hours: high fever (above 38.5°C), headache, aching muscles and great tiredness.",
        "Give your child plenty to drink: warm tea, water, vegetable soup. Do not give antibiotics without a prescription. Antibiotics do not kill viruses.",
      ],
      preventiveSteps: [
        "Give your child warm drinks often",
        "If your child breathes fast, take them to a doctor urgently",
        "Give fever medicine only as the doctor told you",
      ],
      doctorSpecialty: "Paediatrician",
      doctorVerifiedDate: "2 November 2026",
      tags: ["Pediatrics", "Parent guide", "Appropriate treatment", "No antibiotics"],
    },
    "alerta-hepatita-cluj": {
      title: "Villages in Cluj: boil your well water",
      summary: "After the floods, boil water from wells that the health office has not tested.",
      content: [
        "The Cluj public health office asks people in villages to drink and cook only with boiled, cooled water if it comes from a shallow well.",
        "Hepatitis A spreads through dirty water or food and unwashed hands. Washing your hands well stops it spreading.",
      ],
      preventiveSteps: [
        "Boil well water for at least 10 minutes before you drink it",
        "Wash fruit and vegetables only in safe water",
        "Wash your hands before eating and after using the toilet",
      ],
      doctorSpecialty: "Hygiene specialist, Cluj Public Health Directorate",
      doctorVerifiedDate: "30 October 2026",
      tags: ["Hygiene", "Safe water", "Hepatitis A", "Prevention"],
    },
    "caravana-stomatologica-bucuresti-ilfov": {
      title: "Free dentist for children in Bucharest and Ilfov",
      summary: "Free dental check-ups, cleaning and tooth-brushing advice for children and adults without insurance.",
      content: [
        "A dental surgery on wheels comes to the neighbourhood. Teeth are checked and cleaned for free.",
        "Children learn how to brush properly and get a fluoride gel. If a tooth hurts, they get a small treatment on the spot.",
        "It is free. You do not need insurance or a health card. Parents should bring their ID card.",
      ],
      caravanLandmark: "Car park of the community clinic, main lane",
      caravanVillage: "Sector 5 and Jilava commune",
      freeServices: [
        "Dental check-up",
        "Tartar cleaning",
        "Fluoride for children",
        "Toothbrush and toothpaste",
      ],
      doctorSpecialty: "Pediatric dentist, Health Volunteers",
      doctorVerifiedDate: "6 November 2026",
      tags: ["Dentistry", "Pediatrics", "Free prevention", "Community"],
    },
    "campanie-vaccinare-hpv-national": {
      title: "The HPV vaccine is free for girls and boys across the country",
      summary: "Children aged 11–18 can get the HPV vaccine for free. Ask your family doctor.",
      content: [
        "The HPV vaccine prevents more than 90% of cervical cancers and other changes that can turn into cancer.",
        "It is free for girls and boys up to age 18. You ask for it at your family doctor.",
        "If the clinic is far away, the health mediator helps you ask for it and book the visit.",
      ],
      preventiveSteps: [
        "Ask your family doctor for the vaccine",
        "Book both doses, on the dates the doctor gives you",
        "Talk with your child about what the vaccine protects them from",
      ],
      doctorSpecialty: "Senior obstetrician-gynecologist and public health physician",
      doctorVerifiedDate: "5 November 2026",
      tags: ["HPV vaccination", "Adolescents", "Cancer prevention", "Parent guide"],
    },
    "sfat-calitate-aer-respirator-bucuresti": {
      title: "Smog days in Bucharest: how to protect your lungs",
      summary: "Advice for people with asthma, chronic bronchitis or heart disease, on days with smog and fog.",
      content: [
        "On cold autumn and winter mornings, dirty air stays low, close to the ground, in big cities.",
        "If you have a lung condition or young children, avoid hard exercise outdoors between 07:00 and 09:30 in the morning.",
        "At home, do not smoke and do not burn rubbish in the stove. Keep the air neither too dry nor too damp.",
      ],
      preventiveSteps: [
        "Avoid hard exercise outdoors early in the morning",
        "Always keep your prescribed inhaler with you",
        "Call your doctor or mediator if a cough does not go away",
      ],
      doctorSpecialty: "Senior pulmonologist, Marius Nasta Institute",
      doctorVerifiedDate: "7 November 2026",
      tags: ["Pulmonology", "Urban pollution", "Asthma", "Practical tips"],
    },
    ...NEWS_TRANSLATIONS_EXTRA_EN,
  },
  sq: {
    "alert-rujeola-iasi": {
      title: "Më shumë fëmijë me fruth në qarkun Iași",
      summary: "Shëndeti publik në Iași njofton raste fruthi te fëmijë të pavaksinuar. Vaksina MMR është falas te mjeku i familjes.",
      content: [
        "Në 2 javët e fundit, klinikat dhe spitalet në qarkun Iași kanë parë më shumë fëmijë me fruth. Shumica shkojnë në kopsht ose në shkollë.",
        "Fruthi është një virus që ngjitet shumë lehtë. Mund të sjellë pneumoni ose ënjtje të trurit (encefalit). Vaksina MMR (fruth, shyta, rubeolë) mbron në mënyrë të sigurt dhe të mirë, për gjithë jetën.",
        "Shiko librezën e vaksinave të fëmijës. Telefono mjekun e familjes ose mediatorin shëndetësor që të caktosh një vizitë.",
      ],
      preventiveSteps: [
        "Pyet mjekun e familjes cilat vaksina i mungojnë fëmijës",
        "Nëse fëmija ka temperaturë dhe puçrra të kuqe, mbaje larg vendeve me shumë njerëz",
        "Telefono mjekun ose mediatorin para se ta çosh në klinikë",
      ],
      doctorSpecialty: "Epidemiologe kryesore, Drejtoria e Shëndetit Publik Iași",
      doctorVerifiedDate: "4 nëntor 2026",
      tags: ["Vaksinimi MMR", "Pediatri", "Shëndet publik", "Parandalim"],
    },
    "caravana-galati-barcea": {
      title: "Karvani mjekësor vjen në Barcea dhe Ivești",
      summary: "Vizita falas, test i sheqerit në gjak dhe EKG në fshat. Nuk të duhet kartë shëndetësore apo sigurim.",
      content: [
        "Mjekë dhe mediatorë shëndetësorë vijnë me karvanin në fshatrat Barcea dhe Ivești. Të vizitojnë falas.",
        "Gjithçka është falas. Mund të vish edhe pa sigurim apo pa mjek familjeje. Merr me vete letërnjoftimin ose certifikatën e lindjes së fëmijës.",
      ],
      caravanLandmark: "Në oborrin e shtëpisë së kulturës, pranë shkollës",
      caravanVillage: "Komuna Barcea",
      freeServices: [
        "Tensioni",
        "Sheqeri në gjak",
        "EKG",
        "Vizitë për fëmijë",
      ],
      doctorSpecialty: "Mjek familjeje, koordinator i karvanit",
      doctorVerifiedDate: "5 nëntor 2026",
      tags: ["Karvan mjekësor", "Analiza falas", "Komunitet", "Akses mjekësor"],
    },
    "campanie-antigripala-nationala": {
      title: "Vaksina e gripit bëhet tani në çdo qark",
      summary: "Nëse ke një sëmundje kronike, je shtatzënë ose ke mbi 65 vjeç, vaksina e gripit paguhet 100%.",
      content: [
        "Gripi mund të jetë i rëndë nëse ke diabet, tension të lartë ose sëmundje të mushkërive a të zemrës.",
        "Mjeku i familjes të jep recetën e paguar 100%. Vaksinohesh te mjeku ose në një farmaci të autorizuar.",
        "Nëse nuk ke mjek familjeje, mediatori shëndetësor të ndihmon të regjistrohesh te një mjek afër teje.",
      ],
      preventiveSteps: [
        "Kërkoji mjekut të familjes recetën e paguar",
        "Laji duart shpesh me ujë dhe sapun, 20 sekonda",
        "Hap dritaret të paktën 3 herë në ditë",
      ],
      doctorSpecialty: "Specialiste e sëmundjeve infektive, Instituti Matei Balș",
      doctorVerifiedDate: "28 tetor 2026",
      tags: ["Grip", "Vaksinim i rimbursuar", "Sëmundje kronike", "Të moshuar"],
    },
    "sfat-sezon-raceli-copii": {
      title: "Ftohje apo grip te fëmijët: si t'i dallosh",
      summary: "Temperatura e lartë që vjen papritur dhe dhimbjet e muskujve zakonisht tregojnë grip, jo ftohje.",
      content: [
        "Ftohja vjen ngadalë: hunda zihet, fëmija teshtin dhe është pak i lodhur. Temperatura është e ulët ose nuk ka fare.",
        "Gripi vjen papritur, brenda pak orësh: temperaturë e lartë (mbi 38,5°C), dhimbje koke, dhimbje muskujsh dhe lodhje e madhe.",
        "Jepi fëmijës shumë për të pirë: çaj të ngrohtë, ujë, supë perimesh. Mos i jep antibiotikë pa recetë. Antibiotikët nuk vrasin viruset.",
      ],
      preventiveSteps: [
        "Jepi fëmijës shpesh pije të ngrohta",
        "Nëse merr frymë shpejt, çoje urgjent te mjeku",
        "Jepi ilaç për temperaturën vetëm si të ka thënë mjeku",
      ],
      doctorSpecialty: "Mjek pediatër",
      doctorVerifiedDate: "2 nëntor 2026",
      tags: ["Pediatri", "Udhëzues prindëror", "Trajtim i duhur", "Pa antibiotikë"],
    },
    "alerta-hepatita-cluj": {
      title: "Fshatrat e Cluj: zieje ujin e pusit",
      summary: "Pas përmbytjeve, zieje ujin e puseve që nuk i ka kontrolluar shëndeti publik.",
      content: [
        "Shëndeti publik në Cluj u kërkon banorëve të fshatrave të pinë dhe të gatuajnë vetëm me ujë të zier dhe të ftohur, nëse uji vjen nga një pus i cekët.",
        "Hepatiti A merret nga uji ose ushqimi i ndotur dhe nga duart e palara. Kur i lan mirë duart, sëmundja nuk përhapet.",
      ],
      preventiveSteps: [
        "Zieje ujin e pusit të paktën 10 minuta para se ta pish",
        "Laji frutat dhe perimet vetëm me ujë të sigurt",
        "Laji duart para se të hash dhe pas tualetit",
      ],
      doctorSpecialty: "Mjeke higjeniste, Drejtoria e Shëndetit Publik Cluj",
      doctorVerifiedDate: "30 tetor 2026",
      tags: ["Higjienë", "Ujë i pijshëm", "Hepatiti A", "Parandalim"],
    },
    "caravana-stomatologica-bucuresti-ilfov": {
      title: "Dentist falas për fëmijë në Bukuresht dhe Ilfov",
      summary: "Kontroll i dhëmbëve, pastrim dhe këshilla për larjen e dhëmbëve, falas, për fëmijë dhe të rritur pa sigurim.",
      content: [
        "Një klinikë dentare me rrota vjen në lagje. Dhëmbët kontrollohen dhe pastrohen falas.",
        "Fëmijët mësojnë si t'i lajnë mirë dhëmbët dhe marrin një xhel me fluor. Nëse u dhemb një dhëmb, marrin një trajtim të vogël aty për aty.",
        "Është falas. Nuk të duhet sigurim apo kartë shëndetësore. Prindërit të vijnë me letërnjoftim.",
      ],
      caravanLandmark: "Parkingu i qendrës shëndetësore të komunitetit, rruga kryesore",
      caravanVillage: "Sektori 5 dhe Komuna Jilava",
      freeServices: [
        "Kontroll i dhëmbëve",
        "Pastrim i gurëzave",
        "Fluor për fëmijë",
        "Furçë dhe pastë dhëmbësh",
      ],
      doctorSpecialty: "Dentist pediatrik, Vullnetarët për Shëndetin",
      doctorVerifiedDate: "6 nëntor 2026",
      tags: ["Stomatologji", "Pediatri", "Parandalim falas", "Komunitet"],
    },
    "campanie-vaccinare-hpv-national": {
      title: "Vaksina HPV është falas për vajza dhe djem në gjithë vendin",
      summary: "Fëmijët 11–18 vjeç mund ta bëjnë falas vaksinën HPV. Kërkoje te mjeku i familjes.",
      content: [
        "Vaksina HPV parandalon më shumë se 90% të kancereve të qafës së mitrës dhe ndryshime të tjera që mund të bëhen kancer.",
        "Është falas për vajzat dhe djemtë deri në 18 vjeç. E kërkon te mjeku i familjes.",
        "Nëse klinika është larg, mediatori shëndetësor të ndihmon ta kërkosh dhe të caktosh vizitën.",
      ],
      preventiveSteps: [
        "Kërkoja vaksinën mjekut të familjes",
        "Cakto të dyja dozat, në datat që të jep mjeku",
        "Fol me fëmijën se nga çfarë e mbron vaksina",
      ],
      doctorSpecialty: "Mjeke kryesore obstetër-gjinekologe dhe shëndet publik",
      doctorVerifiedDate: "5 nëntor 2026",
      tags: ["Vaksinimi HPV", "Adoleshentë", "Parandalimi i kancerit", "Udhëzues prindëror"],
    },
    "sfat-calitate-aer-respirator-bucuresti": {
      title: "Ditë me smog në Bukuresht: si t'i mbrosh mushkëritë",
      summary: "Këshilla për ata që kanë astmë, bronkit kronik ose sëmundje zemre, në ditët me smog dhe mjegull.",
      content: [
        "Në mëngjeset e ftohta të vjeshtës dhe dimrit, ajri i ndotur qëndron poshtë, afër tokës, në qytetet e mëdha.",
        "Nëse ke sëmundje të mushkërive ose fëmijë të vegjël, mos bëj lodhje të madhe jashtë nga ora 07:00 deri në 09:30 të mëngjesit.",
        "Në shtëpi mos pi duhan dhe mos digj plehra në sobë. Mbaje ajrin as shumë të thatë, as shumë të lagësht.",
      ],
      preventiveSteps: [
        "Mos bëj lodhje të madhe jashtë herët në mëngjes",
        "Mbaje gjithmonë me vete inhalatorin nga mjeku",
        "Telefono mjekun ose mediatorin nëse kolla nuk të kalon",
      ],
      doctorSpecialty: "Pneumolog kryesor, Instituti Marius Nasta",
      doctorVerifiedDate: "7 nëntor 2026",
      tags: ["Pneumologji", "Ndotje urbane", "Astmë", "Këshilla praktike"],
    },
    ...NEWS_TRANSLATIONS_EXTRA_SQ,
  },
  it: {
    "alert-rujeola-iasi": {
      title: "Più bambini con il morbillo nella provincia di Iași",
      summary: "La sanità pubblica di Iași segnala casi di morbillo in bambini non vaccinati. Il vaccino MPR è gratis dal medico di famiglia.",
      content: [
        "Nelle ultime 2 settimane, ambulatori e ospedali della provincia di Iași hanno visto più bambini con il morbillo. Quasi tutti vanno all'asilo o a scuola.",
        "Il morbillo è un virus che si prende molto facilmente. Può portare alla polmonite o a un'infiammazione del cervello (encefalite). Il vaccino MPR (morbillo, parotite, rosolia) protegge in modo sicuro ed efficace, per tutta la vita.",
        "Guarda il libretto delle vaccinazioni di tuo figlio. Chiama il medico di famiglia o il mediatore sanitario per prendere un appuntamento.",
      ],
      preventiveSteps: [
        "Chiedi al medico di famiglia quali vaccini mancano a tuo figlio",
        "Se tuo figlio ha febbre e macchie rosse sulla pelle, tienilo lontano dai posti affollati",
        "Chiama il medico o il mediatore prima di portarlo in ambulatorio",
      ],
      doctorSpecialty: "Medico epidemiologo primario, Direzione di Sanità Pubblica Iași",
      doctorVerifiedDate: "4 novembre 2026",
      tags: ["Vaccinazione MPR", "Pediatria", "Sanità pubblica", "Prevenzione"],
    },
    "caravana-galati-barcea": {
      title: "L'ambulatorio mobile arriva a Barcea e Ivești",
      summary: "Visite gratis, test dello zucchero nel sangue ed ECG in paese. Non servono tessera sanitaria o assicurazione.",
      content: [
        "Medici e mediatori sanitari portano l'ambulatorio mobile nei paesi di Barcea e Ivești. Ti visitano gratis.",
        "È tutto gratis. Puoi venire anche senza assicurazione o medico di famiglia. Porta la carta d'identità o il certificato di nascita del bambino.",
      ],
      caravanLandmark: "Nel cortile del centro culturale, vicino alla scuola",
      caravanVillage: "Comune di Barcea",
      freeServices: [
        "Pressione",
        "Zucchero nel sangue",
        "ECG",
        "Visita per bambini",
      ],
      doctorSpecialty: "Medico di famiglia, coordinatore dell'ambulatorio mobile",
      doctorVerifiedDate: "5 novembre 2026",
      tags: ["Carovana medica", "Esami gratuiti", "Comunità", "Accesso alle cure"],
    },
    "campanie-antigripala-nationala": {
      title: "Il vaccino antinfluenzale si fa ora in tutte le province",
      summary: "Se hai una malattia cronica, sei incinta o hai più di 65 anni, il vaccino antinfluenzale è rimborsato al 100%.",
      content: [
        "L'influenza può essere grave se hai diabete, pressione alta o malattie dei polmoni o del cuore.",
        "Il medico di famiglia ti fa la ricetta rimborsata al 100%. Ti vaccini in ambulatorio o in una farmacia autorizzata.",
        "Se non hai un medico di famiglia, il mediatore sanitario ti aiuta a iscriverti da un medico della zona.",
      ],
      preventiveSteps: [
        "Chiedi la ricetta rimborsata al medico di famiglia",
        "Lavati spesso le mani con acqua e sapone, per 20 secondi",
        "Apri le finestre almeno 3 volte al giorno",
      ],
      doctorSpecialty: "Specialista in malattie infettive, Istituto Matei Balș",
      doctorVerifiedDate: "28 ottobre 2026",
      tags: ["Influenza", "Vaccino rimborsato", "Malattie croniche", "Anziani"],
    },
    "sfat-sezon-raceli-copii": {
      title: "Raffreddore o influenza nei bambini: come capirlo",
      summary: "La febbre alta che arriva all'improvviso, con dolori ai muscoli, di solito è influenza, non raffreddore.",
      content: [
        "Il raffreddore arriva piano: naso chiuso, starnuti, un po' di malessere. La febbre è bassa o non c'è.",
        "L'influenza arriva all'improvviso, in poche ore: febbre alta (sopra 38,5°C), mal di testa, dolori ai muscoli e grande stanchezza.",
        "Fai bere molto il bambino: tè tiepido, acqua, brodo di verdure. Non dargli antibiotici senza ricetta. Gli antibiotici non uccidono i virus.",
      ],
      preventiveSteps: [
        "Dai spesso al bambino bevande tiepide",
        "Se respira veloce, portalo subito dal medico",
        "Dagli medicine per la febbre solo come ti ha detto il medico",
      ],
      doctorSpecialty: "Pediatra",
      doctorVerifiedDate: "2 novembre 2026",
      tags: ["Pediatria", "Guida per genitori", "Terapia corretta", "Senza antibiotici"],
    },
    "alerta-hepatita-cluj": {
      title: "Paesi intorno a Cluj: fai bollire l'acqua del pozzo",
      summary: "Dopo le alluvioni, fai bollire l'acqua dei pozzi non controllati dalla sanità pubblica.",
      content: [
        "La sanità pubblica di Cluj chiede a chi vive nei paesi di bere e cucinare solo con acqua bollita e raffreddata, se viene da un pozzo poco profondo.",
        "L'epatite A si prende da acqua o cibo sporchi e da mani non lavate. Se ti lavi bene le mani, la malattia non si diffonde.",
      ],
      preventiveSteps: [
        "Fai bollire l'acqua del pozzo almeno 10 minuti prima di berla",
        "Lava frutta e verdura solo con acqua sicura",
        "Lavati le mani prima di mangiare e dopo il bagno",
      ],
      doctorSpecialty: "Medico igienista, Direzione di Sanità Pubblica Cluj",
      doctorVerifiedDate: "30 ottobre 2026",
      tags: ["Igiene", "Acqua potabile", "Epatite A", "Prevenzione"],
    },
    "caravana-stomatologica-bucuresti-ilfov": {
      title: "Dentista gratis per bambini a Bucarest e Ilfov",
      summary: "Controllo dei denti, pulizia e consigli per lavarli bene, gratis, per bambini e adulti senza assicurazione.",
      content: [
        "Uno studio dentistico su ruote arriva nel quartiere. I denti si controllano e si puliscono gratis.",
        "I bambini imparano a lavarsi bene i denti e ricevono un gel al fluoro. Se hanno mal di denti, ricevono una piccola cura sul posto.",
        "È gratis. Non servono assicurazione o tessera sanitaria. I genitori portano un documento d'identità.",
      ],
      caravanLandmark: "Parcheggio del consultorio comunitario, viale principale",
      caravanVillage: "Settore 5 e Comune di Jilava",
      freeServices: [
        "Controllo dei denti",
        "Pulizia del tartaro",
        "Fluoro per bambini",
        "Spazzolino e dentifricio",
      ],
      doctorSpecialty: "Dentista pediatrico, Volontari per la Salute",
      doctorVerifiedDate: "6 novembre 2026",
      tags: ["Odontoiatria", "Pediatria", "Prevenzione gratuita", "Comunità"],
    },
    "campanie-vaccinare-hpv-national": {
      title: "Il vaccino HPV è gratis per ragazze e ragazzi in tutto il paese",
      summary: "I ragazzi dagli 11 ai 18 anni possono fare gratis il vaccino HPV. Chiedilo al medico di famiglia.",
      content: [
        "Il vaccino HPV previene oltre il 90% dei tumori del collo dell'utero e altre lesioni che possono diventare tumori.",
        "È gratis per ragazze e ragazzi fino a 18 anni. Lo chiedi al medico di famiglia.",
        "Se l'ambulatorio è lontano, il mediatore sanitario ti aiuta a fare la richiesta e a prenotare.",
      ],
      preventiveSteps: [
        "Chiedi il vaccino al medico di famiglia",
        "Prenota tutte e due le dosi, nelle date che ti dà il medico",
        "Parla con tuo figlio di cosa lo protegge il vaccino",
      ],
      doctorSpecialty: "Medico primario in ostetricia-ginecologia e salute pubblica",
      doctorVerifiedDate: "5 novembre 2026",
      tags: ["Vaccinazione HPV", "Adolescenti", "Prevenzione tumori", "Guida per genitori"],
    },
    "sfat-calitate-aer-respirator-bucuresti": {
      title: "Giorni di smog a Bucarest: come proteggere i polmoni",
      summary: "Consigli per chi ha asma, bronchite cronica o malattie di cuore, nei giorni di smog e nebbia.",
      content: [
        "Nelle mattine fredde d'autunno e d'inverno, l'aria sporca resta in basso, vicino a terra, nelle grandi città.",
        "Se hai una malattia dei polmoni o bambini piccoli, evita sforzi forti all'aperto tra le 07:00 e le 09:30 del mattino.",
        "In casa non fumare e non bruciare rifiuti nella stufa. Tieni l'aria né troppo secca né troppo umida.",
      ],
      preventiveSteps: [
        "Evita sforzi forti all'aperto la mattina presto",
        "Tieni sempre con te l'inalatore che ti ha dato il medico",
        "Chiama il medico o il mediatore se la tosse non passa",
      ],
      doctorSpecialty: "Pneumologo primario, Istituto Marius Nasta",
      doctorVerifiedDate: "7 novembre 2026",
      tags: ["Pneumologia", "Inquinamento urbano", "Asma", "Consigli pratici"],
    },
    ...NEWS_TRANSLATIONS_EXTRA_IT,
  },
  hr: NEWS_TRANSLATIONS_HR,
  rom: NEWS_TRANSLATIONS_ROM,
};

export function getLocalizedArticle(article: NewsArticle, lang: string = "ro"): NewsArticle {
  const isNational = isNationalCounty(article.county);
  const localizedCounty = isNational
    ? (LOCALIZED_COUNTY_ALL[lang] ?? "All counties")
    : article.county;

  const categoryLabel = NEWS_CATEGORY_LABELS[lang]?.[article.category] ?? article.category;

  if (lang === "ro") {
    return {
      ...article,
      categoryLabel,
      county: localizedCounty,
    };
  }

  const loc = LOCALIZED_NEWS_DATA[lang]?.[article.id];
  if (!loc) {
    return {
      ...article,
      categoryLabel,
      county: localizedCounty,
    };
  }

  return {
    ...article,
    categoryLabel,
    title: loc.title ?? article.title,
    summary: loc.summary ?? article.summary,
    content: loc.content ?? article.content,
    county: localizedCounty,
    tags: loc.tags ?? article.tags,
    preventiveSteps: loc.preventiveSteps ?? article.preventiveSteps,
    verifiedDoctor: {
      ...article.verifiedDoctor,
      specialty: loc.doctorSpecialty ?? article.verifiedDoctor.specialty,
      verifiedDate: loc.doctorVerifiedDate ?? article.verifiedDoctor.verifiedDate,
    },
    caravanDetails: article.caravanDetails
      ? {
          ...article.caravanDetails,
          village: loc.caravanVillage ?? article.caravanDetails.village,
          landmark: loc.caravanLandmark ?? article.caravanDetails.landmark,
          freeServices: loc.freeServices ?? article.caravanDetails.freeServices,
        }
      : undefined,
  };
}
