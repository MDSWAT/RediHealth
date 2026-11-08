import type { Lang } from "@/lib/i18n/translations";

/** The four parts of the heart the anatomy panel explains. */
export type HeartPartId = "aorta" | "left-ventricle" | "coronary-arteries" | "vena-cava";

export interface HeartPart {
  id: HeartPartId;
  /** Number drawn on the diagram marker. */
  marker: 1 | 2 | 3 | 4;
  name: Record<Lang, string>;
  /** What this part does, in one plain sentence or two. */
  role: Record<Lang, string>;
  /** What years of high blood pressure do to it, in plain words. */
  whenHigh: Record<Lang, string>;
}

export const HEART_PARTS: HeartPart[] = [
  {
    id: "aorta",
    marker: 1,
    name: {
      ro: "Aorta",
      en: "Aorta",
      sq: "Aorta",
      it: "Aorta",
    },
    role: {
      ro: "Cea mai mare arteră din corp. Duce sângele bogat în oxigen de la inimă spre tot corpul.",
      en: "The body's largest artery. It carries oxygen-rich blood from the heart to the rest of the body.",
      sq: "Arteria më e madhe e trupit. Çon gjakun e pasur me oksigjen nga zemra në të gjithë trupin.",
      it: "L'arteria più grande del corpo. Porta il sangue ricco di ossigeno dal cuore a tutto il corpo.",
    },
    whenHigh: {
      ro: "Tensiunea mare apasă tot timpul pe peretele aortei. Cu anii, peretele se poate întări sau slăbi.",
      en: "High blood pressure pushes on the aortic wall all the time. Over the years the wall can stiffen or weaken.",
      sq: "Tensioni i lartë shtyp vazhdimisht murin e aortës. Me kalimin e viteve, muri mund të ngurtësohet ose të dobësohet.",
      it: "La pressione alta spinge di continuo sulla parete dell'aorta. Con gli anni la parete può irrigidirsi o indebolirsi.",
    },
  },
  {
    id: "left-ventricle",
    marker: 2,
    name: {
      ro: "Ventriculul stâng",
      en: "Left ventricle",
      sq: "Barkushja e majtë",
      it: "Ventricolo sinistro",
    },
    role: {
      ro: "Camera cea mai puternică a inimii. Se strânge la fiecare bătaie și împinge sângele în aortă.",
      en: "The heart's strongest chamber. It squeezes with every beat and pushes blood into the aorta.",
      sq: "Dhoma më e fortë e zemrës. Shtrëngohet me çdo rrahje dhe e shtyn gjakun në aortë.",
      it: "La camera più forte del cuore. Si contrae a ogni battito e spinge il sangue nell'aorta.",
    },
    whenHigh: {
      ro: "Când tensiunea rămâne mare ani la rând, mușchiul trebuie să împingă mai tare. Se îngroașă și obosește mai ușor.",
      en: "When blood pressure stays high for years, the muscle has to push harder. It thickens and tires more easily.",
      sq: "Kur tensioni mbetet i lartë për vite, muskuli duhet të shtyjë më fort. Ai trashet dhe lodhet më shpejt.",
      it: "Quando la pressione resta alta per anni, il muscolo deve spingere più forte. Si ispessisce e si stanca più facilmente.",
    },
  },
  {
    id: "coronary-arteries",
    marker: 3,
    name: {
      ro: "Arterele coronare",
      en: "Coronary arteries",
      sq: "Arteriet koronare",
      it: "Arterie coronarie",
    },
    role: {
      ro: "Vase mici de pe suprafața inimii. Aduc sânge și oxigen chiar mușchiului inimii.",
      en: "Small vessels on the surface of the heart. They bring blood and oxygen to the heart muscle itself.",
      sq: "Enë të vogla në sipërfaqen e zemrës. I sjellin gjak dhe oksigjen vetë muskulit të zemrës.",
      it: "Piccoli vasi sulla superficie del cuore. Portano sangue e ossigeno al muscolo del cuore stesso.",
    },
    whenHigh: {
      ro: "Tensiunea mare le uzează pereții, iar grăsimile se depun mai ușor. Dacă o arteră se blochează, apare infarctul.",
      en: "High blood pressure wears their walls, so fatty deposits build up more easily. If one becomes blocked, a heart attack follows.",
      sq: "Tensioni i lartë ua dëmton muret dhe yndyrat depozitohen më lehtë. Nëse një arterie bllokohet, ndodh infarkti.",
      it: "La pressione alta ne logora le pareti e i grassi si depositano più facilmente. Se un'arteria si chiude, si ha un infarto.",
    },
  },
  {
    id: "vena-cava",
    marker: 4,
    name: {
      ro: "Vena cavă și atriul drept",
      en: "Vena cava and right atrium",
      sq: "Vena kava dhe atriumi i djathtë",
      it: "Vena cava e atrio destro",
    },
    role: {
      ro: "Aici se întoarce în inimă sângele care a dat oxigenul corpului, înainte să plece spre plămâni.",
      en: "Blood that has delivered its oxygen to the body comes back to the heart here, before it goes on to the lungs.",
      sq: "Këtu kthehet në zemër gjaku që i ka dhënë oksigjenin trupit, para se të shkojë te mushkëritë.",
      it: "Qui ritorna al cuore il sangue che ha già ceduto ossigeno al corpo, prima di andare ai polmoni.",
    },
    whenHigh: {
      ro: "Dacă inima obosește după ani de tensiune mare, sângele se poate aduna în urmă. Apar picioare umflate și oboseală.",
      en: "If the heart tires after years of high blood pressure, blood can back up here. This shows as swollen legs and tiredness.",
      sq: "Nëse zemra lodhet pas vitesh me tension të lartë, gjaku mund të grumbullohet këtu. Shfaqen këmbë të ënjtura dhe lodhje.",
      it: "Se il cuore si affatica dopo anni di pressione alta, il sangue può ristagnare qui. Compaiono gambe gonfie e stanchezza.",
    },
  },
];

export interface HeartAnatomyUiCopy {
  heading: string;
  intro: string;
  diagramLabel: string;
  ecgCaption: string;
  partsLabel: string;
  whenHighLabel: string;
  pause: string;
  play: string;
}

export const HEART_ANATOMY_UI_COPY: Record<Lang, HeartAnatomyUiCopy> = {
  ro: {
    heading: "Cum lucrează inima",
    intro:
      "În repaus, inima bate de aproximativ 64 de ori pe minut. La fiecare bătaie împinge sânge în artere. Tensiunea arterială este presiunea acestui sânge asupra pereților arterelor.",
    diagramLabel:
      "Desen al inimii văzute din față, care bate în ritm de repaus, cu traseul ECG dedesubt.",
    ecgCaption:
      "Linia de jos arată semnalul electric al inimii (ECG). Fiecare vârf pornește o bătaie.",
    partsLabel: "Alege o parte a inimii",
    whenHighLabel: "Când tensiunea e mare:",
    pause: "Oprește animația",
    play: "Pornește animația",
  },
  en: {
    heading: "How the heart works",
    intro:
      "At rest, the heart beats about 64 times a minute. With each beat it pushes blood into the arteries. Blood pressure is the force of that blood against the artery walls.",
    diagramLabel:
      "Front view of the heart beating at a resting rate, with its ECG trace below.",
    ecgCaption:
      "The line below shows the heart's electrical signal (ECG). Each spike starts a beat.",
    partsLabel: "Choose a part of the heart",
    whenHighLabel: "When blood pressure is high:",
    pause: "Pause animation",
    play: "Play animation",
  },
  sq: {
    heading: "Si punon zemra",
    intro:
      "Në qetësi, zemra rreh rreth 64 herë në minutë. Me çdo rrahje shtyn gjak në arterie. Tensioni i gjakut është forca e këtij gjaku mbi muret e arterieve.",
    diagramLabel:
      "Zemra e parë nga përpara, që rreh me ritëm të qetë, me gjurmën e EKG-së poshtë.",
    ecgCaption:
      "Vija poshtë tregon sinjalin elektrik të zemrës (EKG). Çdo kulm nis një rrahje.",
    partsLabel: "Zgjidh një pjesë të zemrës",
    whenHighLabel: "Kur tensioni është i lartë:",
    pause: "Ndalo animacionin",
    play: "Nis animacionin",
  },
  it: {
    heading: "Come lavora il cuore",
    intro:
      "A riposo il cuore batte circa 64 volte al minuto. A ogni battito spinge sangue nelle arterie. La pressione arteriosa è la forza di questo sangue sulle pareti delle arterie.",
    diagramLabel:
      "Il cuore visto di fronte mentre batte a ritmo di riposo, con il tracciato ECG sotto.",
    ecgCaption:
      "La linea sotto mostra il segnale elettrico del cuore (ECG). Ogni picco avvia un battito.",
    partsLabel: "Scegli una parte del cuore",
    whenHighLabel: "Quando la pressione è alta:",
    pause: "Metti in pausa l'animazione",
    play: "Avvia l'animazione",
  },
};
