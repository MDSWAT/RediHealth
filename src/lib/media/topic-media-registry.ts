import type { Lang } from "@/lib/i18n/translations";
import type { HealthTopicContent } from "@/lib/i18n/health-information-topics";
import type {
  SubtitleCue,
  WordCue,
} from "@/components/health-information/SynchronizedCaptionsOverlay";

/**
 * Topic media registry.
 *
 * Every health-information topic owns its own caption script, so a short video
 * card can never show captions that belong to another topic (for example,
 * heart-health captions on the diabetes page).
 *
 * Every locale has a hand-authored script. A topic missing from a locale's
 * script falls back to that topic's own localized content, so no Romanian
 * text leaks into non-Romanian routes.
 */

/**
 * Hand-authored caption scripts, one short sentence per cue, per language.
 * Non-Romanian scripts are translations of the Romanian originals and still
 * need review by a native speaker before launch.
 */
export const TOPIC_CAPTION_SCRIPTS: Record<Lang, Record<string, string[]>> = {
  ro: {
    "heart-health": [
      "Tensiunea arterială mare nu doare deloc la început.",
      "Verifică-ți tensiunea o dată pe lună, la medicul de familie sau la farmacie.",
      "Durerea în piept care nu trece e o urgență. Sună la 112.",
    ],
    diabetes: [
      "Zahărul crescut din sânge poate face rău ani de zile fără să-l simți.",
      "Setea mare, urinatul des și oboseala pot fi primele semne.",
      "Dacă ai factori de risc, cere medicului de familie o analiză a zahărului din sânge.",
    ],
    "healthy-eating": [
      "Umple jumătate din farfurie cu legume și fructe.",
      "Alege apa în locul sucurilor dulci.",
      "Mesele gătite acasă te ajută să controlezi sarea și zahărul.",
    ],
    "physical-activity": [
      "30 de minute de mers repede pe zi fac bine inimii și minții.",
      "Începe încet și mergi puțin mai repede de la o zi la alta.",
      "Oprește-te dacă simți durere în piept sau lipsă de aer.",
    ],
    "mental-wellbeing": [
      "Somnul, mișcarea și oamenii dragi te ajută să te simți bine.",
      "Vorbește cu cineva de încredere când tristețea nu trece.",
      "Dacă te gândești să îți faci rău, sună imediat la 112.",
    ],
    smoking: [
      "Corpul începe să se refacă la scurt timp după ultima țigară.",
      "Medicul de familie te poate ajuta cu un plan de renunțare.",
      "Dacă ai fumat din nou, nu renunța. Încearcă iar.",
    ],
    "preventive-screening": [
      "Multe boli pot fi descoperite devreme, înainte să apară simptome.",
      "Întreabă medicul de familie ce analize sunt potrivite pentru vârsta ta.",
      "Scrie-ți datele controalelor ca să nu le uiți.",
    ],
    "womens-health": [
      "Mergi regulat la ginecolog, ca problemele să fie găsite din timp.",
      "Testul Babeș-Papanicolau găsește devreme schimbările de la colul uterin.",
      "Discută cu medicul despre orice sângerare neobișnuită.",
    ],
  },
  en: {
    "heart-health": [
      "High blood pressure does not hurt at first.",
      "Check your blood pressure once a month, at your family doctor or a pharmacy.",
      "Chest pain that does not go away is an emergency. Call 112.",
    ],
    diabetes: [
      "High blood sugar can harm you for years before you feel it.",
      "Being very thirsty, peeing often and feeling tired can be the first signs.",
      "Ask your family doctor for a blood sugar test if you have risk factors.",
    ],
    "healthy-eating": [
      "Fill half your plate with vegetables and fruit.",
      "Choose water instead of sugary drinks.",
      "Meals cooked at home help you control salt and sugar.",
    ],
    "physical-activity": [
      "30 minutes of brisk walking a day is good for your heart and mind.",
      "Start slowly and walk a little faster as the days go by.",
      "Stop if you feel chest pain or shortness of breath.",
    ],
    "mental-wellbeing": [
      "Sleep, moving your body and the people close to you help you feel well.",
      "Talk to someone you trust when sadness does not pass.",
      "If you are thinking about hurting yourself, call 112 right away.",
    ],
    smoking: [
      "Your body starts to recover soon after the last cigarette.",
      "Your family doctor can help you with a plan to quit.",
      "If you smoke again, do not give up. Try again.",
    ],
    "preventive-screening": [
      "Many illnesses can be found early, before symptoms appear.",
      "Ask your family doctor which tests are right for your age.",
      "Write down your check-up dates so you do not forget them.",
    ],
    "womens-health": [
      "Regular gynaecological check-ups help find problems early.",
      "The Pap test can find early changes in the cervix.",
      "Talk to your doctor about any unusual bleeding.",
    ],
  },
  sq: {
    "heart-health": [
      "Tensioni i lartë i gjakut nuk dhemb fare në fillim.",
      "Kontrolloje tensionin një herë në muaj, te mjeku i familjes ose në farmaci.",
      "Dhimbja në gjoks që nuk kalon është urgjencë. Telefono 112.",
    ],
    diabetes: [
      "Sheqeri i lartë në gjak mund të të dëmtojë për vite pa e ndier.",
      "Etja e madhe, urinimi i shpeshtë dhe lodhja mund të jenë shenjat e para.",
      "Kërkoji mjekut të familjes një analizë të sheqerit në gjak nëse ke faktorë rreziku.",
    ],
    "healthy-eating": [
      "Mbush gjysmën e pjatës me perime dhe fruta.",
      "Zgjidh ujin në vend të pijeve të ëmbla.",
      "Ushqimet e gatuara në shtëpi të ndihmojnë të kontrollosh kripën dhe sheqerin.",
    ],
    "physical-activity": [
      "30 minuta ecje e shpejtë në ditë i bëjnë mirë zemrës dhe mendjes.",
      "Fillo ngadalë dhe ec pak më shpejt ditë pas dite.",
      "Ndalo nëse ndien dhimbje në gjoks ose të mungon ajri.",
    ],
    "mental-wellbeing": [
      "Gjumi, lëvizja dhe njerëzit e afërt të ndihmojnë të ndihesh mirë.",
      "Fol me dikë që i beson kur trishtimi nuk kalon.",
      "Nëse mendon të lëndosh veten, telefono menjëherë 112.",
    ],
    smoking: [
      "Trupi fillon të rimëkëmbet pak kohë pas cigares së fundit.",
      "Mjeku i familjes mund të të ndihmojë me një plan për ta lënë duhanin.",
      "Nëse e ndez sërish, mos u dorëzo. Provo përsëri.",
    ],
    "preventive-screening": [
      "Shumë sëmundje mund të zbulohen herët, para se të shfaqen simptomat.",
      "Pyet mjekun e familjes cilat analiza janë të përshtatshme për moshën tënde.",
      "Shëno datat e kontrolleve që të mos i harrosh.",
    ],
    "womens-health": [
      "Shko rregullisht te gjinekologu, që problemet të gjenden herët.",
      "Testi Papanikolau mund të zbulojë herët ndryshimet në qafën e mitrës.",
      "Fol me mjekun për çdo gjakderdhje të pazakontë.",
    ],
  },
  it: {
    "heart-health": [
      "La pressione alta all'inizio non fa male.",
      "Controlla la pressione una volta al mese, dal medico di famiglia o in farmacia.",
      "Un dolore al petto che non passa è un'emergenza. Chiama il 112.",
    ],
    diabetes: [
      "Lo zucchero alto nel sangue può fare danni per anni senza che te ne accorga.",
      "Molta sete, urinare spesso e stanchezza possono essere i primi segnali.",
      "Se hai fattori di rischio, chiedi al medico di famiglia un esame dello zucchero nel sangue.",
    ],
    "healthy-eating": [
      "Riempi metà del piatto con verdura e frutta.",
      "Scegli l'acqua al posto delle bibite zuccherate.",
      "I pasti cucinati a casa ti aiutano a controllare sale e zucchero.",
    ],
    "physical-activity": [
      "30 minuti di camminata veloce al giorno fanno bene al cuore e alla mente.",
      "Comincia piano e cammina un po' più veloce giorno dopo giorno.",
      "Fermati se senti dolore al petto o ti manca il respiro.",
    ],
    "mental-wellbeing": [
      "Il sonno, il movimento e le persone care ti aiutano a stare bene.",
      "Parla con una persona di fiducia quando la tristezza non passa.",
      "Se pensi di farti del male, chiama subito il 112.",
    ],
    smoking: [
      "Il corpo comincia a riprendersi poco dopo l'ultima sigaretta.",
      "Il medico di famiglia può aiutarti con un piano per smettere.",
      "Se ricominci a fumare, non arrenderti. Riprova.",
    ],
    "preventive-screening": [
      "Molte malattie si possono scoprire presto, prima che compaiano i sintomi.",
      "Chiedi al medico di famiglia quali esami sono adatti alla tua età.",
      "Annota le date dei controlli per non dimenticarle.",
    ],
    "womens-health": [
      "Vai dal ginecologo con regolarità, così i problemi si scoprono presto.",
      "Il Pap test può scoprire presto i cambiamenti del collo dell'utero.",
      "Parla con il medico di qualsiasi sanguinamento insolito.",
    ],
  },
};

/** Romanian scripts, kept as a named export for existing callers and tests. */
export const TOPIC_CAPTION_SCRIPTS_RO = TOPIC_CAPTION_SCRIPTS.ro;

/**
 * Where a topic's "Health in 60 seconds" card gets its picture from.
 * - selfHosted: our own wordless clip in /public/media/topics/<slug>/ (preferred).
 * - scene: the topic's explainer scene, driven by the caption clock (interim).
 * - youtube: an external clip, only after a person has listened to it with
 *   sound and a clinician has reviewed it. Loaded through a click-to-load
 *   facade on youtube-nocookie.com.
 */
export type ShortMediaSource =
  | { kind: "selfHosted"; src: string; poster?: string }
  | { kind: "scene" }
  | { kind: "youtube"; videoId: string; channel: string; start?: number; end?: number };

/** No external video has passed the listening and clinician review yet. */
export const TOPIC_SHORT_MEDIA_SOURCES: Record<string, ShortMediaSource> = {
  "heart-health": { kind: "scene" },
  diabetes: { kind: "scene" },
  "healthy-eating": { kind: "scene" },
  "physical-activity": { kind: "scene" },
  "mental-wellbeing": { kind: "scene" },
  smoking: { kind: "scene" },
  "preventive-screening": { kind: "scene" },
  "womens-health": { kind: "scene" },
};

export function getTopicShortMediaSource(slug: string): ShortMediaSource {
  return TOPIC_SHORT_MEDIA_SOURCES[slug] ?? { kind: "scene" };
}

/** Privacy-enhanced embed URL. Only built after the user presses Play. */
export function buildNoCookieEmbedUrl(source: Extract<ShortMediaSource, { kind: "youtube" }>): string {
  const params = new URLSearchParams({
    autoplay: "1",
    rel: "0",
    modestbranding: "1",
    cc_load_policy: "0",
    playsinline: "1",
  });
  if (source.start !== undefined) params.set("start", String(source.start));
  if (source.end !== undefined) params.set("end", String(source.end));
  return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(source.videoId)}?${params.toString()}`;
}

/** Timing model for generated word-level cues (seconds). */
const WORD_BASE_SECONDS = 0.28;
const WORD_SECONDS_PER_CHAR = 0.045;
const CUE_GAP_SECONDS = 0.35;

const round = (value: number) => Math.round(value * 100) / 100;

/**
 * Builds a continuous subtitle track from sentences. Every word of every
 * sentence gets a timed word cue, so the highlighted words always cover the
 * full caption text.
 */
export function buildSubtitleTrack(sentences: string[]): SubtitleCue[] {
  const cues: SubtitleCue[] = [];
  let cursor = 0;

  for (const raw of sentences) {
    const text = raw.trim();
    if (!text) continue;

    const start = cursor;
    const words: WordCue[] = text.split(/\s+/).map((word) => {
      const wordStart = cursor;
      cursor += WORD_BASE_SECONDS + word.length * WORD_SECONDS_PER_CHAR;
      return { word, start: round(wordStart), end: round(cursor) };
    });

    cues.push({ start: round(start), end: round(cursor), text, words });
    cursor += CUE_GAP_SECONDS;
  }

  return cues;
}

/** Returns the sentences used for a topic's caption track in the given language. */
export function getTopicCaptionScript(
  topic: Pick<HealthTopicContent, "slug" | "keyFacts" | "recommendations">,
  lang: Lang
): string[] {
  const script = TOPIC_CAPTION_SCRIPTS[lang]?.[topic.slug];
  if (script && script.length > 0) return script;

  // Localized fallback built only from this topic's own reviewed content.
  const fromContent = [
    topic.keyFacts[0],
    topic.keyFacts[1],
    topic.recommendations[0]?.description,
  ].filter((sentence): sentence is string => Boolean(sentence && sentence.trim()));

  return fromContent;
}

/** Resolves the subtitle track for a topic in the given language. */
export function getTopicSubtitleTrack(
  topic: Pick<HealthTopicContent, "slug" | "keyFacts" | "recommendations">,
  lang: Lang
): SubtitleCue[] {
  return buildSubtitleTrack(getTopicCaptionScript(topic, lang));
}

/** Total length of a track in seconds. */
export function getTrackDuration(cues: SubtitleCue[]): number {
  return cues.length > 0 ? cues[cues.length - 1].end : 0;
}

/** Formats a track duration as m:ss (for example, 0:14). */
export function formatTrackDuration(cues: SubtitleCue[]): string {
  const total = Math.ceil(getTrackDuration(cues));
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
