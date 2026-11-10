import type { Lang } from "@/lib/i18n/translations";

export interface RecoveryMilestone {
  id: string;
  badge: string;
  title: string;
  /** What the reader may notice in daily life. */
  patientFeel: string;
  /** What changes in the body, in plain words (WHO / NHS quit-smoking timelines). */
  clinicalMetric: string;
}

export interface SmokingTimelineCopy {
  componentTitle: string;
  componentSubtitle: string;
  /** Accessible name of the group of time points. */
  scrubberLabel: string;
  prevStepLabel: string;
  nextStepLabel: string;
  /** "{n} of {total}" */
  stepOfTemplate: string;
  patientFeelHeading: string;
  clinicalMetricHeading: string;
  credit: string;
  milestones: RecoveryMilestone[];
}

export const SMOKING_TIMELINE_COPY: Record<Lang, SmokingTimelineCopy> = {
  ro: {
    componentTitle: "Ce se întâmplă după ultima țigară",
    componentSubtitle:
      "Corpul începe să se refacă din primele minute. Alege un moment și vezi ce se schimbă.",
    scrubberLabel: "Timp de la ultima țigară",
    prevStepLabel: "Momentul anterior",
    nextStepLabel: "Momentul următor",
    stepOfTemplate: "{n} din {total}",
    patientFeelHeading: "Ce poți simți",
    clinicalMetricHeading: "Ce se schimbă în corp",
    credit: "Surse: Organizația Mondială a Sănătății și NHS (Regatul Unit).",
    milestones: [
      {
        id: "20m",
        badge: "20 minute",
        title: "Pulsul și tensiunea încep să scadă",
        patientFeel: "Mâinile și picioarele se pot încălzi pe măsură ce circulația se îmbunătățește.",
        clinicalMetric: "Ritmul inimii și tensiunea arterială coboară spre valorile tale obișnuite.",
      },
      {
        id: "8h",
        badge: "8 ore",
        title: "Monoxidul de carbon din sânge scade la jumătate",
        patientFeel: "Sângele duce mai mult oxigen, așa că oboseala poate fi mai mică.",
        clinicalMetric: "Nivelul de oxigen din sânge revine spre normal.",
      },
      {
        id: "48h",
        badge: "48 de ore",
        title: "Gustul și mirosul încep să revină",
        patientFeel: "Mâncarea poate avea mai mult gust, iar mirosurile se simt mai clar.",
        clinicalMetric: "Monoxidul de carbon a fost eliminat, iar plămânii încep să curețe mucusul.",
      },
      {
        id: "1y",
        badge: "1 an",
        title: "Riscul de boală de inimă scade la jumătate",
        patientFeel: "Tusea și lipsa de aer sunt de obicei mult mai rare decât atunci când fumai.",
        clinicalMetric: "Riscul de boală coronariană (a vaselor inimii) e cam jumătate față de al unui fumător.",
      },
      {
        id: "10y",
        badge: "10 ani",
        title: "Riscul de cancer pulmonar scade la jumătate",
        patientFeel: "Respiri și te miști mai ușor decât atunci când fumai.",
        clinicalMetric:
          "Riscul de cancer pulmonar este cam jumătate față de al unui fumător. Scade și riscul altor cancere, de exemplu de gură, gât și vezică.",
      },
    ],
  },
  en: {
    componentTitle: "What happens after your last cigarette",
    componentSubtitle:
      "Your body starts to recover within minutes. Choose a moment to see what changes.",
    scrubberLabel: "Time since your last cigarette",
    prevStepLabel: "Previous",
    nextStepLabel: "Next",
    stepOfTemplate: "{n} of {total}",
    patientFeelHeading: "What you may notice",
    clinicalMetricHeading: "What changes in your body",
    credit: "Sources: World Health Organization and NHS (UK).",
    milestones: [
      {
        id: "20m",
        badge: "20 minutes",
        title: "Heart rate and blood pressure start to drop",
        patientFeel: "Your hands and feet may feel warmer as circulation improves.",
        clinicalMetric: "Your heart rate and blood pressure move back towards your usual levels.",
      },
      {
        id: "8h",
        badge: "8 hours",
        title: "Carbon monoxide in your blood halves",
        patientFeel: "Your blood carries more oxygen, so you may feel less tired.",
        clinicalMetric: "Oxygen levels in your blood recover towards normal.",
      },
      {
        id: "48h",
        badge: "48 hours",
        title: "Taste and smell start to come back",
        patientFeel: "Food may taste better and smells become clearer.",
        clinicalMetric: "Carbon monoxide has left your body and your lungs start clearing mucus.",
      },
      {
        id: "1y",
        badge: "1 year",
        title: "Your risk of heart disease halves",
        patientFeel: "Coughing and shortness of breath are usually much less frequent than when you smoked.",
        clinicalMetric: "Your risk of coronary heart disease (disease of the heart's blood vessels) is about half that of a smoker.",
      },
      {
        id: "10y",
        badge: "10 years",
        title: "Your risk of lung cancer halves",
        patientFeel: "Breathing and moving are easier than when you smoked.",
        clinicalMetric:
          "Your risk of lung cancer is about half that of a smoker. The risk of other cancers, such as mouth, throat and bladder cancer, also falls.",
      },
    ],
  },
  sq: {
    componentTitle: "Çfarë ndodh pas cigares së fundit",
    componentSubtitle:
      "Trupi fillon të rimëkëmbet që në minutat e para. Zgjidh një moment dhe shiko çfarë ndryshon.",
    scrubberLabel: "Koha nga cigarja e fundit",
    prevStepLabel: "Momenti i mëparshëm",
    nextStepLabel: "Momenti tjetër",
    stepOfTemplate: "{n} nga {total}",
    patientFeelHeading: "Çfarë mund të vësh re",
    clinicalMetricHeading: "Çfarë ndryshon në trup",
    credit: "Burimet: Organizata Botërore e Shëndetësisë dhe NHS (Mbretëria e Bashkuar).",
    milestones: [
      {
        id: "20m",
        badge: "20 minuta",
        title: "Pulsi dhe tensioni fillojnë të bien",
        patientFeel: "Duart dhe këmbët mund të ngrohen ndërsa qarkullimi i gjakut përmirësohet.",
        clinicalMetric: "Rrahjet e zemrës dhe tensioni kthehen drejt niveleve të tua të zakonshme.",
      },
      {
        id: "8h",
        badge: "8 orë",
        title: "Monoksidi i karbonit në gjak përgjysmohet",
        patientFeel: "Gjaku mbart më shumë oksigjen, ndaj mund të ndihesh më pak i lodhur.",
        clinicalMetric: "Niveli i oksigjenit në gjak kthehet drejt normales.",
      },
      {
        id: "48h",
        badge: "48 orë",
        title: "Shija dhe nuhatja fillojnë të kthehen",
        patientFeel: "Ushqimi mund të ketë më shumë shije dhe aromat ndihen më qartë.",
        clinicalMetric: "Monoksidi i karbonit është larguar nga trupi dhe mushkëritë fillojnë të pastrojnë mukusin.",
      },
      {
        id: "1y",
        badge: "1 vit",
        title: "Rreziku i sëmundjeve të zemrës përgjysmohet",
        patientFeel: "Kolla dhe mungesa e frymës zakonisht janë shumë më të rralla se kur pije duhan.",
        clinicalMetric: "Rreziku i sëmundjes koronare (e enëve të zemrës) është rreth gjysma e atij të një duhanpirësi.",
      },
      {
        id: "10y",
        badge: "10 vjet",
        title: "Rreziku i kancerit të mushkërive përgjysmohet",
        patientFeel: "Merr frymë dhe lëviz më lehtë se kur pije duhan.",
        clinicalMetric:
          "Rreziku i kancerit të mushkërive është rreth gjysma e atij të një duhanpirësi. Bie edhe rreziku i kancereve të tjera, si ai i gojës, i fytit dhe i fshikëzës.",
      },
    ],
  },
  it: {
    componentTitle: "Cosa succede dopo l'ultima sigaretta",
    componentSubtitle:
      "Il corpo inizia a riprendersi già nei primi minuti. Scegli un momento per vedere cosa cambia.",
    scrubberLabel: "Tempo dall'ultima sigaretta",
    prevStepLabel: "Precedente",
    nextStepLabel: "Successivo",
    stepOfTemplate: "{n} di {total}",
    patientFeelHeading: "Cosa puoi notare",
    clinicalMetricHeading: "Cosa cambia nel corpo",
    credit: "Fonti: Organizzazione Mondiale della Sanità e NHS (Regno Unito).",
    milestones: [
      {
        id: "20m",
        badge: "20 minuti",
        title: "Battito e pressione iniziano a scendere",
        patientFeel: "Mani e piedi possono scaldarsi perché la circolazione migliora.",
        clinicalMetric: "Il battito cardiaco e la pressione tornano verso i tuoi valori abituali.",
      },
      {
        id: "8h",
        badge: "8 ore",
        title: "Il monossido di carbonio nel sangue si dimezza",
        patientFeel: "Il sangue trasporta più ossigeno, quindi potresti sentirti meno stanco.",
        clinicalMetric: "I livelli di ossigeno nel sangue tornano verso la normalità.",
      },
      {
        id: "48h",
        badge: "48 ore",
        title: "Gusto e olfatto iniziano a tornare",
        patientFeel: "Il cibo può avere più sapore e gli odori si sentono meglio.",
        clinicalMetric: "Il monossido di carbonio è stato eliminato e i polmoni iniziano a liberarsi dal muco.",
      },
      {
        id: "1y",
        badge: "1 anno",
        title: "Il rischio di malattie cardiache si dimezza",
        patientFeel: "Tosse e fiato corto sono di solito molto meno frequenti rispetto a quando fumavi.",
        clinicalMetric: "Il rischio di malattia coronarica (dei vasi del cuore) è circa la metà di quello di un fumatore.",
      },
      {
        id: "10y",
        badge: "10 anni",
        title: "Il rischio di tumore al polmone si dimezza",
        patientFeel: "Respiri e ti muovi con più facilità rispetto a quando fumavi.",
        clinicalMetric:
          "Il rischio di tumore al polmone è circa la metà di quello di un fumatore. Cala anche il rischio di altri tumori, come quelli di bocca, gola e vescica.",
      },
    ],
  },
  hr: {
    componentTitle: "Što se događa nakon posljednje cigarete",
    componentSubtitle:
      "Tijelo se počinje oporavljati već u prvim minutama. Odaberi trenutak i pogledaj što se mijenja.",
    scrubberLabel: "Vrijeme od posljednje cigarete",
    prevStepLabel: "Prethodno",
    nextStepLabel: "Sljedeće",
    stepOfTemplate: "{n} od {total}",
    patientFeelHeading: "Što možeš primijetiti",
    clinicalMetricHeading: "Što se mijenja u tijelu",
    credit: "Izvori: Svjetska zdravstvena organizacija i NHS (Ujedinjeno Kraljevstvo).",
    milestones: [
      {
        id: "20m",
        badge: "20 minuta",
        title: "Puls i krvni tlak počinju padati",
        patientFeel: "Šake i stopala mogu postati topliji jer se cirkulacija poboljšava.",
        clinicalMetric: "Otkucaji srca i krvni tlak vraćaju se prema tvojim uobičajenim vrijednostima.",
      },
      {
        id: "8h",
        badge: "8 sati",
        title: "Ugljični monoksid u krvi pada na polovicu",
        patientFeel: "Krv prenosi više kisika pa možeš osjećati manji umor.",
        clinicalMetric: "Razina kisika u krvi vraća se prema normalnim vrijednostima.",
      },
      {
        id: "48h",
        badge: "48 sati",
        title: "Osjet okusa i mirisa počinje se vraćati",
        patientFeel: "Hrana ima puniji okus, a mirisi se jasnije osjete.",
        clinicalMetric: "Ugljični monoksid izašao je iz tijela, a pluća se počinju čistiti od sluzi.",
      },
      {
        id: "1y",
        badge: "1 godina",
        title: "Rizik za bolest srca smanjuje se na polovicu",
        patientFeel: "Kašalj i nedostatak zraka obično su puno rjeđi nego dok si pušio.",
        clinicalMetric: "Rizik za bolest koju zahvaćaju koronarne arterije otprilike je dvostruko manji nego kod pušača.",
      },
      {
        id: "10y",
        badge: "10 godina",
        title: "Rizik za rak pluća smanjuje se na polovicu",
        patientFeel: "Dišeš i krećeš se lakše nego u vrijeme dok si pušio.",
        clinicalMetric:
          "Rizik za rak pluća otprilike je upola manji nego kod pušača. Smanjuje se i rizik za rak usne šupljine, grla i mokraćnog mjehura.",
      },
    ],
  },
  rom: {
    componentTitle: "So kerel pe palal i paluni tsigara",
    componentSubtitle:
      "O trupo astarel te sastyol andar le anglune minuturya. Alosar ekh vrama thaj dikh so paruvel pe.",
    scrubberLabel: "Vrama katar i paluni tsigara",
    prevStepLabel: "Anglal",
    nextStepLabel: "Palal",
    stepOfTemplate: "{n} katar {total}",
    patientFeelHeading: "So shaj hatyares",
    clinicalMetricHeading: "So paruvel pe and-o trupo",
    credit: "Katar: World Health Organization thaj NHS (UK).",
    milestones: [
      {
        id: "20m",
        badge: "20 minuturya",
        title: "O ilo thaj o phurdimos le ratesko astaren te hulyon",
        patientFeel: "Che vast thaj punre shaj tatyona sar o rat phirel may mishto.",
        clinicalMetric: "O marimos le ilesko thaj o rat kerdon palpale normalne.",
      },
      {
        id: "8h",
        badge: "8 chasurya",
        title: "O duxosko gazo and-o rat hulyol po dopash",
        patientFeel: "O rat ingrel may but oksigeno, kadaleske na san katka khino.",
        clinicalMetric: "O oksigeno and-o rat avel palpale ko normalno.",
      },
      {
        id: "48h",
        badge: "48 chasurya",
        title: "O shaipe thaj o sung aven palpale",
        patientFeel: "O xaben si may shukar thaj le sunga hatyardyon may vorta.",
        clinicalMetric: "O pharo gazo inklisto andar o trupo thaj le parne buke astaren te chistisaren pe.",
      },
      {
        id: "1y",
        badge: "1 bersh",
        title: "O riziko vash nasvalimos ko ilo hulyol po dopash",
        patientFeel: "O khas thaj o phari phurdinimos si but may tsera sar kana pilyan tsigare.",
        clinicalMetric: "O riziko te nasvalyol o ilo si pashe dopash katar ekh manush so inke pel duvano.",
      },
      {
        id: "10y",
        badge: "10 bersha",
        title: "O riziko vash kanchero pe parne buke hulyol po dopash",
        patientFeel: "Les phurdimos thaj phires but may lokhes sar kana pilyan duvano.",
        clinicalMetric:
          "O riziko vash kanchero pe parne buke si dopash may tikno. Hulyol vi o riziko vash aver nasvalimata ko muy thaj ki krlo.",
      },
    ],
  },
};

export interface CravingStep {
  name: string;
  desc: string;
}

export interface CravingTrigger {
  id: string;
  name: string;
  strategy: string;
}

export interface SmokingCoachCopy {
  /** Accessible name of the tab list. */
  tabsLabel: string;
  tabTimeline: string;
  tabCoach: string;
  coachHeading: string;
  coachSubtitle: string;
  protocolTitle: string;
  steps: CravingStep[];
  timerHeading: string;
  timerStart: string;
  timerPause: string;
  timerReset: string;
  timerFinished: string;
  timerCues: string[];
  triggerSectionHeading: string;
  triggerStrategyHeading: string;
  triggers: CravingTrigger[];
}

export const SMOKING_COACH_COPY: Record<Lang, SmokingCoachCopy> = {
  ro: {
    tabsLabel: "Renunțarea la fumat",
    tabTimeline: "Cum se reface corpul",
    tabCoach: "Când vine pofta",
    coachHeading: "Cum treci peste o poftă",
    coachSubtitle:
      "O poftă de țigară trece de obicei în câteva minute. Acești pași te ajută să o lași să treacă.",
    protocolTitle: "4 pași",
    steps: [
      { name: "Amână", desc: "Așteaptă câteva minute înainte să decizi ceva. Pofta slăbește de la sine." },
      { name: "Respiră adânc", desc: "Inspiră încet pe nas și expiră și mai încet pe gură. Repetă de câteva ori." },
      { name: "Bea apă", desc: "Bea un pahar de apă cu înghițituri mici. Îți ține mâinile și gura ocupate." },
      { name: "Fă altceva", desc: "Schimbă camera, ieși puțin afară sau sună pe cineva." },
    ],
    timerHeading: "Cronometru de 3 minute",
    timerStart: "Pornește",
    timerPause: "Pauză",
    timerReset: "De la capăt",
    timerFinished: "Au trecut 3 minute. De obicei, pofta este acum mai slabă.",
    timerCues: [
      "Respiră încet. Primele momente sunt cele mai grele.",
      "Bea o gură de apă.",
      "A trecut mai mult de jumătate. Lasă umerii să coboare.",
      "Aproape gata. Gândește-te de ce ai ales să renunți.",
    ],
    triggerSectionHeading: "Momente obișnuite și ce poți face în loc",
    triggerStrategyHeading: "Ce poți încerca",
    triggers: [
      {
        id: "coffee",
        name: "La cafeaua de dimineață",
        strategy:
          "Schimbă locul în care bei cafeaua, alege un ceai sau ține cana în mâna în care țineai țigara.",
      },
      {
        id: "break",
        name: "În pauza de la serviciu",
        strategy: "În loc de locul de fumat, fă o plimbare de 5 minute afară sau bea un pahar de apă.",
      },
      {
        id: "meal",
        name: "După masă",
        strategy: "Ridică-te de la masă, spală-te pe dinți sau mestecă o gumă fără zahăr.",
      },
      {
        id: "stress",
        name: "Când ești stresat sau nervos",
        strategy: "Fă câteva respirații lente, spală-te pe față cu apă rece sau ieși la o scurtă plimbare.",
      },
    ],
  },
  en: {
    tabsLabel: "Quitting smoking",
    tabTimeline: "How your body recovers",
    tabCoach: "When a craving hits",
    coachHeading: "How to get through a craving",
    coachSubtitle: "A craving usually passes within a few minutes. These steps help you let it pass.",
    protocolTitle: "4 steps",
    steps: [
      { name: "Delay", desc: "Wait a few minutes before deciding anything. The craving weakens on its own." },
      {
        name: "Breathe deeply",
        desc: "Breathe in slowly through your nose and out even more slowly through your mouth. Repeat a few times.",
      },
      { name: "Drink water", desc: "Sip a glass of water slowly. It keeps your hands and mouth busy." },
      { name: "Do something else", desc: "Change rooms, step outside for a moment or call someone." },
    ],
    timerHeading: "3-minute timer",
    timerStart: "Start",
    timerPause: "Pause",
    timerReset: "Start again",
    timerFinished: "3 minutes have passed. The craving is usually weaker now.",
    timerCues: [
      "Breathe slowly. The first moments are the hardest.",
      "Take a sip of water.",
      "More than halfway. Let your shoulders drop.",
      "Almost there. Remember why you chose to stop.",
    ],
    triggerSectionHeading: "Common moments and what to do instead",
    triggerStrategyHeading: "What you can try",
    triggers: [
      {
        id: "coffee",
        name: "Morning coffee",
        strategy: "Drink your coffee somewhere else, switch to tea, or hold the cup in the hand you smoked with.",
      },
      {
        id: "break",
        name: "Work break",
        strategy: "Instead of the smoking area, take a 5-minute walk outside or drink a glass of water.",
      },
      {
        id: "meal",
        name: "After a meal",
        strategy: "Get up from the table, brush your teeth or chew sugar-free gum.",
      },
      {
        id: "stress",
        name: "Stress or tension",
        strategy: "Take a few slow breaths, splash cool water on your face or go for a short walk.",
      },
    ],
  },
  sq: {
    tabsLabel: "Lënia e duhanit",
    tabTimeline: "Si rimëkëmbet trupi",
    tabCoach: "Kur vjen dëshira",
    coachHeading: "Si ta kalosh dëshirën për duhan",
    coachSubtitle:
      "Dëshira për duhan zakonisht kalon brenda pak minutash. Këta hapa të ndihmojnë ta lësh të kalojë.",
    protocolTitle: "4 hapa",
    steps: [
      { name: "Shtyje", desc: "Prit disa minuta para se të vendosësh diçka. Dëshira dobësohet vetë." },
      {
        name: "Merr frymë thellë",
        desc: "Merr frymë ngadalë nga hunda dhe nxirre edhe më ngadalë nga goja. Përsërite disa herë.",
      },
      { name: "Pi ujë", desc: "Pi një gotë ujë me gllënjka të vogla. Duart dhe goja mbeten të zëna." },
      { name: "Bëj diçka tjetër", desc: "Ndërro dhomë, dil pak jashtë ose telefono dikë." },
    ],
    timerHeading: "Kronometër 3-minutësh",
    timerStart: "Fillo",
    timerPause: "Pauzë",
    timerReset: "Rifillo",
    timerFinished: "Kaluan 3 minuta. Zakonisht dëshira tani është më e dobët.",
    timerCues: [
      "Merr frymë ngadalë. Çastet e para janë më të vështirat.",
      "Pi një gllënjkë ujë.",
      "Kaloi më shumë se gjysma. Lësho shpatullat.",
      "Pothuajse mbaroi. Kujto pse vendose ta lësh.",
    ],
    triggerSectionHeading: "Momente të zakonshme dhe çfarë të bësh në vend të duhanit",
    triggerStrategyHeading: "Çfarë mund të provosh",
    triggers: [
      {
        id: "coffee",
        name: "Kafeja e mëngjesit",
        strategy:
          "Pi kafenë në një vend tjetër, kalo te çaji ose mbaje filxhanin me dorën me të cilën pije duhan.",
      },
      {
        id: "break",
        name: "Pushimi në punë",
        strategy: "Në vend që të shkosh te vendi i duhanit, bëj një ecje 5-minutëshe jashtë ose pi një gotë ujë.",
      },
      {
        id: "meal",
        name: "Pas ngrënies",
        strategy: "Çohu nga tryeza, laj dhëmbët ose përtyp çamçakëz pa sheqer.",
      },
      {
        id: "stress",
        name: "Stresi ose nervozizmi",
        strategy: "Merr disa frymë të ngadalta, laj fytyrën me ujë të freskët ose dil për një ecje të shkurtër.",
      },
    ],
  },
  it: {
    tabsLabel: "Smettere di fumare",
    tabTimeline: "Come si riprende il corpo",
    tabCoach: "Quando arriva la voglia",
    coachHeading: "Come superare la voglia di fumare",
    coachSubtitle: "Di solito la voglia passa in pochi minuti. Questi passi ti aiutano a lasciarla passare.",
    protocolTitle: "4 passi",
    steps: [
      { name: "Rimanda", desc: "Aspetta qualche minuto prima di decidere. La voglia si attenua da sola." },
      {
        name: "Respira a fondo",
        desc: "Inspira lentamente dal naso ed espira ancora più lentamente dalla bocca. Ripeti qualche volta.",
      },
      { name: "Bevi acqua", desc: "Bevi un bicchiere d'acqua a piccoli sorsi. Tiene occupate mani e bocca." },
      { name: "Fai altro", desc: "Cambia stanza, esci un momento o chiama qualcuno." },
    ],
    timerHeading: "Timer di 3 minuti",
    timerStart: "Avvia",
    timerPause: "Pausa",
    timerReset: "Ricomincia",
    timerFinished: "Sono passati 3 minuti. Di solito ora la voglia è più debole.",
    timerCues: [
      "Respira lentamente. I primi momenti sono i più difficili.",
      "Bevi un sorso d'acqua.",
      "Hai superato la metà. Lascia scendere le spalle.",
      "Ci sei quasi. Ricorda perché hai scelto di smettere.",
    ],
    triggerSectionHeading: "Momenti tipici e cosa fare invece",
    triggerStrategyHeading: "Cosa puoi provare",
    triggers: [
      {
        id: "coffee",
        name: "Caffè del mattino",
        strategy: "Bevi il caffè in un altro posto, passa al tè o tieni la tazza con la mano con cui fumavi.",
      },
      {
        id: "break",
        name: "Pausa al lavoro",
        strategy: "Invece dell'area fumatori, fai una camminata di 5 minuti all'aperto o bevi un bicchiere d'acqua.",
      },
      {
        id: "meal",
        name: "Dopo i pasti",
        strategy: "Alzati da tavola, lavati i denti o mastica una gomma senza zucchero.",
      },
      {
        id: "stress",
        name: "Stress o tensione",
        strategy: "Fai qualche respiro lento, sciacquati il viso con acqua fresca o fai una breve passeggiata.",
      },
    ],
  },
  hr: {
    tabsLabel: "Prestanak pušenja",
    tabTimeline: "Kako se tijelo oporavlja",
    tabCoach: "Kada dođe želja za cigaretom",
    coachHeading: "Kako prebroditi želju za cigaretom",
    coachSubtitle: "Želja za cigaretom obično prođe za nekoliko minuta. Ovi koraci pomažu da je pustiš neka prođe.",
    protocolTitle: "4 koraka",
    steps: [
      { name: "Odgodi", desc: "Pričekaj nekoliko minuta prije ikakve odluke. Želja sama od sebe oslabi." },
      {
        name: "Duboko diši",
        desc: "Polako udahni kroz nos i još sporije izdahni kroz usta. Ponovi nekoliko puta.",
      },
      { name: "Popij vode", desc: "Polako popij čašu vode u malim gutljajima. Tako zaposliš ruke i usta." },
      { name: "Zaposli se nečim drugim", desc: "Promijeni prostoriju, kratko izađi na zrak ili nazovi nekoga." },
    ],
    timerHeading: "Mjerač vremena na 3 minute",
    timerStart: "Pokreni",
    timerPause: "Pauza",
    timerReset: "Kreni ispočetka",
    timerFinished: "Prošle su 3 minute. Želja za cigaretom sada je obično slabija.",
    timerCues: [
      "Diši polako. Prvi trenuci su najteži.",
      "Uzmi gutljaj vode.",
      "Prošlo je više od pola vremena. Opusti ramena.",
      "Još sasvim malo. Sjeti se zašto si odlučio prestati.",
    ],
    triggerSectionHeading: "Česte situacije i što učiniti umjesto pušenja",
    triggerStrategyHeading: "Što možeš isprobati",
    triggers: [
      {
        id: "coffee",
        name: "Uz jutarnju kavu",
        strategy: "Popij kavu na drugome mjestu, prijeđi na čaj ili drži šalicu u ruci u kojoj si držao cigaretu.",
      },
      {
        id: "break",
        name: "U pauzi na poslu",
        strategy: "Umjesto odlaska u prostor za pušače, prošeći 5 minuta na zraku ili popij čašu vode.",
      },
      {
        id: "meal",
        name: "Nakon obroka",
        strategy: "Odmah ustani od stola, operi zube ili uzmi žvakaću gumu bez šećera.",
      },
      {
        id: "stress",
        name: "Stres ili napetost",
        strategy: "Napravi nekoliko sporih udisaja, umij lice hladnom vodom ili izađi u kratku šetnju.",
      },
    ],
  },
  rom: {
    tabsLabel: "Te mukhes o duvano",
    tabTimeline: "Sar sastyol o trupo",
    tabCoach: "Kana avel i pofta",
    coachHeading: "Sar te nakhes opral i pofta vash tsigara",
    coachSubtitle: "I pofta vash tsigara nakhel and-e uni minuturya. Kadale 4 pasurya azhutin tut te mukhes la te nakhel.",
    protocolTitle: "4 pasurya",
    steps: [
      { name: "Azhuker", desc: "Azhuker uni minuturya anglal te keres vareso. I pofta kerdol may tikni korkori." },
      {
        name: "Phurde hor",
        desc: "Le lokhes duxo po nakh thaj mukh les avri inke may lokhes po muy. Ker kadava uni droma.",
      },
      { name: "Pi pay", desc: "Pi ekh taxtay pay tikne xurdensa. Inkerel che vast thaj cho muy pherde." },
      { name: "Ker aver buchi", desc: "Zha and-aver soba, inkli tsera avri vay mare telefono varekas." },
    ],
    timerHeading: "Kronometro pe 3 minuturya",
    timerStart: "Astar",
    timerPause: "Pauza",
    timerReset: "Katar o astarimos",
    timerFinished: "Nakhle 3 minuturya. Akana i pofta si may tikni.",
    timerCues: [
      "Phurde lokhes. Le anglune minuturya si le may phare.",
      "Pi tsera pay.",
      "Nakhlo may but sar dopash. Mukh le phikora tele.",
      "Pashe gata. Ser tuke sostar kames o sastipen.",
    ],
    triggerSectionHeading: "Vrame kana avel i pofta thaj so te keres and-o than",
    triggerStrategyHeading: "So shaj probisares",
    triggers: [
      {
        id: "coffee",
        name: "Ki teharinaki kafava",
        strategy: "Pi i kafava pe aver than, alosar chayo vay inker i chasha and-o vast kay inkerdyan i tsigara.",
      },
      {
        id: "break",
        name: "Ki pauza ki buchi",
        strategy: "And-o than te zhas kay pel pe duvano, phir 5 minuturya avri vay pi ekh taxtay pay.",
      },
      {
        id: "meal",
        name: "Palal o xaben",
        strategy: "Ushti katar i mesalya, xalav le dand vay labyar chinguma bi zaharesko.",
      },
      {
        id: "stress",
        name: "Streso vay xoli",
        strategy: "Phurde lokhes uni droma, xalav cho muy shudre payesa vay inkli te phires tsera.",
      },
    ],
  },
};
