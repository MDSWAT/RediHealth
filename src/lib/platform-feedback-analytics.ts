import type { Lang } from "@/lib/i18n/translations";
import { RATING_KEYS, type PlatformFeedbackItem } from "@/lib/platform-feedback-shared";

export type PlatformFeedbackRow = PlatformFeedbackItem;

export type FeedbackKeywordWeight = 1 | 2 | 3 | 4 | 5;

export type FeedbackKeyword = {
  term: string;
  normalized: string;
  count: number;
  weight: FeedbackKeywordWeight;
  matchedIds: string[];
};

export type FeedbackTrendGranularity = "day" | "week";

export type FeedbackTrendBucket = {
  key: string;
  label: string;
  count: number;
  avgRating: number;
};

export type FeedbackTrends = {
  granularity: FeedbackTrendGranularity;
  buckets: FeedbackTrendBucket[];
};

export type SatisfactionTierBucket = {
  count: number;
  sharePct: number;
};

export type FeedbackPageBreakdown = {
  pagePath: string;
  count: number;
  avgRating: number;
};

export type FeedbackLanguageBreakdown = {
  lang: Lang;
  count: number;
  avgRating: number;
};

export type FeedbackBreakdowns = {
  total: number;
  tiers: {
    positive: SatisfactionTierBucket;
    neutral: SatisfactionTierBucket;
    needsAttention: SatisfactionTierBucket;
  };
  byPage: FeedbackPageBreakdown[];
  byLanguage: FeedbackLanguageBreakdown[];
};

const REDACTION_TOKEN_RE = /\[(?:date-anonimizate|link-eliminat)\]/gi;
const URL_RE = /\b(?:https?:\/\/|www\.)[^\s<>"]+/gi;
const EMAIL_RE = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
const CLAUSE_SPLIT_RE = /[.,;:!?()[\]{}"“”„«»/\\|\n\r]+/g;
const RAW_TOKEN_RE = /[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu;
const HAS_LETTER_RE = /\p{L}/u;
const LEADING_ELISION_RE = /^[\p{L}]{1,2}['’]/u;
const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Curated multilingual stopwords across all 7 RediHealth languages
 * (ro, en, sq, it, hr, rom, ru), stored in normalized form.
 */
const MULTILINGUAL_STOPWORDS = new Set<string>([
  // Romanian (ro)
  "aceasta", "aceastea", "acel", "acela", "acelea", "acest", "acesta", "aceste", "acestea",
  "acum", "aici", "alt", "alta", "alte", "alti", "am", "are", "astfel", "asupra", "atunci",
  "avea", "avem", "aveti", "bine", "buna", "ca", "cam", "cand", "care", "cat", "cate", "cati",
  "catre", "ce", "cea", "cei", "cel", "cele", "ceva", "chiar", "cine", "cu", "cum", "daca",
  "dar", "dat", "de", "deci", "deja", "despre", "din", "dintre", "doar", "dupa", "ea", "ei",
  "el", "ele", "era", "erau", "este", "eu", "face", "fara", "fi", "fie", "fii", "fim", "fost",
  "foarte", "in", "inainte", "inca", "intre", "la", "le", "li", "lor", "lui", "ma", "mai",
  "mea", "mei", "mele", "meu", "mi", "mie", "mult", "multa", "multe", "multi", "ne", "ni",
  "nici", "nimic", "noastra", "noastre", "noi", "nostri", "nostru", "nu", "o", "or", "ori",
  "orice", "pe", "pentru", "peste", "poate", "pot", "prea", "prin", "printre", "putem", "putin",
  "sa", "sai", "sale", "sau", "se", "si", "sunt", "suntem", "sunteti", "ta", "tale", "tau",
  "te", "ti", "toata", "toate", "tot", "toti", "totusi", "trebuie", "tu", "un", "una", "unde",
  "unei", "unor", "unui", "va", "voi", "vom", "vor", "vrea", "vreau", "vrei", "vrem", "vreti",
  "mi-ar", "ti-ar", "s-ar", "nu-mi", "n-am", "l-am", "i-am", "s-a", "intr-o", "intr-un",
  // English (en)
  "about", "above", "after", "again", "against", "all", "also", "am", "an", "and", "any",
  "are", "aren't", "around", "as", "at", "be", "because", "been", "before", "being", "below",
  "between", "both", "but", "by", "can", "can't", "cannot", "could", "couldn't", "did",
  "didn't", "do", "does", "doesn't", "doing", "don't", "down", "during", "each", "even",
  "few", "for", "from", "further", "get", "got", "had", "hadn't", "has", "hasn't", "have",
  "haven't", "having", "he", "her", "here", "hers", "herself", "him", "himself", "his", "how",
  "i'd", "i'll", "i'm", "i've", "if", "in", "into", "is", "isn't", "it", "it's", "its",
  "itself", "just", "like", "make", "may", "me", "might", "more", "most", "much", "must",
  "my", "myself", "need", "no", "nor", "not", "now", "of", "off", "on", "once", "one", "only",
  "or", "other", "our", "ours", "ourselves", "out", "over", "own", "really", "same", "see",
  "she", "should", "shouldn't", "so", "some", "still", "such", "than", "that", "that's",
  "the", "their", "theirs", "them", "themselves", "then", "there", "these", "they", "they're",
  "this", "those", "through", "to", "too", "under", "until", "up", "use", "very", "want",
  "was", "wasn't", "we", "we're", "were", "weren't", "what", "when", "where", "which", "while",
  "who", "whom", "why", "will", "with", "won't", "would", "wouldn't", "you", "you're", "your",
  "yours", "yourself", "yourselves",
  // Albanian (sq)
  "ajo", "ata", "ato", "ai", "as", "asnje", "ate", "aty", "bere", "cdo", "cfare", "cila",
  "cilen", "cilet", "cili", "deri", "dhe", "disa", "do", "duhet", "duke", "edhe", "ende",
  "eshte", "gjate", "gjithashtu", "gjithe", "ishte", "jam", "jane", "jemi", "jeni", "jo", "ju",
  "ka", "kam", "kane", "ke", "kemi", "keni", "ketij", "keto", "ketu", "kjo", "ku", "kur",
  "kush", "ky", "me", "mire", "mos", "mua", "mund", "na", "ndaj", "nder", "ne", "nese", "nga",
  "nje", "nuk", "ose", "pa", "pak", "para", "pas", "pasi", "per", "po", "por", "prandaj",
  "prej", "qe", "sa", "saj", "se", "sepse", "si", "shume", "te", "tek", "ti", "tij", "tone",
  "tyre", "une", "vetem",
  // Italian (it)
  "abbiamo", "agli", "al", "alla", "alle", "allo", "anche", "ancora", "avere", "bene", "che",
  "chi", "ci", "cio", "come", "con", "contro", "cosa", "cui", "da", "dagli", "dai", "dal",
  "dalla", "dalle", "dallo", "degli", "dei", "del", "della", "delle", "dello", "di", "dopo",
  "dove", "dunque", "durante", "ecco", "era", "erano", "essere", "fa", "fare", "fatto", "fino",
  "fra", "gli", "ha", "hai", "hanno", "ho", "il", "in", "invece", "io", "la", "le", "lei",
  "li", "lo", "loro", "lui", "ma", "mai", "me", "meglio", "meno", "mentre", "mi", "mia",
  "mie", "miei", "mio", "molto", "ne", "negli", "nei", "nel", "nella", "nelle", "nello",
  "nemmeno", "nessuno", "noi", "non", "nostra", "nostre", "nostri", "nostro", "o", "ogni",
  "oltre", "oppure", "ora", "per", "perche", "pero", "piu", "poco", "poi", "posso", "prima",
  "proprio", "puo", "quale", "quali", "quando", "quanto", "quasi", "quei", "quel", "quella",
  "quelle", "quelli", "quello", "questa", "queste", "questi", "questo", "qui", "quindi", "se",
  "secondo", "sei", "sempre", "senza", "si", "sia", "siamo", "siete", "solo", "sono", "sopra",
  "sotto", "stato", "su", "sua", "sue", "sugli", "sui", "sul", "sulla", "sulle", "sullo",
  "suo", "suoi", "tanto", "te", "ti", "tra", "troppo", "tu", "tua", "tue", "tuo", "tuoi",
  "tutta", "tutte", "tutti", "tutto", "un", "una", "uno", "va", "verso", "vi", "voi", "vorrei",
  "vostra", "vostro",
  // Croatian (hr)
  "ako", "ali", "bas", "bez", "bi", "bih", "bila", "bili", "bilo", "bio", "bismo", "biste",
  "biti", "bude", "ce", "cemo", "ces", "cete", "cu", "da", "dakle", "danas", "do", "dobro",
  "dok", "gdje", "ga", "iako", "ili", "ima", "imaju", "imam", "imamo", "imate", "ipak", "ispod",
  "iz", "iza", "izmedu", "iznad", "ja", "jako", "je", "jedan", "jedna", "jedno", "jer", "jesam",
  "jesi", "jesmo", "jeste", "jesu", "jos", "ju", "kad", "kada", "kako", "kao", "kroz", "koja",
  "koje", "kojeg", "kojem", "koji", "kojih", "kojim", "kojoj", "koju", "kod", "li", "malo",
  "manje", "me", "medu", "mene", "meni", "mi", "mnogo", "mogu", "moj", "moja", "moje", "moze",
  "mozemo", "mozete", "mu", "na", "nad", "nakon", "nam", "nama", "nas", "nasa", "nase", "ne",
  "nece", "nego", "neka", "neke", "neki", "neko", "nema", "nesto", "ni", "nije", "nijedan",
  "nikad", "nisam", "nisi", "nismo", "niste", "nisu", "niti", "njih", "njima", "od", "odmah",
  "oko", "on", "ona", "onda", "one", "oni", "ono", "osim", "ova", "ovaj", "ovdje", "ove", "ovi",
  "ovo", "pa", "po", "pod", "pored", "poslije", "preko", "prema", "pri", "prije", "puno",
  "radi", "sa", "sad", "sada", "sam", "samo", "se", "sebe", "sebi", "si", "smo", "sta", "ste",
  "sto", "su", "sva", "svaka", "svaki", "svako", "sve", "svi", "svih", "svim", "svoj", "svoja",
  "svoje", "ta", "tada", "taj", "tako", "tamo", "te", "tek", "ti", "to", "toga", "toliko",
  "tome", "treba", "tu", "tvoj", "tvoja", "tvoje", "uz", "vam", "vama", "vas", "vasa", "vase",
  "vec", "vi", "vise", "vrlo", "za", "zasto", "zato", "zbog", "zelim",
  // Romani (rom)
  "akana", "amen", "amenge", "amaro", "amari", "amare", "ande", "ando", "andar", "aver",
  "bi", "but", "chiro", "chiri", "chire", "dji", "ekh", "godi", "inke", "kadala", "kadava",
  "kadaya", "kaj", "kana", "karing", "kasavi", "kasavo", "katar", "kava", "khanci", "ki",
  "ko", "le", "len", "lenge", "maj", "man", "mange", "me", "na", "nashti", "ni", "palal",
  "pale", "pe", "sar", "sas", "savi", "savo", "save", "savore", "shaj", "si", "so", "sode",
  "te", "thaj", "tu", "tuke", "tume", "tut", "vaj", "vash", "vi", "von", "xantsi",
  // Russian (ru) — normalized lowercase with ё->е (preserving й)
  "без", "более", "будет", "будут", "будто", "был", "была", "были", "было", "быть", "вам",
  "вами", "вас", "ваш", "ваша", "ваше", "ваши", "ведь", "весь", "вместе", "вне", "вниз",
  "во", "возле", "вокруг", "вот", "впрочем", "все", "всегда", "всего", "всех", "всю", "вся",
  "вы", "где", "да", "даже", "для", "до", "другой", "его", "ее", "ей", "ему", "если", "есть",
  "еще", "же", "за", "затем", "зато", "здесь", "из", "или", "им", "именно", "иногда", "их",
  "как", "какая", "какие", "какой", "когда", "кого", "ком", "кому", "которая", "которого",
  "которой", "котором", "которую", "которые", "который", "которым", "которых", "кроме", "кто",
  "куда", "ли", "либо", "лишь", "между", "менее", "меня", "мне", "много", "мог", "могла",
  "могли", "может", "можно", "мой", "моя", "мое", "мои", "мы", "на", "над", "надо", "нам",
  "нами", "нас", "наш", "наша", "наше", "наши", "не", "него", "нее", "ней", "нельзя", "нем",
  "нему", "нет", "ни", "нибудь", "никогда", "ним", "ними", "них", "ничего", "но", "ну",
  "нужно", "об", "обо", "однако", "около", "он", "она", "они", "оно", "опять", "от", "откуда",
  "отсюда", "очень", "перед", "по", "под", "после", "потом", "потому", "почти", "при", "про",
  "просто", "раз", "разве", "рядом", "сам", "сама", "сами", "само", "самого", "самой", "самом",
  "саму", "свой", "своя", "свое", "свои", "себе", "себя", "сейчас", "сквозь", "слишком",
  "снова", "со", "собой", "совсем", "среди", "так", "такая", "такие", "такой", "там", "тебе",
  "тебя", "тем", "теперь", "то", "тобой", "тогда", "того", "тоже", "той", "только", "том",
  "тому", "тот", "ту", "туда", "тут", "ты", "уж", "уже", "хотя", "чего", "чем", "через",
  "что", "чтоб", "чтобы", "чуть", "эта", "эти", "этим", "этих", "это", "этого", "этой",
  "этом", "этот", "эту",
]);

export function getFeedbackRowAverage(item: PlatformFeedbackItem): number {
  let sum = 0;
  let valid = 0;
  for (const key of RATING_KEYS) {
    const score = item[key];
    if (typeof score === "number" && Number.isFinite(score) && score >= 1 && score <= 5) {
      sum += score;
      valid += 1;
    }
  }
  if (valid > 0) return sum / valid;
  return typeof item.average_rating === "number" && Number.isFinite(item.average_rating)
    ? item.average_rating
    : 0;
}

/**
 * Normalizes a word across Latin (with diacritics) and Cyrillic scripts.
 * - Latin diacritics are folded (ă/â->a, ș->s, ț->t, ë->e, č/ć->c, đ->d, etc.).
 * - Cyrillic letters are preserved in lowercase, folding only ё->е (never corrupting й).
 */
export function normalizeFeedbackToken(raw: string): string {
  const lower = raw.trim().toLowerCase();
  let result = "";
  for (const char of lower) {
    const code = char.codePointAt(0) ?? 0;
    // Cyrillic block: preserve distinct Cyrillic letters (like й), fold ё -> е
    if (code >= 0x0400 && code <= 0x04ff) {
      result += char === "ё" ? "е" : char;
      continue;
    }
    if (char === "đ") {
      result += "d";
      continue;
    }
    if (char === "ł") {
      result += "l";
      continue;
    }
    const stripped = char.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    result += stripped;
  }
  return result;
}

function stripLeadingElision(token: string): string {
  // Handle Italian/Albanian/Romanian elisions like l'applicazione, un'app, d'uso -> applicazione, app, uso
  // while keeping English contractions (don't, can't) intact for stopword matching first.
  const normalizedWhole = normalizeFeedbackToken(token);
  if (MULTILINGUAL_STOPWORDS.has(normalizedWhole)) {
    return token;
  }
  if (LEADING_ELISION_RE.test(token)) {
    const candidate = token.replace(LEADING_ELISION_RE, "");
    if (candidate.length >= 3) {
      return candidate;
    }
  }
  return token;
}

function isValidKeywordToken(display: string, normalized: string): boolean {
  if (normalized.length < 3) return false;
  if (!HAS_LETTER_RE.test(display)) return false;
  if (MULTILINGUAL_STOPWORDS.has(normalized)) return false;
  return true;
}

function computeKeywordWeight(count: number, minCount: number, maxCount: number): FeedbackKeywordWeight {
  if (maxCount <= minCount) return 3;
  const ratio = (count - minCount) / (maxCount - minCount);
  const scaled = Math.round(1 + ratio * 4);
  if (scaled <= 1) return 1;
  if (scaled === 2) return 2;
  if (scaled === 3) return 3;
  if (scaled === 4) return 4;
  return 5;
}

function pickBestDisplayForm(forms: Map<string, number>, normalized: string): string {
  let best = normalized;
  let bestCount = -1;
  let bestHasDiacritics = false;

  for (const [form, freq] of forms.entries()) {
    const hasDiacritics = form !== normalized;
    if (
      freq > bestCount ||
      (freq === bestCount && hasDiacritics && !bestHasDiacritics) ||
      (freq === bestCount && hasDiacritics === bestHasDiacritics && form.localeCompare(best) < 0)
    ) {
      best = form;
      bestCount = freq;
      bestHasDiacritics = hasDiacritics;
    }
  }
  return best;
}

/**
 * Extracts weighted keywords and recurring 2-word phrases (>= 2 matching comments)
 * from open_feedback across all 7 languages.
 */
export function extractFeedbackKeywords(
  items: readonly PlatformFeedbackItem[],
  options: { maxTerms?: number } = {},
): FeedbackKeyword[] {
  const maxTerms = Math.max(1, options.maxTerms ?? 24);

  type TermAccumulator = {
    isBigram: boolean;
    matchedIds: Set<string>;
    displayCounts: Map<string, number>;
  };

  const acc = new Map<string, TermAccumulator>();

  const recordTerm = (normalized: string, display: string, itemId: string, isBigram: boolean) => {
    let entry = acc.get(normalized);
    if (!entry) {
      entry = { isBigram, matchedIds: new Set<string>(), displayCounts: new Map<string, number>() };
      acc.set(normalized, entry);
    }
    entry.matchedIds.add(itemId);
    entry.displayCounts.set(display, (entry.displayCounts.get(display) ?? 0) + 1);
  };

  for (const item of items) {
    const raw = item.open_feedback?.trim();
    if (!raw) continue;

    const cleaned = raw
      .replace(REDACTION_TOKEN_RE, " ")
      .replace(URL_RE, " ")
      .replace(EMAIL_RE, " ");

    const clauses = cleaned.split(CLAUSE_SPLIT_RE);

    for (const clause of clauses) {
      const rawMatches = clause.match(RAW_TOKEN_RE);
      if (!rawMatches || rawMatches.length === 0) continue;

      let prevValid: { display: string; normalized: string } | null = null;

      for (const rawToken of rawMatches) {
        const cleanedToken = stripLeadingElision(rawToken);
        const display = cleanedToken.toLowerCase();
        const normalized = normalizeFeedbackToken(display);

        if (!isValidKeywordToken(display, normalized)) {
          // Stopwords or short tokens break bigram adjacency
          prevValid = null;
          continue;
        }

        recordTerm(normalized, display, item.id, false);

        if (prevValid && prevValid.normalized !== normalized) {
          const bigramNorm = `${prevValid.normalized} ${normalized}`;
          const bigramDisplay = `${prevValid.display} ${display}`;
          recordTerm(bigramNorm, bigramDisplay, item.id, true);
        }

        prevValid = { display, normalized };
      }
    }
  }

  const candidates = Array.from(acc.entries())
    .filter(([, entry]) => (!entry.isBigram ? entry.matchedIds.size >= 1 : entry.matchedIds.size >= 2))
    .map(([normalized, entry]) => ({
      term: pickBestDisplayForm(entry.displayCounts, normalized),
      normalized,
      count: entry.matchedIds.size,
      matchedIds: Array.from(entry.matchedIds),
    }))
    .sort((a, b) => b.count - a.count || a.normalized.localeCompare(b.normalized))
    .slice(0, maxTerms);

  if (candidates.length === 0) return [];

  const minCount = candidates[candidates.length - 1].count;
  const maxCount = candidates[0].count;

  return candidates.map((entry) => ({
    ...entry,
    weight: computeKeywordWeight(entry.count, minCount, maxCount),
  }));
}

function toUtcDateKey(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function toUtcWeekStartDate(date: Date): Date {
  const utcDay = date.getUTCDay(); // 0 = Sun, 1 = Mon, ...
  const diffToMonday = utcDay === 0 ? -6 : 1 - utcDay;
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + diffToMonday));
}

function formatTrendBucketLabel(isoDateKey: string, locale: string): string {
  const [y, m, d] = isoDateKey.split("-").map(Number);
  const utcDate = new Date(Date.UTC(y, (m || 1) - 1, d || 1));
  const safeLocale = locale === "rom" ? "ro-RO" : locale;
  try {
    return new Intl.DateTimeFormat(safeLocale, {
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    }).format(utcDate);
  } catch {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    }).format(utcDate);
  }
}

/**
 * Computes chronological daily or weekly trend buckets from created_at.
 * Uses daily buckets when date span <= 21 days or unique days <= 14; weekly otherwise.
 */
export function computeFeedbackTrends(
  items: readonly PlatformFeedbackItem[],
  locale = "en-US",
): FeedbackTrends {
  const datedItems: Array<{ date: Date; dayMs: number; dayKey: string; avg: number }> = [];

  for (const item of items) {
    const parsed = new Date(item.created_at);
    if (Number.isNaN(parsed.getTime())) continue;
    const dayKey = toUtcDateKey(parsed);
    const dayMs = Date.UTC(parsed.getUTCFullYear(), parsed.getUTCMonth(), parsed.getUTCDate());
    datedItems.push({
      date: parsed,
      dayMs,
      dayKey,
      avg: getFeedbackRowAverage(item),
    });
  }

  if (datedItems.length === 0) {
    return { granularity: "day", buckets: [] };
  }

  let minDayMs = datedItems[0].dayMs;
  let maxDayMs = datedItems[0].dayMs;
  const uniqueDays = new Set<string>();

  for (const entry of datedItems) {
    if (entry.dayMs < minDayMs) minDayMs = entry.dayMs;
    if (entry.dayMs > maxDayMs) maxDayMs = entry.dayMs;
    uniqueDays.add(entry.dayKey);
  }

  const spanDays = Math.round((maxDayMs - minDayMs) / DAY_MS);
  const granularity: FeedbackTrendGranularity =
    spanDays <= 21 || uniqueDays.size <= 14 ? "day" : "week";

  const bucketMap = new Map<string, { count: number; ratingSum: number }>();

  for (const entry of datedItems) {
    const key =
      granularity === "day"
        ? entry.dayKey
        : toUtcDateKey(toUtcWeekStartDate(entry.date));

    const existing = bucketMap.get(key);
    if (existing) {
      existing.count += 1;
      existing.ratingSum += entry.avg;
    } else {
      bucketMap.set(key, { count: 1, ratingSum: entry.avg });
    }
  }

  const buckets: FeedbackTrendBucket[] = Array.from(bucketMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, stats]) => ({
      key,
      label: formatTrendBucketLabel(key, locale),
      count: stats.count,
      avgRating: Number((stats.ratingSum / stats.count).toFixed(2)),
    }));

  return { granularity, buckets };
}

/**
 * Computes satisfaction tiers (positive >= 4.0, neutral 3.0..3.99, needsAttention < 3.0),
 * top 8 pages by response count, and language breakdown by response count.
 */
export function computeFeedbackBreakdowns(
  items: readonly PlatformFeedbackItem[],
): FeedbackBreakdowns {
  const total = items.length;
  let positiveCount = 0;
  let neutralCount = 0;
  let needsAttentionCount = 0;

  const pageMap = new Map<string, { count: number; ratingSum: number }>();
  const langMap = new Map<Lang, { count: number; ratingSum: number }>();

  for (const item of items) {
    const avg = getFeedbackRowAverage(item);
    if (avg >= 4.0) {
      positiveCount += 1;
    } else if (avg >= 3.0) {
      neutralCount += 1;
    } else {
      needsAttentionCount += 1;
    }

    const pagePath = item.page_path?.trim() || "/";
    const pageEntry = pageMap.get(pagePath);
    if (pageEntry) {
      pageEntry.count += 1;
      pageEntry.ratingSum += avg;
    } else {
      pageMap.set(pagePath, { count: 1, ratingSum: avg });
    }

    const langEntry = langMap.get(item.lang);
    if (langEntry) {
      langEntry.count += 1;
      langEntry.ratingSum += avg;
    } else {
      langMap.set(item.lang, { count: 1, ratingSum: avg });
    }
  }

  const sharePct = (count: number) => (total > 0 ? Math.round((count / total) * 100) : 0);

  const byPage: FeedbackPageBreakdown[] = Array.from(pageMap.entries())
    .map(([pagePath, stats]) => ({
      pagePath,
      count: stats.count,
      avgRating: Number((stats.ratingSum / stats.count).toFixed(2)),
    }))
    .sort((a, b) => b.count - a.count || a.pagePath.localeCompare(b.pagePath))
    .slice(0, 8);

  const byLanguage: FeedbackLanguageBreakdown[] = Array.from(langMap.entries())
    .map(([lang, stats]) => ({
      lang,
      count: stats.count,
      avgRating: Number((stats.ratingSum / stats.count).toFixed(2)),
    }))
    .sort((a, b) => b.count - a.count || a.lang.localeCompare(b.lang));

  return {
    total,
    tiers: {
      positive: { count: positiveCount, sharePct: sharePct(positiveCount) },
      neutral: { count: neutralCount, sharePct: sharePct(neutralCount) },
      needsAttention: { count: needsAttentionCount, sharePct: sharePct(needsAttentionCount) },
    },
    byPage,
    byLanguage,
  };
}
