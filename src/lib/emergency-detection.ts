import { urgentPattern } from "@/lib/health-assistant";

/**
 * Shared, multilingual emergency detector for free text typed by the public.
 *
 * Every place that decides where a typed message goes (the triage box, the health assistant,
 * smart search) checks this first, so an emergency is never routed to an information page or
 * left to the LLM. All languages are checked whatever the page language, because people mix
 * languages and type without diacritics.
 *
 * Terms are matched at the start of a word ("lesin" matches "lesinat", "a lesinat"), after the
 * text is lower-cased, stripped of diacritics and punctuation. Keep stems long enough not to
 * match ordinary words, and add a test case to emergency-detection.test.ts for every new term.
 */
const EMERGENCY_TERMS: Record<string, readonly string[]> = {
  ro: [
    "nu pot respira", "nu mai pot respira", "nu poate respira", "nu mai respira", "nu respira",
    "respir greu", "respira greu", "greu de respirat", "ma sufoc", "se sufoca", "sufocar",
    "lipsa de aer", "nu am aer", "n am aer", "nu mai am aer",
    "durere in piept", "dureri in piept", "durere de piept", "durere toracic", "ma doare pieptul",
    "il doare pieptul", "o doare pieptul", "ma doare in piept", "apasare in piept", "presiune in piept",
    "junghi in piept", "strangere in piept",
    "infarct", "atac de cord", "atac cerebral", "avc", "accident vascular", "paraliz",
    "gura stramba", "fata stramba", "nu mai poate vorbi", "nu poate vorbi",
    "lesin", "a lesinat", "inconstient", "nu se trezeste", "si a pierdut cunostinta",
    "convulsi", "criza de epilepsie",
    "sangerare puternica", "sangereaza mult", "sangereaza tare", "nu se opreste sangel", "hemoragi",
    "otravi", "intoxica", "supradoz", "prea multe pastile", "prea multe medicamente",
    "sinucid", "vreau sa mor", "sa ma omor", "imi iau viata", "imi pun capat",
    "m am ars", "s a ars", "arsura grava", "arsuri grave", "electrocut", "s a inecat",
    "soc anafilactic", "anafilax", "mi se umfla gatul", "i se umfla gatul",
  ],
  en: [
    "chest pain", "pain in my chest", "pain in the chest", "chest pressure", "chest tightness", "tight chest",
    "can t breathe", "cant breathe", "cannot breathe", "can not breathe", "not breathing", "stopped breathing",
    "difficulty breathing", "trouble breathing", "struggling to breathe", "shortness of breath", "short of breath",
    "choking", "heart attack", "stroke", "face droop", "slurred speech", "paralys",
    "unconscious", "passed out", "fainted", "fainting", "unresponsive", "won t wake up", "seizure", "convulsion",
    "severe bleeding", "bleeding heavily", "heavy bleeding", "won t stop bleeding",
    "overdose", "too many pills", "took too many", "poisoned", "poisoning",
    "swallowed bleach", "swallowed detergent", "swallowed a battery",
    "suicid", "kill myself", "want to die", "end my life", "self harm", "hurt myself",
    "severe burn", "badly burned", "badly burnt", "electrocut", "drowning", "drowned",
    "anaphyla", "throat swelling", "throat is closing",
  ],
  sq: [
    "dhimbje gjoksi", "dhimbje ne gjoks", "dhembje gjoksi", "dhembje ne gjoks", "me dhemb gjoksi",
    "nuk marr fryme", "nuk mund te marr fryme", "s marr fryme", "veshtiresi ne frymemarrje",
    "veshtiresi frymemarrje", "po mbytem", "mbytje",
    "infarkt", "sulm ne zemer", "atak ne zemer", "goditje ne tru", "goditje cerebrale", "insult cerebral", "paraliz",
    "humbi ndjenjat", "humb ndjenjat", "humba ndjenjat", "i ra te fiket", "me ra te fiket", "pa ndjenja",
    "konvulsion", "krize epileptike",
    "gjakderdhje e forte", "gjakderdhje e rende", "helmim", "u helmua", "mbidoz", "shume tableta",
    "vetevras", "dua te vdes", "te vras veten", "djegie e rende",
  ],
  it: [
    "dolore al petto", "dolore toracico", "oppressione al petto", "peso sul petto", "male al petto",
    "non riesco a respirare", "non respiro", "non respira", "difficolta a respirare", "difficolta respiratori",
    "fiato corto", "mi manca il fiato", "manca l aria", "soffoc",
    "infarto", "attacco di cuore", "attacco cardiaco", "ictus", "paralisi", "bocca storta",
    "svenut", "svenimento", "perso i sensi", "incosciente", "privo di sensi", "priva di sensi",
    "convulsion", "crisi epilettica",
    "emorragia", "sanguina molto", "perde molto sangue", "avvelena", "intossica", "overdose", "troppe pillole",
    "suicid", "uccidermi", "voglio morire", "farla finita", "ustione grave", "folgora", "annega", "anafilass",
  ],
  hr: [
    "bol u prsima", "bol u grudima", "pritisak u prsima", "tesko disem", "ne mogu disati", "ne mogu disat",
    "ne moze disati", "nedostatak zraka", "zaduha", "gusenje", "gusim se",
    "srcani udar", "infarkt", "mozdani udar", "paraliz",
    "bez svijesti", "nesvjestica", "onesvijest", "izgubio svijest", "izgubila svijest", "napadaj", "konvulzij",
    "jako krvarenje", "otrov", "predoziranj", "samoubojstv", "ubiti se", "zelim umrijeti", "teska opeklina",
  ],
  rom: [
    "dukh and o kolin", "dukh ando kolin", "dukh ko kolin", "nashti phurdav", "nashti phurdel",
    "phari phurdinimos", "perav tele", "bi godjako", "baro rat", "rat thabdel", "infarkt", "infarct",
  ],
  ru: [
    "боль в груди", "болит в груди", "давит в груди", "не могу дышать", "не может дышать", "трудно дышать",
    "задыха", "одышка", "инфаркт", "сердечный приступ", "инсульт", "перекос лица",
    "потерял сознание", "потеряла сознание", "без сознания", "обморок", "судорог",
    "сильное кровотечение", "отравлен", "отравил", "передозиров", "суицид", "покончить с собой",
    "хочу умереть", "убить себя", "сильный ожог",
  ],
};

export function normalizeEmergencyText(input: string): string {
  return input
    .toLowerCase()
    .replace(/[đð]/g, "d")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

const NORMALIZED_TERMS: readonly string[] = Array.from(
  new Set(Object.values(EMERGENCY_TERMS).flat().map(normalizeEmergencyText).filter(Boolean)),
);

/** True when the text describes a possible emergency in any supported language. */
export function detectEmergencyText(text: string | null | undefined): boolean {
  if (!text) return false;
  const trimmed = text.trim();
  if (!trimmed) return false;
  if (urgentPattern.test(trimmed)) return true;

  const normalized = normalizeEmergencyText(trimmed);
  if (!normalized) return false;
  if (urgentPattern.test(normalized)) return true;

  const padded = ` ${normalized}`;
  return NORMALIZED_TERMS.some((term) => padded.includes(` ${term}`));
}
