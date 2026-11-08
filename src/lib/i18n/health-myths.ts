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
      "Mulți cred asta pentru că uneori se simt rău la scurt timp după vaccin. Vaccinul conține bucăți de virus inactive, care nu pot provoca boala. El doar învață corpul să lupte cu virusul adevărat.",
    doctorName: "Dr. Elena Radu",
    doctorSpecialty: "Medicină de familie",
    source: "Organizația Mondială a Sănătății și Ministerul Sănătății",
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
      "Prea mult zahăr te poate îngrășa. Dar diabetul de tip 2 are mai multe cauze: moștenirea din familie, lipsa de mișcare și felul în care corpul folosește insulina. Nu apare doar din dulciuri.",
    doctorName: "Dr. Mihai Stoica",
    doctorSpecialty: "Diabet și boli de nutriție",
    source: "Societatea Română de Diabet, Nutriție și Boli Metabolice",
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
      "De cele mai multe ori, tensiunea mare nu dă niciun semn. De aceea i se spune și ucigașul tăcut. Singurul mod sigur să afli este să o măsori regulat cu tensiometrul.",
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
      "Răceala și gripa sunt date de virusuri. Antibioticele lucrează doar împotriva bacteriilor. Dacă le iei fără să ți le dea medicul, îți strici flora intestinală. Și, în timp, antibioticele nu mai funcționează așa de bine.",
    doctorName: "Dr. Maria Popa",
    doctorSpecialty: "Boli infecțioase",
    source: "Institutul Național de Boli Infecțioase «Prof. Dr. Matei Balș»",
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
      "Mamografia și ecografia sânului pot găsi schimbări foarte mici, cu mult înainte să le simți cu mâna. Când problema e găsită devreme, tratamentul e mai simplu și merge mai bine.",
    doctorName: "Dr. Camelia Dobre",
    doctorSpecialty: "Obstetrică-ginecologie",
    source: "Ministerul Sănătății și ghidurile europene de screening",
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
      "Nicotina și ce tragi în piept strâng vasele de sânge și grăbesc pulsul, oricum ai fuma. Cel mai bun lucru pentru inimă și vase este să te lași de fumat.",
    doctorName: "Dr. Adrian Ionescu",
    doctorSpecialty: "Cardiologie",
    source: "Organizația Mondială a Sănătății",
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
      "Orice sare de bucătărie are cam 98% clorură de sodiu. Toate cresc tensiunea la fel. Sarea roz nu îți apără inima mai bine decât sarea obișnuită. Contează cât mănânci în total: sub 5 grame pe zi.",
    doctorName: "Dr. Mihai Stoica",
    doctorSpecialty: "Diabet și boli de nutriție",
    source: "Organizația Mondială a Sănătății și Societatea Română de Nutriție",
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
      "Mersul pe jos în pas vioi, lucrul în grădină sau urcatul scărilor îți protejează inima. Fiecare minut de mișcare pe zi ajută la scăderea tensiunii și a zahărului din sânge. Nu ai nevoie de aparate scumpe.",
    doctorName: "Dr. Adrian Ionescu",
    doctorSpecialty: "Cardiologie",
    source: "Organizația Mondială a Sănătății și ghidurile europene de prevenție",
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
      "Anxietatea și depresia sunt boli reale. Le influențează creierul, hormonii și grijile din viață. Nu sunt o slăbiciune de caracter. Ajutorul unui specialist și exercițiile de respirație ghidată ajută mult.",
    doctorName: "Dr. Elena Radu",
    doctorSpecialty: "Medicină de familie",
    source: "Organizația Mondială a Sănătății",
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
      "Many people think this because they feel a bit unwell soon after the vaccine. The vaccine contains inactive parts of the virus, which cannot cause the illness. It only teaches your body to fight the real virus.",
    doctorName: "Dr. Elena Radu",
    doctorSpecialty: "Family medicine",
    source: "World Health Organization",
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
      "Too much sugar can make you put on weight. But type 2 diabetes has several causes: your genes, not moving enough and how your body uses insulin. Sweets alone do not cause it.",
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
      "Most of the time, high blood pressure causes no signs at all. That is why it is called the silent killer. The only sure way to find it is to measure it regularly.",
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
      "Colds and flu are caused by viruses. Antibiotics only work against bacteria. If you take them without a prescription, they harm the good bacteria in your gut. Over time, antibiotics also stop working as well.",
    doctorName: "Dr. Maria Popa",
    doctorSpecialty: "Infectious diseases",
    source: "World Health Organization",
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
      "A mammogram or breast ultrasound can find very small changes long before you can feel them. When a problem is found early, treatment is simpler and works better.",
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
      "Nicotine and what you breathe in narrow your blood vessels and speed up your pulse, however you smoke. Quitting is the best thing you can do for your heart.",
    doctorName: "Dr. Adrian Ionescu",
    doctorSpecialty: "Cardiology",
    source: "World Health Organization",
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
      "All kitchen salt is about 98% sodium chloride. Every kind raises blood pressure in the same way. Pink salt does not protect your heart any better than ordinary salt. What matters is the total: less than 5 grams a day.",
    doctorName: "Dr. Mihai Stoica",
    doctorSpecialty: "Endocrinology and nutrition",
    source: "World Health Organization",
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
      "Walking fast, gardening or taking the stairs all protect your heart. Every minute you move each day helps lower your blood pressure and blood sugar. You don't need expensive equipment.",
    doctorName: "Dr. Adrian Ionescu",
    doctorSpecialty: "Cardiology",
    source: "World Health Organization and European prevention guidelines",
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
      "Anxiety and depression are real illnesses. They are shaped by the brain, hormones and stress in your life. They are not a weakness of character. Help from a specialist and guided breathing exercises help a lot.",
    doctorName: "Dr. Elena Radu",
    doctorSpecialty: "Family medicine",
    source: "World Health Organization",
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
      "Shumë njerëz e mendojnë këtë sepse ndihen pak keq menjëherë pas vaksinës. Vaksina ka copa virusi joaktive, që nuk mund të të sëmurin. Ajo vetëm e mëson trupin të luftojë virusin e vërtetë.",
    doctorName: "Dr. Elena Radu",
    doctorSpecialty: "Mjekësi familjare",
    source: "Organizata Botërore e Shëndetësisë",
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
      "Sheqeri i tepërt mund të të shtojë peshën. Por diabeti i tipit 2 ka disa shkaqe: gjenet, pak lëvizje dhe mënyra si trupi e përdor insulinën. Nuk vjen vetëm nga ëmbëlsirat.",
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
      "Shumicën e herëve, presioni i lartë nuk jep asnjë shenjë. Prandaj e quajnë vrasësi i heshtur. E vetmja mënyrë e sigurt për ta zbuluar është ta masësh rregullisht me aparatin e tensionit.",
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
      "Ftohjen dhe gripin i shkaktojnë viruset. Antibiotikët veprojnë vetëm kundër baktereve. Po t'i marrësh pa recetë, dëmton bakteret e mira të zorrëve. Me kohë, antibiotikët nuk veprojnë më aq mirë.",
    doctorName: "Dr. Maria Popa",
    doctorSpecialty: "Sëmundje infektive",
    source: "Organizata Botërore e Shëndetësisë",
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
      "Mamografia dhe ekografia e gjirit gjejnë ndryshime shumë të vogla, shumë kohë para se t'i ndjesh me dorë. Kur problemi gjendet herët, trajtimi është më i lehtë dhe jep rezultat më të mirë.",
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
      "Nikotina dhe ajo që thith i ngushtojnë enët e gjakut dhe ta shpejtojnë pulsin, si do që të pish duhan. Gjëja më e mirë që mund të bësh për zemrën është ta lësh duhanin.",
    doctorName: "Dr. Adrian Ionescu",
    doctorSpecialty: "Kardiologji",
    source: "Organizata Botërore e Shëndetësisë",
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
      "Çdo kripë kuzhine ka rreth 98% klorur natriumi. Të gjitha e ngrenë presionin njësoj. Kripa rozë nuk e mbron zemrën më shumë se kripa e zakonshme. Ka rëndësi sasia gjithsej: më pak se 5 gramë në ditë.",
    doctorName: "Dr. Mihai Stoica",
    doctorSpecialty: "Endokrinologji dhe diabet",
    source: "Organizata Botërore e Shëndetësisë",
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
      "Ecja me hap të shpejtë, puna në kopsht ose ngjitja e shkallëve e mbrojnë zemrën. Çdo minutë lëvizje në ditë të ndihmon të ulësh presionin dhe sheqerin në gjak. Nuk të duhen pajisje të shtrenjta.",
    doctorName: "Dr. Adrian Ionescu",
    doctorSpecialty: "Kardiologji",
    source: "Organizata Botërore e Shëndetësisë",
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
      "Ankthi dhe depresioni janë sëmundje të vërteta. Ndikohen nga truri, hormonet dhe stresi i jetës. Nuk janë dobësi karakteri. Ndihma e një specialisti dhe ushtrimet e drejtuara të frymëmarrjes ndihmojnë shumë.",
    doctorName: "Dr. Elena Radu",
    doctorSpecialty: "Mjekësi familjare",
    source: "Organizata Botërore e Shëndetësisë",
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
      "Molti lo pensano perché subito dopo il vaccino si sentono un po' male. Il vaccino contiene pezzi di virus inattivi, che non possono farti ammalare. Insegna solo al corpo a combattere il virus vero.",
    doctorName: "Dr. Elena Radu",
    doctorSpecialty: "Medicina generale",
    source: "Organizzazione Mondiale della Sanità",
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
      "Troppo zucchero può farti ingrassare. Ma il diabete di tipo 2 ha più cause: i geni, il poco movimento e il modo in cui il corpo usa l'insulina. Non dipende solo dai dolci.",
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
      "Il più delle volte la pressione alta non dà nessun segno. Per questo la chiamano killer silenzioso. L'unico modo sicuro per scoprirla è misurarla con regolarità.",
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
      "Raffreddore e influenza sono causati da virus. Gli antibiotici funzionano solo contro i batteri. Se li prendi senza ricetta, danneggi i batteri buoni dell'intestino. Col tempo, gli antibiotici funzionano anche meno bene.",
    doctorName: "Dr. Maria Popa",
    doctorSpecialty: "Malattie infettive",
    source: "Organizzazione Mondiale della Sanità",
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
      "La mammografia e l'ecografia al seno trovano cambiamenti molto piccoli, molto prima che tu possa sentirli con le dita. Se il problema si scopre presto, la cura è più semplice e funziona meglio.",
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
      "La nicotina e quello che respiri stringono i vasi sanguigni e accelerano il battito, in qualunque modo fumi. Smettere di fumare è la cosa migliore che puoi fare per il cuore.",
    doctorName: "Dr. Adrian Ionescu",
    doctorSpecialty: "Cardiologia",
    source: "Organizzazione Mondiale della Sanità",
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
      "Ogni sale da cucina contiene circa il 98% di cloruro di sodio. Tutti alzano la pressione allo stesso modo. Il sale rosa non protegge il cuore più del sale normale. Conta la quantità totale: meno di 5 grammi al giorno.",
    doctorName: "Dr. Mihai Stoica",
    doctorSpecialty: "Endocrinologia e nutrizione",
    source: "Organizzazione Mondiale della Sanità",
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
      "Camminare a passo svelto, lavorare in giardino o fare le scale proteggono il cuore. Ogni minuto di movimento al giorno aiuta ad abbassare la pressione e lo zucchero nel sangue. Non servono attrezzi costosi.",
    doctorName: "Dr. Adrian Ionescu",
    doctorSpecialty: "Cardiologia",
    source: "Organizzazione Mondiale della Sanità",
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
      "Ansia e depressione sono malattie vere. Dipendono dal cervello, dagli ormoni e dallo stress della vita. Non sono una debolezza di carattere. L'aiuto di uno specialista e gli esercizi di respirazione guidata aiutano molto.",
    doctorName: "Dr. Elena Radu",
    doctorSpecialty: "Medicina generale",
    source: "Organizzazione Mondiale della Sanità",
    relatedTopicSlug: "mental-wellbeing",
  },
];

export function getHealthMyths(lang: Lang): HealthMyth[] {
  if (lang === "en") return HEALTH_MYTHS_EN;
  if (lang === "sq") return HEALTH_MYTHS_SQ;
  if (lang === "it") return HEALTH_MYTHS_IT;
  return HEALTH_MYTHS_RO;
}

export function getMythCategories(lang: Lang): MythCategory[] {
  if (lang === "en") return MYTH_CATEGORIES_EN;
  if (lang === "sq") return MYTH_CATEGORIES_SQ;
  if (lang === "it") return MYTH_CATEGORIES_IT;
  return MYTH_CATEGORIES_RO;
}

export const SPEECH_LANG_BY_LOCALE: Record<Lang, string> = {
  ro: "ro-RO",
  en: "en-GB",
  sq: "sq-AL",
  it: "it-IT",
};

export const HEALTH_DETAIL_SHARED_STRINGS = {
  whyItMatters: {
    heading: {
      ro: "De ce contează",
      en: "Why it matters",
      sq: "Pse ka rëndësi",
      it: "Perché è importante",
    },
    subtitleTemplate: {
      ro: "3 lucruri bune de știut despre {topic}.",
      en: "3 things to know about {topic}.",
      sq: "3 gjëra që duhet t'i dish për këtë temë.",
      it: "3 cose da sapere su questo tema.",
    },
    listenAllLabel: {
      ro: "Ascultă toate cele 3 puncte",
      en: "Listen to all 3 points",
      sq: "Dëgjo të 3 pikat",
      it: "Ascolta tutti e 3 i punti",
    },
    listenPillarLabel: {
      ro: "Ascultă punctul {number}",
      en: "Listen to point {number}",
      sq: "Dëgjo pikën {number}",
      it: "Ascolta il punto {number}",
    },
    pillar1Title: {
      ro: "Ce se întâmplă în corp",
      en: "What happens in the body",
      sq: "Çfarë ndodh në trup",
      it: "Cosa succede nel corpo",
    },
    pillar1Desc: {
      ro: "Toate părțile corpului lucrează împreună. Când ai grijă de vasele de sânge și de organe, tot corpul merge mai ușor.",
      en: "All parts of your body work together. When you look after your blood vessels and organs, your whole body works more easily.",
      sq: "Të gjitha pjesët e trupit punojnë bashkë. Kur kujdesesh për enët e gjakut dhe organet, i gjithë trupi punon më lehtë.",
      it: "Tutte le parti del corpo lavorano insieme. Se ti prendi cura dei vasi sanguigni e degli organi, tutto il corpo lavora meglio.",
    },
    pillar2Title: {
      ro: "Cum te afectează zi de zi",
      en: "How it affects your daily life",
      sq: "Si të ndikon çdo ditë",
      it: "Come cambia la tua vita di ogni giorno",
    },
    pillar2Desc: {
      ro: "Multe probleme de sănătate nu dor la început. Dacă le afli din timp, îți păstrezi puterea pentru muncă și familie.",
      en: "Many health problems do not hurt at first. If you find them early, you keep your strength for work and family.",
      sq: "Shumë probleme shëndetësore nuk dhembin në fillim. Po t'i zbulosh herët, e ruan forcën për punën dhe familjen.",
      it: "Molti problemi di salute all'inizio non fanno male. Se li scopri presto, conservi le forze per il lavoro e la famiglia.",
    },
    pillar3Title: {
      ro: "Ce poți schimba ușor",
      en: "What you can change easily",
      sq: "Çfarë mund të ndryshosh lehtë",
      it: "Cosa puoi cambiare facilmente",
    },
    pillar3Desc: {
      ro: "Obiceiurile mici, făcute în fiecare zi, ajută mult în timp. De exemplu, puțină mișcare și mâncare mai puțin sărată.",
      en: "Small habits, done every day, help a lot over time. For example, a little movement and less salty food.",
      sq: "Zakonet e vogla, të bëra çdo ditë, ndihmojnë shumë me kohë. Për shembull, pak lëvizje dhe ushqim me më pak kripë.",
      it: "Piccole abitudini, ogni giorno, aiutano molto nel tempo. Per esempio, un po' di movimento e cibo meno salato.",
    },
  },

  actionableSteps: {
    heading: {
      ro: "Ce poți face în fiecare zi",
      en: "What you can do every day",
      sq: "Çfarë mund të bësh çdo ditë",
      it: "Cosa puoi fare ogni giorno",
    },
    subtitleTemplate: {
      ro: "Bifează ce ai făcut azi pentru {topic}.",
      en: "Tick what you did today for {topic}.",
      sq: "Shëno çfarë bëre sot.",
      it: "Spunta quello che hai fatto oggi.",
    },
    completedBadge: {
      ro: "{completed} din {total} făcute",
      en: "{completed} of {total} done",
      sq: "{completed} nga {total} të bëra",
      it: "{completed} su {total} fatte",
    },
    listenStepLabel: {
      ro: "Ascultă: {title}",
      en: "Listen: {title}",
      sq: "Dëgjo: {title}",
      it: "Ascolta: {title}",
    },
  },

  warningSigns: {
    heading: {
      ro: "Semne că ai nevoie de ajutor acum",
      en: "Signs you need help now",
      sq: "Shenja që të duhet ndihmë tani",
      it: "Segni che ti serve aiuto subito",
    },
    subtitleWarning: {
      ro: "Sună tu la 112. Aplicația nu sună în locul tău.",
      en: "Call 112 yourself. The app does not call for you.",
      sq: "Telefono vetë në 112. Aplikacioni nuk telefonon për ty.",
      it: "Chiama tu il 112. L'app non chiama al posto tuo.",
    },
    prompt: {
      ro: "Dacă tu sau cineva de lângă tine are unul dintre aceste semne legate de {topic}, cere imediat ajutor medical:",
      en: "If you or someone near you has any of these signs linked to {topic}, get medical help right away:",
      sq: "Nëse ti ose dikush pranë teje ka një nga këto shenja, kërko menjëherë ndihmë mjekësore:",
      it: "Se tu o qualcuno vicino a te ha uno di questi segni, chiedi subito aiuto medico:",
    },
    modalTrigger: {
      ro: "Când suni la 112",
      en: "When to call 112",
      sq: "Kur të telefonosh në 112",
      it: "Quando chiamare il 112",
    },
    disclaimer: {
      ro: "Formează 112 de pe telefonul tău.",
      en: "Dial 112 on your own phone.",
      sq: "Formo 112 nga telefoni yt.",
      it: "Componi il 112 dal tuo telefono.",
    },
    modalTitle: {
      ro: "Urgență medicală 112",
      en: "Medical emergency 112",
      sq: "Urgjencë mjekësore 112",
      it: "Emergenza medica 112",
    },
    modalSubtitle: {
      ro: "Apelul e gratuit, zi și noapte, din orice rețea.",
      en: "Free to call, day and night, from any network.",
      sq: "Telefonata është falas, ditë e natë, nga çdo rrjet.",
      it: "La chiamata è gratuita, giorno e notte, da qualsiasi rete.",
    },
    closeAria: {
      ro: "Închide fereastra",
      en: "Close window",
      sq: "Mbyll dritaren",
      it: "Chiudi la finestra",
    },
    dispatchTitle: {
      ro: "Ce spui când suni la 112",
      en: "What to say when you call 112",
      sq: "Çfarë të thuash kur telefonon në 112",
      it: "Cosa dire quando chiami il 112",
    },
    dispatchStep1: {
      ro: "Unde ești: adresa exactă, satul sau orașul, ori un loc cunoscut din apropiere.",
      en: "Where you are: the exact address, village or town, or a well-known place nearby.",
      sq: "Ku je: adresa e saktë, fshati ose qyteti, ose një vend i njohur aty pranë.",
      it: "Dove sei: indirizzo esatto, paese o città, o un posto conosciuto lì vicino.",
    },
    dispatchStep2: {
      ro: "Ce s-a întâmplat și ce simptome are persoana.",
      en: "What happened and what symptoms the person has.",
      sq: "Çfarë ndodhi dhe çfarë shenjash ka personi.",
      it: "Cosa è successo e che sintomi ha la persona.",
    },
    dispatchStep3: {
      ro: "Dacă persoana e conștientă și respiră.",
      en: "Whether the person is conscious and breathing.",
      sq: "Nëse personi është në vete dhe merr frymë.",
      it: "Se la persona è cosciente e respira.",
    },
    dispatchStep4: {
      ro: "Răspunde calm la întrebări și nu închide tu primul.",
      en: "Answer the questions calmly and don't hang up first.",
      sq: "Përgjigju qetë pyetjeve dhe mos e mbyll ti i pari telefonin.",
      it: "Rispondi con calma alle domande e non riattaccare per primo.",
    },
    closeBtn: {
      ro: "Închide",
      en: "Close",
      sq: "Mbyll",
      it: "Chiudi",
    },
    dialBtn: {
      ro: "Sună la 112",
      en: "Call 112",
      sq: "Telefono 112",
      it: "Chiama il 112",
    },
  },

  topicMyth: {
    badge: {
      ro: "Adevărat sau fals",
      en: "True or false",
      sq: "E vërtetë apo e gabuar",
      it: "Vero o falso",
    },
    audioPrompt: {
      ro: "{statement} E adevărat sau fals?",
      en: "{statement} True or false?",
      sq: "{statement} E vërtetë apo e gabuar?",
      it: "{statement} Vero o falso?",
    },
    trueBtn: {
      ro: "Adevărat",
      en: "True",
      sq: "E vërtetë",
      it: "Vero",
    },
    falseBtn: {
      ro: "Fals",
      en: "False",
      sq: "E gabuar",
      it: "Falso",
    },
    correctBadge: {
      ro: "Ai răspuns corect",
      en: "That's right",
      sq: "Përgjigje e saktë",
      it: "Risposta giusta",
    },
    sourcePrefix: {
      ro: "Sursă:",
      en: "Source:",
      sq: "Burimi:",
      it: "Fonte:",
    },
  },

  topicMetaBadge: {
    readMinutesLong: {
      ro: "{minutes} minute de citit",
      en: "{minutes} min read",
      sq: "{minutes} minuta lexim",
      it: "{minutes} minuti di lettura",
    },
    readMinutesShort: {
      ro: "{minutes} min de citit",
      en: "{minutes} min read",
      sq: "{minutes} min lexim",
      it: "{minutes} min lettura",
    },
    audioMinutes: {
      ro: "{minutes} minute audio",
      en: "{minutes} min audio",
      sq: "{minutes} minuta audio",
      it: "{minutes} minuti audio",
    },
  },

  topicHero: {
    backToGuides: {
      ro: "Înapoi la ghiduri",
      en: "Back to health guides",
      sq: "Kthehu te udhëzuesit",
      it: "Torna alle guide",
    },
    listenGuide: {
      ro: "Ascultă ghidul",
      en: "Listen to guide",
      sq: "Dëgjo udhëzuesin",
      it: "Ascolta la guida",
    },
    stopAudio: {
      ro: "Oprește audio",
      en: "Stop audio",
      sq: "Ndalo audion",
      it: "Interrompi audio",
    },
    ariaIntro: {
      ro: "Despre acest subiect",
      en: "About this topic",
      sq: "Për këtë temë",
      it: "Su questo argomento",
    },
    ariaNav: {
      ro: "Navigare",
      en: "Navigation",
      sq: "Navigimi",
      it: "Navigazione",
    },
  },

  relatedTopics: {
    heading: {
      ro: "Alte ghiduri de sănătate",
      en: "More health guides",
      sq: "Udhëzues të tjerë për shëndetin",
      it: "Altre guide sulla salute",
    },
    subtitle: {
      ro: "Subiecte apropiate, explicate de medici.",
      en: "Related topics, explained by doctors.",
      sq: "Tema të afërta, të shpjeguara nga mjekët.",
      it: "Argomenti collegati, spiegati dai medici.",
    },
    readOrListen: {
      ro: "Citește sau ascultă",
      en: "Read or listen",
      sq: "Lexo ose dëgjo",
      it: "Leggi o ascolta",
    },
  },

  topicDetailPageContent: {
    romanesGlossaryTitle: {
      ro: "Cuvinte medicale în romani",
      en: "Medical words in Romani",
      sq: "Fjalë mjekësore në gjuhën rome",
      it: "Parole mediche in romanì",
    },
    ariaSentenceSection: {
      ro: "Textul ghidului, citit cu voce",
      en: "Guide text, read aloud",
      sq: "Teksti i udhëzuesit, i lexuar me zë",
      it: "Testo della guida, letto ad alta voce",
    },
    ariaMobileActions: {
      ro: "Acțiuni rapide",
      en: "Quick actions",
      sq: "Veprime të shpejta",
      it: "Azioni rapide",
    },
  },

  romanesGlossaryDrawer: {
    title: {
      ro: "Cuvinte medicale în romani",
      en: "Medical words in Romani",
      sq: "Fjalë mjekësore në gjuhën rome",
      it: "Parole mediche in romanì",
    },
    subtitle: {
      ro: "Cuvinte de zi cu zi, în romani și în română",
      en: "Everyday words in Romani and Romanian",
      sq: "Fjalë të përditshme në gjuhën rome dhe në rumanisht",
      it: "Parole di ogni giorno in romanì e in rumeno",
    },
    closeAria: {
      ro: "Închide lista de cuvinte",
      en: "Close word list",
      sq: "Mbyll listën e fjalëve",
      it: "Chiudi l'elenco di parole",
    },
    searchPlaceholder: {
      ro: "Caută un cuvânt sau un simptom",
      en: "Search for a word or symptom",
      sq: "Kërko një fjalë ose një simptomë",
      it: "Cerca una parola o un sintomo",
    },
    pronounceAriaTemplate: {
      ro: "Ascultă cum se spune {term}",
      en: "Hear how to say {term}",
      sq: "Dëgjo si thuhet {term}",
      it: "Ascolta come si dice {term}",
    },
    pronunciationLabel: {
      ro: "Pronunție:",
      en: "Pronunciation:",
      sq: "Shqiptimi:",
      it: "Pronuncia:",
    },
    categoryAll: {
      ro: "Toate",
      en: "All",
      sq: "Të gjitha",
      it: "Tutti",
    },
    categoryHeart: {
      ro: "Inimă",
      en: "Heart",
      sq: "Zemra",
      it: "Cuore",
    },
    categorySymptoms: {
      ro: "Simptome",
      en: "Symptoms",
      sq: "Simptomat",
      it: "Sintomi",
    },
    categoryBody: {
      ro: "Corp",
      en: "Body",
      sq: "Trupi",
      it: "Corpo",
    },
    categoryTreatments: {
      ro: "Tratamente",
      en: "Treatments",
      sq: "Trajtimet",
      it: "Trattamenti",
    },
    emptyState: {
      ro: "Nu am găsit niciun cuvânt. Încearcă altă căutare.",
      en: "No words found. Try another search.",
      sq: "Nuk u gjet asnjë fjalë. Provo një kërkim tjetër.",
      it: "Nessuna parola trovata. Prova un'altra ricerca.",
    },
  },

  globalAudioPlayer: {
    playerAria: {
      ro: "Ghid audio",
      en: "Audio guide",
      sq: "Udhëzues audio",
      it: "Guida audio",
    },
    minimizedText: {
      ro: "Ascultare pornită ({progressPercent}%)",
      en: "Listening ({progressPercent}%)",
      sq: "Po dëgjon ({progressPercent}%)",
      it: "In ascolto ({progressPercent}%)",
    },
    durationSubtitle: {
      ro: "Citit cu voce · cam {durationMinutes} minute",
      en: "Read aloud · about {durationMinutes} minutes",
      sq: "Lexuar me zë · rreth {durationMinutes} minuta",
      it: "Letta ad alta voce · circa {durationMinutes} minuti",
    },
    fallbackVoice: {
      ro: "Voce de rezervă",
      en: "Backup voice",
      sq: "Zë rezervë",
      it: "Voce di riserva",
    },
    transcriptMode: {
      ro: "Doar text",
      en: "Text only",
      sq: "Vetëm tekst",
      it: "Solo testo",
    },
    minimizeAria: {
      ro: "Micșorează",
      en: "Minimise",
      sq: "Zvogëlo",
      it: "Riduci",
    },
    closeAria: {
      ro: "Oprește și închide",
      en: "Stop and close",
      sq: "Ndalo dhe mbyll",
      it: "Ferma e chiudi",
    },
    statusPlaying: {
      ro: "Se aude",
      en: "Playing",
      sq: "Po luhet",
      it: "In riproduzione",
    },
    statusPaused: {
      ro: "Pe pauză",
      en: "Paused",
      sq: "Në pauzë",
      it: "In pausa",
    },
    progressSummary: {
      ro: "{progressPercent}% ascultat",
      en: "{progressPercent}% listened",
      sq: "{progressPercent}% e dëgjuar",
      it: "{progressPercent}% ascoltato",
    },
    scrubberAria: {
      ro: "Cât ai ascultat",
      en: "How much you have heard",
      sq: "Sa ke dëgjuar",
      it: "Quanto hai ascoltato",
    },
    scrubberTitle: {
      ro: "Apasă pe bară ca să sari la acea parte",
      en: "Tap the bar to jump to that part",
      sq: "Prek shiritin për të kaluar te ajo pjesë",
      it: "Tocca la barra per passare a quel punto",
    },
    rewindButton: {
      ro: "De la început",
      en: "Start again",
      sq: "Nga fillimi",
      it: "Da capo",
    },
    rewindAria: {
      ro: "Ascultă din nou de la început",
      en: "Listen again from the start",
      sq: "Dëgjo sërish nga fillimi",
      it: "Riascolta dall'inizio",
    },
    playButton: {
      ro: "Ascultă",
      en: "Listen",
      sq: "Dëgjo",
      it: "Ascolta",
    },
    pauseButton: {
      ro: "Pauză",
      en: "Pause",
      sq: "Pauzë",
      it: "Pausa",
    },
    playAria: {
      ro: "Continuă să asculți",
      en: "Keep listening",
      sq: "Vazhdo të dëgjosh",
      it: "Riprendi l'ascolto",
    },
    pauseAria: {
      ro: "Pune pe pauză",
      en: "Pause",
      sq: "Ndalo për pak",
      it: "Metti in pausa",
    },
    speedGroupAria: {
      ro: "Viteza vocii",
      en: "Voice speed",
      sq: "Shpejtësia e zërit",
      it: "Velocità della voce",
    },
    calmSpeed: {
      ro: "rar",
      en: "slow",
      sq: "ngadalë",
      it: "lento",
    },
    calmSpeedTitle: {
      ro: "Mai rar (0.85x), mai ușor de urmărit",
      en: "Slower (0.85x), easier to follow",
      sq: "Më ngadalë (0.85x), më lehtë për ta ndjekur",
      it: "Più lento (0.85x), più facile da seguire",
    },
    normalSpeed: {
      ro: "normal",
      en: "normal",
      sq: "normale",
      it: "normale",
    },
    normalSpeedTitle: {
      ro: "Viteză normală (1.0x)",
      en: "Normal speed (1.0x)",
      sq: "Shpejtësi normale (1.0x)",
      it: "Velocità normale (1.0x)",
    },
  },

  synchronizedReader: {
    sentenceClickTitle: {
      ro: "Apasă ca să asculți propoziția",
      en: "Tap to hear this sentence",
      sq: "Prek për të dëgjuar këtë fjali",
      it: "Tocca per ascoltare questa frase",
    },
    termTitleTemplate: {
      ro: "{term} în romani. Apasă ca să vezi traducerea și pronunția.",
      en: "{term} in Romani. Tap to see the translation and how to say it.",
      sq: "{term} në gjuhën rome. Prek për përkthimin dhe shqiptimin.",
      it: "{term} in romanì. Tocca per vedere traduzione e pronuncia.",
    },
    popoverAria: {
      ro: "Traducere din romani",
      en: "Romani translation",
      sq: "Përkthim nga gjuha rome",
      it: "Traduzione dal romanì",
    },
    popoverBadge: {
      ro: "Cuvânt medical în romani",
      en: "Medical word in Romani",
      sq: "Fjalë mjekësore në gjuhën rome",
      it: "Parola medica in romanì",
    },
    romanianLabel: {
      ro: "În română:",
      en: "In Romanian:",
      sq: "Në rumanisht:",
      it: "In rumeno:",
    },
    closeAria: {
      ro: "Închide traducerea",
      en: "Close translation",
      sq: "Mbyll përkthimin",
      it: "Chiudi la traduzione",
    },
    phoneticGuide: {
      ro: "Cum se pronunță:",
      en: "How to say it:",
      sq: "Si shqiptohet:",
      it: "Come si pronuncia:",
    },
    listenPronunciationAria: {
      ro: "Ascultă cum se spune în romani",
      en: "Hear how to say it in Romani",
      sq: "Dëgjo si thuhet në gjuhën rome",
      it: "Ascolta come si dice in romanì",
    },
    listenPronunciationButton: {
      ro: "Ascultă",
      en: "Listen",
      sq: "Dëgjo",
      it: "Ascolta",
    },
    dismissButton: {
      ro: "Am înțeles",
      en: "Got it",
      sq: "E kuptova",
      it: "Ho capito",
    },
  },
};
