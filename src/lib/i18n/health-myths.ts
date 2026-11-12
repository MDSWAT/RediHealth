import type { Lang } from "@/lib/i18n/translations";

export interface HealthMyth {
  id: string;
  category: string;
  categorySlug: string;
  statement: string;
  isTrue: boolean;
  statusTag: string;
  explanation: string;
  doctorName: string;
  doctorSpecialty: string;
  source: string;
  relatedTopicSlug: string;
}

export interface MythCategory {
  slug: string;
  label: string;
}

export const MYTH_CATEGORIES_RO: MythCategory[] = [
  { slug: "toate", label: "Toate miturile" },
  { slug: "vaccinuri", label: "Vaccinuri" },
  { slug: "diabet", label: "Diabet și dulciuri" },
  { slug: "inima", label: "Inimă și tensiune" },
  { slug: "antibiotice", label: "Antibiotice" },
  { slug: "femei", label: "Sănătatea femeii" },
  { slug: "alimentatie", label: "Alimentație și sare" },
  { slug: "miscare", label: "Mișcare" },
  { slug: "echilibru", label: "Echilibru emoțional" },
];

export const HEALTH_MYTHS_RO: HealthMyth[] = [
  {
    id: "myth-flu-vaccine",
    category: "Vaccinuri",
    categorySlug: "vaccinuri",
    statement: "Vaccinul antigripal îți dă gripă.",
    isTrue: false,
    statusTag: "Nu este adevărat",
    explanation:
      "Vaccinul conține doar fragmente inactive de virus: nu poate provoca gripa, ci antrenează corpul să se apere.",
    doctorName: "Dr. Elena Radu",
    doctorSpecialty: "Medicină de familie",
    source: "OMS, Ministerul Sănătății",
    relatedTopicSlug: "preventive-screening",
  },
  {
    id: "myth-diabetes-sugar",
    category: "Diabet și dulciuri",
    categorySlug: "diabet",
    statement: "Diabetul apare doar dacă mănânci prea mult zahăr.",
    isTrue: false,
    statusTag: "Nu este adevărat",
    explanation:
      "Diabetul de tip 2 ține de ereditate, sedentarism și rezistența la insulină, nu doar de dulciuri.",
    doctorName: "Dr. Mihai Stoica",
    doctorSpecialty: "Diabet și boli de nutriție",
    source: "Societatea Română de Diabet",
    relatedTopicSlug: "diabetes",
  },
  {
    id: "myth-blood-pressure",
    category: "Inimă și tensiune",
    categorySlug: "inima",
    statement: "Dacă ai tensiunea mare, te doare mereu capul sau ai amețeli.",
    isTrue: false,
    statusTag: "Nu este adevărat",
    explanation:
      "Tensiunea mare nu dă aproape niciodată simptome. Singurul mod sigur să o descoperi este măsurarea regulată.",
    doctorName: "Dr. Adrian Ionescu",
    doctorSpecialty: "Cardiologie",
    source: "Societatea Europeană de Cardiologie",
    relatedTopicSlug: "heart-health",
  },
  {
    id: "myth-antibiotics-cold",
    category: "Antibiotice",
    categorySlug: "antibiotice",
    statement: "Antibioticele vindecă mai repede răceala și gripa.",
    isTrue: false,
    statusTag: "Nu este adevărat",
    explanation:
      "Răceala și gripa sunt cauzate de virusuri, iar antibioticele acționează doar asupra bacteriilor.",
    doctorName: "Dr. Maria Popa",
    doctorSpecialty: "Boli infecțioase",
    source: "Institutul «Matei Balș»",
    relatedTopicSlug: "preventive-screening",
  },
  {
    id: "myth-womens-mammography",
    category: "Sănătatea femeii",
    categorySlug: "femei",
    statement: "Dacă nu simți niciun nod la sân, nu ai nevoie de control.",
    isTrue: false,
    statusTag: "Nu este adevărat",
    explanation:
      "Ecografia și mamografia depistează modificări milimetrice cu mult înainte să poată fi simțite la palpare.",
    doctorName: "Dr. Camelia Dobre",
    doctorSpecialty: "Obstetrică-ginecologie",
    source: "Ghidurile europene de screening",
    relatedTopicSlug: "womens-health",
  },
  {
    id: "myth-smoking-filters",
    category: "Inimă și tensiune",
    categorySlug: "inima",
    statement: "Țigările cu filtru sau tutunul încălzit nu fac rău inimii.",
    isTrue: false,
    statusTag: "Nu este adevărat",
    explanation:
      "Nicotina îngustează vasele de sânge și crește pulsul indiferent de forma în care fumezi.",
    doctorName: "Dr. Adrian Ionescu",
    doctorSpecialty: "Cardiologie",
    source: "OMS",
    relatedTopicSlug: "smoking",
  },
  {
    id: "myth-healthy-eating-salt",
    category: "Alimentație și sare",
    categorySlug: "alimentatie",
    statement: "Sarea roz de Himalaya sau sarea de mare e sănătoasă și poți mânca oricât.",
    isTrue: false,
    statusTag: "Nu este adevărat",
    explanation:
      "Orice tip de sare conține circa 98% clorură de sodiu și crește tensiunea la fel; limita sigură rămâne sub 5 g pe zi.",
    doctorName: "Dr. Mihai Stoica",
    doctorSpecialty: "Diabet și boli de nutriție",
    source: "OMS, Societatea Română de Nutriție",
    relatedTopicSlug: "healthy-eating",
  },
  {
    id: "myth-physical-activity-gym",
    category: "Mișcare",
    categorySlug: "miscare",
    statement: "Mișcarea ajută sănătatea doar dacă mergi la sală sau faci efort intens.",
    isTrue: false,
    statusTag: "Nu este adevărat",
    explanation:
      "Mersul vioi pe jos, urcatul scărilor și munca în gospodărie scad tensiunea și glicemia fără antrenamente intense.",
    doctorName: "Dr. Adrian Ionescu",
    doctorSpecialty: "Cardiologie",
    source: "OMS",
    relatedTopicSlug: "physical-activity",
  },
  {
    id: "myth-mental-weakness",
    category: "Echilibru emoțional",
    categorySlug: "echilibru",
    statement: "Dacă ai anxietate sau ești trist mult timp, înseamnă că ești slab.",
    isTrue: false,
    statusTag: "Nu este adevărat",
    explanation:
      "Anxietatea și depresia sunt afecțiuni medicale tratabile, nu o slăbiciune de caracter.",
    doctorName: "Dr. Elena Radu",
    doctorSpecialty: "Medicină de familie",
    source: "OMS",
    relatedTopicSlug: "mental-wellbeing",
  },
];

export const HEALTH_MYTHS_EN: HealthMyth[] = [
  {
    id: "myth-flu-vaccine",
    category: "Vaccines",
    categorySlug: "vaccinuri",
    statement: "The flu vaccine gives you the flu.",
    isTrue: false,
    statusTag: "Not true",
    explanation:
      "The vaccine uses inactive viral fragments: it cannot cause flu, only train your immune system to fight it.",
    doctorName: "Dr. Elena Radu",
    doctorSpecialty: "Family medicine",
    source: "WHO",
    relatedTopicSlug: "preventive-screening",
  },
  {
    id: "myth-diabetes-sugar",
    category: "Diabetes and sugar",
    categorySlug: "diabet",
    statement: "You only get diabetes if you eat too much sugar.",
    isTrue: false,
    statusTag: "Not true",
    explanation:
      "Type 2 diabetes stems from genetics, inactivity and insulin resistance, not sweets alone.",
    doctorName: "Dr. Mihai Stoica",
    doctorSpecialty: "Endocrinology and nutrition",
    source: "International Diabetes Federation",
    relatedTopicSlug: "diabetes",
  },
  {
    id: "myth-blood-pressure",
    category: "Heart and blood pressure",
    categorySlug: "inima",
    statement: "If you have high blood pressure, you always get headaches or feel dizzy.",
    isTrue: false,
    statusTag: "Not true",
    explanation:
      "High blood pressure rarely causes symptoms; regular cuff checks are the only reliable way to catch it.",
    doctorName: "Dr. Adrian Ionescu",
    doctorSpecialty: "Cardiology",
    source: "European Society of Cardiology",
    relatedTopicSlug: "heart-health",
  },
  {
    id: "myth-antibiotics-cold",
    category: "Antibiotics",
    categorySlug: "antibiotice",
    statement: "Antibiotics help you get over a cold or flu faster.",
    isTrue: false,
    statusTag: "Not true",
    explanation:
      "Colds and flu come from viruses, while antibiotics only treat bacterial infections.",
    doctorName: "Dr. Maria Popa",
    doctorSpecialty: "Infectious diseases",
    source: "WHO",
    relatedTopicSlug: "preventive-screening",
  },
  {
    id: "myth-womens-mammography",
    category: "Women's health",
    categorySlug: "femei",
    statement: "If you can't feel a lump in your breast, you don't need a check-up.",
    isTrue: false,
    statusTag: "Not true",
    explanation:
      "Ultrasound and mammograms detect tiny changes long before a lump can be felt by hand.",
    doctorName: "Dr. Camelia Dobre",
    doctorSpecialty: "Obstetrics and gynecology",
    source: "European screening guidelines",
    relatedTopicSlug: "womens-health",
  },
  {
    id: "myth-smoking-filters",
    category: "Heart and blood pressure",
    categorySlug: "inima",
    statement: "Filter cigarettes or heated tobacco don't harm your heart.",
    isTrue: false,
    statusTag: "Not true",
    explanation:
      "Nicotine narrows blood vessels and raises heart rate regardless of how tobacco is smoked or heated.",
    doctorName: "Dr. Adrian Ionescu",
    doctorSpecialty: "Cardiology",
    source: "WHO",
    relatedTopicSlug: "smoking",
  },
  {
    id: "myth-healthy-eating-salt",
    category: "Food and salt",
    categorySlug: "alimentatie",
    statement: "Pink Himalayan salt or sea salt is healthy, so you can eat as much as you like.",
    isTrue: false,
    statusTag: "Not true",
    explanation:
      "Every table salt is roughly 98% sodium chloride and raises blood pressure the same; keep total intake under 5 g a day.",
    doctorName: "Dr. Mihai Stoica",
    doctorSpecialty: "Endocrinology and nutrition",
    source: "WHO",
    relatedTopicSlug: "healthy-eating",
  },
  {
    id: "myth-physical-activity-gym",
    category: "Exercise",
    categorySlug: "miscare",
    statement: "Exercise only helps your health if you go to the gym or work out intensely.",
    isTrue: false,
    statusTag: "Not true",
    explanation:
      "Brisk walking, stairs and garden work lower blood pressure and blood sugar without a gym.",
    doctorName: "Dr. Adrian Ionescu",
    doctorSpecialty: "Cardiology",
    source: "WHO",
    relatedTopicSlug: "physical-activity",
  },
  {
    id: "myth-mental-weakness",
    category: "Mental wellbeing",
    categorySlug: "echilibru",
    statement: "If you have anxiety or feel sad for a long time, it means you are weak.",
    isTrue: false,
    statusTag: "Not true",
    explanation:
      "Anxiety and depression are real, treatable health conditions, never a flaw in character.",
    doctorName: "Dr. Elena Radu",
    doctorSpecialty: "Family medicine",
    source: "WHO",
    relatedTopicSlug: "mental-wellbeing",
  },
];

export const MYTH_CATEGORIES_EN: MythCategory[] = [
  { slug: "toate", label: "All myths" },
  { slug: "vaccinuri", label: "Vaccines" },
  { slug: "diabet", label: "Diabetes and sugar" },
  { slug: "inima", label: "Heart and blood pressure" },
  { slug: "antibiotice", label: "Antibiotics" },
  { slug: "femei", label: "Women's health" },
  { slug: "alimentatie", label: "Food and salt" },
  { slug: "miscare", label: "Exercise" },
  { slug: "echilibru", label: "Mental wellbeing" },
];

export const MYTH_CATEGORIES_SQ: MythCategory[] = [
  { slug: "toate", label: "Të gjitha mitet" },
  { slug: "vaccinuri", label: "Vaksinat" },
  { slug: "diabet", label: "Diabeti dhe ëmbëlsirat" },
  { slug: "inima", label: "Zemra dhe presioni" },
  { slug: "antibiotice", label: "Antibiotikët" },
  { slug: "femei", label: "Shëndeti i gruas" },
  { slug: "alimentatie", label: "Ushqimi dhe kripa" },
  { slug: "miscare", label: "Lëvizja" },
  { slug: "echilibru", label: "Shëndeti mendor" },
];

export const HEALTH_MYTHS_SQ: HealthMyth[] = [
  {
    id: "myth-flu-vaccine",
    category: "Vaksinat",
    categorySlug: "vaccinuri",
    statement: "Vaksina e gripit të jep grip.",
    isTrue: false,
    statusTag: "Nuk është e vërtetë",
    explanation:
      "Vaksina përmban vetëm pjesë joaktive të virusit: nuk shkakton grip, por e mëson trupin të mbrohet.",
    doctorName: "Dr. Elena Radu",
    doctorSpecialty: "Mjekësi familjare",
    source: "OBSH",
    relatedTopicSlug: "preventive-screening",
  },
  {
    id: "myth-diabetes-sugar",
    category: "Diabeti dhe ëmbëlsirat",
    categorySlug: "diabet",
    statement: "Diabeti të vjen vetëm nëse ha shumë sheqer.",
    isTrue: false,
    statusTag: "Nuk është e vërtetë",
    explanation:
      "Diabeti i tipit 2 lidhet me trashëgiminë, mungesën e lëvizjes dhe rezistencën ndaj insulinës, jo vetëm me ëmbëlsirat.",
    doctorName: "Dr. Mihai Stoica",
    doctorSpecialty: "Endokrinologji dhe diabet",
    source: "Federata Ndërkombëtare e Diabetit",
    relatedTopicSlug: "diabetes",
  },
  {
    id: "myth-blood-pressure",
    category: "Zemra dhe presioni",
    categorySlug: "inima",
    statement: "Nëse ke presion të lartë, gjithmonë të dhemb koka ose të merren mendtë.",
    isTrue: false,
    statusTag: "Nuk është e vërtetë",
    explanation:
      "Presioni i lartë rrallë jep shenja; e vetmja mënyrë e sigurt për ta zbuluar është matja e rregullt.",
    doctorName: "Dr. Adrian Ionescu",
    doctorSpecialty: "Kardiologji",
    source: "Shoqata Evropiane e Kardiologjisë",
    relatedTopicSlug: "heart-health",
  },
  {
    id: "myth-antibiotics-cold",
    category: "Antibiotikët",
    categorySlug: "antibiotice",
    statement: "Antibiotikët të shërojnë më shpejt nga ftohja dhe gripi.",
    isTrue: false,
    statusTag: "Nuk është e vërtetë",
    explanation:
      "Ftohjen dhe gripin i shkaktojnë viruset, ndërsa antibiotikët veprojnë vetëm kundër baktereve.",
    doctorName: "Dr. Maria Popa",
    doctorSpecialty: "Sëmundje infektive",
    source: "OBSH",
    relatedTopicSlug: "preventive-screening",
  },
  {
    id: "myth-womens-mammography",
    category: "Shëndeti i gruas",
    categorySlug: "femei",
    statement: "Nëse nuk ndjen asnjë gungë në gji, nuk ke nevojë për kontroll.",
    isTrue: false,
    statusTag: "Nuk është e vërtetë",
    explanation:
      "Ekografia dhe mamografia zbulojnë ndryshime shumë të vogla kohë para se të ndihen me dorë.",
    doctorName: "Dr. Camelia Dobre",
    doctorSpecialty: "Obstetrikë-gjinekologji",
    source: "Udhëzimet evropiane për depistimin",
    relatedTopicSlug: "womens-health",
  },
  {
    id: "myth-smoking-filters",
    category: "Zemra dhe presioni",
    categorySlug: "inima",
    statement: "Cigaret me filtër ose duhani i ngrohur nuk e dëmtojnë zemrën.",
    isTrue: false,
    statusTag: "Nuk është e vërtetë",
    explanation:
      "Nikotina ngushton enët e gjakut dhe shpejton pulsin pavarësisht mënyrës si pihet duhani.",
    doctorName: "Dr. Adrian Ionescu",
    doctorSpecialty: "Kardiologji",
    source: "OBSH",
    relatedTopicSlug: "smoking",
  },
  {
    id: "myth-healthy-eating-salt",
    category: "Ushqimi dhe kripa",
    categorySlug: "alimentatie",
    statement: "Kripa rozë e Himalajës ose kripa e detit është e shëndetshme, ndaj mund të hash sa të duash.",
    isTrue: false,
    statusTag: "Nuk është e vërtetë",
    explanation:
      "Çdo kripë përmban rreth 98% klorur natriumi dhe e rrit presionin njësoj; mbaje nën 5 g në ditë.",
    doctorName: "Dr. Mihai Stoica",
    doctorSpecialty: "Endokrinologji dhe diabet",
    source: "OBSH",
    relatedTopicSlug: "healthy-eating",
  },
  {
    id: "myth-physical-activity-gym",
    category: "Lëvizja",
    categorySlug: "miscare",
    statement: "Lëvizja vlen vetëm nëse shkon në palestër ose lodhesh deri në rraskapitje.",
    isTrue: false,
    statusTag: "Nuk është e vërtetë",
    explanation:
      "Ecja e shpejtë, ngjitja e shkallëve dhe puna në kopsht ulin presionin dhe sheqerin në gjak pa palestër.",
    doctorName: "Dr. Adrian Ionescu",
    doctorSpecialty: "Kardiologji",
    source: "OBSH",
    relatedTopicSlug: "physical-activity",
  },
  {
    id: "myth-mental-weakness",
    category: "Shëndeti mendor",
    categorySlug: "echilibru",
    statement: "Nëse ke ankth ose je i trishtuar për një kohë të gjatë, do të thotë që je i dobët.",
    isTrue: false,
    statusTag: "Nuk është e vërtetë",
    explanation:
      "Ankthi dhe depresioni janë gjendje mjekësore që trajtohen, jo dobësi karakteri.",
    doctorName: "Dr. Elena Radu",
    doctorSpecialty: "Mjekësi familjare",
    source: "OBSH",
    relatedTopicSlug: "mental-wellbeing",
  },
];

export const MYTH_CATEGORIES_IT: MythCategory[] = [
  { slug: "toate", label: "Tutti i miti" },
  { slug: "vaccinuri", label: "Vaccini" },
  { slug: "diabet", label: "Diabete e dolci" },
  { slug: "inima", label: "Cuore e pressione" },
  { slug: "antibiotice", label: "Antibiotici" },
  { slug: "femei", label: "Salute della donna" },
  { slug: "alimentatie", label: "Cibo e sale" },
  { slug: "miscare", label: "Movimento" },
  { slug: "echilibru", label: "Benessere mentale" },
];

export const HEALTH_MYTHS_IT: HealthMyth[] = [
  {
    id: "myth-flu-vaccine",
    category: "Vaccini",
    categorySlug: "vaccinuri",
    statement: "Il vaccino antinfluenzale ti fa venire l'influenza.",
    isTrue: false,
    statusTag: "Non è vero",
    explanation:
      "Il vaccino contiene solo frammenti inattivi del virus: non può causare l'influenza, ma allena le difese del corpo.",
    doctorName: "Dr. Elena Radu",
    doctorSpecialty: "Medicina generale",
    source: "OMS",
    relatedTopicSlug: "preventive-screening",
  },
  {
    id: "myth-diabetes-sugar",
    category: "Diabete e dolci",
    categorySlug: "diabet",
    statement: "Il diabete viene solo se mangi troppo zucchero.",
    isTrue: false,
    statusTag: "Non è vero",
    explanation:
      "Il diabete di tipo 2 dipende da genetica, sedentarietà e insulino-resistenza, non solo dai dolci.",
    doctorName: "Dr. Mihai Stoica",
    doctorSpecialty: "Endocrinologia e nutrizione",
    source: "Federazione Internazionale del Diabete",
    relatedTopicSlug: "diabetes",
  },
  {
    id: "myth-blood-pressure",
    category: "Cuore e pressione",
    categorySlug: "inima",
    statement: "Se hai la pressione alta, hai sempre mal di testa o giramenti di testa.",
    isTrue: false,
    statusTag: "Non è vero",
    explanation:
      "La pressione alta quasi mai dà sintomi; l'unico modo sicuro per scoprirla è misurarla con regolarità.",
    doctorName: "Dr. Adrian Ionescu",
    doctorSpecialty: "Cardiologia",
    source: "Società Europea di Cardiologia",
    relatedTopicSlug: "heart-health",
  },
  {
    id: "myth-antibiotics-cold",
    category: "Antibiotici",
    categorySlug: "antibiotice",
    statement: "Gli antibiotici fanno passare prima raffreddore e influenza.",
    isTrue: false,
    statusTag: "Non è vero",
    explanation:
      "Raffreddore e influenza sono causati da virus, mentre gli antibiotici agiscono solo contro i batteri.",
    doctorName: "Dr. Maria Popa",
    doctorSpecialty: "Malattie infettive",
    source: "OMS",
    relatedTopicSlug: "preventive-screening",
  },
  {
    id: "myth-womens-mammography",
    category: "Salute della donna",
    categorySlug: "femei",
    statement: "Se non senti noduli al seno, non hai bisogno di controlli.",
    isTrue: false,
    statusTag: "Non è vero",
    explanation:
      "Ecografia e mammografia individuano alterazioni millimetriche molto prima che siano percepibili al tatto.",
    doctorName: "Dr. Camelia Dobre",
    doctorSpecialty: "Ostetricia e ginecologia",
    source: "Linee guida europee per lo screening",
    relatedTopicSlug: "womens-health",
  },
  {
    id: "myth-smoking-filters",
    category: "Cuore e pressione",
    categorySlug: "inima",
    statement: "Le sigarette con filtro o il tabacco riscaldato non fanno male al cuore.",
    isTrue: false,
    statusTag: "Non è vero",
    explanation:
      "La nicotina restringe i vasi sanguigni e accelera il battito cardiaco in qualsiasi forma si fumi.",
    doctorName: "Dr. Adrian Ionescu",
    doctorSpecialty: "Cardiologia",
    source: "OMS",
    relatedTopicSlug: "smoking",
  },
  {
    id: "myth-healthy-eating-salt",
    category: "Cibo e sale",
    categorySlug: "alimentatie",
    statement: "Il sale rosa dell'Himalaya o il sale marino fanno bene, quindi puoi usarne quanto vuoi.",
    isTrue: false,
    statusTag: "Non è vero",
    explanation:
      "Ogni sale da cucina contiene circa il 98% di cloruro di sodio e alza la pressione allo stesso modo; resta sotto i 5 g al giorno.",
    doctorName: "Dr. Mihai Stoica",
    doctorSpecialty: "Endocrinologia e nutrizione",
    source: "OMS",
    relatedTopicSlug: "healthy-eating",
  },
  {
    id: "myth-physical-activity-gym",
    category: "Movimento",
    categorySlug: "miscare",
    statement: "Il movimento conta solo se vai in palestra o ti sforzi fino a non poterne più.",
    isTrue: false,
    statusTag: "Non è vero",
    explanation:
      "Camminare a passo svelto, salire le scale e curare l'orto riducono pressione e glicemia senza palestra.",
    doctorName: "Dr. Adrian Ionescu",
    doctorSpecialty: "Cardiologia",
    source: "OMS",
    relatedTopicSlug: "physical-activity",
  },
  {
    id: "myth-mental-weakness",
    category: "Benessere mentale",
    categorySlug: "echilibru",
    statement: "Se hai ansia o sei triste da tanto tempo, vuol dire che sei debole.",
    isTrue: false,
    statusTag: "Non è vero",
    explanation:
      "Ansia e depressione sono condizioni mediche curabili, mai una debolezza di carattere.",
    doctorName: "Dr. Elena Radu",
    doctorSpecialty: "Medicina generale",
    source: "OMS",
    relatedTopicSlug: "mental-wellbeing",
  },
];

export const MYTH_CATEGORIES_HR: MythCategory[] = [
  { slug: "toate", label: "Svi mitovi" },
  { slug: "vaccinuri", label: "Cjepiva" },
  { slug: "diabet", label: "Dijabetes i slatkiši" },
  { slug: "inima", label: "Srce i tlak" },
  { slug: "antibiotice", label: "Antibiotici" },
  { slug: "femei", label: "Zdravlje žena" },
  { slug: "alimentatie", label: "Hrana i sol" },
  { slug: "miscare", label: "Kretanje" },
  { slug: "echilibru", label: "Mentalno zdravlje" },
];

export const HEALTH_MYTHS_HR: HealthMyth[] = [
  {
    id: "myth-flu-vaccine",
    category: "Cjepiva",
    categorySlug: "vaccinuri",
    statement: "Cjepivo protiv gripe izaziva gripu.",
    isTrue: false,
    statusTag: "Nije točno",
    explanation:
      "Cjepivo sadrži neaktivni virus koji ne može izazvati bolest; samo uči tijelo kako se obraniti.",
    doctorName: "Dr. Elena Radu",
    doctorSpecialty: "Obiteljska medicina",
    source: "SZO i HZJZ",
    relatedTopicSlug: "preventive-screening",
  },
  {
    id: "myth-diabetes-sugar",
    category: "Dijabetes i slatkiši",
    categorySlug: "diabet",
    statement: "Dijabetes nastaje samo ako jedeš previše šećera.",
    isTrue: false,
    statusTag: "Nije točno",
    explanation:
      "Dijabetes tipa 2 ovisi o nasljeđu, kretanju i načinu na koji tijelo koristi inzulin, ne samo o slatkišima.",
    doctorName: "Dr. Mihai Stoica",
    doctorSpecialty: "Endokrinologija i dijabetologija",
    source: "Međunarodna dijabetička federacija",
    relatedTopicSlug: "diabetes",
  },
  {
    id: "myth-blood-pressure",
    category: "Srce i tlak",
    categorySlug: "inima",
    statement: "Ako imaš visoki tlak, uvijek te boli glava ili ti se vrti.",
    isTrue: false,
    statusTag: "Nije točno",
    explanation:
      "Visoki krvni tlak najčešće ne daje nikakve znakove; jedini siguran način provjere jest redovito mjerenje.",
    doctorName: "Dr. Adrian Ionescu",
    doctorSpecialty: "Kardiologija",
    source: "Europsko kardiološko društvo",
    relatedTopicSlug: "heart-health",
  },
  {
    id: "myth-antibiotics-cold",
    category: "Antibiotici",
    categorySlug: "antibiotice",
    statement: "Antibiotici brže liječe prehladu i gripu.",
    isTrue: false,
    statusTag: "Nije točno",
    explanation:
      "Prehladu i gripu uzrokuju virusi, a antibiotici djeluju isključivo protiv bakterija.",
    doctorName: "Dr. Maria Popa",
    doctorSpecialty: "Infektologija",
    source: "SZO",
    relatedTopicSlug: "preventive-screening",
  },
  {
    id: "myth-womens-mammography",
    category: "Zdravlje žena",
    categorySlug: "femei",
    statement: "Ako ne napipaš kvržicu na dojci, ne treba ti pregled.",
    isTrue: false,
    statusTag: "Nije točno",
    explanation:
      "Mamografija i ultrazvuk otkrivaju sitne promjene mnogo prije nego što se mogu napipati.",
    doctorName: "Dr. Camelia Dobre",
    doctorSpecialty: "Ginekologija i porodništvo",
    source: "Europske smjernice za probir",
    relatedTopicSlug: "womens-health",
  },
  {
    id: "myth-smoking-filters",
    category: "Srce i tlak",
    categorySlug: "inima",
    statement: "Cigarete s filtrom ili grijani duhan ne štete srcu.",
    isTrue: false,
    statusTag: "Nije točno",
    explanation:
      "Nikotin sužava krvne žile i ubrzavaju puls bez obzira na vrstu duhana.",
    doctorName: "Dr. Adrian Ionescu",
    doctorSpecialty: "Kardiologija",
    source: "SZO",
    relatedTopicSlug: "smoking",
  },
  {
    id: "myth-healthy-eating-salt",
    category: "Hrana i sol",
    categorySlug: "alimentatie",
    statement: "Ružičasta himalajska sol ili morska sol zdrave su pa ih možeš jesti koliko želiš.",
    isTrue: false,
    statusTag: "Nije točno",
    explanation:
      "Svaka kuhinjska sol sadrži oko 98% natrija i jednako povisuje tlak; ograniči je na manje od 5 g dnevno.",
    doctorName: "Dr. Mihai Stoica",
    doctorSpecialty: "Endokrinologija i dijabetologija",
    source: "SZO",
    relatedTopicSlug: "healthy-eating",
  },
  {
    id: "myth-physical-activity-gym",
    category: "Kretanje",
    categorySlug: "miscare",
    statement: "Kretanje koristi zdravlju samo ako ideš u teretanu ili jako naporno vježbaš.",
    isTrue: false,
    statusTag: "Nije točno",
    explanation:
      "Brzo hodanje, rad u vrtu ili penjanje uz stepenice štite srce te snižavaju tlak i šećer.",
    doctorName: "Dr. Adrian Ionescu",
    doctorSpecialty: "Kardiologija",
    source: "SZO",
    relatedTopicSlug: "physical-activity",
  },
  {
    id: "myth-mental-weakness",
    category: "Mentalno zdravlje",
    categorySlug: "echilibru",
    statement: "Ako osjećaš tjeskobu ili si dugo tužan, to znači da si slab.",
    isTrue: false,
    statusTag: "Nije točno",
    explanation:
      "Anksioznost i depresija izlječiva su zdravstvena stanja, nikada slabost karaktera.",
    doctorName: "Dr. Elena Radu",
    doctorSpecialty: "Obiteljska medicina",
    source: "SZO",
    relatedTopicSlug: "mental-wellbeing",
  },
];

export const MYTH_CATEGORIES_ROM: MythCategory[] = [
  { slug: "toate", label: "Savore xoxavne pakjamata" },
  { slug: "vaccinuri", label: "Vakcine" },
  { slug: "diabet", label: "Dijabeto thaj gudlipen" },
  { slug: "inima", label: "O ilo thaj i tensija" },
  { slug: "antibiotice", label: "Antibiotikura" },
  { slug: "femei", label: "Sastipen e dzhuvljako" },
  { slug: "alimentatie", label: "Xaben thaj lon" },
  { slug: "miscare", label: "Phirimos" },
  { slug: "echilibru", label: "Sastipen e godjako" },
];

export const HEALTH_MYTHS_ROM: HealthMyth[] = [
  {
    id: "myth-flu-vaccine",
    category: "Vakcine",
    categorySlug: "vaccinuri",
    statement: "I vakcina mamuj gripa del tut gripa.",
    isTrue: false,
    statusTag: "Naj čače",
    explanation:
      "I vakcina inkerel mulo viruso savo nashti kerel nasvalipen; samo sikavel tiro trupo te arakhel pes.",
    doctorName: "Dr. Elena Radu",
    doctorSpecialty: "Familijaki medicina",
    source: "WHO",
    relatedTopicSlug: "preventive-screening",
  },
  {
    id: "myth-diabetes-sugar",
    category: "Dijabeto thaj gudlipen",
    categorySlug: "diabet",
    statement: "O dijabeto avel samo te xas but zahari.",
    isTrue: false,
    statusTag: "Naj čače",
    explanation:
      "O dijabeto tip 2 avel katar i familija, xanci phirimos thaj sar o trupo labyarel o inzulino, na samo katar o gudlipen.",
    doctorName: "Dr. Mihai Stoica",
    doctorSpecialty: "Endokrinologija thaj xaben",
    source: "Mashkarthemutni dijabeteski federacija",
    relatedTopicSlug: "diabetes",
  },
  {
    id: "myth-blood-pressure",
    category: "O ilo thaj i tensija",
    categorySlug: "inima",
    statement: "Kana o rat phurdel zurales (uchi tensija), sajekh dukhal tiro shero vaj phirel tiro shero.",
    isTrue: false,
    statusTag: "Naj čače",
    explanation:
      "Maj butivar i uchi tensija na del nijekh semno; o jekh sigurno drom te dzhanes si te merisares la redovno.",
    doctorName: "Dr. Adrian Ionescu",
    doctorSpecialty: "Kardiologija",
    source: "Evropako kardiologikano amalipen",
    relatedTopicSlug: "heart-health",
  },
  {
    id: "myth-antibiotics-cold",
    category: "Antibiotikura",
    categorySlug: "antibiotice",
    statement: "E antibiotikura sastjaren maj sigo o shil thaj i gripa.",
    isTrue: false,
    statusTag: "Naj čače",
    explanation:
      "O shil thaj i gripa aven katar e virusura, a e antibiotikura keren buchi samo mamuj e bakterije.",
    doctorName: "Dr. Maria Popa",
    doctorSpecialty: "Infektivne nasvalipena",
    source: "WHO",
    relatedTopicSlug: "preventive-screening",
  },
  {
    id: "myth-womens-mammography",
    category: "Sastipen e dzhuvljako",
    categorySlug: "femei",
    statement: "Te na hatjares guka ki chuchi, na trubul tuke dikhiben.",
    isTrue: false,
    statusTag: "Naj čače",
    explanation:
      "I mamografija thaj o ultrazvuko arakhen cikne paruvimata but vrjama anglal te hatjares len e vastesa.",
    doctorName: "Dr. Camelia Dobre",
    doctorSpecialty: "Ginekologija",
    source: "Evropake sikavimata vash dikhiben",
    relatedTopicSlug: "womens-health",
  },
  {
    id: "myth-smoking-filters",
    category: "O ilo thaj i tensija",
    categorySlug: "inima",
    statement: "E cigare filtrosa vaj o tatjardo duhani na dukhaven o ilo.",
    isTrue: false,
    statusTag: "Naj čače",
    explanation:
      "O nikotino tangjarel e rateske droma thaj sigjarel o pulso, sar godi te thuvjares.",
    doctorName: "Dr. Adrian Ionescu",
    doctorSpecialty: "Kardiologija",
    source: "WHO",
    relatedTopicSlug: "smoking",
  },
  {
    id: "myth-healthy-eating-salt",
    category: "Xaben thaj lon",
    categorySlug: "alimentatie",
    statement: "O rozavo lon vaj o lon katar o baro pani si sasto, kadja shaj te xas kozom manges.",
    isTrue: false,
    statusTag: "Naj čače",
    explanation:
      "Sako lon si les pashe 98% natrijum thaj vazdel i tensija jekhfjal; inker les tela 5 g ko dives.",
    doctorName: "Dr. Mihai Stoica",
    doctorSpecialty: "Endokrinologija thaj xaben",
    source: "WHO",
    relatedTopicSlug: "healthy-eating",
  },
  {
    id: "myth-physical-activity-gym",
    category: "Phirimos",
    categorySlug: "miscare",
    statement: "O phirimos azhutil o sastipen samo te dzhas ki sala vaj te khinjos zurales.",
    isTrue: false,
    statusTag: "Naj čače",
    explanation:
      "Sigo phirimos, buchi andi barcha vaj inkljimos pe skale arakhen o ilo thaj tiknjaren i tensija thaj o zahari.",
    doctorName: "Dr. Adrian Ionescu",
    doctorSpecialty: "Kardiologija",
    source: "WHO",
    relatedTopicSlug: "physical-activity",
  },
  {
    id: "myth-mental-weakness",
    category: "Sastipen e godjako",
    categorySlug: "echilibru",
    statement: "Te si tut dar vaj san brigime lungi vrjama, znachil kaj san slabo.",
    isTrue: false,
    statusTag: "Naj čače",
    explanation:
      "I anksioznost thaj i depresija si nasvalipena save sastjon, nikana slabipen e karakteresko.",
    doctorName: "Dr. Elena Radu",
    doctorSpecialty: "Familijaki medicina",
    source: "WHO",
    relatedTopicSlug: "mental-wellbeing",
  },
];

export function getHealthMyths(lang: Lang): HealthMyth[] {
  if (lang === "ru") return HEALTH_MYTHS_RU;
  if (lang === "en") return HEALTH_MYTHS_EN;
  if (lang === "sq") return HEALTH_MYTHS_SQ;
  if (lang === "it") return HEALTH_MYTHS_IT;
  if (lang === "hr") return HEALTH_MYTHS_HR;
  if (lang === "rom") return HEALTH_MYTHS_ROM;
  return HEALTH_MYTHS_RO;
}

export function getMythCategories(lang: Lang): MythCategory[] {
  if (lang === "ru") return MYTH_CATEGORIES_RU;
  if (lang === "en") return MYTH_CATEGORIES_EN;
  if (lang === "sq") return MYTH_CATEGORIES_SQ;
  if (lang === "it") return MYTH_CATEGORIES_IT;
  if (lang === "hr") return MYTH_CATEGORIES_HR;
  if (lang === "rom") return MYTH_CATEGORIES_ROM;
  return MYTH_CATEGORIES_RO;
}

export const SPEECH_LANG_BY_LOCALE: Record<Lang, string> = {
  ru: "ru-RU",

  ro: "ro-RO",
  en: "en-GB",
  sq: "sq-AL",
  it: "it-IT",
  hr: "hr-HR",
  rom: "ro-RO",
};

export const HEALTH_DETAIL_SHARED_STRINGS = {
  whyItMatters: {
    heading: {
  ru: "Почему это важно",

      ro: "De ce contează",
      en: "Why it matters",
      sq: "Pse ka rëndësi",
      it: "Perché è importante",
      hr: "Zašto je važno",
      rom: "Sostar si vazhno",
    },
    subtitleTemplate: {
  ru: "3 факта по теме «{topic}».",

      ro: "3 lucruri bune de știut despre {topic}.",
      en: "3 things to know about {topic}.",
      sq: "3 gjëra që duhet t'i dish për këtë temë.",
      it: "3 cose da sapere su questo tema.",
      hr: "3 važne stvari o ovoj temi.",
      rom: "3 lačhe bukja te dzhanes vash akaja tema.",
    },
    listenAllLabel: {
  ru: "Прослушайте все 3 пункта.",

      ro: "Ascultă toate cele 3 puncte",
      en: "Listen to all 3 points",
      sq: "Dëgjo të 3 pikat",
      it: "Ascolta tutti e 3 i punti",
      hr: "Poslušaj sve 3 točke",
      rom: "Ashun savore 3 kotora",
    },
    listenPillarLabel: {
  ru: "Прослушайте пункт {number}",

      ro: "Ascultă punctul {number}",
      en: "Listen to point {number}",
      sq: "Dëgjo pikën {number}",
      it: "Ascolta il punto {number}",
      hr: "Poslušaj točku {number}",
      rom: "Ashun o kotor {number}",
    },
    pillar1Title: {
  ru: "Что происходит в организме",

      ro: "Ce se întâmplă în corp",
      en: "What happens in the body",
      sq: "Çfarë ndodh në trup",
      it: "Cosa succede nel corpo",
      hr: "Što se događa u tijelu",
      rom: "So kerel pes ando trupo",
    },
    pillar1Desc: {
  ru: "Все части вашего тела работают вместе. Когда вы заботитесь о своих кровеносных сосудах и органах, все ваше тело работает легче.",

      ro: "Toate părțile corpului lucrează împreună. Când ai grijă de vasele de sânge și de organe, tot corpul merge mai ușor.",
      en: "All parts of your body work together. When you look after your blood vessels and organs, your whole body works more easily.",
      sq: "Të gjitha pjesët e trupit punojnë bashkë. Kur kujdesesh për enët e gjakut dhe organet, i gjithë trupi punon më lehtë.",
      it: "Tutte le parti del corpo lavorano insieme. Se ti prendi cura dei vasi sanguigni e degli organi, tutto il corpo lavora meglio.",
      hr: "Svi dijelovi tvog tijela rade zajedno. Kada paziš na krvne žile i organe, cijelo tijelo radi lakše.",
      rom: "Savore kotora tire truposke keren buchi khetane. Kana arakhes e rateske droma thaj e organura, sasto trupo phirel maj lokhes.",
    },
    pillar2Title: {
  ru: "Как это влияет на вашу повседневную жизнь",

      ro: "Cum te afectează zi de zi",
      en: "How it affects your daily life",
      sq: "Si të ndikon çdo ditë",
      it: "Come cambia la tua vita di ogni giorno",
      hr: "Kako utječe na tvoj svaki dan",
      rom: "Sar dikhel pe tiro sako dives",
    },
    pillar2Desc: {
  ru: "Многие проблемы со здоровьем поначалу не беспокоят. Если вы обнаружите их рано, вы сохраните силы для работы и семьи.",

      ro: "Multe probleme de sănătate nu dor la început. Dacă le afli din timp, îți păstrezi puterea pentru muncă și familie.",
      en: "Many health problems do not hurt at first. If you find them early, you keep your strength for work and family.",
      sq: "Shumë probleme shëndetësore nuk dhembin në fillim. Po t'i zbulosh herët, e ruan forcën për punën dhe familjen.",
      it: "Molti problemi di salute all'inizio non fanno male. Se li scopri presto, conservi le forze per il lavoro e la famiglia.",
      hr: "Mnogi zdravstveni problemi u početku ne bole. Ako ih otkriješ na vrijeme, čuvaš snagu za posao i obitelj.",
      rom: "But sastipnaske problemura anglal na dukhan. Te arakhes len rano, inkeres tiri zor vash i buchi thaj i familija.",
    },
    pillar3Title: {
  ru: "Что вы можете легко изменить",

      ro: "Ce poți schimba ușor",
      en: "What you can change easily",
      sq: "Çfarë mund të ndryshosh lehtë",
      it: "Cosa puoi cambiare facilmente",
      hr: "Što možeš lako promijeniti",
      rom: "So shaj lokhes te paruves",
    },
    pillar3Desc: {
  ru: "Маленькие привычки, выполняемые каждый день, со временем очень помогают. Например, немного движения и меньше соленой еды.",

      ro: "Obiceiurile mici, făcute în fiecare zi, ajută mult în timp. De exemplu, puțină mișcare și mâncare mai puțin sărată.",
      en: "Small habits, done every day, help a lot over time. For example, a little movement and less salty food.",
      sq: "Zakonet e vogla, të bëra çdo ditë, ndihmojnë shumë me kohë. Për shembull, pak lëvizje dhe ushqim me më pak kripë.",
      it: "Piccole abitudini, ogni giorno, aiutano molto nel tempo. Per esempio, un po' di movimento e cibo meno salato.",
      hr: "Male navike, iz dana u dan, s vremenom mnogo pomažu. Primjerice, malo kretanja i manje slana hrana.",
      rom: "Cikne tabijetura, kerde sako dives, azhutin but vash vrjama. Sar primer, zalog phirimos thaj xaben maj xanci lonesa.",
    },
  },

  actionableSteps: {
    heading: {
  ru: "Что вы можете делать каждый день",

      ro: "Ce poți face în fiecare zi",
      en: "What you can do every day",
      sq: "Çfarë mund të bësh çdo ditë",
      it: "Cosa puoi fare ogni giorno",
      hr: "Što možeš činiti svaki dan",
      rom: "So shaj te keres sako dives",
    },
    subtitleTemplate: {
  ru: "Отметьте, что вы сделали сегодня для {topic}.",

      ro: "Bifează ce ai făcut azi pentru {topic}.",
      en: "Tick what you did today for {topic}.",
      sq: "Shëno çfarë bëre sot.",
      it: "Spunta quello che hai fatto oggi.",
      hr: "Označi što si danas učinio.",
      rom: "Semnisar so kerdjan adives.",
    },
    completedBadge: {
  ru: "{completed} из {total} выполнено",

      ro: "{completed} din {total} făcute",
      en: "{completed} of {total} done",
      sq: "{completed} nga {total} të bëra",
      it: "{completed} su {total} fatte",
      hr: "{completed} od {total} obavljeno",
      rom: "{completed} katar {total} kerde",
    },
    listenStepLabel: {
  ru: "Слушай: {title}",

      ro: "Ascultă: {title}",
      en: "Listen: {title}",
      sq: "Dëgjo: {title}",
      it: "Ascolta: {title}",
      hr: "Poslušaj: {title}",
      rom: "Ashun: {title}",
    },
  },

  warningSigns: {
    heading: {
  ru: "Признаки того, что вам нужна помощь прямо сейчас",

      ro: "Semne că ai nevoie de ajutor acum",
      en: "Signs you need help now",
      sq: "Kur të kërkosh ndihmë menjëherë",
      it: "Quando chiedere aiuto subito",
      hr: "Znakovi da ti pomoć treba odmah",
      rom: "Semnja kaj trubul tuke azhutimos akana",
    },
    subtitleWarning: {
  ru: "Позвоните 112 самостоятельно. Приложение не звонит вам.",

      ro: "Sună tu la 112. Aplicația nu sună în locul tău.",
      en: "Call 112 yourself. The app does not call for you.",
      sq: "Telefono vetë në 112. Aplikacioni nuk telefonon për ty.",
      it: "Chiama tu il 112. L'app non chiama al posto tuo.",
      hr: "Sam nazovi 112. Aplikacija ne zove umjesto tebe.",
      rom: "Akhar tu 112. I aplikacija na akharel namesto tute.",
    },
    prompt: {
  ru: "Если у вас или у кого-то из ваших близких есть какие-либо из этих признаков, связанных с {topic}, немедленно обратитесь за медицинской помощью:",

      ro: "Dacă tu sau cineva de lângă tine are unul dintre aceste semne legate de {topic}, cere imediat ajutor medical:",
      en: "If you or someone near you has any of these signs linked to {topic}, get medical help right away:",
      sq: "Nëse ti ose dikush pranë teje ka një nga këto shenja, kërko menjëherë ndihmë mjekësore:",
      it: "Se tu o qualcuno vicino a te ha uno di questi segni, chiedi subito aiuto medico:",
      hr: "Ako ti ili netko u tvojoj blizini ima neki od ovih znakova, odmah zatraži liječničku pomoć:",
      rom: "Te si tut vaj varekas pasha tute jekh katar akala semnja, mang sigo sastipnasko azhutimos:",
    },
    modalTrigger: {
  ru: "Когда звонить 112",

      ro: "Când suni la 112",
      en: "When to call 112",
      sq: "Kur të telefonosh në 112",
      it: "Quando chiamare il 112",
      hr: "Kada nazvati 112",
      rom: "Kana te akhares 112",
    },
    modalTitle: {
  ru: "Скорая медицинская помощь 112",

      ro: "Urgență medicală 112",
      en: "Medical emergency 112",
      sq: "Urgjencë mjekësore 112",
      it: "Emergenza medica 112",
      hr: "Hitni medicinski slučaj 112",
      rom: "Sastipnaski sigardiari 112",
    },
    modalSubtitle: {
  ru: "Звонок бесплатный, днем и ночью, из любой сети.",

      ro: "Apelul e gratuit, zi și noapte, din orice rețea.",
      en: "Free to call, day and night, from any network.",
      sq: "Telefonata është falas, ditë e natë, nga çdo rrjet.",
      it: "La chiamata è gratuita, giorno e notte, da qualsiasi rete.",
      hr: "Poziv je besplatan, danju i noću, iz svake mreže.",
      rom: "O akharimos si bi lovesko, dives thaj rat, katar sako mrezha.",
    },
    closeAria: {
  ru: "Закрыть окно",

      ro: "Închide fereastra",
      en: "Close window",
      sq: "Mbyll dritaren",
      it: "Chiudi la finestra",
      hr: "Zatvori prozor",
      rom: "Phand i pendzhara",
    },
    dispatchTitle: {
  ru: "Что говорить, когда звонишь 112",

      ro: "Ce spui când suni la 112",
      en: "What to say when you call 112",
      sq: "Çfarë të thuash kur telefonon në 112",
      it: "Cosa dire quando chiami il 112",
      hr: "Što reći kada nazoveš 112",
      rom: "So te phenes kana akhares 112",
    },
    dispatchStep1: {
  ru: "Где вы находитесь: точный адрес, деревня или город, или известное место поблизости.",

      ro: "Unde ești: adresa exactă, satul sau orașul, ori un loc cunoscut din apropiere.",
      en: "Where you are: the exact address, village or town, or a well-known place nearby.",
      sq: "Ku je: adresa e saktë, fshati ose qyteti, ose një vend i njohur aty pranë.",
      it: "Dove sei: indirizzo esatto, paese o città, o un posto conosciuto lì vicino.",
      hr: "Gdje se nalaziš: točna adresa, selo ili grad, ili poznato mjesto u blizini.",
      rom: "Kaj san: vorta adresa, o gav vaj o foro, vaj jekh pinzhardo than pashe.",
    },
    dispatchStep2: {
  ru: "Что произошло и какие симптомы у человека.",

      ro: "Ce s-a întâmplat și ce simptome are persoana.",
      en: "What happened and what symptoms the person has.",
      sq: "Çfarë ndodhi dhe çfarë shenjash ka personi.",
      it: "Cosa è successo e che sintomi ha la persona.",
      hr: "Što se dogodilo i koje simptome osoba ima.",
      rom: "So kerdilo thaj save semnja si e manushes.",
    },
    dispatchStep3: {
  ru: "В сознании ли человек и дышит ли он.",

      ro: "Dacă persoana e conștientă și respiră.",
      en: "Whether the person is conscious and breathing.",
      sq: "Nëse personi është në vete dhe merr frymë.",
      it: "Se la persona è cosciente e respira.",
      hr: "Je li osoba pri svijesti i diše li.",
      rom: "Si li o manush pe godjate thaj phurdinel li.",
    },
    dispatchStep4: {
  ru: "Отвечайте на вопросы спокойно и не кладите трубку первым.",

      ro: "Răspunde calm la întrebări și nu închide tu primul.",
      en: "Answer the questions calmly and don't hang up first.",
      sq: "Përgjigju qetë pyetjeve dhe mos e mbyll ti i pari telefonin.",
      it: "Rispondi con calma alle domande e non riattaccare per primo.",
      hr: "Mirno odgovaraj na pitanja i nemoj prvi poklopiti.",
      rom: "De atveto mirno ko phuchimata thaj ma phand tu angluno o telefono.",
    },
    closeBtn: {
  ru: "Закрыть",

      ro: "Închide",
      en: "Close",
      sq: "Mbyll",
      it: "Chiudi",
      hr: "Zatvori",
      rom: "Phand",
    },
    dialBtn: {
  ru: "Позвоните 112",

      ro: "Sună la 112",
      en: "Call 112",
      sq: "Telefono 112",
      it: "Chiama il 112",
      hr: "Nazovi 112",
      rom: "Akhar 112",
    },
  },

  topicMyth: {
    badge: {
  ru: "Правда или ложь?",

      ro: "Adevărat sau fals?",
      en: "True or false?",
      sq: "E vërtetë apo e gabuar?",
      it: "Vero o falso?",
      hr: "Točno ili netočno?",
      rom: "Čače vaj xoxaimos?",
    },
    audioPrompt: {
  ru: "{statement} Правда или ложь?",

      ro: "{statement} E adevărat sau fals?",
      en: "{statement} True or false?",
      sq: "{statement} E vërtetë apo e gabuar?",
      it: "{statement} Vero o falso?",
      hr: "{statement} Točno ili netočno?",
      rom: "{statement} Čače vaj xoxaimos?",
    },
    trueBtn: {
  ru: "Правда",

      ro: "Adevărat",
      en: "True",
      sq: "E vërtetë",
      it: "Vero",
      hr: "Točno",
      rom: "Čače",
    },
    falseBtn: {
  ru: "Ложь",

      ro: "Fals",
      en: "False",
      sq: "E gabuar",
      it: "Falso",
      hr: "Netočno",
      rom: "Xoxaimos",
    },
    correctBadge: {
  ru: "Это верно",

      ro: "Ai răspuns corect",
      en: "That's right",
      sq: "Përgjigje e saktë",
      it: "Risposta giusta",
      hr: "Točan odgovor",
      rom: "Čačo atveto",
    },
    sourcePrefix: {
  ru: "Источник:",

      ro: "Sursă:",
      en: "Source:",
      sq: "Burimi:",
      it: "Fonte:",
      hr: "Izvor:",
      rom: "Izvoro:",
    },
  },

  topicMetaBadge: {
    readMinutesLong: {
  ru: "{minutes} мин чтения",

      ro: "{minutes} minute de citit",
      en: "{minutes} min read",
      sq: "{minutes} minuta lexim",
      it: "{minutes} minuti di lettura",
      hr: "{minutes} minuta čitanja",
      rom: "{minutes} minute drabarimos",
    },
    readMinutesShort: {
  ru: "{minutes} мин чтения",

      ro: "{minutes} min de citit",
      en: "{minutes} min read",
      sq: "{minutes} min lexim",
      it: "{minutes} min di lettura",
      hr: "{minutes} min čitanja",
      rom: "{minutes} min drabarimos",
    },
    audioMinutes: {
  ru: "{minutes} мин аудио",

      ro: "{minutes} min audio",
      en: "{minutes} min audio",
      sq: "{minutes} min audio",
      it: "{minutes} min di audio",
      hr: "{minutes} min zvuka",
      rom: "{minutes} min audio",
    },
    audioMinutesLong: {
  ru: "{minutes} мин аудио",

      ro: "{minutes} minute audio",
      en: "{minutes} min audio",
      sq: "{minutes} minuta audio",
      it: "{minutes} minuti di audio",
      hr: "{minutes} minuta zvuka",
      rom: "{minutes} minute audio",
    },
  },

  topicHero: {
    backToGuides: {
  ru: "Вернуться к руководствам по здоровью",

      ro: "Înapoi la ghiduri",
      en: "Back to health guides",
      sq: "Kthehu te udhëzuesit",
      it: "Torna alle guide",
      hr: "Natrag na vodiče",
      rom: "Palpale ko sikavimata",
    },
    listenGuide: {
  ru: "Слушайте руководство",

      ro: "Ascultă ghidul",
      en: "Listen to guide",
      sq: "Dëgjo udhëzuesin",
      it: "Ascolta la guida",
      hr: "Poslušaj vodič",
      rom: "Ashun o sikavimos",
    },
    stopAudio: {
  ru: "Остановить звук",

      ro: "Oprește audio",
      en: "Stop audio",
      sq: "Ndalo audion",
      it: "Interrompi audio",
      hr: "Zaustavi zvuk",
      rom: "Ačhav o glaso",
    },
    ariaIntro: {
  ru: "Об этой теме",

      ro: "Despre acest subiect",
      en: "About this topic",
      sq: "Për këtë temë",
      it: "Su questo argomento",
      hr: "O ovoj temi",
      rom: "Vash akaja tema",
    },
    ariaNav: {
  ru: "Навигация",

      ro: "Navigare",
      en: "Navigation",
      sq: "Navigimi",
      it: "Navigazione",
      hr: "Navigacija",
      rom: "Navigacija",
    },
  },

  relatedTopics: {
    heading: {
  ru: "Больше руководств по здоровью",

      ro: "Alte ghiduri de sănătate",
      en: "More health guides",
      sq: "Udhëzues të tjerë për shëndetin",
      it: "Altre guide sulla salute",
      hr: "Ostali zdravstveni vodiči",
      rom: "Aver sastipnaske sikavimata",
    },
  },

  topicDetailPageContent: {
    romanesGlossaryTitle: {
  ru: "Медицинские слова на цыганском языке",

      ro: "Cuvinte medicale în romani",
      en: "Medical words in Romani",
      sq: "Fjalë mjekësore në gjuhën rome",
      it: "Parole mediche in romanì",
      hr: "Medicinske riječi na romskom",
      rom: "Sastipnaske alava pe romani čhib",
    },
    ariaSentenceSection: {
  ru: "Текст руководства, прочитайте вслух",

      ro: "Textul ghidului, citit cu voce",
      en: "Guide text, read aloud",
      sq: "Teksti i udhëzuesit, i lexuar me zë",
      it: "Testo della guida, letto ad alta voce",
      hr: "Tekst vodiča, čitan naglas",
      rom: "O teksto e sikavimasko, drabardo glasosa",
    },
    ariaMobileActions: {
  ru: "Быстрые действия",

      ro: "Acțiuni rapide",
      en: "Quick actions",
      sq: "Veprime të shpejta",
      it: "Azioni rapide",
      hr: "Brze radnje",
      rom: "Sige bukja",
    },
  },

  romanesGlossaryDrawer: {
    title: {
  ru: "Медицинские слова на цыганском языке",

      ro: "Cuvinte medicale în romani",
      en: "Medical words in Romani",
      sq: "Fjalë mjekësore në gjuhën rome",
      it: "Parole mediche in romanì",
      hr: "Medicinske riječi na romskom",
      rom: "Sastipnaske alava pe romani čhib",
    },
    subtitle: {
  ru: "Повседневные слова на цыганском и румынском языках",
      ro: "Termeni medicali explicați clar, în romani și în română",
      en: "Medical terms explained clearly, in Romani and English",
      sq: "Terma mjekësorë të shpjeguar qartë, në gjuhën rome dhe në shqip",
      it: "Termini medici spiegati chiaramente, in romanì e in italiano",
      hr: "Medicinski pojmovi jasno objašnjeni, na romskom i hrvatskom",
      rom: "Sastipnaske alava ashkarde chaches, pe romani čhib",
    },
    closeAria: {
  ru: "Закрыть список слов",

      ro: "Închide lista de cuvinte",
      en: "Close word list",
      sq: "Mbyll listën e fjalëve",
      it: "Chiudi l'elenco di parole",
      hr: "Zatvori popis riječi",
      rom: "Phand i lista e alavenge",
    },
    searchPlaceholder: {
  ru: "Поиск слова или симптома",

      ro: "Caută un cuvânt sau un simptom",
      en: "Search for a word or symptom",
      sq: "Kërko një fjalë ose një simptomë",
      it: "Cerca una parola o un sintomo",
      hr: "Pretraži riječ ili simptom",
      rom: "Rod jekh alav vaj simptomo",
    },
    pronounceAriaTemplate: {
  ru: "Послушайте, как сказать {term}",

      ro: "Ascultă cum se spune {term}",
      en: "Hear how to say {term}",
      sq: "Dëgjo si thuhet {term}",
      it: "Ascolta come si dice {term}",
      hr: "Poslušaj kako se kaže {term}",
      rom: "Ashun sar phenel pes {term}",
    },
    pronunciationLabel: {
  ru: "Произношение:",

      ro: "Pronunție:",
      en: "Pronunciation:",
      sq: "Shqiptimi:",
      it: "Pronuncia:",
      hr: "Izgovor:",
      rom: "Izgovoro:",
    },
    categoryAll: {
  ru: "Все",

      ro: "Toate",
      en: "All",
      sq: "Të gjitha",
      it: "Tutti",
      hr: "Sve",
      rom: "Savore",
    },
    categoryGeneral: {
      ro: "Sănătate generală",
      en: "General health",
      sq: "Shëndeti i përgjithshëm",
      it: "Salute generale",
      hr: "Opće zdravlje",
      rom: "Generalno sastipen",
    },
    categoryHeart: {
  ru: "Сердце",

      ro: "Inimă",
      en: "Heart",
      sq: "Zemra",
      it: "Cuore",
      hr: "Srce",
      rom: "O ilo",
    },
    categorySymptoms: {
  ru: "Симптомы",
      ro: "Simptome și urgențe",
      en: "Symptoms and emergencies",
      sq: "Simptomat dhe urgjencat",
      it: "Sintomi ed emergenze",
      hr: "Simptomi i hitna stanja",
      rom: "Simptomura thaj sigardiarja",
    },
    categoryBody: {
  ru: "Тело",

      ro: "Corp",
      en: "Body",
      sq: "Trupi",
      it: "Corpo",
      hr: "Tijelo",
      rom: "O trupo",
    },
    categoryTreatments: {
  ru: "Лечение",
      ro: "Prevenție și tratament",
      en: "Prevention and treatment",
      sq: "Parandalim dhe trajtim",
      it: "Prevenzione e trattamento",
      hr: "Prevencija i liječenje",
      rom: "Arakhimos thaj sastjarimos",
    },
    emptyState: {
  ru: "Слов не найдено. Попробуйте другой поиск.",

      ro: "Nu am găsit niciun cuvânt. Încearcă altă căutare.",
      en: "No words found. Try another search.",
      sq: "Nuk u gjet asnjë fjalë. Provo një kërkim tjetër.",
      it: "Nessuna parola trovata. Prova un'altra ricerca.",
      hr: "Nije pronađena nijedna riječ. Pokušaj drugu pretragu.",
      rom: "Na arakhljam nijekh alav. Probin aver rodimos.",
    },
  },

  globalAudioPlayer: {
    playerAria: {
  ru: "Аудиогид",

      ro: "Ghid audio",
      en: "Audio guide",
      sq: "Udhëzues audio",
      it: "Guida audio",
      hr: "Zvučni vodič",
      rom: "Audio sikavimos",
    },
    minimizedText: {
  ru: "Прослушивание ({progressPercent}%)",

      ro: "Ascultare pornită ({progressPercent}%)",
      en: "Listening ({progressPercent}%)",
      sq: "Po dëgjon ({progressPercent}%)",
      it: "In ascolto ({progressPercent}%)",
      hr: "Slušanje u tijeku ({progressPercent}%)",
      rom: "Ashunel pes ({progressPercent}%)",
    },
    durationSubtitle: {
  ru: "Прочитать вслух · примерно {durationMinutes} минут.",

      ro: "Citit cu voce · cam {durationMinutes} minute",
      en: "Read aloud · about {durationMinutes} minutes",
      sq: "Lexuar me zë · rreth {durationMinutes} minuta",
      it: "Letta ad alta voce · circa {durationMinutes} minuti",
      hr: "Čitano naglas · oko {durationMinutes} minuta",
      rom: "Drabardo glasosa · pashe {durationMinutes} minute",
    },
    fallbackVoice: {
  ru: "Резервный голос",

      ro: "Voce de rezervă",
      en: "Backup voice",
      sq: "Zë rezervë",
      it: "Voce di riserva",
      hr: "Zamjenski glas",
      rom: "Rezervno glaso",
    },
    transcriptMode: {
  ru: "Только текст",

      ro: "Doar text",
      en: "Text only",
      sq: "Vetëm tekst",
      it: "Solo testo",
      hr: "Samo tekst",
      rom: "Samo teksto",
    },
    minimizeAria: {
  ru: "Свернуть",

      ro: "Micșorează",
      en: "Minimise",
      sq: "Zvogëlo",
      it: "Riduci",
      hr: "Smanji",
      rom: "Tiknjar",
    },
    closeAria: {
  ru: "Остановиться и закрыть",

      ro: "Oprește și închide",
      en: "Stop and close",
      sq: "Ndalo dhe mbyll",
      it: "Ferma e chiudi",
      hr: "Zaustavi i zatvori",
      rom: "Ačhav thaj phand",
    },
    statusPlaying: {
  ru: "Играя",

      ro: "Se aude",
      en: "Playing",
      sq: "Po luhet",
      it: "In riproduzione",
      hr: "Reproducira se",
      rom: "Ashunel pes",
    },
    statusPaused: {
  ru: "Приостановлено",

      ro: "Pe pauză",
      en: "Paused",
      sq: "Në pauzë",
      it: "In pausa",
      hr: "Pauzirano",
      rom: "Pe pauza",
    },
    progressSummary: {
  ru: "{progressPercent} % прослушали",

      ro: "{progressPercent}% ascultat",
      en: "{progressPercent}% listened",
      sq: "{progressPercent}% e dëgjuar",
      it: "{progressPercent}% ascoltato",
      hr: "{progressPercent}% poslušano",
      rom: "{progressPercent}% ashundo",
    },
    scrubberAria: {
  ru: "Как много ты слышал",

      ro: "Cât ai ascultat",
      en: "How much you have heard",
      sq: "Sa ke dëgjuar",
      it: "Quanto hai ascoltato",
      hr: "Koliko si poslušao",
      rom: "Kozom ashundjan",
    },
    scrubberTitle: {
  ru: "Коснитесь панели, чтобы перейти к этой части.",

      ro: "Apasă pe bară ca să sari la acea parte",
      en: "Tap the bar to jump to that part",
      sq: "Prek shiritin për të kaluar te ajo pjesë",
      it: "Tocca la barra per passare a quel punto",
      hr: "Dodirni traku za skok na taj dio",
      rom: "Azba i linija te dzhas ko kodo kotor",
    },
    rewindButton: {
  ru: "Начать заново",

      ro: "De la început",
      en: "Start again",
      sq: "Nga fillimi",
      it: "Da capo",
      hr: "Ispočetka",
      rom: "Katar o anglunipen",
    },
    rewindAria: {
  ru: "Послушай еще раз с самого начала",

      ro: "Ascultă din nou de la început",
      en: "Listen again from the start",
      sq: "Dëgjo sërish nga fillimi",
      it: "Riascolta dall'inizio",
      hr: "Poslušaj ponovno od početka",
      rom: "Ashun pale katar o anglunipen",
    },
    playButton: {
  ru: "Слушай",

      ro: "Ascultă",
      en: "Listen",
      sq: "Dëgjo",
      it: "Ascolta",
      hr: "Poslušaj",
      rom: "Ashun",
    },
    pauseButton: {
  ru: "Пауза",

      ro: "Pauză",
      en: "Pause",
      sq: "Pauzë",
      it: "Pausa",
      hr: "Pauza",
      rom: "Pauza",
    },
    playAria: {
  ru: "Продолжайте слушать",

      ro: "Continuă să asculți",
      en: "Keep listening",
      sq: "Vazhdo të dëgjosh",
      it: "Riprendi l'ascolto",
      hr: "Nastavi slušati",
      rom: "Dzha maj dur ashunimasa",
    },
    pauseAria: {
  ru: "Пауза",

      ro: "Pune pe pauză",
      en: "Pause",
      sq: "Ndalo për pak",
      it: "Metti in pausa",
      hr: "Pauziraj",
      rom: "Čhiv pe pauza",
    },
    speedGroupAria: {
  ru: "Скорость голоса",

      ro: "Viteza vocii",
      en: "Voice speed",
      sq: "Shpejtësia e zërit",
      it: "Velocità della voce",
      hr: "Brzina glasa",
      rom: "Sigipen e glasesko",
    },
    calmSpeed: {
  ru: "медленный",

      ro: "rar",
      en: "slow",
      sq: "ngadalë",
      it: "lento",
      hr: "sporo",
      rom: "lokhes",
    },
    calmSpeedTitle: {
  ru: "Медленнее (0,85x), легче следовать",

      ro: "Mai rar (0.85x), mai ușor de urmărit",
      en: "Slower (0.85x), easier to follow",
      sq: "Më ngadalë (0.85x), më lehtë për ta ndjekur",
      it: "Più lento (0.85x), più facile da seguire",
      hr: "Sporije (0.85x), lakše za praćenje",
      rom: "Maj lokhes (0.85x), maj lokho te ashunes",
    },
    normalSpeed: {
  ru: "нормальный",

      ro: "normal",
      en: "normal",
      sq: "normale",
      it: "normale",
      hr: "normalno",
      rom: "normalno",
    },
    normalSpeedTitle: {
  ru: "Нормальная скорость (1,0x)",

      ro: "Viteză normală (1.0x)",
      en: "Normal speed (1.0x)",
      sq: "Shpejtësi normale (1.0x)",
      it: "Velocità normale (1.0x)",
      hr: "Normalna brzina (1.0x)",
      rom: "Normalno sigipen (1.0x)",
    },
  },

  synchronizedReader: {
    sentenceClickTitle: {
  ru: "Нажмите, чтобы услышать это предложение",

      ro: "Apasă ca să asculți propoziția",
      en: "Tap to hear this sentence",
      sq: "Prek për të dëgjuar këtë fjali",
      it: "Tocca per ascoltare questa frase",
      hr: "Dodirni kako bi čuo ovu rečenicu",
      rom: "Azba te ashunes akaja rečenica",
    },
    termTitleTemplate: {
  ru: "{term} на цыганском языке. Нажмите, чтобы увидеть перевод и узнать, как его сказать.",

      ro: "{term} în romani. Apasă ca să vezi traducerea și pronunția.",
      en: "{term} in Romani. Tap to see the translation and how to say it.",
      sq: "{term} në gjuhën rome. Prek për përkthimin dhe shqiptimin.",
      it: "{term} in romanì. Tocca per vedere traduzione e pronuncia.",
      hr: "{term} na romskom. Dodirni za prijevod i izgovor.",
      rom: "{term} pe romani čhib. Azba te dikhes so znachil thaj sar phenel pes.",
    },
    popoverAria: {
  ru: "Цыганский перевод",

      ro: "Traducere din romani",
      en: "Romani translation",
      sq: "Përkthim nga gjuha rome",
      it: "Traduzione dal romanì",
      hr: "Prijevod s romskog",
      rom: "Znachimos katar romani čhib",
    },
    popoverBadge: {
  ru: "Медицинское слово на цыганском языке",

      ro: "Cuvânt medical în romani",
      en: "Medical word in Romani",
      sq: "Fjalë mjekësore në gjuhën rome",
      it: "Parola medica in romanì",
      hr: "Medicinska riječ na romskom",
      rom: "Sastipnasko alav pe romani čhib",
    },
    romanianLabel: {
  ru: "На румынском:",
      ro: "Sensul medical:",
      en: "Medical meaning:",
      sq: "Kuptimi mjekësor:",
      it: "Significato medico:",
      hr: "Značenje:",
      rom: "So znachil:",
    },
    closeAria: {
  ru: "Закрыть перевод",

      ro: "Închide traducerea",
      en: "Close translation",
      sq: "Mbyll përkthimin",
      it: "Chiudi la traduzione",
      hr: "Zatvori prijevod",
      rom: "Phand o znachimos",
    },
    phoneticGuide: {
  ru: "Как это сказать:",

      ro: "Cum se pronunță:",
      en: "How to say it:",
      sq: "Si shqiptohet:",
      it: "Come si pronuncia:",
      hr: "Kako se izgovara:",
      rom: "Sar phenel pes:",
    },
    listenPronunciationAria: {
  ru: "Послушайте, как это сказать на цыганском языке.",

      ro: "Ascultă cum se spune în romani",
      en: "Hear how to say it in Romani",
      sq: "Dëgjo si thuhet në gjuhën rome",
      it: "Ascolta come si dice in romanì",
      hr: "Poslušaj kako se izgovara na romskom",
      rom: "Ashun sar phenel pes pe romani čhib",
    },
    listenPronunciationButton: {
  ru: "Слушай",

      ro: "Ascultă",
      en: "Listen",
      sq: "Dëgjo",
      it: "Ascolta",
      hr: "Poslušaj",
      rom: "Ashun",
    },
    dismissButton: {
  ru: "понял",

      ro: "Am înțeles",
      en: "Got it",
      sq: "E kuptova",
      it: "Ho capito",
      hr: "Razumijem",
      rom: "Haljiljom",
    },
  },
};

export const MYTH_CATEGORIES_RU: MythCategory[] = [
  { slug: "toate", label: "Все мифы" },
  { slug: "vaccinuri", label: "Вакцины" },
  { slug: "diabet", label: "Диабет и сахар" },
  { slug: "inima", label: "Сердце и давление" },
  { slug: "antibiotice", label: "Антибиотики" },
  { slug: "femei", label: "Женское здоровье" },
  { slug: "alimentatie", label: "Питание и соль" },
  { slug: "miscare", label: "Физическая активность" },
  { slug: "echilibru", label: "Психическое благополучие" },
];

const russianMythContent: Record<string, { statement: string; explanation: string }> = {
  "myth-flu-vaccine": {
    statement: "Прививка от гриппа вызывает грипп.",
    explanation: "Многие так думают, потому что после прививки иногда чувствуют недомогание. Вакцина содержит неактивные части вируса, которые не могут вызвать болезнь. Она учит организм бороться с настоящим вирусом.",
  },
  "myth-diabetes-sugar": {
    statement: "Диабет бывает только у тех, кто ест слишком много сахара.",
    explanation: "Избыток сахара может привести к набору веса. Но у диабета 2-го типа несколько причин: наследственность, недостаток движения и то, как организм использует инсулин. Причина не только в сладостях.",
  },
  "myth-blood-pressure": {
    statement: "При высоком давлении всегда болит или кружится голова.",
    explanation: "Чаще всего высокое давление не вызывает никаких симптомов. Поэтому его называют тихим убийцей. Надёжный способ выявить его — регулярно измерять давление.",
  },
  "myth-antibiotics-cold": {
    statement: "Антибиотики помогают быстрее вылечить простуду или грипп.",
    explanation: "Простуду и грипп вызывают вирусы. Антибиотики действуют только на бактерии. Приём без назначения врача может навредить полезным бактериям кишечника. Со временем антибиотики также могут терять эффективность.",
  },
  "myth-womens-mammography": {
    statement: "Если в груди не прощупывается уплотнение, обследование не нужно.",
    explanation: "Маммография или УЗИ молочных желёз могут выявить небольшие изменения задолго до того, как их можно прощупать. Когда проблему обнаруживают рано, лечение проще и эффективнее.",
  },
  "myth-smoking-filters": {
    statement: "Сигареты с фильтром или нагреваемый табак не вредят сердцу.",
    explanation: "Никотин и вдыхаемые вещества сужают сосуды и учащают пульс независимо от способа курения. Отказ от курения — важный шаг для здоровья сердца.",
  },
  "myth-healthy-eating-salt": {
    statement: "Розовая гималайская или морская соль полезна, поэтому её можно есть сколько угодно.",
    explanation: "Любая пищевая соль примерно на 98% состоит из хлорида натрия. Все её виды одинаково повышают давление. Розовая соль не защищает сердце лучше обычной. Важно общее количество: менее 5 граммов в день.",
  },
  "myth-physical-activity-gym": {
    statement: "Физическая активность полезна только при интенсивных тренировках или занятиях в спортзале.",
    explanation: "Быстрая ходьба, работа в саду и подъём по лестнице тоже защищают сердце. Каждая минута ежедневного движения помогает снизить давление и уровень сахара в крови. Дорогое оборудование не нужно.",
  },
  "myth-mental-weakness": {
    statement: "Если вы тревожитесь или долго грустите, значит, вы слабый человек.",
    explanation: "Тревожные расстройства и депрессия — реальные заболевания. На них влияют работа мозга, гормоны и стресс. Это не слабость характера. Помощь специалиста и дыхательные упражнения под руководством могут помочь.",
  },
};

const russianMythTerms: Record<string, string> = {
  "Family medicine": "Семейная медицина",
  "Endocrinology and nutrition": "Эндокринология и питание",
  Cardiology: "Кардиология",
  "Infectious diseases": "Инфекционные болезни",
  "Obstetrics and gynecology": "Акушерство и гинекология",
  "World Health Organization": "Всемирная организация здравоохранения",
  "International Diabetes Federation": "Международная диабетическая федерация",
  "European Society of Cardiology": "Европейское общество кардиологов",
  "European screening guidelines": "Европейские рекомендации по скринингу",
  "World Health Organization and European prevention guidelines": "Всемирная организация здравоохранения и европейские рекомендации по профилактике",
};

export const HEALTH_MYTHS_RU: HealthMyth[] = HEALTH_MYTHS_EN.map((myth) => ({
  ...myth,
  ...russianMythContent[myth.id],
  category: MYTH_CATEGORIES_RU.find((category) => category.slug === myth.categorySlug)?.label ?? myth.category,
  statusTag: "Неправда",
  doctorSpecialty: russianMythTerms[myth.doctorSpecialty] ?? myth.doctorSpecialty,
  source: russianMythTerms[myth.source] ?? myth.source,
}));
