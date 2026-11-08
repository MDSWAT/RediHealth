import type { Lang } from "@/lib/i18n/translations";
import type { ExplainerContent, TopicSlug } from "./types";

/** Interface strings for ExplainerStage controls. */
export interface ExplainerUiCopy {
  play: string;
  pause: string;
  previousStep: string;
  nextStep: string;
  /** Use {current} and {total} placeholders. */
  stepOf: string;
  listen: string;
}

export const EXPLAINER_UI_COPY: Record<Lang, ExplainerUiCopy> = {
  ro: {
    play: "Pornește animația",
    pause: "Oprește animația",
    previousStep: "Pasul anterior",
    nextStep: "Pasul următor",
    stepOf: "Pasul {current} din {total}",
    listen: "Ascultă explicația",
  },
  en: {
    play: "Play animation",
    pause: "Pause animation",
    previousStep: "Previous step",
    nextStep: "Next step",
    stepOf: "Step {current} of {total}",
    listen: "Listen to the explanation",
  },
  sq: {
    play: "Nis animacionin",
    pause: "Ndalo animacionin",
    previousStep: "Hapi i mëparshëm",
    nextStep: "Hapi tjetër",
    stepOf: "Hapi {current} nga {total}",
    listen: "Dëgjo shpjegimin",
  },
  it: {
    play: "Avvia l'animazione",
    pause: "Metti in pausa l'animazione",
    previousStep: "Passo precedente",
    nextStep: "Passo successivo",
    stepOf: "Passo {current} di {total}",
    listen: "Ascolta la spiegazione",
  },
};

/** BCP-47 tags for the browser speech engine. */
export const SPEECH_LANG: Record<Lang, string> = {
  ro: "ro-RO",
  en: "en-GB",
  sq: "sq-AL",
  it: "it-IT",
};

export function formatStepOf(template: string, current: number, total: number): string {
  return template.replace("{current}", String(current)).replace("{total}", String(total));
}

/**
 * Localized explainer content per topic. A topic without a built scene yet has
 * no entry here; see the scene registry for the build plan.
 */
export const EXPLAINER_CONTENT: Partial<Record<TopicSlug, Record<Lang, ExplainerContent>>> = {
  "heart-health": {
    ro: {
      title: "Cum pompează inima sângele",
      steps: [
        {
          id: "pump",
          caption:
            "Inima e o pompă. La fiecare bătaie, împinge sânge cu oxigen prin artere, spre creier și mușchi.",
          ariaLabel: "Animație: inima bate și împinge sângele prin artere",
        },
      ],
    },
    en: {
      title: "How the heart pumps blood",
      steps: [
        {
          id: "pump",
          caption:
            "Your heart is a pump. With every beat, it pushes blood full of oxygen through your arteries to your brain and muscles.",
          ariaLabel: "Animation: the heart beats and pushes blood through the arteries",
        },
      ],
    },
    sq: {
      title: "Si e pompon zemra gjakun",
      steps: [
        {
          id: "pump",
          caption:
            "Zemra është një pompë. Me çdo rrahje, shtyn gjak me oksigjen nëpër arterie, drejt trurit dhe muskujve.",
          ariaLabel: "Animacion: zemra rreh dhe shtyn gjakun nëpër arterie",
        },
      ],
    },
    it: {
      title: "Come il cuore pompa il sangue",
      steps: [
        {
          id: "pump",
          caption:
            "Il cuore è una pompa. A ogni battito spinge sangue ricco di ossigeno nelle arterie, fino al cervello e ai muscoli.",
          ariaLabel: "Animazione: il cuore batte e spinge il sangue nelle arterie",
        },
      ],
    },
  },
  diabetes: {
    ro: {
      title: "Cum lucrează insulina",
      steps: [
        {
          id: "key",
          caption:
            "Insulina e ca o cheie mică. Deschide celulele, ca zahărul din sânge (glucoza) să intre și să devină energie.",
          ariaLabel: "Animație: insulina deschide celula, iar glucoza intră",
        },
      ],
    },
    en: {
      title: "How insulin works",
      steps: [
        {
          id: "key",
          caption:
            "Insulin is like a small key. It opens your cells so the sugar in your blood (glucose) can get in and become energy.",
          ariaLabel: "Animation: insulin opens the cell and glucose moves in",
        },
      ],
    },
    sq: {
      title: "Si punon insulina",
      steps: [
        {
          id: "key",
          caption:
            "Insulina është si një çelës i vogël. Hap qelizat, që sheqeri në gjak (glukoza) të hyjë dhe të bëhet energji.",
          ariaLabel: "Animacion: insulina hap qelizën dhe glukoza hyn brenda",
        },
      ],
    },
    it: {
      title: "Come funziona l'insulina",
      steps: [
        {
          id: "key",
          caption:
            "L'insulina è come una piccola chiave. Apre le cellule, così lo zucchero nel sangue (glucosio) entra e diventa energia.",
          ariaLabel: "Animazione: l'insulina apre la cellula e il glucosio entra",
        },
      ],
    },
  },
  smoking: {
    ro: {
      title: "Cum intră oxigenul în plămâni",
      steps: [
        {
          id: "breathe",
          caption:
            "Când respiri adânc, milioane de săculeți mici din plămâni (alveolele) se umplu cu aer. De acolo, oxigenul trece în sânge.",
          ariaLabel: "Animație: plămânii se umplu cu aer și trimit oxigen în sânge",
        },
      ],
    },
    en: {
      title: "How oxygen enters the lungs",
      steps: [
        {
          id: "breathe",
          caption:
            "When you breathe in deeply, millions of tiny air sacs in your lungs (alveoli) fill with air. From there, oxygen passes into your blood.",
          ariaLabel: "Animation: the lungs fill with air and send oxygen into the blood",
        },
      ],
    },
    sq: {
      title: "Si hyn oksigjeni në mushkëri",
      steps: [
        {
          id: "breathe",
          caption:
            "Kur merr frymë thellë, miliona qeska të vogla në mushkëri (alveolat) mbushen me ajër. Prej andej, oksigjeni kalon në gjak.",
          ariaLabel: "Animacion: mushkëritë mbushen me ajër dhe dërgojnë oksigjen në gjak",
        },
      ],
    },
    it: {
      title: "Come l'ossigeno entra nei polmoni",
      steps: [
        {
          id: "breathe",
          caption:
            "Quando respiri a fondo, milioni di piccoli sacchetti nei polmoni (alveoli) si riempiono d'aria. Da lì l'ossigeno passa nel sangue.",
          ariaLabel: "Animazione: i polmoni si riempiono d'aria e mandano ossigeno nel sangue",
        },
      ],
    },
  },
};
