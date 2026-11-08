import type { Lang } from "@/lib/i18n/translations";

export interface ActivityStage {
  id: string;
  timeBadge: string;
  title: string;
  /** Why it helps, in plain words. */
  physiology: string;
  /** One concrete thing to try. */
  action: string;
}

export type ActivityBandId = "none" | "building" | "target" | "above";

export interface ActivityBand {
  id: ActivityBandId;
  title: string;
  description: string;
}

export interface ActivityCopy {
  title: string;
  subtitle: string;
  /** Accessible name of the tab list. */
  tabsLabel: string;
  tabStepper: string;
  tabRing: string;
  stepper: {
    /** Accessible name of the group of steps. */
    groupLabel: string;
    whyLabel: string;
    practicalTipLabel: string;
    nextButton: string;
    prevButton: string;
    /** "{n} of {total}" */
    stepOfTemplate: string;
    /** Caption under the weekly diagram. */
    weekCaption: string;
    /** Day initials, Monday first, shown under the diagram's columns. */
    dayInitials: string[];
    stages: ActivityStage[];
  };
  planner: {
    minutesLabel: string;
    daysLabel: string;
    /** "{minutes} minutes a week" */
    weeklyTotalTemplate: string;
    /** Legend for the shaded 150–300 band on the meter. */
    rangeLabel: string;
    targetNote: string;
    strengthNote: string;
    bands: ActivityBand[];
  };
  safetyDisclaimer: string;
  credit: string;
}

export const ACTIVITY_COPY: Record<Lang, ActivityCopy> = {
  ro: {
    title: "Mișcarea de zi cu zi",
    subtitle: "Nu ai nevoie de sală. Vezi cum începi și câtă mișcare îți trebuie.",
    tabsLabel: "Activitate fizică",
    tabStepper: "Cum te miști",
    tabRing: "Câtă mișcare îți trebuie",
    stepper: {
      groupLabel: "Alege un pas",
      whyLabel: "De ce ajută",
      practicalTipLabel: "Încearcă",
      nextButton: "Pasul următor",
      prevButton: "Pasul anterior",
      stepOfTemplate: "Pasul {n} din {total}",
      weekCaption: "O săptămână: fiecare coloană este o zi. Cu cât bara e mai înaltă, cu atât ai mers mai multe minute.",
      dayInitials: ["L", "M", "M", "J", "V", "S", "D"],
      stages: [
        {
          id: "sedentary-break",
          timeBadge: "Câteva minute, la fiecare oră",
          title: "Ridică-te din când în când",
          physiology:
            "Statul mult pe scaun nu e bun pentru inimă și pentru zahărul din sânge, chiar dacă te miști în alte momente.",
          action:
            "Ridică-te măcar o dată pe oră. Dezmorțește-te, ia-ți un pahar cu apă sau vorbește la telefon în picioare.",
        },
        {
          id: "daily-steps",
          timeBadge: "10–15 minute",
          title: "Mers ușor în fiecare zi",
          physiology: "Mersul pune în mișcare mușchii picioarelor, care ajută sângele să urce înapoi spre inimă.",
          action: "Coboară cu o stație mai devreme sau mergi pe jos la cumpărături.",
        },
        {
          id: "brisk-cardio",
          timeBadge: "20–30 minute",
          title: "Mers alert",
          physiology:
            "La mersul alert respiri mai repede, dar încă poți vorbi. Asta întărește inima și poate scădea tensiunea.",
          action: "Mergi atât de repede încât poți vorbi, dar nu poți cânta. Încearcă 30 de minute, 5 zile pe săptămână.",
        },
        {
          id: "strength-balance",
          timeBadge: "2 zile pe săptămână",
          title: "Forță și echilibru",
          physiology:
            "Mușchii puternici îți apără încheieturile și oasele. Scad riscul de cădere, mai ales după 65 de ani.",
          action:
            "Ridică-te de pe scaun de 10 ori. Fă flotări cu mâinile pe perete. Cară sacoșele împărțit, în ambele mâini.",
        },
      ],
    },
    planner: {
      minutesLabel: "Minute de mișcare pe zi",
      daysLabel: "Zile pe săptămână",
      weeklyTotalTemplate: "{minutes} minute pe săptămână",
      rangeLabel: "Recomandarea OMS: 150–300 de minute",
      targetNote:
        "OMS recomandă adulților 150–300 de minute de mișcare moderată pe săptămână, de exemplu mers alert.",
      strengthNote: "Adaugă exerciții de forță în cel puțin 2 zile pe săptămână.",
      bands: [
        {
          id: "none",
          title: "Începe cu puțin",
          description: "Câteva minute de mers pe zi sunt mai bune decât nimic. Fă cât poți.",
        },
        {
          id: "building",
          title: "Mai adaugă puțin",
          description:
            "Adaugă câte 5 minute pe zi, până ajungi la 150 de minute pe săptămână.",
        },
        {
          id: "target",
          title: "Ai atins recomandarea OMS",
          description:
            "150–300 de minute de mișcare moderată pe săptămână ajută inima, somnul și starea ta.",
        },
        {
          id: "above",
          title: "Peste recomandare",
          description: "Mai multă mișcare te ajută și mai mult. Ascultă-ți corpul și lasă și zile mai ușoare.",
        },
      ],
    },
    safetyDisclaimer:
      "Este normal să respiri mai repede și să îți bată inima mai tare când faci efort. Dacă simți amețeală sau un disconfort neobișnuit, oprește-te, așază-te câteva minute până îți revii și discută cu medicul de familie.",
    credit: "Sursa: recomandările Organizației Mondiale a Sănătății privind activitatea fizică (2020).",
  },
  en: {
    title: "Moving every day",
    subtitle: "You don't need a gym. See how to start and how much activity you need.",
    tabsLabel: "Physical activity",
    tabStepper: "Ways to move",
    tabRing: "How much is enough",
    stepper: {
      groupLabel: "Choose a step",
      whyLabel: "Why it helps",
      practicalTipLabel: "Try this",
      nextButton: "Next step",
      prevButton: "Previous step",
      stepOfTemplate: "Step {n} of {total}",
      weekCaption: "One week: each column is a day. The taller the bar, the more minutes of walking.",
      dayInitials: ["M", "T", "W", "T", "F", "S", "S"],
      stages: [
        {
          id: "sedentary-break",
          timeBadge: "A few minutes, every hour",
          title: "Get up now and then",
          physiology:
            "Sitting for a long time is bad for your heart and blood sugar, even if you move at other times.",
          action: "Stand up at least once an hour. Stretch, get a glass of water or take phone calls standing.",
        },
        {
          id: "daily-steps",
          timeBadge: "10–15 minutes",
          title: "Easy walking every day",
          physiology: "Walking works your leg muscles, which help push blood back up to your heart.",
          action: "Get off one stop early or walk to the shops.",
        },
        {
          id: "brisk-cardio",
          timeBadge: "20–30 minutes",
          title: "Brisk walking",
          physiology:
            "When you walk briskly you breathe faster but can still talk. This makes your heart stronger and can lower blood pressure.",
          action: "Walk fast enough that you can talk but not sing. Try 30 minutes, 5 days a week.",
        },
        {
          id: "strength-balance",
          timeBadge: "2 days a week",
          title: "Strength and balance",
          physiology:
            "Strong muscles protect your joints and bones. They lower the risk of falls, especially after 65.",
          action: "Stand up from a chair 10 times. Do push-ups against a wall. Carry your shopping in both hands.",
        },
      ],
    },
    planner: {
      minutesLabel: "Minutes of activity a day",
      daysLabel: "Days a week",
      weeklyTotalTemplate: "{minutes} minutes a week",
      rangeLabel: "WHO recommendation: 150–300 minutes",
      targetNote:
        "The WHO advises adults to do 150–300 minutes of moderate activity a week, such as brisk walking.",
      strengthNote: "Add muscle-strengthening activity on at least 2 days a week.",
      bands: [
        {
          id: "none",
          title: "Start small",
          description: "A few minutes of walking a day is better than none. Do what you can.",
        },
        {
          id: "building",
          title: "Add a little more",
          description: "Add 5 minutes a day at a time, until you reach 150 minutes a week.",
        },
        {
          id: "target",
          title: "You've reached the WHO recommendation",
          description:
            "150–300 minutes of moderate activity a week helps your heart, sleep and mood.",
        },
        {
          id: "above",
          title: "Above the recommendation",
          description: "More activity helps even more. Listen to your body and keep some easier days.",
        },
      ],
    },
    safetyDisclaimer:
      "Breathing faster and feeling your heart beat harder is normal when you exert yourself. If you feel dizzy or notice unusual discomfort, stop, sit down for a few minutes until it passes, and speak with your family doctor.",
    credit: "Source: World Health Organization guidelines on physical activity and sedentary behavior (2020).",
  },
  sq: {
    title: "Lëvizja e përditshme",
    subtitle: "Nuk të duhet palestër. Shiko si të fillosh dhe sa lëvizje të duhet.",
    tabsLabel: "Aktiviteti fizik",
    tabStepper: "Si të lëvizësh",
    tabRing: "Sa lëvizje të duhet",
    stepper: {
      groupLabel: "Zgjidh një hap",
      whyLabel: "Pse ndihmon",
      practicalTipLabel: "Provo",
      nextButton: "Hapi tjetër",
      prevButton: "Hapi i mëparshëm",
      stepOfTemplate: "Hapi {n} nga {total}",
      weekCaption: "Një javë: çdo kolonë është një ditë. Sa më e lartë shtylla, aq më shumë minuta ecje.",
      dayInitials: ["H", "M", "M", "E", "P", "Sh", "D"],
      stages: [
        {
          id: "sedentary-break",
          timeBadge: "Disa minuta, çdo orë",
          title: "Çohu herë pas here",
          physiology:
            "Të ndenjurit gjatë ulur nuk i bën mirë zemrës dhe sheqerit në gjak, edhe nëse lëviz në momente të tjera.",
          action:
            "Çohu të paktën një herë në orë. Zgjat trupin, merr një gotë ujë ose fol në telefon në këmbë.",
        },
        {
          id: "daily-steps",
          timeBadge: "10–15 minuta",
          title: "Ecje e lehtë çdo ditë",
          physiology: "Ecja vë në punë muskujt e këmbëve, të cilët e ndihmojnë gjakun të kthehet drejt zemrës.",
          action: "Zbrit një stacion më herët ose shko në këmbë për pazar.",
        },
        {
          id: "brisk-cardio",
          timeBadge: "20–30 minuta",
          title: "Ecje e shpejtë",
          physiology:
            "Kur ecën shpejt, merr frymë më shpejt, por ende mund të flasësh. Kjo forcon zemrën dhe mund të ulë tensionin.",
          action: "Ec aq shpejt sa mund të flasësh, por jo të këndosh. Provo 30 minuta, 5 ditë në javë.",
        },
        {
          id: "strength-balance",
          timeBadge: "2 ditë në javë",
          title: "Forcë dhe ekuilibër",
          physiology:
            "Muskujt e fortë mbrojnë kyçet dhe kockat. Ulin rrezikun e rrëzimit, sidomos pas moshës 65 vjeç.",
          action: "Çohu nga karrigia 10 herë. Bëj shtytje me duart te muri. Mbaji çantat me të dyja duart.",
        },
      ],
    },
    planner: {
      minutesLabel: "Minuta aktiviteti në ditë",
      daysLabel: "Ditë në javë",
      weeklyTotalTemplate: "{minutes} minuta në javë",
      rangeLabel: "Rekomandimi i OBSH-së: 150–300 minuta",
      targetNote:
        "Për të rriturit, OBSH rekomandon 150–300 minuta aktivitet të moderuar në javë, për shembull ecje të shpejtë.",
      strengthNote: "Shto ushtrime force të paktën 2 ditë në javë.",
      bands: [
        {
          id: "none",
          title: "Fillo me pak",
          description: "Disa minuta ecje në ditë janë më mirë se asgjë. Bëj aq sa mundesh.",
        },
        {
          id: "building",
          title: "Shto edhe pak",
          description: "Shto nga 5 minuta në ditë, derisa të arrish 150 minuta në javë.",
        },
        {
          id: "target",
          title: "E arrite rekomandimin e OBSH-së",
          description:
            "150–300 minuta lëvizje të moderuar në javë ndihmojnë zemrën, gjumin dhe humorin.",
        },
        {
          id: "above",
          title: "Mbi rekomandimin",
          description: "Më shumë lëvizje të ndihmon edhe më shumë. Dëgjo trupin dhe lër edhe ditë më të lehta.",
        },
      ],
    },
    safetyDisclaimer:
      "Është normale të marrësh frymë më shpejt dhe zemra të rrahë më fort kur bën sforcim. Nëse ndien marramendje ose shqetësim të pazakontë, ndalo, ulu disa minuta derisa të kalojë dhe fol me mjekun e familjes.",
    credit: "Burimi: udhëzimet e Organizatës Botërore të Shëndetësisë për aktivitetin fizik (2020).",
  },
  it: {
    title: "Muoversi ogni giorno",
    subtitle: "Non serve la palestra. Vedi come iniziare e quanto movimento ti serve.",
    tabsLabel: "Attività fisica",
    tabStepper: "Modi per muoversi",
    tabRing: "Quanto movimento ti serve",
    stepper: {
      groupLabel: "Scegli un passo",
      whyLabel: "Perché aiuta",
      practicalTipLabel: "Prova così",
      nextButton: "Passo successivo",
      prevButton: "Passo precedente",
      stepOfTemplate: "Passo {n} di {total}",
      weekCaption: "Una settimana: ogni colonna è un giorno. Più alta è la barra, più minuti di camminata.",
      dayInitials: ["L", "M", "M", "G", "V", "S", "D"],
      stages: [
        {
          id: "sedentary-break",
          timeBadge: "Pochi minuti, ogni ora",
          title: "Alzati ogni tanto",
          physiology:
            "Stare seduto a lungo fa male al cuore e allo zucchero nel sangue, anche se ti muovi in altri momenti.",
          action:
            "Alzati almeno una volta all'ora. Sgranchisciti, prendi un bicchiere d'acqua o telefona in piedi.",
        },
        {
          id: "daily-steps",
          timeBadge: "10–15 minuti",
          title: "Camminata leggera ogni giorno",
          physiology: "Camminare attiva i muscoli delle gambe, che aiutano il sangue a tornare verso il cuore.",
          action: "Scendi una fermata prima o vai a piedi a fare la spesa.",
        },
        {
          id: "brisk-cardio",
          timeBadge: "20–30 minuti",
          title: "Camminata veloce",
          physiology:
            "Con la camminata veloce respiri più in fretta, ma riesci ancora a parlare. Questo rafforza il cuore e può abbassare la pressione.",
          action: "Cammina veloce, tanto da riuscire a parlare ma non a cantare. Prova 30 minuti, 5 giorni a settimana.",
        },
        {
          id: "strength-balance",
          timeBadge: "2 giorni a settimana",
          title: "Forza ed equilibrio",
          physiology:
            "Muscoli forti proteggono articolazioni e ossa. Riducono il rischio di cadute, soprattutto dopo i 65 anni.",
          action: "Alzati dalla sedia 10 volte. Fai piegamenti con le mani al muro. Porta la spesa con tutte e due le mani.",
        },
      ],
    },
    planner: {
      minutesLabel: "Minuti di attività al giorno",
      daysLabel: "Giorni a settimana",
      weeklyTotalTemplate: "{minutes} minuti a settimana",
      rangeLabel: "Raccomandazione OMS: 150–300 minuti",
      targetNote:
        "L'OMS consiglia agli adulti 150–300 minuti di attività moderata a settimana, per esempio la camminata veloce.",
      strengthNote: "Aggiungi esercizi di forza almeno 2 giorni a settimana.",
      bands: [
        {
          id: "none",
          title: "Inizia con poco",
          description: "Pochi minuti di camminata al giorno sono meglio di niente. Fai quello che puoi.",
        },
        {
          id: "building",
          title: "Aggiungi ancora un po'",
          description:
            "Aggiungi 5 minuti al giorno alla volta, fino ad arrivare a 150 minuti a settimana.",
        },
        {
          id: "target",
          title: "Hai raggiunto la raccomandazione OMS",
          description:
            "150–300 minuti di attività moderata a settimana aiutano cuore, sonno e umore.",
        },
        {
          id: "above",
          title: "Oltre la raccomandazione",
          description: "Muoverti di più ti aiuta ancora di più. Ascolta il tuo corpo e tieni anche giorni più leggeri.",
        },
      ],
    },
    safetyDisclaimer:
      "Respirare più in fretta e sentire il battito più forte è normale durante lo sforzo. Se avverti capogiri o un fastidio insolito, fermati, siediti per qualche minuto finché passa e parlane con il medico di famiglia.",
    credit: "Fonte: linee guida dell'Organizzazione Mondiale della Sanità sull'attività fisica (2020).",
  },
};

/** Which message fits a weekly total (WHO: 150–300 minutes of moderate activity a week). */
export function getActivityBandId(weeklyMinutes: number): ActivityBandId {
  if (weeklyMinutes <= 0) return "none";
  if (weeklyMinutes < 150) return "building";
  if (weeklyMinutes <= 300) return "target";
  return "above";
}
