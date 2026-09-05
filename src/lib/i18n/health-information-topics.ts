import type { Lang } from "@/lib/i18n/translations";

export type HealthTopicContent = {
  slug: string;
  title: string;
  description: string;
  intro: string;
  keyFacts: string[];
  recommendations: { title: string; description: string }[];
  warningSigns: string[];
};

type HealthTopicDictionary = {
  labels: {
    allTopics: string;
    whyItMatters: string;
    practicalSteps: string;
    seekAdviceTitle: string;
    seekAdviceBody: string;
    relatedTopics: string;
    readMore: string;
    disclaimer: string;
  };
  topics: HealthTopicContent[];
};

const dictionaries: Record<Lang, HealthTopicDictionary> = {
  en: {
    labels: {
      allTopics: "All health topics",
      whyItMatters: "Why it matters",
      practicalSteps: "Practical steps",
      seekAdviceTitle: "When to seek medical advice",
      seekAdviceBody:
        "Contact a health professional if you notice any of the following. In a medical emergency, contact your local emergency service immediately.",
      relatedTopics: "Related topics",
      readMore: "Read more",
      disclaimer:
        "This information is educational and does not provide a medical diagnosis. Always speak to a qualified professional about your own health.",
    },
    topics: [
      {
        slug: "heart-health",
        title: "Heart Health",
        description:
          "Simple habits that support a healthy heart, blood pressure, and circulation.",
        intro:
          "Your heart works every minute of every day to move blood around your body. Looking after it lowers your risk of heart disease and stroke, and many of the habits that help are small and achievable.",
        keyFacts: [
          "Heart disease is one of the most common causes of ill health worldwide, but much of the risk is preventable.",
          "High blood pressure often has no symptoms, so regular checks matter.",
          "Being active, not smoking, and eating well all protect your heart at the same time.",
        ],
        recommendations: [
          {
            title: "Move most days",
            description:
              "Aim for regular activity you enjoy, such as brisk walking. Even short sessions add up.",
          },
          {
            title: "Eat for your heart",
            description:
              "Choose more vegetables, fruit, whole grains, and less salt and heavily processed food.",
          },
          {
            title: "Know your numbers",
            description:
              "Have your blood pressure and cholesterol checked so problems can be caught early.",
          },
        ],
        warningSigns: [
          "Chest pain, pressure, or tightness, especially if it spreads to the arm, neck, or jaw.",
          "Sudden shortness of breath or a fast, irregular heartbeat.",
          "Persistent, unexplained tiredness or swelling in the legs.",
        ],
      },
      {
        slug: "diabetes",
        title: "Diabetes",
        description:
          "Understand risk factors and everyday ways to keep blood sugar in balance.",
        intro:
          "Diabetes affects how your body manages blood sugar. Type 2 diabetes is often linked to everyday habits and can frequently be delayed or prevented, and it can be managed well with the right support.",
        keyFacts: [
          "Many people live with type 2 diabetes for years before noticing symptoms.",
          "Small, steady changes to food and activity can meaningfully reduce your risk.",
          "Managing blood sugar helps protect your eyes, kidneys, nerves, and heart.",
        ],
        recommendations: [
          {
            title: "Balance your plate",
            description:
              "Fill half your plate with vegetables, and choose whole grains over refined ones.",
          },
          {
            title: "Stay active",
            description:
              "Regular movement helps your body use blood sugar more effectively.",
          },
          {
            title: "Get checked",
            description:
              "If diabetes runs in your family or you have risk factors, ask about a simple blood test.",
          },
        ],
        warningSigns: [
          "Feeling very thirsty or needing to urinate more often than usual.",
          "Unexplained weight loss or ongoing tiredness.",
          "Blurred vision or cuts that heal slowly.",
        ],
      },
      {
        slug: "healthy-eating",
        title: "Healthy Eating",
        description:
          "Practical, affordable food choices that support your long-term wellbeing.",
        intro:
          "Eating well does not need to be complicated or expensive. Focusing on a few simple principles most of the time gives your body the energy and nutrients it needs.",
        keyFacts: [
          "No single food makes or breaks your health, your overall pattern matters most.",
          "Vegetables, fruit, whole grains, and beans are affordable, filling, and nutritious.",
          "Cutting back on sugary drinks is one of the easiest wins for many people.",
        ],
        recommendations: [
          {
            title: "Eat more plants",
            description:
              "Aim to include vegetables or fruit at most meals, fresh or frozen.",
          },
          {
            title: "Choose whole foods",
            description:
              "Pick whole grains and home-prepared meals over heavily processed options when you can.",
          },
          {
            title: "Rethink drinks",
            description:
              "Make water your default and limit sugary drinks and fruit juice.",
          },
        ],
        warningSigns: [
          "Unintended weight loss or gain over a short period.",
          "Ongoing digestive problems or loss of appetite.",
          "Feeling faint, weak, or unusually tired despite eating.",
        ],
      },
      {
        slug: "physical-activity",
        title: "Physical Activity",
        description: "Easy ways to move more, whatever your starting point.",
        intro:
          "Being active is one of the best things you can do for your body and mind. You do not need a gym, everyday movement counts, and the right amount for you is whatever you can build on.",
        keyFacts: [
          "Any movement is better than none, and it is never too late to start.",
          "Activity supports your heart, muscles, mood, and sleep.",
          "Breaking up long periods of sitting is good for you, too.",
        ],
        recommendations: [
          {
            title: "Start where you are",
            description:
              "Begin with short walks or activities you enjoy, and build up gradually.",
          },
          {
            title: "Make it regular",
            description:
              "Aim for activity on most days, consistency matters more than intensity.",
          },
          {
            title: "Add some strength",
            description:
              "Include activities that work your muscles, like carrying, gardening, or bodyweight exercises.",
          },
        ],
        warningSigns: [
          "Chest pain, dizziness, or unusual breathlessness during activity.",
          "Joint pain or swelling that gets worse with movement.",
          "Feeling faint or having an irregular heartbeat when exercising.",
        ],
      },
      {
        slug: "mental-wellbeing",
        title: "Mental Wellbeing",
        description:
          "Care for your mind and know when to reach out for extra support.",
        intro:
          "Mental wellbeing is part of your overall health. Everyone has ups and downs, and looking after your mind, and asking for help when you need it, is a sign of strength.",
        keyFacts: [
          "Mental health can change over time and is influenced by many factors.",
          "Talking about how you feel can make problems easier to manage.",
          "Support is available, and reaching out early often helps.",
        ],
        recommendations: [
          {
            title: "Stay connected",
            description:
              "Keep in touch with people you trust, connection protects mental health.",
          },
          {
            title: "Look after the basics",
            description:
              "Sleep, activity, and time outdoors all support how you feel.",
          },
          {
            title: "Ask for support",
            description:
              "If things feel too much, talk to someone you trust or a health professional.",
          },
        ],
        warningSigns: [
          "Low mood, worry, or hopelessness that lasts for weeks.",
          "Struggling to cope with everyday life, work, or relationships.",
          "Thoughts of harming yourself, seek help urgently if this happens.",
        ],
      },
      {
        slug: "smoking",
        title: "Smoking",
        description:
          "The benefits of quitting and steps that make stopping more achievable.",
        intro:
          "Stopping smoking is one of the most powerful things you can do for your health, and your body begins to recover quickly. Most people who quit make several attempts first, each try is progress.",
        keyFacts: [
          "Your circulation and lungs start to improve within weeks of quitting.",
          "Quitting lowers your risk of heart disease, cancer, and lung problems.",
          "Support and stop-smoking aids can more than double your chance of success.",
        ],
        recommendations: [
          {
            title: "Set a quit date",
            description:
              "Choose a day, tell people you trust, and plan for situations that tempt you.",
          },
          {
            title: "Use support",
            description:
              "Stop-smoking services and approved aids make quitting more likely to stick.",
          },
          {
            title: "Keep going",
            description:
              "If you slip, treat it as a learning step rather than a failure and try again.",
          },
        ],
        warningSigns: [
          "A persistent cough or a change in a long-standing cough.",
          "Coughing up blood or ongoing chest pain.",
          "Increasing breathlessness during everyday activities.",
        ],
      },
      {
        slug: "preventive-screening",
        title: "Preventive Screening",
        description:
          "Check-ups that can catch problems early, often before symptoms appear.",
        intro:
          "Screening looks for early signs of health problems before you notice anything wrong. Catching issues early often means simpler treatment and better outcomes.",
        keyFacts: [
          "Screening is for people who feel well, it aims to catch problems early.",
          "Which checks are right for you can depend on your age, sex, and history.",
          "Attending recommended screening invitations is a simple way to protect your health.",
        ],
        recommendations: [
          {
            title: "Know what is offered",
            description:
              "Ask which screening checks are recommended for someone your age and background.",
          },
          {
            title: "Attend your checks",
            description:
              "Respond to screening invitations and keep routine health checks up to date.",
          },
          {
            title: "Track your history",
            description:
              "Share relevant family history with your health professional to guide decisions.",
          },
        ],
        warningSigns: [
          "A new lump, unusual bleeding, or a mole that changes shape or colour.",
          "Any persistent symptom that is new or unexplained.",
          "A screening result that asks you to follow up, do not delay.",
        ],
      },
      {
        slug: "womens-health",
        title: "Women's Health",
        description: "Guidance across different life stages and health needs.",
        intro:
          "Women's health covers a wide range of needs that can change across life, from periods and reproductive health to menopause and beyond. Understanding what is normal for you helps you notice when something changes.",
        keyFacts: [
          "Health needs and useful checks change at different life stages.",
          "Knowing your own body makes it easier to spot changes early.",
          "Support is available for periods, pregnancy, menopause, and more.",
        ],
        recommendations: [
          {
            title: "Know your normal",
            description:
              "Pay attention to your usual cycle and body so changes stand out.",
          },
          {
            title: "Keep up with checks",
            description:
              "Attend recommended screenings and appointments for your age and stage.",
          },
          {
            title: "Seek support early",
            description:
              "Talk to a health professional about symptoms that worry or affect you.",
          },
        ],
        warningSigns: [
          "Unusual bleeding, including between periods or after menopause.",
          "Severe or persistent pelvic or abdominal pain.",
          "New breast changes such as a lump, dimpling, or skin change.",
        ],
      },
    ],
  },
  ro: {
    labels: {
      allTopics: "Toate subiectele de sanatate",
      whyItMatters: "De ce conteaza",
      practicalSteps: "Pasi practici",
      seekAdviceTitle: "Cand sa ceri sfat medical",
      seekAdviceBody:
        "Contacteaza un profesionist medical daca observi oricare dintre urmatoarele semne. In caz de urgenta medicala, suna imediat serviciul local de urgenta.",
      relatedTopics: "Subiecte similare",
      readMore: "Citeste mai mult",
      disclaimer:
        "Aceste informatii sunt educative si nu reprezinta un diagnostic medical. Vorbeste intotdeauna cu un profesionist calificat despre sanatatea ta.",
    },
    topics: [
      {
        slug: "heart-health",
        title: "Sanatatea inimii",
        description: "Obiceiuri simple pentru o inima sanatoasa si o circulatie buna.",
        intro:
          "Inima ta lucreaza in fiecare minut al zilei pentru a pompa sangele in corp. Grija pentru inima reduce riscul de boala cardiovasculara si accident vascular.",
        keyFacts: [
          "Bolile inimii sunt frecvente, dar multe riscuri pot fi prevenite.",
          "Tensiunea arteriala mare poate sa nu dea simptome.",
          "Activitatea fizica, renuntarea la fumat si alimentatia echilibrata protejeaza inima.",
        ],
        recommendations: [
          { title: "Misca-te des", description: "Alege miscare regulata, de exemplu mers alert." },
          { title: "Mananca echilibrat", description: "Consuma mai multe legume, fructe si cereale integrale." },
          { title: "Verifica valorile", description: "Monitorizeaza tensiunea si colesterolul periodic." },
        ],
        warningSigns: [
          "Durere sau presiune in piept, mai ales daca iradiaza spre brat sau maxilar.",
          "Lipsa brusca de aer sau batai neregulate ale inimii.",
          "Oboseala persistenta sau umflarea picioarelor.",
        ],
      },
      {
        slug: "diabetes",
        title: "Diabet",
        description: "Intelege factorii de risc si cum mentii glicemia in echilibru.",
        intro:
          "Diabetul afecteaza modul in care organismul gestioneaza zaharul din sange. Cu sprijinul potrivit, poate fi prevenit sau gestionat mai bine.",
        keyFacts: [
          "Multe persoane au diabet tip 2 ani de zile fara simptome clare.",
          "Schimbarile mici si constante in stilul de viata reduc riscul.",
          "Controlul glicemiei protejeaza ochii, rinichii, nervii si inima.",
        ],
        recommendations: [
          { title: "Echilibreaza farfuria", description: "Jumatate legume, mai multe cereale integrale." },
          { title: "Fii activ", description: "Miscarea regulata ajuta corpul sa foloseasca mai bine glucoza." },
          { title: "Fa analize", description: "Discuta cu medicul despre testele de sange daca ai factori de risc." },
        ],
        warningSigns: [
          "Sete accentuata sau urinari frecvente.",
          "Scadere in greutate neintentionata ori oboseala continua.",
          "Vedere incetosata sau rani care se vindeca greu.",
        ],
      },
      {
        slug: "healthy-eating",
        title: "Alimentatie sanatoasa",
        description: "Alegeri alimentare practice si accesibile pentru sanatate pe termen lung.",
        intro:
          "O alimentatie buna nu trebuie sa fie complicata. Cateva principii simple aplicate constant fac diferenta.",
        keyFacts: [
          "Modelul general de alimentatie conteaza mai mult decat un singur aliment.",
          "Legumele, fructele si leguminoasele sunt hranitoare si accesibile.",
          "Reducerea bauturilor zaharoase aduce beneficii rapide.",
        ],
        recommendations: [
          { title: "Mai multe plante", description: "Adauga legume sau fructe la majoritatea meselor." },
          { title: "Alege integral", description: "Prefera cerealele integrale si mesele gatite acasa." },
          { title: "Alege apa", description: "Fa din apa bautura principala si limiteaza sucurile dulci." },
        ],
        warningSigns: [
          "Crestere sau scadere in greutate intr-un timp scurt.",
          "Probleme digestive persistente sau lipsa poftei de mancare.",
          "Slabiciune, ameteala sau oboseala neobisnuita.",
        ],
      },
      {
        slug: "physical-activity",
        title: "Activitate fizica",
        description: "Modalitati simple de a te misca mai mult, indiferent de nivelul de inceput.",
        intro:
          "Miscarea regulata este una dintre cele mai bune investitii pentru corp si minte.",
        keyFacts: [
          "Orice miscare este mai buna decat sedentarismul.",
          "Activitatea sustine inima, musculatura, somnul si starea psihica.",
          "Pauzele dese din statul pe scaun sunt benefice.",
        ],
        recommendations: [
          { title: "Incepe gradual", description: "Porneste cu plimbari scurte si creste treptat durata." },
          { title: "Fii constant", description: "Miscarea regulata conteaza mai mult decat intensitatea mare ocazionala." },
          { title: "Adauga forta", description: "Include exercitii pentru muschi, precum transport, gradinarit sau exercitii cu greutatea corpului." },
        ],
        warningSigns: [
          "Durere in piept, ameteli sau lipsa de aer la efort.",
          "Dureri articulare care se agraveaza la miscare.",
          "Senzatie de lesin sau puls neregulat in timpul exercitiilor.",
        ],
      },
      {
        slug: "mental-wellbeing",
        title: "Bunastare mentala",
        description: "Ai grija de minte si cere sprijin cand ai nevoie.",
        intro:
          "Sanatatea mintala este parte din sanatatea generala. Este normal sa ai perioade mai dificile.",
        keyFacts: [
          "Sanatatea mintala se poate schimba in timp.",
          "Discutiile deschise despre cum te simti pot ajuta.",
          "Sprijinul oferit devreme are rezultate mai bune.",
        ],
        recommendations: [
          { title: "Ramai conectat", description: "Pastreaza legatura cu persoane de incredere." },
          { title: "Ai grija de baza", description: "Somnul, miscarea si timpul in aer liber te ajuta." },
          { title: "Cere sprijin", description: "Discuta cu cineva de incredere sau cu un specialist." },
        ],
        warningSigns: [
          "Tristete, anxietate sau lipsa sperantei timp de mai multe saptamani.",
          "Dificultati in viata de zi cu zi, la munca sau in relatii.",
          "Ganduri de autovatamare, cere ajutor urgent.",
        ],
      },
      {
        slug: "smoking",
        title: "Fumat",
        description: "Beneficiile renuntarii si pasii care fac procesul mai usor.",
        intro:
          "Renuntarea la fumat este una dintre cele mai importante decizii pentru sanatatea ta.",
        keyFacts: [
          "Circulatia si functia pulmonara se imbunatatesc in cateva saptamani.",
          "Scade riscul de boli cardiace, cancer si boli pulmonare.",
          "Sprijinul specializat creste mult sansele de succes.",
        ],
        recommendations: [
          { title: "Alege o data", description: "Stabileste o data clara si pregateste-te pentru situatii dificile." },
          { title: "Foloseste ajutor", description: "Serviciile de renuntare si terapiile aprobate ajuta." },
          { title: "Continua", description: "Daca recidivezi, incearca din nou fara sa renunti." },
        ],
        warningSigns: [
          "Tuse persistenta sau schimbare a tusei obisnuite.",
          "Sange in sputa sau durere toracica persistenta.",
          "Respiratie din ce in ce mai dificila la eforturi uzuale.",
        ],
      },
      {
        slug: "preventive-screening",
        title: "Screening preventiv",
        description: "Controale care pot depista probleme devreme, inainte de simptome.",
        intro:
          "Screeningul cauta semne timpurii ale unor afectiuni, chiar daca te simti bine.",
        keyFacts: [
          "Screeningul este pentru persoane fara simptome.",
          "Testele recomandate depind de varsta, sex si istoric.",
          "Prezentarea la screening creste sansa tratamentului timpuriu.",
        ],
        recommendations: [
          { title: "Afla ce ti se potriveste", description: "Intreaba ce controale preventive sunt indicate pentru tine." },
          { title: "Mergi la controale", description: "Respecta invitatiile la screening si controalele de rutina." },
          { title: "Comunica istoricul", description: "Spune istoricul familial relevant medicului." },
        ],
        warningSigns: [
          "Nodul nou, sangerare neobisnuita sau alunita care isi schimba forma.",
          "Simptom persistent nou sau neexplicat.",
          "Rezultat de screening care cere evaluare suplimentara.",
        ],
      },
      {
        slug: "womens-health",
        title: "Sanatatea femeii",
        description: "Ghid util pentru etape diferite ale vietii si nevoi variate.",
        intro:
          "Sanatatea femeii include nevoi care se schimba de-a lungul vietii.",
        keyFacts: [
          "Nevoile de sanatate si controalele utile se modifica cu varsta.",
          "Cunoasterea propriului corp ajuta la observarea schimbarilor.",
          "Exista sprijin pentru menstruatie, sarcina, menopauza si altele.",
        ],
        recommendations: [
          { title: "Cunoaste ce e normal", description: "Urmareste tiparele obisnuite ale corpului tau." },
          { title: "Mentine controalele", description: "Participa la consultatiile si screeningurile recomandate." },
          { title: "Cere ajutor din timp", description: "Discuta devreme cu un profesionist despre simptome ingrijoratoare." },
        ],
        warningSigns: [
          "Sangerari neobisnuite intre menstruatii sau dupa menopauza.",
          "Durere pelvina sau abdominala severa ori persistenta.",
          "Schimbari noi la san, de exemplu nodul sau modificari ale pielii.",
        ],
      },
    ],
  },
  sq: {
    labels: {
      allTopics: "Te gjitha temat e shendetit",
      whyItMatters: "Pse ka rendesi",
      practicalSteps: "Hapa praktike",
      seekAdviceTitle: "Kur te kerkosh keshille mjekesore",
      seekAdviceBody:
        "Kontakto nje profesionist shendetesor nese verejt ndonje nga shenjat e meposhtme. Ne emergjence mjekesore, telefono menjehere sherbimin lokal te urgjences.",
      relatedTopics: "Tema te ngjashme",
      readMore: "Lexo me shume",
      disclaimer:
        "Ky informacion eshte edukativ dhe nuk jep diagnoze mjekesore. Gjithmone fol me nje profesionist te kualifikuar per shendetin tend.",
    },
    topics: [
      {
        slug: "heart-health",
        title: "Shendeti i zemres",
        description: "Zakone te thjeshta per nje zemer te shendetshme.",
        intro:
          "Zemra punon cdo minute per te qarkulluar gjakun. Kujdesi per te ul rrezikun e semundjeve kardiovaskulare.",
        keyFacts: [
          "Semundjet e zemres jane te zakonshme, por shume rreziqe parandalohen.",
          "Tensioni i larte shpesh nuk ka simptoma.",
          "Levizja, mos-pirja e duhanit dhe ushqimi i mire mbrojne zemren.",
        ],
        recommendations: [
          { title: "Leviz shpesh", description: "Bej aktivitet te rregullt si ecje e shpejte." },
          { title: "Ushqehu mire", description: "Shto perime, fruta dhe drithera integrale." },
          { title: "Kontrollo vlerat", description: "Mat tensionin dhe kolesterolin rregullisht." },
        ],
        warningSigns: [
          "Dhimbje ose presion ne kraharor, sidomos me perhapje ne krah ose nofull.",
          "Veshtiresi e papritur ne frymemarrje ose rrahje te parregullta.",
          "Lodhje e vazhdueshme ose enjtje ne kembe.",
        ],
      },
      {
        slug: "diabetes",
        title: "Diabeti",
        description: "Kupto rrezikun dhe menyra ditore per te mbajtur sheqerin ne ekuiliber.",
        intro:
          "Diabeti ndikon ne menyren si trupi menaxhon sheqerin ne gjak.",
        keyFacts: [
          "Shume njerez kane diabet tip 2 pa simptoma te qarta ne fillim.",
          "Ndryshimet e vogla dhe te vazhdueshme ulin rrezikun.",
          "Kontrolli i sheqerit mbron syte, veshkat, nervat dhe zemren.",
        ],
        recommendations: [
          { title: "Balanco pjatat", description: "Mbush gjysmen e pjates me perime dhe zgjidh drithera integrale." },
          { title: "Rri aktiv", description: "Levizja e rregullt ndihmon trupin te perdore me mire glukozen." },
          { title: "Bej kontroll", description: "Pyet mjekun per analiza nese ke faktore rreziku." },
        ],
        warningSigns: [
          "Etje e shtuar ose urinim i shpeshte.",
          "Renie peshe pa arsye ose lodhje e vazhdueshme.",
          "Pamje e turbullt ose plage qe sherohen ngadale.",
        ],
      },
      {
        slug: "healthy-eating",
        title: "Ushqyerje e shendetshme",
        description: "Zgjedhje praktike dhe te perballueshme ushqimore.",
        intro:
          "Ushqimi i mire nuk ka pse te jete i komplikuar ose i shtrenjte.",
        keyFacts: [
          "Modeli i pergjithshem i ushqimit ka me shume rendesi se nje ushqim i vetem.",
          "Perimet, frutat dhe bishtajoret jane zgjedhje te mira dhe te lira.",
          "Ulja e pijeve me sheqer jep perfitime te shpejta.",
        ],
        recommendations: [
          { title: "Ha me shume bime", description: "Shto perime ose fruta ne shumicen e vakteve." },
          { title: "Zgjidh ushqime te plota", description: "Prefero drithera integrale dhe vakte te pergatitura ne shtepi." },
          { title: "Pi uje", description: "Beje ujin pijen kryesore dhe kufizo pijet e embla." },
        ],
        warningSigns: [
          "Rritje ose ulje peshe ne kohe te shkurter.",
          "Probleme tretjeje te vazhdueshme ose humbje oreksi.",
          "Dobesi, marramendje ose lodhje e pazakonte.",
        ],
      },
      {
        slug: "physical-activity",
        title: "Aktivitet fizik",
        description: "Menyra te thjeshta per te levizur me shume.",
        intro:
          "Levizja e rregullt eshte nje nga gjerat me te mira per trupin dhe mendjen.",
        keyFacts: [
          "Cdo levizje eshte me e mire se asgje.",
          "Aktiviteti ndihmon zemren, muskujt, humorin dhe gjumin.",
          "Nderprerja e uljes se gjate ben mire.",
        ],
        recommendations: [
          { title: "Fillo ngadale", description: "Nis me ecje te shkurtra dhe rrit gradualisht." },
          { title: "Ji i qendrueshem", description: "Rendesia me e madhe eshte vazhdueshmeria." },
          { title: "Shto force", description: "Perfshi ushtrime qe forcojne muskujt." },
        ],
        warningSigns: [
          "Dhimbje gjoksi, marramendje ose frymemarrje e pazakonte ne aktivitet.",
          "Dhimbje kycesh qe perkeqesohen me levizje.",
          "Ndjenje te fikti ose rrahje te parregullta gjate ushtrimit.",
        ],
      },
      {
        slug: "mental-wellbeing",
        title: "Mireqenie mendore",
        description: "Kujdesu per mendjen dhe kerko mbeshtetje kur duhet.",
        intro:
          "Shendeti mendor eshte pjese e shendetit te pergjithshem.",
        keyFacts: [
          "Shendeti mendor ndryshon me kalimin e kohes.",
          "Te flasesh per ndjenjat mund te ndihmoje.",
          "Mbeshteja e hershme shpesh funksionon me mire.",
        ],
        recommendations: [
          { title: "Qendro i lidhur", description: "Ruaj kontakt me njerezit qe i beson." },
          { title: "Kujdesu per bazat", description: "Gjumi, levizja dhe koha jashte ndihmojne." },
          { title: "Kerko ndihme", description: "Fol me nje person te besuar ose profesionist." },
        ],
        warningSigns: [
          "Humor i ulet, ankth ose mungese shprese per jave.",
          "Veshtiresi ne jeten e perditshme, pune ose marredhenie.",
          "Mendime per vetelendim, kerko ndihme urgjente.",
        ],
      },
      {
        slug: "smoking",
        title: "Duhani",
        description: "Perfitimet e lenies se duhanit dhe hapat praktike.",
        intro:
          "Largimi nga duhani eshte nje nga vendimet me te rendesishme per shendetin.",
        keyFacts: [
          "Qarkullimi dhe mushkerite permiresohen pas lenies.",
          "Ulet rreziku i semundjeve te zemres, kancerit dhe mushkerive.",
          "Mbeshteja profesionale rrit shanset e suksesit.",
        ],
        recommendations: [
          { title: "Vendos daten", description: "Zgjidh nje date dhe pergatitu per momentet e veshtira." },
          { title: "Perdor mbeshtetje", description: "Programet dhe mjetet e aprovuara e bejne me te lehte." },
          { title: "Mos u dorezo", description: "Nese gabon, provo perseri." },
        ],
        warningSigns: [
          "Kolle e vazhdueshme ose ndryshim i kolles se zakonshme.",
          "Gjak ne kolle ose dhimbje gjoksi qe vazhdon.",
          "Rritje e veshtiresise ne frymemarrje ne aktivitete ditore.",
        ],
      },
      {
        slug: "preventive-screening",
        title: "Kontroll parandalues",
        description: "Kontrolle qe zbulojne problemet heret.",
        intro:
          "Skriningu kerkon shenja te hershme para se te shfaqen simptoma.",
        keyFacts: [
          "Skriningu behet edhe kur ndihesh mire.",
          "Kontrollet e nevojshme varen nga mosha, seksi dhe historia.",
          "Pjesemarrja ne kontrolle te rekomanduara mbron shendetin.",
        ],
        recommendations: [
          { title: "Di cfare ofrohet", description: "Pyet cilat kontrolle rekomandohen per ty." },
          { title: "Merr pjese", description: "Mos i humb ftesat per kontroll dhe analizat rutine." },
          { title: "Ndaj historine", description: "Trego historine familjare te rendesishme te mjeku." },
        ],
        warningSigns: [
          "Nje mase e re, gjakderdhje e pazakonte ose ndryshim i nishanit.",
          "Cdo simptom e re dhe e pashpjeguar qe zgjat.",
          "Rezultat skriningu qe kerkon ndjekje te metejshme.",
        ],
      },
      {
        slug: "womens-health",
        title: "Shendeti i grave",
        description: "Udhezime per faza te ndryshme te jetes.",
        intro:
          "Shendeti i grave perfshin nevoja qe ndryshojne gjate jetes.",
        keyFacts: [
          "Nevojat shendetesore ndryshojne sipas moshes.",
          "Njohja e trupit ndihmon ne dallimin e ndryshimeve.",
          "Ekziston mbeshtetje per ciklin, shtatzenine, menopauzen dhe me shume.",
        ],
        recommendations: [
          { title: "Njihe normalen tende", description: "Vezhgo ciklin dhe trupin per te dalluar ndryshime." },
          { title: "Mbaj kontrollet", description: "Shko ne vizitat dhe skriningjet e rekomanduara." },
          { title: "Kerko ndihme heret", description: "Fol me mjekun per simptoma shqetesuese." },
        ],
        warningSigns: [
          "Gjakderdhje e pazakonte, mes cikleve ose pas menopauzes.",
          "Dhimbje pelvike ose abdominale e forte apo e vazhdueshme.",
          "Ndryshime te reja ne gji, si mase apo ndryshim i lekures.",
        ],
      },
    ],
  },
  it: {
    labels: {
      allTopics: "Tutti gli argomenti di salute",
      whyItMatters: "Perche e importante",
      practicalSteps: "Passi pratici",
      seekAdviceTitle: "Quando chiedere consiglio medico",
      seekAdviceBody:
        "Contatta un professionista sanitario se noti uno dei seguenti segnali. In caso di emergenza medica, contatta subito il servizio di emergenza locale.",
      relatedTopics: "Argomenti correlati",
      readMore: "Leggi di piu",
      disclaimer:
        "Queste informazioni sono educative e non forniscono una diagnosi medica. Parla sempre con un professionista qualificato per la tua salute.",
    },
    topics: [
      {
        slug: "heart-health",
        title: "Salute del cuore",
        description: "Abitudini semplici per un cuore sano.",
        intro:
          "Il cuore lavora ogni minuto per far circolare il sangue. Prendersene cura riduce il rischio cardiovascolare.",
        keyFacts: [
          "Le malattie cardiache sono comuni, ma molti rischi sono prevenibili.",
          "La pressione alta spesso non da sintomi.",
          "Attivita fisica, niente fumo e alimentazione equilibrata proteggono il cuore.",
        ],
        recommendations: [
          { title: "Muoviti spesso", description: "Scegli attivita regolare, ad esempio camminata veloce." },
          { title: "Mangia meglio", description: "Aumenta verdure, frutta e cereali integrali." },
          { title: "Controlla i valori", description: "Monitora pressione e colesterolo periodicamente." },
        ],
        warningSigns: [
          "Dolore o pressione al petto, soprattutto se si irradia a braccio o mandibola.",
          "Fiato corto improvviso o battito irregolare.",
          "Stanchezza persistente o gonfiore alle gambe.",
        ],
      },
      {
        slug: "diabetes",
        title: "Diabete",
        description: "Capisci i fattori di rischio e come mantenere la glicemia in equilibrio.",
        intro:
          "Il diabete influenza il modo in cui il corpo gestisce lo zucchero nel sangue.",
        keyFacts: [
          "Molte persone vivono con diabete di tipo 2 senza sintomi evidenti per anni.",
          "Piccoli cambiamenti costanti riducono il rischio.",
          "Il controllo glicemico protegge occhi, reni, nervi e cuore.",
        ],
        recommendations: [
          { title: "Bilancia il piatto", description: "Meta piatto verdure e preferisci cereali integrali." },
          { title: "Resta attivo", description: "Il movimento regolare aiuta a usare meglio il glucosio." },
          { title: "Fai controlli", description: "Chiedi al medico analisi del sangue se hai fattori di rischio." },
        ],
        warningSigns: [
          "Sete intensa o bisogno frequente di urinare.",
          "Perdita di peso senza motivo o stanchezza continua.",
          "Vista offuscata o ferite che guariscono lentamente.",
        ],
      },
      {
        slug: "healthy-eating",
        title: "Alimentazione sana",
        description: "Scelte alimentari pratiche e accessibili per il benessere.",
        intro:
          "Mangiare bene non deve essere complicato o costoso.",
        keyFacts: [
          "Conta il modello alimentare generale, non il singolo alimento.",
          "Verdure, frutta e legumi sono scelte nutrienti e convenienti.",
          "Ridurre le bevande zuccherate porta benefici rapidi.",
        ],
        recommendations: [
          { title: "Piu vegetali", description: "Aggiungi frutta o verdura alla maggior parte dei pasti." },
          { title: "Scegli integrale", description: "Preferisci cereali integrali e pasti preparati in casa." },
          { title: "Bevi acqua", description: "Rendi l'acqua la bevanda principale e limita le bevande zuccherate." },
        ],
        warningSigns: [
          "Aumento o perdita di peso in poco tempo.",
          "Problemi digestivi persistenti o perdita di appetito.",
          "Debolezza, capogiri o stanchezza insolita.",
        ],
      },
      {
        slug: "physical-activity",
        title: "Attivita fisica",
        description: "Modi semplici per muoversi di piu.",
        intro:
          "L'attivita regolare e una delle cose migliori per corpo e mente.",
        keyFacts: [
          "Qualsiasi movimento e meglio di niente.",
          "L'attivita aiuta cuore, muscoli, umore e sonno.",
          "Interrompere lunghi periodi seduti fa bene.",
        ],
        recommendations: [
          { title: "Inizia gradualmente", description: "Comincia con camminate brevi e aumenta piano." },
          { title: "Sii costante", description: "La costanza conta piu dell'intensita occasionale." },
          { title: "Aggiungi forza", description: "Inserisci esercizi che coinvolgono la muscolatura." },
        ],
        warningSigns: [
          "Dolore toracico, capogiri o fiato corto insolito durante l'attivita.",
          "Dolore articolare che peggiora con il movimento.",
          "Sensazione di svenimento o battito irregolare durante l'esercizio.",
        ],
      },
      {
        slug: "mental-wellbeing",
        title: "Benessere mentale",
        description: "Prenditi cura della mente e chiedi supporto quando serve.",
        intro:
          "La salute mentale fa parte della salute complessiva.",
        keyFacts: [
          "La salute mentale puo cambiare nel tempo.",
          "Parlare di come ti senti puo aiutare.",
          "Un supporto precoce spesso funziona meglio.",
        ],
        recommendations: [
          { title: "Resta connesso", description: "Mantieni i contatti con persone di fiducia." },
          { title: "Cura le basi", description: "Sonno, movimento e tempo all'aperto aiutano." },
          { title: "Chiedi aiuto", description: "Parla con una persona fidata o con un professionista." },
        ],
        warningSigns: [
          "Umore basso, ansia o mancanza di speranza per settimane.",
          "Difficolta nella vita quotidiana, nel lavoro o nelle relazioni.",
          "Pensieri di autolesionismo, chiedi aiuto urgente.",
        ],
      },
      {
        slug: "smoking",
        title: "Fumo",
        description: "Vantaggi di smettere e passi pratici per riuscirci.",
        intro:
          "Smettere di fumare e una delle decisioni piu importanti per la salute.",
        keyFacts: [
          "Circolazione e polmoni migliorano nelle settimane dopo aver smesso.",
          "Diminuisce il rischio di malattie cardiache, cancro e problemi polmonari.",
          "Il supporto professionale aumenta le probabilita di successo.",
        ],
        recommendations: [
          { title: "Scegli una data", description: "Fissa una data e prepara strategie per i momenti difficili." },
          { title: "Usa supporto", description: "Programmi e aiuti approvati rendono il percorso piu facile." },
          { title: "Continua", description: "Se ricadi, riprova senza arrenderti." },
        ],
        warningSigns: [
          "Tosse persistente o cambiamento della tosse abituale.",
          "Sangue con la tosse o dolore toracico continuo.",
          "Fiato corto in aumento nelle attivita quotidiane.",
        ],
      },
      {
        slug: "preventive-screening",
        title: "Screening preventivo",
        description: "Controlli che individuano problemi in fase precoce.",
        intro:
          "Lo screening cerca segnali iniziali prima che compaiano sintomi.",
        keyFacts: [
          "Lo screening e utile anche quando ti senti bene.",
          "I controlli dipendono da eta, sesso e storia clinica.",
          "Partecipare agli screening raccomandati protegge la salute.",
        ],
        recommendations: [
          { title: "Sapere cosa fare", description: "Chiedi quali controlli sono raccomandati per te." },
          { title: "Vai ai controlli", description: "Non saltare inviti allo screening e controlli di routine." },
          { title: "Condividi la storia", description: "Riferisci la storia familiare rilevante al professionista." },
        ],
        warningSigns: [
          "Nuovo nodulo, sanguinamento anomalo o neo che cambia forma.",
          "Qualsiasi sintomo nuovo e persistente senza spiegazione.",
          "Risultato di screening che richiede approfondimento.",
        ],
      },
      {
        slug: "womens-health",
        title: "Salute della donna",
        description: "Indicazioni per diverse fasi della vita e bisogni specifici.",
        intro:
          "La salute della donna comprende bisogni che cambiano nel tempo.",
        keyFacts: [
          "Bisogni e controlli utili cambiano con l'eta.",
          "Conoscere il proprio corpo aiuta a notare cambiamenti.",
          "Esiste supporto per ciclo, gravidanza, menopausa e altro.",
        ],
        recommendations: [
          { title: "Conosci la tua normalita", description: "Osserva i tuoi schemi abituali per riconoscere variazioni." },
          { title: "Mantieni i controlli", description: "Partecipa a visite e screening raccomandati." },
          { title: "Chiedi aiuto presto", description: "Parla con un professionista se compaiono sintomi preoccupanti." },
        ],
        warningSigns: [
          "Sanguinamenti anomali, tra i cicli o dopo la menopausa.",
          "Dolore pelvico o addominale severo o persistente.",
          "Nuovi cambiamenti al seno, come nodulo o alterazioni cutanee.",
        ],
      },
    ],
  },
};

export function getHealthInformationDictionary(lang: Lang) {
  return dictionaries[lang] || dictionaries.en;
}

export function getHealthTopicBySlug(lang: Lang, slug: string) {
  return getHealthInformationDictionary(lang).topics.find((topic) => topic.slug === slug);
}

export const healthTopicSlugs = dictionaries.en.topics.map((topic) => topic.slug);
