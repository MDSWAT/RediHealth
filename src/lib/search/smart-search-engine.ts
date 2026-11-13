import { healthArticleIndex, healthArticlePath } from "@/lib/data/health-article-index";
import { getHealthSummary } from "@/lib/data/health-summaries";
import {
  healthSummaryPath,
  informedHealthAreas,
} from "@/lib/data/informedhealth-directory";
import { NEWS_ARTICLES, getLocalizedArticle } from "@/lib/data/news";
import { classifyLocalIntent } from "@/components/health-assistant/intent-keywords";
import { urgentPattern } from "@/lib/health-assistant";
import {
  getHealthMyths,
} from "@/lib/i18n/health-myths";
import {
  getHealthTopicBySlug,
  getHealthTopicsList,
} from "@/lib/i18n/health-information-topics";
import { ROMANES_GLOSSARY_TERMS } from "@/lib/i18n/romanes-glossary";
import {
  DUAL_REGISTER_GLOSSARY_UI_COPY,
  ROMANIAN_MEDICAL_GLOSSARY,
  getLocalizedGlossaryEntry,
} from "@/lib/i18n/romanian-medical-glossary";
import { stripLangFromPathname, withLangPrefix } from "@/lib/i18n/routing";
import {
  SMART_SEARCH_SYNONYMS,
  SMART_SEARCH_TOOLS,
  getSmartSearchCopy,
  type Lang,
  type SmartSearchCategory,
  type SmartSearchSynonymGroup,
} from "@/lib/i18n/smart-search-copy";
import { classifyIntentToPathway, type PathwayId } from "@/lib/triage-state";

export type SmartSearchReadingLevel = "standard" | "simple";
export type SmartSearchItemKind = Exclude<SmartSearchCategory, "all">;

export interface SmartSearchResult {
  id: string;
  kind: SmartSearchItemKind;
  kindLabel: string;
  title: string;
  summary: string;
  href: string;
  highlights: string;
  nextSteps: string[];
  tags: string[];
  score: number;
  matchedQuery: string;
}

export interface SmartSearchOptions {
  lang: Lang;
  category?: SmartSearchCategory;
  readingLevel?: SmartSearchReadingLevel;
  pathname?: string;
  limit?: number;
}

export interface SmartSearchGuidedOverview {
  lead: string;
  steps: string[];
  primaryAction: { label: string; href: string };
}

export interface SmartSearchRelatedQuestion {
  id: string;
  question: string;
  answer: string;
  href?: string;
  linkLabel?: string;
}

export interface SmartSearchResponse {
  results: SmartSearchResult[];
  groupedCounts: Record<SmartSearchCategory, number>;
  didYouMean: string | null;
  ghostCompletion: string | null;
  isEmergency: boolean;
  suggestedFollowups: string[];
  intentSummary: string | null;
  guidedOverview: SmartSearchGuidedOverview | null;
  relatedQuestions: SmartSearchRelatedQuestion[];
}

export interface ContextualSuggestionBundle {
  contextLabel: string;
  chips: { label: string; query: string }[];
  topResults: SmartSearchResult[];
}

type RouteContextKey =
  | "home"
  | "healthInfo"
  | "glossary"
  | "myths"
  | "findCare"
  | "healthAssistant"
  | "news"
  | "defaultContext";

interface CatalogEntry {
  id: string;
  kind: SmartSearchItemKind;
  title: string;
  summary: string;
  simpleSummary: string;
  href: string;
  nextSteps: string[];
  qaPairs: { question: string; answer: string }[];
  tags: string[];
  priorityBoost: number;
  normTitle: string;
  normKeywords: string;
  normBody: string;
  titleTokens: string[];
  keywordTokens: string[];
  bodyTokens: string[];
  routeHints: RouteContextKey[];
  pathwayHints: PathwayId[];
}

interface CatalogIndex {
  entries: CatalogEntry[];
  entryMap: Map<string, CatalogEntry>;
  vocabulary: string[];
  completionCandidates: string[];
}

const CONJUNCTION_BY_LANG: Record<Lang, string> = {
  ro: "și",
  en: "and",
  sq: "dhe",
  it: "e",
  hr: "i",
  rom: "thaj",
  ru: "и",
};

const INTENT_SUMMARY_BY_LANG: Record<Lang, Record<PathwayId, string>> = {
  ro: {
    symptoms: "Am ordonat mai întâi evaluarea simptomelor și ghidurile pentru semne de alarmă.",
    prescription: "Am prioritizat instrumentul pentru rețete și explicațiile medicamentelor.",
    navigation: "Am adus în față harta serviciilor, mediatorii sanitari și ghidul de drepturi.",
    risk: "Am evidențiat ghidurile de prevenție și controalele regulate de sănătate.",
    learn: "Am selectat cele mai relevante ghiduri, explicații și articole din bibliotecă.",
  },
  en: {
    symptoms: "Symptom assessment tools and warning-sign guides are ranked first.",
    prescription: "Prescription explanation tools and medicine glossary entries are prioritized.",
    navigation: "Nearby care maps, health mediators, and access guides are ranked first.",
    risk: "Preventive screening and long-term health guides are highlighted first.",
    learn: "Matching plain-language guides, glossary terms, and articles are shown below.",
  },
  sq: {
    symptoms: "Mjetet e vlerësimit të simptomave dhe udhëzuesit e shenjave paralajmëruese janë të parat.",
    prescription: "Ndihmësi për recetat dhe termat e barnave janë renditur të parat.",
    navigation: "Harta e shërbimeve, mediatorët shëndetësorë dhe udhëzuesit për dokumentet janë në krye.",
    risk: "Udhëzuesit e parandalimit dhe kontrolleve periodike janë të theksuar të parët.",
    learn: "Udhëzuesit, fjalori dhe artikujt më të përshtatshëm shfaqen më poshtë.",
  },
  it: {
    symptoms: "Gli strumenti di valutazione dei sintomi e le guide sui segnali d'allarme sono in cima.",
    prescription: "L'aiuto per le ricette e le voci sui farmaci hanno la priorità.",
    navigation: "La mappa dei servizi vicini, i mediatori sanitari e le guide sui diritti sono in primo piano.",
    risk: "Le guide sulla prevenzione e sui controlli periodici sono evidenziate per prime.",
    learn: "Guide chiare, termini del dizionario e articoli pertinenti sono raccolti qui sotto.",
  },
  hr: {
    symptoms: "Alati za procjenu simptoma i vodiči za znakove upozorenja postavljeni su na vrh.",
    prescription: "Pomoć za čitanje recepata i objašnjenja lijekova imaju prednost.",
    navigation: "Karta ustanova u blizini, zdravstveni medijatori i vodič za prava su na prvom mjestu.",
    risk: "Vodiči za prevenciju i redovite preglede istaknuti su na vrhu.",
    learn: "Najkorisniji vodiči, pojmovi iz rječnika i članci prikazani su u nastavku.",
  },
  rom: {
    symptoms: "E shere vash simptomengo dikhiben thaj e sikavimata vash daravne semnurya si anglal.",
    prescription: "O zhutimos vash e recete thaj e draba si anglal thodine.",
    navigation: "I mapa e doktoronge, e sastipnaske mediatorya thaj e chachimata si anglal.",
    risk: "E sikavimata vash arakhipen thaj kontrolurya si anglal sikavde.",
    learn: "E maj lache sikavimata, vorbi thaj artikolya si telal sikavde.",
  },
  ru: {
    symptoms: "Инструменты оценки симптомов и памятки по тревожным признакам показаны первыми.",
    prescription: "Разбор рецептов и объяснения лекарственных терминов вынесены в начало списка.",
    navigation: "Карта аптек и клиник, медиаторы и гид по страховке показаны первыми.",
    risk: "Руководства по профилактике и регулярным обследованиям выделены в начале.",
    learn: "Ниже собраны подходящие руководства, термины словаря и статьи.",
  },
};

const TOOL_CAPABILITY_STEPS_BY_LANG: Record<string, Record<Lang, [string, string]>> = {
  "health-assistant": {
    ro: [
      "Spune ce simptome ai, de când au apărut și ce vârstă are persoana.",
      "Încarcă o poză clară a rețetei sau analizelor pentru explicații simple.",
    ],
    en: [
      "Describe your symptoms, when they started, and the person's age.",
      "Upload a photo of a prescription or lab result for a plain-language explanation.",
    ],
    sq: [
      "Përshkruaj simptomat, kur kanë filluar dhe moshën e personit.",
      "Ngarko një foto të recetës ose analizave për shpjegim të thjeshtë.",
    ],
    it: [
      "Descrivi i sintomi, da quando sono iniziati e l'età della persona.",
      "Carica una foto della ricetta o delle analisi per una spiegazione semplice.",
    ],
    hr: [
      "Opiši simptome, kada su počeli i dob osobe.",
      "Učitaj fotografiju recepta ili nalaza za jednostavno objašnjenje.",
    ],
    rom: [
      "Phen save simptomură si tut, kana śudinde thaj sode berśengo si o manush.",
      "Bićhal jekh poza palal receta vaj analize te haćares len.",
    ],
    ru: [
      "Опишите симптомы, когда они начались и возраст человека.",
      "Загрузите фото рецепта или анализов для объяснения простым языком.",
    ],
  },
  "health-check": {
    ro: [
      "Selectează zona corpului unde simți durere sau disconfort.",
      "Parcurge semnele de alarmă și recomandarea de mers la medic sau urgențe.",
    ],
    en: [
      "Tap the body area where you feel pain or discomfort.",
      "Review warning signs and when to see a doctor or seek urgent care.",
    ],
    sq: [
      "Zgjidh zonën e trupit ku ndjen dhimbje ose shqetësim.",
      "Shiko shenjat e alarmit dhe kur duhet të shkosh te mjeku apo në urgjencë.",
    ],
    it: [
      "Tocca la parte del corpo in cui avverti dolore o fastidio.",
      "Controlla i segnali di allarme e quando rivolgerti al medico.",
    ],
    hr: [
      "Odaberi dio tijela na kojem osjećaš bol ili nelagodu.",
      "Pregledaj znakove upozorenja i kada posjetiti liječnika ili hitnu.",
    ],
    rom: [
      "Alosar o than pe trupo kaj dukhal tut vaj si tut pharipe.",
      "Dikh e semnură kaj sikaven perilko thaj kana te džas ke doktoro.",
    ],
    ru: [
      "Выберите на схеме тела область, где вы чувствуете боль или дискомфорт.",
      "Проверьте тревожные признаки и поймите, когда нужно обратиться к врачу.",
    ],
  },
  "find-help": {
    ro: [
      "Filtrează după farmacii de gardă, medici de familie sau spitale.",
      "Verifică programul, adresa exactă și traseul către cel mai apropiat centru.",
    ],
    en: [
      "Filter by open pharmacies, family doctors, clinics, or emergency rooms.",
      "Check opening hours, street address, and directions to the nearest location.",
    ],
    sq: [
      "Filtro sipas farmacive të hapura, mjekëve të familjes ose spitaleve.",
      "Kontrollo orarin, adresën e saktë dhe drejtimin deri te qendra më e afërt.",
    ],
    it: [
      "Filtra per farmacie aperte, medici di famiglia, cliniche o pronto soccorso.",
      "Controlla orari, indirizzo e indicazioni per raggiungere la sede più vicina.",
    ],
    hr: [
      "Filtriraj otvorene ljekarne, obiteljske liječnike, klinike ili hitne ambulante.",
      "Provjeri radno vrijeme, adresu i upute do najbliže ustanove.",
    ],
    rom: [
      "Alosar farmacie puterde, doktorea familiake vaj spitale.",
      "Dikh o programo, e adresa thaj o drom dži ko najpaśutno than.",
    ],
    ru: [
      "Отфильтруйте дежурные аптеки, семейных врачей или приёмные отделения.",
      "Проверьте часы работы, адрес и маршрут до ближайшего пункта.",
    ],
  },
  "prescription-review": {
    ro: [
      "Fotografiază rețeta sau scrie numele medicamentelor prescrise.",
      "Vezi pe scurt rolul fiecărui medicament și întrebările utile pentru farmacist.",
    ],
    en: [
      "Take a photo of your prescription or type the medicine names.",
      "See what each medicine is for and key questions to ask your pharmacist.",
    ],
    sq: [
      "Fotografo recetën ose shkruaj emrat e barnave të përshkruara.",
      "Shiko shkurt rolin e çdo ilaçi dhe pyetjet kryesore për farmacistin.",
    ],
    it: [
      "Fotografa la ricetta o scrivi i nomi dei farmaci prescritti.",
      "Scopri a cosa serve ogni medicinale e cosa chiedere in farmacia.",
    ],
    hr: [
      "Fotografiraj recept ili upiši nazive propisanih lijekova.",
      "Saznaj čemu služi pojedini lijek i što pitati ljekarnika.",
    ],
    rom: [
      "Ker jekh poza palal receta vaj ramosar e lava drabenqe.",
      "Dikh sostar si svaresavo drab thaj so te phuśes e farmacistos.",
    ],
    ru: [
      "Сфотографируйте рецепт или введите названия назначенных лекарств.",
      "Узнайте назначение каждого препарата и что уточнить у фармацевта.",
    ],
  },
  "medic-online": {
    ro: [
      "Verifică intervalele disponibile pentru discuții medicale la distanță.",
      "Pregătește lista de simptome și medicamentele pe care le iei deja.",
    ],
    en: [
      "Check available slots for a remote consultation with a clinician.",
      "Note your current symptoms and existing medicines before joining.",
    ],
    sq: [
      "Kontrollo oraret e lira për një konsultë mjekësore në distancë.",
      "Shëno simptomat aktuale dhe barnat që merr para bisedës.",
    ],
    it: [
      "Controlla le fasce orarie disponibili per un consulto medico a distanza.",
      "Prepara l'elenco dei sintomi attuali e dei farmaci che stai assumendo.",
    ],
    hr: [
      "Provjeri slobodne termine za savjetovanje s liječnikom na daljinu.",
      "Pripremi popis trenutnih simptoma i lijekova koje već uzimaš.",
    ],
    rom: [
      "Dikh e čhasură puterde te des duma dur e doktoreasa.",
      "Lel sama te skriis save simptomură thaj drab les akana.",
    ],
    ru: [
      "Проверьте доступное время для удалённой консультации с врачом.",
      "Подготовьте список текущих симптомов и принимаемых лекарств.",
    ],
  },
  mediatori: {
    ro: [
      "Caută mediatorul sanitar activ din județul sau localitatea ta.",
      "Cere sprijin pentru acte medicale, programări și relația cu medicul de familie.",
    ],
    en: [
      "Find an active health mediator serving your county or town.",
      "Get practical help with medical paperwork, appointments, and family doctor visits.",
    ],
    sq: [
      "Gjej mediatorin shëndetësor aktiv në qarkun ose qytetin tënd.",
      "Kërko ndihmë praktike për dokumente, takime dhe regjistrimin te mjeku.",
    ],
    it: [
      "Trova il mediatore sanitario attivo nella tua zona o provincia.",
      "Chiedi aiuto pratico per tessera sanitaria, prenotazioni e visite mediche.",
    ],
    hr: [
      "Pronađi aktivnog zdravstvenog medijatora za svoju županiju ili grad.",
      "Zatraži pomoć oko dokumentacije, naručivanja i odlaska obiteljskom liječniku.",
    ],
    rom: [
      "Arakh e mediatoros sastimasko kaj kerel buti ando tiro than.",
      "Mang ažutipe vaš kartela, programări thaj e duma e doktoreasa.",
    ],
    ru: [
      "Найдите медицинского медиатора, работающего в вашем районе.",
      "Получите помощь с оформлением документов и записью к врачу.",
    ],
  },
  "get-help": {
    ro: [
      "Verifică pachetul minimal gratuit accesibil chiar fără card CNAS.",
      "Află actele necesare pentru înscrierea la medicul de familie sau la urgențe.",
    ],
    en: [
      "Check the free minimum care package available even without insurance.",
      "See what identity documents you need to register with a family doctor or visit urgent care.",
    ],
    sq: [
      "Kontrollo paketën bazë falas të shërbimeve edhe pa kartë sigurimi.",
      "Mëso dokumentet e nevojshme për regjistrim te mjeku i familjes ose në urgjencë.",
    ],
    it: [
      "Verifica le cure essenziali gratuite accessibili anche senza tessera.",
      "Scopri i documenti utili per iscriverti al medico di base o andare in pronto soccorso.",
    ],
    hr: [
      "Provjeri osnovne besplatne zdravstvene usluge dostupne i bez osiguranja.",
      "Saznaj koji su dokumenti potrebni za prijavu liječniku ili odlazak na hitnu.",
    ],
    rom: [
      "Dikh save śerviśură bi pokinimasko si tut vi bi kartelako CNAS.",
      "Arakh save lila trubul te des te skriis tut ke doktoro familiako.",
    ],
    ru: [
      "Проверьте минимальный пакет бесплатной помощи без полиса и карты CNAS.",
      "Узнайте, какие документы нужны для записи к семейному врачу.",
    ],
  },
  "health-information": {
    ro: [
      "Răsfoiește ghidurile ilustrate pe teme de familie și prevenție.",
      "Folosește dicționarul medical și quizurile de mituri și fapte.",
    ],
    en: [
      "Browse plain-language guides covering family care and prevention.",
      "Explore the bilingual medical glossary and health myth checks.",
    ],
    sq: [
      "Shfleto udhëzuesit me gjuhë të thjeshtë për shëndetin e familjes dhe parandalimin.",
      "Eksploro fjalorin mjekësor dhe kontrollin e miteve shëndetësore.",
    ],
    it: [
      "Sfoglia le guide illustrate su salute della famiglia e prevenzione.",
      "Consulta il dizionario medico semplice e i test sui miti da sfatare.",
    ],
    hr: [
      "Pregledaj jednostavne vodiče za zdravlje obitelji i prevenciju.",
      "Koristi medicinski rječnik i provjeru mitova o zdravlju.",
    ],
    rom: [
      "Dikh e sikavimata pe čhib lokhi vaš sastipe familiako.",
      "Labyar o alavari sastimasko thaj dikh paramiśă vs čačipe.",
    ],
    ru: [
      "Изучите понятные руководства по семейному здоровью и профилактике.",
      "Откройте простой медицинский словарь и разбор частых мифов.",
    ],
  },
  "care-navigation-rights": {
    ro: [
      "Vezi ce servicii medicale sunt gratuite pentru persoanele neasigurate.",
      "Urmează pașii pentru a solicita investigații sau sprijin comunitar.",
    ],
    en: [
      "Review free medical services guaranteed for uninsured patients.",
      "Follow step-by-step instructions to get care or community support.",
    ],
    sq: [
      "Shiko cilat shërbime mjekësore janë falas për personat e pasiguruar.",
      "Ndiq hapat për të kërkuar kontrolle bazë ose ndihmë në komunitet.",
    ],
    it: [
      "Scopri quali prestazioni mediche sono gratuite senza tessera sanitaria.",
      "Segui i passaggi pratici per accedere a visite e supporto locale.",
    ],
    hr: [
      "Provjeri koje su zdravstvene usluge besplatne za neosigurane osobe.",
      "Slijedi jasne korake za ostvarivanje pregleda ili podrške u zajednici.",
    ],
    rom: [
      "Dikh save śerviśură medikale si biphokinimasko bi asigurareako.",
      "Lel e riga te manges kontrolo vaj ažutipe ande komuniteta.",
    ],
    ru: [
      "Узнайте, какие медицинские услуги бесплатны без страховки.",
      "Следуйте пошаговой инструкции для получения приёма и помощи.",
    ],
  },
  news: {
    ro: [
      "Vezi datele și localitățile pentru următoarele caravane medicale gratuite.",
      "Consultă anunțurile recente de sănătate publică din comunitate.",
    ],
    en: [
      "Check upcoming dates and locations for free mobile medical clinics.",
      "Read recent local public health notices and screening campaigns.",
    ],
    sq: [
      "Kontrollo datat dhe vendet për klinikat e ardhshme lëvizëse falas.",
      "Lexo njoftimet e fundit lokale për shëndetin dhe kontrollet falas.",
    ],
    it: [
      "Controlla date e luoghi delle prossime cliniche mobili gratuite.",
      "Leggi gli avvisi locali su prevenzione e campagne di screening.",
    ],
    hr: [
      "Provjeri datume i lokacije nadolazećih besplatnih mobilnih klinika.",
      "Pročitaj lokalne obavijesti o prevenciji i javnozdravstvenim akcijama.",
    ],
    rom: [
      "Dikh e data thaj e thana vaš e neve karavane medikale biphokinimasko.",
      "Gin e neve vesti palal sastipe thaj analize ando than.",
    ],
    ru: [
      "Проверьте даты и адреса ближайших выездных бесплатных клиник.",
      "Читайте местные объявления о профилактике и осмотрах.",
    ],
  },
  "contul-meu": {
    ro: [
      "Salvează preferințele de limbă, citire ușoară și ghidurile utile.",
      "Gestionează istoricul de orientare medicală într-un loc privat.",
    ],
    en: [
      "Save your preferred language, easy reading mode, and helpful guides.",
      "Keep your local health checklist and preferences in one private space.",
    ],
    sq: [
      "Ruaj gjuhën e preferuar, mënyrën e leximit të thjeshtë dhe udhëzuesit.",
      "Menaxho shënimet e tua shëndetësore në një hapësirë private.",
    ],
    it: [
      "Salva lingua preferita, lettura facilitata e guide utili.",
      "Gestisci in modo privato i tuoi promemoria e le preferenze sanitarie.",
    ],
    hr: [
      "Spremi željeni jezik, način lakšeg čitanja i korisne vodiče.",
      "Upravljaj osobnim podsjetnicima i postavkama na jednom privatnom mjestu.",
    ],
    rom: [
      "Arakh tiri čhib, o lokho ginipen thaj e ghidură kaj trubun tut.",
      "Inkăr tire lila thaj riga ande jekh privatno than.",
    ],
    ru: [
      "Сохраните удобный язык, режим простого чтения и полезные руководства.",
      "Управляйте своими заметками и настройками в одном месте.",
    ],
  },
};

const HIGHLIGHT_SYNONYM_PREFIX_BY_LANG: Record<Lang, string> = {
  ro: "Potrivire pentru",
  en: "Matched topic",
  sq: "Përputhje me",
  it: "Corrispondenza",
  hr: "Podudaranje",
  rom: "Arakhljam vash",
  ru: "Совпадение по теме",
};

const ALL_CATEGORIES: SmartSearchCategory[] = [
  "all",
  "tools",
  "guides",
  "glossary",
  "myths",
  "articles",
  "news",
];

const catalogCache = new Map<Lang, CatalogIndex>();

function cleanDisplayText(text: string, lang: Lang): string {
  const conj = CONJUNCTION_BY_LANG[lang] ?? "and";
  return text
    .replace(/\s*&\s*/g, ` ${conj} `)
    .replace(/\s*·\s*/g, ", ")
    .replace(/\s+/g, " ")
    .trim();
}

function firstSentence(text: string): string {
  const clean = text.trim();
  if (!clean) return "";
  const match = clean.match(/^.+?[.!?](?=\s|$)/);
  return match ? match[0].trim() : clean;
}

export function normalizeSearchText(input: string): string {
  if (!input) return "";
  return input
    .toLowerCase()
    .replace(/[đð]/g, "d")
    .replace(/ø/g, "o")
    .replace(/ł/g, "l")
    .replace(/ß/g, "ss")
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenizeNormalized(normText: string): string[] {
  if (!normText) return [];
  return normText.split(" ").filter((token) => token.length >= 2);
}

/**
 * Bounded Optimal String Alignment / Damerau-Levenshtein distance with early exit.
 * Returns maxDist + 1 immediately if strings exceed the allowed distance bound.
 */
function boundedDamerauLevenshtein(a: string, b: string, maxDist: number): number {
  const lenA = a.length;
  const lenB = b.length;
  if (Math.abs(lenA - lenB) > maxDist) return maxDist + 1;
  if (a === b) return 0;
  if (lenA === 0) return lenB <= maxDist ? lenB : maxDist + 1;
  if (lenB === 0) return lenA <= maxDist ? lenA : maxDist + 1;

  const cols = lenB + 1;
  const dp = new Int32Array((lenA + 1) * cols);

  for (let i = 0; i <= lenA; i += 1) dp[i * cols] = i;
  for (let j = 0; j <= lenB; j += 1) dp[j] = j;

  for (let i = 1; i <= lenA; i += 1) {
    let rowMin = maxDist + 1;
    const chA = a.charCodeAt(i - 1);
    for (let j = 1; j <= lenB; j += 1) {
      const chB = b.charCodeAt(j - 1);
      const cost = chA === chB ? 0 : 1;
      let val = Math.min(
        dp[(i - 1) * cols + j] + 1,
        dp[i * cols + (j - 1)] + 1,
        dp[(i - 1) * cols + (j - 1)] + cost,
      );
      if (
        i > 1 &&
        j > 1 &&
        chA === b.charCodeAt(j - 2) &&
        a.charCodeAt(i - 2) === chB
      ) {
        val = Math.min(val, dp[(i - 2) * cols + (j - 2)] + 1);
      }
      dp[i * cols + j] = val;
      if (val < rowMin) rowMin = val;
    }
    if (rowMin > maxDist) return maxDist + 1;
  }

  return dp[lenA * cols + lenB];
}

function allowedEditDistance(queryToken: string, candidateToken: string): number {
  const maxLen = Math.max(queryToken.length, candidateToken.length);
  const minLen = Math.min(queryToken.length, candidateToken.length);
  if (minLen < 4) return 0;
  if (maxLen >= 7 && minLen >= 5) return 2;
  return 1;
}

function isFuzzyTokenMatch(queryToken: string, candidateToken: string): boolean {
  const maxDist = allowedEditDistance(queryToken, candidateToken);
  if (maxDist === 0) return false;
  return boundedDamerauLevenshtein(queryToken, candidateToken, maxDist) <= maxDist;
}

function matchSynonymGroups(normQuery: string, queryTokens: string[]): SmartSearchSynonymGroup[] {
  if (!normQuery) return [];
  const matches: SmartSearchSynonymGroup[] = [];

  for (const group of SMART_SEARCH_SYNONYMS) {
    let matched = false;
    for (const term of group.terms) {
      const normTerm = normalizeSearchText(term);
      if (!normTerm) continue;
      if (normQuery === normTerm || ` ${normQuery} `.includes(` ${normTerm} `)) {
        matched = true;
        break;
      }
      if (!normTerm.includes(" ") && normTerm.length >= 4) {
        for (const qTok of queryTokens) {
          if (
            qTok === normTerm ||
            (qTok.length >= 5 && normTerm.startsWith(qTok)) ||
            (qTok.length >= 6 && normTerm.length >= 6 && boundedDamerauLevenshtein(qTok, normTerm, 1) <= 1)
          ) {
            matched = true;
            break;
          }
        }
      }
      if (matched) break;
    }
    if (matched) matches.push(group);
  }

  return matches;
}

const NAVIGATION_SYNONYM_CANONICALS = new Set([
  "open-pharmacy",
  "insurance-rights",
  "family-doctor-visit",
  "health-mediator",
]);

function inferPathway(
  query: string,
  lang: Lang,
  synonyms: SmartSearchSynonymGroup[],
): PathwayId {
  const hasNavigationSynonym = synonyms.some((g) => NAVIGATION_SYNONYM_CANONICALS.has(g.canonical));
  const hasPrescriptionSynonym = synonyms.some((g) => g.canonical === "antibiotics-prescription");
  if (hasNavigationSynonym && !hasPrescriptionSynonym) {
    return "navigation";
  }

  const local = classifyLocalIntent(query, lang);
  if (local) return local;
  return classifyIntentToPathway(query);
}

function resolveRouteContext(pathname: string | undefined): RouteContextKey {
  const clean = stripLangFromPathname(pathname || "/").toLowerCase();
  if (clean === "/" || clean === "") return "home";
  if (clean.includes("romanes-glossary") || clean.includes("medical-glossary") || clean.includes("glossary")) {
    return "glossary";
  }
  if (clean.includes("myths")) return "myths";
  if (
    clean.startsWith("/find-help") ||
    clean.startsWith("/find-care") ||
    clean.startsWith("/get-help") ||
    clean.startsWith("/mediatori")
  ) {
    return "findCare";
  }
  if (
    clean.startsWith("/health-assistant") ||
    clean.startsWith("/health-check") ||
    clean.startsWith("/prescription-review") ||
    clean.startsWith("/medic-online")
  ) {
    return "healthAssistant";
  }
  if (clean.startsWith("/news") || clean.startsWith("/stiri")) return "news";
  if (clean.startsWith("/health-information")) return "healthInfo";
  return "defaultContext";
}

function hasNormalizedTerm(normQuery: string, normTerm: string): boolean {
  if (!normTerm || !normQuery) return false;
  if (` ${normQuery} `.includes(` ${normTerm} `)) return true;
  // Allow inflectional prefix matches on multi-word emergency phrases or 6+ char emergency stems
  if (normTerm.includes(" ") && normQuery.includes(normTerm)) return true;
  if (normTerm.length >= 7 && normQuery.includes(normTerm)) return true;
  return false;
}

export function detectEmergencyQuery(query: string, lang: Lang): boolean {
  const trimmed = query.trim();
  if (!trimmed) return false;

  if (urgentPattern.test(trimmed)) return true;

  const normQuery = normalizeSearchText(trimmed);
  if (!normQuery) return false;
  if (urgentPattern.test(normQuery)) return true;

  const langTerms = getSmartSearchCopy(lang).emergencyTriggerTerms;
  const enTerms = lang === "en" ? [] : getSmartSearchCopy("en").emergencyTriggerTerms;
  const roTerms = lang === "ro" ? [] : getSmartSearchCopy("ro").emergencyTriggerTerms;

  for (const term of [...langTerms, ...enTerms, ...roTerms]) {
    const normTerm = normalizeSearchText(term);
    if (hasNormalizedTerm(normQuery, normTerm)) return true;
  }

  return false;
}

function makeCatalogEntry(params: {
  id: string;
  kind: SmartSearchItemKind;
  title: string;
  summary: string;
  simpleSummary: string;
  href: string;
  keywords: string[];
  nextSteps: string[];
  qaPairs?: { question: string; answer: string }[];
  tags: string[];
  priorityBoost: number;
  routeHints: RouteContextKey[];
  pathwayHints: PathwayId[];
  lang: Lang;
}): CatalogEntry {
  const title = cleanDisplayText(params.title, params.lang);
  const summary = cleanDisplayText(params.summary, params.lang);
  const simpleSummary = cleanDisplayText(params.simpleSummary || params.summary, params.lang);
  const tags = params.tags
    .map((tag) => cleanDisplayText(tag, params.lang))
    .filter(Boolean)
    .slice(0, 3);
  const nextSteps = params.nextSteps
    .map((step) => cleanDisplayText(step, params.lang))
    .filter(Boolean)
    .slice(0, 3);
  const qaPairs = (params.qaPairs ?? [])
    .map((pair) => ({
      question: cleanDisplayText(pair.question, params.lang),
      answer: cleanDisplayText(pair.answer, params.lang),
    }))
    .filter((pair) => pair.question.length > 0 && pair.answer.length > 0)
    .slice(0, 3);

  const normTitle = normalizeSearchText(title);
  const normKeywords = normalizeSearchText(
    [...params.keywords, ...tags].join(" "),
  );
  const normBody = normalizeSearchText(`${summary} ${simpleSummary} ${nextSteps.join(" ")}`);

  return {
    id: params.id,
    kind: params.kind,
    title,
    summary,
    simpleSummary,
    href: params.href,
    nextSteps,
    qaPairs,
    tags,
    priorityBoost: params.priorityBoost,
    normTitle,
    normKeywords,
    normBody,
    titleTokens: tokenizeNormalized(normTitle),
    keywordTokens: tokenizeNormalized(normKeywords),
    bodyTokens: tokenizeNormalized(normBody),
    routeHints: params.routeHints,
    pathwayHints: params.pathwayHints,
  };
}

function inferToolRoutesAndPathways(id: string): {
  routeHints: RouteContextKey[];
  pathwayHints: PathwayId[];
} {
  switch (id) {
    case "health-assistant":
    case "health-check":
    case "medic-online":
      return { routeHints: ["home", "healthAssistant"], pathwayHints: ["symptoms"] };
    case "prescription-review":
      return { routeHints: ["home", "healthAssistant"], pathwayHints: ["prescription"] };
    case "find-help":
    case "mediatori":
    case "get-help":
    case "care-navigation-rights":
      return { routeHints: ["home", "findCare"], pathwayHints: ["navigation"] };
    case "news":
      return { routeHints: ["home", "news"], pathwayHints: ["learn"] };
    case "heart-health":
    case "diabetes-guide":
      return { routeHints: ["home", "healthInfo"], pathwayHints: ["risk", "learn"] };
    default:
      return { routeHints: ["home", "healthInfo"], pathwayHints: ["learn"] };
  }
}

function buildCatalogIndex(lang: Lang): CatalogIndex {
  const copy = getSmartSearchCopy(lang);
  const entries: CatalogEntry[] = [];
  const seenHrefs = new Set<string>();
  const vocabSet = new Set<string>();
  const completionSet = new Set<string>();

  const addVocabWords = (text: string) => {
    for (const token of tokenizeNormalized(normalizeSearchText(text))) {
      if (token.length >= 4) vocabSet.add(token);
    }
  };

  for (const q of copy.popularQueries) {
    completionSet.add(cleanDisplayText(q, lang));
    addVocabWords(q);
  }
  for (const chip of copy.starterChips) {
    completionSet.add(cleanDisplayText(chip.query, lang));
    addVocabWords(chip.label);
    addVocabWords(chip.query);
  }

  const areaTitleById = new Map<string, string>();
  for (const area of informedHealthAreas) {
    areaTitleById.set(area.id, area.titles[lang] ?? area.titles.en);
  }

  // 1. Core tools & primary guides from SMART_SEARCH_TOOLS
  for (const tool of SMART_SEARCH_TOOLS) {
    const href = withLangPrefix(tool.href, lang);
    seenHrefs.add(href);

    const slugMatch = tool.href.startsWith("/health-information/topics/")
      ? tool.href.replace("/health-information/topics/", "")
      : tool.href.startsWith("/health-information/")
        ? tool.href.replace("/health-information/", "")
        : null;

    const fullTopic = slugMatch ? getHealthTopicBySlug(lang, slugMatch) : undefined;
    const summaryData = slugMatch ? getHealthSummary(lang, slugMatch) : undefined;

    const toolSteps = TOOL_CAPABILITY_STEPS_BY_LANG[tool.id]?.[lang];
    const nextSteps: string[] = [];
    if (toolSteps?.length) {
      nextSteps.push(...toolSteps);
    } else if (fullTopic?.recommendations?.length) {
      for (const rec of fullTopic.recommendations.slice(0, 2)) {
        nextSteps.push(`${rec.title}: ${rec.description}`);
      }
    } else if (summaryData?.questions?.length) {
      for (const q of summaryData.questions.slice(0, 2)) {
        nextSteps.push(q);
      }
    }

    const { routeHints, pathwayHints } = inferToolRoutesAndPathways(tool.id);
    const title = tool.title[lang] ?? tool.title.en;
    const summaryText = tool.summary[lang] ?? tool.summary.en;
    const plainSummaryText = tool.plainSummary[lang] ?? summaryText;
    const qaPairs = summaryData?.questions?.length
      ? summaryData.questions.slice(0, 2).map((q) => ({
          question: q,
          answer: summaryData.details || summaryData.intro || plainSummaryText,
        }))
      : fullTopic?.recommendations?.length
        ? fullTopic.recommendations.slice(0, 2).map((rec) => ({
            question: rec.title,
            answer: rec.description,
          }))
        : [{ question: title, answer: plainSummaryText }];

    completionSet.add(cleanDisplayText(title, lang));
    addVocabWords(title);

    entries.push(
      makeCatalogEntry({
        id: `tool:${tool.id}`,
        kind: tool.category,
        title,
        summary: summaryText,
        simpleSummary: plainSummaryText,
        href,
        keywords: [
          ...tool.keywords,
          ...(fullTopic?.warningSigns ?? []),
          ...(summaryData ? [summaryData.intro] : []),
        ],
        nextSteps,
        qaPairs,
        tags: [tool.groupLabel[lang] ?? copy.kindLabels[tool.category], tool.actionLabel[lang]],
        priorityBoost: tool.category === "tools" ? 10 : 7,
        routeHints,
        pathwayHints,
        lang,
      }),
    );
  }

  // 2. Remaining health topics from getHealthTopicsList(lang)
  for (const topic of getHealthTopicsList(lang)) {
    const href = withLangPrefix(`/health-information/${topic.slug}`, lang);
    if (seenHrefs.has(href)) continue;
    seenHrefs.add(href);

    const fullTopic = getHealthTopicBySlug(lang, topic.slug);
    const nextSteps =
      fullTopic?.recommendations?.slice(0, 3).map((rec) => `${rec.title}: ${rec.description}`) ?? [];
    if (nextSteps.length === 0 && topic.recommendationTitle) {
      nextSteps.push(
        topic.recommendationBody
          ? `${topic.recommendationTitle}: ${topic.recommendationBody}`
          : topic.recommendationTitle,
      );
    }

    const qaPairs =
      fullTopic?.recommendations?.slice(0, 2).map((rec) => ({
        question: rec.title,
        answer: rec.description,
      })) ?? [];

    completionSet.add(cleanDisplayText(topic.title, lang));
    addVocabWords(topic.title);

    entries.push(
      makeCatalogEntry({
        id: `topic:${topic.slug}`,
        kind: "guides",
        title: topic.title,
        summary: fullTopic?.intro || topic.description,
        simpleSummary: topic.description,
        href,
        keywords: [
          topic.slug.replaceAll("-", " "),
          topic.categorySlug,
          ...(fullTopic?.keyFacts ?? []),
          ...(fullTopic?.warningSigns ?? []),
        ],
        nextSteps,
        qaPairs,
        tags: [copy.kindLabels.guides, ...(topic.keyFact ? [firstSentence(topic.keyFact)] : [])],
        priorityBoost: 6,
        routeHints: ["home", "healthInfo"],
        pathwayHints: topic.slug === "preventive-screening" || topic.slug === "smoking"
          ? ["risk", "learn"]
          : ["learn"],
        lang,
      }),
    );
  }

  // 3. InformedHealth directory areas & summaries
  for (const area of informedHealthAreas) {
    const href = withLangPrefix(healthSummaryPath(area.id), lang);
    if (seenHrefs.has(href)) continue;
    seenHrefs.add(href);

    const areaTitle = area.titles[lang] ?? area.titles.en;
    const summaryObj = getHealthSummary(lang, area.id);
    const introText = summaryObj?.intro ?? areaTitle;
    const detailsText = summaryObj?.details ? `${introText} ${summaryObj.details}` : introText;
    const nextSteps = summaryObj?.questions?.length
      ? summaryObj.questions.slice(0, 3)
      : [];
    const qaPairs = (summaryObj?.questions ?? []).slice(0, 2).map((q) => ({
      question: q,
      answer: summaryObj?.details ? `${introText} ${summaryObj.details}` : introText,
    }));

    completionSet.add(cleanDisplayText(areaTitle, lang));
    addVocabWords(areaTitle);

    entries.push(
      makeCatalogEntry({
        id: `summary:${area.id}`,
        kind: "guides",
        title: areaTitle,
        summary: detailsText,
        simpleSummary: introText,
        href,
        keywords: [
          area.id.replaceAll("-", " "),
          area.titles.en,
          area.titles.ro,
          ...area.groups,
        ],
        nextSteps,
        qaPairs,
        tags: [copy.kindLabels.guides, ...area.groups.slice(0, 2)],
        priorityBoost: 5,
        routeHints: ["healthInfo"],
        pathwayHints: area.groups.includes("services") ? ["navigation", "learn"] : ["learn"],
        lang,
      }),
    );
  }

  // 4. Health articles index
  for (const article of healthArticleIndex) {
    const href = withLangPrefix(healthArticlePath(article.id), lang);
    if (seenHrefs.has(href)) continue;
    seenHrefs.add(href);

    const title = article.titles[lang] ?? article.titles.en;
    const primaryAreaId = article.areaIds[0];
    const areaTitle = primaryAreaId ? areaTitleById.get(primaryAreaId) : undefined;
    const areaSummary = primaryAreaId ? getHealthSummary(lang, primaryAreaId) : undefined;

    const standardSummary = areaSummary?.intro
      ? `${areaTitle ? `${areaTitle}. ` : ""}${areaSummary.intro}`
      : areaTitle || title;
    const simpleSummary = areaSummary?.intro
      ? firstSentence(areaSummary.intro)
      : areaTitle || title;

    const nextSteps = areaSummary?.questions?.slice(0, 2) ?? [];
    const qaPairs = (areaSummary?.questions ?? []).slice(0, 2).map((q) => ({
      question: q,
      answer: standardSummary,
    }));

    addVocabWords(title);

    entries.push(
      makeCatalogEntry({
        id: `article:${article.id}`,
        kind: "articles",
        title,
        summary: standardSummary,
        simpleSummary,
        href,
        keywords: [
          article.id.replaceAll("-", " "),
          article.titles.en,
          article.titles.ro,
          ...article.areaIds.map((id) => areaTitleById.get(id) ?? id.replaceAll("-", " ")),
        ],
        nextSteps,
        qaPairs,
        tags: [copy.kindLabels.articles, ...(areaTitle ? [areaTitle] : [])],
        priorityBoost: 3,
        routeHints: ["healthInfo"],
        pathwayHints: ["learn"],
        lang,
      }),
    );
  }

  // 5. Dual-register medical glossary
  const glossaryUi = DUAL_REGISTER_GLOSSARY_UI_COPY[lang] ?? DUAL_REGISTER_GLOSSARY_UI_COPY.en;
  for (const item of ROMANIAN_MEDICAL_GLOSSARY) {
    const loc = getLocalizedGlossaryEntry(item, lang);
    const categoryLabel = glossaryUi.categories[item.category] ?? copy.kindLabels.glossary;
    const title =
      loc.plainTerm.toLowerCase() === loc.formalTerm.toLowerCase()
        ? loc.plainTerm
        : loc.plainTerm.includes("(") || loc.formalTerm.includes("(")
          ? `${loc.plainTerm}: ${loc.formalTerm}`
          : `${loc.plainTerm} (${loc.formalTerm})`;

    const nextSteps = loc.clinicalSignificance ? [loc.clinicalSignificance] : [];
    const qaPairs = [{ question: title, answer: `${loc.layExplanation} ${loc.clinicalSignificance}` }];

    addVocabWords(loc.plainTerm);
    addVocabWords(loc.formalTerm);

    entries.push(
      makeCatalogEntry({
        id: `glossary-med:${item.id}`,
        kind: "glossary",
        title,
        summary: `${loc.layExplanation} ${loc.clinicalSignificance}`,
        simpleSummary: loc.layExplanation,
        href: withLangPrefix("/health-information#medical-glossary", lang),
        keywords: [
          item.id.replaceAll("-", " "),
          item.plainTermRo,
          item.formalTermRo,
          loc.plainTerm,
          loc.formalTerm,
          categoryLabel,
          ...(item.relatedTopicSlug ? [item.relatedTopicSlug.replaceAll("-", " ")] : []),
        ],
        nextSteps,
        qaPairs,
        tags: [glossaryUi.title, categoryLabel, loc.formalTerm],
        priorityBoost: 2,
        routeHints: ["glossary", "healthInfo"],
        pathwayHints:
          item.category === "cnas"
            ? ["navigation", "learn"]
            : item.category === "urgente"
              ? ["symptoms", "learn"]
              : ["prescription", "learn"],
        lang,
      }),
    );
  }

  // 6. Romanes medical glossary
  for (const term of ROMANES_GLOSSARY_TERMS) {
    const localizedTerm =
      lang === "ro"
        ? term.romanianTerm
        : (term.termByLang?.[lang] ?? term.termByLang?.en ?? term.romanianTerm);
    const localizedCategory =
      lang === "ro"
        ? term.categoryLabel
        : (term.categoryLabelByLang?.[lang] ?? term.categoryLabelByLang?.en ?? term.categoryLabel);
    const localizedExplanation =
      lang === "ro"
        ? term.explanation
        : (term.explanationByLang?.[lang] ?? term.explanationByLang?.en ?? term.explanation);

    const title =
      normalizeSearchText(localizedTerm) === normalizeSearchText(term.romanesTerm)
        ? term.romanesTerm
        : localizedTerm.includes("(") || term.romanesTerm.includes("(")
          ? `${localizedTerm}: ${term.romanesTerm}`
          : `${localizedTerm} (${term.romanesTerm})`;

    addVocabWords(localizedTerm);
    addVocabWords(term.romanesTerm);

    entries.push(
      makeCatalogEntry({
        id: `glossary-romanes:${term.id}`,
        kind: "glossary",
        title,
        summary: `${term.romanesTerm}: ${localizedExplanation}`,
        simpleSummary: localizedExplanation,
        href: withLangPrefix("/health-information#romanes-glossary", lang),
        keywords: [
          term.id.replaceAll("-", " "),
          term.romanianTerm,
          term.romanesTerm,
          localizedTerm,
          localizedCategory,
          term.phoneticPronunciation,
        ],
        nextSteps: term.phoneticPronunciation ? [term.phoneticPronunciation] : [],
        qaPairs: [{ question: title, answer: localizedExplanation }],
        tags: [copy.kindLabels.glossary, localizedCategory, term.romanesTerm],
        priorityBoost: 2,
        routeHints: ["glossary", "healthInfo"],
        pathwayHints: ["learn"],
        lang,
      }),
    );
  }

  // 7. Health myths & facts
  for (const myth of getHealthMyths(lang)) {
    const nextSteps = [`${myth.statusTag} (${myth.source})`];
    const qaPairs = [{ question: myth.statement, answer: `${myth.statusTag}. ${myth.explanation}` }];
    addVocabWords(myth.category);
    addVocabWords(myth.statement);

    entries.push(
      makeCatalogEntry({
        id: `myth:${myth.id}`,
        kind: "myths",
        title: myth.statement,
        summary: `${myth.statusTag}. ${myth.explanation}`,
        simpleSummary: myth.explanation,
        href: withLangPrefix("/health-information#quiz-section-heading", lang),
        keywords: [
          myth.category,
          myth.categorySlug,
          myth.statusTag,
          myth.relatedTopicSlug.replaceAll("-", " "),
        ],
        nextSteps,
        qaPairs,
        tags: [copy.kindLabels.myths, myth.category, myth.statusTag],
        priorityBoost: 2,
        routeHints: ["myths", "healthInfo"],
        pathwayHints: ["learn"],
        lang,
      }),
    );
  }

  // 8. News & mobile clinics
  for (const rawArticle of NEWS_ARTICLES) {
    const article = getLocalizedArticle(rawArticle, lang);
    const href = withLangPrefix(`/news/${encodeURIComponent(article.slug)}`, lang);
    const nextSteps: string[] = [];
    if (article.preventiveSteps?.length) {
      nextSteps.push(...article.preventiveSteps.slice(0, 3));
    } else if (article.caravanDetails) {
      nextSteps.push(`${article.caravanDetails.village}, ${article.caravanDetails.landmark}`);
      nextSteps.push(article.caravanDetails.hours);
      if (article.caravanDetails.freeServices.length) {
        nextSteps.push(article.caravanDetails.freeServices.slice(0, 3).join(", "));
      }
    }

    const fullSummary = article.content[0]
      ? `${article.summary} ${article.content[0]}`
      : article.summary;

    addVocabWords(article.title);
    for (const tag of article.tags) addVocabWords(tag);

    entries.push(
      makeCatalogEntry({
        id: `news:${article.id}`,
        kind: "news",
        title: article.title,
        summary: fullSummary,
        simpleSummary: article.summary,
        href,
        keywords: [
          article.slug.replaceAll("-", " "),
          article.categoryLabel ?? article.category,
          article.county,
          ...article.tags,
        ],
        nextSteps,
        qaPairs: [{ question: article.title, answer: fullSummary }],
        tags: [article.categoryLabel ?? copy.kindLabels.news, article.county, ...article.tags].slice(0, 3),
        priorityBoost: 2,
        routeHints: ["news", "home"],
        pathwayHints: ["learn", "navigation"],
        lang,
      }),
    );
  }

  const index: CatalogIndex = {
    entries,
    entryMap: new Map(entries.map((entry) => [entry.id, entry])),
    vocabulary: Array.from(vocabSet),
    completionCandidates: Array.from(completionSet),
  };
  catalogCache.set(lang, index);
  return index;
}

function getCatalogIndex(lang: Lang): CatalogIndex {
  return catalogCache.get(lang) ?? buildCatalogIndex(lang);
}

function scoreEntry(
  entry: CatalogEntry,
  normQuery: string,
  queryTokens: string[],
  synonyms: SmartSearchSynonymGroup[],
  pathway: PathwayId,
  routeContext: RouteContextKey,
  isEmergency: boolean,
  lang: Lang,
): { score: number; matchedReason: string } {
  const copy = getSmartSearchCopy(lang);
  let relevance = 0;
  let matchedReason = "";

  if (normQuery.length > 0) {
    if (entry.normTitle === normQuery) {
      relevance += 120;
    } else if (entry.normTitle.startsWith(normQuery)) {
      relevance += 80;
    } else if (` ${entry.normTitle} `.includes(` ${normQuery} `)) {
      relevance += 65;
    } else if (normQuery.length >= 4 && entry.normTitle.includes(normQuery)) {
      relevance += 48;
    }

    for (const qTok of queryTokens) {
      let tokenMatched = false;

      if (entry.titleTokens.includes(qTok)) {
        relevance += 32;
        tokenMatched = true;
      } else if (qTok.length >= 3 && entry.titleTokens.some((t) => t.startsWith(qTok))) {
        relevance += 22;
        tokenMatched = true;
      } else if (qTok.length >= 4 && entry.titleTokens.some((t) => isFuzzyTokenMatch(qTok, t))) {
        relevance += 14;
        tokenMatched = true;
      }

      if (entry.keywordTokens.includes(qTok)) {
        relevance += 26;
        tokenMatched = true;
      } else if (qTok.length >= 3 && entry.keywordTokens.some((t) => t.startsWith(qTok))) {
        relevance += 17;
        tokenMatched = true;
      } else if (qTok.length >= 4 && entry.keywordTokens.some((t) => isFuzzyTokenMatch(qTok, t))) {
        relevance += 11;
        tokenMatched = true;
      }

      if (!tokenMatched) {
        if (entry.bodyTokens.includes(qTok)) {
          relevance += 10;
        } else if (qTok.length >= 4 && entry.bodyTokens.some((t) => t.startsWith(qTok))) {
          relevance += 6;
        } else if (qTok.length >= 5 && entry.bodyTokens.some((t) => isFuzzyTokenMatch(qTok, t))) {
          relevance += 4;
        }
      }
    }

    for (const group of synonyms) {
      let groupBoosted = false;
      for (const boostKw of group.boostTitleKeywords) {
        const normKw = normalizeSearchText(boostKw);
        if (!normKw) continue;
        if (entry.normTitle.includes(normKw) || entry.normKeywords.includes(normKw) || entry.href.includes(normKw) || entry.href.includes(boostKw)) {
          relevance += 30;
          groupBoosted = true;
          break;
        }
      }
      if (!groupBoosted) {
        for (const synTerm of group.terms) {
          const normSyn = normalizeSearchText(synTerm);
          if (normSyn.length >= 4 && entry.normBody.includes(normSyn)) {
            relevance += 12;
            groupBoosted = true;
            break;
          }
        }
      }
      if (groupBoosted && !matchedReason) {
        const prefix = HIGHLIGHT_SYNONYM_PREFIX_BY_LANG[lang];
        const matchingTerms = group.terms
          .filter((t) => {
            const nt = normalizeSearchText(t);
            return nt && (` ${normQuery} `.includes(` ${nt} `) || queryTokens.some((q) => q === nt || (q.length >= 5 && nt.startsWith(q))));
          })
          .sort((a, b) => b.length - a.length);
        const matchedTerm = matchingTerms[0] ?? group.terms[0] ?? group.canonical;
        matchedReason = `${prefix}: ${matchedTerm}`;
      }
    }

    if (relevance === 0 && !isEmergency) {
      return { score: 0, matchedReason: "" };
    }
    if (relevance === 0 && isEmergency) {
      const emergencyCore =
        entry.id === "tool:health-assistant" ||
        entry.id === "tool:find-help" ||
        entry.id === "glossary-med:urgenta" ||
        entry.id === "glossary-romanes:urgenta";
      if (!emergencyCore) {
        return { score: 0, matchedReason: "" };
      }
      relevance = 25;
      matchedReason = copy.emergencyCallLabel;
    }
  } else {
    relevance = 10;
  }

  let bonus = entry.priorityBoost;
  if (entry.pathwayHints.includes(pathway)) bonus += 12;
  if (entry.routeHints.includes(routeContext)) bonus += 8;

  // Ensure emergency red-flag queries prioritize urgent care / triage / hospitals over lifestyle guides
  if (isEmergency) {
    if (entry.id === "tool:health-assistant" || entry.id === "tool:find-help") {
      bonus += 55;
    } else if (entry.id === "glossary-med:atac-de-cord" || entry.id === "glossary-med:urgenta" || entry.id === "glossary-romanes:urgenta") {
      bonus += 38;
    } else if (entry.id === "tool:heart-health" || entry.id === "summary:heart-and-circulation") {
      bonus += 24;
    }
  }

  const contextTag =
    entry.tags[0] === copy.kindLabels[entry.kind] && entry.tags[1]
      ? entry.tags[1]
      : entry.tags[0];
  const fallbackHighlight =
    contextTag && contextTag !== entry.title ? contextTag : copy.kindLabels[entry.kind];
  return {
    score: relevance + bonus,
    matchedReason: cleanDisplayText(matchedReason || fallbackHighlight, lang),
  };
}

function toSmartSearchResult(
  entry: CatalogEntry,
  readingLevel: SmartSearchReadingLevel,
  score: number,
  matchedReason: string,
  matchedQuery: string,
  lang: Lang,
): SmartSearchResult {
  const copy = getSmartSearchCopy(lang);
  return {
    id: entry.id,
    kind: entry.kind,
    kindLabel: copy.kindLabels[entry.kind],
    title: entry.title,
    summary: readingLevel === "simple" ? entry.simpleSummary : entry.summary,
    href: entry.href,
    highlights: matchedReason || copy.kindLabels[entry.kind],
    nextSteps: entry.nextSteps,
    tags: entry.tags,
    score,
    matchedQuery,
  };
}

function computeDidYouMean(
  rawQuery: string,
  queryTokens: string[],
  vocabulary: string[],
  lang: Lang,
): string | null {
  if (queryTokens.length === 0) return null;

  let changed = false;
  const correctedTokens: string[] = [];

  for (const token of queryTokens) {
    if (token.length < 4) {
      correctedTokens.push(token);
      continue;
    }

    const hasExactOrPrefix = vocabulary.some(
      (word) => word === token || (token.length >= 4 && word.startsWith(token)),
    );
    if (hasExactOrPrefix) {
      correctedTokens.push(token);
      continue;
    }

    let bestWord: string | null = null;
    let bestDist = Infinity;
    let bestScore = -1;

    for (const word of vocabulary) {
      const maxDist = allowedEditDistance(token, word);
      if (maxDist === 0) continue;
      const dist = boundedDamerauLevenshtein(token, word, maxDist);
      if (dist <= maxDist) {
        const sameInitial = word[0] === token[0] ? 1 : 0;
        const candidateScore = (maxDist - dist) * 10 + sameInitial * 3 - Math.abs(word.length - token.length);
        if (dist < bestDist || (dist === bestDist && candidateScore > bestScore)) {
          bestDist = dist;
          bestScore = candidateScore;
          bestWord = word;
        }
      }
    }

    if (bestWord && bestWord !== token) {
      correctedTokens.push(bestWord);
      changed = true;
    } else {
      correctedTokens.push(token);
    }
  }

  if (!changed) return null;
  const suggestion = cleanDisplayText(correctedTokens.join(" "), lang);
  return normalizeSearchText(suggestion) === normalizeSearchText(rawQuery) ? null : suggestion;
}

/**
 * Predicts a seamless inline ghost completion preserving the user's exact typed prefix
 * and keeping diacritics intact in the completed suffix.
 */
export function predictQueryCompletion(
  query: string,
  results: SmartSearchResult[],
  lang: Lang,
): string | null {
  if (!query || query.trim().length < 2) return null;
  if (/^\s/.test(query) || /[\r\n]/.test(query)) return null;

  const trimmedLeft = query;
  const normQuery = normalizeSearchText(trimmedLeft);
  if (normQuery.length < 2) return null;

  const index = getCatalogIndex(lang);
  const candidates: string[] = [
    ...index.completionCandidates,
    ...results.slice(0, 4).map((r) => r.title),
  ];

  const seen = new Set<string>();
  for (const rawCandidate of candidates) {
    const candidate = cleanDisplayText(rawCandidate, lang);
    if (!candidate || seen.has(candidate)) continue;
    seen.add(candidate);
    if (candidate.length > 64) continue;

    // Walk original NFC characters until normalized prefix equals normQuery
    let matchedNorm = "";
    let splitPos = 0;
    for (let i = 0; i < candidate.length; i += 1) {
      const ch = candidate[i];
      const normCh = normalizeSearchText(ch);
      if (normCh) {
        matchedNorm = `${matchedNorm}${normCh}`;
      } else if (matchedNorm && !matchedNorm.endsWith(" ")) {
        matchedNorm += " ";
      }
      if (matchedNorm === normQuery) {
        splitPos = i + 1;
        break;
      }
      if (matchedNorm.length > normQuery.length + 1) break;
    }

    if (splitPos > 0 && splitPos === trimmedLeft.length && candidate.length - splitPos >= 2) {
      const suffix = candidate.slice(splitPos);
      if (suffix.trim().length >= 2) {
        return `${trimmedLeft}${suffix}`;
      }
    }
  }

  return null;
}

export function getContextualSuggestions(
  pathname: string,
  lang: Lang,
  recentSearches?: string[],
): ContextualSuggestionBundle {
  const copy = getSmartSearchCopy(lang);
  const routeKey = resolveRouteContext(pathname);
  const index = getCatalogIndex(lang);
  const contextLabel = copy.contextHeaderForPath[routeKey] ?? copy.contextHeaderForPath.defaultContext;

  const routePreferredIds: Record<RouteContextKey, string[]> = {
    home: [
      "tool:health-assistant",
      "tool:find-help",
      "tool:prescription-review",
      "tool:health-information",
      "tool:mediatori",
      "tool:news",
    ],
    healthInfo: [
      "tool:health-information",
      "tool:heart-health",
      "tool:diabetes-guide",
      "tool:womens-health",
      "topic:preventive-screening",
      "tool:mental-wellbeing",
    ],
    glossary: [
      "glossary-med:glicemie-a-jeun",
      "glossary-med:hipertensiune",
      "glossary-med:hemoglobina-glicata",
      "glossary-romanes:tensiune-arteriala",
      "glossary-romanes:diabet",
      "tool:prescription-review",
    ],
    myths: [
      "myth:myth-flu-vaccine",
      "myth:myth-antibiotics-cold",
      "myth:myth-blood-pressure",
      "myth:myth-diabetes-sugar",
      "myth:myth-womens-mammography",
      "tool:health-information",
    ],
    findCare: [
      "tool:find-help",
      "tool:mediatori",
      "tool:get-help",
      "tool:medic-online",
      "tool:care-navigation-rights",
      "tool:health-assistant",
    ],
    healthAssistant: [
      "tool:health-assistant",
      "tool:health-check",
      "tool:prescription-review",
      "tool:medic-online",
      "tool:find-help",
      "tool:get-help",
    ],
    news: [
      "tool:news",
      "news:caravana-galati-barcea",
      "news:campanie-antigripala-nationala",
      "news:sfat-sezon-raceli-copii",
      "tool:find-help",
      "tool:mediatori",
    ],
    defaultContext: [
      "tool:health-assistant",
      "tool:find-help",
      "tool:health-information",
      "tool:prescription-review",
      "tool:mediatori",
      "tool:news",
    ],
  };

  const preferredIds = routePreferredIds[routeKey] ?? routePreferredIds.defaultContext;
  const entryMap = new Map(index.entries.map((e) => [e.id, e]));
  const picked: CatalogEntry[] = [];
  const pickedIds = new Set<string>();

  if (recentSearches?.length) {
    for (const recent of recentSearches.slice(0, 2)) {
      const normRecent = normalizeSearchText(recent);
      if (!normRecent) continue;
      const match = index.entries.find(
        (e) => !pickedIds.has(e.id) && (e.normTitle.includes(normRecent) || e.normKeywords.includes(normRecent)),
      );
      if (match) {
        picked.push(match);
        pickedIds.add(match.id);
      }
    }
  }

  for (const id of preferredIds) {
    if (picked.length >= 6) break;
    const entry = entryMap.get(id);
    if (entry && !pickedIds.has(entry.id)) {
      picked.push(entry);
      pickedIds.add(entry.id);
    }
  }

  for (const entry of index.entries) {
    if (picked.length >= 6) break;
    if (!pickedIds.has(entry.id)) {
      picked.push(entry);
      pickedIds.add(entry.id);
    }
  }

  const topResults = picked.map((entry, idx) =>
    toSmartSearchResult(
      entry,
      "standard",
      100 - idx,
      entry.tags[0] || copy.kindLabels[entry.kind],
      "",
      lang,
    ),
  );

  // Build context-tailored starter chips while staying concise and strictly sentence-cased
  let chips = [...copy.starterChips];
  if (routeKey === "glossary") {
    const glossaryChips = picked
      .filter((e) => e.kind === "glossary")
      .slice(0, 3)
      .map((e) => {
        const shortLabel = e.title.split("(")[0].trim();
        return { label: shortLabel, query: shortLabel };
      });
    if (glossaryChips.length >= 2) {
      chips = [...glossaryChips, ...copy.starterChips.slice(0, 2)];
    }
  } else if (routeKey === "findCare") {
    chips = [
      copy.starterChips[0],
      copy.starterChips[1],
      ...copy.starterChips.slice(2, 4),
    ].filter(Boolean);
  } else if (routeKey === "myths") {
    const mythChip = copy.starterChips[4];
    if (mythChip) {
      chips = [mythChip, ...copy.starterChips.slice(0, 3)];
    }
  }

  return {
    contextLabel: cleanDisplayText(contextLabel, lang),
    chips: chips.slice(0, 5).map((c) => ({
      label: cleanDisplayText(c.label, lang),
      query: cleanDisplayText(c.query, lang),
    })),
    topResults,
  };
}

export function searchSmartCatalog(
  query: string,
  opts: SmartSearchOptions,
): SmartSearchResponse {
  const {
    lang,
    category = "all",
    readingLevel = "standard",
    pathname = "/",
    limit = 24,
  } = opts;

  const copy = getSmartSearchCopy(lang);
  const index = getCatalogIndex(lang);
  const trimmed = query.trim();
  const isEmergency = detectEmergencyQuery(trimmed, lang);

  const groupedCounts: Record<SmartSearchCategory, number> = {
    all: 0,
    tools: 0,
    guides: 0,
    glossary: 0,
    myths: 0,
    articles: 0,
    news: 0,
  };

  if (!trimmed) {
    const contextual = getContextualSuggestions(pathname, lang);
    const browsePool = [...contextual.topResults];
    const seen = new Set(browsePool.map((item) => item.id));

    for (const entry of index.entries) {
      if (browsePool.length >= 36) break;
      if (!seen.has(entry.id)) {
        seen.add(entry.id);
        browsePool.push(
          toSmartSearchResult(
            entry,
            readingLevel,
            entry.priorityBoost,
            entry.tags[0] || copy.kindLabels[entry.kind],
            "",
            lang,
          ),
        );
      }
    }

    for (const item of browsePool) {
      groupedCounts[item.kind] += 1;
      groupedCounts.all += 1;
    }

    const filtered =
      category === "all"
        ? browsePool
        : browsePool.filter((item) => item.kind === category);

    return {
      results: filtered.slice(0, limit),
      groupedCounts,
      didYouMean: null,
      ghostCompletion: null,
      isEmergency: false,
      suggestedFollowups: copy.popularQueries.slice(0, 3).map((q) => cleanDisplayText(q, lang)),
      intentSummary: null,
      guidedOverview: null,
      relatedQuestions: [],
    };
  }

  const normQuery = normalizeSearchText(trimmed);
  const queryTokens = tokenizeNormalized(normQuery);
  const synonyms = matchSynonymGroups(normQuery, queryTokens);
  const pathway = inferPathway(trimmed, lang, synonyms);
  const routeContext = resolveRouteContext(pathname);

  const scored: SmartSearchResult[] = [];
  for (const entry of index.entries) {
    const { score, matchedReason } = scoreEntry(
      entry,
      normQuery,
      queryTokens,
      synonyms,
      pathway,
      routeContext,
      isEmergency,
      lang,
    );
    if (score <= 0) continue;

    groupedCounts[entry.kind] += 1;
    groupedCounts.all += 1;
    scored.push(
      toSmartSearchResult(entry, readingLevel, score, matchedReason, trimmed, lang),
    );
  }

  scored.sort((a, b) => b.score - a.score || a.title.localeCompare(b.title, lang));

  // If emergency query matched very few local entries, ensure health-assistant and find-help are included
  if (isEmergency && scored.length < 3) {
    for (const fallbackId of ["tool:health-assistant", "tool:find-help", "tool:get-help"]) {
      if (!scored.some((item) => item.id === fallbackId)) {
        const entry = index.entries.find((e) => e.id === fallbackId);
        if (entry) {
          groupedCounts[entry.kind] += 1;
          groupedCounts.all += 1;
          scored.push(
            toSmartSearchResult(entry, readingLevel, 50, copy.emergencyCallLabel, trimmed, lang),
          );
        }
      }
    }
  }

  const filteredResults =
    category === "all"
      ? scored
      : scored.filter((item) => item.kind === category);

  const limitedResults = filteredResults.slice(0, limit);
  const didYouMean = computeDidYouMean(trimmed, queryTokens, index.vocabulary, lang);
  const ghostCompletion = predictQueryCompletion(query, limitedResults, lang);

  const followups = new Set<string>();
  for (const pq of copy.popularQueries) {
    if (normalizeSearchText(pq) !== normQuery) {
      followups.add(cleanDisplayText(pq, lang));
    }
    if (followups.size >= 3) break;
  }

  const lead = cleanDisplayText(INTENT_SUMMARY_BY_LANG[lang][pathway], lang);
  const overviewSteps: string[] = [];
  const seenSteps = new Set<string>();
  for (const res of scored.slice(0, 4)) {
    if (res.id.startsWith("glossary-romanes:")) continue;
    for (const step of res.nextSteps) {
      const cleanedStep = cleanDisplayText(step, lang);
      const normStep = normalizeSearchText(cleanedStep);
      if (cleanedStep && normStep && !seenSteps.has(normStep)) {
        seenSteps.add(normStep);
        overviewSteps.push(cleanedStep);
      }
      if (overviewSteps.length >= 3) break;
    }
    if (overviewSteps.length >= 3) break;
  }

  const topOverviewResult = limitedResults[0] ?? scored[0];
  const guidedOverview: SmartSearchGuidedOverview | null = topOverviewResult
    ? {
        lead,
        steps: overviewSteps,
        primaryAction: {
          label:
            topOverviewResult.title.length <= 28
              ? topOverviewResult.title
              : copy.openPageLabel,
          href: topOverviewResult.href,
        },
      }
    : null;

  const relatedQuestions: SmartSearchRelatedQuestion[] = [];
  const seenQuestions = new Set<string>([normQuery, normalizeSearchText(lead)]);
  const pushRelatedPair = (
    res: SmartSearchResult,
    pairIdx: number,
    pair: { question: string; answer: string },
  ) => {
    const normQ = normalizeSearchText(pair.question);
    if (!normQ || seenQuestions.has(normQ)) return;
    seenQuestions.add(normQ);
    relatedQuestions.push({
      id: `${res.id}:q${pairIdx}`,
      question: pair.question,
      answer: pair.answer,
      href: res.href,
      linkLabel: res.title.length <= 26 ? res.title : copy.openPageLabel,
    });
  };

  for (const preferDistinctQuestions of [true, false]) {
    if (relatedQuestions.length >= 4) break;
    for (const res of scored.slice(0, 12)) {
      if (relatedQuestions.length >= 4) break;
      const entry = index.entryMap.get(res.id);
      if (!entry?.qaPairs.length) continue;
      entry.qaPairs.forEach((pair, pairIdx) => {
        if (relatedQuestions.length >= 4) return;
        const isDistinctFromTitle = normalizeSearchText(pair.question) !== entry.normTitle;
        if (preferDistinctQuestions && !isDistinctFromTitle) return;
        pushRelatedPair(res, pairIdx, pair);
      });
    }
  }

  // Ensure every category key exists in groupedCounts
  for (const cat of ALL_CATEGORIES) {
    groupedCounts[cat] = groupedCounts[cat] ?? 0;
  }

  return {
    results: limitedResults,
    groupedCounts,
    didYouMean,
    ghostCompletion,
    isEmergency,
    suggestedFollowups: Array.from(followups).slice(0, 3),
    intentSummary: lead,
    guidedOverview,
    relatedQuestions,
  };
}
