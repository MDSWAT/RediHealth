/**
 * Free-text routing for the triage input on English, Croatian, Romani, Albanian and Italian pages.
 *
 * The shared classifier in `@/lib/triage-state` only knows Romanian keywords and falls back
 * to the "learn" pathway, so "chest pain" typed on /en/health-assistant used to land on
 * health myths instead of the warning-sign check. This runs first on non-Romanian pages;
 * when nothing matches, the caller falls back to the Romanian classifier (people often type
 * Romanian on any page). Symptoms are checked first so that any mention of pain or a warning
 * sign reaches the emergency gate.
 */
import type { PathwayId } from "@/lib/triage-state";

type Rules = Partial<Record<Exclude<PathwayId, "learn">, RegExp[]>>;

const EN: Rules = {
  symptoms: [
    /\bpain/, /\bhurt/, /ache\b/, /aching/, /\bfever/, /temperature/, /\bcough/, /vomit/, /nause/,
    /\bsick\b/, /\bill\b/, /bleed/, /breath/, /\bchest\b/, /dizz/, /diarrh/, /stroke/, /faint/,
    /unconscious/, /emergenc/, /ambulance/, /\b112\b/, /throat/, /\brash\b/, /swell/, /swollen/, /injur/,
    /chills/, /seizure/,
  ],
  prescription: [/prescri/, /\bpills?\b/, /tablet/, /medicin/, /medicat/, /\bdose/, /dosage/, /antibiotic/, /\bdrugs?\b/],
  navigation: [
    /insur/, /\bid\b/, /identity/, /hospital/, /family doctor/, /\bgp\b/, /referral/, /document/, /papers/,
    /mediator/, /\brights?\b/, /regist/, /where (do|should|can) i go/,
  ],
  risk: [/\brisk/, /smok/, /blood pressure/, /diabet/, /sugar/, /weight/, /cholesterol/, /\bheart\b/],
};

const SQ: Rules = {
  symptoms: [
    /dhemb/, /dhimb/, /\bethe/, /temperatur/, /koll/, /vjell/, /perzier/, /gjakderdh/, /humb.* gjak/, /frym/,
    /gjoks/, /marramendj/, /diarre/, /urgjenc/, /ambulanc/, /semur/, /\bfyt/, /\b112\b/, /te fikët|te fiket|fikem/,
  ],
  prescription: [/recet/, /ilac/, /\bhape/, /pilul/, /tablet/, /\bdoz/, /antibiotik/, /barn/],
  navigation: [/sigurim/, /leternjoftim/, /spital/, /mjek(u|un)? (i |te )?familj/, /dokument/, /ndermjetes/, /te drejt/, /fleta e dergimit/],
  risk: [/rrezik/, /duhan/, /presion/, /diabet/, /sheqer/, /pesh/, /kolesterol/, /zemr/],
};

const IT: Rules = {
  symptoms: [
    /dolor/, /\bmale\b/, /mal di/, /febbre/, /tosse/, /vomit/, /nausea/, /sangu/, /emorrag/, /respir/,
    /petto/, /vertigin/, /diarre/, /emergenz/, /ambulanz/, /\bgola\b/, /svenut|svenimento/, /\b112\b/, /brividi/,
  ],
  prescription: [/ricett/, /pastigli/, /compress/, /farmac/, /medicin/, /\bdos(e|i|aggio)\b/, /antibiotic/],
  navigation: [
    /assicura/, /carta d'?identita/, /documento d'?identita/, /ospedal/, /medico di famiglia/, /impegnativ/,
    /document/, /mediator/, /dirit/, /tessera/, /dove (devo|posso) andare/,
  ],
  risk: [/rischi/, /\bfum/, /pression/, /diabet/, /zucchero/, /\bpeso\b/, /colesterol/, /cuore/],
};

const HR: Rules = {
  symptoms: [
    /\bbol(i|e|ovi|ova|u)?\b/, /glavobolj/, /vrucic/, /temperatur/, /groznic/, /kasalj|kaslj/, /povrac/, /mucnin/,
    /krvar/, /disanj|disem|zaduha|gusenj|zraka/, /prsi/, /vrtoglavic/, /proljev/, /mozdani/, /nesvjestic|svijesti/,
    /hitn/, /ambulanc|hitna/, /\b112\b/, /grl/, /osip/, /oteklin|otecen|otice/, /ozljed/, /napadaj/, /trbuh|zeludac/,
  ],
  prescription: [/recept/, /lijek/, /tablete?/, /pilul/, /kapsul/, /\bdoz(a|e|iranje)\b/, /antibiotik/, /terapij/, /sirup/],
  navigation: [
    /osiguranj/, /\bhzzo\b/, /iskaznic/, /osobn/, /bolnic/, /obiteljsk.* lijecnik|doktor.* opce/, /uputnic/,
    /dokument/, /medijator/, /\bprav(a|o)\b/, /upis/, /gdje (da |mogu )?idem|kamo otici/,
  ],
  risk: [/rizik/, /pusenj|pusim|cigaret/, /krvni tlak|\btlak\b/, /dijabet/, /secer/, /tezin|debljin/, /kolesterol/, /\bsrce\b/],
};

const ROM: Rules = {
  symptoms: [
    /\bdukh/, /dukhal/, /tatipen/, /phabarel/, /khas/, /chad/, /\brat\b/, /phurd/, /kolin/, /shero phirel/,
    /perav tele/, /bi godjako/, /sigardiari/, /\b112\b/, /nasval/, /korr/, /\bpor\b|\bogi\b/, /\bdumo\b/, /shuvljol/,
  ],
  prescription: [/recet/, /\bdrab/, /\bxap/, /pilul/, /tablet/, /\bdoz/, /antibiotik/],
  navigation: [
    /asigurim/, /buletin/, /\blil(a)?\b/, /bolnits/, /doktor/, /familijako/, /mediator/, /chachipen|chachimata/,
    /sastipnasko/, /kaj te djav|kaj shaj djav/,
  ],
  risk: [/rizik/, /thuv|cigara/, /tensia|rat.* zor/, /diabet/, /zahari|guglipen/, /pharipen/, /\bilo\b/],
};

const ORDER: Exclude<PathwayId, "learn">[] = ["symptoms", "prescription", "navigation", "risk"];

function normalize(query: string): string {
  return query
    .toLowerCase()
    .replace(/đ/g, "d")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

/**
 * Returns a pathway when the query clearly matches English or the page language,
 * or null so the caller can fall back to the shared Romanian classifier.
 */
export function classifyLocalIntent(query: string, lang: string): PathwayId | null {
  if (lang === "ro") return null;
  const q = normalize(query);
  if (!q) return null;
  const byLang: Partial<Record<string, Rules>> = { sq: SQ, it: IT, hr: HR, rom: ROM };
  const sets = (lang === "rom" ? [ROM, HR, EN] : [byLang[lang], EN]).filter(Boolean) as Rules[];
  for (const pathway of ORDER) {
    for (const rules of sets) {
      if (rules[pathway]?.some((re) => re.test(q))) return pathway;
    }
  }
  return null;
}
