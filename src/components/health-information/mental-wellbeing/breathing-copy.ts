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
  /** Intro shown under reduced motion, when the circle stays still and the word and seconds lead. */
  introReduced: string;
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
    introReduced:
      "Stai comod, cu umerii relaxați. Urmărește cuvântul din cerc și secundele de sub el. Inspiră pe nas la „Inspiră” și expiră încet pe gură la „Expiră”. Expirația mai lungă ajută corpul să se liniștească.",
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
    introReduced:
      "Sit comfortably with your shoulders relaxed. Follow the word in the circle and the seconds under it. Breathe in through your nose on “Breathe in” and out slowly through your mouth on “Breathe out”. A longer out-breath helps your body calm down.",
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
    introReduced:
      "Ulu rehat, me supet të lëshuara. Ndiq fjalën në rreth dhe sekondat poshtë saj. Merr frymë nga hunda kur shkruan „Merr frymë” dhe nxirre ngadalë nga goja kur shkruan „Nxirre frymën”. Kur e nxjerr frymën më gjatë, trupi qetësohet më lehtë.",
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
    introReduced:
      "Siediti comodo, con le spalle rilassate. Segui la parola nel cerchio e i secondi sotto. Inspira dal naso quando leggi «Inspira» ed espira piano dalla bocca quando leggi «Espira». Un'espirazione più lunga aiuta il corpo a calmarsi.",
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
    listen: "Ascolta le istruzioni",
    ariaLabel: "Un cerchio che cresce quando inspiri e si rimpicciolisce quando espiri",
    credit: "Esercizio adattato dalla guida NHS “Breathing exercises for stress”.",
    chimesToggle: "Suono guida",
    chimesActive: "Suono guida attivo",
    chimesMuted: "Suono guida disattivato",
  },
  hr: {
    title: "Mirno disanje",
    intro:
      "Sjedni udobno i opusti ramena. Prati krug. Udahni kroz nos dok krug raste i polako izdahni na usta dok se smanjuje. Dulji izdisaj pomaže tijelu da se smiri.",
    introReduced:
      "Sjedni udobno i opusti ramena. Prati riječ u krugu i sekunde ispod nje. Udahni kroz nos kada piše „Udahni” i polako izdahni na usta kada piše „Izdahni”. Dulji izdisaj pomaže tijelu da se smiri.",
    patterns: {
      relaxed: "Sporo disanje (4 s / 6 s)",
      box: "Disanje u kvadratu (4–4–4–4)",
    },
    patternGroupLabel: "Odaberi ritam disanja",
    phases: { in: "Udahni", holdFull: "Zadrži dah", out: "Izdahni", holdEmpty: "Stanka" },
    ready: "Pritisni „Počni” kada budeš spreman.",
    finished: "Gotovo. Sada diši normalno.",
    start: "Počni",
    stop: "Zaustavi",
    cycles: "Potpuni udisaji i izdisaji: {count}",
    safety:
      "Ako osjetiš vrtoglavicu, stani i diši normalno. Ako si u krizi ili razmišljaš da si naudiš, odmah nazovi 112.",
    listen: "Poslušaj upute",
    ariaLabel: "Krug koji raste dok udišeš i smanjuje se dok izdišeš",
    credit: "Vježba prilagođena prema vodiču NHS-a za vježbe disanja kod stresa.",
    chimesToggle: "Zvučni znak",
    chimesActive: "Zvučni znak uključen",
    chimesMuted: "Zvučni znak isključen",
  },
  rom: {
    title: "Mirno phurdimos",
    intro:
      "Besh lokhes thaj muk le phike tele. Dikh pala o cherklo. Le bavlal po nakh kana barol thaj muk la lokhes po muj kana tiknyol. Kana mukes i bavlal may lunges, o trupo achel may mirno.",
    introReduced:
      "Besh lokhes thaj muk le phike tele. Dikh o lav and-o cherklo thaj le sekunde telal leste. Le bavlal po nakh kana phendyol „Le bavlal” thaj muk la lokhes po muj kana phendyol „Muk i bavlal”. Kana mukes i bavlal may lunges, o trupo achel may mirno.",
    patterns: {
      relaxed: "Lokho phurdimos (4 s / 6 s)",
      box: "Phurdimos and-o kvadrato (4–4–4–4)",
    },
    patternGroupLabel: "Alosar o ritmo le phurdimasko",
    phases: { in: "Le bavlal", holdFull: "Inker i bavlal", out: "Muk i bavlal", holdEmpty: "Pauza" },
    ready: "Phusav „Astar” kana san gata.",
    finished: "Gata. Akana phurde normalno.",
    start: "Astar",
    stop: "Astav",
    cycles: "Sa le phurdimata: {count}",
    safety:
      "Te phirela tiri shero, astav thaj phurde normalno. Te san and-i bari kriza vay gindis te keres tuke nasul, akhar sigo sigardiari 112.",
    listen: "Ashun so te keres",
    ariaLabel: "Cherklo savo barol kana leles bavlal thaj tiknyol kana mukes la",
    credit: "Vezhba kerdini pala o sikavimos NHS vaš o mirno phurdimos kana si streso.",
    chimesToggle: "Glaso savo ingarel",
    chimesActive: "O glaso si muklo",
    chimesMuted: "O glaso si astardo",
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
