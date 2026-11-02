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
      allTopics: "Toate subiectele de sănătate",
      whyItMatters: "De ce contează",
      practicalSteps: "Pași practici",
      seekAdviceTitle: "Când să ceri sfat medical",
      seekAdviceBody:
        "Contactează un profesionist medical dacă observi oricare dintre următoarele semne. În caz de urgență medicală, sună imediat serviciul local de urgență.",
      relatedTopics: "Subiecte similare",
      readMore: "Citește mai mult",
      disclaimer:
        "Aceste informații sunt educative și nu reprezintă un diagnostic medical. Vorbește întotdeauna cu un profesionist calificat despre sănătatea ta.",
    },
    topics: [
      {
        slug: "heart-health",
        title: "Sănătatea inimii",
        description: "Obiceiuri simple pentru o inimă sănătoasă și o circulație bună.",
        intro:
          "Inima ta lucrează în fiecare minut al zilei pentru a pompa sângele în corp. Grija pentru inimă reduce riscul de boală cardiovasculară și accident vascular.",
        keyFacts: [
          "Bolile inimii sunt frecvente, dar multe riscuri pot fi prevenite.",
          "Tensiunea arterială mare poate să nu dea simptome.",
          "Activitatea fizică, renunțarea la fumat și alimentația echilibrată protejează inima.",
        ],
        recommendations: [
          { title: "Mișcă-te des", description: "Alege mișcare regulată, de exemplu mers alert." },
          { title: "Mănâncă echilibrat", description: "Consumă mai multe legume, fructe și cereale integrale." },
          { title: "Verifică valorile", description: "Monitorizează tensiunea și colesterolul periodic." },
        ],
        warningSigns: [
          "Durere sau presiune în piept, mai ales dacă iradiază spre braț sau maxilar.",
          "Lipsa bruscă de aer sau bătăi neregulate ale inimii.",
          "Oboseală persistentă sau umflarea picioarelor.",
        ],
      },
      {
        slug: "diabetes",
        title: "Diabet",
        description: "Înțelege factorii de risc și cum menții glicemia în echilibru.",
        intro:
          "Diabetul afectează modul în care organismul gestionează zahărul din sânge. Cu sprijinul potrivit, poate fi prevenit sau gestionat mai bine.",
        keyFacts: [
          "Multe persoane au diabet tip 2 ani de zile fără simptome clare.",
          "Schimbările mici și constante în stilul de viață reduc riscul.",
          "Controlul glicemiei protejează ochii, rinichii, nervii și inima.",
        ],
        recommendations: [
          { title: "Echilibrează farfuria", description: "Jumătate legume, mai multe cereale integrale." },
          { title: "Fii activ", description: "Mișcarea regulată ajută corpul să folosească mai bine glucoza." },
          { title: "Fă analize", description: "Discută cu medicul despre testele de sânge dacă ai factori de risc." },
        ],
        warningSigns: [
          "Sete accentuată sau urinări frecvente.",
          "Scădere în greutate neintenționată ori oboseală continuă.",
          "Vedere încețoșată sau răni care se vindecă greu.",
        ],
      },
      {
        slug: "healthy-eating",
        title: "Alimentație sănătoasă",
        description: "Alegeri alimentare practice și accesibile pentru sănătate pe termen lung.",
        intro:
          "O alimentație bună nu trebuie să fie complicată. Câteva principii simple aplicate constant fac diferența.",
        keyFacts: [
          "Modelul general de alimentație contează mai mult decât un singur aliment.",
          "Legumele, fructele și leguminoasele sunt hrănitoare și accesibile.",
          "Reducerea băuturilor zaharoase aduce beneficii rapide.",
        ],
        recommendations: [
          { title: "Mai multe plante", description: "Adaugă legume sau fructe la majoritatea meselor." },
          { title: "Alege integral", description: "Preferă cerealele integrale și mesele gătite acasă." },
          { title: "Alege apa", description: "Alege apa ca băutură principală și limitează sucurile dulci." },
        ],
        warningSigns: [
          "Creștere sau scădere în greutate într-un timp scurt.",
          "Probleme digestive persistente sau lipsa poftei de mâncare.",
          "Slăbiciune, amețeală sau oboseală neobișnuită.",
        ],
      },
      {
        slug: "physical-activity",
        title: "Activitate fizică",
        description: "Modalități simple de a te mișca mai mult, indiferent de nivelul de început.",
        intro:
          "Mișcarea regulată este una dintre cele mai bune investiții pentru corp și minte.",
        keyFacts: [
          "Orice mișcare este mai bună decât sedentarismul.",
          "Activitatea susține inima, musculatura, somnul și starea psihică.",
          "Pauzele dese din statul pe scaun sunt benefice.",
        ],
        recommendations: [
          { title: "Începe gradual", description: "Pornește cu plimbări scurte și crește treptat durata." },
          { title: "Fii constant", description: "Mișcarea regulată contează mai mult decât intensitatea mare ocazională." },
          { title: "Adaugă forță", description: "Include exerciții pentru mușchi, precum transportul, grădinăritul sau exerciții cu greutatea corpului." },
        ],
        warningSigns: [
          "Durere în piept, amețeli sau lipsa de aer la efort.",
          "Dureri articulare care se agravează la mișcare.",
          "Senzație de leșin sau puls neregulat în timpul exercițiilor.",
        ],
      },
      {
        slug: "mental-wellbeing",
        title: "Bunăstare mentală",
        description: "Ai grijă de minte și cere sprijin când ai nevoie.",
        intro:
          "Sănătatea mintală este parte din sănătatea generală. Este normal să ai perioade mai dificile.",
        keyFacts: [
          "Sănătatea mintală se poate schimba în timp.",
          "Discuțiile deschise despre cum te simți pot ajuta.",
          "Sprijinul oferit devreme are rezultate mai bune.",
        ],
        recommendations: [
          { title: "Rămâi conectat", description: "Păstrează legătură cu persoane de încredere." },
          { title: "Ai grijă de bază", description: "Somnul, mișcarea și timpul în aer liber te ajută." },
          { title: "Cere sprijin", description: "Discută cu cineva de încredere sau cu un specialist." },
        ],
        warningSigns: [
          "Tristețe, anxietate sau lipsa speranței timp de mai multe săptămâni.",
          "Dificultăți în viața de zi cu zi, la muncă sau în relații.",
          "Dacă ai gânduri de autovătămare, cere ajutor urgent.",
        ],
      },
      {
        slug: "smoking",
        title: "Fumat",
        description: "Beneficiile renunțării și pașii care fac procesul mai ușor.",
        intro:
          "Renunțarea la fumat este una dintre cele mai importante decizii pentru sănătatea ta.",
        keyFacts: [
          "Circulația și funcția pulmonară se îmbunătățesc în câteva săptămâni.",
          "Scade riscul de boli cardiace, cancer și boli pulmonare.",
          "Sprijinul specializat crește mult șansele de succes.",
        ],
        recommendations: [
          { title: "Alege o dată", description: "Stabilește o dată clară și pregătește-te pentru situații dificile." },
          { title: "Folosește ajutor", description: "Serviciile de renunțare și terapiile aprobate ajută." },
          { title: "Continuă", description: "Dacă recidivezi, încearcă din nou fără să renunți." },
        ],
        warningSigns: [
          "Tuse persistentă sau schimbare a tusei obișnuite.",
          "Sânge în spută sau durere toracică persistentă.",
          "Respirație din ce în ce mai dificilă la eforturi uzuale.",
        ],
      },
      {
        slug: "preventive-screening",
        title: "Screening preventiv",
        description: "Controale care pot depista probleme devreme, înainte de simptome.",
        intro:
          "Screeningul caută semne timpurii ale unor afecțiuni, chiar dacă te simți bine.",
        keyFacts: [
          "Screeningul este pentru persoane fără simptome.",
          "Testele recomandate depind de vârstă, sex și istoric.",
          "Prezentarea la screening crește șansa tratamentului timpuriu.",
        ],
        recommendations: [
          { title: "Află ce ți se potrivește", description: "Întreabă ce controale preventive sunt indicate pentru tine." },
          { title: "Mergi la controale", description: "Respectă invitațiile la screening și controalele de rutină." },
          { title: "Comunică istoricul", description: "Spune istoricul familial relevant medicului." },
        ],
        warningSigns: [
          "Nodul nou, sângerare neobișnuită sau aluniță care își schimbă forma.",
          "Simptom persistent nou sau neexplicat.",
          "Rezultat de screening care cere evaluare suplimentară.",
        ],
      },
      {
        slug: "womens-health",
        title: "Sănătatea femeii",
        description: "Ghid util pentru etape diferite ale vieții și nevoi variate.",
        intro:
          "Sănătatea femeii include nevoi care se schimbă de-a lungul vieții.",
        keyFacts: [
          "Nevoile de sănătate și controalele utile se modifică odată cu vârsta.",
          "Cunoașterea propriului corp ajută la observarea schimbărilor.",
          "Există sprijin pentru menstruație, sarcină, menopauză și altele.",
        ],
        recommendations: [
          { title: "Cunoaște ce e normal", description: "Urmărește tiparele obișnuite ale corpului tău." },
          { title: "Menține controalele", description: "Participă la consultațiile și screeningurile recomandate." },
          { title: "Cere ajutor din timp", description: "Discută devreme cu un profesionist despre simptome îngrijorătoare." },
        ],
        warningSigns: [
          "Sângerări neobișnuite între menstruații sau după menopauză.",
          "Durere pelvină sau abdominală severă ori persistentă.",
          "Schimbări noi la sân, de exemplu nodul sau modificări ale pielii.",
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
