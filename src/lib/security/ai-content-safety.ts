import { isPromptInjectionAttempt } from "@/lib/health-assistant";

export type AbuseCategory =
  | "hate_speech"
  | "sexual_abuse"
  | "violent_threat"
  | "severe_profanity"
  | "profanity"
  | "prompt_injection";

export type ContentSafetyResult =
  | { action: "allow" }
  | { action: "warn" | "block_immediately"; category: AbuseCategory };

export type NormalizedSafetyViews = {
  plain: string;
  homoglyphPlain: string;
  deobfuscated: string;
  variants: string[];
  squashed: string[];
  compact: string;
  compactVariants: string[];
};

const INVISIBLE_FORMAT_CHARS_RE =
  /[\u00AD\u034F\u061C\u115F\u1160\u17B4\u17B5\u180E\u200B-\u200F\u202A-\u202E\u2060-\u206F\uFE00-\uFE0F\uFEFF]/g;
const COMBINING_MARKS_RE =
  /[\u0300-\u036f\u0483-\u0489\u1AB0-\u1AFF\u1DC0-\u1DFF\u20D0-\u20FF\uFE20-\uFE2F]/g;

const CYRILLIC_TO_LATIN_MAP: Record<string, string> = {
  а: "a",
  в: "b",
  е: "e",
  и: "u",
  і: "i",
  ї: "i",
  ј: "j",
  к: "k",
  м: "m",
  н: "h",
  о: "o",
  п: "n",
  р: "p",
  с: "c",
  т: "t",
  у: "y",
  х: "x",
  ѕ: "s",
  һ: "h",
  ѵ: "v",
};

const GREEK_TO_LATIN_MAP: Record<string, string> = {
  α: "a",
  β: "b",
  ε: "e",
  η: "n",
  ι: "i",
  κ: "k",
  μ: "m",
  ν: "v",
  ο: "o",
  ρ: "p",
  σ: "s",
  ς: "s",
  τ: "t",
  υ: "u",
  χ: "x",
};

const LATIN_TO_CYRILLIC_BASE_MAP: Record<string, string> = {
  a: "а",
  b: "б",
  c: "с",
  e: "е",
  h: "н",
  i: "и",
  k: "к",
  m: "м",
  o: "о",
  p: "р",
  t: "т",
  x: "х",
  y: "у",
  "0": "о",
  "1": "и",
  "!": "и",
  "3": "з",
  "4": "ч",
  "6": "б",
  "9": "я",
  "@": "а",
};

const LEET_I_MAP: Record<string, string> = {
  "@": "a",
  "4": "a",
  "3": "e",
  "€": "e",
  "1": "i",
  "!": "i",
  "|": "i",
  "¡": "i",
  "0": "o",
  "$": "s",
  "5": "s",
  "7": "t",
  "+": "t",
  "8": "b",
};

const LEET_L_MAP: Record<string, string> = {
  ...LEET_I_MAP,
  "1": "l",
  "|": "l",
};

const NUMERIC_LEET_MAP: Record<string, string> = {
  "0": "o",
  "3": "e",
  "4": "a",
  "5": "s",
  "7": "t",
  "8": "b",
};

const DOMAIN_OR_FILE_EXT_RE =
  /\.(?:com|org|net|edu|gov|int|eu|ro|it|hr|ru|al|uk|de|fr|io|co|info|biz|pdf|png|jpg|jpeg|webp|html|php|js|css|json)$/i;

const HAS_LATIN_RE = /[a-z]/;
const HAS_CYRILLIC_RE = /[а-яйіїєґ]/;
const HAS_GREEK_RE = /[α-ω]/;
const HAS_LATIN_OR_LEET_RE = /[a-z@$013456789!|€¡+]/;

function stripSeparatedLetterRuns(input: string): string {
  // Collapse spaced single characters: "f u c k", "m u i e", "п и з д е ц", "v a f f a n c u l o".
  let out = input.replace(
    /(?<![\p{L}\p{N}])([\p{L}\p{N}](?:\s+[\p{L}\p{N}]){2,})(?![\p{L}\p{N}])/gu,
    (segment) => {
      const letters = segment.match(/\p{L}/gu);
      return letters && letters.length >= 2 ? segment.replace(/\s+/g, "") : segment;
    },
  );

  // Collapse punctuated/delimited single-character runs (including mixed spaces/symbols): "f.u.c.k", "f / u / c / k", "f . u c k", "б.л.я.т.ь", "n-1-g-g-3-r".
  out = out.replace(
    /(?<![\p{L}\p{N}])([\p{L}\p{N}@$!|+](?:(?:\s*[*_.~:/\\|+=-]\s*|\s+)[\p{L}\p{N}@$!|+]){2,})(?![\p{L}\p{N}])/gu,
    (segment) => {
      const letters = segment.match(/\p{L}/gu);
      if (!letters || letters.length < 2) return segment;
      return segment.replace(/[\s*_.~:/\\|+=-]+/g, "");
    },
  );

  // Collapse short syllable splits like "fu.ck", "p.u.la", "sh_it", "б.лять", "п_из_дец" without collapsing URLs/domains or dates.
  out = out.replace(
    /(?<![\p{L}\p{N}/:])((?:[\p{L}\p{N}@$!|+]{1,5}[._~/-]){1,6}[\p{L}\p{N}@$!|+]{1,5})(?![\p{L}\p{N}/])/gu,
    (segment) => {
      if (DOMAIN_OR_FILE_EXT_RE.test(segment)) return segment;
      const letters = segment.match(/\p{L}/gu);
      if (!letters || letters.length < 3) return segment;
      return segment.replace(/[._~/-]+/g, "");
    },
  );

  return out;
}

function foldHomoglyphTokens(input: string): {
  latinFolded: string;
  cyrillicFoldedI: string;
  cyrillicFoldedU: string;
} {
  const tokens = input.split(/(\s+)/);
  const latinOut: string[] = [];
  const cyrIOut: string[] = [];
  const cyrUOut: string[] = [];

  for (const token of tokens) {
    if (!token || /^\s+$/.test(token)) {
      latinOut.push(token);
      cyrIOut.push(token);
      cyrUOut.push(token);
      continue;
    }

    const hasLatin = HAS_LATIN_RE.test(token);
    const hasCyrillic = HAS_CYRILLIC_RE.test(token);
    const hasGreek = HAS_GREEK_RE.test(token);
    const hasLatinOrLeet = HAS_LATIN_OR_LEET_RE.test(token);

    // Only fold Cyrillic/Greek characters to Latin when mixed with Latin or leetspeak
    // so pure Cyrillic words like "соски" (nipples) or "секс" never turn into English false positives.
    if ((hasCyrillic || hasGreek) && hasLatinOrLeet) {
      latinOut.push(
        token.replace(/[а-яйіїєґα-ω]/g, (ch) => CYRILLIC_TO_LATIN_MAP[ch] ?? GREEK_TO_LATIN_MAP[ch] ?? ch),
      );
    } else {
      latinOut.push(token);
    }

    // Only fold Latin/leet lookalikes to Cyrillic when the token already contains Cyrillic characters.
    if (hasCyrillic && (hasLatin || hasLatinOrLeet)) {
      cyrIOut.push(
        token.replace(/[a-z013469!@]/g, (ch) =>
          ch === "u" ? "и" : (LATIN_TO_CYRILLIC_BASE_MAP[ch] ?? ch),
        ),
      );
      cyrUOut.push(
        token.replace(/[a-z013469!@]/g, (ch) =>
          ch === "u" ? "у" : (LATIN_TO_CYRILLIC_BASE_MAP[ch] ?? ch),
        ),
      );
    } else {
      cyrIOut.push(token);
      cyrUOut.push(token);
    }
  }

  return {
    latinFolded: latinOut.join(""),
    cyrillicFoldedI: cyrIOut.join(""),
    cyrillicFoldedU: cyrUOut.join(""),
  };
}

function applyLeetspeakInLetterTokens(input: string, map: Record<string, string>, preserveWildcards = false): string {
  const tokenRe = preserveWildcards ? /[^\s]+/g : /[\p{L}\p{N}@$!|+€¡]+/gu;
  return input.replace(tokenRe, (token) => {
    if (!HAS_LATIN_RE.test(token)) return token;
    return token.replace(/[@$0134578!|+€¡]/g, (ch) => map[ch] ?? ch);
  });
}

function dedupRepeatedLetters(input: string, keepCount: 1 | 2): string {
  return keepCount === 2
    ? input.replace(/([\p{L}])\1{2,}/gu, "$1$1")
    : input.replace(/([\p{L}])\1+/gu, "$1");
}

function stripNonAlnum(input: string): string {
  return input.replace(/[^\p{L}\p{N}]+/gu, "");
}

function uniqueNonEmpty(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean)));
}

/**
 * Multi-view text normalizer for content safety:
 * preserves clinical terms and numbers while exposing hidden zero-width, Zalgo,
 * fullwidth, homoglyph, spaced, punctuated, stretched, and leetspeak evasions.
 */
export function normalizeForSafety(text: string): NormalizedSafetyViews {
  // Protect Cyrillic "й" before NFKD so "й" does not decompose to "и" + breve and vanish on diacritic stripping.
  const preNormalized = text
    .replace(INVISIBLE_FORMAT_CHARS_RE, "")
    .normalize("NFC")
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/й/g, "\uE001")
    .replace(/đ/g, "dj")
    .replace(/ð/g, "d")
    .replace(/ł/g, "l")
    .replace(/ø/g, "o")
    .replace(/ß/g, "ss");

  const plain = preNormalized
    .normalize("NFKD")
    .replace(COMBINING_MARKS_RE, "")
    .replace(/\uE001/g, "й")
    .replace(/\s+/g, " ")
    .trim();

  const plainFolded = foldHomoglyphTokens(plain);
  const homoglyphPlain = applyLeetspeakInLetterTokens(plainFolded.latinFolded, NUMERIC_LEET_MAP, true);

  const collapsed = stripSeparatedLetterRuns(plain);
  const collapsedFolded = foldHomoglyphTokens(collapsed);

  const leetI = applyLeetspeakInLetterTokens(collapsedFolded.latinFolded, LEET_I_MAP);
  const leetL = applyLeetspeakInLetterTokens(collapsedFolded.latinFolded, LEET_L_MAP);

  const deobfuscated = dedupRepeatedLetters(leetI, 2);
  const variants = uniqueNonEmpty([
    plainFolded.cyrillicFoldedI,
    plainFolded.cyrillicFoldedU,
    dedupRepeatedLetters(leetL, 2),
    dedupRepeatedLetters(collapsedFolded.cyrillicFoldedI, 2),
    dedupRepeatedLetters(collapsedFolded.cyrillicFoldedU, 2),
  ]);

  const squashed = uniqueNonEmpty([
    dedupRepeatedLetters(leetI, 1),
    dedupRepeatedLetters(leetL, 1),
    dedupRepeatedLetters(collapsedFolded.cyrillicFoldedI, 1),
    dedupRepeatedLetters(collapsedFolded.cyrillicFoldedU, 1),
  ]);

  const compact = stripNonAlnum(deobfuscated);
  const compactVariants = uniqueNonEmpty([compact, ...variants.map(stripNonAlnum)]);

  return {
    plain,
    homoglyphPlain,
    deobfuscated,
    variants,
    squashed,
    compact,
    compactVariants,
  };
}

function wordRegex(body: string): RegExp {
  return new RegExp(`(?<![\\p{L}\\p{N}_])(?:${body})(?![\\p{L}\\p{N}_])`, "u");
}

function compactRegex(body: string): RegExp {
  return new RegExp(`(?:${body})`, "u");
}

// ---------------------------------------------------------------------------
// Tier 1: Serious abuse -> immediate 72-hour device lockout on 1st offense
// ---------------------------------------------------------------------------

const HATE_SPEECH_PATTERN = wordRegex(
  [
    // English
    "n+i+g{2,}(?:e+r+|a+)s?",
    "kikes?",
    "chinks?",
    "spics?",
    "wetbacks?",
    "beaners?",
    "gooks?",
    "ragheads?",
    "towelheads?",
    "sand\\s+nigg(?:er|a)s?",
    "f+a+g{2,}o+t+s?",
    "faggots?",
    "fags?",
    "dykes?",
    "trann(?:y|ies)",
    "heil\\s+hitler",
    "sieg\\s+heil",
    "white\\s+power",
    "1488",
    "(?:gas|kill|burn|hang|exterminate)\\s+(?:all\\s+|the\\s+)?(?:jews|gypsies|roma|blacks|muslims|gays)",
    "gypsy\\s+scum",
    "subhuman\\s+(?:gyps|roma|race)",
    // Romanian
    "cioar[ae]",
    "cioro[iu](?:lor|i|le)?",
    "baragladin[ae]",
    "garoi(?:i|lor|ul)?",
    "(?:tigan|tigani|tiganc[ia])\\s+(?:imputit|borat|nenorocit|murdar|jegos|hot)[a-z]*",
    "moarte\\s+tiganilor",
    "jidani?",
    "bozgori?",
    "poponar(?:i|ule|ilor)?",
    // Russian (Cyrillic + Latin translit; careful to avoid "жидкость" or "педикулез")
    "хач(?:и|ей|ик|а)?",
    "чурк(?:а|и|у|ой)",
    "чурбан(?:ы|а|ов)?",
    "жид(?:ы|ов|а|яра|овка)?",
    "черножоп[а-я]*",
    "узкоглаз[а-я]*",
    "пиндос(?:ы|ов|а)?",
    "хох(?:ол|лы|лов|ла)",
    "кацап(?:ы|ов|а)?",
    "москал(?:ь|и|ей)",
    "пидор(?:ас(?:ы|ов|а)?|ы|а)?",
    "педик(?:и|ов|ам|ами|ах)?",
    "гомик(?:и|ов|а)?",
    "цыган(?:е|а|ам)?\\s+(?:вонюч|грязн|ебан)[а-я]*",
    "бей\\s+(?:жидов|цыган|хачей)",
    "khach(?:i|ik)?",
    "churk[ai]",
    "zhid(?:y|ov)?",
    "pidor(?:as[yi]?|y)?",
    "chernozhop[a-z]*",
    // Italian (never match culinary/medical "finocchio" unless overtly used as a slur insult)
    "(?:sporco|brutto|fottuto|pezzo\\s+di|ammazza\\s+i?)\\s+negr[oi]",
    "negracci[oa]?",
    "zingar[oa]\\s+(?:di\\s+merda|ladro|ladra|sporc[oa]|maledett[oa])",
    "froc(?:io|i|ione)",
    "ricchion(?:e|i)",
    "(?:sei\\s+un|brutto|fottuto)\\s+finocchio",
    // Croatian
    "cigan(?:i|e|u|in)\\s+(?:smrdljiv|prljav|lopov)[a-z]*",
    "peder(?:cina|chino|i|u|e)?",
    "za\\s+dom\\s+spremni",
    "ubij\\s+(?:srbina|cigana|pedera)",
    // Albanian
    "bythqir(?:e|a|i|at)?",
    "peder(?:a|at|i|in)?",
    "pederast(?:e|i|et)?",
    "(?:jevg|magjup|shkja|shkina)\\s+(?:i\\s+ndyr|mut|i\\s+qelbur)[a-z]*",
    // Romani
    "bulash(?:e|i)?",
  ].join("|"),
);

const SEXUAL_ABUSE_PATTERN = wordRegex(
  [
    // English (leaves medical anatomy, contraceptive queries, and assault victim care requests untouched)
    "child\\s+porn",
    "cp\\s+links?",
    "underage\\s+sex",
    "jailbait",
    "loli(?:con)?",
    "shotacon",
    "pedophil[a-z]*",
    "paedophil[a-z]*",
    "pedofil[a-z]*",
    "pedo",
    "show\\s+(?:me\\s+)?your\\s+(?:tits|boobs|pussy|dick|cock|ass|naked\\s+body)",
    "send\\s+(?:me\\s+)?nudes",
    "suck\\s+my\\s+(?:dick|cock|balls)",
    "lick\\s+my\\s+(?:pussy|balls|ass|clit)",
    "cum\\s+(?:on\\s+(?:me|you)|in\\s+(?:me|you)|inside\\s+me)",
    "sext\\s+with\\s+me",
    "roleplay\\s+sex",
    "masturbate\\s+(?:for|with)\\s+me",
    "finger\\s+yourself",
    "(?:i\\s+(?:will|want\\s+to)\\s+)?rape\\s+(?:you|children|kids)",
    // Romanian
    "pornografie\\s+infantila",
    "sex\\s+cu\\s+minori",
    "sugi\\s+pula",
    "sa[- ]?mi\\s+sugi",
    "linge(?:-?mi)?\\s+(?:pula|pizda|coaele)",
    "sa[- ]?ti\\s+o\\s+trag",
    "sati\\s+o\\s+trag",
    "da[- ]?mi\\s+poze\\s+nud",
    "dezbraca[- ]?te",
    "te\\s+violez",
    // Russian (Cyrillic + Latin translit)
    "детск(?:ое|ой|ую)\\s+порно",
    "цп\\s+ссылк[а-я]*",
    "педофил[а-я]*",
    "отсоси(?:\\s+(?:у\\s+меня|мне|хуй))?",
    "соси\\s+(?:мой\\s+)?хуй",
    "покажи\\s+(?:сиськи|письку|пизду|член|жопу|голую)",
    "пришли\\s+(?:нюдсы|интим|голые\\s+фото)",
    "трахну\\s+тебя",
    "изнасилую\\s+тебя",
    "otsosi",
    "sosi\\s+huy",
    // Italian
    "pedopornograf[a-z]*",
    "sesso\\s+con\\s+minori",
    "succhia(?:mi)?\\s+il\\s+cazzo",
    "lecca(?:mi)?\\s+(?:la\\s+fica|la\\s+figa|le\\s+palle)",
    "mandami\\s+(?:foto\\s+nuda|nudes)",
    "fammi\\s+vedere\\s+le\\s+tette",
    "ti\\s+stupro",
    // Croatian
    "djecja\\s+pornografija",
    "seks\\s+s\\s+maloljetnic[a-z]*",
    "pusi\\s+(?:mi\\s+)?kurac",
    "popusi\\s+mi",
    "lizi\\s+mi",
    "posalji\\s+gole\\s+slike",
    "silovat\\s+cu\\s+te",
    // Albanian
    "pornografi\\s+me\\s+femije",
    "seks\\s+me\\s+te\\s+mitur",
    "ma\\s+thith\\s+karin",
    "lepi\\s+karin",
    "me\\s+dergo\\s+foto\\s+nudo",
    "do\\s+te\\s+perdhunoj",
    // Romani
    "[xh]as\\s+(?:mo|mro)\\s+kar",
    "chus\\s+(?:mo|mro)\\s+kar",
  ].join("|"),
);

const VIOLENT_THREAT_PATTERN = wordRegex(
  [
    // English (never matches clinical "pain is killing me" or personal crisis handled by 112)
    "(?:i\\s+(?:will|am\\s+going\\s+to|gonna)|we\\s+will)\\s+(?:kill|shoot|stab|murder|slaughter|bomb|execute)\\s+you",
    "(?:go\\s+)?kill\\s+yourself",
    "kys",
    "hang\\s+yourself",
    "blow\\s+up\\s+(?:your|the|a)\\s+(?:clinic|hospital|office|building|school)",
    "how\\s+to\\s+(?:make|build|craft)\\s+(?:a\\s+)?(?:bomb|explosive|pipe\\s+bomb|ied|ricin|molotov|cyanide\\s+poison)",
    "how\\s+to\\s+poison\\s+(?:someone|my\\s+(?:wife|husband|boss|neighbor))",
    // Romanian
    "(?:o\\s+sa\\s+)?te\\s+omor",
    "va\\s+omor",
    "iti\\s+tai\\s+gatul",
    "te\\s+impusc",
    "omoara(?:-?te|te)",
    "omora(?:-?te|te)",
    "arunc\\s+in\\s+aer\\s+(?:spitalul|clinica)",
    "cum\\s+(?:sa\\s+fac|faci)\\s+(?:o\\s+)?bomba",
    "cum\\s+sa\\s+otravesc\\s+pe\\s+cineva",
    // Russian (Cyrillic + Latin translit)
    "я\\s+тебя\\s+убью",
    "мы\\s+тебя\\s+убьем",
    "прирежу\\s+тебя",
    "застрелю\\s+тебя",
    "убей\\s+себя",
    "сдохни(?:\\s+тварь)?",
    "взорвать\\s+(?:больницу|клинику|школу)",
    "как\\s+сделать\\s+(?:бомбу|взрывчатку)",
    "ubey\\s+sebya",
    "ya\\s+tebya\\s+ubyu",
    // Italian
    "ti\\s+ammazzo",
    "vi\\s+ammazzo",
    "ti\\s+uccido",
    "ammazzati",
    "ucciditi",
    "sparati",
    "faccio\\s+saltare\\s+(?:l[' ]?ospedale|la\\s+clinica)",
    "come\\s+(?:fare|costruire)\\s+una\\s+bomba",
    "come\\s+avvelenare\\s+qualcuno",
    // Croatian
    "ubit\\s+cu\\s+te",
    "ubicu\\s+te",
    "ubij\\s+se",
    "zaklat\\s+cu\\s+te",
    "upucat\\s+cu\\s+te",
    "kako\\s+napraviti\\s+bombu",
    "kako\\s+otrovati\\s+nekoga",
    // Albanian
    "do\\s+te\\s+vras",
    "vrit\\s+veten",
    "vritu",
    "si\\s+te\\s+bej\\s+bombe",
    "si\\s+te\\s+helmoj\\s+dikend",
    // Romani
    "(?:te\\s+)?mudarav\\s+tut",
    "mudar\\s+tut",
  ].join("|"),
);

// Extreme targeted abusive phrases across all 7 languages (1st offense = 72h lockout).
// Standalone swearing and general insults live below in MODERATE_PROFANITY_PATTERN so users receive a warning first.
const SEVERE_PROFANITY_PATTERN = wordRegex(
  [
    // English
    "fuck\\s+you",
    "go\\s+fuck\\s+yourself",
    "mother\\s*fuck(?:er|ers|ing|ed|s)?",
    "cock\\s*suck(?:er|ers|ing)?",
    // Romanian
    "futu[- ]?(?:ti|va)\\s+(?:mortii|mama|ma-?ta|gura|dumnezeii|christosii|neamul|rasa)",
    "fututi\\s+(?:mortii|mama|gura|dumnezeii)",
    "mortii\\s+(?:tai|matii|ma-?tii|vostri)",
    "pizda\\s+(?:ma-?tii|matii)",
    "du[- ]?te[- ]?n\\s+(?:pula|pizda|mortii\\s+matii)",
    "duten\\s+(?:pula|pizda|mortii\\s+matii)",
    "baga(?:-?mi-?as|mias)\\s+pula",
    // Russian (Cyrillic + Latin translit)
    "(?:иди|пошел|пошла|пшел|вали)\\s+(?:ты\\s+)?на\\s*хуй",
    "еб\\s+твою\\s+мать",
    "сукин\\s+сын",
    "(?:idi|poshel|poshla)\\s+(?:ty\\s+)?na\\s*hu[iy]",
    "yeb\\s+tvoyu\\s+mat",
    // Italian
    "figli[oa]\\s+di\\s+(?:puttana|troia|zoccola|mignotta)",
    "(?:va(?:i)?\\s+a\\s+)?farti\\s+fottere",
    "succhiami\\s+le\\s+palle",
    "madonna\\s+puttana",
    // Croatian
    "jebem\\s+ti\\s+(?:mater|majku|sve|boga)",
    "mater\\s+ti\\s+jebem",
    "picka\\s+ti\\s+materina",
    "u\\s+picku\\s+materinu",
    // Albanian
    "ta\\s+qifsha\\s+(?:nonen|nenen|mamin|robt|familjen|motren)",
    "qifsha\\s+(?:nonen|nenen|robt|familjen)",
    "shkerdhefsha\\s+(?:nonen|robt)",
    // Romani
    "te\\s+[xh]av\\s+(?:chire\\s+da|ti\\s+daj|chiri\\s+familja)",
  ].join("|"),
);

const CLINICAL_CURVA_EXEMPTION =
  "(?!\\s+(?:glicemic|da\\s+carico|termic|febb|di\\s+crescita|press?or|insulinem|spirometric|audiometric|vertebr|lomb|cervic|scolio|del(?:la)?\\s+(?:febbre|glicemia|crescita|press?ione|peso)))";

const CROATIAN_CITY_PULA_EXEMPTION =
  "(?<!(?:bolnica|grad|dom\\s+zdravlja|apoteka|ljekarna|clinic[au]?|hospital)\\s+)pula(?!(?:\\s+(?:croatia|u\\s+hrvatsk[a-z]*|hrvatsk[a-z]*|istr[a-z]*)))";

// ---------------------------------------------------------------------------
// Tier 2: Non-serious profanity, standalone swearing & insults -> warn first
// ---------------------------------------------------------------------------

const MODERATE_PROFANITY_PATTERN = wordRegex(
  [
    // English (never match bare "dick", "prick", "retard", "cum", or "pussy" alone to protect clinical terms & Retard tablets)
    "fuck(?:ing|ed|er|ers|s|in|wit|tard|off)?",
    "fuck\\s+off",
    "stfu",
    "gtfo",
    "wtf",
    "bullshit",
    "shit(?:ty|s|head|bag|hole|stain)?",
    "bitch(?:es|ing|y)?",
    "cunts?",
    "whores?",
    "sluts?",
    "assholes?",
    "arseholes?",
    "bastards?",
    "dick(?:head|bag|face)s?",
    "cock(?:head|face)s?",
    "dumbass(?:es)?",
    "jackass(?:es)?",
    "dipshits?",
    "douche(?:bag)?s?",
    "scumbags?",
    "wankers?",
    "twats?",
    "piss\\s+off",
    "eat\\s+shit",
    "retarded",
    "(?:you\\s+(?:are\\s+)?(?:a\\s+)?|fucking\\s+)retard",
    "idiots?",
    "morons?",
    "imbeciles?",
    // Romanian (never match "mie", "cum", "pui", "cur", bare "prost", or bare "dracu")
    "muie",
    "muia",
    "muist(?:ule|ul|i|a|o)?",
    CROATIAN_CITY_PULA_EXEMPTION,
    "pulii",
    "pulea?",
    "pizd[aeo]",
    "fut(?:e|ut|ute|uti|em|ai|u-?te|u-?ti)?",
    `curv(?:a|e)${CLINICAL_CURVA_EXEMPTION}`,
    "curv(?:ele|o)",
    "cacat(?:ule|i|o)?",
    "mancator\\s+de\\s+cacat",
    "du[- ]?te\\s+(?:dracu|la\\s+dracu|naiba)",
    "baga[- ]?mi[- ]?as",
    "labagi(?:u|ule|i)?",
    "jegos(?:ule|o|i)?",
    "javr[ae]",
    "tampit(?:ule|o|a|i)?",
    "cretin(?:ule|o|a|i)?",
    "idiot(?:ule|o|a|i)?",
    "boule",
    "dobitoc(?:ule|i)?",
    "nesimtit(?:ule|o|a|i)?",
    "(?:esti|un|o)\\s+(?:prost|proasta)",
    "prostule",
    "proasto",
    "retardat(?:ule|i|o)?",
    // Russian (Cyrillic + Latin translit; strict word boundaries protect "употреблять", "ребенок", "лечебный", "уродство", "худой")
    "бля(?:ть|дь|дина|ди|дский|дская|дское|дство|ха|т)?",
    "блд",
    "блиать",
    "сук(?:а|и|у|ой|е)",
    "суч(?:ка|ки|ар[а-я]*|ье)",
    "(?:на|по|за|ни|от)?ху(?:й|я|ю|ем|е|йня|йню|йней|ило|есос[а-я]*|ета|ев[а-я]*)",
    "[ао]?хуе(?:ть|л[а-я]*|нн[а-я]*)",
    "пизд(?:а|ы|у|е|ой|ец|абол[а-я]*|ован[а-я]*|юк[а-я]*|еть|ишь|ят)?",
    "распиздя[а-я]*",
    "(?:за|от|вы|про|под|до|раз|на|у)?еб(?:ать|аный|аная|аное|аные|ан[а-я]*|ануть[а-я]*|уч[а-я]+|ут|ет|ется|ись|нуть[а-я]*|ало|альник[а-я]*|ля|лан[а-я]*|ок)",
    "уебищ[а-я]*",
    "шлюх(?:а|и|у|ой|е)?",
    "мудак(?:и|ов|а|ом|у)?",
    "мудил(?:а|ы|о)?",
    "гандон(?:ы|а|ов)?",
    "ублюд(?:ок|ки|ка|ков)?",
    "мраз(?:ь|и|ью)",
    "тварь",
    "урод(?:ы|ов|ка|ина)?",
    "говно",
    "говна",
    "говне",
    "говном",
    "говнюк[а-я]*",
    "дерьм(?:о|а|е|ом)",
    "(?:иди|пошел|пошла)\\s+в\\s+жопу",
    "жополиз[а-я]*",
    "долбо[её]б[а-я]*",
    "дебил(?:ы|ка|оид)?",
    "идиот(?:ы|ка)?",
    "кретин(?:ы|ка)?",
    "чмо",
    // Russian in Latin transliteration
    "bl[iy]a(?:t|d|dskaya|ha)?",
    "suka",
    "cyka",
    "syka",
    "nahu[iy]",
    "nakhuy",
    "hui",
    "hu[iy]nya",
    "huilo",
    "huy",
    "khuy[a-z]*",
    "pizd(?:a|ec|ets|yat|et)",
    "eb(?:at|lan|an[iy]y?|nut[a-z]*)",
    "yeb(?:at|lan|an[iy]y?)",
    "zaeb(?:al[a-z]*|is)",
    "ueb(?:ok|at|an)",
    "shlyukh[ai]",
    "mudak[a-z]*",
    "dolboeb[a-z]*",
    "ublyudok",
    "gandon[a-z]*",
    "gavno",
    "govno",
    "dermo",
    "debil",
    "chmo",
    // Italian (never block Italian medical curves: "curva glicemica", "curva da carico", "curva termica", etc.)
    "vaffanculo",
    "fanculo",
    "cazz(?:o|i|ata|ate|one|oni)",
    "testa\\s+di\\s+cazzo",
    "va(?:i)?\\s+in\\s+culo",
    "rot(?:to|ti)\\s+in\\s+culo",
    "leccaculo",
    "merd(?:a|e|accia|oso|osa)",
    "pezzo\\s+di\\s+merda",
    "stronz(?:o|a|i|e|ata|ate)",
    "puttan(?:a|e|ata|ella|iere)",
    "troi(?:a|e|ona|accia)",
    "zoccol(?:a|e)",
    "mignott(?:a|e)",
    "coglion(?:e|i|ata|ate)",
    "porco\\s+dio",
    "dio\\s+(?:cane|porco)",
    "porca\\s+madonna",
    "bastard(?:o|a|i|e)",
    "rompicoglioni",
    "scassacazzo",
    "cretin(?:o|a|i|e)",
    "idiot(?:a|i|e)",
    "deficient(?:e|i)",
    "fottiti",
    "fottut[oa]",
    // Croatian (safe boundaries around "kurkuma", "kura", "pick")
    "jebi\\s+(?:se|ga|si)",
    "jebem\\s+(?:ti|te|vam)",
    "jebote",
    "jebo\\s+te",
    "odjebi",
    "zajeb(?:avaj|i|o)",
    "sjeb(?:an|ati|o|i)",
    "kur(?:ac|ca|cu|cem|ce|cina)",
    "kurv(?:a|e|i|etina|o|inski)",
    "pick(?:a|e|u|o|ica|etina)",
    "upicku",
    "sranj[ea]",
    "seronj[ae]",
    "govn(?:o|a|ar|ari)",
    "kreten(?:u|i|cina)?",
    "budal(?:a|o|e|etina)",
    "majmun(?:e|cina)?",
    "glupan(?:e|i)?",
    "drolj[aeo]",
    // Albanian (safe boundaries around "kardiolog", "mutacion")
    "(?:ta\\s+)?qifsha",
    "qij",
    "shkerdh(?:efsha|at[a-z]*|ej|er)",
    "shkirdhat[a-z]*",
    "pidh(?:i|in|it|sa)?",
    "rrot\\s+kari",
    "(?:ha|te\\s+ha)\\s+kar(?:i|in)",
    "kari\\s+(?:ne|im)",
    "kar(?:in|it)",
    "kurv[ae]",
    "(?:ha|te\\s+ha)\\s+mut",
    "mut\\s+i\\s+qelbur",
    "budalla",
    "gomar",
    "legen",
    // Romani (uses "dj" pre-folding for "đ" so "minđ" never collides with "mind")
    "mindzh[a-z]*",
    "mindj[a-z]*",
    "minxh[a-z]*",
    "minzh[a-z]*",
    "lubn(?:i|yi|y|ija)[a-z]*",
    "(?:te\\s+)?[xh]as\\s+khul",
    "khulal[eo]",
    "(?:and-?o|ko)\\s+bul",
    "phagav\\s+ti\\s+bul",
    "(?:mo|mro)\\s+kar",
    "(?:dza|ja)\\s+ko\\s+beng",
    "beng\\s+te\\s+hal\\s+tut",
  ].join("|"),
);

// Wildcard/symbol-masked patterns (run ONLY on plain / homoglyphPlain where * # % ? ! $ @ ~ _ are intact).
const M = "[*#%?!$@~_]";

const MASKED_HATE_PATTERN = wordRegex(
  [
    `n${M}+g{1,2}${M}*[ea]r?s?`,
    `n${M}{2,}[er]s?`,
    `f${M}+g+(?:g${M}*t|${M}+t)s?`,
    `c${M}+oar[ae]`,
    `b${M}+langi[iu]`,
    `p${M}+dor(?:as)?`,
  ].join("|"),
);

const MASKED_SEXUAL_PATTERN = wordRegex(
  [
    `p${M}+d(?:ofil|ophil)[a-z]*`,
    `s${M}+g[i1]\\s+p${M}+la`,
    `s${M}+ck\\s+m[y*]\\s+d${M}+ck`,
  ].join("|"),
);

const MASKED_SEVERE_PATTERN = wordRegex(
  [
    `f${M}+c?k\\s+(?:y${M}+u|you|u)`,
    `g[o*]\\s+f${M}+c?k\\s+y${M}*rself`,
    `m${M}+th${M}*rf${M}+c?k[a-z]*`,
    `f${M}+tu(?:-?t[i*]|ti)`,
    `m${M}+rtii\\s+(?:t[a*]i|m[a*]tii)`,
    `[иi]д[иi]\\s+н${M}+х${M}+й`,
    `t${M}+\\s+q${M}+fsh${M}+\\s+(?:n${M}+n${M}+n|r${M}+bt)`,
    `j${M}+b${M}+m\\s+t[i*]\\s+m${M}+t${M}+r`,
  ].join("|"),
);

const MASKED_MODERATE_PATTERN = wordRegex(
  [
    `f${M}+(?:c?k|c${M}+k)(?:ing|ed|er|ers|s|in)?`,
    `f[*#%$@~_]{3}`,
    `sh${M}+t(?:ty|head|s|ting)?`,
    `s${M}+it`,
    `bullsh${M}+t`,
    `b${M}+tch(?:es|ing|y)?`,
    `c(?:${M}+nt|${M}{2,}t)s?`,
    `a${M}{1,2}sh${M}+le?s?`,
    `wh${M}+re?s?`,
    `sl${M}+ts?`,
    `d${M}+ck(?:head|bag)s?`,
    // Requires at least one wildcard symbol so Romanian "mie" NEVER matches.
    `m${M}+i+e`,
    `m${M}{2,}e`,
    `mu${M}+e`,
    `p${M}+la`,
    `pu${M}+a`,
    `p${M}+zda`,
    `pi${M}+da`,
    `c${M}+cat`,
    `cac${M}+t`,
    `c${M}+rva`,
    `б${M}+[я9]т?ь?`,
    `бл${M}+т?ь?`,
    `х${M}+й[а-я]*`,
    `ху${M}+[а-я]*`,
    `п${M}+зд[а-я]*`,
    `пи${M}+д(?:а|ец)[а-я]*`,
    `с${M}+ка`,
    `еб${M}+т?ь?`,
    `е${M}+ат?ь?`,
    `шл${M}+ха`,
    `bl${M}+t`,
    `p${M}+zdec`,
    `s${M}+ka`,
    `c${M}+zz[oi]`,
    `m${M}+rda`,
    `p${M}+ttana`,
    `v${M}+ff${M}*nculo`,
    `vaff${M}+nculo`,
    `k${M}+rac`,
    `ku${M}+ac`,
    `p${M}+ck[aeu]`,
    `j${M}+b${M}+(?:\\s+se|\\s+ti)`,
    `q${M}+fsh[a*]`,
    `p${M}+dh[i*]?`,
    `k${M}+rv[ae]`,
    `m${M}+nd(?:zh|j|z)`,
  ].join("|"),
);

// Squashed views collapse 2+ identical consecutive characters to 1 ("muuuuiiiie" -> "muie", "shhhhiiit" -> "shit").
// Never include "niger" or ambiguous 3-letter tokens here.
const SQUASHED_SEVERE_PATTERN = wordRegex(
  [
    "fuck\\s+you",
    "go\\s+fuck\\s+yourself",
    "motherfucker",
    "cocksucker",
    "fututi\\s+morti",
    "sugipula",
    "иди\\s+нахуй",
    "пошел\\s+нахуй",
    "figli[oa]\\s+di\\s+putana",
    "jebem\\s+ti\\s+mater",
    "ta\\s+qifsha\\s+(?:nonen|robt)",
  ].join("|"),
);

const SQUASHED_MODERATE_PATTERN = wordRegex(
  [
    "fuck(?:ing|ed|er|s)?",
    "shit(?:y|head)?",
    "bulshit",
    "bitch(?:es|ing)?",
    "cunt",
    "whore",
    "slut",
    "ashole",
    "muie",
    CROATIAN_CITY_PULA_EXEMPTION,
    "pizda",
    `curva${CLINICAL_CURVA_EXEMPTION}`,
    "cacat",
    "блять?",
    "сука",
    "хуй",
    "нахуй",
    "пиздец",
    "пизда",
    "ебать",
    "шлюха",
    "blyat",
    "suka",
    "pizdec",
    "vafanculo",
    "cazo",
    "putana",
    "merda",
    "stronzo",
    "kurac",
    "kurva",
    "picka",
    "jebise",
    "qifsha",
    "pidh",
    "kurve",
    "mindzh",
    "mindj",
  ].join("|"),
);

// High-entropy compact (whitespace/punctuation stripped) checks for long concatenated phrases (>= 7 chars).
const COMPACT_HATE_PATTERN = compactRegex(
  "heilhitler|siegheil|whitepower|tiganimputit|tiganiimputiti|bythqir|chernozhop",
);

const COMPACT_SEXUAL_PATTERN = compactRegex(
  "childporn|sendnudes|suckmydick|suckmycock|lickmypussy|sugipula|otsosi|sosihuy|xasmokar|hasmokar",
);

const COMPACT_VIOLENCE_PATTERN = compactRegex(
  "iwillkillyou|amgoingtokillyou|killyourself|hangyourself|ubeysebya|yatebyaubyu|убейсебя|ятебяубью|tiammazzo|ammazzati|ubitcute|ubicute|dotevras|omoarate",
);

const COMPACT_INJECTION_PATTERN = compactRegex(
  "ignore(?:all|your|the)?(?:previous|prior|above)(?:instructions|rules|prompt)|forget(?:all|your)?(?:instructions|rules|prompt)|(?:reveal|show|print|repeat)(?:your)?(?:system|developer)prompt|ignoratoateleinstructiunile|ignora(?:tutte)?leistruzioni",
);

const COMPACT_SEVERE_PROFANITY_PATTERN = compactRegex(
  [
    "gofuckyourself",
    "fuckyou",
    "motherfucker",
    "cocksucker",
    "fututimortii",
    "fututigatu",
    "mortiitai",
    "mortiimatii",
    "pizdamatii",
    "bagamiaspula",
    "dutenpula",
    "идинахуй",
    "пошелнахуй",
    "пошланахуй",
    "ебтвоюмать",
    "idinahuy",
    "idinahui",
    "poshelnahuy",
    "figliodiputtana",
    "figlioditroia",
    "fattifottere",
    "jebemtimater",
    "pickamaterina",
    "upickumaterinu",
    "taqifshanonen",
    "taqifsharobt",
    "qifshanonen",
    "qifsharobt",
  ].join("|"),
);

const COMPACT_MODERATE_PROFANITY_PATTERN = compactRegex(
  [
    "bullshit",
    "fuckoff",
    "dutedracu",
    "vaffanculo",
    "testadicazzo",
    "pezzodimerda",
    "rompicoglioni",
    "scassacazzo",
    "taqifsha",
  ].join("|"),
);

/**
 * Classifies AI user messages before calling the LLM so legitimate sensitive medical terms
 * (breast, penis, bleeding, pain, slow-release "Retard" tablets, Italian "curva glicemica",
 * Romanian "mie"/"cum", Russian "употреблять"/"ребенок"/"лечебный", assault victims, and
 * self-harm crisis handled by 112) stay unblocked, while abuse, hate speech, threats,
 * profanity (hidden or plain), and jailbreaks are stopped at 0 token cost.
 */
export function evaluateAiMessageSafety(text: string): ContentSafetyResult {
  if (!text || !text.trim()) return { action: "allow" };

  const views = normalizeForSafety(text);
  const maskedCandidates = uniqueNonEmpty([views.plain, views.homoglyphPlain]);
  const textCandidates = uniqueNonEmpty([views.plain, views.homoglyphPlain, views.deobfuscated, ...views.variants]);

  // 1. Serious Tier -> immediate 72h device lockout
  for (const sample of textCandidates) {
    if (HATE_SPEECH_PATTERN.test(sample)) return { action: "block_immediately", category: "hate_speech" };
    if (SEXUAL_ABUSE_PATTERN.test(sample)) return { action: "block_immediately", category: "sexual_abuse" };
    if (VIOLENT_THREAT_PATTERN.test(sample)) return { action: "block_immediately", category: "violent_threat" };
    if (SEVERE_PROFANITY_PATTERN.test(sample)) return { action: "block_immediately", category: "severe_profanity" };
  }
  for (const sample of maskedCandidates) {
    if (MASKED_HATE_PATTERN.test(sample)) return { action: "block_immediately", category: "hate_speech" };
    if (MASKED_SEXUAL_PATTERN.test(sample)) return { action: "block_immediately", category: "sexual_abuse" };
    if (MASKED_SEVERE_PATTERN.test(sample)) return { action: "block_immediately", category: "severe_profanity" };
  }
  for (const sample of views.squashed) {
    if (SQUASHED_SEVERE_PATTERN.test(sample)) return { action: "block_immediately", category: "severe_profanity" };
  }
  for (const sample of views.compactVariants) {
    if (COMPACT_HATE_PATTERN.test(sample)) return { action: "block_immediately", category: "hate_speech" };
    if (COMPACT_SEXUAL_PATTERN.test(sample)) return { action: "block_immediately", category: "sexual_abuse" };
    if (COMPACT_VIOLENCE_PATTERN.test(sample)) return { action: "block_immediately", category: "violent_threat" };
    if (COMPACT_SEVERE_PROFANITY_PATTERN.test(sample)) {
      return { action: "block_immediately", category: "severe_profanity" };
    }
  }

  // 2. Non-serious Tier -> warn first, escalate to 72h lockout if repeated
  for (const sample of textCandidates) {
    if (MODERATE_PROFANITY_PATTERN.test(sample)) return { action: "warn", category: "profanity" };
  }
  for (const sample of maskedCandidates) {
    if (MASKED_MODERATE_PATTERN.test(sample)) return { action: "warn", category: "profanity" };
  }
  for (const sample of views.squashed) {
    if (SQUASHED_MODERATE_PATTERN.test(sample)) return { action: "warn", category: "profanity" };
  }
  for (const sample of views.compactVariants) {
    if (COMPACT_MODERATE_PROFANITY_PATTERN.test(sample)) return { action: "warn", category: "profanity" };
  }

  // 3. Prompt injection check across raw, deobfuscated, and compact forms
  for (const candidate of uniqueNonEmpty([text, ...textCandidates])) {
    if (isPromptInjectionAttempt(candidate)) {
      return { action: "warn", category: "prompt_injection" };
    }
  }
  for (const sample of views.compactVariants) {
    if (COMPACT_INJECTION_PATTERN.test(sample)) {
      return { action: "warn", category: "prompt_injection" };
    }
  }

  return { action: "allow" };
}
