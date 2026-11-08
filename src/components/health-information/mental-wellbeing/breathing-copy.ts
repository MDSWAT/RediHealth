import type { Lang } from "@/lib/i18n/translations";
import { BREATH_IN_SECONDS, BREATH_OUT_SECONDS } from "@/lib/motion/tokens";
import type { BreathPhase, BreathPhaseKind } from "../explainers/scenes/BreathingPacerScene";

export type BreathingPatternId = "relaxed" | "box";

/**
 * Relaxed breathing uses the site-wide calm tempo: 4 s in, 6 s out (a longer
 * out-breath, six breaths a minute). Box breathing is the optional 4-4-4-4
 * pattern. Both stay well under any rate that could cause dizziness.
 */
export const BREATHING_PATTERNS: Record<BreathingPatternId, BreathPhase[]> = {
  relaxed: [
    { kind: "in", seconds: BREATH_IN_SECONDS },
    { kind: "out", seconds: BREATH_OUT_SECONDS },
  ],
  box: [
    { kind: "in", seconds: 4 },
    { kind: "holdFull", seconds: 4 },
    { kind: "out", seconds: 4 },
    { kind: "holdEmpty", seconds: 4 },
  ],
};

/** The NHS suggests 3 to 5 minutes; the pacer stops by itself after 5. */
export const MAX_SESSION_SECONDS = 5 * 60;

export interface BreathingCopy {
  title: string;
  intro: string;
  patterns: Record<BreathingPatternId, string>;
  patternGroupLabel: string;
  phases: Record<BreathPhaseKind, string>;
  ready: string;
  finished: string;
  start: string;
  stop: string;
  /** Use {count}. */
  cycles: string;
  safety: string;
  call112: string;
  listen: string;
  ariaLabel: string;
  credit: string;
  chimesToggle: string;
  chimesActive: string;
  chimesMuted: string;
}

export const BREATHING_COPY: Record<Lang, BreathingCopy> = {
  ro: {
    title: "Respiră liniștit",
    intro:
      "Stai comod, cu umerii relaxați. Urmărește cercul. Inspiră pe nas cât crește și expiră încet pe gură cât scade. Expirația mai lungă ajută corpul să se liniștească.",
    patterns: {
      relaxed: "Respirație lentă (4 s / 6 s)",
      box: "Respirație în pătrat (4–4–4–4)",
    },
    patternGroupLabel: "Alege ritmul de respirație",
    phases: { in: "Inspiră", holdFull: "Ține aerul", out: "Expiră", holdEmpty: "Pauză" },
    ready: "Apasă „Începe” când ești gata.",
    finished: "Gata. Respiră acum normal.",
    start: "Începe",
    stop: "Oprește",
    cycles: "Respirații complete: {count}",
    safety:
      "Dacă simți amețeală, oprește-te și respiră normal. Dacă ești în criză sau te gândești să îți faci rău, sună imediat la 112.",
    call112: "Sună la 112",
    listen: "Ascultă instrucțiunile",
    ariaLabel: "Cerc care crește la inspirație și scade la expirație",
    credit: "Exercițiu adaptat după ghidul NHS „Breathing exercises for stress”.",
    chimesToggle: "Semnal sonor",
    chimesActive: "Semnal sonor pornit",
    chimesMuted: "Semnal sonor oprit",
  },
  en: {
    title: "Calm breathing",
    intro:
      "Sit comfortably with your shoulders relaxed. Follow the circle. Breathe in through your nose while it grows. Breathe out slowly through your mouth while it shrinks. A longer out-breath helps your body calm down.",
    patterns: {
      relaxed: "Slow breathing (4 s / 6 s)",
      box: "Box breathing (4–4–4–4)",
    },
    patternGroupLabel: "Choose a breathing rhythm",
    phases: { in: "Breathe in", holdFull: "Hold", out: "Breathe out", holdEmpty: "Pause" },
    ready: "Press “Start” when you are ready.",
    finished: "Well done. Breathe normally now.",
    start: "Start",
    stop: "Stop",
    cycles: "Full breaths: {count}",
    safety:
      "If you feel dizzy, stop and breathe normally. If you are in crisis or thinking about hurting yourself, call 112 right away.",
    call112: "Call 112",
    listen: "Listen to the instructions",
    ariaLabel: "A circle that grows as you breathe in and shrinks as you breathe out",
    credit: "Exercise adapted from the NHS guide “Breathing exercises for stress”.",
    chimesToggle: "Guide tone",
    chimesActive: "Guide tone on",
    chimesMuted: "Guide tone off",
  },
  sq: {
    title: "Frymëmarrje e qetë",
    intro:
      "Ulu rehat, me supet të lëshuara. Ndiq rrethin. Merr frymë nga hunda kur rritet dhe nxirre ngadalë nga goja kur zvogëlohet. Kur e nxjerr frymën më gjatë, trupi qetësohet më lehtë.",
    patterns: {
      relaxed: "Frymëmarrje e ngadaltë (4 s / 6 s)",
      box: "Frymëmarrje katrore (4–4–4–4)",
    },
    patternGroupLabel: "Zgjidh ritmin e frymëmarrjes",
    phases: { in: "Merr frymë", holdFull: "Mbaje", out: "Nxirre frymën", holdEmpty: "Pushim" },
    ready: "Shtyp „Fillo” kur të jesh gati.",
    finished: "Të lumtë. Tani merr frymë normalisht.",
    start: "Fillo",
    stop: "Ndalo",
    cycles: "Frymëmarrje të plota: {count}",
    safety:
      "Nëse ndien marramendje, ndalo dhe merr frymë normalisht. Nëse je në krizë ose mendon të lëndosh veten, telefono menjëherë 112.",
    call112: "Telefono 112",
    listen: "Dëgjo udhëzimet",
    ariaLabel: "Një rreth që rritet kur merr frymë dhe zvogëlohet kur e nxjerr",
    credit: "Ushtrim i përshtatur nga udhëzuesi i NHS “Breathing exercises for stress”.",
    chimesToggle: "Tingull udhëzues",
    chimesActive: "Tingulli udhëzues është i ndezur",
    chimesMuted: "Tingulli udhëzues është i fikur",
  },
  it: {
    title: "Respirazione calma",
    intro:
      "Siediti comodo, con le spalle rilassate. Segui il cerchio. Inspira dal naso mentre cresce ed espira piano dalla bocca mentre si rimpicciolisce. Un'espirazione più lunga aiuta il corpo a calmarsi.",
    patterns: {
      relaxed: "Respiro lento (4 s / 6 s)",
      box: "Respiro quadrato (4–4–4–4)",
    },
    patternGroupLabel: "Scegli il ritmo del respiro",
    phases: { in: "Inspira", holdFull: "Trattieni", out: "Espira", holdEmpty: "Pausa" },
    ready: "Premi «Inizia» quando sei pronto.",
    finished: "Ben fatto. Ora respira normalmente.",
    start: "Inizia",
    stop: "Ferma",
    cycles: "Respiri completi: {count}",
    safety:
      "Se ti gira la testa, fermati e respira normalmente. Se sei in crisi o pensi di farti del male, chiama subito il 112.",
    call112: "Chiama il 112",
    listen: "Ascolta le istruzioni",
    ariaLabel: "Un cerchio che cresce quando inspiri e si rimpicciolisce quando espiri",
    credit: "Esercizio adattato dalla guida NHS “Breathing exercises for stress”.",
    chimesToggle: "Suono guida",
    chimesActive: "Suono guida attivo",
    chimesMuted: "Suono guida disattivato",
  },
};

/** Which phase is active `elapsed` seconds into a session, and how long it has left. */
export function getPhaseAt(pattern: BreathPhase[], elapsed: number) {
  const cycleSeconds = pattern.reduce((sum, p) => sum + p.seconds, 0);
  const cycles = Math.floor(elapsed / cycleSeconds);
  let t = elapsed % cycleSeconds;
  for (let index = 0; index < pattern.length; index++) {
    const phase = pattern[index];
    if (t < phase.seconds) {
      return { phase, index, secondsLeft: phase.seconds - t, cycles };
    }
    t -= phase.seconds;
  }
  // Unreachable for a non-empty pattern; keeps TypeScript satisfied.
  return { phase: pattern[0], index: 0, secondsLeft: pattern[0].seconds, cycles };
}
